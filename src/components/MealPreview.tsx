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

  // 🔧 FIX CRITICO: Funzione con controlli di sicurezza
  const calculateDayTotals = (day: any) => {
    console.log('🔍 [DEBUG] Calculating day totals for:', day);
    
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    // Controlla se day e day.meals esistono
    if (!day || !day.meals) {
      console.warn('⚠️ [WARNING] Day or day.meals is missing:', day);
      return { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 };
    }

    // Itera sui pasti con controlli di sicurezza
    Object.entries(day.meals).forEach(([mealType, meal]: [string, any]) => {
      console.log(`🔍 [DEBUG] Processing meal ${mealType}:`, meal);
      
      // CONTROLLO CRITICO: Verifica che meal non sia undefined/null
      if (!meal) {
        console.warn(`⚠️ [WARNING] Meal ${mealType} is undefined/null`);
        return; // Skip questo pasto
      }

      // Usa la funzione sicura per ottenere i valori nutrizionali
      const nutrition = getMealNutrition(meal);
      
      console.log(`✅ [DEBUG] Meal ${mealType} values: cal=${nutrition.calories}, prot=${nutrition.protein}, carb=${nutrition.carbs}, fat=${nutrition.fat}`);

      totalCalories += nutrition.calories;
      totalProtein += nutrition.protein;
      totalCarbs += nutrition.carbs;
      totalFat += nutrition.fat;
    });

    const result = { totalCalories, totalProtein, totalCarbs, totalFat };
    console.log('📊 [DEBUG] Day totals calculated:', result);
    return result;
  };

  // 🔧 VALIDAZIONE SICURA DEL PIANO
  if (!parsedPlan) {
    console.error('❌ [ERROR] parsedPlan is undefined');
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <div className="bg-red-900 bg-opacity-30 border border-red-600 rounded-lg p-6">
          <h3 className="text-red-400 text-xl font-bold mb-2">❌ Errore Piano</h3>
          <p className="text-gray-400">Il piano alimentare non è stato caricato correttamente</p>
          <button 
            onClick={onGenerateNewPlan}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            🔄 Genera Nuovo Piano
          </button>
        </div>
      </div>
    );
  }

  if (!parsedPlan.days || !Array.isArray(parsedPlan.days) || parsedPlan.days.length === 0) {
    console.error('❌ [ERROR] parsedPlan.days is invalid:', parsedPlan.days);
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <div className="bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded-lg p-6">
          <h3 className="text-yellow-400 text-xl font-bold mb-2">⚠️ Piano Vuoto</h3>
          <p className="text-gray-400">Non sono stati trovati giorni nel piano alimentare</p>
          <button 
            onClick={onGenerateNewPlan}
            className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            🔄 Genera Nuovo Piano
          </button>
        </div>
      </div>
    );
  }

  console.log('✅ [SUCCESS] parsedPlan validation passed. Days:', parsedPlan.days.length);

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
                  if (!day || !day.meals) return total;
                  return total + Object.keys(day.meals).length;
                }, 0) || 0}
              </div>
              <div className="text-sm text-gray-400">Ricette</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">
                {(() => {
                  try {
                    const totalCalories = parsedPlan.days?.reduce((total: number, day: any) => {
                      const dayTotals = calculateDayTotals(day);
                      return total + dayTotals.totalCalories;
                    }, 0) || 0;
                    const avgCalories = Math.round(totalCalories / (parsedPlan.days?.length || 1));
                    return avgCalories;
                  } catch (error) {
                    console.error('❌ [ERROR] Failed to calculate average calories:', error);
                    return 0;
                  }
                })()}
              </div>
              <div className="text-sm text-gray-400">kcal/giorno</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-400">
                {(() => {
                  try {
                    const totalProtein = parsedPlan.days?.reduce((total: number, day: any) => {
                      const dayTotals = calculateDayTotals(day);
                      return total + dayTotals.totalProtein;
                    }, 0) || 0;
                    const avgProtein = Math.round(totalProtein / (parsedPlan.days?.length || 1));
                    return avgProtein;
                  } catch (error) {
                    console.error('❌ [ERROR] Failed to calculate average protein:', error);
                    return 0;
                  }
                })()}g
              </div>
              <div className="text-sm text-gray-400">proteine/giorno</div>
            </div>
          </div>
        </div>
      </div>

      {/* Days Grid */}
      <div className="space-y-8">
        {parsedPlan.days.map((day: any, dayIndex: number) => {
          // Calcola totali del giorno con gestione errori
          let dayTotals;
          try {
            dayTotals = calculateDayTotals(day);
          } catch (error) {
            console.error(`❌ [ERROR] Failed to calculate totals for day ${dayIndex}:`, error);
            dayTotals = { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 };
          }
          
          return (
            <div key={dayIndex} className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
              {/* Day Header */}
              <div className="bg-gradient-to-r from-green-600 to-green-700 p-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl md:text-2xl font-bold text-white">
                    📅 {day.day || `Giorno ${dayIndex + 1}`}
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
                {!day.meals || Object.keys(day.meals).length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-lg mb-4">⚠️ Nessun pasto trovato per questo giorno</div>
                    <button 
                      onClick={onGenerateNewPlan}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      🔄 Rigenera Piano
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(day.meals).map(([mealType, meal]: [string, any]) => {
                      // Controllo sicurezza per ogni pasto
                      if (!meal) {
                        console.warn(`⚠️ [WARNING] Meal ${mealType} is undefined for day ${dayIndex}`);
                        return (
                          <div key={mealType} className="bg-red-900 bg-opacity-30 border border-red-600 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xl">{getMealTypeIcon(mealType)}</span>
                              <h4 className="font-semibold text-red-400">
                                {getMealTypeName(mealType)}
                              </h4>
                            </div>
                            <div className="text-red-300 text-sm">❌ Ricetta non trovata</div>
                            <button
                              onClick={() => handleReplacement(mealType, day.day)}
                              className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                            >
                              🔄 Sostituisci
                            </button>
                          </div>
                        );
                      }

                      // Ottieni i valori nutrizionali in modo sicuro
                      const nutrition = getMealNutrition(meal);

                      return (
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
                                  {nutrition.calories} kcal
                                </span>
                                <span className="bg-green-600/20 px-2 py-1 rounded">
                                  P: {nutrition.protein}g
                                </span>
                                <span className="bg-orange-600/20 px-2 py-1 rounded">
                                  C: {nutrition.carbs}g
                                </span>
                                <span className="bg-purple-600/20 px-2 py-1 rounded">
                                  F: {nutrition.fat}g
                                </span>
                              </div>
                            </div>

                            {/* Ingredienti */}
                            {meal.ingredienti && Array.isArray(meal.ingredienti) && meal.ingredienti.length > 0 && (
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
                      );
                    })}
                  </div>
                )}
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

      {/* Debug Info (solo in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 bg-gray-900 border border-gray-600 rounded-lg p-4">
          <h4 className="text-white font-bold mb-2">🐛 Debug Info</h4>
          <div className="text-xs text-gray-400 space-y-1">
            <div>Plan Days: {parsedPlan.days?.length || 0}</div>
            <div>Console: Apri DevTools per log dettagliati</div>
            <button 
              onClick={() => {
                console.log('🔍 [DEBUG] Full parsedPlan:', parsedPlan);
                console.log('🔍 [DEBUG] Individual days:', parsedPlan.days);
                alert('Debug info logged to console');
              }}
              className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-xs"
            >
              Log Full Data
            </button>
          </div>
        </div>
      )}
    </section>
  );
}