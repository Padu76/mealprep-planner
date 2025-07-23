import { ShoppingList, DayPlan } from '../types';

// 🔧 FIX CRITICO: Funzione sicura per ottenere valori nutrizionali
const getMealNutrition = (meal: any) => {
  if (!meal) {
    return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }

  return {
    calories: meal.calories || meal.calorie || 0,
    protein: meal.protein || meal.proteine || 0,
    carbs: meal.carbs || meal.carboidrati || 0,
    fat: meal.fat || meal.grassi || 0
  };
};

// Funzione per generare lista della spesa consolidata
export const generateShoppingList = (days: DayPlan[]): ShoppingList => {
  const ingredients: ShoppingList = {};
  
  days.forEach(day => {
    const meals = Object.values(day.meals);
    meals.forEach((meal: any) => {
      if (meal && meal.ingredienti && Array.isArray(meal.ingredienti)) {
        meal.ingredienti.forEach((ingredient: string) => {
          if (!ingredient || typeof ingredient !== 'string') {
            return; // Skip ingredienti non validi
          }
          
          const match = ingredient.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)\s+(.+)$/);
          if (match) {
            const [, qty, unit, name] = match;
            const key = `${name} (${unit})`;
            ingredients[key] = ingredients[key] || { quantity: 0, unit };
            ingredients[key].quantity += parseFloat(qty);
          } else {
            const key = ingredient;
            ingredients[key] = ingredients[key] || { quantity: 1, unit: 'pz' };
            ingredients[key].quantity += 1;
          }
        });
      }
    });
  });
  
  return ingredients;
};

// 🔧 FIX CRITICO: Funzione per calcolare calorie totali del piano CON CONTROLLI
export const calculateTotalCalories = (days: DayPlan[]): number => {
  if (!days || !Array.isArray(days)) {
    console.warn('⚠️ [WARNING] calculateTotalCalories: days is not a valid array');
    return 0;
  }

  return days.reduce((sum: number, day: any) => {
    if (!day || !day.meals) {
      console.warn('⚠️ [WARNING] calculateTotalCalories: day or day.meals is missing');
      return sum;
    }

    const dayTotal = Object.values(day.meals).reduce((daySum: number, meal: any) => {
      if (!meal) {
        console.warn('⚠️ [WARNING] calculateTotalCalories: meal is undefined');
        return daySum;
      }
      
      // 🔧 USA LA FUNZIONE SICURA getMealNutrition()
      const nutrition = getMealNutrition(meal);
      console.log(`🔍 [DEBUG] calculateTotalCalories: Adding ${nutrition.calories} calories from ${meal.nome || 'unnamed meal'}`);
      
      return daySum + nutrition.calories;
    }, 0);
    
    return sum + dayTotal;
  }, 0);
};

// 🔧 FIX AGGIUNTIVO: Funzione per calcolare calorie di un singolo giorno
export const calculateDayCalories = (day: any): number => {
  if (!day || !day.meals) {
    console.warn('⚠️ [WARNING] calculateDayCalories: day or day.meals is missing');
    return 0;
  }

  return Object.values(day.meals).reduce((daySum: number, meal: any) => {
    if (!meal) {
      console.warn('⚠️ [WARNING] calculateDayCalories: meal is undefined');
      return daySum;
    }
    
    const nutrition = getMealNutrition(meal);
    return daySum + nutrition.calories;
  }, 0);
};

// 🔧 FIX AGGIUNTIVO: Funzione per calcolare macro totali
export const calculateTotalMacros = (days: DayPlan[]): { 
  calories: number; 
  protein: number; 
  carbs: number; 
  fat: number; 
} => {
  if (!days || !Array.isArray(days)) {
    return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }

  return days.reduce((totals, day: any) => {
    if (!day || !day.meals) {
      return totals;
    }

    Object.values(day.meals).forEach((meal: any) => {
      if (meal) {
        const nutrition = getMealNutrition(meal);
        totals.calories += nutrition.calories;
        totals.protein += nutrition.protein;
        totals.carbs += nutrition.carbs;
        totals.fat += nutrition.fat;
      }
    });

    return totals;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
};

// Funzione per filtrare ingredienti per categoria
export const filterIngredientsByCategory = (
  shoppingList: ShoppingList, 
  keywords: string[]
): [string, { quantity: number; unit: string }][] => {
  return Object.entries(shoppingList)
    .filter(([name]) => {
      const nameLower = name.toLowerCase();
      return keywords.some(keyword => nameLower.includes(keyword));
    })
    .map(([name, data]) => [name, data]);
};