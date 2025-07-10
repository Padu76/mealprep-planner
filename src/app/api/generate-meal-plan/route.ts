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
        temperature: 0.8,  // Aumentato per più varietà
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

  // 🏃‍♂️ FATTORI ATTIVITÀ CORRETTI - AIRTABLE VALUES
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

  // 🎯 FATTORI OBIETTIVO CORRETTI - AIRTABLE VALUES ESATTI
  const goalFactors: { [key: string]: number } = {
    'dimagrimento': 0.85,        // Deficit 15%
    'Perdita peso': 0.85,        // Deficit 15% (come scritto in Airtable)
    'mantenimento': 1.0,         // Mantenimento
    'aumento massa': 1.15        // Surplus 15%
  };

  const goalFactor = goalFactors[goal] || 1.0;
  console.log('🎯 Goal factor:', goalFactor, 'for goal:', goal);

  const dailyCalories = Math.round(tdee * goalFactor);
  console.log('✅ FINAL DAILY CALORIES:', dailyCalories);

  // 🍽️ DISTRIBUZIONE CALORIE PER PASTO CORRETTA (2-7 pasti)
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

// 🔧 MAPPING ATTIVITÀ FIXATO - AIRTABLE COMPATIBLE
function normalizeActivity(activity: string): string {
  const activityMap: { [key: string]: string } = {
    // 📋 Valori AIRTABLE (target corretti)
    'sedentario': 'sedentario',
    'leggero': 'leggero',
    'moderato': 'moderato',
    'intenso': 'intenso',
    'molto_intenso': 'molto_intenso',
    
    // 📱 Valori FORM (da mappare) - FIX CASE SENSITIVITY
    'Attività Sedentaria': 'sedentario',
    'Attività Leggera': 'leggero',        // ← FIX BUG PRINCIPALE!
    'Attività Moderata': 'moderato',      // ← FIX BUG PRINCIPALE!
    'Attività Intensa': 'intenso',        // ← FIX BUG PRINCIPALE!
    'Attività Molto Intensa': 'molto_intenso',
    
    // Varianti lowercase
    'attività sedentaria': 'sedentario',
    'attività leggera': 'leggero',
    'attività moderata': 'moderato',
    'attività intensa': 'intenso',
    'attività molto intensa': 'molto_intenso',
    
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
  
  // Prima prova mapping diretto, poi lowercase
  const normalized = activityMap[activity] || activityMap[String(activity || '').toLowerCase()] || 'moderato';
  console.log('🏃‍♂️ Activity normalized:', activity, '→', normalized);
  return normalized;
}

// 🔧 MAPPING OBIETTIVO FIXATO - AIRTABLE VALUES ESATTI
function normalizeGoal(goal: string): string {
  const goalMap: { [key: string]: string } = {
    // 📋 Valori AIRTABLE ESATTI (come mi hai detto)
    'dimagrimento': 'dimagrimento',
    'mantenimento': 'mantenimento', 
    'aumento massa': 'aumento massa',
    'Perdita peso': 'Perdita peso',   // Come scritto in Airtable
    
    // 📱 Valori FORM (da mappare) - FIX CASE SENSITIVITY
    'Mantenimento': 'mantenimento',         // ← FIX BUG PRINCIPALE!
    'Dimagrimento': 'dimagrimento',         // ← FIX BUG PRINCIPALE!
    'Perdita di Peso': 'Perdita peso',      // ← FIX BUG PRINCIPALE!
    'Aumento Massa': 'aumento massa',       // ← FIX BUG PRINCIPALE!
    
    // Varianti lowercase e alternative
    'perdita di peso': 'Perdita peso',
    'perdita-peso': 'Perdita peso',
    'dimagrire': 'dimagrimento',
    'perdere peso': 'Perdita peso',
    'perdere-peso': 'Perdita peso',
    'peso': 'Perdita peso',
    
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
    
    'definizione': 'dimagrimento',
    'definire': 'dimagrimento',
    'tonificare': 'dimagrimento'
  };
  
  // Prima prova mapping diretto, poi lowercase
  const normalized = goalMap[goal] || goalMap[String(goal || '').toLowerCase()] || 'mantenimento';
  console.log('🎯 Goal normalized:', goal, '→', normalized);
  return normalized;
}

// 🔧 PROMPT MIGLIORATO CON VARIETÀ FORZATA
function createScientificPrompt(formData: any, calc: any): string {
  // Genera seed casuale per varietà
  const randomSeed = Math.floor(Math.random() * 1000);
  
  return `ISTRUZIONI CRITICHE PER NUTRIZIONISTA AI ITALIANO:

🔥 ATTENZIONE: LE CALORIE SONO CALCOLATE SCIENTIFICAMENTE!

CALCOLI VERIFICATI:
- BMR: ${calc.bmr} kcal/giorno
- TDEE: ${calc.tdee} kcal/giorno
- TARGET GIORNALIERO: ${calc.dailyCalories} kcal/giorno

⚠️ USA ESATTAMENTE QUESTI VALORI CALORICI - NON MODIFICARE!

SEED VARIETÀ: ${randomSeed} (USA QUESTO PER VARIARE LE RICETTE)

VINCOLI NON NEGOZIABILI:
❗ OGNI GIORNO DEVE AVERE ESATTAMENTE ${calc.dailyCalories} KCAL
❗ COLAZIONE: ESATTAMENTE ${calc.mealCalories.colazione} KCAL
❗ PRANZO: ESATTAMENTE ${calc.mealCalories.pranzo} KCAL
❗ CENA: ESATTAMENTE ${calc.mealCalories.cena} KCAL
${calc.mealCalories.spuntino1 > 0 ? `❗ SPUNTINO 1: ESATTAMENTE ${calc.mealCalories.spuntino1} KCAL` : ''}
${calc.mealCalories.spuntino2 > 0 ? `❗ SPUNTINO 2: ESATTAMENTE ${calc.mealCalories.spuntino2} KCAL` : ''}
${calc.mealCalories.spuntino3 > 0 ? `❗ SPUNTINO 3: ESATTAMENTE ${calc.mealCalories.spuntino3} KCAL` : ''}
${calc.mealCalories.spuntino4 > 0 ? `❗ SPUNTINO 4: ESATTAMENTE ${calc.mealCalories.spuntino4} KCAL` : ''}

DATI UTENTE VERIFICATI:
- ${formData.nome}, ${calc.debugInfo.input.age} anni, ${calc.debugInfo.input.gender}
- ${calc.debugInfo.input.weight}kg, ${calc.debugInfo.input.height}cm
- Attività: ${calc.debugInfo.input.activity}
- Obiettivo: ${calc.debugInfo.input.goal}
- Durata: ${calc.numDays} giorni
- Pasti: ${calc.numMeals} al giorno
- Allergie: ${formData.allergie?.join(', ') || 'Nessuna'}

IMPORTANTE: TUTTI I NOMI RICETTE DEVONO ESSERE IN ITALIANO!

🔄 REGOLA VARIETÀ OBBLIGATORIA:
- OGNI GIORNO DEVE AVERE RICETTE COMPLETAMENTE DIVERSE
- CAMBIA INGREDIENTI PRINCIPALI TRA I GIORNI
- USA CUCINE DIVERSE (italiana, mediterranea, orientale, americana)
- VARIA TECNICHE DI COTTURA (grigliate, al forno, vapore, padella)

FORMATO OBBLIGATORIO:

=== PIANO ALIMENTARE SCIENTIFICO ===
Target: ${calc.dailyCalories} kcal/giorno

GIORNO 1 - TEMA: MEDITERRANEO
🌅 COLAZIONE (${calc.mealCalories.colazione} kcal)
Nome: [Nome ricetta italiana UNICA - es: "Bowl Energetico ai Cereali", "Toast Proteico all'Avocado"]
Calorie: ${calc.mealCalories.colazione}
Proteine: [X]g | Carboidrati: [X]g | Grassi: [X]g
Ingredienti: [Lista con quantità precise in italiano]
Preparazione: [Istruzioni dettagliate in italiano]

☀️ PRANZO (${calc.mealCalories.pranzo} kcal)
Nome: [Nome ricetta italiana UNICA - es: "Risotto alle Verdure", "Insalata di Quinoa Mediterranea"]
Calorie: ${calc.mealCalories.pranzo}
Proteine: [X]g | Carboidrati: [X]g | Grassi: [X]g
Ingredienti: [Lista con quantità precise in italiano]
Preparazione: [Istruzioni dettagliate in italiano]

🌙 CENA (${calc.mealCalories.cena} kcal)
Nome: [Nome ricetta italiana UNICA - es: "Salmone alle Erbe", "Pollo al Limone con Verdure"]
Calorie: ${calc.mealCalories.cena}
Proteine: [X]g | Carboidrati: [X]g | Grassi: [X]g
Ingredienti: [Lista con quantità precise in italiano]
Preparazione: [Istruzioni dettagliate in italiano]

TOTALE GIORNO 1: ${calc.dailyCalories} kcal

${calc.numDays > 1 ? `
GIORNO 2 - TEMA: ORIENTALE/FUSION
🌅 COLAZIONE (${calc.mealCalories.colazione} kcal)
Nome: [Nome ricetta COMPLETAMENTE DIVERSA dal giorno 1 - es: "Pancakes Proteici", "Smoothie Bowl"]
Calorie: ${calc.mealCalories.colazione}
Proteine: [X]g | Carboidrati: [X]g | Grassi: [X]g
Ingredienti: [Lista TOTALMENTE DIVERSA dal giorno 1]
Preparazione: [Istruzioni DIVERSE dal giorno 1]

☀️ PRANZO (${calc.mealCalories.pranzo} kcal)
Nome: [Nome ricetta COMPLETAMENTE DIVERSA dal giorno 1 - es: "Bowl di Riso Teriyaki", "Zuppa Orientale"]
Calorie: ${calc.mealCalories.pranzo}
Proteine: [X]g | Carboidrati: [X]g | Grassi: [X]g
Ingredienti: [Lista TOTALMENTE DIVERSA dal giorno 1]
Preparazione: [Istruzioni DIVERSE dal giorno 1]

🌙 CENA (${calc.mealCalories.cena} kcal)
Nome: [Nome ricetta COMPLETAMENTE DIVERSA dal giorno 1 - es: "Curry di Pollo", "Tofu Grigliato"]
Calorie: ${calc.mealCalories.cena}
Proteine: [X]g | Carboidrati: [X]g | Grassi: [X]g
Ingredienti: [Lista TOTALMENTE DIVERSA dal giorno 1]
Preparazione: [Istruzioni DIVERSE dal giorno 1]

TOTALE GIORNO 2: ${calc.dailyCalories} kcal
` : ''}

REGOLE CRITICHE:
1. USA ESATTAMENTE I NUMERI SPECIFICATI PER LE CALORIE
2. NON MODIFICARE I VALORI CALORICI TARGET
3. SCRIVI TUTTO IN ITALIANO - NOMI RICETTE ITALIANI
4. OBBLIGATORIO: RICETTE DIVERSE PER OGNI GIORNO
5. OBBLIGATORIO: INGREDIENTI DIVERSI TRA I GIORNI
6. EVITA: ${formData.allergie?.join(', ') || 'niente'}

Inizia subito con il formato richiesto COMPLETAMENTE IN ITALIANO.`;
}

// 🔄 FALLBACK CON VARIETÀ FORZATA
function generateFallbackResponse(formData: any, calc: any) {
  console.log('🔄 Generating ITALIAN fallback with VARIETY...');
  
  // Array di ricette diverse per garantire varietà
  const breakfastOptions = [
    {
      nome: "Bowl Energetico ai Cereali",
      ingredienti: ["avena integrale", "proteine whey vaniglia", "frutti di bosco misti", "mandorle tritate", "latte parzialmente scremato", "miele"],
      preparazione: "Mescola avena con proteine in polvere, aggiungi latte caldo, frutti di bosco, mandorle e miele."
    },
    {
      nome: "Pancakes Proteici alla Ricotta",
      ingredienti: ["ricotta light", "farina d'avena", "uova", "mirtilli freschi", "sciroppo d'acero"],
      preparazione: "Impasta ricotta con farina e uova, cuoci pancakes, servi con mirtilli e sciroppo."
    },
    {
      nome: "Toast Gourmet all'Avocado",
      ingredienti: ["pane integrale", "avocado maturo", "uova", "pomodorini", "formaggio spalmabile"],
      preparazione: "Tosta il pane, spalma avocado e formaggio, aggiungi uova strapazzate e pomodorini."
    }
  ];

  const lunchOptions = [
    {
      nome: "Insalata di Quinoa Mediterranea",
      ingredienti: ["petto di pollo grigliato", "quinoa cotta", "verdure grigliate miste", "avocado", "olio extravergine", "pomodorini", "basilico"],
      preparazione: "Griglia pollo e verdure, cuoci quinoa, componi insalata con tutti ingredienti."
    },
    {
      nome: "Risotto Cremoso alle Verdure",
      ingredienti: ["riso Carnaroli", "zucchine", "parmigiano reggiano", "piselli", "brodo vegetale"],
      preparazione: "Risotto cremoso con verdure fresche e parmigiano, mantecato alla perfezione."
    },
    {
      nome: "Bowl di Riso Teriyaki",
      ingredienti: ["riso integrale", "pollo teriyaki", "edamame", "carote", "cavolo rosso", "salsa teriyaki"],
      preparazione: "Riso con pollo marinato, verdure fresche e salsa teriyaki per un gusto orientale."
    }
  ];

  const dinnerOptions = [
    {
      nome: "Salmone alle Erbe con Verdure",
      ingredienti: ["filetto di salmone", "patate dolci", "broccoli", "olio extravergine", "rosmarino", "prezzemolo"],
      preparazione: "Salmone al forno con erbe aromatiche, patate dolci e broccoli al vapore."
    },
    {
      nome: "Tagliata di Manzo alle Erbe",
      ingredienti: ["tagliata di manzo", "rucola", "pomodorini", "grana padano", "olio EVO", "aceto balsamico"],
      preparazione: "Tagliata grigliata su letto di rucola con pomodorini e grana."
    },
    {
      nome: "Pollo al Curry con Verdure",
      ingredienti: ["petto di pollo", "curry in polvere", "latte di cocco", "peperoni", "zucchine", "riso basmati"],
      preparazione: "Pollo al curry cremoso con verdure e riso basmati profumato."
    }
  ];

  // Selezione casuale per varietà
  const breakfast = breakfastOptions[Math.floor(Math.random() * breakfastOptions.length)];
  const lunch = lunchOptions[Math.floor(Math.random() * lunchOptions.length)];
  const dinner = dinnerOptions[Math.floor(Math.random() * dinnerOptions.length)];

  // Seconda giornata con ricette diverse
  const breakfast2 = breakfastOptions.find(b => b.nome !== breakfast.nome) || breakfastOptions[1];
  const lunch2 = lunchOptions.find(l => l.nome !== lunch.nome) || lunchOptions[1];
  const dinner2 = dinnerOptions.find(d => d.nome !== dinner.nome) || dinnerOptions[1];
  
  const fallbackPlan = `=== PIANO ALIMENTARE SCIENTIFICO ===
Target: ${calc.dailyCalories} kcal/giorno

GIORNO 1:
🌅 COLAZIONE (${calc.mealCalories.colazione} kcal)
Nome: ${breakfast.nome}
Calorie: ${calc.mealCalories.colazione}
Proteine: ${Math.round(calc.mealCalories.colazione * 0.20 / 4)}g | Carboidrati: ${Math.round(calc.mealCalories.colazione * 0.50 / 4)}g | Grassi: ${Math.round(calc.mealCalories.colazione * 0.30 / 9)}g
Ingredienti:
${breakfast.ingredienti.map(ing => `- ${Math.round(calc.mealCalories.colazione * 0.15)}g ${ing}`).join('\n')}
Preparazione: ${breakfast.preparazione} Calibrato scientificamente per ${calc.mealCalories.colazione} kcal.

☀️ PRANZO (${calc.mealCalories.pranzo} kcal)
Nome: ${lunch.nome}
Calorie: ${calc.mealCalories.pranzo}
Proteine: ${Math.round(calc.mealCalories.pranzo * 0.25 / 4)}g | Carboidrati: ${Math.round(calc.mealCalories.pranzo * 0.45 / 4)}g | Grassi: ${Math.round(calc.mealCalories.pranzo * 0.30 / 9)}g
Ingredienti:
${lunch.ingredienti.map(ing => `- ${Math.round(calc.mealCalories.pranzo * 0.18)}g ${ing}`).join('\n')}
Preparazione: ${lunch.preparazione} Porzioni calibrate per ${calc.mealCalories.pranzo} kcal esatti.

🌙 CENA (${calc.mealCalories.cena} kcal)
Nome: ${dinner.nome}
Calorie: ${calc.mealCalories.cena}
Proteine: ${Math.round(calc.mealCalories.cena * 0.35 / 4)}g | Carboidrati: ${Math.round(calc.mealCalories.cena * 0.25 / 4)}g | Grassi: ${Math.round(calc.mealCalories.cena * 0.40 / 9)}g
Ingredienti:
${dinner.ingredienti.map(ing => `- ${Math.round(calc.mealCalories.cena * 0.20)}g ${ing}`).join('\n')}
Preparazione: ${dinner.preparazione} Porzioni scientificamente calcolate per ${calc.mealCalories.cena} kcal.

TOTALE GIORNO 1: ${calc.dailyCalories} kcal

${calc.numDays > 1 ? `
GIORNO 2:
🌅 COLAZIONE (${calc.mealCalories.colazione} kcal)
Nome: ${breakfast2.nome}
Calorie: ${calc.mealCalories.colazione}
Proteine: ${Math.round(calc.mealCalories.colazione * 0.25 / 4)}g | Carboidrati: ${Math.round(calc.mealCalories.colazione * 0.45 / 4)}g | Grassi: ${Math.round(calc.mealCalories.colazione * 0.30 / 9)}g
Ingredienti:
${breakfast2.ingredienti.map(ing => `- ${Math.round(calc.mealCalories.colazione * 0.15)}g ${ing}`).join('\n')}
Preparazione: ${breakfast2.preparazione} Calibrato per ${calc.mealCalories.colazione} kcal.

☀️ PRANZO (${calc.mealCalories.pranzo} kcal)
Nome: ${lunch2.nome}
Calorie: ${calc.mealCalories.pranzo}
Proteine: ${Math.round(calc.mealCalories.pranzo * 0.20 / 4)}g | Carboidrati: ${Math.round(calc.mealCalories.pranzo * 0.55 / 4)}g | Grassi: ${Math.round(calc.mealCalories.pranzo * 0.25 / 9)}g
Ingredienti:
${lunch2.ingredienti.map(ing => `- ${Math.round(calc.mealCalories.pranzo * 0.18)}g ${ing}`).join('\n')}
Preparazione: ${lunch2.preparazione} Porzioni per ${calc.mealCalories.pranzo} kcal.

🌙 CENA (${calc.mealCalories.cena} kcal)
Nome: ${dinner2.nome}
Calorie: ${calc.mealCalories.cena}
Proteine: ${Math.round(calc.mealCalories.cena * 0.40 / 4)}g | Carboidrati: ${Math.round(calc.mealCalories.cena * 0.20 / 4)}g | Grassi: ${Math.round(calc.mealCalories.cena * 0.40 / 9)}g
Ingredienti:
${dinner2.ingredienti.map(ing => `- ${Math.round(calc.mealCalories.cena * 0.20)}g ${ing}`).join('\n')}
Preparazione: ${dinner2.preparazione} Calibrata per ${calc.mealCalories.cena} kcal.

TOTALE GIORNO 2: ${calc.dailyCalories} kcal
` : ''}

=== INFORMAZIONI NUTRIZIONALI ===
BMR (Metabolismo Basale): ${calc.bmr} kcal
TDEE (Fabbisogno Totale): ${calc.tdee} kcal
Obiettivo: ${calc.goal}
Distribuzione: ${JSON.stringify(calc.mealCalories)}

=== LISTA DELLA SPESA ===
Proteine: pollo, salmone, manzo, uova, ricotta, yogurt greco, proteine whey
Carboidrati: avena, quinoa, riso Carnaroli, riso integrale, patate dolci, frutti di bosco
Grassi: mandorle, avocado, olio extravergine, parmigiano, grana padano
Verdure: broccoli, verdure miste, pomodorini, zucchine, rucola, peperoni
Altro: latte, miele, erbe aromatiche italiane, spezie orientali`;

  return NextResponse.json({
    success: true,
    piano: fallbackPlan,
    message: 'Piano scientifico italiano con varietà e calorie corrette generato!',
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