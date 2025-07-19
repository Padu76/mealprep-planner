'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Clock, Users, Star, ChefHat, Filter, Search, X } from 'lucide-react';
// 🍳 IMPORT CORRETTO PER RICETTE PAGE - DATABASE MASSICCIO 420+ RICETTE
import { RecipeDatabase, Recipe } from '../../utils/recipeDatabase';

export default function RicettePage() {
  // 🍳 STATI PRINCIPALI
  const [recipeDb, setRecipeDb] = useState<RecipeDatabase | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // 🔍 STATI FILTRI
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('');
  const [selectedCucina, setSelectedCucina] = useState('');
  const [selectedDieta, setSelectedDieta] = useState<string[]>([]);
  const [selectedDifficolta, setSelectedDifficolta] = useState('');
  const [maxTempo, setMaxTempo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // 📄 STATI PAGINAZIONE
  const [currentPage, setCurrentPage] = useState(1);
  const recipesPerPage = 12;

  // 🎛️ OPZIONI FILTRI
  const [filterOptions, setFilterOptions] = useState<any>({
    categories: [],
    cuisines: [],
    difficulties: [],
    diets: [],
    allergies: []
  });

  // 🍳 INIZIALIZZAZIONE DATABASE
  useEffect(() => {
    console.log('🍳 [RICETTE] Initializing MASSIVE Recipe Database...');
    setLoading(true);
    
    try {
      const db = RecipeDatabase.getInstance();
      setRecipeDb(db);
      
      // Carica tutte le ricette
      const allRecipes = db.searchRecipes({});
      setRecipes(allRecipes);
      setFilteredRecipes(allRecipes);
      
      // Carica opzioni filtri
      const options = db.getFilterOptions();
      setFilterOptions(options);
      
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

  // 🔍 APPLICAZIONE FILTRI
  useEffect(() => {
    if (!recipeDb) return;

    console.log('🔍 [RICETTE] Applying filters...');
    
    const filters: any = {};
    
    if (searchQuery) filters.query = searchQuery;
    if (selectedCategoria) filters.categoria = selectedCategoria;
    if (selectedCucina) filters.tipoCucina = selectedCucina;
    if (selectedDieta.length > 0) filters.tipoDieta = selectedDieta;
    if (selectedDifficolta) filters.difficolta = selectedDifficolta;
    if (maxTempo) filters.maxTempo = parseInt(maxTempo);

    const filtered = recipeDb.searchRecipes(filters);
    setFilteredRecipes(filtered);
    setCurrentPage(1); // Reset alla prima pagina
    
    console.log(`🎯 [RICETTE] Filtered results: ${filtered.length} recipes`);
  }, [searchQuery, selectedCategoria, selectedCucina, selectedDieta, selectedDifficolta, maxTempo, recipeDb]);

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
  };

  // 🧹 RESET FILTRI
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategoria('');
    setSelectedCucina('');
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

  // 🎨 FUNZIONE COLORE CUCINA
  const getCuisineColor = (tipoCucina: string) => {
    const colors = {
      'italiana': 'bg-red-100 text-red-800',
      'mediterranea': 'bg-blue-100 text-blue-800',
      'asiatica': 'bg-yellow-100 text-yellow-800',
      'americana': 'bg-indigo-100 text-indigo-800',
      'messicana': 'bg-orange-100 text-orange-800',
      'internazionale': 'bg-gray-100 text-gray-800',
      'ricette_fit': 'bg-green-100 text-green-800'
    };
    return colors[tipoCucina as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">🍳 Caricando Database Massiccio...</h2>
          <p className="text-gray-400">420+ ricette fitness in arrivo!</p>
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
            🍳 Database Massiccio Ricette
          </h1>
          <p className="text-xl text-gray-100 mb-6 max-w-3xl mx-auto">
            Esplora {recipes.length} ricette fitness-ottimizzate: chetogeniche, low-carb, paleo, vegane, mediterranee, bilanciate e fit. 
            Trova la ricetta perfetta per i tuoi obiettivi!
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

      {/* Filtri e Ricerca */}
      <section className="bg-gray-800 py-6 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Barra di ricerca principale */}
          <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Cerca ricette..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              <Filter className="h-5 w-5" />
              <span>Filtri</span>
            </button>

            {(searchQuery || selectedCategoria || selectedCucina || selectedDieta.length > 0 || selectedDifficolta || maxTempo) && (
              <button
                onClick={resetFilters}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Pannello Filtri Espandibile */}
          {showFilters && (
            <div className="bg-gray-700 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Categoria */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Categoria</label>
                  <select
                    value={selectedCategoria}
                    onChange={(e) => setSelectedCategoria(e.target.value)}
                    className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Tutte le categorie</option>
                    {filterOptions.categories.map((cat: string) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tipo Cucina */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tipo Cucina</label>
                  <select
                    value={selectedCucina}
                    onChange={(e) => setSelectedCucina(e.target.value)}
                    className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Tutte le cucine</option>
                    {filterOptions.cuisines.map((cuisine: string) => (
                      <option key={cuisine} value={cuisine}>
                        {cuisine === 'ricette_fit' ? 'Ricette Fit' : cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficoltà */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Difficoltà</label>
                  <select
                    value={selectedDifficolta}
                    onChange={(e) => setSelectedDifficolta(e.target.value)}
                    className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Tutte</option>
                    {filterOptions.difficulties.map((diff: string) => (
                      <option key={diff} value={diff}>
                        {diff.charAt(0).toUpperCase() + diff.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tempo Massimo */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tempo Max (min)</label>
                  <input
                    type="number"
                    placeholder="es. 30"
                    value={maxTempo}
                    onChange={(e) => setMaxTempo(e.target.value)}
                    className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Filtri Dieta */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tipo Dieta</label>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.diets.map((diet: string) => (
                    <button
                      key={diet}
                      onClick={() => {
                        const newDiets = selectedDieta.includes(diet)
                          ? selectedDieta.filter(d => d !== diet)
                          : [...selectedDieta, diet];
                        setSelectedDieta(newDiets);
                      }}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedDieta.includes(diet)
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      }`}
                    >
                      {diet.charAt(0).toUpperCase() + diet.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
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
                      {recipe.imageUrl ? (
                        <img
                          src={recipe.imageUrl}
                          alt={recipe.nome}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ChefHat className="h-16 w-16 text-white opacity-80" />
                        </div>
                      )}
                      
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
                            {recipe.reviewCount || 0} recensioni
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

                      {/* Badge Cucina e Dieta */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCuisineColor(recipe.tipoCucina)}`}>
                          {recipe.tipoCucina === 'ricette_fit' ? 'Fit' : recipe.tipoCucina.charAt(0).toUpperCase() + recipe.tipoCucina.slice(1)}
                        </span>
                        {recipe.tipoDieta.slice(0, 2).map((dieta) => (
                          <span key={dieta} className="px-2 py-1 bg-gray-600 text-gray-300 rounded-full text-xs">
                            {dieta.charAt(0).toUpperCase() + dieta.slice(1)}
                          </span>
                        ))}
                      </div>

                      {/* Bottone Visualizza */}
                      <Link
                        href={`/ricette/${recipe.id}`}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors text-center block font-semibold"
                      >
                        Visualizza Ricetta
                      </Link>
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

      {/* Footer */}
      <footer className="bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center items-center gap-3 mb-4">
            <ChefHat className="h-8 w-8 text-green-400" />
            <h3 className="text-xl font-bold">Database Massiccio Ricette</h3>
          </div>
          <p className="text-gray-400 mb-4">
            {recipes.length} ricette fitness-ottimizzate per i tuoi obiettivi di salute e benessere.
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