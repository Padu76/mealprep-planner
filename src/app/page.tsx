'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Trash2, Edit3, Save, X, ChefHat, ShoppingCart, Users, Target, Star, Utensils, Heart, CheckCircle } from 'lucide-react';

// Types
interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  image?: string;
}

interface MealPlan {
  id: string;
  date: string;
  meals: {
    breakfast?: Recipe;
    lunch?: Recipe;
    dinner?: Recipe;
    snack?: Recipe;
  };
}

interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  category: string;
  checked: boolean;
}

// Sample data
const sampleRecipes: Recipe[] = [
  {
    id: '1',
    name: 'Grilled Chicken Salad',
    ingredients: ['chicken breast', 'mixed greens', 'cherry tomatoes', 'cucumber', 'olive oil', 'lemon'],
    instructions: ['Season chicken with salt and pepper', 'Grill chicken for 6-8 minutes per side', 'Slice chicken and serve over greens', 'Drizzle with olive oil and lemon'],
    prepTime: 15,
    cookTime: 20,
    servings: 4,
    difficulty: 'Easy',
    tags: ['healthy', 'protein', 'gluten-free'],
    nutrition: { calories: 320, protein: 35, carbs: 8, fat: 15 }
  },
  {
    id: '2',
    name: 'Quinoa Buddha Bowl',
    ingredients: ['quinoa', 'sweet potato', 'chickpeas', 'avocado', 'tahini', 'spinach'],
    instructions: ['Cook quinoa according to package directions', 'Roast sweet potato and chickpeas', 'Assemble bowl with quinoa, vegetables, and tahini dressing'],
    prepTime: 20,
    cookTime: 30,
    servings: 2,
    difficulty: 'Medium',
    tags: ['vegan', 'healthy', 'fiber'],
    nutrition: { calories: 450, protein: 18, carbs: 65, fat: 12 }
  },
  {
    id: '3',
    name: 'Salmon with Roasted Vegetables',
    ingredients: ['salmon fillet', 'broccoli', 'bell peppers', 'zucchini', 'garlic', 'herbs'],
    instructions: ['Preheat oven to 400°F', 'Season salmon and vegetables', 'Roast for 15-20 minutes', 'Serve immediately'],
    prepTime: 10,
    cookTime: 20,
    servings: 4,
    difficulty: 'Easy',
    tags: ['seafood', 'omega-3', 'low-carb'],
    nutrition: { calories: 380, protein: 42, carbs: 12, fat: 18 }
  }
];

export default function MealPrepPlanner() {
  const [activeTab, setActiveTab] = useState('planner');
  const [recipes, setRecipes] = useState<Recipe[]>(sampleRecipes);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAddingRecipe, setIsAddingRecipe] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  // New recipe form state
  const [newRecipe, setNewRecipe] = useState<Partial<Recipe>>({
    name: '',
    ingredients: [''],
    instructions: [''],
    prepTime: 0,
    cookTime: 0,
    servings: 1,
    difficulty: 'Easy',
    tags: [],
  });

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedRecipes = localStorage.getItem('mealPrepRecipes');
    const savedMealPlans = localStorage.getItem('mealPrepPlans');
    const savedShoppingList = localStorage.getItem('mealPrepShopping');

    if (savedRecipes) {
      setRecipes(JSON.parse(savedRecipes));
    }
    if (savedMealPlans) {
      setMealPlans(JSON.parse(savedMealPlans));
    }
    if (savedShoppingList) {
      setShoppingList(JSON.parse(savedShoppingList));
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('mealPrepRecipes', JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    localStorage.setItem('mealPrepPlans', JSON.stringify(mealPlans));
  }, [mealPlans]);

  useEffect(() => {
    localStorage.setItem('mealPrepShopping', JSON.stringify(shoppingList));
  }, [shoppingList]);

  // Add new recipe
  const addRecipe = () => {
    if (newRecipe.name && newRecipe.ingredients && newRecipe.instructions) {
      const recipe: Recipe = {
        id: Date.now().toString(),
        name: newRecipe.name,
        ingredients: newRecipe.ingredients.filter(ing => ing.trim() !== ''),
        instructions: newRecipe.instructions.filter(inst => inst.trim() !== ''),
        prepTime: newRecipe.prepTime || 0,
        cookTime: newRecipe.cookTime || 0,
        servings: newRecipe.servings || 1,
        difficulty: newRecipe.difficulty || 'Easy',
        tags: newRecipe.tags || [],
      };
      setRecipes([...recipes, recipe]);
      setNewRecipe({
        name: '',
        ingredients: [''],
        instructions: [''],
        prepTime: 0,
        cookTime: 0,
        servings: 1,
        difficulty: 'Easy',
        tags: [],
      });
      setIsAddingRecipe(false);
    }
  };

  // Delete recipe
  const deleteRecipe = (id: string) => {
    setRecipes(recipes.filter(recipe => recipe.id !== id));
  };

  // Add meal to plan
  const addMealToPlan = (recipe: Recipe, mealType: keyof MealPlan['meals']) => {
    const existingPlan = mealPlans.find(plan => plan.date === selectedDate);
    
    if (existingPlan) {
      const updatedPlans = mealPlans.map(plan => 
        plan.date === selectedDate 
          ? { ...plan, meals: { ...plan.meals, [mealType]: recipe } }
          : plan
      );
      setMealPlans(updatedPlans);
    } else {
      const newPlan: MealPlan = {
        id: Date.now().toString(),
        date: selectedDate,
        meals: { [mealType]: recipe }
      };
      setMealPlans([...mealPlans, newPlan]);
    }
  };

  // Generate shopping list from meal plans
  const generateShoppingList = () => {
    const ingredients: { [key: string]: number } = {};
    
    mealPlans.forEach(plan => {
      Object.values(plan.meals).forEach(meal => {
        if (meal) {
          meal.ingredients.forEach(ingredient => {
            ingredients[ingredient] = (ingredients[ingredient] || 0) + 1;
          });
        }
      });
    });

    const newShoppingList: ShoppingItem[] = Object.entries(ingredients).map(([ingredient, count]) => ({
      id: Date.now().toString() + Math.random(),
      name: ingredient,
      quantity: count > 1 ? `${count} portions` : '1 portion',
      category: 'General',
      checked: false
    }));

    setShoppingList(newShoppingList);
    setActiveTab('shopping');
  };

  // Toggle shopping item
  const toggleShoppingItem = (id: string) => {
    setShoppingList(shoppingList.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  // Add ingredient input
  const addIngredientInput = () => {
    setNewRecipe({
      ...newRecipe,
      ingredients: [...(newRecipe.ingredients || []), '']
    });
  };

  // Add instruction input
  const addInstructionInput = () => {
    setNewRecipe({
      ...newRecipe,
      instructions: [...(newRecipe.instructions || []), '']
    });
  };

  // Update ingredient
  const updateIngredient = (index: number, value: string) => {
    const updatedIngredients = [...(newRecipe.ingredients || [])];
    updatedIngredients[index] = value;
    setNewRecipe({ ...newRecipe, ingredients: updatedIngredients });
  };

  // Update instruction
  const updateInstruction = (index: number, value: string) => {
    const updatedInstructions = [...(newRecipe.instructions || [])];
    updatedInstructions[index] = value;
    setNewRecipe({ ...newRecipe, instructions: updatedInstructions });
  };

  // Get current meal plan
  const getCurrentMealPlan = () => {
    return mealPlans.find(plan => plan.date === selectedDate);
  };

  // Navigation tabs
  const tabs = [
    { id: 'planner', label: 'Meal Planner', icon: Calendar },
    { id: 'recipes', label: 'Recipes', icon: ChefHat },
    { id: 'shopping', label: 'Shopping List', icon: ShoppingCart },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1f2937 0%, #111827 50%, #000000 100%)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        background: 'rgba(17, 24, 39, 0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #374151',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              padding: '8px',
              borderRadius: '8px'
            }}>
              <Utensils style={{ height: '24px', width: '24px' }} />
            </div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #6ee7b7 0%, #34d399 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Meal Prep Planner
            </h1>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              color: '#d1d5db'
            }}>
              <Users style={{ height: '16px', width: '16px' }} />
              <span>Plan • Cook • Enjoy</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav style={{
        background: 'rgba(31, 41, 55, 0.5)',
        borderBottom: '1px solid #374151'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 16px'
        }}>
          <div style={{
            display: 'flex',
            gap: '32px'
          }}>
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '16px 8px',
                    borderBottom: activeTab === tab.id ? '2px solid #10b981' : '2px solid transparent',
                    color: activeTab === tab.id ? '#34d399' : '#9ca3af',
                    background: 'none',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <Icon style={{ height: '20px', width: '20px' }} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '32px 16px'
      }}>
        {/* Meal Planner Tab */}
        {activeTab === 'planner' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Date Selection */}
            <div style={{
              background: 'rgba(31, 41, 55, 0.5)',
              backdropFilter: 'blur(4px)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #374151'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Calendar style={{ height: '24px', width: '24px', color: '#34d399' }} />
                  <span>Meal Planning</span>
                </h2>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{
                    background: '#374151',
                    border: '1px solid #4b5563',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* Current Day Plan */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px'
              }}>
                {['breakfast', 'lunch', 'dinner', 'snack'].map(mealType => {
                  const currentPlan = getCurrentMealPlan();
                  const meal = currentPlan?.meals[mealType as keyof MealPlan['meals']];

                  return (
                    <div key={mealType} style={{
                      background: 'rgba(55, 65, 81, 0.5)',
                      borderRadius: '12px',
                      padding: '16px',
                      border: '1px solid #4b5563'
                    }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        marginBottom: '12px',
                        textTransform: 'capitalize',
                        color: '#34d399'
                      }}>
                        {mealType}
                      </h3>
                      
                      {meal ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div style={{
                            background: 'rgba(75, 85, 99, 0.5)',
                            borderRadius: '8px',
                            padding: '12px'
                          }}>
                            <h4 style={{
                              fontSize: '16px',
                              fontWeight: '500',
                              color: 'white',
                              marginBottom: '8px'
                            }}>
                              {meal.name}
                            </h4>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '16px',
                              fontSize: '14px',
                              color: '#d1d5db'
                            }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock style={{ height: '16px', width: '16px' }} />
                                <span>{meal.prepTime + meal.cookTime}m</span>
                              </span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Users style={{ height: '16px', width: '16px' }} />
                                <span>{meal.servings}</span>
                              </span>
                            </div>
                            {meal.nutrition && (
                              <div style={{
                                marginTop: '8px',
                                fontSize: '12px',
                                color: '#9ca3af'
                              }}>
                                {meal.nutrition.calories} cal • {meal.nutrition.protein}g protein
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              const updatedPlans = mealPlans.map(plan => 
                                plan.date === selectedDate 
                                  ? { ...plan, meals: { ...plan.meals, [mealType]: undefined } }
                                  : plan
                              );
                              setMealPlans(updatedPlans);
                            }}
                            style={{
                              width: '100%',
                              background: 'rgba(239, 68, 68, 0.2)',
                              color: '#f87171',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              border: 'none',
                              fontSize: '14px',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '32px 0' }}>
                          <div style={{
                            color: '#6b7280',
                            marginBottom: '12px'
                          }}>
                            No meal planned
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {recipes.slice(0, 3).map(recipe => (
                              <button
                                key={recipe.id}
                                onClick={() => addMealToPlan(recipe, mealType as keyof MealPlan['meals'])}
                                style={{
                                  width: '100%',
                                  background: 'rgba(16, 185, 129, 0.2)',
                                  color: '#34d399',
                                  borderRadius: '8px',
                                  padding: '8px 12px',
                                  border: 'none',
                                  fontSize: '14px',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}
                              >
                                + {recipe.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Generate Shopping List */}
              <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <button
                  onClick={generateShoppingList}
                  style={{
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    color: 'white',
                    fontWeight: '600',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    margin: '0 auto',
                    transition: 'all 0.2s'
                  }}
                >
                  <ShoppingCart style={{ height: '20px', width: '20px' }} />
                  <span>Generate Shopping List</span>
                </button>
              </div>
            </div>

            {/* Weekly Overview */}
            <div style={{
              background: 'rgba(31, 41, 55, 0.5)',
              backdropFilter: 'blur(4px)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #374151'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Target style={{ height: '20px', width: '20px', color: '#34d399' }} />
                <span>This Week's Meals</span>
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '16px'
              }}>
                {Array.from({ length: 7 }, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - date.getDay() + i);
                  const dateStr = date.toISOString().split('T')[0];
                  const plan = mealPlans.find(p => p.date === dateStr);
                  const mealCount = plan ? Object.values(plan.meals).filter(Boolean).length : 0;

                  return (
                    <div key={i} style={{
                      background: 'rgba(55, 65, 81, 0.3)',
                      borderRadius: '8px',
                      padding: '12px',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#d1d5db',
                        marginBottom: '4px'
                      }}>
                        {date.toLocaleDateString('en', { weekday: 'short' })}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#9ca3af',
                        marginBottom: '8px'
                      }}>
                        {date.toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                      </div>
                      <div style={{ fontSize: '14px' }}>
                        {mealCount > 0 ? (
                          <span style={{ color: '#34d399' }}>{mealCount} meals</span>
                        ) : (
                          <span style={{ color: '#6b7280' }}>No meals</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Recipes Tab */}
        {activeTab === 'recipes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <ChefHat style={{ height: '24px', width: '24px', color: '#34d399' }} />
                <span>Recipe Collection</span>
              </h2>
              <button
                onClick={() => setIsAddingRecipe(true)}
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: 'white',
                  fontWeight: '600',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <Plus style={{ height: '20px', width: '20px' }} />
                <span>Add Recipe</span>
              </button>
            </div>

            {/* Recipe Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px'
            }}>
              {recipes.map(recipe => (
                <div key={recipe.id} style={{
                  background: 'rgba(31, 41, 55, 0.5)',
                  backdropFilter: 'blur(4px)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid #374151',
                  transition: 'all 0.2s'
                }}>
                  <div style={{ padding: '24px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '16px'
                    }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: 'white'
                      }}>
                        {recipe.name}
                      </h3>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => setEditingRecipe(recipe)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#9ca3af',
                            cursor: 'pointer',
                            padding: '4px',
                            transition: 'color 0.2s'
                          }}
                        >
                          <Edit3 style={{ height: '16px', width: '16px' }} />
                        </button>
                        <button
                          onClick={() => deleteRecipe(recipe.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#9ca3af',
                            cursor: 'pointer',
                            padding: '4px',
                            transition: 'color 0.2s'
                          }}
                        >
                          <Trash2 style={{ height: '16px', width: '16px' }} />
                        </button>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      fontSize: '14px',
                      color: '#d1d5db',
                      marginBottom: '16px'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock style={{ height: '16px', width: '16px' }} />
                        <span>{recipe.prepTime + recipe.cookTime}m</span>
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Users style={{ height: '16px', width: '16px' }} />
                        <span>{recipe.servings}</span>
                      </span>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: recipe.difficulty === 'Easy' ? 'rgba(34, 197, 94, 0.2)' :
                                   recipe.difficulty === 'Medium' ? 'rgba(234, 179, 8, 0.2)' :
                                   'rgba(239, 68, 68, 0.2)',
                        color: recipe.difficulty === 'Easy' ? '#4ade80' :
                               recipe.difficulty === 'Medium' ? '#facc15' :
                               '#f87171'
                      }}>
                        {recipe.difficulty}
                      </span>
                    </div>

                    {recipe.nutrition && (
                      <div style={{
                        background: 'rgba(55, 65, 81, 0.5)',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '16px'
                      }}>
                        <div style={{
                          fontSize: '14px',
                          color: '#d1d5db',
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '8px'
                        }}>
                          <span>{recipe.nutrition.calories} cal</span>
                          <span>{recipe.nutrition.protein}g protein</span>
                          <span>{recipe.nutrition.carbs}g carbs</span>
                          <span>{recipe.nutrition.fat}g fat</span>
                        </div>
                      </div>
                    )}

                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={{
                        fontSize: '16px',
                        fontWeight: '500',
                        color: '#34d399',
                        marginBottom: '8px'
                      }}>
                        Ingredients:
                      </h4>
                      <ul style={{
                        fontSize: '14px',
                        color: '#d1d5db',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}>
                        {recipe.ingredients.slice(0, 3).map((ingredient, index) => (
                          <li key={index} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <div style={{
                              width: '4px',
                              height: '4px',
                              background: '#34d399',
                              borderRadius: '50%'
                            }}></div>
                            <span>{ingredient}</span>
                          </li>
                        ))}
                        {recipe.ingredients.length > 3 && (
                          <li style={{ color: '#9ca3af' }}>
                            +{recipe.ingredients.length - 3} more
                          </li>
                        )}
                      </ul>
                    </div>

                    {recipe.tags.length > 0 && (
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px'
                      }}>
                        {recipe.tags.map((tag, index) => (
                          <span key={index} style={{
                            background: 'rgba(16, 185, 129, 0.2)',
                            color: '#34d399',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shopping List Tab */}
        {activeTab === 'shopping' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <ShoppingCart style={{ height: '24px', width: '24px', color: '#34d399' }} />
                <span>Shopping List</span>
              </h2>
              <button
                onClick={generateShoppingList}
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: 'white',
                  fontWeight: '600',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Regenerate List
              </button>
            </div>

            {shoppingList.length > 0 ? (
              <div style={{
                background: 'rgba(31, 41, 55, 0.5)',
                backdropFilter: 'blur(4px)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #374151'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {shoppingList.map(item => (
                    <div key={item.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      background: 'rgba(55, 65, 81, 0.3)',
                      borderRadius: '8px'
                    }}>
                      <button
                        onClick={() => toggleShoppingItem(item.id)}
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '4px',
                          border: item.checked ? '2px solid #10b981' : '2px solid #6b7280',
                          background: item.checked ? '#10b981' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {item.checked && <CheckCircle style={{ height: '12px', width: '12px', color: 'white' }} />}
                      </button>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: '500',
                          color: item.checked ? '#9ca3af' : 'white',
                          textDecoration: item.checked ? 'line-through' : 'none'
                        }}>
                          {item.name}
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#9ca3af'
                        }}>
                          {item.quantity}
                        </div>
                      </div>
                      <button
                        onClick={() => setShoppingList(shoppingList.filter(i => i.id !== item.id))}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#9ca3af',
                          cursor: 'pointer',
                          padding: '4px',
                          transition: 'color 0.2s'
                        }}
                      >
                        <Trash2 style={{ height: '16px', width: '16px' }} />
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{
                  marginTop: '24px',
                  paddingTop: '16px',
                  borderTop: '1px solid #4b5563',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '14px'
                }}>
                  <span style={{ color: '#9ca3af' }}>
                    {shoppingList.filter(item => item.checked).length} of {shoppingList.length} items completed
                  </span>
                  <span style={{ color: '#34d399' }}>
                    {Math.round((shoppingList.filter(item => item.checked).length / shoppingList.length) * 100)}% complete
                  </span>
                </div>
              </div>
            ) : (
              <div style={{
                background: 'rgba(31, 41, 55, 0.5)',
                backdropFilter: 'blur(4px)',
                borderRadius: '16px',
                padding: '48px',
                border: '1px solid #374151',
                textAlign: 'center'
              }}>
                <ShoppingCart style={{
                  height: '64px',
                  width: '64px',
                  color: '#6b7280',
                  margin: '0 auto 16px'
                }} />
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '500',
                  color: '#9ca3af',
                  marginBottom: '8px'
                }}>
                  No Shopping List Yet
                </h3>
                <p style={{
                  color: '#6b7280',
                  marginBottom: '24px'
                }}>
                  Plan some meals first, then generate your shopping list
                </p>
                <button
                  onClick={() => setActiveTab('planner')}
                  style={{
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    color: 'white',
                    fontWeight: '600',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Go to Meal Planner
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        background: 'rgba(17, 24, 39, 0.5)',
        borderTop: '1px solid #374151',
        marginTop: '64px'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '32px 16px',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <Heart style={{ height: '20px', width: '20px', color: '#f87171' }} />
            <span style={{ color: '#9ca3af' }}>Made with love for healthy eating</span>
          </div>
          <p style={{
            color: '#6b7280',
            fontSize: '14px'
          }}>
            Plan your meals, organize your recipes, and make healthy eating simple.
          </p>
        </div>
      </footer>
    </div>
  );
}