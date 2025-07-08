// Types centrali per l'app Meal Prep Planner

export interface FormData {
  nome: string;
  eta: string;
  sesso: string;
  peso: string;
  altezza: string;
  attivita: string;
  obiettivo: string;
  allergie: string;
  preferenze: string;
  pasti: string;
  durata: string;
  varieta: string;
}

export interface Recipe {
  nome: string;
  calorie: number;
  proteine: number;
  carboidrati: number;
  grassi: number;
  ingredienti: string[];
  preparazione: string;
}

export interface DayMeals {
  colazione: Recipe;
  spuntino1?: Recipe;
  pranzo: Recipe;
  spuntino2?: Recipe;
  cena: Recipe;
  spuntino3?: Recipe;
}

export interface DayPlan {
  day: string;
  meals: DayMeals;
}

export interface ParsedPlan {
  days: DayPlan[];
}

export interface IngredientSubstitute {
  ingredient: string;
  reason: string;
  difficulty: 'Facile' | 'Medio' | 'Difficile';
  tasteChange: 'Minimo' | 'Moderato' | 'Significativo';
  cookingNotes?: string;
}

export interface SelectedIngredient {
  ingredient: string;
  dayIndex: number;
  mealType: string;
  ingredientIndex: number;
}

export interface ShoppingListItem {
  quantity: number;
  unit: string;
}

export interface ShoppingList {
  [key: string]: ShoppingListItem;
}

export type ApiStatus = 'checking' | 'connected' | 'error';

export type MealType = 'colazione' | 'spuntino1' | 'pranzo' | 'spuntino2' | 'cena' | 'spuntino3';