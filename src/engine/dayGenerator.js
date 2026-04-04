import { MY_PROFILE, TRAINING_SCHEDULE, WEEKLY_MENU, SOAKING_SCHEDULE } from '../data/profile';
import { MY_SUPPLEMENTS } from '../data/supplements';
import { MEALS_MAP } from '../data/meals';

function minutesSinceMidnight(h, m) {
  return h * 60 + m;
}

function timeFromMinutes(mins) {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatTime12(mins) {
  const h24 = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function getWeekNumber(dateStr) {
  const start = new Date('2026-04-02');
  const current = new Date(dateStr);
  const diff = Math.floor((current - start) / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.floor(diff / 7) + 1);
}

export function getCurrentDose(weekNum) {
  for (const entry of MY_PROFILE.medication.doseSchedule) {
    if (entry.weeks.includes(weekNum)) return entry.dose;
  }
  return MY_PROFILE.medication.doseSchedule[MY_PROFILE.medication.doseSchedule.length - 1].dose;
}

export function getInjectionSite(weekNum) {
  const idx = (weekNum - 1) % MY_PROFILE.medication.injectionRotation.length;
  return MY_PROFILE.medication.injectionRotation[idx];
}

export function isInjectionDay(dayOfWeek, weekNum) {
  if (weekNum === 1) return dayOfWeek === 4; // Thursday for week 1
  return dayOfWeek === MY_PROFILE.medication.injectionDay; // Wednesday from week 2
}

function getSupplementsForTiming(timing, dayOfWeek, nauseaMode) {
  return MY_SUPPLEMENTS.filter(s => {
    if (s.timing !== timing) return false;
    if (nauseaMode && s.disableOnNausea) return false;
    if (!s.daily && s.days && !s.days.includes(dayOfWeek)) return false;
    return true;
  });
}

export function generateDay(wakeTimeMinutes, dayOfWeek, weekNum, nauseaMode = false, workEndMinutes = null, gymStartMinutes = null, travelMode = false, targetSleepMinutes = 1320) {
  const events = [];
  const training = TRAINING_SCHEDULE[dayOfWeek];
  const menu = WEEKLY_MENU[dayOfWeek];
  const isRest = training.type === 'rest';
  const isLateWake = wakeTimeMinutes >= 600; // 10:00 AM
  const isVeryLateWake = wakeTimeMinutes >= 720; // 12:00 PM

  const addEvent = (time, type, title, extra = {}) => {
    const id = `${type}-${extra.mealNum || extra.trainingType || title.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20)}-${time}`;
    events.push({
      id,
      time,
      timeStr: formatTime12(time),
      type,
      title,
      ...extra,
    });
  };

  // TRAVEL DAY — survival protocol
  if (travelMode) {
    const injDay = isInjectionDay(dayOfWeek, weekNum);
    if (injDay) {
      addEvent(wakeTimeMinutes, 'injection', 'Mounjaro Injection', {
        dose: getCurrentDose(weekNum), site: getInjectionSite(weekNum), isInjection: true,
      });
    }
    addEvent(wakeTimeMinutes + 15, 'supplement', 'ORS + Morning Supplements', {
      description: 'ORS in 500ml bottle. Pack pill organizer: Chromium, D3+K2, Vit C+Zinc.',
      supplements: getSupplementsForTiming('wake', dayOfWeek, nauseaMode),
    });
    addEvent(wakeTimeMinutes + 30, 'meal', 'Travel Meal 1: Dry Whey Pack', {
      mealNum: 1, mealId: 'travel-whey', protein: 24, calories: 120, cookTime: 1,
    });
    addEvent(wakeTimeMinutes + 180, 'meal', 'Travel Meal 2: Boiled Eggs + Paneer', {
      mealNum: 2, mealId: 'travel-eggs', protein: 30, calories: 390, cookTime: 0,
      description: 'Packed boiled eggs + paneer cubes with chaat masala.',
    });
    addEvent(wakeTimeMinutes + 360, 'meal', 'Travel Meal 3: Restaurant Protein', {
      mealNum: 3, mealId: 'travel-restaurant', protein: 25, calories: 350, cookTime: 0,
      description: 'Find restaurant: order paneer tikka or egg bhurji + dal. Skip roti/rice.',
    });
    addEvent(wakeTimeMinutes + 540, 'meal', 'Travel Meal 4: Whey Pack', {
      mealNum: 4, mealId: 'travel-whey', protein: 24, calories: 120, cookTime: 1,
    });
    addEvent(wakeTimeMinutes + 600, 'walk', 'Walk if possible — 30 min', {
      duration: 30, description: 'Walk at airport, hotel, or around destination. Any movement counts.',
    });
    addEvent(Math.min(wakeTimeMinutes + 720, targetSleepMinutes - 60), 'supplement', 'Bedtime Supplements', {
      description: 'Magnesium at hotel/home.',
      supplements: getSupplementsForTiming('bedtime', dayOfWeek, nauseaMode),
    });
    addEvent(targetSleepMinutes, 'sleep', 'Sleep Target', {
      description: 'Travel is tiring. Get sleep. Resume protocol tomorrow.',
    });
    return events.sort((a, b) => a.time - b.time);
  }

  // Injection day
  const injDay = isInjectionDay(dayOfWeek, weekNum);
  if (injDay) {
    addEvent(wakeTimeMinutes, 'injection', 'Mounjaro Injection', {
      dose: getCurrentDose(weekNum),
      site: getInjectionSite(weekNum),
      isInjection: true,
    });
  }

  // Wake + ORS
  addEvent(wakeTimeMinutes + 15, 'supplement', 'ORS + Box Breathing', {
    description: 'Pour ORS into 500ml bottle, top with water. 4-count box breathing: inhale 4s, hold 4s, exhale 4s, hold 4s. 5 rounds.',
    supplements: getSupplementsForTiming('wake', dayOfWeek, nauseaMode),
  });

  // Sunday monitoring
  if (dayOfWeek === 0) {
    addEvent(wakeTimeMinutes + 20, 'monitoring', 'Weekly Monitoring', {
      description: 'Weigh yourself (fasted). Measure waist at navel. Blood pressure if available. Progress photos (front, side).',
    });
  }

  let meal1Time = wakeTimeMinutes + 30;

  // MEAL 1
  const meal1Id = nauseaMode ? 'nausea-meal-1' : menu.meal1;
  const meal1Data = MEALS_MAP[meal1Id];
  addEvent(meal1Time, 'meal', `Meal 1: ${meal1Data?.name || 'Breakfast'}`, {
    mealNum: 1,
    mealId: meal1Id,
    protein: meal1Data?.protein || 0,
    calories: meal1Data?.calories || 0,
    cookTime: meal1Data?.cookTime || 0,
    supplements: getSupplementsForTiming('meal-1', dayOfWeek, nauseaMode),
  });

  // Walk 1
  addEvent(meal1Time + 15, 'walk', 'Walk — 10 min post-meal', {
    duration: 10,
    description: 'Brisk walk. Aids digestion and glucose disposal.',
  });

  // Calculate meal times based on wake and target sleep
  // Work backwards from sleep: sleep → meal6 → bedtime supps → meal5
  const sleepTarget = targetSleepMinutes;
  let meal2Time, meal3Time, meal4Time, meal5Time, meal6Time;

  // Meal 6 = 60 min before sleep, Meal 5 = 150 min before meal 6
  const defaultMeal6 = sleepTarget - 60;
  const defaultMeal5 = defaultMeal6 - 150;

  if (isVeryLateWake) {
    // 4 meals max
    meal2Time = meal1Time + 120;
    meal3Time = meal2Time + 90;
    meal5Time = Math.max(meal3Time + 120, defaultMeal5);
    meal6Time = Math.max(meal5Time + 150, defaultMeal6);
    meal4Time = null;
  } else if (isLateWake) {
    // Merge meal 2+3
    meal2Time = meal1Time + 120;
    meal3Time = null; // merged into meal2
    meal4Time = meal2Time + 150;
    meal5Time = Math.max(meal4Time + 150, defaultMeal5);
    meal6Time = Math.max(meal5Time + 150, defaultMeal6);
  } else {
    // Normal day — anchor evening meals from sleep target
    meal2Time = meal1Time + 165;
    meal3Time = meal2Time + 90;
    meal5Time = Math.max(defaultMeal5, meal1Time + 690);
    meal6Time = Math.max(defaultMeal6, meal5Time + 150);

    if (isRest) {
      meal4Time = meal3Time + 120; // no gym, shorter gap
    } else {
      // Training block
      let trainingStart;
      if (gymStartMinutes) {
        trainingStart = gymStartMinutes;
        // Shift meal 3 to 30 min before gym
        meal3Time = gymStartMinutes - 30;
      } else {
        trainingStart = workEndMinutes ? Math.max(workEndMinutes, meal3Time + 20) : meal3Time + 20;
      }
      const trainingEnd = trainingStart + 120;
      meal4Time = trainingEnd + 15;
    }

    // Ensure meal5 has at least 120min gap from meal4
    if (meal4Time && meal5Time - meal4Time < 120) {
      meal5Time = meal4Time + 150;
    }
    if (meal6Time - meal5Time < 120) {
      meal6Time = meal5Time + 150;
    }
  }

  // MEAL 2
  if (meal2Time) {
    const meal2Id = nauseaMode ? 'nausea-meal-2' : menu.meal2;
    const meal2Data = MEALS_MAP[meal2Id];
    const meal2Label = isLateWake && !isVeryLateWake ? 'Meal 2+3: Combined' : 'Meal 2';
    addEvent(meal2Time, 'meal', `${meal2Label}: ${meal2Data?.name || 'Mid-Morning'}`, {
      mealNum: 2,
      mealId: meal2Id,
      protein: meal2Data?.protein || 0,
      calories: meal2Data?.calories || 0,
      cookTime: meal2Data?.cookTime || 0,
      supplements: [
        ...getSupplementsForTiming('meal-2', dayOfWeek, nauseaMode),
        ...(isLateWake ? getSupplementsForTiming('meal-3', dayOfWeek, nauseaMode) : []),
      ],
    });

    addEvent(meal2Time + 15, 'walk', 'Walk — 10 min post-meal', {
      duration: 10,
      description: 'Brisk walk after meal.',
    });
  }

  // ISABGOL 1 (before meal 3)
  if (meal3Time && !nauseaMode) {
    addEvent(meal3Time - 30, 'supplement', 'Isabgol — 5g in 300ml water', {
      description: 'Stir FAST, drink IMMEDIATELY before it gels.',
      supplements: getSupplementsForTiming('pre-meal-3', dayOfWeek, nauseaMode),
    });
  }

  // MEAL 3 (pre-workout shake)
  if (meal3Time) {
    const meal3Id = nauseaMode ? 'nausea-meal-3' : 'power-shake';
    const meal3Data = MEALS_MAP[meal3Id];
    addEvent(meal3Time, 'meal', `Meal 3: ${meal3Data?.name || 'Pre-Workout Shake'}`, {
      mealNum: 3,
      mealId: meal3Id,
      protein: meal3Data?.protein || 0,
      calories: meal3Data?.calories || 0,
      cookTime: meal3Data?.cookTime || 0,
      supplements: getSupplementsForTiming('meal-3', dayOfWeek, nauseaMode),
    });
  }

  // TRAINING BLOCK
  if (!isRest) {
    let trainingStart;
    if (gymStartMinutes) {
      trainingStart = gymStartMinutes;
    } else {
      trainingStart = workEndMinutes
        ? Math.max(workEndMinutes, (meal3Time || meal2Time) + 20)
        : (meal3Time || meal2Time) + 20;
    }

    if (!isVeryLateWake || trainingStart < 1320) { // Don't add training after 10 PM
      addEvent(trainingStart - 10, 'travel', 'Travel to Gym', {
        description: 'Get your gym bag. Pre-workout shake should be settling.',
      });

      addEvent(trainingStart, 'training', training.name, {
        duration: 120,
        trainingType: training.type,
        workoutName: training.name,
      });

      addEvent(trainingStart + 120, 'supplement', 'Post-Training ORS', {
        description: 'Pour ORS into 500ml bottle. Sip over next hour.',
        supplements: getSupplementsForTiming('post-training', dayOfWeek, nauseaMode),
      });
    }
  } else {
    // Rest day LISS walk
    const lissTime = meal3Time ? meal3Time + 60 : meal2Time + 60;
    addEvent(lissTime, 'training', training.name, {
      duration: 45,
      trainingType: 'rest',
      workoutName: training.name,
    });
  }

  // MEAL 4 (post-workout)
  if (meal4Time) {
    const meal4Id = nauseaMode ? 'nausea-meal-4' : menu.meal4;
    const meal4Data = MEALS_MAP[meal4Id];
    addEvent(meal4Time, 'meal', `Meal 4: ${meal4Data?.name || 'Post-Workout'}`, {
      mealNum: 4,
      mealId: meal4Id,
      protein: meal4Data?.protein || 0,
      calories: meal4Data?.calories || 0,
      cookTime: meal4Data?.cookTime || 0,
      supplements: getSupplementsForTiming('meal-4', dayOfWeek, nauseaMode),
    });

    addEvent(meal4Time + 15, 'walk', 'Walk — 10 min post-meal', {
      duration: 10,
      description: 'Gentle walk after heavy meal.',
    });
  }

  // ISABGOL 2 (before meal 5)
  if (!nauseaMode) {
    addEvent(meal5Time - 30, 'supplement', 'Isabgol — 5g in 300ml water', {
      description: 'Second daily fibre dose. Stir fast, drink immediately.',
      supplements: getSupplementsForTiming('pre-meal-5', dayOfWeek, nauseaMode),
    });
  }

  // MEAL 5 (dinner)
  const meal5Id = nauseaMode ? 'nausea-meal-5' : menu.meal5;
  const meal5Data = MEALS_MAP[meal5Id];
  addEvent(meal5Time, 'meal', `Meal 5: ${meal5Data?.name || 'Dinner'}`, {
    mealNum: 5,
    mealId: meal5Id,
    protein: meal5Data?.protein || 0,
    calories: meal5Data?.calories || 0,
    cookTime: meal5Data?.cookTime || 0,
    supplements: getSupplementsForTiming('meal-5', dayOfWeek, nauseaMode),
  });

  addEvent(meal5Time + 15, 'walk', 'Walk — 10 min post-dinner', {
    duration: 10,
    description: 'Important for blood sugar management after dinner.',
  });

  // Soaking reminder
  const soaking = SOAKING_SCHEDULE[dayOfWeek];
  if (soaking) {
    addEvent(meal5Time + 30, 'prep', 'Tonight\'s Prep', {
      description: `${soaking.item}: ${soaking.instructions}`,
      where: soaking.where,
    });
  }

  // Bedtime supplements
  addEvent(meal6Time - 30, 'supplement', 'Bedtime Supplements', {
    description: 'Take 30 min before bedtime shake.',
    supplements: getSupplementsForTiming('bedtime', dayOfWeek, nauseaMode),
  });

  // MEAL 6 (bedtime shake)
  const meal6Id = nauseaMode ? 'nausea-meal-6' : 'bedtime-shake';
  const meal6Data = MEALS_MAP[meal6Id];
  addEvent(meal6Time, 'meal', `Meal 6: ${meal6Data?.name || 'Bedtime Shake'}`, {
    mealNum: 6,
    mealId: meal6Id,
    protein: meal6Data?.protein || 0,
    calories: meal6Data?.calories || 0,
    cookTime: meal6Data?.cookTime || 0,
    supplements: getSupplementsForTiming('meal-6', dayOfWeek, nauseaMode),
  });

  // Breathing
  addEvent(meal6Time + 15, 'wellness', 'Box Breathing — Wind Down', {
    description: '4-count box breathing. 5 rounds. Dim lights. No screens after this.',
  });

  // Sleep target — use the user's chosen bedtime
  addEvent(Math.max(meal6Time + 30, sleepTarget), 'sleep', 'Sleep Target', {
    description: 'Lights out. 7-8 hours minimum for recovery and GLP-1 efficacy.',
  });

  // Sort by time and return
  return events.sort((a, b) => a.time - b.time);
}

export function getRemainingEvents(events, currentTimeMinutes) {
  return events.filter(e => e.time >= currentTimeMinutes - 15);
}

export function getCurrentEvent(events, completedIds, currentTimeMinutes) {
  const remaining = events.filter(e => !completedIds.includes(e.id));
  // Find next uncompleted event that's at or past its time, or the next upcoming one
  const pastDue = remaining.filter(e => e.time <= currentTimeMinutes);
  if (pastDue.length > 0) return pastDue[pastDue.length - 1];
  return remaining[0] || null;
}

export function calculateProteinConsumed(events, completedIds) {
  return events
    .filter(e => e.type === 'meal' && completedIds.includes(e.id))
    .reduce((sum, e) => sum + (e.protein || 0), 0);
}

export { formatTime12, minutesSinceMidnight, timeFromMinutes };
