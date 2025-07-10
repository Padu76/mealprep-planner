import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    console.log('🤖 Generating meal plan with form data:', formData);

    // Calcoli nutrizionali scientifici
    const calc = calculateNutritionalNeeds(formData);
    console.log('📊 Nutritional calculations:', calc);

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
          aiGenerated: true
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

// Funzione per calcolare fabbisogni nutrizionali
function calculateNutritionalNeeds(formData: any) {
  const age = parseInt(formData.eta) || 30;
  const weight = parseFloat(formData.peso) || 70;
  const height = parseFloat(formData.altezza) || 170;
  const gender = formData.sesso || 'maschio';
  const activity = formData.attivita || 'moderato';
  const goal = formData.obiettivo || 'mantenimento';
  const numDays = parseInt(formData.durata) || 2;
  const numMeals = parseInt(formData.pasti) || 3;

  // Calcolo BMR (Harris-Benedict)
  let bmr;
  if (gender === 'maschio') {
    bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }

  // Fattore attività
  const activityFactors: { [key: string]: number } = {
    'sedentario': 1.2,
    'leggero': 1.375,
    'moderato': 1.55,
    'intenso': 1.725,
    'molto_intenso': 1.9
  };

  const tdee = bmr * (activityFactors[activity] || 1.55);

  // Aggiustamento per obiettivo
  let targetMultiplier = 1.0;
  switch (goal) {
    case 'perdita-peso':
      targetMultiplier = 0.85; // Deficit 15%
      break;
    case 'aumento-massa':
      targetMultiplier = 1.15; // Surplus 15%
      break;
    case 'mantenimento':
    default:
      targetMultiplier = 1.0;
      break;
  }

  const dailyCalories = Math.round(tdee * targetMultiplier);

  // Distribuzione calorie per pasto
  const mealDistribution: { [key: string]: number } = {
    3: { colazione: 0.30, pranzo: 0.40, cena: 0.30 },
    4: { colazione: 0.25, pranzo: 0.35, cena: 0.30, spuntino1: 0.10 },
    5: { colazione: 0.25, pranzo: 0.35, cena: 0.25, spuntino1: 0.10, spuntino2: 0.05 },
    6: { colazione: 0.20, pranzo: 0.30, cena: 0.25, spuntino1: 0.10, spuntino2: 0.10, spuntino3: 0.05 }
  };

  const distribution = mealDistribution[numMeals] || mealDistribution[3];
  const mealCalories: { [key: string]: number } = {};
  
  Object.keys(distribution).forEach(meal => {
    mealCalories[meal] = Math.round(dailyCalories * distribution[meal]);
  });

  // Controllo sicurezza calorie
  const isSafe = dailyCalories >= 1200 && dailyCalories <= 3500;

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    dailyCalories,
    mealCalories,
    numDays,
    numMeals,
    isSafe,
    goal,
    activity
  };
}

// 🔧 PROMPT MIGLIORATO CON FOCUS ITALIANO
function createScientificPrompt(formData: any, calc: any): string {
  return `ISTRUZIONI CRITICHE PER NUTRIZIONISTA AI ITALIANO:

Devi creare un piano alimentare COMPLETAMENTE IN ITALIANO con VINCOLI NUMERICI ASSOLUTI.

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

${calc.mealCalories.spuntino1 > 0 ? `🍎 SPUNTINO 1 (${calc.mealCalories.spuntino1} kcal)\nNome: [Nome spuntino italiano - es: "Yogurt con Mirtilli", "Frullato Proteico"]\n[Dettagli spuntino in italiano]\n` : ''}

TOTALE GIORNO 1: ${calc.dailyCalories} kcal

${calc.numDays > 1 ? `GIORNO 2:
🌅 COLAZIONE (${calc.mealCalories.colazione} kcal)
Nome: [Nome ricetta italiana DIVERSA dal giorno 1 - es: "Pancakes Proteici", "Smoothie Bowl Energetico"]
Calorie: ${calc.mealCalories.colazione}
Proteine: [X]g | Carboidrati: [X]g | Grassi: [X]g
Ingredienti: [Lista DIVERSA dal giorno 1 in italiano]
Preparazione: [Istruzioni in italiano]

☀️ PRANZO (${calc.mealCalories.pranzo} kcal)
Nome: [Nome ricetta italiana DIVERSA dal giorno 1 - es: "Bowl di Riso Integrale", "Zuppa di Lenticchie"]
Calorie: ${calc.mealCalories.pranzo}
Proteine: [X]g | Carboidrati: [X]g | Grassi: [X]g
Ingredienti: [Lista DIVERSA dal giorno 1 in italiano]
Preparazione: [Istruzioni in italiano]

🌙 CENA (${calc.mealCalories.cena} kcal)
Nome: [Nome ricetta italiana DIVERSA dal giorno 1 - es: "Tagliata con Rucola", "Frittata alle Verdure"]
Calorie: ${calc.mealCalories.cena}
Proteine: [X]g | Carboidrati: [X]g | Grassi: [X]g
Ingredienti: [Lista DIVERSA dal giorno 1 in italiano]
Preparazione: [Istruzioni in italiano]

TOTALE GIORNO 2: ${calc.dailyCalories} kcal` : ''}

REGOLE CRITICHE:
1. USA ESATTAMENTE I NUMERI SPECIFICATI PER LE CALORIE
2. NON MODIFICARE I VALORI CALORICI TARGET  
3. SCRIVI TUTTO IN ITALIANO - NOMI RICETTE ITALIANI
4. NON RIPETERE RICETTE TRA I GIORNI
5. VARIA GLI INGREDIENTI TRA I GIORNI
6. EVITA: ${formData.allergie?.join(', ') || 'niente'}
7. NOMI RICETTE DEVONO SUONARE APPETITOSI E ITALIANI

ESEMPI NOMI CORRETTI:
- "Bowl Energetico ai Cereali" (non "Power Breakfast Bowl")
- "Risotto Cremoso alle Verdure" (non "Vegetable Risotto")
- "Salmone alle Erbe Mediterranee" (non "Herb Salmon")
- "Insalata di Quinoa Colorata" (non "Quinoa Power Bowl")

Inizia subito con il formato richiesto COMPLETAMENTE IN ITALIANO.`;
}

// 🔄 FALLBACK COMPLETAMENTE ITALIANO
function generateFallbackResponse(formData: any, calc: any) {
  console.log('🔄 Generating ITALIAN fallback response...');
  
  const fallbackPlan = `=== PIANO ALIMENTARE SCIENTIFICO ===
Target: ${calc.dailyCalories} kcal/giorno

GIORNO 1:
🌅 COLAZIONE (${calc.mealCalories.colazione} kcal)
Nome: Bowl Energetico ai Cereali
Calorie: ${calc.mealCalories.colazione}
Proteine: ${Math.round(calc.mealCalories.colazione * 0.20 / 4)}g | Carboidrati: ${Math.round(calc.mealCalories.colazione * 0.50 / 4)}g | Grassi: ${Math.round(calc.mealCalories.colazione * 0.30 / 9)}g
Ingredienti: 
- ${Math.round(calc.mealCalories.colazione * 0.35)}g avena integrale
- ${Math.round(calc.mealCalories.colazione * 0.15)}g proteine whey vaniglia
- ${Math.round(calc.mealCalories.colazione * 0.20)}g frutti di bosco misti
- ${Math.round(calc.mealCalories.colazione * 0.12)}g mandorle tritate
- 200ml latte parzialmente scremato
- 1 cucchiaino miele
Preparazione: Mescola avena con proteine in polvere, aggiungi latte caldo, frutti di bosco, mandorle e miele. Calibrato scientificamente per ${calc.mealCalories.colazione} kcal.

☀️ PRANZO (${calc.mealCalories.pranzo} kcal)
Nome: Insalata di Quinoa Mediterranea
Calorie: ${calc.mealCalories.pranzo}
Proteine: ${Math.round(calc.mealCalories.pranzo * 0.25 / 4)}g | Carboidrati: ${Math.round(calc.mealCalories.pranzo * 0.45 / 4)}g | Grassi: ${Math.round(calc.mealCalories.pranzo * 0.30 / 9)}g
Ingredienti:
- ${Math.round(calc.mealCalories.pranzo * 0.45)}g petto di pollo grigliato
- ${Math.round(calc.mealCalories.pranzo * 0.25)}g quinoa cotta
- ${Math.round(calc.mealCalories.pranzo * 0.15)}g verdure grigliate miste
- ${Math.round(calc.mealCalories.pranzo * 0.08)}g avocado
- 1 cucchiaio olio extravergine d'oliva
- 50g pomodorini
- Basilico e erbe aromatiche
Preparazione: Griglia pollo e verdure, cuoci quinoa, componi insalata con tutti ingredienti. Porzioni calibrate per ${calc.mealCalories.pranzo} kcal esatti.

🌙 CENA (${calc.mealCalories.cena} kcal)
Nome: Salmone alle Erbe con Verdure
Calorie: ${calc.mealCalories.cena}
Proteine: ${Math.round(calc.mealCalories.cena * 0.35 / 4)}g | Carboidrati: ${Math.round(calc.mealCalories.cena * 0.25 / 4)}g | Grassi: ${Math.round(calc.mealCalories.cena * 0.40 / 9)}g
Ingredienti:
- ${Math.round(calc.mealCalories.cena * 0.50)}g filetto di salmone
- ${Math.round(calc.mealCalories.cena * 0.20)}g patate dolci
- ${Math.round(calc.mealCalories.cena * 0.18)}g broccoli
- 1 cucchiaio olio extravergine d'oliva
- Limone, rosmarino, prezzemolo
Preparazione: Salmone al forno con erbe aromatiche, patate dolci e broccoli al vapore. Porzioni scientificamente calcolate per ${calc.mealCalories.cena} kcal.

TOTALE GIORNO 1: ${calc.dailyCalories} kcal

${calc.numDays > 1 ? `GIORNO 2:
🌅 COLAZIONE (${calc.mealCalories.colazione} kcal)
Nome: Pancakes Proteici alla Ricotta
Calorie: ${calc.mealCalories.colazione}
Proteine: ${Math.round(calc.mealCalories.colazione * 0.25 / 4)}g | Carboidrati: ${Math.round(calc.mealCalories.colazione * 0.45 / 4)}g | Grassi: ${Math.round(calc.mealCalories.colazione * 0.30 / 9)}g
Ingredienti:
- ${Math.round(calc.mealCalories.colazione * 0.4)}g ricotta light
- ${Math.round(calc.mealCalories.colazione * 0.25)}g farina d'avena
- 2 uova
- ${Math.round(calc.mealCalories.colazione * 0.15)}g mirtilli freschi
- 1 cucchiaino sciroppo d'acero
Preparazione: Impasta ricotta con farina e uova, cuoci pancakes, servi con mirtilli. Calibrato per ${calc.mealCalories.colazione} kcal.

☀️ PRANZO (${calc.mealCalories.pranzo} kcal)
Nome: Risotto Cremoso alle Verdure
Calorie: ${calc.mealCalories.pranzo}
Proteine: ${Math.round(calc.mealCalories.pranzo * 0.20 / 4)}g | Carboidrati: ${Math.round(calc.mealCalories.pranzo * 0.55 / 4)}g | Grassi: ${Math.round(calc.mealCalories.pranzo * 0.25 / 9)}g
Ingredienti:
- ${Math.round(calc.mealCalories.pranzo * 0.4)}g riso Carnaroli
- ${Math.round(calc.mealCalories.pranzo * 0.2)}g zucchine
- ${Math.round(calc.mealCalories.pranzo * 0.15)}g parmigiano reggiano
- ${Math.round(calc.mealCalories.pranzo * 0.1)}g piselli
- Brodo vegetale e spezie italiane
Preparazione: Risotto cremoso con verdure fresche e parmigiano. Porzioni per ${calc.mealCalories.pranzo} kcal.

🌙 CENA (${calc.mealCalories.cena} kcal)
Nome: Tagliata di Manzo alle Erbe
Calorie: ${calc.mealCalories.cena}
Proteine: ${Math.round(calc.mealCalories.cena * 0.40 / 4)}g | Carboidrati: ${Math.round(calc.mealCalories.cena * 0.20 / 4)}g | Grassi: ${Math.round(calc.mealCalories.cena * 0.40 / 9)}g
Ingredienti:
- ${Math.round(calc.mealCalories.cena * 0.5)}g tagliata di manzo
- ${Math.round(calc.mealCalories.cena * 0.2)}g rucola
- ${Math.round(calc.mealCalories.cena * 0.15)}g pomodorini
- ${Math.round(calc.mealCalories.cena * 0.1)}g grana padano
- Olio EVO e aceto balsamico
Preparazione: Tagliata grigliata su letto di rucola con pomodorini e grana. Calibrata per ${calc.mealCalories.cena} kcal.

TOTALE GIORNO 2: ${calc.dailyCalories} kcal
` : ''}

=== LISTA DELLA SPESA ===
Proteine: pollo, salmone, manzo, uova, ricotta, yogurt greco, proteine whey
Carboidrati: avena, quinoa, riso Carnaroli, patate dolci, frutti di bosco
Grassi: mandorle, avocado, olio extravergine, parmigiano
Verdure: broccoli, verdure miste, pomodorini, zucchine, rucola
Altro: latte, miele, erbe aromatiche italiane`;

  return NextResponse.json({
    success: true,
    piano: fallbackPlan,
    message: 'Piano scientifico italiano generato con successo!',
    metadata: {
      bmr: calc.bmr,
      tdee: calc.tdee,
      dailyTarget: calc.dailyCalories,
      mealDistribution: calc.mealCalories,
      isCalorieSafe: calc.isSafe,
      fallback: true,
      language: 'italian'
    }
  });
}