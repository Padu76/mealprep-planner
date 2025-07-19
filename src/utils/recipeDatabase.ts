// 🍳 DATABASE RICETTE COMPLETO - INTEGRAZIONE FITNESS_RECIPES_DB
import { FITNESS_RECIPES_DB } from './fitness_recipes_database';

// Interfaccia Recipe compatibile con pagina ricette
export interface Recipe {
  id: string;
  nome: string;
  categoria: 'colazione' | 'pranzo' | 'cena' | 'spuntino';
  tipoCucina: 'italiana' | 'mediterranea' | 'asiatica' | 'americana' | 'messicana' | 'internazionale';
  difficolta: 'facile' | 'medio' | 'difficile';
  tempoPreparazione: number;
  porzioni: number;
  calorie: number;
  proteine: number;
  carboidrati: number;
  grassi: number;
  ingredienti: string[];
  preparazione: string;
  tipoDieta: ('vegetariana' | 'vegana' | 'senza_glutine' | 'keto' | 'paleo' | 'mediterranea')[];
  allergie: string[];
  stagione: ('primavera' | 'estate' | 'autunno' | 'inverno' | 'tutto_anno')[];
  tags: string[];
  imageUrl?: string;
  createdAt: Date;
  rating?: number;
  reviewCount?: number;
  fitnessScore?: number;
  macroTarget?: string;
}

// Interfaccia filtri ricerca
export interface SearchFilters {
  query?: string;
  categoria?: string;
  tipoCucina?: string;
  difficolta?: string;
  maxTempo?: number;
  tipoDieta?: string[];
  allergie?: string[];
  minRating?: number;
  maxCalorie?: number;
  minProteine?: number;
}

// Opzioni filtri per UI
export interface FilterOptions {
  categories: string[];
  cuisines: string[];
  difficulties: string[];
  diets: string[];
  allergies: string[];
}

// 🏗️ CLASSE PRINCIPALE RECIPE DATABASE
export class RecipeDatabase {
  private static instance: RecipeDatabase;
  private recipes: Recipe[] = [];
  private favorites: Set<string> = new Set();
  private readonly FAVORITES_KEY = 'mealprep_favorite_recipes';

  private constructor() {
    this.initializeDatabase();
    this.loadFavorites();
  }

  // 🎯 SINGLETON PATTERN
  public static getInstance(): RecipeDatabase {
    if (!RecipeDatabase.instance) {
      RecipeDatabase.instance = new RecipeDatabase();
    }
    return RecipeDatabase.instance;
  }

  // 🔄 INIZIALIZZA DATABASE DA FITNESS_RECIPES_DB
  private initializeDatabase(): void {
    console.log('🍳 Initializing Recipe Database from FITNESS_RECIPES_DB...');
    
    let recipeId = 1;
    const allRecipes: Recipe[] = [];

    // 🌅 COLAZIONI
    FITNESS_RECIPES_DB.colazione.forEach((recipe, index) => {
      allRecipes.push(this.convertFitnessRecipe(recipe, 'colazione', recipeId++));
    });

    // ☀️ PRANZI
    FITNESS_RECIPES_DB.pranzo.forEach((recipe, index) => {
      allRecipes.push(this.convertFitnessRecipe(recipe, 'pranzo', recipeId++));
    });

    // 🌙 CENE
    FITNESS_RECIPES_DB.cena.forEach((recipe, index) => {
      allRecipes.push(this.convertFitnessRecipe(recipe, 'cena', recipeId++));
    });

    // 🍎 SPUNTINI
    FITNESS_RECIPES_DB.spuntino.forEach((recipe, index) => {
      allRecipes.push(this.convertFitnessRecipe(recipe, 'spuntino', recipeId++));
    });

    // 🎯 RICETTE AGGIUNTIVE GENERATE (espansione database)
    const additionalRecipes = this.generateAdditionalRecipes(recipeId);
    allRecipes.push(...additionalRecipes);

    this.recipes = allRecipes;
    console.log(`✅ Database initialized with ${this.recipes.length} recipes`);
  }

  // 🔄 CONVERTI RICETTA FITNESS IN FORMATO STANDARD
  private convertFitnessRecipe(fitnessRecipe: any, categoria: string, id: number): Recipe {
    return {
      id: `recipe-${id.toString().padStart(3, '0')}`,
      nome: fitnessRecipe.nome,
      categoria: categoria as any,
      tipoCucina: this.determineTipoCucina(fitnessRecipe.nome),
      difficolta: this.determineDifficolta(fitnessRecipe.tempo),
      tempoPreparazione: this.parseTempoPreparazione(fitnessRecipe.tempo),
      porzioni: fitnessRecipe.porzioni || 1,
      calorie: fitnessRecipe.calorie,
      proteine: fitnessRecipe.proteine,
      carboidrati: fitnessRecipe.carboidrati,
      grassi: fitnessRecipe.grassi,
      ingredienti: Array.isArray(fitnessRecipe.ingredienti) ? fitnessRecipe.ingredienti : [],
      preparazione: fitnessRecipe.preparazione || 'Preparazione da definire',
      tipoDieta: this.determineTipoDieta(fitnessRecipe),
      allergie: this.determineAllergie(fitnessRecipe.ingredienti),
      stagione: ['tutto_anno'],
      tags: this.generateTags(fitnessRecipe),
      imageUrl: fitnessRecipe.imageUrl || this.generateImageUrl(fitnessRecipe.nome, categoria),
      createdAt: new Date(),
      rating: this.generateRating(fitnessRecipe.fitnessScore),
      reviewCount: Math.floor(Math.random() * 50) + 5,
      fitnessScore: fitnessRecipe.fitnessScore,
      macroTarget: fitnessRecipe.macroTarget
    };
  }

  // 🏗️ GENERA RICETTE AGGIUNTIVE PER ESPANDERE DATABASE
  private generateAdditionalRecipes(startId: number): Recipe[] {
    const additionalRecipes: Recipe[] = [];
    let currentId = startId;

    // 🍝 PASTA E RISOTTI
    const pastaRecipes = [
      {
        nome: 'Pasta e Fagioli Fitness',
        categoria: 'pranzo',
        tipoCucina: 'italiana',
        difficolta: 'medio',
        tempoPreparazione: 35,
        calorie: 420,
        proteine: 22,
        carboidrati: 55,
        grassi: 8,
        ingredienti: ['80g pasta integrale', '150g fagioli cannellini', '50g sedano', '50g carote', 'Rosmarino', 'Brodo vegetale'],
        preparazione: 'Soffriggi sedano e carote, aggiungi fagioli e brodo. Cuoci pasta e manteca insieme. Piatto ricco di fibre e proteine.',
        macroTarget: 'high-fiber'
      },
      {
        nome: 'Risotto ai Funghi Porcini',
        categoria: 'pranzo',
        tipoCucina: 'italiana',
        difficolta: 'medio',
        tempoPreparazione: 40,
        calorie: 380,
        proteine: 16,
        carboidrati: 58,
        grassi: 12,
        ingredienti: ['90g riso Carnaroli', '200g funghi porcini', '50g parmigiano', 'Cipolla', 'Vino bianco', 'Brodo vegetale'],
        preparazione: 'Tosta il riso, sfuma con vino. Aggiungi brodo gradualmente e funghi trifolati. Manteca con parmigiano.',
        macroTarget: 'comfort-fit'
      }
    ];

    // 🥗 INSALATE E BOWL
    const saladRecipes = [
      {
        nome: 'Caesar Salad Proteica',
        categoria: 'pranzo',
        tipoCucina: 'americana',
        difficolta: 'facile',
        tempoPreparazione: 15,
        calorie: 350,
        proteine: 35,
        carboidrati: 12,
        grassi: 18,
        ingredienti: ['200g lattuga romana', '150g petto pollo grigliato', '30g parmigiano', 'Crostini integrali', 'Salsa caesar light'],
        preparazione: 'Griglia pollo e taglia a listarelle. Componi insalata con lattuga, pollo, parmigiano e crostini. Condisci con salsa.',
        macroTarget: 'high-protein'
      },
      {
        nome: 'Poke Bowl Hawaiano',
        categoria: 'pranzo',
        tipoCucina: 'asiatica',
        difficolta: 'facile',
        tempoPreparazione: 20,
        calorie: 450,
        proteine: 32,
        carboidrati: 45,
        grassi: 16,
        ingredienti: ['150g salmone fresco', '80g riso integrale', '50g edamame', '50g avocado', 'Salsa teriyaki', 'Semi sesamo'],
        preparazione: 'Taglia salmone a cubetti, marina con teriyaki. Componi bowl con riso, salmone, edamame e avocado.',
        macroTarget: 'balanced'
      }
    ];

    // 🍖 SECONDI PIATTI
    const mainRecipes = [
      {
        nome: 'Tagliata di Manzo alle Erbe',
        categoria: 'cena',
        tipoCucina: 'italiana',
        difficolta: 'medio',
        tempoPreparazione: 25,
        calorie: 420,
        proteine: 45,
        carboidrati: 8,
        grassi: 22,
        ingredienti: ['200g manzo tagliata', '100g rucola', '80g pomodorini', 'Rosmarino', 'Aglio', 'Olio EVO'],
        preparazione: 'Cuoci manzo in padella con rosmarino. Lascia riposare, poi taglia. Servi su letto di rucola con pomodorini.',
        macroTarget: 'high-protein'
      },
      {
        nome: 'Salmone in Crosta di Pistacchi',
        categoria: 'cena',
        tipoCucina: 'mediterranea',
        difficolta: 'medio',
        tempoPreparazione: 30,
        calorie: 480,
        proteine: 38,
        carboidrati: 12,
        grassi: 28,
        ingredienti: ['150g salmone', '30g pistacchi tritati', '20g pangrattato', 'Limone', 'Erbe aromatiche', 'Verdure di stagione'],
        preparazione: 'Crea crosta con pistacchi e pangrattato. Cuoci salmone al forno con crosta. Servi con verdure al vapore.',
        macroTarget: 'high-fat'
      }
    ];

    // 🥞 COLAZIONI AGGIUNTIVE
    const breakfastRecipes = [
      {
        nome: 'French Toast Proteici',
        categoria: 'colazione',
        tipoCucina: 'americana',
        difficolta: 'facile',
        tempoPreparazione: 12,
        calorie: 380,
        proteine: 28,
        carboidrati: 32,
        grassi: 16,
        ingredienti: ['2 fette pane integrale', '2 uova', '100ml latte scremato', '20g proteine vaniglia', 'Cannella', 'Frutti rossi'],
        preparazione: 'Sbatti uova con latte e proteine. Impregna pane e cuoci in padella. Servi con frutti rossi e cannella.',
        macroTarget: 'high-protein'
      },
      {
        nome: 'Chia Pudding Tropicale',
        categoria: 'colazione',
        tipoCucina: 'internazionale',
        difficolta: 'facile',
        tempoPreparazione: 5,
        calorie: 320,
        proteine: 18,
        carboidrati: 28,
        grassi: 18,
        ingredienti: ['30g semi chia', '200ml latte cocco', '20g proteine vaniglia', '80g mango', '50g ananas', 'Cocco grattugiato'],
        preparazione: 'Mescola chia con latte e proteine. Lascia riposare 15 min. Servi con frutta tropicale e cocco.',
        macroTarget: 'plant-based'
      }
    ];

    // 🥪 SPUNTINI AGGIUNTIVI
    const snackRecipes = [
      {
        nome: 'Protein Muffin ai Mirtilli',
        categoria: 'spuntino',
        tipoCucina: 'americana',
        difficolta: 'medio',
        tempoPreparazione: 25,
        calorie: 180,
        proteine: 15,
        carboidrati: 20,
        grassi: 6,
        ingredienti: ['30g farina avena', '20g proteine vaniglia', '1 uovo', '80g mirtilli', 'Lievito', 'Stevia'],
        preparazione: 'Mescola ingredienti secchi e umidi. Aggiungi mirtilli. Cuoci in stampini per 18 min a 180°C.',
        macroTarget: 'meal-prep'
      },
      {
        nome: 'Energy Bites al Cioccolato',
        categoria: 'spuntino',
        tipoCucina: 'internazionale',
        difficolta: 'facile',
        tempoPreparazione: 15,
        calorie: 160,
        proteine: 12,
        carboidrati: 18,
        grassi: 8,
        ingredienti: ['20g proteine cioccolato', '30g datteri', '20g mandorle', '10g cacao amaro', '10g cocco'],
        preparazione: 'Tritura datteri e mandorle. Mescola con proteine e cacao. Forma palline e rotola nel cocco.',
        macroTarget: 'energy'
      }
    ];

    // Combina tutte le ricette aggiuntive
    const allAdditional = [
      ...pastaRecipes,
      ...saladRecipes,
      ...mainRecipes,
      ...breakfastRecipes,
      ...snackRecipes
    ];

    // Converti in formato Recipe
    allAdditional.forEach(recipe => {
      additionalRecipes.push({
        id: `recipe-${currentId.toString().padStart(3, '0')}`,
        nome: recipe.nome,
        categoria: recipe.categoria as any,
        tipoCucina: recipe.tipoCucina as any,
        difficolta: recipe.difficolta as any,
        tempoPreparazione: recipe.tempoPreparazione,
        porzioni: 1,
        calorie: recipe.calorie,
        proteine: recipe.proteine,
        carboidrati: recipe.carboidrati,
        grassi: recipe.grassi,
        ingredienti: recipe.ingredienti,
        preparazione: recipe.preparazione,
        tipoDieta: this.determineTipoDieta(recipe),
        allergie: this.determineAllergie(recipe.ingredienti),
        stagione: ['tutto_anno'],
        tags: this.generateTags(recipe),
        imageUrl: this.generateImageUrl(recipe.nome, recipe.categoria),
        createdAt: new Date(),
        rating: Math.random() * 1.5 + 3.5, // Rating tra 3.5 e 5
        reviewCount: Math.floor(Math.random() * 30) + 5,
        fitnessScore: Math.floor(Math.random() * 20) + 75, // Score 75-95
        macroTarget: recipe.macroTarget
      });
      currentId++;
    });

    return additionalRecipes;
  }

  // 🔍 RICERCA RICETTE CON FILTRI AVANZATI
  public searchRecipes(filters: SearchFilters): Recipe[] {
    let filtered = [...this.recipes];

    // Filtro query testuale
    if (filters.query) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(recipe => 
        recipe.nome.toLowerCase().includes(query) ||
        recipe.ingredienti.some(ing => ing.toLowerCase().includes(query)) ||
        recipe.preparazione.toLowerCase().includes(query)
      );
    }

    // Filtro categoria
    if (filters.categoria) {
      filtered = filtered.filter(recipe => recipe.categoria === filters.categoria);
    }

    // Filtro tipo cucina
    if (filters.tipoCucina) {
      filtered = filtered.filter(recipe => recipe.tipoCucina === filters.tipoCucina);
    }

    // Filtro difficoltà
    if (filters.difficolta) {
      filtered = filtered.filter(recipe => recipe.difficolta === filters.difficolta);
    }

    // Filtro tempo massimo
    if (filters.maxTempo) {
      filtered = filtered.filter(recipe => recipe.tempoPreparazione <= filters.maxTempo);
    }

    // Filtro tipo dieta
    if (filters.tipoDieta && filters.tipoDieta.length > 0) {
      filtered = filtered.filter(recipe => 
        filters.tipoDieta!.some(diet => recipe.tipoDieta.includes(diet as any))
      );
    }

    // Filtro allergie (esclude ricette con allergie specificate)
    if (filters.allergie && filters.allergie.length > 0) {
      filtered = filtered.filter(recipe => 
        !filters.allergie!.some(allergy => recipe.allergie.includes(allergy))
      );
    }

    // Filtro rating minimo
    if (filters.minRating) {
      filtered = filtered.filter(recipe => (recipe.rating || 0) >= filters.minRating!);
    }

    // Filtro calorie massime
    if (filters.maxCalorie) {
      filtered = filtered.filter(recipe => recipe.calorie <= filters.maxCalorie!);
    }

    // Filtro proteine minime
    if (filters.minProteine) {
      filtered = filtered.filter(recipe => recipe.proteine >= filters.minProteine!);
    }

    return filtered;
  }

  // 🎯 RICETTE CONSIGLIATE (top rated)
  public getRecommendedRecipes(limit: number = 10): Recipe[] {
    return this.recipes
      .sort((a, b) => (b.fitnessScore || 0) - (a.fitnessScore || 0))
      .slice(0, limit);
  }

  // 🌿 RICETTE STAGIONALI
  public getSeasonalRecipes(stagione: string, limit: number = 10): Recipe[] {
    const seasonal = this.recipes.filter(recipe => 
      recipe.stagione.includes(stagione as any) || recipe.stagione.includes('tutto_anno')
    );
    return seasonal.slice(0, limit);
  }

  // ❤️ GESTIONE PREFERITI
  public getFavoriteRecipes(): Recipe[] {
    return this.recipes.filter(recipe => this.favorites.has(recipe.id));
  }

  public addToFavorites(recipeId: string): void {
    this.favorites.add(recipeId);
    this.saveFavorites();
  }

  public removeFromFavorites(recipeId: string): void {
    this.favorites.delete(recipeId);
    this.saveFavorites();
  }

  public isFavorite(recipeId: string): boolean {
    return this.favorites.has(recipeId);
  }

  // 📊 OPZIONI FILTRI PER UI
  public getFilterOptions(): FilterOptions {
    const categories = [...new Set(this.recipes.map(r => r.categoria))];
    const cuisines = [...new Set(this.recipes.map(r => r.tipoCucina))];
    const difficulties = [...new Set(this.recipes.map(r => r.difficolta))];
    const diets = [...new Set(this.recipes.flatMap(r => r.tipoDieta))];
    const allergies = [...new Set(this.recipes.flatMap(r => r.allergie))];

    return {
      categories: categories.sort(),
      cuisines: cuisines.sort(),
      difficulties: ['facile', 'medio', 'difficile'],
      diets: diets.sort(),
      allergies: allergies.sort()
    };
  }

  // 🔍 CERCA RICETTA PER ID
  public getRecipeById(id: string): Recipe | undefined {
    return this.recipes.find(recipe => recipe.id === id);
  }

  // 📈 STATISTICHE DATABASE
  public getStats() {
    return {
      totalRecipes: this.recipes.length,
      byCategory: {
        colazione: this.recipes.filter(r => r.categoria === 'colazione').length,
        pranzo: this.recipes.filter(r => r.categoria === 'pranzo').length,
        cena: this.recipes.filter(r => r.categoria === 'cena').length,
        spuntino: this.recipes.filter(r => r.categoria === 'spuntino').length
      },
      averageRating: this.recipes.reduce((sum, r) => sum + (r.rating || 0), 0) / this.recipes.length,
      averageFitnessScore: this.recipes.reduce((sum, r) => sum + (r.fitnessScore || 0), 0) / this.recipes.length,
      totalFavorites: this.favorites.size
    };
  }

  // 🛠️ UTILITY METHODS
  private determineTipoCucina(nome: string): 'italiana' | 'mediterranea' | 'asiatica' | 'americana' | 'messicana' | 'internazionale' {
    const nomeLC = nome.toLowerCase();
    if (nomeLC.includes('risotto') || nomeLC.includes('pasta') || nomeLC.includes('tagliata')) return 'italiana';
    if (nomeLC.includes('bowl') || nomeLC.includes('teriyaki') || nomeLC.includes('poke')) return 'asiatica';
    if (nomeLC.includes('pancakes') || nomeLC.includes('caesar') || nomeLC.includes('french')) return 'americana';
    if (nomeLC.includes('salmone') || nomeLC.includes('branzino') || nomeLC.includes('greco')) return 'mediterranea';
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

  private determineTipoDieta(recipe: any): ('vegetariana' | 'vegana' | 'senza_glutine' | 'keto' | 'paleo' | 'mediterranea')[] {
    const diets: any[] = [];
    const ingredienti = Array.isArray(recipe.ingredienti) ? recipe.ingredienti.join(' ').toLowerCase() : '';
    
    if (!ingredienti.includes('carne') && !ingredienti.includes('pesce') && !ingredienti.includes('pollo')) {
      diets.push('vegetariana');
    }
    if (!ingredienti.includes('uova') && !ingredienti.includes('latte') && !ingredienti.includes('formaggio')) {
      diets.push('vegana');
    }
    if (recipe.carboidrati < 10) {
      diets.push('keto');
    }
    if (ingredienti.includes('olio evo') || ingredienti.includes('pesce') || ingredienti.includes('verdure')) {
      diets.push('mediterranea');
    }
    
    return diets;
  }

  private determineAllergie(ingredienti: string[]): string[] {
    const allergie: string[] = [];
    const ingredientiText = ingredienti.join(' ').toLowerCase();
    
    if (ingredientiText.includes('glutine') || ingredientiText.includes('pane') || ingredientiText.includes('pasta')) {
      allergie.push('glutine');
    }
    if (ingredientiText.includes('latte') || ingredientiText.includes('formaggio') || ingredientiText.includes('yogurt')) {
      allergie.push('lattosio');
    }
    if (ingredientiText.includes('uova')) {
      allergie.push('uova');
    }
    if (ingredientiText.includes('noci') || ingredientiText.includes('mandorle') || ingredientiText.includes('pistacchi')) {
      allergie.push('frutta_secca');
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

  private generateImageUrl(nome: string, categoria: string): string {
    // Mapping ricette specifiche a immagini Unsplash
    const imageMap: { [key: string]: string } = {
      'porridge': 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop',
      'omelette': 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=300&fit=crop',
      'yogurt': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop',
      'pancakes': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
      'smoothie': 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=400&h=300&fit=crop',
      'toast': 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=300&fit=crop',
      'quinoa': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
      'salmone': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
      'insalata': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
      'pasta': 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400&h=300&fit=crop',
      'risotto': 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop',
      'pollo': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop',
      'frittata': 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&h=300&fit=crop',
      'shake': 'https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?w=400&h=300&fit=crop'
    };

    const nomeLC = nome.toLowerCase();
    for (const [key, url] of Object.entries(imageMap)) {
      if (nomeLC.includes(key)) {
        return url;
      }
    }

    // Fallback per categoria
    const categoryImages = {
      'colazione': 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop',
      'pranzo': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
      'cena': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop',
      'spuntino': 'https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?w=400&h=300&fit=crop'
    };

    return categoryImages[categoria] || 'https://images.unsplash.com/photo-1546554146-2d1ec7ab7445?w=400&h=300&fit=crop';
  }

  private generateRating(fitnessScore?: number): number {
    if (fitnessScore) {
      // Converti fitness score (0-100) in rating (3.0-5.0)
      return Math.min(5.0, Math.max(3.0, (fitnessScore / 100) * 2 + 3));
    }
    return Math.random() * 1.5 + 3.5; // Rating casuale tra 3.5 e 5.0
  }

  // 💾 PERSISTENZA PREFERITI
  private saveFavorites(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.FAVORITES_KEY, JSON.stringify([...this.favorites]));
      } catch (error) {
        console.warn('Failed to save favorites to localStorage:', error);
      }
    }
  }

  private loadFavorites(): void {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(this.FAVORITES_KEY);
        if (saved) {
          const favoriteIds = JSON.parse(saved);
          this.favorites = new Set(favoriteIds);
        }
      } catch (error) {
        console.warn('Failed to load favorites from localStorage:', error);
      }
    }
  }
}

// 🚀 ESPORTA ISTANZA SINGLETON
export default RecipeDatabase;