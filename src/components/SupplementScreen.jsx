import { MY_SUPPLEMENTS } from '../data/supplements';

const TIMING_GROUPS = [
  { key: 'wake', label: 'Morning Hydration' },
  { key: 'meal-1', label: 'With Breakfast (Meal 1)' },
  { key: 'meal-2', label: 'With Meal 2' },
  { key: 'pre-meal-3', label: 'Pre-Workout Fibre' },
  { key: 'meal-3', label: 'Pre-Workout (Meal 3)' },
  { key: 'post-training', label: 'Post-Training' },
  { key: 'meal-4', label: 'With Meal 4 (Post-Workout)' },
  { key: 'pre-meal-5', label: 'Pre-Dinner Fibre' },
  { key: 'meal-5', label: 'With Dinner (Meal 5)' },
  { key: 'meal-6', label: 'Bedtime (Meal 6)' },
  { key: 'bedtime', label: 'Bedtime' },
];

export default function SupplementScreen({ completedSupplements, onToggleSupplement, nauseaMode }) {
  const now = new Date();
  const dayOfWeek = now.getDay();

  const todaySupplements = MY_SUPPLEMENTS.filter(s => {
    if (nauseaMode && s.disableOnNausea) return false;
    if (!s.daily && s.days && !s.days.includes(dayOfWeek)) return false;
    return true;
  });

  const grouped = TIMING_GROUPS.map(group => {
    const items = todaySupplements.filter(s => s.timing === group.key);
    return { ...group, items };
  }).filter(g => g.items.length > 0);

  const totalCount = todaySupplements.length;
  const doneCount = todaySupplements.filter(s => completedSupplements.includes(s.id)).length;

  return (
    <div className="px-5 pt-5 pb-24">
      <h1 className="text-xl font-semibold text-charcoal mb-1">Supplements</h1>
      <p className="text-sm text-muted mb-5">{doneCount} of {totalCount} taken today</p>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-border rounded-full mb-6 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${(doneCount / totalCount) * 100}%`,
            backgroundColor: doneCount === totalCount ? '#7C8B6F' : '#C4956A',
          }}
        />
      </div>

      {nauseaMode && (
        <div className="px-3 py-2 rounded-lg text-xs font-medium mb-4"
          style={{ background: '#FDECEC', color: '#C47070' }}>
          Nausea mode — Isabgol disabled
        </div>
      )}

      {grouped.map(group => (
        <div key={group.key} className="mb-5">
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">{group.label}</h3>
          <div className="card">
            {group.items.map(supp => {
              const isDone = completedSupplements.includes(supp.id);
              return (
                <button
                  key={supp.id}
                  onClick={() => onToggleSupplement(supp.id)}
                  className="w-full flex items-start gap-3 py-3 text-left transition-all duration-200"
                >
                  <div
                    className="w-5 h-5 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all duration-200"
                    style={{
                      borderColor: isDone ? '#7C8B6F' : '#D1D1D1',
                      backgroundColor: isDone ? '#7C8B6F' : 'transparent',
                    }}
                  >
                    {isDone && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="checkmark-anim">
                        <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <div className={isDone ? 'opacity-50' : ''}>
                    <div className="text-sm font-medium text-charcoal">{supp.name}</div>
                    <div className="text-xs text-amber mt-0.5">{supp.dose}</div>
                    <div className="text-xs text-muted mt-0.5">{supp.purpose}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
