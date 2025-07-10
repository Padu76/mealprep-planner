import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    console.log('🤖 Generating meal plan with form data:', formData);

    // 🔧 CALCOLO CALORIE FIXATO
    const calc = calculateNutritionalNeedsFixed(formData);
    console.log('📊 Fixed nutritional calculations:', calc);

    // 🚨 VERIFICA SICUREZZA CALORIE
    if (!calc.isSafe) {
      console.error('🚨 UNSAFE CALORIE CALCULATION:', calc);
      return NextResponse.json({
        success: false,
        error: `Calcolo calorie non sicuro: ${calc.dailyCalories} kcal/giorno. Verifica i dati inseriti.`,
        debug: calc
      }, { status: 400 });
    }

    // 🤖 PROVA CLAUDE AI - CON FALLBACK SICURO
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log('⚠️ ANTHROPIC_API_KEY not found, using fallback');
      return generateFallbackResponse(formData, calc);
    }

    try {
      console.log('🤖 Calling Claude AI...');
      
      const prompt = createScientificPrompt(formData, calc);
      
      const message = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 4000,
        temperature: 0.8,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      });

      const aiResponse = message.content[0];
      if (aiResponse.type !== 'text') {
        throw new Error('Invalid AI response type');
      }

      console.log('✅ Claude AI response received');

      return NextResponse.json({
        success: true,
        piano: aiResponse.text,
        message: 'Piano alimentare scientifico generato con successo!',
        metadata: {
          bmr: calc.bmr,
          tdee: calc.tdee,
          dailyTarget: calc.dailyCalories,
          mealDistribution: calc.mealCalories,
          isCalorieSafe: calc.isSafe,
          aiGenerated: true,
          debugInfo: calc.debugInfo
        }
      });

    } catch (aiError) {
      console.error('❌ Claude AI error:', aiError);
      console.log('🔄 Falling back to scientific template...');
      return generateFallbackResponse(formData, calc);
    }

  } catch (error) {
    console.error('❌ General error:', error);
    return NextResponse.json({
      success: false,
      error: 'Errore interno del server',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// 🔧 FUNZIONE CALCOLO CALORIE COMPLETAMENTE FIXATA
function calculateNutritionalNeedsFixed(formData: any) {
  console.log('🔍 DEBUG - Raw form data:', formData);

  // 🔧 NORMALIZZAZIONE DATI
  const normalizedData = normalizeFormData(formData);
  console.log('📊 Normalized data:', normalizedData);

  const { age, weight, height, gender, activity, goal, numDays, numMeals } = normalizedData;

  // 🧮 CALCOLO BMR - Harris-Benedict
  let bmr;
  if (gender === 'maschio') {
    bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }

  console.log('💓 BMR calculated:', Math.round(bmr));

  // 🏃‍♂️ FATTORI ATTIVITÀ - MAPPING CORRETTO
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

  // 🎯 FATTORI OBIETTIVO - MAPPING CORRETTO
  const goalFactors: { [key: string]: number } = {
    'dimagrimento': 0.85,
    'perdita peso': 0.85,
    'mantenimento': 1.0,
    'aumento massa': 1.15
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

function normalizeFormData(formData: any) {
  const age = parseInt(String(formData.eta || '30')) || 30;
  const weightStr = String(formData.peso || '70').replace(',', '.');
  const weight = parseFloat(weightStr) || 70;
  const heightStr = String(formData.altezza || '170').replace(',', '.');
  const height = parseFloat(heightStr) || 170;
  const genderRaw = String(formData.sesso || 'maschio').toLowerCase();
  const gender = (genderRaw.includes('uomo') || genderRaw.includes('maschio')) ? 'maschio' : 'femmina';
  const activity = normalizeActivity(formData.attivita);
  const goal = normalizeGoal(formData.obiettivo);
  const numDays = parseInt(String(formData.durata || '3')) || 3;
  const numMeals = parseInt(String(formData.pasti || '3')) || 3;

  return {
    age: Math.max(15, Math.min(100, age)),
    weight: Math.max(40, Math.min(200, weight)),
    height: Math.max(140, Math.min(220, height)),
    gender,
    activity,
    goal,
    numDays: Math.max(1, Math.min(14, numDays)),
    numMeals: Math.max(2, Math.min(7, numMeals))
  };
}

// 🔧 MAPPING ATTIVITÀ FIXATO
function normalizeActivity(activity: string): string {
  const activityMap: { [key: string]: string } = {
    'sedentario': 'sedentario',
    'leggero': 'leggero',
    'moderato': 'moderato',
    'intenso': 'intenso',
    'molto_intenso': 'molto_intenso',
    
    // FIX CASE SENSITIVITY
    'Attività Sedentaria': 'sedentario',
    'Attività Leggera': 'leggero',        // ← FIX PRINCIPALE!
    'Attività Moderata': 'moderato',
    'Attività Intensa': 'intenso',
    'Attività Molto Intensa': 'molto_intenso',
    
    'attività sedentaria': 'sedentario',
    'attività leggera': 'leggero',
    'attività moderata': 'moderato',
    'attività intensa': 'intenso',
    'attività molto intensa': 'molto_intenso'
  };
  
  const normalized = activityMap[activity] || activityMap[String(activity || '').toLowerCase()] || 'moderato';
  console.log('🏃‍♂️ Activity normalized:', activity, '→', normalized);
  return normalized;
}

// 🔧 MAPPING OBIETTIVO FIXATO
function normalizeGoal(goal: string): string {
  const goalMap: { [key: string]: string } = {
    'dimagrimento': 'dimagrimento',
    'mantenimento': 'mantenimento', 
    'aumento massa': 'aumento massa',
    'perdita peso': 'perdita peso',
    
    // FIX CASE SENSITIVITY
    'Mantenimento': 'mantenimento',         // ← FIX PRINCIPALE!
    'Dimagrimento': 'dimagrimento',
    'Perdita di Peso': 'perdita peso',
    'Aumento Massa': 'aumento massa',
    
    'perdita di peso': 'perdita peso',
    'perdita-peso': 'perdita peso',
    'dimagrire': 'dimagrimento',
    'perdere peso': 'perdita peso',
    'mantenere': 'mantenimento',
    'massa': 'aumento massa'
  };
  
  const normalized = goalMap[goal] || goalMap[String(goal || '').toLowerCase()] || 'mantenimento';
  console.log('🎯 Goal normalized:', goal, '→', normalized);
  return normalized;
}

// PROMPT E FALLBACK (mantieni gli originali o uso quelli semplificati)
function createScientificPrompt(formData: any, calc: any): string {
  return `NUTRIZIONISTA AI ITALIANO - PIANO SCIENTIFICO

Target calorie: ${calc.dailyCalories} kcal/giorno
Distribuzione: Colazione ${calc.mealCalories.colazione}kcal, Pranzo ${calc.mealCalories.pranzo}kcal, Cena ${calc.mealCalories.cena}kcal

Crea piano alimentare italiano per ${formData.nome}, ${calc.debugInfo.input.age} anni, obiettivo ${calc.debugInfo.input.goal}.

Genera ricette diverse per ogni giorno con nomi italiani appetitosi.
Usa ESATTAMENTE le calorie specificate per ogni pasto.
Evita: ${formData.allergie?.join(', ') || 'niente'}.

Formato: Nome ricetta, calorie, macro, ingredienti, preparazione.`;
}

function generateFallbackResponse(formData: any, calc: any) {
  const numDays = parseInt(formData.durata) || 2;
  
  const fallbackPlan = `=== PIANO ALIMENTARE SCIENTIFICO ===
Target: ${calc.dailyCalories} kcal/giorno

GIORNO 1:
🌅 COLAZIONE (${calc.mealCalories.colazione} kcal)
Nome: Toast Energetico all'Avocado
Calorie: ${calc.mealCalories.colazione}
Proteine: ${Math.round(calc.mealCalories.colazione * 0.20 / 4)}g | Carboidrati: ${Math.round(calc.mealCalories.colazione * 0.50 / 4)}g | Grassi: ${Math.round(calc.mealCalories.colazione * 0.30 / 9)}g

☀️ PRANZO (${calc.mealCalories.pranzo} kcal)
Nome: Insalata Mediterranea con Pollo
Calorie: ${calc.mealCalories.pranzo}
Proteine: ${Math.round(calc.mealCalories.pranzo * 0.25 / 4)}g | Carboidrati: ${Math.round(calc.mealCalories.pranzo * 0.45 / 4)}g | Grassi: ${Math.round(calc.mealCalories.pranzo * 0.30 / 9)}g

🌙 CENA (${calc.mealCalories.cena} kcal)
Nome: Salmone alle Erbe con Verdure
Calorie: ${calc.mealCalories.cena}
Proteine: ${Math.round(calc.mealCalories.cena * 0.35 / 4)}g | Carboidrati: ${Math.round(calc.mealCalories.cena * 0.25 / 4)}g | Grassi: ${Math.round(calc.mealCalories.cena * 0.40 / 9)}g

TOTALE GIORNO 1: ${calc.dailyCalories} kcal

${numDays > 1 ? `
GIORNO 2:
🌅 COLAZIONE (${calc.mealCalories.colazione} kcal)
Nome: Yogurt Greco con Frutti di Bosco
Calorie: ${calc.mealCalories.colazione}

☀️ PRANZO (${calc.mealCalories.pranzo} kcal)
Nome: Risotto Cremoso alle Verdure
Calorie: ${calc.mealCalories.pranzo}

🌙 CENA (${calc.mealCalories.cena} kcal)
Nome: Pollo al Limone con Verdure
Calorie: ${calc.mealCalories.cena}

TOTALE GIORNO 2: ${calc.dailyCalories} kcal
` : ''}

BMR: ${calc.bmr} kcal | TDEE: ${calc.tdee} kcal | Obiettivo: ${calc.goal}`;

  return NextResponse.json({
    success: true,
    piano: fallbackPlan,
    message: 'Piano scientifico generato con successo!',
    metadata: {
      bmr: calc.bmr,
      tdee: calc.tdee,
      dailyTarget: calc.dailyCalories,
      mealDistribution: calc.mealCalories,
      isCalorieSafe: calc.isSafe,
      fallback: true,
      debugInfo: calc.debugInfo
    }
  });
}