import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    
    console.log('🧮 Starting precise calorie calculation...');
    
    // 🧮 CALCOLO PRECISO BMR + TDEE
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
    
    console.log('📊 Calculated values:', {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee), 
      dailyCalories: Math.round(safeCalories),
      isSafe: safeCalories >= bmr * 1.1
    });
    
    // 🍽️ DISTRIBUZIONE PASTI PRECISA
    const numMeals = parseInt(formData.pasti) || 4;
    const mealDistribution: { [key: string]: number } = {
      'colazione': 0.25,      // 25%
      'spuntino1': 0.10,      // 10%  
      'pranzo': 0.35,         // 35%
      'spuntino2': 0.10,      // 10%
      'cena': 0.30,           // 30%
      'spuntino3': 0.08       // 8%
    };
    
    const mealCalories = {
      colazione: Math.round(safeCalories * mealDistribution.colazione),
      pranzo: Math.round(safeCalories * mealDistribution.pranzo),
      cena: Math.round(safeCalories * mealDistribution.cena),
      spuntino1: numMeals >= 4 ? Math.round(safeCalories * mealDistribution.spuntino1) : 0,
      spuntino2: numMeals >= 5 ? Math.round(safeCalories * mealDistribution.spuntino2) : 0,
      spuntino3: numMeals >= 6 ? Math.round(safeCalories * mealDistribution.spuntino3) : 0
    };
    
    console.log('🍽️ Meal calorie distribution:', mealCalories);
    
    // 🎯 PROMPT SCIENTIFICO PRECISO
    const prompt = `Sei un nutrizionista esperto con specializzazione in meal prep e fitness. Crea un piano alimentare SCIENTIFICAMENTE ACCURATO.

DATI UTENTE ANALIZZATI:
- Nome: ${formData.nome}
- Età: ${age} anni, Sesso: ${gender}
- Peso: ${weight}kg, Altezza: ${height}cm  
- Livello attività: ${activity}
- Obiettivo: ${goal}
- Allergie: ${formData.allergie?.join(', ') || 'Nessuna'}
- Preferenze: ${formData.preferenze?.join(', ') || 'Standard'}
- Durata piano: ${formData.durata} giorni
- Pasti al giorno: ${numMeals}

CALCOLI SCIENTIFICI COMPLETATI:
- BMR (Metabolismo Basale): ${Math.round(bmr)} kcal/giorno
- TDEE (Fabbisogno Totale): ${Math.round(tdee)} kcal/giorno  
- Target Giornaliero: ${Math.round(safeCalories)} kcal/giorno (sicuro per ${goal})

DISTRIBUZIONE CALORICA OBBLIGATORIA PER OGNI GIORNO:
- Colazione: ${mealCalories.colazione} kcal (25%)
- Pranzo: ${mealCalories.pranzo} kcal (35%)
- Cena: ${mealCalories.cena} kcal (30%)
${numMeals >= 4 ? `- Spuntino 1: ${mealCalories.spuntino1} kcal (10%)` : ''}
${numMeals >= 5 ? `- Spuntino 2: ${mealCalories.spuntino2} kcal (10%)` : ''}
${numMeals >= 6 ? `- Spuntino 3: ${mealCalories.spuntino3} kcal (8%)` : ''}

TOTALE GIORNALIERO RICHIESTO: ${Math.round(safeCalories)} kcal

ISTRUZIONI PRECISE:
1. Crea ESATTAMENTE ${formData.durata} giorni di piano
2. Ogni giorno deve avere ESATTAMENTE ${Math.round(safeCalories)} kcal
3. Rispetta RIGOROSAMENTE la distribuzione calorica per pasto
4. Ogni ricetta deve includere: nome, calorie precise, proteine, carboidrati, grassi, ingredienti con quantità, preparazione
5. Prioritizza ingredienti fitness-friendly per ${goal}
6. Evita assolutamente ${formData.allergie?.join(', ') || 'nulla'}
7. Includi variazioni tra i giorni ma mantieni le calorie costanti
8. Aggiungi una lista della spesa consolidata finale

FORMATO RICHIESTO:
=== PIANO ALIMENTARE PERSONALIZZATO ===
Target giornaliero: ${Math.round(safeCalories)} kcal

GIORNO 1:
🌅 COLAZIONE (${mealCalories.colazione} kcal)
[Ricetta dettagliata con ingredienti e quantità precise]

☀️ PRANZO (${mealCalories.pranzo} kcal)  
[Ricetta dettagliata con ingredienti e quantità precise]

🌙 CENA (${mealCalories.cena} kcal)
[Ricetta dettagliata con ingredienti e quantità precise]

${numMeals >= 4 ? `🍎 SPUNTINO 1 (${mealCalories.spuntino1} kcal)\n[Ricetta dettagliata]` : ''}

[Continua per ${formData.durata} giorni...]

=== LISTA DELLA SPESA ===
[Lista consolidata per tutti i giorni]

IMPORTANTE: Ogni giorno deve sommare ESATTAMENTE ${Math.round(safeCalories)} kcal. NON dividere per giorni!`;

    console.log('🤖 Sending scientific prompt to Claude AI...');
    
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4000,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const aiResponse = message.content[0].type === 'text' ? message.content[0].text : '';
    
    console.log('✅ Claude AI generated scientifically accurate plan');
    
    return NextResponse.json({
      success: true,
      piano: aiResponse,
      message: 'Piano scientifico generato!',
      metadata: {
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        dailyTarget: Math.round(safeCalories),
        mealDistribution: mealCalories,
        isCalorieSafe: safeCalories >= bmr * 1.1
      }
    });

  } catch (error) {
    console.error('❌ Errore nella generazione scientifica:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Errore nella creazione del piano scientifico',
      details: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { status: 500 });
  }
}

// NUOVO: Endpoint per sostituzioni pasti con calcoli precisi
export async function PUT(request: NextRequest) {
  try {
    const { mealType, dayNumber, currentPlan, formData } = await request.json();
    
    // Calcola calorie target per il pasto specifico
    const dailyCalories = calculateDailyCalories(formData);
    const mealCalories = calculateMealCalories(dailyCalories, mealType);

    const prompt = `Sostituisci il ${mealType} del ${dayNumber} con una nuova ricetta ESATTAMENTE da ${mealCalories} kcal.
    
    Utente: ${formData.nome}, obiettivo: ${formData.obiettivo}
    Allergie: ${formData.allergie?.join(', ') || 'Nessuna'}
    Target calorico PRECISO: ${mealCalories} kcal
    
    Piano attuale: ${currentPlan}
    
    Fornisci UNA SOLA ricetta sostitutiva che rispetti ESATTAMENTE ${mealCalories} kcal.
    Include: nome, calorie precise, proteine, carboidrati, grassi, ingredienti con quantità, preparazione.`;

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const newMeal = message.content[0].type === 'text' ? message.content[0].text : '';
    
    return NextResponse.json({
      success: true,
      updatedPlan: `${currentPlan}\n\n--- SOSTITUZIONE ---\n${newMeal}`,
      newMeal: newMeal,
      targetCalories: mealCalories
    });

  } catch (error) {
    console.error('❌ Errore sostituzione scientifica:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Errore nella sostituzione del pasto'
    }, { status: 500 });
  }
}

// 🧮 Helper function per calcoli calorie
function calculateDailyCalories(formData: any): number {
  const age = parseInt(formData.eta) || 30;
  const weight = parseFloat(formData.peso) || 70;
  const height = parseFloat(formData.altezza) || 170;
  const gender = formData.sesso || 'maschio';
  const activity = formData.attivita || 'leggero';
  const goal = formData.obiettivo || 'mantenimento';
  
  // BMR calculation
  let bmr;
  if (gender === 'maschio') {
    bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }
  
  // Activity and goal factors
  const activityFactors: { [key: string]: number } = {
    'sedentario': 1.2, 'leggero': 1.375, 'moderato': 1.55, 'intenso': 1.725
  };
  const goalFactors: { [key: string]: number } = {
    'perdita-peso': 0.85, 'mantenimento': 1.0, 'aumento-massa': 1.15
  };
  
  const tdee = bmr * (activityFactors[activity] || 1.375);
  const dailyCalories = tdee * (goalFactors[goal] || 1.0);
  
  return Math.max(dailyCalories, bmr * 1.1); // Safety check
}

// 🍽️ Helper function per calorie pasto
function calculateMealCalories(dailyCalories: number, mealType: string): number {
  const distribution: { [key: string]: number } = {
    'colazione': 0.25, 'pranzo': 0.35, 'cena': 0.30,
    'spuntino1': 0.10, 'spuntino2': 0.10, 'spuntino3': 0.08
  };
  
  return Math.round(dailyCalories * (distribution[mealType] || 0.25));
}