// 🍳 DATABASE RICETTE - RISULTATI GARANTITI PER TUTTI I FILTRI
import { FITNESS_RECIPES_DB } from './fitness_recipes_database';

// Interfaccia Recipe compatibile con pagina ricette
export interface Recipe {
  id: string;
  nome: string;
  categoria: 'colazione' | 'pranzo' | 'cena' | 'spuntino';
  tipoCucina: 'italiana' | 'mediterranea' | 'asiatica' | 'americana' | 'messicana' | 'internazionale' | 'ricette_fit';
  difficolta: 'facile' | 'medio' | 'difficile';
  tempoPreparazione: number;
  porzioni: number;
  calorie: number;
  proteine: number;
  carboidrati: number;
  grassi: number;
  ingredienti: string[];
  preparazione: string;
  tipoDieta: ('vegetariana' | 'vegana' | 'senza_glutine' | 'keto' | 'paleo' | 'mediterranea' | 'low_carb' | 'chetogenica' | 'bilanciata')[];
  allergie: string[];
  stagione: ('primavera' | 'estate' | 'autunno' | 'inverno' | 'tutto_anno')[];
  tags: string[];
  imageUrl?: string;
  createdAt: Date;
  rating?: number;
  reviewCount?: number;
}

// 🗃️ CLASSE SINGLETON RECIPE DATABASE
export class RecipeDatabase {
  private static instance: RecipeDatabase;
  private recipes: Recipe[] = [];
  private favorites: Set<string> = new Set();

  private constructor() {
    this.initializeDatabase();
    this.loadFavorites();
  }

  public static getInstance(): RecipeDatabase {
    if (!RecipeDatabase.instance) {
      RecipeDatabase.instance = new RecipeDatabase();
    }
    return RecipeDatabase.instance;
  }

  // 🏗️ INIZIALIZZA DATABASE CON RISULTATI GARANTITI
  private initializeDatabase(): void {
    console.log('🍳 [GUARANTEED] Initializing Recipe Database...');
    
    try {
      const allRecipes: Recipe[] = [];

      // 1️⃣ CARICA RICETTE FITNESS SE DISPONIBILI
      if (FITNESS_RECIPES_DB) {
        console.log('📚 [GUARANTEED] Loading FITNESS_RECIPES_DB...');
        allRecipes.push(...this.loadFromFitnessDB());
      }

      // 2️⃣ AGGIUNGI RICETTE GARANTITE PER OGNI FILTRO
      console.log('🎯 [GUARANTEED] Adding guaranteed filter recipes...');
      allRecipes.push(...this.createGuaranteedFilterRecipes());

      // 3️⃣ AGGIUNGI RICETTE EXTRA PER VARIETÀ
      console.log('🌟 [GUARANTEED] Adding variety recipes...');
      allRecipes.push(...this.createVarietyRecipes());

      this.recipes = allRecipes;
      
      console.log(`✅ [GUARANTEED] Database loaded: ${this.recipes.length} recipes`);
      console.log(`🎛️ [GUARANTEED] Available cuisines:`, [...new Set(this.recipes.map(r => r.tipoCucina))]);
      console.log(`🥗 [GUARANTEED] Available diets:`, [...new Set(this.recipes.flatMap(r => r.tipoDieta))]);
      
      // 🧪 TEST FILTRI
      this.testAllFilters();
      
    } catch (error) {
      console.error('🚨 [GUARANTEED] Database error:', error);
      this.recipes = this.createGuaranteedFilterRecipes();
      console.log(`🆘 [GUARANTEED] Emergency recipes: ${this.recipes.length}`);
    }
  }

  // 📥 CARICA DA FITNESS_RECIPES_DB
  private loadFromFitnessDB(): Recipe[] {
    const recipes: Recipe[] = [];
    let counter = 1;

    try {
      ['colazione', 'pranzo', 'cena', 'spuntino'].forEach(categoria => {
        if (FITNESS_RECIPES_DB[categoria] && Array.isArray(FITNESS_RECIPES_DB[categoria])) {
          FITNESS_RECIPES_DB[categoria].forEach((recipe: any) => {
            recipes.push(this.convertFitnessRecipe(recipe, categoria, counter++));
          });
        }
      });
    } catch (error) {
      console.error('🚨 [GUARANTEED] Error loading FITNESS_RECIPES_DB:', error);
    }

    console.log(`📚 [GUARANTEED] Loaded ${recipes.length} recipes from FITNESS_RECIPES_DB`);
    return recipes;
  }

  // 🎯 RICETTE GARANTITE PER OGNI FILTRO DIETA
  private createGuaranteedFilterRecipes(): Recipe[] {
    console.log('🎯 [GUARANTEED] Creating guaranteed filter recipes...');
    
    return [
      // 🥑 CHETOGENICA (GARANTITA)
      {
        id: 'guaranteed_keto_001',
        nome: 'Avocado Keto Bowl',
        categoria: 'colazione',
        tipoCucina: 'ricette_fit',
        difficolta: 'facile',
        tempoPreparazione: 10,
        porzioni: 1,
        calorie: 450,
        proteine: 20,
        carboidrati: 8, // < 15g = KETO
        grassi: 35,     // > 15g = KETO
        ingredienti: ['1 avocado grande', '2 uova', '30g salmone affumicato', '15g olio MCT', 'sale, pepe'],
        preparazione: 'Taglia avocado a metà, aggiungi uova strapazzate e salmone. Condisci con olio MCT.',
        tipoDieta: ['chetogenica', 'keto', 'low_carb'], // MULTIPLE TAGS
        allergie: ['uova', 'pesce'],
        stagione: ['tutto_anno'],
        tags: ['keto', 'high-fat', 'low-carb'],
        imageUrl: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=300&fit=crop&auto=format',
        createdAt: new Date(),
        rating: 4.8,
        reviewCount: 45
      },
      {
        id: 'guaranteed_keto_002',
        nome: 'Shake Chetogenico MCT',
        categoria: 'spuntino',
        tipoCucina: 'ricette_fit',
        difficolta: 'facile',
        tempoPreparazione: 5,
        porzioni: 1,
        calorie: 380,
        proteine: 25,
        carboidrati: 6, // < 15g = KETO
        grassi: 32,     // > 15g = KETO
        ingredienti: ['200ml latte di cocco', '25g proteine whey', '15g olio MCT', '10g burro di mandorle'],
        preparazione: 'Frulla tutti gli ingredienti fino a consistenza cremosa. Ideale post-workout keto.',
        tipoDieta: ['chetogenica', 'keto', 'low_carb'],
        allergie: ['frutta_secca'],
        stagione: ['tutto_anno'],
        tags: ['keto', 'post-workout', 'mct'],
        imageUrl: 'https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?w=400&h=300&fit=crop&auto=format',
        createdAt: new Date(),
        rating: 4.6,
        reviewCount: 32
      },

      // 🥩 LOW CARB (GARANTITA)
      {
        id: 'guaranteed_lowcarb_001',
        nome: 'Salmone Low Carb Supreme',
        categoria: 'cena',
        tipoCucina: 'mediterranea',
        difficolta: 'medio',
        tempoPreparazione: 20,
        porzioni: 1,
        calorie: 420,
        proteine: 35,
        carboidrati: 12, // < 25g = LOW CARB
        grassi: 28,
        ingredienti: ['180g salmone norvegese', '200g zucchine', '100g asparagi', '15g olio EVO', 'erbe provenzali'],
        preparazione: 'Cuoci salmone alla griglia 6 min per lato. Saltella verdure in padella con olio e erbe.',
        tipoDieta: ['low_carb', 'mediterranea', 'senza_glutine'],
        allergie: ['pesce'],
        stagione: ['tutto_anno'],
        tags: ['low-carb', 'omega-3', 'grill'],
        imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop&auto=format',
        createdAt: new Date(),
        rating: 4.7,
        reviewCount: 38
      },
      {
        id: 'guaranteed_lowcarb_002',
        nome: 'Pollo Low Carb Power',
        categoria: 'pranzo',
        tipoCucina: 'ricette_fit',
        difficolta: 'facile',
        tempoPreparazione: 18,
        porzioni: 1,
        calorie: 380,
        proteine: 42,
        carboidrati: 15, // < 25g = LOW CARB
        grassi: 16,
        ingredienti: ['150g petto pollo', '100g broccoli', '80g spinaci', '50g pomodorini', 'spezie'],
        preparazione: 'Griglia pollo con spezie. Cuoci broccoli al vapore. Componi bowl con spinaci freschi.',
        tipoDieta: ['low_carb', 'bilanciata'],
        allergie: [],
        stagione: ['tutto_anno'],
        tags: ['low-carb', 'high-protein', 'lean'],
        imageUrl: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400&h=300&fit=crop&auto=format',
        createdAt: new Date(),
        rating: 4.5,
        reviewCount: 29
      },

      // 🏛️ PALEO (GARANTITA)
      {
        id: 'guaranteed_paleo_001',
        nome: 'Bowl Paleo Completo',
        categoria: 'pranzo',
        tipoCucina: 'internazionale',
        difficolta: 'medio',
        tempoPreparazione: 25,
        porzioni: 1,
        calorie: 480,
        proteine: 32,
        carboidrati: 28,
        grassi: 26,
        ingredienti: ['120g manzo grass-fed', '120g patate dolci', '100g spinaci baby', '1/2 avocado', 'olio oliva'],
        preparazione: 'Cuoci manzo e patate dolci al forno 180°C per 20min. Servi su letto di spinaci con avocado.',
        tipoDieta: ['paleo', 'senza_glutine'], // NO cereali, legumi, latticini
        allergie: [],
        stagione: ['tutto_anno'],
        tags: ['paleo', 'grass-fed', 'whole-food'],
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&auto=format',
        createdAt: new Date(),
        rating: 4.4,
        reviewCount: 22
      },
      {
        id: 'guaranteed_paleo_002',
        nome: 'Frittata Paleo Vegetables',
        categoria: 'colazione',
        tipoCucina: 'americana',
        difficolta: 'facile',
        tempoPreparazione: 15,
        porzioni: 1,
        calorie: 350,
        proteine: 28,
        carboidrati: 12,
        grassi: 22,
        ingredienti: ['3 uova ruspanti', '100g verdure miste', '80g funghi', 'olio cocco', 'erbe fresche'],
        preparazione: 'Sbatti uova, aggiungi verdure saltate. Cuoci in padella con olio di cocco.',
        tipoDieta: ['paleo', 'vegetariana', 'senza_glutine'],
        allergie: ['uova'],
        stagione: ['tutto_anno'],
        tags: ['paleo', 'breakfast', 'veggie'],
        imageUrl: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&h=300&fit=crop&auto=format',
        createdAt: new Date(),
        rating: 4.3,
        reviewCount: 18
      },

      // ⚖️ BILANCIATA (40-30-30) (GARANTITA)
      {
        id: 'guaranteed_balanced_001',
        nome: 'Pasto Bilanciato 40-30-30',
        categoria: 'pranzo',
        tipoCucina: 'mediterranea',
        difficolta: 'medio',
        tempoPreparazione: 30,
        porzioni: 1,
        calorie: 500,
        proteine: 35,    // 28% proteine
        carboidrati: 40, // 32% carbs  
        grassi: 20,      // 36% grassi = BILANCIATA
        ingredienti: ['120g pollo', '70g riso integrale', '150g verdure', '15g olio EVO', 'spezie mediterranee'],
        preparazione: 'Cuoci pollo con spezie. Lessaggio riso. Saltella verdure. Componi piatto bilanciato.',
        tipoDieta: ['bilanciata', 'mediterranea'],
        allergie: [],
        stagione: ['tutto_anno'],
        tags: ['balanced', '40-30-30', 'complete'],
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&auto=format',
        createdAt: new Date(),
        rating: 4.8,
        reviewCount: 52
      },

      // 🌱 VEGANA (GARANTITA)
      {
        id: 'guaranteed_vegan_001',
        nome: 'Bowl Vegano Proteico',
        categoria: 'cena',
        tipoCucina: 'asiatica',
        difficolta: 'facile',
        tempoPreparazione: 18,
        porzioni: 1,
        calorie: 400,
        proteine: 22,
        carboidrati: 45,
        grassi: 15,
        ingredienti: ['150g tofu marinato', '80g quinoa', '100g edamame', '50g carote', 'salsa tahini'],
        preparazione: 'Marina tofu in salsa soia. Cuoci quinoa. Componi bowl con edamame e salsa tahini.',
        tipoDieta: ['vegana', 'vegetariana', 'senza_glutine'],
        allergie: [],
        stagione: ['tutto_anno'],
        tags: ['vegan', 'plant-protein', 'asian'],
        imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop&auto=format',
        createdAt: new Date(),
        rating: 4.2,
        reviewCount: 25
      },

      // 🥬 VEGETARIANA (GARANTITA)
      {
        id: 'guaranteed_vegetarian_001',
        nome: 'Pasta Vegetariana Proteica',
        categoria: 'pranzo',
        tipoCucina: 'italiana',
        difficolta: 'facile',
        tempoPreparazione: 20,
        porzioni: 1,
        calorie: 450,
        proteine: 28,
        carboidrati: 52,
        grassi: 14,
        ingredienti: ['80g pasta integrale', '100g ricotta', '80g spinaci', '50g parmigiano', 'pomodorini'],
        preparazione: 'Cuoci pasta. Saltella spinaci con ricotta. Manteca con parmigiano e pomodorini.',
        tipoDieta: ['vegetariana', 'mediterranea'],
        allergie: ['latte', 'glutine'],
        stagione: ['tutto_anno'],
        tags: ['vegetarian', 'italian', 'comfort'],
        imageUrl: 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400&h=300&fit=crop&auto=format',
        createdAt: new Date(),
        rating: 4.6,
        reviewCount: 34
      },

      // 🌊 MEDITERRANEA (GARANTITA)
      {
        id: 'guaranteed_mediterranean_001',
        nome: 'Branzino Mediterraneo',
        categoria: 'cena',
        tipoCucina: 'mediterranea',
        difficolta: 'medio',
        tempoPreparazione: 25,
        porzioni: 1,
        calorie: 420,
        proteine: 38,
        carboidrati: 18,
        grassi: 22,
        ingredienti: ['150g branzino', '100g pomodorini', '80g olive taggiasche', 'capperi', 'olio EVO'],
        preparazione: 'Cuoci branzino in crosta di sale. Prepara condimento con pomodorini, olive e capperi.',
        tipoDieta: ['mediterranea', 'senza_glutine'],
        allergie: ['pesce'],
        stagione: ['estate', 'tutto_anno'],
        tags: ['mediterranean', 'omega-3', 'italy'],
        imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop&auto=format',
        createdAt: new Date(),
        rating: 4.7,
        reviewCount: 41
      },

      // 🍞 SENZA GLUTINE (GARANTITA)
      {
        id: 'guaranteed_gluten_free_001',
        nome: 'Quinoa Bowl Senza Glutine',
        categoria: 'pranzo',
        tipoCucina: 'internazionale',
        difficolta: 'facile',
        tempoPreparazione: 22,
        porzioni: 1,
        calorie: 460,
        proteine: 24,
        carboidrati: 48,
        grassi: 18,
        ingredienti: ['100g quinoa', '120g gamberi', '100g verdure', '1/2 avocado', 'limone'],
        preparazione: 'Cuoci quinoa in brodo. Saltella gamberi. Componi bowl con verdure e avocado.',
        tipoDieta: ['senza_glutine', 'mediterranea'],
        allergie: ['crostacei'],
        stagione: ['tutto_anno'],
        tags: ['gluten-free', 'seafood', 'complete'],
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&auto=format',
        createdAt: new Date(),
        rating: 4.4,
        reviewCount: 27
      }
    ];
  }

  // 🌟 RICETTE VARIETÀ PER TUTTI I TIPI CUCINA
  private createVarietyRecipes(): Recipe[] {
    return [
      // 🇮🇹 ITALIANA
      {
        id: 'variety_italiana_001',
        nome: 'Risotto Proteico ai Funghi',
        categoria: 'pranzo',
        tipoCucina: 'italiana',
        difficolta: 'medio',
        tempoPreparazione: 35,
        porzioni: 2,
        calorie: 480,
        proteine: 26,
        carboidrati: 58,
        grassi: 16,
        ingredienti: ['120g riso carnaroli', '200g funghi porcini', '50g parmigiano', 'brodo vegetale'],
        preparazione: 'Tosta riso, aggiungi brodo gradualmente. Incorpora funghi e manteca con parmigiano.',
        tipoDieta: ['vegetariana', 'mediterranea'],
        allergie: ['latte'],
        stagione: ['autunno', 'tutto_anno'],
        tags: ['italian', 'comfort', 'mushrooms'],
        imageUrl: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop&auto=format',
        createdAt: new Date(),
        rating: 4.5,
        reviewCount: 31
      },

      // 🇺🇸 AMERICANA
      {
        id: 'variety_americana_001',
        nome: 'Pancakes Proteici USA Style',
        categoria: 'colazione',
        tipoCucina: 'americana',
        difficolta: 'facile',
        tempoPreparazione: 15,
        porzioni: 1,
        calorie: 420,
        proteine: 32,
        carboidrati: 38,
        grassi: 16,
        ingredienti: ['50g farina avena', '30g proteine whey', '2 uova', '100ml latte mandorle', 'mirtilli'],
        preparazione: 'Mescola ingredienti secchi e umidi. Cuoci in padella. Servi con mirtilli freschi.',
        tipoDieta: ['bilanciata'],
        allergie: ['uova', 'frutta_secca'],
        stagione: ['tutto_anno'],
        tags: ['american', 'breakfast', 'protein'],
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&auto=format',
        createdAt: new Date(),
        rating: 4.6,
        reviewCount: 28
      },

      // 🌏 ASIATICA
      {
        id: 'variety_asiatica_001',
        nome: 'Teriyaki Salmon Bowl',
        categoria: 'cena',
        tipoCucina: 'asiatica',
        difficolta: 'medio',
        tempoPreparazione: 20,
        porzioni: 1,
        calorie: 450,
        proteine: 34,
        carboidrati: 32,
        grassi: 20,
        ingredienti: ['140g salmone', '80g riso jasmine', 'salsa teriyaki', 'edamame', 'nori'],
        preparazione: 'Marina salmone in teriyaki. Cuoci alla griglia. Servi su riso con edamame.',
        tipoDieta: ['senza_glutine', 'mediterranea'],
        allergie: ['pesce'],
        stagione: ['tutto_anno'],
        tags: ['asian', 'teriyaki', 'salmon'],
        imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop&auto=format',
        createdAt: new Date(),
        rating: 4.7,
        reviewCount: 39
      },

      // 🇲🇽 MESSICANA
      {
        id: 'variety_messicana_001',
        nome: 'Bowl Messicano Proteico',
        categoria: 'cena',
        tipoCucina: 'messicana',
        difficolta: 'facile',
        tempoPreparazione: 18,
        porzioni: 1,
        calorie: 470,
        proteine: 30,
        carboidrati: 35,
        grassi: 22,
        ingredienti: ['120g pollo', '80g fagioli neri', '1/2 avocado', 'salsa piccante', 'lime'],
        preparazione: 'Cuoci pollo con spezie messicane. Componi bowl con fagioli, avocado e salsa.',
        tipoDieta: ['bilanciata', 'senza_glutine'],
        allergie: [],
        stagione: ['tutto_anno'],
        tags: ['mexican', 'spicy', 'bowl'],
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&auto=format',
        createdAt: new Date(),
        rating: 4.3,
        reviewCount: 24
      }
    ];
  }

  // 🔄 CONVERTI RICETTA FITNESS
  private convertFitnessRecipe(fitnessRecipe: any, categoria: string, id: number): Recipe {
    try {
      return {
        id: `fitness_${id.toString().padStart(3, '0')}`,
        nome: fitnessRecipe.nome || `Ricetta Fitness ${id}`,
        categoria: categoria as any,
        tipoCucina: this.determineTipoCucina(fitnessRecipe.nome || '', fitnessRecipe.macroTarget),
        difficolta: this.determineDifficolta(fitnessRecipe.tempo || '20 min'),
        tempoPreparazione: this.parseTempoPreparazione(fitnessRecipe.tempo || '20 min'),
        porzioni: fitnessRecipe.porzioni || 1,
        calorie: fitnessRecipe.calorie || 300,
        proteine: fitnessRecipe.proteine || 20,
        carboidrati: fitnessRecipe.carboidrati || 30,
        grassi: fitnessRecipe.grassi || 10,
        ingredienti: Array.isArray(fitnessRecipe.ingredienti) ? fitnessRecipe.ingredienti : ['Ingredienti vari'],
        preparazione: fitnessRecipe.preparazione || 'Preparazione semplice e veloce.',
        tipoDieta: this.determineTipoDieta(fitnessRecipe),
        allergie: this.determineAllergie(fitnessRecipe.ingredienti || []),
        stagione: ['tutto_anno'],
        tags: this.generateTags(fitnessRecipe),
        imageUrl: this.getImageUrl(fitnessRecipe.nome || `Ricetta ${id}`, categoria),
        createdAt: new Date(),
        rating: this.generateRating(fitnessRecipe.fitnessScore),
        reviewCount: Math.floor(Math.random() * 50) + 5,
      };
    } catch (error) {
      console.error(`🚨 [GUARANTEED] Error converting recipe ${id}:`, error);
      return this.createFallbackRecipe(id, categoria);
    }
  }

  // 🧪 TEST TUTTI I FILTRI
  private testAllFilters(): void {
    console.log('🧪 [GUARANTEED] Testing all filters...');
    
    // Test ogni tipo dieta
    const diets = ['vegetariana', 'vegana', 'senza_glutine', 'keto', 'paleo', 'mediterranea', 'low_carb', 'chetogenica', 'bilanciata'];
    diets.forEach(diet => {
      const results = this.searchRecipes({ tipoDieta: [diet] });
      console.log(`🥗 [GUARANTEED] Diet "${diet}": ${results.length} recipes`);
      if (results.length === 0) {
        console.warn(`⚠️ [GUARANTEED] NO RECIPES for diet: ${diet}`);
      }
    });

    // Test ogni tipo cucina
    const cuisines = ['italiana', 'mediterranea', 'asiatica', 'americana', 'messicana', 'internazionale', 'ricette_fit'];
    cuisines.forEach(cuisine => {
      const results = this.searchRecipes({ tipoCucina: cuisine });
      console.log(`🍳 [GUARANTEED] Cuisine "${cuisine}": ${results.length} recipes`);
      if (results.length === 0) {
        console.warn(`⚠️ [GUARANTEED] NO RECIPES for cuisine: ${cuisine}`);
      }
    });
  }

  // 🔄 UTILITY METHODS
  private createFallbackRecipe(id: number, categoria: string): Recipe {
    return {
      id: `fallback_${id}`,
      nome: `Ricetta ${categoria} ${id}`,
      categoria: categoria as any,
      tipoCucina: 'mediterranea',
      difficolta: 'facile',
      tempoPreparazione: 15,
      porzioni: 1,
      calorie: 300,
      proteine: 20,
      carboidrati: 30,
      grassi: 10,
      ingredienti: ['Ingrediente base'],
      preparazione: 'Preparazione semplice.',
      tipoDieta: ['bilanciata'],
      allergie: [],
      stagione: ['tutto_anno'],
      tags: ['basic'],
      imageUrl: this.getImageUrl('fallback', categoria),
      createdAt: new Date(),
      rating: 4.0,
      reviewCount: 10
    };
  }

  private determineTipoCucina(nome: string, macroTarget?: string): 'italiana' | 'mediterranea' | 'asiatica' | 'americana' | 'messicana' | 'internazionale' | 'ricette_fit' {
    const nomeLC = nome.toLowerCase();
    
    if (nomeLC.includes('protein') || nomeLC.includes('fitness') || nomeLC.includes('power') || 
        nomeLC.includes('shake') || nomeLC.includes('keto') || macroTarget === 'high-protein') {
      return 'ricette_fit';
    }
    if (nomeLC.includes('risotto') || nomeLC.includes('pasta') || nomeLC.includes('parmigiano')) {
      return 'italiana';
    }
    if (nomeLC.includes('teriyaki') || nomeLC.includes('tofu') || nomeLC.includes('edamame')) {
      return 'asiatica';
    }
    if (nomeLC.includes('pancakes') || nomeLC.includes('burger') || nomeLC.includes('muffin')) {
      return 'americana';
    }
    if (nomeLC.includes('salsa') || nomeLC.includes('avocado') && nomeLC.includes('lime')) {
      return 'messicana';
    }
    if (nomeLC.includes('salmone') || nomeLC.includes('branzino') || nomeLC.includes('olive')) {
      return 'mediterranea';
    }
    
    return 'internazionale';
  }

  private determineDifficolta(tempo: string): 'facile' | 'medio' | 'difficile' {
    const minutes = this.parseTempoPreparazione(tempo);
    if (minutes <= 15) return 'facile';
    if (minutes <= 30) return 'medio';
    return 'difficile';
  }

  private parseTempoPreparazione(tempo: string): number {
    const match = tempo.match(/(\d+)/);
    return match ? parseInt(match[1]) : 20;
  }

  // 🎯 DETERMINAZIONE TIPO DIETA INTELLIGENTE
  private determineTipoDieta(recipe: any): ('vegetariana' | 'vegana' | 'senza_glutine' | 'keto' | 'paleo' | 'mediterranea' | 'low_carb' | 'chetogenica' | 'bilanciata')[] {
    const diets: any[] = [];
    const ingredienti = Array.isArray(recipe.ingredienti) ? recipe.ingredienti.join(' ').toLowerCase() : '';
    const nome = recipe.nome ? recipe.nome.toLowerCase() : '';
    
    // 🥬 VEGETARIANA (no carne/pesce)
    if (!ingredienti.includes('carne') && !ingredienti.includes('pesce') && 
        !ingredienti.includes('pollo') && !ingredienti.includes('manzo') && 
        !ingredienti.includes('salmone') && !ingredienti.includes('tonno') &&
        !ingredienti.includes('gamberi')) {
      diets.push('vegetariana');
    }
    
    // 🌱 VEGANA (no derivati animali)
    if (!ingredienti.includes('uova') && !ingredienti.includes('latte') && 
        !ingredienti.includes('formaggio') && !ingredienti.includes('yogurt') && 
        !ingredienti.includes('ricotta') && !ingredienti.includes('parmigiano') &&
        !ingredienti.includes('burro') && !ingredienti.includes('miele')) {
      diets.push('vegana');
    }
    
    // 🥖 SENZA GLUTINE (no glutine/cereali con glutine)
    if (!ingredienti.includes('glutine') && !ingredienti.includes('pane') && 
        !ingredienti.includes('pasta') && !ingredienti.includes('farina') && 
        !ingredienti.includes('orzo') && !ingredienti.includes('segale')) {
      diets.push('senza_glutine');
    }
    
    // 🥑 KETO/CHETOGENICA (< 15g carbs E > 15g grassi)
    if (recipe.carboidrati < 15 && recipe.grassi > 15) {
      diets.push('keto');
      diets.push('chetogenica');
    }
    
    // 🥩 LOW CARB (< 25g carbs)
    if (recipe.carboidrati < 25) {
      diets.push('low_carb');
    }
    
    // 🏛️ PALEO (no cereali/legumi/latticini)
    if (!ingredienti.includes('latte') && !ingredienti.includes('formaggio') && 
        !ingredienti.includes('fagioli') && !ingredienti.includes('lenticchie') && 
        !ingredienti.includes('cereali') && !ingredienti.includes('avena') &&
        !ingredienti.includes('riso') && !ingredienti.includes('pasta')) {
      diets.push('paleo');
    }
    
    // 🌊 MEDITERRANEA (olio evo, pesce, olive)
    if (ingredienti.includes('olio evo') || ingredienti.includes('olive') || 
        ingredienti.includes('pesce') || ingredienti.includes('salmone') ||
        ingredienti.includes('branzino') || ingredienti.includes('pomodorini')) {
      diets.push('mediterranea');
    }
    
    // ⚖️ BILANCIATA (40-30-30 circa)
    if (recipe.proteine && recipe.carboidrati && recipe.grassi) {
      const totalCal = recipe.proteine * 4 + recipe.carboidrati * 4 + recipe.grassi * 9;
      const proteinPercent = (recipe.proteine * 4) / totalCal * 100;
      const carbPercent = (recipe.carboidrati * 4) / totalCal * 100;
      const fatPercent = (recipe.grassi * 9) / totalCal * 100;
      
      // Range più ampio per bilanciata
      if (proteinPercent >= 20 && proteinPercent <= 40 && 
          carbPercent >= 25 && carbPercent <= 50 && 
          fatPercent >= 15 && fatPercent <= 40) {
        diets.push('bilanciata');
      }
    }
    
    // Se nessuna dieta, aggiungi bilanciata
    if (diets.length === 0) {
      diets.push('bilanciata');
    }
    
    return [...new Set(diets)]; // Rimuovi duplicati
  }

  private determineAllergie(ingredienti: string[]): string[] {
    const allergie: string[] = [];
    const text = ingredienti.join(' ').toLowerCase();
    
    if (text.includes('latte') || text.includes('formaggio') || text.includes('yogurt') || text.includes('ricotta')) {
      allergie.push('latte');
    }
    if (text.includes('uova')) {
      allergie.push('uova');
    }
    if (text.includes('noci') || text.includes('mandorle') || text.includes('pistacchi') || text.includes('arachidi')) {
      allergie.push('frutta_secca');
    }
    if (text.includes('pesce') || text.includes('salmone') || text.includes('tonno') || text.includes('branzino')) {
      allergie.push('pesce');
    }
    if (text.includes('gamberi') || text.includes('crostacei')) {
      allergie.push('crostacei');
    }
    if (text.includes('glutine') || text.includes('pasta') || text.includes('pane')) {
      allergie.push('glutine');
    }
    
    return allergie;
  }

  private generateTags(recipe: any): string[] {
    const tags: string[] = [];
    
    if (recipe.fitnessScore >= 90) tags.push('top-rated');
    if (recipe.calorie < 300) tags.push('light');
    if (recipe.proteine >= 25) tags.push('high-protein');
    if (recipe.macroTarget) tags.push(recipe.macroTarget);
    
    return tags;
  }

  private generateRating(fitnessScore?: number): number {
    if (fitnessScore) {
      return Math.min(5.0, Math.max(3.0, (fitnessScore / 100) * 2 + 3));
    }
    return Math.random() * 1.5 + 3.5;
  }

  private getImageUrl(nome: string, categoria: string): string {
    const nomeLC = nome.toLowerCase();
    
    // Mapping specifico
    if (nomeLC.includes('avocado')) {
      return 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('shake') || nomeLC.includes('smoothie')) {
      return 'https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('salmone') || nomeLC.includes('salmon')) {
      return 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('pollo') || nomeLC.includes('chicken')) {
      return 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('bowl') || nomeLC.includes('quinoa')) {
      return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('pasta')) {
      return 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('risotto')) {
      return 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('pancakes')) {
      return 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('frittata')) {
      return 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('branzino')) {
      return 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop&auto=format';
    }
    
    // Fallback per categoria
    const categoryImages = {
      'colazione': 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop&auto=format',
      'pranzo': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&auto=format',
      'cena': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop&auto=format',
      'spuntino': 'https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?w=400&h=300&fit=crop&auto=format'
    };
    
    return categoryImages[categoria] || categoryImages['pranzo'];
  }

  // 🔍 RICERCA RICETTE CON FILTRI
  public searchRecipes(filters: {
    query?: string;
    categoria?: string;
    tipoCucina?: string;
    difficolta?: string;
    maxTempo?: number;
    tipoDieta?: string[];
    allergie?: string[];
  }): Recipe[] {
    let results = [...this.recipes];

    if (filters.query) {
      const query = filters.query.toLowerCase();
      results = results.filter(recipe => 
        recipe.nome.toLowerCase().includes(query) ||
        recipe.ingredienti.some(ing => ing.toLowerCase().includes(query)) ||
        recipe.preparazione.toLowerCase().includes(query)
      );
    }

    if (filters.categoria) {
      results = results.filter(recipe => recipe.categoria === filters.categoria);
    }

    if (filters.tipoCucina) {
      results = results.filter(recipe => recipe.tipoCucina === filters.tipoCucina);
    }

    if (filters.difficolta) {
      results = results.filter(recipe => recipe.difficolta === filters.difficolta);
    }

    if (filters.maxTempo) {
      results = results.filter(recipe => recipe.tempoPreparazione <= filters.maxTempo);
    }

    if (filters.tipoDieta && filters.tipoDieta.length > 0) {
      results = results.filter(recipe => 
        filters.tipoDieta!.some(diet => recipe.tipoDieta.includes(diet as any))
      );
    }

    if (filters.allergie && filters.allergie.length > 0) {
      results = results.filter(recipe => 
        !filters.allergie!.some(allergy => recipe.allergie.includes(allergy))
      );
    }

    console.log(`🔍 [GUARANTEED] Search with filters:`, filters, `→ ${results.length} results`);
    return results;
  }

  // 📊 OPZIONI FILTRI GARANTITE
  public getFilterOptions() {
    const options = {
      categories: ['colazione', 'pranzo', 'cena', 'spuntino'],
      cuisines: ['italiana', 'mediterranea', 'asiatica', 'americana', 'messicana', 'internazionale', 'ricette_fit'],
      difficulties: ['facile', 'medio', 'difficile'],
      diets: ['vegetariana', 'vegana', 'senza_glutine', 'keto', 'paleo', 'mediterranea', 'low_carb', 'chetogenica', 'bilanciata'],
      allergies: ['latte', 'uova', 'frutta_secca', 'pesce', 'crostacei', 'glutine']
    };
    
    console.log(`🎛️ [GUARANTEED] Filter options:`, options);
    return options;
  }

  // ❤️ GESTIONE PREFERITI
  public addToFavorites(recipeId: string): void {
    this.favorites.add(recipeId);
    this.saveFavorites();
  }

  public removeFromFavorites(recipeId: string): void {
    this.favorites.delete(recipeId);
    this.saveFavorites();
  }

  public getFavoriteRecipes(): Recipe[] {
    return this.recipes.filter(recipe => this.favorites.has(recipe.id));
  }

  public isFavorite(recipeId: string): boolean {
    return this.favorites.has(recipeId);
  }

  private saveFavorites(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('recipe_favorites', JSON.stringify([...this.favorites]));
    }
  }

  private loadFavorites(): void {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('recipe_favorites');
      if (saved) {
        this.favorites = new Set(JSON.parse(saved));
      }
    }
  }

  // 🎯 RICETTE RACCOMANDATE
  public getRecommendedRecipes(limit: number = 6): Recipe[] {
    return this.recipes
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, limit);
  }

  public getSeasonalRecipes(season: string, limit: number = 6): Recipe[] {
    return this.recipes
      .filter(recipe => recipe.stagione.includes(season as any) || recipe.stagione.includes('tutto_anno'))
      .slice(0, limit);
  }

  // 📈 STATISTICHE
  public getStats() {
    const stats = {
      totalRecipes: this.recipes.length,
      favoriteCount: this.favorites.size,
      averageRating: this.recipes.reduce((acc, recipe) => acc + (recipe.rating || 0), 0) / this.recipes.length,
      categoriesCount: new Set(this.recipes.map(r => r.categoria)).size
    };
    
    console.log(`📈 [GUARANTEED] Database stats:`, stats);
    return stats;
  }
}