import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Interfacce per le richieste AI
interface AIRecommendationRequest {
  userId?: string;
  preferences: string[];
  allergie: string[];
  obiettivo: string;
  pasti_preferiti: string[];
  ingredienti_disponibili?: string[];
  stagione?: string;
  limit?: number;
}

interface GenerateRecipeRequest {
  nome_richiesto?: string;
  categoria: 'colazione' | 'pranzo' | 'cena' | 'spuntino';
  ingredienti_base: string[];
  calorie_target: number;
  proteine_target: number;
  difficolta?: 'facile' | 'medio' | 'difficile';
  tempo_max?: number;
  allergie?: string[];
  stile_cucina?: string;
  obiettivo_fitness?: string;
}

interface NutritionalAnalysisRequest {
  ricette_settimana: string[];
  obiettivo_utente: string;
  peso: number;
  altezza: number;
  eta: number;
  attivita: string;
}

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();
    console.log(`🤖 API Ricette AI - Action: ${action}`);

    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn('⚠️ ANTHROPIC_API_KEY not found');
      return NextResponse.json({
        success: false,
        error: 'AI service not configured'
      }, { status: 500 });
    }

    switch (action) {
      case 'getAIRecommendations':
        return await handleAIRecommendations(data as AIRecommendationRequest);
      
      case 'generateRecipe':
        return await handleGenerateRecipe(data as GenerateRecipeRequest);
      
      case 'analyzeNutrition':
        return await handleNutritionalAnalysis(data as NutritionalAnalysisRequest);
      
      case 'getSeasonalSuggestions':
        return await handleSeasonalSuggestions(data);
      
      case 'improveRecipe':
        return await handleRecipeImprovement(data);
      
      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${action}`
        }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ API Ricette error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// 🎯 RACCOMANDAZIONI AI PERSONALIZZATE
async function handleAIRecommendations(data: AIRecommendationRequest) {
  console.log('🎯 Generating AI recommendations...');

  const prompt = `🤖 NUTRIZIONISTA AI - RACCOMANDAZIONI RICETTE PERSONALIZZATE

👤 PROFILO UTENTE:
Preferenze: ${data.preferences.join(', ')}
Allergie: ${data.allergie.join(', ')}
Obiettivo: ${data.obiettivo}
Pasti preferiti: ${data.pasti_preferiti.join(', ')}
${data.ingredienti_disponibili ? `Ingredienti disponibili: ${data.ingredienti_disponibili.join(', ')}` : ''}
${data.stagione ? `Stagione: ${data.stagione}` : ''}

🎯 COMPITO:
Genera ${data.limit || 6} raccomandazioni ricette personalizzate per questo utente.

📋 CRITERI AI:
1. Rispetta TUTTE le allergie (esclusione totale)
2. Privilegia ingredienti delle preferenze
3. Ottimizza per obiettivo fitness specifico
4. Considera stagionalità se specificata
5. Bilancia varietà nutrizionale
6. Include ricette fattibili e gustose

🔥 OBIETTIVI SPECIFICI:
${data.obiettivo === 'dimagrimento' ? 
  '• Focus: Basso calorico, alto proteico, sazietà\n• Privilegia: Verdure, proteine magre, fibre\n• Evita: Condimenti pesanti, carboidrati raffinati' :
  data.obiettivo === 'aumento-massa' ?
  '• Focus: Alto calorico, proteine complete, recovery\n• Privilegia: Carboidrati complessi, proteine, grassi sani\n• Evita: Pasti troppo voluminosi difficili da digerire' :
  '• Focus: Bilanciamento, sostenibilità, varietà\n• Privilegia: Equilibrio macro, ricette versatili\n• Evita: Estremi nutrizionali'
}

💡 FORMATO RISPOSTA (JSON):
{
  "recommendations": [
    {
      "nome": "Nome ricetta accattivante",
      "categoria": "colazione/pranzo/cena/spuntino",
      "descrizione": "Breve descrizione appetitosa (max 50 parole)",
      "motivo_raccomandazione": "Perché è perfetta per questo utente",
      "calorie": 000,
      "proteine": 00,
      "carboidrati": 00,
      "grassi": 00,
      "tempo_preparazione": 00,
      "difficolta": "facile/medio/difficile",
      "ingredienti_principali": ["ing1", "ing2", "ing3"],
      "fitness_score": 85,
      "personalizzazione": "Come si adatta alle preferenze utente"
    }
  ],
  "consigli_generali": [
    "Consiglio 1 per migliorare alimentazione",
    "Consiglio 2 specifico per obiettivo"
  ]
}

GENERA RACCOMANDAZIONI INTELLIGENTI E PERSONALIZZATE!`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 3000,
      temperature: 0.7,
      messages: [{ role: "user", content: prompt }]
    });

    const aiResponse = message.content[0];
    if (aiResponse.type !== 'text') {
      throw new Error('Invalid AI response type');
    }

    // Parse JSON response
    let responseText = aiResponse.text.trim();
    responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    const recommendations = JSON.parse(responseText);

    console.log(`✅ AI generated ${recommendations.recommendations?.length} recommendations`);

    return NextResponse.json({
      success: true,
      data: recommendations,
      message: 'AI recommendations generated successfully'
    });

  } catch (error) {
    console.error('❌ AI recommendations error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate AI recommendations',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// 🧑‍🍳 GENERA NUOVA RICETTA AI
async function handleGenerateRecipe(data: GenerateRecipeRequest) {
  console.log('🧑‍🍳 Generating new recipe with AI...');

  const prompt = `👨‍🍳 CHEF AI - CREAZIONE RICETTA FITNESS PERSONALIZZATA

🎯 RICHIESTA RICETTA:
${data.nome_richiesto ? `Nome richiesto: ${data.nome_richiesto}` : ''}
Categoria: ${data.categoria}
Ingredienti base: ${data.ingredienti_base.join(', ')}
Target calorie: ${data.calorie_target} kcal
Target proteine: ${data.proteine_target}g
${data.difficolta ? `Difficoltà: ${data.difficolta}` : ''}
${data.tempo_max ? `Tempo max: ${data.tempo_max} min` : ''}
${data.allergie ? `Allergie: ${data.allergie.join(', ')}` : ''}
${data.stile_cucina ? `Stile cucina: ${data.stile_cucina}` : ''}
${data.obiettivo_fitness ? `Obiettivo fitness: ${data.obiettivo_fitness}` : ''}

🔬 REQUISITI NUTRIZIONALI:
• Calorie: ${data.calorie_target} kcal (±30 kcal tolleranza)
• Proteine: ${data.proteine_target}g (minimo)
• Bilanciamento macro adeguato per fitness
• Ingredienti realistici e reperibili in Italia

👨‍🍳 STANDARD QUALITÀ:
• Ricetta fattibile e gustosa
• Preparazione step-by-step dettagliata
• Ingredienti con quantità precise
• Tecniche di cottura appropriate
• Presentazione appetitosa

🍽️ FORMATO RISPOSTA (JSON):
{
  "ricetta": {
    "nome": "Nome accattivante e descrittivo",
    "descrizione": "Breve descrizione appetitosa",
    "categoria": "${data.categoria}",
    "difficolta": "facile/medio/difficile",
    "tempo_preparazione": 00,
    "porzioni": 1,
    "macros": {
      "calorie": ${data.calorie_target},
      "proteine": ${data.proteine_target},
      "carboidrati": 00,
      "grassi": 00
    },
    "ingredienti": [
      {
        "nome": "Ingrediente",
        "quantita": "000g/ml",
        "note": "Eventuali note"
      }
    ],
    "preparazione": [
      "Step 1: Descrizione dettagliata",
      "Step 2: Descrizione dettagliata",
      "Step 3: Etc..."
    ],
    "consigli_chef": [
      "Consiglio 1 per risultato perfetto",
      "Consiglio 2 per varianti"
    ],
    "fitness_score": 85,
    "perche_fitness": "Spiegazione benefici fitness specifici"
  }
}

CREA UNA RICETTA FITNESS DELIZIOSA E FUNZIONALE!`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 2500,
      temperature: 0.8,
      messages: [{ role: "user", content: prompt }]
    });

    const aiResponse = message.content[0];
    if (aiResponse.type !== 'text') {
      throw new Error('Invalid AI response type');
    }

    // Parse JSON response
    let responseText = aiResponse.text.trim();
    responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    const recipeData = JSON.parse(responseText);

    console.log(`✅ AI generated recipe: ${recipeData.ricetta?.nome}`);

    return NextResponse.json({
      success: true,
      data: recipeData,
      message: 'New recipe generated successfully'
    });

  } catch (error) {
    console.error('❌ Recipe generation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate recipe',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// 📊 ANALISI NUTRIZIONALE AI
async function handleNutritionalAnalysis(data: NutritionalAnalysisRequest) {
  console.log('📊 Performing nutritional analysis...');

  const prompt = `📊 NUTRIZIONISTA AI - ANALISI PIANO ALIMENTARE

👤 PROFILO UTENTE:
Obiettivo: ${data.obiettivo_utente}
Peso: ${data.peso} kg
Altezza: ${data.altezza} cm
Età: ${data.eta} anni
Attività: ${data.attivita}

🍽️ RICETTE SETTIMANA:
${data.ricette_settimana.map((ricetta, i) => `${i + 1}. ${ricetta}`).join('\n')}

🔬 ANALISI RICHIESTA:
1. Valuta bilanciamento nutrizionale complessivo
2. Calcola BMR e TDEE per il profilo utente
3. Analizza congruenza con obiettivo fitness
4. Identifica carenze o eccessi nutrizionali
5. Suggerisci miglioramenti specifici

💡 FORMATO RISPOSTA (JSON):
{
  "analisi": {
    "bmr_calcolato": 0000,
    "tdee_stimato": 0000,
    "calorie_piano_attuale": 0000,
    "bilanciamento_calorico": "deficit/surplus/mantenimento",
    "valutazione_generale": "ottimo/buono/migliorabile/critico",
    "punti_forza": [
      "Aspetto positivo 1",
      "Aspetto positivo 2"
    ],
    "aree_miglioramento": [
      "Carenza o eccesso 1",
      "Carenza o eccesso 2"
    ],
    "distribuzione_macro": {
      "proteine_percentuale": 00,
      "carboidrati_percentuale": 00,
      "grassi_percentuale": 00,
      "valutazione": "ottimale/buona/da_rivedere"
    }
  },
  "raccomandazioni": [
    {
      "priorita": "alta/media/bassa",
      "tipo": "sostituzione/aggiunta/riduzione",
      "descrizione": "Raccomandazione specifica",
      "beneficio_atteso": "Beneficio per obiettivo utente"
    }
  ],
  "prossimi_passi": [
    "Azione 1 per settimana prossima",
    "Azione 2 per miglioramento continuo"
  ]
}

FORNISCI ANALISI PROFESSIONALE E ACTIONABLE!`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 2000,
      temperature: 0.3,
      messages: [{ role: "user", content: prompt }]
    });

    const aiResponse = message.content[0];
    if (aiResponse.type !== 'text') {
      throw new Error('Invalid AI response type');
    }

    // Parse JSON response
    let responseText = aiResponse.text.trim();
    responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    const analysisData = JSON.parse(responseText);

    console.log(`✅ AI nutritional analysis completed`);

    return NextResponse.json({
      success: true,
      data: analysisData,
      message: 'Nutritional analysis completed successfully'
    });

  } catch (error) {
    console.error('❌ Nutritional analysis error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to perform nutritional analysis',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// 🌿 SUGGERIMENTI STAGIONALI AI
async function handleSeasonalSuggestions(data: any) {
  console.log('🌿 Generating seasonal suggestions...');

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const stagione = getStagione(currentMonth);

  const prompt = `🌿 CHEF STAGIONALE AI - SUGGERIMENTI MENSILI

📅 PERIODO ATTUALE:
Mese: ${currentMonth}
Stagione: ${stagione}
Anno: ${currentDate.getFullYear()}

🥬 INGREDIENTI STAGIONALI ${stagione.toUpperCase()}:
${getIngredientiStagionali(stagione)}

🎯 COMPITO:
Genera 8 ricette fitness che sfruttano al meglio gli ingredienti di stagione.

📋 FOCUS STAGIONALE:
${stagione === 'inverno' ? 
  '• Comfort food caldo e nutriente\n• Vitamine per sistema immunitario\n• Ingredienti che scaldano e danno energia' :
  stagione === 'primavera' ?
  '• Detox e leggerezza dopo inverno\n• Verdure fresche e depurative\n• Rinnovamento e vitalità' :
  stagione === 'estate' ?
  '• Piatti freschi e idratanti\n• Frutta e verdura di stagione\n• Facili da preparare, energizzanti' :
  '• Preparazione per inverno\n• Ingredienti che rafforzano\n• Comfort e nutrimento'
}

💡 FORMATO RISPOSTA (JSON):
{
  "stagione": "${stagione}",
  "mese": ${currentMonth},
  "tema_stagionale": "Descrizione tema del mese",
  "ricette_suggerite": [
    {
      "nome": "Nome ricetta stagionale",
      "categoria": "colazione/pranzo/cena/spuntino",
      "ingredienti_stagionali": ["ing1", "ing2"],
      "calorie": 000,
      "difficolta": "facile/medio",
      "perche_stagionale": "Motivo specifico per questa stagione",
      "benefici": "Benefici nutrizionali stagionali"
    }
  ],
  "consigli_mensili": [
    "Consiglio 1 per il mese",
    "Consiglio 2 stagionale"
  ]
}

CREA SUGGERIMENTI STAGIONALI INTELLIGENTI!`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 2500,
      temperature: 0.7,
      messages: [{ role: "user", content: prompt }]
    });

    const aiResponse = message.content[0];
    if (aiResponse.type !== 'text') {
      throw new Error('Invalid AI response type');
    }

    // Parse JSON response
    let responseText = aiResponse.text.trim();
    responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    const seasonalData = JSON.parse(responseText);

    console.log(`✅ AI generated seasonal suggestions for ${stagione}`);

    return NextResponse.json({
      success: true,
      data: seasonalData,
      message: 'Seasonal suggestions generated successfully'
    });

  } catch (error) {
    console.error('❌ Seasonal suggestions error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate seasonal suggestions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// 🔧 MIGLIORAMENTO RICETTA AI
async function handleRecipeImprovement(data: any) {
  console.log('🔧 Improving recipe with AI...');

  const prompt = `🔧 CHEF OPTIMIZER AI - MIGLIORAMENTO RICETTA

📋 RICETTA ORIGINALE:
${JSON.stringify(data.ricetta_originale, null, 2)}

🎯 OBIETTIVI MIGLIORAMENTO:
${data.obiettivi_miglioramento?.join(', ') || 'Ottimizzazione generale fitness'}

🔬 AREE DI FOCUS:
• Bilanciamento nutrizionale
• Riduzione calorie (se richiesto)
• Aumento proteine
• Miglioramento gusto
• Semplificazione preparazione
• Sostituzione ingredienti problematici

💡 FORMATO RISPOSTA (JSON):
{
  "ricetta_migliorata": {
    "nome": "Nome ottimizzato",
    "modifiche_principali": [
      "Modifica 1 implementata",
      "Modifica 2 implementata"
    ],
    "ingredienti": [
      {
        "nome": "Ingrediente",
        "quantita": "000g",
        "sostituzione": "Se sostituito, cosa e perché"
      }
    ],
    "preparazione": ["Step 1 ottimizzato", "Step 2", "..."],
    "macros_migliorati": {
      "calorie": 000,
      "proteine": 00,
      "carboidrati": 00,
      "grassi": 00
    },
    "fitness_score_nuovo": 90,
    "miglioramenti_applicati": [
      "Spiegazione miglioramento 1",
      "Spiegazione miglioramento 2"
    ]
  },
  "confronto": {
    "calorie_prima": 000,
    "calorie_dopo": 000,
    "proteine_prima": 00,
    "proteine_dopo": 00,
    "fitness_score_prima": 80,
    "fitness_score_dopo": 90
  }
}

OTTIMIZZA LA RICETTA PER MASSIMI BENEFICI FITNESS!`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 2000,
      temperature: 0.5,
      messages: [{ role: "user", content: prompt }]
    });

    const aiResponse = message.content[0];
    if (aiResponse.type !== 'text') {
      throw new Error('Invalid AI response type');
    }

    // Parse JSON response
    let responseText = aiResponse.text.trim();
    responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    const improvementData = JSON.parse(responseText);

    console.log(`✅ AI improved recipe successfully`);

    return NextResponse.json({
      success: true,
      data: improvementData,
      message: 'Recipe improved successfully'
    });

  } catch (error) {
    console.error('❌ Recipe improvement error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to improve recipe',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// 🛠️ UTILITY FUNCTIONS
function getStagione(mese: number): string {
  if (mese >= 3 && mese <= 5) return 'primavera';
  if (mese >= 6 && mese <= 8) return 'estate';
  if (mese >= 9 && mese <= 11) return 'autunno';
  return 'inverno';
}

function getIngredientiStagionali(stagione: string): string {
  const ingredienti = {
    'inverno': 'Cavoli, broccoli, spinaci, arance, mandarini, cachi, zucca, porri, carciofi, finocchi',
    'primavera': 'Asparagi, carciofi, fave, piselli, fragole, albicocche, zucchine, lattuga, ravanelli',
    'estate': 'Pomodori, melanzane, peperoni, zucchine, basilico, melone, anguria, pesche, prugne',
    'autunno': 'Zucca, castagne, funghi, pere, mele, uva, cavoli, broccoli, spinaci, melograno'
  };
  return ingredienti[stagione] || ingredienti['inverno'];
}

// GET method per informazioni generali
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const info = searchParams.get('info');

  if (info === 'status') {
    return NextResponse.json({
      success: true,
      message: 'API Ricette AI is operational',
      features: [
        'AI Recommendations',
        'Recipe Generation',
        'Nutritional Analysis',
        'Seasonal Suggestions',
        'Recipe Improvement'
      ],
      ai_model: 'Claude 3 Haiku',
      timestamp: new Date().toISOString()
    });
  }

  return NextResponse.json({
    success: true,
    message: 'API Ricette AI - Endpoints available',
    endpoints: {
      'POST /': {
        'getAIRecommendations': 'Get personalized AI recipe recommendations',
        'generateRecipe': 'Generate new recipe with AI',
        'analyzeNutrition': 'Analyze nutritional balance',
        'getSeasonalSuggestions': 'Get seasonal recipe suggestions',
        'improveRecipe': 'Improve existing recipe with AI'
      }
    }
  });
}