import { ShoppingList, DayPlan } from '../types';

// Funzione per generare lista della spesa consolidata
export const generateShoppingList = (days: DayPlan[]): ShoppingList => {
  const ingredients: ShoppingList = {};
  
  days.forEach(day => {
    const meals = Object.values(day.meals);
    meals.forEach((meal: any) => {
      if (meal.ingredienti && Array.isArray(meal.ingredienti)) {
        meal.ingredienti.forEach((ingredient: string) => {
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

// Funzione per calcolare calorie totali del piano
export const calculateTotalCalories = (days: DayPlan[]): number => {
  return days.reduce((sum: number, day: any) => {
    const dayTotal = Object.values(day.meals).reduce((daySum: number, meal: any) => daySum + meal.calorie, 0);
    return sum + dayTotal;
  }, 0);
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