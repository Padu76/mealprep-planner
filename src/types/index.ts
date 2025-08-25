// Types centrali per l'app Meal Prep Planner

export interface FormData {
  // Dati personali
  nome: string;
  email: string;
  telefono?: string;
  eta: string;
  sesso: string;
  peso: string;
  altezza: string;
  
  // Modalità e attività
  modalita?: 'guidata' | 'esperto';
  attivita: string;
  
  // Obiettivi
  obiettivo: string;
  durata: string;
  pasti: string;
  varieta: string;
  
  // NUOVO: Allergie e preferenze come array
  allergie: string[];
  preferenze: string[];
  
  // Modalità esperto - campi macro manuali
  calorie_totali?: string;
  proteine_totali?: string;
  carboidrati_totali?: string;
  grassi_totali?: string;
  distribuzione_personalizzata?: any;
}

export interface Recipe {
  nome: string;
  calorie: number;
  proteine: number;
  carboidrati: number;
  grassi: number;
  ingredienti: string[];
  preparazione: string;
  tempo?: string;
  porzioni?: string;
  fitnessScore?: number;
  macroTarget?: string;
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

// ===== NUOVI TYPES PER DATABASE SUPABASE =====

export interface User {
  id: string;
  nome: string;
  email: string;
  telefono?: string;
  created_at: string;
  updated_at: string;
}

export interface MealPlan {
  id: string;
  user_id: string;
  nome_utente: string;
  email_utente: string;
  telefono_utente?: string;
  
  // Dati fisici
  eta: number;
  sesso: string;
  peso: number;
  altezza: number;
  
  // Modalità e parametri
  modalita: 'guidata' | 'esperto';
  attivita: string;
  obiettivo: string;
  durata: number;
  pasti: number;
  varieta: string;
  
  // Allergie e preferenze (NUOVO)
  allergie: string[];
  preferenze: string[];
  
  // Dati nutrizionali calcolati
  bmr: number;
  tdee: number;
  calorie_target: number;
  distribuzione_pasti: Record<string, number>;
  
  // Piano generato
  piano_completo: string;
  piano_json?: ParsedPlan;
  
  // Modalità esperto
  calorie_manuali?: number;
  proteine_manuali?: number;
  carboidrati_manuali?: number;
  grassi_manuali?: number;
  
  // Metadata
  generato_con_ai: boolean;
  fitness_optimized: boolean;
  total_recipes?: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Status
  status: 'generato' | 'inviato' | 'completato';
}

export interface NutritionalCalculation {
  bmr: number;
  tdee: number;
  dailyCalories: number;
  mealCalories: Record<string, number>;
  numDays: number;
  numMeals: number;
  isSafe: boolean;
  goal: string;
  activity: string;
  debugInfo: {
    input: NormalizedFormData;
    bmrFormula: string;
    activityFactor: number;
    goalFactor: number;
    finalMultiplier: number;
    expectedAndrea?: number;
  };
}

export interface NormalizedFormData {
  age: number;
  weight: number;
  height: number;
  gender: string;
  activity: string;
  goal: string;
  numDays: number;
  numMeals: number;
  allergie: string[];
  preferenze: string[];
  modalita: 'guidata' | 'esperto';
  calorie_totali?: number;
  proteine_totali?: number;
  carboidrati_totali?: number;
  grassi_totali?: number;
}

// Database operation types
export interface DatabaseError {
  message: string;
  details?: any;
}

export interface DatabaseResponse<T> {
  data: T | null;
  error: DatabaseError | null;
}

// API Response types
export interface GenerateMealPlanResponse {
  success: boolean;
  piano?: string;
  message?: string;
  error?: string;
  meal_plan_id?: string;
  metadata?: {
    bmr: number;
    tdee: number;
    dailyTarget: number;
    mealDistribution: Record<string, number>;
    isCalorieSafe: boolean;
    aiGenerated: boolean;
    fitnessOptimized: boolean;
    totalRecipes?: number;
    debugInfo?: any;
  };
}

// Form validation types
export interface FormValidation {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

export interface MacroValidation {
  protPercent: number;
  carbPercent: number;
  grassPercent: number;
  totalKcal: number;
  isCaloriesMatch: boolean;
  isOptimal: boolean;
}