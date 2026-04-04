import { useState } from 'react';
import { MEALS_MAP } from '../data/meals';

function SupplementBadge({ supplement }) {
  return (
    <div className="text-xs text-muted mt-1 flex items-start gap-1.5">
      <span className="w-1 h-1 rounded-full bg-amber mt-1.5 shrink-0" />
      <span>{supplement.name} — {supplement.dose}</span>
    </div>
  );
}

function RecipeView({ mealId }) {
  const meal = MEALS_MAP[mealId];
  if (!meal || !meal.ingredients) return null;

  return (
    <div className="mt-4 pt-4 border-t border-border fade-in">
      {meal.prepNote && (
        <div className="text-xs font-medium text-medical mb-3 px-3 py-2 bg-red-50 rounded-lg">
          {meal.prepNote}
        </div>
      )}
      <div className="mb-3">
        <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Ingredients</h4>
        <div className="space-y-1">
          {meal.ingredients.map((ing, i) => (
            <div key={i} className="text-xs text-charcoal flex justify-between">
              <span>{ing.name}</span>
              <span className="text-muted ml-2">{ing.amount}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Steps</h4>
        <div className="space-y-2">
          {meal.steps.map((step, i) => (
            <div key={i} className="text-xs text-charcoal flex gap-2">
              <span className="text-muted shrink-0 font-medium">{i + 1}.</span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function EventCard({ event, isCurrent, isCompleted, onComplete, onSwapMeal, onCustomMeal, onSkipGym }) {
  const [showRecipe, setShowRecipe] = useState(false);
  const [showSwaps, setShowSwaps] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customProtein, setCustomProtein] = useState('');

  const meal = event.mealId ? MEALS_MAP[event.mealId] : null;
  const hasRecipe = meal && meal.ingredients && meal.ingredients.length > 0;
  const hasSwaps = meal && meal.swapOptions && meal.swapOptions.length > 0;

  const typeColors = {
    meal: '#C4956A',
    supplement: '#8B9DC3',
    training: '#7C8B6F',
    walk: '#7C8B6F',
    injection: '#C47070',
    monitoring: '#C47070',
    travel: '#9A9A9A',
    wellness: '#8B9DC3',
    sleep: '#8B9DC3',
    prep: '#C4956A',
  };

  const borderColor = isCurrent ? (event.type === 'injection' ? '#C47070' : '#C4956A') : 'transparent';

  if (isCompleted && !isCurrent) {
    return (
      <button
        onClick={() => onComplete(event.id)}
        className="w-full flex items-center gap-3 py-3 px-2 opacity-40 text-left min-h-[44px] rounded-lg transition-all duration-200 active:bg-gray-50"
        aria-label={`Undo: ${event.title}`}
      >
        <div className="w-5 h-5 rounded-full bg-sage flex items-center justify-center shrink-0">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="text-xs text-muted line-through">{event.timeStr}</span>
        <span className="text-xs text-muted line-through flex-1 truncate">{event.title}</span>
        {event.protein > 0 && <span className="text-xs text-muted">+{event.protein}g</span>}
      </button>
    );
  }

  if (!isCurrent) {
    return (
      <div className="flex items-center gap-3 py-3 px-2 min-h-[44px]">
        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: typeColors[event.type] || '#E8E6E1' }} />
        <span className="text-xs text-muted w-14 shrink-0">{event.timeStr}</span>
        <span className="text-sm text-charcoal flex-1 truncate">{event.title}</span>
        {event.protein > 0 && <span className="text-xs font-medium text-amber">+{event.protein}g</span>}
      </div>
    );
  }

  // Current (active) card
  return (
    <div
      className="card slide-in mb-4"
      style={{ borderLeft: `4px solid ${borderColor}` }}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-muted">{event.timeStr}</span>
        {event.cookTime > 0 && (
          <span className="text-xs text-muted">{event.cookTime} min</span>
        )}
        {event.duration && event.type === 'training' && (
          <span className="text-xs text-muted">{event.duration} min</span>
        )}
      </div>

      <h3 className="text-lg font-semibold text-charcoal mb-1">{event.title}</h3>

      {event.protein > 0 && (
        <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2"
          style={{ backgroundColor: '#FFF5ED', color: '#C4956A' }}>
          +{event.protein}g protein
        </span>
      )}

      {event.mealNum === 5 && [0, 3].includes(new Date().getDay()) && (
        <div className="text-xs font-medium px-2 py-1 rounded-lg mb-2"
          style={{ background: '#FFF5ED', color: '#C4956A' }}>
          Zinc day — take extra capsule with this meal
        </div>
      )}

      {event.description && (
        <p className="text-sm text-muted mb-3">{event.description}</p>
      )}

      {event.isInjection && (
        <div className="bg-red-50 rounded-lg p-3 mb-3 text-sm">
          <div className="font-medium text-medical mb-1">Dose: {event.dose}mg</div>
          <div className="text-medical">Site: {event.site}</div>
          <div className="text-xs text-muted mt-2">
            Clean area with alcohol swab. Pinch skin. Insert at 90 degrees. Inject slowly. Hold 10 seconds. Dispose safely.
          </div>
        </div>
      )}

      {event.supplements && event.supplements.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Supplements</div>
          {event.supplements.map(s => <SupplementBadge key={s.id} supplement={s} />)}
        </div>
      )}

      <div className="flex gap-2 mt-4">
        {hasRecipe && (
          <button onClick={() => setShowRecipe(!showRecipe)} className="btn-secondary flex-1 text-sm">
            {showRecipe ? 'Hide Recipe' : 'View Recipe'}
          </button>
        )}
        {hasSwaps && (
          <button onClick={() => setShowSwaps(!showSwaps)} className="btn-secondary text-sm px-3">
            Swap
          </button>
        )}
        {event.type === 'meal' && onCustomMeal && (
          <button onClick={() => setShowCustom(!showCustom)} className="btn-secondary text-sm px-3">
            {showCustom ? 'Cancel' : 'Ate something else'}
          </button>
        )}
      </div>

      {showSwaps && hasSwaps && (
        <div className="mt-3 pt-3 border-t border-border fade-in">
          <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Alternatives</div>
          {meal.swapOptions.map(swapId => {
            const swapMeal = MEALS_MAP[swapId];
            if (!swapMeal) return null;
            return (
              <button
                key={swapId}
                onClick={() => { onSwapMeal(event.id, swapId); setShowSwaps(false); }}
                className="w-full text-left py-2 px-3 rounded-lg hover:bg-gray-50 flex justify-between items-center text-sm mb-1 transition-all duration-200"
              >
                <span>{swapMeal.name}</span>
                <span className="text-xs text-amber">{swapMeal.protein}g · {swapMeal.cookTime} min</span>
              </button>
            );
          })}
        </div>
      )}

      {showCustom && (
        <div className="mt-3 pt-3 border-t border-border fade-in">
          <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">What did you eat?</div>
          <input
            type="text"
            placeholder="e.g. Chicken sausage scramble"
            value={customName}
            onChange={e => setCustomName(e.target.value)}
            className="w-full text-sm px-3 py-2 rounded-lg bg-offwhite border border-border text-charcoal mb-2"
          />
          <div className="flex items-center gap-2 mb-3">
            <label className="text-xs text-muted">Protein (g):</label>
            <input
              type="number"
              placeholder="0"
              value={customProtein}
              onChange={e => setCustomProtein(e.target.value)}
              className="w-20 text-sm px-2 py-1.5 rounded-lg bg-offwhite border border-border text-charcoal"
            />
          </div>
          <button
            onClick={() => {
              if (customName.trim()) {
                onCustomMeal(event.id, customName.trim(), Number(customProtein) || 0);
                setShowCustom(false);
              }
            }}
            className="btn-primary text-sm"
          >
            Log It
          </button>
        </div>
      )}

      {showRecipe && <RecipeView mealId={event.mealId} />}

      {event.type === 'training' && event.trainingType === 'resistance' && (
        <div className="mt-3 text-xs text-muted">
          Tap the Workout tab for full exercise list with set tracking.
        </div>
      )}

      {event.type === 'training' && event.trainingType !== 'rest' && onSkipGym && (
        <button
          onClick={() => onSkipGym()}
          className="btn-secondary w-full mt-2 text-xs text-muted"
        >
          Skip Training Today
        </button>
      )}

      <button
        onClick={() => {
          if (navigator.vibrate) navigator.vibrate(50);
          onComplete(event.id);
        }}
        className="btn-primary mt-4 flex items-center justify-center gap-2 min-h-[48px]"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8L7 12L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Done
      </button>
    </div>
  );
}
