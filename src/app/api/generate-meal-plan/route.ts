// 🔧 FIX COMPLETO MAPPING - Da sostituire nel file route.ts

function normalizeActivity(activity: string): string {
  const activityMap: { [key: string]: string } = {
    // 📋 Valori AIRTABLE (target corretti)
    'sedentario': 'sedentario',
    'leggero': 'leggero',
    'moderato': 'moderato',
    'intenso': 'intenso',
    'molto_intenso': 'molto_intenso',
    
    // 📱 Valori FORM (da mappare)
    'attività sedentaria': 'sedentario',
    'attività leggera': 'leggero',        // ← FIX PRINCIPALE!
    'attività moderata': 'moderato',      // ← FIX PRINCIPALE!
    'attività intensa': 'intenso',        // ← FIX PRINCIPALE!
    'attività molto intensa': 'molto_intenso',
    
    // 🔄 Varianti alternative
    'sedentaria': 'sedentario',
    'leggera': 'leggero',
    'moderata': 'moderato',
    'intensa': 'intenso',
    'poco': 'sedentario',
    'basso': 'sedentario',
    'bassa': 'leggero',
    'poco-attivo': 'leggero',
    'medio': 'moderato',
    'media': 'moderato',
    'normale': 'moderato',
    'alto': 'intenso',
    'alta': 'intenso',
    'attivo': 'intenso',
    'molto-intenso': 'molto_intenso',
    'molto-intensa': 'molto_intenso',
    'molto-alto': 'molto_intenso',
    'molto-alta': 'molto_intenso',
    'estremo': 'molto_intenso'
  };
  
  const normalized = activityMap[String(activity || '').toLowerCase()] || 'moderato';
  console.log('🏃‍♂️ Activity normalized:', activity, '→', normalized);
  return normalized;
}

function normalizeGoal(goal: string): string {
  const goalMap: { [key: string]: string } = {
    // 📋 Valori AIRTABLE (target corretti)
    'dimagrimento': 'dimagrimento',
    'mantenimento': 'mantenimento', 
    'aumento massa': 'aumento massa',
    'perdita peso': 'perdita peso',
    
    // 📱 Valori FORM (da mappare)
    'perdita di peso': 'perdita peso',
    'perdita-peso': 'perdita peso',
    'dimagrire': 'dimagrimento',
    'perdere peso': 'perdita peso',
    'perdere-peso': 'perdita peso',
    'peso': 'perdita peso',
    
    'mantenere': 'mantenimento',
    'mantenere-peso': 'mantenimento',
    'mantenere peso': 'mantenimento',
    'stabile': 'mantenimento',
    
    'aumento-massa': 'aumento massa',
    'aumento_massa': 'aumento massa',
    'aumentare massa': 'aumento massa',
    'aumentare-massa': 'aumento massa',
    'massa': 'aumento massa',
    'massa-muscolare': 'aumento massa',
    'massa muscolare': 'aumento massa',
    'muscoli': 'aumento massa',
    
    'definizione': 'dimagrimento',  // Definizione = dimagrimento
    'definire': 'dimagrimento',
    'tonificare': 'dimagrimento'
  };
  
  const normalized = goalMap[String(goal || '').toLowerCase()] || 'mantenimento';
  console.log('🎯 Goal normalized:', goal, '→', normalized);
  return normalized;
}

// 🔧 FATTORI AGGIORNATI PER VALORI AIRTABLE
function calculateNutritionalNeedsFixed(formData: any) {
  console.log('🔍 DEBUG - Raw form data:', formData);

  const normalizedData = normalizeFormData(formData);
  console.log('📊 Normalized data:', normalizedData);

  const { age, weight, height, gender, activity, goal, numDays, numMeals } = normalizedData;

  // 🧮 BMR - Formula Harris-Benedict
  let bmr;
  if (gender === 'maschio') {
    bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }

  console.log('💓 BMR calculated:', Math.round(bmr), 'for gender:', gender);

  // 🏃‍♂️ FATTORI ATTIVITÀ AGGIORNATI
  const activityFactors: { [key: string]: number } = {
    'sedentario': 1.2,
    'leggero': 1.375,
    'moderato': 1.55,
    'intenso': 1.725,
    'molto_intenso': 1.9
  };

  const activityFactor = activityFactors[activity] || 1.55;
  console.log('🏃‍♂️ Activity factor:', activityFactor, 'for activity:', activity);

  const tdee = bmr * activityFactor;
  console.log('🔥 TDEE calculated:', Math.round(tdee));

  // 🎯 FATTORI OBIETTIVO AGGIORNATI
  const goalFactors: { [key: string]: number } = {
    'dimagrimento': 0.85,        // Deficit 15%
    'perdita peso': 0.85,        // Deficit 15%
    'mantenimento': 1.0,         // Mantenimento
    'aumento massa': 1.15        // Surplus 15%
  };

  const goalFactor = goalFactors[goal] || 1.0;
  console.log('🎯 Goal factor:', goalFactor, 'for goal:', goal);

  const dailyCalories = Math.round(tdee * goalFactor);
  console.log('✅ FINAL DAILY CALORIES:', dailyCalories);

  // 🍽️ DISTRIBUZIONE PASTI
  const mealDistributions: { [key: number]: { [key: string]: number } } = {
    2: { colazione: 0.40, pranzo: 0.60 },
    3: { colazione: 0.30, pranzo: 0.40, cena: 0.30 },
    4: { colazione: 0.25, pranzo: 0.35, cena: 0.30, spuntino1: 0.10 },
    5: { colazione: 0.25, pranzo: 0.35, cena: 0.25, spuntino1: 0.10, spuntino2: 0.05 },
    6: { colazione: 0.20, pranzo: 0.30, cena: 0.25, spuntino1: 0.10, spuntino2: 0.10, spuntino3: 0.05 },
    7: { colazione: 0.20, pranzo: 0.25, cena: 0.25, spuntino1: 0.10, spuntino2: 0.10, spuntino3: 0.05, spuntino4: 0.05 }
  };

  const distribution = mealDistributions[numMeals] || mealDistributions[3];
  const mealCalories: { [key: string]: number } = {};
  
  Object.keys(distribution).forEach(meal => {
    mealCalories[meal] = Math.round(dailyCalories * distribution[meal]);
  });

  console.log('🍽️ Meal distribution:', mealCalories);

  // 🚨 CONTROLLI SICUREZZA
  const isSafe = dailyCalories >= 1200 && dailyCalories <= 3500;
  const isRealistic = bmr > 1000 && bmr < 2500 && tdee > 1200 && tdee < 4000;

  console.log('🛡️ Safety checks:', { isSafe, isRealistic, dailyCalories, bmr: Math.round(bmr), tdee: Math.round(tdee) });

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    dailyCalories,
    mealCalories,
    numDays,
    numMeals,
    isSafe: isSafe && isRealistic,
    goal,
    activity,
    debugInfo: {
      input: normalizedData,
      bmrFormula: gender === 'maschio' ? 'Harris-Benedict Male' : 'Harris-Benedict Female',
      activityFactor,
      goalFactor,
      finalMultiplier: activityFactor * goalFactor
    }
  };
}