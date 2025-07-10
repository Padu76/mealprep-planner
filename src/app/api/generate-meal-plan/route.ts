import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    console.log('🤖 Generating meal plan with form data:', formData);

    // 🔧 CALCOLO CALORIE COMPLETAMENTE FIXATO
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

    // 🎯 LOG DETTAGLIATO PER DEBUG
    console.log('🔍 DETAILED CALCULATION DEBUG:');
    console.log('- Raw obiettivo from form:', formData.obiettivo);
    console.log('- Raw attivita from form:', formData.attivita);
    console.log('- Normalized goal:', calc.goal);
    console.log('- Normalized activity:', calc.activity);
    console.log('- Goal factor used:', calc.debugInfo.goalFactor);
    console.log('- Activity factor used:', calc.debugInfo.activityFactor);
    console.log('- BMR × Activity × Goal:', calc.bmr, '×', calc.debugInfo.activityFactor, '×', calc.debugInfo.goalFactor, '=', calc.dailyCalories);
    console.log('- Expected for Andrea (1692 × 1.375 × 0.85):', Math.round(1692 * 1.375 * 0.85));

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

  // 🏃‍♂️ FATTORI ATTIVITÀ - MAPPING CORRETTO E COMPLETO
  const activityFactors: { [key: string]: number } = {
    'sedentario': 1.2,
    'leggero': 1.375,
    'moderato': 1.55,
    'intenso': 1.725,
    'molto_intenso': 1.9
  };

  const activityFactor = activityFactors[activity] || 1.375; // Default leggero
  console.log('🏃‍♂️ Activity factor:', activityFactor, 'for activity:', activity);

  const tdee = bmr * activityFactor;
  console.log('🔥 TDEE calculated:', Math.round(tdee));

  // 🎯 FATTORI OBIETTIVO - MAPPING CORRETTO E COMPLETO
  const goalFactors: { [key: string]: number } = {
    'dimagrimento': 0.85,
    'perdita-peso': 0.85,
    'perdita peso': 0.85,
    'mantenimento': 1.0,
    'aumento-massa': 1.15,
    'aumento massa': 1.15,
    'massa': 1.15
  };

  const goalFactor = goalFactors[goal] || 1.0; // Default mantenimento
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
      finalMultiplier: activityFactor * goalFactor,
      expectedAndrea: Math.round(1692 * 1.375 * 0.85)
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

// 🔧 MAPPING ATTIVITÀ COMPLETAMENTE FIXATO
function normalizeActivity(activity: string): string {
  const activityMap: { [key: string]: string } = {
    // Valori diretti dal form
    'sedentario': 'sedentario',
    'leggero': 'leggero',              // ← FIX PRINCIPALE!
    'moderato': 'moderato',
    'intenso': 'intenso',
    'molto_intenso': 'molto_intenso',
    
    // Varianti con maiuscole
    'Sedentario': 'sedentario',
    'Leggero': 'leggero',
    'Moderato': 'moderato',
    'Intenso': 'intenso',
    
    // Varianti complete
    'Attività Sedentaria': 'sedentario',
    'Attività Leggera': 'leggero',        // ← FIX PRINCIPALE!
    'Attività Moderata': 'moderato',
    'Attività Intensa': 'intenso',
    'Attività Molto Intensa': 'molto_intenso',
    
    // Varianti minuscole
    'attività sedentaria': 'sedentario',
    'attività leggera': 'leggero',
    'attività moderata': 'moderato',
    'attività intensa': 'intenso',
    'attività molto intensa': 'molto_intenso',
    
    // Varianti alternative
    'bassa': 'sedentario',
    'media': 'moderato',
    'alta': 'intenso'
  };
  
  const normalized = activityMap[activity] || activityMap[String(activity || '').toLowerCase()] || 'leggero';
  console.log('🏃‍♂️ Activity normalized:', activity, '→', normalized);
  return normalized;
}

// 🔧 MAPPING OBIETTIVO COMPLETAMENTE FIXATO
function normalizeGoal(goal: string): string {
  const goalMap: { [key: string]: string } = {
    // Valori diretti dal form
    'perdita-peso': 'perdita-peso',
    'mantenimento': 'mantenimento',
    'aumento-massa': 'aumento-massa',
    
    // Varianti con maiuscole
    'Perdita-peso': 'perdita-peso',
    'Mantenimento': 'mantenimento',          // ← FIX PRINCIPALE!
    'Aumento-massa': 'aumento-massa',
    
    // Varianti complete
    'Perdita di Peso': 'perdita-peso',
    'Aumento Massa Muscolare': 'aumento-massa',
    
    // Varianti alternative
    'dimagrimento': 'perdita-peso',
    'perdita peso': 'perdita-peso',
    'perdita di peso': 'perdita-peso',
    'perdere peso': 'perdita-peso',
    'dimagrire': 'perdita-peso',
    
    'mantenere': 'mantenimento',
    'maintain': 'mantenimento',
    
    'aumento massa': 'aumento-massa',
    'massa': 'aumento-massa',
    'bulk': 'aumento-massa',
    'crescita': 'aumento-massa'
  };
  
  const normalized = goalMap[goal] || goalMap[String(goal || '').toLowerCase()] || 'mantenimento';
  console.log('🎯 Goal normalized:', goal, '→', normalized);
  return normalized;
}

// 🔧 PROMPT SCIENTIFICO OTTIMIZZATO
function createScientificPrompt(formData: any, calc: any): string {
  const allergieText = formData.allergie && formData.allergie.length > 0 ? 
    `\n⚠️ ALLERGIE: ${formData.allergie.join(', ')}` : '';
  
  const preferenzeText = formData.preferenze && formData.preferenze.length > 0 ? 
    `\n🥗 PREFERENZE: ${formData.preferenze.join(', ')}` : '';

  return `🍽️ NUTRIZIONISTA AI ITALIANO - PIANO SCIENTIFICO

👤 DATI UTENTE:
Nome: ${formData.nome}
Età: ${calc.debugInfo.input.age} anni
Sesso: ${calc.debugInfo.input.gender}
Peso: ${calc.debugInfo.input.weight} kg
Altezza: ${calc.debugInfo.input.height} cm
Attività: ${calc.debugInfo.input.activity}
Obiettivo: ${calc.debugInfo.input.goal}${allergieText}${preferenzeText}

📊 CALCOLI NUTRIZIONALI:
BMR: ${calc.bmr} kcal (${calc.debugInfo.bmrFormula})
TDEE: ${calc.tdee} kcal (BMR × ${calc.debugInfo.activityFactor})
Target giornaliero: ${calc.dailyCalories} kcal (TDEE × ${calc.debugInfo.goalFactor})

🍽️ DISTRIBUZIONE PASTI:
${Object.entries(calc.mealCalories).map(([meal, cal]) => `${meal}: ${cal} kcal`).join('\n')}

📋 RICHIESTA:
Crea un piano alimentare italiano per ${calc.debugInfo.input.numDays} giorni con ${calc.debugInfo.input.numMeals} pasti al giorno.
Genera ricette diverse per ogni giorno con nomi italiani appetitosi.
Usa ESATTAMENTE le calorie specificate per ogni pasto.
Includi valori nutrizionali dettagliati per ogni ricetta.

Formato richiesto:
GIORNO X:
🌅 COLAZIONE (XXX kcal): [Nome ricetta]
- Ingredienti: [lista]
- Preparazione: [breve]
- Macro: P/C/G

Continua per tutti i pasti e giorni.`;
}

// 🔧 FALLBACK RESPONSE MIGLIORATO
function generateFallbackResponse(formData: any, calc: any) {
  const numDays = parseInt(formData.durata) || 2;
  const numMeals = parseInt(formData.pasti) || 3;
  
  let fallbackPlan = `🍽️ PIANO ALIMENTARE SCIENTIFICO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 DATI PERSONALI:
Nome: ${formData.nome}
Età: ${calc.debugInfo.input.age} anni | Sesso: ${calc.debugInfo.input.gender}
Peso: ${calc.debugInfo.input.weight} kg | Altezza: ${calc.debugInfo.input.height} cm
Attività: ${calc.debugInfo.input.activity} | Obiettivo: ${calc.debugInfo.input.goal}

📊 CALCOLI NUTRIZIONALI:
BMR: ${calc.bmr} kcal/giorno
TDEE: ${calc.tdee} kcal/giorno
Target: ${calc.dailyCalories} kcal/giorno

🍽️ DISTRIBUZIONE PASTI:
${Object.entries(calc.mealCalories).map(([meal, cal]) => `${meal}: ${cal} kcal`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 PIANO ALIMENTARE:

`;

  // Genera i giorni
  for (let day = 1; day <= numDays; day++) {
    fallbackPlan += `🗓️ GIORNO ${day}:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌅 COLAZIONE (${calc.mealCalories.colazione} kcal):
Nome: ${day === 1 ? 'Toast Energetico all\'Avocado' : day === 2 ? 'Yogurt Greco Power Bowl' : 'Pancakes Proteici'}
Ingredienti: ${day === 1 ? '2 fette pane integrale, 1 avocado, 1 uovo, rucola' : day === 2 ? '200g yogurt greco, 30g granola, 100g frutti di bosco' : '150g ricotta, 2 uova, 40g farina avena'}
Preparazione: ${day === 1 ? 'Tosta il pane, schiaccia avocado, cuoci uovo in camicia' : day === 2 ? 'Mescola yogurt con granola e frutti di bosco' : 'Mescola ricotta e uova, cuoci come pancakes'}
Macro: P: ${Math.round(calc.mealCalories.colazione * 0.20 / 4)}g | C: ${Math.round(calc.mealCalories.colazione * 0.50 / 4)}g | G: ${Math.round(calc.mealCalories.colazione * 0.30 / 9)}g

☀️ PRANZO (${calc.mealCalories.pranzo} kcal):
Nome: ${day === 1 ? 'Insalata Mediterranea con Pollo' : day === 2 ? 'Risotto Cremoso alle Verdure' : 'Bowl di Quinoa e Salmone'}
Ingredienti: ${day === 1 ? '120g pollo, 80g quinoa, verdure miste, olio EVO' : day === 2 ? '90g riso, verdure di stagione, parmigiano' : '100g quinoa, 130g salmone, verdure colorate'}
Preparazione: ${day === 1 ? 'Griglia pollo, cuoci quinoa, assembla con verdure' : day === 2 ? 'Tosta riso, aggiungi verdure e brodo gradualmente' : 'Cuoci quinoa, griglia salmone, componi la bowl'}
Macro: P: ${Math.round(calc.mealCalories.pranzo * 0.25 / 4)}g | C: ${Math.round(calc.mealCalories.pranzo * 0.45 / 4)}g | G: ${Math.round(calc.mealCalories.pranzo * 0.30 / 9)}g

🌙 CENA (${calc.mealCalories.cena} kcal):
Nome: ${day === 1 ? 'Salmone alle Erbe con Verdure' : day === 2 ? 'Pollo al Limone con Verdure' : 'Frittata di Verdure e Legumi'}
Ingredienti: ${day === 1 ? '130g salmone, broccoli, patate dolci, erbe' : day === 2 ? '120g pollo, zucchine, limone, rosmarino' : '3 uova, verdure miste, 50g legumi'}
Preparazione: ${day === 1 ? 'Cuoci salmone con erbe, griglia verdure' : day === 2 ? 'Marina pollo al limone, cuoci con verdure' : 'Sbatti uova, aggiungi verdure e legumi, cuoci'}
Macro: P: ${Math.round(calc.mealCalories.cena * 0.35 / 4)}g | C: ${Math.round(calc.mealCalories.cena * 0.25 / 4)}g | G: ${Math.round(calc.mealCalories.cena * 0.40 / 9)}g

`;

    // Aggiungi spuntini se richiesti
    if (numMeals >= 4 && calc.mealCalories.spuntino1) {
      fallbackPlan += `🍎 SPUNTINO 1 (${calc.mealCalories.spuntino1} kcal):
Nome: ${day === 1 ? 'Yogurt Greco con Noci' : day === 2 ? 'Frutta e Mandorle' : 'Smoothie Proteico'}
Ingredienti: ${day === 1 ? '150g yogurt greco, 20g noci, miele' : day === 2 ? '1 mela, 15g mandorle' : '1 banana, 200ml latte, proteine'}
Macro: P: ${Math.round(calc.mealCalories.spuntino1 * 0.25 / 4)}g | C: ${Math.round(calc.mealCalories.spuntino1 * 0.45 / 4)}g | G: ${Math.round(calc.mealCalories.spuntino1 * 0.30 / 9)}g

`;
    }

    if (numMeals >= 5 && calc.mealCalories.spuntino2) {
      fallbackPlan += `🥤 SPUNTINO 2 (${calc.mealCalories.spuntino2} kcal):
Nome: ${day === 1 ? 'Shake Post-Workout' : day === 2 ? 'Ricotta e Frutti di Bosco' : 'Energy Balls'}
Ingredienti: ${day === 1 ? '30g proteine, 1 banana, latte mandorle' : day === 2 ? '100g ricotta, 80g frutti di bosco' : '3 energy balls fatte in casa'}
Macro: P: ${Math.round(calc.mealCalories.spuntino2 * 0.30 / 4)}g | C: ${Math.round(calc.mealCalories.spuntino2 * 0.40 / 4)}g | G: ${Math.round(calc.mealCalories.spuntino2 * 0.30 / 9)}g

`;
    }

    fallbackPlan += `TOTALE GIORNO ${day}: ${calc.dailyCalories} kcal

`;
  }

  fallbackPlan += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 CONSIGLI NUTRIZIONALI:
• Bevi almeno 2 litri d'acqua al giorno
• Rispetta gli orari dei pasti per ottimizzare il metabolismo
• Varia gli ingredienti per un'alimentazione equilibrata
• Adatta le porzioni in base alla tua risposta corporea
• Consulta un nutrizionista per personalizzazioni specifiche

📊 RIEPILOGO NUTRIZIONALE:
• Calorie totali piano: ${calc.dailyCalories * numDays} kcal
• Media proteine: ${Math.round(calc.dailyCalories * 0.25 / 4)}g/giorno
• Media carboidrati: ${Math.round(calc.dailyCalories * 0.45 / 4)}g/giorno
• Media grassi: ${Math.round(calc.dailyCalories * 0.30 / 9)}g/giorno

✅ Piano generato scientificamente il ${new Date().toLocaleDateString('it-IT')}
🔬 Basato su formule Harris-Benedict e fattori di attività validati`;

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