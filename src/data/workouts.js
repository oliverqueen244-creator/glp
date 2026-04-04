// Shared components
const BASE_WARMUP = [
  { name: "Stationary Bike", duration: "5 min", instructions: "Easy pace, get blood flowing" },
];

const LOWER_A_WARMUP = [
  ...BASE_WARMUP,
  { name: "Hip Circles", duration: "10 each direction", instructions: "Stand on one leg, circle the other hip. Open up the joint." },
  { name: "Bodyweight Squats to Bench", duration: "10 reps", instructions: "Squat down until butt touches bench. Stand back up. Depth target practice." },
  { name: "Leg Swings (side to side)", duration: "10 each leg", instructions: "Hold wall. Swing leg laterally. Loosen hip adductors." },
];

const UPPER_PUSH_WARMUP = [
  ...BASE_WARMUP,
  { name: "Arm Circles", duration: "10 each direction", instructions: "Small to large circles. Forward then backward." },
  { name: "Band Pull-Aparts", duration: "15 reps", instructions: "Light band, pull apart at chest height. Warm up rear delts + rotator cuff." },
  { name: "Wall Push-Ups", duration: "10 reps", instructions: "Hands on wall, push-up motion. Easy chest/shoulder activation." },
];

const UPPER_PULL_WARMUP = [
  ...BASE_WARMUP,
  { name: "Band Pull-Aparts", duration: "15 reps", instructions: "Light band at chest height. Warm up scapular muscles." },
  { name: "Arm Circles", duration: "10 each direction", instructions: "Forward and backward. Full range." },
  { name: "Cat-Cow Stretch", duration: "8 reps", instructions: "On all fours. Arch up (cat), then dip down (cow). Mobilize thoracic spine." },
];

const LOWER_B_WARMUP = [
  ...BASE_WARMUP,
  { name: "Hip Circles", duration: "10 each direction", instructions: "Open up hip joint for hinge movements." },
  { name: "Leg Swings (front-back)", duration: "10 each leg", instructions: "Swing leg forward and back. Loosen hamstrings." },
  { name: "Glute Bridges", duration: "10 reps", instructions: "On back, feet flat. Drive hips up. Activate glutes before heavy work." },
  { name: "Band Walks", duration: "10 each direction", instructions: "Mini band above knees. Side steps. Wake up glute medius." },
];

const FULL_BODY_WARMUP = [
  ...BASE_WARMUP,
  { name: "Full Body Mobility Flow", duration: "3 min", instructions: "Arm circles → hip circles → bodyweight squats → cat-cow → shoulder shrugs. Continuous movement." },
];

const RESISTANCE_WARMUP = BASE_WARMUP;

const RESISTANCE_CARDIO = {
  name: "Stationary Bike — Zone 2",
  duration: "25 min",
  targetHR: "115-134 bpm",
  instructions:
    "Easy pace. Should be able to hold a conversation. This is fat-burning zone.",
};

const RESISTANCE_COOLDOWN = [
  { name: "Quad Stretch", duration: "30 sec each leg" },
  { name: "Hamstring Stretch", duration: "30 sec each leg" },
  { name: "Chest Doorway Stretch", duration: "30 sec" },
  { name: "Child's Pose", duration: "30 sec" },
  { name: "Cat-Cow Stretch", duration: "30 sec" },
];

const REST_DAY = {
  warmup: [],
  exercises: [
    {
      name: "LISS Walk",
      sets: 1,
      reps: "45 min",
      rest: 0,
      muscleGroup: "cardio",
      instructions:
        "Brisk walking pace, 5.5-6 km/hr. Keep heart rate under 145 bpm. Flat terrain preferred. Can be done outdoors or treadmill.",
      startingWeight: "N/A",
    },
  ],
  cardio: null,
  cooldown: [{ name: "Light Stretching", duration: "5 min" }],
};

export const WORKOUTS = {
  "Lower A — Quad Focus": {
    warmup: LOWER_A_WARMUP,
    exercises: [
      {
        name: "Leg Press",
        sets: 4,
        reps: "10-12",
        rest: 90,
        muscleGroup: "quads",
        instructions:
          "Sit in leg press. Feet shoulder-width on platform, middle height. Press platform away. Don't lock knees at top. Lower until 90 degrees. Push through whole foot.",
        startingWeight: "40 kg",
      },
      {
        name: "Goblet Squat to Bench",
        sets: 3,
        reps: "10",
        rest: 90,
        muscleGroup: "quads",
        instructions:
          "Hold one dumbbell at chest. Stand in front of bench. Squat down until butt touches bench. Stand back up. Bench gives you a depth target and safety net.",
        startingWeight: "7.5 kg",
      },
      {
        name: "Leg Extension",
        sets: 3,
        reps: "12-15",
        rest: 60,
        muscleGroup: "quads",
        instructions:
          "Sit in machine. Pad on shins. Extend legs until straight. Squeeze quads at top. Lower slowly. Don't let weight stack slam.",
        startingWeight: "15 kg",
      },
      {
        name: "Lying Leg Curl",
        sets: 3,
        reps: "12-15",
        rest: 60,
        muscleGroup: "hamstrings",
        instructions:
          "Lie face down. Pad behind ankles. Curl heels toward butt. Squeeze hamstrings. Don't lift hips off pad.",
        startingWeight: "15 kg",
      },
      {
        name: "Standing Calf Raises",
        sets: 3,
        reps: "15-20",
        rest: 45,
        muscleGroup: "calves",
        instructions:
          "Stand on calf raise machine or step edge. Rise up on toes. Hold 1 second at top. Lower heels below step for full stretch.",
        startingWeight: "bodyweight",
      },
      {
        name: "Plank (Knees)",
        sets: 3,
        reps: "20-30 sec",
        rest: 45,
        muscleGroup: "core",
        instructions:
          "On knees and forearms. Body straight from knees to head. Squeeze abs. Don't let hips sag or pike up. Breathe normally.",
        startingWeight: "bodyweight",
      },
    ],
    cardio: RESISTANCE_CARDIO,
    cooldown: RESISTANCE_COOLDOWN,
  },

  "Upper Push — Chest/Shoulders/Triceps": {
    warmup: UPPER_PUSH_WARMUP,
    exercises: [
      {
        name: "DB Bench Press (Flat)",
        sets: 4,
        reps: "8-10",
        rest: 90,
        muscleGroup: "chest",
        instructions:
          "Lie flat on bench. Feet flat on floor. Dumbbells at chest height, palms forward. Press up until arms nearly straight (don't lock elbows). Lower slowly to chest. Breathe out on push.",
        startingWeight: "7.5 kg each",
      },
      {
        name: "Incline DB Press",
        sets: 3,
        reps: "10-12",
        rest: 90,
        muscleGroup: "chest",
        instructions:
          "Set bench to 30-degree incline. Same pressing motion but angled up. Targets upper chest.",
        startingWeight: "5 kg each",
      },
      {
        name: "Seated Overhead Press",
        sets: 3,
        reps: "10-12",
        rest: 90,
        muscleGroup: "shoulders",
        instructions:
          "Sit upright on bench with back support. Dumbbells at shoulder height. Press straight overhead. Don't arch back.",
        startingWeight: "5 kg each",
      },
      {
        name: "Cable Tricep Pushdowns",
        sets: 3,
        reps: "12-15",
        rest: 60,
        muscleGroup: "triceps",
        instructions:
          "Face cable machine. Grip rope attachment. Elbows pinned to sides. Push down until arms straight. Squeeze triceps at bottom. Controlled return.",
        startingWeight: "10 kg",
      },
      {
        name: "Lateral Raises",
        sets: 3,
        reps: "12-15",
        rest: 60,
        muscleGroup: "shoulders",
        instructions:
          "Stand with dumbbells at sides. Raise arms out to sides until shoulder height. Slight bend in elbows. Control the lowering — don't swing.",
        startingWeight: "3 kg each",
      },
    ],
    cardio: RESISTANCE_CARDIO,
    cooldown: RESISTANCE_COOLDOWN,
  },

  "Upper Pull — Back/Biceps": {
    warmup: UPPER_PULL_WARMUP,
    exercises: [
      {
        name: "Lat Pulldown (Wide)",
        sets: 4,
        reps: "10-12",
        rest: 90,
        muscleGroup: "back",
        instructions:
          "Sit at lat pulldown. Grip bar wide (outside shoulders). Pull bar to upper chest. Lean slightly back. Squeeze shoulder blades. Controlled return up.",
        startingWeight: "25 kg",
      },
      {
        name: "Seated Cable Row (Close)",
        sets: 4,
        reps: "10-12",
        rest: 90,
        muscleGroup: "back",
        instructions:
          "Sit upright. Grip close handle. Pull to lower chest. Keep elbows close to body. Squeeze back muscles. Don't lean back excessively.",
        startingWeight: "20 kg",
      },
      {
        name: "Face Pulls",
        sets: 3,
        reps: "15-20",
        rest: 60,
        muscleGroup: "rear delts",
        instructions:
          "Cable at face height. Rope attachment. Pull toward face, flaring elbows high. Squeeze rear delts. Excellent for posture.",
        startingWeight: "7.5 kg",
      },
      {
        name: "DB Bicep Curls",
        sets: 3,
        reps: "10-12",
        rest: 60,
        muscleGroup: "biceps",
        instructions:
          "Stand with dumbbells. Curl up rotating palms to face you at top. Keep elbows at sides. Lower slowly.",
        startingWeight: "5 kg each",
      },
      {
        name: "Hammer Curls",
        sets: 3,
        reps: "10-12",
        rest: 60,
        muscleGroup: "biceps",
        instructions:
          "Same as curls but palms face each other throughout. Works brachialis (outer arm).",
        startingWeight: "5 kg each",
      },
      {
        name: "Chest-Supported DB Row",
        sets: 3,
        reps: "10-12",
        rest: 60,
        muscleGroup: "back",
        instructions:
          "Lie face down on incline bench. Dumbbells hang straight down. Row up squeezing shoulder blades. Eliminates momentum cheating.",
        startingWeight: "7.5 kg each",
      },
    ],
    cardio: RESISTANCE_CARDIO,
    cooldown: RESISTANCE_COOLDOWN,
  },

  "Lower B — Posterior Chain": {
    warmup: LOWER_B_WARMUP,
    exercises: [
      {
        name: "Romanian Deadlift (DB)",
        sets: 4,
        reps: "10-12",
        rest: 90,
        muscleGroup: "hamstrings/glutes",
        instructions:
          "Stand holding dumbbells in front of thighs. Slight knee bend. Hinge at hips pushing butt back. Lower dumbbells along legs to mid-shin. Feel hamstring stretch. Drive hips forward to stand.",
        startingWeight: "10 kg each",
      },
      {
        name: "Hip Thrust",
        sets: 4,
        reps: "10-12",
        rest: 90,
        muscleGroup: "glutes",
        instructions:
          "Upper back on bench. Feet flat on floor hip-width. Barbell or dumbbell on hip crease. Drive hips up until body is straight from knees to shoulders. Squeeze glutes hard at top.",
        startingWeight: "20 kg",
      },
      {
        name: "Lying Leg Curl",
        sets: 3,
        reps: "12-15",
        rest: 60,
        muscleGroup: "hamstrings",
        instructions:
          "Same as Lower A. Face down, curl heels to butt.",
        startingWeight: "15 kg",
      },
      {
        name: "Leg Press (Feet High+Wide)",
        sets: 3,
        reps: "10-12",
        rest: 90,
        muscleGroup: "glutes/hamstrings",
        instructions:
          "Same machine but feet HIGH on platform and WIDE. Targets glutes and hamstrings instead of quads.",
        startingWeight: "40 kg",
      },
      {
        name: "Standing Calf Raises",
        sets: 3,
        reps: "15-20",
        rest: 45,
        muscleGroup: "calves",
        instructions: "Same as Lower A.",
        startingWeight: "bodyweight",
      },
      {
        name: "Back Extensions",
        sets: 3,
        reps: "10-12",
        rest: 60,
        muscleGroup: "lower back",
        instructions:
          "On back extension bench. Cross arms over chest. Lower upper body down. Raise back to straight line. Don't hyperextend. Feel lower back working.",
        startingWeight: "bodyweight",
      },
    ],
    cardio: RESISTANCE_CARDIO,
    cooldown: RESISTANCE_COOLDOWN,
  },

  "Full Body Metabolic Circuit": {
    warmup: FULL_BODY_WARMUP,
    isCircuit: true,
    rounds: 4,
    restBetweenRounds: 60,
    exercises: [
      {
        name: "Leg Press",
        sets: 1,
        reps: "12",
        rest: 0,
        muscleGroup: "quads",
        instructions: "Heavy compound to start. Same form as Lower A.",
        startingWeight: "35 kg",
      },
      {
        name: "Lat Pulldown",
        sets: 1,
        reps: "12",
        rest: 0,
        muscleGroup: "back",
        instructions: "Quick transition. Same form as Upper Pull day.",
        startingWeight: "20 kg",
      },
      {
        name: "DB Bench Press",
        sets: 1,
        reps: "10",
        rest: 0,
        muscleGroup: "chest",
        instructions: "Same form. Keep moving.",
        startingWeight: "7.5 kg each",
      },
      {
        name: "Seated Cable Row",
        sets: 1,
        reps: "12",
        rest: 0,
        muscleGroup: "back",
        instructions: "Pull to lower chest. Squeeze.",
        startingWeight: "17.5 kg",
      },
      {
        name: "Leg Extension",
        sets: 1,
        reps: "15",
        rest: 0,
        muscleGroup: "quads",
        instructions: "Pump set. Feel the burn.",
        startingWeight: "12.5 kg",
      },
      {
        name: "Face Pulls",
        sets: 1,
        reps: "15",
        rest: 0,
        muscleGroup: "rear delts",
        instructions: "Finish with posture work.",
        startingWeight: "5 kg",
      },
    ],
    cardio: RESISTANCE_CARDIO,
    cooldown: RESISTANCE_COOLDOWN,
  },

  "REST — LISS Walk 45 min": { ...REST_DAY },

  "REST — LISS Walk 45 min (Post-Injection)": { ...REST_DAY },
};
