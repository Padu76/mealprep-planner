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
    monthlyRevenue: 0
  });

  // Password per accesso dashboard
  const ADMIN_PASSWORD = 'mealprep2024';

  // Controlla se già autenticato
  useEffect(() => {
    const authStatus = sessionStorage.getItem('dashboardAuth');
    if (authStatus === 'authenticated') {
      setIsAuthenticated(true);
      loadBusinessData();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('dashboardAuth', 'authenticated');
      setLoginError('');
      loadBusinessData();
    } else {
      setLoginError('Password non corretta');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('dashboardAuth');
    setPassword('');
  };

  const loadBusinessData = () => {
    // Carica tutti i dati utenti dal localStorage
    const allStoredUsers = [];
    const globalStats = JSON.parse(localStorage.getItem('globalStats') || '{}');
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('user_')) {
        try {
          const userData = JSON.parse(localStorage.getItem(key) || '{}');
          allStoredUsers.push(userData);
        } catch (error) {
          console.error('Errore parsing user data:', error);
        }
      }
    }
    
    // Ordina per data (più recenti prima)
    allStoredUsers.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    
    setAllUsers(allStoredUsers);
    calculateBusinessStats(allStoredUsers, globalStats);
  };

  const calculateBusinessStats = (users: any[], globalStats: any = {}) => {
    const totalUsers = users.length;
    const freeUsers = users.filter(u => u.planType === 'free').length;
    const paidUsers = users.filter(u => u.planType === 'paid').length;
    const totalPlansGenerated = globalStats.totalPlansGenerated || users.length;
    const conversionRate = totalUsers > 0 ? Math.round((paidUsers / totalUsers) * 100) : 0;
    const monthlyRevenue = paidUsers * 9.99;
    
    setBusinessStats({
      totalUsers,
      freeUsers,
      paidUsers,
      totalPlansGenerated,
      conversionRate,
      monthlyRevenue
    });
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
            <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">PRIVATE</span>
          </div>
          
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="hover:text-green-400 transition-colors">Home Pubblica</Link>
            <span className="text-green-400 font-semibold">Dashboard Admin</span>
          </nav>

          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
          >
            🔒 Logout
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="text-center py-8 px-4" style={{background: 'linear-gradient(to right, #8FBC8F, #9ACD32)'}}>
        <h1 className="text-3xl md:text-4xl font-bold text-black mb-3">
          📊 Admin CRM Dashboard
        </h1>
        <p className="text-lg text-gray-800 mb-4 max-w-2xl mx-auto">
          Monitora utenti, conversioni e revenue del Meal Prep Planner
        </p>
        <div className="bg-black/20 rounded-lg px-6 py-2 inline-block">
          <span className="text-white font-semibold">
            💰 Revenue Mensile: €{businessStats.monthlyRevenue.toFixed(2)}
          </span>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Business Stats */}
        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Utenti Totali</p>
                <p className="text-3xl font-bold">{businessStats.totalUsers}</p>
                <p className="text-blue-200 text-xs">Registrati oggi: +3</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                👥
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-700 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Utenti Free</p>
                <p className="text-3xl font-bold">{businessStats.freeUsers}</p>
                <p className="text-green-200 text-xs">Conversioni potenziali</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                🆓
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

          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Piani Generati</p>
                <p className="text-3xl font-bold">{businessStats.totalPlansGenerated}</p>
                <p className="text-orange-200 text-xs">Utilizzo piattaforma</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                📋
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Revenue Mensile</p>
                <p className="text-3xl font-bold">€{businessStats.monthlyRevenue.toFixed(0)}</p>
                <p className="text-yellow-200 text-xs">MRR (Monthly Recurring Revenue)</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                💰
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm font-medium">Tasso Conversione</p>
                <p className="text-3xl font-bold">{businessStats.conversionRate}%</p>
                <p className="text-pink-200 text-xs">Free → Premium</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                📈
              </div>
            </div>
          </div>
        </section>

        {/* Users Table */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6" style={{color: '#8FBC8F'}}>
            👥 Database Utenti (Leads)
          </h2>
          <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="text-left py-4 px-6 text-green-400 font-semibold">Nome</th>
                    <th className="text-left py-4 px-6 text-green-400 font-semibold">Dati</th>
                    <th className="text-left py-4 px-6 text-green-400 font-semibold">Obiettivo</th>
                    <th className="text-left py-4 px-6 text-green-400 font-semibold">Piano</th>
                    <th className="text-left py-4 px-6 text-green-400 font-semibold">Utilizzo</th>
                    <th className="text-left py-4 px-6 text-green-400 font-semibold">Potenziale</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.length > 0 ? allUsers.map((user, index) => (
                    <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/50">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-semibold">{user.nome || 'N/A'}</p>
                          <p className="text-gray-400 text-sm">
                            {user.eta ? `${user.eta} anni` : 'N/A'} | 
                            Score: {user.leadScore || 'N/A'}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-300">
                        <div className="text-sm">
                          <p>{user.sesso || 'N/A'}</p>
                          <p>{user.peso ? `${user.peso}kg` : 'N/A'} / {user.altezza ? `${user.altezza}cm` : 'N/A'}</p>
                          <p className="text-xs text-gray-500">{user.createdAt || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          user.obiettivo === 'perdita-peso' ? 'bg-red-600 text-white' :
                          user.obiettivo === 'aumento-massa' ? 'bg-blue-600 text-white' :
                          'bg-green-600 text-white'
                        }`}>
                          {user.obiettivo || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          user.planType === 'paid' ? 'bg-purple-600 text-white' : 'bg-gray-600 text-white'
                        }`}>
                          {user.planType === 'paid' ? '💎 Premium' : '🆓 Free'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm">
                          <p>{user.plansUsed || 1} piani</p>
                          <p className="text-gray-500">
                            {user.planDetails ? `${user.planDetails.durata} gg` : 'N/A'}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {user.leadScore >= 80 ? (
                          <span className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                            🔥 SUPER HOT
                          </span>
                        ) : user.leadScore >= 60 ? (
                          <span className="bg-yellow-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                            🎯 HOT LEAD
                          </span>
                        ) : user.planType === 'paid' ? (
                          <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                            💰 CLIENTE
                          </span>
                        ) : (
                          <span className="bg-gray-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                            🌱 NUOVO
                          </span>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="py-8 px-6 text-center text-gray-400">
                        Nessun utente registrato ancora
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
            🚀 Azioni Business
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 transition-colors group cursor-pointer">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform">
                  📧
                </div>
                <h3 className="text-lg font-bold mb-2">Email Marketing</h3>
                <p className="text-gray-400 text-sm">Campagne ai leads</p>
              </div>
            </div>

            <div className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 transition-colors group cursor-pointer">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform">
                  💳
                </div>
                <h3 className="text-lg font-bold mb-2">Setup Pagamenti</h3>
                <p className="text-gray-400 text-sm">Stripe/PayPal</p>
              </div>
            </div>

            <div className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 transition-colors group cursor-pointer">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform">
                  📊
                </div>
                <h3 className="text-lg font-bold mb-2">Analytics</h3>
                <p className="text-gray-400 text-sm">Report dettagliati</p>
              </div>
            </div>

            <div className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 transition-colors group cursor-pointer">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-600 rounded-lg flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform">
                  🎯
                </div>
                <h3 className="text-lg font-bold mb-2">Retargeting</h3>
                <p className="text-gray-400 text-sm">Riattiva utenti</p>
              </div>
            </div>
          </div>
        </section>

        {/* Revenue Projection */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6" style={{color: '#8FBC8F'}}>
            📈 Proiezioni Revenue
          </h2>
          <div className="bg-gray-800 rounded-xl p-8 shadow-2xl">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl mb-2">🎯</div>
                <h3 className="text-xl font-bold mb-2">Obiettivo 30 giorni</h3>
                <p className="text-2xl font-bold text-green-400">€500</p>
                <p className="text-gray-400">50 utenti premium</p>
              </div>
              
              <div className="text-center">
                <div className="text-4xl mb-2">🚀</div>
                <h3 className="text-xl font-bold mb-2">Obiettivo 90 giorni</h3>
                <p className="text-2xl font-bold text-blue-400">€2,000</p>
                <p className="text-gray-400">200 utenti premium</p>
              </div>
              
              <div className="text-center">
                <div className="text-4xl mb-2">💎</div>
                <h3 className="text-xl font-bold mb-2">Obiettivo 1 anno</h3>
                <p className="text-2xl font-bold text-purple-400">€10,000</p>
                <p className="text-gray-400">1000 utenti premium</p>
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
            <h3 className="text-xl font-bold">Admin Dashboard</h3>
          </div>
          <p className="text-gray-400 text-sm">
            🔒 Area riservata - Dati business confidenziali
          </p>
        </div>
      </footer>
    </div>
  );
}