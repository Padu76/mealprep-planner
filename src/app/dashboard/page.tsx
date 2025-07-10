'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../components/header';
import { Calendar, Clock, Users, Flame, Filter, Search, Grid, List, Download, Share2, Eye, Trash2, Trophy, Target, TrendingUp, Award, Star } from 'lucide-react';

interface SavedPlan {
  id: string;
  nome: string;
  createdAt: string;
  obiettivo: string;
  durata: string;
  pasti: string;
  calorie: number;
  totalCalories: number;
  totalProteins: number;
  allergie: string[];
  preferenze: string[];
  formData: any;
  days: any[];
  generatedPlan: string;
}

export default function Dashboard() {
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<SavedPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<SavedPlan | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filtri
  const [searchTerm, setSearchTerm] = useState('');
  const [objectiveFilter, setObjectiveFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  // Carica piani salvati
  useEffect(() => {
    const loadSavedPlans = () => {
      try {
        const plans = JSON.parse(localStorage.getItem('mealPrepSavedPlans') || '[]');
        setSavedPlans(plans);
        setFilteredPlans(plans);
        setLoading(false);
      } catch (error) {
        console.error('Errore caricamento piani:', error);
        setLoading(false);
      }
    };

    loadSavedPlans();
  }, []);

  // Applica filtri
  useEffect(() => {
    let filtered = [...savedPlans];

    // Filtro ricerca
    if (searchTerm) {
      filtered = filtered.filter(plan => 
        plan.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.obiettivo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro obiettivo
    if (objectiveFilter !== 'all') {
      filtered = filtered.filter(plan => plan.obiettivo.toLowerCase().includes(objectiveFilter));
    }

    // Filtro periodo
    if (periodFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (periodFilter) {
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          filterDate.setMonth(now.getMonth() - 3);
          break;
      }
      
      filtered = filtered.filter(plan => new Date(plan.createdAt) >= filterDate);
    }

    // Ordinamento
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'name':
        filtered.sort((a, b) => a.nome.localeCompare(b.nome));
        break;
      case 'calories':
        filtered.sort((a, b) => b.calorie - a.calorie);
        break;
    }

    setFilteredPlans(filtered);
  }, [savedPlans, searchTerm, objectiveFilter, periodFilter, sortBy]);

  // Statistiche utente
  const stats = {
    totalPlans: savedPlans.length,
    avgCalories: savedPlans.length > 0 ? Math.round(savedPlans.reduce((sum, plan) => sum + plan.calorie, 0) / savedPlans.length) : 0,
    totalDays: savedPlans.reduce((sum, plan) => sum + parseInt(plan.durata), 0),
    avgProteins: savedPlans.length > 0 ? Math.round(savedPlans.reduce((sum, plan) => sum + plan.totalProteins, 0) / savedPlans.length) : 0,
    createdToday: savedPlans.filter(plan => {
      const today = new Date().toISOString().split('T')[0];
      return plan.createdAt === today;
    }).length,
    thisWeek: savedPlans.filter(plan => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(plan.createdAt) >= weekAgo;
    }).length
  };

  // Sistema Achievement/Gamification
  const getAchievements = () => {
    const achievements = [];
    
    if (stats.totalPlans >= 1) {
      achievements.push({
        id: 'first_plan',
        title: '🎉 Primo Piano Creato',
        description: 'Hai creato il tuo primo piano alimentare!',
        completed: true,
        points: 10
      });
    }
    
    if (stats.totalPlans >= 5) {
      achievements.push({
        id: 'veteran',
        title: '🏆 Pianificatore Veterano',
        description: 'Hai creato 5 piani alimentari',
        completed: true,
        points: 50
      });
    }
    
    if (stats.totalPlans >= 10) {
      achievements.push({
        id: 'master',
        title: '👑 Master Planner',
        description: 'Hai creato 10 piani alimentari!',
        completed: true,
        points: 100
      });
    }
    
    if (stats.createdToday > 0) {
      achievements.push({
        id: 'daily_creator',
        title: '⚡ Creatore Quotidiano',
        description: 'Hai creato un piano oggi!',
        completed: true,
        points: 15
      });
    }
    
    if (stats.thisWeek >= 3) {
      achievements.push({
        id: 'weekly_champion',
        title: '🔥 Campione Settimanale',
        description: 'Hai creato 3+ piani questa settimana',
        completed: true,
        points: 30
      });
    }

    // Achievement mancanti
    if (stats.totalPlans < 5) {
      achievements.push({
        id: 'veteran_locked',
        title: '🔒 Pianificatore Veterano',
        description: `Crea ${5 - stats.totalPlans} piani per sbloccare`,
        completed: false,
        points: 50
      });
    }
    
    if (stats.totalPlans < 10) {
      achievements.push({
        id: 'master_locked',
        title: '🔒 Master Planner',
        description: `Crea ${10 - stats.totalPlans} piani per sbloccare`,
        completed: false,
        points: 100
      });
    }

    return achievements;
  };

  const achievements = getAchievements();
  const totalPoints = achievements.filter(a => a.completed).reduce((sum, a) => sum + a.points, 0);
  const completedAchievements = achievements.filter(a => a.completed).length;

  // Funzioni
  const deletePlan = (planId: string) => {
    if (confirm('Sei sicuro di voler eliminare questo piano?')) {
      const updatedPlans = savedPlans.filter(plan => plan.id !== planId);
      setSavedPlans(updatedPlans);
      localStorage.setItem('mealPrepSavedPlans', JSON.stringify(updatedPlans));
    }
  };

  const exportPlan = (plan: SavedPlan) => {
    const dataStr = JSON.stringify(plan, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `piano-${plan.nome}-${plan.createdAt}.json`;
    link.click();
  };

  const sharePlan = (plan: SavedPlan) => {
    const text = `🍽️ Guarda il mio piano alimentare "${plan.nome}"!\n\n🎯 Obiettivo: ${plan.obiettivo}\n🔥 ${plan.calorie} kcal/giorno\n📅 ${plan.durata} giorni\n\nCreato con Meal Prep Planner 💪`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Genera immagine ricetta
  const generateRecipeImage = (recipeName: string): string => {
    const cleanName = recipeName.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-');
    return `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&auto=format&q=80&crop=center&${cleanName}`;
  };

  // Modal dettagli piano
  const PlanDetailsModal = ({ plan, onClose }: { plan: SavedPlan; onClose: () => void }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'recipes' | 'shopping'>('overview');

    if (!plan.days || plan.days.length === 0) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-xl font-bold text-white mb-4">Piano non disponibile</h3>
            <p className="text-gray-300 mb-4">I dettagli di questo piano non sono disponibili.</p>
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
            >
              Chiudi
            </button>
          </div>
        </div>
      );
    }

    // Ottieni tutti i pasti in ordine
    const getAllMealsInOrder = (dayMeals: any) => {
      const meals = [];
      meals.push({ key: 'colazione', meal: dayMeals.colazione, emoji: '🌅', nome: 'COLAZIONE' });
      if (dayMeals.spuntino1) meals.push({ key: 'spuntino1', meal: dayMeals.spuntino1, emoji: '🍎', nome: 'SPUNTINO MATTINA' });
      meals.push({ key: 'pranzo', meal: dayMeals.pranzo, emoji: '☀️', nome: 'PRANZO' });
      if (dayMeals.spuntino2) meals.push({ key: 'spuntino2', meal: dayMeals.spuntino2, emoji: '🥤', nome: 'SPUNTINO POMERIGGIO' });
      meals.push({ key: 'cena', meal: dayMeals.cena, emoji: '🌙', nome: 'CENA' });
      if (dayMeals.spuntino3) meals.push({ key: 'spuntino3', meal: dayMeals.spuntino3, emoji: '🌆', nome: 'SPUNTINO SERA' });
      return meals;
    };

    // Ottieni ricette uniche
    const allRecipes = Array.from(new Set(
      plan.days.flatMap(dayData => 
        getAllMealsInOrder(dayData.meals).map(({ meal }) => meal.nome)
      )
    )).map(recipeName => {
      const recipe = plan.days.flatMap(dayData => 
        getAllMealsInOrder(dayData.meals)
      ).find(({ meal }) => meal.nome === recipeName)?.meal;
      
      if (recipe && !recipe.imageUrl) {
        recipe.imageUrl = generateRecipeImage(recipe.nome);
      }
      
      return recipe;
    }).filter(Boolean);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-gray-700">
            <div>
              <h3 className="text-2xl font-bold text-white">{plan.nome}</h3>
              <p className="text-gray-300">Piano creato il {new Date(plan.createdAt).toLocaleDateString('it-IT')}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 font-semibold ${
                activeTab === 'overview' 
                  ? 'text-green-400 border-b-2 border-green-400' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              📋 Panoramica
            </button>
            <button
              onClick={() => setActiveTab('recipes')}
              className={`px-6 py-3 font-semibold ${
                activeTab === 'recipes' 
                  ? 'text-green-400 border-b-2 border-green-400' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              🍳 Ricette
            </button>
            <button
              onClick={() => setActiveTab('shopping')}
              className={`px-6 py-3 font-semibold ${
                activeTab === 'shopping' 
                  ? 'text-green-400 border-b-2 border-green-400' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              🛒 Lista Spesa
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {activeTab === 'overview' && (
              <div>
                {plan.days.map((dayData, dayIndex) => {
                  const dayMeals = getAllMealsInOrder(dayData.meals);
                  const dayTotalCalories = dayMeals.reduce((sum, { meal }) => sum + meal.calorie, 0);
                  
                  return (
                    <div key={dayIndex} className="mb-6 bg-gray-700 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-bold text-white">{dayData.day}</h4>
                        <span className="text-green-400 font-semibold">🔥 {dayTotalCalories} kcal</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {dayMeals.map(({ key, meal, emoji, nome }) => (
                          <div key={key} className="bg-gray-600 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <span>{emoji}</span>
                              <span className="font-semibold text-white text-sm">{nome}</span>
                            </div>
                            <h5 className="font-bold text-green-400 text-sm mb-1">{meal.nome}</h5>
                            <div className="text-xs text-gray-300">
                              🔥 {meal.calorie} kcal | P: {meal.proteine}g | C: {meal.carboidrati}g | G: {meal.grassi}g
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'recipes' && (
              <div className="grid md:grid-cols-2 gap-4">
                {allRecipes.map((recipe, index) => (
                  <div key={index} className="bg-gray-700 rounded-xl overflow-hidden">
                    <img 
                      src={recipe!.imageUrl || generateRecipeImage(recipe!.nome)}
                      alt={recipe!.nome}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-4">
                      <h4 className="text-lg font-bold text-white mb-2">{recipe!.nome}</h4>
                      <div className="text-xs text-gray-300 mb-3">
                        🔥 {recipe!.calorie} kcal | ⏱️ {recipe!.tempo} | 👥 {recipe!.porzioni} porz.
                      </div>
                      <div className="space-y-2">
                        <div>
                          <h6 className="font-semibold text-white text-sm mb-1">Ingredienti:</h6>
                          <div className="text-xs text-gray-300">
                            {recipe!.ingredienti.slice(0, 3).map((ing, idx) => (
                              <div key={idx}>• {ing}</div>
                            ))}
                            {recipe!.ingredienti.length > 3 && (
                              <div>... e altri {recipe!.ingredienti.length - 3}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'shopping' && (
              <div>
                <p className="text-gray-300 text-center">
                  Lista della spesa per il piano "{plan.nome}"
                </p>
                <div className="mt-4 text-gray-300">
                  Funzionalità in sviluppo - Lista spesa dettagliata disponibile nel piano completo.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
            <p className="mt-4 text-gray-300">Caricamento dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Dashboard */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-500 p-3 rounded-xl">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">I Miei Piani Alimentari</h1>
              <p className="text-gray-400">Gestisci e visualizza tutti i tuoi piani fitness personalizzati</p>
            </div>
          </div>
        </div>

        {/* Statistiche e Achievement */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">{stats.totalPlans}</h3>
                <p className="text-blue-100">Piani Totali</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">{stats.avgCalories}</h3>
                <p className="text-orange-100">Kcal Media</p>
              </div>
              <Flame className="w-8 h-8 text-orange-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">{stats.createdToday}</h3>
                <p className="text-purple-100">Oggi</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">{stats.avgProteins}g</h3>
                <p className="text-green-100">Proteine Media</p>
              </div>
              <Target className="w-8 h-8 text-green-200" />
            </div>
          </div>
        </div>

        {/* Achievement Section */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-bold text-white">Achievement & Progressi</h2>
            <div className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
              {totalPoints} punti
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {achievements.slice(0, 6).map((achievement) => (
              <div 
                key={achievement.id}
                className={`p-4 rounded-lg border-2 ${
                  achievement.completed 
                    ? 'border-green-500 bg-green-900/20' 
                    : 'border-gray-600 bg-gray-700/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`font-bold ${achievement.completed ? 'text-green-400' : 'text-gray-400'}`}>
                    {achievement.title}
                  </h3>
                  <span className={`text-sm px-2 py-1 rounded ${
                    achievement.completed ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                  }`}>
                    {achievement.points}pt
                  </span>
                </div>
                <p className="text-sm text-gray-300">{achievement.description}</p>
                {achievement.completed && (
                  <div className="mt-2 flex items-center gap-1 text-green-400 text-sm">
                    <Award className="w-4 h-4" />
                    Completato!
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-semibold">Progressi Achievement</span>
              <span className="text-green-400">{completedAchievements}/{achievements.length}</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all"
                style={{width: `${(completedAchievements / achievements.length) * 100}%`}}
              ></div>
            </div>
          </div>
        </div>

        {/* Filtri e Controlli */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cerca per nome o obiettivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
              />
            </div>

            <select
              value={objectiveFilter}
              onChange={(e) => setObjectiveFilter(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
            >
              <option value="all">Tutti gli obiettivi</option>
              <option value="perdita">Perdita peso</option>
              <option value="aumento">Aumento massa</option>
              <option value="mantenimento">Mantenimento</option>
            </select>

            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
            >
              <option value="all">Tutti i periodi</option>
              <option value="week">Ultima settimana</option>
              <option value="month">Ultimo mese</option>
              <option value="quarter">Ultimo trimestre</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
            >
              <option value="recent">Più recenti</option>
              <option value="oldest">Più vecchi</option>
              <option value="name">Nome A-Z</option>
              <option value="calories">Calorie (alte)</option>
            </select>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            
            <div className="text-sm text-gray-400">
              Mostrando {filteredPlans.length} di {savedPlans.length} piani
            </div>
          </div>
        </div>

        {/* Lista Piani */}
        {filteredPlans.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">Nessun piano trovato</h3>
            <p className="text-gray-500 mb-6">
              {savedPlans.length === 0 
                ? "Non hai ancora creato nessun piano alimentare."
                : "Nessun piano corrisponde ai filtri selezionati."
              }
            </p>
            <Link
              href="/"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
            >
              🍽️ Crea Nuovo Piano Fitness
            </Link>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredPlans.map((plan) => (
              <div key={plan.id} className={`bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors ${viewMode === 'list' ? 'flex items-center justify-between' : ''}`}>
                <div className={viewMode === 'list' ? 'flex items-center gap-6 flex-1' : ''}>
                  <div className={`flex items-center gap-3 mb-4 ${viewMode === 'list' ? 'mb-0' : ''}`}>
                    <div className="bg-green-500 p-2 rounded-lg">
                      <span className="text-lg">
                        {plan.obiettivo.includes('perdita') ? '🔥' : plan.obiettivo.includes('aumento') ? '💪' : '⚖️'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{plan.nome}</h3>
                      <p className="text-sm text-gray-400">{new Date(plan.createdAt).toLocaleDateString('it-IT')}</p>
                    </div>
                  </div>

                  {viewMode === 'grid' && (
                    <>
                      <div className="flex justify-between items-center mb-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          plan.obiettivo.includes('perdita') ? 'bg-red-900 text-red-300' :
                          plan.obiettivo.includes('aumento') ? 'bg-blue-900 text-blue-300' : 
                          'bg-green-900 text-green-300'
                        }`}>
                          {plan.obiettivo}
                        </span>
                        <span className="text-sm text-gray-400">{plan.durata} giorni</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-700 rounded-lg p-3 text-center">
                          <div className="text-sm text-gray-400">Pasti/giorno</div>
                          <div className="text-lg font-bold text-white">{plan.pasti}</div>
                        </div>
                        <div className="bg-gray-700 rounded-lg p-3 text-center">
                          <div className="text-sm text-gray-400">Calorie/giorno</div>
                          <div className="text-lg font-bold text-orange-400">{plan.calorie}</div>
                        </div>
                      </div>

                      {plan.allergie && plan.allergie.length > 0 && (
                        <div className="mb-4">
                          <div className="text-xs text-gray-400 mb-1">Allergie/Esclusioni:</div>
                          <div className="flex flex-wrap gap-1">
                            {plan.allergie.slice(0, 3).map((allergia, idx) => (
                              <span key={idx} className="bg-red-900 text-red-300 px-2 py-1 rounded text-xs">
                                ⚠️ {allergia}
                              </span>
                            ))}
                            {plan.allergie.length > 3 && (
                              <span className="text-xs text-gray-400">+{plan.allergie.length - 3}</span>
                            )}
                          </div>
                        </div>
                      )}

                      {plan.preferenze && plan.preferenze.length > 0 && (
                        <div className="mb-4">
                          <div className="text-xs text-gray-400 mb-1">Preferenze:</div>
                          <div className="flex flex-wrap gap-1">
                            {plan.preferenze.slice(0, 2).map((pref, idx) => (
                              <span key={idx} className="bg-green-900 text-green-300 px-2 py-1 rounded text-xs">
                                ✅ {pref}
                              </span>
                            ))}
                            {plan.preferenze.length > 2 && (
                              <span className="text-xs text-gray-400">+{plan.preferenze.length - 2}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {viewMode === 'list' && (
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-sm text-gray-400">Obiettivo</div>
                        <div className="text-sm font-semibold text-white">{plan.obiettivo}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-400">Durata</div>
                        <div className="text-sm font-semibold text-white">{plan.durata} giorni</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-400">Pasti</div>
                        <div className="text-sm font-semibold text-white">{plan.pasti}/giorno</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-400">Calorie</div>
                        <div className="text-sm font-semibold text-orange-400">{plan.calorie}/giorno</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className={`flex gap-2 ${viewMode === 'list' ? 'ml-4' : 'mt-4'}`}>
                  <button
                    onClick={() => {
                      setSelectedPlan(plan);
                      setShowPlanModal(true);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
                    title="Visualizza dettagli"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => sharePlan(plan)}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                    title="Condividi"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => exportPlan(plan)}
                    className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-colors"
                    title="Esporta"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deletePlan(plan.id)}
                    className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                    title="Elimina"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA Creazione Nuovo Piano */}
        <div className="text-center mt-12">
          <Link
            href="/"
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 inline-flex items-center gap-3 shadow-lg"
          >
            🍽️ Crea Nuovo Piano Fitness
            <Star className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Modal Dettagli Piano */}
      {showPlanModal && selectedPlan && (
        <PlanDetailsModal 
          plan={selectedPlan} 
          onClose={() => {
            setShowPlanModal(false);
            setSelectedPlan(null);
          }} 
        />
      )}
    </div>
  );
}