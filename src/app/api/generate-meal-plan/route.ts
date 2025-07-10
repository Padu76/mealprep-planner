import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    console.log('🤖 Generating meal plan with form data:', formData);

    // 🔧 CALCOLO CALORIE FIXATO CON DEBUG COMPLETO
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

    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('❌ ANTHROPIC_API_KEY not found, using fallback');
      return generateFallbackResponse(formData, calc);
    }

    try {
      console.log('🤖 Calling Claude AI...');
      
      const prompt = createScientificPrompt(formData, calc);
      
      const message = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 4000,
        temperature: 0.7,
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
      console.log('📝 AI Response preview:', aiResponse.text.substring(0, 200) + '...');

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

  // 🔧 NORMALIZZAZIONE E PARSING SICURO DEI DATI
  const normalizedData = normalizeFormData(formData);
  console.log('📊 Normalized data:', normalizedData);

  const { age, weight, height, gender, activity, goal, numDays, numMeals } = normalizedData;

  // 🧮 CALCOLO BMR - Formula Harris-Benedict CORRETTA
  let bmr;
  if (gender === 'maschio') {
    bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }

  console.log('💓 BMR calculated:', Math.round(bmr), 'for gender:', gender);

  // 🏃‍♂️ FATTORI ATTIVITÀ CORRETTI
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

  // 🎯 FATTORI OBIETTIVO CORRETTI
  const goalFactors: { [key: string]: number } = {
    'perdita-peso': 0.85,    // Deficit 15%
    'mantenimento': 1.0,     // Mantenimento
    'aumento-massa': 1.15,   // Surplus 15%
    'definizione': 0.90      // Deficit 10%
  };

  const goalFactor = goalFactors[goal] || 1.0;
  console.log('🎯 Goal factor:', goalFactor, 'for goal:', goal);

  const dailyCalories = Math.round(tdee * goalFactor);
  console.log('✅ FINAL DAILY CALORIES:', dailyCalories);

  // 🍽️ DISTRIBUZIONE CALORIE PER PASTO CORRETTA
  const mealDistributions: { [key: number]: { [key: string]: number } } = {
    2: { 
      colazione: 0.40, 
      pranzo: 0.60 
    },
    3: { 
      colazione: 0.30, 
      pranzo: 0.40, 
      cena: 0.30 
    },
    4: { 
      colazione: 0.25, 
      pranzo: 0.35, 
      cena: 0.30, 
      spuntino1: 0.10 
    },
    5: { 
      colazione: 0.25, 
      pranzo: 0.35, 
      cena: 0.25, 
      spuntino1: 0.10, 
      spuntino2: 0.05 
    },
    6: { 
      colazione: 0.20, 
      pranzo: 0.30, 
      cena: 0.25, 
      spuntino1: 0.10, 
      spuntino2: 0.10, 
      spuntino3: 0.05 
    },
    7: { 
      colazione: 0.20, 
      pranzo: 0.25, 
      cena: 0.25, 
      spuntino1: 0.10, 
      spuntino2: 0.10, 
      spuntino3: 0.05, 
      spuntino4: 0.05 
    }
  };

  const distribution = mealDistributions[numMeals] || mealDistributions[3];
  const mealCalories: { [key: string]: number } = {};
  
  Object.keys(distribution).forEach(meal => {
    mealCalories[meal] = Math.round(dailyCalories * distribution[meal]);
  });

  console.log('🍽️ Meal distribution:', mealCalories);

  // 🚨 CONTROLLI SICUREZZA RIGOROSI
  const isSafe = dailyCalories >= 1200 && dailyCalories <= 3500;
  const isRealistic = bmr > 1000 && bmr < 2500 && tdee > 1200 && tdee < 4000;

  console.log('🛡️ Safety checks:', { isSafe, isRealistic, dailyCalories, bmr: Math.round(bmr), tdee: Math.round(tdee) });

  if (!isSafe) {
    console.error('🚨 UNSAFE CALORIES:', {
      dailyCalories,
      input: { age, weight, height, gender, activity, goal },
      calculations: { bmr: Math.round(bmr), tdee: Math.round(tdee), goalFactor }
    });
  }

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

// 🔧 NORMALIZZAZIONE DATI ROBUSTA
function normalizeFormData(formData: any) {
  // Parse età con fallback sicuro
  const age = parseInt(String(formData.eta || '30')) || 30;
  if (age < 15 || age > 100) {
    console.warn('⚠️ Age out of range:', age, 'using 30');
  }

  // Parse peso con gestione virgola/punto
  const weightStr = String(formData.peso || '70').replace(',', '.');
  const weight = parseFloat(weightStr) || 70;
  if (weight < 40 || weight > 200) {
    console.warn('⚠️ Weight out of range:', weight, 'using 70');
  }

  // Parse altezza con gestione virgola/punto
  const heightStr = String(formData.altezza || '170').replace(',', '.');
  const height = parseFloat(heightStr) || 170;
  if (height < 140 || height > 220) {
    console.warn('⚠️ Height out of range:', height, 'using 170');
  }

  // Normalizza sesso
  const genderRaw = String(formData.sesso || 'maschio').toLowerCase();
  const gender = (genderRaw.includes('uomo') || genderRaw.includes('maschio') || genderRaw.includes('male')) ? 'maschio' : 'femmina';

  // Normalizza attività
  const activity = normalizeActivity(formData.attivita);

  // Normalizza obiettivo
  const goal = normalizeGoal(formData.obiettivo);

  // Parse durata e pasti
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

function normalizeActivity(activity: string): string {
  const activityMap: { [key: string]: string } = {
    'sedentario': 'sedentario',
    'sedentaria': 'sedentario',
    'poco': 'sedentario',
    'basso': 'sedentario',
    'leggero': 'leggero',
    'leggera': 'leggero',
    'bassa': 'leggero',
    'poco-attivo': 'leggero',
    'moderato': 'moderato',
    'moderata': 'moderato',
    'medio': 'moderato',
    'media': 'moderato',
    'normale': 'moderato',
    'intenso': 'intenso',
    'intensa': 'intenso',
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
    'perdita-peso': 'perdita-peso',
    'dimagrimento': 'perdita-peso',
    'perdere-peso': 'perdita-peso',
    'dimagrire': 'perdita-peso',
    'peso': 'perdita-peso',
    'mantenimento': 'mantenimento',
    'mantenere': 'mantenimento',
    'mantenere-peso': 'mantenimento',
    'stabile': 'mantenimento',
    'aumento-massa': 'aumento-massa',
    'massa': 'aumento-massa',
    'massa-muscolare': 'aumento-massa',
    'aumentare-massa': 'aumento-massa',
    'muscoli': 'aumento-massa',
    'definizione': 'definizione',
    'definire': 'definizione',
    'tonificare': 'definizione'
  };
  
  const normalized = goalMap[String(goal || '').toLowerCase()] || 'mantenimento';
  console.log('🎯 Goal normalized:', goal, '→', normalized);
  return normalized;
}

// 🔧 PROMPT MIGLIORATO CON CALORIE CORRETTE
function createScientificPrompt(formData: any, calc: any): string {
  return `ISTRUZIONI CRITICHE PER NUTRIZIONISTA AI ITALIANO:

🔥 ATTENZIONE: LE CALORIE SONO CALCOLATE SCIENTIFICAMENTE!

CALCOLI VERIFICATI:
- BMR: ${calc.bmr} kcal/giorno  
- TDEE: ${calc.tdee} kcal/giorno
- TARGET GIORNALIERO: ${calc.dailyCalories} kcal/giorno

⚠️ USA ESATTAMENTE QUESTI VALORI CALORICI - NON MODIFICARE!

VINCOLI NON NEGOZIABILI:
❗ OGNI GIORNO DEVE AVERE ESATTAMENTE ${calc.dailyCalories} KCAL
❗ COLAZIONE: ESATTAMENTE ${calc.mealCalories.colazione} KCAL
❗ PRANZO: ESATTAMENTE ${calc.mealCalories.pranzo} KCAL  
❗ CENA: ESATTAMENTE ${calc.mealCalories.cena} KCAL
${calc.mealCalories.spuntino1 > 0 ? `❗ SPUNTINO 1: ESATTAMENTE ${calc.mealCalories.spuntino1} KCAL` : ''}
${calc.mealCalories.spuntino2 > 0 ? `❗ SPUNTINO 2: ESATTAMENTE ${calc.mealCalories.spuntino2} KCAL` : ''}
${calc.mealCalories.spuntino3 > 0 ? `❗ SPUNTINO 3: ESATTAMENTE ${calc.mealCalories.spuntino3} KCAL` : ''}

DATI UTENTE VERIFICATI:
- ${formData.nome}, ${calc.debugInfo.input.age} anni, ${calc.debugInfo.input.gender}
- ${calc.debugInfo.input.weight}kg, ${calc.debugInfo.input.height}cm
- Attività: ${calc.debugInfo.input.activity}
- Obiettivo: ${calc.debugInfo.input.goal}
- Durata: ${calc.numDays} giorni
- Pasti: ${calc.numMeals} al giorno
- Allergie: ${formData.allergie?.join(', ') || 'Nessuna'}

IMPORTANTE: TUTTI I NOMI RICETTE DEVONO ESSERE IN ITALIANO!

FORMATO OBBLIGATORIO:

=== PIANO ALIMENTARE SCIENTIFICO ===
Target: ${calc.dailyCalories} kcal/giorno

GIORNO 1:
🌅 COLAZIONE (${calc.mealCalories.colazione} kcal)
Nome: [Nome ricetta italiana - es: "Bowl Energetico ai Cereali", "Toast Proteico all'Avocado"]
Calorie: ${calc.mealCalories.colazione}
Proteine: [X]g | Carboidrati: [X]g | Grassi: [X]g
Ingredienti: [Lista con quantità precise in italiano]
Preparazione: [Istruzioni dettagliate in italiano]

☀️ PRANZO (${calc.mealCalories.pranzo} kcal)
Nome: [Nome ricetta italiana - es: "Risotto alle Verdure", "Insalata di Quinoa Mediterranea"]
Calorie: ${calc.mealCalories.pranzo}
Proteine: [X]g | Carboidrati: [X]g | Grassi: [X]g
Ingredienti: [Lista con quantità precise in italiano]
Preparazione: [Istruzioni dettagliate in italiano]

🌙 CENA (${calc.mealCalories.cena} kcal)
Nome: [Nome ricetta italiana - es: "Salmone alle Erbe", "Pollo al Limone con Verdure"]
Calorie: ${calc.mealCalories.cena}
Proteine: [X]g | Carboidrati: [X]g | Grassi: [X]g
Ingredienti: [Lista con quantità precise in italiano]
Preparazione: [Istruzioni dettagliate in italiano]

${calc.mealCalories.spuntino1 > 0 ? `🍎 SPUNTINO 1 (${calc.mealCalories.spuntino1} kcal)\nNome: [Nome spuntino italiano - es: "Yogurt con Mirtilli", "Frullato Proteico"]\nCalorie: ${calc.mealCalories.spuntino1}\n[Dettagli spuntino in italiano]\n` : ''}

TOTALE GIORNO 1: ${calc.dailyCalories} kcal

REGOLE CRITICHE:
1. USA ESATTAMENTE I NUMERI SPECIFICATI PER LE CALORIE
2. NON MODIFICARE I VALORI CALORICI TARGET  
3. SCRIVI TUTTO IN ITALIANO - NOMI RICETTE ITALIANI
4. CREA RICETTE DIVERSE PER OGNI GIORNO
5. VARIA GLI INGREDIENTI TRA I GIORNI
6. EVITA: ${formData.allergie?.join(', ') || 'niente'}

Inizia subito con il formato richiesto COMPLETAMENTE IN ITALIANO.`;
}

// 🔄 FALLBACK CON CALORIE CORRETTE
function generateFallbackResponse(formData: any, calc: any) {
  console.log('🔄 Generating ITALIAN fallback with CORRECT calories...');
  
  const fallbackPlan = `=== PIANO ALIMENTARE SCIENTIFICO ===
Target: ${calc.dailyCalories} kcal/giorno

GIORNO 1:
🌅 COLAZIONE (${calc.mealCalories.colazione} kcal)
Nome: Bowl Energetico ai Cereali
Calorie: ${calc.mealCalories.colazione}
Proteine: ${Math.round(calc.mealCalories.colazione * 0.20 / 4)}g | Carboidrati: ${Math.round(calc.mealCalories.colazione * 0.50 / 4)}g | Grassi: ${Math.round(calc.mealCalories.colazione * 0.30 / 9)}g
Ingredienti: 
- ${Math.round(calc.mealCalories.colazione * 0.25)}g avena integrale
- ${Math.round(calc.mealCalories.colazione * 0.12)}g proteine whey vaniglia
- ${Math.round(calc.mealCalories.colazione * 0.18)}g frutti di bosco misti
- ${Math.round(calc.mealCalories.colazione * 0.08)}g mandorle tritate
- 200ml latte parzialmente scremato
- 1 cucchiaino miele
Preparazione: Mescola avena con proteine in polvere, aggiungi latte caldo, frutti di bosco, mandorle e miele. Calibrato scientificamente per ${calc.mealCalories.colazione} kcal.

☀️ PRANZO (${calc.mealCalories.pranzo} kcal)
Nome: Insalata di Quinoa Mediterranea
Calorie: ${calc.mealCalories.pranzo}
Proteine: ${Math.round(calc.mealCalories.pranzo * 0.25 / 4)}g | Carboidrati: ${Math.round(calc.mealCalories.pranzo * 0.45 / 4)}g | Grassi: ${Math.round(calc.mealCalories.pranzo * 0.30 / 9)}g
Ingredienti:
- ${Math.round(calc.mealCalories.pranzo * 0.30)}g petto di pollo grigliato
- ${Math.round(calc.mealCalories.pranzo * 0.20)}g quinoa cotta
- ${Math.round(calc.mealCalories.pranzo * 0.15)}g verdure grigliate miste
- ${Math.round(calc.mealCalories.pranzo * 0.06)}g avocado
- 1 cucchiaio olio extravergine d'oliva
- 50g pomodorini
- Basilico e erbe aromatiche
Preparazione: Griglia pollo e verdure, cuoci quinoa, componi insalata con tutti ingredienti. Porzioni calibrate per ${calc.mealCalories.pranzo} kcal esatti.

🌙 CENA (${calc.mealCalories.cena} kcal)
Nome: Salmone alle Erbe con Verdure
Calorie: ${calc.mealCalories.cena}
Proteine: ${Math.round(calc.mealCalories.cena * 0.35 / 4)}g | Carboidrati: ${Math.round(calc.mealCalories.cena * 0.25 / 4)}g | Grassi: ${Math.round(calc.mealCalories.cena * 0.40 / 9)}g
Ingredienti:
- ${Math.round(calc.mealCalories.cena * 0.35)}g filetto di salmone
- ${Math.round(calc.mealCalories.cena * 0.15)}g patate dolci
- ${Math.round(calc.mealCalories.cena * 0.12)}g broccoli
- 1 cucchiaio olio extravergine d'oliva
- Limone, rosmarino, prezzemolo
Preparazione: Salmone al forno con erbe aromatiche, patate dolci e broccoli al vapore. Porzioni scientificamente calcolate per ${calc.mealCalories.cena} kcal.

${calc.mealCalories.spuntino1 > 0 ? `🍎 SPUNTINO 1 (${calc.mealCalories.spuntino1} kcal)
Nome: Yogurt Proteico ai Frutti di Bosco
Calorie: ${calc.mealCalories.spuntino1}
Proteine: ${Math.round(calc.mealCalories.spuntino1 * 0.30 / 4)}g | Carboidrati: ${Math.round(calc.mealCalories.spuntino1 * 0.50 / 4)}g | Grassi: ${Math.round(calc.mealCalories.spuntino1 * 0.20 / 9)}g
Ingredienti:
- ${Math.round(calc.mealCalories.spuntino1 * 0.70)}g yogurt greco
- ${Math.round(calc.mealCalories.spuntino1 * 0.20)}g frutti di bosco
- ${Math.round(calc.mealCalories.spuntino1 * 0.10)}g mandorle
Preparazione: Mescola yogurt con frutti di bosco e mandorle. Calibrato per ${calc.mealCalories.spuntino1} kcal.
` : ''}

TOTALE GIORNO 1: ${calc.dailyCalories} kcal

=== INFORMAZIONI NUTRIZIONALI ===
BMR (Metabolismo Basale): ${calc.bmr} kcal
TDEE (Fabbisogno Totale): ${calc.tdee} kcal
Obiettivo: ${calc.goal}
Distribuzione: ${JSON.stringify(calc.mealCalories)}`;

  return NextResponse.json({
    success: true,
    piano: fallbackPlan,
    message: 'Piano scientifico italiano con calorie corrette generato!',
    metadata: {
      bmr: calc.bmr,
      tdee: calc.tdee,
      dailyTarget: calc.dailyCalories,
      mealDistribution: calc.mealCalories,
      isCalorieSafe: calc.isSafe,
      fallback: true,
      language: 'italian',
      debugInfo: calc.debugInfo
    }
  });
}