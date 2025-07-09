'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Clock, Users, Star, ChefHat, Utensils, Timer, Bookmark, Share2, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import Header from '../../components/header';

// Interfaccia Recipe
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

const RecipeDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [similarRecipes, setSimilarRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [servings, setServings] = useState(1);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'preparation' | 'nutrition'>('ingredients');
  const [recipeDB, setRecipeDB] = useState<any>(null);

  useEffect(() => {
    const loadRecipe = async () => {
      try {
        const { RecipeDatabase } = await import('../../utils/recipeDatabase');
        const db = RecipeDatabase.getInstance();
        setRecipeDB(db);
        
        const recipeId = params.id as string;
        const foundRecipe = db.getRecipeById(recipeId);
        
        if (foundRecipe) {
          setRecipe(foundRecipe);
          setServings(foundRecipe.porzioni);
          setIsFavorite(db.isFavorite(recipeId));
          
          // Aggiungi alle ricette recenti
          db.addToRecentlyViewed(foundRecipe);
          
          // Carica ricette simili
          const similar = db.getSimilarRecipes(foundRecipe, 6);
          setSimilarRecipes(similar);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Errore caricamento ricetta:', error);
        setIsLoading(false);
      }
    };

    loadRecipe();
  }, [params.id]);

  const toggleFavorite = () => {
    if (!recipe || !recipeDB) return;
    
    if (isFavorite) {
      recipeDB.removeFromFavorites(recipe.id);
    } else {
      recipeDB.addToFavorites(recipe.id);
    }
    setIsFavorite(!isFavorite);
  };

  const adjustIngredients = (ingredient: string, multiplier: number) => {
    // Estrai quantità e unità dall'ingrediente
    const numberRegex = /(\d+(?:\.\d+)?)\s*([a-zA-Z]*)/;
    const match = ingredient.match(numberRegex);
    
    if (match) {
      const quantity = parseFloat(match[1]);
      const unit = match[2];
      const newQuantity = (quantity * multiplier).toFixed(quantity % 1 === 0 ? 0 : 1);
      return ingredient.replace(numberRegex, `${newQuantity} ${unit}`);
    }
    
    return ingredient;
  };

  const shareRecipe = async () => {
    if (!recipe) return;
    
    const shareData = {
      title: recipe.nome,
      text: `Guarda questa ricetta: ${recipe.nome}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copiato negli appunti!');
      }
    } catch (error) {
      console.error('Errore condivisione:', error);
    }
  };

  const addToMealPlan = () => {
    if (!recipe) return;
    
    // Salva ricetta selezionata per meal plan
    sessionStorage.setItem('selectedRecipe', JSON.stringify(recipe));
    router.push('/?addToMealPlan=true');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <ChefHat className="w-16 h-16 text-green-400 mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold mb-2">Caricamento ricetta...</h2>
            <p className="text-gray-400">Preparando tutti i dettagli per te!</p>
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <ChefHat className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Ricetta non trovata</h2>
            <p className="text-gray-400 mb-4">La ricetta che stai cercando non esiste</p>
            <Link href="/ricette" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors">
              Torna alle ricette
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const servingMultiplier = servings / recipe.porzioni;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 mb-6">
          <Link href="/ricette" className="text-gray-400 hover:text-green-400 flex items-center space-x-1">
            <ArrowLeft className="w-4 h-4" />
            <span>Torna alle ricette</span>
          </Link>
          <span className="text-gray-500">/</span>
          <span className="text-green-400">{recipe.nome}</span>
        </div>

        {/* Header ricetta */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Immagine */}
          <div className="relative">
            <img 
              src={recipe.imageUrl || `https://images.unsplash.com/photo-1546554${recipe.id.slice(-3)}-6c5486b0b8e5?w=600&h=400&fit=crop&auto=format`}
              alt={recipe.nome}
              className="w-full h-96 object-cover rounded-xl"
            />
            <button 
              onClick={toggleFavorite}
              className={`absolute top-4 right-4 p-3 rounded-full transition-colors ${
                isFavorite 
                  ? 'bg-red-500 text-white' 
                  : 'bg-black/50 text-gray-300 hover:text-red-400'
              }`}
            >
              <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Info ricetta */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                {recipe.categoria}
              </span>
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                {recipe.tipoCucina}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                recipe.difficolta === 'facile' ? 'bg-green-100 text-green-800' :
                recipe.difficolta === 'medio' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {recipe.difficolta}
              </span>
            </div>

            <h1 className="text-4xl font-bold mb-4">{recipe.nome}</h1>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <Clock className="w-6 h-6 mx-auto mb-2 text-green-400" />
                <div className="text-sm text-gray-400">Tempo</div>
                <div className="font-semibold">{recipe.tempoPreparazione} min</div>
              </div>
              <div className="text-center">
                <Users className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                <div className="text-sm text-gray-400">Porzioni</div>
                <div className="font-semibold">{recipe.porzioni}</div>
              </div>
              <div className="text-center">
                <Utensils className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                <div className="text-sm text-gray-400">Calorie</div>
                <div className="font-semibold">{recipe.calorie}</div>
              </div>
              <div className="text-center">
                <Star className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                <div className="text-sm text-gray-400">Rating</div>
                <div className="font-semibold">{recipe.rating?.toFixed(1) || 'N/A'}</div>
              </div>
            </div>

            {/* Controlli porzioni */}
            <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-medium">Porzioni:</span>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setServings(Math.max(1, servings - 1))}
                    className="bg-gray-700 hover:bg-gray-600 text-white w-8 h-8 rounded-full flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="text-xl font-bold w-8 text-center">{servings}</span>
                  <button 
                    onClick={() => setServings(servings + 1)}
                    className="bg-gray-700 hover:bg-gray-600 text-white w-8 h-8 rounded-full flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Calorie totali:</span>
                  <div className="font-semibold">{Math.round(recipe.calorie * servingMultiplier)}</div>
                </div>
                <div>
                  <span className="text-gray-400">Proteine:</span>
                  <div className="font-semibold">{Math.round(recipe.proteine * servingMultiplier)}g</div>
                </div>
                <div>
                  <span className="text-gray-400">Carboidrati:</span>
                  <div className="font-semibold">{Math.round(recipe.carboidrati * servingMultiplier)}g</div>
                </div>
              </div>
            </div>

            {/* Azioni */}
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={addToMealPlan}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Aggiungi al Meal Plan</span>
              </button>
              
              <button 
                onClick={shareRecipe}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span>Condividi</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg mb-6">
            {[
              { id: 'ingredients', label: 'Ingredienti', icon: ChefHat },
              { id: 'preparation', label: 'Preparazione', icon: Timer },
              { id: 'nutrition', label: 'Valori Nutrizionali', icon: Utensils }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-colors ${
                  activeTab === id
                    ? 'bg-green-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Contenuto tabs */}
          <div className="bg-gray-800/50 rounded-lg p-6">
            {activeTab === 'ingredients' && (
              <div>
                <h3 className="text-xl font-bold mb-4">Ingredienti {servings !== recipe.porzioni && `(per ${servings} porzioni)`}</h3>
                <ul className="space-y-2">
                  {recipe.ingredienti.map((ingredient, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      <span>{adjustIngredients(ingredient, servingMultiplier)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'preparation' && (
              <div>
                <h3 className="text-xl font-bold mb-4">Preparazione</h3>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                    {recipe.preparazione}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'nutrition' && (
              <div>
                <h3 className="text-xl font-bold mb-4">Valori Nutrizionali {servings !== recipe.porzioni && `(per ${servings} porzioni)`}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">{Math.round(recipe.calorie * servingMultiplier)}</div>
                    <div className="text-sm text-gray-400">Calorie</div>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">{Math.round(recipe.proteine * servingMultiplier)}g</div>
                    <div className="text-sm text-gray-400">Proteine</div>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400">{Math.round(recipe.carboidrati * servingMultiplier)}g</div>
                    <div className="text-sm text-gray-400">Carboidrati</div>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-red-400">{Math.round(recipe.grassi * servingMultiplier)}g</div>
                    <div className="text-sm text-gray-400">Grassi</div>
                  </div>
                </div>
                
                {recipe.tipoDieta.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold mb-3">Adatta per:</h4>
                    <div className="flex flex-wrap gap-2">
                      {recipe.tipoDieta.map((diet, index) => (
                        <span key={index} className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                          {diet}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {recipe.allergie.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-lg font-semibold mb-3">Contiene allergeni:</h4>
                    <div className="flex flex-wrap gap-2">
                      {recipe.allergie.map((allergy, index) => (
                        <span key={index} className="bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Ricette simili */}
        {similarRecipes.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold mb-6">Ricette simili</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarRecipes.map((similarRecipe) => (
                <Link 
                  key={similarRecipe.id} 
                  href={`/ricette/${similarRecipe.id}`}
                  className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden hover:border-green-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20"
                >
                  <div className="relative">
                    <img 
                      src={similarRecipe.imageUrl || `https://images.unsplash.com/photo-1546554${similarRecipe.id.slice(-3)}-6c5486b0b8e5?w=300&h=200&fit=crop&auto=format`}
                      alt={similarRecipe.nome}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute bottom-3 left-3 flex space-x-2">
                      <span className="bg-black/70 text-green-400 px-2 py-1 rounded text-xs font-medium">
                        {similarRecipe.categoria}
                      </span>
                      <span className="bg-black/70 text-blue-400 px-2 py-1 rounded text-xs font-medium">
                        {similarRecipe.tipoCucina}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h4 className="font-semibold text-white mb-2 line-clamp-1">{similarRecipe.nome}</h4>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{similarRecipe.tempoPreparazione} min</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-white">{similarRecipe.rating?.toFixed(1) || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeDetailPage;