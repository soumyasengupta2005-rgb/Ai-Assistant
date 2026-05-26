import { useState } from 'react';
import type { Task } from '../lib/brain';

interface Props {
  tasks: Task[];
  onAdd: (task: Task) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onClearDone: () => void;
}

const PRIORITY_COLORS = {
  low: 'bg-gray-700 text-gray-300 border-gray-600',
  medium: 'bg-amber-900/50 text-amber-300 border-amber-700/50',
  high: 'bg-red-900/50 text-red-300 border-red-700/50',
};

const PRIORITY_DOT = {
  low: 'bg-gray-400',
  medium: 'bg-amber-400',
  high: 'bg-red-400',
};

let idCounter = Date.now();

export default function TaskPanel({ tasks, onAdd, onToggle, onDelete, onClearDone }: Props) {
  const [input, setInput] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all');

  const pending = tasks.filter(t => !t.done);
  const done = tasks.filter(t => t.done);
  const filtered = filter === 'all' ? tasks : filter === 'active' ? pending : done;

  const handleAdd = () => {
    if (!input.trim()) return;
    onAdd({
      id: (++idCounter).toString(),
      text: input.trim(),
      done: false,
      priority,
      createdAt: new Date().toISOString(),
    });
    setInput('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-white/5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-white text-sm">Task Manager</h3>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="text-green-400 font-medium">{done.length} done</span>
            <span>/</span>
            <span className="text-violet-400 font-medium">{pending.length} pending</span>
          </div>
        </div>

        {/* Progress bar */}
        {tasks.length > 0 && (
          <div className="w-full bg-gray-800 rounded-full h-1.5 mb-3">
            <div
              className="bg-gradient-to-r from-violet-600 to-green-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${tasks.length > 0 ? (done.length / tasks.length) * 100 : 0}%` }}
            />
          </div>
        )}

        {/* Add task */}
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Add a task..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 focus:bg-white/8 transition-all"
          />
          <select
            value={priority}
            onChange={e => setPriority(e.target.value as Task['priority'])}
            className="bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-xs text-gray-400 focus:outline-none focus:border-violet-500/50 cursor-pointer"
          >
            <option value="low">Low</option>
            <option value="medium">Med</option>
            <option value="high">High</option>
          </select>
          <button
            onClick={handleAdd}
            className="bg-violet-600 hover:bg-violet-500 text-white rounded-xl px-3 py-2 text-sm font-medium transition-all btn-glow active:scale-95"
          >
            +
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1 px-4 py-2 border-b border-white/5">
        {(['all', 'active', 'done'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 text-xs py-1 rounded-lg font-medium capitalize transition-all ${
              filter === f ? 'bg-violet-600/30 text-violet-300' : 'text-gray-500 hover:text-gray-400'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center text-gray-600 text-sm py-8">
            {filter === 'done' ? "No completed tasks yet" : filter === 'active' ? "No pending tasks! 🎉" : "No tasks yet. Add one above!"}
          </div>
        ) : (
          filtered.map(task => (
            <div
              key={task.id}
              className={`glass rounded-xl p-3 flex items-start gap-3 group transition-all hover:bg-white/5 ${
                task.done ? 'opacity-50' : ''
              }`}
            >
              <button
                onClick={() => onToggle(task.id)}
                className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${
                  task.done
                    ? 'bg-green-500 border-green-500'
                    : 'border-gray-600 hover:border-violet-400'
                }`}
              >
                {task.done && (
                  <svg viewBox="0 0 12 12" className="w-full h-full p-0.5" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <span className={`text-sm ${task.done ? 'line-through text-gray-600' : 'text-gray-200'}`}>
                  {task.text}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border ${PRIORITY_COLORS[task.priority]}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[task.priority]}`} />
                    {task.priority}
                  </div>
                  <span className="text-[10px] text-gray-600">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => onDelete(task.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all text-xs px-1"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {done.length > 0 && (
        <div className="px-4 py-3 border-t border-white/5">
          <button
            onClick={onClearDone}
            className="w-full text-xs text-gray-600 hover:text-red-400 transition-colors py-1"
          >
            Clear {done.length} completed task{done.length !== 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  );
}
