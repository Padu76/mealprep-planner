'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Clock, Users, Star, ChefHat, Search, X, Eye, Filter, Zap, Target, Activity, TrendingUp, Dumbbell, Flame, Droplets, Apple, Coffee, Utensils, Beef, Fish, Wheat, Salad, Sparkles, Settings, Plus } from 'lucide-react';

interface Recipe {
  id: string;
  nome: string;
  categoria: 'colazione' | 'pranzo' | 'cena' | 'spuntino' | 'pre_workout' | 'post_workout';
  tipoDieta: string[];
  difficolta: 'facile' | 'medio' | 'difficile';
  tempoPreparazione: number;
  porzioni: number;
  calorie: number;
  proteine: number;
  carboidrati: number;
  grassi: number;
  ingredienti: string[];
  preparazione: string;
  obiettivo_fitness: string[];
  macro_focus: 'high_protein' | 'low_carb' | 'balanced' | 'high_fat';
  fonte: 'database' | 'ai_generated';
  tags: string[];
  rating: number;
  reviewCount: number;
  createdAt: string;
}

interface AIRecipeFilters {
  categoria: string;
  obiettivo_fitness: string;
  tipo_dieta: string;
  tempo_max: string;
  calorie_target: string;
  macro_focus: string;
  difficolta: string;
  ingredienti_base: string;
  allergie: string;
  stile_cucina: string;
  stagione: string;
  numero_ricette: number;
}

const DIET_TYPES = [
  { value: 'paleo', label: 'Paleo' },
  { value: 'keto', label: 'Chetogenica' },
  { value: 'lowcarb', label: 'Low Carb' },
  { value: 'vegetariana', label: 'Vegetariana' },
  { value: 'vegana', label: 'Vegana' },
  { value: 'mediterranea', label: 'Mediterranea' },
  { value: 'high_protein', label: 'High Protein' },
  { value: 'balanced', label: 'Bilanciata' },
];

const FITNESS_OBJECTIVES = [
  { value: 'cutting', label: 'Cutting/Definizione', icon: TrendingUp },
  { value: 'bulking', label: 'Bulking/Massa', icon: Dumbbell },
  { value: 'maintenance', label: 'Mantenimento', icon: Target },
  { value: 'endurance', label: 'Resistenza', icon: Activity },
  { value: 'strength', label: 'Forza', icon: Zap },
];

const MEAL_CATEGORIES = [
  { value: 'colazione', label: 'Colazione', icon: Coffee },
  { value: 'pre_workout', label: 'Pre-Workout', icon: Zap },
  { value: 'post_workout', label: 'Post-Workout', icon: Dumbbell },
  { value: 'pranzo', label: 'Pranzo', icon: Utensils },
  { value: 'cena', label: 'Cena', icon: Utensils },
  { value: 'spuntino', label: 'Spuntino', icon: Apple },
];

const CUISINE_STYLES = [
  { value: 'italiana', label: 'Italiana' },
  { value: 'mediterranea', label: 'Mediterranea' },
  { value: 'asiatica', label: 'Asiatica' },
  { value: 'americana', label: 'Americana' },
  { value: 'messicana', label: 'Messicana' },
  { value: 'indiana', label: 'Indiana' },
  { value: 'fusion', label: 'Fusion' },
];

export default function RicettePage() {
  // Stati principali
  const [signatureRecipes, setSignatureRecipes] = useState<Recipe[]>([]);
  const [aiGeneratedRecipes, setAiGeneratedRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Stati interfaccia
  const [activeSection, setActiveSection] = useState<'signature' | 'ai_generated'>('signature');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Stati modal
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showAiFiltersModal, setShowAiFiltersModal] = useState(false);

  // Stati filtri AI
  const [aiFilters, setAiFilters] = useState<AIRecipeFilters>({
    categoria: 'pranzo',
    obiettivo_fitness: 'maintenance',
    tipo_dieta: 'balanced',
    tempo_max: '30',
    calorie_target: '400-600',
    macro_focus: 'balanced',
    difficolta: 'medio',
    ingredienti_base: '',
    allergie: '',
    stile_cucina: 'mediterranea',
    stagione: 'tutto_anno',
    numero_ricette: 6
  });

  // Caricamento ricette signature (5 per categoria)
  useEffect(() => {
    loadSignatureRecipes();
    loadAiGeneratedRecipes();
    loadFavorites();
  }, []);

  const loadSignatureRecipes = () => {
    const signatures: Recipe[] = [
      // COLAZIONI SIGNATURE (5)
      {
        id: 'sig_col_001', nome: 'Pancakes Proteici Avena e Banana', categoria: 'colazione', tipoDieta: ['high_protein', 'balanced'],
        difficolta: 'medio', tempoPreparazione: 15, porzioni: 1, calorie: 485, proteine: 32, carboidrati: 48, grassi: 16,
        ingredienti: ['60g fiocchi avena', '30g proteine whey vaniglia', '1 banana matura', '2 uova', '150ml latte scremato'],
        preparazione: 'Frulla avena fino a farina. Aggiungi proteine, banana schiacciata e uova. Incorpora latte. Cuoci piccoli pancakes in padella antiaderente 2-3 min per lato.',
        obiettivo_fitness: ['bulking', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['pancakes', 'proteici', 'colazione'], rating: 4.8, reviewCount: 267, createdAt: new Date().toISOString()
      },
      {
        id: 'sig_col_002', nome: 'Overnight Oats Burro di Mandorle', categoria: 'colazione', tipoDieta: ['vegetariana', 'balanced'],
        difficolta: 'facile', tempoPreparazione: 5, porzioni: 1, calorie: 425, proteine: 18, carboidrati: 38, grassi: 22,
        ingredienti: ['50g fiocchi avena', '200ml latte mandorla', '2 cucchiai burro mandorle', 'frutti di bosco'],
        preparazione: 'Mescola avena, latte e burro di mandorle in barattolo. Riponi in frigo overnight. Al mattino aggiungi frutti di bosco.',
        obiettivo_fitness: ['maintenance', 'endurance'], macro_focus: 'balanced', fonte: 'database',
        tags: ['overnight_oats', 'prep_ahead'], rating: 4.6, reviewCount: 189, createdAt: new Date().toISOString()
      },
      {
        id: 'sig_col_003', nome: 'Uova Strapazzate Spinaci e Feta', categoria: 'colazione', tipoDieta: ['keto', 'low_carb'],
        difficolta: 'facile', tempoPreparazione: 8, porzioni: 1, calorie: 385, proteine: 28, carboidrati: 6, grassi: 28,
        ingredienti: ['3 uova grandi', '100g spinaci baby', '40g feta', 'olio oliva', 'pomodorini'],
        preparazione: 'Soffriggi aglio in olio. Aggiungi spinaci 2 min. Sbatti uova e versa. Mescola delicatamente, aggiungi feta.',
        obiettivo_fitness: ['cutting', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['uova', 'keto', 'veloce'], rating: 4.7, reviewCount: 145, createdAt: new Date().toISOString()
      },
      {
        id: 'sig_col_004', nome: 'Smoothie Bowl Acai Power', categoria: 'colazione', tipoDieta: ['vegana', 'high_protein'],
        difficolta: 'medio', tempoPreparazione: 10, porzioni: 1, calorie: 445, proteine: 22, carboidrati: 52, grassi: 16,
        ingredienti: ['100g acai congelato', '20g proteine vegetali', '1/2 banana', 'granola', 'semi chia'],
        preparazione: 'Frulla acai, proteine e banana con pochissimo liquido. Versa in bowl. Disponi toppings artisticamente.',
        obiettivo_fitness: ['cutting', 'endurance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['acai_bowl', 'antiossidanti'], rating: 4.8, reviewCount: 234, createdAt: new Date().toISOString()
      },
      {
        id: 'sig_col_005', nome: 'Yogurt Greco Bowl Frutti Rossi', categoria: 'colazione', tipoDieta: ['vegetariana', 'high_protein'],
        difficolta: 'facile', tempoPreparazione: 5, porzioni: 1, calorie: 325, proteine: 28, carboidrati: 25, grassi: 8,
        ingredienti: ['200g yogurt greco 0%', 'frutti di bosco misti', 'muesli', 'miele', 'mandorle'],
        preparazione: 'Versa yogurt in bowl. Disponi frutti di bosco, muesli e mandorle. Completa con miele.',
        obiettivo_fitness: ['cutting', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['yogurt_greco', 'veloce'], rating: 4.4, reviewCount: 198, createdAt: new Date().toISOString()
      },

      // PRANZI SIGNATURE (5)
      {
        id: 'sig_pra_001', nome: 'Pollo Grigliato Quinoa e Verdure', categoria: 'pranzo', tipoDieta: ['high_protein', 'balanced'],
        difficolta: 'medio', tempoPreparazione: 25, porzioni: 1, calorie: 485, proteine: 38, carboidrati: 45, grassi: 12,
        ingredienti: ['150g petto di pollo', '80g quinoa', '100g broccoli', '50g carote', 'spezie miste'],
        preparazione: 'Marina pollo con spezie. Cuoci quinoa in brodo. Griglia pollo. Cuoci verdure al vapore. Componi piatto.',
        obiettivo_fitness: ['bulking', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['pollo', 'quinoa', 'complete'], rating: 4.7, reviewCount: 256, createdAt: new Date().toISOString()
      },
      {
        id: 'sig_pra_002', nome: 'Buddha Bowl Vegetariano', categoria: 'pranzo', tipoDieta: ['vegetariana', 'balanced'],
        difficolta: 'medio', tempoPreparazione: 35, porzioni: 1, calorie: 465, proteine: 18, carboidrati: 58, grassi: 16,
        ingredienti: ['80g ceci cotti', '60g quinoa', 'avocado', 'carote', 'hummus', 'semi girasole'],
        preparazione: 'Cuoci quinoa. Prepara hummus. Taglia verdure a julienne. Componi bowl con tutti ingredienti.',
        obiettivo_fitness: ['maintenance', 'endurance'], macro_focus: 'balanced', fonte: 'database',
        tags: ['buddha_bowl', 'vegetariano'], rating: 4.6, reviewCount: 167, createdAt: new Date().toISOString()
      },
      {
        id: 'sig_pra_003', nome: 'Salmone Teriyaki Riso Venere', categoria: 'pranzo', tipoDieta: ['high_protein', 'mediterranea'],
        difficolta: 'medio', tempoPreparazione: 30, porzioni: 1, calorie: 525, proteine: 35, carboidrati: 48, grassi: 18,
        ingredienti: ['150g filetto salmone', '70g riso venere', 'salsa teriyaki', 'edamame', 'sesamo'],
        preparazione: 'Cuoci riso venere. Marina salmone in teriyaki. Cuoci salmone in padella. Servi con riso ed edamame.',
        obiettivo_fitness: ['bulking', 'endurance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['salmone', 'omega3'], rating: 4.9, reviewCount: 189, createdAt: new Date().toISOString()
      },
      {
        id: 'sig_pra_004', nome: 'Poke Bowl Salmone Avocado', categoria: 'pranzo', tipoDieta: ['high_protein', 'balanced'],
        difficolta: 'medio', tempoPreparazione: 15, porzioni: 1, calorie: 525, proteine: 32, carboidrati: 48, grassi: 22,
        ingredienti: ['120g salmone crudo', '80g riso sushi', 'avocado', 'edamame', 'salsa soia', 'sesamo'],
        preparazione: 'Cuoci riso sushi. Taglia salmone a cubetti. Componi poke bowl stratificando ingredienti.',
        obiettivo_fitness: ['cutting', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['poke', 'raw_fish'], rating: 4.8, reviewCount: 267, createdAt: new Date().toISOString()
      },
      {
        id: 'sig_pra_005', nome: 'Wrap Proteico Tacchino', categoria: 'pranzo', tipoDieta: ['high_protein', 'balanced'],
        difficolta: 'facile', tempoPreparazione: 8, porzioni: 1, calorie: 385, proteine: 28, carboidrati: 32, grassi: 14,
        ingredienti: ['1 tortilla integrale', '100g fesa tacchino', 'hummus', 'lattuga', 'pomodori'],
        preparazione: 'Spalma hummus sulla tortilla. Disponi tacchino e verdure. Arrotola stretto.',
        obiettivo_fitness: ['cutting', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['wrap', 'portable'], rating: 4.5, reviewCount: 189, createdAt: new Date().toISOString()
      },

      // CENE SIGNATURE (5)
      {
        id: 'sig_cen_001', nome: 'Orata al Sale Verdure Grigliate', categoria: 'cena', tipoDieta: ['mediterranea', 'paleo'],
        difficolta: 'difficile', tempoPreparazione: 45, porzioni: 2, calorie: 385, proteine: 32, carboidrati: 18, grassi: 18,
        ingredienti: ['1 orata 400g', 'sale grosso', 'zucchine', 'melanzane', 'olio oliva'],
        preparazione: 'Pulisci orata. Crea letto di sale, cuoci 30 min a 200°C. Griglia verdure.',
        obiettivo_fitness: ['cutting', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['pesce', 'gourmet'], rating: 4.9, reviewCount: 156, createdAt: new Date().toISOString()
      },
      {
        id: 'sig_cen_002', nome: 'Pollo Ripieno Spinaci', categoria: 'cena', tipoDieta: ['keto', 'high_protein'],
        difficolta: 'medio', tempoPreparazione: 25, porzioni: 1, calorie: 425, proteine: 38, carboidrati: 6, grassi: 26,
        ingredienti: ['150g petto pollo', '100g spinaci', '50g ricotta', 'parmigiano', 'spezie'],
        preparazione: 'Apri pollo a libro. Farcisci con spinaci e ricotta. Cuoci 20 min a 180°C.',
        obiettivo_fitness: ['cutting', 'strength'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['pollo_ripieno', 'keto'], rating: 4.7, reviewCount: 189, createdAt: new Date().toISOString()
      },
      {
        id: 'sig_cen_003', nome: 'Salmone Crosta Pistacchi', categoria: 'cena', tipoDieta: ['keto', 'high_protein'],
        difficolta: 'medio', tempoPreparazione: 20, porzioni: 1, calorie: 485, proteine: 32, carboidrati: 8, grassi: 34,
        ingredienti: ['150g salmone', '30g pistacchi', 'senape', 'erbe aromatiche', 'limone'],
        preparazione: 'Spalma senape su salmone. Pressa crosta pistacchi. Cuoci 12 min a 200°C.',
        obiettivo_fitness: ['cutting', 'maintenance'], macro_focus: 'high_fat', fonte: 'database',
        tags: ['salmone', 'pistacchi'], rating: 4.8, reviewCount: 234, createdAt: new Date().toISOString()
      },
      {
        id: 'sig_cen_004', nome: 'Tagliata Manzo Rucola', categoria: 'cena', tipoDieta: ['paleo', 'high_protein'],
        difficolta: 'medio', tempoPreparazione: 15, porzioni: 1, calorie: 445, proteine: 38, carboidrati: 6, grassi: 28,
        ingredienti: ['150g tagliata manzo', 'rucola', 'parmigiano', 'olio oliva', 'aceto balsamico'],
        preparazione: 'Cuoci tagliata 2-3 min per lato. Taglia a fette. Servi su rucola con condimenti.',
        obiettivo_fitness: ['bulking', 'strength'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['tagliata', 'beef'], rating: 4.7, reviewCount: 198, createdAt: new Date().toISOString()
      },
      {
        id: 'sig_cen_005', nome: 'Frittata Forno Broccoli', categoria: 'cena', tipoDieta: ['keto', 'vegetariana'],
        difficolta: 'facile', tempoPreparazione: 20, porzioni: 4, calorie: 245, proteine: 18, carboidrati: 8, grassi: 16,
        ingredienti: ['6 uova', '200g broccoli', '80g formaggio', 'cipolla', 'erbe'],
        preparazione: 'Sbollenta broccoli. Sbatti uova con formaggio. Mescola tutto, cuoci 15 min a 180°C.',
        obiettivo_fitness: ['cutting', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['frittata', 'meal_prep'], rating: 4.4, reviewCount: 156, createdAt: new Date().toISOString()
      },

      // SPUNTINI SIGNATURE (5)
      {
        id: 'sig_spu_001', nome: 'Energy Balls Cocco Lime', categoria: 'spuntino', tipoDieta: ['vegana', 'paleo'],
        difficolta: 'medio', tempoPreparazione: 15, porzioni: 8, calorie: 95, proteine: 3, carboidrati: 12, grassi: 4,
        ingredienti: ['100g datteri', '30g cocco rapè', '20g mandorle', 'lime', 'olio cocco'],
        preparazione: 'Frulla datteri con cocco, mandorle e lime. Forma palline, refrigera 30 min.',
        obiettivo_fitness: ['endurance', 'maintenance'], macro_focus: 'balanced', fonte: 'database',
        tags: ['energy_balls', 'portable'], rating: 4.7, reviewCount: 167, createdAt: new Date().toISOString()
      },
      {
        id: 'sig_spu_002', nome: 'Hummus Bastoncini Verdure', categoria: 'spuntino', tipoDieta: ['vegana', 'low_carb'],
        difficolta: 'facile', tempoPreparazione: 10, porzioni: 1, calorie: 185, proteine: 8, carboidrati: 18, grassi: 8,
        ingredienti: ['100g ceci', 'tahini', 'limone', 'carote', 'sedano', 'peperoni'],
        preparazione: 'Frulla ceci con tahini e limone. Taglia verdure a bastoncini. Servi insieme.',
        obiettivo_fitness: ['cutting', 'maintenance'], macro_focus: 'low_carb', fonte: 'database',
        tags: ['hummus', 'raw_veggies'], rating: 4.3, reviewCount: 145, createdAt: new Date().toISOString()
      },
      {
        id: 'sig_spu_003', nome: 'Yogurt Noci Miele', categoria: 'spuntino', tipoDieta: ['vegetariana', 'high_protein'],
        difficolta: 'facile', tempoPreparazione: 2, porzioni: 1, calorie: 265, proteine: 18, carboidrati: 12, grassi: 16,
        ingredienti: ['150g yogurt greco', '30g noci', 'miele', 'cannella'],
        preparazione: 'Versa yogurt in coppetta. Aggiungi noci, miele e cannella.',
        obiettivo_fitness: ['cutting', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['yogurt_greco', 'nuts'], rating: 4.5, reviewCount: 198, createdAt: new Date().toISOString()
      },
      {
        id: 'sig_spu_004', nome: 'Apple Slices Burro Mandorle', categoria: 'spuntino', tipoDieta: ['paleo', 'balanced'],
        difficolta: 'facile', tempoPreparazione: 3, porzioni: 1, calorie: 245, proteine: 6, carboidrati: 22, grassi: 16,
        ingredienti: ['1 mela', '2 cucchiai burro mandorle', 'cannella', 'miele'],
        preparazione: 'Taglia mela a spicchi. Servi con burro mandorle, cannella e miele.',
        obiettivo_fitness: ['maintenance', 'endurance'], macro_focus: 'balanced', fonte: 'database',
        tags: ['apple', 'almond_butter'], rating: 4.6, reviewCount: 189, createdAt: new Date().toISOString()
      },
      {
        id: 'sig_spu_005', nome: 'Protein Bites Cioccolato', categoria: 'spuntino', tipoDieta: ['vegetariana', 'high_protein'],
        difficolta: 'medio', tempoPreparazione: 10, porzioni: 6, calorie: 125, proteine: 8, carboidrati: 10, grassi: 6,
        ingredienti: ['25g proteine whey', 'burro arachidi', 'avena', 'miele', 'chocolate chips'],
        preparazione: 'Mescola proteine, burro arachidi e miele. Incorpora avena e chips. Forma palline.',
        obiettivo_fitness: ['bulking', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['protein_bites', 'chocolate'], rating: 4.8, reviewCount: 156, createdAt: new Date().toISOString()
      },

      // PRE/POST WORKOUT (5)
      {
        id: 'sig_pre_001', nome: 'Banana Toast Mandorle', categoria: 'pre_workout', tipoDieta: ['balanced', 'vegetariana'],
        difficolta: 'facile', tempoPreparazione: 5, porzioni: 1, calorie: 285, proteine: 8, carboidrati: 38, grassi: 12,
        ingredienti: ['1 fetta pane integrale', '1 banana', 'burro mandorle', 'miele', 'cannella'],
        preparazione: 'Tosta pane. Spalma burro mandorle. Aggiungi banana, miele e cannella.',
        obiettivo_fitness: ['endurance', 'maintenance'], macro_focus: 'balanced', fonte: 'database',
        tags: ['pre_workout', 'quick_energy'], rating: 4.6, reviewCount: 189, createdAt: new Date().toISOString()
      },
      {
        id: 'sig_pos_001', nome: 'Smoothie Recovery Proteico', categoria: 'post_workout', tipoDieta: ['vegetariana', 'high_protein'],
        difficolta: 'facile', tempoPreparazione: 5, porzioni: 1, calorie: 385, proteine: 35, carboidrati: 28, grassi: 12,
        ingredienti: ['30g proteine whey', '1 banana', '250ml latte scremato', 'burro mandorle', 'spinaci'],
        preparazione: 'Frulla tutti ingredienti 60 secondi. Consuma entro 30 min dal workout.',
        obiettivo_fitness: ['bulking', 'strength'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['post_workout', 'recovery'], rating: 4.9, reviewCount: 267, createdAt: new Date().toISOString()
      }
    ];

    setSignatureRecipes(signatures);
    setFilteredRecipes(signatures);
    setLoading(false);
  };

  const loadAiGeneratedRecipes = async () => {
    try {
      const response = await fetch('/api/airtable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'read',
          table: 'recipes_ai'
        })
      });

      if (!response.ok) return;

      const result = await response.json();
      if (result.success && result.records) {
        const aiRecipes = result.records.map((record: any) => ({
          id: record.id,
          nome: record.fields.nome || '',
          categoria: record.fields.categoria || 'pranzo',
          tipoDieta: record.fields.tipoDieta || [],
          difficolta: record.fields.difficolta || 'medio',
          tempoPreparazione: record.fields.tempoPreparazione || 30,
          porzioni: record.fields.porzioni || 1,
          calorie: record.fields.calorie || 0,
          proteine: record.fields.proteine || 0,
          carboidrati: record.fields.carboidrati || 0,
          grassi: record.fields.grassi || 0,
          ingredienti: record.fields.ingredienti || [],
          preparazione: record.fields.preparazione || '',
          obiettivo_fitness: record.fields.obiettivo_fitness || [],
          macro_focus: record.fields.macro_focus || 'balanced',
          fonte: 'ai_generated',
          tags: record.fields.tags || [],
          rating: record.fields.rating || 4.5,
          reviewCount: record.fields.reviewCount || 1,
          createdAt: record.fields.createdAt || new Date().toISOString()
        }));
        setAiGeneratedRecipes(aiRecipes);
      }
    } catch (error) {
      console.error('Error loading AI recipes:', error);
    }
  };

  const loadFavorites = async () => {
    try {
      const response = await fetch('/api/airtable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'read',
          table: 'user_favorites'
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.records) {
          const favoriteIds = result.records.map((record: any) => record.fields.recipeId);
          setFavoriteRecipes(new Set(favoriteIds));
        }
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  // Filtri
  useEffect(() => {
    const recipes = activeSection === 'signature' ? signatureRecipes : aiGeneratedRecipes;
    let filtered = recipes.filter(recipe => {
      if (searchQuery && !recipe.nome.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (selectedCategory && recipe.categoria !== selectedCategory) return false;
      return true;
    });
    setFilteredRecipes(filtered);
  }, [searchQuery, selectedCategory, activeSection, signatureRecipes, aiGeneratedRecipes]);

  const generateAiRecipes = async () => {
    setAiGenerating(true);
    console.log('Generating AI recipes with filters:', aiFilters);
    
    try {
      const promises = Array.from({ length: aiFilters.numero_ricette }, async () => {
        const response = await fetch('/api/ricette', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'generateRecipe',
            data: {
              ingredienti_base: aiFilters.ingredienti_base.split(',').map(i => i.trim()).filter(i => i),
              calorie_target: getCaloriesFromRange(aiFilters.calorie_target),
              proteine_target: getProteinsForObjective(aiFilters.obiettivo_fitness),
              categoria: aiFilters.categoria,
              tempo_max: parseInt(aiFilters.tempo_max),
              allergie: aiFilters.allergie.split(',').map(a => a.trim()).filter(a => a),
              obiettivo_fitness: aiFilters.obiettivo_fitness,
              tipo_dieta: aiFilters.tipo_dieta,
              difficolta: aiFilters.difficolta,
              stile_cucina: aiFilters.stile_cucina,
              stagione: aiFilters.stagione
            }
          })
        });

        const result = await response.json();
        return result.success ? result.data.ricetta : null;
      });

      const results = await Promise.all(promises);
      const validRecipes = results.filter(recipe => recipe !== null);

      // Salva ricette in Airtable e stato locale
      const newAiRecipes: Recipe[] = [];
      
      for (const aiRecipe of validRecipes) {
        const saveResponse = await fetch('/api/airtable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create',
            table: 'recipes_ai',
            fields: {
              nome: aiRecipe.nome,
              categoria: aiFilters.categoria,
              tipoDieta: [aiFilters.tipo_dieta],
              difficolta: aiFilters.difficolta,
              tempoPreparazione: parseInt(aiFilters.tempo_max),
              porzioni: aiRecipe.porzioni || 1,
              calorie: aiRecipe.macros.calorie,
              proteine: aiRecipe.macros.proteine,
              carboidrati: aiRecipe.macros.carboidrati,
              grassi: aiRecipe.macros.grassi,
              ingredienti: Array.isArray(aiRecipe.ingredienti) ? aiRecipe.ingredienti : [],
              preparazione: Array.isArray(aiRecipe.preparazione) ? aiRecipe.preparazione.join('. ') : aiRecipe.preparazione,
              obiettivo_fitness: [aiFilters.obiettivo_fitness],
              macro_focus: aiFilters.macro_focus,
              tags: ['ai_generated', 'batch_generated', aiFilters.stile_cucina],
              rating: 4.7,
              reviewCount: 1,
              createdAt: new Date().toISOString()
            }
          })
        });

        if (saveResponse.ok) {
          const newRecipe: Recipe = {
            id: `ai_${Date.now()}_${Math.random()}`,
            nome: aiRecipe.nome,
            categoria: aiFilters.categoria as any,
            tipoDieta: [aiFilters.tipo_dieta],
            difficolta: aiFilters.difficolta as any,
            tempoPreparazione: parseInt(aiFilters.tempo_max),
            porzioni: aiRecipe.porzioni || 1,
            calorie: aiRecipe.macros.calorie,
            proteine: aiRecipe.macros.proteine,
            carboidrati: aiRecipe.macros.carboidrati,
            grassi: aiRecipe.macros.grassi,
            ingredienti: Array.isArray(aiRecipe.ingredienti) ? aiRecipe.ingredienti : [],
            preparazione: Array.isArray(aiRecipe.preparazione) ? aiRecipe.preparazione.join('. ') : aiRecipe.preparazione,
            obiettivo_fitness: [aiFilters.obiettivo_fitness],
            macro_focus: aiFilters.macro_focus as any,
            fonte: 'ai_generated',
            tags: ['ai_generated', 'batch_generated'],
            rating: 4.7,
            reviewCount: 1,
            createdAt: new Date().toISOString()
          };
          newAiRecipes.push(newRecipe);
        }
      }

      // Aggiorna stato
      setAiGeneratedRecipes(prev => [...newAiRecipes, ...prev]);
      setShowAiFiltersModal(false);
      setActiveSection('ai_generated');
      
      console.log(`Generated ${newAiRecipes.length} AI recipes successfully`);
      
    } catch (error) {
      console.error('AI generation error:', error);
      alert('Errore nella generazione AI. Riprova!');
    } finally {
      setAiGenerating(false);
    }
  };

  const getCaloriesFromRange = (range: string): number => {
    const ranges: { [key: string]: number } = {
      '200-400': 300,
      '400-600': 500,
      '600-800': 700,
      '800+': 900
    };
    return ranges[range] || 500;
  };

  const getProteinsForObjective = (objective: string): number => {
    const proteinMap: { [key: string]: number } = {
      'cutting': 35,
      'maintenance': 25,
      'bulking': 40,
      'endurance': 20,
      'strength': 30
    };
    return proteinMap[objective] || 25;
  };

  const toggleFavorite = async (recipeId: string) => {
    const newFavorites = new Set(favoriteRecipes);
    
    try {
      if (newFavorites.has(recipeId)) {
        newFavorites.delete(recipeId);
      } else {
        if (newFavorites.size >= 10) {
          alert('Puoi avere massimo 10 ricette preferite!');
          return;
        }
        newFavorites.add(recipeId);
      }
      setFavoriteRecipes(newFavorites);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const openRecipeModal = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setShowRecipeModal(true);
  };

  const closeRecipeModal = () => {
    setSelectedRecipe(null);
    setShowRecipeModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Caricando Ricette FITNESS...</h2>
          <p className="text-gray-400">Database compatto + AI infinita!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-2 hover:text-green-400 transition-colors">
                <ChefHat className="h-8 w-8 text-green-400" />
                <span className="text-xl font-bold">Meal Prep</span>
              </Link>
            </div>
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="hover:text-green-400 transition-colors">Home</Link>
              <Link href="/dashboard" className="hover:text-green-400 transition-colors">Dashboard</Link>
              <span className="text-green-400 font-semibold">Ricette FITNESS</span>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ricette FITNESS - Database Compatto + AI Infinita
          </h1>
          <p className="text-xl text-gray-100 mb-6 max-w-4xl mx-auto">
            25 ricette signature selezionate + AI che genera centinaia di varianti personalizzate sui tuoi filtri!
          </p>

          {/* Stats compatte */}
          <div className="bg-white bg-opacity-10 rounded-lg p-4 max-w-3xl mx-auto">
            <div className="grid grid-cols-3 gap-4 text-sm text-gray-200">
              <div className="text-center">
                <div className="font-semibold text-lg">{signatureRecipes.length}</div>
                <div>Ricette Signature</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">{aiGeneratedRecipes.length}</div>
                <div>AI Generated</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">{favoriteRecipes.size}/10</div>
                <div>Preferite</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="bg-gray-800 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            {/* Tab Navigation */}
            <div className="flex bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setActiveSection('signature')}
                className={`px-6 py-2 rounded-md transition-colors ${
                  activeSection === 'signature' 
                    ? 'bg-green-600 text-white' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <ChefHat className="h-4 w-4 inline mr-2" />
                Ricette Signature ({signatureRecipes.length})
              </button>
              <button
                onClick={() => setActiveSection('ai_generated')}
                className={`px-6 py-2 rounded-md transition-colors ${
                  activeSection === 'ai_generated' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <Sparkles className="h-4 w-4 inline mr-2" />
                AI Generated ({aiGeneratedRecipes.length})
              </button>
            </div>

            {/* Generate AI Button */}
            <button
              onClick={() => setShowAiFiltersModal(true)}
              disabled={aiGenerating}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition-colors font-semibold flex items-center gap-2"
            >
              {aiGenerating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Genera AI Ricette
            </button>
          </div>

          {/* Search and Quick Filters */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="relative md:col-span-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Cerca ricette..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div className="md:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Tutte le categorie</option>
                {MEAL_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Quick filters */}
            <div className="md:col-span-5 flex gap-2">
              <button
                onClick={() => {
                  const proteinRich = (activeSection === 'signature' ? signatureRecipes : aiGeneratedRecipes)
                    .filter(r => r.proteine >= 25);
                  setFilteredRecipes(proteinRich);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                High Protein
              </button>
              
              <button
                onClick={() => {
                  const quick = (activeSection === 'signature' ? signatureRecipes : aiGeneratedRecipes)
                    .filter(r => r.tempoPreparazione <= 15);
                  setFilteredRecipes(quick);
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                Quick
              </button>

              <button
                onClick={() => {
                  const favorites = (activeSection === 'signature' ? signatureRecipes : aiGeneratedRecipes)
                    .filter(r => favoriteRecipes.has(r.id));
                  setFilteredRecipes(favorites);
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                Preferiti
              </button>

              {(searchQuery || selectedCategory) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('');
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Grid Ricette */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredRecipes.length === 0 ? (
            <div className="text-center py-12">
              <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-300 mb-2">
                {activeSection === 'signature' ? 'Nessuna ricetta signature trovata' : 'Nessuna ricetta AI trovata'}
              </h3>
              <p className="text-gray-400 mb-4">
                {activeSection === 'signature' 
                  ? 'Prova a modificare i filtri o genera nuove ricette con AI'
                  : 'Genera le tue prime ricette AI personalizzate!'
                }
              </p>
              <button
                onClick={() => setShowAiFiltersModal(true)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Genera con AI
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRecipes.map((recipe) => (
                <div key={recipe.id} className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-700">
                  {/* Header Card compatto - NO IMMAGINE */}
                  <div className="relative p-4 bg-gradient-to-br from-green-600 to-blue-600 min-h-[120px]">
                    {/* Bottone Preferito */}
                    <button
                      onClick={() => toggleFavorite(recipe.id)}
                      className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-all"
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          favoriteRecipes.has(recipe.id)
                            ? 'text-red-500 fill-current'
                            : 'text-white'
                        }`}
                      />
                    </button>

                    {/* Badge Fonte */}
                    {recipe.fonte === 'ai_generated' && (
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 bg-purple-600 text-white rounded-full text-xs font-semibold flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          AI
                        </span>
                      </div>
                    )}

                    {/* Titolo */}
                    <h3 className="text-base font-bold text-white mb-2 line-clamp-2 mt-6">
                      {recipe.nome}
                    </h3>

                    {/* Rating compatto */}
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-white ml-1 font-semibold">
                          {recipe.rating.toFixed(1)}
                        </span>
                      </div>
                      <span className="text-gray-200 text-xs">•</span>
                      <span className="text-xs text-gray-200">
                        {recipe.reviewCount}
                      </span>
                    </div>
                  </div>

                  {/* Contenuto nutrizionale compatto */}
                  <div className="p-4">
                    {/* Macronutrienti grid compatto */}
                    <div className="grid grid-cols-4 gap-1 mb-3 text-xs">
                      <div className="text-center bg-gray-700 rounded py-1">
                        <div className="font-semibold text-white text-sm">{recipe.calorie}</div>
                        <div className="text-gray-400">kcal</div>
                      </div>
                      <div className="text-center bg-blue-700 rounded py-1">
                        <div className="font-semibold text-white text-sm">{recipe.proteine}g</div>
                        <div className="text-gray-300">P</div>
                      </div>
                      <div className="text-center bg-purple-700 rounded py-1">
                        <div className="font-semibold text-white text-sm">{recipe.carboidrati}g</div>
                        <div className="text-gray-300">C</div>
                      </div>
                      <div className="text-center bg-yellow-700 rounded py-1">
                        <div className="font-semibold text-white text-sm">{recipe.grassi}g</div>
                        <div className="text-gray-300">F</div>
                      </div>
                    </div>

                    {/* Info rapide */}
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {recipe.tempoPreparazione}min
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {recipe.difficolta}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {recipe.porzioni}p
                      </span>
                    </div>

                    {/* Tags compatti */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {recipe.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Bottone azione */}
                    <button
                      onClick={() => openRecipeModal(recipe)}
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-2 px-4 rounded-lg transition-all font-semibold text-sm flex items-center justify-center space-x-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Dettagli</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal AI Filters Avanzati */}
      {showAiFiltersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Settings className="h-6 w-6" />
                AI Recipe Generator - Filtri Avanzati
              </h2>
              <button
                onClick={() => setShowAiFiltersModal(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-300 mb-6">
                Configura tutti i parametri per generare ricette AI personalizzate perfette per i tuoi obiettivi fitness!
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Colonna sinistra - Parametri base */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Parametri Base</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Categoria Pasto</label>
                    <select
                      value={aiFilters.categoria}
                      onChange={(e) => setAiFilters({...aiFilters, categoria: e.target.value})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    >
                      {MEAL_CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Obiettivo Fitness</label>
                    <select
                      value={aiFilters.obiettivo_fitness}
                      onChange={(e) => setAiFilters({...aiFilters, obiettivo_fitness: e.target.value})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    >
                      {FITNESS_OBJECTIVES.map(obj => (
                        <option key={obj.value} value={obj.value}>{obj.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Tipo Dieta</label>
                    <select
                      value={aiFilters.tipo_dieta}
                      onChange={(e) => setAiFilters({...aiFilters, tipo_dieta: e.target.value})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    >
                      {DIET_TYPES.map(diet => (
                        <option key={diet.value} value={diet.value}>{diet.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Difficoltà</label>
                    <select
                      value={aiFilters.difficolta}
                      onChange={(e) => setAiFilters({...aiFilters, difficolta: e.target.value})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="facile">Facile</option>
                      <option value="medio">Medio</option>
                      <option value="difficile">Difficile</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Tempo Massimo</label>
                    <select
                      value={aiFilters.tempo_max}
                      onChange={(e) => setAiFilters({...aiFilters, tempo_max: e.target.value})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="15">15 minuti</option>
                      <option value="30">30 minuti</option>
                      <option value="45">45 minuti</option>
                      <option value="60">60 minuti</option>
                      <option value="90">90+ minuti</option>
                    </select>
                  </div>
                </div>

                {/* Colonna destra - Parametri avanzati */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Parametri Avanzati</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Target Calorie</label>
                    <select
                      value={aiFilters.calorie_target}
                      onChange={(e) => setAiFilters({...aiFilters, calorie_target: e.target.value})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="200-400">200-400 kcal</option>
                      <option value="400-600">400-600 kcal</option>
                      <option value="600-800">600-800 kcal</option>
                      <option value="800+">800+ kcal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Focus Macronutrienti</label>
                    <select
                      value={aiFilters.macro_focus}
                      onChange={(e) => setAiFilters({...aiFilters, macro_focus: e.target.value})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="high_protein">High Protein</option>
                      <option value="low_carb">Low Carb</option>
                      <option value="balanced">Balanced</option>
                      <option value="high_fat">High Fat</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Stile Cucina</label>
                    <select
                      value={aiFilters.stile_cucina}
                      onChange={(e) => setAiFilters({...aiFilters, stile_cucina: e.target.value})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    >
                      {CUISINE_STYLES.map(style => (
                        <option key={style.value} value={style.value}>{style.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Stagione</label>
                    <select
                      value={aiFilters.stagione}
                      onChange={(e) => setAiFilters({...aiFilters, stagione: e.target.value})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="tutto_anno">Tutto l'anno</option>
                      <option value="primavera">Primavera</option>
                      <option value="estate">Estate</option>
                      <option value="autunno">Autunno</option>
                      <option value="inverno">Inverno</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Numero Ricette da Generare</label>
                    <select
                      value={aiFilters.numero_ricette}
                      onChange={(e) => setAiFilters({...aiFilters, numero_ricette: parseInt(e.target.value)})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    >
                      <option value={3}>3 ricette</option>
                      <option value={6}>6 ricette</option>
                      <option value={9}>9 ricette</option>
                      <option value={12}>12 ricette</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Ingredienti e Allergie - Full width */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Ingredienti Base (separati da virgola)</label>
                  <input
                    type="text"
                    placeholder="es. pollo, broccoli, quinoa, avocado"
                    value={aiFilters.ingredienti_base}
                    onChange={(e) => setAiFilters({...aiFilters, ingredienti_base: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Allergie/Da Evitare</label>
                  <input
                    type="text"
                    placeholder="es. glutine, lattosio, noci"
                    value={aiFilters.allergie}
                    onChange={(e) => setAiFilters({...aiFilters, allergie: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Pulsanti azione */}
              <div className="flex gap-4 pt-6">
                <button
                  onClick={() => setShowAiFiltersModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={generateAiRecipes}
                  disabled={aiGenerating}
                  className="flex-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white py-3 px-8 rounded-lg transition-colors font-semibold flex items-center justify-center space-x-2"
                >
                  {aiGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Generando {aiFilters.numero_ricette} ricette...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      <span>Genera {aiFilters.numero_ricette} Ricette AI</span>
                    </>
                  )}
                </button>
              </div>

              {/* Info AI */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-opacity-20 rounded-lg border border-blue-600 border-opacity-30">
                <h4 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  AI FITNESS GENERATION:
                </h4>
                <ul className="text-blue-200 text-sm space-y-1">
                  <li>• Ricette generate da AI specializzata in nutrizione sportiva</li>
                  <li>• Macronutrienti ottimizzati automaticamente per obiettivo</li>
                  <li>• Timing perfetto ingredienti per massima performance</li>
                  <li>• Combinazioni innovative basate su database fitness</li>
                  <li>• Generazione batch per massima varietà</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ricetta Dettagliata */}
      {showRecipeModal && selectedRecipe && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">{selectedRecipe.nome}</h2>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="px-2 py-1 bg-green-600 rounded-full text-xs font-semibold">
                    {selectedRecipe.categoria}
                  </span>
                  {selectedRecipe.fonte === 'ai_generated' && (
                    <span className="px-2 py-1 bg-purple-600 text-white rounded-full text-xs font-semibold flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      AI Generated
                    </span>
                  )}
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                    <span className="text-white">{selectedRecipe.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={closeRecipeModal}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors ml-4"
              >
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Colonna sinistra - Info nutrizionali */}
                <div>
                  <div className="bg-gray-700 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Valori Nutrizionali</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center bg-orange-600 rounded py-3">
                        <div className="font-bold text-white text-xl">{selectedRecipe.calorie}</div>
                        <div className="text-orange-100">Calorie</div>
                      </div>
                      <div className="text-center bg-blue-600 rounded py-3">
                        <div className="font-bold text-white text-xl">{selectedRecipe.proteine}g</div>
                        <div className="text-blue-100">Proteine</div>
                      </div>
                      <div className="text-center bg-purple-600 rounded py-3">
                        <div className="font-bold text-white text-xl">{selectedRecipe.carboidrati}g</div>
                        <div className="text-purple-100">Carboidrati</div>
                      </div>
                      <div className="text-center bg-yellow-600 rounded py-3">
                        <div className="font-bold text-white text-xl">{selectedRecipe.grassi}g</div>
                        <div className="text-yellow-100">Grassi</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Caratteristiche</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Tempo:</span>
                        <span className="text-white font-medium">{selectedRecipe.tempoPreparazione} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Porzioni:</span>
                        <span className="text-white font-medium">{selectedRecipe.porzioni}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Difficoltà:</span>
                        <span className="text-white font-medium">{selectedRecipe.difficolta}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Macro Focus:</span>
                        <span className="text-white font-medium">{selectedRecipe.macro_focus}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Obiettivi FITNESS</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedRecipe.obiettivo_fitness.map((obj) => (
                        <span key={obj} className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-medium">
                          {obj}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Colonna destra - Ingredienti e Preparazione */}
                <div>
                  <div className="bg-gray-700 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Ingredienti</h3>
                    <ul className="space-y-2">
                      {selectedRecipe.ingredienti.map((ingrediente, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <span className="text-green-400 mt-1">•</span>
                          <span className="text-gray-200">{ingrediente}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Preparazione</h3>
                    <div className="text-gray-200 leading-relaxed text-sm">
                      {selectedRecipe.preparazione}
                    </div>
                  </div>

                  {/* Azioni */}
                  <div className="space-y-3">
                    <button
                      onClick={() => toggleFavorite(selectedRecipe.id)}
                      className={`w-full py-2 px-4 rounded-lg transition-colors font-semibold ${
                        favoriteRecipes.has(selectedRecipe.id)
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-gray-600 hover:bg-gray-500 text-white'
                      }`}
                    >
                      {favoriteRecipes.has(selectedRecipe.id) ? 'Rimuovi Preferiti' : 'Aggiungi Preferiti'}
                    </button>

                    <button
                      onClick={() => {
                        const recipeText = `${selectedRecipe.nome}\n\n` +
                          `${selectedRecipe.calorie}kcal | ${selectedRecipe.proteine}g prot\n` +
                          `Tempo: ${selectedRecipe.tempoPreparazione} min\n\n` +
                          `INGREDIENTI:\n${selectedRecipe.ingredienti.map(ing => `• ${ing}`).join('\n')}\n\n` +
                          `PREPARAZIONE:\n${selectedRecipe.preparazione}`;
                        
                        navigator.clipboard.writeText(recipeText);
                        alert('Ricetta copiata negli appunti!');
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors font-semibold"
                    >
                      Copia Ricetta
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer compatto */}
      <footer className="bg-gray-900 py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center items-center gap-3 mb-3">
            <ChefHat className="h-6 w-6 text-green-400" />
            <h3 className="text-lg font-bold text-white">Ricette FITNESS - Compatto + AI</h3>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            {signatureRecipes.length} ricette signature + infinite varianti AI per performance ottimali
          </p>
          <div className="flex justify-center gap-4 text-sm">
            <Link href="/" className="text-gray-400 hover:text-green-400 transition-colors">Home</Link>
            <Link href="/dashboard" className="text-gray-400 hover:text-green-400 transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}