import { useState, useEffect, useRef } from 'react';
import ProteinRing from './ProteinRing';
import HydrationCounter from './HydrationCounter';
import EventCard from './EventCard';
import { MY_PROFILE, TRAINING_SCHEDULE, SOAKING_SCHEDULE } from '../data/profile';
import { getWeekNumber, isInjectionDay, calculateProteinConsumed, getCurrentEvent } from '../engine/dayGenerator';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function DoneSection({ completedEvents, onComplete, onSwapMeal }) {
  const [collapsed, setCollapsed] = useState(true);
  return (
    <div className="mb-4">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between w-full mb-2 py-1 min-h-[36px]"
        aria-expanded={!collapsed}
      >
        <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">
          Done Today ({completedEvents.length})
        </h2>
        <span className="text-xs text-muted px-2">{collapsed ? 'Show' : 'Hide'}</span>
      </button>
      {!collapsed && (
        <div className="card fade-in">
          <p className="text-[10px] text-muted mb-2">Tap to undo</p>
          {completedEvents.map((event, idx) => (
            <div key={event.id}>
              {idx > 0 && <div className="border-t border-border" />}
              <EventCard
                event={event}
                isCurrent={false}
                isCompleted={true}
                onComplete={onComplete}
                onSwapMeal={onSwapMeal}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HomeScreen({ events, completedIds, onComplete, onSwapMeal, onCustomMeal, onSkipGym, hydration, onAddHydration, nauseaMode, onToggleNausea, onRecalculate }) {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const weekNum = getWeekNumber(dateStr);
  const training = TRAINING_SCHEDULE[dayOfWeek];
  const injDay = isInjectionDay(dayOfWeek, weekNum);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const proteinConsumed = calculateProteinConsumed(events, completedIds);
  const currentEvent = getCurrentEvent(events, completedIds, currentMinutes);

  const completedEvents = events.filter(e => completedIds.includes(e.id));
  const upcomingEvents = events.filter(e => !completedIds.includes(e.id) && e.id !== currentEvent?.id);

  const isZincDay = [0, 3].includes(dayOfWeek); // Sun, Wed
  const soaking = SOAKING_SCHEDULE[dayOfWeek];
  const isPastEight = currentMinutes >= 1200; // 8 PM
  const soakingDone = soaking && completedIds.some(id => events.find(e => e.id === id && e.type === 'prep'));
  const accentBg = injDay ? 'rgba(196, 112, 112, 0.05)' : undefined;
  const currentRef = useRef(null);
  const totalEvents = events.length;
  const doneCount = completedEvents.length;
  const dayPct = totalEvents > 0 ? Math.round((doneCount / totalEvents) * 100) : 0;

  // Scroll to current event on mount
  useEffect(() => {
    if (currentRef.current) {
      setTimeout(() => {
        currentRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, []);

  return (
    <div className="pb-24" style={{ backgroundColor: accentBg }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h1 className="text-xl font-semibold text-charcoal" style={{ fontFamily: "'DM Serif Display', serif" }}>
              {DAY_NAMES[dayOfWeek]}, {MONTH_NAMES[now.getMonth()]} {now.getDate()}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted">Week {weekNum}</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: training.type === 'rest' ? '#EDF0F7' : '#FFF5ED',
                  color: training.type === 'rest' ? '#8B9DC3' : '#C4956A',
                }}>
                {training.name.split(' — ')[0]}
              </span>
              {injDay && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: '#FDECEC', color: '#C47070' }}>
                  Injection Day
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onToggleNausea}
            aria-label={nauseaMode ? 'Disable nausea mode' : 'Enable nausea mode'}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-full transition-all duration-200 min-h-[44px]"
            style={{
              background: nauseaMode ? '#FDECEC' : '#F5F4F0',
              color: nauseaMode ? '#C47070' : '#9A9A9A',
            }}
          >
            <div className="w-7 h-4 rounded-full relative transition-all duration-200"
              style={{ background: nauseaMode ? '#C47070' : '#D1D1D1' }}>
              <div className="w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all duration-200"
                style={{ left: nauseaMode ? '15px' : '2px' }} />
            </div>
            Nausea
          </button>
        </div>

        {/* Day progress bar */}
        {totalEvents > 0 && (
          <div className="mt-3 mb-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-muted">{doneCount} of {totalEvents} tasks done</span>
              <span className="text-[11px] font-medium" style={{ color: dayPct === 100 ? '#7C8B6F' : '#C4956A' }}>{dayPct}%</span>
            </div>
            <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${dayPct === 100 ? 'celebrate' : ''}`}
                style={{
                  width: `${dayPct}%`,
                  backgroundColor: dayPct === 100 ? '#7C8B6F' : '#C4956A',
                }}
              />
            </div>
          </div>
        )}

        {nauseaMode && (
          <div className="mt-2 px-3 py-2 rounded-lg text-xs font-medium fade-in"
            style={{ background: '#FDECEC', color: '#C47070' }}>
            Nausea mode active — liquid meals only
          </div>
        )}

        {isZincDay && (
          <div className="mt-2 px-3 py-2 rounded-lg text-xs font-medium"
            style={{ background: '#FFF5ED', color: '#C4956A' }}>
            Zinc day — extra Zinc Picolinate capsule with dinner
          </div>
        )}

        <div className="flex items-center gap-4 mt-4">
          <ProteinRing consumed={proteinConsumed} target={MY_PROFILE.proteinTarget} />
          <HydrationCounter consumed={hydration} onAdd={onAddHydration} target={MY_PROFILE.hydrationTarget} />
        </div>
        <div className="flex justify-end mt-2">
          <button onClick={onRecalculate} className="btn-secondary text-xs min-h-[36px]">
            Recalculate
          </button>
        </div>
      </div>

      {/* Current Action */}
      <div className="px-5">
        {currentEvent && (
          <div className="mb-2" ref={currentRef}>
            <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Now</h2>
            <EventCard
              event={currentEvent}
              isCurrent={true}
              isCompleted={false}
              onComplete={onComplete}
              onSwapMeal={onSwapMeal}
              onCustomMeal={onCustomMeal}
              onSkipGym={onSkipGym}
            />
          </div>
        )}

        {/* Upcoming */}
        {upcomingEvents.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              Coming Up <span className="font-normal">({upcomingEvents.length})</span>
            </h2>
            <div className="card">
              {upcomingEvents.map((event, idx) => (
                <div key={event.id}>
                  {idx > 0 && <div className="border-t border-border" />}
                  <EventCard
                    event={event}
                    isCurrent={false}
                    isCompleted={false}
                    onComplete={onComplete}
                    onSwapMeal={onSwapMeal}
                    onCustomMeal={onCustomMeal}
                    onSkipGym={onSkipGym}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Done today */}
        {completedEvents.length > 0 && (
          <DoneSection
            completedEvents={completedEvents}
            onComplete={onComplete}
            onSwapMeal={onSwapMeal}
          />
        )}

        {events.length > 0 && doneCount === totalEvents && totalEvents > 0 && (
          <div className="card text-center py-6 mb-4 fade-in" style={{ background: '#F4F7F2' }}>
            <div className="text-2xl mb-2">Day complete</div>
            <div className="text-sm text-charcoal font-medium">{proteinConsumed}g protein across {completedEvents.filter(e => e.type === 'meal').length} meals</div>
            <div className="text-xs text-muted mt-1">Week {weekNum}, Day {dayOfWeek + 1}</div>
          </div>
        )}

        {events.length > 0 && completedEvents.length > 0 && doneCount < totalEvents && (
          <div className="text-center py-4 text-xs text-muted">
            {proteinConsumed}g protein so far across {completedEvents.filter(e => e.type === 'meal').length} meals
          </div>
        )}

        {events.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3 opacity-30">&#9737;</div>
            <div className="text-sm text-muted mb-1">No schedule generated yet</div>
            <div className="text-xs text-muted mb-4">Tap below to set your wake time and build today's plan</div>
            <button onClick={onRecalculate} className="btn-primary mx-auto" style={{ maxWidth: '200px' }}>
              Set Wake Time
            </button>
          </div>
        )}
      </div>

      {/* Sticky soaking reminder after 8 PM */}
      {isPastEight && soaking && !soakingDone && (
        <div className="fixed bottom-16 left-0 right-0 px-5 z-30">
          <div className="card max-w-lg mx-auto" style={{ borderLeft: '4px solid #C4956A', background: '#FFFCF5' }}>
            <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#C4956A' }}>Tonight's Prep</div>
            <div className="text-sm text-charcoal">{soaking.item}</div>
            <div className="text-xs text-muted mt-1">{soaking.instructions}</div>
          </div>
        </div>
      )}
    </div>
  );
}
