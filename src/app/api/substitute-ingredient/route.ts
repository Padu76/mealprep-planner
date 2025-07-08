import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { ingredient, userPreferences, allergies, mealContext } = await request.json();
    
    console.log('🔀 Substitute ingredient request:', ingredient);
    
    // Mock substitutes based on ingredient type
    const getSubstitutes = (ingredientName: string) => {
      const lower = ingredientName.toLowerCase();
      
      if (lower.includes('pane') || lower.includes('bread')) {
        return [
          {
            ingredient: "Pane di segale integrale",
            reason: "Più fibre e nutrienti, sapore più intenso ma simile utilizzo",
            difficulty: "Facile" as const,
            tasteChange: "Minimo" as const,
            cookingNotes: "Stesso tempo di tostatura, texture leggermente più densa"
          },
          {
            ingredient: "Tortillas di mais",
            reason: "Senza glutine, più leggere e versatili per wrap",
            difficulty: "Facile" as const,
            tasteChange: "Moderato" as const,
            cookingNotes: "Scalda 30 secondi in padella per renderle morbide"
          }
        ];
      }
      
      if (lower.includes('pasta')) {
        return [
          {
            ingredient: "Pasta di lenticchie rosse",
            reason: "Più proteine, senza glutine, stesso tempo di cottura",
            difficulty: "Facile" as const,
            tasteChange: "Minimo" as const,
            cookingNotes: "Cuoci 1-2 minuti in meno rispetto alla pasta normale"
          },
          {
            ingredient: "Zucchine a julienne",
            reason: "Meno carboidrati, più verdure, texture diversa ma interessante",
            difficulty: "Medio" as const,
            tasteChange: "Significativo" as const,
            cookingNotes: "Saltare 2-3 minuti in padella, non far diventare mollicci"
          }
        ];
      }
      
      if (lower.includes('manzo') || lower.includes('carne')) {
        return [
          {
            ingredient: "Tofu marinato",
            reason: "Alternativa vegetale, stesso contenuto proteico",
            difficulty: "Medio" as const,
            tasteChange: "Significativo" as const,
            cookingNotes: "Marinare 30 min prima, cuocere 4-5 minuti per lato"
          },
          {
            ingredient: "Petto di pollo",
            reason: "Meno grassi, più magro, sapore più delicato",
            difficulty: "Facile" as const,
            tasteChange: "Moderato" as const,
            cookingNotes: "Tempo di cottura simile, battere per uniformare lo spessore"
          }
        ];
      }
      
      if (lower.includes('uovo')) {
        return [
          {
            ingredient: "Aquafaba montata",
            reason: "Alternativa vegana, simile consistenza quando montata",
            difficulty: "Difficile" as const,
            tasteChange: "Moderato" as const,
            cookingNotes: "Montare 10 minuti con frusta elettrica fino a picchi"
          },
          {
            ingredient: "Tofu scramble",
            reason: "Ricco di proteine, texture simile all'uovo strapazzato",
            difficulty: "Medio" as const,
            tasteChange: "Moderato" as const,
            cookingNotes: "Sbriciolate e cuocere con curcuma per il colore"
          }
        ];
      }
      
      // Default substitutes
      return [
        {
          ingredient: "Ingrediente sostitutivo generico",
          reason: "Alternativa con caratteristiche simili all'ingrediente originale",
          difficulty: "Medio" as const,
          tasteChange: "Moderato" as const,
          cookingNotes: "Seguire le istruzioni standard di preparazione"
        }
      ];
    };
    
    const substitutes = getSubstitutes(ingredient);
    
    // Simulate some AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return NextResponse.json({
      success: true,
      substitutes: substitutes,
      message: `Trovate ${substitutes.length} alternative per ${ingredient}`
    });
    
  } catch (error) {
    console.error('❌ Substitute ingredient error:', error);
    return NextResponse.json({
      success: false,
      error: 'Errore nella ricerca di sostituti',
      details: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { status: 500 });
  }
}