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
  category: string;
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
  const [showGamificationInfo, setShowGamificationInfo] = useState(false);

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
    
    // Calcola streak (piani generati in settimane consecutive)
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
    
    // Sistema punti semplificato
    const basePoints = plans.length * 20; // 20 punti per piano
    const streakBonus = currentStreak * 10; // 10 punti per settimana streak
    const varietyBonus = Math.round(varietyScore / 5); // Bonus varietà
    const totalPoints = basePoints + streakBonus + varietyBonus;
    
    // Punti mensili (ultimi 30 giorni)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentPlans = plans.filter(plan => new Date(plan.createdAt) >= thirtyDaysAgo);
    const monthlyPoints = recentPlans.length * 20;
    
    // Livello (ogni 200 punti = 1 livello)
    const level = Math.floor(totalPoints / 200) + 1;

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

  // Sistema achievements semplificato (6 categorie)
  const calculateAchievements = (plans: SavedPlan[]) => {
    const stats = userStats || {} as UserStats;
    const uniqueObjectives = new Set(plans.map(p => p.obiettivo)).size;
    const totalIngredients = new Set<string>();
    
    plans.forEach(plan => {
      plan.days.forEach(day => {
        Object.values(day.meals).forEach((meal: any) => {
          if (meal?.ingredienti) {
            meal.ingredienti.forEach((ing: string) => totalIngredients.add(ing.toLowerCase()));
          }
        });
      });
    });

    const achievements: Achievement[] = [
      // 1. PIANI GENERATI
      { id: 'plan-1', title: '🌟 Primo Piano', description: 'Genera il tuo primo piano meal prep', icon: '🎯', points: 20, unlocked: plans.length >= 1, category: 'Piani' },
      { id: 'plan-5', title: '🔥 Enthusiast', description: 'Genera 5 piani meal prep', icon: '💪', points: 100, unlocked: plans.length >= 5, category: 'Piani' },
      { id: 'plan-15', title: '🏆 Expert', description: 'Genera 15 piani meal prep', icon: '👑', points: 300, unlocked: plans.length >= 15, category: 'Piani' },
      
      // 2. STREAK CONSECUTIVI
      { id: 'streak-3', title: '📅 Costante', description: 'Mantieni uno streak di 3 settimane', icon: '⚡', points: 60, unlocked: (stats.currentStreak || 0) >= 3, category: 'Streak' },
      { id: 'streak-8', title: '🔥 Dedicato', description: 'Mantieni uno streak di 8 settimane', icon: '🌟', points: 160, unlocked: (stats.longestStreak || 0) >= 8, category: 'Streak' },
      
      // 3. VARIETÀ INGREDIENTI
      { id: 'variety-25', title: '🌈 Esploratore', description: 'Usa 25+ ingredienti diversi', icon: '🧭', points: 50, unlocked: totalIngredients.size >= 25, category: 'Varietà' },
      { id: 'variety-50', title: '🍽️ Gourmet', description: 'Usa 50+ ingredienti diversi', icon: '👨‍🍳', points: 100, unlocked: totalIngredients.size >= 50, category: 'Varietà' },
      
      // 4. OBIETTIVI DIVERSI
      { id: 'multi-goal', title: '🎭 Versatile', description: 'Prova tutti gli obiettivi fitness', icon: '🎨', points: 120, unlocked: uniqueObjectives >= 3, category: 'Obiettivi' },
      
      // 5. CALORIE PIANIFICATE
      { id: 'cal-20k', title: '⚡ Energetico', description: 'Pianifica 20.000+ calorie totali', icon: '🔋', points: 80, unlocked: (stats.totalCalories || 0) >= 20000, category: 'Calorie' },
      { id: 'cal-100k', title: '💥 Powerhouse', description: 'Pianifica 100.000+ calorie totali', icon: '🚀', points: 200, unlocked: (stats.totalCalories || 0) >= 100000, category: 'Calorie' },
      
      // 6. LIVELLI
      { id: 'level-3', title: '⭐ Rising', description: 'Raggiungi il livello 3', icon: '🌟', points: 100, unlocked: (stats.level || 1) >= 3, category: 'Livelli' },
      { id: 'level-10', title: '👑 Legend', description: 'Raggiungi il livello 10', icon: '🏆', points: 500, unlocked: (stats.level || 1) >= 10, category: 'Livelli' }
    ];

    setAchievements(achievements);
  };

  // Genera PDF completo
  const generatePDF = (plan: SavedPlan) => {
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Piano Meal Prep - ${plan.nome}</title>
          <style>
            @page { margin: 15mm; size: A4; }
            body { 
              font-family: 'Georgia', 'Times New Roman', serif; 
              line-height: 1.5; color: #333; font-size: 12px;
              margin: 0; padding: 0;
            }
            .header {
              text-align: center; margin-bottom: 30px;
              border-bottom: 3px solid #8FBC8F; padding-bottom: 15px;
            }
            .title { font-size: 24px; font-weight: bold; color: #2F4F4F; margin-bottom: 8px; }
            .subtitle { font-size: 14px; color: #666; margin-bottom: 10px; }
            .stats { display: flex; justify-content: space-around; margin: 20px 0; }
            .stat { text-align: center; }
            .stat-value { font-size: 18px; font-weight: bold; color: #8FBC8F; }
            .stat-label { font-size: 12px; color: #666; }
            h2 {
              color: #8FBC8F; font-size: 18px; margin: 25px 0 15px 0;
              border-bottom: 2px solid #8FBC8F; padding-bottom: 8px;
            }
            h3 {
              color: #2F4F4F; font-size: 16px; margin: 20px 0 10px 0;
            }
            .day-container { margin-bottom: 25px; page-break-inside: avoid; }
            .meal-container { 
              margin: 15px 0; padding: 12px; 
              border: 1px solid #ddd; border-radius: 8px;
            }
            .meal-header { 
              font-weight: bold; font-size: 14px; color: #8FBC8F; 
              margin-bottom: 8px; display: flex; justify-content: space-between;
            }
            .ingredients { margin: 8px 0; }
            .ingredients ul { margin: 5px 0; padding-left: 20px; }
            .preparation { 
              background: #f8f9fa; padding: 10px; border-radius: 5px; 
              margin-top: 8px; font-style: italic;
            }
            .shopping-list { margin-top: 30px; }
            .category { margin-bottom: 15px; }
            .category h4 { color: #8FBC8F; margin-bottom: 8px; }
            .category ul { margin: 0; padding-left: 20px; }
            @media print { 
              body { font-size: 11px; } 
              .no-print { display: none; }
              .day-container { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">🏋️‍♂️ Piano Meal Prep Personalizzato</div>
            <div class="subtitle">Generato per ${plan.nome} • ${new Date(plan.createdAt).toLocaleDateString('it-IT')}</div>
            <div class="stats">
              <div class="stat">
                <div class="stat-value">${plan.durata}</div>
                <div class="stat-label">Giorni</div>
              </div>
              <div class="stat">
                <div class="stat-value">${plan.pasti}</div>
                <div class="stat-label">Pasti/Giorno</div>
              </div>
              <div class="stat">
                <div class="stat-value">${plan.calorie}</div>
                <div class="stat-label">Kcal/Giorno</div>
              </div>
              <div class="stat">
                <div class="stat-value">${plan.obiettivo}</div>
                <div class="stat-label">Obiettivo</div>
              </div>
            </div>
          </div>

          <h2>📋 Piano Alimentare Dettagliato</h2>
          ${plan.days.map((day: any, index: number) => `
            <div class="day-container">
              <h3>${day.day} - ${Math.round(Object.values(day.meals).reduce((sum: number, meal: any) => sum + (meal?.calorie || 0), 0))} kcal totali</h3>
              ${Object.entries(day.meals).map(([mealType, meal]: [string, any]) => `
                <div class="meal-container">
                  <div class="meal-header">
                    <span>${mealType.toUpperCase()}: ${meal.nome}</span>
                    <span>${meal.calorie} kcal | ${meal.proteine}g proteine</span>
                  </div>
                  <div class="ingredients">
                    <strong>🛒 Ingredienti:</strong>
                    <ul>
                      ${meal.ingredienti?.map((ing: string) => `<li>${ing}</li>`).join('') || '<li>Non specificati</li>'}
                    </ul>
                  </div>
                  <div class="preparation">
                    <strong>👨‍🍳 Preparazione:</strong> ${meal.preparazione || 'Metodo di preparazione da definire'}
                  </div>
                  <div style="margin-top: 8px; font-size: 11px; color: #666;">
                    ⏱️ Tempo: ${meal.tempo || '15 min'} • 🍽️ Porzioni: ${meal.porzioni || 1} • ⭐ Rating: ${meal.rating || 4.5}/5
                  </div>
                </div>
              `).join('')}
            </div>
          `).join('')}

          <div class="shopping-list">
            <h2>🛒 Lista della Spesa Completa</h2>
            ${(() => {
              const shoppingList = generateShoppingList(plan);
              return Object.entries(shoppingList).map(([category, items]) => `
                <div class="category">
                  <h4>${category}</h4>
                  <ul>
                    ${items.map(item => `<li>${item}</li>`).join('')}
                  </ul>
                </div>
              `).join('');
            })()}
          </div>

          <div style="margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 10px; text-align: center;">
            <h2 style="margin-top: 0;">💪 Note Importanti</h2>
            <p><strong>Obiettivo:</strong> ${plan.obiettivo}</p>
            ${plan.allergie.length > 0 ? `<p><strong>⚠️ Allergie:</strong> ${plan.allergie.join(', ')}</p>` : ''}
            ${plan.preferenze.length > 0 ? `<p><strong>❤️ Preferenze:</strong> ${plan.preferenze.join(', ')}</p>` : ''}
            <p style="font-size: 10px; color: #888; margin-top: 20px;">
              Piano generato con Meal Prep Planner AI • Personalizzato per i tuoi obiettivi fitness
            </p>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 500);
      };
    } else {
      alert('Popup bloccato! Abilita i popup per scaricare il PDF');
    }
  };

  // Genera lista spesa migliorata
  const generateShoppingList = (plan: SavedPlan) => {
    const ingredients: { [key: string]: string[] } = {
      '🥚 Uova e Latticini': [],
      '🍎 Frutta e Verdura': [],
      '🥩 Carne e Pesce': [],
      '🌾 Cereali e Legumi': [],
      '🥜 Frutta Secca': [],
      '🫒 Grassi e Condimenti': [],
      '💊 Integratori': [],
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

  // Categorizza ingredienti
  const categorizeIngredientAdvanced = (ingredient: string): string => {
    const lower = ingredient.toLowerCase();
    
    if (lower.includes('uova') || lower.includes('albumi') || lower.includes('ricotta') || 
        lower.includes('yogurt') || lower.includes('mozzarella') || lower.includes('parmigiano') ||
        lower.includes('cottage') || lower.includes('latte')) {
      return '🥚 Uova e Latticini';
    }
    
    if (lower.includes('spinaci') || lower.includes('broccoli') || lower.includes('zucchine') || 
        lower.includes('pomodori') || lower.includes('banana') || lower.includes('mela') || 
        lower.includes('frutti') || lower.includes('verdure')) {
      return '🍎 Frutta e Verdura';
    }
    
    if (lower.includes('pollo') || lower.includes('manzo') || lower.includes('tacchino') ||
        lower.includes('salmone') || lower.includes('tonno') || lower.includes('merluzzo') || 
        lower.includes('orata')) {
      return '🥩 Carne e Pesce';
    }
    
    if (lower.includes('avena') || lower.includes('riso') || lower.includes('quinoa') || 
        lower.includes('pasta') || lower.includes('pane') || lower.includes('legumi') ||
        lower.includes('ceci') || lower.includes('fagioli')) {
      return '🌾 Cereali e Legumi';
    }
    
    if (lower.includes('mandorle') || lower.includes('noci') || lower.includes('semi')) {
      return '🥜 Frutta Secca';
    }
    
    if (lower.includes('olio') || lower.includes('burro') || lower.includes('avocado') ||
        lower.includes('limone') || lower.includes('spezie') || lower.includes('erbe')) {
      return '🫒 Grassi e Condimenti';
    }
    
    if (lower.includes('proteine') || lower.includes('whey') || lower.includes('creatina')) {
      return '💊 Integratori';
    }
    
    return '🛒 Altri';
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
                <div className="text-sm text-gray-400">Streak Settimanale</div>
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-green-400">🎮 Sistema Punti e Achievement</h2>
              <button
                onClick={() => setShowGamificationInfo(!showGamificationInfo)}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors text-sm"
              >
                {showGamificationInfo ? '❌ Chiudi Info' : 'ℹ️ Come Funziona'}
              </button>
            </div>

            {/* Info Gamification */}
            {showGamificationInfo && (
              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-bold mb-4 text-blue-400">📚 Come Funziona il Sistema Punti</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2 text-yellow-400">🏆 Come Guadagni Punti:</h4>
                    <ul className="space-y-1 text-gray-300">
                      <li>• <strong>20 punti</strong> per ogni piano generato</li>
                      <li>• <strong>10 punti</strong> per ogni settimana di streak</li>
                      <li>• <strong>Bonus varietà</strong> per ingredienti diversi</li>
                      <li>• <strong>Achievement</strong> sbloccati per obiettivi raggiunti</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-green-400">🎯 Cosa Significano i Livelli:</h4>
                    <ul className="space-y-1 text-gray-300">
                      <li>• <strong>Livello 1-2:</strong> Principiante (0-400 punti)</li>
                      <li>• <strong>Livello 3-5:</strong> Intermedio (400-1000 punti)</li>
                      <li>• <strong>Livello 6-10:</strong> Esperto (1000+ punti)</li>
                      <li>• <strong>Ogni 200 punti</strong> = 1 livello superiore</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {/* Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold mb-3">📊 Progresso Livello</h3>
                <div className="mb-2">
                  <div className="flex justify-between text-sm">
                    <span>Livello {userStats.level}</span>
                    <span>{userStats.totalPoints % 200}/200</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${((userStats.totalPoints % 200) / 200) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold mb-3">🔥 Streak Settimanale</h3>
                <div className="mb-2">
                  <div className="flex justify-between text-sm">
                    <span>Settimane consecutive</span>
                    <span>{userStats.currentStreak}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full" 
                      style={{ width: `${Math.min(100, (userStats.currentStreak / 8) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold mb-3">🌟 Punti Mensili</h3>
                <div className="mb-2">
                  <div className="flex justify-between text-sm">
                    <span>Questo mese</span>
                    <span>{userStats.monthlyPoints} pt</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full" 
                      style={{ width: `${Math.min(100, (userStats.monthlyPoints / 200) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements Grid - Organizzati per Categoria */}
            <div className="space-y-4">
              {['Piani', 'Streak', 'Varietà', 'Obiettivi', 'Calorie', 'Livelli'].map(category => {
                const categoryAchievements = achievements.filter(a => a.category === category);
                return (
                  <div key={category}>
                    <h4 className="text-lg font-semibold mb-3 text-yellow-400">{category}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {categoryAchievements.map((achievement) => (
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
                          <div className="text-xs text-gray-500 mb-1">{achievement.description}</div>
                          <div className="text-xs text-orange-400">{achievement.points}pt</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
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
              <div className="flex gap-3">
                <button
                  onClick={() => generatePDF(selectedPlan)}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  📄 Genera PDF
                </button>
              </div>
            </div>

            {/* Ricettario Completo con Preparazione */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-green-400">📖 Ricettario Completo</h3>
              <div className="space-y-6">
                {selectedPlan.days.map((day: any, dayIndex: number) => (
                  <div key={dayIndex} className="bg-gray-700 rounded-lg p-6">
                    <h4 className="text-lg font-bold mb-4 text-yellow-400">{day.day}</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {Object.entries(day.meals).map(([mealType, meal]: [string, any]) => (
                        <div key={mealType} className="bg-gray-600 rounded-lg overflow-hidden">
                          {/* Foto Ricetta */}
                          <div className="h-40 bg-gradient-to-br from-green-400 via-blue-500 to-purple-500 flex items-center justify-center relative">
                            <span className="text-5xl">
                              {mealType === 'colazione' ? '🌅' : 
                               mealType === 'pranzo' ? '☀️' : 
                               mealType === 'cena' ? '🌙' : '🍎'}
                            </span>
                            <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                              {mealType.toUpperCase()}
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <h5 className="font-bold text-lg mb-3">{meal.nome}</h5>
                            
                            <div className="grid grid-cols-3 gap-2 text-xs mb-4">
                              <span className="bg-blue-600 px-2 py-1 rounded text-center">
                                {meal.calorie} kcal
                              </span>
                              <span className="bg-green-600 px-2 py-1 rounded text-center">
                                {meal.proteine}g P
                              </span>
                              <span className="bg-purple-600 px-2 py-1 rounded text-center">
                                {meal.tempo || '15 min'}
                              </span>
                            </div>
                            
                            <div className="mb-4">
                              <p className="text-sm font-medium mb-2">🛒 Ingredienti:</p>
                              <ul className="text-sm space-y-1">
                                {meal.ingredienti?.map((ing: string, idx: number) => (
                                  <li key={idx} className="text-gray-300">• {ing}</li>
                                ))}
                              </ul>
                            </div>
                            
                            <div className="mb-4">
                              <p className="text-sm font-medium mb-2">👨‍🍳 Preparazione:</p>
                              <p className="text-sm text-gray-300 bg-gray-700 p-3 rounded">
                                {meal.preparazione || 'Unire tutti gli ingredienti seguendo le proporzioni indicate. Cuocere secondo preferenza e servire caldo.'}
                              </p>
                            </div>
                            
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-yellow-400">⭐ {meal.rating || 4.5}/5</span>
                              <span className="text-gray-400">🍽️ {meal.porzioni || 1} porzione</span>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      </div>
    </div>
  );
}