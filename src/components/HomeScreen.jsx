import { useState } from 'react';
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
    <div>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between w-full mb-2"
      >
        <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">
          Done Today ({completedEvents.length})
        </h2>
        <span className="text-xs text-muted">{collapsed ? 'Show' : 'Hide'}</span>
      </button>
      {!collapsed && (
        <div className="card fade-in">
          {completedEvents.map(event => (
            <EventCard
              key={event.id}
              event={event}
              isCurrent={false}
              isCompleted={true}
              onComplete={onComplete}
              onSwapMeal={onSwapMeal}
            />
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
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all duration-200"
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
          <HydrationCounter consumed={hydration} onAdd={onAddHydration} />
        </div>
        <div className="flex justify-end mt-2">
          <button onClick={onRecalculate} className="btn-secondary text-xs">
            Recalculate
          </button>
        </div>
      </div>

      {/* Current Action */}
      <div className="px-5">
        {currentEvent && (
          <div className="mb-2">
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
            <h2 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Coming Up</h2>
            <div className="card">
              {upcomingEvents.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  isCurrent={false}
                  isCompleted={false}
                  onComplete={onComplete}
                  onSwapMeal={onSwapMeal}
                  onCustomMeal={onCustomMeal}
                  onSkipGym={onSkipGym}
                />
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

        {events.length > 0 && completedEvents.length > 0 && (
          <div className="text-center py-6 text-sm text-muted">
            Today: {proteinConsumed}g protein across {completedEvents.filter(e => e.type === 'meal').length} meals. Week {weekNum}, Day {dayOfWeek + 1}.
          </div>
        )}

        {events.length === 0 && (
          <div className="text-center py-16 text-muted text-sm">
            No events for today. Tap Recalculate to set your wake time.
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
