import { useState, useEffect, useCallback } from 'react';
import { TRAINING_SCHEDULE } from '../data/profile';
import { WORKOUTS } from '../data/workouts';
import { useLocalStorage } from '../hooks/useLocalStorage';

function RestTimer({ seconds, onDismiss }) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) {
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      const timer = setTimeout(onDismiss, 3000);
      return () => clearTimeout(timer);
    }
    const timer = setInterval(() => setRemaining(r => r - 1), 1000);
    return () => clearInterval(timer);
  }, [remaining, onDismiss]);

  const mins = Math.floor(Math.max(0, remaining) / 60);
  const secs = Math.max(0, remaining) % 60;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center timer-overlay" onClick={onDismiss}>
      <div className="text-center">
        <div className="text-7xl font-light text-white mb-2" style={{ fontFamily: "'Inter', sans-serif", fontVariantNumeric: 'tabular-nums' }}>
          {mins}:{String(secs).padStart(2, '0')}
        </div>
        <div className="text-white/60 text-sm">
          {remaining <= 0 ? 'Rest complete' : 'Tap anywhere to dismiss'}
        </div>
      </div>
    </div>
  );
}

function ExerciseCard({ exercise, exerciseIndex, completedSets, onCompleteSet, onStartTimer, weightLog, onLogWeight }) {
  const [showInstructions, setShowInstructions] = useState(false);
  const totalSets = exercise.sets;
  const doneSets = completedSets[exerciseIndex] || 0;

  const prevWeight = weightLog?.[exercise.name];

  return (
    <div className="card mb-3">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-base font-semibold text-charcoal pr-2">{exercise.name}</h3>
        <span className="text-xs text-muted shrink-0">{exercise.muscleGroup}</span>
      </div>

      <div className="text-sm text-muted mb-3">
        {totalSets} sets x {exercise.reps} reps | Rest: {exercise.rest}s
      </div>

      {/* Set tracker */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-muted mr-1">Sets:</span>
        {Array.from({ length: totalSets }, (_, i) => (
          <div key={i} className="w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all duration-200"
            style={{
              backgroundColor: i < doneSets ? '#7C8B6F' : '#F0EEEA',
              color: i < doneSets ? 'white' : '#9A9A9A',
            }}>
            {i < doneSets ? (
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              i + 1
            )}
          </div>
        ))}
        <span className="text-xs text-muted ml-2">{doneSets}/{totalSets}</span>
      </div>

      {/* Weight input */}
      <div className="flex items-center gap-2 mb-3">
        <label className="text-xs text-muted">Weight:</label>
        <input
          type="number"
          className="w-20 text-sm px-2 py-1.5 rounded-lg bg-offwhite border border-border text-charcoal"
          placeholder={exercise.startingWeight}
          value={weightLog?.[exercise.name] || ''}
          onChange={e => onLogWeight(exercise.name, e.target.value)}
        />
        <span className="text-xs text-muted">kg</span>
        {prevWeight && (
          <span className="text-xs text-sage ml-auto">Last: {prevWeight} kg</span>
        )}
      </div>

      <div className="flex gap-2">
        {doneSets < totalSets && (
          <>
            <button
              onClick={() => {
                onCompleteSet(exerciseIndex);
                if (doneSets + 1 < totalSets) {
                  onStartTimer(exercise.rest);
                }
              }}
              className="btn-primary flex-1 py-3 text-sm"
            >
              Complete Set {doneSets + 1}
            </button>
          </>
        )}
        {doneSets >= totalSets && (
          <div className="w-full text-center py-3 text-sm font-medium text-sage">
            All sets complete
          </div>
        )}
      </div>

      <button onClick={() => setShowInstructions(!showInstructions)} className="w-full text-left mt-2 text-xs text-muted">
        {showInstructions ? 'Hide instructions' : 'How to do this exercise'}
      </button>
      {showInstructions && (
        <div className="mt-2 text-xs text-muted bg-offwhite rounded-lg p-3 fade-in">
          {exercise.instructions}
          <div className="mt-1 text-amber">Starting weight suggestion: {exercise.startingWeight}</div>
        </div>
      )}
    </div>
  );
}

export default function WorkoutScreen() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const training = TRAINING_SCHEDULE[dayOfWeek];
  const workout = WORKOUTS[training.name];

  const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const [completedSets, setCompletedSets] = useLocalStorage(`workout-sets-${dateKey}`, {});
  const [weightLog, setWeightLog] = useLocalStorage('weight-log', {});
  const [timerSeconds, setTimerSeconds] = useState(null);
  const [showWarmup, setShowWarmup] = useState(false);
  const [showCooldown, setShowCooldown] = useState(false);
  const [currentRound, setCurrentRound] = useLocalStorage(`circuit-round-${dateKey}`, 1);

  const handleCompleteSet = useCallback((exerciseIdx) => {
    setCompletedSets(prev => ({
      ...prev,
      [exerciseIdx]: (prev[exerciseIdx] || 0) + 1,
    }));
  }, [setCompletedSets]);

  const handleLogWeight = useCallback((name, val) => {
    setWeightLog(prev => ({ ...prev, [name]: val }));
  }, [setWeightLog]);

  if (!workout) {
    return (
      <div className="px-5 pt-5 pb-24">
        <h1 className="text-xl font-semibold text-charcoal mb-2">{training.name}</h1>
        <p className="text-sm text-muted">No structured workout data available for today.</p>
      </div>
    );
  }

  const isCircuit = workout.isCircuit || false;
  const totalExercises = workout.exercises.length;
  const allDone = workout.exercises.every((ex, i) => (completedSets[i] || 0) >= ex.sets);

  return (
    <div className="px-5 pt-5 pb-24">
      <h1 className="text-xl font-semibold text-charcoal mb-1">{training.name}</h1>
      <p className="text-sm text-muted mb-5">
        {totalExercises} exercises
        {workout.cardio ? ' + 25 min cardio' : ''}
      </p>

      {/* Warmup */}
      {workout.warmup && workout.warmup.length > 0 && (
        <div className="mb-4">
          <button onClick={() => setShowWarmup(!showWarmup)} className="w-full card flex items-center justify-between">
            <span className="text-sm font-medium text-charcoal">Warmup</span>
            <span className="text-xs text-muted">{showWarmup ? 'Hide' : 'Show'}</span>
          </button>
          {showWarmup && (
            <div className="card mt-1 fade-in">
              {workout.warmup.map((w, i) => (
                <div key={i} className="py-2 text-sm">
                  <div className="font-medium text-charcoal">{w.name} — {w.duration}</div>
                  <div className="text-xs text-muted">{w.instructions}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Circuit indicator */}
      {isCircuit && (
        <div className="card mb-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-charcoal">Circuit Mode</div>
            <div className="text-xs text-muted">{workout.rounds} rounds, {workout.restBetweenRounds}s rest between</div>
          </div>
          <div className="text-lg font-semibold text-amber">Round {currentRound}/{workout.rounds}</div>
        </div>
      )}

      {/* Exercises */}
      {workout.exercises.map((exercise, i) => (
        <ExerciseCard
          key={i}
          exercise={exercise}
          exerciseIndex={i}
          completedSets={completedSets}
          onCompleteSet={handleCompleteSet}
          onStartTimer={setTimerSeconds}
          weightLog={weightLog}
          onLogWeight={handleLogWeight}
        />
      ))}

      {/* Circuit round advance */}
      {isCircuit && allDone && currentRound < workout.rounds && (
        <button
          onClick={() => {
            setCurrentRound(r => r + 1);
            setCompletedSets({});
            setTimerSeconds(workout.restBetweenRounds);
          }}
          className="btn-primary mb-4"
        >
          Start Round {currentRound + 1}
        </button>
      )}

      {/* Cardio */}
      {workout.cardio && (
        <div className="card mb-4">
          <h3 className="text-base font-semibold text-charcoal mb-1">{workout.cardio.name}</h3>
          <div className="text-sm text-muted">{workout.cardio.duration} | Target HR: {workout.cardio.targetHR}</div>
          <div className="text-xs text-muted mt-1">{workout.cardio.instructions}</div>
        </div>
      )}

      {/* Cooldown */}
      {workout.cooldown && workout.cooldown.length > 0 && (
        <div className="mb-4">
          <button onClick={() => setShowCooldown(!showCooldown)} className="w-full card flex items-center justify-between">
            <span className="text-sm font-medium text-charcoal">Cooldown Stretches</span>
            <span className="text-xs text-muted">{showCooldown ? 'Hide' : 'Show'}</span>
          </button>
          {showCooldown && (
            <div className="card mt-1 fade-in">
              {workout.cooldown.map((c, i) => (
                <div key={i} className="py-1.5 text-sm flex justify-between">
                  <span className="text-charcoal">{c.name}</span>
                  <span className="text-muted text-xs">{c.duration}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Rest Timer Overlay */}
      {timerSeconds !== null && (
        <RestTimer seconds={timerSeconds} onDismiss={() => setTimerSeconds(null)} />
      )}
    </div>
  );
}
