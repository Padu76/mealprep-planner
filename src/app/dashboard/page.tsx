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

  // 🖼️ IMMAGINI CORRETTE E TESTATE
  const getFoodImage = (mealName: string, mealType: string) => {
    console.log('🖼️ Getting image for:', mealName, mealType);
    
    // Database immagini food con URL testati e funzionanti
    const foodImages: { [key: string]: string } = {
      // COLAZIONI
      'Power Breakfast Bowl': 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=300&fit=crop&q=80',
      'Pancakes Proteici': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&q=80',
      'Overnight Oats': 'https://images.unsplash.com/photo-1571197119842-7d67d6d82b75?w=400&h=300&fit=crop&q=80',
      'Smoothie Verde': 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&h=300&fit=crop&q=80',
      'Porridge Proteico': 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=300&fit=crop&q=80',
      
      // PRANZI
      'Chicken Power Bowl': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop&q=80',
      'Risotto Fitness': 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop&q=80',
      'Pollo Grigliato': 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=300&fit=crop&q=80',
      'Buddha Bowl': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&q=80',
      'Quinoa Bowl': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&q=80',
      
      // CENE
      'Lean Salmon Plate': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop&q=80',
      'Tagliata Fitness': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop&q=80',
      'Salmone alle Erbe': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop&q=80',
      'Orata al Forno': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop&q=80',
      'Tonno Grigliato': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop&q=80',
      
      // SPUNTINI
      'Energy Balls': 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&h=300&fit=crop&q=80',
      'Smoothie Proteico': 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&h=300&fit=crop&q=80',
      'Yogurt Bowl': 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=300&fit=crop&q=80'
    };

    // Cerca prima per nome esatto
    if (foodImages[mealName]) {
      console.log('✅ Found specific image for:', mealName);
      return foodImages[mealName];
    }

    // Cerca per parole chiave nel nome
    const name = mealName.toLowerCase();
    if (name.includes('bowl')) return foodImages['Buddha Bowl'];
    if (name.includes('pancakes') || name.includes('pancake')) return foodImages['Pancakes Proteici'];
    if (name.includes('salmone') || name.includes('salmon')) return foodImages['Salmone alle Erbe'];
    if (name.includes('pollo') || name.includes('chicken')) return foodImages['Pollo Grigliato'];
    if (name.includes('risotto')) return foodImages['Risotto Fitness'];
    if (name.includes('smoothie')) return foodImages['Smoothie Proteico'];
    if (name.includes('tagliata')) return foodImages['Tagliata Fitness'];
    if (name.includes('oats') || name.includes('avena')) return foodImages['Overnight Oats'];

    // Fallback per tipo pasto
    const typeImages: { [key: string]: string } = {
      'colazione': 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=300&fit=crop&q=80',
      'pranzo': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop&q=80',
      'cena': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop&q=80',
      'spuntino1': 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&h=300&fit=crop&q=80',
      'spuntino2': 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&h=300&fit=crop&q=80',
      'spuntino3': 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&h=300&fit=crop&q=80'
    };

    console.log('🔄 Using fallback image for type:', mealType);
    return typeImages[mealType] || 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop&q=80';
  };

  // 👨‍🍳 PREPARAZIONE SPECIFICA E DETTAGLIATA
  const generateStepByStep = (meal: any): string[] => {
    const { nome, ingredienti, preparazione } = meal;
    console.log('👨‍🍳 Generating steps for:', nome);
    
    // Se c'è già una preparazione dettagliata con steps numerati, usala
    if (preparazione && preparazione.length > 100 && (preparazione.includes('1.') || preparazione.includes('Step'))) {
      const steps = preparazione.split(/[.\n]/).filter((step: string) => step.trim().length > 15);
      if (steps.length >= 3) {
        return steps;
      }
    }

    // Database preparazioni specifiche per ricette comuni
    const specificRecipes: { [key: string]: string[] } = {
      'Power Breakfast Bowl': [
        'Metti 60g di avena in una ciotola e aggiungi 150ml di latte caldo',
        'Mescola 25g di proteine whey con un po\' di acqua fino a ottenere una crema',
        'Aggiungi le proteine all\'avena e mescola bene',
        'Lava 100g di frutti di bosco e asciugali delicatamente',
        'Trita grossolanamente 15g di mandorle',
        'Componi il bowl: avena sul fondo, frutti di bosco sopra, mandorle per completare'
      ],
      
      'Pancakes Proteici': [
        'In una ciotola, schiaccia 150g di ricotta con una forchetta fino a renderla cremosa',
        'Aggiungi 2 uova intere e sbatti energicamente con una frusta',
        'Incorpora 40g di farina di avena setacciata, mescola fino a eliminare i grumi',
        'Lascia riposare l\'impasto 5 minuti per far idratare la farina',
        'Scalda una padella antiaderente a fuoco medio-basso',
        'Versa piccole porzioni di impasto formando pancakes di 8-10cm',
        'Cuoci 2-3 minuti fino alle bollicine in superficie, poi gira',
        'Cuoci altri 2 minuti, servi caldi con 80g di mirtilli freschi sopra'
      ],
      
      'Chicken Power Bowl': [
        'Taglia 120g di petto di pollo a strisce spesse 1cm',
        'Marina il pollo con sale, pepe, paprica e un filo d\'olio per 15 minuti',
        'Sciacqua 80g di quinoa sotto acqua fredda fino a che l\'acqua è limpida',
        'Cuoci la quinoa in 160ml di brodo vegetale per 15 minuti',
        'Scalda una griglia o padella antiaderente a fuoco alto',
        'Griglia il pollo 3-4 minuti per lato fino a doratura completa',
        'Taglia le verdure miste a julienne e conditele con limone',
        'Taglia 1/2 avocado a fette sottili',
        'Componi il bowl: quinoa alla base, pollo al centro, verdure e avocado ai lati'
      ],
      
      'Risotto Fitness': [
        'Porta a bollore 400ml di brodo vegetale e tienilo caldo a fuoco basso',
        'Taglia 100g di petto di pollo a dadini di 1cm',
        'Lava e taglia 80g di zucchine a rondelle di 5mm',
        'In una padella larga, tosta 90g di riso integrale con un filo d\'olio per 2 minuti',
        'Aggiungi il brodo caldo un mestolo alla volta, mescolando sempre',
        'Dopo 10 minuti, aggiungi i dadini di pollo e continua a mescolare',
        'Negli ultimi 5 minuti, aggiungi le zucchine',
        'A cottura ultimata (25 minuti totali), manteca con 30g di parmigiano grattugiato',
        'Lascia riposare 2 minuti coperto, poi servi immediatamente'
      ],
      
      'Lean Salmon Plate': [
        'Preriscalda il forno a 200°C',
        'Condisci 130g di filetto di salmone con sale, pepe e erbe provenzali',
        'Avvolgi il salmone in carta forno con un filo d\'olio e mezzo limone a fette',
        'Inforna per 12-15 minuti (dipende dallo spessore del filetto)',
        'Nel frattempo, taglia 100g di broccoli a cimette uniformi',
        'Cuoci i broccoli al vapore per 8-10 minuti fino a tenerezza',
        'Pela e taglia 80g di patate dolci a cubetti',
        'Arrostisci le patate in forno con olio, sale e rosmarino per 20 minuti',
        'Componi il piatto: salmone al centro, broccoli e patate ai lati'
      ],
      
      'Tagliata Fitness': [
        'Porta 120g di tagliata di manzo a temperatura ambiente 30 minuti prima',
        'Prepara un mix di sale grosso, pepe nero e aglio in polvere',
        'Massaggia la carne con le spezie e un filo d\'olio EVO',
        'Scalda una griglia o padella a fuoco altissimo fino a che fuma',
        'Griglia la tagliata 2 minuti per lato per cottura al sangue (3 per media)',
        'Avvolgi la carne in alluminio e lasciala riposare 5 minuti',
        'Lava 80g di rucola e asciugala in centrifuga',
        'Taglia 60g di pomodorini a metà',
        'Affetta la tagliata contro fibra a fette spesse 5mm',
        'Componi: letto di rucola, tagliata sopra, pomodorini e 20g di grana a scaglie'
      ],
      
      'Salmone alle Erbe': [
        'Preriscalda il forno a 180°C',
        'Prepara un mix di prezzemolo, basilico, timo e aglio tritati finemente',
        'Condisci 130g di salmone con sale, pepe e il mix di erbe',
        'Disponi il salmone su carta forno con fettine di limone sopra',
        'Cuoci in forno per 15 minuti controllando con forchetta',
        'Accompagna con verdure di stagione saltate in padella'
      ]
    };

    // Cerca ricetta specifica nel database
    if (specificRecipes[nome]) {
      console.log('✅ Found specific recipe steps for:', nome);
      return specificRecipes[nome];
    }

    // Steps basati su tipo di ricetta (per nomi simili)
    const name = nome.toLowerCase();
    
    if (name.includes('bowl') || name.includes('buddha')) {
      return [
        'Prepara tutti gli ingredienti pesandoli secondo le dosi indicate',
        'Cuoci la proteina principale (pollo, tofu, legumi) con il metodo preferito',
        'Prepara i cereali (quinoa, riso, orzo) in acqua salata bollente',
        'Taglia le verdure crude a julienne o a dadini',
        'Se previste, sbollenta brevemente le verdure da cuocere',
        'Prepara la salsa o condimento mescolando gli ingredienti',
        'Componi il bowl sistemando ogni ingrediente in sezioni separate',
        'Aggiungi il condimento e servi immediatamente'
      ];
    }
    
    if (name.includes('smoothie') || name.includes('frullato')) {
      return [
        'Pela e taglia a pezzi la frutta fresca',
        'Se usi frutta congelata, lasciala scongelare 5 minuti',
        'Versa prima i liquidi (latte, acqua) nel frullatore',
        'Aggiungi la frutta e le proteine in polvere',
        'Frulla a velocità crescente per 60-90 secondi',
        'Controlla la consistenza e aggiungi liquidi se troppo denso',
        'Versa in un bicchiere alto e consuma subito'
      ];
    }
    
    if (name.includes('oats') || name.includes('avena')) {
      return [
        'In un barattolo di vetro, versa l\'avena e il liquido',
        'Aggiungi un pizzico di sale e dolcificante se gradito',
        'Mescola bene per evitare grumi',
        'Aggiungi semi, frutta secca o proteine in polvere',
        'Copri e lascia in frigorifero tutta la notte',
        'Al mattino, mescola e aggiungi frutta fresca',
        'Consuma freddo o scalda 1 minuto in microonde'
      ];
    }

    // Steps generici per pesce
    if (name.includes('salmone') || name.includes('tonno') || name.includes('orata')) {
      return [
        'Porta il pesce a temperatura ambiente 15 minuti prima della cottura',
        'Condisci con sale, pepe e aromi a scelta',
        'Scalda una padella antiaderente con un filo d\'olio',
        'Cuoci il pesce 3-4 minuti per lato (dipende dallo spessore)',
        'Controlla la cottura: deve sfaldarsi facilmente con una forchetta',
        'Accompagna con verdure di stagione e carboidrati complessi'
      ];
    }

    // Steps generici per carne
    if (name.includes('pollo') || name.includes('manzo') || name.includes('tacchino')) {
      return [
        'Porta la carne a temperatura ambiente 20 minuti prima',
        'Batti leggermente se è spessa per uniformare lo spessore',
        'Condisci con sale, pepe e spezie preferite',
        'Scalda bene la griglia o padella a fuoco medio-alto',
        'Cuoci senza muovere per i primi minuti per la doratura',
        'Gira una sola volta e termina la cottura',
        'Lascia riposare la carne 3-5 minuti prima di servire'
      ];
    }

    // Steps generici di fallback
    console.log('🔄 Using generic steps for:', nome);
    return [
      'Prepara tutti gli ingredienti seguendo le dosi indicate nella ricetta',
      'Pulisci e taglia le verdure secondo necessità',
      'Cuoci la proteina principale con il metodo più adatto',
      'Prepara eventuali carboidrati (riso, pasta, quinoa) secondo istruzioni',
      'Scalda una padella o preriscalda il forno se necessario',
      'Assembla tutti i componenti nel piatto seguendo l\'ordine suggerito',
      'Aggiungi condimenti finali e servi secondo preferenza'
    ];
  };

  // Carica piani salvati
  useEffect(() => {
    const loadSavedPlans = () => {
      try {
        const plans = JSON.parse(localStorage.getItem('mealPrepSavedPlans') || '[]');
        console.log('📋 Loaded plans:', plans.length);
        setSavedPlans(plans);
        setFilteredPlans(plans);
        
        // Seleziona automaticamente l'ultimo piano
        if (plans.length > 0) {
          setSelectedPlan(plans[0]);
          console.log('✅ Selected plan:', plans[0].nome);
        }
        
        // Calcola statistiche e achievements
        calculateUserStats(plans);
        calculateAchievements(plans);
        
        setLoading(false);
      } catch (error) {
        console.error('❌ Error loading plans:', error);
        setLoading(false);
      }
    };

    loadSavedPlans();
  }, []);

  // 🔧 FIX CLICK SU PIANI - FUNZIONE CORRETTA
  const handlePlanClick = (plan: SavedPlan) => {
    console.log('🖱️ Plan clicked:', plan.nome);
    setSelectedPlan(plan);
    
    // Scroll smooth to top per vedere il piano selezionato
    window.scrollTo({ 
      top: 0, 
      behavior: 'smooth' 
    });
  };

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
    
    // Calcola streak
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
    
    // Sistema punti
    const basePoints = plans.length * 20;
    const streakBonus = currentStreak * 10;
    const totalPoints = basePoints + streakBonus;
    const level = Math.floor(totalPoints / 200) + 1;

    setUserStats({
      totalPlans: plans.length,
      totalCalories,
      totalDays,
      currentStreak,
      longestStreak,
      monthlyPoints: plans.filter(p => new Date(p.createdAt) >= new Date(Date.now() - 30*24*60*60*1000)).length * 20,
      totalPoints,
      level,
      preferredObjective,
      avgCaloriesPerDay,
      varietyScore: Math.min(100, plans.length * 5)
    });
  };

  // Sistema achievements
  const calculateAchievements = (plans: SavedPlan[]) => {
    const stats = userStats || {} as UserStats;
    const uniqueObjectives = new Set(plans.map(p => p.obiettivo)).size;

    const achievements: Achievement[] = [
      { id: 'plan-1', title: '🌟 Primo Piano', description: 'Genera il tuo primo piano meal prep', icon: '🎯', points: 20, unlocked: plans.length >= 1, category: 'Piani' },
      { id: 'plan-5', title: '🔥 Enthusiast', description: 'Genera 5 piani meal prep', icon: '💪', points: 100, unlocked: plans.length >= 5, category: 'Piani' },
      { id: 'plan-15', title: '🏆 Expert', description: 'Genera 15 piani meal prep', icon: '👑', points: 300, unlocked: plans.length >= 15, category: 'Piani' },
      { id: 'streak-3', title: '📅 Costante', description: 'Mantieni streak di 3 settimane', icon: '⚡', points: 60, unlocked: (stats.currentStreak || 0) >= 3, category: 'Streak' },
      { id: 'variety-25', title: '🌈 Esploratore', description: 'Usa 25+ ingredienti diversi', icon: '🧭', points: 50, unlocked: plans.length >= 10, category: 'Varietà' },
      { id: 'multi-goal', title: '🎭 Versatile', description: 'Prova tutti gli obiettivi fitness', icon: '🎨', points: 120, unlocked: uniqueObjectives >= 3, category: 'Obiettivi' },
      { id: 'level-3', title: '⭐ Rising', description: 'Raggiungi il livello 3', icon: '🌟', points: 100, unlocked: (stats.level || 1) >= 3, category: 'Livelli' },
      { id: 'level-10', title: '👑 Legend', description: 'Raggiungi il livello 10', icon: '🏆', points: 500, unlocked: (stats.level || 1) >= 10, category: 'Livelli' }
    ];

    setAchievements(achievements);
  };

  // Genera PDF completo
  const generatePDF = (plan: SavedPlan) => {
    const shoppingList = generateShoppingList(plan);
    
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
              ${Object.entries(day.meals).map(([mealType, meal]: [string, any]) => {
                const steps = generateStepByStep(meal);
                return `
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
                    <strong>👨‍🍳 Preparazione:</strong><br>
                    ${steps.map((step, idx) => `${idx + 1}. ${step.trim()}`).join('<br>')}
                  </div>
                  <div style="margin-top: 5px; font-size: 10px; color: #6B7280;">
                    ⏱️ ${meal.tempo || '15 min'} • 🍽️ ${meal.porzioni || 1} porzione • ⭐ ${meal.rating || 4.5}/5
                  </div>
                </div>
              `;}).join('')}
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
    
    const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      printWindow.onload = function() {
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
        }, 250);
      };
    } else {
      alert('⚠️ Popup bloccato! Abilita i popup per generare il PDF.');
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
        lower.includes('cottage') || lower.includes('latte') || lower.includes('grana')) {
      return '🥚 Uova e Latticini';
    }
    
    if (lower.includes('spinaci') || lower.includes('broccoli') || lower.includes('zucchine') || 
        lower.includes('pomodori') || lower.includes('banana') || lower.includes('mela') || 
        lower.includes('frutti') || lower.includes('verdure') || lower.includes('rucola') ||
        lower.includes('mirtilli') || lower.includes('pomodorini')) {
      return '🍎 Frutta e Verdura';
    }
    
    if (lower.includes('pollo') || lower.includes('manzo') || lower.includes('tacchino') ||
        lower.includes('salmone') || lower.includes('tonno') || lower.includes('merluzzo') || 
        lower.includes('orata') || lower.includes('tagliata')) {
      return '🥩 Carne e Pesce';
    }
    
    if (lower.includes('avena') || lower.includes('riso') || lower.includes('quinoa') || 
        lower.includes('pasta') || lower.includes('pane') || lower.includes('legumi') ||
        lower.includes('ceci') || lower.includes('fagioli') || lower.includes('farina')) {
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
    console.log('🗑️ Deleting plan:', planId);
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
        {/* Gamification Section - COMPATTO */}
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

            <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mb-4">
              {achievements.slice(0, 8).map((achievement) => (
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

        {/* Piano Selezionato - LAYOUT PDF-STYLE COMPLETO */}
        {selectedPlan && (
          <div className="mb-8 bg-gray-800 rounded-xl p-6 border border-gray-700">
            {/* Header Piano */}
            <div className="text-center mb-6 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
              <h2 className="text-3xl font-bold mb-2">🏋️‍♂️ Piano Meal Prep Personalizzato</h2>
              <p className="text-lg">Generato per {selectedPlan.nome} • {selectedPlan.createdAt}</p>
              
              {/* Stats come nel PDF */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-2xl font-bold">{selectedPlan.durata}</div>
                  <div className="text-sm">Giorni</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-2xl font-bold">{selectedPlan.pasti}</div>
                  <div className="text-sm">Pasti/Giorno</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-2xl font-bold">{selectedPlan.calorie}</div>
                  <div className="text-sm">Kcal/Giorno</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-2xl font-bold">{selectedPlan.obiettivo}</div>
                  <div className="text-sm">Obiettivo</div>
                </div>
              </div>
            </div>

            {/* Piano Alimentare Dettagliato - TUTTO VISIBILE */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-6 text-green-400">📋 Piano Alimentare Dettagliato</h3>
              
              <div className="space-y-8">
                {selectedPlan.days.map((day: any, dayIndex: number) => (
                  <div key={dayIndex} className="bg-gray-700 rounded-lg p-6 border border-gray-600">
                    <h4 className="text-xl font-bold mb-6 text-yellow-400">
                      {day.day} - {Math.round(Object.values(day.meals).reduce((sum: number, meal: any) => sum + (meal?.calorie || 0), 0))} kcal totali
                    </h4>
                    
                    {/* Pasti del giorno - LAYOUT ESTESO */}
                    <div className="space-y-6">
                      {Object.entries(day.meals).map(([mealType, meal]: [string, any]) => {
                        const steps = generateStepByStep(meal);
                        return (
                          <div key={mealType} className="bg-gray-600 rounded-lg overflow-hidden">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                              {/* Colonna 1: Foto + Info Base */}
                              <div className="relative">
                                <img
                                  src={getFoodImage(meal.nome, mealType)}
                                  alt={meal.nome}
                                  className="w-full h-48 lg:h-full object-cover"
                                  onError={(e) => {
                                    console.log('❌ Image failed, using fallback for:', meal.nome);
                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop&q=80';
                                  }}
                                />
                                <div className="absolute top-2 left-2 bg-black/70 px-2 py-1 rounded text-white text-sm font-bold">
                                  {mealType.toUpperCase()}
                                </div>
                                <div className="absolute bottom-2 right-2 bg-green-600 px-2 py-1 rounded text-white text-sm font-bold">
                                  {meal.calorie} kcal | {meal.proteine}g P
                                </div>
                              </div>
                              
                              {/* Colonna 2: Ingredienti + Macros */}
                              <div className="p-4">
                                <h5 className="text-lg font-bold mb-3 text-green-400">{meal.nome}</h5>
                                
                                {/* Macros */}
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                  <div className="bg-blue-600/20 border border-blue-500 rounded p-2 text-center">
                                    <div className="font-bold text-blue-400">{meal.proteine}g</div>
                                    <div className="text-xs">Proteine</div>
                                  </div>
                                  <div className="bg-purple-600/20 border border-purple-500 rounded p-2 text-center">
                                    <div className="font-bold text-purple-400">{meal.carboidrati}g</div>
                                    <div className="text-xs">Carb</div>
                                  </div>
                                  <div className="bg-yellow-600/20 border border-yellow-500 rounded p-2 text-center">
                                    <div className="font-bold text-yellow-400">{meal.grassi}g</div>
                                    <div className="text-xs">Grassi</div>
                                  </div>
                                </div>

                                {/* Ingredienti */}
                                <div>
                                  <h6 className="font-bold mb-2 text-orange-400">🛒 Ingredienti:</h6>
                                  <ul className="space-y-1 text-sm">
                                    {meal.ingredienti?.map((ingredient: string, idx: number) => (
                                      <li key={idx} className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                        <span>{ingredient}</span>
                                      </li>
                                    )) || <li>Non specificati</li>}
                                  </ul>
                                </div>

                                {/* Info aggiuntive */}
                                <div className="mt-4 flex justify-between text-xs text-gray-400">
                                  <span>⏱️ {meal.tempo || '15 min'}</span>
                                  <span>🍽️ {meal.porzioni || 1} porzione</span>
                                  <span>⭐ {meal.rating || 4.5}/5</span>
                                </div>
                              </div>
                              
                              {/* Colonna 3: Preparazione Step-by-Step SPECIFICA */}
                              <div className="p-4 bg-blue-900/20 border-l border-blue-700">
                                <h6 className="font-bold mb-3 text-blue-400">👨‍🍳 Preparazione Step-by-Step:</h6>
                                <div className="space-y-3">
                                  {steps.map((step, idx) => (
                                    <div key={idx} className="flex gap-3">
                                      <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                                        {idx + 1}
                                      </span>
                                      <p className="text-sm text-gray-300 leading-relaxed">{step.trim()}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lista Spesa + Azioni */}
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-green-400">🛒 Lista della Spesa Completa</h3>
              
              {/* Lista Spesa Categorizzata */}
              {(() => {
                const shoppingList = generateShoppingList(selectedPlan);
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {Object.entries(shoppingList).map(([category, items]) => (
                      <div key={category} className="bg-gray-600 rounded-lg p-4">
                        <h4 className="font-bold text-lg mb-3">{category}</h4>
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
              
              {/* Azioni */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    const shoppingList = generateShoppingList(selectedPlan);
                    const text = Object.entries(shoppingList)
                      .map(([category, items]) => `${category}:\n${items.map(item => `- ${item}`).join('\n')}`)
                      .join('\n\n');
                    navigator.clipboard.writeText(text);
                    alert('Lista spesa copiata!');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm"
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
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm"
                >
                  📱 WhatsApp
                </button>
                <button
                  onClick={() => generatePDF(selectedPlan)}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm"
                >
                  📄 PDF Completo
                </button>
                <button
                  onClick={() => {
                    const planText = `Piano Meal Prep: ${selectedPlan.nome}\n${selectedPlan.generatedPlan}`;
                    navigator.clipboard.writeText(planText);
                    alert('Piano copiato!');
                  }}
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm"
                >
                  📝 Copia Piano
                </button>
              </div>
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

        {/* Altri Piani - LAYOUT COMPATTO CON CLICK FUNZIONANTE */}
        {filteredPlans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-400 mb-4">Nessun piano trovato</p>
            <Link href="/" className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg transition-colors">
              Crea Piano Fitness
            </Link>
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-bold mb-4 text-green-400">📋 Altri Piani Salvati</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {filteredPlans.slice(1).map((plan) => (
                <div 
                  key={plan.id} 
                  className={`bg-gray-800 rounded-lg p-3 border transition-all cursor-pointer hover:scale-105 ${
                    selectedPlan?.id === plan.id ? 'border-green-500 ring-2 ring-green-500/50' : 'border-gray-700 hover:border-green-500'
                  }`}
                  onClick={() => handlePlanClick(plan)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-bold text-green-400 text-sm truncate" title={plan.nome}>{plan.nome}</h4>
                      <p className="text-gray-400 text-xs">{plan.createdAt}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Sei sicuro di voler eliminare il piano "${plan.nome}"?`)) {
                          deletePlan(plan.id);
                        }
                      }}
                      className="bg-red-600 hover:bg-red-700 p-1 rounded text-xs transition-colors ml-2"
                      title="Elimina Piano"
                    >
                      🗑️
                    </button>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Obiettivo:</span>
                      <span className="font-medium text-xs text-right">{plan.obiettivo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Durata:</span>
                      <span className="text-xs">{plan.durata} giorni</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Calorie:</span>
                      <span className="text-green-400 font-medium text-xs">{plan.calorie} kcal</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Pasti:</span>
                      <span className="text-xs">{plan.pasti}/giorno</span>
                    </div>
                  </div>

                  {/* Indicatore visivo per piano selezionato */}
                  {selectedPlan?.id === plan.id && (
                    <div className="mt-2 text-center">
                      <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                        ✅ Piano Attivo
                      </span>
                    </div>
                  )}

                  {/* Preview mini del piano */}
                  <div className="mt-2 text-xs text-gray-500">
                    <span>👆 Clicca per visualizzare</span>
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