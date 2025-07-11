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
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);

  // Genera URL foto cibo da Unsplash
  const getFoodImage = (mealName: string, mealType: string) => {
    const keywords = mealName.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(' ')
      .slice(0, 2)
      .join('%20');
    
    const fallbackKeywords: { [key: string]: string } = {
      'colazione': 'breakfast%20healthy',
      'pranzo': 'lunch%20healthy',
      'cena': 'dinner%20healthy',
      'spuntino1': 'snack%20healthy',
      'spuntino2': 'protein%20snack',
      'spuntino3': 'fruit%20snack'
    };
    
    const searchTerm = keywords || fallbackKeywords[mealType] || 'healthy%20food';
    return `https://images.unsplash.com/photo-${Math.floor(Math.random() * 9999999999999) + 1500000000000}?w=300&h=200&fit=crop&auto=format&q=80&fm=jpg&crop=faces&bg=f3f4f6&overlay=ffffff&overlay-opacity=0.1&txt=${searchTerm}`;
  };

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

  // Modal ricetta completa
  const openRecipeModal = (meal: any, dayName: string, mealType: string) => {
    setSelectedMeal({ ...meal, dayName, mealType });
    setShowRecipeModal(true);
  };

  const closeRecipeModal = () => {
    setShowRecipeModal(false);
    setSelectedMeal(null);
  };

  // Genera PDF completo - FUNZIONE CORRETTA
  const generatePDF = (plan: SavedPlan) => {
    const shoppingList = generateShoppingList(plan);
    
    // Crea contenuto HTML per PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Piano Meal Prep - ${plan.nome}</title>
          <style>
            @page { margin: 15mm; size: A4; }
            body { 
              font-family: 'Arial', sans-serif; 
              line-height: 1.4; color: #333; font-size: 12px;
              margin: 0; padding: 0;
            }
            .header {
              text-align: center; margin-bottom: 20px;
              border-bottom: 3px solid #10B981; padding-bottom: 15px;
            }
            .title { font-size: 22px; font-weight: bold; color: #1F2937; margin-bottom: 8px; }
            .subtitle { font-size: 14px; color: #6B7280; margin-bottom: 10px; }
            .stats { 
              display: grid; grid-template-columns: repeat(4, 1fr); 
              gap: 10px; margin: 20px 0; text-align: center;
            }
            .stat { 
              background: #F3F4F6; padding: 10px; border-radius: 8px;
            }
            .stat-value { font-size: 16px; font-weight: bold; color: #10B981; }
            .stat-label { font-size: 10px; color: #6B7280; }
            h2 {
              color: #10B981; font-size: 16px; margin: 20px 0 10px 0;
              border-bottom: 2px solid #10B981; padding-bottom: 5px;
            }
            h3 {
              color: #1F2937; font-size: 14px; margin: 15px 0 8px 0;
            }
            .day-container { 
              margin-bottom: 20px; page-break-inside: avoid;
              border: 1px solid #E5E7EB; border-radius: 8px; padding: 10px;
            }
            .meal-container { 
              margin: 10px 0; padding: 8px; 
              background: #F9FAFB; border-radius: 6px;
            }
            .meal-header { 
              font-weight: bold; font-size: 13px; color: #10B981; 
              margin-bottom: 5px; display: flex; justify-content: space-between;
            }
            .ingredients { margin: 5px 0; }
            .ingredients ul { margin: 3px 0; padding-left: 15px; }
            .ingredients li { margin: 2px 0; }
            .preparation { 
              background: #EFF6FF; padding: 6px; border-radius: 4px; 
              margin-top: 5px; font-style: italic; font-size: 11px;
            }
            .shopping-list { margin-top: 25px; }
            .category { 
              margin-bottom: 12px; background: #F3F4F6; 
              padding: 8px; border-radius: 6px;
            }
            .category h4 { 
              color: #10B981; margin: 0 0 5px 0; font-size: 12px; 
            }
            .category ul { margin: 0; padding-left: 15px; }
            .category li { margin: 2px 0; font-size: 11px; }
            @media print { 
              body { font-size: 10px; } 
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
          ${plan.days.map((day: any) => `
            <div class="day-container">
              <h3>${day.day} - ${Math.round(Object.values(day.meals).reduce((sum: number, meal: any) => sum + (meal?.calorie || 0), 0))} kcal totali</h3>
              ${Object.entries(day.meals).map(([mealType, meal]: [string, any]) => `
                <div class="meal-container">
                  <div class="meal-header">
                    <span><strong>${mealType.toUpperCase()}:</strong> ${meal.nome}</span>
                    <span>${meal.calorie} kcal | ${meal.proteine}g prot</span>
                  </div>
                  <div class="ingredients">
                    <strong>🛒 Ingredienti:</strong>
                    <ul>
                      ${meal.ingredienti?.map((ing: string) => `<li>${ing}</li>`).join('') || '<li>Non specificati</li>'}
                    </ul>
                  </div>
                  <div class="preparation">
                    <strong>👨‍🍳 Preparazione:</strong> ${meal.preparazione || 'Unire tutti gli ingredienti seguendo le dosi indicate. Cuocere secondo preferenza e servire.'}
                  </div>
                  <div style="margin-top: 5px; font-size: 10px; color: #6B7280;">
                    ⏱️ ${meal.tempo || '15 min'} • 🍽️ ${meal.porzioni || 1} porzione • ⭐ ${meal.rating || 4.5}/5
                  </div>
                </div>
              `).join('')}
            </div>
          `).join('')}

          <div class="shopping-list">
            <h2>🛒 Lista della Spesa Completa</h2>
            ${Object.entries(shoppingList).map(([category, items]) => `
              <div class="category">
                <h4>${category}</h4>
                <ul>
                  ${items.map(item => `<li>${item}</li>`).join('')}
                </ul>
              </div>
            `).join('')}
          </div>

          <div style="margin-top: 30px; padding: 15px; background: #F3F4F6; border-radius: 8px; text-align: center; page-break-inside: avoid;">
            <h2 style="margin-top: 0;">💪 Informazioni Piano</h2>
            <p><strong>Obiettivo:</strong> ${plan.obiettivo}</p>
            ${plan.allergie.length > 0 ? `<p><strong>⚠️ Allergie:</strong> ${plan.allergie.join(', ')}</p>` : ''}
            ${plan.preferenze.length > 0 ? `<p><strong>❤️ Preferenze:</strong> ${plan.preferenze.join(', ')}</p>` : ''}
            <p style="font-size: 9px; color: #9CA3AF; margin-top: 15px;">
              Piano generato con Meal Prep Planner AI • Personalizzato per i tuoi obiettivi fitness
            </p>
          </div>
        </body>
      </html>
    `;
    
    // Apri finestra di stampa
    const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Attendi caricamento e stampa
      printWindow.onload = function() {
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
        }, 250);
      };
    } else {
      // Fallback per popup bloccati
      alert('⚠️ Popup bloccato! Abilita i popup per generare il PDF, oppure usa Ctrl+P per stampare questa pagina.');
      
      // Mostra contenuto in una nuova tab
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `piano-${plan.nome}-${plan.createdAt}.html`;
      link.click();
      URL.revokeObjectURL(url);
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
      {/* Modal Ricetta Completa */}
      {showRecipeModal && selectedMeal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-800 p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-green-400">{selectedMeal.nome}</h3>
                  <p className="text-gray-400">{selectedMeal.dayName} - {selectedMeal.mealType.toUpperCase()}</p>
                </div>
                <button
                  onClick={closeRecipeModal}
                  className="bg-red-600 hover:bg-red-700 p-2 rounded-lg text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Foto ricetta */}
              <div className="mb-6">
                <img
                  src={getFoodImage(selectedMeal.nome, selectedMeal.mealType)}
                  alt={selectedMeal.nome}
                  className="w-full h-64 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = `https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=250&fit=crop&auto=format&q=80`;
                  }}
                />
              </div>

              {/* Macros */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                <div className="bg-blue-600/20 border border-blue-500 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-blue-400">{selectedMeal.calorie}</div>
                  <div className="text-xs text-gray-400">Calorie</div>
                </div>
                <div className="bg-green-600/20 border border-green-500 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-green-400">{selectedMeal.proteine}g</div>
                  <div className="text-xs text-gray-400">Proteine</div>
                </div>
                <div className="bg-purple-600/20 border border-purple-500 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-purple-400">{selectedMeal.carboidrati}g</div>
                  <div className="text-xs text-gray-400">Carboidrati</div>
                </div>
                <div className="bg-yellow-600/20 border border-yellow-500 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-yellow-400">{selectedMeal.grassi}g</div>
                  <div className="text-xs text-gray-400">Grassi</div>
                </div>
              </div>

              {/* Informazioni base */}
              <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="text-sm text-gray-400">Tempo</div>
                  <div className="font-semibold">⏱️ {selectedMeal.tempo || '15 min'}</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="text-sm text-gray-400">Porzioni</div>
                  <div className="font-semibold">🍽️ {selectedMeal.porzioni || 1}</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="text-sm text-gray-400">Rating</div>
                  <div className="font-semibold">⭐ {selectedMeal.rating || 4.5}/5</div>
                </div>
              </div>

              {/* Ingredienti */}
              <div className="mb-6">
                <h4 className="text-lg font-bold mb-3 text-orange-400">🛒 Ingredienti:</h4>
                <div className="bg-gray-700 rounded-lg p-4">
                  <ul className="space-y-2">
                    {selectedMeal.ingredienti?.map((ingredient: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-3">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        <span>{ingredient}</span>
                      </li>
                    )) || <li>Non specificati</li>}
                  </ul>
                </div>
              </div>

              {/* Preparazione step-by-step */}
              <div className="mb-6">
                <h4 className="text-lg font-bold mb-3 text-blue-400">👨‍🍳 Preparazione Step-by-Step:</h4>
                <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                  <div className="prose prose-invert max-w-none">
                    {selectedMeal.preparazione ? (
                      <div className="space-y-3">
                        {selectedMeal.preparazione.split(/[.\n]/).filter((step: string) => step.trim()).map((step: string, idx: number) => (
                          <div key={idx} className="flex gap-3">
                            <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <p className="text-gray-300 leading-relaxed">{step.trim()}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                          <p className="text-gray-300">Prepara tutti gli ingredienti secondo le dosi indicate</p>
                        </div>
                        <div className="flex gap-3">
                          <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                          <p className="text-gray-300">Unisci gli ingredienti seguendo l'ordine consigliato</p>
                        </div>
                        <div className="flex gap-3">
                          <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                          <p className="text-gray-300">Cuoci secondo preferenza e servi caldo</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Fitness Score */}
              {selectedMeal.fitnessScore && (
                <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                  <h4 className="text-lg font-bold mb-2 text-green-400">💪 Fitness Score: {selectedMeal.fitnessScore}/100</h4>
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all" 
                      style={{ width: `${selectedMeal.fitnessScore}%` }}
                    ></div>
                  </div>
                  {selectedMeal.fitnessReasons && (
                    <ul className="text-sm space-y-1">
                      {selectedMeal.fitnessReasons.map((reason: string, idx: number) => (
                        <li key={idx} className="text-gray-300">• {reason}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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

          {/* Stats Header - COMPATTI */}
          {userStats && (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 text-center">
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-xl font-bold text-green-400">{userStats.totalPlans}</div>
                <div className="text-xs text-gray-400">Piani</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-xl font-bold text-blue-400">{Math.round(userStats.totalCalories / 1000)}k</div>
                <div className="text-xs text-gray-400">Calorie</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-xl font-bold text-purple-400">{userStats.totalDays}</div>
                <div className="text-xs text-gray-400">Giorni</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-xl font-bold text-yellow-400">{userStats.currentStreak}</div>
                <div className="text-xs text-gray-400">Streak</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-xl font-bold text-red-400">Lv.{userStats.level}</div>
                <div className="text-xs text-gray-400">Livello</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-xl font-bold text-orange-400">{userStats.totalPoints}</div>
                <div className="text-xs text-gray-400">Punti</div>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Gamification Section - COMPATTO SU 2 RIGHE */}
        {userStats && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-green-400">🎮 Achievement</h2>
              <button
                onClick={() => setShowGamificationInfo(!showGamificationInfo)}
                className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
              >
                {showGamificationInfo ? '❌' : 'ℹ️'}
              </button>
            </div>

            {/* Achievements Grid - COMPATTO */}
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mb-4">
              {achievements.slice(0, 16).map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-2 rounded-lg text-center transition-all ${
                    achievement.unlocked
                      ? 'bg-green-800 border border-green-600'
                      : 'bg-gray-800 border border-gray-600 opacity-60'
                  }`}
                  title={`${achievement.title}: ${achievement.description} (${achievement.points}pt)`}
                >
                  <div className={`text-lg mb-1 ${achievement.unlocked ? '' : 'grayscale'}`}>
                    {achievement.icon}
                  </div>
                  <div className="text-xs text-orange-400">{achievement.points}pt</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Piano Selezionato - LAYOUT COMPATTO CON FOTO */}
        {selectedPlan && (
          <div className="mb-8 bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-green-400">📦 {selectedPlan.nome}</h2>
                <p className="text-gray-400">
                  {selectedPlan.createdAt} • {selectedPlan.obiettivo} • {selectedPlan.durata} giorni • {selectedPlan.calorie} kcal/giorno
                </p>
              </div>
            </div>

            {/* Ricettario Compatto con Foto */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-green-400">📖 Ricettario Completo</h3>
              <div className="space-y-6">
                {selectedPlan.days.map((day: any, dayIndex: number) => (
                  <div key={dayIndex} className="bg-gray-700 rounded-lg p-4">
                    <h4 className="text-lg font-bold mb-4 text-yellow-400">{day.day}</h4>
                    
                    {/* GRID COMPATTA - 4 PASTI PER RIGA SU DESKTOP */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {Object.entries(day.meals).map(([mealType, meal]: [string, any]) => (
                        <div 
                          key={mealType} 
                          className="bg-gray-600 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-500 transition-colors"
                          onClick={() => openRecipeModal(meal, day.day, mealType)}
                        >
                          {/* Foto Ricetta - COMPATTA */}
                          <div className="h-24 bg-gradient-to-br from-green-400 via-blue-500 to-purple-500 flex items-center justify-center relative">
                            <img
                              src={getFoodImage(meal.nome, mealType)}
                              alt={meal.nome}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling!.style.display = 'flex';
                              }}
                            />
                            <div className="w-full h-full bg-gradient-to-br from-green-400 via-blue-500 to-purple-500 flex items-center justify-center" style={{display: 'none'}}>
                              <span className="text-2xl">
                                {mealType === 'colazione' ? '🌅' : 
                                 mealType === 'pranzo' ? '☀️' : 
                                 mealType === 'cena' ? '🌙' : '🍎'}
                              </span>
                            </div>
                            <div className="absolute bottom-1 left-1 bg-black/70 px-1 py-0.5 rounded text-xs text-white">
                              {mealType.toUpperCase()}
                            </div>
                            <div className="absolute top-1 right-1 bg-green-600 px-1 py-0.5 rounded text-xs text-white">
                              📖
                            </div>
                          </div>
                          
                          {/* Info Compatte */}
                          <div className="p-3">
                            <h5 className="font-bold text-sm mb-2 truncate" title={meal.nome}>{meal.nome}</h5>
                            
                            <div className="grid grid-cols-2 gap-1 text-xs mb-2">
                              <span className="bg-blue-600 px-1 py-0.5 rounded text-center">
                                {meal.calorie} kcal
                              </span>
                              <span className="bg-green-600 px-1 py-0.5 rounded text-center">
                                {meal.proteine}g P
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-yellow-400">⭐ {meal.rating || 4.5}</span>
                              <span className="text-gray-400">⏱️ {meal.tempo || '15min'}</span>
                            </div>
                            
                            <div className="mt-2 text-xs text-center bg-gray-500 rounded py-1 text-white">
                              Clicca per Ricetta
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lista Spesa + Azioni */}
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-green-400">🛒 Lista Spesa & Azioni</h3>
              
              <div className="flex flex-wrap gap-3 mb-4">
                <button
                  onClick={() => {
                    const shoppingList = generateShoppingList(selectedPlan);
                    const text = Object.entries(shoppingList)
                      .map(([category, items]) => `${category}:\n${items.map(item => `- ${item}`).join('\n')}`)
                      .join('\n\n');
                    navigator.clipboard.writeText(text);
                    alert('Lista spesa copiata!');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm"
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
                  className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-sm"
                >
                  📱 WhatsApp
                </button>
                <button
                  onClick={() => generatePDF(selectedPlan)}
                  className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-sm"
                >
                  📄 PDF
                </button>
                <button
                  onClick={() => {
                    const planText = `Piano Meal Prep: ${selectedPlan.nome}\n` +
                      `Obiettivo: ${selectedPlan.obiettivo}\n` +
                      `Durata: ${selectedPlan.durata} giorni\n` +
                      `Calorie/giorno: ${selectedPlan.calorie} kcal\n\n` +
                      selectedPlan.generatedPlan;
                    navigator.clipboard.writeText(planText);
                    alert('Piano copiato!');
                  }}
                  className="bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded text-sm"
                >
                  📝 Copia Piano
                </button>
              </div>

              {/* Lista Spesa Compatta */}
              {(() => {
                const shoppingList = generateShoppingList(selectedPlan);
                return (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(shoppingList).slice(0, 4).map(([category, items]) => (
                      <div key={category} className="bg-gray-600 rounded p-3">
                        <h4 className="font-semibold text-sm mb-2">{category}</h4>
                        <ul className="space-y-1 text-xs">
                          {items.slice(0, 3).map((item, idx) => (
                            <li key={idx} className="truncate" title={item}>• {item}</li>
                          ))}
                          {items.length > 3 && (
                            <li className="text-gray-400">... +{items.length - 3} altri</li>
                          )}
                        </ul>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Filtri */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'tutti', label: '📅 Tutti', count: savedPlans.length },
              { key: 'oggi', label: '📆 Oggi', count: savedPlans.filter(p => p.createdAt === new Date().toISOString().split('T')[0]).length },
              { key: 'settimana', label: '📆 Settimana', count: savedPlans.filter(p => p.createdAt >= new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0]).length },
              { key: 'mese', label: '📆 Mese', count: savedPlans.filter(p => p.createdAt >= new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0]).length }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setSelectedFilter(filter.key as any)}
                className={`px-3 py-2 rounded text-sm transition-colors ${
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

        {/* Altri Piani - LAYOUT COMPATTO */}
        {filteredPlans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-400 mb-4">Nessun piano trovato</p>
            <Link href="/" className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg transition-colors">
              Crea Piano Fitness
            </Link>
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-bold mb-4 text-green-400">📋 Altri Piani</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {filteredPlans.slice(1).map((plan) => (
                <div 
                  key={plan.id} 
                  className={`bg-gray-800 rounded-lg p-3 border transition-colors cursor-pointer ${
                    selectedPlan?.id === plan.id ? 'border-green-500' : 'border-gray-700 hover:border-green-500'
                  }`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-green-400 text-sm">{plan.nome}</h4>
                      <p className="text-gray-400 text-xs">{plan.createdAt}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePlan(plan.id);
                      }}
                      className="bg-red-600 hover:bg-red-700 p-1 rounded text-xs"
                      title="Elimina"
                    >
                      🗑️
                    </button>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Obiettivo:</span>
                      <span className="font-medium text-xs">{plan.obiettivo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Durata:</span>
                      <span className="text-xs">{plan.durata}gg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Calorie:</span>
                      <span className="text-green-400 font-medium text-xs">{plan.calorie} kcal</span>
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