import { NextRequest, NextResponse } from 'next/server';

// 🤖 API BACKEND - GENERATORE AI RICETTE
export async function POST(request: NextRequest) {
  console.log('🤖 [API] AI Recipe Generator started');
  
  try {
    const body = await request.json();
    const { ingredienti, obiettivo, categoria, tempoMax, allergie } = body;
    
    console.log('📝 [API] Request data:', { ingredienti, obiettivo, categoria, tempoMax, allergie });
    
    // 🧩 VALIDAZIONE INPUT
    if (!ingredienti || !Array.isArray(ingredienti) || ingredienti.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Ingredienti richiesti'
      }, { status: 400 });
    }
    
    // 🎯 MAPPATURA OBIETTIVI AI
    const obiettivoMapping: { [key: string]: any } = {
      'bilanciata': { caloriePer100g: 160, proteinePct: 25, carbsPct: 45, grassiPct: 30 },
      'dimagrimento': { caloriePer100g: 120, proteinePct: 35, carbsPct: 30, grassiPct: 35 },
      'massa': { caloriePer100g: 200, proteinePct: 25, carbsPct: 50, grassiPct: 25 },
      'keto': { caloriePer100g: 180, proteinePct: 25, carbsPct: 5, grassiPct: 70 },
      'vegana': { caloriePer100g: 140, proteinePct: 20, carbsPct: 55, grassiPct: 25 },
      'mediterranea': { caloriePer100g: 170, proteinePct: 20, carbsPct: 50, grassiPct: 30 }
    };
    
    const targetNutrition = obiettivoMapping[obiettivo] || obiettivoMapping['bilanciata'];
    
    // 🧠 PROMPT AI AVANZATO
    const aiPrompt = `
Sei un chef esperto e nutrizionista. Crea una ricetta italiana FITNESS-OTTIMIZZATA con questi parametri:

INGREDIENTI DISPONIBILI: ${ingredienti.join(', ')}
OBIETTIVO NUTRIZIONALE: ${obiettivo}
CATEGORIA: ${categoria}
TEMPO MASSIMO: ${tempoMax} minuti
ALLERGIE DA EVITARE: ${allergie.length > 0 ? allergie.join(', ') : 'Nessuna'}

REQUISITI OBBLIGATORI:
1. USA SOLO gli ingredienti forniti (massimo 2-3 ingredienti aggiuntivi comuni come sale, pepe, olio)
2. Ricetta completa con nome accattivante
3. Valori nutrizionali precisi per 1 porzione
4. Preparazione step-by-step dettagliata (4-6 step)
5. Tempo realistico entro ${tempoMax} minuti

TARGET NUTRIZIONALE (1 porzione):
- Calorie: ${Math.round(targetNutrition.caloriePer100g * 2.5)} kcal circa
- Proteine: ${targetNutrition.proteinePct}% delle calorie
- Carboidrati: ${targetNutrition.carbsPct}% delle calorie  
- Grassi: ${targetNutrition.grassiPct}% delle calorie

RISPONDI SOLO CON QUESTO FORMATO JSON ESATTO:
{
  "nome": "Nome ricetta accattivante",
  "ingredienti": ["ingrediente 1 con quantità", "ingrediente 2 con quantità", "ingrediente 3 con quantità"],
  "preparazione": "Step 1: Descrizione dettagliata. Step 2: Descrizione dettagliata. Step 3: Descrizione dettagliata. Step 4: Descrizione dettagliata.",
  "calorie": numero_calorie,
  "proteine": numero_grammi_proteine,
  "carboidrati": numero_grammi_carboidrati,
  "grassi": numero_grammi_grassi,
  "tempoPreparazione": numero_minuti,
  "porzioni": 1,
  "categoria": "${categoria}",
  "tipoDieta": ["${obiettivo}"],
  "difficolta": "facile",
  "allergie": []
}

IMPORTANTE: Rispondi SOLO con il JSON, nessun altro testo.
`;

    console.log('🧠 [API] Sending prompt to Claude...');
    
    // 🤖 CHIAMATA API CLAUDE
    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [
          { role: "user", content: aiPrompt }
        ]
      })
    });

    if (!claudeResponse.ok) {
      console.error('❌ [API] Claude API error:', claudeResponse.status);
      throw new Error(`Claude API error: ${claudeResponse.status}`);
    }

    const claudeData = await claudeResponse.json();
    console.log('✅ [API] Claude response received');
    
    let responseText = claudeData.content[0].text;
    console.log('📄 [API] Raw Claude response:', responseText);
    
    // 🧹 PULIZIA RISPOSTA (rimuovi markdown se presente)
    responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    // 📊 PARSING JSON
    let aiRecipe;
    try {
      aiRecipe = JSON.parse(responseText);
      console.log('✅ [API] JSON parsed successfully');
    } catch (parseError) {
      console.error('❌ [API] JSON parsing failed:', parseError);
      console.error('❌ [API] Raw text:', responseText);
      
      // 🔄 FALLBACK: Genera ricetta di backup
      aiRecipe = generateFallbackRecipe(ingredienti, obiettivo, categoria, tempoMax, targetNutrition);
      console.log('🔄 [API] Using fallback recipe');
    }
    
    // ✅ VALIDAZIONE RICETTA
    const validatedRecipe = validateAndFixRecipe(aiRecipe, ingredienti, obiettivo, categoria, tempoMax);
    
    console.log('🎉 [API] Recipe generation completed:', validatedRecipe.nome);
    
    return NextResponse.json({
      success: true,
      recipe: validatedRecipe,
      metadata: {
        aiGenerated: true,
        timestamp: new Date().toISOString(),
        targetNutrition: targetNutrition,
        originalIngredients: ingredienti
      }
    });
    
  } catch (error) {
    console.error('❌ [API] Recipe generation failed:', error);
    
    // 🆘 FALLBACK COMPLETO
    try {
      const body = await request.json();
      const fallbackRecipe = generateFallbackRecipe(
        body.ingredienti || ['pollo', 'verdure'], 
        body.obiettivo || 'bilanciata',
        body.categoria || 'pranzo',
        body.tempoMax || 30,
        obiettivoMapping[body.obiettivo] || obiettivoMapping['bilanciata']
      );
      
      return NextResponse.json({
        success: true,
        recipe: fallbackRecipe,
        metadata: {
          aiGenerated: false,
          fallback: true,
          timestamp: new Date().toISOString()
        }
      });
    } catch (fallbackError) {
      return NextResponse.json({
        success: false,
        error: 'Errore nella generazione della ricetta',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
  }
}

// 🔄 GENERATORE RICETTA FALLBACK
function generateFallbackRecipe(
  ingredienti: string[], 
  obiettivo: string, 
  categoria: string, 
  tempoMax: number,
  targetNutrition: any
) {
  console.log('🔄 [FALLBACK] Generating backup recipe');
  
  const baseCalories = Math.round(targetNutrition.caloriePer100g * 2.5);
  const proteine = Math.round((baseCalories * targetNutrition.proteinePct / 100) / 4);
  const carboidrati = Math.round((baseCalories * targetNutrition.carbsPct / 100) / 4);
  const grassi = Math.round((baseCalories * targetNutrition.grassiPct / 100) / 9);
  
  // 🎲 RICETTE TEMPLATE PER CATEGORIA
  const templates = {
    colazione: {
      nome: `Bowl Energetica con ${ingredienti[0] || 'Ingredienti Scelti'}`,
      preparazione: "Step 1: Prepara una bowl capiente e raccogli tutti gli ingredienti. Step 2: Disponi gli ingredienti principali nella bowl creando un mix colorato. Step 3: Aggiungi condimenti leggeri come olio, sale e spezie a piacere. Step 4: Mescola delicatamente e gusta la tua colazione energetica!"
    },
    pranzo: {
      nome: `Piatto Bilanciato con ${ingredienti[0] || 'Ingredienti Freschi'}`,
      preparazione: "Step 1: Prepara tutti gli ingredienti lavandoli e tagliandoli nelle dimensioni desiderate. Step 2: Scalda una padella con un filo d'olio e inizia la cottura degli ingredienti proteici. Step 3: Aggiungi verdure e altri ingredienti rispettando i tempi di cottura. Step 4: Aggiusta di sale, pepe e spezie, poi impiatta e servi caldo."
    },
    cena: {
      nome: `Cena Gourmet con ${ingredienti[0] || 'Ingredienti Selezionati'}`,
      preparazione: "Step 1: Preriscalda gli strumenti di cottura e prepara una mise en place con tutti gli ingredienti. Step 2: Inizia cuocendo gli ingredienti che richiedono più tempo, come proteine o cereali. Step 3: Aggiungi gradualmente gli altri ingredienti seguendo l'ordine di cottura. Step 4: Finalizza con condimenti e spezie, controlla la cottura e impiatta con eleganza."
    },
    spuntino: {
      nome: `Snack Fit con ${ingredienti[0] || 'Ingredienti Naturali'}`,
      preparazione: "Step 1: Assembla tutti gli ingredienti su una superficie pulita. Step 2: Combina gli ingredienti in porzioni equilibrate per creare bocconcini o mix. Step 3: Se necessario, raffredda in frigo per 10-15 minuti per rassodare. Step 4: Dividi in porzioni singole e gusta come spuntino energetico!"
    }
  };
  
  const template = templates[categoria as keyof typeof templates] || templates.pranzo;
  
  // 🥄 INGREDIENTI CON QUANTITÀ
  const ingredientiConQuantita = ingredienti.slice(0, 4).map((ing, index) => {
    const quantita = [
      '100g', '150g', '80g', '1 cucchiaio', '2 cucchiai', '1 tazza', '1/2 tazza'
    ][index % 7];
    return `${quantita} ${ing}`;
  });
  
  // Aggiungi condimenti base
  if (ingredientiConQuantita.length < 5) {
    ingredientiConQuantita.push('1 cucchiaio olio extravergine d\'oliva');
    ingredientiConQuantita.push('Sale e pepe q.b.');
  }
  
  return {
    nome: template.nome,
    ingredienti: ingredientiConQuantita,
    preparazione: template.preparazione,
    calorie: baseCalories,
    proteine: proteine,
    carboidrati: carboidrati,
    grassi: grassi,
    tempoPreparazione: Math.min(tempoMax, 25),
    porzioni: 1,
    categoria: categoria,
    tipoDieta: [obiettivo],
    difficolta: "facile" as const,
    allergie: []
  };
}

// ✅ VALIDATORE E CORRETTORE RICETTA
function validateAndFixRecipe(recipe: any, ingredienti: string[], obiettivo: string, categoria: string, tempoMax: number) {
  console.log('✅ [VALIDATION] Validating recipe structure');
  
  // 🔧 Correggi campi mancanti o errati
  const validated = {
    nome: recipe.nome || `Ricetta ${categoria} con ${ingredienti[0]}`,
    ingredienti: Array.isArray(recipe.ingredienti) ? recipe.ingredienti : [
      `100g ${ingredienti[0]}`,
      `50g ${ingredienti[1] || 'condimento'}`,
      'Sale e pepe q.b.'
    ],
    preparazione: recipe.preparazione || "Step 1: Prepara gli ingredienti. Step 2: Cuoci seguendo la ricetta. Step 3: Aggiusta i sapori. Step 4: Servi e gusta!",
    calorie: Number(recipe.calorie) || 350,
    proteine: Number(recipe.proteine) || 25,
    carboidrati: Number(recipe.carboidrati) || 30,
    grassi: Number(recipe.grassi) || 15,
    tempoPreparazione: Math.min(Number(recipe.tempoPreparazione) || 20, tempoMax),
    porzioni: Number(recipe.porzioni) || 1,
    categoria: categoria,
    tipoDieta: Array.isArray(recipe.tipoDieta) ? recipe.tipoDieta : [obiettivo],
    difficolta: recipe.difficolta || "facile",
    allergie: Array.isArray(recipe.allergie) ? recipe.allergie : []
  };
  
  // 🧮 VALIDAZIONE NUTRIZIONALE (somma calorie deve essere coerente)
  const calorieDaMacro = (validated.proteine * 4) + (validated.carboidrati * 4) + (validated.grassi * 9);
  const differenza = Math.abs(validated.calorie - calorieDaMacro);
  
  if (differenza > 50) {
    console.log('🔧 [VALIDATION] Adjusting nutritional values for consistency');
    // Riscala i macro per essere coerenti con le calorie
    const fattoreScala = validated.calorie / calorieDaMacro;
    validated.proteine = Math.round(validated.proteine * fattoreScala);
    validated.carboidrati = Math.round(validated.carboidrati * fattoreScala);
    validated.grassi = Math.round(validated.grassi * fattoreScala);
  }
  
  console.log('✅ [VALIDATION] Recipe validated successfully');
  return validated;
}

// 🚫 GESTIONE ALTRI METODI HTTP
export async function GET() {
  return NextResponse.json({
    message: "AI Recipe Generator API",
    status: "active",
    methods: ["POST"],
    version: "1.0.0"
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}