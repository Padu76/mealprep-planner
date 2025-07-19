'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Heart, Clock, Users, ChefHat, Sparkles, Star, ArrowLeft, X } from 'lucide-react';
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

// 📸 HOOK PERSONALIZZATO UNSPLASH
const useUnsplashImage = (recipeName: string, categoria: string) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // 🎯 MAPPING RICETTA → QUERY UNSPLASH MIGLIORATO
  const getUnsplashQuery = useCallback((nome: string, cat: string): string => {
    const nomeLC = nome.toLowerCase();
    
    // 🥩 CARNE E PROTEINE SPECIFICHE
    if (nomeLC.includes('tagliata') && nomeLC.includes('manzo')) return 'grilled beef steak arugula';
    if (nomeLC.includes('tagliata')) return 'beef tagliata meal';
    if (nomeLC.includes('manzo') && nomeLC.includes('rucola')) return 'beef arugula salad';
    if (nomeLC.includes('burger') && nomeLC.includes('lenticchie')) return 'lentil burger healthy';
    if (nomeLC.includes('frittata') && nomeLC.includes('verdure')) return 'vegetable frittata eggs';
    if (nomeLC.includes('frittata')) return 'italian frittata';
    
    // 🍝 PASTA E RISOTTI
    if (nomeLC.includes('risotto') && nomeLC.includes('funghi')) return 'mushroom risotto italian';
    if (nomeLC.includes('pasta') && nomeLC.includes('verdure')) return 'pasta vegetables healthy';
    if (nomeLC.includes('pasta') && nomeLC.includes('integrale')) return 'whole grain pasta';
    
    // 🥗 INSALATE E BOWL
    if (nomeLC.includes('buddha') && nomeLC.includes('bowl')) return 'buddha bowl quinoa vegetables';
    if (nomeLC.includes('quinoa') && nomeLC.includes('bowl')) return 'quinoa bowl protein healthy';
    if (nomeLC.includes('insalata') && nomeLC.includes('tonno')) return 'tuna salad healthy meal';
    if (nomeLC.includes('insalata') && nomeLC.includes('legumi')) return 'bean salad protein';
    
    // 🐟 PESCE
    if (nomeLC.includes('salmone') && nomeLC.includes('grigliato')) return 'grilled salmon fillet';
    if (nomeLC.includes('salmone')) return 'salmon healthy meal';
    if (nomeLC.includes('branzino')) return 'sea bass fish dinner';
    if (nomeLC.includes('merluzzo')) return 'cod fish healthy';
    if (nomeLC.includes('tonno')) return 'tuna steak grilled';
    
    // 🍳 COLAZIONI
    if (nomeLC.includes('porridge') && nomeLC.includes('proteico')) return 'protein oatmeal breakfast';
    if (nomeLC.includes('porridge')) return 'oatmeal berries healthy';
    if (nomeLC.includes('pancakes') && nomeLC.includes('proteici')) return 'protein pancakes fitness';
    if (nomeLC.includes('pancakes')) return 'healthy pancakes breakfast';
    if (nomeLC.includes('yogurt') && nomeLC.includes('greco')) return 'greek yogurt berries nuts';
    if (nomeLC.includes('yogurt')) return 'yogurt healthy breakfast bowl';
    if (nomeLC.includes('smoothie') && nomeLC.includes('verde')) return 'green smoothie spinach healthy';
    if (nomeLC.includes('smoothie') && nomeLC.includes('proteico')) return 'protein smoothie post workout';
    if (nomeLC.includes('smoothie')) return 'healthy smoothie bowl';
    if (nomeLC.includes('toast') && nomeLC.includes('avocado')) return 'avocado toast healthy breakfast';
    if (nomeLC.includes('overnight') && nomeLC.includes('oats')) return 'overnight oats jar breakfast';
    
    // 🥜 SPUNTINI E SNACK
    if (nomeLC.includes('energy') && nomeLC.includes('balls')) return 'energy balls protein healthy';
    if (nomeLC.includes('hummus') && nomeLC.includes('ceci')) return 'hummus chickpeas vegetables';
    if (nomeLC.includes('hummus')) return 'hummus healthy snack';
    if (nomeLC.includes('shake') && nomeLC.includes('proteico')) return 'protein shake fitness';
    if (nomeLC.includes('ricotta') && nomeLC.includes('noci')) return 'ricotta cheese nuts healthy';
    if (nomeLC.includes('cottage') && nomeLC.includes('cheese')) return 'cottage cheese cucumber';
    if (nomeLC.includes('mela') && nomeLC.includes('protein')) return 'apple peanut butter protein';
    if (nomeLC.includes('muffin') && nomeLC.includes('protein')) return 'protein muffins healthy';
    
    // 🌮 WRAP E TOAST
    if (nomeLC.includes('wrap') && nomeLC.includes('pollo')) return 'chicken wrap healthy';
    if (nomeLC.includes('wrap')) return 'healthy wrap vegetables';
    if (nomeLC.includes('toast')) return 'healthy toast breakfast';
    
    // 🍲 ZUPPE E PIATTI CALDI
    if (nomeLC.includes('zuppa') && nomeLC.includes('lenticchie')) return 'lentil soup healthy bowl';
    if (nomeLC.includes('zuppa')) return 'healthy soup vegetables';
    
    // 🍖 PROTEINE GENERICHE
    if (nomeLC.includes('pollo') && nomeLC.includes('grigliato')) return 'grilled chicken breast healthy';
    if (nomeLC.includes('pollo')) return 'chicken healthy meal protein';
    if (nomeLC.includes('tacchino')) return 'turkey breast healthy meal';
    if (nomeLC.includes('tofu') && nomeLC.includes('teriyaki')) return 'teriyaki tofu vegetables asian';
    if (nomeLC.includes('tofu')) return 'grilled tofu healthy protein';
    if (nomeLC.includes('manzo') || nomeLC.includes('beef')) return 'lean beef healthy meal';
    if (nomeLC.includes('gamber') || nomeLC.includes('shrimp')) return 'grilled shrimp healthy seafood';
    
    // 🥘 CUCINE INTERNAZIONALI
    if (nomeLC.includes('caesar') && nomeLC.includes('salad')) return 'caesar salad protein chicken';
    if (nomeLC.includes('poke') && nomeLC.includes('bowl')) return 'poke bowl salmon healthy';
    if (nomeLC.includes('chia') && nomeLC.includes('pudding')) return 'chia pudding healthy breakfast';
    
    // 🥗 FALLBACK PER CATEGORIA CON QUERY PIÙ SPECIFICHE
    const categoryQueries = {
      'colazione': 'healthy breakfast oats protein',
      'pranzo': 'healthy lunch salad protein',
      'cena': 'healthy dinner fish vegetables',
      'spuntino': 'healthy protein snack nuts'
    };
    
    return categoryQueries[cat] || 'healthy meal protein vegetables';
  }, []);

  useEffect(() => {
    const fetchUnsplashImage = async () => {
      try {
        setIsLoading(true);
        setError(false);
        
        const query = getUnsplashQuery(recipeName, categoria);
        console.log(`🔍 Fetching Unsplash image for: "${recipeName}" → query: "${query}"`);
        
        // 📸 CHIAMATA UNSPLASH API
        const response = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
          {
            headers: {
              'Authorization': `Client-ID ${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}`
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`Unsplash API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
          const imageData = data.results[0];
          const optimizedUrl = `${imageData.urls.regular}&w=400&h=300&fit=crop&auto=format`;
          setImageUrl(optimizedUrl);
          console.log(`✅ Image loaded for "${recipeName}"`);
        } else {
          throw new Error('No images found');
        }
        
      } catch (error) {
        console.warn(`⚠️ Failed to load image for "${recipeName}":`, error);
        setError(true);
        // 🎯 FALLBACK URL SPECIFICO PER CATEGORIA
        const fallbackUrls = {
          'colazione': 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop&auto=format',
          'pranzo': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&auto=format',
          'cena': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop&auto=format',
          'spuntino': 'https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?w=400&h=300&fit=crop&auto=format'
        };
        setImageUrl(fallbackUrls[categoria] || fallbackUrls['pranzo']);
      } finally {
        setIsLoading(false);
      }
    };

    if (recipeName && categoria) {
      fetchUnsplashImage();
    }
  }, [recipeName, categoria, getUnsplashQuery]);

  return { imageUrl, isLoading, error };
};

// 🖼️ COMPONENTE IMMAGINE RICETTA CON LOADING
const RecipeImage: React.FC<{ recipe: Recipe; className?: string }> = ({ recipe, className = '' }) => {
  const { imageUrl, isLoading, error } = useUnsplashImage(recipe.nome, recipe.categoria);
  
  if (isLoading) {
    return (
      <div className={`bg-gray-700 animate-pulse flex items-center justify-center ${className}`}>
        <ChefHat className="w-8 h-8 text-gray-500" />
      </div>
    );
  }
  
  return (
    <img 
      src={imageUrl}
      alt={recipe.nome}
      className={`object-cover ${className}`}
      loading="lazy"
      onError={(e) => {
        // Fallback aggiuntivo se anche il fallback fallisce
        const target = e.target as HTMLImageElement;
        target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&auto=format';
      }}
    />
  );
};

// 🧑‍🍳 FUNZIONE GENERA STEPS DA PREPARAZIONE GENERICA
function generateSteps(preparazione: string, nomeRicetta: string): string[] {
  if (!preparazione) return ['Preparazione non disponibile'];
  
  // Se contiene già numerazione, la usiamo
  if (preparazione.includes('1.') || preparazione.includes('Step')) {
    return preparazione.split(/\d+\.|\n/).filter(step => step.trim());
  }
  
  // Dividiamo per frasi e creiamo steps logici
  const frasi = preparazione.split(/[.!]/).filter(f => f.trim().length > 10);
  
  if (frasi.length <= 1) {
    // Se è una frase unica, creiamo steps generici
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
    } else if (nomeLC.includes('pasta') || nomeLC.includes('risotto')) {
      return [
        'Metti a bollire abbondante acqua salata',
        'Prepara tutti gli ingredienti per il condimento',
        'Cuoci la pasta/riso secondo i tempi indicati',
        'Scola e manteca con il condimento preparato',
        'Servi caldo con una spolverata di formaggio se gradito'
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
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);

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

  // 🤖 Suggerimenti AI con chiamata API
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const loadAIRecommendations = async () => {
    if (isLoadingAI || aiRecommendations.length > 0) return;
    
    setIsLoadingAI(true);
    try {
      const response = await fetch('/api/ricette', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'getAIRecommendations',
          data: {
            preferences: ['Fitness', 'Salutare'],
            allergie: [],
            obiettivo: 'mantenimento',
            pasti_preferiti: ['colazione', 'pranzo'],
            limit: 6
          }
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.recommendations) {
          setAiRecommendations(result.data.recommendations);
        }
      }
    } catch (error) {
      console.error('Errore caricamento AI recommendations:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Carica AI recommendations quando vengono mostrate
  useEffect(() => {
    if (showAIRecommendations) {
      loadAIRecommendations();
    }
  }, [showAIRecommendations]);

  // Suggerimenti AI fallback
  const getAIRecommendations = () => {
    if (aiRecommendations.length > 0) {
      return [
        {
          type: 'Raccomandazioni AI Personalizzate',
          recipes: aiRecommendations.slice(0, 4),
          reason: 'Suggerimenti basati su AI per i tuoi obiettivi fitness'
        }
      ];
    }
    
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

  // 🍳 APRI RICETTA COMPLETA
  const openRecipeModal = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setShowRecipeModal(true);
  };

  const closeRecipeModal = () => {
    setSelectedRecipe(null);
    setShowRecipeModal(false);
  };

  // 🔄 FUNZIONE ORDINAMENTO RICETTE
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
            <p className="text-gray-400">Preparando ricette deliziose con foto Unsplash per te!</p>
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
            Esplora ricette selezionate per il tuo meal prep con foto reali da Unsplash. Filtra per categoria, dieta e difficoltà.
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
                        {selectedRecipe.tipoCucina}
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
                      // Se la preparazione è già formattata come steps
                      selectedRecipe.preparazione.includes('1.') || selectedRecipe.preparazione.includes('Step') ? (
                        <div className="space-y-3">
                          {selectedRecipe.preparazione.split(/\d+\.|\n/).filter(step => step.trim()).map((step, index) => (
                            <div key={index} className="flex gap-3">
                              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                                {index + 1}
                              </span>
                              <p className="text-gray-300 flex-1">{step.trim()}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        // Se è una preparazione generica, la dividiamo in step logici
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
                      )
                    ) : (
                      <p className="text-gray-400 italic">Preparazione non disponibile</p>
                    )}
                  </div>

                  {/* Consigli del Chef (se disponibili) */}
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