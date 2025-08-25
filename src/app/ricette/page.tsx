'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Clock, Users, Star, ChefHat, Search, X, Eye, Filter, Zap, Target, Activity, TrendingUp, Dumbbell, Flame } from 'lucide-react';

interface Recipe {
  id: string;
  nome: string;
  categoria: 'colazione' | 'pranzo' | 'cena' | 'spuntino' | 'pre_workout' | 'post_workout';
  tipoDieta: string[];
  difficolta: 'facile' | 'medio' | 'difficile';
  tempoPreparazione: number;
  porzioni: number;
  calorie: number;
  proteine: number;
  carboidrati: number;
  grassi: number;
  ingredienti: string[];
  preparazione: string;
  obiettivo_fitness: string[];
  macro_focus: 'high_protein' | 'low_carb' | 'balanced' | 'high_fat';
  fonte: 'database' | 'ai_generated';
  tags: string[];
  rating: number;
  reviewCount: number;
  createdAt: string;
}

interface FavoriteRecipe {
  recipeId: string;
  userId: string;
  addedAt: string;
}

interface AIRecipeRequest {
  ingredienti: string;
  obiettivo: string;
  categoria: string;
  tempo: string;
  allergie: string;
  tipoDieta: string;
}

const DIET_TYPES = [
  { value: 'paleo', label: 'Paleo', color: 'bg-orange-100 text-orange-800' },
  { value: 'keto', label: 'Chetogenica', color: 'bg-purple-100 text-purple-800' },
  { value: 'lowcarb', label: 'Low Carb', color: 'bg-red-100 text-red-800' },
  { value: 'vegetariana', label: 'Vegetariana', color: 'bg-green-100 text-green-800' },
  { value: 'vegana', label: 'Vegana', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'mediterranea', label: 'Mediterranea', color: 'bg-blue-100 text-blue-800' },
  { value: 'iifym', label: 'IIFYM', color: 'bg-indigo-100 text-indigo-800' },
];

const FITNESS_OBJECTIVES = [
  { value: 'cutting', label: 'Cutting/Definizione', icon: TrendingUp, color: 'text-red-500' },
  { value: 'bulking', label: 'Bulking/Massa', icon: Dumbbell, color: 'text-blue-500' },
  { value: 'maintenance', label: 'Mantenimento', icon: Target, color: 'text-green-500' },
  { value: 'endurance', label: 'Resistenza', icon: Activity, color: 'text-purple-500' },
  { value: 'strength', label: 'Forza', icon: Zap, color: 'text-yellow-500' },
];

const MEAL_CATEGORIES = [
  { value: 'colazione', label: 'Colazione', icon: '🌅' },
  { value: 'pre_workout', label: 'Pre-Workout', icon: '⚡' },
  { value: 'post_workout', label: 'Post-Workout', icon: '💪' },
  { value: 'pranzo', label: 'Pranzo', icon: '☀️' },
  { value: 'cena', label: 'Cena', icon: '🌙' },
  { value: 'spuntino', label: 'Spuntino', icon: '🍎' },
];

export default function RicettePage() {
  // Stati principali
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Stati filtri
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiet, setSelectedDiet] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedObjective, setSelectedObjective] = useState('');
  const [selectedMacroFocus, setSelectedMacroFocus] = useState('');
  const [maxTime, setMaxTime] = useState('');

  // Stati paginazione
  const [currentPage, setCurrentPage] = useState(1);
  const recipesPerPage = 12;

  // Stati modali
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  // Form AI
  const [aiFormData, setAiFormData] = useState<AIRecipeRequest>({
    ingredienti: '',
    obiettivo: 'cutting',
    categoria: 'pranzo',
    tempo: '30',
    allergie: '',
    tipoDieta: 'balanced'
  });

  // Caricamento iniziale ricette
  useEffect(() => {
    loadRecipes();
    loadFavorites();
  }, []);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      
      // Carica ricette dal database esistente (da RecipeDatabase)
      const databaseRecipes = await loadDatabaseRecipes();
      
      // Carica ricette salvate in Airtable
      const airtableRecipes = await loadAirtableRecipes();
      
      const allRecipes = [...databaseRecipes, ...airtableRecipes];
      setRecipes(allRecipes);
      setFilteredRecipes(allRecipes);
      
      console.log(`✅ Loaded ${allRecipes.length} recipes (${databaseRecipes.length} database + ${airtableRecipes.length} AI generated)`);
      
    } catch (error) {
      console.error('❌ Error loading recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDatabaseRecipes = async (): Promise<Recipe[]> => {
    // Simulazione caricamento database esistente
    // In realtà questo dovrebbe interfacciarsi con RecipeDatabase
    return [
      {
        id: 'db_001',
        nome: 'Pollo Grigliato con Quinoa e Verdure',
        categoria: 'pranzo',
        tipoDieta: ['high_protein', 'balanced'],
        difficolta: 'medio',
        tempoPreparazione: 25,
        porzioni: 1,
        calorie: 485,
        proteine: 38,
        carboidrati: 45,
        grassi: 12,
        ingredienti: [
          '150g petto di pollo',
          '80g quinoa',
          '100g broccoli',
          '50g carote',
          '1 cucchiaio olio EVO',
          'Spezie miste'
        ],
        preparazione: 'Marina il pollo con spezie per 15 minuti. Cuoci la quinoa in brodo vegetale. Griglia il pollo 6-7 minuti per lato. Cuoci le verdure al vapore 8 minuti. Componi il piatto bilanciando i macronutrienti.',
        obiettivo_fitness: ['bulking', 'maintenance'],
        macro_focus: 'high_protein',
        fonte: 'database',
        tags: ['high_protein', 'complete_meal', 'muscle_building'],
        rating: 4.7,
        reviewCount: 156,
        createdAt: new Date().toISOString()
      },
      {
        id: 'db_002',
        nome: 'Smoothie Proteico Verde Post-Workout',
        categoria: 'post_workout',
        tipoDieta: ['vegetariana', 'low_carb'],
        difficolta: 'facile',
        tempoPreparazione: 5,
        porzioni: 1,
        calorie: 285,
        proteine: 32,
        carboidrati: 18,
        grassi: 8,
        ingredienti: [
          '30g proteine whey vaniglia',
          '150g spinaci baby',
          '1/2 avocado',
          '250ml latte mandorla',
          '1 cucchiaio burro mandorle',
          'Ghiaccio'
        ],
        preparazione: 'Frulla tutti gli ingredienti ad alta velocità per 60 secondi. Aggiungi ghiaccio e frulla altri 30 secondi. Consuma entro 30 minuti dal workout per massimo assorbimento proteico.',
        obiettivo_fitness: ['cutting', 'maintenance'],
        macro_focus: 'high_protein',
        fonte: 'database',
        tags: ['post_workout', 'quick', 'recovery', 'green'],
        rating: 4.9,
        reviewCount: 203,
        createdAt: new Date().toISOString()
      }
    ];
  };

  const loadAirtableRecipes = async (): Promise<Recipe[]> => {
    try {
      const response = await fetch('/api/airtable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'read',
          table: 'recipes_ai'
        })
      });

      if (!response.ok) return [];

      const result = await response.json();
      if (result.success && result.records) {
        return result.records.map((record: any) => ({
          id: record.id,
          nome: record.fields.nome || '',
          categoria: record.fields.categoria || 'pranzo',
          tipoDieta: record.fields.tipoDieta || [],
          difficolta: record.fields.difficolta || 'medio',
          tempoPreparazione: record.fields.tempoPreparazione || 30,
          porzioni: record.fields.porzioni || 1,
          calorie: record.fields.calorie || 0,
          proteine: record.fields.proteine || 0,
          carboidrati: record.fields.carboidrati || 0,
          grassi: record.fields.grassi || 0,
          ingredienti: record.fields.ingredienti || [],
          preparazione: record.fields.preparazione || '',
          obiettivo_fitness: record.fields.obiettivo_fitness || [],
          macro_focus: record.fields.macro_focus || 'balanced',
          fonte: 'ai_generated',
          tags: record.fields.tags || [],
          rating: record.fields.rating || 4.5,
          reviewCount: record.fields.reviewCount || 1,
          createdAt: record.fields.createdAt || new Date().toISOString()
        }));
      }
      return [];
    } catch (error) {
      console.error('❌ Error loading Airtable recipes:', error);
      return [];
    }
  };

  const loadFavorites = async () => {
    try {
      const response = await fetch('/api/airtable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'read',
          table: 'user_favorites'
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.records) {
          const favoriteIds = result.records.map((record: any) => record.fields.recipeId);
          setFavoriteRecipes(new Set(favoriteIds));
        }
      }
    } catch (error) {
      console.error('❌ Error loading favorites:', error);
    }
  };

  // Applicazione filtri
  useEffect(() => {
    let filtered = recipes.filter(recipe => {
      if (searchQuery && !recipe.nome.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !recipe.ingredienti.some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase()))) {
        return false;
      }
      if (selectedDiet && !recipe.tipoDieta.includes(selectedDiet)) return false;
      if (selectedCategory && recipe.categoria !== selectedCategory) return false;
      if (selectedObjective && !recipe.obiettivo_fitness.includes(selectedObjective)) return false;
      if (selectedMacroFocus && recipe.macro_focus !== selectedMacroFocus) return false;
      if (maxTime && recipe.tempoPreparazione > parseInt(maxTime)) return false;
      return true;
    });

    setFilteredRecipes(filtered);
    setCurrentPage(1);
  }, [searchQuery, selectedDiet, selectedCategory, selectedObjective, selectedMacroFocus, maxTime, recipes]);

  const toggleFavorite = async (recipeId: string) => {
    const newFavorites = new Set(favoriteRecipes);
    
    try {
      if (newFavorites.has(recipeId)) {
        // Rimuovi dai preferiti
        newFavorites.delete(recipeId);
        await fetch('/api/airtable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'delete',
            table: 'user_favorites',
            recordId: recipeId
          })
        });
      } else {
        // Controlla limite di 10 preferiti
        if (newFavorites.size >= 10) {
          alert('⚠️ Puoi avere massimo 10 ricette preferite! Rimuovi una ricetta prima di aggiungerne una nuova.');
          return;
        }

        // Aggiungi ai preferiti
        newFavorites.add(recipeId);
        await fetch('/api/airtable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create',
            table: 'user_favorites',
            fields: {
              recipeId: recipeId,
              userId: 'user_001', // In futuro sarà dinamico
              addedAt: new Date().toISOString()
            }
          })
        });
      }
      
      setFavoriteRecipes(newFavorites);
    } catch (error) {
      console.error('❌ Error toggling favorite:', error);
      alert('❌ Errore nel gestire i preferiti. Riprova!');
    }
  };

  const generateAiRecipe = async () => {
    setAiGenerating(true);
    console.log('🤖 Generating AI fitness recipe with data:', aiFormData);
    
    try {
      const response = await fetch('/api/ricette', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generateRecipe',
          data: {
            ingredienti_base: aiFormData.ingredienti.split(',').map(i => i.trim()).filter(i => i),
            calorie_target: getCaloriesForObjective(aiFormData.obiettivo),
            proteine_target: getProteinsForObjective(aiFormData.obiettivo),
            categoria: aiFormData.categoria,
            tempo_max: parseInt(aiFormData.tempo),
            allergie: aiFormData.allergie.split(',').map(a => a.trim()).filter(a => a),
            obiettivo_fitness: aiFormData.obiettivo,
            tipo_dieta: aiFormData.tipoDieta
          }
        })
      });

      const result = await response.json();
      
      if (result.success && result.data?.ricetta) {
        const aiRecipe = result.data.ricetta;
        
        // Salva in Airtable
        const saveResponse = await fetch('/api/airtable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create',
            table: 'recipes_ai',
            fields: {
              nome: aiRecipe.nome,
              categoria: aiFormData.categoria,
              tipoDieta: [aiFormData.tipoDieta],
              difficolta: aiRecipe.difficolta || 'medio',
              tempoPreparazione: parseInt(aiFormData.tempo),
              porzioni: aiRecipe.porzioni || 1,
              calorie: aiRecipe.macros.calorie,
              proteine: aiRecipe.macros.proteine,
              carboidrati: aiRecipe.macros.carboidrati,
              grassi: aiRecipe.macros.grassi,
              ingredienti: Array.isArray(aiRecipe.ingredienti) ? aiRecipe.ingredienti : [],
              preparazione: Array.isArray(aiRecipe.preparazione) ? aiRecipe.preparazione.join('. ') : aiRecipe.preparazione,
              obiettivo_fitness: [aiFormData.obiettivo],
              macro_focus: getMacroFocus(aiFormData.obiettivo),
              tags: ['ai_generated', 'fitness', aiFormData.obiettivo],
              rating: 4.8,
              reviewCount: 1,
              createdAt: new Date().toISOString()
            }
          })
        });

        if (saveResponse.ok) {
          console.log('✅ AI recipe saved to Airtable');
          await loadRecipes(); // Ricarica le ricette
        }

        // Crea oggetto ricetta per visualizzazione immediata
        const newRecipe: Recipe = {
          id: `ai_${Date.now()}`,
          nome: aiRecipe.nome,
          categoria: aiFormData.categoria as any,
          tipoDieta: [aiFormData.tipoDieta],
          difficolta: aiRecipe.difficolta || 'medio',
          tempoPreparazione: parseInt(aiFormData.tempo),
          porzioni: aiRecipe.porzioni || 1,
          calorie: aiRecipe.macros.calorie,
          proteine: aiRecipe.macros.proteine,
          carboidrati: aiRecipe.macros.carboidrati,
          grassi: aiRecipe.macros.grassi,
          ingredienti: Array.isArray(aiRecipe.ingredienti) ? aiRecipe.ingredienti : [],
          preparazione: Array.isArray(aiRecipe.preparazione) ? aiRecipe.preparazione.join('. ') : aiRecipe.preparazione,
          obiettivo_fitness: [aiFormData.obiettivo],
          macro_focus: getMacroFocus(aiFormData.obiettivo),
          fonte: 'ai_generated',
          tags: ['ai_generated', 'fitness'],
          rating: 4.8,
          reviewCount: 1,
          createdAt: new Date().toISOString()
        };

        setSelectedRecipe(newRecipe);
        setShowAiModal(false);
        setShowRecipeModal(true);
        
        // Reset form
        setAiFormData({
          ingredienti: '',
          obiettivo: 'cutting',
          categoria: 'pranzo',
          tempo: '30',
          allergie: '',
          tipoDieta: 'balanced'
        });
        
      } else {
        console.error('❌ AI recipe generation failed:', result.error);
        alert('❌ Errore nella generazione AI. Riprova con ingredienti diversi.');
      }
    } catch (error) {
      console.error('❌ AI generation error:', error);
      alert('🤖 AI temporaneamente non disponibile. Riprova tra poco!');
    } finally {
      setAiGenerating(false);
    }
  };

  const getCaloriesForObjective = (objective: string): number => {
    const calorieMap: { [key: string]: number } = {
      'cutting': 350,
      'maintenance': 500,
      'bulking': 650,
      'endurance': 450,
      'strength': 600
    };
    return calorieMap[objective] || 500;
  };

  const getProteinsForObjective = (objective: string): number => {
    const proteinMap: { [key: string]: number } = {
      'cutting': 35,
      'maintenance': 25,
      'bulking': 40,
      'endurance': 20,
      'strength': 30
    };
    return proteinMap[objective] || 25;
  };

  const getMacroFocus = (objective: string): 'high_protein' | 'low_carb' | 'balanced' | 'high_fat' => {
    const focusMap: { [key: string]: any } = {
      'cutting': 'high_protein',
      'maintenance': 'balanced',
      'bulking': 'high_protein',
      'endurance': 'balanced',
      'strength': 'high_protein'
    };
    return focusMap[objective] || 'balanced';
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedDiet('');
    setSelectedCategory('');
    setSelectedObjective('');
    setSelectedMacroFocus('');
    setMaxTime('');
    setCurrentPage(1);
  };

  const openRecipeModal = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setShowRecipeModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeRecipeModal = () => {
    setSelectedRecipe(null);
    setShowRecipeModal(false);
    document.body.style.overflow = 'unset';
  };

  // Paginazione
  const totalPages = Math.ceil(filteredRecipes.length / recipesPerPage);
  const startIndex = (currentPage - 1) * recipesPerPage;
  const currentRecipes = filteredRecipes.slice(startIndex, startIndex + recipesPerPage);

  // Funzioni di utilità per colori e badge
  const getCategoryColor = (categoria: string) => {
    const colors: { [key: string]: string } = {
      'colazione': 'bg-yellow-100 text-yellow-800',
      'pre_workout': 'bg-red-100 text-red-800',
      'post_workout': 'bg-green-100 text-green-800',
      'pranzo': 'bg-blue-100 text-blue-800',
      'cena': 'bg-purple-100 text-purple-800',
      'spuntino': 'bg-gray-100 text-gray-800'
    };
    return colors[categoria] || 'bg-gray-100 text-gray-800';
  };

  const getMacroFocusColor = (focus: string) => {
    const colors: { [key: string]: string } = {
      'high_protein': 'bg-red-500',
      'low_carb': 'bg-orange-500',
      'balanced': 'bg-green-500',
      'high_fat': 'bg-purple-500'
    };
    return colors[focus] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Caricando Database Ricette FITNESS...</h2>
          <p className="text-gray-400">Ricette fitness + AI infinita in arrivo!</p>
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
              <span className="text-green-400 font-semibold">Ricette FITNESS</span>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            DATABASE RICETTE FITNESS
          </h1>
          <p className="text-xl text-gray-100 mb-6 max-w-4xl mx-auto">
            Ricette fitness da fonti specializzate + AI infinita per combinazioni illimitate. 
            Ottimizzate per performance, recovery e risultati concreti!
          </p>
          <div className="bg-white bg-opacity-10 rounded-lg p-4 max-w-2xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-200">
              <div className="text-center">
                <div className="font-semibold text-lg">{filteredRecipes.length}</div>
                <div>Ricette Trovate</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">{favoriteRecipes.size}/10</div>
                <div>Preferite</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">{recipes.filter(r => r.fonte === 'ai_generated').length}</div>
                <div>AI Generate</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">{recipes.filter(r => r.proteine >= 30).length}</div>
                <div>High Protein</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filtri Avanzati */}
      <section className="bg-gray-800 py-6 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Barra di ricerca principale */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end mb-4">
            <div className="relative md:col-span-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Cerca ricette fitness..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <select
                value={selectedDiet}
                onChange={(e) => setSelectedDiet(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Tipo Dieta</option>
                {DIET_TYPES.map(diet => (
                  <option key={diet.value} value={diet.value}>{diet.label}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Categoria Pasto</option>
                {MEAL_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <select
                value={selectedObjective}
                onChange={(e) => setSelectedObjective(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Obiettivo Fitness</option>
                {FITNESS_OBJECTIVES.map(obj => (
                  <option key={obj.value} value={obj.value}>{obj.label}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <select
                value={maxTime}
                onChange={(e) => setMaxTime(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Tempo Max</option>
                <option value="10">≤ 10 min</option>
                <option value="20">≤ 20 min</option>
                <option value="30">≤ 30 min</option>
                <option value="45">≤ 45 min</option>
                <option value="60">≤ 60 min</option>
              </select>
            </div>

            <div className="md:col-span-1">
              <button
                onClick={() => setShowAiModal(true)}
                disabled={aiGenerating}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-2 rounded-lg transition-colors font-semibold flex items-center justify-center gap-2"
                title="Genera ricetta con AI"
              >
                {aiGenerating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>🤖 AI</>
                )}
              </button>
            </div>
          </div>

          {/* Filtri veloci */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <button
              onClick={() => {
                const favoritesList = Array.from(favoriteRecipes);
                const favRecipes = recipes.filter(r => favoritesList.includes(r.id));
                setFilteredRecipes(favRecipes);
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              ❤️ Preferiti ({favoriteRecipes.size})
            </button>

            <button
              onClick={() => {
                const highProteinRecipes = recipes.filter(r => r.proteine >= 30);
                setFilteredRecipes(highProteinRecipes);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              💪 High Protein
            </button>

            <button
              onClick={() => {
                const quickRecipes = recipes.filter(r => r.tempoPreparazione <= 15);
                setFilteredRecipes(quickRecipes);
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              ⚡ Quick
            </button>

            <button
              onClick={() => {
                const workoutRecipes = recipes.filter(r => r.categoria === 'pre_workout' || r.categoria === 'post_workout');
                setFilteredRecipes(workoutRecipes);
              }}
              className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              🏋️ Workout
            </button>

            <button
              onClick={() => {
                const aiRecipes = recipes.filter(r => r.fonte === 'ai_generated');
                setFilteredRecipes(aiRecipes);
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              🤖 AI Generated
            </button>

            {(searchQuery || selectedDiet || selectedCategory || selectedObjective || maxTime) && (
              <button
                onClick={resetFilters}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                🗑️ Reset
              </button>
            )}
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
              <p className="text-gray-400 mb-4">Prova a modificare i filtri o genera una ricetta con AI</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={resetFilters}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  Reset Filtri
                </button>
                <button
                  onClick={() => setShowAiModal(true)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  🤖 Genera con AI
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentRecipes.map((recipe) => (
                  <div key={recipe.id} className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-700">
                    {/* Header Card - SENZA IMMAGINE */}
                    <div className="relative p-4 bg-gradient-to-br from-green-600 to-blue-600">
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

                      {/* Badge Categoria e Fonte */}
                      <div className="flex justify-between items-start mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCategoryColor(recipe.categoria)}`}>
                          {MEAL_CATEGORIES.find(c => c.value === recipe.categoria)?.label || recipe.categoria}
                        </span>
                        {recipe.fonte === 'ai_generated' && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                            🤖 AI
                          </span>
                        )}
                      </div>

                      {/* Titolo */}
                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 min-h-[3.5rem]">
                        {recipe.nome}
                      </h3>

                      {/* Rating */}
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-white ml-1 font-semibold">
                            {recipe.rating.toFixed(1)}
                          </span>
                        </div>
                        <span className="text-gray-200">•</span>
                        <span className="text-sm text-gray-200">
                          {recipe.reviewCount} recensioni
                        </span>
                      </div>
                    </div>

                    {/* Contenuto Nutrizionale */}
                    <div className="p-4">
                      {/* Macronutrienti Principali */}
                      <div className="grid grid-cols-4 gap-2 mb-4 text-xs">
                        <div className="text-center bg-gray-700 rounded-lg py-2">
                          <div className="font-semibold text-white">{recipe.calorie}</div>
                          <div className="text-gray-400">kcal</div>
                        </div>
                        <div className="text-center bg-blue-700 rounded-lg py-2">
                          <div className="font-semibold text-white">{recipe.proteine}g</div>
                          <div className="text-gray-300">Prot</div>
                        </div>
                        <div className="text-center bg-purple-700 rounded-lg py-2">
                          <div className="font-semibold text-white">{recipe.carboidrati}g</div>
                          <div className="text-gray-300">Carb</div>
                        </div>
                        <div className="text-center bg-yellow-700 rounded-lg py-2">
                          <div className="font-semibold text-white">{recipe.grassi}g</div>
                          <div className="text-gray-300">Fat</div>
                        </div>
                      </div>

                      {/* Info Tempo e Difficoltà */}
                      <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{recipe.tempoPreparazione} min</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Target className="h-4 w-4" />
                          <span className="capitalize">{recipe.difficolta}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{recipe.porzioni} porz.</span>
                        </div>
                      </div>

                      {/* Badge Obiettivi Fitness */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {recipe.obiettivo_fitness.slice(0, 2).map((obj) => {
                          const objective = FITNESS_OBJECTIVES.find(o => o.value === obj);
                          return (
                            <span key={obj} className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${objective?.color ? `text-white` : 'text-gray-300'}`}
                                  style={{ backgroundColor: objective?.color?.replace('text-', '') || '#6B7280' }}>
                              {objective && <objective.icon size={12} />}
                              {objective?.label.split('/')[0] || obj}
                            </span>
                          );
                        })}
                      </div>

                      {/* Macro Focus Indicator */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${getMacroFocusColor(recipe.macro_focus)}`}></div>
                          <span className="text-xs text-gray-400 capitalize">
                            {recipe.macro_focus.replace('_', ' ')}
                          </span>
                        </div>
                        {recipe.fonte === 'ai_generated' && (
                          <span className="text-xs text-purple-400">
                            <Zap size={12} className="inline mr-1" />
                            AI Generated
                          </span>
                        )}
                      </div>

                      {/* Bottone Visualizza */}
                      <button
                        onClick={() => openRecipeModal(recipe)}
                        className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-2 px-4 rounded-lg transition-all font-semibold flex items-center justify-center space-x-2"
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

      {/* Modal Generazione AI */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            {/* Header Modal */}
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">🤖 Generatore AI Ricette FITNESS</h2>
              <button
                onClick={() => setShowAiModal(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            {/* Contenuto Modal */}
            <div className="p-6">
              <p className="text-gray-300 mb-6">
                Crea ricette fitness personalizzate con AI! Ricette ottimizzate da fonti specializzate: preparatori atletici, nutrizionisti sportivi e influencer fitness.
              </p>

              <div className="space-y-4">
                {/* Ingredienti */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    🥬 Ingredienti disponibili (separati da virgola)
                  </label>
                  <input
                    type="text"
                    placeholder="es. pollo, broccoli, quinoa, avocado, proteine whey"
                    value={aiFormData.ingredienti}
                    onChange={(e) => setAiFormData(prev => ({...prev, ingredienti: e.target.value}))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Grid campi */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Obiettivo FITNESS */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">🎯 Obiettivo FITNESS</label>
                    <select
                      value={aiFormData.obiettivo}
                      onChange={(e) => setAiFormData(prev => ({...prev, obiettivo: e.target.value}))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {FITNESS_OBJECTIVES.map(obj => (
                        <option key={obj.value} value={obj.value}>{obj.label}</option>
                      ))}
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
                      {MEAL_CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Tipo Dieta */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">🥗 Tipo Dieta</label>
                    <select
                      value={aiFormData.tipoDieta}
                      onChange={(e) => setAiFormData(prev => ({...prev, tipoDieta: e.target.value}))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="balanced">Bilanciata</option>
                      {DIET_TYPES.map(diet => (
                        <option key={diet.value} value={diet.value}>{diet.label}</option>
                      ))}
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
                </div>

                {/* Allergie */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">⚠️ Allergie/Da Evitare</label>
                  <input
                    type="text"
                    placeholder="es. glutine, lattosio, noci, crostacei"
                    value={aiFormData.allergie}
                    onChange={(e) => setAiFormData(prev => ({...prev, allergie: e.target.value}))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Pulsanti */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setShowAiModal(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg transition-colors"
                  >
                    Annulla
                  </button>
                  <button
                    onClick={generateAiRecipe}
                    disabled={aiGenerating || !aiFormData.ingredienti.trim()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg transition-colors font-semibold flex items-center justify-center space-x-2"
                  >
                    {aiGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Generando...</span>
                      </>
                    ) : (
                      <>
                        <span>🤖</span>
                        <span>Genera Ricetta FITNESS</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Info AI */}
              <div className="mt-6 p-4 bg-blue-600 bg-opacity-20 rounded-lg border border-blue-600 border-opacity-30">
                <h4 className="text-blue-400 font-semibold mb-2">💡 AI FITNESS SPECIALIZZATA:</h4>
                <ul className="text-blue-200 text-sm space-y-1">
                  <li>• Ricette da fonti fitness specializzate (preparatori, atleti, nutrizionisti sportivi)</li>
                  <li>• Ottimizzazione automatica per obiettivo specifico (cutting/bulking/performance)</li>
                  <li>• Calcolo preciso macronutrienti per timing ottimale</li>
                  <li>• Ingredienti performance-oriented con focus sulla qualità</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ricetta Dettagliata - SENZA IMMAGINE */}
      {showRecipeModal && selectedRecipe && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            {/* Header Modal */}
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">{selectedRecipe.nome}</h2>
                <div className="flex items-center space-x-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCategoryColor(selectedRecipe.categoria)}`}>
                    {MEAL_CATEGORIES.find(c => c.value === selectedRecipe.categoria)?.label || selectedRecipe.categoria}
                  </span>
                  {selectedRecipe.fonte === 'ai_generated' && (
                    <span className="px-2 py-1 bg-purple-600 text-white rounded-full text-xs font-semibold">
                      🤖 AI Generated
                    </span>
                  )}
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                    <span className="text-white">{selectedRecipe.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={closeRecipeModal}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors ml-4"
              >
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            {/* Contenuto Modal */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Colonna 1 - Info Nutrizionali e Caratteristiche */}
                <div>
                  {/* Macronutrienti Dettagliati */}
                  <div className="bg-gray-700 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Flame className="h-5 w-5 text-orange-500" />
                      Valori Nutrizionali
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="text-center bg-orange-600 rounded py-3">
                        <div className="font-bold text-white text-xl">{selectedRecipe.calorie}</div>
                        <div className="text-orange-100">Calorie</div>
                      </div>
                      <div className="text-center bg-blue-600 rounded py-3">
                        <div className="font-bold text-white text-xl">{selectedRecipe.proteine}g</div>
                        <div className="text-blue-100">Proteine</div>
                      </div>
                      <div className="text-center bg-purple-600 rounded py-3">
                        <div className="font-bold text-white text-xl">{selectedRecipe.carboidrati}g</div>
                        <div className="text-purple-100">Carboidrati</div>
                      </div>
                      <div className="text-center bg-yellow-600 rounded py-3">
                        <div className="font-bold text-white text-xl">{selectedRecipe.grassi}g</div>
                        <div className="text-yellow-100">Grassi</div>
                      </div>
                    </div>
                  </div>

                  {/* Info Caratteristiche */}
                  <div className="bg-gray-700 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-semibold text-white mb-3">📋 Caratteristiche</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 flex items-center gap-2">
                          <Clock size={16} />
                          Tempo:
                        </span>
                        <span className="text-white font-medium">{selectedRecipe.tempoPreparazione} minuti</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 flex items-center gap-2">
                          <Users size={16} />
                          Porzioni:
                        </span>
                        <span className="text-white font-medium">{selectedRecipe.porzioni}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 flex items-center gap-2">
                          <Target size={16} />
                          Difficoltà:
                        </span>
                        <span className="text-white font-medium capitalize">{selectedRecipe.difficolta}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 flex items-center gap-2">
                          <Activity size={16} />
                          Focus Macro:
                        </span>
                        <span className="text-white font-medium capitalize">{selectedRecipe.macro_focus.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Obiettivi Fitness */}
                  <div className="bg-gradient-to-br from-green-800 to-blue-800 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Dumbbell className="h-5 w-5" />
                      Obiettivi FITNESS
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedRecipe.obiettivo_fitness.map((obj) => {
                        const objective = FITNESS_OBJECTIVES.find(o => o.value === obj);
                        return (
                          <span key={obj} className="px-3 py-2 bg-white bg-opacity-20 text-white rounded-full text-sm font-medium flex items-center gap-2">
                            {objective && <objective.icon size={14} />}
                            {objective?.label || obj}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Colonna 2 - Ingredienti */}
                <div>
                  <div className="bg-gray-700 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <ChefHat className="h-5 w-5 text-green-400" />
                      Ingredienti
                    </h3>
                    <ul className="space-y-3">
                      {selectedRecipe.ingredienti.map((ingrediente, index) => (
                        <li key={index} className="flex items-start space-x-3 bg-gray-600 p-3 rounded-lg">
                          <span className="text-green-400 mt-1 font-bold">•</span>
                          <span className="text-gray-200 flex-1">{ingrediente}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Tags e Dieta */}
                  <div className="space-y-4">
                    {/* Tipo Dieta */}
                    {selectedRecipe.tipoDieta.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-300 mb-2">🥗 Tipo Dieta</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedRecipe.tipoDieta.map((dieta) => {
                            const dietType = DIET_TYPES.find(d => d.value === dieta);
                            return (
                              <span key={dieta} className={`px-3 py-1 rounded-full text-sm font-medium ${dietType?.color || 'bg-gray-100 text-gray-800'}`}>
                                {dietType?.label || dieta}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {selectedRecipe.tags.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-300 mb-2">🏷️ Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedRecipe.tags.map((tag) => (
                            <span key={tag} className="px-3 py-1 bg-gray-600 text-gray-300 rounded-full text-sm">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Colonna 3 - Preparazione */}
                <div>
                  <div className="bg-gray-700 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-400" />
                      Preparazione Step-by-Step
                    </h3>
                    <div className="text-gray-200 leading-relaxed">
                      {selectedRecipe.preparazione.split('. ').map((step, index) => (
                        <div key={index} className="mb-3 p-3 bg-gray-600 rounded-lg">
                          <div className="flex gap-3">
                            <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                              {index + 1}
                            </span>
                            <p className="text-sm">{step.trim()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Tempo evidenziato */}
                    <div className="mt-4 p-3 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg">
                      <div className="flex items-center space-x-2 text-white">
                        <Clock className="h-5 w-5" />
                        <span className="font-semibold">Tempo totale: {selectedRecipe.tempoPreparazione} minuti</span>
                      </div>
                    </div>
                  </div>

                  {/* Azioni */}
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-3">🎯 Azioni</h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => toggleFavorite(selectedRecipe.id)}
                        className={`w-full py-2 px-4 rounded-lg transition-colors font-semibold flex items-center justify-center gap-2 ${
                          favoriteRecipes.has(selectedRecipe.id)
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-gray-600 hover:bg-gray-500 text-white'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${favoriteRecipes.has(selectedRecipe.id) ? 'fill-current' : ''}`} />
                        {favoriteRecipes.has(selectedRecipe.id) ? 'Rimuovi da Preferiti' : 'Aggiungi ai Preferiti'}
                      </button>

                      <button
                        onClick={() => {
                          const recipeText = `RICETTA FITNESS: ${selectedRecipe.nome}\n\n` +
                            `MACROS: ${selectedRecipe.calorie}kcal | ${selectedRecipe.proteine}g prot | ${selectedRecipe.carboidrati}g carb | ${selectedRecipe.grassi}g fat\n\n` +
                            `INGREDIENTI:\n${selectedRecipe.ingredienti.map(ing => `• ${ing}`).join('\n')}\n\n` +
                            `PREPARAZIONE:\n${selectedRecipe.preparazione}\n\n` +
                            `⏱️ Tempo: ${selectedRecipe.tempoPreparazione} min | 🍽️ Porzioni: ${selectedRecipe.porzioni}`;
                          
                          navigator.clipboard.writeText(recipeText);
                          alert('✅ Ricetta copiata negli appunti!');
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors font-semibold flex items-center justify-center gap-2"
                      >
                        📋 Copia Ricetta
                      </button>

                      <button
                        onClick={() => {
                          const whatsappText = `💪 RICETTA FITNESS: ${selectedRecipe.nome}\n\n` +
                            `📊 ${selectedRecipe.calorie}kcal | ${selectedRecipe.proteine}g proteine\n` +
                            `⏱️ ${selectedRecipe.tempoPreparazione} minuti\n\n` +
                            `Perfetta per: ${selectedRecipe.obiettivo_fitness.join(', ')}\n\n` +
                            `Generata con Meal Prep Planner AI 🤖`;
                          
                          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
                          window.open(whatsappUrl, '_blank');
                        }}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors font-semibold flex items-center justify-center gap-2"
                      >
                        📱 Condividi WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <div className="flex justify-center items-center gap-3 mb-4">
              <ChefHat className="h-8 w-8 text-green-400" />
              <h3 className="text-xl font-bold text-white">Database Ricette FITNESS</h3>
            </div>
            <p className="text-gray-400 mb-4 max-w-2xl mx-auto">
              Ricette ottimizzate da fonti fitness specializzate + AI infinita per performance, recovery e risultati concreti. 
              Ogni ricetta è calibrata per obiettivi specifici di allenamento.
            </p>
          </div>

          {/* Stats Footer */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{recipes.length}</div>
              <div className="text-gray-400 text-sm">Ricette Totali</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{recipes.filter(r => r.fonte === 'ai_generated').length}</div>
              <div className="text-gray-400 text-sm">AI Generated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{recipes.filter(r => r.proteine >= 30).length}</div>
              <div className="text-gray-400 text-sm">High Protein</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{favoriteRecipes.size}/10</div>
              <div className="text-gray-400 text-sm">Preferiti</div>
            </div>
          </div>

          {/* Links Footer */}
          <div className="flex justify-center gap-6 text-sm border-t border-gray-700 pt-6">
            <Link href="/" className="text-gray-400 hover:text-green-400 transition-colors">
              Home
            </Link>
            <Link href="/dashboard" className="text-gray-400 hover:text-green-400 transition-colors">
              Dashboard
            </Link>
            <Link href="/ricette/smoothies-spuntini" className="text-gray-400 hover:text-green-400 transition-colors">
              Smoothies & Spuntini FIT
            </Link>
            <Link href="/privacy" className="text-gray-400 hover:text-green-400 transition-colors">
              Privacy
            </Link>
          </div>

          {/* Disclaimer */}
          <div className="text-center mt-6 pt-6 border-t border-gray-700">
            <p className="text-gray-500 text-xs">
              ⚠️ Le ricette sono generate da AI specializzata in fitness. Consulta sempre un nutrizionista per piani personalizzati.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}