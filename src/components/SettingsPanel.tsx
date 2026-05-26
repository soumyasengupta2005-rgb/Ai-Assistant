import type { Memory, Mood } from '../lib/brain';

interface Props {
  memory: Memory;
  onUpdate: (updates: Partial<Memory>) => void;
  onClearAll: () => void;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  onVoiceChange: (voice: SpeechSynthesisVoice) => void;
}

const MOODS: Mood[] = ['happy', 'focused', 'excited', 'grumpy', 'sleepy', 'crazy'];
const MOOD_EMOJIS: Record<Mood, string> = {
  happy: '😊', focused: '🎯', excited: '🤩', grumpy: '😤', sleepy: '😴', crazy: '🤪',
};
const PERSONALITIES = [
  { id: 'aria', label: 'ARIA', desc: 'Friendly & helpful' },
  { id: 'jarvis', label: 'JARVIS', desc: 'Professional & precise' },
  { id: 'friday', label: 'F.R.I.D.A.Y', desc: 'Quick & concise' },
];

export default function SettingsPanel({ memory, onUpdate, onClearAll, voices, selectedVoice, onVoiceChange }: Props) {
  const { preferences } = memory;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-4 pt-4 pb-3 border-b border-white/5">
        <h3 className="font-semibold text-white text-sm">Settings</h3>
        <p className="text-xs text-gray-500 mt-0.5">Customize your ARIA experience</p>
      </div>

      <div className="flex-1 px-4 py-4 space-y-6">

        {/* Profile */}
        <section>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Profile</h4>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Your Name</label>
              <input
                value={memory.name ?? ''}
                onChange={e => onUpdate({ name: e.target.value || null })}
                placeholder="What should I call you?"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-all"
              />
            </div>
            <div className="glass rounded-xl p-3 text-xs text-gray-500 space-y-1">
              <div className="flex justify-between">
                <span>Total interactions</span>
                <span className="text-violet-400 font-mono">{memory.totalInteractions}</span>
              </div>
              <div className="flex justify-between">
                <span>Tasks created</span>
                <span className="text-blue-400 font-mono">{memory.tasks.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Notes saved</span>
                <span className="text-green-400 font-mono">{memory.notes.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Joined</span>
                <span className="text-gray-400 font-mono">{new Date(memory.joinedDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Mood */}
        <section>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Mood</h4>
          <div className="grid grid-cols-3 gap-2">
            {MOODS.map(m => (
              <button
                key={m}
                onClick={() => onUpdate({ mood: m })}
                className={`flex flex-col items-center gap-1 rounded-xl py-2 px-2 text-xs font-medium transition-all ${
                  memory.mood === m
                    ? 'bg-violet-600/30 border border-violet-500/50 text-violet-300'
                    : 'glass text-gray-500 hover:text-gray-300 hover:bg-white/8'
                }`}
              >
                <span className="text-lg">{MOOD_EMOJIS[m]}</span>
                <span className="capitalize">{m}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Personality */}
        <section>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Personality</h4>
          <div className="space-y-2">
            {PERSONALITIES.map(p => (
              <button
                key={p.id}
                onClick={() => onUpdate({ preferences: { ...preferences, personality: p.id as any } })}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 transition-all ${
                  preferences.personality === p.id
                    ? 'bg-violet-600/30 border border-violet-500/50'
                    : 'glass hover:bg-white/8'
                }`}
              >
                <div className="text-left">
                  <div className={`text-sm font-semibold ${preferences.personality === p.id ? 'text-violet-300' : 'text-gray-300'}`}>
                    {p.label}
                  </div>
                  <div className="text-xs text-gray-500">{p.desc}</div>
                </div>
                {preferences.personality === p.id && (
                  <div className="w-2 h-2 rounded-full bg-violet-400" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Voice */}
        <section>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Voice</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between glass rounded-xl px-3 py-2.5">
              <span className="text-sm text-gray-300">Voice Responses</span>
              <button
                onClick={() => onUpdate({ preferences: { ...preferences, voiceEnabled: !preferences.voiceEnabled } })}
                className={`w-10 h-5 rounded-full transition-all relative ${preferences.voiceEnabled ? 'bg-violet-600' : 'bg-gray-700'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${preferences.voiceEnabled ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between glass rounded-xl px-3 py-2.5">
              <span className="text-sm text-gray-300">Auto Greet</span>
              <button
                onClick={() => onUpdate({ preferences: { ...preferences, autoGreet: !preferences.autoGreet } })}
                className={`w-10 h-5 rounded-full transition-all relative ${preferences.autoGreet ? 'bg-violet-600' : 'bg-gray-700'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${preferences.autoGreet ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
            {voices.length > 0 && (
              <div>
                <label className="text-xs text-gray-500 block mb-1">Voice</label>
                <select
                  value={selectedVoice?.name ?? ''}
                  onChange={e => {
                    const v = voices.find(v => v.name === e.target.value);
                    if (v) onVoiceChange(v);
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all"
                >
                  {voices.map(v => (
                    <option key={v.name} value={v.name} style={{ background: '#1a0a2e' }}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </section>

        {/* Danger zone */}
        <section>
          <h4 className="text-xs font-semibold text-red-500/70 uppercase tracking-widest mb-3">Danger Zone</h4>
          <button
            onClick={onClearAll}
            className="w-full glass rounded-xl px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/40 transition-all"
          >
            🗑️ Reset All Data
          </button>
        </section>

      </div>
    </div>
  );
}
