export default function HydrationCounter({ consumed, onAdd }) {
  const target = 3000;
  const pct = Math.min(consumed / target, 1);
  const liters = (consumed / 1000).toFixed(1);
  const targetL = (target / 1000).toFixed(1);
  const color = pct >= 0.8 ? '#7C8B6F' : pct >= 0.5 ? '#8B9DC3' : '#D1D1D1';

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-charcoal">{liters}L / {targetL}L</span>
        <span className="text-xs text-muted">water</span>
      </div>
      <div className="w-full h-2 bg-border rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct * 100}%`, backgroundColor: color }}
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onAdd(250)}
          className="btn-secondary text-xs py-1 px-2.5 flex-1"
        >
          +250ml
        </button>
        <button
          onClick={() => onAdd(500)}
          className="btn-secondary text-xs py-1 px-2.5 flex-1"
        >
          +500ml
        </button>
      </div>
    </div>
  );
}
