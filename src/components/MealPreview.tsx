import React from 'react';
import { Clock, Users, Flame } from 'lucide-react';

interface Meal {
  nome: string;
  calorie: number;
  proteine: number;
  carboidrati: number;
  grassi: number;
  tempo: string;
  porzioni: number;
  ingredienti: string[];
  preparazione: string;
}

interface DayMeals {
  colazione: Meal;
  spuntino1?: Meal;
  pranzo: Meal;
  spuntino2?: Meal;
  cena: Meal;
  spuntino3?: Meal;
}

interface MealPlan {
  [key: string]: DayMeals;
}

interface MealPreviewProps {
  mealPlan: MealPlan | null;
  isLoading: boolean;
}

const MealPreview: React.FC<MealPreviewProps> = ({ mealPlan, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Generazione piano in corso...</span>
        </div>
      </div>
    );
  }

  if (!mealPlan) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">📋 Anteprima Meal Prep</h2>
        <p className="text-gray-600">Compila il form sopra per generare il tuo piano personalizzato!</p>
      </div>
    );
  }

  const days = Object.keys(mealPlan);
  const firstDay = mealPlan[days[0]];

  // Funzione per determinare l'ordine e i nomi dei pasti
  const getMealOrder = (dayMeals: DayMeals) => {
    const meals = [];
    
    // Colazione sempre presente
    meals.push({ key: 'colazione', meal: dayMeals.colazione, emoji: '🌅', nome: 'COLAZIONE' });
    
    // Spuntino1 se presente
    if (dayMeals.spuntino1) {
      meals.push({ key: 'spuntino1', meal: dayMeals.spuntino1, emoji: '🍎', nome: 'SPUNTINO MATTINA' });
    }
    
    // Pranzo sempre presente
    meals.push({ key: 'pranzo', meal: dayMeals.pranzo, emoji: '☀️', nome: 'PRANZO' });
    
    // Spuntino2 se presente
    if (dayMeals.spuntino2) {
      meals.push({ key: 'spuntino2', meal: dayMeals.spuntino2, emoji: '🥤', nome: 'SPUNTINO POMERIGGIO' });
    }
    
    // Cena sempre presente
    meals.push({ key: 'cena', meal: dayMeals.cena, emoji: '🌙', nome: 'CENA' });
    
    // Spuntino3 se presente
    if (dayMeals.spuntino3) {
      meals.push({ key: 'spuntino3', meal: dayMeals.spuntino3, emoji: '🌆', nome: 'SPUNTINO SERA' });
    }
    
    return meals;
  };

  const orderedMeals = getMealOrder(firstDay);
  const totalCalories = orderedMeals.reduce((sum, { meal }) => sum + meal.calorie, 0);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">📋 Anteprima Meal Prep</h2>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>🔥 {totalCalories} kcal/giorno</span>
          <span>🍽️ {orderedMeals.length} pasti</span>
          <span>📅 {days.length} {days.length === 1 ? 'giorno' : 'giorni'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orderedMeals.map(({ key, meal, emoji, nome }) => (
          <div key={key} className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 border border-green-100">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{emoji}</span>
              <h3 className="font-semibold text-gray-800 text-sm">{nome}</h3>
            </div>
            
            <h4 className="font-bold text-gray-900 mb-2 text-sm leading-tight">{meal.nome}</h4>
            
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <Flame size={12} className="text-orange-500" />
                <span>{meal.calorie} kcal</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={12} className="text-blue-500" />
                <span>{meal.tempo}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users size={12} className="text-green-500" />
                <span>{meal.porzioni} {meal.porzioni === 1 ? 'porzione' : 'porzioni'}</span>
              </div>
              <div className="text-gray-500">
                <span>P: {meal.proteine}g</span>
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              <div className="mb-1">
                <strong>Ingredienti principali:</strong>
              </div>
              <div className="line-clamp-2">
                {meal.ingredienti.slice(0, 3).join(', ')}
                {meal.ingredienti.length > 3 && '...'}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 text-center">
          ✨ Questa è un'anteprima del primo giorno. Il piano completo include ricette dettagliate, 
          lista spesa e istruzioni per la preparazione!
        </p>
      </div>
    </div>
  );
};

export default MealPreview;