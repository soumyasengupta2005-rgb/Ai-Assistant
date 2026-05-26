import { useEffect, useRef, useState } from 'react';
import type { SpeechStatus } from '../hooks/useSpeech';
import type { Mood } from '../lib/brain';

interface OrbAvatarProps {
  status: SpeechStatus;
  mood: Mood;
}

const MOOD_COLORS: Record<Mood, { primary: string; secondary: string; face: string }> = {
  happy:   { primary: '#7c3aed', secondary: '#4f46e5', face: '(•◡•)' },
  grumpy:  { primary: '#b91c1c', secondary: '#dc2626', face: '(>_<)' },
  sleepy:  { primary: '#1e40af', secondary: '#3b82f6', face: '(-_-)ᶻ' },
  crazy:   { primary: '#d97706', secondary: '#f59e0b', face: '(◉‿◉)' },
  focused: { primary: '#0891b2', secondary: '#06b6d4', face: '(•_•)' },
  excited: { primary: '#db2777', secondary: '#ec4899', face: '(✪‿✪)' },
};

const STATUS_COLORS: Record<SpeechStatus, string | null> = {
  idle: null,
  speaking: '#22d3ee',
  listening: '#4ade80',
  thinking: '#fbbf24',
};

const STATUS_LABELS: Record<SpeechStatus, string> = {
  idle: '',
  speaking: 'Speaking…',
  listening: 'Listening…',
  thinking: 'Thinking…',
};

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
}

function WaveBars() {
  return (
    <div className="flex items-center gap-[3px] h-6">
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className="wave-bar w-[3px] rounded-full bg-green-400"
          style={{ height: '100%', transformOrigin: 'bottom' }}
        />
      ))}
    </div>
  );
}

export default function OrbAvatar({ status, mood }: OrbAvatarProps) {
  const colors = MOOD_COLORS[mood];
  const statusColor = STATUS_COLORS[status];
  const orbColor = statusColor ?? colors.primary;
  const orbColor2 = statusColor ?? colors.secondary;

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const size = isMobile ? 140 : 300;
  
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleId = useRef(0);

  useEffect(() => {
    if (status === 'speaking') {
      const interval = setInterval(() => {
        const newParticle: Particle = {
          id: particleId.current++,
          x: Math.random() * size,
          y: Math.random() * size,
          size: 4 + Math.random() * 6,
          color: ['#a78bfa', '#818cf8', '#c084fc', '#22d3ee', '#f0abfc'][Math.floor(Math.random() * 5)],
          delay: Math.random() * 0.3,
        };
        setParticles(prev => [...prev.slice(-12), newParticle]);
      }, 200);
      return () => clearInterval(interval);
    }
  }, [status]);

  const orbClass = `orb-${status}`;

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-[100vw] overflow-hidden px-2">
      {/* Outer ring / mood indicator */}
      <div
        className="relative flex justify-center items-center"
        style={{
          width: size,
          height: size,
          maxWidth: '90vw',
          maxHeight: '90vw'
        }}
      >
        {/* Rotating mood ring */}
        <div
          className="mood-ring absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from 0deg, ${orbColor}, ${orbColor2}, transparent, ${orbColor})`,
            padding: 3,
            borderRadius: '50%',
          }}
        >
          <div className="w-full h-full rounded-full" style={{ background: '#0d0d1a' }} />
        </div>

        {/* Main orb */}
        <div
          className={`${orbClass} absolute rounded-full flex items-center justify-center`}
          style={{
            inset: 8,
            background: `radial-gradient(circle at 35% 35%, ${orbColor2}cc, ${orbColor}ee, #1a0a2e)`,
            border: `2px solid ${orbColor}44`,
          }}
        >
          {/* Inner glow */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${orbColor}55, transparent 60%)`,
            }}
          />

          {/* Face / status content */}
          <div className="relative z-10 flex flex-col items-center gap-1">
            {status === 'listening' ? (
              <WaveBars />
            ) : status === 'thinking' ? (
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="bounce-dot w-3 h-3 rounded-full bg-yellow-400"
                  />
                ))}
              </div>
            ) : (
              <span
                className="text-xl md:text-3xl font-bold text-white"
                style={{ textShadow: `0 0 20px ${orbColor}` }}
              >
                {colors.face}
              </span>
            )}
          </div>
        </div>

        {/* Particles layer */}
        <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
          {particles.map(p => (
            <div
              key={p.id}
              className="particle absolute rounded-full"
              style={{
                left: p.x,
                top: p.y,
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>

        {/* Status ripple */}
        {(status === 'listening' || status === 'speaking') && (
          <div
            className="ripple absolute inset-0 rounded-full border-2"
            style={{ borderColor: `${orbColor}88` }}
          />
        )}
      </div>

      {/* Status label */}
      <div className="mt-3 h-5 flex items-center">
        {status !== 'idle' ? (
          <span
            className="text-sm font-semibold tracking-widest uppercase"
            style={{ color: orbColor, textShadow: `0 0 10px ${orbColor}88` }}
          >
            {STATUS_LABELS[status]}
          </span>
        ) : (
          <span className="text-xs text-gray-600 capitalize tracking-widest">{mood} mode</span>
        )}
      </div>
    </div>
  );
}
