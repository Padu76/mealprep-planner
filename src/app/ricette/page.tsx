'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Heart, Clock, Users, ChefHat, Sparkles, Star, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const RicettePage = () => {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState(new Set());
  const [selectedFilters, setSelectedFilters] = useState({
    category: '',
    mealType: '',
    diet: '',
    difficulty: '',
    cookingTime: ''
  });
  const [showAIRecommendations, setShowAIRecommendations] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Database 500+ ricette
  const generateRecipes = () => {
    const categories = ['Primi', 'Secondi', 'Contorni', 'Dolci', 'Antipasti', 'Zuppe', 'Insalate', 'Smoothies'];
    const mealTypes = ['Colazione', 'Pranzo', 'Cena', 'Spuntino', 'Merenda'];
    const diets = ['Vegetariano', 'Vegano', 'Senza Glutine', 'Keto', 'Paleo', 'Mediterranea', 'Proteica', 'Low Carb'];
    const difficulties = ['Facile', 'Medio', 'Difficile'];
    const cookingTimes = ['15 min', '30 min', '45 min', '60 min', '90 min'];
    
    const sampleRecipes = [
      'Pasta al pomodoro', 'Risotto ai funghi', 'Pollo alla griglia', 'Salmone al forno', 'Insalata caprese',
      'Minestrone di verdure', 'Tiramisù', 'Panna cotta', 'Bruschette', 'Caesar salad', 'Carbonara',
      'Lasagne della nonna', 'Gnocchi al pesto', 'Scaloppine al limone', 'Melanzane parmigiana',
      'Smoothie bowl', 'Overnight oats', 'Pancakes proteici', 'Hummus di ceci', 'Quinoa bowl',
      'Zuppa di lenticchie', 'Curry di verdure', 'Tacos vegani', 'Buddha bowl', 'Chia pudding',
      'Frittata di verdure', 'Wrap proteico', 'Insalata di farro', 'Crema di zucca', 'Polpette vegane',
      'Ratatouille', 'Poké bowl', 'Zuppa di miso', 'Gazpacho', 'Tabulè', 'Cous cous alle verdure',
      'Spaghetti aglio e olio', 'Risotto al radicchio', 'Pesce al vapore', 'Torta di carote',
      'Biscotti integrali', 'Muffin ai mirtilli', 'Granola fatta in casa', 'Porridge di avena',
      'Insalata di quinoa', 'Vellutata di zucca', 'Branzino in crosta', 'Pollo al curry'
    ];

    const recipes = [];
    for (let i = 0; i < 500; i++) {
      const baseRecipe = sampleRecipes[i % sampleRecipes.length];
      recipes.push({
        id: i + 1,
        name: i < sampleRecipes.length ? baseRecipe : `${baseRecipe} (Variante ${Math.floor(i / sampleRecipes.length) + 1})`,
        category: categories[Math.floor(Math.random() * categories.length)],
        mealType: mealTypes[Math.floor(Math.random() * mealTypes.length)],
        diet: diets[Math.floor(Math.random() * diets.length)],
        difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
        cookingTime: cookingTimes[Math.floor(Math.random() * cookingTimes.length)],
        servings: Math.floor(Math.random() * 6) + 2,
        calories: Math.floor(Math.random() * 500) + 150,
        rating: (Math.random() * 2 + 3).toFixed(1),
        image: `https://images.unsplash.com/photo-${1565299624946 + (i * 100)}-6c5486b0b8e5?w=300&h=200&fit=crop&auto=format`,
        ingredients: [
          `Ingrediente principale ${i + 1}`,
          `Condimento ${i + 1}`,
          `Verdura ${i + 1}`,
          `Spezie ${i + 1}`
        ],
        tags: ['MealPrep', 'Facile', 'Sano'],
        prepTime: Math.floor(Math.random() * 30) + 5,
        description: `Ricetta deliziosa per ${baseRecipe.toLowerCase()}. Perfetta per meal prep e facile da preparare. Ingredienti freschi e genuini per un pasto sano e gustoso.`
      });
    }
    return recipes;
  };

  // Suggerimenti AI
  const aiRecommendations = [
    {
      type: 'Basato sui tuoi preferiti',
      recipes: [1, 5, 12, 8],
      reason: 'Ti piacciono i piatti mediterranei leggeri'
    },
    {
      type: 'Per i tuoi obiettivi fitness',
      recipes: [23, 45, 67, 89],
      reason: 'Ricette ad alto contenuto proteico'
    },
    {
      type: 'Nuove scoperte',
      recipes: [156, 234, 345, 456],
      reason: 'Ricette trending questa settimana'
    }
  ];

  useEffect(() => {
    const generatedRecipes = generateRecipes();
    setRecipes(generatedRecipes);
    setFilteredRecipes(generatedRecipes);
  }, []);

  // Filtri intelligenti
  useEffect(() => {
    let filtered = recipes;

    // Filtro solo preferiti
    if (showFavoritesOnly) {
      filtered = filtered.filter(recipe => favorites.has(recipe.id));
    }

    // Filtro ricerca
    if (searchTerm) {
      filtered = filtered.filter(recipe => 
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.ingredients.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase())) ||
        recipe.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtri categorie
    Object.keys(selectedFilters).forEach(key => {
      if (selectedFilters[key]) {
        filtered = filtered.filter(recipe => recipe[key] === selectedFilters[key]);
      }
    });

    setFilteredRecipes(filtered);
  }, [searchTerm, selectedFilters, recipes, favorites, showFavoritesOnly]);

  const toggleFavorite = (recipeId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(recipeId)) {
      newFavorites.delete(recipeId);
    } else {
      newFavorites.add(recipeId);
    }
    setFavorites(newFavorites);
  };

  const handleFilterChange = (filterType, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType] === value ? '' : value
    }));
  };

  const clearFilters = () => {
    setSelectedFilters({
      category: '',
      mealType: '',
      diet: '',
      difficulty: '',
      cookingTime: ''
    });
    setSearchTerm('');
    setShowFavoritesOnly(false);
  };

  const sortRecipes = (sortBy) => {
    let sorted = [...filteredRecipes];
    switch (sortBy) {
      case 'rating':
        sorted = sorted.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
        break;
      case 'time':
        sorted = sorted.sort((a, b) => parseInt(a.cookingTime) - parseInt(b.cookingTime));
        break;
      case 'calories':
        sorted = sorted.sort((a, b) => a.calories - b.calories);
        break;
      default:
        // Rilevanza - nessun ordinamento particolare
        break;
    }
    setFilteredRecipes(sorted);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <header className="bg-gray-900/90 backdrop-blur-md shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/images/icon-192x192.png" alt="Meal Prep Logo" className="w-10 h-10 rounded-full" />
            <h1 className="text-2xl font-bold">Meal Prep Planner</h1>
          </div>
          
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="hover:text-green-400 transition-colors">Home</Link>
            <Link href="/ricette" className="text-green-400 font-medium border-b-2 border-green-400 pb-2">Ricette</Link>
            <Link href="/dashboard" className="hover:text-green-400 transition-colors">Dashboard</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 mb-6">
          <Link href="/" className="text-gray-400 hover:text-green-400 flex items-center space-x-1">
            <ArrowLeft className="w-4 h-4" />
            <span>Torna alla Home</span>
          </Link>
          <span className="text-gray-500">/</span>
          <span className="text-green-400">Database Ricette</span>
        </div>

        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4" style={{color: '#8FBC8F'}}>
            🍳 Database Ricette
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Esplora oltre 500 ricette selezionate per il tuo meal prep. Filtra per categoria, dieta e difficoltà per trovare la ricetta perfetta.
          </p>
        </div>

        {/* AI Recommendations */}
        {showAIRecommendations && (
          <div className="mb-8 bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl p-6 border border-purple-500/30">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-semibold">Suggerimenti AI Personalizzati</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {aiRecommendations.map((rec, index) => (
                <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <h3 className="font-medium text-white mb-2">{rec.type}</h3>
                  <p className="text-sm text-gray-400 mb-3">{rec.reason}</p>
                  <div className="flex space-x-2">
                    {rec.recipes.slice(0, 3).map(recipeId => (
                      <div key={recipeId} className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                        <ChefHat className="w-6 h-6 text-green-400" />
                      </div>
                    ))}
                    <div className="w-12 h-12 bg-gray-700/50 rounded-lg flex items-center justify-center text-xs text-gray-400">
                      +{rec.recipes.length - 3}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca ricette, ingredienti..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-gray-800/50 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-medium">Filtri Intelligenti</h3>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowAIRecommendations(!showAIRecommendations)}
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Suggerimenti</span>
              </button>
              <button 
                onClick={clearFilters}
                className="text-green-400 hover:text-green-300 text-sm font-medium"
              >
                Cancella tutto
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Categoria</label>
              <select 
                value={selectedFilters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500"
              >
                <option value="">Tutte</option>
                {['Primi', 'Secondi', 'Contorni', 'Dolci', 'Antipasti', 'Zuppe', 'Insalate', 'Smoothies'].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Meal Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tipo Pasto</label>
              <select 
                value={selectedFilters.mealType}
                onChange={(e) => handleFilterChange('mealType', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500"
              >
                <option value="">Tutti</option>
                {['Colazione', 'Pranzo', 'Cena', 'Spuntino', 'Merenda'].map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Diet Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Dieta</label>
              <select 
                value={selectedFilters.diet}
                onChange={(e) => handleFilterChange('diet', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500"
              >
                <option value="">Tutte</option>
                {['Vegetariano', 'Vegano', 'Senza Glutine', 'Keto', 'Paleo', 'Mediterranea', 'Proteica', 'Low Carb'].map(diet => (
                  <option key={diet} value={diet}>{diet}</option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Difficoltà</label>
              <select 
                value={selectedFilters.difficulty}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500"
              >
                <option value="">Tutte</option>
                {['Facile', 'Medio', 'Difficile'].map(diff => (
                  <option key={diff} value={diff}>{diff}</option>
                ))}
              </select>
            </div>

            {/* Cooking Time Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tempo</label>
              <select 
                value={selectedFilters.cookingTime}
                onChange={(e) => handleFilterChange('cookingTime', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500"
              >
                <option value="">Qualsiasi</option>
                {['15 min', '30 min', '45 min', '60 min', '90 min'].map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <p className="text-gray-400">
            Trovate <span className="font-semibold text-white">{filteredRecipes.length}</span> ricette
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                showFavoritesOnly 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
              <span>Solo preferiti ({favorites.size})</span>
            </button>
            <select 
              onChange={(e) => sortRecipes(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-green-500"
            >
              <option value="relevance">Ordina per: Rilevanza</option>
              <option value="time">Tempo di preparazione</option>
              <option value="rating">Valutazione</option>
              <option value="calories">Calorie</option>
            </select>
          </div>
        </div>

        {/* Recipe Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRecipes.slice(0, 20).map((recipe) => (
            <div key={recipe.id} className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden hover:border-green-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20">
              <div className="relative">
                <img 
                  src={recipe.image} 
                  alt={recipe.name}
                  className="w-full h-48 object-cover"
                />
                <button 
                  onClick={() => toggleFavorite(recipe.id)}
                  className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
                    favorites.has(recipe.id) 
                      ? 'bg-red-500 text-white' 
                      : 'bg-black/50 text-gray-300 hover:text-red-400'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${favorites.has(recipe.id) ? 'fill-current' : ''}`} />
                </button>
                <div className="absolute bottom-3 left-3 flex space-x-2">
                  <span className="bg-black/70 text-green-400 px-2 py-1 rounded text-xs font-medium">
                    {recipe.category}
                  </span>
                  <span className="bg-black/70 text-blue-400 px-2 py-1 rounded text-xs font-medium">
                    {recipe.diet}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-white mb-2 line-clamp-1">{recipe.name}</h3>
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">{recipe.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{recipe.cookingTime}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{recipe.servings} porz.</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-white">{recipe.rating}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-white">{recipe.calories}</span>
                    <span className="text-xs text-gray-400">cal</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    recipe.difficulty === 'Facile' ? 'bg-green-900/50 text-green-400 border border-green-500/30' :
                    recipe.difficulty === 'Medio' ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-500/30' :
                    'bg-red-900/50 text-red-400 border border-red-500/30'
                  }`}>
                    {recipe.difficulty}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        {filteredRecipes.length > 20 && (
          <div className="text-center mt-8">
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors">
              Carica altre ricette ({filteredRecipes.length - 20} rimanenti)
            </button>
          </div>
        )}

        {/* No Results */}
        {filteredRecipes.length === 0 && (
          <div className="text-center py-12">
            <ChefHat className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">Nessuna ricetta trovata</h3>
            <p className="text-gray-500 mb-4">Prova a modificare i filtri o la ricerca</p>
            <button 
              onClick={clearFilters}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Cancella tutti i filtri
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RicettePage;