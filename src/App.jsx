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
import FeelingCheck from './components/FeelingCheck';
import ToastContainer, { showToast } from './components/Toast';
import { isInjectionDay, getWeekNumber } from './engine/dayGenerator';
import { MY_SUPPLEMENTS } from './data/supplements';

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
  const [travelMode, setTravelMode] = useLocalStorage(`travel-${todayKey}`, false);
  const [settings, setSettings] = useLocalStorage('protocol-settings', {
    defaultWakeTime: '07:00',
    workStart: '09:00',
    workEnd: '18:00',
    currentWeight: 183,
    targetSleepTime: '22:00',
  });
  const [showWakeModal, setShowWakeModal] = useState(wakeTime === null);
  const [showFeelingCheck, setShowFeelingCheck] = useState(false);
  const [feelingMessage, setFeelingMessage] = useState(null);

  const regenerateDay = useCallback((wakeMinutes, nausea = nauseaMode, gymStart = gymOverride, travel = travelMode) => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startDate = new Date('2026-04-02');
    const weekNum = Math.max(1, Math.floor((now - startDate) / (1000 * 60 * 60 * 24 * 7)) + 1);

    const [wh, wm] = (settings.workEnd || '18:00').split(':').map(Number);
    const workEndMinutes = wh * 60 + wm;

    const [sh, sm] = (settings.targetSleepTime || '22:00').split(':').map(Number);
    const sleepMinutes = sh * 60 + sm;

    const dayEvents = generateDay(wakeMinutes, dayOfWeek, weekNum, nausea, workEndMinutes, gymStart, travel, sleepMinutes);
    setEvents(dayEvents);
  }, [nauseaMode, gymOverride, travelMode, settings.workEnd, settings.targetSleepTime, setEvents]);

  const handleWakeStart = useCallback(({ wakeMinutes, gymStartMinutes, travelMode: travel }) => {
    setWakeTime(wakeMinutes);
    if (gymStartMinutes !== null) {
      setGymOverride(gymStartMinutes);
    }
    setTravelMode(travel || false);
    setCompletedIds([]);
    regenerateDay(wakeMinutes, nauseaMode, gymStartMinutes, travel || false);
    setShowWakeModal(false);
  }, [setWakeTime, setGymOverride, setTravelMode, setCompletedIds, nauseaMode, regenerateDay]);

  const handleComplete = useCallback((eventId) => {
    setCompletedIds(prev => {
      if (prev.includes(eventId)) {
        showToast('Unmarked', 'info');
        return prev.filter(id => id !== eventId);
      }
      const event = events.find(e => e.id === eventId);
      if (event?.protein > 0) {
        showToast(`+${event.protein}g protein logged`, 'success');
      } else {
        showToast('Done', 'success');
      }
      return [...prev, eventId];
    });
  }, [setCompletedIds, events]);

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
    setCompletedSupplements(prev => {
      if (prev.includes(suppId)) {
        return prev.filter(id => id !== suppId);
      }
      const supp = MY_SUPPLEMENTS.find(s => s.id === suppId);
      showToast(supp ? `${supp.name} taken` : 'Supplement taken', 'success');
      return [...prev, suppId];
    });
  }, [setCompletedSupplements]);

  const handleSkipGym = useCallback(() => {
    setEvents(prev => {
      const trainingEvent = prev.find(e => e.type === 'training' && e.trainingType !== 'rest');
      const filtered = prev.filter(e =>
        (e.type !== 'training' || e.trainingType === 'rest') &&
        e.type !== 'travel' &&
        !(e.type === 'supplement' && e.title === 'Post-Training ORS')
      );
      if (trainingEvent) {
        filtered.push({
          id: `home-${Date.now()}`,
          time: trainingEvent.time,
          timeStr: trainingEvent.timeStr,
          type: 'training',
          trainingType: 'home',
          title: 'Home Workout (Gym Skipped)',
          description: '20 min bodyweight circuit: 3x10 wall push-ups, 3x10 bodyweight squats to chair, 3x10 glute bridges, 3x30sec plank on knees. Or just walk 30 minutes.',
          duration: 20,
        });
        filtered.sort((a, b) => a.time - b.time);
      }
      return filtered;
    });
  }, [setEvents]);

  const handleAddHydration = useCallback((ml) => {
    setHydration(prev => {
      const next = prev + ml;
      if (prev < 3500 && next >= 3500) {
        showToast('Hydration target reached!', 'success');
      }
      return next;
    });
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

  // Post-injection feeling check (day after injection)
  useEffect(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yDay = yesterday.getDay();
    const yDateStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    const yWeek = getWeekNumber(yDateStr);
    if (isInjectionDay(yDay, yWeek)) {
      const checked = localStorage.getItem(`feeling-${todayKey}`);
      if (!checked && wakeTime !== null) {
        setShowFeelingCheck(true);
      }
    }
  }, [todayKey, wakeTime]);

  const handleFeelingResponse = useCallback((key, action, message) => {
    localStorage.setItem(`feeling-${todayKey}`, key);
    if (action === 'nausea-mode' && !nauseaMode) {
      handleToggleNausea();
    }
    setShowFeelingCheck(false);
    if (message) {
      setFeelingMessage(message);
      setTimeout(() => setFeelingMessage(null), 5000);
    }
  }, [todayKey, nauseaMode, handleToggleNausea]);

  // Clean up localStorage keys older than 14 days
  useEffect(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 14);
    const cutoffKey = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, '0')}-${String(cutoff.getDate()).padStart(2, '0')}`;
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      const dateMatch = key?.match(/-(\d{4}-\d{2}-\d{2})$/);
      if (dateMatch && dateMatch[1] < cutoffKey) {
        localStorage.removeItem(key);
      }
    }
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

  if (showFeelingCheck) {
    return <FeelingCheck onRespond={handleFeelingResponse} />;
  }

  if (showWakeModal) {
    return <WakeModal onStart={handleWakeStart} defaultWakeTime={settings.defaultWakeTime} />;
  }

  return (
    <div className="min-h-screen bg-offwhite max-w-lg mx-auto relative">
      <ToastContainer />
      {feelingMessage && (
        <div className="px-5 pt-3 fade-in">
          <div className="px-3 py-2 rounded-lg text-xs font-medium"
            style={{ background: '#FDECEC', color: '#C47070' }}>
            {feelingMessage}
          </div>
        </div>
      )}
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
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        supplementsRemaining={
          MY_SUPPLEMENTS.filter(s => {
            if (nauseaMode && s.disableOnNausea) return false;
            if (!s.daily && s.days && !s.days.includes(new Date().getDay())) return false;
            return true;
          }).filter(s => !completedSupplements.includes(s.id)).length
        }
      />
    </div>
  );
}
