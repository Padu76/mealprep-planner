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
  private usedRecipes: Set<string> = new Set();

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
    console.log('🍽️ Generating meal plan with form data:', formData);
    
    const numDays = parseInt(formData.durata) || 7;
    const numPasti = parseInt(formData.pasti) || 3;
    const days: MealPlanDay[] = [];
    
    // Reset ricette usate per ogni piano
    this.usedRecipes.clear();

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
        day.meals.spuntino2 = this.selectRecipeForMeal('spuntino', formData, i);
      }
      if (numPasti >= 6) {
        day.meals.spuntino3 = this.selectRecipeForMeal('spuntino', formData, i);
      }

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
      userPreferences: formData
    };

    console.log('✅ Meal plan generated successfully:', mealPlan);
    return mealPlan;
  }

  // Seleziona ricetta appropriata per un pasto
  private selectRecipeForMeal(mealType: string, formData: any, dayIndex: number): Recipe | undefined {
    console.log(`🔍 Selecting recipe for ${mealType} on day ${dayIndex + 1}`);
    
    // Costruisci filtri basati su preferenze utente
    const filters = {
      categoria: mealType === 'spuntino' ? 'spuntino' : mealType as any,
      tipoDieta: this.getUserDietPreferences(formData),
      allergie: this.getUserAllergies(formData),
      maxCalorie: this.getMaxCaloriesForMeal(mealType, formData),
      maxTempo: this.getMaxTimeForMeal(mealType, formData)
    };

    console.log(`📋 Filters for ${mealType}:`, filters);

    // Cerca ricette che matchano i filtri
    let candidates = this.recipeDB.searchRecipes(filters);
    console.log(`🎯 Found ${candidates.length} candidates for ${mealType}`);

    // Filtra ricette già usate per evitare ripetizioni
    if (formData.evitaRipetizioni === 'si') {
      candidates = candidates.filter(recipe => !this.usedRecipes.has(recipe.id));
      console.log(`🔄 After filtering used recipes: ${candidates.length} candidates`);
    }

    // Se non ci sono candidati, rilassa i filtri
    if (candidates.length === 0) {
      console.log('⚠️ No candidates found, relaxing filters...');
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
      console.log(`✅ Selected recipe: ${selectedRecipe.nome} (${selectedRecipe.rating?.toFixed(1)} stars)`);
    } else {
      console.log('❌ No recipe selected');
    }

    return selectedRecipe;
  }

  // Ottieni preferenze dietetiche utente
  private getUserDietPreferences(formData: any): string[] {
    const preferences: string[] = [];
    
    // Analizza stile alimentare
    if (formData.stileAlimentare) {
      const stile = formData.stileAlimentare.toLowerCase();
      if (stile.includes('vegetariano')) preferences.push('vegetariana');
      if (stile.includes('vegano')) preferences.push('vegana');
      if (stile.includes('mediterraneo')) preferences.push('mediterranea');
      if (stile.includes('keto')) preferences.push('keto');
      if (stile.includes('paleo')) preferences.push('paleo');
    }
    
    // Analizza obiettivi
    if (formData.obiettivo === 'perdita-peso') {
      preferences.push('keto'); // Ricette keto per perdita peso
    }
    
    // Analizza allergie per diete speciali
    if (formData.allergie && formData.allergie.includes('glutine')) {
      preferences.push('senza_glutine');
    }
    
    console.log('🥗 Diet preferences:', preferences);
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
    
    const allergies = formData.allergie.map((allergy: string) => 
      allergieMap[allergy.toLowerCase()] || allergy
    ).filter(Boolean);
    
    console.log('⚠️ User allergies:', allergies);
    return allergies;
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
    
    const maxCalories = Math.round(totalCalories * (distribution[mealType as keyof typeof distribution] || 0.1));
    console.log(`🔥 Max calories for ${mealType}: ${maxCalories} (total: ${totalCalories})`);
    
    return maxCalories;
  }

  // Ottieni tempo massimo per pasto
  private getMaxTimeForMeal(mealType: string, formData: any): number {
    const tempoDisponibile = formData.tempoDisponibile || 'medio';
    
    const timeMap: { [key: string]: { [key: string]: number } } = {
      'poco': { colazione: 15, pranzo: 30, cena: 45, spuntino: 10 },
      'medio': { colazione: 25, pranzo: 45, cena: 60, spuntino: 15 },
      'molto': { colazione: 45, pranzo: 90, cena: 120, spuntino: 30 }
    };
    
    const maxTime = timeMap[tempoDisponibile]?.[mealType] || 60;
    console.log(`⏱️ Max time for ${mealType}: ${maxTime} minutes`);
    
    return maxTime;
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
      tdee *= 0.85; // Deficit calorico 15%
    } else if (formData.obiettivo === 'aumento-massa') {
      tdee *= 1.1; // Surplus calorico 10%
    }
    
    const targetCalories = Math.round(tdee);
    console.log(`🎯 Target calories: ${targetCalories} (BMR: ${Math.round(bmr)}, TDEE: ${Math.round(tdee)})`);
    
    return targetCalories;
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
    console.log(`🔄 Replacing recipe in plan: day ${dayIndex + 1}, meal ${mealType}`);
    
    const newPlan = { ...plan };
    newPlan.days = [...plan.days];
    newPlan.days[dayIndex] = { ...plan.days[dayIndex] };
    newPlan.days[dayIndex].meals = { ...plan.days[dayIndex].meals };

    if (newRecipeId) {
      // Ricetta specifica richiesta
      const newRecipe = this.recipeDB.getRecipeById(newRecipeId);
      if (newRecipe) {
        (newPlan.days[dayIndex].meals as any)[mealType] = newRecipe;
        console.log(`✅ Replaced with specific recipe: ${newRecipe.nome}`);
      }
    } else {
      // Rimuovi ricetta attuale dalle usate per permettere nuova selezione
      const currentRecipe = (plan.days[dayIndex].meals as any)[mealType];
      if (currentRecipe) {
        this.usedRecipes.delete(currentRecipe.id);
      }
      
      // Genera nuova ricetta automaticamente
      const newRecipe = this.selectRecipeForMeal(mealType, plan.userPreferences, dayIndex);
      if (newRecipe) {
        (newPlan.days[dayIndex].meals as any)[mealType] = newRecipe;
        console.log(`✅ Replaced with new recipe: ${newRecipe.nome}`);
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
      'Condimenti e Spezie': new Set(),
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

    // Converti Set in array e ordina
    const result: { [category: string]: string[] } = {};
    Object.keys(shoppingList).forEach(category => {
      result[category] = Array.from(shoppingList[category]).sort();
    });

    console.log('🛒 Shopping list generated:', result);
    return result;
  }

  // Categorizza ingrediente per lista spesa
  private categorizeIngredient(ingredient: string): string {
    const lowerIngredient = ingredient.toLowerCase();
    
    // Frutta e verdura
    if (lowerIngredient.includes('pomodor') || lowerIngredient.includes('insalata') || 
        lowerIngredient.includes('carota') || lowerIngredient.includes('cipolla') ||
        lowerIngredient.includes('aglio') || lowerIngredient.includes('basilico') ||
        lowerIngredient.includes('banana') || lowerIngredient.includes('limone') ||
        lowerIngredient.includes('mela') || lowerIngredient.includes('arancia') ||
        lowerIngredient.includes('spinaci') || lowerIngredient.includes('rucola') ||
        lowerIngredient.includes('zucchina') || lowerIngredient.includes('melanzana') ||
        lowerIngredient.includes('peperone') || lowerIngredient.includes('cetriolo') ||
        lowerIngredient.includes('prezzemolo') || lowerIngredient.includes('rosmarino')) {
      return 'Frutta e Verdura';
    }
    
    // Carne e pesce
    if (lowerIngredient.includes('pollo') || lowerIngredient.includes('manzo') ||
        lowerIngredient.includes('maiale') || lowerIngredient.includes('tacchino') ||
        lowerIngredient.includes('salmone') || lowerIngredient.includes('tonno') ||
        lowerIngredient.includes('pesce') || lowerIngredient.includes('gamberi') ||
        lowerIngredient.includes('uovo') || lowerIngredient.includes('prosciutto')) {
      return 'Carne e Pesce';
    }
    
    // Latticini
    if (lowerIngredient.includes('latte') || lowerIngredient.includes('yogurt') ||
        lowerIngredient.includes('formaggio') || lowerIngredient.includes('parmigiano') ||
        lowerIngredient.includes('mozzarella') || lowerIngredient.includes('ricotta') ||
        lowerIngredient.includes('burro') || lowerIngredient.includes('panna')) {
      return 'Latticini';
    }
    
    // Cereali e legumi
    if (lowerIngredient.includes('pasta') || lowerIngredient.includes('riso') ||
        lowerIngredient.includes('pane') || lowerIngredient.includes('avena') ||
        lowerIngredient.includes('quinoa') || lowerIngredient.includes('farro') ||
        lowerIngredient.includes('fagioli') || lowerIngredient.includes('lenticchie') ||
        lowerIngredient.includes('ceci') || lowerIngredient.includes('piselli')) {
      return 'Cereali e Legumi';
    }
    
    // Condimenti e spezie
    if (lowerIngredient.includes('olio') || lowerIngredient.includes('aceto') ||
        lowerIngredient.includes('sale') || lowerIngredient.includes('pepe') ||
        lowerIngredient.includes('origano') || lowerIngredient.includes('timo') ||
        lowerIngredient.includes('curry') || lowerIngredient.includes('paprika') ||
        lowerIngredient.includes('cannella') || lowerIngredient.includes('zenzero') ||
        lowerIngredient.includes('curcuma') || lowerIngredient.includes('senape') ||
        lowerIngredient.includes('miele') || lowerIngredient.includes('zucchero') ||
        lowerIngredient.includes('brodo') || lowerIngredient.includes('passata')) {
      return 'Condimenti e Spezie';
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
    topCategories: string[];
    topCuisines: string[];
  } {
    const totalDays = plan.days.length;
    const uniqueRecipeIds = new Set<string>();
    const categories = new Map<string, number>();
    const cuisines = new Map<string, number>();
    let totalRecipes = 0;
    let dietCompliantMeals = 0;

    plan.days.forEach(day => {
      Object.values(day.meals).forEach(meal => {
        if (meal) {
          totalRecipes++;
          uniqueRecipeIds.add(meal.id);
          
          // Conta categorie
          const category = meal.categoria || 'unknown';
          categories.set(category, (categories.get(category) || 0) + 1);
          
          // Conta cucine
          const cuisine = meal.tipoCucina || 'unknown';
          cuisines.set(cuisine, (cuisines.get(cuisine) || 0) + 1);
          
          // Controlla compliance dieta
          if (this.checkDietCompliance(meal, plan.userPreferences)) {
            dietCompliantMeals++;
          }
        }
      });
    });

    // Top 3 categorie e cucine
    const topCategories = Array.from(categories.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);
      
    const topCuisines = Array.from(cuisines.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cuisine]) => cuisine);

    return {
      avgCaloriesPerDay: Math.round(plan.totalCalories / totalDays),
      avgProteinPerDay: Math.round(plan.totalProtein / totalDays),
      avgCarbsPerDay: Math.round(plan.totalCarbs / totalDays),
      avgFatPerDay: Math.round(plan.totalFat / totalDays),
      totalRecipes,
      uniqueRecipes: uniqueRecipeIds.size,
      dietCompliance: Math.round((dietCompliantMeals / totalRecipes) * 100),
      topCategories,
      topCuisines
    };
  }

  // Controlla se una ricetta è conforme alla dieta dell'utente
  private checkDietCompliance(meal: Recipe, userPreferences: any): boolean {
    const userDiets = this.getUserDietPreferences(userPreferences);
    const userAllergies = this.getUserAllergies(userPreferences);
    
    // Controlla allergie
    if (userAllergies.some(allergy => meal.allergie.includes(allergy))) {
      return false;
    }
    
    // Controlla diete
    if (userDiets.length > 0) {
      return userDiets.some(diet => meal.tipoDieta.includes(diet as any));
    }
    
    return true;
  }

  // Ottieni ricette alternative per un pasto specifico
  getAlternativeRecipes(mealType: string, formData: any, excludeIds: string[] = []): Recipe[] {
    const filters = {
      categoria: mealType === 'spuntino' ? 'spuntino' : mealType as any,
      tipoDieta: this.getUserDietPreferences(formData),
      allergie: this.getUserAllergies(formData),
      maxCalorie: this.getMaxCaloriesForMeal(mealType, formData),
      maxTempo: this.getMaxTimeForMeal(mealType, formData)
    };

    let alternatives = this.recipeDB.searchRecipes(filters);
    
    // Escludi ricette specificate
    alternatives = alternatives.filter(recipe => !excludeIds.includes(recipe.id));
    
    // Ordina per rating
    alternatives.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    
    return alternatives.slice(0, 5); // Primi 5 alternative
  }

  // Analizza compatibilità nutrizionale del piano
  analyzeNutritionalBalance(plan: MealPlan): {
    calorieBalance: 'low' | 'optimal' | 'high';
    proteinBalance: 'low' | 'optimal' | 'high';
    carbBalance: 'low' | 'optimal' | 'high';
    fatBalance: 'low' | 'optimal' | 'high';
    recommendations: string[];
  } {
    const stats = this.getPlanStats(plan);
    const targetCalories = this.calculateTargetCalories(plan.userPreferences);
    
    const recommendations: string[] = [];
    
    // Analizza calorie
    const calorieRatio = stats.avgCaloriesPerDay / targetCalories;
    let calorieBalance: 'low' | 'optimal' | 'high' = 'optimal';
    
    if (calorieRatio < 0.9) {
      calorieBalance = 'low';
      recommendations.push('Considera l\'aggiunta di spuntini nutrienti per aumentare l\'apporto calorico');
    } else if (calorieRatio > 1.1) {
      calorieBalance = 'high';
      recommendations.push('Riduci le porzioni o scegli ricette meno caloriche');
    }
    
    // Analizza proteine (target: 1.6g per kg peso corporeo)
    const targetProtein = parseInt(plan.userPreferences.peso) * 1.6;
    const proteinRatio = stats.avgProteinPerDay / targetProtein;
    let proteinBalance: 'low' | 'optimal' | 'high' = 'optimal';
    
    if (proteinRatio < 0.8) {
      proteinBalance = 'low';
      recommendations.push('Aumenta l\'apporto proteico con carni magre, pesce o legumi');
    } else if (proteinRatio > 1.5) {
      proteinBalance = 'high';
      recommendations.push('L\'apporto proteico è elevato, considera di bilanciare con più carboidrati');
    }
    
    // Analizza carboidrati (target: 45-65% delle calorie)
    const carbCalories = stats.avgCarbsPerDay * 4;
    const carbPercentage = (carbCalories / stats.avgCaloriesPerDay) * 100;
    let carbBalance: 'low' | 'optimal' | 'high' = 'optimal';
    
    if (carbPercentage < 40) {
      carbBalance = 'low';
      recommendations.push('Aumenta l\'apporto di carboidrati con cereali integrali e frutta');
    } else if (carbPercentage > 70) {
      carbBalance = 'high';
      recommendations.push('Riduci i carboidrati e bilancia con più proteine e grassi sani');
    }
    
    // Analizza grassi (target: 20-35% delle calorie)
    const fatCalories = stats.avgFatPerDay * 9;
    const fatPercentage = (fatCalories / stats.avgCaloriesPerDay) * 100;
    let fatBalance: 'low' | 'optimal' | 'high' = 'optimal';
    
    if (fatPercentage < 15) {
      fatBalance = 'low';
      recommendations.push('Aggiungi grassi sani come olio d\'oliva, avocado e frutta secca');
    } else if (fatPercentage > 40) {
      fatBalance = 'high';
      recommendations.push('Riduci i grassi scegliendo cotture più leggere e carni magre');
    }

    return {
      calorieBalance,
      proteinBalance,
      carbBalance,
      fatBalance,
      recommendations
    };
  }

  // Esporta piano in formato JSON
  exportPlan(plan: MealPlan): string {
    const exportData = {
      ...plan,
      exportDate: new Date().toISOString(),
      stats: this.getPlanStats(plan),
      nutritionalAnalysis: this.analyzeNutritionalBalance(plan),
      shoppingList: this.generateShoppingList(plan)
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  // Importa piano da JSON
  importPlan(jsonData: string): MealPlan | null {
    try {
      const data = JSON.parse(jsonData);
      
      // Valida struttura del piano
      if (!data.days || !Array.isArray(data.days)) {
        throw new Error('Invalid plan structure');
      }
      
      return {
        days: data.days,
        totalCalories: data.totalCalories || 0,
        totalProtein: data.totalProtein || 0,
        totalCarbs: data.totalCarbs || 0,
        totalFat: data.totalFat || 0,
        userPreferences: data.userPreferences || {}
      };
    } catch (error) {
      console.error('Error importing plan:', error);
      return null;
    }
  }

  // Ottieni suggerimenti per migliorare il piano
  getSuggestions(plan: MealPlan): string[] {
    const suggestions: string[] = [];
    const stats = this.getPlanStats(plan);
    const analysis = this.analyzeNutritionalBalance(plan);
    
    // Suggerimenti basati su varietà
    if (stats.uniqueRecipes < stats.totalRecipes * 0.7) {
      suggestions.push('🔄 Considera più varietà nelle ricette per evitare la monotonia alimentare');
    }
    
    // Suggerimenti nutrizionali
    suggestions.push(...analysis.recommendations);
    
    // Suggerimenti stagionali
    const currentMonth = new Date().getMonth();
    if (currentMonth >= 5 && currentMonth <= 7) { // Estate
      suggestions.push('🌞 Approfitta della stagione estiva con più ricette fresche e insalate');
    } else if (currentMonth >= 8 && currentMonth <= 10) { // Autunno
      suggestions.push('🍂 Utilizza ingredienti autunnali come zucca, funghi e castagne');
    } else if (currentMonth >= 11 || currentMonth <= 1) { // Inverno
      suggestions.push('❄️ Prediligi zuppe e piatti caldi per la stagione invernale');
    } else { // Primavera
      suggestions.push('🌱 Sfrutta i prodotti primaverili freschi come asparagi e piselli');
    }
    
    // Suggerimenti di compliance dieta
    if (stats.dietCompliance < 90) {
      suggestions.push('⚠️ Alcune ricette potrebbero non essere completamente conformi alle tue preferenze dietetiche');
    }
    
    return suggestions;
  }

  // Reset dello stato (per testing o nuovi piani)
  reset(): void {
    this.usedRecipes.clear();
    console.log('🔄 MealPlannerIntegration reset completed');
  }
}