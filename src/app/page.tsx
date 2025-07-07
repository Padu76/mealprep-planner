import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { ingredient, userPreferences, allergies, mealContext } = await request.json();

    if (!ingredient) {
      return NextResponse.json({ 
        success: false, 
        error: 'Ingrediente mancante' 
      });
    }

    const prompt = `Sei un nutrizionista esperto e chef professionista. L'utente vuole sostituire questo ingrediente: "${ingredient}" nel contesto di "${mealContext}".

INFORMAZIONI UTENTE:
- Allergie/Intolleranze: ${allergies || 'Nessuna'}
- Preferenze alimentari: ${userPreferences || 'Nessuna'}

RICHIESTA: Suggerisci 3-5 alternative intelligenti per sostituire l'ingrediente considerando:
1. Funzione culinaria dell'ingrediente originale
2. Valori nutrizionali simili
3. Compatibilità con allergie e preferenze dell'utente
4. Facilità di sostituzione
5. Disponibilità degli ingredienti

FORMATO RISPOSTA (JSON):
{
  "substitutes": [
    {
      "ingredient": "Nome ingrediente sostituto",
      "reason": "Spiegazione dettagliata del perché è una buona alternativa",
      "difficulty": "Facile/Medio/Difficile",
      "tasteChange": "Minimo/Moderato/Significativo",
      "cookingNotes": "Note di preparazione se necessarie (opzionale)"
    }
  ]
}

Rispondi SOLO con JSON valido, senza testo aggiuntivo.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Risposta API non valida');
    }

    let aiResponse;
    try {
      aiResponse = JSON.parse(content.text);
    } catch (parseError) {
      console.error('Errore parsing JSON AI:', parseError);
      console.log('Risposta AI raw:', content.text);
      
      // Fallback con sostituti generici
      aiResponse = {
        substitutes: [
          {
            ingredient: "Ingrediente alternativo generico",
            reason: "Sostituto base che mantiene le caratteristiche nutrizionali simili",
            difficulty: "Medio",
            tasteChange: "Moderato",
            cookingNotes: "Adatta le quantità secondo le necessità"
          }
        ]
      };
    }

    // Validazione e filtro per allergie
    if (aiResponse.substitutes && Array.isArray(aiResponse.substitutes)) {
      aiResponse.substitutes = aiResponse.substitutes.filter(sub => {
        if (!allergies) return true;
        
        const allergyList = allergies.toLowerCase();
        const ingredientName = sub.ingredient.toLowerCase();
        
        // Filtri base per allergie comuni
        if (allergyList.includes('glutine') && 
            (ingredientName.includes('farina') || ingredientName.includes('pane') || 
             ingredientName.includes('pasta') || ingredientName.includes('orzo'))) {
          return false;
        }
        
        if (allergyList.includes('lattosio') && 
            (ingredientName.includes('latte') || ingredientName.includes('formaggio') || 
             ingredientName.includes('yogurt') || ingredientName.includes('burro'))) {
          return false;
        }
        
        if (allergyList.includes('noci') && 
            (ingredientName.includes('noci') || ingredientName.includes('mandorle') || 
             ingredientName.includes('pistacchi') || ingredientName.includes('nocciole'))) {
          return false;
        }
        
        return true;
      });
    }

    return NextResponse.json({
      success: true,
      substitutes: aiResponse.substitutes || []
    });

  } catch (error) {
    console.error('Errore API substitute-ingredient:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Errore nel servizio di sostituzione ingredienti',
      details: error instanceof Error ? error.message : 'Errore sconosciuto'
    });
  }
}