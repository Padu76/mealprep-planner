'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function UserDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [userStats, setUserStats] = useState({
    plansCreated: 0,
    currentPlan: 'Free',
    daysTracked: 0,
    favoriteRecipes: 0,
    weightProgress: 0
  });
  const [recentPlans, setRecentPlans] = useState<any[]>([]);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Controlla se già loggato
  useEffect(() => {
    const userAuth = sessionStorage.getItem('userAuth');
    if (userAuth) {
      setIsLoggedIn(true);
      loadUserData(userAuth);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulazione login semplice (in produzione: API call)
    if (loginData.email && loginData.password.length >= 4) {
      setIsLoggedIn(true);
      sessionStorage.setItem('userAuth', loginData.email);
      setLoginError('');
      loadUserData(loginData.email);
    } else {
      setLoginError('Email e password (min 4 caratteri) richiesti');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('userAuth');
    setLoginData({ email: '', password: '' });
    setUserData(null);
    setRecentPlans([]);
  };

  const loadUserData = async (userEmail: string) => {
    setIsLoading(true);
    try {
      console.log('📊 Loading user data for:', userEmail);
      
      // Carica dati dal localStorage come fallback
      const formData = localStorage.getItem('mealPrepFormData');
      if (formData) {
        const parsed = JSON.parse(formData);
        setUserData(parsed);
      }
      
      // Prova a caricare da Airtable
      try {
        const response = await fetch('/api/airtable?action=getRequests');
        const data = await response.json();
        
        if (data.success && data.data) {
          console.log('✅ Loaded', data.data.length, 'records from Airtable');
          
          // Filtra i piani per nome utente (approssimativo)
          const userPlans = data.data.filter((record: any) => 
            record.nome && userData?.nome && 
            record.nome.toLowerCase() === userData.nome.toLowerCase()
          );
          
          console.log('👤 Found', userPlans.length, 'plans for user');
          setRecentPlans(userPlans);
          
          // Calcola statistiche
          setUserStats({
            plansCreated: userPlans.length,
            currentPlan: 'Free',
            daysTracked: userPlans.reduce((sum: number, plan: any) => 
              sum + (parseInt(plan.duration) || 0), 0),
            favoriteRecipes: userPlans.length * 3,
            weightProgress: 0
          });
        } else {
          console.log('❌ Failed to load from Airtable, using localStorage');
          loadFromLocalStorage();
        }
      } catch (airtableError) {
        console.error('❌ Airtable error:', airtableError);
        loadFromLocalStorage();
      }
    } catch (error) {
      console.error('❌ Error loading user data:', error);
      loadFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    // Fallback: carica dai localStorage
    const plans = JSON.parse(localStorage.getItem('userPlans') || '[]');
    setRecentPlans(plans);
    
    setUserStats({
      plansCreated: plans.length,
      currentPlan: 'Free',
      daysTracked: plans.reduce((sum: number, plan: any) => sum + (parseInt(plan.durata) || 0), 0),
      favoriteRecipes: plans.length * 3,
      weightProgress: 0
    });
  };

  const savePlan = (planData: any) => {
    const plans = JSON.parse(localStorage.getItem('userPlans') || '[]');
    const newPlan = {
      id: Date.now(),
      ...planData,
      createdAt: new Date().toLocaleDateString('it-IT'),
      status: 'active'
    };
    plans.push(newPlan);
    localStorage.setItem('userPlans', JSON.stringify(plans));
    setRecentPlans(plans);
    setUserStats(prev => ({ ...prev, plansCreated: plans.length }));
  };

  const addWeightEntry = () => {
    if (newWeight && userData) {
      const weightHistory = JSON.parse(localStorage.getItem('weightHistory') || '[]');
      weightHistory.push({
        weight: parseFloat(newWeight),
        date: new Date().toISOString(),
        timestamp: Date.now()
      });
      localStorage.setItem('weightHistory', JSON.stringify(weightHistory));
      
      if (weightHistory.length > 1) {
        const firstWeight = weightHistory[0].weight;
        const currentWeight = parseFloat(newWeight);
        const progress = firstWeight - currentWeight;
        setUserStats(prev => ({ ...prev, weightProgress: progress }));
      }
      
      setShowWeightModal(false);
      setNewWeight('');
      alert('✅ Peso registrato con successo!');
    }
  };

  const testAirtableConnection = async () => {
    try {
      const response = await fetch('/api/airtable');
      const data = await response.json();
      
      if (data.success) {
        alert('✅ Connessione Airtable attiva!\n\nRecords: ' + data.recordsCount);
      } else {
        alert('❌ Errore connessione: ' + data.error);
      }
    } catch (error) {
      alert('❌ Errore di rete: ' + error);
    }
  };

  // Login Form
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{backgroundColor: '#8FBC8F'}}>
                👤
              </div>
              <h1 className="text-2xl font-bold" style={{color: '#8FBC8F'}}>
                Accedi alla Dashboard
              </h1>
              <p className="text-gray-400 mt-2">
                Gestisci i tuoi piani alimentari
              </p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-green-400 focus:outline-none"
                  placeholder="inserisci@email.com"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-green-400 focus:outline-none"
                  placeholder="Password (min 4 caratteri)"
                  required
                />
                {loginError && (
                  <p className="text-red-400 text-sm mt-2">❌ {loginError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-lg font-semibold transition-all mb-4"
                style={{backgroundColor: '#8FBC8F', color: 'black'}}
              >
                🚀 Accedi alla Dashboard
              </button>
            </form>

            <div className="text-center text-sm text-gray-400">
              <p className="mb-2">Non hai un account? Inizia creando il tuo primo piano!</p>
              <Link 
                href="/"
                className="text-green-400 hover:text-green-300 transition-colors"
              >
                ← Vai al Meal Planner
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Content
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <header className="bg-gray-900/90 backdrop-blur-md shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full" style={{backgroundColor: '#8FBC8F'}}></div>
            <h1 className="text-2xl font-bold">La Mia Dashboard</h1>
            {isLoading && <span className="text-green-400 text-sm">⏳ Caricando...</span>}
          </div>
          
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="hover:text-green-400 transition-colors">Crea Piano</Link>
            <span className="text-green-400 font-semibold">Dashboard</span>
            <button 
              onClick={testAirtableConnection}
              className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition-colors"
            >
              🔗 Test DB
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300">
              👋 {sessionStorage.getItem('userAuth')}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors text-sm"
            >
              Esci
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="text-center py-8 px-4" style={{background: 'linear-gradient(to right, #8FBC8F, #9ACD32)'}}>
        <h1 className="text-3xl md:text-4xl font-bold text-black mb-3">
          🎯 La Tua Area Personale
        </h1>
        <p className="text-lg text-gray-800 mb-4 max-w-2xl mx-auto">
          Monitora i progressi, gestisci i piani e raggiungi i tuoi obiettivi
        </p>
        {userData && (
          <div className="bg-black/20 rounded-lg px-6 py-2 inline-block">
            <span className="text-white font-semibold">
              🎯 Obiettivo: {userData.obiettivo} | Piano: {userStats.currentPlan}
            </span>
          </div>
        )}
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Piani Creati</p>
                <p className="text-3xl font-bold">{userStats.plansCreated}</p>
                <p className="text-blue-200 text-xs">Meal prep generati</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                📋
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-700 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Piano Attivo</p>
                <p className="text-2xl font-bold">{userStats.currentPlan}</p>
                <p className="text-green-200 text-xs">
                  {userStats.currentPlan === 'Free' ? '1 piano/mese' : 'Illimitato'}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                {userStats.currentPlan === 'Free' ? '🆓' : '💎'}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Giorni Tracciati</p>
                <p className="text-3xl font-bold">{userStats.daysTracked}</p>
                <p className="text-orange-200 text-xs">Alimentazione pianificata</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                📅
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Progresso Peso</p>
                <p className="text-2xl font-bold">
                  {userStats.weightProgress > 0 ? `-${userStats.weightProgress.toFixed(1)}` : 
                   userStats.weightProgress < 0 ? `+${Math.abs(userStats.weightProgress).toFixed(1)}` : '0.0'}kg
                </p>
                <p className="text-purple-200 text-xs">Dall'inizio</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                ⚖️
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6" style={{color: '#8FBC8F'}}>
            🚀 Azioni Rapide
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link 
              href="/"
              className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 transition-colors group"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform">
                  ➕
                </div>
                <h3 className="text-lg font-bold mb-2">Nuovo Piano</h3>
                <p className="text-gray-400 text-sm">Crea meal prep</p>
              </div>
            </Link>

            <button
              onClick={() => setShowWeightModal(true)}
              className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 transition-colors group"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform">
                  ⚖️
                </div>
                <h3 className="text-lg font-bold mb-2">Registra Peso</h3>
                <p className="text-gray-400 text-sm">Traccia progressi</p>
              </div>
            </button>

            <div className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 transition-colors group cursor-pointer">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform">
                  🥗
                </div>
                <h3 className="text-lg font-bold mb-2">Ricette Salvate</h3>
                <p className="text-gray-400 text-sm">I tuoi preferiti</p>
              </div>
            </div>

            <div className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 transition-colors group cursor-pointer">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-600 rounded-lg flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform">
                  💎
                </div>
                <h3 className="text-lg font-bold mb-2">Upgrade Premium</h3>
                <p className="text-gray-400 text-sm">Piano illimitato</p>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Plans */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6" style={{color: '#8FBC8F'}}>
            📋 I Miei Piani {recentPlans.length > 0 && <span className="text-lg">({recentPlans.length})</span>}
          </h2>
          {recentPlans.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPlans.map((plan, index) => (
                <div key={index} className="bg-gray-800 rounded-xl p-6 shadow-lg">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold">{plan.nome || `Piano ${index + 1}`}</h3>
                    <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                      {plan.duration || plan.durata || 3} giorni
                    </span>
                  </div>
                  <div className="space-y-2 text-gray-300 mb-4">
                    <p>📅 Creato: {plan.created_at || plan.createdAt || 'N/A'}</p>
                    <p>🎯 {plan.goal || plan.obiettivo || 'N/A'}</p>
                    <p>🍽️ {plan.meals_per_day || plan.pasti || 'N/A'} pasti/giorno</p>
                    <p>⚖️ {plan.weight || plan.peso || 'N/A'} kg</p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href="/"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex-1 text-center"
                    >
                      👁️ Ricrea
                    </Link>
                    <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                      📥
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 rounded-xl p-8 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-bold mb-2">
                {isLoading ? 'Caricamento in corso...' : 'Nessun piano trovato'}
              </h3>
              <p className="text-gray-400 mb-6">
                {isLoading ? 'Stiamo cercando i tuoi piani...' : 'Inizia creando il tuo primo piano alimentare!'}
              </p>
              <Link 
                href="/"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg inline-block transition-colors"
              >
                🚀 Crea Primo Piano
              </Link>
            </div>
          )}
        </section>

        {/* Profile Section */}
        {userData && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6" style={{color: '#8FBC8F'}}>
              👤 Il Tuo Profilo
            </h2>
            <div className="bg-gray-800 rounded-xl p-8 shadow-2xl">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-green-400">Dati Personali</h3>
                  <div className="space-y-2 text-gray-300">
                    <p><span className="text-white">Nome:</span> {userData.nome}</p>
                    <p><span className="text-white">Età:</span> {userData.eta} anni</p>
                    <p><span className="text-white">Sesso:</span> {userData.sesso}</p>
                    <p><span className="text-white">Peso:</span> {userData.peso} kg</p>
                    <p><span className="text-white">Altezza:</span> {userData.altezza} cm</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 text-green-400">Obiettivi</h3>
                  <div className="space-y-2 text-gray-300">
                    <p><span className="text-white">Obiettivo:</span> {userData.obiettivo}</p>
                    <p><span className="text-white">Attività:</span> {userData.attivita}</p>
                    <p><span className="text-white">Pasti/giorno:</span> {userData.pasti}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 text-green-400">Piano Attivo</h3>
                  <div className="space-y-2 text-gray-300">
                    <p><span className="text-white">Tipo:</span> {userStats.currentPlan}</p>
                    <p><span className="text-white">Piani usati:</span> {userStats.plansCreated}/
                      {userStats.currentPlan === 'Free' ? '1' : '∞'} questo mese</p>
                    <p><span className="text-white">Stato:</span> 
                      <span className={userStats.currentPlan === 'Free' ? 'text-yellow-400' : 'text-green-400'}>
                        {userStats.currentPlan === 'Free' ? ' Limitato' : ' Attivo'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-700 flex gap-4">
                <Link 
                  href="/"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  ✏️ Modifica Profilo
                </Link>
                {userStats.currentPlan === 'Free' && (
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors">
                    💎 Upgrade Premium
                  </button>
                )}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Weight Modal */}
      {showWeightModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold mb-6" style={{color: '#8FBC8F'}}>
              ⚖️ Registra Peso
            </h3>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Peso attuale (kg)</label>
              <input
                type="number"
                step="0.1"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-green-400 focus:outline-none"
                placeholder="Es: 75.5"
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={addWeightEntry}
                className="flex-1 py-3 rounded-lg font-semibold transition-all"
                style={{backgroundColor: '#8FBC8F', color: 'black'}}
              >
                ✅ Salva Peso
              </button>
              <button
                onClick={() => setShowWeightModal(false)}
                className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition-colors"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full" style={{backgroundColor: '#8FBC8F'}}></div>
            <h3 className="text-xl font-bold">Meal Prep Planner</h3>
          </div>
          <p className="text-gray-400 text-sm">
            La tua area personale per gestire alimentazione e progressi
          </p>
        </div>
      </footer>
    </div>
  );
}