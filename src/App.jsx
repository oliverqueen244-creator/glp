import { useState, useCallback, useEffect } from 'react';
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
  const [hydration, setHydration] = useLocalStorage(`hydration-${todayKey}`, 0);
  const [gymOverride, setGymOverride] = useLocalStorage(`gym-${todayKey}`, null);
  const [settings, setSettings] = useLocalStorage('protocol-settings', {
    defaultWakeTime: '07:00',
    workStart: '09:00',
    workEnd: '18:00',
    currentWeight: 183,
  });
  const [showWakeModal, setShowWakeModal] = useState(wakeTime === null);

  const regenerateDay = useCallback((wakeMinutes, nausea = nauseaMode, gymStart = gymOverride) => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startDate = new Date('2026-04-02');
    const weekNum = Math.max(1, Math.floor((now - startDate) / (1000 * 60 * 60 * 24 * 7)) + 1);

    const [wh, wm] = (settings.workEnd || '18:00').split(':').map(Number);
    const workEndMinutes = wh * 60 + wm;

    const dayEvents = generateDay(wakeMinutes, dayOfWeek, weekNum, nausea, workEndMinutes, gymStart);
    setEvents(dayEvents);
  }, [nauseaMode, gymOverride, settings.workEnd, setEvents]);

  const handleWakeStart = useCallback(({ wakeMinutes, gymStartMinutes }) => {
    setWakeTime(wakeMinutes);
    if (gymStartMinutes !== null) {
      setGymOverride(gymStartMinutes);
    }
    regenerateDay(wakeMinutes, nauseaMode, gymStartMinutes);
    setShowWakeModal(false);
  }, [setWakeTime, setGymOverride, nauseaMode, regenerateDay]);

  const handleComplete = useCallback((eventId) => {
    setCompletedIds(prev => {
      if (prev.includes(eventId)) return prev.filter(id => id !== eventId);
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

  const handleCustomMeal = useCallback((eventId, name, protein) => {
    setEvents(prev => prev.map(e => {
      if (e.id !== eventId) return e;
      return {
        ...e,
        title: `Meal ${e.mealNum}: ${name}`,
        mealId: null,
        protein,
        calories: 0,
        cookTime: 0,
      };
    }));
    handleComplete(eventId);
  }, [setEvents, handleComplete]);

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

  const handleSkipGym = useCallback(() => {
    setEvents(prev => prev.filter(e =>
      e.type !== 'training' || e.trainingType === 'rest'
    ).filter(e =>
      e.type !== 'travel'
    ).filter(e =>
      !(e.type === 'supplement' && e.title === 'Post-Training ORS')
    ));
  }, [setEvents]);

  const handleAddHydration = useCallback((ml) => {
    setHydration(prev => prev + ml);
  }, [setHydration]);

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

  const [installPrompt, setInstallPrompt] = useState(null);

  // Register service worker + capture install prompt
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Midnight auto-refresh: detect date change when app returns to foreground
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && getTodayKey() !== todayKey) {
        window.location.reload();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [todayKey]);

  if (showWakeModal) {
    return <WakeModal onStart={handleWakeStart} defaultWakeTime={settings.defaultWakeTime} />;
  }

  return (
    <div className="min-h-screen bg-offwhite max-w-lg mx-auto relative">
      {activeTab === 'home' && (
        <HomeScreen
          events={events}
          completedIds={completedIds}
          onComplete={handleComplete}
          onSwapMeal={handleSwapMeal}
          onCustomMeal={handleCustomMeal}
          onSkipGym={handleSkipGym}
          hydration={hydration}
          onAddHydration={handleAddHydration}
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
          installPrompt={installPrompt}
          onInstalled={() => setInstallPrompt(null)}
        />
      )}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
