import { useMemo } from 'react';

export default function ProteinRing({ consumed, target }) {
  const pct = Math.min(consumed / target, 1);
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);
  const color = pct >= 0.8 ? '#7C8B6F' : pct >= 0.5 ? '#C4956A' : '#E8E6E1';

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-20 h-20">
        <svg viewBox="0 0 88 88" className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="44" cy="44" r={radius} fill="none" stroke="#E8E6E1" strokeWidth="6" />
          <circle
            cx="44" cy="44" r={radius}
            fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 500ms ease, stroke 300ms ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-semibold" style={{ color }}>{consumed}g</span>
        </div>
      </div>
      <div className="text-xs text-muted">
        <div className="font-medium text-charcoal">{consumed}g / {target}g</div>
        <div>protein</div>
      </div>
    </div>
  );
}
