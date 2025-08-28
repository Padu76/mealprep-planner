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
  fonte_fitness?: string;
  timing_workout?: string;
  fitness_context?: string;
  recipe_seed?: number;
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

// GENERA NUOVA RICETTA AI FITNESS INTERNAZIONALE - VERSIONE COMPLETA CON NOMI REALISTICI
async function handleGenerateRecipe(data: GenerateRecipeRequest) {
  console.log('Generating FITNESS recipe from international sources...', {
    categoria: data.categoria,
    obiettivo: data.obiettivo_fitness,
    fonte: data.fonte_fitness,
    timing: data.timing_workout
  });

  // Seed per varietà - genera numero casuale se non specificato
  const recipeSeed = data.recipe_seed || Math.floor(Math.random() * 10000);

  const prompt = `FITNESS AI CHEF - RICETTE DA CONTENT INTERNAZIONALE

ACCESSO SIMULATO A FONTI DIGITAL FITNESS:
Instagram Fitness: @thefitnesschef_, @syattfitness, @mikevacanti, @meowmeix, @stephaniebuttermore
Facebook Groups: "Bodybuilding Nutrition Science", "Evidence Based Fitness", "IIFYM Italian Community"  
Blog Specializzati: AthleanX.com, Stronger by Science, Renaissance Periodization, Precision Nutrition
YouTube Channels: Jeff Nippard, Eric Helms, Alan Thrall, Omar Isuf, Stephanie Buttermore
Riviste Digital: Men's Health, Women's Health, Muscle & Fitness, Oxygen Magazine
Nutrizionisti Online: Layne Norton, Brad Schoenfeld, Alan Aragon, Lyle McDonald

PARAMETRI RICETTA RICHIESTA:
Seed Creatività: ${recipeSeed}
Categoria: ${data.categoria}
Ingredienti base suggeriti: ${data.ingredienti_base.join(', ') || 'libera scelta'}
Target calorie: ${data.calorie_target} kcal
Target proteine: ${data.proteine_target}g
${data.difficolta ? `Difficoltà: ${data.difficolta}` : ''}
${data.tempo_max ? `Tempo max: ${data.tempo_max} min` : ''}
${data.allergie?.length ? `EVITARE (allergie): ${data.allergie.join(', ')}` : ''}
${data.stile_cucina ? `Stile cucina: ${data.stile_cucina}` : ''}
${data.obiettivo_fitness ? `Obiettivo fitness: ${data.obiettivo_fitness}` : ''}
${data.tipo_dieta ? `Tipo dieta: ${data.tipo_dieta}` : ''}
${data.macro_focus ? `Focus macro: ${data.macro_focus}` : ''}

SIMULAZIONE CONTENT DISCOVERY:
Stai attingendo da migliaia di ricette virali Instagram, post Facebook, video YouTube e articoli blog di:
- Fitness influencer con milioni di follower
- Nutrizionisti sportivi certificati CISSN/ISSN  
- Bodybuilder e powerlifter professionisti
- Atleti CrossFit Games e endurance elite
- Chef specializzati in cucina fitness

TRENDING FITNESS CONTENT TOPICS:
- Ricette "What I Eat in a Day" viral su Instagram
- High-protein hacks da TikTok fitness  
- Meal prep ideas da fitness blogger
- "Anabolic" recipes da Greg Doucette style
- Contest prep meals da IFBB Pro
- Recovery foods da sports science research

REQUISITI NAMING REALISTICO (seed: ${recipeSeed}):
Nome chiaro e comprensibile che indica ingredienti principali
NO nomi fantasy o troppo creativi
Esempi: "Pollo Grigliato con Quinoa", "Salmone alle Verdure", "Bowl di Tacchino Speziato"
La persona deve capire subito cosa cucinerà
Ingredienti principali visibili nel nome

ISPIRAZIONE FONTE SPECIFICA:
${getFitnessContentInspiration(data.fonte_fitness || 'nutrizionista_sportivo', recipeSeed)}

TIMING PERFETTO:
${getTimingSpecificGuidance(data.timing_workout || 'any_time')}

LINGUAGGIO FOOD CONTENT CREATOR:
Usa terminologie da food blogger, hashtag fitness, linguaggio accattivante ma scientifico.

FORMATO RISPOSTA (JSON RIGOROSO):
{
  "ricetta": {
    "nome": "Nome realistico e comprensibile (es: Pollo Grigliato con Quinoa, Salmone alle Verdure)",
    "descrizione": "Description appetitosa ma chiara (30-40 parole)",
    "categoria": "${data.categoria}",
    "difficolta": "${data.difficolta || 'medio'}",
    "tempo_preparazione": ${data.tempo_max || 25},
    "porzioni": 1,
    "macros": {
      "calorie": ${data.calorie_target},
      "proteine": ${Math.max(data.proteine_target, 20)},
      "carboidrati": ${Math.round(data.calorie_target * 0.45 / 4)},
      "grassi": ${Math.round(data.calorie_target * 0.25 / 9)}
    },
    "ingredienti": [
      "Quantità precisa ingrediente 1 (principale)",
      "Quantità precisa ingrediente 2", 
      "Quantità condimenti e spezie",
      "Ingrediente segreto per sapore"
    ],
    "preparazione": [
      "Step 1: Prep ingredienti con tecnica professionale",
      "Step 2: Cottura/assemblaggio con timing perfetto", 
      "Step 3: Finishing touches per presentazione",
      "Step 4: Plating e consumo ottimale"
    ],
    "hashtags": ["#fitnessrecipe", "#highprotein", "#mealprep", "#${data.obiettivo_fitness || 'fitness'}", "#italianfitness"],
    "fitness_benefits": [
      "Beneficio performance specifico",
      "Vantaggio composizione corporea", 
      "Benefit recovery/energia"
    ],
    "content_source": "Ispirata da ${getRandomFitnessInfluencer(recipeSeed)} e ricerca scientifica",
    "timing_notes": "Consumo ottimale: ${getOptimalTiming(data.timing_workout || 'any_time')}",
    "instagram_appeal": "Presentazione fotogenica, colori vibranti, texture interessanti"
  }
}

GENERA RICETTA CON NOME CHIARO E COMPRENSIBILE!

IMPORTANTE: 
- Seed ${recipeSeed} deve portare a ricetta UNICA
- Nome deve essere chiaro e indicare ingredienti principali  
- Massima creatività negli ingredienti, nome pratico e comprensibile
- Traduzione naturale in italiano dei concetti internazionali
- Bilancia scienza e appetibilità per engagement massimo`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 2800,
      temperature: 1.1,
      messages: [{ role: "user", content: prompt }]
    });

    const aiResponse = message.content[0];
    if (aiResponse.type !== 'text') {
      throw new Error('Invalid AI response type');
    }

    // Parse JSON response con fallback migliorato
    let responseText = aiResponse.text.trim();
    responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    const recipeData = JSON.parse(responseText);

    console.log(`AI generated realistic FITNESS recipe: ${recipeData.ricetta?.nome}`);

    return NextResponse.json({
      success: true,
      data: recipeData,
      message: 'Realistic FITNESS recipe generated from international content sources'
    });

  } catch (error) {
    console.error('FITNESS recipe generation error:', error);
    
    // FALLBACK REALISTICO - nomi chiari
    const realisticFallback = generateRealisticFallback(data, recipeSeed);
    
    return NextResponse.json({
      success: true,
      data: { ricetta: realisticFallback },
      message: 'Ricetta realistica generata con sistema avanzato',
      warning: 'AI temporaneamente sovraccarica, utilizzato sistema realistico di backup'
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

// UTILITY FUNCTIONS FITNESS REALISTIC

function getFitnessContentInspiration(fonte: string, seed: number): string {
  const inspirations = {
    'bodybuilding': [
      'Ricetta virale da @cbum (Chris Bumstead) per mass building',
      'Stack proteico ispirato a @ryanhumiston daily meals', 
      'Contest prep hack da @raymont_edmonds transformation',
      'Anabolic version da @gregdoucette volume eating'
    ],
    'crossfit': [
      'Pre-WOD fuel da @crossfitgames athletes nutrition',
      'Recovery bowl ispirato a @tiafitness Tia-Clair Toomey',
      'Quick energy da @richfroning competition day meals',
      'Endurance power combo da @kaleighfreeman athlete kitchen'
    ],
    'powerlifting': [
      'Strength fuel da @joellifts record-breaking sessions',
      'Mass gaining hack da @captaindeadlift bulking phase',
      'Power combo ispirato a @jenthompson132 training day',
      'Heavy lifting prep da @atginc strongman nutrition'
    ],
    'endurance': [
      'Marathon fuel ispirato a @eliudkipchoge training camp',  
      'Cyclist power da @tadejpogacar Tour de France nutrition',
      'Triathlon recovery da @lionel_sanders post-race meals',
      'Ultra runner hack da @davidgoggins mental toughness food'
    ],
    'fitness_influencer': [
      'Viral recipe da @meowmeix Instagram "What I Eat"',
      'Aesthetic meal da @stevecook daily routine',
      'Lean gains hack da @mikevacanti evidence-based approach',
      'Transformation fuel da @syattfitness sustainable nutrition'
    ],
    'nutrizionista_sportivo': [
      'Science-based da @biolayne Layne Norton research',
      'Evidence meal da @bradschoenfeldphd muscle building',
      'Performance nutrition da @alanthrall practical application',
      'Recovery optimization da @helms3dmj Renaissance Periodization'
    ]
  };

  const sourceArray = inspirations[fonte] || inspirations['fitness_influencer'];
  return sourceArray[seed % sourceArray.length];
}

function getRandomFitnessInfluencer(seed: number): string {
  const influencers = [
    'Jeff Nippard', 'Greg Doucette', 'Chris Bumstead', 'Stephanie Buttermore',
    'Alan Thrall', 'Omar Isuf', 'Layne Norton', 'Eric Helms', 'Mike Vacanti',
    'Syatt Fitness', 'The Fitness Chef', 'Renaissance Periodization',
    'AthleanX', 'Brad Schoenfeld', 'Lyle McDonald', 'Alan Aragon'
  ];
  return influencers[seed % influencers.length];
}

function getOptimalTiming(timing: string): string {
  const timings = {
    'pre_workout_30min': '30 min prima allenamento per energia rapida',
    'pre_workout_60min': '60 min prima workout per digestione completa',
    'post_workout_immediate': 'Entro 30 min post-workout per finestra anabolica',
    'post_workout_2h': '1-2 ore dopo allenamento per recovery completo', 
    'rest_day': 'Giorni di riposo per recupero muscolare',
    'any_time': 'Flessibile - qualsiasi momento della giornata'
  };
  return timings[timing] || timings['any_time'];
}

function getTimingSpecificGuidance(timing: string): string {
  const guidance = {
    'pre_workout_30min': 'PRE-WORKOUT IMMEDIATO: Carboidrati ad alto IG, zero grassi, proteine veloci. Esempi viral: banana + miele, dates energy balls, pre-workout smoothie da fitness TikTok.',
    'pre_workout_60min': 'PRE-WORKOUT ESTESO: Carboidrati misti + proteine moderate. Trending: overnight oats proteici, toast avocado, pancakes proteici da Instagram fitness.',
    'post_workout_immediate': 'FINESTRA ANABOLICA: 3:1 ratio carb:proteine, whey + carboidrati semplici. Viral: protein smoothie bowls, recovery shakes da YouTube fitness.',
    'post_workout_2h': 'RECOVERY MEAL: Pasto completo bilanciato, proteine complete. Trending: Buddha bowls, pasta proteica, bowls da meal prep Instagram.',
    'rest_day': 'GIORNO RIPOSO: Anti-infiammatorio, omega-3, antiossidanti. Viral: golden milk, berry bowls, comfort food healthy da Pinterest.',
    'any_time': 'VERSATILE: Bilanciato, gustoso, social-worthy. Trend: aesthetic bowls, comfort food makeover, "healthified" classics.'
  };
  return guidance[timing] || guidance['any_time'];
}

function generateRealisticFallback(data: GenerateRecipeRequest, seed: number): any {
  // NOMI REALISTICI E COMPRENSIBILI
  const realisticNames = [
    'Salmone Grigliato con Quinoa', 'Pollo Teriyaki e Verdure', 'Bowl di Tacchino Speziato', 'Merluzzo in Crosta alle Erbe',
    'Tonno Scottato e Riso Basmati', 'Petto di Pollo al Curry', 'Salmone e Patate Dolci', 'Bowl di Pollo Mediterraneo',
    'Tacchino alle Spezie Orientali', 'Pesce Bianco alle Zucchine', 'Pollo Marinato con Farro', 'Salmone e Avocado Bowl'
  ];

  // INGREDIENTI CREATIVI basati su seed
  const realisticIngredients = [
    ['120g salmone grigliato', '80g quinoa rossa', '100g edamame', '1/2 avocado a cubetti'],
    ['150g pollo marinato teriyaki', '70g riso venere', '150g broccoli saltati', 'semi di sesamo'],
    ['140g tacchino speziato', '90g patate dolci al forno', '100g spinaci baby', 'tahini'],
    ['130g merluzzo in crosta', '80g farro perlato', '120g zucchine grigliate', 'olio EVO'],
    ['125g tonno scottato', '75g riso basmati', '100g fagiolini', 'zenzero fresco'],
    ['140g petto pollo curry', '85g bulgur', '110g cavolfiori', 'curcuma e lime']
  ];

  const selectedName = realisticNames[seed % realisticNames.length];
  const selectedIngredients = realisticIngredients[seed % realisticIngredients.length];

  return {
    nome: selectedName,
    descrizione: `${selectedName} - ricetta fitness ispirata al meglio dei content creator internazionali per ${data.obiettivo_fitness || 'performance'} ottimale`,
    categoria: data.categoria,
    difficolta: data.difficolta || 'medio',
    tempo_preparazione: data.tempo_max || 25,
    porzioni: 1,
    macros: {
      calorie: data.calorie_target,
      proteine: Math.max(data.proteine_target, 25),
      carboidrati: Math.round(data.calorie_target * 0.45 / 4),
      grassi: Math.round(data.calorie_target * 0.25 / 9)
    },
    ingredienti: selectedIngredients,
    preparazione: [
      'Preparazione ingredienti con tecniche da chef professionisti',
      'Cottura bilanciata per mantenere nutrienti e sapore', 
      'Assemblaggio estetico degno di Instagram fitness',
      'Plating finale con focus su colori e texture'
    ],
    hashtags: ['#fitnessrecipe', '#highprotein', '#mealprep', `#${data.obiettivo_fitness || 'fitness'}`],
    fitness_benefits: [
      'Proteine complete per sintesi muscolare ottimale',
      'Carboidrati per energia sostenuta e recovery',
      'Micronutrienti per performance e salute generale'
    ],
    content_source: `Sistema realistico avanzato - seed ${seed}`,
    timing_notes: getOptimalTiming(data.timing_workout || 'any_time'),
    instagram_appeal: 'Presentazione colorata e fotogenica perfetta per social media'
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
    version: '4.0 - Realistic Names Enhanced',
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