import React from 'react';

interface MealPreviewProps {
  parsedPlan: any;
  handleReplacement: (mealType: string, dayNumber: string) => void;
  handleIngredientSubstitution: (ingredient: string, dayIndex: number, mealType: string, ingredientIndex: number) => void;
  isReplacing: string | null;
  confirmPlan: () => void;
  onGenerateNewPlan: () => void;
}

export default function MealPreview({
  parsedPlan,
  handleReplacement,
  handleIngredientSubstitution,
  isReplacing,
  confirmPlan,
  onGenerateNewPlan
}: MealPreviewProps) {
  const getMealTypeIcon = (mealType: string) => {
    const icons: { [key: string]: string } = {
      'colazione': '🌅',
      'pranzo': '🍽️',
      'cena': '🌙',
      'spuntino1': '🍎',
      'spuntino2': '🥨',
      'spuntino3': '🧃'
    };
    return icons[mealType] || '🍽️';
  };

  const getMealTypeName = (mealType: string) => {
    const names: { [key: string]: string } = {
      'colazione': 'Colazione',
      'pranzo': 'Pranzo',
      'cena': 'Cena',
      'spuntino1': 'Spuntino 1',
      'spuntino2': 'Spuntino 2',
      'spuntino3': 'Spuntino 3'
    };
    return names[mealType] || mealType.charAt(0).toUpperCase() + mealType.slice(1);
  };

  const calculateDayTotals = (day: any) => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    Object.values(day.meals || {}).forEach((meal: any) => {
      totalCalories += meal.calorie || 0;
      totalProtein += meal.proteine || 0;
      totalCarbs += meal.carboidrati || 0;
      totalFat += meal.grassi || 0;
    });

    return { totalCalories, totalProtein, totalCarbs, totalFat };
  };

  if (!parsedPlan || !parsedPlan.days) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-400">Errore nel caricamento del piano</p>
      </div>
    );
  }

  return (
    <section id="preview-section" className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{color: '#8FBC8F'}}>
          🎉 Il Tuo Piano è Pronto!
        </h2>
        <p className="text-lg text-gray-300 mb-6">
          Anteprima veloce del tuo piano personalizzato
        </p>
        <div className="bg-gray-800 rounded-xl p-4 inline-block">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-400">
                {parsedPlan.days?.length || 0}
              </div>
              <div className="text-sm text-gray-400">Giorni</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">
                {parsedPlan.days?.reduce((total: number, day: any) => {
                  return total + Object.keys(day.meals || {}).length;
                }, 0) || 0}
              </div>
              <div className="text-sm text-gray-400">Ricette</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">
                {Math.round(parsedPlan.days?.reduce((total: number, day: any) => {
                  const dayTotals = calculateDayTotals(day);
                  return total + dayTotals.totalCalories;
                }, 0) / (parsedPlan.days?.length || 1)) || 0}
              </div>
              <div className="text-sm text-gray-400">kcal/giorno</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-400">
                {Math.round(parsedPlan.days?.reduce((total: number, day: any) => {
                  const dayTotals = calculateDayTotals(day);
                  return total + dayTotals.totalProtein;
                }, 0) / (parsedPlan.days?.length || 1)) || 0}g
              </div>
              <div className="text-sm text-gray-400">proteine/giorno</div>
            </div>
          </div>
        </div>
      </div>

      {/* Days Grid */}
      <div className="space-y-8">
        {parsedPlan.days.map((day: any, dayIndex: number) => {
          const dayTotals = calculateDayTotals(day);
          
          return (
            <div key={dayIndex} className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
              {/* Day Header */}
              <div className="bg-gradient-to-r from-green-600 to-green-700 p-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl md:text-2xl font-bold text-white">
                    📅 {day.day}
                  </h3>
                  <div className="flex gap-4 text-white text-sm">
                    <span className="bg-white/20 px-3 py-1 rounded-full">
                      {Math.round(dayTotals.totalCalories)} kcal
                    </span>
                    <span className="bg-white/20 px-3 py-1 rounded-full">
                      {Math.round(dayTotals.totalProtein)}g proteine
                    </span>
                  </div>
                </div>
              </div>

              {/* Meals Grid */}
              <div className="p-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(day.meals || {}).map(([mealType, meal]: [string, any]) => (
                    <div key={mealType} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-650 transition-colors">
                      {/* Meal Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getMealTypeIcon(mealType)}</span>
                          <h4 className="font-semibold text-green-400">
                            {getMealTypeName(mealType)}
                          </h4>
                        </div>
                        {isReplacing === `${day.day}-${mealType}` && (
                          <div className="text-green-400 text-sm animate-pulse">
                            🔄 Sostituendo...
                          </div>
                        )}
                      </div>

                      {/* Meal Info */}
                      <div className="space-y-3">
                        <div>
                          <h5 className="font-bold text-white text-lg mb-1">
                            {meal.nome || 'Ricetta senza nome'}
                          </h5>
                          <div className="flex gap-3 text-sm text-gray-300">
                            <span className="bg-blue-600/20 px-2 py-1 rounded">
                              {meal.calorie || 0} kcal
                            </span>
                            <span className="bg-green-600/20 px-2 py-1 rounded">
                              P: {meal.proteine || 0}g
                            </span>
                            <span className="bg-orange-600/20 px-2 py-1 rounded">
                              C: {meal.carboidrati || 0}g
                            </span>
                            <span className="bg-purple-600/20 px-2 py-1 rounded">
                              F: {meal.grassi || 0}g
                            </span>
                          </div>
                        </div>

                        {/* Ingredienti */}
                        {meal.ingredienti && meal.ingredienti.length > 0 && (
                          <div>
                            <h6 className="text-sm font-medium text-gray-400 mb-2">
                              🥘 Ingredienti:
                            </h6>
                            <div className="space-y-1">
                              {meal.ingredienti.map((ingredient: string, ingredientIndex: number) => (
                                <div 
                                  key={ingredientIndex}
                                  className="flex items-center justify-between text-sm text-gray-300 hover:bg-gray-600 p-1 rounded transition-colors"
                                >
                                  <span>• {ingredient}</span>
                                  <button
                                    onClick={() => handleIngredientSubstitution(ingredient, dayIndex, mealType, ingredientIndex)}
                                    className="text-blue-400 hover:text-blue-300 text-xs px-2 py-1 hover:bg-blue-400/10 rounded transition-colors"
                                    title="Sostituisci ingrediente"
                                  >
                                    🔄
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => handleReplacement(mealType, day.day)}
                            disabled={isReplacing === `${day.day}-${mealType}`}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            {isReplacing === `${day.day}-${mealType}` ? '⏳' : '🔄'} Sostituisci Ricetta
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col md:flex-row gap-4 justify-center mt-12">
        <button
          onClick={confirmPlan}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all transform hover:scale-105 shadow-lg"
        >
          ✅ Conferma Piano Completo
        </button>
        
        <button
          onClick={onGenerateNewPlan}
          className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all shadow-lg"
        >
          🔄 Genera Nuovo Piano
        </button>
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-gradient-to-r from-blue-600/20 to-green-600/20 rounded-xl p-6 text-center">
        <h4 className="text-lg font-bold mb-2 text-green-400">
          🚀 Anteprima Veloce
        </h4>
        <p className="text-gray-300 text-sm md:text-base leading-relaxed">
          Questa è un'anteprima semplificata del tuo piano. 
          Dopo la conferma, avrai accesso alla <strong>dashboard completa</strong> con foto delle ricette, 
          preparazioni dettagliate, lista della spesa e molto altro!
        </p>
      </div>
    </section>
  );
}