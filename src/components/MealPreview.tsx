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

interface ParsedPlan {
  days: Array<{
    day: string;
    meals: DayMeals;
  }>;
}

interface MealPreviewProps {
  parsedPlan: ParsedPlan;
  handleReplacement: (mealType: string, dayNumber: string) => void;
  handleIngredientSubstitution: (ingredient: string, dayIndex: number, mealType: string, ingredientIndex: number) => void;
  isReplacing: string | null;
  confirmPlan: () => void;
  onGenerateNewPlan: () => void;
}

const MealPreview: React.FC<MealPreviewProps> = ({ 
  parsedPlan, 
  handleReplacement, 
  handleIngredientSubstitution, 
  isReplacing, 
  confirmPlan, 
  onGenerateNewPlan 
}) => {
  if (!parsedPlan || !parsedPlan.days || parsedPlan.days.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl shadow-lg p-6 mt-8">
        <h2 className="text-2xl font-bold text-white mb-4">📋 Anteprima Meal Prep</h2>
        <p className="text-gray-300">Compila il form sopra per generare il tuo piano personalizzato!</p>
      </div>
    );
  }

  const firstDay = parsedPlan.days[0].meals;

  // Funzione per determinare l'ordine e i nomi dei pasti
  const getMealOrder = (dayMeals: DayMeals) => {
    const meals = [];
    
    meals.push({ key: 'colazione', meal: dayMeals.colazione, emoji: '🌅', nome: 'COLAZIONE' });
    
    if (dayMeals.spuntino1) {
      meals.push({ key: 'spuntino1', meal: dayMeals.spuntino1, emoji: '🍎', nome: 'SPUNTINO MATTINA' });
    }
    
    meals.push({ key: 'pranzo', meal: dayMeals.pranzo, emoji: '☀️', nome: 'PRANZO' });
    
    if (dayMeals.spuntino2) {
      meals.push({ key: 'spuntino2', meal: dayMeals.spuntino2, emoji: '🥤', nome: 'SPUNTINO POMERIGGIO' });
    }
    
    meals.push({ key: 'cena', meal: dayMeals.cena, emoji: '🌙', nome: 'CENA' });
    
    if (dayMeals.spuntino3) {
      meals.push({ key: 'spuntino3', meal: dayMeals.spuntino3, emoji: '🌆', nome: 'SPUNTINO SERA' });
    }
    
    return meals;
  };

  const orderedMeals = getMealOrder(firstDay);
  const totalCalories = orderedMeals.reduce((sum, { meal }) => sum + meal.calorie, 0);

  return (
    <section id="preview-section" className="max-w-4xl mx-auto px-4 py-20">
      <div className="bg-gray-800 rounded-xl shadow-2xl p-8">
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-4 text-center" style={{color: '#8FBC8F'}}>
            📋 Anteprima Piano Alimentare
          </h2>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-300">
            <span>🔥 {totalCalories} kcal/giorno</span>
            <span>🍽️ {orderedMeals.length} pasti</span>
            <span>📅 {parsedPlan.days.length} {parsedPlan.days.length === 1 ? 'giorno' : 'giorni'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {orderedMeals.map(({ key, meal, emoji, nome }) => (
            <div key={key} className="bg-gray-700 rounded-xl p-6 hover:bg-gray-600 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{emoji}</span>
                  <h3 className="font-bold text-white text-lg">{nome}</h3>
                </div>
                <button
                  onClick={() => handleReplacement(key, "Giorno 1")}
                  disabled={isReplacing === `Giorno 1-${key}`}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                >
                  {isReplacing === `Giorno 1-${key}` ? '⏳' : '🔄'}
                </button>
              </div>
              
              <h4 className="font-bold text-green-400 mb-3 text-lg leading-tight">{meal.nome}</h4>
              
              <div className="grid grid-cols-2 gap-3 text-sm text-gray-300 mb-4">
                <div className="flex items-center gap-2">
                  <Flame size={16} className="text-orange-500" />
                  <span>{meal.calorie} kcal</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-blue-400" />
                  <span>{meal.tempo}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-green-400" />
                  <span>{meal.porzioni} porz.</span>
                </div>
                <div className="text-gray-300">
                  <span>P: {meal.proteine}g | C: {meal.carboidrati}g | G: {meal.grassi}g</span>
                </div>
              </div>
              
              <div className="text-sm text-gray-300">
                <div className="mb-2">
                  <strong className="text-white">🛒 Ingredienti:</strong>
                </div>
                <div className="space-y-1">
                  {meal.ingredienti.slice(0, 4).map((ingrediente, index) => (
                    <div 
                      key={index}
                      className="hover:bg-gray-600 px-2 py-1 rounded cursor-pointer flex items-center justify-between group"
                      onClick={() => handleIngredientSubstitution(ingrediente, 0, key, index)}
                    >
                      <span>• {ingrediente}</span>
                      <span className="opacity-0 group-hover:opacity-100 text-xs bg-blue-600 px-2 py-1 rounded">
                        🔀 Sostituisci
                      </span>
                    </div>
                  ))}
                  {meal.ingredienti.length > 4 && (
                    <div className="text-gray-400 text-xs">
                      ...e altri {meal.ingredienti.length - 4} ingredienti
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={confirmPlan}
            className="px-8 py-4 rounded-full text-lg font-semibold transition-all transform hover:scale-105"
            style={{backgroundColor: '#8FBC8F', color: 'black'}}
          >
            ✅ Conferma Piano
          </button>
          
          <button
            onClick={onGenerateNewPlan}
            className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all transform hover:scale-105"
          >
            🔄 Genera Nuovo Piano
          </button>
        </div>

        <div className="mt-8 p-6 bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-300 text-center">
            ✨ <strong>Anteprima del primo giorno.</strong> Clicca <span className="text-blue-400">"🔄 Sostituisci"</span> per cambiare pasti interi 
            o <span className="text-blue-400">"🔀 Sostituisci"</span> per ingredienti singoli con AI!
          </p>
        </div>
      </div>
    </section>
  );
};

export default MealPreview;