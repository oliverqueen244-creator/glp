import { useState, useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { generateDay } from './engine/dayGenerator';
import { MEALS_MAP } from './data/meals';
import WakeModal from './components/WakeModal';
import HomeScreen from './components/HomeScreen';
import SupplementScreen from './components/SupplementScreen';
import WorkoutScreen from './components/WorkoutScreen';
import SettingsScreen from './components/SettingsScreen';
import BottomNav from './components/BottomNav';

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function App() {
  const todayKey = getTodayKey();
  const [activeTab, setActiveTab] = useState('home');
  const [wakeTime, setWakeTime] = useLocalStorage(`wake-${todayKey}`, null);
  const [events, setEvents] = useLocalStorage(`events-${todayKey}`, []);
  const [completedIds, setCompletedIds] = useLocalStorage(`completed-${todayKey}`, []);
  const [completedSupplements, setCompletedSupplements] = useLocalStorage(`supps-${todayKey}`, []);
  const [nauseaMode, setNauseaMode] = useLocalStorage(`nausea-${todayKey}`, false);
  const [settings, setSettings] = useLocalStorage('protocol-settings', {
    defaultWakeTime: '07:00',
    workStart: '09:00',
    workEnd: '18:00',
    currentWeight: 183,
  });
  const [showWakeModal, setShowWakeModal] = useState(wakeTime === null);

  const regenerateDay = useCallback((wakeMinutes, nausea = nauseaMode) => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startDate = new Date('2026-04-02');
    const weekNum = Math.max(1, Math.floor((now - startDate) / (1000 * 60 * 60 * 24 * 7)) + 1);

    const [wh, wm] = (settings.workEnd || '18:00').split(':').map(Number);
    const workEndMinutes = wh * 60 + wm;

    const dayEvents = generateDay(wakeMinutes, dayOfWeek, weekNum, nausea, workEndMinutes);
    setEvents(dayEvents);
  }, [nauseaMode, settings.workEnd, setEvents]);

  const handleWakeStart = useCallback((wakeMinutes) => {
    setWakeTime(wakeMinutes);
    regenerateDay(wakeMinutes);
    setShowWakeModal(false);
  }, [setWakeTime, regenerateDay]);

  const handleComplete = useCallback((eventId) => {
    setCompletedIds(prev => {
      if (prev.includes(eventId)) return prev;
      return [...prev, eventId];
    });
  }, [setCompletedIds]);

  const handleSwapMeal = useCallback((eventId, newMealId) => {
    const newMeal = MEALS_MAP[newMealId];
    if (!newMeal) return;
    setEvents(prev => prev.map(e => {
      if (e.id !== eventId) return e;
      return {
        ...e,
        title: `Meal ${e.mealNum}: ${newMeal.name}`,
        mealId: newMealId,
        protein: newMeal.protein,
        calories: newMeal.calories,
        cookTime: newMeal.cookTime,
      };
    }));
  }, [setEvents]);

  const handleToggleNausea = useCallback(() => {
    const newNausea = !nauseaMode;
    setNauseaMode(newNausea);
    if (wakeTime !== null) {
      regenerateDay(wakeTime, newNausea);
    }
  }, [nauseaMode, wakeTime, setNauseaMode, regenerateDay]);

  const handleToggleSupplement = useCallback((suppId) => {
    setCompletedSupplements(prev =>
      prev.includes(suppId) ? prev.filter(id => id !== suppId) : [...prev, suppId]
    );
  }, [setCompletedSupplements]);

  const handleRecalculate = useCallback(() => {
    setShowWakeModal(true);
  }, []);

  const handleUpdateSettings = useCallback((updates) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, [setSettings]);

  const handleResetToday = useCallback(() => {
    setCompletedIds([]);
    setCompletedSupplements([]);
  }, [setCompletedIds, setCompletedSupplements]);

  const handleResetAll = useCallback(() => {
    localStorage.clear();
    window.location.reload();
  }, []);

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }

  if (showWakeModal) {
    return <WakeModal onStart={handleWakeStart} />;
  }

  return (
    <div className="min-h-screen bg-offwhite max-w-lg mx-auto relative">
      {activeTab === 'home' && (
        <HomeScreen
          events={events}
          completedIds={completedIds}
          onComplete={handleComplete}
          onSwapMeal={handleSwapMeal}
          nauseaMode={nauseaMode}
          onToggleNausea={handleToggleNausea}
          onRecalculate={handleRecalculate}
        />
      )}
      {activeTab === 'supplements' && (
        <SupplementScreen
          completedSupplements={completedSupplements}
          onToggleSupplement={handleToggleSupplement}
          nauseaMode={nauseaMode}
        />
      )}
      {activeTab === 'workout' && <WorkoutScreen />}
      {activeTab === 'settings' && (
        <SettingsScreen
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onResetToday={handleResetToday}
          onResetAll={handleResetAll}
        />
      )}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
