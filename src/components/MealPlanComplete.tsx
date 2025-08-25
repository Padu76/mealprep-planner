import React, { useState } from 'react';
import { Clock, Users, Flame, ShoppingCart, ChefHat, Calendar, Download, Share2, ChevronDown, ChevronUp, Activity, Zap } from 'lucide-react';

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
  const [expandedPreparation, setExpandedPreparation] = useState<string | null>(null);

  // Funzione sicura per ottenere valori nutrizionali
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

  // Funzione per ottenere tutti i pasti in ordine CON CONTROLLI
  const getAllMealsInOrder = (dayMeals: DayMeals) => {
    console.log('[DEBUG] getAllMealsInOrder called with:', dayMeals);
    
    if (!dayMeals) {
      console.error('[ERROR] dayMeals is undefined');
      return [];
    }

    const meals = [];
    
    // Controllo esistenza di ogni pasto prima di aggiungerlo
    if (dayMeals.colazione) {
      meals.push({ key: 'colazione', meal: dayMeals.colazione, nome: 'COLAZIONE' });
    } else {
      console.warn('[WARNING] colazione is missing');
    }
    
    if (dayMeals.spuntino1) {
      meals.push({ key: 'spuntino1', meal: dayMeals.spuntino1, nome: 'SPUNTINO MATTINA' });
    }
    
    if (dayMeals.pranzo) {
      meals.push({ key: 'pranzo', meal: dayMeals.pranzo, nome: 'PRANZO' });
    } else {
      console.warn('[WARNING] pranzo is missing');
    }
    
    if (dayMeals.spuntino2) {
      meals.push({ key: 'spuntino2', meal: dayMeals.spuntino2, nome: 'SPUNTINO POMERIGGIO' });
    }
    
    if (dayMeals.cena) {
      meals.push({ key: 'cena', meal: dayMeals.cena, nome: 'CENA' });
    } else {
      console.warn('[WARNING] cena is missing');
    }
    
    if (dayMeals.spuntino3) {
      meals.push({ key: 'spuntino3', meal: dayMeals.spuntino3, nome: 'SPUNTINO SERA' });
    }
    
    console.log(`[SUCCESS] Found ${meals.length} valid meals`);
    return meals;
  };

  // Validazione completa del piano
  if (!parsedPlan) {
    console.error('[ERROR] parsedPlan is undefined');
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <div className="bg-red-900 bg-opacity-30 border border-red-600 rounded-lg p-6">
          <h3 className="text-red-400 text-xl font-bold mb-2">Errore Piano</h3>
          <p className="text-gray-400">Il piano alimentare non è stato caricato correttamente</p>
          <button 
            onClick={onGenerateNewPlan}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Genera Nuovo Piano
          </button>
        </div>
      </div>
    );
  }

  if (!parsedPlan.days || !Array.isArray(parsedPlan.days) || parsedPlan.days.length === 0) {
    console.error('[ERROR] parsedPlan.days is invalid:', parsedPlan.days);
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <div className="bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded-lg p-6">
          <h3 className="text-yellow-400 text-xl font-bold mb-2">Piano Vuoto</h3>
          <p className="text-gray-400">Non sono stati trovati giorni nel piano alimentare</p>
          <button 
            onClick={onGenerateNewPlan}
            className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Genera Nuovo Piano
          </button>
        </div>
      </div>
    );
  }

  // Calcola statistiche con controlli di sicurezza
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
    
    // USA getMealNutrition() invece di accesso diretto
    totalCaloriesPerDay = orderedMeals.reduce((sum, { meal }) => {
      if (!meal) {
        console.warn('[WARNING] Meal is undefined in reduce');
        return sum;
      }
      const nutrition = getMealNutrition(meal);
      console.log(`[DEBUG] Adding ${nutrition.calories} calories from ${meal.nome}`);
      return sum + nutrition.calories;
    }, 0);
    
    totalCaloriesPlan = totalCaloriesPerDay * parsedPlan.days.length;
    
    console.log(`[SUCCESS] Stats calculated: ${totalCaloriesPerDay} cal/day, ${totalCaloriesPlan} total`);
    
  } catch (error) {
    console.error('[ERROR] Failed to calculate plan stats:', error);
    
    // Fallback sicuro
    firstDay = {};
    orderedMeals = [];
    totalCaloriesPerDay = 0;
    totalCaloriesPlan = 0;
  }

  // Genera lista spesa con controlli
  const generateShoppingList = () => {
    console.log('[DEBUG] Generating shopping list...');
    const ingredients: { [key: string]: { count: number; category: string; baseQuantity: string; originalNames: string[] } } = {};
    
    try {
      parsedPlan.days.forEach((dayData, dayIndex) => {
        console.log(`[DEBUG] Processing day ${dayIndex}:`, dayData);
        
        if (!dayData || !dayData.meals) {
          console.warn(`[WARNING] Day ${dayIndex} has no meals`);
          return;
        }
        
        const dayMeals = getAllMealsInOrder(dayData.meals);
        
        dayMeals.forEach(({ meal, key }) => {
          if (!meal) {
            console.warn(`[WARNING] Meal ${key} is undefined`);
            return;
          }
          
          if (!meal.ingredienti || !Array.isArray(meal.ingredienti)) {
            console.warn(`[WARNING] Meal ${key} has no ingredients`);
            return;
          }
          
          meal.ingredienti.forEach(ingrediente => {
            if (!ingrediente || typeof ingrediente !== 'string') {
              console.warn('[WARNING] Invalid ingredient:', ingrediente);
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
      
      console.log('[SUCCESS] Shopping list generated:', ingredients);
      return ingredients;
      
    } catch (error) {
      console.error('[ERROR] Failed to generate shopping list:', error);
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
      return 'VERDURE E ORTAGGI';
    }
    if (lower.includes('manzo') || lower.includes('pollo') || lower.includes('pesce') ||
        lower.includes('salmone') || lower.includes('tonno') || lower.includes('carne')) {
      return 'CARNE E PESCE';
    }
    if (lower.includes('uovo') || lower.includes('parmigiano') || lower.includes('yogurt') ||
        lower.includes('ricotta') || lower.includes('latte') || lower.includes('formaggi')) {
      return 'LATTICINI E UOVA';
    }
    if (lower.includes('pane') || lower.includes('pasta') || lower.includes('fagioli') ||
        lower.includes('avena') || lower.includes('quinoa') || lower.includes('riso')) {
      return 'CEREALI E LEGUMI';
    }
    if (lower.includes('banana') || lower.includes('mela') || lower.includes('frutti') ||
        lower.includes('mandorle') || lower.includes('noci')) {
      return 'FRUTTA E FRUTTA SECCA';
    }
    return 'CONDIMENTI E SPEZIE';
  };

  const shoppingList = generateShoppingList();
  const categorizedShopping = Object.entries(shoppingList).reduce((acc, [ingredient, { count, category, baseQuantity, originalNames }]) => {
    if (!acc[category]) acc[category] = [];
    acc[category].push({ ingredient, count, baseQuantity, originalNames });
    return acc;
  }, {} as { [key: string]: Array<{ ingredient: string; count: number; baseQuantity: string; originalNames: string[] }> });

  // Ottieni ricette uniche con controlli
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
      
      return recipe;
    }).filter(Boolean) as Meal[];

    console.log(`[SUCCESS] Found ${allRecipes.length} unique recipes`);
    
  } catch (error) {
    console.error('[ERROR] Failed to get unique recipes:', error);
    allRecipes = [];
  }

  // Funzione per ottenere icona del tipo di pasto
  const getMealTypeIcon = (mealType: string) => {
    switch (mealType.toLowerCase()) {
      case 'colazione':
        return <Calendar className="w-5 h-5 text-yellow-400" />;
      case 'pranzo':
        return <Flame className="w-5 h-5 text-orange-400" />;
      case 'cena':
        return <Clock className="w-5 h-5 text-purple-400" />;
      case 'spuntino1':
      case 'spuntino2':
      case 'spuntino3':
        return <Zap className="w-5 h-5 text-green-400" />;
      default:
        return <ChefHat className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <section id="complete-section" className="max-w-6xl mx-auto px-4 py-20">
      <div className="mb-8 text-center">
        <h2 className="text-4xl font-bold mb-4" style={{color: '#8FBC8F'}}>
          Piano Alimentare Completo
        </h2>
        <div className="flex items-center justify-center gap-6 text-sm text-gray-300">
          <span className="flex items-center gap-1">
            <Flame size={16} />
            {totalCaloriesPlan.toLocaleString('it-IT')} kcal totali
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={16} />
            {parsedPlan.days.length} giorni
          </span>
          <span className="flex items-center gap-1">
            <ChefHat size={16} />
            {orderedMeals.length} pasti/giorno
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-800 rounded-lg p-1 flex gap-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'overview' 
                ? 'text-black' 
                : 'text-gray-300 hover:text-white'
            }`}
            style={{backgroundColor: activeTab === 'overview' ? '#8FBC8F' : 'transparent'}}
          >
            <Calendar size={18} />
            Panoramica
          </button>
          <button
            onClick={() => setActiveTab('recipes')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'recipes' 
                ? 'text-black' 
                : 'text-gray-300 hover:text-white'
            }`}
            style={{backgroundColor: activeTab === 'recipes' ? '#8FBC8F' : 'transparent'}}
          >
            <ChefHat size={18} />
            Ricette Complete
          </button>
          <button
            onClick={() => setActiveTab('shopping')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'shopping' 
                ? 'text-black' 
                : 'text-gray-300 hover:text-white'
            }`}
            style={{backgroundColor: activeTab === 'shopping' ? '#8FBC8F' : 'transparent'}}
          >
            <ShoppingCart size={18} />
            Lista Spesa
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-gray-800 rounded-xl p-8 shadow-2xl">
        {activeTab === 'overview' && (
          <div>
            <h3 className="text-2xl font-bold mb-6 text-center" style={{color: '#8FBC8F'}}>
              Programma Settimanale
            </h3>
            
            {parsedPlan.days.map((dayData, dayIndex) => {
              // Controllo sicurezza per ogni giorno
              if (!dayData || !dayData.meals) {
                return (
                  <div key={dayIndex} className="mb-8 bg-red-900 bg-opacity-30 border border-red-600 rounded-xl p-6">
                    <h4 className="text-xl font-bold text-red-400">
                      Giorno {dayIndex + 1} - Dati mancanti
                    </h4>
                    <p className="text-red-300 mt-2">Non sono stati trovati pasti per questo giorno</p>
                    <button
                      onClick={onGenerateNewPlan}
                      className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                    >
                      Rigenera Piano
                    </button>
                  </div>
                );
              }

              const dayMeals = getAllMealsInOrder(dayData.meals);
              
              // USA getMealNutrition() per il calcolo
              const dayTotalCalories = dayMeals.reduce((sum, { meal }) => {
                if (!meal) return sum;
                const nutrition = getMealNutrition(meal);
                return sum + nutrition.calories;
              }, 0);
              
              return (
                <div key={dayIndex} className="mb-8 bg-gray-700 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xl font-bold text-white">{dayData.day}</h4>
                    <span className="text-green-400 font-semibold flex items-center gap-1">
                      <Flame size={16} />
                      {dayTotalCalories} kcal
                    </span>
                  </div>
                  
                  {dayMeals.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      Nessun pasto valido trovato per questo giorno
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {dayMeals.map(({ key, meal, nome }) => {
                        if (!meal) {
                          return (
                            <div key={key} className="bg-red-900 bg-opacity-30 border border-red-600 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                {getMealTypeIcon(key)}
                                <span className="font-semibold text-red-400 text-sm">{nome}</span>
                              </div>
                              <div className="text-red-300 text-sm">Ricetta non trovata</div>
                              <button
                                onClick={() => handleReplacement(key, dayData.day)}
                                className="mt-2 bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                              >
                                Sostituisci
                              </button>
                            </div>
                          );
                        }

                        // USA getMealNutrition() per UI
                        const nutrition = getMealNutrition(meal);

                        return (
                          <div key={key} className="bg-gray-600 rounded-lg p-4 hover:bg-gray-500 transition-colors border border-gray-500">
                            {/* Header con icona e titolo */}
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-2">
                                {getMealTypeIcon(key)}
                                <span className="font-semibold text-white text-sm">{nome}</span>
                              </div>
                              <button
                                onClick={() => handleReplacement(key, dayData.day)}
                                disabled={isReplacing === `${dayData.day}-${key}`}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-2 py-1 rounded text-xs transition-colors"
                                title="Sostituisci pasto"
                              >
                                {isReplacing === `${dayData.day}-${key}` ? '...' : 'Sostituisci'}
                              </button>
                            </div>
                            
                            <h5 className="font-bold text-green-400 mb-3 text-sm leading-tight">{meal.nome}</h5>
                            
                            {/* Macronutrienti con badge colorati */}
                            <div className="grid grid-cols-3 gap-2 mb-3">
                              <div className="bg-blue-600/20 border border-blue-500 rounded px-2 py-1 text-center">
                                <div className="text-blue-400 font-bold text-xs">{nutrition.protein}g</div>
                                <div className="text-blue-300 text-xs">Proteine</div>
                              </div>
                              <div className="bg-purple-600/20 border border-purple-500 rounded px-2 py-1 text-center">
                                <div className="text-purple-400 font-bold text-xs">{nutrition.carbs}g</div>
                                <div className="text-purple-300 text-xs">Carboidrati</div>
                              </div>
                              <div className="bg-yellow-600/20 border border-yellow-500 rounded px-2 py-1 text-center">
                                <div className="text-yellow-400 font-bold text-xs">{nutrition.fat}g</div>
                                <div className="text-yellow-300 text-xs">Grassi</div>
                              </div>
                            </div>
                            
                            {/* Info aggiuntive */}
                            <div className="flex justify-between items-center text-xs text-gray-300 bg-gray-700 rounded px-3 py-2">
                              <div className="flex items-center gap-1">
                                <Flame size={12} className="text-orange-400" />
                                <span className="font-semibold text-orange-400">{nutrition.calories} kcal</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock size={12} />
                                <span>{meal.tempo || '15 min'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users size={12} />
                                <span>{meal.porzioni || 1} porz.</span>
                              </div>
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
              Ricette Complete
            </h3>
            
            {allRecipes.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-4">Nessuna ricetta trovata</div>
                <button 
                  onClick={onGenerateNewPlan}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg"
                >
                  Genera Nuovo Piano
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
                {allRecipes.map((recipe, index) => {
                  // USA getMealNutrition() per ogni ricetta
                  const nutrition = getMealNutrition(recipe);
                  const isExpanded = expandedPreparation === `${index}`;
                  
                  return (
                    <div key={index} className="bg-gray-700 rounded-xl p-6 border border-gray-600">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-xl font-bold text-white flex-1">{recipe.nome}</h4>
                        <div className="flex items-center gap-1 bg-green-600/20 border border-green-500 rounded px-3 py-1">
                          <Flame size={16} className="text-orange-400" />
                          <span className="text-green-400 font-bold">{nutrition.calories} kcal</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-300 mb-4">
                        <span className="flex items-center gap-1">
                          <Clock size={16} className="text-blue-400" />
                          {recipe.tempo || '15 min'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={16} className="text-green-400" />
                          {recipe.porzioni || 1} porzione
                        </span>
                        <span className="flex items-center gap-1">
                          <Activity size={16} className="text-purple-400" />
                          Medio
                        </span>
                      </div>

                      <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h5 className="font-bold text-white mb-3 flex items-center gap-2">
                            <ShoppingCart size={16} className="text-green-400" />
                            Ingredienti
                          </h5>
                          <div className="space-y-2">
                            {(recipe.ingredienti || []).map((ingrediente, idx) => (
                              <div 
                                key={idx}
                                className="flex justify-between items-center bg-gray-600 px-3 py-2 rounded hover:bg-gray-500 cursor-pointer group transition-colors"
                                onClick={() => handleIngredientSubstitution(ingrediente, 0, 'recipe', idx)}
                                title="Clicca per sostituire ingrediente"
                              >
                                <span className="text-gray-300 text-sm">• {ingrediente}</span>
                                <span className="opacity-0 group-hover:opacity-100 text-xs bg-blue-600 px-2 py-1 rounded transition-opacity">
                                  Sostituisci
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-bold text-white mb-3 flex items-center gap-2">
                            <Activity size={16} className="text-purple-400" />
                            Valori Nutrizionali
                          </h5>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-blue-600/20 border border-blue-500 rounded p-3 text-center">
                              <div className="text-blue-400 font-bold text-lg">{nutrition.protein}g</div>
                              <div className="text-blue-300 text-xs">Proteine</div>
                            </div>
                            <div className="bg-purple-600/20 border border-purple-500 rounded p-3 text-center">
                              <div className="text-purple-400 font-bold text-lg">{nutrition.carbs}g</div>
                              <div className="text-purple-300 text-xs">Carboidrati</div>
                            </div>
                            <div className="bg-yellow-600/20 border border-yellow-500 rounded p-3 text-center">
                              <div className="text-yellow-400 font-bold text-lg">{nutrition.fat}g</div>
                              <div className="text-yellow-300 text-xs">Grassi</div>
                            </div>
                            <div className="bg-orange-600/20 border border-orange-500 rounded p-3 text-center">
                              <div className="text-orange-400 font-bold text-lg">{nutrition.calories}</div>
                              <div className="text-orange-300 text-xs">Calorie</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Preparazione Expandable */}
                      <div className="mt-4">
                        <button
                          onClick={() => setExpandedPreparation(isExpanded ? null : `${index}`)}
                          className="flex items-center justify-between w-full bg-gray-600 hover:bg-gray-500 p-3 rounded-lg transition-colors"
                        >
                          <span className="font-bold text-white flex items-center gap-2">
                            <ChefHat size={16} className="text-green-400" />
                            Preparazione
                          </span>
                          {isExpanded ? (
                            <ChevronUp size={20} className="text-gray-400" />
                          ) : (
                            <ChevronDown size={20} className="text-gray-400" />
                          )}
                        </button>
                        
                        {isExpanded && (
                          <div className="mt-3 bg-gray-600 p-4 rounded-lg">
                            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                              {recipe.preparazione || 'Preparazione non disponibile'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'shopping' && (
          <div>
            <h3 className="text-2xl font-bold mb-6 text-center" style={{color: '#8FBC8F'}}>
              Lista della Spesa Consolidata
            </h3>
            
            {Object.keys(categorizedShopping).length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-4">Nessun ingrediente trovato</div>
                <button 
                  onClick={onGenerateNewPlan}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg"
                >
                  Genera Nuovo Piano
                </button>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-6">
                  {Object.entries(categorizedShopping).map(([category, items]) => (
                    <div key={category} className="bg-gray-700 rounded-xl p-6 border border-gray-600">
                      <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <ShoppingCart size={18} className="text-green-400" />
                        {category}
                      </h4>
                      <div className="space-y-3">
                        {items.map(({ ingredient, count, baseQuantity, originalNames }) => {
                          const totalQuantity = calculateTotalQuantity(baseQuantity, count);
                          return (
                            <div key={ingredient} className="flex justify-between items-center text-gray-300 hover:text-white transition-colors bg-gray-600 p-3 rounded-lg">
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
                      
                      navigator.clipboard.writeText(`LISTA SPESA\n\n${shoppingText}`);
                      alert('Lista spesa copiata negli appunti!');
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 mx-auto"
                  >
                    <Download size={18} />
                    Copia Lista Spesa
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
            const text = `Ecco il mio piano alimentare personalizzato!\n\n${generatedPlan}`;
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
            window.open(whatsappUrl, '_blank');
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Share2 size={18} />
          Condividi su WhatsApp
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
          <Download size={18} />
          Scarica PDF
        </button>

        <button
          onClick={() => {
            navigator.clipboard.writeText(generatedPlan);
            alert('Piano copiato negli appunti!');
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Download size={18} />
          Copia Testo
        </button>

        <button
          onClick={onGenerateNewPlan}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Activity size={18} />
          Nuovo Piano
        </button>
      </div>

      {/* Debug Info (solo in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 bg-gray-900 border border-gray-600 rounded-lg p-4">
          <h4 className="text-white font-bold mb-2">Debug Info</h4>
          <div className="text-xs text-gray-400 space-y-1">
            <div>Plan Days: {parsedPlan.days?.length || 0}</div>
            <div>Total Recipes: {allRecipes.length}</div>
            <div>Shopping Categories: {Object.keys(categorizedShopping).length}</div>
            <div>Console: Apri DevTools per log dettagliati</div>
            <button 
              onClick={() => {
                console.log('[DEBUG] Full parsedPlan:', parsedPlan);
                console.log('[DEBUG] All recipes:', allRecipes);
                console.log('[DEBUG] Shopping list:', shoppingList);
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