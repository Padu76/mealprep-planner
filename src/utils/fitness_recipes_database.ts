// 🏋️‍♂️ DATABASE RICETTE FITNESS ITALIANE - VERSIONE INTEGRATA
export const FITNESS_RECIPES_DB = {
  
  // 🌅 COLAZIONI FITNESS (alto contenuto proteico, basso zucchero)
  colazione: [
    {
      nome: 'Porridge Proteico ai Frutti di Bosco',
      calorie: 380, proteine: 28, carboidrati: 35, grassi: 12,
      fitnessScore: 92,
      ingredienti: ['50g avena integrale', '30g proteine whey vaniglia', '100g frutti di bosco', '10g mandorle', 'Cannella'],
      preparazione: 'Cuoci avena con acqua, aggiungi proteine e frutti di bosco. Completa con mandorle e cannella.',
      tempo: '8 min', porzioni: 1,
      imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop',
      macroTarget: 'high-protein'
    },
    {
      nome: 'Omelette Fitness con Spinaci',
      calorie: 320, proteine: 32, carboidrati: 8, grassi: 18,
      fitnessScore: 95,
      ingredienti: ['3 albumi + 1 uovo intero', '100g spinaci freschi', '30g ricotta light', '5ml olio EVO'],
      preparazione: 'Sbatti uova, cuoci con spinaci saltati e ricotta. Piatto ricco di proteine e ferro.',
      tempo: '12 min', porzioni: 1,
      imageUrl: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=300&fit=crop',
      macroTarget: 'high-protein'
    },
    {
      nome: 'Yogurt Greco Proteico Plus',
      calorie: 350, proteine: 35, carboidrati: 25, grassi: 8,
      fitnessScore: 88,
      ingredienti: ['200g yogurt greco 0%', '20g proteine whey', '50g mirtilli', '15g noci', '5g miele'],
      preparazione: 'Mescola yogurt e proteine, aggiungi mirtilli, noci e un filo di miele.',
      tempo: '3 min', porzioni: 1,
      imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop',
      macroTarget: 'high-protein'
    },
    {
      nome: 'Pancakes Proteici Fit',
      calorie: 400, proteine: 30, carboidrati: 28, grassi: 16,
      fitnessScore: 90,
      ingredienti: ['40g farina avena', '30g proteine', '2 albumi', '100g ricotta', '80g frutti rossi'],
      preparazione: 'Mescola ingredienti secchi e umidi separatamente, poi unisci. Cuoci in padella antiaderente.',
      tempo: '15 min', porzioni: 1,
      imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
      macroTarget: 'balanced'
    },
    {
      nome: 'Smoothie Bowl Verde',
      calorie: 360, proteine: 25, carboidrati: 32, grassi: 14,
      fitnessScore: 85,
      ingredienti: ['30g proteine vegetali', '1 banana', '50g spinaci', '200ml latte mandorle', '15g semi chia'],
      preparazione: 'Frulla tutti gli ingredienti, versa in bowl e decora con semi di chia.',
      tempo: '5 min', porzioni: 1,
      imageUrl: 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=400&h=300&fit=crop',
      macroTarget: 'plant-based'
    },
    {
      nome: 'Toast Avocado Proteico',
      calorie: 420, proteine: 28, carboidrati: 22, grassi: 24,
      fitnessScore: 87,
      ingredienti: ['2 fette pane integrale', '1/2 avocado', '2 uova', '50g salmone affumicato', 'Limone'],
      preparazione: 'Tosta pane, spalma avocado, aggiungi uova strapazzate e salmone. Spruzza limone.',
      tempo: '10 min', porzioni: 1,
      imageUrl: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=300&fit=crop',
      macroTarget: 'high-fat'
    },
    {
      nome: 'Overnight Oats Proteici',
      calorie: 390, proteine: 26, carboidrati: 40, grassi: 14,
      fitnessScore: 89,
      ingredienti: ['50g avena', '25g proteine vaniglia', '150ml latte scremato', '80g frutti di bosco', '10g mandorle'],
      preparazione: 'Mescola tutto in un barattolo, lascia riposare in frigo overnight. Pronto al mattino!',
      tempo: '5 min prep', porzioni: 1,
      imageUrl: 'https://images.unsplash.com/photo-1478145787956-f6f12c59624d?w=400&h=300&fit=crop',
      macroTarget: 'meal-prep'
    },
    {
      nome: 'Frittata Fitness Express',
      calorie: 340, proteine: 30, carboidrati: 12, grassi: 19,
      fitnessScore: 91,
      ingredienti: ['4 albumi + 1 uovo', '80g tacchino a cubetti', '100g zucchine', '30g parmigiano', 'Erbe aromatiche'],
      preparazione: 'Cuoci tacchino e zucchine, aggiungi uova sbattute. Completa con parmigiano e erbe.',
      tempo: '10 min', porzioni: 1,
      imageUrl: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=400&h=300&fit=crop',
      macroTarget: 'high-protein'
    }
  ],

  // ☀️ PRANZI FITNESS (bilanciati, sazi, nutrienti)
  pranzo: [
    {
      nome: 'Bowl di Quinoa e Pollo',
      calorie: 520, proteine: 42, carboidrati: 45, grassi: 18,
      fitnessScore: 94,
      ingredienti: ['120g petto pollo', '80g quinoa', '100g verdure grigliate', '1/2 avocado', 'Limone e erbe'],
      preparazione: 'Cuoci quinoa e pollo, griglia verdure. Componi bowl con avocado e condisci.',
      tempo: '25 min', porzioni: 1,
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
      macroTarget: 'balanced'
    },
    {
      nome: 'Salmone con Riso Integrale',
      calorie: 480, proteine: 38, carboidrati: 35, grassi: 22,
      fitnessScore: 92,
      ingredienti: ['130g salmone', '70g riso integrale', '150g broccoli', '10ml olio EVO', 'Zenzero'],
      preparazione: 'Cuoci salmone alla griglia, lessaggio riso e broccoli al vapore. Condisci con olio e zenzero.',
      tempo: '20 min', porzioni: 1,
      imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
      macroTarget: 'high-protein'
    },
    {
      nome: 'Insalata di Legumi e Tonno',
      calorie: 450, proteine: 35, carboidrati: 40, grassi: 15,
      fitnessScore: 89,
      ingredienti: ['150g tonno in scatola', '100g ceci cotti', '100g fagiolini', '80g pomodorini', '15ml olio EVO'],
      preparazione: 'Mescola legumi, tonno e verdure. Condisci con olio, limone e erbe aromatiche.',
      tempo: '10 min', porzioni: 1,
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
      macroTarget: 'high-fiber'
    },
    {
      nome: 'Pasta Integrale Fitness',
      calorie: 510, proteine: 28, carboidrati: 55, grassi: 16,
      fitnessScore: 86,
      ingredienti: ['80g pasta integrale', '100g petto pollo', '100g zucchine', '50g pomodorini', 'Basilico'],
      preparazione: 'Cuoci pasta, saltella pollo con verdure. Unisci e manteca con basilico fresco.',
      tempo: '18 min', porzioni: 1,
      imageUrl: 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400&h=300&fit=crop',
      macroTarget: 'balanced'
    },
    {
      nome: 'Wrap Proteico Vegetale',
      calorie: 460, proteine: 30, carboidrati: 48, grassi: 14,
      fitnessScore: 88,
      ingredienti: ['1 wrap integrale', '150g hummus proteico', '100g verdure crude', '80g tofu grigliato'],
      preparazione: 'Spalma hummus sul wrap, aggiungi verdure e tofu. Arrotola saldamente.',
      tempo: '8 min', porzioni: 1,
      imageUrl: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=300&fit=crop',
      macroTarget: 'plant-based'
    },
    {
      nome: 'Bowl di Manzo e Patate Dolci',
      calorie: 540, proteine: 45, carboidrati: 38, grassi: 20,
      fitnessScore: 91,
      ingredienti: ['120g manzo magro', '120g patate dolci', '100g spinaci', '1/4 avocado', 'Rosmarino'],
      preparazione: 'Cuoci manzo e patate dolci al forno, saltella spinaci. Completa con avocado.',
      tempo: '30 min', porzioni: 1,
      imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop',
      macroTarget: 'muscle-gain'
    },
    {
      nome: 'Risotto Proteico ai Funghi',
      calorie: 490, proteine: 32, carboidrati: 52, grassi: 16,
      fitnessScore: 87,
      ingredienti: ['90g riso integrale', '100g petto pollo a cubetti', '150g funghi misti', '30g parmigiano', 'Brodo vegetale'],
      preparazione: 'Tosta riso, aggiungi brodo gradualmente. Incorpora pollo cotto e funghi. Manteca con parmigiano.',
      tempo: '35 min', porzioni: 1,
      imageUrl: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop',
      macroTarget: 'comfort-fit'
    },
    {
      nome: 'Buddha Bowl Mediterraneo',
      calorie: 475, proteine: 29, carboidrati: 42, grassi: 22,
      fitnessScore: 90,
      ingredienti: ['100g quinoa', '120g gamberi grigliati', '100g verdure grigliate', '50g feta light', 'Salsa tzatziki fitness'],
      preparazione: 'Componi bowl con quinoa, gamberi, verdure e feta. Condisci con tzatziki proteico.',
      tempo: '22 min', porzioni: 1,
      imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop',
      macroTarget: 'mediterranean'
    }
  ],

  // 🌙 CENE FITNESS (proteine alte, carboidrati moderati)
  cena: [
    {
      nome: 'Salmone alle Erbe',
      calorie: 420, proteine: 38, carboidrati: 15, grassi: 24,
      fitnessScore: 93,
      ingredienti: ['130g salmone', '150g asparagi', '100g cavolfiore', 'Erbe mediterranee', 'Limone'],
      preparazione: 'Cuoci salmone con erbe, verdure al vapore. Ottimo per il recovery notturno.',
      tempo: '20 min', porzioni: 1,
      imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
      macroTarget: 'high-protein'
    },
    {
      nome: 'Pollo Grigliato con Verdure',
      calorie: 380, proteine: 42, carboidrati: 18, grassi: 14,
      fitnessScore: 95,
      ingredienti: ['140g petto pollo', '200g verdure miste', '80g zucchine', '10ml olio EVO'],
      preparazione: 'Griglia pollo marinato, verdure al forno. Pasto lean per definizione.',
      tempo: '25 min', porzioni: 1,
      imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop',
      macroTarget: 'lean'
    },
    {
      nome: 'Frittata di Verdure Light',
      calorie: 350, proteine: 28, carboidrati: 12, grassi: 20,
      fitnessScore: 88,
      ingredienti: ['3 uova', '100g spinaci', '80g peperoni', '50g mozzarella light', 'Erbe'],
      preparazione: 'Sbatti uova, aggiungi verdure e cuoci in padella. Ricca e leggera.',
      tempo: '15 min', porzioni: 1,
      imageUrl: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&h=300&fit=crop',
      macroTarget: 'low-carb'
    },
    {
      nome: 'Merluzzo in Crosta',
      calorie: 360, proteine: 35, carboidrati: 20, grassi: 12,
      fitnessScore: 90,
      ingredienti: ['140g merluzzo', '15g pangrattato integrale', '150g verdure verdi', 'Limone e prezzemolo'],
      preparazione: 'Pesce in crosta di pane integrale, verdure al vapore. Leggero e saporito.',
      tempo: '22 min', porzioni: 1,
      imageUrl: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400&h=300&fit=crop',
      macroTarget: 'lean'
    },
    {
      nome: 'Tofu Teriyaki con Riso',
      calorie: 400, proteine: 25, carboidrati: 35, grassi: 18,
      fitnessScore: 85,
      ingredienti: ['150g tofu', '60g riso integrale', '100g verdure asiatiche', 'Salsa teriyaki light'],
      preparazione: 'Tofu marinato in teriyaki, saltellato con verdure e riso. Opzione plant-based.',
      tempo: '18 min', porzioni: 1,
      imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
      macroTarget: 'plant-based'
    },
    {
      nome: 'Tacchino con Quinoa',
      calorie: 440, proteine: 40, carboidrati: 28, grassi: 16,
      fitnessScore: 92,
      ingredienti: ['120g petto tacchino', '70g quinoa', '100g zucchine', '50g pomodorini', 'Rosmarino'],
      preparazione: 'Tacchino alle erbe con quinoa e verdure colorate. Completo e bilanciato.',
      tempo: '25 min', porzioni: 1,
      imageUrl: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400&h=300&fit=crop',
      macroTarget: 'balanced'
    },
    {
      nome: 'Branzino al Sale con Verdure',
      calorie: 395, proteine: 41, carboidrati: 16, grassi: 17,
      fitnessScore: 93,
      ingredienti: ['150g branzino', 'Sale grosso', '120g verdure miste', '100g pomodorini', 'Origano'],
      preparazione: 'Cuoci branzino al sale, verdure al forno con origano. Ricetta mediterranea fitness.',
      tempo: '28 min', porzioni: 1,
      imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop',
      macroTarget: 'mediterranean'
    },
    {
      nome: 'Zuppa Proteica di Lenticchie',
      calorie: 370, proteine: 26, carboidrati: 45, grassi: 8,
      fitnessScore: 86,
      ingredienti: ['120g lenticchie rosse', '100g verdure miste', '50g spinaci', 'Brodo vegetale', 'Curcuma'],
      preparazione: 'Cuoci lenticchie con verdure e spezie. Zuppa ricca e saziante per la sera.',
      tempo: '30 min', porzioni: 1,
      imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop',
      macroTarget: 'plant-protein'
    }
  ],

  // 🍎 SPUNTINI FITNESS (proteici, sazianti, pratici)
  spuntino: [
    {
      nome: 'Shake Proteico Post-Workout',
      calorie: 180, proteine: 25, carboidrati: 12, grassi: 3,
      fitnessScore: 95,
      ingredienti: ['30g proteine whey', '1/2 banana', '200ml acqua', '5g creatina'],
      preparazione: 'Shake ideale post-allenamento per recovery muscolare immediato.',
      tempo: '2 min', porzioni: 1,
      imageUrl: 'https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?w=400&h=300&fit=crop',
      macroTarget: 'post-workout'
    },
    {
      nome: 'Ricotta e Noci',
      calorie: 200, proteine: 18, carboidrati: 8, grassi: 12,
      fitnessScore: 88,
      ingredienti: ['100g ricotta light', '20g noci', '5g miele', 'Cannella'],
      preparazione: 'Ricotta con noci e un tocco di miele. Proteine a lento rilascio.',
      tempo: '3 min', porzioni: 1,
      imageUrl: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=400&h=300&fit=crop',
      macroTarget: 'slow-protein'
    },
    {
      nome: 'Apple Protein Slices',
      calorie: 160, proteine: 15, carboidrati: 18, grassi: 6,
      fitnessScore: 82,
      ingredienti: ['1 mela media', '30g burro mandorle proteico', '5g semi chia'],
      preparazione: 'Fette di mela con burro proteico e semi. Croccante e nutriente.',
      tempo: '5 min', porzioni: 1,
      imageUrl: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&h=300&fit=crop',
      macroTarget: 'pre-workout'
    },
    {
      nome: 'Greek Yogurt Berry Bowl',
      calorie: 170, proteine: 20, carboidrati: 15, grassi: 4,
      fitnessScore: 90,
      ingredienti: ['150g yogurt greco 0%', '80g frutti di bosco', '10g granola proteica'],
      preparazione: 'Yogurt con frutti antiossidanti e granola croccante.',
      tempo: '3 min', porzioni: 1,
      imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop',
      macroTarget: 'antioxidant'
    },
    {
      nome: 'Protein Energy Balls',
      calorie: 190, proteine: 12, carboidrati: 16, grassi: 8,
      fitnessScore: 86,
      ingredienti: ['20g proteine', '30g datteri', '15g mandorle', '10g cocco'],
      preparazione: 'Palline energetiche fatte in casa. Prepara in batch per la settimana.',
      tempo: '15 min prep', porzioni: 4,
      imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
      macroTarget: 'energy'
    },
    {
      nome: 'Cottage Cheese Power',
      calorie: 150, proteine: 22, carboidrati: 6, grassi: 4,
      fitnessScore: 92,
      ingredienti: ['150g cottage cheese', '50g cetrioli', '10g semi girasole', 'Pepe nero'],
      preparazione: 'Cottage cheese salato con verdure. Altissimo contenuto proteico.',
      tempo: '3 min', porzioni: 1,
      imageUrl: 'https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=400&h=300&fit=crop',
      macroTarget: 'high-protein'
    },
    {
      nome: 'Smoothie Verde Detox',
      calorie: 185, proteine: 20, carboidrati: 22, grassi: 5,
      fitnessScore: 87,
      ingredienti: ['25g proteine vegetali', '1 banana piccola', '100g spinaci', '200ml acqua di cocco', 'Spirulina'],
      preparazione: 'Frulla tutto fino a consistenza cremosa. Perfetto per detox e recovery.',
      tempo: '4 min', porzioni: 1,
      imageUrl: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&h=300&fit=crop',
      macroTarget: 'detox'
    },
    {
      nome: 'Hummus Proteico con Verdure',
      calorie: 165, proteine: 14, carboidrati: 18, grassi: 7,
      fitnessScore: 84,
      ingredienti: ['80g hummus di ceci', '10g proteine neutre', 'Carote a bastoncini', 'Cetrioli', 'Peperoni'],
      preparazione: 'Mescola proteine nell\'hummus, servi con verdure croccanti.',
      tempo: '5 min', porzioni: 1,
      imageUrl: 'https://images.unsplash.com/photo-1571306894533-ad06d1070ac4?w=400&h=300&fit=crop',
      macroTarget: 'fiber-protein'
    }
  ]
};

// 🎯 SISTEMA SELEZIONE INTELLIGENTE FITNESS
export const selectFitnessRecipes = (
  mealType: 'colazione' | 'pranzo' | 'cena' | 'spuntino',
  objective: string,
  numDays: number,
  preferences: string[] = [],
  allergies: string[] = []
) => {
  console.log(`🏋️‍♂️ Selecting FITNESS recipes for ${mealType}, objective: ${objective}`);
  
  const recipes = FITNESS_RECIPES_DB[mealType];
  
  // Filtra per allergie
  let availableRecipes = recipes.filter(recipe => {
    const hasAllergy = allergies.some(allergy => 
      recipe.ingredienti.some(ingredient => 
        ingredient.toLowerCase().includes(allergy.toLowerCase())
      )
    );
    return !hasAllergy;
  });

  console.log(`🔍 After allergy filter: ${availableRecipes.length} recipes available`);

  // Filtra per obiettivo fitness SPECIFICO
  if (objective === 'dimagrimento') {
    availableRecipes = availableRecipes.filter(r => 
      r.macroTarget === 'lean' || 
      r.macroTarget === 'high-protein' || 
      r.macroTarget === 'low-carb' ||
      r.fitnessScore >= 85 // Solo ricette con fitness score alto
    );
    console.log(`🎯 Dimagrimento filter: ${availableRecipes.length} lean recipes`);
  } else if (objective === 'aumento-massa') {
    availableRecipes = availableRecipes.filter(r => 
      r.macroTarget === 'muscle-gain' || 
      r.macroTarget === 'balanced' || 
      r.macroTarget === 'high-fat' ||
      r.calorie >= 400 // Ricette più caloriche per massa
    );
    console.log(`💪 Aumento massa filter: ${availableRecipes.length} mass-building recipes`);
  } else if (objective === 'mantenimento') {
    availableRecipes = availableRecipes.filter(r => 
      r.macroTarget === 'balanced' || 
      r.macroTarget === 'mediterranean' ||
      r.fitnessScore >= 80
    );
    console.log(`⚖️ Mantenimento filter: ${availableRecipes.length} balanced recipes`);
  }

  // Filtra per preferenze alimentari
  if (preferences.includes('Vegetariano')) {
    availableRecipes = availableRecipes.filter(r => 
      !r.ingredienti.some(ing => 
        ing.toLowerCase().includes('pollo') ||
        ing.toLowerCase().includes('manzo') ||
        ing.toLowerCase().includes('pesce') ||
        ing.toLowerCase().includes('salmone') ||
        ing.toLowerCase().includes('tonno')
      )
    );
    console.log(`🥗 Vegetarian filter: ${availableRecipes.length} recipes`);
  }

  if (preferences.includes('Vegano')) {
    availableRecipes = availableRecipes.filter(r => 
      r.macroTarget === 'plant-based' ||
      !r.ingredienti.some(ing => 
        ing.toLowerCase().includes('uova') ||
        ing.toLowerCase().includes('latte') ||
        ing.toLowerCase().includes('yogurt') ||
        ing.toLowerCase().includes('formaggio') ||
        ing.toLowerCase().includes('ricotta')
      )
    );
    console.log(`🌱 Vegan filter: ${availableRecipes.length} recipes`);
  }

  // Ordina per fitness score DECRESCENTE
  availableRecipes.sort((a, b) => b.fitnessScore - a.fitnessScore);

  // Seleziona ricette diverse per ogni giorno con VARIETÀ MASSIMA
  const selectedRecipes = [];
  const usedRecipeNames = new Set();
  
  for (let i = 0; i < numDays; i++) {
    // Trova ricetta non ancora usata
    let selectedRecipe = null;
    
    for (const recipe of availableRecipes) {
      if (!usedRecipeNames.has(recipe.nome)) {
        selectedRecipe = recipe;
        usedRecipeNames.add(recipe.nome);
        break;
      }
    }
    
    // Se tutte le ricette sono state usate, ricomincia dal miglior fitness score
    if (!selectedRecipe && availableRecipes.length > 0) {
      selectedRecipe = availableRecipes[i % availableRecipes.length];
    }
    
    if (selectedRecipe) {
      selectedRecipes.push(selectedRecipe);
      console.log(`✅ Day ${i + 1}: Selected "${selectedRecipe.nome}" (Score: ${selectedRecipe.fitnessScore})`);
    }
  }

  console.log(`🎉 Total selected: ${selectedRecipes.length} FITNESS recipes for ${mealType}`);
  return selectedRecipes;
};

// 🔥 FUNZIONE AVANZATA: OTTIMIZZAZIONE CALORIE
export const optimizeRecipeCalories = (recipe: any, targetCalories: number) => {
  const originalCalories = recipe.calorie;
  const scaleFactor = targetCalories / originalCalories;
  
  console.log(`📊 Optimizing "${recipe.nome}": ${originalCalories} → ${targetCalories} kcal (factor: ${scaleFactor.toFixed(2)})`);
  
  return {
    ...recipe,
    calorie: targetCalories,
    proteine: Math.round(recipe.proteine * scaleFactor),
    carboidrati: Math.round(recipe.carboidrati * scaleFactor),
    grassi: Math.round(recipe.grassi * scaleFactor),
    ingredienti: recipe.ingredienti.map((ing: string) => {
      // Scala quantità negli ingredienti se presenti numeri
      return ing.replace(/(\d+)(g|ml|cucchiai|cucchiaini)/g, (match, num, unit) => {
        const scaledAmount = Math.round(parseInt(num) * scaleFactor);
        return `${scaledAmount}${unit}`;
      });
    }),
    _originalCalories: originalCalories,
    _scaleFactor: scaleFactor
  };
};

// 🎯 FUNZIONE: GENERA PIANO COMPLETO FITNESS
export const generateCompleteFitnessPlan = (
  formData: any,
  targetCalories: { [key: string]: number },
  numDays: number
) => {
  console.log('🏋️‍♂️ Generating COMPLETE FITNESS meal plan...');
  console.log('🎯 Target calories per meal:', targetCalories);
  
  const objetivo = formData.obiettivo || 'mantenimento';
  const allergie = formData.allergie || [];
  const preferenze = formData.preferenze || [];
  
  const completePlan = {
    days: [],
    totalRecipes: 0,
    fitnessOptimized: true,
    objective: objetivo
  };
  
  for (let day = 0; day < numDays; day++) {
    const dayPlan = {
      day: `Giorno ${day + 1}`,
      meals: {},
      dayCalories: 0,
      dayProtein: 0,
      dayCarbs: 0,
      dayFat: 0
    };
    
    // COLAZIONE FITNESS
    if (targetCalories.colazione) {
      const colazioneOptions = selectFitnessRecipes('colazione', objetivo, 1, preferenze, allergie);
      if (colazioneOptions.length > 0) {
        const selected = colazioneOptions[day % colazioneOptions.length];
        const optimized = optimizeRecipeCalories(selected, targetCalories.colazione);
        dayPlan.meals.colazione = optimized;
        dayPlan.dayCalories += optimized.calorie;
        dayPlan.dayProtein += optimized.proteine;
        dayPlan.dayCarbs += optimized.carboidrati;
        dayPlan.dayFat += optimized.grassi;
        completePlan.totalRecipes++;
      }
    }
    
    // PRANZO FITNESS
    if (targetCalories.pranzo) {
      const pranzoOptions = selectFitnessRecipes('pranzo', objetivo, 1, preferenze, allergie);
      if (pranzoOptions.length > 0) {
        const selected = pranzoOptions[day % pranzoOptions.length];
        const optimized = optimizeRecipeCalories(selected, targetCalories.pranzo);
        dayPlan.meals.pranzo = optimized;
        dayPlan.dayCalories += optimized.calorie;
        dayPlan.dayProtein += optimized.proteine;
        dayPlan.dayCarbs += optimized.carboidrati;
        dayPlan.dayFat += optimized.grassi;
        completePlan.totalRecipes++;
      }
    }
    
    // CENA FITNESS
    if (targetCalories.cena) {
      const cenaOptions = selectFitnessRecipes('cena', objetivo, 1, preferenze, allergie);
      if (cenaOptions.length > 0) {
        const selected = cenaOptions[day % cenaOptions.length];
        const optimized = optimizeRecipeCalories(selected, targetCalories.cena);
        dayPlan.meals.cena = optimized;
        dayPlan.dayCalories += optimized.calorie;
        dayPlan.dayProtein += optimized.proteine;
        dayPlan.dayCarbs += optimized.carboidrati;
        dayPlan.dayFat += optimized.grassi;
        completePlan.totalRecipes++;
      }
    }
    
    // SPUNTINI FITNESS
    ['spuntino1', 'spuntino2', 'spuntino3'].forEach(spuntino => {
      if (targetCalories[spuntino]) {
        const spuntinoOptions = selectFitnessRecipes('spuntino', objetivo, 1, preferenze, allergie);
        if (spuntinoOptions.length > 0) {
          const selected = spuntinoOptions[day % spuntinoOptions.length];
          const optimized = optimizeRecipeCalories(selected, targetCalories[spuntino]);
          dayPlan.meals[spuntino] = optimized;
          dayPlan.dayCalories += optimized.calorie;
          dayPlan.dayProtein += optimized.proteine;
          dayPlan.dayCarbs += optimized.carboidrati;
          dayPlan.dayFat += optimized.grassi;
          completePlan.totalRecipes++;
        }
      }
    });
    
    completePlan.days.push(dayPlan);
    console.log(`✅ Day ${day + 1} completed: ${dayPlan.dayCalories} kcal, ${dayPlan.dayProtein}g protein`);
  }
  
  console.log(`🎉 FITNESS plan completed: ${completePlan.totalRecipes} recipes, ${completePlan.days.length} days`);
  return completePlan;
};

// 🏅 FUNZIONE: CALCOLA FITNESS SCORE GLOBALE DEL PIANO
export const calculatePlanFitnessScore = (plan: any) => {
  let totalScore = 0;
  let totalRecipes = 0;
  
  plan.days.forEach((day: any) => {
    Object.values(day.meals).forEach((meal: any) => {
      if (meal && meal.fitnessScore) {
        totalScore += meal.fitnessScore;
        totalRecipes++;
      }
    });
  });
  
  const averageScore = totalRecipes > 0 ? Math.round(totalScore / totalRecipes) : 0;
  
  console.log(`🏅 Plan FITNESS Score: ${averageScore}/100 (${totalRecipes} recipes)`);
  return {
    averageScore,
    totalRecipes,
    rating: averageScore >= 90 ? 'EXCELLENT' : averageScore >= 80 ? 'GOOD' : averageScore >= 70 ? 'FAIR' : 'NEEDS_IMPROVEMENT'
  };
};

// 🎨 EXPORT FINALE
export default FITNESS_RECIPES_DB;