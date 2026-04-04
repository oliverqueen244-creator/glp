import { useState } from 'react';
import { TRAINING_SCHEDULE } from '../data/profile';
import { getWeekNumber, isInjectionDay } from '../engine/dayGenerator';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function WakeModal({ onStart, defaultWakeTime = '07:00' }) {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const weekNum = getWeekNumber(dateStr);
  const training = TRAINING_SCHEDULE[dayOfWeek];
  const isTrainingDay = training.type === 'resistance';
  const injDay = isInjectionDay(dayOfWeek, weekNum);

  const dayNum = Math.max(1, Math.floor((now - new Date('2026-04-02')) / (1000 * 60 * 60 * 24)) + 1);
  const pct = Math.min(100, Math.round((dayNum / 90) * 100));
  const subtitle = injDay
    ? 'Injection day. Stay calm.'
    : dayOfWeek === 0
    ? 'Weekly monitoring today.'
    : `Day ${dayNum} of 90 — ${pct}% through.`;

  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const [wakeTime, setWakeTime] = useState(defaultWakeTime);
  const [customGym, setCustomGym] = useState(false);
  const [gymTime, setGymTime] = useState('18:00');
  const [travelMode, setTravelMode] = useState(false);

  const handleJustWoke = () => {
    const n = new Date();
    setWakeTime(`${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`);
  };

  const handleStart = () => {
    const [h, m] = wakeTime.split(':').map(Number);
    const wakeMinutes = h * 60 + m;
    let gymStartMinutes = null;
    if (customGym && isTrainingDay && !travelMode) {
      const [gh, gm] = gymTime.split(':').map(Number);
      gymStartMinutes = gh * 60 + gm;
    }
    onStart({ wakeMinutes, gymStartMinutes, travelMode });
  };

  return (
    <div className="fixed inset-0 bg-offwhite z-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm fade-in">
        <div className="text-center">
          <h1 className="font-serif text-3xl mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Good morning, Mac.
          </h1>
          <p className="text-muted text-sm mb-1">
            {DAY_NAMES[dayOfWeek]}, {MONTH_NAMES[now.getMonth()]} {now.getDate()}
          </p>
          <p className="text-muted text-sm mb-2">
            Week {weekNum}
          </p>
          <p className="text-xs text-amber mb-6">{subtitle}</p>
          <div className="inline-block px-4 py-1.5 rounded-full text-xs font-medium mb-10"
            style={{
              background: training.type === 'rest' ? '#EDF0F7' : '#FFF5ED',
              color: training.type === 'rest' ? '#8B9DC3' : '#C4956A',
            }}>
            {training.name}
          </div>

          <p className="text-charcoal font-medium mb-4">When did you wake up?</p>

          <input
            type="time"
            value={wakeTime}
            onChange={(e) => setWakeTime(e.target.value)}
            className="mb-3"
          />

          <button
            onClick={handleJustWoke}
            className="btn-secondary w-full mb-4"
          >
            I just woke up
          </button>

          <div className="mb-4">
            <button
              onClick={() => setTravelMode(!travelMode)}
              className="flex items-center justify-center gap-2 w-full text-sm text-muted mb-2"
            >
              <div className="w-7 h-4 rounded-full relative transition-all duration-200"
                style={{ background: travelMode ? '#C4956A' : '#D1D1D1' }}>
                <div className="w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all duration-200"
                  style={{ left: travelMode ? '15px' : '2px' }} />
              </div>
              Travel day (no cooking, no gym)
            </button>
            {travelMode && (
              <p className="text-xs text-amber fade-in">Survival protocol — packable meals + restaurant guide. Target: 120g protein.</p>
            )}
          </div>

          {isTrainingDay && !travelMode && (
            <div className="mb-4">
              <button
                onClick={() => setCustomGym(!customGym)}
                className="flex items-center justify-center gap-2 w-full text-sm text-muted mb-2"
              >
                <div className="w-7 h-4 rounded-full relative transition-all duration-200"
                  style={{ background: customGym ? '#7C8B6F' : '#D1D1D1' }}>
                  <div className="w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all duration-200"
                    style={{ left: customGym ? '15px' : '2px' }} />
                </div>
                Set custom gym time
              </button>
              {customGym && (
                <div className="fade-in">
                  <p className="text-xs text-muted mb-2">When are you going to the gym?</p>
                  <input
                    type="time"
                    value={gymTime}
                    onChange={(e) => setGymTime(e.target.value)}
                    className="mb-2"
                  />
                </div>
              )}
            </div>
          )}

          <button onClick={handleStart} className="btn-primary">
            Start My Day
          </button>
        </div>
      </div>
    </div>
  );
}
