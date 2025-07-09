// utils/mealPlannerIntegration.ts
import { RecipeDatabase, Recipe } from './recipeDatabase';

export interface MealPlanDay {
  day: string;
  meals: {
    colazione?: Recipe;
    pranzo?: Recipe;
    cena?: Recipe;
    spuntino1?: Recipe;
    spuntino2?: Recipe;
    spuntino3?: Recipe;
  };
}

export interface MealPlan {
  days: MealPlanDay[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  userPreferences: any;
}

export class MealPlannerIntegration {
  private static instance: MealPlannerIntegration;
  private recipeDB: RecipeDatabase;

  private constructor() {
    this.recipeDB = RecipeDatabase.getInstance();
  }

  static getInstance(): MealPlannerIntegration {
    if (!MealPlannerIntegration.instance) {
      MealPlannerIntegration.instance = new MealPlannerIntegration();
    }
    return MealPlannerIntegration.instance;
  }

  // Genera meal plan usando ricette dal database
  generateMealPlan(formData: any): MealPlan {
    const numDays = parseInt(formData.durata) || 7;
    const numPasti = parseInt(formData.pasti) || 3;
    const days: MealPlanDay[] = [];

    for (let i = 0; i < numDays; i++) {
      const day: MealPlanDay = {
        day: `Giorno ${i + 1}`,
        meals: {}
      };

      // Seleziona ricette per ogni pasto
      day.meals.colazione = this.selectRecipeForMeal('colazione', formData, i);
      day.meals.pranzo = this.selectRecipeForMeal('pranzo', formData, i);
      day.meals.cena = this.selectRecipeForMeal('cena', formData, i);

      // Aggiungi spuntini se richiesti
      if (numPasti >= 4) {
        day.meals.spuntino1 = this.selectRecipeForMeal('spuntino', formData, i);
      }
      if (numPasti >= 5) {
        day.meals.spuntino2 = this.selectRecipeForMeal('spuntino', formData, i, [day.meals.spuntino1?.id]);
      }
      if (numPasti >= 6) {
        day.meals.spuntino3 = this.selectRecipeForMeal('spuntino', formData, i, [day.meals.spuntino1?.id, day.meals.spuntino2?.id]);
      }

      days.push(day);
    }

    // Calcola totali nutrizionali
    const totals = this.calculateNutritionalTotals(days);

    return {
      days,
      totalCalories: totals.calories,
      totalProtein: totals.protein,
      totalCarbs: totals.carbs,
      totalFat: totals.fat,
      userPreferences: formData
    };
  }

  // Seleziona ricetta appropriata per un pasto
  private selectRecipeForMeal(mealType: string, formData: any, dayIndex: number, excludeIds: string[] = []): Recipe | undefined {
    const filters = {
      categoria: mealType === 'spuntino' ? 'spuntino' : mealType as any,
      tipoDieta: this.getUserDietPreferences(formData),
      allergie: this.getUserAllergies(formData),
      maxCalorie: this.getMaxCaloriesForMeal(mealType, formData),
      maxTempo: this.getMaxTimeForMeal(mealType, formData)
    };

    // Cerca ricette che matchano i filtri
    let candidates = this.recipeDB.searchRecipes(filters);

    // Escludi ricette già selezionate
    candidates = candidates.filter(recipe => !excludeIds.includes(recipe.id));

    // Applica logica di varietà
    if (formData.evitaRipetizioni === 'si' && dayIndex > 0) {
      // Evita ricette usate nei giorni precedenti
      candidates = this.filterPreviouslyUsedRecipes(candidates, dayIndex);
    }

    // Seleziona ricetta con rating più alto
    candidates.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    return candidates[0];
  }

  // Filtra ricette usate precedentemente
  private filterPreviouslyUsedRecipes(candidates: Recipe[], dayIndex: number): Recipe[] {
    // Logica per evitare ripetizioni negli ultimi 2-3 giorni
    const recentlyUsed = new Set<string>();
    
    // Qui potresti implementare logica per tracciare ricette usate
    // Per ora ritorniamo i candidati così come sono
    return candidates;
  }

  // Ottieni preferenze dietetiche utente
  private getUserDietPreferences(formData: any): string[] {
    const preferences: string[] = [];
    
    if (formData.stileAlimentare?.includes('vegetariano')) {
      preferences.push('vegetariana');
    }
    if (formData.stileAlimentare?.includes('vegano')) {
      preferences.push('vegana');
    }
    if (formData.allergie?.includes('glutine')) {
      preferences.push('senza_glutine');
    }
    if (formData.obiettivo === 'perdita-peso') {
      preferences.push('keto');
    }
    
    return preferences;
  }

  // Ottieni allergie utente
  private getUserAllergies(formData: any): string[] {
    if (!formData.allergie) return [];
    
    const allergieMap: { [key: string]: string } = {
      'glutine': 'glutine',
      'lattosio': 'latte',
      'uova': 'uova',
      'pesce': 'pesce',
      'frutta secca': 'frutta_secca',
      'soia': 'soia',
      'sesamo': 'sesamo'
    };
    
    return formData.allergie.map((allergy: string) => allergieMap[allergy] || allergy);
  }

  // Ottieni calorie massime per pasto
  private getMaxCaloriesForMeal(mealType: string, formData: any): number {
    const totalCalories = this.calculateTargetCalories(formData);
    
    switch (mealType) {
      case 'colazione': return Math.round(totalCalories * 0.25);
      case 'pranzo': return Math.round(totalCalories * 0.35);
      case 'cena': return Math.round(totalCalories * 0.30);
      case 'spuntino': return Math.round(totalCalories * 0.10);
      default: return 500;
    }
  }

  // Ottieni tempo massimo per pasto
  private getMaxTimeForMeal(mealType: string, formData: any): number {
    const tempoDisponibile = formData.tempoDisponibile || 'medio';
    
    const timeMap: { [key: string]: { [key: string]: number } } = {
      'poco': { colazione: 15, pranzo: 30, cena: 45, spuntino: 10 },
      'medio': { colazione: 25, pranzo: 45, cena: 60, spuntino: 15 },
      'molto': { colazione: 45, pranzo: 90, cena: 120, spuntino: 30 }
    };
    
    return timeMap[tempoDisponibile]?.[mealType] || 60;
  }

  // Calcola calorie target giornaliere
  private calculateTargetCalories(formData: any): number {
    const peso = parseInt(formData.peso) || 70;
    const altezza = parseInt(formData.altezza) || 170;
    const eta = parseInt(formData.eta) || 30;
    const sesso = formData.sesso || 'maschio';
    const attivita = formData.attivita || 'moderata';
    
    // Formula Harris-Benedict
    let bmr;
    if (sesso === 'maschio') {
      bmr = 88.362 + (13.397 * peso) + (4.799 * altezza) - (5.677 * eta);
    } else {
      bmr = 447.593 + (9.247 * peso) + (3.098 * altezza) - (4.330 * eta);
    }
    
    // Fattore attività
    const activityFactor: { [key: string]: number } = {
      'sedentaria': 1.2,
      'leggera': 1.375,
      'moderata': 1.55,
      'intensa': 1.725,
      'molto-intensa': 1.9
    };
    
    let tdee = bmr * (activityFactor[attivita] || 1.55);
    
    // Aggiusta per obiettivo
    if (formData.obiettivo === 'perdita-peso') {
      tdee *= 0.8; // Deficit calorico 20%
    } else if (formData.obiettivo === 'aumento-massa') {
      tdee *= 1.1; // Surplus calorico 10%
    }
    
    return Math.round(tdee);
  }

  // Calcola totali nutrizionali del piano
  private calculateNutritionalTotals(days: MealPlanDay[]): {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  } {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    days.forEach(day => {
      Object.values(day.meals).forEach(meal => {
        if (meal) {
          totalCalories += meal.calorie;
          totalProtein += meal.proteine;
          totalCarbs += meal.carboidrati;
          totalFat += meal.grassi;
        }
      });
    });

    return {
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat
    };
  }

  // Sostituisci ricetta in un piano esistente
  replaceRecipeInPlan(plan: MealPlan, dayIndex: number, mealType: string, newRecipeId?: string): MealPlan {
    const newPlan = { ...plan };
    newPlan.days = [...plan.days];
    newPlan.days[dayIndex] = { ...plan.days[dayIndex] };
    newPlan.days[dayIndex].meals = { ...plan.days[dayIndex].meals };

    if (newRecipeId) {
      const newRecipe = this.recipeDB.getRecipeById(newRecipeId);
      if (newRecipe) {
        (newPlan.days[dayIndex].meals as any)[mealType] = newRecipe;
      }
    } else {
      // Genera nuova ricetta automaticamente
      const newRecipe = this.selectRecipeForMeal(mealType, plan.userPreferences, dayIndex);
      if (newRecipe) {
        (newPlan.days[dayIndex].meals as any)[mealType] = newRecipe;
      }
    }

    // Ricalcola totali
    const totals = this.calculateNutritionalTotals(newPlan.days);
    newPlan.totalCalories = totals.calories;
    newPlan.totalProtein = totals.protein;
    newPlan.totalCarbs = totals.carbs;
    newPlan.totalFat = totals.fat;

    return newPlan;
  }

  // Genera lista della spesa dal piano
  generateShoppingList(plan: MealPlan): { [category: string]: string[] } {
    const shoppingList: { [category: string]: Set<string> } = {
      'Frutta e Verdura': new Set(),
      'Carne e Pesce': new Set(),
      'Latticini': new Set(),
      'Cereali e Legumi': new Set(),
      'Condimenti': new Set(),
      'Altro': new Set()
    };

    plan.days.forEach(day => {
      Object.values(day.meals).forEach(meal => {
        if (meal) {
          meal.ingredienti.forEach(ingredient => {
            const category = this.categorizeIngredient(ingredient);
            shoppingList[category].add(ingredient);
          });
        }
      });
    });

    // Converti Set in array
    const result: { [category: string]: string[] } = {};
    Object.keys(shoppingList).forEach(category => {
      result[category] = Array.from(shoppingList[category]);
    });

    return result;
  }

  // Categorizza ingrediente per lista spesa
  private categorizeIngredient(ingredient: string): string {
    const lowerIngredient = ingredient.toLowerCase();
    
    if (lowerIngredient.includes('pomodor') || lowerIngredient.includes('insalata') || 
        lowerIngredient.includes('carota') || lowerIngredient.includes('cipolla') ||
        lowerIngredient.includes('aglio') || lowerIngredient.includes('basilico') ||
        lowerIngredient.includes('banana') || lowerIngredient.includes('limone')) {
      return 'Frutta e Verdura';
    }
    
    if (lowerIngredient.includes('pollo') || lowerIngredient.includes('manzo') ||
        lowerIngredient.includes('salmone') || lowerIngredient.includes('pesce') ||
        lowerIngredient.includes('uovo')) {
      return 'Carne e Pesce';
    }
    
    if (lowerIngredient.includes('latte') || lowerIngredient.includes('yogurt') ||
        lowerIngredient.includes('formaggio') || lowerIngredient.includes('parmigiano')) {
      return 'Latticini';
    }
    
    if (lowerIngredient.includes('pasta') || lowerIngredient.includes('riso') ||
        lowerIngredient.includes('pane') || lowerIngredient.includes('avena') ||
        lowerIngredient.includes('fagioli') || lowerIngredient.includes('lenticchie')) {
      return 'Cereali e Legumi';
    }
    
    if (lowerIngredient.includes('olio') || lowerIngredient.includes('aceto') ||
        lowerIngredient.includes('sale') || lowerIngredient.includes('pepe')) {
      return 'Condimenti';
    }
    
    return 'Altro';
  }

  // Ottieni statistiche del piano
  getPlanStats(plan: MealPlan): {
    avgCaloriesPerDay: number;
    avgProteinPerDay: number;
    avgCarbsPerDay: number;
    avgFatPerDay: number;
    totalRecipes: number;
    uniqueRecipes: number;
    dietCompliance: number;
  } {
    const totalDays = plan.days.length;
    const uniqueRecipeIds = new Set<string>();
    let totalRecipes = 0;

    plan.days.forEach(day => {
      Object.values(day.meals).forEach(meal => {
        if (meal) {
          totalRecipes++;
          uniqueRecipeIds.add(meal.id);
        }
      });
    });

    return {
      avgCaloriesPerDay: Math.round(plan.totalCalories / totalDays),
      avgProteinPerDay: Math.round(plan.totalProtein / totalDays),
      avgCarbsPerDay: Math.round(plan.totalCarbs / totalDays),
      avgFatPerDay: Math.round(plan.totalFat / totalDays),
      totalRecipes,
      uniqueRecipes: uniqueRecipeIds.size,
      dietCompliance: Math.round((uniqueRecipeIds.size / totalRecipes) * 100)
    };
  }
}