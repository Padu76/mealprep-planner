'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../components/header';
import { Calendar, Clock, Users, Flame, Filter, Search, Grid, List, Download, Share2, Eye, Trash2 } from 'lucide-react';

interface SavedPlan {
  id: string;
  nome: string;
  createdAt: string;
  obiettivo: string;
  durata: string;
  pasti: string;
  calorie: number;
  days: Array<{
    day: string;
    meals: any;
  }>;
  formData: any;
  totalCalories: number;
  totalProteins: number;
  allergie: string[];
  preferenze: string[];
}

export default function DashboardPage() {
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<SavedPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    search: '',
    obiettivo: '',
    periodo: '',
    sortBy: 'recent'
  });
  const [selectedPlan, setSelectedPlan] = useState<SavedPlan | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);

  // Carica piani salvati
  useEffect(() => {
    loadSavedPlans();
  }, []);

  // Applica filtri quando cambiano
  useEffect(() => {
    applyFilters();
  }, [savedPlans, filters]);

  const loadSavedPlans = () => {
    try {
      // Carica da localStorage
      const localPlans = localStorage.getItem('mealPrepSavedPlans');
      let plans: SavedPlan[] = [];
      
      if (localPlans) {
        plans = JSON.parse(localPlans);
        console.log('📊 Loaded plans from localStorage:', plans.length);
      }

      // Carica anche da sessionStorage (backup)
      const sessionPlans = sessionStorage.getItem('lastGeneratedPlan');
      if (sessionPlans && plans.length === 0) {
        const sessionPlan = JSON.parse(sessionPlans);
        plans = [sessionPlan];
        console.log('📊 Loaded from sessionStorage as fallback');
      }

      // Se ancora vuoti, crea piani di esempio per test
      if (plans.length === 0) {
        plans = createSamplePlans();
        console.log('📊 Created sample plans for testing');
      }

      setSavedPlans(plans);
      setLoading(false);
    } catch (error) {
      console.error('❌ Error loading plans:', error);
      setSavedPlans(createSamplePlans());
      setLoading(false);
    }
  };

  const createSamplePlans = (): SavedPlan[] => {
    return [
      {
        id: 'plan-1',
        nome: 'andrea',
        createdAt: '2025-07-10',
        obiettivo: 'Perdita peso',
        durata: '2',
        pasti: '4',
        calorie: 2000,
        totalCalories: 4000,
        totalProteins: 160,
        allergie: [],
        preferenze: ['mediterraneo'],
        formData: { nome: 'andrea', obiettivo: 'dimagrimento' },
        days: [
          {
            day: 'Giorno 1',
            meals: {
              colazione: {
                nome: 'Power Breakfast Bowl',
                calorie: 420,
                proteine: 25,
                carboidrati: 35,
                grassi: 18,
                tempo: '15 min',
                porzioni: 1,
                ingredienti: ['60g avena', '25g proteine whey', '100g frutti di bosco'],
                preparazione: 'Bowl proteico con avena e proteine',
                imageUrl: `https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=300&fit=crop`
              },
              pranzo: {
                nome: 'Chicken Power Bowl',
                calorie: 480,
                proteine: 40,
                carboidrati: 35,
                grassi: 18,
                tempo: '20 min',
                porzioni: 1,
                ingredienti: ['120g pollo', '80g quinoa', '100g verdure'],
                preparazione: 'Bowl completo con pollo grigliato',
                imageUrl: `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop`
              }
            }
          }
        ]
      },
      {
        id: 'plan-2',
        nome: 'andrea',
        createdAt: '2025-07-09',
        obiettivo: 'Aumento massa',
        durata: '3',
        pasti: '5',
        calorie: 2500,
        totalCalories: 7500,
        totalProteins: 200,
        allergie: ['glutine'],
        preferenze: ['high_protein'],
        formData: { nome: 'andrea', obiettivo: 'aumento-massa' },
        days: [
          {
            day: 'Giorno 1',
            meals: {
              colazione: {
                nome: 'Pancakes Proteici',
                calorie: 550,
                proteine: 30,
                carboidrati: 45,
                grassi: 20,
                tempo: '20 min',
                porzioni: 1,
                ingredienti: ['150g ricotta', '2 uova', '40g farina avena'],
                preparazione: 'Pancakes ricchi di proteine',
                imageUrl: `https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=400&h=300&fit=crop`
              }
            }
          }
        ]
      }
    ];
  };

  const applyFilters = () => {
    let filtered = [...savedPlans];

    // Filtro ricerca
    if (filters.search) {
      filtered = filtered.filter(plan => 
        plan.nome.toLowerCase().includes(filters.search.toLowerCase()) ||
        plan.obiettivo.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Filtro obiettivo
    if (filters.obiettivo) {
      filtered = filtered.filter(plan => 
        plan.obiettivo.toLowerCase().includes(filters.obiettivo.toLowerCase())
      );
    }

    // Filtro periodo
    if (filters.periodo) {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.periodo) {
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
      
      if (filters.periodo !== 'all') {
        filtered = filtered.filter(plan => 
          new Date(plan.createdAt) >= filterDate
        );
      }
    }

    // Ordinamento
    switch (filters.sortBy) {
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
  };

  const deletePlan = (planId: string) => {
    if (confirm('Sei sicuro di voler eliminare questo piano?')) {
      const updatedPlans = savedPlans.filter(plan => plan.id !== planId);
      setSavedPlans(updatedPlans);
      localStorage.setItem('mealPrepSavedPlans', JSON.stringify(updatedPlans));
    }
  };

  const exportPlan = (plan: SavedPlan) => {
    const exportData = {
      piano: plan,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `piano-${plan.nome}-${plan.createdAt}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sharePlan = (plan: SavedPlan) => {
    const shareText = `🍽️ Ho creato un piano alimentare fitness!\n\n` +
      `👤 ${plan.nome}\n` +
      `🎯 ${plan.obiettivo}\n` +
      `📅 ${plan.durata} giorni\n` +
      `🍽️ ${plan.pasti} pasti/giorno\n` +
      `🔥 ${plan.calorie} kcal/giorno\n\n` +
      `Creato con Meal Prep Planner 💪`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Piano Alimentare Fitness',
        text: shareText
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Piano copiato negli appunti!');
    }
  };

  const openPlanModal = (plan: SavedPlan) => {
    setSelectedPlan(plan);
    setShowPlanModal(true);
  };

  const getObjectiveIcon = (obiettivo: string) => {
    const lower = obiettivo.toLowerCase();
    if (lower.includes('perdita') || lower.includes('dimagrimento')) return '🔥';
    if (lower.includes('massa') || lower.includes('aumento')) return '💪';
    return '⚖️';
  };

  const getObjectiveColor = (obiettivo: string) => {
    const lower = obiettivo.toLowerCase();
    if (lower.includes('perdita') || lower.includes('dimagrimento')) return 'text-red-400 bg-red-500/20';
    if (lower.includes('massa') || lower.includes('aumento')) return 'text-blue-400 bg-blue-500/20';
    return 'text-green-400 bg-green-500/20';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <Header />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Caricamento piani...</p>
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
          <h1 className="text-4xl font-bold mb-2" style={{color: '#8FBC8F'}}>
            📊 I Miei Piani Alimentari
          </h1>
          <p className="text-gray-400 mb-6">
            Gestisci e visualizza tutti i tuoi piani fitness personalizzati
          </p>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">{savedPlans.length}</div>
              <div className="text-sm text-gray-400">Piani Totali</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-400">
                {Math.round(savedPlans.reduce((acc, plan) => acc + plan.calorie, 0) / savedPlans.length) || 0}
              </div>
              <div className="text-sm text-gray-400">Kcal Media</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-400">
                {savedPlans.filter(plan => plan.createdAt === new Date().toISOString().split('T')[0]).length}
              </div>
              <div className="text-sm text-gray-400">Oggi</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-400">
                {Math.round(savedPlans.reduce((acc, plan) => acc + plan.totalProteins, 0) / savedPlans.length) || 0}g
              </div>
              <div className="text-sm text-gray-400">Proteine Media</div>
            </div>
          </div>
        </div>

        {/* Filtri e Controlli */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Ricerca */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Cerca per nome o obiettivo..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-green-400 focus:outline-none"
              />
            </div>

            {/* Filtro Obiettivo */}
            <select
              value={filters.obiettivo}
              onChange={(e) => setFilters({...filters, obiettivo: e.target.value})}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
            >
              <option value="">Tutti gli obiettivi</option>
              <option value="perdita">Perdita peso</option>
              <option value="massa">Aumento massa</option>
              <option value="mantenimento">Mantenimento</option>
            </select>

            {/* Filtro Periodo */}
            <select
              value={filters.periodo}
              onChange={(e) => setFilters({...filters, periodo: e.target.value})}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
            >
              <option value="">Tutti i periodi</option>
              <option value="week">Ultima settimana</option>
              <option value="month">Ultimo mese</option>
              <option value="quarter">Ultimi 3 mesi</option>
            </select>

            {/* Ordinamento */}
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
            >
              <option value="recent">Più recenti</option>
              <option value="oldest">Più vecchi</option>
              <option value="name">Nome A-Z</option>
              <option value="calories">Calorie (alte)</option>
            </select>

            {/* Toggle Vista */}
            <div className="flex bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-green-600 text-white' : 'text-gray-400'}`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-green-600 text-white' : 'text-gray-400'}`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Lista/Griglia Piani */}
        {filteredPlans.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-2xl font-bold mb-2">Nessun piano trovato</h3>
            <p className="text-gray-400 mb-6">
              {savedPlans.length === 0 
                ? 'Non hai ancora creato nessun piano alimentare.'
                : 'Prova a modificare i filtri di ricerca.'
              }
            </p>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <span>🚀</span>
              Crea il Primo Piano
            </Link>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
          }>
            {filteredPlans.map((plan) => (
              <div key={plan.id} className={`bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors ${
                viewMode === 'list' ? 'flex items-center p-4' : 'p-6'
              }`}>
                {/* Grid View */}
                {viewMode === 'grid' && (
                  <>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                          {plan.nome.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-white capitalize">{plan.nome}</h3>
                          <p className="text-sm text-gray-400">
                            {new Date(plan.createdAt).toLocaleDateString('it-IT')}
                          </p>
                        </div>
                      </div>
                      <span className={`text-2xl`}>
                        {getObjectiveIcon(plan.obiettivo)}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className={`px-3 py-2 rounded-lg ${getObjectiveColor(plan.obiettivo)}`}>
                        <div className="text-sm font-medium">{plan.obiettivo}</div>
                      </div>
                      <div className="bg-gray-700 px-3 py-2 rounded-lg">
                        <div className="text-sm text-gray-300">{plan.durata} giorni</div>
                      </div>
                      <div className="bg-gray-700 px-3 py-2 rounded-lg">
                        <div className="text-sm text-gray-300">{plan.pasti} pasti/giorno</div>
                      </div>
                      <div className="bg-orange-600/20 text-orange-400 px-3 py-2 rounded-lg">
                        <div className="text-sm font-medium">{plan.calorie} kcal</div>
                      </div>
                    </div>

                    {/* Allergie/Preferenze */}
                    {(plan.allergie?.length > 0 || plan.preferenze?.length > 0) && (
                      <div className="mb-4 space-y-2">
                        {plan.allergie?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {plan.allergie.slice(0, 2).map((allergia, idx) => (
                              <span key={idx} className="text-xs bg-red-600/20 text-red-400 px-2 py-1 rounded">
                                ⚠️ {allergia}
                              </span>
                            ))}
                            {plan.allergie.length > 2 && (
                              <span className="text-xs bg-red-600/20 text-red-400 px-2 py-1 rounded">
                                +{plan.allergie.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                        {plan.preferenze?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {plan.preferenze.slice(0, 2).map((pref, idx) => (
                              <span key={idx} className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded">
                                🥗 {pref}
                              </span>
                            ))}
                            {plan.preferenze.length > 2 && (
                              <span className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded">
                                +{plan.preferenze.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => openPlanModal(plan)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                      >
                        <Eye size={16} />
                        Visualizza
                      </button>
                      <button
                        onClick={() => sharePlan(plan)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors"
                      >
                        <Share2 size={16} />
                      </button>
                      <button
                        onClick={() => exportPlan(plan)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-colors"
                      >
                        <Download size={16} />
                      </button>
                      <button
                        onClick={() => deletePlan(plan.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                  <>
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                        {plan.nome.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-white capitalize">{plan.nome}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>{new Date(plan.createdAt).toLocaleDateString('it-IT')}</span>
                          <span>{getObjectiveIcon(plan.obiettivo)} {plan.obiettivo}</span>
                          <span>📅 {plan.durata}g</span>
                          <span>🍽️ {plan.pasti}p</span>
                          <span>🔥 {plan.calorie}kcal</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openPlanModal(plan)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                          Visualizza
                        </button>
                        <button
                          onClick={() => sharePlan(plan)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors"
                        >
                          <Share2 size={16} />
                        </button>
                        <button
                          onClick={() => deletePlan(plan.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* CTA Bottom */}
        <div className="mt-12 text-center">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
          >
            <span>🚀</span>
            Crea Nuovo Piano Fitness
          </Link>
        </div>
      </div>

      {/* Modal Piano Dettagliato */}
      {showPlanModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header Modal */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Piano di {selectedPlan.nome}
                  </h2>
                  <p className="text-gray-400">
                    Creato il {new Date(selectedPlan.createdAt).toLocaleDateString('it-IT')}
                  </p>
                </div>
                <button
                  onClick={() => setShowPlanModal(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Ricette con Foto */}
              <div className="space-y-6">
                {selectedPlan.days.map((day, dayIndex) => (
                  <div key={dayIndex} className="bg-gray-700 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-green-400 mb-4">{day.day}</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {Object.entries(day.meals).map(([mealType, meal]: [string, any]) => (
                        <div key={mealType} className="bg-gray-600 rounded-lg p-4">
                          {/* Foto Ricetta */}
                          {meal.imageUrl && (
                            <img 
                              src={meal.imageUrl}
                              alt={meal.nome}
                              className="w-full h-32 object-cover rounded-lg mb-3"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop`;
                              }}
                            />
                          )}
                          
                          <h4 className="font-bold text-white mb-2">{meal.nome}</h4>
                          <div className="flex items-center gap-3 text-sm text-gray-300 mb-3">
                            <span className="flex items-center gap-1">
                              <Flame size={14} className="text-orange-500" />
                              {meal.calorie} kcal
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={14} className="text-blue-400" />
                              {meal.tempo}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users size={14} className="text-green-400" />
                              {meal.porzioni}p
                            </span>
                          </div>
                          
                          <div className="text-xs text-gray-400 mb-2">
                            P: {meal.proteine}g | C: {meal.carboidrati}g | G: {meal.grassi}g
                          </div>
                          
                          <p className="text-sm text-gray-300">
                            {meal.preparazione?.substring(0, 100)}...
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions Modal */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => exportPlan(selectedPlan)}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  Esporta Piano
                </button>
                <button
                  onClick={() => sharePlan(selectedPlan)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 size={16} />
                  Condividi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}