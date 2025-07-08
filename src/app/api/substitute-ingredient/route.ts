import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { ingredient, recipe, allergies, preferences } = await request.json();

    if (!ingredient || !recipe) {
      return NextResponse.json({
        success: false,
        error: 'Ingrediente e ricetta sono richiesti'
      }, { status: 400 });
    }

    const prompt = `Sono un assistente esperto di cucina. L'utente vuole sostituire un ingrediente nella sua ricetta.

RICETTA: "${recipe.nome}"
INGREDIENTE DA SOSTITUIRE: "${ingredient}"
ALLERGIE/INTOLLERANZE: ${allergies || 'Nessuna'}
PREFERENZE: ${preferences || 'Nessuna'}

LISTA INGREDIENTI COMPLETA:
${recipe.ingredienti.join('\n')}

ISTRUZIONI:
Fornisci 3-5 alternative intelligenti per sostituire l'ingrediente, considerando:
1. Funzione culinaria (addensante, proteina, grasso, etc.)
2. Sapore compatibile
3. Consistenza simile
4. Disponibilità comune
5. Allergie e preferenze dell'utente

FORMATO RISPOSTA (JSON):
{
  "substitutions": [
    {
      "name": "Nome sostituto",
      "quantity": "Quantità suggerita",
      "reason": "Perché funziona bene",
      "difficulty": "Facile|Medio|Difficile",
      "taste_change": "Nessuno|Leggero|Moderato",
      "cooking_adjustment": "Eventuali modifiche alla cottura"
    }
  ],
  "tips": "Consigli generali per la sostituzione"
}

IMPORTANTE: Rispondi SOLO con il JSON valido, senza altri testi.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    
    try {
      const substitutionData = JSON.parse(responseText);
      
      return NextResponse.json({
        success: true,
        data: substitutionData,
        original_ingredient: ingredient
      });
    } catch (parseError) {
      console.error('Errore parsing risposta AI:', parseError);
      return NextResponse.json({
        success: false,
        error: 'Errore nell\'elaborazione della risposta AI'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Errore API sostituzione ingredienti:', error);
    return NextResponse.json({
      success: false,
      error: 'Errore interno del server'
    }, { status: 500 });
  }
}