'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Heart, Clock, Users, ChefHat, Sparkles, Star, ArrowLeft, X } from 'lucide-react';
import Link from 'next/link';
import Header from '../components/header';

// Interfaccia Recipe locale - COMPLETA CON TUTTI I FILTRI
interface Recipe {
  id: string;
  nome: string;
  categoria: 'colazione' | 'pranzo' | 'cena' | 'spuntino';
  tipoCucina: 'italiana' | 'mediterranea' | 'asiatica' | 'americana' | 'messicana' | 'internazionale' | 'ricette_fit';
  difficolta: 'facile' | 'medio' | 'difficile';
  tempoPreparazione: number;
  porzioni: number;
  calorie: number;
  proteine: number;
  carboidrati: number;
  grassi: number;
  ingredienti: string[];
  preparazione: string;
  tipoDieta: ('vegetariana' | 'vegana' | 'senza_glutine' | 'keto' | 'paleo' | 'mediterranea' | 'low_carb' | 'chetogenica' | 'bilanciata')[];
  allergie: string[];
  stagione: ('primavera' | 'estate' | 'autunno' | 'inverno' | 'tutto_anno')[];
  tags: string[];
  imageUrl?: string;
  createdAt: Date;
  rating?: number;
  reviewCount?: number;
}

// 🖼️ COMPONENTE IMMAGINE RICETTA SEMPLIFICATO
const RecipeImage: React.FC<{ recipe: Recipe; className?: string }> = ({ recipe, className = '' }) => {
  // 📸 USA SEMPRE IMMAGINI STATICHE PER ORA (no API Unsplash)
  const imageUrl = recipe.imageUrl || getStaticImageUrl(recipe.nome, recipe.categoria);
  
  return (
    <img 
      src={imageUrl}
      alt={recipe.nome}
      className={`object-cover ${className}`}
      loading="lazy"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = getStaticImageUrl(recipe.nome, recipe.categoria);
      }}
    />
  );
};

// 🎯 FUNZIONE PER IMMAGINI STATICHE
function getStaticImageUrl(nome: string, categoria: string): string {
  const nomeLC = nome.toLowerCase();
  
  // 🍳 MAPPING SPECIFICO RICETTE → IMMAGINI
  if (nomeLC.includes('porridge') || nomeLC.includes('avena')) {
    return 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop&auto=format';
  }
  if (nomeLC.includes('pancakes')) {
    return 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&auto=format';
  }
  if (nomeLC.includes('power') && nomeLC.includes('bowl')) {
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&auto=format';
  }
  if (nomeLC.includes('protein') && nomeLC.includes('shake')) {
    return 'https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?w=400&h=300&fit=crop&auto=format';
  }
  if (nomeLC.includes('salmone')) {
    return 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop&auto=format';
  }
  if (nomeLC.includes('chicken') || nomeLC.includes('pollo')) {
    return 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400&h=300&fit=crop&auto=format';
  }
  if (nomeLC.includes('insalata') || nomeLC.includes('salad')) {
    return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&auto=format';
  }
  
  // 🥗 FALLBACK PER CATEGORIA
  const categoryImages = {
    'colazione': 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop&auto=format',
    'pranzo': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&auto=format',
    'cena': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop&auto=format',
    'spuntino': 'https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?w=400&h=300&fit=crop&auto=format'
  };
  
  return categoryImages[categoria] || categoryImages['pranzo'];
}

// 🧑‍🍳 FUNZIONE GENERA STEPS DA PREPARAZIONE
function generateSteps(preparazione: string, nomeRicetta: string): string[] {
  if (!preparazione) return ['Preparazione non disponibile'];
  
  if (preparazione.includes('1.') || preparazione.includes('Step')) {
    return preparazione.split(/\d+\.|\n/).filter(step => step.trim());
  }
  
  const frasi = preparazione.split(/[.!]/).filter(f => f.trim().length > 10);
  
  if (frasi.length <= 1) {
    const nomeLC = nomeRicetta.toLowerCase();
    if (nomeLC.includes('smoothie')) {
      return [
        'Lava e prepara tutti gli ingredienti freschi',
        'Aggiungi gli ingredienti nel frullatore nell\'ordine indicato',
        'Frulla per 1-2 minuti fino ad ottenere consistenza cremosa',
        'Versa nel bicchiere e servi immediatamente'
      ];
    } else if (nomeLC.includes('insalata') || nomeLC.includes('bowl')) {
      return [
        'Lava e taglia tutte le verdure e ingredienti freschi',
        'Prepara la base della bowl o insalata',
        'Aggiungi le proteine e i condimenti',
        'Mescola delicatamente e servi fresco'
      ];
    } else {
      return [
        'Prepara e pulisci tutti gli ingredienti necessari',
        preparazione.trim(),
        'Controlla la cottura e aggiusta di sale e pepe',
        'Servi nel piatto e guarnisci a piacere'
      ];
    }
  }
  
  return frasi.map(frase => frase.trim()).filter(f => f.length > 0);
}

// 🔄 FUNZIONE ORDINAMENTO RICETTE
const sortRecipes = (recipes: Recipe[], sortBy: string): Recipe[] => {
  let sorted = [...recipes];
  switch (sortBy) {
    case 'rating':
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case 'time':
      return sorted.sort((a, b) => a.tempoPreparazione - b.tempoPreparazione);
    case 'calories':
      return sorted.sort((a, b) => a.calorie - b.calorie);
    default:
      return sorted;
  }
};

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
  
  // 🎛️ OPZIONI FILTRI FISSE GARANTITE
  const [filterOptions] = useState({
    categories: ['colazione', 'pranzo', 'cena', 'spuntino'],
    cuisines: ['italiana', 'mediterranea', 'asiatica', 'americana', 'messicana', 'internazionale', 'ricette_fit'],
    difficulties: ['facile', 'medio', 'difficile'],
    diets: ['vegetariana', 'vegana', 'senza_glutine', 'keto', 'paleo', 'mediterranea', 'low_carb', 'chetogenica', 'bilanciata'],
    allergies: ['latte', 'uova', 'frutta_secca', 'pesce', 'glutine']
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [recipeDB, setRecipeDB] = useState<any>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);

  // 🏗️ INIZIALIZZA DATABASE
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        console.log('🚀 [UI FIX] Starting database initialization...');
        
        const { RecipeDatabase } = await import('../utils/recipeDatabase');
        const db = RecipeDatabase.getInstance();
        setRecipeDB(db);
        
        // Carica ricette
        const allRecipes = db.searchRecipes({});
        console.log(`📚 [UI FIX] Loaded ${allRecipes.length} recipes from database`);
        setRecipes(allRecipes);
        setFilteredRecipes(allRecipes);
        
        // Carica preferiti
        const favoriteRecipes = db.getFavoriteRecipes();
        setFavorites(new Set(favoriteRecipes.map((r: Recipe) => r.id)));
        
        // ✅ LOG FILTRI CARICATI
        const dbOptions = db.getFilterOptions();
        console.log('🎛️ [UI FIX] Database filter options:', dbOptions);
        console.log('🎛️ [UI FIX] UI filter options (fixed):', filterOptions);
        
        setIsLoading(false);
        console.log('✅ [UI FIX] Database initialization completed successfully');
        
      } catch (error) {
        console.error('🚨 [UI FIX] Database initialization error:', error);
        setIsLoading(false);
      }
    };

    initializeDatabase();
  }, []);

  // 🔍 FILTRI INTELLIGENTI
  useEffect(() => {
    if (!recipeDB || recipes.length === 0) return;
    
    console.log(`🔍 [UI FIX] Applying filters:`, selectedFilters);
    
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

    console.log(`🎯 [UI FIX] Filtered results: ${filtered.length} recipes`);
    setFilteredRecipes(filtered);
  }, [searchTerm, selectedFilters, showFavoritesOnly, recipeDB, favorites, recipes]);

  // 🤖 AI RECOMMENDATIONS (placeholder)
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

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

  // 🎛️ GESTIONE FILTRI
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
    console.log(`🎛️ [UI FIX] Filter change: ${filterType} = ${value}`);
    
    if (filterType === 'tipoDieta') {
      setSelectedFilters(prev => ({
        ...prev,
        tipoDieta: value ? [value] : []
      }));
    } else if (filterType === 'allergie') {
      setSelectedFilters(prev => ({
        ...prev,
        allergie: value ? [value] : []
      }));
    } else {
      setSelectedFilters(prev => ({
        ...prev,
        [filterType]: value
      }));
    }
  };

  const clearFilters = () => {
    console.log('🧹 [UI FIX] Clearing all filters');
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

  // 📖 MODAL RICETTA
  const openRecipeModal = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setShowRecipeModal(true);
  };

  const closeRecipeModal = () => {
    setSelectedRecipe(null);
    setShowRecipeModal(false);
  };

  // 🔄 ORDINAMENTO
  const handleSort = (sortBy: string) => {
    console.log(`🔄 [UI FIX] Sorting by: ${sortBy}`);
    const sorted = sortRecipes(filteredRecipes, sortBy);
    setFilteredRecipes(sorted);
  };

  // 📱 LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <ChefHat className="w-16 h-16 text-green-400 mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold mb-2">Caricamento Database Ricette...</h2>
            <p className="text-gray-400">Preparando ricette deliziose per te!</p>
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
            Esplora ricette selezionate per il tuo meal prep. Filtra per categoria, dieta e difficoltà.
          </p>
        </div>

        {/* AI Recommendations */}
        {showAIRecommendations && (
          <div className="mb-8 bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl p-6 border border-purple-500/30">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-semibold">Suggerimenti AI Personalizzati</h2>
              {isLoadingAI && <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>}
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {getAIRecommendations().map((rec, index) => (
                <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <h3 className="font-medium text-white mb-2">{rec.type}</h3>
                  <p className="text-sm text-gray-400 mb-3">{rec.reason}</p>
                  <div className="flex space-x-2">
                    {rec.recipes.slice(0, 3).map((recipe: any, i: number) => (
                      <div key={recipe.id || i} className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
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

        {/* 🎛️ FILTRI GARANTITI */}
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
            {/* 📂 CATEGORIA */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Categoria</label>
              <select 
                value={selectedFilters.categoria}
                onChange={(e) => handleFilterChange('categoria', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500"
              >
                <option value="">Tutte</option>
                {filterOptions.categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* 🍳 CUCINA (CON RICETTE FIT) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Cucina</label>
              <select 
                value={selectedFilters.tipoCucina}
                onChange={(e) => handleFilterChange('tipoCucina', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500"
              >
                <option value="">Tutte</option>
                {filterOptions.cuisines.map(cuisine => (
                  <option key={cuisine} value={cuisine}>
                    {cuisine === 'ricette_fit' ? 'Ricette Fit' : 
                     cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* ⚙️ DIFFICOLTÀ */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Difficoltà</label>
              <select 
                value={selectedFilters.difficolta}
                onChange={(e) => handleFilterChange('difficolta', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500"
              >
                <option value="">Tutte</option>
                {filterOptions.difficulties.map(diff => (
                  <option key={diff} value={diff}>
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* ⏱️ TEMPO MAX */}
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

            {/* 🥗 DIETA (CON NUOVI FILTRI) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Dieta</label>
              <select 
                value={selectedFilters.tipoDieta[0] || ''}
                onChange={(e) => handleFilterChange('tipoDieta', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500"
              >
                <option value="">Tutte</option>
                {filterOptions.diets.map(diet => (
                  <option key={diet} value={diet}>
                    {diet === 'low_carb' ? 'Low Carb' :
                     diet === 'senza_glutine' ? 'Senza Glutine' :
                     diet.charAt(0).toUpperCase() + diet.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* 🚫 ALLERGIE */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Evita</label>
              <select 
                value={selectedFilters.allergie[0] || ''}
                onChange={(e) => handleFilterChange('allergie', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-green-500"
              >
                <option value="">Nessuna</option>
                {filterOptions.allergies.map(allergy => (
                  <option key={allergy} value={allergy}>
                    {allergy === 'frutta_secca' ? 'Frutta Secca' :
                     allergy.charAt(0).toUpperCase() + allergy.slice(1)}
                  </option>
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
              onChange={(e) => handleSort(e.target.value)}
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
            <div 
              key={recipe.id} 
              className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden hover:border-green-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 cursor-pointer"
              onClick={() => openRecipeModal(recipe)}
            >
              <div className="relative">
                <RecipeImage 
                  recipe={recipe}
                  className="w-full h-48"
                />
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(recipe.id);
                  }}
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
                    {recipe.tipoCucina === 'ricette_fit' ? 'Fit' : recipe.tipoCucina}
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

      {/* 📖 MODAL RICETTA COMPLETA */}
      {showRecipeModal && selectedRecipe && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header Modal */}
            <div className="relative">
              <RecipeImage 
                recipe={selectedRecipe}
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              
              <button
                onClick={closeRecipeModal}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => toggleFavorite(selectedRecipe.id)}
                className={`absolute top-4 left-4 p-2 rounded-full transition-colors ${
                  favorites.has(selectedRecipe.id) 
                    ? 'bg-red-500 text-white' 
                    : 'bg-black/50 text-gray-300 hover:text-red-400'
                }`}
              >
                <Heart className={`w-5 h-5 ${favorites.has(selectedRecipe.id) ? 'fill-current' : ''}`} />
              </button>

              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-2xl font-bold text-white mb-2">{selectedRecipe.nome}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-200">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{selectedRecipe.tempoPreparazione} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{selectedRecipe.porzioni} porz.</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span>{selectedRecipe.rating?.toFixed(1) || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">{selectedRecipe.calorie} cal</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Modal */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Ingredienti */}
                <div>
                  <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                    🥘 Ingredienti
                  </h3>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <ul className="space-y-2">
                      {selectedRecipe.ingredienti.map((ingrediente, index) => (
                        <li key={index} className="flex items-center gap-3 text-gray-300">
                          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                          <span>{ingrediente}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Macro Nutrizionali */}
                  <div className="mt-6">
                    <h4 className="font-semibold text-white mb-3">📊 Valori Nutrizionali</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-700 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-blue-400">{selectedRecipe.proteine}g</div>
                        <div className="text-xs text-gray-400">Proteine</div>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-purple-400">{selectedRecipe.carboidrati}g</div>
                        <div className="text-xs text-gray-400">Carboidrati</div>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-yellow-400">{selectedRecipe.grassi}g</div>
                        <div className="text-xs text-gray-400">Grassi</div>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-green-400">{selectedRecipe.calorie}</div>
                        <div className="text-xs text-gray-400">Calorie</div>
                      </div>
                    </div>
                  </div>

                  {/* Tag e Info */}
                  <div className="mt-6">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">
                        {selectedRecipe.categoria}
                      </span>
                      <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                        {selectedRecipe.tipoCucina === 'ricette_fit' ? 'Ricette Fit' : selectedRecipe.tipoCucina}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs text-white ${
                        selectedRecipe.difficolta === 'facile' ? 'bg-green-600' :
                        selectedRecipe.difficolta === 'medio' ? 'bg-yellow-600' : 'bg-red-600'
                      }`}>
                        {selectedRecipe.difficolta}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Preparazione */}
                <div>
                  <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                    👨‍🍳 Preparazione
                  </h3>
                  <div className="bg-gray-700 rounded-lg p-4">
                    {selectedRecipe.preparazione ? (
                      <div className="space-y-3">
                        {generateSteps(selectedRecipe.preparazione, selectedRecipe.nome).map((step, index) => (
                          <div key={index} className="flex gap-3">
                            <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </span>
                            <p className="text-gray-300 flex-1">{step}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 italic">Preparazione non disponibile</p>
                    )}
                  </div>

                  {/* Consigli del Chef */}
                  <div className="mt-6 bg-amber-900/20 border border-amber-700 rounded-lg p-4">
                    <h4 className="font-semibold text-amber-400 mb-2 flex items-center gap-2">
                      👨‍🍳 Consigli del Chef
                    </h4>
                    <div className="text-sm text-gray-300 space-y-1">
                      <p>• Prepara tutti gli ingredienti prima di iniziare</p>
                      <p>• {selectedRecipe.categoria === 'colazione' ? 'Perfetto per iniziare la giornata con energia' :
                          selectedRecipe.categoria === 'pranzo' ? 'Ideale per un pranzo nutriente e saziante' :
                          selectedRecipe.categoria === 'cena' ? 'Ottimo per una cena leggera ma completa' :
                          'Spuntino perfetto per ricaricare le energie'}</p>
                      <p>• Conserva in frigorifero per max 2-3 giorni</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-6 border-t border-gray-700 bg-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Ricetta aggiunta il {selectedRecipe.createdAt.toLocaleDateString('it-IT')}
                </div>
                <button
                  onClick={closeRecipeModal}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Chiudi Ricetta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RicettePage;