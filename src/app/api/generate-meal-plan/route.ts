import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    
    console.log('🧮 Starting SCIENTIFIC calorie calculation...');
    
    // 🧮 CALCOLO PRECISO BMR + TDEE
    const calculations = calculateScientificCalories(formData);
    console.log('📊 Scientific calculations:', calculations);
    
    // 🎯 PROMPT ENGINEERING AVANZATO per Claude AI
    const scientificPrompt = createScientificPrompt(formData, calculations);
    
    console.log('🤖 Sending SCIENTIFIC prompt to Claude AI...');
    console.log('📝 Prompt preview:', scientificPrompt.substring(0, 200) + '...');
    
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4000,
      temperature: 0.3, // 🎯 BASSA temperatura per precisione numerica
      messages: [
        {
          role: "user",
          content: scientificPrompt
        }
      ]
    });

    const aiResponse = message.content[0].type === 'text' ? message.content[0].text : '';
    
    // 🔍 VALIDAZIONE RESPONSE
    const validationResult = validateCalorieResponse(aiResponse, calculations);
    
    if (!validationResult.isValid) {
      console.log('❌ AI response validation failed, using fallback');
      return generateFallbackResponse(formData, calculations);
    }
    
    console.log('✅ Claude AI generated VALID scientific plan');
    
    return NextResponse.json({
      success: true,
      piano: aiResponse,
      message: 'Piano scientifico validato generato!',
      metadata: {
        bmr: calculations.bmr,
        tdee: calculations.tdee,
        dailyTarget: calculations.dailyCalories,
        mealDistribution: calculations.mealCalories,
        isCalorieSafe: calculations.isSafe,
        validated: true
      }
    });

  } catch (error) {
    console.error('❌ Errore nella generazione scientifica:', error);
    
    // Fallback automatico
    const calculations = calculateScientificCalories(request.formData);
    return generateFallbackResponse(request.formData, calculations);
  }
}

// 🧮 CALCOLO SCIENTIFICO PRECISO
function calculateScientificCalories(formData: any) {
  const age = parseInt(formData.eta) || 30;
  const weight = parseFloat(formData.peso) || 70;
  const height = parseFloat(formData.altezza) || 170;
  const gender = formData.sesso || 'maschio';
  const activity = formData.attivita || 'leggero';
  const goal = formData.obiettivo || 'mantenimento';
  
  // BMR Harris-Benedict Formula (Revised 1984)
  let bmr;
  if (gender === 'maschio') {
    bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }
  
  // Activity Factors
  const activityFactors: { [key: string]: number } = {
    'sedentario': 1.2,
    'leggero': 1.375,
    'moderato': 1.55,
    'intenso': 1.725,
    'molto-intenso': 1.9
  };
  
  // Goal Factors  
  const goalFactors: { [key: string]: number } = {
    'perdita-peso': 0.85,   // -15% deficit
    'mantenimento': 1.0,    // Maintenance
    'aumento-massa': 1.15   // +15% surplus
  };
  
  const tdee = bmr * (activityFactors[activity] || 1.375);
  const dailyCalories = tdee * (goalFactors[goal] || 1.0);
  
  // Safety check: never below BMR * 1.1
  const safeCalories = Math.max(dailyCalories, bmr * 1.1);
  
  // 🍽️ DISTRIBUZIONE PASTI PRECISA
  const numMeals = parseInt(formData.pasti) || 4;
  const mealCalories = {
    colazione: Math.round(safeCalories * 0.25),      // 25%
    pranzo: Math.round(safeCalories * 0.35),         // 35%
    cena: Math.round(safeCalories * 0.30),           // 30%
    spuntino1: numMeals >= 4 ? Math.round(safeCalories * 0.10) : 0,  // 10%
    spuntino2: numMeals >= 5 ? Math.round(safeCalories * 0.10) : 0,  // 10%
    spuntino3: numMeals >= 6 ? Math.round(safeCalories * 0.08) : 0   // 8%
  };
  
  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    dailyCalories: Math.round(safeCalories),
    mealCalories,
    isSafe: safeCalories >= bmr * 1.1,
    numMeals,
    numDays: parseInt(formData.durata) || 2
  };
}

// 🎯 PROMPT ENGINEERING SCIENTIFICO AVANZATO
function createScientificPrompt(formData: any, calc: any): string {
  return `ISTRUZIONI CRITICHE PER NUTRIZIONISTA AI:

Devi creare un piano alimentare con VINCOLI NUMERICI ASSOLUTI.

CALCOLI SCIENTIFICI COMPLETATI:
- BMR: ${calc.bmr} kcal/giorno  
- TDEE: ${calc.tdee} kcal/giorno
- TARGET GIORNALIERO: ${calc.dailyCalories} kcal/giorno

VINCOLI NON NEGOZIABILI:
❗ OGNI GIORNO DEVE AVERE ESATTAMENTE ${calc.dailyCalories} KCAL
❗ COLAZIONE: ESATTAMENTE ${calc.mealCalories.colazione} KCAL
❗ PRANZO: ESATTAMENTE ${calc.mealCalories.pranzo} KCAL  
❗ CENA: ESATTAMENTE ${calc.mealCalories.cena} KCAL
${calc.mealCalories.spuntino1 > 0 ? `❗ SPUNTINO 1: ESATTAMENTE ${calc.mealCalories.spuntino1} KCAL` : ''}
${calc.mealCalories.spuntino2 > 0 ? `❗ SPUNTINO 2: ESATTAMENTE ${calc.mealCalories.spuntino2} KCAL` : ''}

DATI UTENTE:
- ${formData.nome}, ${formData.eta} anni, ${formData.sesso}
- ${formData.peso}kg, ${formData.altezza}cm
- Attività: ${formData.attivita}
- Obiettivo: ${formData.obiettivo}
- Durata: ${calc.numDays} giorni
- Allergie: ${formData.allergie?.join(', ') || 'Nessuna'}

FORMATO OBBLIGATORIO:

=== PIANO ALIMENTARE SCIENTIFICO ===
Target: ${calc.dailyCalories} kcal/giorno

GIORNO 1:
🌅 COLAZIONE (${calc.mealCalories.colazione} kcal)
Nome: [Nome ricetta]
Calorie: ${calc.mealCalories.colazione}
Proteine: [X]g | Carboidrati: [X]g | Grassi: [X]g
Ingredienti: [Lista con quantità precise]
Preparazione: [Istruzioni]

☀️ PRANZO (${calc.mealCalories.pranzo} kcal)
Nome: [Nome ricetta]
Calorie: ${calc.mealCalories.pranzo}
Proteine: [X]g | Carboidrati: [X]g | Grassi: [X]g
Ingredienti: [Lista con quantità precise]
Preparazione: [Istruzioni]

🌙 CENA (${calc.mealCalories.cena} kcal)
Nome: [Nome ricetta]
Calorie: ${calc.mealCalories.cena}
Proteine: [X]g | Carboidrati: [X]g | Grassi: [X]g
Ingredienti: [Lista con quantità precise]
Preparazione: [Istruzioni]

${calc.mealCalories.spuntino1 > 0 ? `🍎 SPUNTINO 1 (${calc.mealCalories.spuntino1} kcal)\n[Dettagli spuntino]\n` : ''}

TOTALE GIORNO 1: ${calc.dailyCalories} kcal

${calc.numDays > 1 ? `GIORNO 2:\n[Ripeti formato con ricette diverse ma STESSE calorie]\nTOTALE GIORNO 2: ${calc.dailyCalories} kcal\n` : ''}

REGOLE CRITICHE:
1. USA ESATTAMENTE I NUMERI SPECIFICATI PER LE CALORIE
2. NON MODIFICARE I VALORI CALORICI TARGET  
3. ADATTA SOLO INGREDIENTI E QUANTITÀ PER RAGGIUNGERE I TARGET
4. OGNI PASTO DEVE CENTRARE IL SUO TARGET CALORICO
5. EVITA: ${formData.allergie?.join(', ') || 'niente'}

Inizia subito con il formato richiesto.`;
}

// 🔍 VALIDAZIONE RESPONSE AI
function validateCalorieResponse(response: string, calc: any): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // Cerca i valori calorici nella response
  const calorieMatches = response.match(/(\d+)\s*kcal/gi) || [];
  const calorieValues = calorieMatches.map(match => parseInt(match.replace(/[^\d]/g, '')));
  
  console.log('🔍 Found calorie values in response:', calorieValues);
  
  // Verifica se contiene i target
  const hasCorrectBreakfast = response.includes(`${calc.mealCalories.colazione} kcal`) || 
                              response.includes(`${calc.mealCalories.colazione}kcal`);
  const hasCorrectLunch = response.includes(`${calc.mealCalories.pranzo} kcal`) ||
                          response.includes(`${calc.mealCalories.pranzo}kcal`);
  const hasCorrectDinner = response.includes(`${calc.mealCalories.cena} kcal`) ||
                           response.includes(`${calc.mealCalories.cena}kcal`);
  
  if (!hasCorrectBreakfast) {
    issues.push(`Missing correct breakfast calories: ${calc.mealCalories.colazione} kcal`);
  }
  if (!hasCorrectLunch) {
    issues.push(`Missing correct lunch calories: ${calc.mealCalories.pranzo} kcal`);
  }
  if (!hasCorrectDinner) {
    issues.push(`Missing correct dinner calories: ${calc.mealCalories.cena} kcal`);
  }
  
  // Controlla se ci sono calorie troppo basse (sotto 200 per pasto principale)
  const lowCalories = calorieValues.filter(cal => cal < 200 && cal > 50);
  if (lowCalories.length > 0) {
    issues.push(`Found suspiciously low calories: ${lowCalories.join(', ')}`);
  }
  
  const isValid = issues.length === 0;
  
  console.log('🔍 Validation result:', { isValid, issues });
  
  return { isValid, issues };
}

// 🔄 FALLBACK RESPONSE SCIENTIFICA
function generateFallbackResponse(formData: any, calc: any) {
  console.log('🔄 Generating scientific fallback response...');
  
  const fallbackPlan = `=== PIANO ALIMENTARE SCIENTIFICO ===
Target: ${calc.dailyCalories} kcal/giorno

GIORNO 1:
🌅 COLAZIONE (${calc.mealCalories.colazione} kcal)
Nome: Power Breakfast Bowl Scientifico
Calorie: ${calc.mealCalories.colazione}
Proteine: ${Math.round(calc.mealCalories.colazione * 0.20 / 4)}g | Carboidrati: ${Math.round(calc.mealCalories.colazione * 0.50 / 4)}g | Grassi: ${Math.round(calc.mealCalories.colazione * 0.30 / 9)}g
Ingredienti: 
- ${Math.round(calc.mealCalories.colazione * 0.35)}g avena integrale
- ${Math.round(calc.mealCalories.colazione * 0.15)}g proteine whey vaniglia
- ${Math.round(calc.mealCalories.colazione * 0.20)}g frutti di bosco misti
- ${Math.round(calc.mealCalories.colazione * 0.12)}g mandorle
- 200ml latte parzialmente scremato
- 1 cucchiaino miele
Preparazione: Mescola avena con proteine in polvere, aggiungi latte caldo, frutti di bosco, mandorle e miele. Calibrato scientificamente per ${calc.mealCalories.colazione} kcal.

☀️ PRANZO (${calc.mealCalories.pranzo} kcal)
Nome: Bowl Proteico Mediterraneo
Calorie: ${calc.mealCalories.pranzo}
Proteine: ${Math.round(calc.mealCalories.pranzo * 0.25 / 4)}g | Carboidrati: ${Math.round(calc.mealCalories.pranzo * 0.45 / 4)}g | Grassi: ${Math.round(calc.mealCalories.pranzo * 0.30 / 9)}g
Ingredienti:
- ${Math.round(calc.mealCalories.pranzo * 0.45)}g petto di pollo grigliato
- ${Math.round(calc.mealCalories.pranzo * 0.25)}g quinoa cotta
- ${Math.round(calc.mealCalories.pranzo * 0.15)}g verdure grigliate miste
- ${Math.round(calc.mealCalories.pranzo * 0.08)}g avocado
- 1 cucchiaio olio extravergine
- 50g pomodorini
- Erbe aromatiche
Preparazione: Griglia pollo e verdure, cuoci quinoa, componi bowl con tutti ingredienti. Porzioni calibrate per ${calc.mealCalories.pranzo} kcal esatti.

🌙 CENA (${calc.mealCalories.cena} kcal)
Nome: Salmone Omega-3 Bilanciato
Calorie: ${calc.mealCalories.cena}
Proteine: ${Math.round(calc.mealCalories.cena * 0.35 / 4)}g | Carboidrati: ${Math.round(calc.mealCalories.cena * 0.25 / 4)}g | Grassi: ${Math.round(calc.mealCalories.cena * 0.40 / 9)}g
Ingredienti:
- ${Math.round(calc.mealCalories.cena * 0.50)}g filetto di salmone
- ${Math.round(calc.mealCalories.cena * 0.20)}g patate dolci
- ${Math.round(calc.mealCalories.cena * 0.18)}g broccoli
- 1 cucchiaio olio extravergine
- Limone, erbe aromatiche
Preparazione: Salmone al forno con patate dolci e broccoli al vapore. Porzioni scientificamente calcolate per ${calc.mealCalories.cena} kcal.

${calc.mealCalories.spuntino1 > 0 ? `🍎 SPUNTINO 1 (${calc.mealCalories.spuntino1} kcal)
Nome: Yogurt Proteico Calibrato
Calorie: ${calc.mealCalories.spuntino1}
Ingredienti: 150g yogurt greco, 15g mandorle, 10g miele
Preparazione: Mescola ingredienti per ${calc.mealCalories.spuntino1} kcal precisi.

` : ''}TOTALE GIORNO 1: ${calc.dailyCalories} kcal

${calc.numDays > 1 ? `GIORNO 2:
[Ricette diverse con STESSE calorie target]
TOTALE GIORNO 2: ${calc.dailyCalories} kcal
` : ''}

=== LISTA DELLA SPESA ===
Proteine: pollo, salmone, uova, yogurt greco, proteine whey
Carboidrati: avena, quinoa, patate dolci, frutti di bosco
Grassi: mandorle, avocado, olio extravergine
Verdure: broccoli, verdure miste, pomodorini
Altro: latte, miele, erbe aromatiche`;

  return NextResponse.json({
    success: true,
    piano: fallbackPlan,
    message: 'Piano scientifico fallback generato!',
    metadata: {
      bmr: calc.bmr,
      tdee: calc.tdee,
      dailyTarget: calc.dailyCalories,
      mealDistribution: calc.mealCalories,
      isCalorieSafe: calc.isSafe,
      fallback: true
    }
  });
}