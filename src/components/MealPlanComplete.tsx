import React, { useState } from 'react';
import { Clock, Users, Flame, ShoppingCart, ChefHat, Calendar, Download, Share2 } from 'lucide-react';

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
  imageUrl?: string;
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

interface FormData {
  nome: string;
  eta: string;
  sesso: string;
  peso: string;
  altezza: string;
  attivita: string;
  obiettivo: string;
  allergie: string[];
  preferenze: string[];
  pasti: string;
  durata: string;
  varieta: string;
}

interface MealPlanCompleteProps {
  parsedPlan: ParsedPlan;
  formData: FormData;
  generatedPlan: string;
  handleReplacement: (mealType: string, dayNumber: string) => void;
  handleIngredientSubstitution: (ingredient: string, dayIndex: number, mealType: string, ingredientIndex: number) => void;
  isReplacing: string | null;
  onGenerateNewPlan: () => void;
}

const MealPlanComplete: React.FC<MealPlanCompleteProps> = ({
  parsedPlan,
  formData,
  generatedPlan,
  handleReplacement,
  handleIngredientSubstitution,
  isReplacing,
  onGenerateNewPlan
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'recipes' | 'shopping'>('overview');
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);

  // 🔧 FIX CRITICO: Funzione per ottenere tutti i pasti in ordine CON CONTROLLI
  const getAllMealsInOrder = (dayMeals: DayMeals) => {
    console.log('🔍 [DEBUG] getAllMealsInOrder called with:', dayMeals);
    
    if (!dayMeals) {
      console.error('❌ [ERROR] dayMeals is undefined');
      return [];
    }

    const meals = [];
    
    // Controllo esistenza di ogni pasto prima di aggiungerlo
    if (dayMeals.colazione) {
      meals.push({ key: 'colazione', meal: dayMeals.colazione, emoji: '🌅', nome: 'COLAZIONE' });
    } else {
      console.warn('⚠️ [WARNING] colazione is missing');
    }
    
    if (dayMeals.spuntino1) {
      meals.push({ key: 'spuntino1', meal: dayMeals.spuntino1, emoji: '🍎', nome: 'SPUNTINO MATTINA' });
    }
    
    if (dayMeals.pranzo) {
      meals.push({ key: 'pranzo', meal: dayMeals.pranzo, emoji: '☀️', nome: 'PRANZO' });
    } else {
      console.warn('⚠️ [WARNING] pranzo is missing');
    }
    
    if (dayMeals.spuntino2) {
      meals.push({ key: 'spuntino2', meal: dayMeals.spuntino2, emoji: '🥤', nome: 'SPUNTINO POMERIGGIO' });
    }
    
    if (dayMeals.cena) {
      meals.push({ key: 'cena', meal: dayMeals.cena, emoji: '🌙', nome: 'CENA' });
    } else {
      console.warn('⚠️ [WARNING] cena is missing');
    }
    
    if (dayMeals.spuntino3) {
      meals.push({ key: 'spuntino3', meal: dayMeals.spuntino3, emoji: '🌆', nome: 'SPUNTINO SERA' });
    }
    
    console.log(`✅ [SUCCESS] Found ${meals.length} valid meals`);
    return meals;
  };

  // 🔧 FIX CRITICO: Validazione completa del piano
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

  // 🔧 FIX CRITICO: Calcola statistiche con controlli di sicurezza
  let firstDay, orderedMeals, totalCaloriesPerDay, totalCaloriesPlan;
  
  try {
    firstDay = parsedPlan.days[0]?.meals;
    if (!firstDay) {
      throw new Error('First day meals not found');
    }
    
    orderedMeals = getAllMealsInOrder(firstDay);
    if (orderedMeals.length === 0) {
      throw new Error('No valid meals found');
    }
    
    // ERRORE ERA QUI: meal poteva essere undefined nel reduce!
    totalCaloriesPerDay = orderedMeals.reduce((sum, { meal }) => {
      if (!meal) {
        console.warn('⚠️ [WARNING] Meal is undefined in reduce');
        return sum;
      }
      const calories = meal.calorie || 0;
      console.log(`🔍 [DEBUG] Adding ${calories} calories from ${meal.nome}`);
      return sum + calories;
    }, 0);
    
    totalCaloriesPlan = totalCaloriesPerDay * parsedPlan.days.length;
    
    console.log(`✅ [SUCCESS] Stats calculated: ${totalCaloriesPerDay} cal/day, ${totalCaloriesPlan} total`);
    
  } catch (error) {
    console.error('❌ [ERROR] Failed to calculate plan stats:', error);
    
    // Fallback sicuro
    firstDay = {};
    orderedMeals = [];
    totalCaloriesPerDay = 0;
    totalCaloriesPlan = 0;
  }

  // Genera immagine per ricetta usando Unsplash
  const generateRecipeImage = (recipeName: string): string => {
    const cleanName = recipeName.toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
    
    // Mappa ricette a query Unsplash specifiche
    const imageMap: { [key: string]: string } = {
      'power-breakfast-bowl': 'breakfast-bowl-healthy',
      'pancakes-proteici': 'protein-pancakes-healthy',
      'overnight-oats': 'overnight-oats-breakfast',
      'smoothie-energetico': 'green-smoothie-healthy',
      'chicken-power-bowl': 'chicken-bowl-healthy',
      'risotto-fitness': 'risotto-healthy',
      'salmone-teriyaki': 'salmon-teriyaki',
      'buddha-bowl': 'buddha-bowl-healthy',
      'lean-salmon-plate': 'grilled-salmon-vegetables',
      'tagliata-fitness': 'grilled-beef-salad',
      'curry-pollo': 'chicken-curry-healthy',
      'orata-mediterranean': 'grilled-fish-mediterranean'
    };
    
    const query = imageMap[cleanName] || 'healthy-food-meal';
    return `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&auto=format&q=80&crop=center&${query}`;
  };

  // 🔧 FIX CRITICO: Genera lista spesa con controlli
  const generateShoppingList = () => {
    console.log('🛒 [DEBUG] Generating shopping list...');
    const ingredients: { [key: string]: { count: number; category: string; baseQuantity: string; originalNames: string[] } } = {};
    
    try {
      parsedPlan.days.forEach((dayData, dayIndex) => {
        console.log(`🔍 [DEBUG] Processing day ${dayIndex}:`, dayData);
        
        if (!dayData || !dayData.meals) {
          console.warn(`⚠️ [WARNING] Day ${dayIndex} has no meals`);
          return;
        }
        
        const dayMeals = getAllMealsInOrder(dayData.meals);
        
        dayMeals.forEach(({ meal, key }) => {
          if (!meal) {
            console.warn(`⚠️ [WARNING] Meal ${key} is undefined`);
            return;
          }
          
          if (!meal.ingredienti || !Array.isArray(meal.ingredienti)) {
            console.warn(`⚠️ [WARNING] Meal ${key} has no ingredients`);
            return;
          }
          
          meal.ingredienti.forEach(ingrediente => {
            if (!ingrediente || typeof ingrediente !== 'string') {
              console.warn('⚠️ [WARNING] Invalid ingredient:', ingrediente);
              return;
            }
            
            const cleanIngredient = ingrediente.trim();
            const normalizedName = normalizeIngredientName(cleanIngredient);
            
            if (ingredients[normalizedName]) {
              ingredients[normalizedName].count += 1;
              ingredients[normalizedName].originalNames.push(cleanIngredient);
            } else {
              ingredients[normalizedName] = { 
                count: 1, 
                category: categorizeIngredient(cleanIngredient),
                baseQuantity: extractQuantity(cleanIngredient),
                originalNames: [cleanIngredient]
              };
            }
          });
        });
      });
      
      console.log('✅ [SUCCESS] Shopping list generated:', ingredients);
      return ingredients;
      
    } catch (error) {
      console.error('❌ [ERROR] Failed to generate shopping list:', error);
      return {};
    }
  };

  // Normalizza nome ingrediente per raggruppamento
  const normalizeIngredientName = (ingredient: string): string => {
    const lower = ingredient.toLowerCase();
    
    if (lower.includes('uovo') || lower.includes('uova')) return '1 uovo fresco biologico';
    if (lower.includes('aglio') || lower.includes('spicchio')) return '1/2 spicchio aglio';
    if (lower.includes('olio') && lower.includes('extravergine')) return '1 cucchiaio olio extravergine';
    if (lower.includes('prezzemolo')) return 'Prezzemolo fresco (3g)';
    if (lower.includes('sale') && lower.includes('pepe')) return 'Sale e pepe q.b.';
    if (lower.includes('brodo')) return '200ml brodo vegetale';
    
    return ingredient;
  };

  // Estrae quantità dall'ingrediente
  const extractQuantity = (ingredient: string) => {
    const match = ingredient.match(/(\d+(?:\.\d+)?)\s*(g|kg|ml|l|cucchiai|cucchiaini|fette|pz|pezzi)/i);
    return match ? `${match[1]}${match[2]}` : '';
  };

  // Calcola quantità totale necessaria
  const calculateTotalQuantity = (baseQuantity: string, multiplier: number) => {
    if (!baseQuantity) return '';
    
    const match = baseQuantity.match(/(\d+(?:\.\d+)?)\s*(g|kg|ml|l|cucchiai|cucchiaini|fette|pz|pezzi)/i);
    if (!match) return '';
    
    const quantity = parseFloat(match[1]);
    const unit = match[2];
    const total = quantity * multiplier;
    
    if (unit.toLowerCase() === 'g' && total >= 1000) {
      return `${(total / 1000).toFixed(1)}kg`;
    }
    if (unit.toLowerCase() === 'ml' && total >= 1000) {
      return `${(total / 1000).toFixed(1)}l`;
    }
    
    return `${total}${unit}`;
  };

  const categorizeIngredient = (ingredient: string): string => {
    const lower = ingredient.toLowerCase();
    if (lower.includes('pomodoro') || lower.includes('sedano') || lower.includes('carota') || 
        lower.includes('cipolla') || lower.includes('aglio') || lower.includes('funghi') ||
        lower.includes('verdure') || lower.includes('broccoli') || lower.includes('spinaci')) {
      return '🥬 VERDURE E ORTAGGI';
    }
    if (lower.includes('manzo') || lower.includes('pollo') || lower.includes('pesce') ||
        lower.includes('salmone') || lower.includes('tonno') || lower.includes('carne')) {
      return '🍖 CARNE E PESCE';
    }
    if (lower.includes('uovo') || lower.includes('parmigiano') || lower.includes('yogurt') ||
        lower.includes('ricotta') || lower.includes('latte') || lower.includes('formaggi')) {
      return '🥛 LATTICINI E UOVA';
    }
    if (lower.includes('pane') || lower.includes('pasta') || lower.includes('fagioli') ||
        lower.includes('avena') || lower.includes('quinoa') || lower.includes('riso')) {
      return '🌾 CEREALI E LEGUMI';
    }
    if (lower.includes('banana') || lower.includes('mela') || lower.includes('frutti') ||
        lower.includes('mandorle') || lower.includes('noci')) {
      return '🥑 FRUTTA E FRUTTA SECCA';
    }
    return '🧄 CONDIMENTI E SPEZIE';
  };

  const shoppingList = generateShoppingList();
  const categorizedShopping = Object.entries(shoppingList).reduce((acc, [ingredient, { count, category, baseQuantity, originalNames }]) => {
    if (!acc[category]) acc[category] = [];
    acc[category].push({ ingredient, count, baseQuantity, originalNames });
    return acc;
  }, {} as { [key: string]: Array<{ ingredient: string; count: number; baseQuantity: string; originalNames: string[] }> });

  // 🔧 FIX CRITICO: Ottieni ricette uniche con controlli
  let allRecipes: Meal[] = [];
  
  try {
    const recipeNames = Array.from(new Set(
      parsedPlan.days.flatMap(dayData => {
        if (!dayData || !dayData.meals) return [];
        return getAllMealsInOrder(dayData.meals)
          .map(({ meal }) => meal?.nome)
          .filter(Boolean);
      })
    ));
    
    allRecipes = recipeNames.map(recipeName => {
      const recipe = parsedPlan.days.flatMap(dayData => {
        if (!dayData || !dayData.meals) return [];
        return getAllMealsInOrder(dayData.meals);
      }).find(({ meal }) => meal?.nome === recipeName)?.meal;
      
      // Aggiungi immagine se non presente
      if (recipe && !recipe.imageUrl) {
        recipe.imageUrl = generateRecipeImage(recipe.nome);
      }
      
      return recipe;
    }).filter(Boolean) as Meal[];

    console.log(`✅ [SUCCESS] Found ${allRecipes.length} unique recipes`);
    
  } catch (error) {
    console.error('❌ [ERROR] Failed to get unique recipes:', error);
    allRecipes = [];
  }

  return (
    <section id="complete-section" className="max-w-6xl mx-auto px-4 py-20">
      <div className="mb-8 text-center">
        <h2 className="text-4xl font-bold mb-4" style={{color: '#8FBC8F'}}>
          🎉 Piano Alimentare Completo!
        </h2>
        <div className="flex items-center justify-center gap-6 text-sm text-gray-300">
          <span>🔥 {totalCaloriesPlan.toLocaleString('it-IT')} kcal totali</span>
          <span>📅 {parsedPlan.days.length} giorni</span>
          <span>🍽️ {orderedMeals.length} pasti/giorno</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-800 rounded-lg p-1 flex gap-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'overview' 
                ? 'text-black' 
                : 'text-gray-300 hover:text-white'
            }`}
            style={{backgroundColor: activeTab === 'overview' ? '#8FBC8F' : 'transparent'}}
          >
            📋 Panoramica
          </button>
          <button
            onClick={() => setActiveTab('recipes')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'recipes' 
                ? 'text-black' 
                : 'text-gray-300 hover:text-white'
            }`}
            style={{backgroundColor: activeTab === 'recipes' ? '#8FBC8F' : 'transparent'}}
          >
            🍳 Ricette Complete
          </button>
          <button
            onClick={() => setActiveTab('shopping')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'shopping' 
                ? 'text-black' 
                : 'text-gray-300 hover:text-white'
            }`}
            style={{backgroundColor: activeTab === 'shopping' ? '#8FBC8F' : 'transparent'}}
          >
            🛒 Lista Spesa
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-gray-800 rounded-xl p-8 shadow-2xl">
        {activeTab === 'overview' && (
          <div>
            <h3 className="text-2xl font-bold mb-6 text-center" style={{color: '#8FBC8F'}}>
              📅 Programma Settimanale
            </h3>
            
            {parsedPlan.days.map((dayData, dayIndex) => {
              // Controllo sicurezza per ogni giorno
              if (!dayData || !dayData.meals) {
                return (
                  <div key={dayIndex} className="mb-8 bg-red-900 bg-opacity-30 border border-red-600 rounded-xl p-6">
                    <h4 className="text-xl font-bold text-red-400">
                      ❌ Giorno {dayIndex + 1} - Dati mancanti
                    </h4>
                    <p className="text-red-300 mt-2">Non sono stati trovati pasti per questo giorno</p>
                    <button
                      onClick={onGenerateNewPlan}
                      className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                    >
                      🔄 Rigenera Piano
                    </button>
                  </div>
                );
              }

              const dayMeals = getAllMealsInOrder(dayData.meals);
              const dayTotalCalories = dayMeals.reduce((sum, { meal }) => {
                return sum + (meal?.calorie || 0);
              }, 0);
              
              return (
                <div key={dayIndex} className="mb-8 bg-gray-700 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xl font-bold text-white">{dayData.day}</h4>
                    <span className="text-green-400 font-semibold">
                      🔥 {dayTotalCalories} kcal
                    </span>
                  </div>
                  
                  {dayMeals.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      ⚠️ Nessun pasto valido trovato per questo giorno
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {dayMeals.map(({ key, meal, emoji, nome }) => {
                        if (!meal) {
                          return (
                            <div key={key} className="bg-red-900 bg-opacity-30 border border-red-600 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">{emoji}</span>
                                <span className="font-semibold text-red-400 text-sm">{nome}</span>
                              </div>
                              <div className="text-red-300 text-sm">❌ Ricetta non trovata</div>
                              <button
                                onClick={() => handleReplacement(key, dayData.day)}
                                className="mt-2 bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                              >
                                🔄 Sostituisci
                              </button>
                            </div>
                          );
                        }

                        return (
                          <div key={key} className="bg-gray-600 rounded-lg p-4 hover:bg-gray-500 transition-colors">
                            {/* Immagine ricetta */}
                            {meal.imageUrl && (
                              <img 
                                src={meal.imageUrl}
                                alt={meal.nome}
                                className="w-full h-24 object-cover rounded-lg mb-3"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = generateRecipeImage(meal.nome);
                                }}
                              />
                            )}
                            
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{emoji}</span>
                                <span className="font-semibold text-white text-sm">{nome}</span>
                              </div>
                              <button
                                onClick={() => handleReplacement(key, dayData.day)}
                                disabled={isReplacing === `${dayData.day}-${key}`}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-2 py-1 rounded text-xs"
                              >
                                {isReplacing === `${dayData.day}-${key}` ? '⏳' : '🔄'}
                              </button>
                            </div>
                            
                            <h5 className="font-bold text-green-400 mb-2">{meal.nome}</h5>
                            
                            <div className="text-xs text-gray-300 mb-2">
                              🔥 {meal.calorie || 0} kcal | ⏱️ {meal.tempo || 'N/A'} | 👥 {meal.porzioni || 1} porz.
                            </div>
                            
                            <div className="text-xs text-gray-300">
                              P: {meal.proteine || 0}g | C: {meal.carboidrati || 0}g | G: {meal.grassi || 0}g
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'recipes' && (
          <div>
            <h3 className="text-2xl font-bold mb-6 text-center" style={{color: '#8FBC8F'}}>
              🍳 Ricette Complete con Foto
            </h3>
            
            {allRecipes.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-4">⚠️ Nessuna ricetta trovata</div>
                <button 
                  onClick={onGenerateNewPlan}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg"
                >
                  🔄 Genera Nuovo Piano
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {allRecipes.map((recipe, index) => (
                  <div key={index} className="bg-gray-700 rounded-xl overflow-hidden">
                    {/* Immagine ricetta */}
                    <img 
                      src={recipe.imageUrl || generateRecipeImage(recipe.nome)}
                      alt={recipe.nome}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = generateRecipeImage(recipe.nome);
                      }}
                    />
                    
                    <div className="p-6">
                      <h4 className="text-xl font-bold text-white mb-3">{recipe.nome}</h4>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-300 mb-4">
                        <span className="flex items-center gap-1">
                          <Flame size={16} className="text-orange-500" />
                          {recipe.calorie || 0} kcal
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={16} className="text-blue-400" />
                          {recipe.tempo || 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={16} className="text-green-400" />
                          {recipe.porzioni || 1} porz.
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-bold text-white mb-3">🛒 Ingredienti:</h5>
                          <div className="space-y-1">
                            {(recipe.ingredienti || []).map((ingrediente, idx) => (
                              <div 
                                key={idx}
                                className="flex justify-between items-center bg-gray-600 px-3 py-2 rounded hover:bg-gray-500 cursor-pointer group"
                                onClick={() => handleIngredientSubstitution(ingrediente, 0, 'recipe', idx)}
                              >
                                <span className="text-gray-300 text-sm">• {ingrediente}</span>
                                <span className="opacity-0 group-hover:opacity-100 text-xs bg-blue-600 px-2 py-1 rounded">
                                  🔀
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-bold text-white mb-3">👨‍🍳 Preparazione:</h5>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {recipe.preparazione || 'Preparazione non disponibile'}
                          </p>
                          
                          <div className="mt-4 p-3 bg-gray-600 rounded-lg">
                            <h6 className="font-semibold text-white mb-2 text-sm">📊 Valori Nutrizionali:</h6>
                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                              <span>Proteine: {recipe.proteine || 0}g</span>
                              <span>Carboidrati: {recipe.carboidrati || 0}g</span>
                              <span>Grassi: {recipe.grassi || 0}g</span>
                              <span>Calorie: {recipe.calorie || 0} kcal</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'shopping' && (
          <div>
            <h3 className="text-2xl font-bold mb-6 text-center" style={{color: '#8FBC8F'}}>
              🛒 Lista della Spesa Consolidata
            </h3>
            
            {Object.keys(categorizedShopping).length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-4">⚠️ Nessun ingrediente trovato</div>
                <button 
                  onClick={onGenerateNewPlan}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg"
                >
                  🔄 Genera Nuovo Piano
                </button>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-6">
                  {Object.entries(categorizedShopping).map(([category, items]) => (
                    <div key={category} className="bg-gray-700 rounded-xl p-6">
                      <h4 className="text-lg font-bold text-white mb-4">{category}</h4>
                      <div className="space-y-3">
                        {items.map(({ ingredient, count, baseQuantity, originalNames }) => {
                          const totalQuantity = calculateTotalQuantity(baseQuantity, count);
                          return (
                            <div key={ingredient} className="flex justify-between items-center text-gray-300 hover:text-white transition-colors">
                              <div className="flex-1">
                                <span>• {ingredient}</span>
                                {totalQuantity && (
                                  <div className="text-green-400 text-sm font-semibold">
                                    Totale: {totalQuantity}
                                  </div>
                                )}
                                {originalNames && originalNames.length > 1 && (
                                  <div className="text-gray-500 text-xs">
                                    (Varianti: {originalNames.slice(0, 2).join(', ')}{originalNames.length > 2 ? '...' : ''})
                                  </div>
                                )}
                              </div>
                              {count > 1 && (
                                <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold ml-2">
                                  {count}x
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 text-center">
                  <button
                    onClick={() => {
                      const shoppingText = Object.entries(categorizedShopping)
                        .map(([category, items]) => 
                          `${category}\n${items.map(({ingredient, count, baseQuantity}) => {
                            const totalQuantity = calculateTotalQuantity(baseQuantity, count);
                            return `• ${ingredient}${count > 1 ? ` (${count}x)` : ''}${totalQuantity ? ` - Totale: ${totalQuantity}` : ''}`;
                          }).join('\n')}`
                        ).join('\n\n');
                      
                      navigator.clipboard.writeText(`🛒 LISTA SPESA\n\n${shoppingText}`);
                      alert('Lista spesa copiata negli appunti!');
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    📋 Copia Lista Spesa
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center mt-8">
        <button
          onClick={() => {
            const text = `🍽️ Ecco il mio piano alimentare personalizzato!\n\n${generatedPlan}`;
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
            window.open(whatsappUrl, '_blank');
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
        >
          📱 Condividi su WhatsApp
        </button>

        <button
          onClick={() => {
            const printContent = `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <title>Piano Alimentare - ${formData.nome}</title>
                  <style>
                    body { font-family: Georgia, serif; line-height: 1.4; color: #333; }
                    .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #8FBC8F; padding-bottom: 10px; }
                    h1 { color: #2F4F4F; }
                    h2 { color: #8FBC8F; }
                  </style>
                </head>
                <body>
                  <div class="header">
                    <h1>Piano Alimentare Personalizzato</h1>
                    <p>Generato per ${formData.nome} il ${new Date().toLocaleDateString('it-IT')}</p>
                  </div>
                  <div style="white-space: pre-wrap;">${generatedPlan}</div>
                </body>
              </html>
            `;
            
            const printWindow = window.open('', '_blank');
            if (printWindow) {
              printWindow.document.write(printContent);
              printWindow.document.close();
              printWindow.print();
            }
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
        >
          📥 Scarica PDF
        </button>

        <button
          onClick={() => {
            navigator.clipboard.writeText(generatedPlan);
            alert('Piano copiato negli appunti!');
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
        >
          📋 Copia Testo
        </button>

        <button
          onClick={onGenerateNewPlan}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
        >
          🔄 Nuovo Piano
        </button>
      </div>

      {/* Debug Info (solo in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 bg-gray-900 border border-gray-600 rounded-lg p-4">
          <h4 className="text-white font-bold mb-2">🐛 Debug Info</h4>
          <div className="text-xs text-gray-400 space-y-1">
            <div>Plan Days: {parsedPlan.days?.length || 0}</div>
            <div>Total Recipes: {allRecipes.length}</div>
            <div>Shopping Categories: {Object.keys(categorizedShopping).length}</div>
            <div>Console: Apri DevTools per log dettagliati</div>
            <button 
              onClick={() => {
                console.log('🔍 [DEBUG] Full parsedPlan:', parsedPlan);
                console.log('🔍 [DEBUG] All recipes:', allRecipes);
                console.log('🔍 [DEBUG] Shopping list:', shoppingList);
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
};

export default MealPlanComplete;