// 🍳 DATABASE RICETTE COMPLETO - INTEGRAZIONE FITNESS_RECIPES_DB + FILTRI AGGIORNATI
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

// 📊 RICETTE FITNESS AGGIUNTIVE (AI-inspired per fit influencer e PT)
const FITNESS_AI_RECIPES: Omit<Recipe, 'id' | 'createdAt'>[] = [
  // 💪 COLAZIONI FITNESS
  {
    nome: "Power Breakfast Bowl",
    categoria: "colazione",
    tipoCucina: "ricette_fit",
    difficolta: "facile",
    tempoPreparazione: 10,
    porzioni: 1,
    calorie: 420,
    proteine: 28,
    carboidrati: 35,
    grassi: 18,
    ingredienti: ["150g yogurt greco 0%", "30g avena", "20g proteine whey vaniglia", "100g frutti di bosco", "15g mandorle", "5g miele"],
    preparazione: "Mescola yogurt greco con proteine in polvere. Aggiungi avena e frutti di bosco. Completa con mandorle e miele.",
    tipoDieta: ["bilanciata"],
    allergie: ["latte", "frutta_secca"],
    stagione: ["tutto_anno"],
    tags: ["post-workout", "alto-proteine", "fit"],
    rating: 4.8
  },
  {
    nome: "Pancakes Proteici Keto",
    categoria: "colazione",
    tipoCucina: "ricette_fit",
    difficolta: "medio",
    tempoPreparazione: 15,
    porzioni: 2,
    calorie: 320,
    proteine: 25,
    carboidrati: 8,
    grassi: 22,
    ingredienti: ["3 uova", "30g farina di mandorle", "20g proteine whey", "10g burro di mandorle", "stevia q.b.", "cannella"],
    preparazione: "Sbatti uova con proteine e stevia. Aggiungi farina di mandorle. Cuoci in padella con burro di mandorle.",
    tipoDieta: ["keto", "chetogenica", "low_carb"],
    allergie: ["uova", "frutta_secca"],
    stagione: ["tutto_anno"],
    tags: ["keto", "low-carb", "fit"],
    rating: 4.6
  },

  // 🥗 PRANZI FITNESS
  {
    nome: "Buddha Bowl Paleo",
    categoria: "pranzo", 
    tipoCucina: "ricette_fit",
    difficolta: "medio",
    tempoPreparazione: 25,
    porzioni: 1,
    calorie: 480,
    proteine: 32,
    carboidrati: 28,
    grassi: 26,
    ingredienti: ["150g salmone", "100g patate dolci", "80g spinaci", "50g avocado", "30g noci", "olio evo", "limone"],
    preparazione: "Cuoci salmone e patate dolci al forno. Prepara letto di spinaci. Aggiungi avocado, noci e condisci.",
    tipoDieta: ["paleo", "senza_glutine"],
    allergie: ["pesce", "frutta_secca"],
    stagione: ["tutto_anno"],
    tags: ["paleo", "omega-3", "fit"],
    rating: 4.7
  },
  {
    nome: "Chicken Power Salad",
    categoria: "pranzo",
    tipoCucina: "ricette_fit", 
    difficolta: "facile",
    tempoPreparazione: 20,
    porzioni: 1,
    calorie: 380,
    proteine: 40,
    carboidrati: 15,
    grassi: 18,
    ingredienti: ["150g petto di pollo", "100g quinoa", "80g broccoli", "50g pomodorini", "30g feta", "olio evo", "aceto balsamico"],
    preparazione: "Griglia il pollo. Cuoci quinoa e broccoli. Componi l'insalata e condisci con olio e aceto.",
    tipoDieta: ["bilanciata", "mediterranea"],
    allergie: ["latte"],
    stagione: ["tutto_anno"],
    tags: ["alto-proteine", "lean", "fit"],
    rating: 4.5
  },

  // 🍽️ CENE FITNESS
  {
    nome: "Salmone Low-Carb",
    categoria: "cena",
    tipoCucina: "ricette_fit",
    difficolta: "medio", 
    tempoPreparazione: 20,
    porzioni: 1,
    calorie: 420,
    proteine: 35,
    carboidrati: 8,
    grassi: 28,
    ingredienti: ["180g salmone", "200g zucchine", "100g asparagi", "15g olio evo", "limone", "erbe aromatiche"],
    preparazione: "Cuoci salmone in padella. Griglia verdure. Condisci con olio, limone ed erbe.",
    tipoDieta: ["low_carb", "keto", "paleo"],
    allergie: ["pesce"],
    stagione: ["primavera", "estate"],
    tags: ["low-carb", "omega-3", "fit"],
    rating: 4.6
  },
  {
    nome: "Turkey Meatballs Fit",
    categoria: "cena",
    tipoCucina: "ricette_fit",
    difficolta: "medio",
    tempoPreparazione: 30,
    porzioni: 2,
    calorie: 350,
    proteine: 38,
    carboidrati: 12,
    grassi: 16,
    ingredienti: ["200g macinato di tacchino", "50g fiocchi d'avena", "1 uovo", "200g passata di pomodoro", "100g zucchine", "spezie"],
    preparazione: "Impasta tacchino con avena e uovo. Forma polpette. Cuoci in padella con passata e verdure.",
    tipoDieta: ["bilanciata", "mediterranea"],
    allergie: ["uova"],
    stagione: ["tutto_anno"],
    tags: ["lean-protein", "family-friendly", "fit"],
    rating: 4.4
  },

  // 🥤 SPUNTINI FITNESS
  {
    nome: "Protein Shake Post-Workout",
    categoria: "spuntino",
    tipoCucina: "ricette_fit",
    difficolta: "facile",
    tempoPreparazione: 5,
    porzioni: 1,
    calorie: 280,
    proteine: 30,
    carboidrati: 25,
    grassi: 8,
    ingredienti: ["30g whey protein", "200ml latte di mandorle", "1 banana", "10g burro di arachidi", "ghiaccio"],
    preparazione: "Frulla tutti gli ingredienti fino a consistenza cremosa. Servi immediatamente.",
    tipoDieta: ["bilanciata"],
    allergie: ["frutta_secca"],
    stagione: ["tutto_anno"],
    tags: ["post-workout", "recovery", "fit"],
    rating: 4.9
  },
  {
    nome: "Energy Balls Keto",
    categoria: "spuntino",
    tipoCucina: "ricette_fit",
    difficolta: "facile",
    tempoPreparazione: 15,
    porzioni: 8,
    calorie: 120,
    proteine: 4,
    carboidrati: 3,
    grassi: 11,
    ingredienti: ["50g mandorle", "30g cocco rapé", "20g cacao amaro", "15g olio di cocco", "stevia", "vaniglia"],
    preparazione: "Tritura mandorle. Mescola con cocco, cacao e stevia. Aggiungi olio. Forma palline e refrigera.",
    tipoDieta: ["keto", "chetogenica", "low_carb", "vegana"],
    allergie: ["frutta_secca"],
    stagione: ["tutto_anno"],
    tags: ["keto", "energy", "raw"],
    rating: 4.3
  }
];

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

  // 🏗️ INIZIALIZZA DATABASE CON TUTTE LE RICETTE
  private initializeDatabase(): void {
    // Converti FITNESS_RECIPES_DB nel formato Recipe
    const fitnessRecipes: Recipe[] = FITNESS_RECIPES_DB.map((recipe, index) => ({
      id: `fitness_${index + 1}`,
      nome: recipe.nome,
      categoria: this.mapCategoria(recipe.categoria),
      tipoCucina: this.mapTipoCucina(recipe.tipoCucina),
      difficolta: this.mapDifficolta(recipe.difficolta),
      tempoPreparazione: recipe.tempoPreparazione,
      porzioni: recipe.porzioni,
      calorie: recipe.calorie,
      proteine: recipe.proteine,
      carboidrati: recipe.carboidrati,
      grassi: recipe.grassi,
      ingredienti: recipe.ingredienti,
      preparazione: recipe.preparazione,
      tipoDieta: this.mapTipoDieta(recipe.tipoDieta),
      allergie: recipe.allergie || [],
      stagione: recipe.stagione || ['tutto_anno'],
      tags: recipe.tags || [],
      imageUrl: this.getUnsplashImageUrl(recipe.nome, this.mapCategoria(recipe.categoria)),
      createdAt: new Date(),
      rating: recipe.rating || (Math.random() * 2 + 3), // Rating tra 3-5
      reviewCount: Math.floor(Math.random() * 100) + 10
    }));

    // Aggiungi ricette AI fitness
    const aiRecipes: Recipe[] = FITNESS_AI_RECIPES.map((recipe, index) => ({
      ...recipe,
      id: `ai_fit_${index + 1}`,
      createdAt: new Date(),
      reviewCount: Math.floor(Math.random() * 50) + 5
    }));

    this.recipes = [...fitnessRecipes, ...aiRecipes];
  }

  // 🎯 MAPPATURA CATEGORII
  private mapCategoria(categoria: string): 'colazione' | 'pranzo' | 'cena' | 'spuntino' {
    const categoryMap: { [key: string]: 'colazione' | 'pranzo' | 'cena' | 'spuntino' } = {
      'Colazione': 'colazione',
      'Pranzo': 'pranzo', 
      'Cena': 'cena',
      'Spuntino': 'spuntino',
      'colazione': 'colazione',
      'pranzo': 'pranzo',
      'cena': 'cena',
      'spuntino': 'spuntino'
    };
    return categoryMap[categoria] || 'pranzo';
  }

  private mapTipoCucina(tipoCucina: string): 'italiana' | 'mediterranea' | 'asiatica' | 'americana' | 'messicana' | 'internazionale' | 'ricette_fit' {
    const cuisineMap: { [key: string]: any } = {
      'Italiana': 'italiana',
      'Mediterranea': 'mediterranea',
      'Asiatica': 'asiatica',
      'Americana': 'americana',
      'Messicana': 'messicana',
      'Internazionale': 'internazionale',
      'italiana': 'italiana',
      'mediterranea': 'mediterranea',
      'asiatica': 'asiatica',
      'americana': 'americana',
      'messicana': 'messicana',
      'internazionale': 'internazionale',
      'ricette_fit': 'ricette_fit'
    };
    return cuisineMap[tipoCucina] || 'mediterranea';
  }

  private mapDifficolta(difficolta: string): 'facile' | 'medio' | 'difficile' {
    const difficultyMap: { [key: string]: 'facile' | 'medio' | 'difficile' } = {
      'Facile': 'facile',
      'Medio': 'medio',
      'Difficile': 'difficile',
      'facile': 'facile',
      'medio': 'medio', 
      'difficile': 'difficile'
    };
    return difficultyMap[difficolta] || 'medio';
  }

  private mapTipoDieta(tipoDieta: string[]): ('vegetariana' | 'vegana' | 'senza_glutine' | 'keto' | 'paleo' | 'mediterranea' | 'low_carb' | 'chetogenica' | 'bilanciata')[] {
    const dietMap: { [key: string]: any } = {
      'Vegetariana': 'vegetariana',
      'Vegana': 'vegana', 
      'Senza Glutine': 'senza_glutine',
      'Keto': 'keto',
      'Paleo': 'paleo',
      'Mediterranea': 'mediterranea',
      'vegetariana': 'vegetariana',
      'vegana': 'vegana',
      'senza_glutine': 'senza_glutine',
      'keto': 'keto',
      'paleo': 'paleo',
      'mediterranea': 'mediterranea',
      'low_carb': 'low_carb',
      'chetogenica': 'chetogenica',
      'bilanciata': 'bilanciata'
    };
    return tipoDieta?.map(diet => dietMap[diet] || diet).filter(Boolean) || ['mediterranea'];
  }

  // 📸 URL IMMAGINE UNSPLASH
  private getUnsplashImageUrl(nome: string, categoria: string): string {
    const nomeLC = nome.toLowerCase();
    
    // Mapping specifico per immagini
    if (nomeLC.includes('porridge')) return 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop';
    if (nomeLC.includes('smoothie')) return 'https://images.unsplash.com/photo-1553003914-07a5a3d50ba6?w=400&h=300&fit=crop';
    if (nomeLC.includes('salmone')) return 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop';
    if (nomeLC.includes('pollo')) return 'https://images.unsplash.com/photo-1606728035253-49e8a23146de?w=400&h=300&fit=crop';
    
    // Fallback per categoria
    const fallbackUrls = {
      'colazione': 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop',
      'pranzo': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
      'cena': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop',
      'spuntino': 'https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?w=400&h=300&fit=crop'
    };
    
    return fallbackUrls[categoria] || fallbackUrls['pranzo'];
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

    // Filtro per query testuale
    if (filters.query) {
      const query = filters.query.toLowerCase();
      results = results.filter(recipe => 
        recipe.nome.toLowerCase().includes(query) ||
        recipe.ingredienti.some(ing => ing.toLowerCase().includes(query)) ||
        recipe.preparazione.toLowerCase().includes(query)
      );
    }

    // Filtro per categoria
    if (filters.categoria) {
      results = results.filter(recipe => recipe.categoria === filters.categoria);
    }

    // Filtro per tipo cucina
    if (filters.tipoCucina) {
      results = results.filter(recipe => recipe.tipoCucina === filters.tipoCucina);
    }

    // Filtro per difficoltà
    if (filters.difficolta) {
      results = results.filter(recipe => recipe.difficolta === filters.difficolta);
    }

    // Filtro per tempo massimo
    if (filters.maxTempo) {
      results = results.filter(recipe => recipe.tempoPreparazione <= filters.maxTempo);
    }

    // Filtro per tipo dieta
    if (filters.tipoDieta && filters.tipoDieta.length > 0) {
      results = results.filter(recipe => 
        filters.tipoDieta!.some(diet => recipe.tipoDieta.includes(diet as any))
      );
    }

    // Filtro per allergie (esclude ricette con allergie specificate)
    if (filters.allergie && filters.allergie.length > 0) {
      results = results.filter(recipe => 
        !filters.allergie!.some(allergy => recipe.allergie.includes(allergy))
      );
    }

    return results;
  }

  // 📊 OPZIONI FILTRI DISPONIBILI  
  public getFilterOptions() {
    const categories = [...new Set(this.recipes.map(r => r.categoria))];
    const cuisines = [...new Set(this.recipes.map(r => r.tipoCucina))];
    const difficulties = [...new Set(this.recipes.map(r => r.difficolta))];
    const diets = [...new Set(this.recipes.flatMap(r => r.tipoDieta))];
    const allergies = [...new Set(this.recipes.flatMap(r => r.allergie))];

    return {
      categories: categories.sort(),
      cuisines: cuisines.sort(),
      difficulties: ['facile', 'medio', 'difficile'],
      diets: ['vegetariana', 'vegana', 'senza_glutine', 'keto', 'paleo', 'mediterranea', 'low_carb', 'chetogenica', 'bilanciata'].sort(),
      allergies: allergies.sort()
    };
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

  // 💾 PERSISTENZA PREFERITI
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
    return {
      totalRecipes: this.recipes.length,
      favoriteCount: this.favorites.size,
      averageRating: this.recipes.reduce((acc, recipe) => acc + (recipe.rating || 0), 0) / this.recipes.length,
      categoriesCount: new Set(this.recipes.map(r => r.categoria)).size
    };
  }
}