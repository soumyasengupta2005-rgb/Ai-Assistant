interface QuickLink {
  label: string;
  icon: string;
  url: string;
}

const LINKS: QuickLink[] = [
  { label: 'YouTube', icon: '▶️', url: 'https://youtube.com' },
  { label: 'Google', icon: '🔍', url: 'https://google.com' },
  { label: 'ChatGPT', icon: '🤖', url: 'https://chatgpt.com' },
  { label: 'GitHub', icon: '🐙', url: 'https://github.com' },
  { label: 'Spotify', icon: '🎵', url: 'https://spotify.com' },
  { label: 'Reddit', icon: '👾', url: 'https://reddit.com' },
  { label: 'Gmail', icon: '📧', url: 'https://mail.google.com' },
  { label: 'Maps', icon: '🗺️', url: 'https://maps.google.com' },
];

export default function QuickLauncher() {
  return (
    <div className="px-3 py-2">
      <h4 className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest mb-2">Quick Launch</h4>
      <div className="grid grid-cols-4 gap-1.5">
        {LINKS.map(link => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 p-2 rounded-xl glass hover:bg-white/8 transition-all group active:scale-95"
          >
            <span className="text-lg group-hover:scale-110 transition-transform">{link.icon}</span>
            <span className="text-[9px] text-gray-500 group-hover:text-gray-300 transition-colors truncate w-full text-center">
              {link.label}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
