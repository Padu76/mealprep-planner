import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { ingredient, userPreferences, allergies, mealContext } = await request.json();
    
    console.log('🤖 Claude AI substitute request:', ingredient);
    
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('❌ ANTHROPIC_API_KEY not found');
      return NextResponse.json({
        success: false,
        error: 'Configurazione AI non trovata'
      }, { status: 500 });
    }

    // Prompt per Claude AI
    const prompt = `Sei un esperto nutrizionista e chef. Devi suggerire 3 alternative intelligenti per sostituire questo ingrediente in una ricetta.

INGREDIENTE DA SOSTITUIRE: "${ingredient}"

CONTESTO:
- Pasto: ${mealContext || 'Non specificato'}
- Preferenze alimentari: ${userPreferences || 'Nessuna'}
- Allergie/Intolleranze: ${allergies || 'Nessuna'}

ISTRUZIONI:
1. Suggerisci esattamente 3 alternative specifiche e pratiche
2. Considera le allergie e preferenze dell'utente
3. Mantieni funzione culinaria simile (texture, sapore, nutrienti)
4. Includi quantità specifiche quando possibile

FORMATO RISPOSTA (JSON):
{
  "substitutes": [
    {
      "ingredient": "Nome specifico con quantità",
      "reason": "Spiegazione nutrizionale e culinaria",
      "difficulty": "Facile|Medio|Difficile",
      "tasteChange": "Minimo|Moderato|Significativo", 
      "cookingNotes": "Note pratiche per l'utilizzo"
    }
  ]
}

Rispondi SOLO con JSON valido, senza testo aggiuntivo.`;

    console.log('🤖 Calling Claude AI...');
    
    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
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
      throw new Error('Risposta AI non valida');
    }

    console.log('🤖 Claude AI response:', aiResponse.text);

    // Parse della risposta AI
    let parsedResponse;
    try {
      // Pulisci la risposta da eventuali caratteri extra
      const cleanResponse = aiResponse.text.trim();
      parsedResponse = JSON.parse(cleanResponse);
    } catch (parseError) {
      console.error('❌ Parse error:', parseError);
      console.log('Raw AI response:', aiResponse.text);
      
      // Fallback con alternative generiche ma intelligenti
      parsedResponse = {
        substitutes: [
          {
            ingredient: "Ingrediente equivalente biologico",
            reason: "Claude AI ha generato una risposta ma il formato non è stato riconosciuto. Usa un ingrediente simile disponibile localmente.",
            difficulty: "Medio",
            tasteChange: "Minimo",
            cookingNotes: "Adatta le quantità secondo il tuo gusto"
          }
        ]
      };
    }

    // Valida la struttura
    if (!parsedResponse.substitutes || !Array.isArray(parsedResponse.substitutes)) {
      throw new Error('Formato risposta AI non valido');
    }

    console.log('✅ Parsed substitutes:', parsedResponse.substitutes.length);

    return NextResponse.json({
      success: true,
      substitutes: parsedResponse.substitutes,
      message: `Claude AI ha trovato ${parsedResponse.substitutes.length} alternative per ${ingredient}`
    });
    
  } catch (error) {
    console.error('❌ Claude AI substitute error:', error);
    
    // Fallback con alternative intelligenti in caso di errore
    const fallbackSubstitutes = generateFallbackSubstitutes(ingredient);
    
    return NextResponse.json({
      success: true,
      substitutes: fallbackSubstitutes,
      message: `Alternative di fallback per ${ingredient}`,
      isAI: false
    });
  }
}

// Fallback intelligente quando Claude AI non è disponibile
function generateFallbackSubstitutes(ingredient: string) {
  const lower = ingredient.toLowerCase();
  
  if (lower.includes('mandorl') || lower.includes('noci') || lower.includes('nocciole')) {
    return [
      {
        ingredient: "Semi di girasole tostati",
        reason: "Croccantezza simile, ricchi di vitamina E, più economici",
        difficulty: "Facile",
        tasteChange: "Moderato",
        cookingNotes: "Tostare leggermente in padella per esaltare il sapore"
      },
      {
        ingredient: "Semi di zucca",
        reason: "Texture simile, ricchi di magnesio e zinco",
        difficulty: "Facile", 
        tasteChange: "Moderato",
        cookingNotes: "Utilizzare nelle stesse quantità"
      }
    ];
  }
  
  if (lower.includes('avocado')) {
    return [
      {
        ingredient: "Hummus di ceci",
        reason: "Cremosità simile, ricco di proteine e fibre",
        difficulty: "Facile",
        tasteChange: "Moderato", 
        cookingNotes: "Spalmare direttamente, aggiungere un filo d'olio"
      }
    ];
  }
  
  // Default fallback generico ma utile
  return [
    {
      ingredient: "Ingrediente stagionale equivalente",
      reason: "Scegli un ingrediente di stagione con proprietà nutrizionali simili",
      difficulty: "Medio",
      tasteChange: "Moderato",
      cookingNotes: "Adatta le quantità in base al gusto personale"
    },
    {
      ingredient: "Versione biologica/integrale",
      reason: "Stessa base ma versione più nutriente e sostenibile", 
      difficulty: "Facile",
      tasteChange: "Minimo",
      cookingNotes: "Utilizzare nelle stesse modalità dell'originale"
    }
  ];
}