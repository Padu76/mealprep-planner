// SEZIONE DA SOSTITUIRE nel file route.ts esistente

async function handleGenerateRecipe(data: GenerateRecipeRequest) {
  console.log('Generating FITNESS recipe from international sources...', {
    categoria: data.categoria,
    obiettivo: data.obiettivo_fitness,
    fonte: data.fonte_fitness,
    timing: data.timing_workout
  });

  // ✅ SEED per varietà - genera numero casuale se non specificato
  const recipeSeed = data.recipe_seed || Math.floor(Math.random() * 10000);

  const prompt = `🏋️ FITNESS AI CHEF - RICETTE DA CONTENT INTERNAZIONALE

ACCESSO SIMULATO A FONTI DIGITAL FITNESS:
📱 Instagram Fitness: @thefitnesschef_, @syattfitness, @mikevacanti, @meowmeix, @stephaniebuttermore
📘 Facebook Groups: "Bodybuilding Nutrition Science", "Evidence Based Fitness", "IIFYM Italian Community"  
🌐 Blog Specializzati: AthleanX.com, Stronger by Science, Renaissance Periodization, Precision Nutrition
📺 YouTube Channels: Jeff Nippard, Eric Helms, Alan Thrall, Omar Isuf, Stephanie Buttermore
📖 Riviste Digital: Men's Health, Women's Health, Muscle & Fitness, Oxygen Magazine
👨‍⚕️ Nutrizionisti Online: Layne Norton, Brad Schoenfeld, Alan Aragon, Lyle McDonald

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

🎯 SIMULAZIONE CONTENT DISCOVERY:
Stai attingendo da migliaia di ricette virali Instagram, post Facebook, video YouTube e articoli blog di:
- Fitness influencer con milioni di follower
- Nutrizionisti sportivi certificati CISSN/ISSN  
- Bodybuilder e powerlifter professionisti
- Atleti CrossFit Games e endurance elite
- Chef specializzati in cucina fitness

🔥 TRENDING FITNESS CONTENT TOPICS:
- Ricette "What I Eat in a Day" viral su Instagram
- High-protein hacks da TikTok fitness  
- Meal prep ideas da fitness blogger
- "Anabolic" recipes da Greg Doucette style
- Contest prep meals da IFBB Pro
- Recovery foods da sports science research

REQUISITI CREATIVITÀ MASSIMA (seed: ${recipeSeed}):
✅ Nome accattivante e memorabile (NO "Fitness - ingrediente e verdure")
✅ Ingredienti creativi ma reperibili in Italia
✅ Tecniche moderne da social media fitness
✅ Presentazione Instagram-worthy
✅ Sapore che conquista, non solo "sano"
✅ Timing perfetto per obiettivo specifico

ISPIRAZIONE FONTE SPECIFICA:
${getFitnessContentInspiration(data.fonte_fitness || 'nutrizionista_sportivo', recipeSeed)}

TIMING PERFETTO:
${getTimingSpecificGuidance(data.timing_workout || 'any_time')}

🍽️ LINGUAGGIO FOOD CONTENT CREATOR:
Usa terminologie da food blogger, hashtag fitness, linguaggio accattivante ma scientifico.

FORMATO RISPOSTA (JSON RIGOROSO):
{
  "ricetta": {
    "nome": "Nome super creativo e appetitoso (NO generico!)",
    "descrizione": "Description Instagram-style appetitosa (30-40 parole)",
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

🚀 GENERA RICETTA VIRALE DEGNA DI DIVENTARE TREND SU FITNESS SOCIAL!

IMPORTANTE: 
- Seed ${recipeSeed} deve portare a ricetta UNICA e CREATIVA
- Zero nomi generici come "Pranzo Fitness - pollo e riso"  
- Massima creatività ispirata da veri content creator
- Traduzione naturale in italiano dei concetti internazionali
- Bilancia scienza e appetibilità per engagement massimo`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 2800,
      temperature: 1.1, // ✅ AUMENTATO per massima creatività
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

    console.log(`✅ AI generated creative FITNESS recipe: ${recipeData.ricetta?.nome}`);

    return NextResponse.json({
      success: true,
      data: recipeData,
      message: 'Creative FITNESS recipe generated from international content sources'
    });

  } catch (error) {
    console.error('❌ FITNESS recipe generation error:', error);
    
    // ✅ FALLBACK CREATIVO - no più ricette generiche
    const creativeFallback = generateCreativeFallback(data, recipeSeed);
    
    return NextResponse.json({
      success: true,
      data: { ricetta: creativeFallback },
      message: 'Ricetta creativa generata con sistema avanzato',
      warning: 'AI temporaneamente sovraccarica, utilizzato sistema creativo di backup'
    });
  }
}

// ✅ NUOVE FUNZIONI PER CREATIVITÀ MASSIMA

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
    'pre_workout_30min': '🔥 PRE-WORKOUT IMMEDIATO: Carboidrati ad alto IG, zero grassi, proteine veloci. Esempi viral: banana + miele, dates energy balls, pre-workout smoothie da fitness TikTok.',
    'pre_workout_60min': '⚡ PRE-WORKOUT ESTESO: Carboidrati misti + proteine moderate. Trending: overnight oats proteici, toast avocado, pancakes proteici da Instagram fitness.',
    'post_workout_immediate': '💪 FINESTRA ANABOLICA: 3:1 ratio carb:proteine, whey + carboidrati semplici. Viral: protein smoothie bowls, recovery shakes da YouTube fitness.',
    'post_workout_2h': '🍽️ RECOVERY MEAL: Pasto completo bilanciato, proteine complete. Trending: Buddha bowls, pasta proteica, bowls da meal prep Instagram.',
    'rest_day': '😴 GIORNO RIPOSO: Anti-infiammatorio, omega-3, antiossidanti. Viral: golden milk, berry bowls, comfort food healthy da Pinterest.',
    'any_time': '🌟 VERSATILE: Bilanciato, gustoso, social-worthy. Trend: aesthetic bowls, comfort food makeover, "healthified" classics.'
  };
  return guidance[timing] || guidance['any_time'];
}

function generateCreativeFallback(data: GenerateRecipeRequest, seed: number): any {
  // ✅ NOMI CREATIVI invece di generici
  const creativeNames = [
    'Power Beast Bowl', 'Elite Fuel Stack', 'Champion Gains Combo', 'Warrior Nutrition Bowl',
    'Beast Mode Fuel', 'Peak Performance Plate', 'Alpha Strength Stack', 'Gladiator Gains',
    'Titan Power Bowl', 'Phoenix Recovery Stack', 'Thunder Bolt Combo', 'Lightning Fuel Bowl',
    'Matrix Power Stack', 'Velocity Gains Plate', 'Nitro Performance Bowl', 'Turbo Strength Stack'
  ];

  // ✅ INGREDIENTI CREATIVI basati su seed
  const creativeIngredients = [
    ['120g salmone grigliato', '80g quinoa rossa', '100g edamame', '1/2 avocado a cubetti'],
    ['150g pollo marinato teriyaki', '70g riso venere', '150g broccoli saltati', 'semi di sesamo'],
    ['140g tacchino speziato', '90g patate dolci al forno', '100g spinaci baby', 'tahini'],
    ['130g merluzzo in crosta', '80g farro perlato', '120g zucchine grigliate', 'olio EVO'],
    ['125g tonno scottato', '75g riso basmati', '100g fagiolini', 'zenzero fresco'],
    ['140g petto pollo curry', '85g bulgur', '110g cavolfiori', 'curcuma e lime']
  ];

  const selectedName = creativeNames[seed % creativeNames.length];
  const selectedIngredients = creativeIngredients[seed % creativeIngredients.length];

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
    content_source: `Sistema creativo avanzato - seed ${seed}`,
    timing_notes: getOptimalTiming(data.timing_workout || 'any_time'),
    instagram_appeal: 'Presentazione colorata e fotogenica perfetta per social media'
  };
}