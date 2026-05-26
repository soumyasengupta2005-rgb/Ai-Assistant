import { useEffect, useRef } from 'react';
import type { ChatMessage } from '../lib/brain';

interface Props {
  messages: ChatMessage[];
  isTyping: boolean;
}

function renderMarkdown(text: string) {
  // Bold **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
    }
    // Handle newlines within non-bold segments
    return <span key={i}>{part.split('\n').map((line, j, arr) => (
      <span key={j}>{line}{j < arr.length - 1 ? <br /> : null}</span>
    ))}</span>;
  });
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  const time = new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex items-end gap-2 ${isUser ? 'justify-end msg-user' : 'justify-start msg-bot'}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-xs flex-shrink-0 mb-1 shadow-lg shadow-violet-900/50">
          🤖
        </div>
      )}
      <div className={`max-w-[78%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-gradient-to-br from-violet-600 to-indigo-700 text-white rounded-br-sm shadow-lg shadow-violet-900/30'
              : 'glass-strong text-gray-200 rounded-bl-sm shadow-lg'
          }`}
        >
          {renderMarkdown(msg.text)}
        </div>
        <span className="text-[10px] text-gray-600 mt-1 px-1">{time}</span>
      </div>
      {isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-xs flex-shrink-0 mb-1 shadow-lg">
          🧑
        </div>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 justify-start msg-bot">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-xs flex-shrink-0 shadow-lg shadow-violet-900/50">
        🤖
      </div>
      <div className="glass-strong px-4 py-3 rounded-2xl rounded-bl-sm">
        <div className="flex gap-1.5 items-center h-4">
          {[0, 1, 2].map(i => (
            <div key={i} className="bounce-dot w-2 h-2 rounded-full bg-violet-400" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ChatPanel({ messages, isTyping }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (messages.length === 0 && !isTyping) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
        <div className="text-5xl">💬</div>
        <div>
          <p className="text-gray-400 font-medium">Start a conversation!</p>
          <p className="text-gray-600 text-sm mt-1">Type a message or press the mic to speak</p>
        </div>
        <div className="grid grid-cols-2 gap-2 w-full mt-2">
          {[
            { icon: '😂', text: 'Tell me a joke' },
            { icon: '📋', text: 'Show my tasks' },
            { icon: '🕐', text: 'What time is it?' },
            { icon: '🧮', text: 'What is 42 * 7?' },
          ].map(({ icon, text }) => (
            <div key={text} className="glass rounded-xl px-3 py-2 text-xs text-gray-400 text-center cursor-default hover:text-gray-300 transition-colors">
              {icon} {text}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
      {messages.map(msg => (
        <MessageBubble key={msg.id} msg={msg} />
      ))}
      {isTyping && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
