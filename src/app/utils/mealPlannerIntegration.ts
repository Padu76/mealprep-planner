// utils/mealPlannerIntegration.ts - VERSIONE FITNESS INTEGRATA
import { RecipeDatabase, Recipe } from './recipeDatabase';
import { FITNESS_RECIPES_DB, selectFitnessRecipes, generateCompleteFitnessPlan, calculatePlanFitnessScore } from './fitness_recipes_database';

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
  dayCalories: number;
  dayProtein: number;
  dayCarbs: number;
  dayFat: number;
  fitnessScore?: number;
}

export interface MealPlan {
  days: MealPlanDay[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  userPreferences: any;
  fitnessOptimized: boolean;
  planFitnessScore?: {
    averageScore: number;
    totalRecipes: number;
    rating: string;
  };
}

export class MealPlannerIntegration {
  private static instance: MealPlannerIntegration;
  private recipeDB: RecipeDatabase;
  private usedRecipes: Set<string> = new Set();
  private fitnessMode: boolean = true; // NUOVO: Modalità FITNESS attiva di default

  private constructor() {
    this.recipeDB = RecipeDatabase.getInstance();
  }

  static getInstance(): MealPlannerIntegration {
    if (!MealPlannerIntegration.instance) {
      MealPlannerIntegration.instance = new MealPlannerIntegration();
    }
    return MealPlannerIntegration.instance;
  }

  // 🏋️‍♂️ NUOVO: Attiva/disattiva modalità FITNESS
  setFitnessMode(enabled: boolean): void {
    this.fitnessMode = enabled;
    console.log(`🎯 Fitness mode ${enabled ? 'ENABLED' : 'DISABLED'}`);
  }

  // 🇮🇹 GENERA MEAL PLAN FITNESS-OTTIMIZZATO
  generateMealPlan(formData: any): MealPlan {
    console.log('🍽️ Generating meal plan with FITNESS optimization...');
    console.log('🎯 Form data:', formData);
    
    const numDays = parseInt(formData.durata) || 7;
    const numPasti = parseInt(formData.pasti) || 3;
    
    // Reset ricette usate per ogni piano
    this.usedRecipes.clear();

    if (this.fitnessMode) {
      return this.generateFitnessMealPlan(formData, numDays, numPasti);
    } else {
      return this.generateStandardMealPlan(formData, numDays, numPasti);
    }
  }

  // 🏋️‍♂️ NUOVO: Genera piano FITNESS usando database italiano
  private generateFitnessMealPlan(formData: any, numDays: number, numPasti: number): MealPlan {
    console.log('🏋️‍♂️ Generating FITNESS-optimized meal plan...');
    
    // Calcola target calorico
    const targetCalories = this.calculateTargetCalories(formData);
    
    // Distribuzione calorie per pasto
    const calorieDistribution = this.getCalorieDistribution(numPasti, targetCalories);
    console.log('📊 Calorie distribution:', calorieDistribution);
    
    // Genera piano completo usando database FITNESS
    const fitnessPlan = generateCompleteFitnessPlan(formData, calorieDistribution, numDays);
    
    // Converti al formato MealPlan
    const days: MealPlanDay[] = fitnessPlan.days.map((day: any) => ({
      day: day.day,
      meals: day.meals,
      dayCalories: day.dayCalories,
      dayProtein: day.dayProtein,
      dayCarbs: day.dayCarbs,
      dayFat: day.dayFat,
      fitnessScore: this.calculateDayFitnessScore(day.meals)
    }));

    // Calcola totali nutrizionali
    const totals = this.calculateNutritionalTotals(days);
    
    // Calcola fitness score del piano
    const planFitnessScore = calculatePlanFitnessScore(fitnessPlan);

    const mealPlan: MealPlan = {
      days,
      totalCalories: totals.calories,
      totalProtein: totals.protein,
      totalCarbs: totals.carbs,
      totalFat: totals.fat,
      userPreferences: formData,
      fitnessOptimized: true,
      planFitnessScore
    };

    console.log(`✅ FITNESS meal plan generated: ${days.length} days, ${fitnessPlan.totalRecipes} recipes`);
    console.log(`🏅 Plan fitness score: ${planFitnessScore.averageScore}/100 (${planFitnessScore.rating})`);
    
    return mealPlan;
  }

  // 📊 NUOVO: Distribuzione calorie ottimizzata per fitness
  private getCalorieDistribution(numPasti: number, dailyCalories: number): { [key: string]: number } {
    const distributions: { [key: number]: { [key: string]: number } } = {
      2: { colazione: 0.45, pranzo: 0.55 }, // IF 16:8
      3: { colazione: 0.25, pranzo: 0.45, cena: 0.30 }, // Standard
      4: { colazione: 0.25, pranzo: 0.40, cena: 0.25, spuntino1: 0.10 }, // + spuntino
      5: { colazione: 0.20, pranzo: 0.35, cena: 0.25, spuntino1: 0.10, spuntino2: 0.10 }, // Bodybuilding
      6: { colazione: 0.20, pranzo: 0.30, cena: 0.25, spuntino1: 0.10, spuntino2: 0.10, spuntino3: 0.05 }, // Frequenti
      7: { colazione: 0.15, pranzo: 0.25, cena: 0.25, spuntino1: 0.10, spuntino2: 0.10, spuntino3: 0.08, spuntino4: 0.07 } // Ultra
    };

    const distribution = distributions[numPasti] || distributions[3];
    const result: { [key: string]: number } = {};
    
    Object.entries(distribution).forEach(([meal, percentage]) => {
      result[meal] = Math.round(dailyCalories * percentage);
    });

    console.log(`🍽️ Calorie distribution for ${numPasti} meals:`, result);
    return result;
  }

  // 🏅 NUOVO: Calcola fitness score di una giornata
  private calculateDayFitnessScore(meals: any): number {
    const mealScores: number[] = [];
    
    Object.values(meals).forEach((meal: any) => {
      if (meal && meal.fitnessScore) {
        mealScores.push(meal.fitnessScore);
      }
    });
    
    if (mealScores.length === 0) return 0;
    
    const averageScore = mealScores.reduce((sum, score) => sum + score, 0) / mealScores.length;
    return Math.round(averageScore);
  }

  // 📈 GENERA PIANO STANDARD (fallback)
  private generateStandardMealPlan(formData: any, numDays: number, numPasti: number): MealPlan {
    console.log('📈 Generating standard meal plan...');
    
    const days: MealPlanDay[] = [];

    for (let i = 0; i < numDays; i++) {
      const day: MealPlanDay = {
        day: `Giorno ${i + 1}`,
        meals: {},
        dayCalories: 0,
        dayProtein: 0,
        dayCarbs: 0,
        dayFat: 0
      };

      // Seleziona ricette per ogni pasto usando database standard
      day.meals.colazione = this.selectRecipeForMeal('colazione', formData, i);
      day.meals.pranzo = this.selectRecipeForMeal('pranzo', formData, i);
      day.meals.cena = this.selectRecipeForMeal('cena', formData, i);

      // Aggiungi spuntini se richiesti
      if (numPasti >= 4) {
        day.meals.spuntino1 = this.selectRecipeForMeal('spuntino', formData, i);
      }
      if (numPasti >= 5) {
        day.meals.spuntino2 = this.selectRecipeForMeal('spuntino', formData, i);
      }
      if (numPasti >= 6) {
        day.meals.spuntino3 = this.selectRecipeForMeal('spuntino', formData, i);
      }

      // Calcola totali giornalieri
      Object.values(day.meals).forEach(meal => {
        if (meal) {
          day.dayCalories += meal.calorie || 0;
          day.dayProtein += meal.proteine || 0;
          day.dayCarbs += meal.carboidrati || 0;
          day.dayFat += meal.grassi || 0;
        }
      });

      days.push(day);
    }

    // Calcola totali nutrizionali
    const totals = this.calculateNutritionalTotals(days);

    const mealPlan: MealPlan = {
      days,
      totalCalories: totals.calories,
      totalProtein: totals.protein,
      totalCarbs: totals.carbs,
      totalFat: totals.fat,
      userPreferences: formData,
      fitnessOptimized: false
    };

    console.log('✅ Standard meal plan generated successfully');
    return mealPlan;
  }

  // Seleziona ricetta appropriata per un pasto (METODO ESISTENTE MIGLIORATO)
  private selectRecipeForMeal(mealType: string, formData: any, dayIndex: number): Recipe | undefined {
    console.log(`🔍 Selecting recipe for ${mealType} on day ${dayIndex + 1}`);
    
    // Se è attiva la modalità FITNESS, usa il database FITNESS
    if (this.fitnessMode) {
      const objetivo = formData.obiettivo || 'mantenimento';
      const allergie = formData.allergie || [];
      const preferenze = formData.preferenze || [];
      
      const fitnessRecipes = selectFitnessRecipes(
        mealType as 'colazione' | 'pranzo' | 'cena' | 'spuntino',
        objetivo,
        1,
        preferenze,
        allergie
      );
      
      if (fitnessRecipes.length > 0) {
        const selected = fitnessRecipes[dayIndex % fitnessRecipes.length];
        console.log(`✅ FITNESS recipe selected: ${selected.nome} (Score: ${selected.fitnessScore})`);
        return selected as Recipe;
      }
    }

    // Fallback al database standard
    const filters = {
      categoria: mealType === 'spuntino' ? 'spuntino' : mealType as any,
      tipoDieta: this.getUserDietPreferences(formData),
      allergie: this.getUserAllergies(formData),
      maxCalorie: this.getMaxCaloriesForMeal(mealType, formData),
      maxTempo: this.getMaxTimeForMeal(mealType, formData)
    };

    let candidates = this.recipeDB.searchRecipes(filters);

    // Filtra ricette già usate per evitare ripetizioni
    if (formData.evitaRipetizioni === 'si') {
      candidates = candidates.filter(recipe => !this.usedRecipes.has(recipe.id));
    }

    // Se non ci sono candidati, rilassa i filtri
    if (candidates.length === 0) {
      candidates = this.recipeDB.searchRecipes({
        categoria: mealType === 'spuntino' ? 'spuntino' : mealType as any
      });
    }

    // Seleziona ricetta con rating più alto
    candidates.sort((a, b) => {
      const ratingA = a.rating || 0;
      const ratingB = b.rating || 0;
      return ratingB - ratingA;
    });

    const selectedRecipe = candidates[0];
    
    if (selectedRecipe) {
      this.usedRecipes.add(selectedRecipe.id);
      console.log(`✅ Standard recipe selected: ${selectedRecipe.nome}`);
    }

    return selectedRecipe;
  }

  // 🥗 ANALISI NUTRIZIONALE AVANZATA
  getPlanNutritionalAnalysis(plan: MealPlan): {
    dailyAverages: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      proteinPercentage: number;
      carbPercentage: number;
      fatPercentage: number;
    };
    fitnessMetrics: {
      proteinPerKg: number;
      calorieBalance: 'deficit' | 'maintenance' | 'surplus';
      macroBalance: 'low-carb' | 'balanced' | 'high-carb';
      overallScore: number;
    };
    recommendations: string[];
  } {
    const totalDays = plan.days.length;
    const avgCalories = plan.totalCalories / totalDays;
    const avgProtein = plan.totalProtein / totalDays;
    const avgCarbs = plan.totalCarbs / totalDays;
    const avgFat = plan.totalFat / totalDays;

    // Calcola percentuali macro
    const proteinCal = avgProtein * 4;
    const carbCal = avgCarbs * 4;
    const fatCal = avgFat * 9;
    const totalMacroCal = proteinCal + carbCal + fatCal;

    const proteinPercentage = Math.round((proteinCal / totalMacroCal) * 100);
    const carbPercentage = Math.round((carbCal / totalMacroCal) * 100);
    const fatPercentage = Math.round((fatCal / totalMacroCal) * 100);

    // Calcola metriche fitness
    const userWeight = parseInt(plan.userPreferences.peso) || 70;
    const proteinPerKg = avgProtein / userWeight;
    
    const targetCalories = this.calculateTargetCalories(plan.userPreferences);
    const calorieBalance = avgCalories < targetCalories * 0.9 ? 'deficit' : 
                         avgCalories > targetCalories * 1.1 ? 'surplus' : 'maintenance';
    
    const macroBalance = carbPercentage < 35 ? 'low-carb' : 
                        carbPercentage > 55 ? 'high-carb' : 'balanced';

    // Score complessivo
    let overallScore = 70; // Base score
    if (proteinPerKg >= 1.2) overallScore += 10;
    if (proteinPerKg >= 1.6) overallScore += 10;
    if (proteinPercentage >= 20 && proteinPercentage <= 35) overallScore += 10;
    if (plan.fitnessOptimized) overallScore += 10;
    if (plan.planFitnessScore && plan.planFitnessScore.averageScore >= 85) overallScore += 10;

    // Raccomandazioni
    const recommendations: string[] = [];
    if (proteinPerKg < 1.2) recommendations.push('Aumenta apporto proteico a 1.2-1.6g per kg peso');
    if (proteinPercentage < 20) recommendations.push('Le proteine dovrebbero essere 20-35% delle calorie');
    if (carbPercentage > 60) recommendations.push('Riduci carboidrati e bilancia con proteine/grassi');
    if (fatPercentage < 20) recommendations.push('Aggiungi grassi sani (20-35% delle calorie)');
    if (!plan.fitnessOptimized) recommendations.push('Attiva modalità FITNESS per ricette ottimizzate');

    return {
      dailyAverages: {
        calories: Math.round(avgCalories),
        protein: Math.round(avgProtein),
        carbs: Math.round(avgCarbs),
        fat: Math.round(avgFat),
        proteinPercentage,
        carbPercentage,
        fatPercentage
      },
      fitnessMetrics: {
        proteinPerKg: Math.round(proteinPerKg * 10) / 10,
        calorieBalance,
        macroBalance,
        overallScore: Math.min(100, overallScore)
      },
      recommendations
    };
  }

  // 🛒 GENERA LISTA SPESA FITNESS-OTTIMIZZATA
  generateShoppingList(plan: MealPlan): { [category: string]: string[] } {
    const shoppingList: { [category: string]: Set<string> } = {
      '🥩 Proteine': new Set(),
      '🥬 Verdure e Ortaggi': new Set(),
      '🍎 Frutta': new Set(),
      '🌾 Cereali e Legumi': new Set(),
      '🥛 Latticini e Uova': new Set(),
      '🥑 Grassi Sani': new Set(),
      '🧄 Condimenti e Spezie': new Set(),
      '💊 Integratori': new Set(),
      '🛒 Altri': new Set()
    };

    plan.days.forEach(day => {
      Object.values(day.meals).forEach(meal => {
        if (meal) {
          meal.ingredienti.forEach(ingredient => {
            const category = this.categorizeFitnessIngredient(ingredient);
            shoppingList[category].add(ingredient);
          });
        }
      });
    });

    // Converti Set in array e ordina
    const result: { [category: string]: string[] } = {};
    Object.keys(shoppingList).forEach(category => {
      result[category] = Array.from(shoppingList[category]).sort();
    });

    console.log('🛒 FITNESS shopping list generated:', result);
    return result;
  }

  // 🏋️‍♂️ CATEGORIZZA INGREDIENTI FITNESS
  private categorizeFitnessIngredient(ingredient: string): string {
    const lowerIngredient = ingredient.toLowerCase();
    
    // Proteine
    if (lowerIngredient.includes('pollo') || lowerIngredient.includes('manzo') ||
        lowerIngredient.includes('tacchino') || lowerIngredient.includes('salmone') ||
        lowerIngredient.includes('tonno') || lowerIngredient.includes('pesce') ||
        lowerIngredient.includes('proteine whey') || lowerIngredient.includes('tofu')) {
      return '🥩 Proteine';
    }
    
    // Verdure e ortaggi
    if (lowerIngredient.includes('pomodor') || lowerIngredient.includes('spinaci') || 
        lowerIngredient.includes('broccoli') || lowerIngredient.includes('zucchine') ||
        lowerIngredient.includes('asparagi') || lowerIngredient.includes('peperoni') ||
        lowerIngredient.includes('cipolla') || lowerIngredient.includes('aglio') ||
        lowerIngredient.includes('cavolfiore') || lowerIngredient.includes('verdure')) {
      return '🥬 Verdure e Ortaggi';
    }
    
    // Frutta
    if (lowerIngredient.includes('banana') || lowerIngredient.includes('mela') ||
        lowerIngredient.includes('frutti di bosco') || lowerIngredient.includes('mirtilli') ||
        lowerIngredient.includes('limone') || lowerIngredient.includes('avocado')) {
      return '🍎 Frutta';
    }
    
    // Cereali e legumi
    if (lowerIngredient.includes('avena') || lowerIngredient.includes('quinoa') ||
        lowerIngredient.includes('riso') || lowerIngredient.includes('pasta') ||
        lowerIngredient.includes('pane') || lowerIngredient.includes('lenticchie') ||
        lowerIngredient.includes('ceci') || lowerIngredient.includes('fagioli')) {
      return '🌾 Cereali e Legumi';
    }
    
    // Latticini e uova
    if (lowerIngredient.includes('uovo') || lowerIngredient.includes('yogurt') ||
        lowerIngredient.includes('ricotta') || lowerIngredient.includes('parmigiano') ||
        lowerIngredient.includes('mozzarella') || lowerIngredient.includes('cottage') ||
        lowerIngredient.includes('latte')) {
      return '🥛 Latticini e Uova';
    }
    
    // Grassi sani
    if (lowerIngredient.includes('olio') || lowerIngredient.includes('mandorle') ||
        lowerIngredient.includes('noci') || lowerIngredient.includes('semi') ||
        lowerIngredient.includes('chia') || lowerIngredient.includes('girasole')) {
      return '🥑 Grassi Sani';
    }
    
    // Integratori
    if (lowerIngredient.includes('proteine') || lowerIngredient.includes('creatina') ||
        lowerIngredient.includes('spirulina') || lowerIngredient.includes('whey')) {
      return '💊 Integratori';
    }
    
    // Condimenti e spezie
    if (lowerIngredient.includes('sale') || lowerIngredient.includes('pepe') ||
        lowerIngredient.includes('basilico') || lowerIngredient.includes('origano') ||
        lowerIngredient.includes('rosmarino') || lowerIngredient.includes('prezzemolo') ||
        lowerIngredient.includes('cannella') || lowerIngredient.includes('curcuma') ||
        lowerIngredient.includes('zenzero')) {
      return '🧄 Condimenti e Spezie';
    }
    
    return '🛒 Altri';
  }

  // METODI ESISTENTI MANTENUTI (per compatibilità)
  
  // Ottieni preferenze dietetiche utente
  private getUserDietPreferences(formData: any): string[] {
    const preferences: string[] = [];
    
    if (formData.stileAlimentare) {
      const stile = formData.stileAlimentare.toLowerCase();
      if (stile.includes('vegetariano')) preferences.push('vegetariana');
      if (stile.includes('vegano')) preferences.push('vegana');
      if (stile.includes('mediterraneo')) preferences.push('mediterranea');
      if (stile.includes('keto')) preferences.push('keto');
      if (stile.includes('paleo')) preferences.push('paleo');
    }
    
    if (formData.obiettivo === 'perdita-peso') {
      preferences.push('keto');
    }
    
    if (formData.allergie && formData.allergie.includes('glutine')) {
      preferences.push('senza_glutine');
    }
    
    return preferences;
  }

  // Ottieni allergie utente
  private getUserAllergies(formData: any): string[] {
    if (!formData.allergie) return [];
    
    const allergieMap: { [key: string]: string } = {
      'glutine': 'glutine',
      'lattosio': 'latte',
      'latte': 'latte',
      'uova': 'uova',
      'pesce': 'pesce',
      'frutti di mare': 'pesce',
      'frutta secca': 'frutta_secca',
      'nocciole': 'frutta_secca',
      'mandorle': 'frutta_secca',
      'soia': 'soia',
      'sesamo': 'sesamo'
    };
    
    return formData.allergie.map((allergy: string) => 
      allergieMap[allergy.toLowerCase()] || allergy
    ).filter(Boolean);
  }

  // Ottieni calorie massime per pasto
  private getMaxCaloriesForMeal(mealType: string, formData: any): number {
    const totalCalories = this.calculateTargetCalories(formData);
    
    const distribution = {
      colazione: 0.25,
      pranzo: 0.35,
      cena: 0.30,
      spuntino: 0.10
    };
    
    return Math.round(totalCalories * (distribution[mealType as keyof typeof distribution] || 0.1));
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
      tdee *= 0.85;
    } else if (formData.obiettivo === 'aumento-massa') {
      tdee *= 1.1;
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
      totalCalories += day.dayCalories;
      totalProtein += day.dayProtein;
      totalCarbs += day.dayCarbs;
      totalFat += day.dayFat;
    });

    return {
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat
    };
  }

  // Reset dello stato
  reset(): void {
    this.usedRecipes.clear();
    console.log('🔄 MealPlannerIntegration reset completed');
  }

  // 🎯 NUOVO: Ottieni statistiche FITNESS del piano
  getFitnessStats(plan: MealPlan): {
    fitnessScore: number;
    proteinAdequacy: 'low' | 'adequate' | 'high';
    calorieAccuracy: 'under' | 'on-target' | 'over';
    varietyScore: number;
    recommendations: string[];
  } {
    const analysis = this.getPlanNutritionalAnalysis(plan);
    const targetCalories = this.calculateTargetCalories(plan.userPreferences);
    
    const fitnessScore = plan.planFitnessScore?.averageScore || analysis.fitnessMetrics.overallScore;
    
    const proteinAdequacy = analysis.fitnessMetrics.proteinPerKg < 1.2 ? 'low' :
                           analysis.fitnessMetrics.proteinPerKg > 2.0 ? 'high' : 'adequate';
    
    const calorieAccuracy = analysis.dailyAverages.calories < targetCalories * 0.9 ? 'under' :
                           analysis.dailyAverages.calories > targetCalories * 1.1 ? 'over' : 'on-target';
    
    // Calcola varietà ricette
    const uniqueRecipes = new Set<string>();
    plan.days.forEach(day => {
      Object.values(day.meals).forEach(meal => {
        if (meal && meal.nome) {
          uniqueRecipes.add(meal.nome);
        }
      });
    });
    
    const totalMeals = plan.days.reduce((sum, day) => sum + Object.keys(day.meals).length, 0);
    const varietyScore = Math.round((uniqueRecipes.size / totalMeals) * 100);
    
    return {
      fitnessScore,
      proteinAdequacy,
      calorieAccuracy,
      varietyScore,
      recommendations: analysis.recommendations
    };
  }
}