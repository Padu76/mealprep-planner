import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { formData, mealType, dayNumber, currentPlan } = await request.json();
    
    console.log('🤖 Claude AI replace meal request:', { mealType, dayNumber });
    
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('❌ ANTHROPIC_API_KEY not found');
      return NextResponse.json({
        success: false,
        error: 'Configurazione AI non trovata'
      }, { status: 500 });
    }

    // Calcola calorie target per il pasto
    const calorieTarget = calculateMealCalories(formData, mealType);
    
    // Prompt dettagliato per Claude AI
    const prompt = `Sei un nutrizionista esperto. Devi creare una ricetta completa per sostituire un pasto.

DATI UTENTE:
- Nome: ${formData.nome}
- Età: ${formData.eta} anni, Sesso: ${formData.sesso}
- Peso: ${formData.peso}kg, Altezza: ${formData.altezza}cm
- Attività: ${formData.attivita}, Obiettivo: ${formData.obiettivo}
- Allergie: ${formData.allergie || 'Nessuna'}
- Preferenze: ${formData.preferenze || 'Nessuna'}

PASTO DA SOSTITUIRE: ${mealType} (${dayNumber})
CALORIE TARGET: ~${calorieTarget} kcal

REQUISITI:
1. Rispetta allergie e preferenze alimentari
2. Adatto a ${formData.obiettivo}
3. Bilanciato nutrizionalmente
4. Ingredienti facilmente reperibili in Italia
5. Preparazione pratica per meal prep

FORMATO RISPOSTA (JSON):
{
  "newMeal": {
    "nome": "Nome ricetta appetitoso",
    "calorie": numero_intero,
    "proteine": numero_intero,
    "carboidrati": numero_intero, 
    "grassi": numero_intero,
    "tempo": "XX min",
    "porzioni": 1,
    "ingredienti": [
      "XXg ingrediente specifico con quantità",
      "XXg altro ingrediente",
      "..."
    ],
    "preparazione": "Descrizione dettagliata passo-passo per la preparazione e conservazione meal prep"
  }
}

ESEMPI DI NOMI CREATIVI:
- Colazione: "Bowl Energetico ai Superfood", "Toast Gourmet Proteico"
- Pranzo: "Risotto Cremoso alle Verdure", "Buddha Bowl Mediterraneo"
- Cena: "Salmone in Crosta Aromatica", "Curry di Lenticchie Speziato"
- Spuntino: "Energy Balls al Cioccolato", "Smoothie Bowl Tropicale"

Rispondi SOLO con JSON valido, senza testo aggiuntivo.`;

    console.log('🤖 Calling Claude AI for meal replacement...');
    
    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1500,
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
      throw new Error('Risposta AI non valida');
    }

    console.log('🤖 Claude AI meal response:', aiResponse.text);

    // Parse della risposta AI
    let parsedResponse;
    try {
      const cleanResponse = aiResponse.text.trim();
      parsedResponse = JSON.parse(cleanResponse);
    } catch (parseError) {
      console.error('❌ Parse error:', parseError);
      console.log('Raw AI response:', aiResponse.text);
      
      // Fallback con ricetta generica
      parsedResponse = {
        newMeal: generateFallbackMeal(mealType, calorieTarget, formData)
      };
    }

    // Valida la struttura
    if (!parsedResponse.newMeal || !parsedResponse.newMeal.nome) {
      throw new Error('Formato risposta AI non valido');
    }

    console.log('✅ Generated meal:', parsedResponse.newMeal.nome);

    return NextResponse.json({
      success: true,
      newMeal: parsedResponse.newMeal,
      mealType: mealType,
      dayNumber: dayNumber,
      message: `Claude AI ha creato: ${parsedResponse.newMeal.nome}`,
      isAI: true
    });
    
  } catch (error) {
    console.error('❌ Claude AI meal replacement error:', error);
    
    // Fallback con ricetta intelligente
    const calorieTarget = calculateMealCalories(request.formData, request.mealType);
    const fallbackMeal = generateFallbackMeal(request.mealType, calorieTarget, request.formData);
    
    return NextResponse.json({
      success: true,
      newMeal: fallbackMeal,
      mealType: request.mealType,
      dayNumber: request.dayNumber,
      message: `Ricetta di fallback: ${fallbackMeal.nome}`,
      isAI: false
    });
  }
}

// Calcola calorie target per il pasto specifico
function calculateMealCalories(formData: any, mealType: string): number {
  const age = parseInt(formData.eta) || 30;
  const weight = parseFloat(formData.peso) || 70;
  const height = parseFloat(formData.altezza) || 170;
  const gender = formData.sesso || 'maschio';
  
  // Calcolo BMR
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
    'intenso': 1.725
  };
  
  // Fattore obiettivo
  const goalFactors: { [key: string]: number } = {
    'perdita-peso': 0.85,
    'mantenimento': 1.0,
    'aumento-massa': 1.15
  };
  
  const dailyCalories = bmr * (activityFactors[formData.attivita] || 1.375) * (goalFactors[formData.obiettivo] || 1.0);
  
  // Distribuzione calorie per pasto
  const mealDistribution: { [key: string]: number } = {
    'colazione': 0.25,
    'spuntino1': 0.10,
    'pranzo': 0.35,
    'spuntino2': 0.10,
    'cena': 0.30,
    'spuntino3': 0.10
  };
  
  return Math.round(dailyCalories * (mealDistribution[mealType] || 0.25));
}

// Genera pasto di fallback intelligente
function generateFallbackMeal(mealType: string, calories: number, formData: any) {
  const mealTemplates: { [key: string]: any } = {
    colazione: {
      nome: "Toast Proteico Bilanciato",
      calorie: calories,
      proteine: Math.round(calories * 0.20 / 4),
      carboidrati: Math.round(calories * 0.50 / 4),
      grassi: Math.round(calories * 0.30 / 9),
      tempo: "15 min",
      porzioni: 1,
      ingredienti: [
        "2 fette pane integrale (60g)",
        "1 uovo fresco",
        "1/2 avocado (80g)",
        "10g formaggio spalmabile",
        "Pepe nero q.b."
      ],
      preparazione: "Tosta il pane, spalma il formaggio, aggiungi avocado schiacciato e uovo (sodo o in camicia). Conserva l'avocado con limone per il meal prep."
    },
    pranzo: {
      nome: "Bowl Mediterraneo Bilanciato",
      calorie: calories,
      proteine: Math.round(calories * 0.25 / 4),
      carboidrati: Math.round(calories * 0.45 / 4),
      grassi: Math.round(calories * 0.30 / 9),
      tempo: "25 min",
      porzioni: 1,
      ingredienti: [
        "80g quinoa",
        "100g pollo a cubetti",
        "80g zucchine",
        "60g pomodorini",
        "40g feta",
        "1 cucchiaio olio EVO"
      ],
      preparazione: "Cuoci quinoa e pollo. Grigliale verdure. Assembla in bowl e conserva in frigorifero fino a 3 giorni."
    },
    cena: {
      nome: "Salmone alle Erbe con Contorno",
      calorie: calories,
      proteine: Math.round(calories * 0.35 / 4),
      carboidrati: Math.round(calories * 0.25 / 4),
      grassi: Math.round(calories * 0.40 / 9),
      tempo: "30 min",
      porzioni: 1,
      ingredienti: [
        "120g filetto di salmone",
        "100g broccoli",
        "80g patate dolci",
        "1 cucchiaio olio EVO",
        "Erbe aromatiche miste"
      ],
      preparazione: "Cuoci il salmone in forno con erbe, vapore per broccoli, patate dolci al forno. Ottimo per meal prep."
    }
  };
  
  return mealTemplates[mealType] || mealTemplates.pranzo;
}