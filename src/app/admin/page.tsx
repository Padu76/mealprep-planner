'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { MapPin, Users, Calendar, Utensils, TrendingUp, Search, Phone, Mail, Filter, Download, RefreshCw, Eye, Target, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
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
  
  // 🔍 NUOVI STATI PER FILTRI
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGoal, setFilterGoal] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [dateRange, setDateRange] = useState('all');

  // 📊 DATI PER GRAFICI
  const [chartData, setChartData] = useState({
    conversions: [],
    goals: [],
    activities: [],
    timeline: [],
    cities: []
  });

  // Password per accesso dashboard - SICURA
  const ADMIN_PASSWORD = 'mealprep2024';

  // 🗺️ SIMULAZIONE GEOLOCALIZZAZIONE (fino a quando non avremo campo reale)
  const simulateLocation = (nome: string) => {
    const cities = [
      { city: 'Milano', region: 'Lombardia', lat: 45.4642, lng: 9.1900 },
      { city: 'Roma', region: 'Lazio', lat: 41.9028, lng: 12.4964 },
      { city: 'Bologna', region: 'Emilia-Romagna', lat: 44.4949, lng: 11.3426 },
      { city: 'Firenze', region: 'Toscana', lat: 43.7696, lng: 11.2558 },
      { city: 'Napoli', region: 'Campania', lat: 40.8518, lng: 14.2681 },
      { city: 'Torino', region: 'Piemonte', lat: 45.0703, lng: 7.6869 },
      { city: 'Venezia', region: 'Veneto', lat: 45.4408, lng: 12.3155 }
    ];
    const hash = nome.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return cities[hash % cities.length];
  };

  // Controlla se già autenticato
  useEffect(() => {
    const authStatus = sessionStorage.getItem('dashboardAuth');
    if (authStatus === 'authenticated') {
      setIsAuthenticated(true);
      loadAirtableData();
    }
  }, []);

  // 🔍 FILTRI - Aggiorna lista filtrata quando cambiano filtri
  useEffect(() => {
    let filtered = [...allUsers];

    // Filtro per nome/email
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.telefono?.includes(searchTerm)
      );
    }

    // Filtro per obiettivo
    if (filterGoal) {
      filtered = filtered.filter(user => user.goal === filterGoal);
    }

    // Filtro per status
    if (filterStatus) {
      filtered = filtered.filter(user => user.status === filterStatus);
    }

    // Filtro per città
    if (filterCity) {
      filtered = filtered.filter(user => {
        const location = simulateLocation(user.nome || '');
        return location.city === filterCity;
      });
    }

    // Filtro per data
    if (dateRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (dateRange) {
        case 'today':
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(user => {
        const userDate = new Date(user.created_at || '');
        return userDate >= cutoffDate;
      });
    }

    setFilteredUsers(filtered);
  }, [allUsers, searchTerm, filterGoal, filterStatus, filterCity, dateRange]);

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
      
      const usersResponse = await fetch('/api/airtable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getMealRequests' })
      });
      
      const metricsResponse = await fetch('/api/airtable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getDashboardMetrics' })
      });
      
      const usersData = await usersResponse.json();
      const metricsData = await metricsResponse.json();
      
      if (usersData.success && metricsData.success) {
        // Mappa i campi Airtable al formato atteso dalla dashboard
        const mappedUsers = (usersData.records || []).map((record: any) => ({
          id: record.id,
          nome: record.fields?.Nome || '',
          email: record.fields?.Email || '',
          telefono: record.fields?.Phone || '', // 📱 NUOVO CAMPO TELEFONO
          age: record.fields?.Age || 0,
          weight: record.fields?.Weight || 0,
          height: record.fields?.Height || 0,
          gender: record.fields?.Gender || '',
          goal: record.fields?.Goal || '',
          activity_level: record.fields?.Activity_Level || '',
          duration: record.fields?.Duration || 0,
          meals_per_day: record.fields?.Meals_Per_Day || 3,
          exclusions: record.fields?.Exclusions || '',
          foods_at_home: record.fields?.Foods_At_Home || '',
          status: record.fields?.Status || 'In attesa',
          created_at: record.createdTime || record.fields?.Created_At || '',
          calories: record.fields?.Calculated_Calories || 0,
          bmr: record.fields?.BMR || 0,
          source: record.fields?.Source || 'Manual'
        }));
        
        console.log('🔍 Mapped users sample:', mappedUsers[0]);
        setAllUsers(mappedUsers);
        
        // Calcola statistiche business
        const totalUsers = mappedUsers.length;
        const freeUsers = mappedUsers.filter((u: any) => !u.planType || u.planType === 'free').length;
        const paidUsers = mappedUsers.filter((u: any) => u.planType === 'paid').length;
        const conversionRate = totalUsers > 0 ? Math.round((paidUsers / totalUsers) * 100) : 0;
        const monthlyRevenue = paidUsers * 9.99;
        
        const stats = {
          totalUsers,
          freeUsers,
          paidUsers,
          totalPlansGenerated: metricsData.data?.totalRequests || totalUsers,
          conversionRate,
          monthlyRevenue,
          todayRequests: metricsData.data?.todayRequests || 0,
          completedRequests: metricsData.data?.completedRequests || 0,
          processingRequests: metricsData.data?.processingRequests || 0
        };
        
        setBusinessStats(stats);
        
        // 📊 GENERA DATI PER GRAFICI
        generateChartData(mappedUsers, metricsData.data);
        
        setLastRefresh(new Date().toLocaleTimeString('it-IT'));
        console.log('✅ Dashboard data loaded successfully');
      } else {
        console.error('❌ Failed to load Airtable data');
        let errorMsg = '❌ Errore nel caricamento dati:\n';
        if (!usersData.success) errorMsg += `- Users: ${usersData.error || 'Unknown error'}\n`;
        if (!metricsData.success) errorMsg += `- Metrics: ${metricsData.error || 'Unknown error'}`;
        alert(errorMsg);
      }
    } catch (error) {
      console.error('❌ Error loading Airtable data:', error);
      alert('❌ Errore di connessione con Airtable: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  // 📊 GENERA DATI PER GRAFICI
  const generateChartData = (users: any[], metrics: any) => {
    // Conversion Funnel
    const conversionData = [
      { name: 'Visitatori', value: users.length * 3, color: '#8884d8' },
      { name: 'Form Compilati', value: users.length, color: '#82ca9d' },
      { name: 'Piani Generati', value: users.filter(u => u.status === 'Piano generato').length, color: '#ffc658' },
      { name: 'Conversioni Paid', value: users.filter(u => u.planType === 'paid').length, color: '#ff7300' }
    ];

    // Distribuzione Obiettivi
    const goalCounts = {};
    users.forEach(user => {
      const goal = user.goal || 'Non specificato';
      goalCounts[goal] = (goalCounts[goal] || 0) + 1;
    });
    const goalsData = Object.entries(goalCounts).map(([name, value]) => ({ name, value }));

    // Distribuzione Attività
    const activityCounts = {};
    users.forEach(user => {
      const activity = user.activity_level || 'Non specificato';
      activityCounts[activity] = (activityCounts[activity] || 0) + 1;
    });
    const activitiesData = Object.entries(activityCounts).map(([name, value]) => ({ name, value }));

    // Timeline Iscrizioni (ultimi 7 giorni)
    const timelineData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = users.filter(user => user.created_at?.startsWith(dateStr)).length;
      timelineData.push({
        date: date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }),
        users: count
      });
    }

    // Distribuzione Città (simulata)
    const cityCounts = {};
    users.forEach(user => {
      const location = simulateLocation(user.nome || '');
      cityCounts[location.city] = (cityCounts[location.city] || 0) + 1;
    });
    const citiesData = Object.entries(cityCounts).map(([name, value]) => ({ name, value }));

    setChartData({
      conversions: conversionData,
      goals: goalsData,
      activities: activitiesData,
      timeline: timelineData,
      cities: citiesData
    });
  };

  const testAirtableConnection = async () => {
    try {
      const response = await fetch('/api/airtable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'testConnection' })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(
          '✅ Connessione Airtable attiva!\n\n' +
          `Status: ${data.status}\n` +
          `Table: ${data.tableName}\n` +
          `Records found: ${data.recordsFound || 0}`
        );
      } else {
        alert('❌ Errore connessione: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Test connection error:', error);
      alert('❌ Errore di rete: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  // 📤 EXPORT DATI CSV
  const exportToCSV = () => {
    const headers = ['Nome', 'Email', 'Telefono', 'Età', 'Peso', 'Altezza', 'Obiettivo', 'Città', 'Status', 'Calorie', 'Data Creazione'];
    const csvData = filteredUsers.map(user => {
      const location = simulateLocation(user.nome || '');
      return [
        user.nome || '',
        user.email || '',
        user.telefono || '',
        user.age || '',
        user.weight || '',
        user.height || '',
        user.goal || '',
        location.city || '',
        user.status || '',
        user.calories || '',
        user.created_at || ''
      ];
    });

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `mealprep-users-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const calculateLeadScore = (user: any) => {
    let score = 0;
    
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

  // 🎨 COLORI PER GRAFICI
  const COLORS = ['#8FBC8F', '#9ACD32', '#32CD32', '#228B22', '#006400', '#ADFF2F'];

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

            <div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Password Admin</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin(e)}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-green-400 focus:outline-none"
                  placeholder="Inserisci password..."
                />
                {loginError && (
                  <p className="text-red-400 text-sm mt-2">❌ {loginError}</p>
                )}
              </div>

              <button
                onClick={handleLogin}
                className="w-full py-3 rounded-lg font-semibold transition-all"
                style={{backgroundColor: '#8FBC8F', color: 'black'}}
              >
                🔓 Accedi alla Dashboard
              </button>
            </div>

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
          📊 CRM Dashboard (Live Data + Analytics)
        </h1>
        <p className="text-lg text-gray-800 mb-4 max-w-2xl mx-auto">
          Dati in tempo reale da Airtable - Ultimo aggiornamento: {lastRefresh || 'Mai'}
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
                <Users className="w-6 h-6" />
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
                <Target className="w-6 h-6" />
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
                <TrendingUp className="w-6 h-6" />
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
                <Activity className="w-6 h-6" />
              </div>
            </div>
          </div>
        </section>

        {/* 📊 NUOVA SEZIONE ANALYTICS */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6" style={{color: '#8FBC8F'}}>
            📊 Analytics Avanzati
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Conversion Funnel */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-green-400">🎯 Conversion Funnel</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.conversions}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#F3F4F6' }}
                  />
                  <Bar dataKey="value" fill="#8FBC8F" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Timeline Utenti */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-green-400">📈 Trend Iscrizioni (7gg)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData.timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#F3F4F6' }}
                  />
                  <Area type="monotone" dataKey="users" stroke="#8FBC8F" fill="#8FBC8F" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Distribuzione Obiettivi */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-green-400">🎯 Obiettivi Utenti</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.goals}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.goals.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Distribuzione Geografica */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-green-400">🗺️ Distribuzione Geografica</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.cities}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#F3F4F6' }}
                  />
                  <Bar dataKey="value" fill="#9ACD32" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* 🔍 FILTRI AVANZATI */}
        <section className="mb-8">
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Filter className="w-5 h-5 text-green-400" />
              <h3 className="text-xl font-bold text-green-400">Filtri Avanzati</h3>
              <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">
                {filteredUsers.length} di {allUsers.length} utenti
              </span>
            </div>
            
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cerca nome, email, telefono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-green-400 focus:outline-none text-sm"
                />
              </div>

              {/* Filtro Obiettivo */}
              <select
                value={filterGoal}
                onChange={(e) => setFilterGoal(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-green-400 focus:outline-none text-sm"
              >
                <option value="">Tutti gli obiettivi</option>
                <option value="dimagrimento">Dimagrimento</option>
                <option value="mantenimento">Mantenimento</option>
                <option value="aumento massa">Aumento Massa</option>
                <option value="Perdita peso">Perdita Peso</option>
              </select>

              {/* Filtro Status */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-green-400 focus:outline-none text-sm"
              >
                <option value="">Tutti gli status</option>
                <option value="In attesa">In attesa</option>
                <option value="Piano generato">Piano generato</option>
                <option value="Elaborazione">Elaborazione</option>
              </select>

              {/* Filtro Città */}
              <select
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-green-400 focus:outline-none text-sm"
              >
                <option value="">Tutte le città</option>
                <option value="Milano">Milano</option>
                <option value="Roma">Roma</option>
                <option value="Bologna">Bologna</option>
                <option value="Firenze">Firenze</option>
                <option value="Napoli">Napoli</option>
                <option value="Torino">Torino</option>
                <option value="Venezia">Venezia</option>
              </select>

              {/* Filtro Data */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-green-400 focus:outline-none text-sm"
              >
                <option value="all">Tutte le date</option>
                <option value="today">Oggi</option>
                <option value="week">Ultima settimana</option>
                <option value="month">Ultimo mese</option>
              </select>

              {/* Export Button */}
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </section>

        {/* Users Table from Airtable (AGGIORNATA) */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold" style={{color: '#8FBC8F'}}>
              👥 Database Utenti (Airtable Live)
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">
                {filteredUsers.length} records mostrati
              </span>
              <div className={`w-3 h-3 rounded-full ${allUsers.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="text-left py-4 px-6 text-green-400 font-semibold">Nome & Contatti</th>
                    <th className="text-left py-4 px-6 text-green-400 font-semibold">Telefono</th>
                    <th className="text-left py-4 px-6 text-green-400 font-semibold">Città</th>
                    <th className="text-left py-4 px-6 text-green-400 font-semibold">Dati Fisici</th>
                    <th className="text-left py-4 px-6 text-green-400 font-semibold">Obiettivo</th>
                    <th className="text-left py-4 px-6 text-green-400 font-semibold">Status</th>
                    <th className="text-left py-4 px-6 text-green-400 font-semibold">Calorie</th>
                    <th className="text-left py-4 px-6 text-green-400 font-semibold">Lead Score</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? filteredUsers.map((user, index) => {
                    const leadScore = calculateLeadScore(user);
                    const location = simulateLocation(user.nome || '');
                    return (
                      <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/50">
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-semibold">{user.nome || 'N/A'}</p>
                            <p className="text-gray-400 text-sm flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email || 'N/A'}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {user.age ? `${user.age} anni` : 'N/A'} | 
                              {user.gender === 'maschio' ? ' ♂️' : user.gender === 'femmina' ? ' ♀️' : ' N/A'}
                            </p>
                            <p className="text-xs text-gray-500">{user.created_at || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4 text-green-400" />
                            <span className={user.telefono ? "text-white" : "text-gray-500"}>
                              {user.telefono || 'Non fornito'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-blue-400" />
                            <div>
                              <p className="text-white font-medium">{location.city}</p>
                              <p className="text-gray-400 text-xs">{location.region}</p>
                            </div>
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
                      <td colSpan={8} className="py-8 px-6 text-center text-gray-400">
                        {isLoading ? (
                          <div className="flex items-center justify-center gap-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                            ⏳ Caricamento dati da Airtable...
                          </div>
                        ) : (
                          <div>
                            <p className="text-lg font-semibold mb-2">📭 Nessun utente trovato</p>
                            <p className="text-sm">Controlla i filtri o aggiungi nuovi dati</p>
                          </div>
                        )}
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
            🔒 Dati live da Airtable - Analytics avanzati - v2.0
          </p>
        </div>
      </footer>
    </div>
  );
}