import { useState } from 'react';

export default function HydrationCounter({ consumed, onAdd }) {
  const target = 3500;
  const pct = Math.min(consumed / target, 1);
  const liters = (consumed / 1000).toFixed(1);
  const targetL = (target / 1000).toFixed(1);
  const color = pct >= 1 ? '#7C8B6F' : pct >= 0.8 ? '#7C8B6F' : pct >= 0.5 ? '#8B9DC3' : '#D1D1D1';
  const [lastAdd, setLastAdd] = useState(null);

  const handleAdd = (ml) => {
    setLastAdd(ml);
    onAdd(ml);
  };

  const handleUndo = () => {
    if (lastAdd) {
      onAdd(-lastAdd);
      setLastAdd(null);
    }
  };

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-charcoal">
          {liters}L / {targetL}L
          {pct >= 1 && <span className="text-sage ml-1">&#10003;</span>}
        </span>
        <span className="text-xs text-muted">water</span>
      </div>
      <div className="w-full h-2 bg-border rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-500 ${pct >= 1 ? 'celebrate' : ''}`}
          style={{ width: `${pct * 100}%`, backgroundColor: color }}
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => handleAdd(250)}
          className="btn-secondary text-xs py-1.5 px-2.5 flex-1 min-h-[36px]"
        >
          +250ml
        </button>
        <button
          onClick={() => handleAdd(500)}
          className="btn-secondary text-xs py-1.5 px-2.5 flex-1 min-h-[36px]"
        >
          +500ml
        </button>
        {lastAdd && consumed > 0 && (
          <button
            onClick={handleUndo}
            className="text-xs text-muted px-2 min-h-[36px] transition-all duration-200"
            aria-label="Undo last water entry"
          >
            Undo
          </button>
        )}
      </div>
    </div>
  );
}
