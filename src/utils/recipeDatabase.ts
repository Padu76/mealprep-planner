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
    console.log('🍳 Initializing Recipe Database from FITNESS_RECIPES_DB...');
    
    // Converti FITNESS_RECIPES_DB nel formato Recipe
    const fitnessRecipes: Recipe[] = [];
    
    // 🌅 COLAZIONI FITNESS
    FITNESS_RECIPES_DB.colazione?.forEach((recipe: any, index: number) => {
      fitnessRecipes.push(this.convertFitnessRecipe(recipe, 'colazione', fitnessRecipes.length + 1));
    });

    // ☀️ PRANZI FITNESS
    FITNESS_RECIPES_DB.pranzo?.forEach((recipe: any, index: number) => {
      fitnessRecipes.push(this.convertFitnessRecipe(recipe, 'pranzo', fitnessRecipes.length + 1));
    });

    // 🌙 CENE FITNESS
    FITNESS_RECIPES_DB.cena?.forEach((recipe: any, index: number) => {
      fitnessRecipes.push(this.convertFitnessRecipe(recipe, 'cena', fitnessRecipes.length + 1));
    });

    // 🍎 SPUNTINI FITNESS
    FITNESS_RECIPES_DB.spuntino?.forEach((recipe: any, index: number) => {
      fitnessRecipes.push(this.convertFitnessRecipe(recipe, 'spuntino', fitnessRecipes.length + 1));
    });

    // Aggiungi ricette AI fitness
    const aiRecipes: Recipe[] = FITNESS_AI_RECIPES.map((recipe, index) => ({
      ...recipe,
      id: `ai_fit_${index + 1}`,
      imageUrl: this.getAdvancedImageUrl(recipe.nome, recipe.categoria),
      createdAt: new Date(),
      reviewCount: Math.floor(Math.random() * 50) + 5
    }));

    this.recipes = [...fitnessRecipes, ...aiRecipes];
    console.log(`✅ Database initialized with ${this.recipes.length} recipes`);
    console.log(`📊 Cuisines: ${[...new Set(this.recipes.map(r => r.tipoCucina))].join(', ')}`);
  }

  // 🔄 CONVERTI RICETTA FITNESS IN FORMATO STANDARD
  private convertFitnessRecipe(fitnessRecipe: any, categoria: string, id: number): Recipe {
    return {
      id: `fitness_${id.toString().padStart(3, '0')}`,
      nome: fitnessRecipe.nome,
      categoria: categoria as any,
      tipoCucina: this.determineTipoCucina(fitnessRecipe.nome, fitnessRecipe.macroTarget),
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
      imageUrl: this.getAdvancedImageUrl(fitnessRecipe.nome, categoria),
      createdAt: new Date(),
      rating: this.generateRating(fitnessRecipe.fitnessScore),
      reviewCount: Math.floor(Math.random() * 50) + 5,
    };
  }

  // 🎯 DETERMINAZIONE TIPO CUCINA AVANZATA
  private determineTipoCucina(nome: string, macroTarget?: string): 'italiana' | 'mediterranea' | 'asiatica' | 'americana' | 'messicana' | 'internazionale' | 'ricette_fit' {
    const nomeLC = nome.toLowerCase();
    
    // 🏋️‍♂️ FITNESS/PROTEIN FOCUSED
    if (nomeLC.includes('protein') || nomeLC.includes('fitness') || nomeLC.includes('power') || 
        nomeLC.includes('energy balls') || nomeLC.includes('post-workout') || nomeLC.includes('shake') ||
        macroTarget === 'high-protein' || macroTarget === 'post-workout' || macroTarget === 'energy') {
      return 'ricette_fit';
    }
    
    // 🇮🇹 ITALIANA
    if (nomeLC.includes('risotto') || nomeLC.includes('pasta') || nomeLC.includes('tagliata') || 
        nomeLC.includes('parmigiano') || nomeLC.includes('mozzarella') || nomeLC.includes('frittata')) {
      return 'italiana';
    }
    
    // 🌏 ASIATICA  
    if (nomeLC.includes('bowl') || nomeLC.includes('teriyaki') || nomeLC.includes('poke') || 
        nomeLC.includes('sushi') || nomeLC.includes('curry') || nomeLC.includes('tofu')) {
      return 'asiatica';
    }
    
    // 🇺🇸 AMERICANA
    if (nomeLC.includes('pancakes') || nomeLC.includes('caesar') || nomeLC.includes('french') || 
        nomeLC.includes('burger') || nomeLC.includes('muffin') || nomeLC.includes('wrap')) {
      return 'americana';
    }
    
    // 🌊 MEDITERRANEA
    if (nomeLC.includes('salmone') || nomeLC.includes('branzino') || nomeLC.includes('greco') || 
        nomeLC.includes('olive') || nomeLC.includes('feta') || nomeLC.includes('hummus')) {
      return 'mediterranea';
    }
    
    return 'internazionale';
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

  // 🛠️ UTILITY METHODS AVANZATE
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
    const nome = recipe.nome ? recipe.nome.toLowerCase() : '';
    
    // 🥬 VEGETARIANA (no carne/pesce)
    if (!ingredienti.includes('carne') && !ingredienti.includes('pesce') && 
        !ingredienti.includes('pollo') && !ingredienti.includes('manzo') && 
        !ingredienti.includes('salmone') && !ingredienti.includes('tonno')) {
      diets.push('vegetariana');
    }
    
    // 🌱 VEGANA (no derivati animali)
    if (!ingredienti.includes('uova') && !ingredienti.includes('latte') && 
        !ingredienti.includes('formaggio') && !ingredienti.includes('yogurt') && 
        !ingredienti.includes('ricotta') && !ingredienti.includes('parmigiano')) {
      diets.push('vegana');
    }
    
    // 🥖 SENZA GLUTINE
    if (!ingredienti.includes('glutine') && !ingredienti.includes('pane') && 
        !ingredienti.includes('pasta') && !ingredienti.includes('farina') && 
        !ingredienti.includes('avena')) {
      diets.push('senza_glutine');
    }
    
    // 🥑 KETO/CHETOGENICA (bassi carbs, alti grassi)
    if (recipe.carboidrati < 15 && recipe.grassi > 15) {
      diets.push('keto');
      diets.push('chetogenica');
    }
    
    // 🥩 LOW CARB (carboidrati ridotti)
    if (recipe.carboidrati < 25) {
      diets.push('low_carb');
    }
    
    // 🏛️ PALEO (no cereali/legumi/latticini)
    if (!ingredienti.includes('latte') && !ingredienti.includes('formaggio') && 
        !ingredienti.includes('fagioli') && !ingredienti.includes('lenticchie') && 
        !ingredienti.includes('cereali') && !ingredienti.includes('avena')) {
      diets.push('paleo');
    }
    
    // ⚖️ BILANCIATA (40-30-30 o simile)
    if (recipe.proteine && recipe.carboidrati && recipe.grassi) {
      const totalMacro = recipe.proteine * 4 + recipe.carboidrati * 4 + recipe.grassi * 9;
      const proteinPercent = (recipe.proteine * 4) / totalMacro * 100;
      const carbPercent = (recipe.carboidrati * 4) / totalMacro * 100;
      const fatPercent = (recipe.grassi * 9) / totalMacro * 100;
      
      // Bilanciata se macro sono relativamente equilibrate
      if (proteinPercent >= 20 && proteinPercent <= 35 && 
          carbPercent >= 25 && carbPercent <= 45 && 
          fatPercent >= 20 && fatPercent <= 35) {
        diets.push('bilanciata');
      }
    }
    
    // 🌊 MEDITERRANEA (olio EVO, pesce, verdure)
    if (ingredienti.includes('olio evo') || ingredienti.includes('pesce') || 
        ingredienti.includes('verdure') || ingredienti.includes('olive') ||
        ingredienti.includes('salmone') || ingredienti.includes('branzino')) {
      diets.push('mediterranea');
    }
    
    // Fallback se nessuna dieta identificata
    if (diets.length === 0) {
      diets.push('bilanciata');
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

  private generateRating(fitnessScore?: number): number {
    if (fitnessScore) {
      // Converti fitness score (0-100) in rating (3.0-5.0)
      return Math.min(5.0, Math.max(3.0, (fitnessScore / 100) * 2 + 3));
    }
    return Math.random() * 1.5 + 3.5; // Rating casuale tra 3.5 e 5.0
  }

  // 📸 URL IMMAGINE AVANZATO (60+ mappature specifiche)
  private getAdvancedImageUrl(nome: string, categoria: string): string {
    const nomeLC = nome.toLowerCase();
    
    // 🍳 COLAZIONI SPECIFICHE
    if (nomeLC.includes('porridge') && nomeLC.includes('proteico')) {
      return 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('porridge') || nomeLC.includes('avena')) {
      return 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('pancakes') && nomeLC.includes('protein')) {
      return 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('pancakes')) {
      return 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('yogurt') && nomeLC.includes('greco')) {
      return 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('smoothie') && nomeLC.includes('verde')) {
      return 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('smoothie') && nomeLC.includes('bowl')) {
      return 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('smoothie')) {
      return 'https://images.unsplash.com/photo-1553003914-07a5a3d50ba6?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('toast') && nomeLC.includes('avocado')) {
      return 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('overnight') && nomeLC.includes('oats')) {
      return 'https://images.unsplash.com/photo-1478145787956-f6f12c59624d?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('french') && nomeLC.includes('toast')) {
      return 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('chia') && nomeLC.includes('pudding')) {
      return 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop&auto=format';
    }
    
    // 🥗 PRANZI E INSALATE
    if (nomeLC.includes('buddha') && nomeLC.includes('bowl')) {
      return 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('quinoa') && nomeLC.includes('bowl')) {
      return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('power') && nomeLC.includes('bowl')) {
      return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('poke') && nomeLC.includes('bowl')) {
      return 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('caesar') && nomeLC.includes('salad')) {
      return 'https://images.unsplash.com/photo-1551248429-40975aa4de74?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('chicken') && nomeLC.includes('salad')) {
      return 'https://images.unsplash.com/photo-1551248429-40975aa4de74?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('insalata') && nomeLC.includes('quinoa')) {
      return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('insalata') && nomeLC.includes('tonno')) {
      return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('insalata') && nomeLC.includes('legumi')) {
      return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('insalata')) {
      return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&auto=format';
    }
    
    // 🐟 PESCE E FRUTTI DI MARE
    if (nomeLC.includes('salmone') && nomeLC.includes('grigliato')) {
      return 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('salmone') && nomeLC.includes('crosta')) {
      return 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('salmone')) {
      return 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('branzino')) {
      return 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('merluzzo')) {
      return 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('tonno')) {
      return 'https://images.unsplash.com/photo-1564069114553-7215ea2fe407?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('gamberi')) {
      return 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=300&fit=crop&auto=format';
    }
    
    // 🍖 CARNE E PROTEINE
    if (nomeLC.includes('pollo') && nomeLC.includes('curry')) {
      return 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('pollo') && nomeLC.includes('grigliato')) {
      return 'https://images.unsplash.com/photo-1606728035253-49e8a23146de?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('chicken') && nomeLC.includes('power')) {
      return 'https://images.unsplash.com/photo-1606728035253-49e8a23146de?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('pollo')) {
      return 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('tagliata') && nomeLC.includes('manzo')) {
      return 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('turkey') || nomeLC.includes('tacchino')) {
      return 'https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('manzo')) {
      return 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('tofu') && nomeLC.includes('teriyaki')) {
      return 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('tofu')) {
      return 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop&auto=format';
    }
    
    // 🍝 PASTA E RISOTTI
    if (nomeLC.includes('risotto') && nomeLC.includes('funghi')) {
      return 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('risotto')) {
      return 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('pasta') && nomeLC.includes('integrale')) {
      return 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('pasta')) {
      return 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400&h=300&fit=crop&auto=format';
    }
    
    // 🥚 UOVA E FRITTATE
    if (nomeLC.includes('omelette') && nomeLC.includes('fitness')) {
      return 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('frittata') && nomeLC.includes('verdure')) {
      return 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('frittata')) {
      return 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('omelette')) {
      return 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=300&fit=crop&auto=format';
    }
    
    // 🥤 BEVANDE E SHAKE
    if (nomeLC.includes('shake') && nomeLC.includes('protein')) {
      return 'https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('protein') && nomeLC.includes('shake')) {
      return 'https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?w=400&h=300&fit=crop&auto=format';
    }
    
    // 🍯 SPUNTINI E SNACK
    if (nomeLC.includes('energy') && nomeLC.includes('balls')) {
      return 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('protein') && nomeLC.includes('balls')) {
      return 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('muffin') && nomeLC.includes('protein')) {
      return 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('muffin')) {
      return 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('ricotta') && nomeLC.includes('noci')) {
      return 'https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('cottage') && nomeLC.includes('cheese')) {
      return 'https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('hummus')) {
      return 'https://images.unsplash.com/photo-1571306894533-ad06d1070ac4?w=400&h=300&fit=crop&auto=format';
    }
    
    // 🍲 ZUPPE
    if (nomeLC.includes('zuppa') && nomeLC.includes('lenticchie')) {
      return 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('zuppa')) {
      return 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop&auto=format';
    }
    
    // 🌮 WRAPS
    if (nomeLC.includes('wrap') && nomeLC.includes('proteico')) {
      return 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=300&fit=crop&auto=format';
    }
    if (nomeLC.includes('wrap')) {
      return 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=300&fit=crop&auto=format';
    }
    
    // 🥗 FALLBACK PER CATEGORIA
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