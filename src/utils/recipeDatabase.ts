// 🍳 DATABASE RICETTE - FIX FILTRI GARANTITI
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

// 🗃️ CLASSE SINGLETON RECIPE DATABASE - FOCUS FILTRI
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

  // 🏗️ INIZIALIZZA DATABASE - FOCUS SUI FILTRI
  private initializeDatabase(): void {
    console.log('🍳 [FILTERS FIX] Initializing Recipe Database...');
    
    try {
      // 🎯 STRATEGIA: Crea sempre un database minimo garantito
      const allRecipes: Recipe[] = [];

      // 🔍 PROVA A CARICARE FITNESS_RECIPES_DB
      console.log('🔍 [FILTERS FIX] Checking FITNESS_RECIPES_DB...');
      console.log('📊 [FILTERS FIX] FITNESS_RECIPES_DB keys:', Object.keys(FITNESS_RECIPES_DB || {}));
      
      if (FITNESS_RECIPES_DB) {
        // Carica ricette da FITNESS_RECIPES_DB se disponibile
        allRecipes.push(...this.loadFromFitnessDB());
      } else {
        console.warn('⚠️ [FILTERS FIX] FITNESS_RECIPES_DB not available, using fallback');
      }

      // 🆘 GARANTISCE SEMPRE RICETTE MINIME PER FILTRI
      if (allRecipes.length === 0) {
        console.log('🆘 [FILTERS FIX] Creating guaranteed fallback recipes...');
        allRecipes.push(...this.createGuaranteedRecipes());
      }

      // 🤖 AGGIUNGI RICETTE FITNESS EXTRA PER TUTTI I FILTRI
      allRecipes.push(...this.createFilterTestRecipes());

      this.recipes = allRecipes;
      
      console.log(`✅ [FILTERS FIX] Database loaded: ${this.recipes.length} recipes`);
      console.log(`🎛️ [FILTERS FIX] Cuisines loaded:`, [...new Set(this.recipes.map(r => r.tipoCucina))]);
      console.log(`🥗 [FILTERS FIX] Diets loaded:`, [...new Set(this.recipes.flatMap(r => r.tipoDieta))]);
      
    } catch (error) {
      console.error('🚨 [FILTERS FIX] Error loading database:', error);
      // Fallback assoluto
      this.recipes = this.createGuaranteedRecipes();
      console.log(`🆘 [FILTERS FIX] Emergency fallback: ${this.recipes.length} recipes`);
    }
  }

  // 📥 CARICA DA FITNESS_RECIPES_DB
  private loadFromFitnessDB(): Recipe[] {
    const recipes: Recipe[] = [];
    let counter = 1;

    try {
      // 🌅 COLAZIONI
      if (FITNESS_RECIPES_DB.colazione && Array.isArray(FITNESS_RECIPES_DB.colazione)) {
        console.log(`🌅 [FILTERS FIX] Loading ${FITNESS_RECIPES_DB.colazione.length} breakfast recipes`);
        FITNESS_RECIPES_DB.colazione.forEach((recipe: any) => {
          recipes.push(this.convertFitnessRecipe(recipe, 'colazione', counter++));
        });
      }

      // ☀️ PRANZI
      if (FITNESS_RECIPES_DB.pranzo && Array.isArray(FITNESS_RECIPES_DB.pranzo)) {
        console.log(`☀️ [FILTERS FIX] Loading ${FITNESS_RECIPES_DB.pranzo.length} lunch recipes`);
        FITNESS_RECIPES_DB.pranzo.forEach((recipe: any) => {
          recipes.push(this.convertFitnessRecipe(recipe, 'pranzo', counter++));
        });
      }

      // 🌙 CENE
      if (FITNESS_RECIPES_DB.cena && Array.isArray(FITNESS_RECIPES_DB.cena)) {
        console.log(`🌙 [FILTERS FIX] Loading ${FITNESS_RECIPES_DB.cena.length} dinner recipes`);
        FITNESS_RECIPES_DB.cena.forEach((recipe: any) => {
          recipes.push(this.convertFitnessRecipe(recipe, 'cena', counter++));
        });
      }

      // 🍎 SPUNTINI
      if (FITNESS_RECIPES_DB.spuntino && Array.isArray(FITNESS_RECIPES_DB.spuntino)) {
        console.log(`🍎 [FILTERS FIX] Loading ${FITNESS_RECIPES_DB.spuntino.length} snack recipes`);
        FITNESS_RECIPES_DB.spuntino.forEach((recipe: any) => {
          recipes.push(this.convertFitnessRecipe(recipe, 'spuntino', counter++));
        });
      }

    } catch (error) {
      console.error('🚨 [FILTERS FIX] Error loading from FITNESS_RECIPES_DB:', error);
    }

    return recipes;
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
        imageUrl: this.getSimpleImageUrl(categoria),
        createdAt: new Date(),
        rating: this.generateRating(fitnessRecipe.fitnessScore),
        reviewCount: Math.floor(Math.random() * 50) + 5,
      };
    } catch (error) {
      console.error(`🚨 [FILTERS FIX] Error converting recipe ${id}:`, error);
      return this.createFallbackRecipe(id, categoria);
    }
  }

  // 🆘 RICETTE GARANTITE PER TESTARE FILTRI
  private createGuaranteedRecipes(): Recipe[] {
    console.log('🆘 [FILTERS FIX] Creating guaranteed recipes for filters...');
    
    return [
      // 🏋️‍♂️ RICETTE FIT
      {
        id: 'guaranteed_001',
        nome: 'Power Protein Bowl',
        categoria: 'colazione',
        tipoCucina: 'ricette_fit',
        difficolta: 'facile',
        tempoPreparazione: 10,
        porzioni: 1,
        calorie: 420,
        proteine: 30,
        carboidrati: 35,
        grassi: 18,
        ingredienti: ['Yogurt greco', 'Proteine whey', 'Avena', 'Frutti di bosco'],
        preparazione: 'Mescola tutti gli ingredienti e goditi il sapore.',
        tipoDieta: ['bilanciata'],
        allergie: ['latte'],
        stagione: ['tutto_anno'],
        tags: ['fitness', 'protein'],
        imageUrl: this.getSimpleImageUrl('colazione'),
        createdAt: new Date(),
        rating: 4.5,
        reviewCount: 25
      },
      {
        id: 'guaranteed_002',
        nome: 'Chicken Fitness Salad',
        categoria: 'pranzo',
        tipoCucina: 'ricette_fit',
        difficolta: 'facile',
        tempoPreparazione: 15,
        porzioni: 1,
        calorie: 380,
        proteine: 40,
        carboidrati: 15,
        grassi: 18,
        ingredienti: ['Petto di pollo', 'Quinoa', 'Verdure miste', 'Olio EVO'],
        preparazione: 'Griglia il pollo, cuoci la quinoa, mescola con le verdure.',
        tipoDieta: ['bilanciata', 'low_carb'],
        allergie: [],
        stagione: ['tutto_anno'],
        tags: ['fitness', 'lean'],
        imageUrl: this.getSimpleImageUrl('pranzo'),
        createdAt: new Date(),
        rating: 4.7,
        reviewCount: 32
      },
      // 🥑 LOW CARB
      {
        id: 'guaranteed_003',
        nome: 'Salmone Low Carb',
        categoria: 'cena',
        tipoCucina: 'mediterranea',
        difficolta: 'medio',
        tempoPreparazione: 20,
        porzioni: 1,
        calorie: 420,
        proteine: 35,
        carboidrati: 8,
        grassi: 28,
        ingredienti: ['Salmone', 'Zucchine', 'Asparagi', 'Olio EVO'],
        preparazione: 'Cuoci il salmone e le verdure fino alla perfetta cottura.',
        tipoDieta: ['low_carb', 'keto'],
        allergie: ['pesce'],
        stagione: ['tutto_anno'],
        tags: ['low-carb', 'omega3'],
        imageUrl: this.getSimpleImageUrl('cena'),
        createdAt: new Date(),
        rating: 4.6,
        reviewCount: 28
      },
      // 🌱 PALEO
      {
        id: 'guaranteed_004',
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
        ingredienti: ['Manzo grass-fed', 'Patate dolci', 'Spinaci', 'Avocado'],
        preparazione: 'Cuoci la carne e le patate dolci, componi il bowl con verdure fresche.',
        tipoDieta: ['paleo', 'senza_glutine'],
        allergie: [],
        stagione: ['tutto_anno'],
        tags: ['paleo', 'whole-food'],
        imageUrl: this.getSimpleImageUrl('pranzo'),
        createdAt: new Date(),
        rating: 4.4,
        reviewCount: 19
      },
      // 🥥 CHETOGENICA
      {
        id: 'guaranteed_005',
        nome: 'Shake Chetogenico',
        categoria: 'spuntino',
        tipoCucina: 'ricette_fit',
        difficolta: 'facile',
        tempoPreparazione: 5,
        porzioni: 1,
        calorie: 350,
        proteine: 25,
        carboidrati: 5,
        grassi: 28,
        ingredienti: ['Latte di cocco', 'Proteine', 'Burro di mandorle', 'MCT oil'],
        preparazione: 'Frulla tutti gli ingredienti fino ad ottenere un composto cremoso.',
        tipoDieta: ['chetogenica', 'keto'],
        allergie: ['frutta_secca'],
        stagione: ['tutto_anno'],
        tags: ['keto', 'high-fat'],
        imageUrl: this.getSimpleImageUrl('spuntino'),
        createdAt: new Date(),
        rating: 4.3,
        reviewCount: 15
      },
      // ⚖️ BILANCIATA
      {
        id: 'guaranteed_006',
        nome: 'Pasto Bilanciato 40-30-30',
        categoria: 'pranzo',
        tipoCucina: 'mediterranea',
        difficolta: 'medio',
        tempoPreparazione: 30,
        porzioni: 1,
        calorie: 500,
        proteine: 35,
        carboidrati: 40,
        grassi: 20,
        ingredienti: ['Pollo', 'Riso integrale', 'Verdure', 'Olio EVO'],
        preparazione: 'Cuoci tutti gli ingredienti mantenendo le proporzioni macro perfette.',
        tipoDieta: ['bilanciata', 'mediterranea'],
        allergie: [],
        stagione: ['tutto_anno'],
        tags: ['balanced', '40-30-30'],
        imageUrl: this.getSimpleImageUrl('pranzo'),
        createdAt: new Date(),
        rating: 4.8,
        reviewCount: 45
      }
    ];
  }

  // 🧪 RICETTE TEST PER TUTTI I FILTRI
  private createFilterTestRecipes(): Recipe[] {
    return [
      // Test per ogni tipo cucina
      {
        id: 'test_italiana_001',
        nome: 'Risotto Proteico',
        categoria: 'pranzo',
        tipoCucina: 'italiana',
        difficolta: 'medio',
        tempoPreparazione: 35,
        porzioni: 2,
        calorie: 450,
        proteine: 25,
        carboidrati: 55,
        grassi: 12,
        ingredienti: ['Riso', 'Parmigiano', 'Brodo'],
        preparazione: 'Risotto tradizionale con aggiunta di proteine.',
        tipoDieta: ['vegetariana', 'mediterranea'],
        allergie: ['latte'],
        stagione: ['tutto_anno'],
        tags: ['italian', 'comfort'],
        imageUrl: this.getSimpleImageUrl('pranzo'),
        createdAt: new Date(),
        rating: 4.2,
        reviewCount: 20
      },
      {
        id: 'test_asiatica_001',
        nome: 'Tofu Teriyaki Bowl',
        categoria: 'cena',
        tipoCucina: 'asiatica',
        difficolta: 'facile',
        tempoPreparazione: 18,
        porzioni: 1,
        calorie: 380,
        proteine: 22,
        carboidrati: 35,
        grassi: 15,
        ingredienti: ['Tofu', 'Salsa teriyaki', 'Riso', 'Verdure'],
        preparazione: 'Cuoci il tofu con salsa teriyaki e servi con riso.',
        tipoDieta: ['vegana', 'vegetariana'],
        allergie: [],
        stagione: ['tutto_anno'],
        tags: ['asian', 'plant-based'],
        imageUrl: this.getSimpleImageUrl('cena'),
        createdAt: new Date(),
        rating: 4.0,
        reviewCount: 12
      },
      {
        id: 'test_americana_001',
        nome: 'Pancakes Proteici USA',
        categoria: 'colazione',
        tipoCucina: 'americana',
        difficolta: 'facile',
        tempoPreparazione: 15,
        porzioni: 1,
        calorie: 400,
        proteine: 30,
        carboidrati: 35,
        grassi: 16,
        ingredienti: ['Farina avena', 'Proteine', 'Uova', 'Frutti di bosco'],
        preparazione: 'Prepara pancakes proteici stile americano.',
        tipoDieta: ['bilanciata'],
        allergie: ['uova'],
        stagione: ['tutto_anno'],
        tags: ['american', 'breakfast'],
        imageUrl: this.getSimpleImageUrl('colazione'),
        createdAt: new Date(),
        rating: 4.6,
        reviewCount: 38
      }
    ];
  }

  // 🔄 METODI UTILITY SEMPLIFICATI
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
      imageUrl: this.getSimpleImageUrl(categoria),
      createdAt: new Date(),
      rating: 4.0,
      reviewCount: 10
    };
  }

  private determineTipoCucina(nome: string, macroTarget?: string): 'italiana' | 'mediterranea' | 'asiatica' | 'americana' | 'messicana' | 'internazionale' | 'ricette_fit' {
    const nomeLC = nome.toLowerCase();
    
    // 🏋️‍♂️ FITNESS
    if (nomeLC.includes('protein') || nomeLC.includes('fitness') || nomeLC.includes('power') || 
        nomeLC.includes('shake') || nomeLC.includes('energy') || macroTarget === 'high-protein') {
      return 'ricette_fit';
    }
    
    // 🇮🇹 ITALIANA
    if (nomeLC.includes('risotto') || nomeLC.includes('pasta') || nomeLC.includes('parmigiano')) {
      return 'italiana';
    }
    
    // 🌏 ASIATICA
    if (nomeLC.includes('teriyaki') || nomeLC.includes('tofu') || nomeLC.includes('curry')) {
      return 'asiatica';
    }
    
    // 🇺🇸 AMERICANA
    if (nomeLC.includes('pancakes') || nomeLC.includes('burger') || nomeLC.includes('muffin')) {
      return 'americana';
    }
    
    // 🌊 MEDITERRANEA
    if (nomeLC.includes('salmone') || nomeLC.includes('greco') || nomeLC.includes('olive')) {
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

  private determineTipoDieta(recipe: any): ('vegetariana' | 'vegana' | 'senza_glutine' | 'keto' | 'paleo' | 'mediterranea' | 'low_carb' | 'chetogenica' | 'bilanciata')[] {
    const diets: any[] = [];
    const ingredienti = Array.isArray(recipe.ingredienti) ? recipe.ingredienti.join(' ').toLowerCase() : '';
    
    // 🥬 VEGETARIANA
    if (!ingredienti.includes('carne') && !ingredienti.includes('pesce') && !ingredienti.includes('pollo')) {
      diets.push('vegetariana');
    }
    
    // 🌱 VEGANA
    if (!ingredienti.includes('uova') && !ingredienti.includes('latte') && !ingredienti.includes('formaggio')) {
      diets.push('vegana');
    }
    
    // 🥑 KETO/CHETOGENICA
    if (recipe.carboidrati < 15 && recipe.grassi > 15) {
      diets.push('keto', 'chetogenica');
    }
    
    // 🥩 LOW CARB
    if (recipe.carboidrati < 25) {
      diets.push('low_carb');
    }
    
    // 🏛️ PALEO
    if (!ingredienti.includes('cereali') && !ingredienti.includes('legumi')) {
      diets.push('paleo');
    }
    
    // 🌊 MEDITERRANEA
    if (ingredienti.includes('olio evo') || ingredienti.includes('olive') || ingredienti.includes('pesce')) {
      diets.push('mediterranea');
    }
    
    // ⚖️ BILANCIATA (sempre come fallback)
    diets.push('bilanciata');
    
    return [...new Set(diets)]; // Remove duplicates
  }

  private determineAllergie(ingredienti: string[]): string[] {
    const allergie: string[] = [];
    const text = ingredienti.join(' ').toLowerCase();
    
    if (text.includes('latte') || text.includes('formaggio') || text.includes('yogurt')) {
      allergie.push('latte');
    }
    if (text.includes('uova')) {
      allergie.push('uova');
    }
    if (text.includes('noci') || text.includes('mandorle')) {
      allergie.push('frutta_secca');
    }
    if (text.includes('pesce') || text.includes('salmone')) {
      allergie.push('pesce');
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

  // 📸 IMMAGINI SEMPLICI (placeholder per ora)
  private getSimpleImageUrl(categoria: string): string {
    const images = {
      'colazione': 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop&auto=format',
      'pranzo': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&auto=format',
      'cena': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop&auto=format',
      'spuntino': 'https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?w=400&h=300&fit=crop&auto=format'
    };
    
    return images[categoria] || images['pranzo'];
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
        recipe.ingredienti.some(ing => ing.toLowerCase().includes(query))
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

    console.log(`🔍 [FILTERS FIX] Search results: ${results.length} recipes`);
    return results;
  }

  // 📊 OPZIONI FILTRI DISPONIBILI - GARANTITE
  public getFilterOptions() {
    const options = {
      categories: ['colazione', 'pranzo', 'cena', 'spuntino'],
      cuisines: ['italiana', 'mediterranea', 'asiatica', 'americana', 'messicana', 'internazionale', 'ricette_fit'],
      difficulties: ['facile', 'medio', 'difficile'],
      diets: ['vegetariana', 'vegana', 'senza_glutine', 'keto', 'paleo', 'mediterranea', 'low_carb', 'chetogenica', 'bilanciata'],
      allergies: ['latte', 'uova', 'frutta_secca', 'pesce', 'glutine']
    };
    
    console.log(`🎛️ [FILTERS FIX] Filter options generated:`, options);
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
    
    console.log(`📈 [FILTERS FIX] Database stats:`, stats);
    return stats;
  }
}