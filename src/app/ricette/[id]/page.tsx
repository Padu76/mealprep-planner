'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Clock, Users, Star, ChefHat, Filter, Search, X, Eye, ChevronDown, ChevronUp } from 'lucide-react';
// 🍳 IMPORT CORRETTO PER RICETTE PAGE - DATABASE COMPLETO 40 RICETTE
import { RecipeDatabase, Recipe } from '../../../utils/recipeDatabase';

export default function RicettePage() {
  // 🍳 STATI PRINCIPALI
  const [recipeDb, setRecipeDb] = useState<RecipeDatabase | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // 🔍 STATI FILTRI CORRETTI
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('');
  const [selectedDieta, setSelectedDieta] = useState<string[]>([]);
  const [selectedDifficolta, setSelectedDifficolta] = useState('');
  const [maxTempo, setMaxTempo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // 📄 STATI PAGINAZIONE
  const [currentPage, setCurrentPage] = useState(1);
  const recipesPerPage = 12;

  // 👁️ STATI MODAL RICETTA
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);

  // 🤖 STATI MODAL AI CORRETTI
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFormData, setAiFormData] = useState({
    ingredienti: '',
    obiettivo: 'dimagrimento',
    categoria: 'pranzo',
    tempo: '30',
    allergie: ''
  });

  // 🎛️ OPZIONI FILTRI
  const [filterOptions, setFilterOptions] = useState<any>({
    categories: [],
    difficulties: [],
    diets: []
  });

  // 🍳 INIZIALIZZAZIONE DATABASE CORRETTO
  useEffect(() => {
    console.log('🍳 [RICETTE] Initializing Complete Recipe Database...');
    setLoading(true);
    
    try {
      const db = RecipeDatabase.getInstance();
      setRecipeDb(db);
      
      // Carica tutte le ricette CORRETTE
      const allRecipes = db.searchRecipes({});
      setRecipes(allRecipes);
      setFilteredRecipes(allRecipes);
      
      // Carica opzioni filtri CORRETTE
      const options = db.getFilterOptions();
      setFilterOptions({
        categories: options.categories,
        difficulties: options.difficulties,
        diets: options.diets
      });
      
      // Carica preferiti dal localStorage
      const savedFavorites = localStorage.getItem('recipe_favorites');
      if (savedFavorites) {
        setFavoriteRecipes(new Set(JSON.parse(savedFavorites)));
      }
      
      const stats = db.getStats();
      console.log('📊 [RICETTE] Database loaded successfully:', stats);
      console.log(`🎯 [RICETTE] Total recipes available: ${allRecipes.length}`);
      
      setLoading(false);
    } catch (error) {
      console.error('❌ [RICETTE] Failed to initialize database:', error);
      setLoading(false);
    }
  }, []);

  // 🔍 APPLICAZIONE FILTRI CORRETTA
  useEffect(() => {
    if (!recipeDb) return;

    console.log('🔍 [RICETTE] Applying filters...');
    
    const filters: any = {};
    
    if (searchQuery) filters.query = searchQuery;
    if (selectedCategoria) filters.categoria = selectedCategoria;
    if (selectedDieta.length > 0) filters.tipoDieta = selectedDieta;
    if (selectedDifficolta) filters.difficolta = selectedDifficolta;
    if (maxTempo) filters.maxTempo = parseInt(maxTempo);

    const filtered = recipeDb.searchRecipes(filters);
    setFilteredRecipes(filtered);
    setCurrentPage(1);
    
    console.log(`🎯 [RICETTE] Filtered results: ${filtered.length} recipes`);
  }, [searchQuery, selectedCategoria, selectedDieta, selectedDifficolta, maxTempo, recipeDb]);

  // ❤️ GESTIONE PREFERITI
  const toggleFavorite = (recipeId: string) => {
    if (!recipeDb) return;

    const newFavorites = new Set(favoriteRecipes);
    
    if (newFavorites.has(recipeId)) {
      newFavorites.delete(recipeId);
      recipeDb.removeFromFavorites(recipeId);
      console.log('💔 [RICETTE] Removed from favorites:', recipeId);
    } else {
      newFavorites.add(recipeId);
      recipeDb.addToFavorites(recipeId);
      console.log('❤️ [RICETTE] Added to favorites:', recipeId);
    }
    
    setFavoriteRecipes(newFavorites);
    localStorage.setItem('recipe_favorites', JSON.stringify(Array.from(newFavorites)));
  };

  // 👁️ APRI MODAL RICETTA
  const openRecipeModal = (recipe: Recipe) => {
    if (!recipeDb) return;
    
    setSelectedRecipe(recipe);
    setShowRecipeModal(true);
    document.body.style.overflow = 'hidden';
    
    // Aggiungi alla cronologia
    recipeDb.addToRecentlyViewed(recipe);
  };

  // ❌ CHIUDI MODAL RICETTA
  const closeRecipeModal = () => {
    setSelectedRecipe(null);
    setShowRecipeModal(false);
    document.body.style.overflow = 'unset';
  };

  // 🤖 GENERA RICETTA AI - CHIAMATA API CORRETTA
  const generateAiRecipe = async () => {
    setAiLoading(true);
    console.log('🤖 [AI] Starting recipe generation with data:', aiFormData);
    
    try {
      // ✅ CHIAMATA API CORRETTA
      const response = await fetch('/api/ricette', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generateRecipe',
          data: {
            ingredienti_base: aiFormData.ingredienti.split(',').map(i => i.trim()).filter(i => i),
            calorie_target: aiFormData.obiettivo === 'dimagrimento' ? 400 : aiFormData.obiettivo === 'aumento-massa' ? 600 : 500,
            proteine_target: aiFormData.obiettivo === 'dimagrimento' ? 30 : aiFormData.obiettivo === 'aumento-massa' ? 40 : 25,
            categoria: aiFormData.categoria,
            tempo_max: parseInt(aiFormData.tempo),
            allergie: aiFormData.allergie.split(',').map(a => a.trim()).filter(a => a),
            obiettivo_fitness: aiFormData.obiettivo
          }
        })
      });

      const result = await response.json();
      
      if (result.success && result.data?.ricetta) {
        console.log('✅ [AI] Recipe generated successfully:', result.data.ricetta.nome);
        
        // Crea ricetta AI con ID unico e formato corretto
        const aiRecipe: Recipe = {
          id: `ai_${Date.now()}`,
          nome: result.data.ricetta.nome,
          categoria: result.data.ricetta.categoria as any,
          tipoCucina: 'internazionale',
          difficolta: result.data.ricetta.difficolta as any,
          tempoPreparazione: result.data.ricetta.tempo_preparazione || parseInt(aiFormData.tempo),
          porzioni: result.data.ricetta.porzioni || 1,
          calorie: result.data.ricetta.macros.calorie,
          proteine: result.data.ricetta.macros.proteine,
          carboidrati: result.data.ricetta.macros.carboidrati,
          grassi: result.data.ricetta.macros.grassi,
          ingredienti: Array.isArray(result.data.ricetta.ingredienti) 
            ? result.data.ricetta.ingredienti.map((ing: any) => typeof ing === 'string' ? ing : `${ing.quantita} ${ing.nome}`)
            : [],
          preparazione: Array.isArray(result.data.ricetta.preparazione) 
            ? result.data.ricetta.preparazione.join(' ') 
            : result.data.ricetta.preparazione || 'Ricetta generata con AI',
          tipoDieta: [],
          allergie: aiFormData.allergie.split(',').map(a => a.trim()).filter(a => a),
          stagione: ['tutto_anno'],
          tags: ['ai-generated'],
          createdAt: new Date(),
          rating: 4.8,
          reviewCount: 1
        };
        
        // Aggiungi temporaneamente alla lista ricette
        const updatedRecipes = [aiRecipe, ...recipes];
        setRecipes(updatedRecipes);
        setFilteredRecipes([aiRecipe, ...filteredRecipes]);
        
        // Chiudi modal AI e apri ricetta
        setShowAiModal(false);
        setSelectedRecipe(aiRecipe);
        setShowRecipeModal(true);
        
        // Reset form
        setAiFormData({
          ingredienti: '',
          obiettivo: 'dimagrimento',
          categoria: 'pranzo',
          tempo: '30',
          allergie: ''
        });
        
      } else {
        console.error('❌ [AI] Recipe generation failed:', result.error);
        alert('❌ Errore nella generazione AI. Riprova con ingredienti diversi.');
      }
    } catch (error) {
      console.error('❌ [AI] Network error:', error);
      alert('🤖 AI temporaneamente non disponibile. Riprova tra poco!');
    } finally {
      setAiLoading(false);
    }
  };

  // ❌ CHIUDI MODAL AI
  const closeAiModal = () => {
    setShowAiModal(false);
    setAiFormData({
      ingredienti: '',
      obiettivo: 'dimagrimento',
      categoria: 'pranzo',
      tempo: '30',
      allergie: ''
    });
  };

  // 🧹 RESET FILTRI
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategoria('');
    setSelectedDieta([]);
    setSelectedDifficolta('');
    setMaxTempo('');
    setCurrentPage(1);
    console.log('🧹 [RICETTE] Filters reset');
  };

  // 📄 CALCOLO PAGINAZIONE
  const totalPages = Math.ceil(filteredRecipes.length / recipesPerPage);
  const startIndex = (currentPage - 1) * recipesPerPage;
  const endIndex = startIndex + recipesPerPage;
  const currentRecipes = filteredRecipes.slice(startIndex, endIndex);

  // 🎨 FUNZIONE COLORE CATEGORIA
  const getCategoryColor = (categoria: string) => {
    const colors = {
      'colazione': 'bg-orange-100 text-orange-800',
      'pranzo': 'bg-blue-100 text-blue-800',
      'cena': 'bg-purple-100 text-purple-800',
      'spuntino': 'bg-green-100 text-green-800'
    };
    return colors[categoria as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // 🖼️ FUNZIONE IMMAGINE RICETTA SICURA
  const getRecipeImage = (recipe: Recipe) => {
    const nome = recipe.nome.toLowerCase();
    
    // Mapping sicuro per categoria
    const categoryImages = {
      'colazione': 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop&auto=format',
      'pranzo': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&auto=format',
      'cena': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop&auto=format',
      'spuntino': 'https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?w=400&h=300&fit=crop&auto=format'
    };
    
    // Mapping per ingredienti principali
    if (nome.includes('avocado')) return 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=300&fit=crop&auto=format';
    if (nome.includes('smoothie') || nome.includes('shake')) return 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop&auto=format';
    if (nome.includes('uova') || nome.includes('egg')) return 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=400&h=300&fit=crop&auto=format';
    if (nome.includes('pancakes')) return 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&auto=format';
    if (nome.includes('salmone') || nome.includes('salmon')) return 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop&auto=format';
    if (nome.includes('pollo') || nome.includes('chicken')) return 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400&h=300&fit=crop&auto=format';
    if (nome.includes('insalata') || nome.includes('salad')) return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&auto=format';
    
    return categoryImages[recipe.categoria as keyof typeof categoryImages] || categoryImages['pranzo'];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">🍳 Caricando Database Completo...</h2>
          <p className="text-gray-400">40 ricette fitness in arrivo!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-2 hover:text-green-400 transition-colors">
                <ChefHat className="h-8 w-8 text-green-400" />
                <span className="text-xl font-bold">Meal Prep</span>
              </Link>
            </div>
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="hover:text-green-400 transition-colors">Home</Link>
              <Link href="/dashboard" className="hover:text-green-400 transition-colors">Dashboard</Link>
              <span className="text-green-400 font-semibold">Ricette</span>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            🍳 Database Ricette FITNESS
          </h1>
          <p className="text-xl text-gray-100 mb-6 max-w-3xl mx-auto">
            {recipes.length} ricette complete + AI infinita per combinazioni illimitate. Trova la ricetta perfetta per i tuoi obiettivi!
          </p>
          <div className="bg-white bg-opacity-10 rounded-lg p-4 max-w-md mx-auto">
            <div className="text-sm text-gray-200">
              <span className="font-semibold">{filteredRecipes.length}</span> ricette trovate
              {favoriteRecipes.size > 0 && (
                <span className="ml-4">❤️ {favoriteRecipes.size} preferite</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Filtri SEMPRE VISIBILI - CORRETTI */}
      <section className="bg-gray-800 py-6 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Barra di ricerca + filtri visibili */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
            {/* Ricerca */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Cerca ricette..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            {/* Categoria CORRETTA */}
            <div>
              <select
                value={selectedCategoria}
                onChange={(e) => setSelectedCategoria(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Tutte categorie</option>
                {filterOptions.categories.map((cat: string) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficoltà CORRETTA */}
            <div>
              <select
                value={selectedDifficolta}
                onChange={(e) => setSelectedDifficolta(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Difficoltà</option>
                {filterOptions.difficulties.map((diff: string) => (
                  <option key={diff} value={diff}>
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Tempo Max - CORRETTI */}
            <div>
              <select
                value={maxTempo}
                onChange={(e) => setMaxTempo(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Tempo max</option>
                <option value="10">10 min</option>
                <option value="15">15 min</option>
                <option value="20">20 min</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">60 min</option>
              </select>
            </div>

            {/* Reset + AI */}
            <div className="flex gap-2">
              {(searchQuery || selectedCategoria || selectedDieta.length > 0 || selectedDifficolta || maxTempo) && (
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm"
                >
                  Reset
                </button>
              )}
              <button 
                onClick={() => setShowAiModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm font-semibold"
              >
                🤖 Genera AI
              </button>
            </div>
          </div>

          {/* Filtri Dieta + NUOVO PULSANTE SMOOTHIES */}
          <div className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <select
                  value={selectedDieta.length > 0 ? selectedDieta[0] : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      setSelectedDieta([e.target.value]);
                    } else {
                      setSelectedDieta([]);
                    }
                  }}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Tipo Dieta</option>
                  {filterOptions.diets.map((diet: string) => (
                    <option key={diet} value={diet}>
                      {diet.charAt(0).toUpperCase() + diet.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <button
                  onClick={() => {
                    // Mostra solo preferiti
                    if (favoriteRecipes.size > 0) {
                      const favoritesList = Array.from(favoriteRecipes);
                      const favRecipes = recipes.filter(r => favoritesList.includes(r.id));
                      setFilteredRecipes(favRecipes);
                    } else {
                      alert('❤️ Nessuna ricetta nei preferiti! Aggiungi alcune ricette ai preferiti per usare questo filtro.');
                    }
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors"
                >
                  ❤️ Solo Preferiti ({favoriteRecipes.size})
                </button>
              </div>
              
              {/* 🍹 NUOVO PULSANTE SMOOTHIES & SPUNTINI FIT */}
              <div>
                <Link 
                  href="/ricette/smoothies-spuntini"
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-3 py-2 rounded-lg transition-all duration-300 font-semibold text-center block"
                >
                  🍹 Smoothies & Spuntini FIT
                </Link>
              </div>
              
              <div>
                <button
                  onClick={() => {
                    // Mostra ricette più proteiche (>25g proteine)
                    const proteinRichRecipes = recipes.filter(recipe => recipe.proteine >= 25);
                    setFilteredRecipes(proteinRichRecipes);
                    setCurrentPage(1);
                    console.log(`🥩 [RICETTE] Showing ${proteinRichRecipes.length} high-protein recipes`);
                  }}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg transition-colors font-medium"
                >
                  🥩 Alto Contenuto Proteico
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Ricette */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {currentRecipes.length === 0 ? (
            <div className="text-center py-12">
              <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-300 mb-2">Nessuna ricetta trovata</h3>
              <p className="text-gray-400 mb-4">Prova a modificare i filtri di ricerca</p>
              <button
                onClick={resetFilters}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                Reset Filtri
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentRecipes.map((recipe) => (
                  <div key={recipe.id} className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    {/* Immagine Ricetta */}
                    <div className="relative h-48 bg-gradient-to-br from-green-400 to-blue-500">
                      <img
                        src={getRecipeImage(recipe)}
                        alt={recipe.nome}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';
                        }}
                      />
                      
                      {/* Bottone Preferito */}
                      <button
                        onClick={() => toggleFavorite(recipe.id)}
                        className="absolute top-3 right-3 p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-all"
                      >
                        <Heart
                          className={`h-5 w-5 ${
                            favoriteRecipes.has(recipe.id)
                              ? 'text-red-500 fill-current'
                              : 'text-white'
                          }`}
                        />
                      </button>

                      {/* Badge Categoria */}
                      <div className="absolute top-3 left-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCategoryColor(recipe.categoria)}`}>
                          {recipe.categoria.charAt(0).toUpperCase() + recipe.categoria.slice(1)}
                        </span>
                      </div>

                      {/* Overlay Click */}
                      <div 
                        onClick={() => openRecipeModal(recipe)}
                        className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-all cursor-pointer"
                      >
                        <div className="bg-white bg-opacity-20 rounded-full p-3">
                          <Eye className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Contenuto Card */}
                    <div className="p-4">
                      {/* Titolo e Rating */}
                      <div className="mb-3">
                        <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">
                          {recipe.nome}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-300 ml-1">
                              {recipe.rating?.toFixed(1) || '4.5'}
                            </span>
                          </div>
                          <span className="text-gray-500">•</span>
                          <span className="text-sm text-gray-400">
                            {recipe.reviewCount || Math.floor(Math.random() * 50) + 10} recensioni
                          </span>
                        </div>
                      </div>

                      {/* Info Nutrizionali */}
                      <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                        <div className="text-center bg-gray-700 rounded py-1">
                          <div className="font-semibold text-white">{recipe.calorie}</div>
                          <div className="text-gray-400">kcal</div>
                        </div>
                        <div className="text-center bg-gray-700 rounded py-1">
                          <div className="font-semibold text-white">{recipe.proteine}g</div>
                          <div className="text-gray-400">proteine</div>
                        </div>
                        <div className="text-center bg-gray-700 rounded py-1">
                          <div className="font-semibold text-white">{recipe.carboidrati}g</div>
                          <div className="text-gray-400">carbs</div>
                        </div>
                      </div>

                      {/* Info Tempo e Porzioni */}
                      <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{recipe.tempoPreparazione} min</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{recipe.porzioni} {recipe.porzioni === 1 ? 'porzione' : 'porzioni'}</span>
                        </div>
                      </div>

                      {/* Badge Dieta */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {recipe.tipoDieta.slice(0, 3).map((dieta) => (
                          <span key={dieta} className="px-2 py-1 bg-gray-600 text-gray-300 rounded-full text-xs">
                            {dieta.charAt(0).toUpperCase() + dieta.slice(1)}
                          </span>
                        ))}
                      </div>

                      {/* Bottone Visualizza */}
                      <button
                        onClick={() => openRecipeModal(recipe)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors font-semibold flex items-center justify-center space-x-2"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Vedi Ricetta Completa</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginazione */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                    >
                      Precedente
                    </button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-2 rounded-lg transition-colors ${
                              currentPage === pageNum
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      {totalPages > 5 && (
                        <>
                          <span className="text-gray-400">...</span>
                          <button
                            onClick={() => setCurrentPage(totalPages)}
                            className={`px-3 py-2 rounded-lg transition-colors ${
                              currentPage === totalPages
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                    >
                      Successiva
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Modal AI Generator CORRETTO */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header Modal AI */}
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">🤖 Generatore AI Ricette</h2>
              <button
                onClick={closeAiModal}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            {/* Contenuto Modal AI */}
            <div className="p-6">
              <p className="text-gray-300 mb-6">
                Crea ricette personalizzate con AI! Inserisci gli ingredienti che hai a disposizione e l'AI creerà una ricetta su misura per te.
              </p>

              <div className="space-y-4">
                {/* Ingredienti */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    🥬 Ingredienti disponibili (separati da virgola)
                  </label>
                  <input
                    type="text"
                    placeholder="es. pollo, broccoli, riso, aglio, olio d'oliva"
                    value={aiFormData.ingredienti}
                    onChange={(e) => setAiFormData(prev => ({...prev, ingredienti: e.target.value}))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Grid per altri campi */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Obiettivo CORRETTI */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">🎯 Obiettivo</label>
                    <select
                      value={aiFormData.obiettivo}
                      onChange={(e) => setAiFormData(prev => ({...prev, obiettivo: e.target.value}))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="dimagrimento">Dimagrimento</option>
                      <option value="aumento-massa">Aumento Massa</option>
                      <option value="bilanciata">Bilanciata</option>
                      <option value="keto">Chetogenica</option>
                      <option value="vegana">Vegana</option>
                      <option value="mediterranea">Mediterranea</option>
                    </select>
                  </div>

                  {/* Categoria */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">🍽️ Categoria</label>
                    <select
                      value={aiFormData.categoria}
                      onChange={(e) => setAiFormData(prev => ({...prev, categoria: e.target.value}))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="colazione">Colazione</option>
                      <option value="pranzo">Pranzo</option>
                      <option value="cena">Cena</option>
                      <option value="spuntino">Spuntino</option>
                    </select>
                  </div>

                  {/* Tempo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">⏱️ Tempo Max</label>
                    <select
                      value={aiFormData.tempo}
                      onChange={(e) => setAiFormData(prev => ({...prev, tempo: e.target.value}))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="15">15 minuti</option>
                      <option value="30">30 minuti</option>
                      <option value="45">45 minuti</option>
                      <option value="60">60 minuti</option>
                    </select>
                  </div>

                  {/* Allergie */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">⚠️ Allergie/Evitare</label>
                    <input
                      type="text"
                      placeholder="es. glutine, lattosio, noci"
                      value={aiFormData.allergie}
                      onChange={(e) => setAiFormData(prev => ({...prev, allergie: e.target.value}))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Pulsanti */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={closeAiModal}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg transition-colors"
                  >
                    Annulla
                  </button>
                  <button
                    onClick={generateAiRecipe}
                    disabled={aiLoading || !aiFormData.ingredienti.trim()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg transition-colors font-semibold flex items-center justify-center space-x-2"
                  >
                    {aiLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Generando...</span>
                      </>
                    ) : (
                      <>
                        <span>🤖</span>
                        <span>Genera Ricetta AI</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Info AI */}
              <div className="mt-6 p-4 bg-blue-600 bg-opacity-20 rounded-lg border border-blue-600 border-opacity-30">
                <h4 className="text-blue-400 font-semibold mb-2">💡 Come funziona l'AI:</h4>
                <ul className="text-blue-200 text-sm space-y-1">
                  <li>• L'AI analizza i tuoi ingredienti disponibili</li>
                  <li>• Crea una ricetta bilanciata con valori nutrizionali</li>
                  <li>• Genera preparazione step-by-step personalizzata</li>
                  <li>• Rispetta le tue preferenze alimentari e allergie</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ricetta COMPLETO */}
      {showRecipeModal && selectedRecipe && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">{selectedRecipe.nome}</h2>
              <button
                onClick={closeRecipeModal}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            {/* Contenuto Modal */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Colonna Sinistra - Immagine e Info */}
                <div>
                  <img
                    src={getRecipeImage(selectedRecipe)}
                    alt={selectedRecipe.nome}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                  
                  {/* Info Nutrizionali Dettagliate */}
                  <div className="bg-gray-700 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Valori Nutrizionali</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center bg-gray-600 rounded py-2">
                        <div className="font-bold text-white">{selectedRecipe.calorie}</div>
                        <div className="text-gray-300">Calorie</div>
                      </div>
                      <div className="text-center bg-gray-600 rounded py-2">
                        <div className="font-bold text-white">{selectedRecipe.proteine}g</div>
                        <div className="text-gray-300">Proteine</div>
                      </div>
                      <div className="text-center bg-gray-600 rounded py-2">
                        <div className="font-bold text-white">{selectedRecipe.carboidrati}g</div>
                        <div className="text-gray-300">Carboidrati</div>
                      </div>
                      <div className="text-center bg-gray-600 rounded py-2">
                        <div className="font-bold text-white">{selectedRecipe.grassi}g</div>
                        <div className="text-gray-300">Grassi</div>
                      </div>
                    </div>
                  </div>

                  {/* Info Generale */}
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Informazioni</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Tempo:</span>
                        <span className="text-white">{selectedRecipe.tempoPreparazione} minuti</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Porzioni:</span>
                        <span className="text-white">{selectedRecipe.porzioni}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Difficoltà:</span>
                        <span className="text-white">{selectedRecipe.difficolta.charAt(0).toUpperCase() + selectedRecipe.difficolta.slice(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Categoria:</span>
                        <span className="text-white">{selectedRecipe.categoria.charAt(0).toUpperCase() + selectedRecipe.categoria.slice(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Colonna Destra - Ingredienti e Preparazione */}
                <div>
                  {/* Ingredienti */}
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-white mb-4">🛒 Ingredienti</h3>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <ul className="space-y-2">
                        {selectedRecipe.ingredienti.map((ingrediente, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <span className="text-green-400 mt-1">•</span>
                            <span className="text-gray-200">{ingrediente}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Preparazione */}
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-white mb-4">👨‍🍳 Preparazione</h3>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="text-gray-200 leading-relaxed whitespace-pre-line">
                        {selectedRecipe.preparazione}
                      </div>
                      
                      {/* Tempo di preparazione highlighted */}
                      <div className="mt-4 p-3 bg-green-600 bg-opacity-20 rounded-lg border border-green-600 border-opacity-30">
                        <div className="flex items-center space-x-2 text-green-400">
                          <Clock className="h-5 w-5" />
                          <span className="font-semibold">Tempo totale: {selectedRecipe.tempoPreparazione} minuti</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Badge e Rating */}
                  <div className="space-y-4">
                    {/* Tipo Dieta */}
                    {selectedRecipe.tipoDieta.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-300 mb-2">Tipo Dieta</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedRecipe.tipoDieta.map((dieta) => (
                            <span key={dieta} className="px-3 py-1 bg-green-600 text-white rounded-full text-sm">
                              {dieta.charAt(0).toUpperCase() + dieta.slice(1)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Rating */}
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-400 fill-current" />
                        <span className="text-white ml-1 font-semibold">
                          {selectedRecipe.rating?.toFixed(1) || '4.5'}
                        </span>
                      </div>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-400">
                        {selectedRecipe.reviewCount || Math.floor(Math.random() * 50) + 10} recensioni
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center items-center gap-3 mb-4">
            <ChefHat className="h-8 w-8 text-green-400" />
            <h3 className="text-xl font-bold">Database Completo Ricette FITNESS</h3>
          </div>
          <p className="text-gray-400 mb-4">
            {recipes.length} ricette complete + generazione AI illimitata per combinazioni infinite.
          </p>
          <div className="flex justify-center gap-6">
            <Link href="/" className="text-gray-400 hover:text-green-400 transition-colors">Home</Link>
            <Link href="/dashboard" className="text-gray-400 hover:text-green-400 transition-colors">Dashboard</Link>
            <Link href="/privacy" className="text-gray-400 hover:text-green-400 transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}