import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Interfacce per le richieste AI FITNESS
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
  categoria: 'colazione' | 'pranzo' | 'cena' | 'spuntino' | 'pre_workout' | 'post_workout' | 'smoothie';
  ingredienti_base: string[];
  calorie_target: number;
  proteine_target: number;
  difficolta?: 'facile' | 'medio' | 'difficile';
  tempo_max?: number;
  allergie?: string[];
  stile_cucina?: string;
  obiettivo_fitness?: string;
  tipo_dieta?: string;
  macro_focus?: string;
  stagione?: string;
  // NUOVI PARAMETRI FITNESS INTERNAZIONALI
  fonte_fitness?: string;
  timing_workout?: string;
  fitness_context?: string;
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
    console.log(`API Ricette FITNESS - Action: ${action}`, data);

    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn('ANTHROPIC_API_KEY not found');
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
    console.error('API Ricette error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// RACCOMANDAZIONI AI PERSONALIZZATE
async function handleAIRecommendations(data: AIRecommendationRequest) {
  console.log('Generating AI recommendations...');

  const prompt = `NUTRIZIONISTA AI - RACCOMANDAZIONI RICETTE PERSONALIZZATE

PROFILO UTENTE:
Preferenze: ${data.preferences.join(', ')}
Allergie: ${data.allergie.join(', ')}
Obiettivo: ${data.obiettivo}
Pasti preferiti: ${data.pasti_preferiti.join(', ')}
${data.ingredienti_disponibili ? `Ingredienti disponibili: ${data.ingredienti_disponibili.join(', ')}` : ''}
${data.stagione ? `Stagione: ${data.stagione}` : ''}

COMPITO:
Genera ${data.limit || 6} raccomandazioni ricette personalizzate per questo utente.

CRITERI AI:
1. Rispetta TUTTE le allergie (esclusione totale)
2. Privilegia ingredienti delle preferenze
3. Ottimizza per obiettivo fitness specifico
4. Considera stagionalita se specificata
5. Bilancia varieta nutrizionale
6. Include ricette fattibili e gustose

OBIETTIVI SPECIFICI:
${data.obiettivo === 'dimagrimento' ? 
  'Focus: Basso calorico, alto proteico, sazieta\nPrivilegia: Verdure, proteine magre, fibre\nEvita: Condimenti pesanti, carboidrati raffinati' :
  data.obiettivo === 'aumento-massa' ?
  'Focus: Alto calorico, proteine complete, recovery\nPrivilegia: Carboidrati complessi, proteine, grassi sani\nEvita: Pasti troppo voluminosi difficili da digerire' :
  'Focus: Bilanciamento, sostenibilita, varieta\nPrivilegia: Equilibrio macro, ricette versatili\nEvita: Estremi nutrizionali'
}

FORMATO RISPOSTA (JSON):
{
  "recommendations": [
    {
      "nome": "Nome ricetta accattivante",
      "categoria": "colazione/pranzo/cena/spuntino",
      "descrizione": "Breve descrizione appetitosa (max 50 parole)",
      "motivo_raccomandazione": "Perche e perfetta per questo utente",
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

    console.log(`AI generated ${recommendations.recommendations?.length} recommendations`);

    return NextResponse.json({
      success: true,
      data: recommendations,
      message: 'AI recommendations generated successfully'
    });

  } catch (error) {
    console.error('AI recommendations error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate AI recommendations',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GENERA NUOVA RICETTA AI FITNESS INTERNAZIONALE
async function handleGenerateRecipe(data: GenerateRecipeRequest) {
  console.log('Generating FITNESS recipe with international database...', {
    categoria: data.categoria,
    obiettivo: data.obiettivo_fitness,
    fonte: data.fonte_fitness,
    timing: data.timing_workout
  });

  const prompt = `FITNESS AI CHEF - DATABASE ATLETI & NUTRIZIONISTI INTERNAZIONALI

RICHIESTA RICETTA FITNESS:
${data.nome_richiesto ? `Nome richiesto: ${data.nome_richiesto}` : ''}
Categoria: ${data.categoria}
Ingredienti base: ${data.ingredienti_base.join(', ')}
Target calorie: ${data.calorie_target} kcal
Target proteine: ${data.proteine_target}g
${data.difficolta ? `Difficolta: ${data.difficolta}` : ''}
${data.tempo_max ? `Tempo max: ${data.tempo_max} min` : ''}
${data.allergie ? `Allergie: ${data.allergie.join(', ')}` : ''}
${data.stile_cucina ? `Stile cucina: ${data.stile_cucina}` : ''}
${data.obiettivo_fitness ? `Obiettivo fitness: ${data.obiettivo_fitness}` : ''}
${data.tipo_dieta ? `Tipo dieta: ${data.tipo_dieta}` : ''}
${data.macro_focus ? `Macro focus: ${data.macro_focus}` : ''}
${data.stagione ? `Stagione: ${data.stagione}` : ''}

=== DATABASE FITNESS INTERNAZIONALE ===
Fonte specializzazione: ${data.fonte_fitness || 'nutrizionista_sportivo'}
Timing workout: ${data.timing_workout || 'any_time'}

FONTI FITNESS SPECIALIZZATE:
${getFitnessSourceContext(data.fonte_fitness || 'nutrizionista_sportivo')}

TIMING WORKOUT SPECIALIZZATO:
${getWorkoutTimingContext(data.timing_workout || 'any_time')}

REQUISITI NUTRIZIONALI FITNESS:
- Calorie: ${data.calorie_target} kcal (±30 kcal tolleranza)
- Proteine: ${data.proteine_target}g (minimo)
- Bilanciamento macro per ${data.obiettivo_fitness || 'maintenance'}
- Ingredienti performance-oriented
- Timing ottimale per assorbimento
- Micronutrienti per recovery e performance

STANDARD INTERNAZIONALI:
- Ricetta testata da atleti professionisti
- Ingredienti reperibili in Europa/Italia
- Preparazione efficiente per atleti
- Sapore e palatabilita eccellenti
- Timing perfetto per obiettivo

${data.fitness_context ? `CONTESTO FITNESS AGGIUNTIVO: ${data.fitness_context}` : ''}

FORMATO RISPOSTA (JSON SEMPRE):
{
  "ricetta": {
    "nome": "Nome ricetta FITNESS professionale",
    "descrizione": "Descrizione appetitosa con benefici fitness",
    "categoria": "${data.categoria}",
    "difficolta": "${data.difficolta || 'medio'}",
    "tempo_preparazione": ${data.tempo_max || 30},
    "porzioni": 1,
    "macros": {
      "calorie": ${data.calorie_target},
      "proteine": ${data.proteine_target},
      "carboidrati": 35,
      "grassi": 15
    },
    "ingredienti": [
      "60g ingrediente principale",
      "100g ingrediente secondario",
      "1 cucchiaio condimento",
      "Spezie e aromi"
    ],
    "preparazione": [
      "Step 1: Preparazione ingredienti con focus timing",
      "Step 2: Tecniche di cottura per mantenere nutrienti",
      "Step 3: Assemblaggio ottimale per assorbimento",
      "Step 4: Presentazione e consumo timing"
    ],
    "fitness_benefits": [
      "Beneficio 1 per performance",
      "Beneficio 2 per recovery",
      "Beneficio 3 per composizione corporea"
    ],
    "timing_notes": "Quando consumare per massimi benefici",
    "fonte_ispirazione": "${data.fonte_fitness || 'Nutrizionista sportivo professionale'}",
    "workout_timing": "${data.timing_workout || 'Qualsiasi momento'}",
    "international_origin": "Database atleti internazionali utilizzato",
    "performance_score": 90
  }
}

GENERA RICETTA FITNESS PROFESSIONALE DA DATABASE INTERNAZIONALE!`;

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

    console.log(`AI generated FITNESS recipe: ${recipeData.ricetta?.nome}`);

    return NextResponse.json({
      success: true,
      data: recipeData,
      message: 'FITNESS recipe generated from international database'
    });

  } catch (error) {
    console.error('FITNESS recipe generation error:', error);
    
    // FALLBACK SYSTEM - genera ricetta di base se AI fallisce
    const fallbackRecipe = generateFallbackRecipe(data);
    
    return NextResponse.json({
      success: true,
      data: { ricetta: fallbackRecipe },
      message: 'Ricetta generata con sistema di backup',
      warning: 'AI temporaneamente non disponibile, utilizzato sistema di backup'
    });
  }
}

// ANALISI NUTRIZIONALE AI
async function handleNutritionalAnalysis(data: NutritionalAnalysisRequest) {
  console.log('Performing nutritional analysis...');

  const prompt = `NUTRIZIONISTA AI - ANALISI PIANO ALIMENTARE

PROFILO UTENTE:
Obiettivo: ${data.obiettivo_utente}
Peso: ${data.peso} kg
Altezza: ${data.altezza} cm
Eta: ${data.eta} anni
Attivita: ${data.attivita}

RICETTE SETTIMANA:
${data.ricette_settimana.map((ricetta, i) => `${i + 1}. ${ricetta}`).join('\n')}

ANALISI RICHIESTA:
1. Valuta bilanciamento nutrizionale complessivo
2. Calcola BMR e TDEE per il profilo utente
3. Analizza congruenza con obiettivo fitness
4. Identifica carenze o eccessi nutrizionali
5. Suggerisci miglioramenti specifici

FORMATO RISPOSTA (JSON):
{
  "analisi": {
    "bmr_calcolato": 1800,
    "tdee_stimato": 2400,
    "calorie_piano_attuale": 2200,
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
      "proteine_percentuale": 25,
      "carboidrati_percentuale": 45,
      "grassi_percentuale": 30,
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

FORNISCI ANALISI PROFESSIONALE!`;

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

    let responseText = aiResponse.text.trim();
    responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    const analysisData = JSON.parse(responseText);

    console.log(`AI nutritional analysis completed`);

    return NextResponse.json({
      success: true,
      data: analysisData,
      message: 'Nutritional analysis completed successfully'
    });

  } catch (error) {
    console.error('Nutritional analysis error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to perform nutritional analysis',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// SUGGERIMENTI STAGIONALI AI
async function handleSeasonalSuggestions(data: any) {
  console.log('Generating seasonal suggestions...');

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const stagione = getStagione(currentMonth);

  const prompt = `CHEF STAGIONALE AI - SUGGERIMENTI MENSILI

PERIODO ATTUALE:
Mese: ${currentMonth}
Stagione: ${stagione}
Anno: ${currentDate.getFullYear()}

INGREDIENTI STAGIONALI ${stagione.toUpperCase()}:
${getIngredientiStagionali(stagione)}

COMPITO:
Genera 8 ricette fitness che sfruttano al meglio gli ingredienti di stagione.

FOCUS STAGIONALE:
${getStagioneFocus(stagione)}

FORMATO RISPOSTA (JSON):
{
  "stagione": "${stagione}",
  "mese": ${currentMonth},
  "tema_stagionale": "Descrizione tema del mese",
  "ricette_suggerite": [
    {
      "nome": "Nome ricetta stagionale",
      "categoria": "colazione/pranzo/cena/spuntino",
      "ingredienti_stagionali": ["ing1", "ing2"],
      "calorie": 400,
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

CREA SUGGERIMENTI STAGIONALI!`;

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

    let responseText = aiResponse.text.trim();
    responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    const seasonalData = JSON.parse(responseText);

    console.log(`AI generated seasonal suggestions for ${stagione}`);

    return NextResponse.json({
      success: true,
      data: seasonalData,
      message: 'Seasonal suggestions generated successfully'
    });

  } catch (error) {
    console.error('Seasonal suggestions error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate seasonal suggestions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// MIGLIORAMENTO RICETTA AI
async function handleRecipeImprovement(data: any) {
  console.log('Improving recipe with AI...');

  const prompt = `CHEF OPTIMIZER AI - MIGLIORAMENTO RICETTA

RICETTA ORIGINALE:
${JSON.stringify(data.ricetta_originale, null, 2)}

OBIETTIVI MIGLIORAMENTO:
${data.obiettivi_miglioramento?.join(', ') || 'Ottimizzazione generale fitness'}

AREE DI FOCUS:
- Bilanciamento nutrizionale
- Riduzione calorie (se richiesto)
- Aumento proteine
- Miglioramento gusto
- Semplificazione preparazione
- Sostituzione ingredienti problematici

FORMATO RISPOSTA (JSON):
{
  "ricetta_migliorata": {
    "nome": "Nome ottimizzato",
    "modifiche_principali": [
      "Modifica 1 implementata",
      "Modifica 2 implementata"
    ],
    "ingredienti": [
      "Ingrediente ottimizzato 1",
      "Ingrediente ottimizzato 2"
    ],
    "preparazione": ["Step 1 ottimizzato", "Step 2", "..."],
    "macros_migliorati": {
      "calorie": 450,
      "proteine": 35,
      "carboidrati": 40,
      "grassi": 18
    },
    "fitness_score_nuovo": 90,
    "miglioramenti_applicati": [
      "Spiegazione miglioramento 1",
      "Spiegazione miglioramento 2"
    ]
  },
  "confronto": {
    "calorie_prima": 500,
    "calorie_dopo": 450,
    "proteine_prima": 25,
    "proteine_dopo": 35,
    "fitness_score_prima": 75,
    "fitness_score_dopo": 90
  }
}

OTTIMIZZA LA RICETTA!`;

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

    let responseText = aiResponse.text.trim();
    responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    const improvementData = JSON.parse(responseText);

    console.log(`AI improved recipe successfully`);

    return NextResponse.json({
      success: true,
      data: improvementData,
      message: 'Recipe improved successfully'
    });

  } catch (error) {
    console.error('Recipe improvement error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to improve recipe',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// ======================
// UTILITY FUNCTIONS FITNESS
// ======================

function getFitnessSourceContext(fonte: string): string {
  const contexts = {
    'bodybuilding': `
DATABASE BODYBUILDING INTERNAZIONALE:
- Ricette da campioni IFBB Pro: Jay Cutler, Phil Heath, Kai Greene
- Piani alimentari preparatori gare internazionali 
- Focus: Massima sintesi proteica, timing carboidrati, cutting/bulking
- Influencers: AthleanX, Greg Doucette, Will Tennyson
- Metodologie: Carb cycling, refeed meals, contest prep`,

    'powerlifting': `
DATABASE POWERLIFTING MONDIALE:
- Ricette da record holders IPF: Kirill Sarychev, Ray Williams, Jennifer Thompson
- Piani alimentari per forza massimale
- Focus: Densita energetica, recovery massimo, performance strength
- Influencers: Mark Bell, Dave Tate, Chad Wesley Smith
- Metodologie: High calorie density, post-workout timing`,

    'crossfit': `
DATABASE CROSSFIT GAMES ATHLETES:
- Ricette da Games winners: Mat Fraser, Tia-Clair Toomey, Rich Froning
- Alimentazione per WODs ad alta intensita
- Focus: Energia rapida, recovery veloce, idratazione
- Influencers: Ben Bergeron, Marcus Filly, Camille Leblanc-Bazinet
- Metodologie: Zone Diet, Paleo performance, pre/post WOD nutrition`,

    'endurance': `
DATABASE ATLETI ENDURANCE INTERNAZIONALI:
- Ricette da maratoneti elite: Eliud Kipchoge, Mo Farah, Shalane Flanagan
- Piani per ciclisti Tour de France, triatleti Ironman
- Focus: Carboidrati sustained energy, elettroliti, glycogen loading
- Influencers: Matt Fitzgerald, Asker Jeukendrup, Louise Burke
- Metodologie: Periodized nutrition, carb loading, during-exercise fueling`,

    'fitness_influencer': `
DATABASE FITNESS INFLUENCERS GLOBALI:
- Ricette virali: Michelle Lewin, Steve Cook, Whitney Simmons, Jeff Nippard
- Content da Instagram, YouTube, TikTok fitness
- Focus: Aesthetic goals, sostenibilita, meal prep appeal
- Piattaforme: Fitfluencer USA/UK/Australia, German fitness YouTube
- Metodologie: Flexible dieting, 80/20 approach, social media friendly`,

    'nutrizionista_sportivo': `
DATABASE SPORT NUTRITIONISTS CERTIFICATI:
- Protocolli da CISSN, ISSN, ACSM certified professionals
- Ricerche peer-reviewed implementate
- Focus: Evidence-based nutrition, periodization, bioavailability
- Esperti: Alan Aragon, Brad Schoenfeld, Eric Helms, Layne Norton
- Metodologie: Scientific approach, macro/micro timing, supplementation`,

    'preparatore_atletico': `
DATABASE PREPARATORI ATLETICI INTERNAZIONALI:
- Ricette da team NFL, NBA, Premier League, Serie A
- Alimentazione per sport specifici ad alto livello
- Focus: Performance periodization, injury prevention, team logistics
- Metodologie: Sport-specific nutrition, travel nutrition, competition day fueling`
  };

  return contexts[fonte] || contexts['nutrizionista_sportivo'];
}

function getWorkoutTimingContext(timing: string): string {
  const contexts = {
    'pre_workout_30min': 'Carboidrati rapidi, bassa fibra, facile digestione. Target: 15-30g carb, 5-10g proteine. Evita grassi e fibre.',
    'pre_workout_60min': 'Carboidrati misti, moderate proteine. Target: 30-50g carb, 10-20g proteine. Possibili grassi limitati.',
    'post_workout_immediate': 'Finestra anabolica 0-30min. Target: 20-40g proteine whey, 30-50g carb ad alto IG. Ratio 3:1 carb:proteine.',
    'post_workout_2h': 'Recovery completo. Target: Pasto bilanciato, 25-40g proteine complete, carboidrati complessi, grassi sani.',
    'rest_day': 'Focus recovery, anti-infiammatorio. Proteine moderate, grassi omega-3, antiossidanti, fibre.',
    'any_time': 'Versatile per ogni momento. Bilanciamento standard macro, digeribilita media, sapore ottimale.'
  };

  return contexts[timing] || contexts['any_time'];
}

function generateFallbackRecipe(data: GenerateRecipeRequest): any {
  const baseIngredients = data.ingredienti_base.length > 0 ? data.ingredienti_base : ['pollo', 'riso', 'broccoli'];
  
  return {
    nome: `${data.categoria} Fitness - ${baseIngredients[0]} e ${baseIngredients[1] || 'verdure'}`,
    descrizione: `Ricetta ${data.categoria} ottimizzata per ${data.obiettivo_fitness || 'maintenance'}`,
    categoria: data.categoria,
    difficolta: data.difficolta || 'medio',
    tempo_preparazione: data.tempo_max || 30,
    porzioni: 1,
    macros: {
      calorie: data.calorie_target,
      proteine: data.proteine_target,
      carboidrati: Math.round(data.calorie_target * 0.4 / 4),
      grassi: Math.round(data.calorie_target * 0.25 / 9)
    },
    ingredienti: [
      `${Math.round(data.proteine_target * 3)}g ${baseIngredients[0] || 'proteine'}`,
      `${Math.round(data.calorie_target * 0.3 / 4)}g carboidrati complessi`,
      `200g verdure miste`,
      `1 cucchiaio olio EVO`
    ],
    preparazione: [
      `Prepara ${baseIngredients[0] || 'proteine'} con spezie`,
      'Cuoci carboidrati al dente',
      'Saltare verdure brevemente',
      'Componi piatto bilanciando macronutrienti'
    ],
    fitness_benefits: [
      'Proteine complete per sintesi muscolare',
      'Carboidrati per energia e recovery',
      'Micronutrienti per performance'
    ],
    timing_notes: `Ottimale per ${data.timing_workout || 'qualsiasi momento'}`,
    fonte_ispirazione: 'Sistema di backup - ricetta base fitness',
    performance_score: 75
  };
}

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

function getStagioneFocus(stagione: string): string {
  const focus = {
    'inverno': 'Comfort food caldo e nutriente\nVitamine per sistema immunitario\nIngredienti che scaldano e danno energia',
    'primavera': 'Detox e leggerezza dopo inverno\nVerdure fresche e depurative\nRinnovamento e vitalita',
    'estate': 'Piatti freschi e idratanti\nFrutta e verdura di stagione\nFacili da preparare, energizzanti',
    'autunno': 'Preparazione per inverno\nIngredienti che rafforzano\nComfort e nutrimento'
  };
  return focus[stagione] || focus['inverno'];
}

// GET method per status e info
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const info = searchParams.get('info');

  if (info === 'status') {
    return NextResponse.json({
      success: true,
      message: 'API Ricette FITNESS is operational with international database',
      features: [
        'AI Recommendations',
        'International Fitness Recipe Generation',
        'Nutritional Analysis',
        'Seasonal Suggestions',
        'Recipe Improvement',
        'Fallback System'
      ],
      fitness_sources: [
        'Bodybuilding Pro Athletes',
        'Powerlifting Champions', 
        'CrossFit Games Winners',
        'Endurance Elite Athletes',
        'Certified Sports Nutritionists',
        'International Fitness Influencers'
      ],
      ai_model: 'Claude 3 Haiku',
      timestamp: new Date().toISOString()
    });
  }

  return NextResponse.json({
    success: true,
    message: 'API Ricette FITNESS - International Database',
    version: '2.0 - Fitness International Enhanced',
    endpoints: {
      'POST /': {
        'getAIRecommendations': 'Get personalized AI recipe recommendations',
        'generateRecipe': 'Generate FITNESS recipe from international athlete database',
        'analyzeNutrition': 'Analyze nutritional balance with fitness focus',
        'getSeasonalSuggestions': 'Get seasonal fitness recipe suggestions',
        'improveRecipe': 'Improve existing recipe with fitness optimization'
      }
    },
    database_coverage: 'Global fitness athletes, certified nutritionists, international influencers'
  });
}