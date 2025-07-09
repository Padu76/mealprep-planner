'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [businessStats, setBusinessStats] = useState({
    totalUsers: 0,
    freeUsers: 0,
    paidUsers: 0,
    totalPlansGenerated: 0,
    conversionRate: 0,
    monthlyRevenue: 0,
    todayRequests: 0,
    completedRequests: 0,
    processingRequests: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState('');

  // Password per accesso dashboard
  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'mealprep2024';

  // Controlla se già autenticato
  useEffect(() => {
    const authStatus = sessionStorage.getItem('dashboardAuth');
    if (authStatus === 'authenticated') {
      setIsAuthenticated(true);
      loadAirtableData();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('dashboardAuth', 'authenticated');
      setLoginError('');
      loadAirtableData();
    } else {
      setLoginError('Password non corretta');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('dashboardAuth');
    setPassword('');
  };

  const loadAirtableData = async () => {
    setIsLoading(true);
    try {
      console.log('📊 Loading Airtable data...');
      
      // Carica richieste utenti
      const usersResponse = await fetch('/api/airtable?action=getRequests');
      const usersData = await usersResponse.json();
      
      // Carica metriche dashboard
      const metricsResponse = await fetch('/api/airtable?action=getDashboardMetrics');
      const metricsData = await metricsResponse.json();
      
      if (usersData.success && metricsData.success) {
        console.log('✅ Airtable data loaded:', usersData.data.length, 'users');
        setAllUsers(usersData.data);
        
        // Calcola statistiche business
        const totalUsers = usersData.data.length;
        const freeUsers = usersData.data.filter((u: any) => !u.planType || u.planType === 'free').length;
        const paidUsers = usersData.data.filter((u: any) => u.planType === 'paid').length;
        const conversionRate = totalUsers > 0 ? Math.round((paidUsers / totalUsers) * 100) : 0;
        const monthlyRevenue = paidUsers * 9.99;
        
        setBusinessStats({
          totalUsers,
          freeUsers,
          paidUsers,
          totalPlansGenerated: metricsData.data.totalRequests || totalUsers,
          conversionRate,
          monthlyRevenue,
          todayRequests: metricsData.data.todayRequests || 0,
          completedRequests: metricsData.data.completedRequests || 0,
          processingRequests: metricsData.data.processingRequests || 0
        });
        
        setLastRefresh(new Date().toLocaleTimeString('it-IT'));
      } else {
        console.error('❌ Failed to load Airtable data');
        alert('❌ Errore nel caricamento dati. Controlla la connessione Airtable.');
      }
    } catch (error) {
      console.error('❌ Error loading Airtable data:', error);
      alert('❌ Errore di connessione con Airtable');
    } finally {
      setIsLoading(false);
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

  const calculateLeadScore = (user: any) => {
    let score = 0;
    
    // Punteggio basato su completezza dati
    if (user.nome) score += 20;
    if (user.age && user.age > 0) score += 15;
    if (user.weight && user.weight > 0) score += 15;
    if (user.height && user.height > 0) score += 10;
    if (user.goal) score += 20;
    if (user.activity_level) score += 10;
    if (user.exclusions) score += 5;
    if (user.foods_at_home) score += 5;
    
    return score;
  };

  // Login Form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{backgroundColor: '#8FBC8F'}}>
                🔒
              </div>
              <h1 className="text-2xl font-bold" style={{color: '#8FBC8F'}}>
                Dashboard Admin
              </h1>
              <p className="text-gray-400 mt-2">
                Accesso riservato - Inserisci password
              </p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Password Admin</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-green-400 focus:outline-none"
                  placeholder="Inserisci password..."
                  required
                />
                {loginError && (
                  <p className="text-red-400 text-sm mt-2">❌ {loginError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-lg font-semibold transition-all"
                style={{backgroundColor: '#8FBC8F', color: 'black'}}
              >
                🔓 Accedi alla Dashboard
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link 
                href="/"
                className="text-gray-400 hover:text-green-400 transition-colors"
              >
                ← Torna alla Home
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
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">LIVE</span>
          </div>
          
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="hover:text-green-400 transition-colors">Home</Link>
            <button 
              onClick={testAirtableConnection}
              className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition-colors"
            >
              🔗 Test Airtable
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={loadAirtableData}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
            >
              {isLoading ? '⏳ Caricando...' : '🔄 Refresh'}
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
            >
              🔒 Logout
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="text-center py-8 px-4" style={{background: 'linear-gradient(to right, #8FBC8F, #9ACD32)'}}>
        <h1 className="text-3xl md:text-4xl font-bold text-black mb-3">
          📊 CRM Dashboard (Live Data)
        </h1>
        <p className="text-lg text-gray-800 mb-4 max-w-2xl mx-auto">
          Dati in tempo reale da Airtable - Ultimo aggiornamento: {lastRefresh}
        </p>
        <div className="bg-black/20 rounded-lg px-6 py-2 inline-block">
          <span className="text-white font-semibold">
            💰 MRR: €{businessStats.monthlyRevenue.toFixed(2)} | 
            📈 Conversioni: {businessStats.conversionRate}% | 
            👥 Utenti: {businessStats.totalUsers}
          </span>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Real-time Stats */}
        <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Utenti Registrati</p>
                <p className="text-3xl font-bold">{businessStats.totalUsers}</p>
                <p className="text-blue-200 text-xs">Oggi: +{businessStats.todayRequests}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                👥
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-700 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Piani Completati</p>
                <p className="text-3xl font-bold">{businessStats.completedRequests}</p>
                <p className="text-green-200 text-xs">In elaborazione: {businessStats.processingRequests}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                ✅
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Utenti Premium</p>
                <p className="text-3xl font-bold">{businessStats.paidUsers}</p>
                <p className="text-purple-200 text-xs">Conversion: {businessStats.conversionRate}%</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                💎
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Revenue Mensile</p>
                <p className="text-3xl font-bold">€{businessStats.monthlyRevenue.toFixed(0)}</p>
                <p className="text-yellow-200 text-xs">MRR - Ricorrente</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                💰
              </div>
            </div>
          </div>
        </section>

        {/* Users Table from Airtable */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold" style={{color: '#8FBC8F'}}>
              👥 Database Utenti (Airtable Live)
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">
                {allUsers.length} records caricati
              </span>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="text-left py-4 px-6 text-green-400 font-semibold">Nome</th>
                    <th className="text-left py-4 px-6 text-green-400 font-semibold">Dati Fisici</th>
                    <th className="text-left py-4 px-6 text-green-400 font-semibold">Obiettivo</th>
                    <th className="text-left py-4 px-6 text-green-400 font-semibold">Status</th>
                    <th className="text-left py-4 px-6 text-green-400 font-semibold">Calorie</th>
                    <th className="text-left py-4 px-6 text-green-400 font-semibold">Lead Score</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.length > 0 ? allUsers.map((user, index) => {
                    const leadScore = calculateLeadScore(user);
                    return (
                      <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/50">
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-semibold">{user.nome || 'N/A'}</p>
                            <p className="text-gray-400 text-sm">
                              {user.age ? `${user.age} anni` : 'N/A'} | 
                              {user.gender === 'maschio' ? ' ♂️' : user.gender === 'femmina' ? ' ♀️' : ' N/A'}
                            </p>
                            <p className="text-xs text-gray-500">{user.created_at || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-300">
                          <div className="text-sm">
                            <p>{user.weight ? `${user.weight}kg` : 'N/A'} / {user.height ? `${user.height}cm` : 'N/A'}</p>
                            <p className="text-xs text-gray-500">
                              BMR: {user.bmr || 'N/A'} | {user.activity_level || 'N/A'}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            user.goal?.includes('perdita') || user.goal?.includes('dimagrimento') ? 'bg-red-600 text-white' :
                            user.goal?.includes('massa') || user.goal?.includes('aumento') ? 'bg-blue-600 text-white' :
                            'bg-green-600 text-white'
                          }`}>
                            {user.goal || 'N/A'}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {user.duration ? `${user.duration} giorni` : 'N/A'} | 
                            {user.meals_per_day ? ` ${user.meals_per_day} pasti` : ' N/A'}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            user.status === 'Piano generato' ? 'bg-green-600 text-white' :
                            user.status === 'Elaborazione' ? 'bg-yellow-600 text-white' :
                            'bg-gray-600 text-white'
                          }`}>
                            {user.status || 'In attesa'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-300">
                          <div className="text-sm">
                            <p className="font-semibold">{user.calories || 'N/A'} kcal</p>
                            <p className="text-xs text-gray-500">
                              Target giornaliero
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  leadScore >= 80 ? 'bg-red-500' :
                                  leadScore >= 60 ? 'bg-yellow-500' :
                                  leadScore >= 40 ? 'bg-blue-500' :
                                  'bg-gray-500'
                                }`}
                                style={{width: `${leadScore}%`}}
                              ></div>
                            </div>
                            <span className="text-xs font-bold">{leadScore}%</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {leadScore >= 80 ? '🔥 HOT' :
                             leadScore >= 60 ? '🎯 WARM' :
                             leadScore >= 40 ? '🌱 COLD' : '❄️ ICE'}
                          </p>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={6} className="py-8 px-6 text-center text-gray-400">
                        {isLoading ? '⏳ Caricamento dati da Airtable...' : 'Nessun utente trovato in Airtable'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Business Actions */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6" style={{color: '#8FBC8F'}}>
            🚀 Azioni CRM
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 transition-colors group cursor-pointer">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform">
                  📊
                </div>
                <h3 className="text-lg font-bold mb-2">Export Dati</h3>
                <p className="text-gray-400 text-sm">Esporta leads CSV</p>
              </div>
            </div>

            <div className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 transition-colors group cursor-pointer">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform">
                  📧
                </div>
                <h3 className="text-lg font-bold mb-2">Email Campaign</h3>
                <p className="text-gray-400 text-sm">Nurturing leads</p>
              </div>
            </div>

            <div className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 transition-colors group cursor-pointer">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform">
                  🎯
                </div>
                <h3 className="text-lg font-bold mb-2">Segmentazione</h3>
                <p className="text-gray-400 text-sm">Targeting mirato</p>
              </div>
            </div>

            <div className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 transition-colors group cursor-pointer">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-600 rounded-lg flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform">
                  💰
                </div>
                <h3 className="text-lg font-bold mb-2">Setup Pagamenti</h3>
                <p className="text-gray-400 text-sm">Stripe integration</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full" style={{backgroundColor: '#8FBC8F'}}></div>
            <h3 className="text-xl font-bold">Admin CRM Dashboard</h3>
          </div>
          <p className="text-gray-400 text-sm">
            🔒 Dati live da Airtable - Aggiornamento automatico
          </p>
        </div>
      </footer>
    </div>
  );
}