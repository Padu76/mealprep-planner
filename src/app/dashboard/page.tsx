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

export default function DashboardPage() {
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<SavedPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'tutti' | 'oggi' | 'settimana' | 'mese'>('tutti');
  const [selectedPlan, setSelectedPlan] = useState<SavedPlan | null>(null);
  const [activeTab, setActiveTab] = useState<'panoramica' | 'ricette' | 'lista-spesa'>('panoramica');

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

  // Genera lista spesa automatica
  const generateShoppingList = (plan: SavedPlan) => {
    const ingredients: { [key: string]: string[] } = {};
    
    plan.days.forEach((day: any) => {
      Object.values(day.meals).forEach((meal: any) => {
        if (meal?.ingredienti) {
          meal.ingredienti.forEach((ingredient: string) => {
            const category = categorizeIngredient(ingredient);
            if (!ingredients[category]) {
              ingredients[category] = [];
            }
            if (!ingredients[category].includes(ingredient)) {
              ingredients[category].push(ingredient);
            }
          });
        }
      });
    });

    return ingredients;
  };

  // Categorizza ingredienti per lista spesa
  const categorizeIngredient = (ingredient: string): string => {
    const lower = ingredient.toLowerCase();
    
    if (lower.includes('pollo') || lower.includes('manzo') || lower.includes('tacchino')) return '🥩 Carne';
    if (lower.includes('salmone') || lower.includes('tonno') || lower.includes('merluzzo') || lower.includes('orata')) return '🐟 Pesce';
    if (lower.includes('uova') || lower.includes('albumi')) return '🥚 Uova e Latticini';
    if (lower.includes('ricotta') || lower.includes('yogurt') || lower.includes('mozzarella') || lower.includes('parmigiano')) return '🥚 Uova e Latticini';
    if (lower.includes('avena') || lower.includes('riso') || lower.includes('quinoa') || lower.includes('pasta')) return '🌾 Cereali';
    if (lower.includes('spinaci') || lower.includes('broccoli') || lower.includes('zucchine') || lower.includes('pomodori')) return '🥬 Verdure';
    if (lower.includes('banana') || lower.includes('mela') || lower.includes('frutti')) return '🍎 Frutta';
    if (lower.includes('mandorle') || lower.includes('noci') || lower.includes('semi')) return '🥜 Frutta Secca';
    if (lower.includes('olio') || lower.includes('burro') || lower.includes('avocado')) return '🫒 Grassi';
    if (lower.includes('proteine') || lower.includes('whey')) return '💊 Integratori';
    
    return '🛒 Altri';
  };

  // Elimina piano
  const deletePlan = (planId: string) => {
    const updatedPlans = savedPlans.filter(plan => plan.id !== planId);
    setSavedPlans(updatedPlans);
    localStorage.setItem('mealPrepSavedPlans', JSON.stringify(updatedPlans));
    if (selectedPlan?.id === planId) {
      setSelectedPlan(null);
    }
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
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
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
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Piano Selezionato - Visualizzazione Completa */}
        {selectedPlan && (
          <div className="mb-8 bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-green-400">Piano: {selectedPlan.nome}</h2>
                <p className="text-gray-400">Creato il {selectedPlan.createdAt} • {selectedPlan.obiettivo}</p>
              </div>
              <button
                onClick={() => setSelectedPlan(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-4 mb-6 border-b border-gray-700">
              <button
                onClick={() => setActiveTab('panoramica')}
                className={`pb-3 px-2 transition-colors ${
                  activeTab === 'panoramica' 
                    ? 'text-green-400 border-b-2 border-green-400' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                📊 Panoramica
              </button>
              <button
                onClick={() => setActiveTab('ricette')}
                className={`pb-3 px-2 transition-colors ${
                  activeTab === 'ricette' 
                    ? 'text-green-400 border-b-2 border-green-400' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🍽️ Ricette
              </button>
              <button
                onClick={() => setActiveTab('lista-spesa')}
                className={`pb-3 px-2 transition-colors ${
                  activeTab === 'lista-spesa' 
                    ? 'text-green-400 border-b-2 border-green-400' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🛒 Lista Spesa
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'panoramica' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">📊 Statistiche</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-400">Durata:</span> {selectedPlan.durata} giorni</p>
                    <p><span className="text-gray-400">Pasti/giorno:</span> {selectedPlan.pasti}</p>
                    <p><span className="text-gray-400">Calorie/giorno:</span> {selectedPlan.calorie} kcal</p>
                    <p><span className="text-gray-400">Proteine totali:</span> {selectedPlan.totalProteins}g</p>
                  </div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">🎯 Obiettivo</h3>
                  <p className="text-green-400 font-medium">{selectedPlan.obiettivo}</p>
                  <div className="mt-3 text-sm">
                    <p className="text-gray-400">Allergie:</p>
                    <p>{selectedPlan.allergie.length > 0 ? selectedPlan.allergie.join(', ') : 'Nessuna'}</p>
                  </div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">❤️ Preferenze</h3>
                  <div className="text-sm">
                    {selectedPlan.preferenze.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {selectedPlan.preferenze.map((pref, idx) => (
                          <span key={idx} className="bg-green-600 text-xs px-2 py-1 rounded">
                            {pref}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400">Nessuna preferenza specificata</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ricette' && (
              <div className="space-y-6">
                {selectedPlan.days.map((day: any, dayIndex: number) => (
                  <div key={dayIndex} className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-xl font-bold mb-4 text-green-400">{day.day}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(day.meals).map(([mealType, meal]: [string, any]) => (
                        <div key={mealType} className="bg-gray-600 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-2xl">
                              {mealType === 'colazione' ? '🌅' : 
                               mealType === 'pranzo' ? '☀️' : 
                               mealType === 'cena' ? '🌙' : '🍎'}
                            </span>
                            <h4 className="font-semibold capitalize">{mealType}</h4>
                          </div>
                          
                          <h5 className="font-bold text-lg mb-2">{meal.nome}</h5>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                            <span className="bg-blue-600 px-2 py-1 rounded text-center">
                              {meal.calorie} kcal
                            </span>
                            <span className="bg-green-600 px-2 py-1 rounded text-center">
                              {meal.proteine}g prot
                            </span>
                          </div>
                          
                          <div className="mb-3">
                            <p className="text-sm font-medium mb-1">Ingredienti:</p>
                            <ul className="text-xs space-y-1">
                              {meal.ingredienti?.map((ing: string, idx: number) => (
                                <li key={idx} className="text-gray-300">• {ing}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium mb-1">Preparazione:</p>
                            <p className="text-xs text-gray-300">{meal.preparazione}</p>
                          </div>
                          
                          <div className="mt-3 flex justify-between items-center text-xs">
                            <span className="text-yellow-400">⭐ {meal.rating || 4.5}</span>
                            <span className="text-gray-400">🕒 {meal.tempo}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'lista-spesa' && (
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
                    📱 Condividi
                  </button>
                </div>
              </div>
            )}
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

        {/* Lista Piani */}
        {filteredPlans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-400 mb-4">Nessun piano trovato per il filtro selezionato</p>
            <Link href="/" className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg transition-colors">
              Crea il tuo primo Piano Fitness
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => (
              <div key={plan.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-green-500 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-green-400">{plan.nome}</h3>
                    <p className="text-gray-400 text-sm">{plan.createdAt}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedPlan(plan)}
                      className="bg-blue-600 hover:bg-blue-700 p-2 rounded"
                      title="Visualizza Piano"
                    >
                      👁️
                    </button>
                    <button
                      onClick={() => deletePlan(plan.id)}
                      className="bg-red-600 hover:bg-red-700 p-2 rounded"
                      title="Elimina Piano"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Obiettivo:</span>
                    <span className="font-medium">{plan.obiettivo}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Durata:</span>
                    <span>{plan.durata} giorni</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Pasti/giorno:</span>
                    <span>{plan.pasti}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Calorie/giorno:</span>
                    <span className="text-green-400 font-medium">{plan.calorie} kcal</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedPlan(plan)}
                    className="flex-1 bg-green-600 hover:bg-green-700 py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    📖 Apri Piano
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}