import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { ingredient, userPreferences, allergies, mealContext } = await request.json();
    
    console.log('🔀 Substitute ingredient request:', ingredient);
    console.log('🔍 Analyzing ingredient:', ingredient.toLowerCase());
    
    // Mock substitutes based on ingredient type
    const getSubstitutes = (ingredientName: string) => {
      const lower = ingredientName.toLowerCase();
      
      console.log('🕵️ Checking patterns for:', lower);
      
      // More comprehensive pattern matching
      if (lower.includes('mandorl') || lower.includes('almond')) {
        console.log('✅ Found mandorle pattern');
        return [
          {
            ingredient: "5g noci tritate",
            reason: "Stesse proprietà nutrizionali, ricche di omega-3 e grassi buoni",
            difficulty: "Facile" as const,
            tasteChange: "Minimo" as const,
            cookingNotes: "Utilizzare nella stessa quantità, leggermente più oleose"
          },
          {
            ingredient: "5g semi di girasole",
            reason: "Croccantezza simile, più economici, ricchi di vitamina E",
            difficulty: "Facile" as const,
            tasteChange: "Moderato" as const,
            cookingNotes: "Stesso utilizzo, sapore più neutro"
          }
        ];
      }
      
      if (lower.includes('avocado')) {
        console.log('✅ Found avocado pattern');
        return [
          {
            ingredient: "Hummus di ceci (2 cucchiai)",
            reason: "Stessa cremosità e grassi sani, ricco di proteine vegetali",
            difficulty: "Facile" as const,
            tasteChange: "Moderato" as const,
            cookingNotes: "Spalmare direttamente sul pane, aggiungere un filo d'olio se necessario"
          },
          {
            ingredient: "Ricotta fresca (60g)",
            reason: "Texture cremosa simile, più proteine e meno grassi",
            difficulty: "Facile" as const,
            tasteChange: "Moderato" as const,
            cookingNotes: "Aggiungere un pizzico di sale e pepe, mescolare bene"
          }
        ];
      }
      
      if (lower.includes('pane') || lower.includes('toast') || lower.includes('fett')) {
        console.log('✅ Found pane pattern');
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
      
      if (lower.includes('uovo') || lower.includes('egg')) {
        console.log('✅ Found uovo pattern');
        return [
          {
            ingredient: "Tofu scramble (60g)",
            reason: "Ricco di proteine, texture simile all'uovo strapazzato",
            difficulty: "Medio" as const,
            tasteChange: "Moderato" as const,
            cookingNotes: "Sbriciolate e cuocere con curcuma per il colore"
          },
          {
            ingredient: "2 albumi d'uovo",
            reason: "Solo proteine, senza colesterolo, più leggero",
            difficulty: "Facile" as const,
            tasteChange: "Minimo" as const,
            cookingNotes: "Montare leggermente prima di cuocere"
          }
        ];
      }
      
      if (lower.includes('pasta') || lower.includes('spaghetti') || lower.includes('penne')) {
        console.log('✅ Found pasta pattern');
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
      
      // Pattern più ampi per catturare più ingredienti
      if (lower.includes('gram') || lower.includes('g ') || lower.includes('cucchiai') || lower.includes('cucchiaino')) {
        // Ingrediente con quantità ma non matchato sopra
        console.log('✅ Found generic ingredient with quantity');
        return [
          {
            ingredient: "Ingrediente alternativo di stagione",
            reason: "Scegli un ingrediente simile disponibile localmente",
            difficulty: "Medio" as const,
            tasteChange: "Moderato" as const,
            cookingNotes: "Adatta le quantità in base al gusto personale"
          },
          {
            ingredient: "Versione biologica dello stesso ingrediente",
            reason: "Stessa funzione ma qualità superiore e più sostenibile",
            difficulty: "Facile" as const,
            tasteChange: "Minimo" as const,
            cookingNotes: "Utilizzare nelle stesse quantità dell'originale"
          }
        ];
      }
      
      // Default fallback migliorato
      console.log('❌ No specific pattern found, using enhanced default');
      return [
        {
          ingredient: "Ingrediente stagionale equivalente",
          reason: "Sostituisci con un ingrediente di stagione dalle proprietà nutrizionali simili",
          difficulty: "Medio" as const,
          tasteChange: "Moderato" as const,
          cookingNotes: "Consulta un nutrizionista per sostituzioni specifiche"
        },
        {
          ingredient: "Versione integrale/biologica",
          reason: "Stessa base ma versione più nutriente e sostenibile",
          difficulty: "Facile" as const,
          tasteChange: "Minimo" as const,
          cookingNotes: "Utilizzare nelle stesse modalità dell'ingrediente originale"
        }
      ];
    };
    
    const substitutes = getSubstitutes(ingredient);
    
    console.log('🎯 Generated substitutes:', substitutes.length);
    
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