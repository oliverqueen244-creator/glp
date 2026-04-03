import { useState } from 'react';
import { TRAINING_SCHEDULE } from '../data/profile';
import { getWeekNumber } from '../engine/dayGenerator';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function WakeModal({ onStart }) {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const weekNum = getWeekNumber(dateStr);
  const training = TRAINING_SCHEDULE[dayOfWeek];

  const defaultTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const [wakeTime, setWakeTime] = useState('07:00');

  const handleJustWoke = () => {
    setWakeTime(defaultTime);
  };

  const handleStart = () => {
    const [h, m] = wakeTime.split(':').map(Number);
    onStart(h * 60 + m);
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
          <p className="text-muted text-sm mb-8">
            Week {weekNum}
          </p>
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

          <button onClick={handleStart} className="btn-primary">
            Start My Day
          </button>
        </div>
      </div>
    </div>
  );
}
