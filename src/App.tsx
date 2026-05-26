import { useState, useEffect, useRef, useCallback } from 'react';
import OrbAvatar from './components/OrbAvatar';
import ChatPanel from './components/ChatPanel';
import TaskPanel from './components/TaskPanel';
import NotesPanel from './components/NotesPanel';
import SettingsPanel from './components/SettingsPanel';
import QuickLauncher from './components/QuickLauncher';
import LiveClock from './components/LiveClock';
import { useSpeech, getVoices } from './hooks/useSpeech';
import {
  processCommand,
  loadMemory,
  saveMemory,
  getDefaultMemory,
  type Memory,
  type ChatMessage,
  type Task,
  type Note,
} from './lib/brain';

type RightPanel = 'tasks' | 'notes' | 'settings' | null;

let msgId = Date.now();

function uid() {
  return (++msgId).toString();
}

const ARIA_NAMES: Record<string, string> = {
  aria: 'ARIA',
  jarvis: 'JARVIS',
  friday: 'F.R.I.D.A.Y',
};

// Stars background
function StarField() {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 0.5 + Math.random() * 1.5,
    delay: Math.random() * 5,
    duration: 2 + Math.random() * 4,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {stars.map(s => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            opacity: 0.3,
            animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function getVoiceForPersonality(
  voices: SpeechSynthesisVoice[],
  personality: string
): SpeechSynthesisVoice | null {
  if (!voices.length) return null;

  const jarvisVoice = voices.find(
    v => v.name === 'Google UK English Male'
  );

  const fridayVoice = voices.find(
    v => v.name === 'Google UK English Female'
  );

  const ariaVoice = voices.find(
    v => v.name === 'Google US English'
  );

  if (personality === 'jarvis') {
    return jarvisVoice ?? ariaVoice ?? voices[0];
  }

  if (personality === 'friday') {
    return fridayVoice ?? ariaVoice ?? voices[0];
  }

  // ARIA
  return ariaVoice ?? voices[0];
}

export default function App() {
  const [memory, setMemory] = useState<Memory>(loadMemory);
  const [rightPanel, setRightPanel] = useState<RightPanel>(null);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [micError, setMicError] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const { status, speak, stopSpeaking, startListening, stopListening, setThinking, setIdle } = useSpeech();

  // Load voices
  useEffect(() => {
    getVoices().then(v => {
      console.log(
        v.map(voice => ({
          name: voice.name,
          lang: voice.lang
        }))
      );

      setVoices(v);
      // Try to find a good default English voice
      const preferred = v.find(x => x.lang === 'en-US' && x.name.includes('Google'))
        ?? v.find(x => x.lang === 'en-US')
        ?? v[0]
        ?? null;
      setSelectedVoice(preferred);
    });
  }, []);

  // Auto-greet on mount
  useEffect(() => {
    if (memory.preferences.autoGreet) {
      const name = memory.name ? `, ${memory.name}` : '';
      const persona = ARIA_NAMES[memory.preferences.personality] ?? 'ARIA';
      const greeting: ChatMessage = {
        id: uid(),
        role: 'assistant',
        text: `Hello${name}!  I'm ${persona}, your AI assistant. I'm ready to help! Type a message or press the 🎤 button to talk. Say "help" to see what I can do!`,
        timestamp: new Date().toISOString(),
        mood: 'happy',
      };
      setMemory(prev => ({ ...prev, chatHistory: [greeting] }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save memory on change
  useEffect(() => {
    saveMemory(memory);
  }, [memory]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl+M = mic
      if (e.ctrlKey && e.key === 'm') { e.preventDefault(); handleMicToggle(); }
      // Ctrl+K = focus input
      if (e.ctrlKey && e.key === 'k') { e.preventDefault(); inputRef.current?.focus(); }
      // Escape = close panel
      if (e.key === 'Escape') { setRightPanel(null); stopSpeaking(); }
      // Ctrl+1 = tasks, Ctrl+2 = notes, Ctrl+3 = settings
      if (e.ctrlKey && e.key === '1') { e.preventDefault(); setRightPanel(p => p === 'tasks' ? null : 'tasks'); }
      if (e.ctrlKey && e.key === '2') { e.preventDefault(); setRightPanel(p => p === 'notes' ? null : 'notes'); }
      if (e.ctrlKey && e.key === '3') { e.preventDefault(); setRightPanel(p => p === 'settings' ? null : 'settings'); }
      // ? = shortcuts
      if (e.key === '?' && !e.ctrlKey) { setShowShortcuts(p => !p); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = {
      id: uid(),
      role: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setMemory(prev => ({
      ...prev,
      chatHistory: [...prev.chatHistory, userMsg],
      totalInteractions: prev.totalInteractions + 1,
    }));
    setInputText('');
    setIsTyping(true);
    setThinking();

    // Simulate processing delay
    await new Promise(r => setTimeout(r, 600 + Math.random() * 600));

    const result = processCommand(text, memory);

    // Handle actions
    let updatedMemory: Partial<Memory> = { mood: result.mood };

    if (result.action === 'set-name') updatedMemory.name = result.actionData;
    if (result.action === 'add-task') {
      updatedMemory.tasks = [...memory.tasks, result.actionData as Task];
      setRightPanel('tasks');
    }
    if (result.action === 'add-note') {
      updatedMemory.notes = [...memory.notes, result.actionData as Note];
      setRightPanel('notes');
    }
    if (result.action === 'clear-tasks') updatedMemory.tasks = [];
    if (result.action === 'clear-chat') updatedMemory.chatHistory = [];
    if (result.action === 'show-tasks') setRightPanel('tasks');
    if (result.action === 'show-notes') setRightPanel('notes');
    if (result.action === 'open-url') {
      window.open(result.actionData, '_blank', 'noopener,noreferrer');
      showNotification(` Opened ${result.actionData}`);
    }

    const botMsg: ChatMessage = {
      id: uid(),
      role: 'assistant',
      text: result.reply,
      timestamp: new Date().toISOString(),
      mood: result.mood,
    };

    setMemory(prev => {
      const base = { ...prev, ...updatedMemory };
      if (result.action === 'clear-chat') {
        return { ...base, chatHistory: [botMsg] };
      }
      return { ...base, chatHistory: [...prev.chatHistory, botMsg] };
    });
    setIsTyping(false);

    // Speak response
    if (memory.preferences.voiceEnabled) {
      // Strip markdown for TTS
      const plainText = result.reply.replace(/\*\*/g, '').replace(/\n/g, ' ').replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '');
      const personality = memory.preferences.personality;

      const personalityVoice = getVoiceForPersonality(
        voices,
        personality
      );

      const personalityRates = {
        aria: 1.0,
        jarvis: 0.92,   
        friday: 1.05
      };

      const personalityPitch = {
        aria: 1.0,
        jarvis: 0.8,   
        friday: 1.1
      };
      speak(
        plainText,
        personalityRates[personality],
        personalityPitch[personality],
        personalityVoice ?? selectedVoice ?? undefined
      );
    } else {
      setIdle();
    }
  }, [memory, selectedVoice, setThinking, setIdle, speak, showNotification]);

  const handleMicToggle = useCallback(() => {
    if (status === 'listening') {
      stopListening();
      return;
    }
    setMicError(false);
    startListening(
      (text) => {
        setInputText(text);
        handleSend(text);
      },
      () => {
        setMicError(true);
        showNotification('❌ Microphone not available. Use text input!');
      }
    );
  }, [status, startListening, stopListening, handleSend, showNotification]);

  const updateMemory = useCallback((updates: Partial<Memory>) => {
    setMemory(prev => ({ ...prev, ...updates }));
  }, []);

  const sidebarNavItems = [
    { id: 'tasks' as RightPanel, icon: '✅', label: 'Tasks', count: memory.tasks.filter(t => !t.done).length },
    { id: 'notes' as RightPanel, icon: '📝', label: 'Notes', count: memory.notes.length },
    { id: 'settings' as RightPanel, icon: '⚙️', label: 'Settings', count: 0 },
  ];

  return (
    <div className="min-h-screen w-full overflow-hidden relative" style={{ background: '#0a0a14' }}>
      <StarField />

      {/* Gradient blobs */}
      <div className="fixed pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, #0891b2, transparent)', filter: 'blur(60px)' }} />
      </div>

      {/* Notification toast */}
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 glass-strong rounded-2xl px-4 py-2.5 text-sm text-white shadow-2xl border border-white/10 panel-animate">
          {notification}
        </div>
      )}

      {/* Keyboard shortcuts modal */}
      {showShortcuts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowShortcuts(false)}>
          <div className="glass-strong rounded-2xl p-6 max-w-sm w-full mx-4 border border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">⌨️ Keyboard Shortcuts</h3>
            <div className="space-y-2 text-sm">
              {[
                ['Ctrl + K', 'Focus chat input'],
                ['Ctrl + M', 'Toggle microphone'],
                ['Ctrl + 1', 'Toggle task panel'],
                ['Ctrl + 2', 'Toggle notes panel'],
                ['Ctrl + 3', 'Toggle settings'],
                ['Escape', 'Close panel / stop speaking'],
                ['?', 'Show this dialog'],
              ].map(([key, desc]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-gray-400">{desc}</span>
                  <kbd className="glass px-2 py-0.5 rounded text-xs text-violet-300 font-mono border border-white/10">{key}</kbd>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowShortcuts(false)}
              className="mt-4 w-full bg-violet-600 hover:bg-violet-500 text-white rounded-xl py-2 text-sm font-medium transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="flex h-screen max-w-7xl mx-auto relative z-10">

        {/* Left sidebar */}
        <div className="w-14 flex flex-col items-center py-4 gap-3 border-r border-white/5">
          {/* Logo */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-sm shadow-lg shadow-violet-900/50 mb-2">
            🤖
          </div>

          <div className="w-px flex-1 max-h-4" />

          {sidebarNavItems.map(item => (
            <button
              key={item.id}
              onClick={() => setRightPanel(p => p === item.id ? null : item.id)}
              className={`relative tooltip w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all active:scale-90 ${
                rightPanel === item.id
                  ? 'bg-violet-600/30 border border-violet-500/50 shadow-lg shadow-violet-900/30'
                  : 'glass hover:bg-white/10'
              }`}
              data-tip={item.label}
            >
              {item.icon}
              {item.count > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-600 flex items-center justify-center text-[9px] text-white font-bold shadow">
                  {item.count > 9 ? '9+' : item.count}
                </div>
              )}
            </button>
          ))}

          <div className="mt-auto space-y-2">
            <button
              onClick={() => setShowShortcuts(true)}
              className="tooltip w-10 h-10 rounded-xl glass hover:bg-white/10 flex items-center justify-center text-sm text-gray-500 hover:text-gray-300 transition-all"
              data-tip="Shortcuts"
            >
              ⌨️
            </button>
            <button
              onClick={() => stopSpeaking()}
              className="tooltip w-10 h-10 rounded-xl glass hover:bg-white/10 flex items-center justify-center text-sm text-gray-500 hover:text-red-400 transition-all"
              data-tip="Stop speaking"
            >
              🔇
            </button>
          </div>
        </div>

        {/* Center – Main chat area */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="font-bold text-white text-sm gradient-text-purple">
                  {ARIA_NAMES[memory.preferences.personality] ?? 'ARIA'}
                </h1>
                <p className="text-[10px] text-gray-600">
                  {status === 'idle' ? `${memory.mood} mode` : status}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${status !== 'idle' ? 'bg-green-400' : 'bg-gray-700'} transition-colors`} />
                <span className="text-xs text-gray-600">{memory.totalInteractions} chats</span>
              </div>
              <LiveClock />
            </div>
          </div>

          {/* Orb + Quick launcher area */}
          <div className="flex flex-col items-center pt-6 pb-3">
            <OrbAvatar status={status} mood={memory.mood} />
            <div className="w-full mt-4">
              <QuickLauncher />
            </div>
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            <ChatPanel messages={memory.chatHistory} isTyping={isTyping} />
          </div>

          {/* Input area */}
          <div className="px-4 py-4 border-t border-white/5">
            <div className="flex gap-2 items-end">
              {/* Mic button */}
              <button
                onClick={handleMicToggle}
                className={`flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-90 ${
                  status === 'listening'
                    ? 'bg-green-500 shadow-lg shadow-green-900/50 btn-glow-green'
                    : micError
                    ? 'bg-red-600/30 border border-red-500/50'
                    : 'glass hover:bg-white/10 btn-glow'
                }`}
                title={status === 'listening' ? 'Stop listening' : 'Start voice input (Ctrl+M)'}
              >
                {status === 'listening' ? (
                  <div className="flex gap-0.5 items-end h-4">
                    {[3,5,4,6,4,5,3].map((h, i) => (
                      <div key={i} className="wave-bar w-0.5 rounded-full bg-white" style={{ height: h * 3 }} />
                    ))}
                  </div>
                ) : micError ? (
                  <span className="text-red-400 text-lg">🚫</span>
                ) : (
                  <span className="text-gray-300 text-lg">🎤</span>
                )}
              </button>

              {/* Text input */}
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(inputText);
                    }
                  }}
                  placeholder={`Talk to ${ARIA_NAMES[memory.preferences.personality] ?? 'ARIA'}… (Ctrl+K to focus)`}
                  className="w-full glass-strong border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/40 focus:bg-white/8 transition-all pr-12"
                />
                {inputText && (
                  <button
                    onClick={() => setInputText('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors text-lg"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Send button */}
              <button
                onClick={() => handleSend(inputText)}
                disabled={!inputText.trim() || status === 'thinking'}
                className="flex-shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-90 btn-glow shadow-lg shadow-violet-900/40"
              >
                {status === 'thinking' ? (
                  <div className="flex gap-0.5">
                    {[0,1,2].map(i => <div key={i} className="bounce-dot w-1.5 h-1.5 rounded-full bg-white" />)}
                  </div>
                ) : (
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            </div>

            <p className="text-[10px] text-gray-700 text-center mt-2">
              Press <kbd className="font-mono bg-white/5 px-1 rounded">?</kbd> for keyboard shortcuts
            </p>
          </div>
        </div>

        {/* Right panel */}
        {rightPanel && (
          <div className="w-80 flex flex-col border-l border-white/5 panel-animate" style={{ background: '#0d0d1c' }}>
            {/* Panel header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div className="flex gap-1">
                {sidebarNavItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setRightPanel(item.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      rightPanel === item.id
                        ? 'bg-violet-600/30 text-violet-300'
                        : 'text-gray-500 hover:text-gray-400'
                    }`}
                  >
                    {item.icon} {item.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setRightPanel(null)}
                className="text-gray-600 hover:text-gray-400 transition-colors text-lg w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5"
              >
                ×
              </button>
            </div>

            {/* Panel content */}
            <div className="flex-1 overflow-hidden">
              {rightPanel === 'tasks' && (
                <TaskPanel
                  tasks={memory.tasks}
                  onAdd={task => setMemory(prev => ({ ...prev, tasks: [...prev.tasks, task] }))}
                  onToggle={id => setMemory(prev => ({
                    ...prev,
                    tasks: prev.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t),
                  }))}
                  onDelete={id => setMemory(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }))}
                  onClearDone={() => setMemory(prev => ({ ...prev, tasks: prev.tasks.filter(t => !t.done) }))}
                />
              )}
              {rightPanel === 'notes' && (
                <NotesPanel
                  notes={memory.notes}
                  onAdd={note => setMemory(prev => ({ ...prev, notes: [...prev.notes, note] }))}
                  onDelete={id => setMemory(prev => ({ ...prev, notes: prev.notes.filter(n => n.id !== id) }))}
                />
              )}
              {rightPanel === 'settings' && (
                <SettingsPanel
                  memory={memory}
                  onUpdate={updateMemory}
                  onClearAll={() => {
                    setMemory(getDefaultMemory());
                    showNotification('🗑️ All data cleared!');
                  }}
                  voices={voices}
                  selectedVoice={selectedVoice}
                  onVoiceChange={setSelectedVoice}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
