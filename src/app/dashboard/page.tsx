'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function EnhancedUserDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [userStats, setUserStats] = useState({
    plansCreated: 0,
    currentPlan: 'Free',
    daysTracked: 0,
    favoriteRecipes: 0,
    weightProgress: 0,
    streak: 0,
    totalCalories: 0,
    achievements: [] as string[]
  });
  const [recentPlans, setRecentPlans] = useState<any[]>([]);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [weightHistory, setWeightHistory] = useState<any[]>([]);
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'calendar' | 'achievements'>('overview');

  // 🎯 SISTEMA ACHIEVEMENT
  const achievements = [
    { id: 'first_plan', name: 'Primo Piano', desc: 'Hai creato il tuo primo piano!', icon: '🏆', unlocked: false },
    { id: 'week_streak', name: 'Settimana Perfetta', desc: '7 giorni consecutivi di tracking', icon: '🔥', unlocked: false },
    { id: 'month_streak', name: 'Mese Dedicato', desc: '30 giorni di utilizzo', icon: '💪', unlocked: false },
    { id: 'weight_goal', name: 'Obiettivo Peso', desc: 'Hai raggiunto il tuo peso target', icon: '⚖️', unlocked: false },
    { id: 'five_plans', name: 'Esperto Nutrizionale', desc: '5 piani completati', icon: '🎓', unlocked: false },
    { id: 'sharing_master', name: 'Condivisione Pro', desc: 'Hai condiviso 10 piani', icon: '📱', unlocked: false }
  ];

  // 🗓️ CALENDARIO PASTI
  const weekDays = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
  const mealTypes = ['Colazione', 'Pranzo', 'Cena', 'Spuntino'];

  const viewPlan = (plan: any) => {
    setSelectedPlan(plan);
    setShowPlanModal(true);
  };

  const downloadPDF = (plan: any) => {
    const planData = plan.mealPlan || {};
    const completeDocument = planData.generatedPlan || `Piano per ${plan.nome}`;
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Preparazione Pasti - ${plan.nome}</title>
          <style>
            body { 
              font-family: 'Georgia', serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 20px; 
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 3px solid #8FBC8F; 
              padding-bottom: 20px; 
            }
            h1 { 
              color: #2F4F4F; 
              font-size: 28px; 
              margin-bottom: 10px; 
            }
            h2 { 
              color: #8FBC8F; 
              font-size: 20px; 
              margin-top: 25px; 
              margin-bottom: 15px; 
            }
            .info-box { 
              background: #f8f9fa; 
              border-left: 4px solid #8FBC8F; 
              padding: 15px; 
              margin: 20px 0; 
            }
            .recipe-section { 
              background: #fff; 
              border: 1px solid #ddd; 
              border-radius: 8px; 
              padding: 20px; 
              margin: 15px 0; 
              box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
            }
            .ingredient-list { 
              background: #f8f9fa; 
              padding: 15px; 
              border-radius: 5px; 
              margin: 10px 0; 
            }
            .footer { 
              text-align: center; 
              margin-top: 40px; 
              padding-top: 20px; 
              border-top: 2px solid #8FBC8F; 
              color: #666; 
            }
            @media print {
              body { margin: 0; padding: 10px; }
              .header { page-break-after: avoid; }
              .recipe-section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📋 Preparazione Pasti - Meal Prep Guide</h1>
            <p><strong>Generato per:</strong> ${plan.nome} | <strong>Data:</strong> ${new Date().toLocaleDateString('it-IT')}</p>
            <div class="info-box">
              <strong>Obiettivo:</strong> ${plan.goal || 'N/A'} | 
              <strong>Durata:</strong> ${plan.duration || 'N/A'} giorni | 
              <strong>Pasti:</strong> ${plan.meals_per_day || 'N/A'} al giorno
            </div>
          </div>
          <div style="white-space: pre-wrap; font-size: 14px;">${completeDocument}</div>
          <div class="footer">
            <p><strong>Meal Prep Planner Pro</strong> - Il tuo assistente per una alimentazione sana</p>
            <p>Generato il ${new Date().toLocaleDateString('it-IT')} alle ${new Date().toLocaleTimeString('it-IT')}</p>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Controlla se già loggato
  useEffect(() => {
    const userAuth = sessionStorage.getItem('userAuth');
    if (userAuth) {
      setIsLoggedIn(true);
      loadUserData(userAuth);
    }
  }, []);

  // 📊 CARICA WEIGHT HISTORY
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('weightHistory') || '[]');
    setWeightHistory(history);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
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
      
      try {
        console.log('🔍 Calling getUserMealRequests API...');
        const response = await fetch('/api/airtable', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            action: 'getUserMealRequests',
            data: { email: userEmail }
          })
        });
        
        console.log('📡 API response status:', response.status);
        const data = await response.json();
        console.log('📊 API response data:', data);
        
        if (data.success && data.records) {
          console.log('✅ Loaded', data.records.length, 'records from Airtable for user:', userEmail);
          
          const userPlans = data.records.map((record: any) => ({
            id: record.id,
            nome: record.fields?.Nome || 'Utente',
            email: record.fields?.Email || userEmail,
            goal: record.fields?.Goal || 'N/A',
            duration: record.fields?.Duration || 0,
            meals_per_day: record.fields?.Meals_Per_Day || 3,
            weight: record.fields?.Weight || 0,
            height: record.fields?.Height || 0,
            age: record.fields?.Age || 0,
            gender: record.fields?.Gender || 'N/A',
            activity_level: record.fields?.Activity_Level || 'N/A',
            created_at: record.fields?.Created_At ? new Date(record.fields.Created_At).toLocaleDateString('it-IT') : '',
            status: record.fields?.Status || 'In attesa',
            createdTime: record.createdTime || '',
            exclusions: record.fields?.Exclusions || '',
            foods_at_home: record.fields?.Foods_At_Home || ''
          }));
          
          console.log('👤 Mapped user plans:', userPlans);
          setRecentPlans(userPlans);
          
          if (userPlans.length > 0) {
            const firstPlan = userPlans[0];
            setUserData({
              nome: firstPlan.nome,
              email: firstPlan.email,
              eta: firstPlan.age,
              peso: firstPlan.weight,
              altezza: firstPlan.height,
              sesso: firstPlan.gender,
              obiettivo: firstPlan.goal,
              attivita: firstPlan.activity_level,
              pasti: firstPlan.meals_per_day,
              allergie: firstPlan.exclusions ? firstPlan.exclusions.split(', ') : [],
              preferenze: firstPlan.foods_at_home ? firstPlan.foods_at_home.split(', ') : []
            });
          }
          
          // 🎯 CALCOLA ACHIEVEMENT
          const unlockedAchievements = calculateAchievements(userPlans);
          
          setUserStats({
            plansCreated: userPlans.length,
            currentPlan: 'Free',
            daysTracked: userPlans.reduce((sum: number, plan: any) => 
              sum + (parseInt(plan.duration) || 0), 0),
            favoriteRecipes: userPlans.length * 3,
            weightProgress: 0,
            streak: calculateStreak(userPlans),
            totalCalories: userPlans.length * 1800, // Stima
            achievements: unlockedAchievements
          });
          
        } else {
          console.log('❌ Failed to load user data from Airtable:', data.error);
          loadFromLocalStorage();
        }
      } catch (airtableError) {
        console.error('❌ Airtable API error:', airtableError);
        loadFromLocalStorage();
      }
    } catch (error) {
      console.error('❌ Error loading user data:', error);
      loadFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };

  // 🎯 CALCOLA ACHIEVEMENT
  const calculateAchievements = (plans: any[]) => {
    const unlocked = [];
    
    if (plans.length >= 1) unlocked.push('first_plan');
    if (plans.length >= 5) unlocked.push('five_plans');
    
    // Simula altri achievement
    const daysSinceFirst = plans.length > 0 ? 
      Math.floor((Date.now() - new Date(plans[0].createdTime).getTime()) / (1000 * 60 * 60 * 24)) : 0;
    
    if (daysSinceFirst >= 7) unlocked.push('week_streak');
    if (daysSinceFirst >= 30) unlocked.push('month_streak');
    
    return unlocked;
  };

  const calculateStreak = (plans: any[]) => {
    // Semplice calcolo streak basato su numero di piani
    return Math.min(plans.length * 3, 30);
  };

  const loadFromLocalStorage = () => {
    console.log('💾 Loading from localStorage fallback...');
    
    const formData = localStorage.getItem('mealPrepFormData');
    if (formData) {
      try {
        const parsed = JSON.parse(formData);
        setUserData(parsed);
        console.log('✅ Loaded form data from localStorage:', parsed);
      } catch (e) {
        console.error('❌ Error parsing localStorage formData:', e);
      }
    }
    
    const plans = JSON.parse(localStorage.getItem('userPlans') || '[]');
    setRecentPlans(plans);
    console.log('📋 Loaded', plans.length, 'plans from localStorage');
    
    const unlockedAchievements = calculateAchievements(plans);
    
    setUserStats({
      plansCreated: plans.length,
      currentPlan: 'Free',
      daysTracked: plans.reduce((sum: number, plan: any) => sum + (parseInt(plan.durata) || 0), 0),
      favoriteRecipes: plans.length * 3,
      weightProgress: 0,
      streak: calculateStreak(plans),
      totalCalories: plans.length * 1800,
      achievements: unlockedAchievements
    });
  };

  const addWeightEntry = () => {
    if (newWeight && userData) {
      const weightHistory = JSON.parse(localStorage.getItem('weightHistory') || '[]');
      const newEntry = {
        weight: parseFloat(newWeight),
        date: new Date().toISOString(),
        timestamp: Date.now()
      };
      
      weightHistory.push(newEntry);
      localStorage.setItem('weightHistory', JSON.stringify(weightHistory));
      setWeightHistory(weightHistory);
      
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
      console.log('🧪 Testing Airtable connection...');
      const response = await fetch('/api/airtable', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({action: 'testConnection'})
      });
      
      const data = await response.json();
      console.log('🔍 Test result:', data);
      
      if (data.success) {
        alert('✅ Connessione Airtable attiva!\n\nStatus: ' + data.status + '\nRecords trovati: ' + (data.recordsFound || 0));
      } else {
        alert('❌ Errore connessione: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Test error:', error);
      alert('❌ Errore di rete: ' + error);
    }
  };

  // 📊 PROGRESS CHART COMPONENT
  const ProgressChart = () => {
    const maxWeight = Math.max(...weightHistory.map(w => w.weight), userData?.peso || 0);
    const minWeight = Math.min(...weightHistory.map(w => w.weight), userData?.peso || 0);
    const range = maxWeight - minWeight || 10;
    
    return (
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4 text-green-400">📊 Progresso Peso</h3>
        {weightHistory.length > 0 ? (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Peso iniziale: {weightHistory[0]?.weight || 'N/A'} kg</span>
              <span>Peso attuale: {weightHistory[weightHistory.length - 1]?.weight || 'N/A'} kg</span>
            </div>
            
            {/* Grafico semplificato */}
            <div className="relative h-32 bg-gray-700 rounded-lg p-4">
              <div className="absolute inset-0 flex items-end justify-between px-4 pb-4">
                {weightHistory.slice(-7).map((entry, index) => {
                  const height = ((entry.weight - minWeight) / range) * 80 + 10;
                  return (
                    <div key={index} className="flex flex-col items-center">
                      <div 
                        className="w-4 bg-green-500 rounded-t transition-all duration-300"
                        style={{ height: `${height}px` }}
                      ></div>
                      <span className="text-xs text-gray-400 mt-1">
                        {new Date(entry.date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-green-600/20 p-3 rounded-lg">
                <div className="text-lg font-bold text-green-400">
                  {userStats.weightProgress > 0 ? `-${userStats.weightProgress.toFixed(1)}` : 
                   userStats.weightProgress < 0 ? `+${Math.abs(userStats.weightProgress).toFixed(1)}` : '0.0'}
                </div>
                <div className="text-xs text-gray-400">Variazione</div>
              </div>
              <div className="bg-blue-600/20 p-3 rounded-lg">
                <div className="text-lg font-bold text-blue-400">{userStats.streak}</div>
                <div className="text-xs text-gray-400">Streak giorni</div>
              </div>
              <div className="bg-purple-600/20 p-3 rounded-lg">
                <div className="text-lg font-bold text-purple-400">{weightHistory.length}</div>
                <div className="text-xs text-gray-400">Misurazioni</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📈</div>
            <p className="text-gray-400 mb-4">Nessun dato peso disponibile</p>
            <button
              onClick={() => setShowWeightModal(true)}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Aggiungi Peso
            </button>
          </div>
        )}
      </div>
    );
  };

  // 🗓️ CALENDAR COMPONENT
  const MealCalendar = () => {
    const currentWeek = new Date();
    const startOfWeek = new Date(currentWeek);
    startOfWeek.setDate(currentWeek.getDate() - currentWeek.getDay() + 1 + (selectedWeek * 7));
    
    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });

    // Dati pasti mock (in produzione verrebbero da API)
    const getMealForDay = (dayIndex: number, mealType: string) => {
      const meals = {
        0: { Colazione: 'Porridge proteico', Pranzo: 'Insalata di pollo', Cena: 'Salmone grigliato', Spuntino: 'Yogurt greco' },
        1: { Colazione: 'Uova strapazzate', Pranzo: 'Riso integrale con verdure', Cena: 'Petto di pollo', Spuntino: 'Frutta secca' },
        2: { Colazione: 'Smoothie proteico', Pranzo: 'Quinoa bowl', Cena: 'Pesce al vapore', Spuntino: 'Ricotta' },
        3: { Colazione: 'Avena overnight', Pranzo: 'Bowl vegano', Cena: 'Tagliata di manzo', Spuntino: 'Protein shake' },
        4: { Colazione: 'Pancakes fitness', Pranzo: 'Wrap di pollo', Cena: 'Risotto ai funghi', Spuntino: 'Mandorle' },
        5: { Colazione: 'French toast fit', Pranzo: 'Buddha bowl', Cena: 'Branzino al limone', Spuntino: 'Hummus' },
        6: { Colazione: 'Chia pudding', Pranzo: 'Pasta integrale', Cena: 'Pollo alle erbe', Spuntino: 'Barretta proteica' }
      };
      
      return (meals as any)[dayIndex]?.[mealType] || 'Libero';
    };

    return (
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-green-400">🗓️ Calendario Pasti</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => setSelectedWeek(selectedWeek - 1)}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              ←
            </button>
            <span className="px-4 py-2 bg-gray-700 rounded-lg text-sm">
              {selectedWeek === 0 ? 'Questa settimana' : `Settimana ${selectedWeek > 0 ? '+' : ''}${selectedWeek}`}
            </span>
            <button 
              onClick={() => setSelectedWeek(selectedWeek + 1)}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-8 gap-2 mb-4">
          <div className="p-2 text-center text-gray-400 text-sm font-medium">Pasto</div>
          {weekDates.map((date, index) => (
            <div key={index} className="p-2 text-center text-sm">
              <div className="font-medium">{weekDays[index].substring(0, 3)}</div>
              <div className="text-gray-400">{date.getDate()}</div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          {mealTypes.map((mealType) => (
            <div key={mealType} className="grid grid-cols-8 gap-2">
              <div className="p-3 text-sm font-medium text-gray-300 flex items-center">
                {mealType === 'Colazione' && '🌅'}
                {mealType === 'Pranzo' && '🍽️'}
                {mealType === 'Cena' && '🌙'}
                {mealType === 'Spuntino' && '🍎'}
                <span className="ml-2">{mealType}</span>
              </div>
              {Array.from({ length: 7 }, (_, dayIndex) => (
                <div 
                  key={dayIndex}
                  className="p-2 bg-gray-700 rounded-lg text-xs text-center hover:bg-gray-600 transition-colors cursor-pointer"
                >
                  {getMealForDay(dayIndex, mealType)}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-gray-700 rounded-lg">
          <h4 className="font-semibold mb-2">💡 Suggerimento della settimana:</h4>
          <p className="text-sm text-gray-300">
            Prepara i pasti domenica sera per tutta la settimana. 
            Risparmierai tempo e manterrai la dieta più facilmente!
          </p>
        </div>
      </div>
    );
  };

  // 🎯 ACHIEVEMENTS COMPONENT
  const AchievementsSection = () => {
    const userAchievements = achievements.map(achievement => ({
      ...achievement,
      unlocked: userStats.achievements.includes(achievement.id)
    }));

    return (
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-6 text-green-400">🎯 I Tuoi Achievement</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          {userAchievements.map((achievement) => (
            <div 
              key={achievement.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                achievement.unlocked 
                  ? 'bg-gradient-to-r from-green-600/20 to-green-400/20 border-green-500' 
                  : 'bg-gray-700 border-gray-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`text-2xl ${achievement.unlocked ? 'animate-pulse' : 'grayscale'}`}>
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-bold ${achievement.unlocked ? 'text-green-400' : 'text-gray-400'}`}>
                      {achievement.name}
                    </h4>
                    {achievement.unlocked && (
                      <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                        SBLOCCATO
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    {achievement.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg">
          <h4 className="font-semibold mb-2">🏆 Prossimo Obiettivo:</h4>
          <p className="text-sm text-gray-300">
            {userStats.plansCreated < 5 
              ? `Crea altri ${5 - userStats.plansCreated} piani per sbloccare "Esperto Nutrizionale"` 
              : 'Hai sbloccato tutti gli achievement principali! 🎉'}
          </p>
        </div>
      </div>
    );
  };

  // Login Form
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl border border-gray-700">
            <div className="text-center mb-6 md:mb-8">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full mx-auto mb-4 md:mb-6 flex items-center justify-center" style={{backgroundColor: '#8FBC8F'}}>
                <span className="text-2xl md:text-3xl">👤</span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold mb-2 md:mb-3" style={{color: '#8FBC8F'}}>
                Accedi alla Dashboard
              </h1>
              <p className="text-sm md:text-base text-gray-400">
                Gestisci i tuoi piani alimentari
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 md:space-y-6">
              <div>
                <label className="block text-sm md:text-base font-medium mb-2 md:mb-3">Email</label>
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 md:px-6 py-3 md:py-4 text-base md:text-lg rounded-xl bg-gray-700 border border-gray-600 focus:border-green-400 focus:outline-none transition-colors"
                  placeholder="inserisci@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm md:text-base font-medium mb-2 md:mb-3">Password</label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 md:px-6 py-3 md:py-4 text-base md:text-lg rounded-xl bg-gray-700 border border-gray-600 focus:border-green-400 focus:outline-none transition-colors"
                  placeholder="Password (min 4 caratteri)"
                  required
                />
                {loginError && (
                  <p className="text-red-400 text-sm md:text-base mt-2">❌ {loginError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 md:py-4 rounded-xl font-semibold text-base md:text-lg transition-all"
                style={{backgroundColor: '#8FBC8F', color: 'black'}}
              >
                🚀 Accedi alla Dashboard
              </button>
            </form>

            <div className="text-center text-sm md:text-base text-gray-400 mt-6 md:mt-8">
              <p className="mb-2 md:mb-3">Non hai un account? Inizia creando il tuo primo piano!</p>
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

  // Enhanced Dashboard Content
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <header className="bg-gray-900/90 backdrop-blur-md shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full" style={{backgroundColor: '#8FBC8F'}}></div>
              <h1 className="text-lg md:text-2xl font-bold">La Mia Dashboard</h1>
              {isLoading && <span className="text-green-400 text-sm">⏳</span>}
            </div>
            
            <nav className="flex items-center justify-between md:justify-center md:gap-6">
              <div className="flex gap-4 md:gap-6">
                <Link href="/" className="text-sm md:text-base hover:text-green-400 transition-colors">Crea Piano</Link>
                <span className="text-sm md:text-base text-green-400 font-semibold">Dashboard</span>
                <button 
                  onClick={testAirtableConnection}
                  className="bg-blue-600 hover:bg-blue-700 px-2 md:px-3 py-1 rounded text-xs md:text-sm transition-colors"
                >
                  🔗 Test
                </button>
              </div>

              <div className="flex items-center gap-2 md:gap-4">
                <span className="text-xs md:text-sm text-gray-300 truncate max-w-32 md:max-w-none">
                  👋 {sessionStorage.getItem('userAuth')?.split('@')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 px-3 md:px-4 py-1 md:py-2 rounded-lg transition-colors text-xs md:text-sm"
                >
                  Esci
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="text-center py-6 md:py-8 px-4" style={{background: 'linear-gradient(to right, #8FBC8F, #9ACD32)'}}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-2 md:mb-3">
            🎯 Dashboard Pro
          </h1>
          <p className="text-sm md:text-base lg:text-lg text-gray-800 mb-4 md:mb-6 leading-relaxed">
            Grafici, Calendario e Achievement per il tuo successo
          </p>
          {userData && (
            <div className="bg-black/20 rounded-lg px-4 md:px-6 py-2 md:py-3 inline-block">
              <span className="text-white font-semibold text-sm md:text-base">
                🎯 {userData.obiettivo} | 🔥 {userStats.streak} giorni streak
              </span>
            </div>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Enhanced Stats Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-4 md:p-6 text-white shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-2 md:mb-0">
                <p className="text-blue-100 text-xs md:text-sm font-medium">Piani Creati</p>
                <p className="text-2xl md:text-3xl font-bold">{userStats.plansCreated}</p>
                <p className="text-blue-200 text-xs">Achievement: {userStats.achievements.length}/6</p>
              </div>
              <div className="w-8 h-8 md:w-12 md:h-12 bg-white/20 rounded-lg flex items-center justify-center self-end md:self-auto">
                <span className="text-lg md:text-2xl">📋</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-700 rounded-xl p-4 md:p-6 text-white shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-2 md:mb-0">
                <p className="text-green-100 text-xs md:text-sm font-medium">Streak Giorni</p>
                <p className="text-2xl md:text-3xl font-bold">{userStats.streak}</p>
                <p className="text-green-200 text-xs">Consecutivi</p>
              </div>
              <div className="w-8 h-8 md:w-12 md:h-12 bg-white/20 rounded-lg flex items-center justify-center self-end md:self-auto">
                <span className="text-lg md:text-2xl">🔥</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-4 md:p-6 text-white shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-2 md:mb-0">
                <p className="text-orange-100 text-xs md:text-sm font-medium">Calorie Totali</p>
                <p className="text-2xl md:text-3xl font-bold">{(userStats.totalCalories / 1000).toFixed(1)}k</p>
                <p className="text-orange-200 text-xs">Pianificate</p>
              </div>
              <div className="w-8 h-8 md:w-12 md:h-12 bg-white/20 rounded-lg flex items-center justify-center self-end md:self-auto">
                <span className="text-lg md:text-2xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-4 md:p-6 text-white shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-2 md:mb-0">
                <p className="text-purple-100 text-xs md:text-sm font-medium">Progresso</p>
                <p className="text-lg md:text-2xl font-bold">
                  {userStats.weightProgress > 0 ? `-${userStats.weightProgress.toFixed(1)}` : 
                   userStats.weightProgress < 0 ? `+${Math.abs(userStats.weightProgress).toFixed(1)}` : '0.0'}kg
                </p>
                <p className="text-purple-200 text-xs">Peso</p>
              </div>
              <div className="w-8 h-8 md:w-12 md:h-12 bg-white/20 rounded-lg flex items-center justify-center self-end md:self-auto">
                <span className="text-lg md:text-2xl">⚖️</span>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <section className="mb-8">
          <div className="flex flex-wrap gap-2 bg-gray-800 p-2 rounded-xl">
            {[
              { id: 'overview', label: 'Panoramica', icon: '📊' },
              { id: 'progress', label: 'Progresso', icon: '📈' },
              { id: 'calendar', label: 'Calendario', icon: '🗓️' },
              { id: 'achievements', label: 'Achievement', icon: '🏆' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-green-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Dynamic Content Based on Active Tab */}
        {activeTab === 'overview' && (
          <section className="space-y-8">
            {/* Quick Actions */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6" style={{color: '#8FBC8F'}}>
                🚀 Azioni Rapide
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <Link 
                  href="/"
                  className="bg-gray-800 hover:bg-gray-700 rounded-xl p-4 md:p-6 transition-colors group"
                >
                  <div className="text-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-green-600 rounded-lg flex items-center justify-center text-xl md:text-2xl mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                      ➕
                    </div>
                    <h3 className="text-sm md:text-lg font-bold mb-1 md:mb-2">Nuovo Piano</h3>
                    <p className="text-gray-400 text-xs md:text-sm">Crea meal prep</p>
                  </div>
                </Link>

                <button
                  onClick={() => setShowWeightModal(true)}
                  className="bg-gray-800 hover:bg-gray-700 rounded-xl p-4 md:p-6 transition-colors group"
                >
                  <div className="text-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-600 rounded-lg flex items-center justify-center text-xl md:text-2xl mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                      ⚖️
                    </div>
                    <h3 className="text-sm md:text-lg font-bold mb-1 md:mb-2">Registra Peso</h3>
                    <p className="text-gray-400 text-xs md:text-sm">Traccia progressi</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('achievements')}
                  className="bg-gray-800 hover:bg-gray-700 rounded-xl p-4 md:p-6 transition-colors group"
                >
                  <div className="text-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-600 rounded-lg flex items-center justify-center text-xl md:text-2xl mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                      🏆
                    </div>
                    <h3 className="text-sm md:text-lg font-bold mb-1 md:mb-2">Achievement</h3>
                    <p className="text-gray-400 text-xs md:text-sm">{userStats.achievements.length}/6 sbloccati</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('calendar')}
                  className="bg-gray-800 hover:bg-gray-700 rounded-xl p-4 md:p-6 transition-colors group"
                >
                  <div className="text-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-yellow-600 rounded-lg flex items-center justify-center text-xl md:text-2xl mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                      🗓️
                    </div>
                    <h3 className="text-sm md:text-lg font-bold mb-1 md:mb-2">Calendario</h3>
                    <p className="text-gray-400 text-xs md:text-sm">Pianifica pasti</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Plans */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6" style={{color: '#8FBC8F'}}>
                📋 I Miei Piani {recentPlans.length > 0 && <span className="text-lg md:text-xl">({recentPlans.length})</span>}
              </h2>
              
              {recentPlans.length > 0 ? (
                <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {recentPlans.slice(0, 3).map((plan, index) => (
                    <div key={index} className="bg-gray-800 rounded-xl p-4 md:p-6 shadow-lg">
                      <div className="flex justify-between items-start mb-3 md:mb-4">
                        <h3 className="text-lg md:text-xl font-bold truncate mr-2">
                          {plan.nome || `Piano ${index + 1}`}
                        </h3>
                        <span className="bg-green-600 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap">
                          {plan.duration || plan.durata || 3}gg
                        </span>
                      </div>
                      
                      <div className="space-y-2 md:space-y-3 text-sm md:text-base text-gray-300 mb-4 md:mb-6">
                        <div className="flex items-center gap-2">
                          <span className="text-green-400">📅</span>
                          <span>Creato: {plan.created_at || plan.createdAt || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-blue-400">🎯</span>
                          <span className="truncate">{plan.goal || plan.obiettivo || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-orange-400">🍽️</span>
                          <span>{plan.meals_per_day || plan.pasti || 'N/A'} pasti/giorno</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 md:gap-3">
                        <button
                          onClick={() => viewPlan(plan)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 md:px-4 py-2 md:py-3 rounded-lg text-xs md:text-sm font-semibold transition-colors"
                        >
                          👁️
                        </button>
                        <button 
                          onClick={() => downloadPDF(plan)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2 md:py-3 rounded-lg text-xs md:text-sm font-semibold transition-colors"
                        >
                          📥
                        </button>
                        <Link
                          href="/"
                          className="bg-gray-600 hover:bg-gray-700 text-white px-3 md:px-4 py-2 md:py-3 rounded-lg text-xs md:text-sm font-semibold transition-colors text-center"
                        >
                          🔄
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-800 rounded-xl p-6 md:p-8 text-center">
                  <div className="text-4xl md:text-6xl mb-4">📋</div>
                  <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-4">
                    {isLoading ? 'Caricamento in corso...' : 'Nessun piano trovato'}
                  </h3>
                  <p className="text-sm md:text-base text-gray-400 mb-4 md:mb-6">
                    {isLoading ? 'Stiamo cercando i tuoi piani...' : 'Inizia creando il tuo primo piano alimentare!'}
                  </p>
                  <Link 
                    href="/"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-lg inline-block transition-colors font-semibold"
                  >
                    🚀 Crea Primo Piano
                  </Link>
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === 'progress' && <ProgressChart />}
        {activeTab === 'calendar' && <MealCalendar />}
        {activeTab === 'achievements' && <AchievementsSection />}
      </div>

      {/* Modals */}
      
      {/* Plan View Modal */}
      {showPlanModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6 border-b border-gray-700">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-4" style={{color: '#8FBC8F'}}>
                    📋 Piano per {selectedPlan.nome}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 text-xs md:text-sm">
                    <div className="bg-gray-700 p-2 md:p-3 rounded-lg">
                      <span className="text-gray-400 block">Obiettivo</span>
                      <span className="font-semibold text-white">{selectedPlan.goal || 'N/A'}</span>
                    </div>
                    <div className="bg-gray-700 p-2 md:p-3 rounded-lg">
                      <span className="text-gray-400 block">Durata</span>
                      <span className="font-semibold text-white">{selectedPlan.duration || 'N/A'} giorni</span>
                    </div>
                    <div className="bg-gray-700 p-2 md:p-3 rounded-lg">
                      <span className="text-gray-400 block">Pasti</span>
                      <span className="font-semibold text-white">{selectedPlan.meals_per_day || 'N/A'}/giorno</span>
                    </div>
                    <div className="bg-gray-700 p-2 md:p-3 rounded-lg">
                      <span className="text-gray-400 block">Creato</span>
                      <span className="font-semibold text-white">{selectedPlan.created_at || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowPlanModal(false)}
                  className="bg-gray-700 hover:bg-gray-600 p-2 md:p-3 rounded-lg transition-colors flex-shrink-0"
                >
                  <span className="text-lg md:text-xl">✕</span>
                </button>
              </div>
            </div>
            
            <div className="p-4 md:p-6">
              <div className="text-center py-8 md:py-12 text-gray-400">
                <div className="text-4xl md:text-6xl mb-4">📋</div>
                <p className="text-base md:text-lg">Piano dettagliato disponibile presto!</p>
                <p className="text-sm md:text-base mt-2">Funzionalità avanzata in sviluppo.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Weight Modal */}
      {showWeightModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-md w-full">
            <div className="p-4 md:p-6 border-b border-gray-700">
              <h3 className="text-xl md:text-2xl font-bold" style={{color: '#8FBC8F'}}>
                ⚖️ Registra Peso
              </h3>
            </div>
            
            <div className="p-4 md:p-6">
              <div className="mb-4 md:mb-6">
                <label className="block text-sm md:text-base font-medium mb-2 md:mb-3">
                  Peso attuale (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="w-full px-4 md:px-6 py-3 md:py-4 text-base md:text-lg rounded-xl bg-gray-700 border border-gray-600 focus:border-green-400 focus:outline-none transition-colors"
                  placeholder="Es: 75.5"
                />
              </div>
              
              <div className="flex gap-3 md:gap-4">
                <button
                  onClick={addWeightEntry}
                  className="flex-1 py-3 md:py-4 rounded-xl font-semibold transition-all text-sm md:text-base"
                  style={{backgroundColor: '#8FBC8F', color: 'black'}}
                >
                  ✅ Salva Peso
                </button>
                <button
                  onClick={() => setShowWeightModal(false)}
                  className="flex-1 py-3 md:py-4 bg-gray-600 hover:bg-gray-700 rounded-xl font-semibold transition-colors text-sm md:text-base"
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full" style={{backgroundColor: '#8FBC8F'}}></div>
            <h3 className="text-xl font-bold">Meal Prep Planner Pro</h3>
          </div>
          <p className="text-gray-400 text-sm">
            Dashboard avanzata con grafici, calendario e achievement system
          </p>
        </div>
      </footer>
    </div>
  );
}