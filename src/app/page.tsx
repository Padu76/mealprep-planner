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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <header className="bg-gray-900/90 backdrop-blur-md shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-2 rounded-lg">
              <Utensils className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Meal Prep Planner
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <Users className="h-4 w-4" />
              <span>Plan • Cook • Enjoy</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800/50 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Meal Planner Tab */}
        {activeTab === 'planner' && (
          <div className="space-y-8">
            {/* Date Selection */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center space-x-2">
                  <Calendar className="h-6 w-6 text-emerald-400" />
                  <span>Meal Planning</span>
                </h2>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {/* Current Day Plan */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {['breakfast', 'lunch', 'dinner', 'snack'].map(mealType => {
                  const currentPlan = getCurrentMealPlan();
                  const meal = currentPlan?.meals[mealType as keyof MealPlan['meals']];

                  return (
                    <div key={mealType} className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
                      <h3 className="font-semibold text-lg mb-3 capitalize text-emerald-400">
                        {mealType}
                      </h3>
                      
                      {meal ? (
                        <div className="space-y-3">
                          <div className="bg-gray-600/50 rounded-lg p-3">
                            <h4 className="font-medium text-white mb-2">{meal.name}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-300">
                              <span className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{meal.prepTime + meal.cookTime}m</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Users className="h-4 w-4" />
                                <span>{meal.servings}</span>
                              </span>
                            </div>
                            {meal.nutrition && (
                              <div className="mt-2 text-xs text-gray-400">
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
                            className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg py-2 px-3 transition-colors text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="text-gray-500 mb-3">No meal planned</div>
                          <div className="space-y-2">
                            {recipes.slice(0, 3).map(recipe => (
                              <button
                                key={recipe.id}
                                onClick={() => addMealToPlan(recipe, mealType as keyof MealPlan['meals'])}
                                className="w-full bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-lg py-2 px-3 transition-colors text-sm"
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
              <div className="mt-6 text-center">
                <button
                  onClick={generateShoppingList}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center space-x-2 mx-auto"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>Generate Shopping List</span>
                </button>
              </div>
            </div>

            {/* Weekly Overview */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                <Target className="h-5 w-5 text-emerald-400" />
                <span>This Week's Meals</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {Array.from({ length: 7 }, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - date.getDay() + i);
                  const dateStr = date.toISOString().split('T')[0];
                  const plan = mealPlans.find(p => p.date === dateStr);
                  const mealCount = plan ? Object.values(plan.meals).filter(Boolean).length : 0;

                  return (
                    <div key={i} className="bg-gray-700/30 rounded-lg p-3 text-center">
                      <div className="text-sm font-medium text-gray-300 mb-1">
                        {date.toLocaleDateString('en', { weekday: 'short' })}
                      </div>
                      <div className="text-xs text-gray-400 mb-2">
                        {date.toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-sm">
                        {mealCount > 0 ? (
                          <span className="text-emerald-400">{mealCount} meals</span>
                        ) : (
                          <span className="text-gray-500">No meals</span>
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
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center space-x-2">
                <ChefHat className="h-6 w-6 text-emerald-400" />
                <span>Recipe Collection</span>
              </h2>
              <button
                onClick={() => setIsAddingRecipe(true)}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Add Recipe</span>
              </button>
            </div>

            {/* Add Recipe Form */}
            {isAddingRecipe && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold mb-4">Add New Recipe</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Recipe Name</label>
                      <input
                        type="text"
                        value={newRecipe.name || ''}
                        onChange={(e) => setNewRecipe({ ...newRecipe, name: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Enter recipe name"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Prep Time (min)</label>
                        <input
                          type="number"
                          value={newRecipe.prepTime || 0}
                          onChange={(e) => setNewRecipe({ ...newRecipe, prepTime: parseInt(e.target.value) })}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Cook Time (min)</label>
                        <input
                          type="number"
                          value={newRecipe.cookTime || 0}
                          onChange={(e) => setNewRecipe({ ...newRecipe, cookTime: parseInt(e.target.value) })}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Servings</label>
                        <input
                          type="number"
                          value={newRecipe.servings || 1}
                          onChange={(e) => setNewRecipe({ ...newRecipe, servings: parseInt(e.target.value) })}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Difficulty</label>
                      <select
                        value={newRecipe.difficulty || 'Easy'}
                        onChange={(e) => setNewRecipe({ ...newRecipe, difficulty: e.target.value as Recipe['difficulty'] })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Ingredients</label>
                      {(newRecipe.ingredients || ['']).map((ingredient, index) => (
                        <div key={index} className="flex space-x-2 mb-2">
                          <input
                            type="text"
                            value={ingredient}
                            onChange={(e) => updateIngredient(index, e.target.value)}
                            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="Enter ingredient"
                          />
                          {index === (newRecipe.ingredients || []).length - 1 && (
                            <button
                              onClick={addIngredientInput}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Instructions</label>
                      {(newRecipe.instructions || ['']).map((instruction, index) => (
                        <div key={index} className="flex space-x-2 mb-2">
                          <textarea
                            value={instruction}
                            onChange={(e) => updateInstruction(index, e.target.value)}
                            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="Enter instruction step"
                            rows={2}
                          />
                          {index === (newRecipe.instructions || []).length - 1 && (
                            <button
                              onClick={addInstructionInput}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    onClick={() => setIsAddingRecipe(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={addRecipe}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Recipe</span>
                  </button>
                </div>
              </div>
            )}

            {/* Recipe Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map(recipe => (
                <div key={recipe.id} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700 hover:border-emerald-500/50 transition-all duration-200">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold text-white">{recipe.name}</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingRecipe(recipe)}
                          className="text-gray-400 hover:text-emerald-400 transition-colors"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteRecipe(recipe.id)}
                          className="text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-300 mb-4">
                      <span className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{recipe.prepTime + recipe.cookTime}m</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{recipe.servings}</span>
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        recipe.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                        recipe.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {recipe.difficulty}
                      </span>
                    </div>

                    {recipe.nutrition && (
                      <div className="bg-gray-700/50 rounded-lg p-3 mb-4">
                        <div className="text-sm text-gray-300">
                          <div className="grid grid-cols-2 gap-2">
                            <span>{recipe.nutrition.calories} cal</span>
                            <span>{recipe.nutrition.protein}g protein</span>
                            <span>{recipe.nutrition.carbs}g carbs</span>
                            <span>{recipe.nutrition.fat}g fat</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <h4 className="font-medium text-emerald-400">Ingredients:</h4>
                      <ul className="text-sm text-gray-300 space-y-1">
                        {recipe.ingredients.slice(0, 3).map((ingredient, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
                            <span>{ingredient}</span>
                          </li>
                        ))}
                        {recipe.ingredients.length > 3 && (
                          <li className="text-gray-400">+{recipe.ingredients.length - 3} more</li>
                        )}
                      </ul>
                    </div>

                    {recipe.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {recipe.tags.map((tag, index) => (
                          <span key={index} className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs">
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
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center space-x-2">
                <ShoppingCart className="h-6 w-6 text-emerald-400" />
                <span>Shopping List</span>
              </h2>
              <button
                onClick={generateShoppingList}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
              >
                Regenerate List
              </button>
            </div>

            {shoppingList.length > 0 ? (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                <div className="space-y-3">
                  {shoppingList.map(item => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                      <button
                        onClick={() => toggleShoppingItem(item.id)}
                        className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          item.checked 
                            ? 'bg-emerald-500 border-emerald-500' 
                            : 'border-gray-400 hover:border-emerald-400'
                        }`}
                      >
                        {item.checked && <CheckCircle className="h-3 w-3 text-white" />}
                      </button>
                      <div className="flex-1">
                        <div className={`font-medium ${item.checked ? 'line-through text-gray-400' : 'text-white'}`}>
                          {item.name}
                        </div>
                        <div className="text-sm text-gray-400">{item.quantity}</div>
                      </div>
                      <button
                        onClick={() => setShoppingList(shoppingList.filter(i => i.id !== item.id))}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-600">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      {shoppingList.filter(item => item.checked).length} of {shoppingList.length} items completed
                    </span>
                    <span className="text-emerald-400">
                      {Math.round((shoppingList.filter(item => item.checked).length / shoppingList.length) * 100)}% complete
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 border border-gray-700 text-center">
                <ShoppingCart className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-400 mb-2">No Shopping List Yet</h3>
                <p className="text-gray-500 mb-6">Plan some meals first, then generate your shopping list</p>
                <button
                  onClick={() => setActiveTab('planner')}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
                >
                  Go to Meal Planner
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900/50 border-t border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Heart className="h-5 w-5 text-red-400" />
              <span className="text-gray-400">Made with love for healthy eating</span>
            </div>
            <p className="text-gray-500 text-sm">
              Plan your meals, organize your recipes, and make healthy eating simple.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}