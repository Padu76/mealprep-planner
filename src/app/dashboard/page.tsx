'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Clock, Users, Star, ChefHat, Search, X, Eye, Filter, Zap, Target, Activity, TrendingUp, Dumbbell, Flame, Droplets, Apple, Coffee, Utensils, Beef, Fish, Wheat, Salad } from 'lucide-react';

interface Recipe {
  id: string;
  nome: string;
  categoria: 'colazione' | 'pranzo' | 'cena' | 'spuntino' | 'pre_workout' | 'post_workout' | 'smoothie' | 'meal_prep' | 'snack_proteici';
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

interface FavoriteRecipe {
  recipeId: string;
  userId: string;
  addedAt: string;
}

interface AIRecipeRequest {
  ingredienti: string;
  obiettivo: string;
  categoria: string;
  tempo: string;
  allergie: string;
  tipoDieta: string;
}

const DIET_TYPES = [
  { value: 'paleo', label: 'Paleo', color: 'bg-orange-100 text-orange-800' },
  { value: 'keto', label: 'Chetogenica', color: 'bg-purple-100 text-purple-800' },
  { value: 'lowcarb', label: 'Low Carb', color: 'bg-red-100 text-red-800' },
  { value: 'vegetariana', label: 'Vegetariana', color: 'bg-green-100 text-green-800' },
  { value: 'vegana', label: 'Vegana', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'mediterranea', label: 'Mediterranea', color: 'bg-blue-100 text-blue-800' },
  { value: 'iifym', label: 'IIFYM', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'high_protein', label: 'High Protein', color: 'bg-red-100 text-red-800' },
  { value: 'balanced', label: 'Bilanciata', color: 'bg-gray-100 text-gray-800' },
];

const FITNESS_OBJECTIVES = [
  { value: 'cutting', label: 'Cutting/Definizione', icon: TrendingUp, color: 'text-red-500' },
  { value: 'bulking', label: 'Bulking/Massa', icon: Dumbbell, color: 'text-blue-500' },
  { value: 'maintenance', label: 'Mantenimento', icon: Target, color: 'text-green-500' },
  { value: 'endurance', label: 'Resistenza', icon: Activity, color: 'text-purple-500' },
  { value: 'strength', label: 'Forza', icon: Zap, color: 'text-yellow-500' },
];

const MEAL_CATEGORIES = [
  { value: 'colazione', label: 'Colazione', icon: Coffee, emoji: '🌅' },
  { value: 'pre_workout', label: 'Pre-Workout', icon: Zap, emoji: '⚡' },
  { value: 'post_workout', label: 'Post-Workout', icon: Dumbbell, emoji: '💪' },
  { value: 'pranzo', label: 'Pranzo', icon: Utensils, emoji: '☀️' },
  { value: 'cena', label: 'Cena', icon: Utensils, emoji: '🌙' },
  { value: 'spuntino', label: 'Spuntino', icon: Apple, emoji: '🍎' },
  { value: 'smoothie', label: 'Smoothies', icon: Droplets, emoji: '🥤' },
  { value: 'meal_prep', label: 'Meal Prep', icon: ChefHat, emoji: '📦' },
  { value: 'snack_proteici', label: 'Snack Proteici', icon: Beef, emoji: '🥜' },
];

export default function RicettePage() {
  // Stati principali
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Stati filtri
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiet, setSelectedDiet] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedObjective, setSelectedObjective] = useState('');
  const [selectedMacroFocus, setSelectedMacroFocus] = useState('');
  const [maxTime, setMaxTime] = useState('');

  // Stati paginazione
  const [currentPage, setCurrentPage] = useState(1);
  const recipesPerPage = 12;

  // Stati modali
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  // Form AI
  const [aiFormData, setAiFormData] = useState<AIRecipeRequest>({
    ingredienti: '',
    obiettivo: 'cutting',
    categoria: 'pranzo',
    tempo: '30',
    allergie: '',
    tipoDieta: 'balanced'
  });

  // Caricamento iniziale ricette
  useEffect(() => {
    loadRecipes();
    loadFavorites();
  }, []);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      
      // Carica database ricette espanso (60+ ricette)
      const databaseRecipes = await loadExpandedDatabaseRecipes();
      
      // Carica ricette salvate in Airtable
      const airtableRecipes = await loadAirtableRecipes();
      
      const allRecipes = [...databaseRecipes, ...airtableRecipes];
      setRecipes(allRecipes);
      setFilteredRecipes(allRecipes);
      
      console.log(`✅ Loaded ${allRecipes.length} recipes (${databaseRecipes.length} database + ${airtableRecipes.length} AI generated)`);
      
    } catch (error) {
      console.error('❌ Error loading recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExpandedDatabaseRecipes = async (): Promise<Recipe[]> => {
    // 🌅 DATABASE RICETTE FITNESS COMPLETO - 60+ RICETTE
    return [
      // 🌅 COLAZIONE (10 ricette)
      {
        id: 'col_001', nome: 'Pancakes Proteici Avena e Banana', categoria: 'colazione', tipoDieta: ['high_protein', 'balanced'],
        difficolta: 'medio', tempoPreparazione: 15, porzioni: 1, calorie: 485, proteine: 32, carboidrati: 48, grassi: 16,
        ingredienti: ['60g fiocchi avena', '30g proteine whey vaniglia', '1 banana matura', '2 uova', '150ml latte scremato', '1 cucchiaino lievito', 'cannella', 'mirtilli freschi', 'sciroppo acero'],
        preparazione: 'Frulla avena fino a farina. Aggiungi proteine, banana schiacciata e uova. Incorpora latte e lievito. Lascia riposare 5 min. Cuoci piccoli pancakes in padella antiaderente 2-3 min per lato. Servi con mirtilli e sciroppo.',
        obiettivo_fitness: ['bulking', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['pancakes', 'proteici', 'colazione', 'banana'], rating: 4.8, reviewCount: 267, createdAt: new Date().toISOString()
      },
      {
        id: 'col_002', nome: 'Overnight Oats Burro di Mandorle e Chia', categoria: 'colazione', tipoDieta: ['vegetariana', 'high_protein'],
        difficolta: 'facile', tempoPreparazione: 5, porzioni: 1, calorie: 425, proteine: 18, carboidrati: 38, grassi: 22,
        ingredienti: ['50g fiocchi avena', '200ml latte mandorla', '1 cucchiaio semi chia', '2 cucchiai burro mandorle', '1 cucchiaino miele', 'frutti di bosco', 'granola'],
        preparazione: 'Mescola avena, latte, chia e burro di mandorle in barattolo. Dolcifica con miele. Riponi in frigo overnight. Al mattino aggiungi frutti di bosco e granola.',
        obiettivo_fitness: ['maintenance', 'endurance'], macro_focus: 'balanced', fonte: 'database',
        tags: ['overnight_oats', 'prep_ahead', 'chia', 'mandorle'], rating: 4.6, reviewCount: 189, createdAt: new Date().toISOString()
      },
      {
        id: 'col_003', nome: 'Uova Strapazzate con Spinaci e Feta', categoria: 'colazione', tipoDieta: ['keto', 'low_carb'],
        difficolta: 'facile', tempoPreparazione: 8, porzioni: 1, calorie: 385, proteine: 28, carboidrati: 6, grassi: 28,
        ingredienti: ['3 uova grandi', '100g spinaci baby', '40g feta', '1 cucchiaio olio oliva', 'aglio', 'pepe nero', 'pomodorini', 'basilico'],
        preparazione: 'Soffriggi aglio in olio. Aggiungi spinaci e cuoci 2 min. Sbatti uova e versa in padella. Mescola delicatamente, aggiungi feta a pezzetti. Guarnisci con pomodorini e basilico.',
        obiettivo_fitness: ['cutting', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['uova', 'spinaci', 'keto', 'veloce'], rating: 4.7, reviewCount: 145, createdAt: new Date().toISOString()
      },
      {
        id: 'col_004', nome: 'Toast Avocado e Uovo Pochè', categoria: 'colazione', tipoDieta: ['mediterranea', 'balanced'],
        difficolta: 'medio', tempoPreparazione: 12, porzioni: 1, calorie: 465, proteine: 18, carboidrati: 32, grassi: 28,
        ingredienti: ['2 fette pane integrale', '1 avocado maturo', '1 uovo fresco', 'lime', 'peperoncino', 'sale marino', 'rucola', 'pomodori secchi'],
        preparazione: 'Tosta pane. Prepara uovo pochè in acqua bollente con aceto 3-4 min. Schiaccia avocado con lime, sale e peperoncino. Spalma su toast, aggiungi rucola e pomodori. Corona con uovo pochè.',
        obiettivo_fitness: ['maintenance', 'endurance'], macro_focus: 'balanced', fonte: 'database',
        tags: ['avocado_toast', 'uovo_poche', 'trendy', 'instagram'], rating: 4.9, reviewCount: 298, createdAt: new Date().toISOString()
      },
      {
        id: 'col_005', nome: 'Smoothie Bowl Açaí Power', categoria: 'colazione', tipoDieta: ['vegana', 'high_protein'],
        difficolta: 'medio', tempoPreparazione: 10, porzioni: 1, calorie: 445, proteine: 22, carboidrati: 52, grassi: 16,
        ingredienti: ['100g açaí congelato', '20g proteine vegetali', '1/2 banana', 'frutti di bosco', '15g granola', 'semi chia', 'cocco rapè', 'mandorle'],
        preparazione: 'Frulla açaí, proteine e banana con pochissimo liquido per consistenza densa. Versa in bowl. Disponi artisticamente tutti i toppings creando sezioni colorate.',
        obiettivo_fitness: ['cutting', 'endurance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['acai_bowl', 'superfoods', 'antiossidanti', 'colorato'], rating: 4.8, reviewCount: 234, createdAt: new Date().toISOString()
      },
      {
        id: 'col_006', nome: 'Porridge Proteico Cioccolato e Banana', categoria: 'colazione', tipoDieta: ['vegetariana', 'high_protein'],
        difficolta: 'facile', tempoPreparazione: 8, porzioni: 1, calorie: 385, proteine: 25, carboidrati: 42, grassi: 12,
        ingredienti: ['50g fiocchi avena', '25g proteine whey cioccolato', '1 banana', '200ml latte scremato', '1 cucchiaio cacao', 'miele', 'noci'],
        preparazione: 'Cuoci avena nel latte 5 min. Aggiungi proteine al cioccolato e cacao mescolando bene. Incorpora banana a fette. Dolcifica con miele, guarnisci con noci.',
        obiettivo_fitness: ['bulking', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['porridge', 'cioccolato', 'cremoso', 'comfort'], rating: 4.5, reviewCount: 156, createdAt: new Date().toISOString()
      },
      {
        id: 'col_007', nome: 'Yogurt Greco Bowl Frutti Rossi', categoria: 'colazione', tipoDieta: ['vegetariana', 'high_protein'],
        difficolta: 'facile', tempoPreparazione: 5, porzioni: 1, calorie: 325, proteine: 28, carboidrati: 25, grassi: 8,
        ingredienti: ['200g yogurt greco 0%', 'frutti di bosco misti', '15g muesli', '1 cucchiaio miele', 'mandorle a lamelle', 'semi lino'],
        preparazione: 'Versa yogurt greco in bowl. Disponi frutti di bosco, muesli, mandorle e semi di lino. Completa con filo di miele.',
        obiettivo_fitness: ['cutting', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['yogurt_greco', 'frutti_rossi', 'veloce', 'probiotici'], rating: 4.4, reviewCount: 198, createdAt: new Date().toISOString()
      },
      {
        id: 'col_008', nome: 'Frittata Fitness con Verdure', categoria: 'colazione', tipoDieta: ['keto', 'paleo'],
        difficolta: 'medio', tempoPreparazione: 15, porzioni: 2, calorie: 285, proteine: 22, carboidrati: 8, grassi: 18,
        ingredienti: ['4 uova', '100g zucchine', '50g peperoni', '30g formaggio magro', 'cipolla', 'erbe aromatiche', 'olio oliva'],
        preparazione: 'Taglia verdure a dadini e soffriggi. Sbatti uova con formaggio ed erbe. Versa sulle verdure, cuoci 3 min sui fornelli poi 5 min in forno a 180°C.',
        obiettivo_fitness: ['cutting', 'strength'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['frittata', 'verdure', 'keto', 'meal_prep'], rating: 4.6, reviewCount: 167, createdAt: new Date().toISOString()
      },
      {
        id: 'col_009', nome: 'Chia Pudding Vaniglia e Cocco', categoria: 'colazione', tipoDieta: ['vegana', 'keto'],
        difficolta: 'facile', tempoPreparazione: 5, porzioni: 1, calorie: 345, proteine: 12, carboidrati: 18, grassi: 24,
        ingredienti: ['3 cucchiai semi chia', '200ml latte cocco', 'estratto vaniglia', 'stevia', 'cocco rapè', 'frutti di bosco'],
        preparazione: 'Mescola chia con latte di cocco, vaniglia e stevia. Riponi in frigo minimo 4 ore. Servi con cocco rapè e frutti di bosco.',
        obiettivo_fitness: ['cutting', 'endurance'], macro_focus: 'high_fat', fonte: 'database',
        tags: ['chia_pudding', 'omega3', 'prep_ahead', 'vegano'], rating: 4.3, reviewCount: 134, createdAt: new Date().toISOString()
      },
      {
        id: 'col_010', nome: 'English Breakfast Proteico', categoria: 'colazione', tipoDieta: ['paleo', 'high_protein'],
        difficolta: 'difficile', tempoPreparazione: 20, porzioni: 1, calorie: 565, proteine: 42, carboidrati: 12, grassi: 38,
        ingredienti: ['2 uova', '100g bacon magro', '80g funghi', '1 pomodoro', '50g spinaci', 'avocado', 'fagioli neri'],
        preparazione: 'Cuoci bacon in padella. Nello stesso grasso cuoci funghi e pomodoro. In altra padella fai uova. Saltare spinaci. Componi il piatto con avocado e fagioli.',
        obiettivo_fitness: ['bulking', 'strength'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['english_breakfast', 'abbondante', 'weekend', 'proteico'], rating: 4.7, reviewCount: 189, createdAt: new Date().toISOString()
      },

      // 🥗 PRANZO (12 ricette)
      {
        id: 'pra_001', nome: 'Pollo Grigliato con Quinoa e Verdure', categoria: 'pranzo', tipoDieta: ['high_protein', 'balanced'],
        difficolta: 'medio', tempoPreparazione: 25, porzioni: 1, calorie: 485, proteine: 38, carboidrati: 45, grassi: 12,
        ingredienti: ['150g petto di pollo', '80g quinoa', '100g broccoli', '50g carote', '1 cucchiaio olio EVO', 'spezie miste', 'limone'],
        preparazione: 'Marina il pollo con spezie 15 min. Cuoci quinoa in brodo vegetale. Griglia pollo 6-7 min per lato. Cuoci verdure al vapore 8 min. Componi piatto bilanciando macronutrienti.',
        obiettivo_fitness: ['bulking', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['pollo', 'quinoa', 'complete_meal', 'muscle_building'], rating: 4.7, reviewCount: 256, createdAt: new Date().toISOString()
      },
      {
        id: 'pra_002', nome: 'Salmone Teriyaki con Riso Venere', categoria: 'pranzo', tipoDieta: ['high_protein', 'mediterranea'],
        difficolta: 'medio', tempoPreparazione: 30, porzioni: 1, calorie: 525, proteine: 35, carboidrati: 48, grassi: 18,
        ingredienti: ['150g filetto salmone', '70g riso venere', 'salsa teriyaki', 'zenzero', 'sesamo', 'edamame', 'alga nori'],
        preparazione: 'Cuoci riso venere 40 min. Marina salmone in teriyaki 20 min. Cuoci salmone in padella 4 min per lato. Servi con riso, edamame e sesamo.',
        obiettivo_fitness: ['bulking', 'endurance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['salmone', 'omega3', 'asian_fusion', 'gourmet'], rating: 4.9, reviewCount: 189, createdAt: new Date().toISOString()
      },
      {
        id: 'pra_003', nome: 'Bowl Buddha Vegetariano Completo', categoria: 'pranzo', tipoDieta: ['vegetariana', 'balanced'],
        difficolta: 'medio', tempoPreparazione: 35, porzioni: 1, calorie: 465, proteine: 18, carboidrati: 58, grassi: 16,
        ingredienti: ['80g ceci cotti', '60g quinoa', 'avocado', 'carote', 'cavolo rosso', 'hummus', 'semi girasole', 'tahini'],
        preparazione: 'Cuoci quinoa. Prepara hummus fresco. Taglia verdure a julienne. Componi bowl con tutti ingredienti, condisci con salsa tahini.',
        obiettivo_fitness: ['maintenance', 'endurance'], macro_focus: 'balanced', fonte: 'database',
        tags: ['buddha_bowl', 'vegetariano', 'rainbow', 'nutritious'], rating: 4.6, reviewCount: 167, createdAt: new Date().toISOString()
      },
      {
        id: 'pra_004', nome: 'Bistecca ai Ferri con Patate Dolci', categoria: 'pranzo', tipoDieta: ['paleo', 'high_protein'],
        difficolta: 'medio', tempoPreparazione: 20, porzioni: 1, calorie: 485, proteine: 42, carboidrati: 28, grassi: 18,
        ingredienti: ['150g bistecca manzo', '150g patate dolci', 'rucola', 'pomodorini', 'olio oliva', 'rosmarino', 'aglio'],
        preparazione: 'Cuoci patate dolci al forno 25 min. Griglia bistecca 3-4 min per lato. Prepara insalata con rucola e pomodorini. Servi tutto insieme.',
        obiettivo_fitness: ['bulking', 'strength'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['bistecca', 'patate_dolci', 'iron_rich', 'paleo'], rating: 4.8, reviewCount: 234, createdAt: new Date().toISOString()
      },
      {
        id: 'pra_005', nome: 'Insalata di Tonno e Fagioli Cannellini', categoria: 'pranzo', tipoDieta: ['mediterranea', 'high_protein'],
        difficolta: 'facile', tempoPreparazione: 10, porzioni: 1, calorie: 385, proteine: 32, carboidrati: 28, grassi: 12,
        ingredienti: ['150g tonno al naturale', '100g fagioli cannellini', 'cipolla rossa', 'sedano', 'pomodori', 'basilico', 'limone', 'olio EVO'],
        preparazione: 'Scola tonno e fagioli. Taglia cipolla, sedano e pomodori. Mescola tutto, condisci con olio, limone e basilico fresco.',
        obiettivo_fitness: ['cutting', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['tonno', 'veloce', 'no_cook', 'mediterraneo'], rating: 4.4, reviewCount: 198, createdAt: new Date().toISOString()
      },
      {
        id: 'pra_006', nome: 'Curry di Pollo con Riso Basmati', categoria: 'pranzo', tipoDieta: ['high_protein', 'balanced'],
        difficolta: 'difficile', tempoPreparazione: 40, porzioni: 2, calorie: 445, proteine: 35, carboidrati: 42, grassi: 14,
        ingredienti: ['200g pollo a cubetti', '80g riso basmati', 'latte cocco', 'curry', 'zenzero', 'aglio', 'cipolla', 'spinaci'],
        preparazione: 'Soffriggi cipolla, aglio e zenzero. Aggiungi pollo e curry, cuoci 5 min. Versa latte cocco, simmer 20 min. Aggiungi spinaci. Servi con riso.',
        obiettivo_fitness: ['bulking', 'endurance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['curry', 'speziato', 'comfort', 'exotic'], rating: 4.7, reviewCount: 156, createdAt: new Date().toISOString()
      },
      {
        id: 'pra_007', nome: 'Poke Bowl Salmone e Avocado', categoria: 'pranzo', tipoDieta: ['high_protein', 'balanced'],
        difficolta: 'medio', tempoPreparazione: 15, porzioni: 1, calorie: 525, proteine: 32, carboidrati: 48, grassi: 22,
        ingredienti: ['120g salmone crudo sashimi', '80g riso sushi', 'avocado', 'edamame', 'cetriolo', 'salsa soia', 'sesamo', 'alga wakame'],
        preparazione: 'Cuoci riso sushi. Taglia salmone a cubetti. Prepara verdure. Componi poke bowl stratificando ingredienti. Condisci con salsa soia e sesamo.',
        obiettivo_fitness: ['cutting', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['poke', 'raw_fish', 'hawaiian', 'trendy'], rating: 4.8, reviewCount: 267, createdAt: new Date().toISOString()
      },
      {
        id: 'pra_008', nome: 'Wrap Proteico Tacchino e Hummus', categoria: 'pranzo', tipoDieta: ['high_protein', 'balanced'],
        difficolta: 'facile', tempoPreparazione: 8, porzioni: 1, calorie: 385, proteine: 28, carboidrati: 32, grassi: 14,
        ingredienti: ['1 tortilla integrale', '100g fesa tacchino', '2 cucchiai hummus', 'lattuga', 'pomodori', 'cetrioli', 'peperoni'],
        preparazione: 'Spalma hummus sulla tortilla. Disponi tacchino e verdure crude. Arrotola stretto e taglia a metà. Ottimo anche per meal prep.',
        obiettivo_fitness: ['cutting', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['wrap', 'portable', 'meal_prep', 'veloce'], rating: 4.5, reviewCount: 189, createdAt: new Date().toISOString()
      },
      {
        id: 'pra_009', nome: 'Risotto Proteico ai Funghi Porcini', categoria: 'pranzo', tipoDieta: ['vegetariana', 'high_protein'],
        difficolta: 'difficile', tempoPreparazione: 45, porzioni: 2, calorie: 465, proteine: 22, carboidrati: 58, grassi: 12,
        ingredienti: ['150g riso Arborio', '30g proteine whey neutre', 'funghi porcini', 'brodo vegetale', 'cipolla', 'vino bianco', 'parmigiano'],
        preparazione: 'Soffriggi cipolla, aggiungi riso e tosta. Sfuma con vino. Aggiungi brodo gradualmente mescolando 20 min. Incorpora funghi e proteine. Manti con parmigiano.',
        obiettivo_fitness: ['bulking', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['risotto', 'funghi', 'comfort', 'gourmet'], rating: 4.6, reviewCount: 145, createdAt: new Date().toISOString()
      },
      {
        id: 'pra_010', nome: 'Zuppa di Lenticchie e Verdure', categoria: 'pranzo', tipoDieta: ['vegana', 'high_protein'],
        difficolta: 'medio', tempoPreparazione: 35, porzioni: 2, calorie: 325, proteine: 18, carboidrati: 48, grassi: 6,
        ingredienti: ['150g lenticchie rosse', 'carote', 'sedano', 'cipolla', 'pomodori pelati', 'brodo vegetale', 'spezie'],
        preparazione: 'Soffriggi verdure tritate. Aggiungi lenticchie, pomodori e brodo. Simmer 25 min fino a cremosità. Aggiusta spezie e consistenza.',
        obiettivo_fitness: ['cutting', 'endurance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['lenticchie', 'vegano', 'fiber_rich', 'comfort'], rating: 4.4, reviewCount: 167, createdAt: new Date().toISOString()
      },
      {
        id: 'pra_011', nome: 'Caesar Salad Proteica con Pollo', categoria: 'pranzo', tipoDieta: ['keto', 'high_protein'],
        difficolta: 'medio', tempoPreparazione: 15, porzioni: 1, calorie: 425, proteine: 35, carboidrati: 8, grassi: 28,
        ingredienti: ['120g petto pollo grigliato', 'lattuga romana', 'parmigiano', 'caesar dressing', 'crostini keto', 'acciughe'],
        preparazione: 'Griglia pollo e taglialo a strisce. Prepara lattuga a foglie. Mescola con caesar dressing, parmigiano e crostini. Completa con pollo.',
        obiettivo_fitness: ['cutting', 'strength'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['caesar_salad', 'keto', 'low_carb', 'classic'], rating: 4.7, reviewCount: 234, createdAt: new Date().toISOString()
      },
      {
        id: 'pra_012', nome: 'Pasta Integrale Pesto e Gamberetti', categoria: 'pranzo', tipoDieta: ['mediterranea', 'high_protein'],
        difficolta: 'medio', tempoPreparazione: 18, porzioni: 1, calorie: 485, proteine: 28, carboidrati: 52, grassi: 16,
        ingredienti: ['80g pasta integrale', '120g gamberetti', 'pesto basilico', 'pomodorini', 'aglio', 'olio oliva', 'pinoli'],
        preparazione: 'Cuoci pasta al dente. Saltare gamberetti con aglio 3 min. Scola pasta, mescola con pesto, gamberetti e pomodorini. Guarnisci con pinoli.',
        obiettivo_fitness: ['maintenance', 'endurance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['pasta', 'gamberetti', 'pesto', 'mediterraneo'], rating: 4.8, reviewCount: 198, createdAt: new Date().toISOString()
      },

      // 🌙 CENA (10 ricette)
      {
        id: 'cen_001', nome: 'Orata al Sale con Verdure Grigliate', categoria: 'cena', tipoDieta: ['mediterranea', 'paleo'],
        difficolta: 'difficile', tempoPreparazione: 45, porzioni: 2, calorie: 385, proteine: 32, carboidrati: 18, grassi: 18,
        ingredienti: ['1 orata 400g', 'sale grosso', 'zucchine', 'melanzane', 'peperoni', 'olio oliva', 'erbe aromatiche'],
        preparazione: 'Pulisci orata. Crea letto di sale, posiziona pesce, copri con altro sale. Cuoci 30 min a 200°C. Griglia verdure a fette. Servi insieme.',
        obiettivo_fitness: ['cutting', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['pesce', 'al_sale', 'light', 'gourmet'], rating: 4.9, reviewCount: 156, createdAt: new Date().toISOString()
      },
      {
        id: 'cen_002', nome: 'Petto di Pollo Stuffato con Spinaci', categoria: 'cena', tipoDieta: ['keto', 'high_protein'],
        difficolta: 'medio', tempoPreparazione: 25, porzioni: 1, calorie: 425, proteine: 38, carboidrati: 6, grassi: 26,
        ingredienti: ['150g petto pollo', '100g spinaci', '50g ricotta', 'parmigiano', 'aglio', 'olio oliva', 'spezie'],
        preparazione: 'Apri pollo a libro. Saltare spinaci con aglio. Mescola con ricotta e parmigiano. Farcisci pollo, chiudi con stecchini. Cuoci 20 min a 180°C.',
        obiettivo_fitness: ['cutting', 'strength'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['pollo_ripieno', 'keto', 'elegant', 'low_carb'], rating: 4.7, reviewCount: 189, createdAt: new Date().toISOString()
      },
      {
        id: 'cen_003', nome: 'Zuppa Tom Kha Gai Proteica', categoria: 'cena', tipoDieta: ['paleo', 'high_protein'],
        difficolta: 'medio', tempoPreparazione: 30, porzioni: 2, calorie: 345, proteine: 25, carboidrati: 12, grassi: 22,
        ingredienti: ['150g pollo a strisce', 'latte cocco', 'funghi shiitake', 'lemongrass', 'galanga', 'lime', 'peperoncino'],
        preparazione: 'Scalda latte cocco con aromi. Aggiungi pollo e cuoci 8 min. Incorpora funghi, simmer 5 min. Aggiusta con lime e peperoncino.',
        obiettivo_fitness: ['cutting', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['thai', 'soup', 'coconut', 'exotic'], rating: 4.6, reviewCount: 167, createdAt: new Date().toISOString()
      },
      {
        id: 'cen_004', nome: 'Salmone in Crosta di Pistacchi', categoria: 'cena', tipoDieta: ['keto', 'high_protein'],
        difficolta: 'medio', tempoPreparazione: 20, porzioni: 1, calorie: 485, proteine: 32, carboidrati: 8, grassi: 34,
        ingredienti: ['150g filetto salmone', '30g pistacchi tritati', 'senape di Digione', 'erbe aromatiche', 'limone', 'olio oliva'],
        preparazione: 'Spalma senape sul salmone. Mescola pistacchi con erbe. Pressa crosta sul pesce. Cuoci 12 min a 200°C. Servi con limone.',
        obiettivo_fitness: ['cutting', 'maintenance'], macro_focus: 'high_fat', fonte: 'database',
        tags: ['salmone', 'pistacchi', 'omega3', 'crust'], rating: 4.8, reviewCount: 234, createdAt: new Date().toISOString()
      },
      {
        id: 'cen_005', nome: 'Burger di Lenticchie e Quinoa', categoria: 'cena', tipoDieta: ['vegana', 'high_protein'],
        difficolta: 'medio', tempoPreparazione: 35, porzioni: 2, calorie: 365, proteine: 18, carboidrati: 42, grassi: 12,
        ingredienti: ['100g lenticchie rosse', '50g quinoa', 'cipolla', 'aglio', 'pangrattato', 'spezie', 'insalata', 'pomodoro'],
        preparazione: 'Cuoci lenticchie e quinoa. Soffriggi cipolla. Mescola tutto, forma burger. Cuoci in padella 4 min per lato. Servi con insalata.',
        obiettivo_fitness: ['maintenance', 'endurance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['veggie_burger', 'plant_based', 'sustainable', 'fiber'], rating: 4.4, reviewCount: 145, createdAt: new Date().toISOString()
      },
      {
        id: 'cen_006', nome: 'Tagliata di Manzo con Rucola', categoria: 'cena', tipoDieta: ['paleo', 'high_protein'],
        difficolta: 'medio', tempoPreparazione: 15, porzioni: 1, calorie: 445, proteine: 38, carboidrati: 6, grassi: 28,
        ingredienti: ['150g tagliata manzo', 'rucola', 'parmigiano a scaglie', 'pomodorini', 'olio oliva', 'aceto balsamico'],
        preparazione: 'Cuoci tagliata 2-3 min per lato per cottura al sangue. Lascia riposare 5 min, taglia a fette. Servi su letto di rucola con condimenti.',
        obiettivo_fitness: ['bulking', 'strength'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['tagliata', 'beef', 'simple', 'iron_rich'], rating: 4.7, reviewCount: 198, createdAt: new Date().toISOString()
      },
      {
        id: 'cen_007', nome: 'Vellutata di Zucca e Zenzero', categoria: 'cena', tipoDieta: ['vegana', 'low_carb'],
        difficolta: 'facile', tempoPreparazione: 25, porzioni: 2, calorie: 185, proteine: 8, carboidrati: 22, grassi: 8,
        ingredienti: ['300g zucca', 'zenzero fresco', 'latte cocco', 'cipolla', 'brodo vegetale', 'semi zucca', 'olio oliva'],
        preparazione: 'Arrostisci zucca 20 min. Soffriggi cipolla e zenzero. Aggiungi zucca e brodo, simmer 15 min. Frulla, aggiungi latte cocco. Guarnisci con semi.',
        obiettivo_fitness: ['cutting', 'maintenance'], macro_focus: 'low_carb', fonte: 'database',
        tags: ['vellutata', 'comfort', 'warming', 'beta_carotene'], rating: 4.5, reviewCount: 167, createdAt: new Date().toISOString()
      },
      {
        id: 'cen_008', nome: 'Polpette di Tacchino in Salsa', categoria: 'cena', tipoDieta: ['high_protein', 'balanced'],
        difficolta: 'medio', tempoPreparazione: 30, porzioni: 2, calorie: 385, proteine: 32, carboidrati: 18, grassi: 18,
        ingredienti: ['200g macinato tacchino', 'uovo', 'pangrattato', 'pomodori pelati', 'basilico', 'aglio', 'cipolla'],
        preparazione: 'Mescola tacchino, uovo e pangrattato. Forma polpette. Soffriggi cipolla, aggiungi pomodori. Incorpora polpette, cuoci 15 min.',
        obiettivo_fitness: ['bulking', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['polpette', 'turkey', 'comfort', 'family'], rating: 4.6, reviewCount: 189, createdAt: new Date().toISOString()
      },
      {
        id: 'cen_009', nome: 'Frittata al Forno con Broccoli', categoria: 'cena', tipoDieta: ['keto', 'vegetariana'],
        difficolta: 'facile', tempoPreparazione: 20, porzioni: 4, calorie: 245, proteine: 18, carboidrati: 8, grassi: 16,
        ingredienti: ['6 uova', '200g broccoli', '80g formaggio magro', 'cipolla', 'olio oliva', 'erbe aromatiche'],
        preparazione: 'Sbollenta broccoli 5 min. Soffriggi cipolla. Sbatti uova con formaggio. Mescola tutto, versa in teglia. Cuoci 15 min a 180°C.',
        obiettivo_fitness: ['cutting', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['frittata', 'meal_prep', 'vegetables', 'easy'], rating: 4.4, reviewCount: 156, createdAt: new Date().toISOString()
      },
      {
        id: 'cen_010', nome: 'Merluzzo in Guazzetto di Pomodori', categoria: 'cena', tipoDieta: ['mediterranea', 'paleo'],
        difficolta: 'medio', tempoPreparazione: 22, porzioni: 1, calorie: 285, proteine: 28, carboidrati: 12, grassi: 12,
        ingredienti: ['150g filetto merluzzo', 'pomodorini', 'olive taggiasche', 'capperi', 'aglio', 'prezzemolo', 'olio oliva'],
        preparazione: 'Soffriggi aglio, aggiungi pomodorini e cuoci 5 min. Incorpora merluzzo, olive e capperi. Cuoci 8 min. Completa con prezzemolo.',
        obiettivo_fitness: ['cutting', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['merluzzo', 'light', 'mediterranean', 'omega3'], rating: 4.7, reviewCount: 134, createdAt: new Date().toISOString()
      },

      // ⚡ PRE-WORKOUT (8 ricette)
      {
        id: 'pre_001', nome: 'Banana e Burro di Mandorle Toast', categoria: 'pre_workout', tipoDieta: ['balanced', 'vegetariana'],
        difficolta: 'facile', tempoPreparazione: 5, porzioni: 1, calorie: 285, proteine: 8, carboidrati: 38, grassi: 12,
        ingredienti: ['1 fetta pane integrale', '1 banana', '1 cucchiaio burro mandorle', 'miele', 'cannella'],
        preparazione: 'Tosta pane. Spalma burro di mandorle. Aggiungi banana a fette, miele e cannella. Consuma 45 min prima del workout.',
        obiettivo_fitness: ['endurance', 'maintenance'], macro_focus: 'balanced', fonte: 'database',
        tags: ['pre_workout', 'quick_energy', 'portable', 'natural'], rating: 4.6, reviewCount: 189, createdAt: new Date().toISOString()
      },
      {
        id: 'pre_002', nome: 'Overnight Oats Pre-Workout', categoria: 'pre_workout', tipoDieta: ['vegetariana', 'high_protein'],
        difficolta: 'facile', tempoPreparazione: 5, porzioni: 1, calorie: 325, proteine: 15, carboidrati: 45, grassi: 8,
        ingredienti: ['50g avena', '20g proteine whey', 'latte scremato', '1 banana', 'miele', 'cannella'],
        preparazione: 'Mescola avena, proteine e latte in barattolo. Aggiungi banana schiacciata, miele e cannella. Riponi in frigo overnight.',
        obiettivo_fitness: ['endurance', 'bulking'], macro_focus: 'balanced', fonte: 'database',
        tags: ['overnight_oats', 'prep_ahead', 'sustained_energy', 'fiber'], rating: 4.4, reviewCount: 167, createdAt: new Date().toISOString()
      },
      {
        id: 'pre_003', nome: 'Energy Balls Datteri e Cacao', categoria: 'pre_workout', tipoDieta: ['vegana', 'paleo'],
        difficolta: 'medio', tempoPreparazione: 15, porzioni: 8, calorie: 85, proteine: 3, carboidrati: 16, grassi: 2,
        ingredienti: ['8 datteri Medjoul', '30g cacao crudo', '20g mandorle', '1 cucchiaio olio cocco', 'cocco rapè'],
        preparazione: 'Ammolla datteri 10 min. Frulla con cacao, mandorle e olio cocco. Forma palline, rotola nel cocco. Refrigera 30 min.',
        obiettivo_fitness: ['endurance', 'strength'], macro_focus: 'balanced', fonte: 'database',
        tags: ['energy_balls', 'natural_sugars', 'portable', 'antioxidants'], rating: 4.7, reviewCount: 145, createdAt: new Date().toISOString()
      },
      {
        id: 'pre_004', nome: 'Smoothie Energetico Verde', categoria: 'pre_workout', tipoDieta: ['vegana', 'low_fat'],
        difficolta: 'facile', tempoPreparazione: 4, porzioni: 1, calorie: 245, proteine: 12, carboidrati: 42, grassi: 4,
        ingredienti: ['1 banana', '100g spinaci', '20g proteine vegetali', '200ml acqua cocco', 'zenzero', 'lime'],
        preparazione: 'Frulla tutti gli ingredienti 60 secondi. La consistenza deve essere liscia. Consuma 30-45 min prima del workout.',
        obiettivo_fitness: ['endurance', 'cutting'], macro_focus: 'low_carb', fonte: 'database',
        tags: ['green_smoothie', 'hydrating', 'fast_digesting', 'alkaline'], rating: 4.3, reviewCount: 198, createdAt: new Date().toISOString()
      },
      {
        id: 'pre_005', nome: 'Muesli Energetico Fatto in Casa', categoria: 'pre_workout', tipoDieta: ['vegetariana', 'balanced'],
        difficolta: 'medio', tempoPreparazione: 20, porzioni: 6, calorie: 265, proteine: 8, carboidrati: 42, grassi: 8,
        ingredienti: ['100g avena', '30g noci', '20g semi girasole', '30g uvetta', 'miele', 'cannella'],
        preparazione: 'Mescola avena, noci e semi. Tosta in forno 10 min. Aggiungi uvetta, miele e cannella. Conserva in contenitore ermetico.',
        obiettivo_fitness: ['endurance', 'maintenance'], macro_focus: 'balanced', fonte: 'database',
        tags: ['homemade_muesli', 'batch_prep', 'whole_grains', 'sustained_release'], rating: 4.5, reviewCount: 156, createdAt: new Date().toISOString()
      },
      {
        id: 'pre_006', nome: 'Crackers di Riso con Miele', categoria: 'pre_workout', tipoDieta: ['low_fat', 'balanced'],
        difficolta: 'facile', tempoPreparazione: 3, porzioni: 1, calorie: 165, proteine: 4, carboidrati: 32, grassi: 2,
        ingredienti: ['4 gallette riso', '2 cucchiaini miele', 'cannella', 'sale marino pizzico'],
        preparazione: 'Spalma miele sulle gallette. Aggiungi cannella e pizzico di sale. Perfetto 20-30 min prima del workout.',
        obiettivo_fitness: ['endurance', 'cutting'], macro_focus: 'low_carb', fonte: 'database',
        tags: ['simple', 'fast_carbs', 'digestible', 'portable'], rating: 4.2, reviewCount: 134, createdAt: new Date().toISOString()
      },
      {
        id: 'pre_007', nome: 'Frappè Pre-Workout Caffè e Banana', categoria: 'pre_workout', tipoDieta: ['vegetariana', 'balanced'],
        difficolta: 'facile', tempoPreparazione: 5, porzioni: 1, calorie: 185, proteine: 6, carboidrati: 28, grassi: 6,
        ingredienti: ['1 banana', '1 shot espresso freddo', '100ml latte scremato', 'ghiaccio', 'stevia'],
        preparazione: 'Frulla banana, espresso freddo e latte. Aggiungi ghiaccio e stevia. La caffeina dà energia immediata per il workout.',
        obiettivo_fitness: ['cutting', 'strength'], macro_focus: 'low_carb', fonte: 'database',
        tags: ['caffeine_boost', 'pre_workout_drink', 'energy', 'performance'], rating: 4.6, reviewCount: 189, createdAt: new Date().toISOString()
      },
      {
        id: 'pre_008', nome: 'Porridge Express Microonde', categoria: 'pre_workout', tipoDieta: ['vegetariana', 'high_protein'],
        difficolta: 'facile', tempoPreparazione: 3, porzioni: 1, calorie: 225, proteine: 12, carboidrati: 32, grassi: 6,
        ingredienti: ['40g avena istantanea', '20g proteine whey', '150ml latte scremato', 'mirtilli', 'miele'],
        preparazione: 'Mescola avena, proteine e latte in tazza. Microonde 90 secondi. Mescola, aggiungi mirtilli e miele.',
        obiettivo_fitness: ['bulking', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['microwave', 'quick', 'protein_rich', 'convenient'], rating: 4.4, reviewCount: 167, createdAt: new Date().toISOString()
      },

      // 💪 POST-WORKOUT (8 ricette)
      {
        id: 'pos_001', nome: 'Smoothie Recovery Proteico', categoria: 'post_workout', tipoDieta: ['vegetariana', 'high_protein'],
        difficolta: 'facile', tempoPreparazione: 5, porzioni: 1, calorie: 385, proteine: 35, carboidrati: 28, grassi: 12,
        ingredienti: ['30g proteine whey vaniglia', '1 banana', '250ml latte scremato', '1 cucchiaio burro mandorle', 'spinaci', 'ghiaccio'],
        preparazione: 'Frulla tutti ingredienti 60 secondi. Consuma entro 30 min dal workout per massimo assorbimento proteico.',
        obiettivo_fitness: ['bulking', 'strength'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['post_workout', 'recovery', 'protein_synthesis', 'anabolic_window'], rating: 4.9, reviewCount: 267, createdAt: new Date().toISOString()
      },
      {
        id: 'pos_002', nome: 'Yogurt Greco Power Bowl', categoria: 'post_workout', tipoDieta: ['vegetariana', 'high_protein'],
        difficolta: 'facile', tempoPreparazione: 5, porzioni: 1, calorie: 425, proteine: 32, carboidrati: 35, grassi: 16,
        ingredienti: ['200g yogurt greco', '15g granola proteica', 'frutti di bosco', '1 cucchiaio miele', 'mandorle a scaglie'],
        preparazione: 'Versa yogurt in bowl. Aggiungi granola, frutti di bosco e mandorle. Completa con miele per carboidrati veloci.',
        obiettivo_fitness: ['maintenance', 'cutting'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['greek_yogurt', 'probiotics', 'antioxidants', 'muscle_recovery'], rating: 4.7, reviewCount: 198, createdAt: new Date().toISOString()
      },
      {
        id: 'pos_003', nome: 'Pancakes Proteici Post-Workout', categoria: 'post_workout', tipoDieta: ['high_protein', 'balanced'],
        difficolta: 'medio', tempoPreparazione: 12, porzioni: 1, calorie: 445, proteine: 28, carboidrati: 42, grassi: 16,
        ingredienti: ['25g proteine whey', '1 banana', '2 uova', '30g avena', 'latte scremato', 'mirtilli', 'sciroppo acero'],
        preparazione: 'Frulla proteine, banana, uova e avena. Cuoci piccoli pancakes 2 min per lato. Servi con mirtilli e sciroppo.',
        obiettivo_fitness: ['bulking', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['protein_pancakes', 'comfort', 'muscle_building', 'satisfying'], rating: 4.8, reviewCount: 234, createdAt: new Date().toISOString()
      },
      {
        id: 'pos_004', nome: 'Wrap Recovery Tacchino e Hummus', categoria: 'post_workout', tipoDieta: ['high_protein', 'balanced'],
        difficolta: 'facile', tempoPreparazione: 8, porzioni: 1, calorie: 465, proteine: 32, carboidrati: 38, grassi: 18,
        ingredienti: ['1 tortilla integrale', '120g fesa tacchino', '3 cucchiai hummus', 'spinaci', 'pomodori', 'avocado'],
        preparazione: 'Spalma hummus su tortilla. Aggiungi tacchino, spinaci, pomodori e avocado. Arrotola stretto.',
        obiettivo_fitness: ['bulking', 'strength'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['wrap', 'complete_protein', 'portable', 'balanced_macros'], rating: 4.6, reviewCount: 167, createdAt: new Date().toISOString()
      },
      {
        id: 'pos_005', nome: 'Frittata Post-Allenamento', categoria: 'post_workout', tipoDieta: ['keto', 'high_protein'],
        difficolta: 'medio', tempoPreparazione: 15, porzioni: 1, calorie: 385, proteine: 28, carboidrati: 6, grassi: 26,
        ingredienti: ['3 uova', '100g spinaci', '50g formaggio magro', 'pomodorini', 'basilico', 'olio oliva'],
        preparazione: 'Sbatti uova con formaggio. Saltare spinaci 2 min. Versa uova, aggiungi pomodorini. Cuoci 5 min sui fornelli, finisci in forno.',
        obiettivo_fitness: ['cutting', 'strength'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['eggs', 'keto_friendly', 'low_carb', 'nutrient_dense'], rating: 4.5, reviewCount: 145, createdAt: new Date().toISOString()
      },
      {
        id: 'pos_006', nome: 'Bowl di Quinoa e Pollo', categoria: 'post_workout', tipoDieta: ['high_protein', 'balanced'],
        difficolta: 'medio', tempoPreparazione: 20, porzioni: 1, calorie: 485, proteine: 35, carboidrati: 42, grassi: 16,
        ingredienti: ['80g quinoa', '120g petto pollo', 'broccoli', 'carote', 'avocado', 'salsa tahini'],
        preparazione: 'Cuoci quinoa 15 min. Griglia pollo e taglialo. Cuoci verdure al vapore. Componi bowl con tutti ingredienti.',
        obiettivo_fitness: ['bulking', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['complete_meal', 'quinoa', 'balanced_nutrition', 'recovery_fuel'], rating: 4.7, reviewCount: 189, createdAt: new Date().toISOString()
      },
      {
        id: 'pos_007', nome: 'Smoothie Cioccolato e Banana', categoria: 'post_workout', tipoDieta: ['vegetariana', 'high_protein'],
        difficolta: 'facile', tempoPreparazione: 4, porzioni: 1, calorie: 365, proteine: 28, carboidrati: 32, grassi: 14,
        ingredienti: ['25g proteine whey cioccolato', '1 banana', '200ml latte scremato', '1 cucchiaio cacao', 'ghiaccio'],
        preparazione: 'Frulla proteine, banana, latte e cacao. Aggiungi ghiaccio per consistenza cremosa. Perfetto gusto chocolate milkshake.',
        obiettivo_fitness: ['bulking', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['chocolate', 'banana', 'indulgent', 'muscle_recovery'], rating: 4.8, reviewCount: 256, createdAt: new Date().toISOString()
      },
      {
        id: 'pos_008', nome: 'Cottage Cheese Power Bowl', categoria: 'post_workout', tipoDieta: ['vegetariana', 'high_protein'],
        difficolta: 'facile', tempoPreparazione: 5, porzioni: 1, calorie: 325, proteine: 28, carboidrati: 18, grassi: 16,
        ingredienti: ['150g cottage cheese', 'noci', 'miele', 'cannella', 'mela a dadini', 'semi lino'],
        preparazione: 'Versa cottage cheese in bowl. Aggiungi mela, noci e semi di lino. Condisci con miele e cannella.',
        obiettivo_fitness: ['cutting', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['cottage_cheese', 'casein_protein', 'slow_release', 'satisfying'], rating: 4.4, reviewCount: 178, createdAt: new Date().toISOString()
      },

      // 🍎 SPUNTINI (8 ricette)
      {
        id: 'spu_001', nome: 'Hummus con Bastoncini di Verdure', categoria: 'spuntino', tipoDieta: ['vegana', 'low_carb'],
        difficolta: 'facile', tempoPreparazione: 10, porzioni: 1, calorie: 185, proteine: 8, carboidrati: 18, grassi: 8,
        ingredienti: ['100g ceci cotti', 'tahini', 'limone', 'aglio', 'carote', 'sedano', 'peperoni', 'cetrioli'],
        preparazione: 'Frulla ceci con tahini, limone e aglio fino a cremosità. Taglia verdure a bastoncini. Servi hummus con verdure crude.',
        obiettivo_fitness: ['cutting', 'maintenance'], macro_focus: 'low_carb', fonte: 'database',
        tags: ['hummus', 'raw_veggies', 'fiber', 'plant_protein'], rating: 4.3, reviewCount: 145, createdAt: new Date().toISOString()
      },
      {
        id: 'spu_002', nome: 'Apple Slices con Burro di Mandorle', categoria: 'spuntino', tipoDieta: ['paleo', 'balanced'],
        difficolta: 'facile', tempoPreparazione: 3, porzioni: 1, calorie: 245, proteine: 6, carboidrati: 22, grassi: 16,
        ingredienti: ['1 mela Granny Smith', '2 cucchiai burro mandorle', 'cannella', 'miele'],
        preparazione: 'Taglia mela a spicchi. Servi con burro di mandorle per intingere. Spolverizza con cannella e goccia di miele.',
        obiettivo_fitness: ['maintenance', 'endurance'], macro_focus: 'balanced', fonte: 'database',
        tags: ['apple', 'almond_butter', 'natural_sugars', 'portable'], rating: 4.6, reviewCount: 189, createdAt: new Date().toISOString()
      },
      {
        id: 'spu_003', nome: 'Energy Balls Cocco e Lime', categoria: 'spuntino', tipoDieta: ['vegana', 'paleo'],
        difficolta: 'medio', tempoPreparazione: 15, porzioni: 8, calorie: 95, proteine: 3, carboidrati: 12, grassi: 4,
        ingredienti: ['100g datteri', '30g cocco rapè', '20g mandorle', 'buccia lime', 'succo lime', 'olio cocco'],
        preparazione: 'Ammolla datteri 10 min. Frulla con cocco, mandorle e lime. Forma palline, refrigera 30 min per rassodare.',
        obiettivo_fitness: ['endurance', 'maintenance'], macro_focus: 'balanced', fonte: 'database',
        tags: ['energy_balls', 'tropical', 'natural_energy', 'portable'], rating: 4.7, reviewCount: 167, createdAt: new Date().toISOString()
      },
      {
        id: 'spu_004', nome: 'Yogurt Proteico con Noci', categoria: 'spuntino', tipoDieta: ['vegetariana', 'high_protein'],
        difficolta: 'facile', tempoPreparazione: 2, porzioni: 1, calorie: 265, proteine: 18, carboidrati: 12, grassi: 16,
        ingredienti: ['150g yogurt greco', '30g noci', '1 cucchiaino miele', 'cannella'],
        preparazione: 'Versa yogurt in coppetta. Aggiungi noci tritate, miele e cannella. Mix perfetto di proteine e grassi sani.',
        obiettivo_fitness: ['cutting', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['greek_yogurt', 'nuts', 'quick', 'probiotics'], rating: 4.5, reviewCount: 198, createdAt: new Date().toISOString()
      },
      {
        id: 'spu_005', nome: 'Avocado Toast Mini', categoria: 'spuntino', tipoDieta: ['vegetariana', 'balanced'],
        difficolta: 'facile', tempoPreparazione: 5, porzioni: 1, calorie: 285, proteine: 8, carboidrati: 24, grassi: 18,
        ingredienti: ['2 fette pane integrale piccole', '1/2 avocado', 'pomodorini', 'lime', 'sale', 'pepe'],
        preparazione: 'Tosta pane. Schiaccia avocado con lime, sale e pepe. Spalma su toast, guarnisci con pomodorini.',
        obiettivo_fitness: ['maintenance', 'endurance'], macro_focus: 'balanced', fonte: 'database',
        tags: ['avocado_toast', 'healthy_fats', 'fiber', 'trendy'], rating: 4.4, reviewCount: 234, createdAt: new Date().toISOString()
      },
      {
        id: 'spu_006', nome: 'Protein Bites Cioccolato', categoria: 'spuntino', tipoDieta: ['vegetariana', 'high_protein'],
        difficolta: 'medio', tempoPreparazione: 10, porzioni: 6, calorie: 125, proteine: 8, carboidrati: 10, grassi: 6,
        ingredienti: ['25g proteine whey cioccolato', '2 cucchiai burro arachidi', 'avena', 'miele', 'cioccolato chips'],
        preparazione: 'Mescola proteine, burro arachidi e miele. Incorpora avena e chocolate chips. Forma palline, refrigera 20 min.',
        obiettivo_fitness: ['bulking', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['protein_bites', 'chocolate', 'meal_prep', 'satisfying'], rating: 4.8, reviewCount: 156, createdAt: new Date().toISOString()
      },
      {
        id: 'spu_007', nome: 'Smoothie Proteico Verde Piccolo', categoria: 'spuntino', tipoDieta: ['vegana', 'low_carb'],
        difficolta: 'facile', tempoPreparazione: 4, porzioni: 1, calorie: 165, proteine: 15, carboidrati: 12, grassi: 6,
        ingredienti: ['15g proteine vegetali', '100g spinaci', '1/2 banana', '150ml latte mandorla', 'ghiaccio'],
        preparazione: 'Frulla tutti ingredienti 45 secondi. Versione ridotta del smoothie per spuntino leggero ma nutriente.',
        obiettivo_fitness: ['cutting', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['green_smoothie', 'light', 'plant_protein', 'hydrating'], rating: 4.2, reviewCount: 123, createdAt: new Date().toISOString()
      },
      {
        id: 'spu_008', nome: 'Mix di Frutta Secca Proteica', categoria: 'spuntino', tipoDieta: ['paleo', 'keto'],
        difficolta: 'facile', tempoPreparazione: 2, porzioni: 1, calorie: 285, proteine: 12, carboidrati: 8, grassi: 24,
        ingredienti: ['20g mandorle', '15g noci', '10g nocciole', '15g semi zucca', 'pizzico sale marino'],
        preparazione: 'Mescola tutti i tipi di frutta secca e semi. Conserva in contenitore ermetico. Porzione perfetta per spuntino.',
        obiettivo_fitness: ['cutting', 'strength'], macro_focus: 'high_fat', fonte: 'database',
        tags: ['mixed_nuts', 'omega3', 'portable', 'energy_dense'], rating: 4.5, reviewCount: 167, createdAt: new Date().toISOString()
      },

      // 🥤 SMOOTHIES (8 ricette) - Anteprima per collegamento
      {
        id: 'smo_001', nome: 'Smoothie Verde Detox (Preview)', categoria: 'smoothie', tipoDieta: ['vegana', 'low_carb'],
        difficolta: 'facile', tempoPreparazione: 5, porzioni: 1, calorie: 185, proteine: 22, carboidrati: 12, grassi: 8,
        ingredienti: ['Spinaci', 'Mela verde', 'Proteine whey', 'Acqua cocco', 'Limone', 'Zenzero'],
        preparazione: 'Questa è una preview. Vai alla sezione Smoothies & Spuntini FIT per la collezione completa di 20+ smoothies specializzati!',
        obiettivo_fitness: ['cutting', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['preview', 'detox', 'green', 'specializzato'], rating: 4.8, reviewCount: 189, createdAt: new Date().toISOString()
      },

      // 📦 MEAL PREP (8 ricette)
      {
        id: 'mea_001', nome: 'Chicken Meal Prep Containers', categoria: 'meal_prep', tipoDieta: ['high_protein', 'balanced'],
        difficolta: 'medio', tempoPreparazione: 60, porzioni: 5, calorie: 425, proteine: 35, carboidrati: 38, grassi: 14,
        ingredienti: ['750g petto pollo', '400g riso integrale', '500g broccoli', '250g carote', 'olio oliva', 'spezie'],
        preparazione: 'Cuoci riso in grande quantità. Griglia tutto il pollo condito. Cuoci verdure al vapore. Dividi in 5 contenitori. Conserva in frigo 4 giorni.',
        obiettivo_fitness: ['bulking', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['meal_prep', 'batch_cooking', 'containers', 'week_prep'], rating: 4.9, reviewCount: 345, createdAt: new Date().toISOString()
      },
      {
        id: 'mea_002', nome: 'Overnight Oats 5 Varianti', categoria: 'meal_prep', tipoDieta: ['vegetariana', 'balanced'],
        difficolta: 'facile', tempoPreparazione: 25, porzioni: 5, calorie: 285, proteine: 12, carboidrati: 42, grassi: 8,
        ingredienti: ['250g avena', 'Latte mandorla', 'Proteine whey', 'Frutti di bosco', 'Banana', 'Burro mandorle', 'Chia', 'Miele'],
        preparazione: 'Prepara 5 barattoli con combinazioni diverse di avena base + proteine + frutta + grassi sani. Una per ogni giorno lavorativo.',
        obiettivo_fitness: ['maintenance', 'endurance'], macro_focus: 'balanced', fonte: 'database',
        tags: ['overnight_oats', 'breakfast_prep', 'variety', 'grab_and_go'], rating: 4.7, reviewCount: 267, createdAt: new Date().toISOString()
      },
      {
        id: 'mea_003', nome: 'Buddha Bowl Prep Station', categoria: 'meal_prep', tipoDieta: ['vegetariana', 'balanced'],
        difficolta: 'medio', tempoPreparazione: 45, porzioni: 4, calorie: 385, proteine: 16, carboidrati: 48, grassi: 16,
        ingredienti: ['Quinoa', 'Ceci arrostiti', 'Carote julienne', 'Cavolo massaggiato', 'Avocado', 'Semi girasole', 'Tahini', 'Limone'],
        preparazione: 'Cuoci quinoa e ceci. Prepara verdure. Conserva componenti separati. Assembla al momento aggiungendo avocado fresco.',
        obiettivo_fitness: ['maintenance', 'cutting'], macro_focus: 'balanced', fonte: 'database',
        tags: ['buddha_bowls', 'vegetarian', 'assembly', 'colorful'], rating: 4.6, reviewCount: 189, createdAt: new Date().toISOString()
      },
      {
        id: 'mea_004', nome: 'Protein Muffins Batch', categoria: 'meal_prep', tipoDieta: ['high_protein', 'balanced'],
        difficolta: 'medio', tempoPreparazione: 35, porzioni: 12, calorie: 165, proteine: 12, carboidrati: 18, grassi: 6,
        ingredienti: ['200g farina avena', '60g proteine whey', '3 uova', 'Banana', 'Mirtilli', 'Latte scremato', 'Lievito', 'Stevia'],
        preparazione: 'Mescola ingredienti secchi e umidi separatamente. Unisci, versa in stampini muffin. Cuoci 18 min a 180°C. Congela porzioni.',
        obiettivo_fitness: ['bulking', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['protein_muffins', 'batch_baking', 'freezer_friendly', 'grab_snack'], rating: 4.8, reviewCount: 234, createdAt: new Date().toISOString()
      },
      {
        id: 'mea_005', nome: 'Soup Prep - Zuppa di Lenticchie', categoria: 'meal_prep', tipoDieta: ['vegana', 'high_protein'],
        difficolta: 'medio', tempoPreparazione: 40, porzioni: 6, calorie: 245, proteine: 16, carboidrati: 38, grassi: 4,
        ingredienti: ['300g lenticchie rosse', 'Carote', 'Sedano', 'Cipolla', 'Pomodori pelati', 'Brodo vegetale', 'Curcuma', 'Cumino'],
        preparazione: 'Soffriggi verdure, aggiungi lenticchie e liquidi. Simmer 25 min. Frulla parzialmente. Congela in porzioni singole.',
        obiettivo_fitness: ['cutting', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['soup_prep', 'lentils', 'freezer_meal', 'warming'], rating: 4.5, reviewCount: 156, createdAt: new Date().toISOString()
      },
      {
        id: 'mea_006', nome: 'Quinoa Salad Prep Jars', categoria: 'meal_prep', tipoDieta: ['vegetariana', 'balanced'],
        difficolta: 'medio', tempoPreparazione: 30, porzioni: 4, calorie: 325, proteine: 12, carboidrati: 42, grassi: 12,
        ingredienti: ['200g quinoa', 'Pomodorini', 'Cetrioli', 'Feta', 'Olive', 'Basilico', 'Vinaigrette', 'Barattoli grandi'],
        preparazione: 'Cuoci quinoa. Stratifica in barattoli: dressing in fondo, quinoa, verdure, formaggio, verdi in cima. Conserva 4 giorni.',
        obiettivo_fitness: ['maintenance', 'cutting'], macro_focus: 'balanced', fonte: 'database',
        tags: ['mason_jar_salads', 'layered', 'quinoa', 'mediterranean'], rating: 4.4, reviewCount: 167, createdAt: new Date().toISOString()
      },
      {
        id: 'mea_007', nome: 'Power Smoothie Packs Freezer', categoria: 'meal_prep', tipoDieta: ['vegana', 'high_protein'],
        difficolta: 'facile', tempoPreparazione: 20, porzioni: 10, calorie: 185, proteine: 15, carboidrati: 22, grassi: 6,
        ingredienti: ['Spinaci porzioni', 'Frutti bosco congelati', 'Banana a fette', 'Proteine vegetali', 'Semi chia', 'Sacchetti freezer'],
        preparazione: 'Prepara 10 sacchetti con mix di ingredienti congelati. Al mattino aggiungi liquido e frulla. Smoothie pronto in 2 min.',
        obiettivo_fitness: ['cutting', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['smoothie_packs', 'freezer_prep', 'grab_blend', 'morning_rush'], rating: 4.7, reviewCount: 198, createdAt: new Date().toISOString()
      },
      {
        id: 'mea_008', nome: 'Salmon Veggie Bake Sheet Pan', categoria: 'meal_prep', tipoDieta: ['paleo', 'high_protein'],
        difficolta: 'medio', tempoPreparazione: 25, porzioni: 4, calorie: 365, proteine: 28, carboidrati: 18, grassi: 22,
        ingredienti: ['600g filetti salmone', 'Zucchine', 'Peperoni', 'Broccoli', 'Olio oliva', 'Limone', 'Erbe', 'Aglio'],
        preparazione: 'Taglia verdure uniformi. Condisci salmone e verdure. Cuoci su sheet pan 18 min a 200°C. Dividi in contenitori.',
        obiettivo_fitness: ['cutting', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['sheet_pan', 'omega3', 'one_pan', 'easy_cleanup'], rating: 4.8, reviewCount: 234, createdAt: new Date().toISOString()
      },

      // 🥜 SNACK PROTEICI (8 ricette)
      {
        id: 'snk_001', nome: 'Barrette Proteiche Fatte in Casa', categoria: 'snack_proteici', tipoDieta: ['vegetariana', 'high_protein'],
        difficolta: 'medio', tempoPreparazione: 25, porzioni: 8, calorie: 185, proteine: 12, carboidrati: 16, grassi: 8,
        ingredienti: ['60g proteine whey', '100g datteri', '50g mandorle', '30g cocco rapè', 'Burro mandorle', 'Cioccolato fondente'],
        preparazione: 'Frulla datteri fino a pasta. Mescola con proteine, mandorle tritate e cocco. Pressa in teglia, aggiungi cioccolato. Refrigera 2h.',
        obiettivo_fitness: ['bulking', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['protein_bars', 'homemade', 'no_bake', 'portable'], rating: 4.9, reviewCount: 267, createdAt: new Date().toISOString()
      },
      {
        id: 'snk_002', nome: 'Jerky di Tacchino Speziato', categoria: 'snack_proteici', tipoDieta: ['paleo', 'high_protein'],
        difficolta: 'difficile', tempoPreparazione: 240, porzioni: 10, calorie: 85, proteine: 16, carboidrati: 2, grassi: 1,
        ingredienti: ['500g petto tacchino', 'Salsa soia', 'Miele', 'Peperoncino', 'Aglio', 'Zenzero', 'Disidratatore'],
        preparazione: 'Taglia tacchino a strisce sottili. Marina 4h. Disidrata 6-8h a 70°C fino a consistenza jerky. Conserva ermeticamente.',
        obiettivo_fitness: ['cutting', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['jerky', 'dehydrated', 'high_protein', 'long_prep'], rating: 4.6, reviewCount: 145, createdAt: new Date().toISOString()
      },
      {
        id: 'snk_003', nome: 'Edamame Tostati al Sale', categoria: 'snack_proteici', tipoDieta: ['vegana', 'high_protein'],
        difficolta: 'facile', tempoPreparazione: 15, porzioni: 4, calorie: 125, proteine: 12, carboidrati: 8, grassi: 5,
        ingredienti: ['200g edamame sgusciati', 'Sale marino', 'Olio oliva spray', 'Paprika', 'Aglio polvere'],
        preparazione: 'Asciuga edamame. Spruzza olio, condisci con sale e spezie. Tosta in forno 12 min a 200°C fino a croccantezza.',
        obiettivo_fitness: ['cutting', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['edamame', 'crunchy', 'plant_protein', 'roasted'], rating: 4.4, reviewCount: 189, createdAt: new Date().toISOString()
      },
      {
        id: 'snk_004', nome: 'Chips di Parmigiano', categoria: 'snack_proteici', tipoDieta: ['keto', 'high_protein'],
        difficolta: 'facile', tempoPreparazione: 12, porzioni: 4, calorie: 110, proteine: 10, carboidrati: 1, grassi: 7,
        ingredienti: ['100g parmigiano grattugiato', 'Pepe nero', 'Rosmarino secco'],
        preparazione: 'Distribuisci parmigiano in piccoli mucchietti su carta forno. Condisci con spezie. Cuoci 8 min a 200°C fino a doratura.',
        obiettivo_fitness: ['cutting', 'keto'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['cheese_crisps', 'keto_friendly', 'zero_carb', 'crunchy'], rating: 4.7, reviewCount: 198, createdAt: new Date().toISOString()
      },
      {
        id: 'snk_005', nome: 'Muffins Proteici Salati', categoria: 'snack_proteici', tipoDieta: ['vegetariana', 'high_protein'],
        difficolta: 'medio', tempoPreparazione: 25, porzioni: 6, calorie: 145, proteine: 14, carboidrati: 12, grassi: 6,
        ingredienti: ['3 uova', '30g proteine neutre', '50g farina mandorle', 'Spinaci', 'Pomodori secchi', 'Formaggio', 'Lievito'],
        preparazione: 'Sbatti uova con proteine. Aggiungi farina, verdure e formaggio. Versa in stampini, cuoci 18 min a 180°C.',
        obiettivo_fitness: ['cutting', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['savory_muffins', 'egg_based', 'meal_prep', 'portable'], rating: 4.5, reviewCount: 167, createdAt: new Date().toISOString()
      },
      {
        id: 'snk_006', nome: 'Biltong Sudafricano', categoria: 'snack_proteici', tipoDieta: ['paleo', 'high_protein'],
        difficolta: 'difficile', tempoPreparazione: 72, porzioni: 12, calorie: 95, proteine: 18, carboidrati: 0, grassi: 2,
        ingredienti: ['600g manzo taglio magro', 'Aceto', 'Sale grosso', 'Coriandolo', 'Pepe nero'],
        preparazione: 'Marina carne in aceto e spezie 2h. Appendi strisce in luogo ventilato 3 giorni. Alternativa: disidratatore 12h.',
        obiettivo_fitness: ['cutting', 'strength'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['biltong', 'traditional', 'zero_carb', 'artisanal'], rating: 4.8, reviewCount: 123, createdAt: new Date().toISOString()
      },
      {
        id: 'snk_007', nome: 'Hummus Proteico Potenziato', categoria: 'snack_proteici', tipoDieta: ['vegana', 'high_protein'],
        difficolta: 'facile', tempoPreparazione: 8, porzioni: 6, calorie: 95, proteine: 8, carboidrati: 12, grassi: 3,
        ingredienti: ['200g ceci', '20g proteine vegetali neutre', 'Tahini', 'Limone', 'Aglio', 'Cumino'],
        preparazione: 'Frulla ceci con proteine in polvere, tahini e aromi. Aggiungi acqua per consistenza. Servi con verdure crude.',
        obiettivo_fitness: ['cutting', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['protein_hummus', 'plant_based', 'dip', 'enhanced'], rating: 4.3, reviewCount: 156, createdAt: new Date().toISOString()
      },
      {
        id: 'snk_008', nome: 'Seitan Jerky Vegano', categoria: 'snack_proteici', tipoDieta: ['vegana', 'high_protein'],
        difficolta: 'difficile', tempoPreparazione: 180, porzioni: 8, calorie: 105, proteine: 18, carboidrati: 4, grassi: 1,
        ingredienti: ['200g seitan', 'Tamari', 'Fumo liquido', 'Paprika', 'Aglio', 'Sciroppo acero', 'Disidratatore'],
        preparazione: 'Taglia seitan a strisce. Marina in salsa 3h. Disidrata 4-6h fino a consistenza chewy. Snack proteico vegano.',
        obiettivo_fitness: ['cutting', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['vegan_jerky', 'seitan', 'plant_protein', 'innovative'], rating: 4.4, reviewCount: 134, createdAt: new Date().toISOString()
      }
    ];
  };

  const loadAirtableRecipes = async (): Promise<Recipe[]> => {
    try {
      const response = await fetch('/api/airtable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'read',
          table: 'recipes_ai'
        })
      });

      if (!response.ok) return [];

      const result = await response.json();
      if (result.success && result.records) {
        return result.records.map((record: any) => ({
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
      }
      return [];
    } catch (error) {
      console.error('❌ Error loading Airtable recipes:', error);
      return [];
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
      console.error('❌ Error loading favorites:', error);
    }
  };

  // Applicazione filtri
  useEffect(() => {
    let filtered = recipes.filter(recipe => {
      if (searchQuery && !recipe.nome.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !recipe.ingredienti.some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase()))) {
        return false;
      }
      if (selectedDiet && !recipe.tipoDieta.includes(selectedDiet)) return false;
      if (selectedCategory && recipe.categoria !== selectedCategory) return false;
      if (selectedObjective && !recipe.obiettivo_fitness.includes(selectedObjective)) return false;
      if (selectedMacroFocus && recipe.macro_focus !== selectedMacroFocus) return false;
      if (maxTime && recipe.tempoPreparazione > parseInt(maxTime)) return false;
      return true;
    });

    setFilteredRecipes(filtered);
    setCurrentPage(1);
  }, [searchQuery, selectedDiet, selectedCategory, selectedObjective, selectedMacroFocus, maxTime, recipes]);

  const toggleFavorite = async (recipeId: string) => {
    const newFavorites = new Set(favoriteRecipes);
    
    try {
      if (newFavorites.has(recipeId)) {
        // Rimuovi dai preferiti
        newFavorites.delete(recipeId);
        await fetch('/api/airtable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'delete',
            table: 'user_favorites',
            recordId: recipeId
          })
        });
      } else {
        // Controlla limite di 10 preferiti
        if (newFavorites.size >= 10) {
          alert('⚠️ Puoi avere massimo 10 ricette preferite! Rimuovi una ricetta prima di aggiungerne una nuova.');
          return;
        }

        // Aggiungi ai preferiti
        newFavorites.add(recipeId);
        await fetch('/api/airtable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create',
            table: 'user_favorites',
            fields: {
              recipeId: recipeId,
              userId: 'user_001', // In futuro sarà dinamico
              addedAt: new Date().toISOString()
            }
          })
        });
      }
      
      setFavoriteRecipes(newFavorites);
    } catch (error) {
      console.error('❌ Error toggling favorite:', error);
      alert('❌ Errore nel gestire i preferiti. Riprova!');
    }
  };

  const generateAiRecipe = async () => {
    setAiGenerating(true);
    console.log('🤖 Generating AI fitness recipe with data:', aiFormData);
    
    try {
      const response = await fetch('/api/ricette', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generateRecipe',
          data: {
            ingredienti_base: aiFormData.ingredienti.split(',').map(i => i.trim()).filter(i => i),
            calorie_target: getCaloriesForObjective(aiFormData.obiettivo),
            proteine_target: getProteinsForObjective(aiFormData.obiettivo),
            categoria: aiFormData.categoria,
            tempo_max: parseInt(aiFormData.tempo),
            allergie: aiFormData.allergie.split(',').map(a => a.trim()).filter(a => a),
            obiettivo_fitness: aiFormData.obiettivo,
            tipo_dieta: aiFormData.tipoDieta
          }
        })
      });

      const result = await response.json();
      
      if (result.success && result.data?.ricetta) {
        const aiRecipe = result.data.ricetta;
        
        // Salva in Airtable
        const saveResponse = await fetch('/api/airtable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create',
            table: 'recipes_ai',
            fields: {
              nome: aiRecipe.nome,
              categoria: aiFormData.categoria,
              tipoDieta: [aiFormData.tipoDieta],
              difficolta: aiRecipe.difficolta || 'medio',
              tempoPreparazione: parseInt(aiFormData.tempo),
              porzioni: aiRecipe.porzioni || 1,
              calorie: aiRecipe.macros.calorie,
              proteine: aiRecipe.macros.proteine,
              carboidrati: aiRecipe.macros.carboidrati,
              grassi: aiRecipe.macros.grassi,
              ingredienti: Array.isArray(aiRecipe.ingredienti) ? aiRecipe.ingredienti : [],
              preparazione: Array.isArray(aiRecipe.preparazione) ? aiRecipe.preparazione.join('. ') : aiRecipe.preparazione,
              obiettivo_fitness: [aiFormData.obiettivo],
              macro_focus: getMacroFocus(aiFormData.obiettivo),
              tags: ['ai_generated', 'fitness', aiFormData.obiettivo],
              rating: 4.8,
              reviewCount: 1,
              createdAt: new Date().toISOString()
            }
          })
        });

        if (saveResponse.ok) {
          console.log('✅ AI recipe saved to Airtable');
          await loadRecipes(); // Ricarica le ricette
        }

        // Crea oggetto ricetta per visualizzazione immediata
        const newRecipe: Recipe = {
          id: `ai_${Date.now()}`,
          nome: aiRecipe.nome,
          categoria: aiFormData.categoria as any,
          tipoDieta: [aiFormData.tipoDieta],
          difficolta: aiRecipe.difficolta || 'medio',
          tempoPreparazione: parseInt(aiFormData.tempo),
          porzioni: aiRecipe.porzioni || 1,
          calorie: aiRecipe.macros.calorie,
          proteine: aiRecipe.macros.proteine,
          carboidrati: aiRecipe.macros.carboidrati,
          grassi: aiRecipe.macros.grassi,
          ingredienti: Array.isArray(aiRecipe.ingredienti) ? aiRecipe.ingredienti : [],
          preparazione: Array.isArray(aiRecipe.preparazione) ? aiRecipe.preparazione.join('. ') : aiRecipe.preparazione,
          obiettivo_fitness: [aiFormData.obiettivo],
          macro_focus: getMacroFocus(aiFormData.obiettivo),
          fonte: 'ai_generated',
          tags: ['ai_generated', 'fitness'],
          rating: 4.8,
          reviewCount: 1,
          createdAt: new Date().toISOString()
        };

        setSelectedRecipe(newRecipe);
        setShowAiModal(false);
        setShowRecipeModal(true);
        
        // Reset form
        setAiFormData({
          ingredienti: '',
          obiettivo: 'cutting',
          categoria: 'pranzo',
          tempo: '30',
          allergie: '',
          tipoDieta: 'balanced'
        });
        
      } else {
        console.error('❌ AI recipe generation failed:', result.error);
        alert('❌ Errore nella generazione AI. Riprova con ingredienti diversi.');
      }
    } catch (error) {
      console.error('❌ AI generation error:', error);
      alert('🤖 AI temporaneamente non disponibile. Riprova tra poco!');
    } finally {
      setAiGenerating(false);
    }
  };

  const getCaloriesForObjective = (objective: string): number => {
    const calorieMap: { [key: string]: number } = {
      'cutting': 350,
      'maintenance': 500,
      'bulking': 650,
      'endurance': 450,
      'strength': 600
    };
    return calorieMap[objective] || 500;
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

  const getMacroFocus = (objective: string): 'high_protein' | 'low_carb' | 'balanced' | 'high_fat' => {
    const focusMap: { [key: string]: any } = {
      'cutting': 'high_protein',
      'maintenance': 'balanced',
      'bulking': 'high_protein',
      'endurance': 'balanced',
      'strength': 'high_protein'
    };
    return focusMap[objective] || 'balanced';
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedDiet('');
    setSelectedCategory('');
    setSelectedObjective('');
    setSelectedMacroFocus('');
    setMaxTime('');
    setCurrentPage(1);
  };

  const openRecipeModal = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setShowRecipeModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeRecipeModal = () => {
    setSelectedRecipe(null);
    setShowRecipeModal(false);
    document.body.style.overflow = 'unset';
  };

  // Paginazione
  const totalPages = Math.ceil(filteredRecipes.length / recipesPerPage);
  const startIndex = (currentPage - 1) * recipesPerPage;
  const currentRecipes = filteredRecipes.slice(startIndex, startIndex + recipesPerPage);

  // Funzioni di utilità per colori e badge
  const getCategoryColor = (categoria: string) => {
    const colors: { [key: string]: string } = {
      'colazione': 'bg-yellow-100 text-yellow-800',
      'pre_workout': 'bg-red-100 text-red-800',
      'post_workout': 'bg-green-100 text-green-800',
      'pranzo': 'bg-blue-100 text-blue-800',
      'cena': 'bg-purple-100 text-purple-800',
      'spuntino': 'bg-gray-100 text-gray-800',
      'smoothie': 'bg-teal-100 text-teal-800',
      'meal_prep': 'bg-orange-100 text-orange-800',
      'snack_proteici': 'bg-pink-100 text-pink-800'
    };
    return colors[categoria] || 'bg-gray-100 text-gray-800';
  };

  const getMacroFocusColor = (focus: string) => {
    const colors: { [key: string]: string } = {
      'high_protein': 'bg-red-500',
      'low_carb': 'bg-orange-500',
      'balanced': 'bg-green-500',
      'high_fat': 'bg-purple-500'
    };
    return colors[focus] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Caricando Database Ricette FITNESS...</h2>
          <p className="text-gray-400">60+ ricette specializzate + AI infinita in arrivo!</p>
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
            DATABASE RICETTE FITNESS COMPLETO
          </h1>
          <p className="text-xl text-gray-100 mb-6 max-w-4xl mx-auto">
            60+ ricette fitness specializzate + AI infinita per combinazioni illimitate. 
            Dalla colazione al post-workout, ogni ricetta è ottimizzata per performance e risultati concreti!
          </p>

          {/* Stats Dashboard */}
          <div className="bg-white bg-opacity-10 rounded-lg p-4 max-w-4xl mx-auto mb-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-gray-200">
              <div className="text-center">
                <div className="font-semibold text-lg">{filteredRecipes.length}</div>
                <div>Ricette Totali</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">{favoriteRecipes.size}/10</div>
                <div>Preferite</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">{recipes.filter(r => r.fonte === 'ai_generated').length}</div>
                <div>AI Generate</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">{recipes.filter(r => r.proteine >= 30).length}</div>
                <div>High Protein</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">{recipes.filter(r => r.tempoPreparazione <= 15).length}</div>
                <div>Quick (&lt;15min)</div>
              </div>
            </div>
          </div>

          {/* Collegamento Smoothies Specializzato */}
          <div className="bg-gradient-to-r from-teal-600 to-purple-600 rounded-xl p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Droplets className="h-8 w-8 text-white" />
              <h3 className="text-2xl font-bold text-white">Smoothies & Spuntini FIT</h3>
              <Apple className="h-8 w-8 text-white" />
            </div>
            <p className="text-teal-100 mb-4">
              Collezione specializzata: 20+ smoothies energizzanti, frullati proteici, energy balls e spuntini fitness!
            </p>
            <Link 
              href="/ricette/smoothies-spuntini"
              className="inline-flex items-center gap-2 bg-white text-teal-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              <Coffee className="h-5 w-5" />
              Esplora Smoothies FIT
              <Zap className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Categorie Quick Access */}
      <section className="bg-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-6">🎯 Categorie Specializzate</h2>
          <div className="grid grid-cols-3 md:grid-cols-9 gap-4">
            {MEAL_CATEGORIES.map((category) => {
              const Icon = category.icon;
              const count = recipes.filter(r => r.categoria === category.value).length;
              return (
                <button
                  key={category.value}
                  onClick={() => {
                    if (category.value === 'smoothie') {
                      window.location.href = '/ricette/smoothies-spuntini';
                    } else {
                      setSelectedCategory(category.value);
                      setCurrentPage(1);
                    }
                  }}
                  className="flex flex-col items-center p-4 bg-gray-700 hover:bg-gray-600 rounded-xl transition-all duration-300 transform hover:scale-105 border border-gray-600"
                >
                  <div className="text-2xl mb-2">{category.emoji}</div>
                  <Icon className="h-6 w-6 text-green-400 mb-2" />
                  <div className="text-sm font-semibold text-white text-center">{category.label}</div>
                  <div className="text-xs text-gray-400">{count} ricette</div>
                  {category.value === 'smoothie' && (
                    <div className="text-xs text-purple-400 mt-1">📍 Specializzato</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Filtri Avanzati */}
      <section className="bg-gray-800 py-6 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Barra di ricerca principale */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end mb-4">
            <div className="relative md:col-span-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Cerca ricette fitness..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <select
                value={selectedDiet}
                onChange={(e) => setSelectedDiet(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Tipo Dieta</option>
                {DIET_TYPES.map(diet => (
                  <option key={diet.value} value={diet.value}>{diet.label}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Categoria Pasto</option>
                {MEAL_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <select
                value={selectedObjective}
                onChange={(e) => setSelectedObjective(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Obiettivo Fitness</option>
                {FITNESS_OBJECTIVES.map(obj => (
                  <option key={obj.value} value={obj.value}>{obj.label}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <select
                value={maxTime}
                onChange={(e) => setMaxTime(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Tempo Max</option>
                <option value="10">≤ 10 min</option>
                <option value="20">≤ 20 min</option>
                <option value="30">≤ 30 min</option>
                <option value="45">≤ 45 min</option>
                <option value="60">≤ 60 min</option>
              </select>
            </div>

            <div className="md:col-span-1">
              <button
                onClick={() => setShowAiModal(true)}
                disabled={aiGenerating}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-2 rounded-lg transition-colors font-semibold flex items-center justify-center gap-2"
                title="Genera ricetta con AI"
              >
                {aiGenerating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>🤖 AI</>
                )}
              </button>
            </div>
          </div>

          {/* Filtri veloci */}
          <div className="grid grid-cols-2 md:grid-cols-8 gap-3">
            <button
              onClick={() => {
                const favoritesList = Array.from(favoriteRecipes);
                const favRecipes = recipes.filter(r => favoritesList.includes(r.id));
                setFilteredRecipes(favRecipes);
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              ❤️ Preferiti ({favoriteRecipes.size})
            </button>

            <button
              onClick={() => {
                const highProteinRecipes = recipes.filter(r => r.proteine >= 30);
                setFilteredRecipes(highProteinRecipes);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              💪 High Protein
            </button>

            <button
              onClick={() => {
                const quickRecipes = recipes.filter(r => r.tempoPreparazione <= 15);
                setFilteredRecipes(quickRecipes);
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              ⚡ Quick
            </button>

            <button
              onClick={() => {
                const workoutRecipes = recipes.filter(r => r.categoria === 'pre_workout' || r.categoria === 'post_workout');
                setFilteredRecipes(workoutRecipes);
              }}
              className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              🏋️ Workout
            </button>

            <button
              onClick={() => {
                const mealPrepRecipes = recipes.filter(r => r.categoria === 'meal_prep');
                setFilteredRecipes(mealPrepRecipes);
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              📦 Meal Prep
            </button>

            <button
              onClick={() => {
                const ketoRecipes = recipes.filter(r => r.tipoDieta.includes('keto'));
                setFilteredRecipes(ketoRecipes);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              🥑 Keto
            </button>

            <button
              onClick={() => {
                const aiRecipes = recipes.filter(r => r.fonte === 'ai_generated');
                setFilteredRecipes(aiRecipes);
              }}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              🤖 AI Generated
            </button>

            {(searchQuery || selectedDiet || selectedCategory || selectedObjective || maxTime) && (
              <button
                onClick={resetFilters}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                🗑️ Reset
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Grid Ricette */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {currentRecipes.length === 0 ? (
            <div className="text-center py-12">
              <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-300 mb-2">Nessuna ricetta trovata</h3>
              <p className="text-gray-400 mb-4">Prova a modificare i filtri o genera una ricetta con AI</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={resetFilters}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  Reset Filtri
                </button>
                <button
                  onClick={() => setShowAiModal(true)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  🤖 Genera con AI
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentRecipes.map((recipe) => (
                  <div key={recipe.id} className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-700">
                    {/* Header Card - SENZA IMMAGINE */}
                    <div className="relative p-4 bg-gradient-to-br from-green-600 to-blue-600">
                      {/* Bottone Preferito */}
                      <button
                        onClick={() => toggleFavorite(recipe.id)}
                        className="absolute top-3 right-3 p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-all"
                      >
                        <Heart
                          className={`h-5 w-5 ${
                            favoriteRecipes.has(recipe.id)
                              ? 'text-red-500 fill-current'
                              : 'text-white'
                          }`}
                        />
                      </button>

                      {/* Badge Categoria e Fonte */}
                      <div className="flex justify-between items-start mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCategoryColor(recipe.categoria)}`}>
                          {MEAL_CATEGORIES.find(c => c.value === recipe.categoria)?.label || recipe.categoria}
                        </span>
                        {recipe.fonte === 'ai_generated' && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                            🤖 AI
                          </span>
                        )}
                      </div>

                      {/* Titolo */}
                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 min-h-[3.5rem]">
                        {recipe.nome}
                      </h3>

                      {/* Rating */}
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-white ml-1 font-semibold">
                            {recipe.rating.toFixed(1)}
                          </span>
                        </div>
                        <span className="text-gray-200">•</span>
                        <span className="text-sm text-gray-200">
                          {recipe.reviewCount} recensioni
                        </span>
                      </div>
                    </div>

                    {/* Contenuto Nutrizionale */}
                    <div className="p-4">
                      {/* Macronutrienti Principali */}
                      <div className="grid grid-cols-4 gap-2 mb-4 text-xs">
                        <div className="text-center bg-gray-700 rounded-lg py-2">
                          <div className="font-semibold text-white">{recipe.calorie}</div>
                          <div className="text-gray-400">kcal</div>
                        </div>
                        <div className="text-center bg-blue-700 rounded-lg py-2">
                          <div className="font-semibold text-white">{recipe.proteine}g</div>
                          <div className="text-gray-300">Prot</div>
                        </div>
                        <div className="text-center bg-purple-700 rounded-lg py-2">
                          <div className="font-semibold text-white">{recipe.carboidrati}g</div>
                          <div className="text-gray-300">Carb</div>
                        </div>
                        <div className="text-center bg-yellow-700 rounded-lg py-2">
                          <div className="font-semibold text-white">{recipe.grassi}g</div>
                          <div className="text-gray-300">Fat</div>
                        </div>
                      </div>

                      {/* Info Tempo e Difficoltà */}
                      <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{recipe.tempoPreparazione} min</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Target className="h-4 w-4" />
                          <span className="capitalize">{recipe.difficolta}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{recipe.porzioni} porz.</span>
                        </div>
                      </div>

                      {/* Badge Obiettivi Fitness */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {recipe.obiettivo_fitness.slice(0, 2).map((obj) => {
                          const objective = FITNESS_OBJECTIVES.find(o => o.value === obj);
                          return (
                            <span key={obj} className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${objective?.color ? `text-white` : 'text-gray-300'}`}
                                  style={{ backgroundColor: objective?.color?.replace('text-', '') || '#6B7280' }}>
                              {objective && <objective.icon size={12} />}
                              {objective?.label.split('/')[0] || obj}
                            </span>
                          );
                        })}
                      </div>

                      {/* Macro Focus Indicator */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${getMacroFocusColor(recipe.macro_focus)}`}></div>
                          <span className="text-xs text-gray-400 capitalize">
                            {recipe.macro_focus.replace('_', ' ')}
                          </span>
                        </div>
                        {recipe.fonte === 'ai_generated' && (
                          <span className="text-xs text-purple-400">
                            <Zap size={12} className="inline mr-1" />
                            AI Generated
                          </span>
                        )}
                      </div>

                      {/* Bottone Visualizza */}
                      <button
                        onClick={() => openRecipeModal(recipe)}
                        className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-2 px-4 rounded-lg transition-all font-semibold flex items-center justify-center space-x-2"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Vedi Ricetta Completa</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginazione */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                    >
                      Precedente
                    </button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-2 rounded-lg transition-colors ${
                              currentPage === pageNum
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      {totalPages > 5 && (
                        <>
                          <span className="text-gray-400">...</span>
                          <button
                            onClick={() => setCurrentPage(totalPages)}
                            className={`px-3 py-2 rounded-lg transition-colors ${
                              currentPage === totalPages
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                    >
                      Successiva
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Modal Generazione AI */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            {/* Header Modal */}
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">🤖 Generatore AI Ricette FITNESS</h2>
              <button
                onClick={() => setShowAiModal(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            {/* Contenuto Modal */}
            <div className="p-6">
              <p className="text-gray-300 mb-6">
                Crea ricette fitness personalizzate con AI! Ricette ottimizzate da fonti specializzate: preparatori atletici, nutrizionisti sportivi e influencer fitness.
              </p>

              <div className="space-y-4">
                {/* Ingredienti */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    🥬 Ingredienti disponibili (separati da virgola)
                  </label>
                  <input
                    type="text"
                    placeholder="es. pollo, broccoli, quinoa, avocado, proteine whey"
                    value={aiFormData.ingredienti}
                    onChange={(e) => setAiFormData(prev => ({...prev, ingredienti: e.target.value}))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Grid campi */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Obiettivo FITNESS */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">🎯 Obiettivo FITNESS</label>
                    <select
                      value={aiFormData.obiettivo}
                      onChange={(e) => setAiFormData(prev => ({...prev, obiettivo: e.target.value}))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {FITNESS_OBJECTIVES.map(obj => (
                        <option key={obj.value} value={obj.value}>{obj.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Categoria */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">🍽️ Categoria</label>
                    <select
                      value={aiFormData.categoria}
                      onChange={(e) => setAiFormData(prev => ({...prev, categoria: e.target.value}))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {MEAL_CATEGORIES.filter(cat => cat.value !== 'smoothie').map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Tipo Dieta */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">🥗 Tipo Dieta</label>
                    <select
                      value={aiFormData.tipoDieta}
                      onChange={(e) => setAiFormData(prev => ({...prev, tipoDieta: e.target.value}))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="balanced">Bilanciata</option>
                      {DIET_TYPES.map(diet => (
                        <option key={diet.value} value={diet.value}>{diet.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Tempo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">⏱️ Tempo Max</label>
                    <select
                      value={aiFormData.tempo}
                      onChange={(e) => setAiFormData(prev => ({...prev, tempo: e.target.value}))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="15">15 minuti</option>
                      <option value="30">30 minuti</option>
                      <option value="45">45 minuti</option>
                      <option value="60">60 minuti</option>
                    </select>
                  </div>
                </div>

                {/* Allergie */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">⚠️ Allergie/Da Evitare</label>
                  <input
                    type="text"
                    placeholder="es. glutine, lattosio, noci, crostacei"
                    value={aiFormData.allergie}
                    onChange={(e) => setAiFormData(prev => ({...prev, allergie: e.target.value}))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Pulsanti */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setShowAiModal(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg transition-colors"
                  >
                    Annulla
                  </button>
                  <button
                    onClick={generateAiRecipe}
                    disabled={aiGenerating || !aiFormData.ingredienti.trim()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg transition-colors font-semibold flex items-center justify-center space-x-2"
                  >
                    {aiGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Generando...</span>
                      </>
                    ) : (
                      <>
                        <span>🤖</span>
                        <span>Genera Ricetta FITNESS</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Info AI */}
              <div className="mt-6 p-4 bg-blue-600 bg-opacity-20 rounded-lg border border-blue-600 border-opacity-30">
                <h4 className="text-blue-400 font-semibold mb-2">💡 AI FITNESS SPECIALIZZATA:</h4>
                <ul className="text-blue-200 text-sm space-y-1">
                  <li>• Ricette da fonti fitness specializzate (preparatori, atleti, nutrizionisti sportivi)</li>
                  <li>• Ottimizzazione automatica per obiettivo specifico (cutting/bulking/performance)</li>
                  <li>• Calcolo preciso macronutrienti per timing ottimale</li>
                  <li>• Ingredienti performance-oriented con focus sulla qualità</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ricetta Dettagliata - SENZA IMMAGINE */}
      {showRecipeModal && selectedRecipe && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            {/* Header Modal */}
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">{selectedRecipe.nome}</h2>
                <div className="flex items-center space-x-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCategoryColor(selectedRecipe.categoria)}`}>
                    {MEAL_CATEGORIES.find(c => c.value === selectedRecipe.categoria)?.label || selectedRecipe.categoria}
                  </span>
                  {selectedRecipe.fonte === 'ai_generated' && (
                    <span className="px-2 py-1 bg-purple-600 text-white rounded-full text-xs font-semibold">
                      🤖 AI Generated
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

            {/* Contenuto Modal */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Colonna 1 - Info Nutrizionali e Caratteristiche */}
                <div>
                  {/* Macronutrienti Dettagliati */}
                  <div className="bg-gray-700 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Flame className="h-5 w-5 text-orange-500" />
                      Valori Nutrizionali
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
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

                  {/* Info Caratteristiche */}
                  <div className="bg-gray-700 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-semibold text-white mb-3">📋 Caratteristiche</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 flex items-center gap-2">
                          <Clock size={16} />
                          Tempo:
                        </span>
                        <span className="text-white font-medium">{selectedRecipe.tempoPreparazione} minuti</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 flex items-center gap-2">
                          <Users size={16} />
                          Porzioni:
                        </span>
                        <span className="text-white font-medium">{selectedRecipe.porzioni}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 flex items-center gap-2">
                          <Target size={16} />
                          Difficoltà:
                        </span>
                        <span className="text-white font-medium capitalize">{selectedRecipe.difficolta}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 flex items-center gap-2">
                          <Activity size={16} />
                          Focus Macro:
                        </span>
                        <span className="text-white font-medium capitalize">{selectedRecipe.macro_focus.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Obiettivi Fitness */}
                  <div className="bg-gradient-to-br from-green-800 to-blue-800 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Dumbbell className="h-5 w-5" />
                      Obiettivi FITNESS
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedRecipe.obiettivo_fitness.map((obj) => {
                        const objective = FITNESS_OBJECTIVES.find(o => o.value === obj);
                        return (
                          <span key={obj} className="px-3 py-2 bg-white bg-opacity-20 text-white rounded-full text-sm font-medium flex items-center gap-2">
                            {objective && <objective.icon size={14} />}
                            {objective?.label || obj}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Colonna 2 - Ingredienti */}
                <div>
                  <div className="bg-gray-700 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <ChefHat className="h-5 w-5 text-green-400" />
                      Ingredienti
                    </h3>
                    <ul className="space-y-3">
                      {selectedRecipe.ingredienti.map((ingrediente, index) => (
                        <li key={index} className="flex items-start space-x-3 bg-gray-600 p-3 rounded-lg">
                          <span className="text-green-400 mt-1 font-bold">•</span>
                          <span className="text-gray-200 flex-1">{ingrediente}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Tags e Dieta */}
                  <div className="space-y-4">
                    {/* Tipo Dieta */}
                    {selectedRecipe.tipoDieta.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-300 mb-2">🥗 Tipo Dieta</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedRecipe.tipoDieta.map((dieta) => {
                            const dietType = DIET_TYPES.find(d => d.value === dieta);
                            return (
                              <span key={dieta} className={`px-3 py-1 rounded-full text-sm font-medium ${dietType?.color || 'bg-gray-100 text-gray-800'}`}>
                                {dietType?.label || dieta}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {selectedRecipe.tags.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-300 mb-2">🏷️ Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedRecipe.tags.map((tag) => (
                            <span key={tag} className="px-3 py-1 bg-gray-600 text-gray-300 rounded-full text-sm">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Colonna 3 - Preparazione */}
                <div>
                  <div className="bg-gray-700 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-400" />
                      Preparazione Step-by-Step
                    </h3>
                    <div className="text-gray-200 leading-relaxed">
                      {selectedRecipe.preparazione.split('. ').map((step, index) => (
                        <div key={index} className="mb-3 p-3 bg-gray-600 rounded-lg">
                          <div className="flex gap-3">
                            <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                              {index + 1}
                            </span>
                            <p className="text-sm">{step.trim()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Tempo evidenziato */}
                    <div className="mt-4 p-3 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg">
                      <div className="flex items-center space-x-2 text-white">
                        <Clock className="h-5 w-5" />
                        <span className="font-semibold">Tempo totale: {selectedRecipe.tempoPreparazione} minuti</span>
                      </div>
                    </div>
                  </div>

                  {/* Azioni */}
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-3">🎯 Azioni</h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => toggleFavorite(selectedRecipe.id)}
                        className={`w-full py-2 px-4 rounded-lg transition-colors font-semibold flex items-center justify-center gap-2 ${
                          favoriteRecipes.has(selectedRecipe.id)
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-gray-600 hover:bg-gray-500 text-white'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${favoriteRecipes.has(selectedRecipe.id) ? 'fill-current' : ''}`} />
                        {favoriteRecipes.has(selectedRecipe.id) ? 'Rimuovi da Preferiti' : 'Aggiungi ai Preferiti'}
                      </button>

                      <button
                        onClick={() => {
                          const recipeText = `RICETTA FITNESS: ${selectedRecipe.nome}\n\n` +
                            `MACROS: ${selectedRecipe.calorie}kcal | ${selectedRecipe.proteine}g prot | ${selectedRecipe.carboidrati}g carb | ${selectedRecipe.grassi}g fat\n\n` +
                            `INGREDIENTI:\n${selectedRecipe.ingredienti.map(ing => `• ${ing}`).join('\n')}\n\n` +
                            `PREPARAZIONE:\n${selectedRecipe.preparazione}\n\n` +
                            `⏱️ Tempo: ${selectedRecipe.tempoPreparazione} min | 🍽️ Porzioni: ${selectedRecipe.porzioni}`;
                          
                          navigator.clipboard.writeText(recipeText);
                          alert('✅ Ricetta copiata negli appunti!');
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors font-semibold flex items-center justify-center gap-2"
                      >
                        📋 Copia Ricetta
                      </button>

                      <button
                        onClick={() => {
                          const whatsappText = `💪 RICETTA FITNESS: ${selectedRecipe.nome}\n\n` +
                            `📊 ${selectedRecipe.calorie}kcal | ${selectedRecipe.proteine}g proteine\n` +
                            `⏱️ ${selectedRecipe.tempoPreparazione} minuti\n\n` +
                            `Perfetta per: ${selectedRecipe.obiettivo_fitness.join(', ')}\n\n` +
                            `Generata con Meal Prep Planner AI 🤖`;
                          
                          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
                          window.open(whatsappUrl, '_blank');
                        }}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors font-semibold flex items-center justify-center gap-2"
                      >
                        📱 Condividi WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <div className="flex justify-center items-center gap-3 mb-4">
              <ChefHat className="h-8 w-8 text-green-400" />
              <h3 className="text-xl font-bold text-white">Database Ricette FITNESS Completo</h3>
            </div>
            <p className="text-gray-400 mb-4 max-w-2xl mx-auto">
              60+ ricette ottimizzate da fonti fitness specializzate + AI infinita per performance, recovery e risultati concreti. 
              Ogni ricetta è calibrata per obiettivi specifici di allenamento.
            </p>
          </div>

          {/* Stats Footer */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{recipes.length}</div>
              <div className="text-gray-400 text-sm">Ricette Totali</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{recipes.filter(r => r.fonte === 'ai_generated').length}</div>
              <div className="text-gray-400 text-sm">AI Generated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{recipes.filter(r => r.proteine >= 30).length}</div>
              <div className="text-gray-400 text-sm">High Protein</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{favoriteRecipes.size}/10</div>
              <div className="text-gray-400 text-sm">Preferiti</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-400">{recipes.filter(r => r.categoria === 'meal_prep').length}</div>
              <div className="text-gray-400 text-sm">Meal Prep</div>
            </div>
          </div>

          {/* Links Footer */}
          <div className="flex justify-center gap-6 text-sm border-t border-gray-700 pt-6">
            <Link href="/" className="text-gray-400 hover:text-green-400 transition-colors">
              Home
            </Link>
            <Link href="/dashboard" className="text-gray-400 hover:text-green-400 transition-colors">
              Dashboard
            </Link>
            <Link href="/ricette/smoothies-spuntini" className="text-gray-400 hover:text-teal-400 transition-colors">
              🥤 Smoothies & Spuntini FIT
            </Link>
            <Link href="/privacy" className="text-gray-400 hover:text-green-400 transition-colors">
              Privacy
            </Link>
          </div>

          {/* Disclaimer */}
          <div className="text-center mt-6 pt-6 border-t border-gray-700">
            <p className="text-gray-500 text-xs">
              Le ricette sono ottimizzate per obiettivi fitness. Consulta sempre un nutrizionista per piani personalizzati.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
                          