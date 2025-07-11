'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Heart, Clock, Users, ChefHat, Sparkles, Star, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Header from '../components/header';

// Interfaccia Recipe locale
interface Recipe {
  id: string;
  nome: string;
  categoria: 'colazione' | 'pranzo' | 'cena' | 'spuntino';
  tipoCucina: 'italiana' | 'mediterranea' | 'asiatica' | 'americana' | 'messicana' | 'internazionale';
  difficolta: 'facile' | 'medio' | 'difficile';
  tempoPreparazione: number;
  porzioni: number;
  calorie: number;
  proteine: number;
  carboidrati: number;
  grassi: number;
  ingredienti: string[];
  preparazione: string;
  tipoDieta: ('vegetariana' | 'vegana' | 'senza_glutine' | 'keto' | 'paleo' | 'mediterranea')[];
  allergie: string[];
  stagione: ('primavera' | 'estate' | 'autunno' | 'inverno' | 'tutto_anno')[];
  tags: string[];
  imageUrl?: string;
  createdAt: Date;
  rating?: number;
  reviewCount?: number;
}

const RicettePage = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedFilters, setSelectedFilters] = useState({
    categoria: '',
    tipoCucina: '',
    difficolta: '',
    maxTempo: '',
    tipoDieta: [] as string[],
    allergie: [] as string[]
  });
  const [showAIRecommendations, setShowAIRecommendations] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    categories: [] as string[],
    cuisines: [] as string[],
    difficulties: [] as string[],
    diets: [] as string[],
    allergies: [] as string[]
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recipeDB, setRecipeDB] = useState<any>(null);

  // Inizializza database solo client-side
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        // Import dinamico per evitare errori SSR
        const { RecipeDatabase } = await import('../utils/recipeDatabase');
        const db = RecipeDatabase.getInstance();
        setRecipeDB(db);
        
        // Carica ricette dal database
        const allRecipes = db.searchRecipes({});
        setRecipes(allRecipes);
        setFilteredRecipes(allRecipes);
        
        // Carica opzioni filtri
        const options = db.getFilterOptions();
        setFilterOptions(options);
        
        // Carica preferiti
        const favoriteRecipes = db.getFavoriteRecipes();
        setFavorites(new Set(favoriteRecipes.map((r: Recipe) => r.id)));
        
        setIsLoading(false);
      } catch (error) {
        console.error('Errore caricamento database:', error);
        setIsLoading(false);
      }
    };

    initializeDatabase();
  }, []);

  // Suggerimenti AI
  const getAIRecommendations = () => {
    if (!recipeDB) return [];
    
    const favoriteRecipes = recipeDB.getFavoriteRecipes();
    const recommendedRecipes = recipeDB.getRecommendedRecipes(4);
    const seasonalRecipes = recipeDB.getSeasonalRecipes('inverno');
    
    return [
      {
        type: 'Basato sui tuoi preferiti',
        recipes: favoriteRecipes.slice(0, 4),
        reason: 'Ti piacciono i piatti mediterranei leggeri'
      },
      {
        type: 'Ricette più votate',
        recipes: recommendedRecipes,
        reason: 'Le ricette con rating più alto della community'
      },
      {
        type: 'Ricette stagionali',
        recipes: seasonalRecipes.slice(0, 4),
        reason: 'Ricette perfette per questa stagione'
      }
    ];
  };

  // Filtri intelligenti
  useEffect(() => {
    if (!recipeDB) return;
    
    const filters = {
      query: searchTerm,
      categoria: selectedFilters.categoria || undefined,
      tipoCucina: selectedFilters.tipoCucina || undefined,
      difficolta: selectedFilters.difficolta || undefined,
      maxTempo: selectedFilters.maxTempo ? parseInt(selectedFilters.maxTempo) : undefined,
      tipoDieta: selectedFilters.tipoDieta.length > 0 ? selectedFilters.tipoDieta : undefined,
      allergie: selectedFilters.allergie.length > 0 ? selectedFilters.allergie : undefined
    };

    let filtered = recipeDB.searchRecipes(filters);

    // Filtro solo preferiti
    if (showFavoritesOnly) {
      filtered = filtered.filter((recipe: Recipe) => favorites.has(recipe.id));
    }

    setFilteredRecipes(filtered);
  }, [searchTerm, selectedFilters, showFavoritesOnly, recipeDB, favorites]);

  const toggleFavorite = (recipeId: string) => {
    if (!recipeDB) return;
    
    const newFavorites = new Set(favorites);
    if (newFavorites.has(recipeId)) {
      newFavorites.delete(recipeId);
      recipeDB.removeFromFavorites(recipeId);
    } else {
      newFavorites.add(recipeId);
      recipeDB.addToFavorites(recipeId);
    }
    setFavorites(newFavorites);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setSelectedFilters({
      categoria: '',
      tipoCucina: '',
      difficolta: '',
      maxTempo: '',
      tipoDieta: [],
      allergie: []
    });
    setSearchTerm('');
    setShowFavoritesOnly(false);
  };

  const sortRecipes = (sortBy: string) => {
    let sorted = [...filteredRecipes];
    switch (sortBy) {
      case 'rating':
        sorted = sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'time':
        sorted = sorted.sort((a, b) => a.tempoPreparazione - b.tempoPreparazione);
        break;
      case 'calories':
        sorted = sorted.sort((a, b) => a.calorie - b.calorie);
        break;
      default:
        // Rilevanza - nessun ordinamento particolare
        break;
    }
    setFilteredRecipes(sorted);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <ChefHat className="w-16 h-16 text-green-400 mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold mb-2">Caricamento Database Ricette...</h2>
            <p className="text-gray-400">Preparando 500+ ricette deliziose per te!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <Header />
      
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
              {getAIRecommendations().map((rec, index) => (
                <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <h3 className="font-medium text-white mb-2">{rec.type}</h3>
                  <p className="text-sm text-gray-400 mb-3">{rec.reason}</p>
                  <div className="flex space-x-2">
                    {rec.recipes.slice(0, 3).map((recipe: Recipe) => (
                      <div key={recipe.id} className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                        <ChefHat className="w-6 h-6 text-green-400" />
                      </div>
                    ))}
                    {rec.recipes.length > 3 && (
                      <div className="w-12 h-12 bg-gray-700/50 rounded-lg flex items-center justify-center text-xs text-gray-400">
                        +{rec.recipes.length - 3}
                      </div>
                    )}
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

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {/* Categoria Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Categoria</label>
              <select 
                value={selectedFilters.categoria}
                onChange={(e) => handleFilterChange('categoria', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500"
              >
                <option value="">Tutte</option>
                {filterOptions.categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Tipo Cucina Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Cucina</label>
              <select 
                value={selectedFilters.tipoCucina}
                onChange={(e) => handleFilterChange('tipoCucina', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500"
              >
                <option value="">Tutte</option>
                {filterOptions.cuisines.map(cuisine => (
                  <option key={cuisine} value={cuisine}>{cuisine}</option>
                ))}
              </select>
            </div>

            {/* Difficolta Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Difficoltà</label>
              <select 
                value={selectedFilters.difficolta}
                onChange={(e) => handleFilterChange('difficolta', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500"
              >
                <option value="">Tutte</option>
                {filterOptions.difficulties.map(diff => (
                  <option key={diff} value={diff}>{diff}</option>
                ))}
              </select>
            </div>

            {/* Tempo Max Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tempo Max</label>
              <select 
                value={selectedFilters.maxTempo}
                onChange={(e) => handleFilterChange('maxTempo', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500"
              >
                <option value="">Qualsiasi</option>
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">60 min</option>
              </select>
            </div>

            {/* Tipo Dieta Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Dieta</label>
              <select 
                value={selectedFilters.tipoDieta[0] || ''}
                onChange={(e) => handleFilterChange('tipoDieta', e.target.value ? [e.target.value] : [])}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500"
              >
                <option value="">Tutte</option>
                {filterOptions.diets.map(diet => (
                  <option key={diet} value={diet}>{diet}</option>
                ))}
              </select>
            </div>

            {/* Allergie Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Evita</label>
              <select 
                value={selectedFilters.allergie[0] || ''}
                onChange={(e) => handleFilterChange('allergie', e.target.value ? [e.target.value] : [])}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500"
              >
                <option value="">Nessuna</option>
                {filterOptions.allergies.map(allergy => (
                  <option key={allergy} value={allergy}>{allergy}</option>
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
                  src={recipe.imageUrl || `https://images.unsplash.com/photo-1546554${recipe.id.slice(-3)}-6c5486b0b8e5?w=300&h=200&fit=crop&auto=format`} 
                  alt={recipe.nome}
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
                    {recipe.categoria}
                  </span>
                  <span className="bg-black/70 text-blue-400 px-2 py-1 rounded text-xs font-medium">
                    {recipe.tipoCucina}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-white mb-2 line-clamp-1">{recipe.nome}</h3>
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                  {recipe.ingredienti.slice(0, 3).join(', ')}...
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{recipe.tempoPreparazione} min</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{recipe.porzioni} porz.</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-white">{recipe.rating?.toFixed(1) || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-white">{recipe.calorie}</span>
                    <span className="text-xs text-gray-400">cal</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    recipe.difficolta === 'facile' ? 'bg-green-900/50 text-green-400 border border-green-500/30' :
                    recipe.difficolta === 'medio' ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-500/30' :
                    'bg-red-900/50 text-red-400 border border-red-500/30'
                  }`}>
                    {recipe.difficolta}
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