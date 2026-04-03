export const MY_PROFILE = {
  name: "Mac",
  weight: 183,
  height: 183,
  age: 29,
  proteinTarget: 178,
  calorieTarget: 1743,
  medication: {
    name: "Mounjaro (Tirzepatide)",
    startDate: "2026-04-02",
    injectionDay: 3, // Wednesday (0=Sun)
    firstInjectionDay: 4, // Thursday April 2 was first
    doseSchedule: [
      { weeks: [1, 2], dose: 2.5 },
      { weeks: [3, 4], dose: 5.0 },
      { weeks: [5, 6, 7, 8], dose: 7.5 },
      { weeks: [9, 10, 11, 12], dose: 10.0 },
    ],
    injectionRotation: [
      "Right Abdomen",
      "Left Abdomen",
      "Right Thigh",
      "Left Thigh",
    ],
  },
};

export const TRAINING_SCHEDULE = {
  0: { type: "rest", name: "REST — LISS Walk 45 min" },
  1: { type: "resistance", name: "Lower A — Quad Focus" },
  2: { type: "resistance", name: "Upper Push — Chest/Shoulders/Triceps" },
  3: { type: "resistance", name: "Upper Pull — Back/Biceps" },
  4: { type: "rest", name: "REST — LISS Walk 45 min (Post-Injection)" },
  5: { type: "resistance", name: "Lower B — Posterior Chain" },
  6: { type: "resistance", name: "Full Body Metabolic Circuit" },
};

export const SOAKING_SCHEDULE = {
  0: null,
  1: { item: "Make fresh besan batter", instructions: "100g besan + 140ml water + spices + onion + chili + coriander. Jar. Fridge. 5 min.", where: "fridge" },
  2: { item: "Soak 50g whole moong dal", instructions: "Green moong with skin in water. Container. Fridge. For Thursday chilla.", where: "fridge" },
  3: { item: "Soak 50g whole moong dal", instructions: "For Thursday dinner chilla.", where: "fridge" },
  4: { item: "Soak 50g whole moong dal", instructions: "For Friday dinner chilla.", where: "fridge" },
  5: { item: "Soak 50g rajma + boil eggs", instructions: "Rajma in plenty of water on COUNTER (not fridge). Boil 1-2 eggs for Saturday.", where: "counter" },
  6: null,
};

export const WEEKLY_MENU = {
  0: { meal1: "paneer-bhurji", meal2: "soy-biryani-raita", meal4: "mixed-dal-paneer-tikka", meal5: "tofu-bhurji-roti-dahi" },
  1: { meal1: "egg-white-bhurji", meal2: "soy-keema-paneer-tikka", meal4: "moong-dal-tofu-egg", meal5: "besan-chilla-dahi" },
  2: { meal1: "egg-veg-omelette", meal2: "soy-dry-paneer-tikka", meal4: "masoor-dal-soy-egg", meal5: "besan-chilla-dahi" },
  3: { meal1: "egg-white-bhurji", meal2: "soy-keema-chilla-wrap", meal4: "chana-dal-tofu-palak-egg", meal5: "paneer-tikka-salad" },
  4: { meal1: "paneer-bhurji", meal2: "sprouts-soy-chaat", meal4: "dal-khichdi-soy-curry", meal5: "moong-dal-chilla-dahi" },
  5: { meal1: "egg-french-toast", meal2: "tofu-tikka-soy-curry", meal4: "masoor-dal-egg-curry", meal5: "moong-dal-chilla-dahi" },
  6: { meal1: "egg-soy-bhurji", meal2: "paneer-paratha-dahi", meal4: "rajma-tofu-egg", meal5: "besan-chilla-dahi" },
};
