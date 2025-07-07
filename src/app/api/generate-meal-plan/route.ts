import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    
    const prompt = `Crea un piano alimentare per ${formData.nome}, età ${formData.eta}, obiettivo ${formData.obiettivo}, per ${formData.durata} giorni. Include ricette dettagliate e lista spesa.`;

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 3000,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const aiResponse = message.content[0].type === 'text' ? message.content[0].text : '';
    
    return NextResponse.json({
      success: true,
      piano: aiResponse,
      message: 'Piano generato!'
    });

  } catch (error) {
    console.error('Errore:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Errore nella creazione del piano',
      details: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { status: 500 });
  }
}

// NUOVO: Endpoint per sostituzioni pasti
export async function PUT(request: NextRequest) {
  try {
    const { mealType, dayNumber, currentPlan, formData } = await request.json();

    const prompt = `Sostituisci il ${mealType} del ${dayNumber} con una nuova ricetta simile per calorie ma diversa. 
    
    Utente: ${formData.nome}, obiettivo: ${formData.obiettivo}
    Allergie: ${formData.allergie || 'Nessuna'}
    
    Piano attuale: ${currentPlan}
    
    Fornisci UNA SOLA ricetta sostitutiva in formato simile al piano esistente.`;

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 800,
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
      newMeal: newMeal
    });

  } catch (error) {
    console.error('Errore sostituzione:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Errore nella sostituzione del pasto'
    }, { status: 500 });
  }
}