// Mifflin-St Jeor BMR + goal-based calorie/protein targets.

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2, // little/no exercise
  light: 1.375, // light exercise 1-3 days/week
  moderate: 1.55, // moderate exercise 3-5 days/week
  active: 1.725, // hard exercise 6-7 days/week
  very_active: 1.9, // very hard exercise, physical job
};

// grams of protein per kg bodyweight, by goal
const PROTEIN_PER_KG = {
  bulk: 1.8,
  lean: 2.2, // higher protein on a cut to preserve muscle
  maintain: 1.6,
};

// calorie adjustment relative to TDEE, by goal
const CALORIE_ADJUSTMENT = {
  bulk: 350, // moderate surplus
  lean: -500, // moderate deficit
  maintain: 0,
};

function calculateBMR({ gender, weightKg, heightCm, age }) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === "female" ? base - 161 : base + 5;
}

function calculateTDEE(bmr, activityLevel) {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.2;
  return bmr * multiplier;
}

function calculateTargets({ gender, weightKg, heightCm, age, activityLevel, goalType }) {
  const bmr = calculateBMR({ gender, weightKg, heightCm, age });
  const tdee = calculateTDEE(bmr, activityLevel);
  const adjustment = CALORIE_ADJUSTMENT[goalType] ?? 0;
  let calorieTarget = tdee + adjustment;

  // Safety floor: never recommend below BMR
  if (calorieTarget < bmr) calorieTarget = bmr;

  const proteinPerKg = PROTEIN_PER_KG[goalType] ?? 1.6;
  const proteinTarget = weightKg * proteinPerKg;

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    calorieTarget: Math.round(calorieTarget),
    proteinTarget: Math.round(proteinTarget),
  };
}

module.exports = { calculateBMR, calculateTDEE, calculateTargets, ACTIVITY_MULTIPLIERS };
