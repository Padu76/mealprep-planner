'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  TrendingUp, Target, Award, Calendar, Clock, 
  Activity, Zap, Brain, Trophy, ChevronRight, ChevronUp, 
  ChevronDown, Plus, Bell, BarChart3, PieChart as PieChartIcon, 
  CheckCircle, AlertCircle, Info, Sparkles, X
} from 'lucide-react';

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
  airtableId?: string;
  status?: string;
  email?: string;
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
  weeklyProgress: number;
  completionRate: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  unlocked: boolean;
  category: string;
  progress?: number;
  maxProgress?: number;
  unlockedAt?: string;
}

interface AIInsight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'suggestion';
  title: string;
  message: string;
  actionable: boolean;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
}

interface NutritionTrend {
  date: string;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  day: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'weekly' | 'daily' | 'monthly';
  target: number;
  current: number;
  reward: number;
  icon: string;
  deadline: string;
  completed: boolean;
}

export default function DashboardAdvanced() {
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<SavedPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<SavedPlan | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [nutritionTrends, setNutritionTrends] = useState<NutritionTrend[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [activeView, setActiveView] = useState<'overview' | 'analytics' | 'challenges' | 'insights'>('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | '3months'>('week');
  const [showNotifications, setShowNotifications] = useState(false);
  const [animateProgress, setAnimateProgress] = useState(false);
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set());
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await loadSavedPlans();
      generateAnalyticsData();
      generateAIInsights();
      generateChallenges();
      setTimeout(() => setAnimateProgress(true), 500);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedPlans = async () => {
    try {
      console.log('Loading plans from Meal_Requests table...');
      
      const response = await fetch('/api/airtable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'getMealRequests'
        })
      });

      let plans: SavedPlan[] = [];

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.records) {
          plans = result.records
            // RIMUOVI IL FILTRO temporaneamente per vedere tutti i record
            // .filter((record: any) => record.fields?.Meal_Plan) 
            .map((record: any) => {
              let parsedPlan = null;
              try {
                if (record.fields.Meal_Plan && typeof record.fields.Meal_Plan === 'string') {
                  parsedPlan = JSON.parse(record.fields.Meal_Plan);
                }
              } catch (e) {
                console.warn('Could not parse Meal_Plan for record:', record.id);
              }

              // Assicuriamoci che tutti i campi numerici abbiano valori di default
              const calculatedCalories = Number(record.fields.Calculated_Calories) || 2000;
              const duration = Number(record.fields.Duration) || 7;
              const mealsPerDay = Number(record.fields.Meals_Per_Day) || 3;
              
              return {
                id: record.id,
                airtableId: record.id,
                nome: record.fields.Nome || 'Piano Senza Nome',
                createdAt: record.createdTime?.split('T')[0] || new Date().toISOString().split('T')[0],
                obiettivo: record.fields.Goal || 'Non specificato',
                durata: String(duration),
                pasti: String(mealsPerDay),
                calorie: calculatedCalories,
                totalCalories: calculatedCalories,
                totalProteins: Math.round(calculatedCalories * 0.25 / 4),
                allergie: record.fields.Exclusions ? 
                  String(record.fields.Exclusions).split(',').map((s: string) => s.trim()).filter(Boolean) : [],
                preferenze: record.fields.Diet_Type ? [String(record.fields.Diet_Type)] : [],
                formData: {
                  nome: record.fields.Nome || '',
                  email: record.fields.Email || '',
                  age: Number(record.fields.Age) || 30,
                  weight: Number(record.fields.Weight) || 70,
                  height: Number(record.fields.Height) || 170,
                  gender: record.fields.Gender || 'maschio',
                  activity_level: record.fields.Activity_Level || 'moderato',
                  goal: record.fields.Goal || 'mantenimento',
                  duration: duration,
                  meals_per_day: mealsPerDay
                },
                days: parsedPlan?.days || [],
                generatedPlan: record.fields.Meal_Plan || '',
                status: record.fields.Status || 'Completato',
                email: record.fields.Email || ''
              };
            });
          console.log(`Loaded ${plans.length} plans from Meal_Requests`);
        }
      }

      if (plans.length === 0) {
        const localPlans = JSON.parse(localStorage.getItem('mealPrepSavedPlans') || '[]');
        plans = localPlans;
        console.log(`Loaded ${plans.length} plans from localStorage as fallback`);
      }

      setSavedPlans(plans);
      setFilteredPlans(plans);
      
      if (plans.length > 0) {
        setSelectedPlan(plans[0]);
      }
      
      calculateUserStats(plans);
      calculateAchievements(plans);
      
    } catch (error) {
      console.error('Error loading plans:', error);
      const localPlans = JSON.parse(localStorage.getItem('mealPrepSavedPlans') || '[]');
      setSavedPlans(localPlans);
      setFilteredPlans(localPlans);
      if (localPlans.length > 0) {
        setSelectedPlan(localPlans[0]);
      }
      calculateUserStats(localPlans);
      calculateAchievements(localPlans);
    }
  };

  const calculateUserStats = (plans: SavedPlan[]) => {
    // Filtra i piani non validi
    const validPlans = plans.filter(plan => 
      plan && 
      typeof plan.durata === 'string' && 
      typeof plan.calorie === 'number' &&
      typeof plan.totalCalories === 'number'
    );

    if (validPlans.length === 0) {
      setUserStats({
        totalPlans: 0, totalCalories: 0, totalDays: 0, currentStreak: 0,
        longestStreak: 0, monthlyPoints: 0, totalPoints: 0, level: 1,
        preferredObjective: 'Nessuno', avgCaloriesPerDay: 0, varietyScore: 0,
        weeklyProgress: 0, completionRate: 0
      });
      return;
    }

    const totalDays = validPlans.reduce((sum, plan) => sum + parseInt(plan.durata), 0);
    const totalCalories = validPlans.reduce((sum, plan) => sum + plan.totalCalories, 0);
    const avgCaloriesPerDay = Math.round(totalCalories / Math.max(totalDays, 1));
    
    const sortedPlans = [...validPlans].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
    
    const basePoints = validPlans.length * 20;
    const streakBonus = currentStreak * 10;
    const varietyBonus = Math.min(100, validPlans.length * 5);
    const totalPoints = basePoints + streakBonus + varietyBonus;
    const level = Math.floor(totalPoints / 200) + 1;
    const weeklyProgress = Math.min(100, (currentStreak / 7) * 100);
    const completionRate = Math.min(100, (validPlans.length / 10) * 100);

    const objectives = validPlans.map(p => p.obiettivo).filter(o => o !== 'Non specificato');
    const preferredObjective = objectives.length > 0 ? 
      objectives.reduce((acc: any, obj) => {
        acc[obj] = (acc[obj] || 0) + 1;
        return acc;
      }, {}) : {};
    
    const mostCommonObjective = Object.keys(preferredObjective).length > 0 ? 
      Object.keys(preferredObjective).reduce((a, b) => 
        preferredObjective[a] > preferredObjective[b] ? a : b, 'Nessuno'
      ) : 'Nessuno';

    setUserStats({
      totalPlans: validPlans.length,
      totalCalories,
      totalDays,
      currentStreak,
      longestStreak,
      monthlyPoints: validPlans.filter(p => new Date(p.createdAt) >= new Date(Date.now() - 30*24*60*60*1000)).length * 20,
      totalPoints,
      level,
      preferredObjective: mostCommonObjective,
      avgCaloriesPerDay,
      varietyScore: varietyBonus,
      weeklyProgress,
      completionRate
    });
  };

  const calculateAchievements = (plans: SavedPlan[]) => {
    const stats = userStats || {} as UserStats;
    const uniqueObjectives = new Set(plans.map(p => p.obiettivo).filter(o => o !== 'Non specificato')).size;

    const achievements: Achievement[] = [
      { 
        id: 'first-plan', 
        title: 'Primo Passo', 
        description: 'Crea il tuo primo piano meal prep', 
        icon: '🎯', 
        points: 20, 
        unlocked: plans.length >= 1, 
        category: 'Inizio',
        progress: Math.min(1, plans.length),
        maxProgress: 1
      },
      { 
        id: 'consistent', 
        title: 'Consistenza', 
        description: 'Crea 5 piani meal prep', 
        icon: '💪', 
        points: 100, 
        unlocked: plans.length >= 5, 
        category: 'Progresso',
        progress: Math.min(5, plans.length),
        maxProgress: 5
      },
      { 
        id: 'expert', 
        title: 'Esperto', 
        description: 'Crea 15 piani meal prep', 
        icon: '👑', 
        points: 300, 
        unlocked: plans.length >= 15, 
        category: 'Mastery',
        progress: Math.min(15, plans.length),
        maxProgress: 15
      },
      { 
        id: 'streak-master', 
        title: 'Streak Master', 
        description: 'Mantieni una streak di 14 giorni', 
        icon: '🔥', 
        points: 200, 
        unlocked: (stats.currentStreak || 0) >= 14, 
        category: 'Streak',
        progress: Math.min(14, stats.currentStreak || 0),
        maxProgress: 14
      },
      { 
        id: 'variety-explorer', 
        title: 'Esploratore', 
        description: 'Prova tutti gli obiettivi fitness', 
        icon: '🌟', 
        points: 150, 
        unlocked: uniqueObjectives >= 3, 
        category: 'Varietà',
        progress: Math.min(3, uniqueObjectives),
        maxProgress: 3
      },
      { 
        id: 'high-level', 
        title: 'Alto Livello', 
        description: 'Raggiungi il livello 5', 
        icon: '⭐', 
        points: 250, 
        unlocked: (stats.level || 1) >= 5, 
        category: 'Livello',
        progress: Math.min(5, stats.level || 1),
        maxProgress: 5
      }
    ];

    achievements.forEach(achievement => {
      if (achievement.unlocked && !achievement.unlockedAt) {
        achievement.unlockedAt = new Date().toISOString();
      }
    });

    setAchievements(achievements);
  };

  const generateAnalyticsData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      
      return {
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('it-IT', { weekday: 'short' }),
        calories: Math.floor(Math.random() * 400) + 1800,
        proteins: Math.floor(Math.random() * 50) + 100,
        carbs: Math.floor(Math.random() * 100) + 150,
        fats: Math.floor(Math.random() * 30) + 50
      };
    });

    setNutritionTrends(last7Days);
  };

  const generateAIInsights = () => {
    const insights: AIInsight[] = [
      {
        id: 'protein-trend',
        type: 'success',
        title: 'Ottimo Apporto Proteico!',
        message: 'Hai mantenuto un consumo proteico costante di 120g/giorno negli ultimi 7 giorni. Perfetto per i tuoi obiettivi di massa.',
        actionable: false,
        priority: 'medium',
        createdAt: new Date().toISOString()
      },
      {
        id: 'variety-suggestion',
        type: 'suggestion',
        title: 'Prova Nuove Ricette',
        message: 'Hai utilizzato principalmente ricette di pollo. Prova il salmone per omega-3 e varietà nutrizionale.',
        actionable: true,
        priority: 'low',
        createdAt: new Date().toISOString()
      },
      {
        id: 'timing-optimization',
        type: 'info',
        title: 'Timing Ottimale',
        message: 'I tuoi pasti pre-workout sono perfettamente bilanciati. Mantieni carboidrati 1-2h prima dell\'allenamento.',
        actionable: false,
        priority: 'medium',
        createdAt: new Date().toISOString()
      },
      {
        id: 'hydration-reminder',
        type: 'warning',
        title: 'Attenzione Idratazione',
        message: 'Con l\'aumento delle proteine, ricorda di bere almeno 2.5L di acqua al giorno per supportare i reni.',
        actionable: true,
        priority: 'high',
        createdAt: new Date().toISOString()
      }
    ];

    setAiInsights(insights);
  };

  const generateChallenges = () => {
    const challenges: Challenge[] = [
      {
        id: 'weekly-protein',
        title: 'Settimana High-Protein',
        description: 'Consuma 150g+ di proteine per 5 giorni questa settimana',
        type: 'weekly',
        target: 5,
        current: 3,
        reward: 50,
        icon: '💪',
        deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        completed: false
      },
      {
        id: 'daily-water',
        title: 'Idratazione Oggi',
        description: 'Bevi 8 bicchieri d\'acqua oggi',
        type: 'daily',
        target: 8,
        current: 5,
        reward: 10,
        icon: '💧',
        deadline: new Date().toISOString(),
        completed: false
      },
      {
        id: 'monthly-variety',
        title: 'Esploratore Mensile',
        description: 'Prova 10 ricette diverse questo mese',
        type: 'monthly',
        target: 10,
        current: 6,
        reward: 100,
        icon: '🌟',
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        completed: false
      }
    ];

    setChallenges(challenges);
  };

  const deletePlan = async (planId: string, airtableId?: string) => {
    try {
      if (airtableId) {
        await fetch('/api/airtable', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'deletePlan',
            recordId: airtableId
          })
        });
      }

      const updatedPlans = savedPlans.filter(plan => plan.id !== planId);
      setSavedPlans(updatedPlans);
      setFilteredPlans(updatedPlans);
      
      if (selectedPlan?.id === planId) {
        setSelectedPlan(updatedPlans.length > 0 ? updatedPlans[0] : null);
      }
      
      calculateUserStats(updatedPlans);
      calculateAchievements(updatedPlans);
      
      console.log('Plan deleted successfully');
      
    } catch (error) {
      console.error('Error deleting plan:', error);
      alert('Errore nell\'eliminazione. Riprova!');
    }
  };

  const toggleInsightExpanded = (insightId: string) => {
    const newExpanded = new Set(expandedInsights);
    if (newExpanded.has(insightId)) {
      newExpanded.delete(insightId);
    } else {
      newExpanded.add(insightId);
    }
    setExpandedInsights(newExpanded);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'info': return <Info className="h-5 w-5 text-blue-500" />;
      case 'suggestion': return <Sparkles className="h-5 w-5 text-purple-500" />;
      default: return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getInsightBgColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-900/20 border-green-600/30';
      case 'warning': return 'bg-yellow-900/20 border-yellow-600/30';
      case 'info': return 'bg-blue-900/20 border-blue-600/30';
      case 'suggestion': return 'bg-purple-900/20 border-purple-600/30';
      default: return 'bg-gray-900/20 border-gray-600/30';
    }
  };

  const handleWeeklyPlanning = async () => {
    try {
      const params = new URLSearchParams({
        durata: '7',
        pasti: '3',
        obiettivo: userStats?.preferredObjective || 'mantenimento',
        mode: 'weekly-planning'
      });
      
      window.location.href = `/?${params.toString()}`;
      
    } catch (error) {
      console.error('Error starting weekly planning:', error);
      alert('Errore nell\'avvio della pianificazione settimanale');
    }
  };

  const handleNutritionReport = async () => {
    if (isGeneratingReport) return;
    
    try {
      setIsGeneratingReport(true);
      
      const reportData = generateNutritionReportData();
      const htmlContent = generateReportHTML(reportData);
      
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `Report-Nutrizionale-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      alert('Report nutrizionale scaricato con successo!');
      
    } catch (error) {
      console.error('Error generating nutrition report:', error);
      alert('Errore nella generazione del report');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const generateNutritionReportData = () => {
    const now = new Date();
    
    // Filtra i piani validi per il report
    const validPlans = savedPlans.filter(plan => 
      plan && 
      typeof plan.calorie === 'number' &&
      typeof plan.obiettivo === 'string' &&
      typeof plan.durata === 'string' &&
      typeof plan.createdAt === 'string'
    );
    
    return {
      date: now.toLocaleDateString('it-IT'),
      userStats,
      savedPlans: validPlans.slice(0, 10),
      nutritionTrends,
      achievements: achievements.filter(a => a.unlocked),
      totalPlans: validPlans.length,
      avgCaloriesPerPlan: validPlans.length > 0 ? 
        Math.round(validPlans.reduce((sum, plan) => sum + plan.calorie, 0) / validPlans.length) : 0,
      mostUsedGoal: userStats?.preferredObjective || 'Non specificato',
      recentPlans: validPlans.slice(0, 5).map(plan => ({
        nome: plan.nome || 'Piano Senza Nome',
        obiettivo: plan.obiettivo || 'Non specificato',
        calorie: plan.calorie || 0,
        durata: plan.durata || '0',
        createdAt: plan.createdAt || ''
      }))
    };
  };

  const generateReportHTML = (data: any) => {
    return `
    <!DOCTYPE html>
    <html lang="it">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Report Nutrizionale - ${data.date}</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #10b981; }
            .header h1 { color: #10b981; margin: 0; font-size: 2em; }
            .header p { color: #666; margin: 5px 0; }
            .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
            .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; border: 2px solid #e9ecef; }
            .stat-card h3 { margin: 0 0 10px 0; color: #333; font-size: 1.1em; }
            .stat-card .value { font-size: 2em; font-weight: bold; color: #10b981; margin: 10px 0; }
            .section { margin: 30px 0; }
            .section h2 { color: #333; border-bottom: 2px solid #10b981; padding-bottom: 10px; }
            .plans-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .plans-table th, .plans-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            .plans-table th { background: #f8f9fa; font-weight: 600; color: #333; }
            .achievements { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; }
            .achievement { background: #fff3cd; padding: 15px; border-radius: 8px; border: 1px solid #ffeaa7; }
            .achievement .icon { font-size: 1.5em; margin-right: 10px; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
            @media print { body { background: white; } .container { box-shadow: none; } }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Report Nutrizionale</h1>
                <p>Generato il ${data.date}</p>
                <p>Dashboard Fitness AI - Meal Prep Analysis</p>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Piani Totali</h3>
                    <div class="value">${data.totalPlans}</div>
                </div>
                <div class="stat-card">
                    <h3>Livello Attuale</h3>
                    <div class="value">Lv.${data.userStats?.level || 1}</div>
                </div>
                <div class="stat-card">
                    <h3>Punti Totali</h3>
                    <div class="value">${data.userStats?.totalPoints || 0}</div>
                </div>
                <div class="stat-card">
                    <h3>Streak Corrente</h3>
                    <div class="value">${data.userStats?.currentStreak || 0}</div>
                </div>
                <div class="stat-card">
                    <h3>Calorie Medie</h3>
                    <div class="value">${data.avgCaloriesPerPlan}</div>
                </div>
                <div class="stat-card">
                    <h3>Obiettivo Preferito</h3>
                    <div class="value" style="font-size: 1.2em;">${data.mostUsedGoal}</div>
                </div>
            </div>

            <div class="section">
                <h2>Piani Recenti</h2>
                <table class="plans-table">
                    <thead>
                        <tr>
                            <th>Nome Piano</th>
                            <th>Obiettivo</th>
                            <th>Calorie</th>
                            <th>Durata</th>
                            <th>Data Creazione</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.recentPlans.map((plan: any) => `
                            <tr>
                                <td>${plan.nome}</td>
                                <td>${plan.obiettivo}</td>
                                <td>${plan.calorie} kcal</td>
                                <td>${plan.durata} giorni</td>
                                <td>${plan.createdAt}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div class="section">
                <h2>Achievement Sbloccati</h2>
                <div class="achievements">
                    ${data.achievements.map((achievement: any) => `
                        <div class="achievement">
                            <span class="icon">${achievement.icon}</span>
                            <strong>${achievement.title}</strong> - ${achievement.points} punti
                            <br><small>${achievement.description}</small>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="footer">
                <p><strong>Meal Prep AI Dashboard</strong></p>
                <p>Report generato automaticamente il ${new Date().toLocaleString('it-IT')}</p>
                <p>Continua così per raggiungere i tuoi obiettivi fitness!</p>
            </div>
        </div>
    </body>
    </html>`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">Caricamento Dashboard Avanzata...</p>
          <p className="text-gray-400 text-sm mt-2">Sincronizzazione con Airtable in corso</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <header className="bg-gray-800/90 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Dashboard Fitness AI</h1>
                <p className="text-gray-400 text-sm">Powered by Advanced Analytics</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              
              <Link 
                href="/" 
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 px-4 py-2 rounded-lg transition-all duration-300 font-semibold flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nuovo Piano
              </Link>
            </div>
          </div>

          {userStats && (
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-center">
              <div className="bg-gradient-to-br from-green-600/20 to-green-700/10 border border-green-600/30 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-400">{userStats.totalPlans}</div>
                <div className="text-xs text-green-300">Piani Totali</div>
              </div>
              <div className="bg-gradient-to-br from-blue-600/20 to-blue-700/10 border border-blue-600/30 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-400">Lv.{userStats.level}</div>
                <div className="text-xs text-blue-300">Livello</div>
              </div>
              <div className="bg-gradient-to-br from-purple-600/20 to-purple-700/10 border border-purple-600/30 rounded-lg p-3">
                <div className="text-2xl font-bold text-purple-400">{userStats.currentStreak}</div>
                <div className="text-xs text-purple-300">Streak</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-700/10 border border-yellow-600/30 rounded-lg p-3">
                <div className="text-2xl font-bold text-yellow-400">{userStats.totalPoints}</div>
                <div className="text-xs text-yellow-300">Punti</div>
              </div>
              <div className="bg-gradient-to-br from-red-600/20 to-red-700/10 border border-red-600/30 rounded-lg p-3">
                <div className="text-2xl font-bold text-red-400">{Math.round(userStats.totalCalories / 1000)}k</div>
                <div className="text-xs text-red-300">Calorie</div>
              </div>
              <div className="bg-gradient-to-br from-orange-600/20 to-orange-700/10 border border-orange-600/30 rounded-lg p-3">
                <div className="text-2xl font-bold text-orange-400">{Math.round(userStats.completionRate)}%</div>
                <div className="text-xs text-orange-300">Completamento</div>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-1 flex gap-1">
            {[
              { key: 'overview', label: 'Panoramica', icon: Activity },
              { key: 'analytics', label: 'Analytics', icon: BarChart3 },
              { key: 'challenges', label: 'Sfide', icon: Trophy },
              { key: 'insights', label: 'AI Insights', icon: Brain }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveView(key as any)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                  activeView === key 
                    ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {activeView === 'overview' && (
          <div className="space-y-8">
            {userStats && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                <h2 className="text-2xl font-bold mb-6 text-green-400 flex items-center gap-2">
                  <Target className="h-6 w-6" />
                  Progresso Avanzato
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Progresso Settimanale</span>
                      <span className="text-green-400 font-bold">{Math.round(userStats.weeklyProgress)}%</span>
                    </div>
                    <div className="relative">
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-1000"
                          style={{ width: animateProgress ? `${userStats.weeklyProgress}%` : '0%' }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Tasso Completamento</span>
                      <span className="text-purple-400 font-bold">{Math.round(userStats.completionRate)}%</span>
                    </div>
                    <div className="relative">
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-1000"
                          style={{ width: animateProgress ? `${userStats.completionRate}%` : '0%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <h2 className="text-2xl font-bold mb-6 text-yellow-400 flex items-center gap-2">
                <Award className="h-6 w-6" />
                Achievement Dinamici
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-xl border transition-all duration-300 ${
                      achievement.unlocked
                        ? 'bg-gradient-to-br from-yellow-900/30 to-orange-900/20 border-yellow-600/40 shadow-lg'
                        : 'bg-gray-700/30 border-gray-600/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`text-2xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                        {achievement.icon}
                      </div>
                      <div className="text-xs text-right">
                        <div className={`font-bold ${achievement.unlocked ? 'text-yellow-400' : 'text-gray-500'}`}>
                          {achievement.points}pt
                        </div>
                        <div className="text-gray-400">{achievement.category}</div>
                      </div>
                    </div>
                    
                    <h3 className={`font-bold mb-2 ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`}>
                      {achievement.title}
                    </h3>
                    
                    <p className="text-gray-400 text-sm mb-3">
                      {achievement.description}
                    </p>
                    
                    {achievement.maxProgress && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">
                            {achievement.progress}/{achievement.maxProgress}
                          </span>
                          <span className="text-gray-400">
                            {Math.round((achievement.progress || 0) / achievement.maxProgress * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-1000 ${
                              achievement.unlocked 
                                ? 'bg-gradient-to-r from-yellow-500 to-orange-500' 
                                : 'bg-gradient-to-r from-gray-500 to-gray-400'
                            }`}
                            style={{ 
                              width: animateProgress 
                                ? `${Math.min(100, ((achievement.progress || 0) / achievement.maxProgress) * 100)}%` 
                                : '0%' 
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    {achievement.unlocked && achievement.unlockedAt && (
                      <div className="mt-3 text-xs text-yellow-400 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Sbloccato di recente!
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-bold mb-4 text-blue-400 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Azioni Rapide
                </h3>
                
                <div className="space-y-3">
                  <Link 
                    href="/ricette" 
                    className="flex items-center gap-3 p-3 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white">Esplora Ricette</div>
                      <div className="text-xs text-gray-400">Database fitness + AI</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </Link>
                  
                  <button 
                    onClick={handleWeeklyPlanning}
                    className="w-full flex items-center gap-3 p-3 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-white">Pianifica Settimana</div>
                      <div className="text-xs text-gray-400">AI meal planning</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </button>
                  
                  <button 
                    onClick={handleNutritionReport}
                    disabled={isGeneratingReport}
                    className="w-full flex items-center gap-3 p-3 bg-gray-700/50 hover:bg-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      {isGeneratingReport ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <BarChart3 className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-white">
                        {isGeneratingReport ? 'Generando...' : 'Report Nutrizionale'}
                      </div>
                      <div className="text-xs text-gray-400">Export per nutrizionista</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-2">
                {filteredPlans.length > 0 ? (
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                    <h3 className="text-xl font-bold mb-4 text-green-400 flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Piani Recenti
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredPlans.slice(0, 4).map((plan) => (
                        <div 
                          key={plan.id}
                          className="bg-gray-700/50 hover:bg-gray-600/50 rounded-lg p-4 transition-all duration-300 cursor-pointer group border border-gray-600/30 hover:border-green-500/50"
                          onClick={() => setSelectedPlan(plan)}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h4 className="font-bold text-white group-hover:text-green-400 transition-colors">
                                {plan.nome}
                              </h4>
                              <p className="text-gray-400 text-sm">{plan.createdAt}</p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Eliminare "${plan.nome}"?`)) {
                                  deletePlan(plan.id, plan.airtableId);
                                }
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-600/20 rounded transition-all"
                            >
                              <X className="h-4 w-4 text-red-400" />
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            <div className="text-center bg-green-600/20 rounded py-1">
                              <div className="text-green-400 font-bold text-sm">{plan.calorie}</div>
                              <div className="text-green-300 text-xs">kcal</div>
                            </div>
                            <div className="text-center bg-blue-600/20 rounded py-1">
                              <div className="text-blue-400 font-bold text-sm">{plan.durata}</div>
                              <div className="text-blue-300 text-xs">giorni</div>
                            </div>
                            <div className="text-center bg-purple-600/20 rounded py-1">
                              <div className="text-purple-400 font-bold text-sm">{plan.pasti}</div>
                              <div className="text-purple-300 text-xs">pasti</div>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">Obiettivo:</span>
                            <span className="text-white font-medium">{plan.obiettivo}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {filteredPlans.length > 4 && (
                      <div className="mt-4 text-center">
                        <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                          Vedi tutti i {filteredPlans.length} piani
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-12 border border-gray-700/50 text-center">
                    <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-300 mb-2">Nessun piano ancora</h3>
                    <p className="text-gray-400 mb-6">Crea il tuo primo piano meal prep per iniziare!</p>
                    <Link 
                      href="/" 
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 px-6 py-3 rounded-lg transition-all duration-300 font-semibold"
                    >
                      <Plus className="h-4 w-4" />
                      Crea Primo Piano
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeView === 'analytics' && (
          <div className="space-y-8">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-blue-400 flex items-center gap-2">
                  <BarChart3 className="h-6 w-6" />
                  Trend Nutrizionali
                </h2>
                <div className="flex gap-2">
                  {['week', 'month', '3months'].map((timeframe) => (
                    <button
                      key={timeframe}
                      onClick={() => setSelectedTimeframe(timeframe as any)}
                      className={`px-3 py-1 rounded-lg text-sm transition-all ${
                        selectedTimeframe === timeframe
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {timeframe === 'week' ? '7gg' : timeframe === 'month' ? '30gg' : '3m'}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={nutritionTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="day" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Line type="monotone" dataKey="calories" stroke="#10B981" strokeWidth={3} name="Calorie" />
                    <Line type="monotone" dataKey="proteins" stroke="#3B82F6" strokeWidth={2} name="Proteine" />
                    <Line type="monotone" dataKey="carbs" stroke="#8B5CF6" strokeWidth={2} name="Carboidrati" />
                    <Line type="monotone" dataKey="fats" stroke="#F59E0B" strokeWidth={2} name="Grassi" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-bold mb-4 text-purple-400 flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Distribuzione Macro
                </h3>
                
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Proteine', value: 25, fill: '#3B82F6' },
                          { name: 'Carboidrati', value: 45, fill: '#8B5CF6' },
                          { name: 'Grassi', value: 30, fill: '#F59E0B' }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        <Cell fill="#3B82F6" />
                        <Cell fill="#8B5CF6" />
                        <Cell fill="#F59E0B" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-bold mb-4 text-green-400 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Settimanale
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                    <div>
                      <div className="font-semibold text-white">Calorie Medie/Giorno</div>
                      <div className="text-gray-400 text-sm">Target: 2000 kcal</div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-bold text-lg">1,950</div>
                      <div className="text-green-400 text-sm flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        -2.5%
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                    <div>
                      <div className="font-semibold text-white">Proteine Medie/Giorno</div>
                      <div className="text-gray-400 text-sm">Target: 120g</div>
                    </div>
                    <div className="text-right">
                      <div className="text-blue-400 font-bold text-lg">125g</div>
                      <div className="text-green-400 text-sm flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        +4.2%
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                    <div>
                      <div className="font-semibold text-white">Varietà Alimentare</div>
                      <div className="text-gray-400 text-sm">Diversità ricette</div>
                    </div>
                    <div className="text-right">
                      <div className="text-purple-400 font-bold text-lg">8.5/10</div>
                      <div className="text-green-400 text-sm flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Ottimo
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'challenges' && (
          <div className="space-y-8">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <h2 className="text-2xl font-bold mb-6 text-yellow-400 flex items-center gap-2">
                <Trophy className="h-6 w-6" />
                Sfide Attive
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {challenges.map((challenge) => (
                  <div 
                    key={challenge.id}
                    className={`p-6 rounded-xl border transition-all duration-300 ${
                      challenge.completed
                        ? 'bg-gradient-to-br from-green-900/30 to-green-800/20 border-green-600/40'
                        : 'bg-gradient-to-br from-gray-800/50 to-gray-700/30 border-gray-600/40 hover:border-yellow-500/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-3xl">{challenge.icon}</div>
                      <div className="text-right">
                        <div className="text-yellow-400 font-bold text-lg">+{challenge.reward}</div>
                        <div className="text-yellow-300 text-sm">punti</div>
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-white mb-2">{challenge.title}</h3>
                    <p className="text-gray-400 text-sm mb-4">{challenge.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Progresso</span>
                        <span className="text-white font-semibold">
                          {challenge.current}/{challenge.target}
                        </span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-1000 ${
                            challenge.completed
                              ? 'bg-gradient-to-r from-green-500 to-green-400'
                              : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                          }`}
                          style={{ 
                            width: animateProgress 
                              ? `${Math.min(100, (challenge.current / challenge.target) * 100)}%` 
                              : '0%' 
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Scadenza:</span>
                      <span className="text-gray-300">
                        {new Date(challenge.deadline).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                    
                    {challenge.completed && (
                      <div className="mt-3 flex items-center gap-2 text-green-400 text-sm">
                        <CheckCircle className="h-4 w-4" />
                        Completata!
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeView === 'insights' && (
          <div className="space-y-8">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <h2 className="text-2xl font-bold mb-6 text-purple-400 flex items-center gap-2">
                <Brain className="h-6 w-6" />
                AI Insights Personalizzati
              </h2>
              
              <div className="space-y-4">
                {aiInsights.map((insight) => (
                  <div 
                    key={insight.id}
                    className={`rounded-xl border p-4 transition-all duration-300 ${getInsightBgColor(insight.type)}`}
                  >
                    <div 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleInsightExpanded(insight.id)}
                    >
                      <div className="flex items-center gap-3">
                        {getInsightIcon(insight.type)}
                        <div>
                          <h3 className="font-bold text-white">{insight.title}</h3>
                          <p className="text-gray-300 text-sm">{insight.message}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          insight.priority === 'high' ? 'bg-red-600/30 text-red-300' :
                          insight.priority === 'medium' ? 'bg-yellow-600/30 text-yellow-300' :
                          'bg-gray-600/30 text-gray-300'
                        }`}>
                          {insight.priority}
                        </span>
                        {expandedInsights.has(insight.id) ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                    
                    {expandedInsights.has(insight.id) && (
                      <div className="mt-4 pt-4 border-t border-gray-600/30">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">
                            Generato: {new Date(insight.createdAt).toLocaleDateString('it-IT')}
                          </span>
                          {insight.actionable && (
                            <button className="bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 px-3 py-1 rounded-lg text-sm transition-colors">
                              Azione Suggerita
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                <h4 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Come funziona l'AI
                </h4>
                <p className="text-blue-200 text-sm">
                  Il nostro sistema AI analizza i tuoi pattern alimentari, progressi e obiettivi per generare 
                  insights personalizzati. Più usi l'app, più precise diventano le raccomandazioni.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
                      