import { useState } from 'react';
import type { Note } from '../lib/brain';

interface Props {
  notes: Note[];
  onAdd: (note: Note) => void;
  onDelete: (id: string) => void;
}

const COLORS = ['#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626', '#db2777', '#4338ca', '#0d9488'];

let idCounter = Date.now();

export default function NotesPanel({ notes, onAdd, onDelete }: Props) {
  const [input, setInput] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const handleAdd = () => {
    if (!input.trim()) return;
    onAdd({
      id: (++idCounter).toString(),
      text: input.trim(),
      createdAt: new Date().toISOString(),
      color: selectedColor,
    });
    setInput('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-white/5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-white text-sm">Quick Notes</h3>
          <span className="text-xs text-gray-500">{notes.length} note{notes.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Color picker */}
        <div className="flex gap-1.5 mb-2">
          {COLORS.map(color => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className="w-5 h-5 rounded-full transition-all hover:scale-110 active:scale-95"
              style={{
                backgroundColor: color,
                outline: selectedColor === color ? `2px solid white` : 'none',
                outlineOffset: 2,
              }}
            />
          ))}
        </div>

        {/* Add note */}
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAdd())}
            placeholder="Write a note... (Enter to save)"
            rows={2}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-all resize-none"
          />
          <button
            onClick={handleAdd}
            className="bg-violet-600 hover:bg-violet-500 text-white rounded-xl px-3 text-sm font-medium transition-all btn-glow active:scale-95 self-end py-2"
          >
            +
          </button>
        </div>
      </div>

      {/* Notes grid */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {notes.length === 0 ? (
          <div className="text-center text-gray-600 text-sm py-8">
            <div className="text-3xl mb-2">📝</div>
            No notes yet. Add one above!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {[...notes].reverse().map(note => (
              <div
                key={note.id}
                className="relative rounded-xl p-3 group transition-all hover:scale-[1.02]"
                style={{
                  background: `${note.color}22`,
                  border: `1px solid ${note.color}44`,
                }}
              >
                <div
                  className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full"
                  style={{ backgroundColor: note.color }}
                />
                <p className="text-sm text-gray-200 pl-3 pr-6 leading-relaxed whitespace-pre-wrap break-words">
                  {note.text}
                </p>
                <span className="text-[10px] text-gray-600 pl-3 mt-1 block">
                  {new Date(note.createdAt).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
                <button
                  onClick={() => onDelete(note.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all text-xs w-5 h-5 flex items-center justify-center rounded-full hover:bg-red-400/10"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
