'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface UserStats {
  totalPlans: number;
  totalCalories: number;
  totalDays: number;
  currentStreak: number;
  longestStreak: number;
  monthlyPoints: number;
  totalPoints: number;
  level: number;
  preferredObjective: string;
  avgCaloriesPerDay: number;
  varietyScore: number;
}

export default function DashboardPage() {
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<SavedPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'tutti' | 'oggi' | 'settimana' | 'mese'>('tutti');
  const [selectedPlan, setSelectedPlan] = useState<SavedPlan | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  // Carica piani salvati
  useEffect(() => {
    const loadSavedPlans = () => {
      try {
        const plans = JSON.parse(localStorage.getItem('mealPrepSavedPlans') || '[]');
        setSavedPlans(plans);
        setFilteredPlans(plans);
        
        // Seleziona automaticamente l'ultimo piano
        if (plans.length > 0) {
          setSelectedPlan(plans[0]);
        }
        
        // Calcola statistiche e achievements
        calculateUserStats(plans);
        calculateAchievements(plans);
        
        setLoading(false);
      } catch (error) {
        console.error('Errore caricamento piani:', error);
        setLoading(false);
      }
    };

    loadSavedPlans();
  }, []);

  // Calcola statistiche utente
  const calculateUserStats = (plans: SavedPlan[]) => {
    if (plans.length === 0) {
      setUserStats({
        totalPlans: 0, totalCalories: 0, totalDays: 0, currentStreak: 0,
        longestStreak: 0, monthlyPoints: 0, totalPoints: 0, level: 1,
        preferredObjective: 'Nessuno', avgCaloriesPerDay: 0, varietyScore: 0
      });
      return;
    }

    const totalDays = plans.reduce((sum, plan) => sum + parseInt(plan.durata), 0);
    const totalCalories = plans.reduce((sum, plan) => sum + plan.totalCalories, 0);
    const avgCaloriesPerDay = Math.round(totalCalories / Math.max(totalDays, 1));
    
    // Obiettivo più frequente
    const objectives = plans.map(p => p.obiettivo);
    const objCount = objectives.reduce((acc: any, obj) => {
      acc[obj] = (acc[obj] || 0) + 1;
      return acc;
    }, {});
    const preferredObjective = Object.entries(objCount).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'Nessuno';
    
    // Calcola streak
    const sortedPlans = [...plans].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    for (let i = 0; i < sortedPlans.length; i++) {
      const currentDate = new Date(sortedPlans[i].createdAt);
      const prevDate = i > 0 ? new Date(sortedPlans[i-1].createdAt) : null;
      
      if (!prevDate || (prevDate.getTime() - currentDate.getTime()) <= 7 * 24 * 60 * 60 * 1000) {
        tempStreak++;
        if (i === 0) currentStreak = tempStreak;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
    
    // Calcola varietà (ingredienti unici)
    const allIngredients = new Set<string>();
    plans.forEach(plan => {
      plan.days.forEach(day => {
        Object.values(day.meals).forEach((meal: any) => {
          if (meal?.ingredienti) {
            meal.ingredienti.forEach((ing: string) => allIngredients.add(ing.toLowerCase()));
          }
        });
      });
    });
    const varietyScore = Math.min(100, Math.round(allIngredients.size * 2));
    
    // Sistema punti
    const basePoints = plans.length * 10; // 10 punti per piano
    const streakBonus = currentStreak * 5; // 5 punti per giorno streak
    const varietyBonus = Math.round(varietyScore / 10); // Bonus varietà
    const calorieBonus = Math.round(totalCalories / 1000); // 1 punto ogni 1000 cal
    const totalPoints = basePoints + streakBonus + varietyBonus + calorieBonus;
    
    // Punti mensili (ultimi 30 giorni)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentPlans = plans.filter(plan => new Date(plan.createdAt) >= thirtyDaysAgo);
    const monthlyPoints = recentPlans.length * 10;
    
    // Livello (ogni 100 punti = 1 livello)
    const level = Math.floor(totalPoints / 100) + 1;

    setUserStats({
      totalPlans: plans.length,
      totalCalories,
      totalDays,
      currentStreak,
      longestStreak,
      monthlyPoints,
      totalPoints,
      level,
      preferredObjective,
      avgCaloriesPerDay,
      varietyScore
    });
  };

  // Sistema achievements avanzato
  const calculateAchievements = (plans: SavedPlan[]) => {
    const stats = userStats || {} as UserStats;
    const uniqueObjectives = new Set(plans.map(p => p.obiettivo)).size;
    const totalIngredients = new Set<string>();
    const totalMeals = plans.reduce((sum, plan) => {
      plan.days.forEach(day => {
        Object.values(day.meals).forEach((meal: any) => {
          if (meal?.ingredienti) {
            meal.ingredienti.forEach((ing: string) => totalIngredients.add(ing.toLowerCase()));
          }
        });
      });
      return sum + plan.days.length * parseInt(plan.pasti);
    }, 0);

    const achievements: Achievement[] = [
      // PIANI GENERATI
      { id: 'first-plan', title: '🌟 Primo Passo', description: 'Genera il tuo primo piano', icon: '🎯', points: 10, unlocked: plans.length >= 1 },
      { id: 'plan-5', title: '🔥 In Forma', description: 'Genera 5 piani', icon: '💪', points: 50, unlocked: plans.length >= 5 },
      { id: 'plan-10', title: '🏆 Dedicato', description: 'Genera 10 piani', icon: '🏅', points: 100, unlocked: plans.length >= 10 },
      { id: 'plan-25', title: '🚀 Expert', description: 'Genera 25 piani', icon: '👑', points: 250, unlocked: plans.length >= 25 },
      { id: 'plan-50', title: '🌟 Master Chef', description: 'Genera 50 piani', icon: '🎖️', points: 500, unlocked: plans.length >= 50 },
      
      // STREAK & CONSISTENZA
      { id: 'streak-3', title: '🔄 Costante', description: '3 piani in 3 settimane', icon: '⚡', points: 30, unlocked: (stats.currentStreak || 0) >= 3 },
      { id: 'streak-7', title: '📅 Disciplinato', description: '7 piani consecutivi', icon: '🎯', points: 70, unlocked: (stats.longestStreak || 0) >= 7 },
      { id: 'streak-14', title: '🔥 Inarrestabile', description: '14 piani consecutivi', icon: '🌟', points: 140, unlocked: (stats.longestStreak || 0) >= 14 },
      
      // VARIETÀ E OBIETTIVI
      { id: 'multi-goal', title: '🎭 Versatile', description: 'Prova 3 obiettivi diversi', icon: '🎨', points: 60, unlocked: uniqueObjectives >= 3 },
      { id: 'variety-master', title: '🌈 Variety Master', description: '100+ ingredienti diversi', icon: '🍽️', points: 150, unlocked: totalIngredients.size >= 100 },
      { id: 'ingredient-explorer', title: '🔍 Esploratore', description: '50+ ingredienti diversi', icon: '🧭', points: 80, unlocked: totalIngredients.size >= 50 },
      
      // CALORIE E MACRO
      { id: 'calorie-10k', title: '⚡ Energico', description: '10.000+ calorie pianificate', icon: '🔋', points: 100, unlocked: (stats.totalCalories || 0) >= 10000 },
      { id: 'calorie-50k', title: '🚀 Powerhouse', description: '50.000+ calorie pianificate', icon: '💥', points: 200, unlocked: (stats.totalCalories || 0) >= 50000 },
      
      // PASTI E GIORNI
      { id: 'meals-100', title: '🍽️ Gourmand', description: '100+ pasti pianificati', icon: '🥘', points: 120, unlocked: totalMeals >= 100 },
      { id: 'days-30', title: '📆 Planner Pro', description: '30+ giorni pianificati', icon: '🗓️', points: 90, unlocked: (stats.totalDays || 0) >= 30 },
      { id: 'days-100', title: '📅 Time Master', description: '100+ giorni pianificati', icon: '⏰', points: 300, unlocked: (stats.totalDays || 0) >= 100 },
      
      // PUNTI E LIVELLI
      { id: 'points-500', title: '💎 Skilled', description: '500+ punti totali', icon: '💯', points: 50, unlocked: (stats.totalPoints || 0) >= 500 },
      { id: 'points-1000', title: '👑 Elite', description: '1000+ punti totali', icon: '🏆', points: 100, unlocked: (stats.totalPoints || 0) >= 1000 },
      { id: 'level-5', title: '⭐ Rising Star', description: 'Raggiungi livello 5', icon: '🌟', points: 150, unlocked: (stats.level || 1) >= 5 },
      { id: 'level-10', title: '🔥 Legendary', description: 'Raggiungi livello 10', icon: '🎖️', points: 300, unlocked: (stats.level || 1) >= 10 },
      
      // ACHIEVEMENTS MENSILI
      { id: 'monthly-5', title: '📈 Attivo', description: '5 piani questo mese', icon: '📊', points: 50, unlocked: (stats.monthlyPoints || 0) >= 50 },
      { id: 'monthly-10', title: '🚀 Super Attivo', description: '10 piani questo mese', icon: '🎯', points: 100, unlocked: (stats.monthlyPoints || 0) >= 100 }
    ];

    setAchievements(achievements);
  };

  // Applica filtri
  useEffect(() => {
    const filterPlans = () => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      let filtered = savedPlans;

      switch (selectedFilter) {
        case 'oggi':
          filtered = savedPlans.filter(plan => plan.createdAt === today);
          break;
        case 'settimana':
          filtered = savedPlans.filter(plan => plan.createdAt >= weekAgo);
          break;
        case 'mese':
          filtered = savedPlans.filter(plan => plan.createdAt >= monthAgo);
          break;
        default:
          filtered = savedPlans;
      }

      setFilteredPlans(filtered);
    };

    filterPlans();
  }, [selectedFilter, savedPlans]);

  // Genera lista spesa migliorata con categorie specifiche
  const generateShoppingList = (plan: SavedPlan) => {
    const ingredients: { [key: string]: string[] } = {
      '🥚 Uova e Latticini': [],
      '🍎 Frutta e Verdura': [],
      '🥩 Carne e Pesce': [],
      '🌾 Cereali': [],
      '🥜 Frutta Secca': [],
      '🫒 Grassi e Condimenti': [],
      '💊 Integratori': [],
      '🥤 Bevande': [],
      '🛒 Altri': []
    };
    
    plan.days.forEach((day: any) => {
      Object.values(day.meals).forEach((meal: any) => {
        if (meal?.ingredienti) {
          meal.ingredienti.forEach((ingredient: string) => {
            const category = categorizeIngredientAdvanced(ingredient);
            if (!ingredients[category].includes(ingredient)) {
              ingredients[category].push(ingredient);
            }
          });
        }
      });
    });

    // Rimuovi categorie vuote
    Object.keys(ingredients).forEach(category => {
      if (ingredients[category].length === 0) {
        delete ingredients[category];
      }
    });

    return ingredients;
  };

  // Categorizza ingredienti migliorata
  const categorizeIngredientAdvanced = (ingredient: string): string => {
    const lower = ingredient.toLowerCase();
    
    // Uova e Latticini
    if (lower.includes('uova') || lower.includes('albumi') || lower.includes('ricotta') || 
        lower.includes('yogurt') || lower.includes('mozzarella') || lower.includes('parmigiano') ||
        lower.includes('cottage') || lower.includes('latte') || lower.includes('burro')) {
      return '🥚 Uova e Latticini';
    }
    
    // Frutta e Verdura
    if (lower.includes('spinaci') || lower.includes('broccoli') || lower.includes('zucchine') || 
        lower.includes('pomodori') || lower.includes('carote') || lower.includes('insalata') ||
        lower.includes('banana') || lower.includes('mela') || lower.includes('frutti') ||
        lower.includes('verdure') || lower.includes('cetrioli') || lower.includes('peperoni')) {
      return '🍎 Frutta e Verdura';
    }
    
    // Carne e Pesce
    if (lower.includes('pollo') || lower.includes('manzo') || lower.includes('tacchino') ||
        lower.includes('salmone') || lower.includes('tonno') || lower.includes('merluzzo') || 
        lower.includes('orata') || lower.includes('carne') || lower.includes('pesce')) {
      return '🥩 Carne e Pesce';
    }
    
    // Cereali
    if (lower.includes('avena') || lower.includes('riso') || lower.includes('quinoa') || 
        lower.includes('pasta') || lower.includes('pane') || lower.includes('farina') ||
        lower.includes('cereali') || lower.includes('orzo')) {
      return '🌾 Cereali';
    }
    
    // Frutta Secca
    if (lower.includes('mandorle') || lower.includes('noci') || lower.includes('semi') ||
        lower.includes('pistacchi') || lower.includes('nocciole')) {
      return '🥜 Frutta Secca';
    }
    
    // Grassi e Condimenti
    if (lower.includes('olio') || lower.includes('burro') || lower.includes('avocado') ||
        lower.includes('limone') || lower.includes('aceto') || lower.includes('spezie') ||
        lower.includes('erbe') || lower.includes('sale')) {
      return '🫒 Grassi e Condimenti';
    }
    
    // Integratori
    if (lower.includes('proteine') || lower.includes('whey') || lower.includes('creatina') ||
        lower.includes('vitamine') || lower.includes('omega')) {
      return '💊 Integratori';
    }
    
    // Bevande
    if (lower.includes('acqua') || lower.includes('latte') || lower.includes('succo') ||
        lower.includes('tè') || lower.includes('caffè')) {
      return '🥤 Bevande';
    }
    
    return '🛒 Altri';
  };

  // Elimina piano
  const deletePlan = (planId: string) => {
    const updatedPlans = savedPlans.filter(plan => plan.id !== planId);
    setSavedPlans(updatedPlans);
    localStorage.setItem('mealPrepSavedPlans', JSON.stringify(updatedPlans));
    if (selectedPlan?.id === planId) {
      setSelectedPlan(updatedPlans.length > 0 ? updatedPlans[0] : null);
    }
    calculateUserStats(updatedPlans);
    calculateAchievements(updatedPlans);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">Caricamento Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header con Stats Globali */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <img src="/images/icon-192x192.png" alt="Logo" className="w-10 h-10 rounded-full" />
              <h1 className="text-2xl font-bold">Dashboard Meal Prep</h1>
            </div>
            <Link 
              href="/" 
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
            >
              ➕ Nuovo Piano
            </Link>
          </div>

          {/* Stats Header */}
          {userStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-400">{userStats.totalPlans}</div>
                <div className="text-sm text-gray-400">Piani Totali</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-400">{Math.round(userStats.totalCalories / 1000)}k</div>
                <div className="text-sm text-gray-400">Calorie Totali</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-2xl font-bold text-purple-400">{userStats.totalDays}</div>
                <div className="text-sm text-gray-400">Giorni Pianificati</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-2xl font-bold text-yellow-400">{userStats.currentStreak}</div>
                <div className="text-sm text-gray-400">Streak Attuale</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-2xl font-bold text-red-400">Lv.{userStats.level}</div>
                <div className="text-sm text-gray-400">Livello</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-2xl font-bold text-orange-400">{userStats.totalPoints}</div>
                <div className="text-sm text-gray-400">Punti Totali</div>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Gamification Section */}
        {userStats && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 text-green-400">🎮 I Tuoi Achievement</h2>
            
            {/* Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold mb-3">📊 Progresso Mensile</h3>
                <div className="mb-2">
                  <div className="flex justify-between text-sm">
                    <span>Punti questo mese</span>
                    <span>{userStats.monthlyPoints}/150</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${Math.min(100, (userStats.monthlyPoints / 150) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold mb-3">🔥 Streak Fitness</h3>
                <div className="mb-2">
                  <div className="flex justify-between text-sm">
                    <span>Streak attuale</span>
                    <span>{userStats.currentStreak} giorni</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full" 
                      style={{ width: `${Math.min(100, (userStats.currentStreak / 14) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold mb-3">🌟 Varietà Score</h3>
                <div className="mb-2">
                  <div className="flex justify-between text-sm">
                    <span>Varietà ingredienti</span>
                    <span>{userStats.varietyScore}/100</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full" 
                      style={{ width: `${userStats.varietyScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-3 rounded-lg text-center transition-all ${
                    achievement.unlocked
                      ? 'bg-green-800 border border-green-600 shadow-lg shadow-green-500/20'
                      : 'bg-gray-800 border border-gray-600 opacity-60'
                  }`}
                >
                  <div className={`text-2xl mb-1 ${achievement.unlocked ? '' : 'grayscale'}`}>
                    {achievement.icon}
                  </div>
                  <div className={`text-xs font-medium ${achievement.unlocked ? 'text-green-400' : 'text-gray-400'}`}>
                    {achievement.title}
                  </div>
                  <div className="text-xs text-gray-500">{achievement.points}pt</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Piano Selezionato - Interfaccia Unica */}
        {selectedPlan && (
          <div className="mb-8 bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-green-400">Piano: {selectedPlan.nome}</h2>
                <p className="text-gray-400">
                  {selectedPlan.createdAt} • {selectedPlan.obiettivo} • {selectedPlan.durata} giorni • {selectedPlan.calorie} kcal/giorno
                </p>
              </div>
            </div>

            {/* Ricette con Foto */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-green-400">🍽️ Ricette Complete</h3>
              <div className="space-y-6">
                {selectedPlan.days.map((day: any, dayIndex: number) => (
                  <div key={dayIndex} className="bg-gray-700 rounded-lg p-4">
                    <h4 className="text-lg font-bold mb-4 text-yellow-400">{day.day}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {Object.entries(day.meals).map(([mealType, meal]: [string, any]) => (
                        <div key={mealType} className="bg-gray-600 rounded-lg overflow-hidden">
                          {/* Foto Ricetta */}
                          <div className="h-32 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                            <span className="text-4xl">
                              {mealType === 'colazione' ? '🌅' : 
                               mealType === 'pranzo' ? '☀️' : 
                               mealType === 'cena' ? '🌙' : '🍎'}
                            </span>
                          </div>
                          
                          <div className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <h5 className="font-semibold capitalize text-sm">{mealType}</h5>
                            </div>
                            
                            <h6 className="font-bold text-sm mb-2">{meal.nome}</h6>
                            
                            <div className="grid grid-cols-2 gap-1 text-xs mb-3">
                              <span className="bg-blue-600 px-2 py-1 rounded text-center">
                                {meal.calorie} kcal
                              </span>
                              <span className="bg-green-600 px-2 py-1 rounded text-center">
                                {meal.proteine}g P
                              </span>
                            </div>
                            
                            <div className="mb-2">
                              <p className="text-xs font-medium mb-1">Ingredienti:</p>
                              <ul className="text-xs space-y-1 max-h-20 overflow-y-auto">
                                {meal.ingredienti?.slice(0, 3).map((ing: string, idx: number) => (
                                  <li key={idx} className="text-gray-300">• {ing}</li>
                                ))}
                                {meal.ingredienti?.length > 3 && (
                                  <li className="text-gray-400">...e altri {meal.ingredienti.length - 3}</li>
                                )}
                              </ul>
                            </div>
                            
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-yellow-400">⭐ {meal.rating || 4.5}</span>
                              <span className="text-gray-400">🕒 {meal.tempo}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lista Spesa Migliorata */}
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-6 text-green-400">🛒 Lista della Spesa Automatica</h3>
              
              {(() => {
                const shoppingList = generateShoppingList(selectedPlan);
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(shoppingList).map(([category, items]) => (
                      <div key={category} className="bg-gray-600 rounded-lg p-4">
                        <h4 className="font-semibold text-lg mb-3">{category}</h4>
                        <ul className="space-y-2">
                          {items.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm">
                              <input type="checkbox" className="rounded" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                );
              })()}
              
              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => {
                    const shoppingList = generateShoppingList(selectedPlan);
                    const text = Object.entries(shoppingList)
                      .map(([category, items]) => `${category}:\n${items.map(item => `- ${item}`).join('\n')}`)
                      .join('\n\n');
                    navigator.clipboard.writeText(text);
                    alert('Lista spesa copiata negli appunti!');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
                >
                  📋 Copia Lista
                </button>
                <button
                  onClick={() => {
                    const shoppingList = generateShoppingList(selectedPlan);
                    const text = Object.entries(shoppingList)
                      .map(([category, items]) => `${category}:\n${items.map(item => `- ${item}`).join('\n')}`)
                      .join('\n\n');
                    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`🛒 Lista Spesa - ${selectedPlan.nome}\n\n${text}`)}`;
                    window.open(whatsappUrl, '_blank');
                  }}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
                >
                  📱 Condividi WhatsApp
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filtri */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {[
              { key: 'tutti', label: '📅 Tutti i Piani', count: savedPlans.length },
              { key: 'oggi', label: '📆 Oggi', count: savedPlans.filter(p => p.createdAt === new Date().toISOString().split('T')[0]).length },
              { key: 'settimana', label: '📆 Questa Settimana', count: savedPlans.filter(p => p.createdAt >= new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0]).length },
              { key: 'mese', label: '📆 Questo Mese', count: savedPlans.filter(p => p.createdAt >= new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0]).length }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setSelectedFilter(filter.key as any)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedFilter === filter.key
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>

        {/* Altri Piani */}
        {filteredPlans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-400 mb-4">Nessun piano trovato per il filtro selezionato</p>
            <Link href="/" className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg transition-colors">
              Crea il tuo primo Piano Fitness
            </Link>
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-bold mb-4 text-green-400">📋 Altri Piani Salvati</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlans.slice(1).map((plan) => (
                <div 
                  key={plan.id} 
                  className={`bg-gray-800 rounded-xl p-4 border transition-colors cursor-pointer ${
                    selectedPlan?.id === plan.id ? 'border-green-500' : 'border-gray-700 hover:border-green-500'
                  }`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-green-400">{plan.nome}</h4>
                      <p className="text-gray-400 text-sm">{plan.createdAt}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePlan(plan.id);
                      }}
                      className="bg-red-600 hover:bg-red-700 p-1 rounded text-xs"
                      title="Elimina Piano"
                    >
                      🗑️
                    </button>
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Obiettivo:</span>
                      <span className="font-medium">{plan.obiettivo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Durata:</span>
                      <span>{plan.durata} giorni</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Calorie/giorno:</span>
                      <span className="text-green-400 font-medium">{plan.calorie} kcal</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Funzioni Extra */}
        <div className="mt-12 bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold mb-4 text-green-400">🛠️ Funzioni Extra</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 p-4 rounded-lg transition-colors">
              📊 Esporta Report Completo
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 p-4 rounded-lg transition-colors">
              🔄 Confronta Piani
            </button>
            <button className="bg-orange-600 hover:bg-orange-700 p-4 rounded-lg transition-colors">
              ⭐ Le Tue Ricette Preferite
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}