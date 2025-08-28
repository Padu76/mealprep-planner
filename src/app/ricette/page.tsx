'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Clock, Users, Star, ChefHat, Search, X, Eye, Filter, Zap, Target, Activity, TrendingUp, Dumbbell, Flame, Droplets, Apple, Coffee, Utensils, Beef, Fish, Wheat, Salad, Sparkles, Settings, Plus } from 'lucide-react';

interface Recipe {
  id: string;
  nome: string;
  categoria: 'colazione' | 'pranzo' | 'cena' | 'spuntino' | 'pre_workout' | 'post_workout' | 'smoothie';
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
  fonte_fitness: string;
  timing_workout: string;
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
  { value: 'colazione', label: 'Colazione', icon: Coffee, emoji: '🌅' },
  { value: 'pre_workout', label: 'Pre-Workout', icon: Zap, emoji: '⚡' },
  { value: 'post_workout', label: 'Post-Workout', icon: Dumbbell, emoji: '💪' },
  { value: 'pranzo', label: 'Pranzo', icon: Utensils, emoji: '☀️' },
  { value: 'cena', label: 'Cena', icon: Utensils, emoji: '🌙' },
  { value: 'spuntino', label: 'Spuntino', icon: Apple, emoji: '🍎' },
  { value: 'smoothie', label: 'Smoothies', icon: Droplets, emoji: '🥤' },
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

const FITNESS_SOURCES = [
  { value: 'bodybuilding', label: 'Bodybuilding Pro' },
  { value: 'powerlifting', label: 'Powerlifting' },
  { value: 'crossfit', label: 'CrossFit Athletes' },
  { value: 'endurance', label: 'Endurance Sports' },
  { value: 'fitness_influencer', label: 'Fitness Influencers' },
  { value: 'nutrizionista_sportivo', label: 'Sports Nutritionist' },
  { value: 'preparatore_atletico', label: 'Athletic Trainer' },
];

const WORKOUT_TIMING = [
  { value: 'pre_workout_30min', label: '30min Pre-Workout' },
  { value: 'pre_workout_60min', label: '60min Pre-Workout' },
  { value: 'post_workout_immediate', label: 'Post-Workout Immediato' },
  { value: 'post_workout_2h', label: 'Post-Workout 2h' },
  { value: 'rest_day', label: 'Giorno di Riposo' },
  { value: 'any_time', label: 'Qualsiasi Momento' },
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
    fonte_fitness: 'nutrizionista_sportivo',
    timing_workout: 'any_time',
    numero_ricette: 6
  });

  // Caricamento ricette signature (30 ricette - ~4 per categoria inclusi smoothies)
  useEffect(() => {
    loadSignatureRecipes();
    loadAiGeneratedRecipes();
    loadFavorites();
  }, []);

  const loadSignatureRecipes = () => {
    const signatures: Recipe[] = [
      // COLAZIONI SIGNATURE (4)
      {
        id: 'sig_col_001', nome: 'Pancakes Proteici Avena e Banana', categoria: 'colazione', tipoDieta: ['high_protein', 'balanced'],
        difficolta: 'medio', tempoPreparazione: 15, porzioni: 1, calorie: 485, proteine: 32, carboidrati: 48, grassi: 16,
        ingredienti: ['60g fiocchi avena', '30g proteine whey vaniglia', '1 banana matura', '2 uova', '150ml latte scremato', 'mirtilli freschi'],
        preparazione: 'Frulla avena fino a ottenere farina fine. Aggiungi proteine whey, banana schiacciata e uova sbattute. Incorpora latte scremato gradualmente. Lascia riposare impasto 5 min per idratazione. Cuoci piccoli pancakes in padella antiaderente per 2-3 min per lato. Servi caldi con mirtilli freschi.',
        obiettivo_fitness: ['bulking', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['pancakes', 'proteici', 'colazione', 'muscle_building'], rating: 4.8, reviewCount: 267, createdAt: new Date().toISOString()
      },
      {
        id: 'sig_col_002', nome: 'Overnight Oats Burro di Mandorle e Chia', categoria: 'colazione', tipoDieta: ['vegetariana', 'balanced'],
        difficolta: 'facile', tempoPreparazione: 5, porzioni: 1, calorie: 425, proteine: 18, carboidrati: 38, grassi: 22,
        ingredienti: ['50g fiocchi avena', '200ml latte mandorla', '1 cucchiaio semi chia', '2 cucchiai burro mandorle', 'frutti di bosco', 'miele'],
        preparazione: 'Mescola avena, latte di mandorla, semi di chia e burro di mandorle in barattolo di vetro. Riponi in frigo per almeno 4 ore o overnight. Al mattino aggiungi frutti di bosco freschi e un filo di miele. Perfetto per meal prep settimanale.',
        obiettivo_fitness: ['maintenance', 'endurance'], macro_focus: 'balanced', fonte: 'database',
        tags: ['overnight_oats', 'prep_ahead', 'omega3'], rating: 4.6, reviewCount: 189, createdAt: new Date().toISOString()
      },
      {
        id: 'sig_col_003', nome: 'Uova Strapazzate Spinaci e Feta', categoria: 'colazione', tipoDieta: ['keto', 'low_carb'],
        difficolta: 'facile', tempoPreparazione: 8, porzioni: 1, calorie: 385, proteine: 28, carboidrati: 6, grassi: 28,
        ingredienti: ['3 uova grandi', '100g spinaci baby', '40g feta', '1 cucchiaio olio oliva', 'aglio', 'pomodorini', 'basilico'],
        preparazione: 'Soffriggi aglio tritato in olio oliva. Aggiungi spinaci e cuoci 2 min fino ad appassimento. Sbatti uova in bowl e versa in padella. Mescola delicatamente con spatola, aggiungi feta a pezzetti negli ultimi 30 secondi. Guarnisci con pomodorini e basilico.',
        obiettivo_fitness: ['cutting', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['uova', 'keto', 'veloce', 'low_carb'], rating: 4.7, reviewCount: 145, createdAt: new Date().toISOString()
      },
      {
        id: 'sig_col_004', nome: 'Smoothie Bowl Acai Power', categoria: 'colazione', tipoDieta: ['vegana', 'high_protein'],
        difficolta: 'medio', tempoPreparazione: 10, porzioni: 1, calorie: 445, proteine: 22, carboidrati: 52, grassi: 16,
        ingredienti: ['100g polpa acai congelata', '20g proteine vegetali frutti bosco', '1/2 banana congelata', '15g granola', '10g semi chia', 'mirtilli freschi', 'mandorle lamelle'],
        preparazione: 'Frulla acai congelato, proteine vegetali e banana con pochissimo liquido per ottenere consistenza densa come gelato. Versa in bowl fredda. Disponi artisticamente granola, semi di chia, mirtilli e mandorle creando sezioni colorate. Consumare immediatamente.',
        obiettivo_fitness: ['cutting', 'endurance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['acai_bowl', 'antiossidanti', 'superfood'], rating: 4.8, reviewCount: 234, createdAt: new Date().toISOString()
      },

      // SMOOTHIES SIGNATURE (5)
      {
        id: 'sig_smo_001', nome: 'Green Power Smoothie Spinaci e Mela', categoria: 'smoothie', tipoDieta: ['vegana', 'low_carb'],
        difficolta: 'facile', tempoPreparazione: 5, porzioni: 1, calorie: 245, proteine: 25, carboidrati: 18, grassi: 8,
        ingredienti: ['25g proteine whey vaniglia', '150g spinaci baby freschi', '1 mela verde', '200ml acqua cocco', '1/2 avocado piccolo', 'succo 1/2 limone', 'zenzero fresco', 'ghiaccio'],
        preparazione: 'Lava accuratamente spinaci. Pela mela e taglia a pezzi. Frulla tutti gli ingredienti ad alta velocità per 90 secondi fino a consistenza completamente liscia. Aggiungi ghiaccio e frulla altri 30 secondi. Il sapore deve essere bilanciato: dolce della mela con freschezza degli spinaci.',
        obiettivo_fitness: ['cutting', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['detox', 'verde', 'antiossidante'], rating: 4.6, reviewCount: 189, createdAt: new Date().toISOString()
      },
      {
        id: 'sig_smo_002', nome: 'Protein Smoothie Banana Cioccolato', categoria: 'smoothie', tipoDieta: ['vegetariana', 'high_protein'],
        difficolta: 'facile', tempoPreparazione: 4, porzioni: 1, calorie: 485, proteine: 32, carboidrati: 38, grassi: 18,
        ingredienti: ['30g proteine whey cioccolato', '1 banana matura grande', '2 cucchiai burro mandorle', '250ml latte mandorla', '1 cucchiaio cacao crudo', 'ghiaccio', 'cannella'],
        preparazione: 'Pela banana e tagliala a rondelle. Frulla banana, proteine al cioccolato, burro di mandorle e latte per 60 secondi. Aggiungi cacao crudo e cannella. Incorpora ghiaccio e frulla altri 30 secondi. Consistenza deve essere cremosa ma bevibile.',
        obiettivo_fitness: ['bulking', 'post_workout'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['post_workout', 'recovery', 'cioccolato'], rating: 4.9, reviewCount: 267, createdAt: new Date().toISOString()
      },
      {
        id: 'sig_smo_003', nome: 'Tropical Mango Smoothie', categoria: 'smoothie', tipoDieta: ['vegana', 'balanced'],
        difficolta: 'facile', tempoPreparazione: 5, porzioni: 1, calorie: 365, proteine: 15, carboidrati: 45, grassi: 14,
        ingredienti: ['150g mango congelato', '20g proteine vegetali vaniglia', '100ml latte cocco', '100ml acqua cocco', 'succo 1/2 lime', 'zenzero fresco', 'menta'],
        preparazione: 'Frulla mango congelato con proteine vegetali e latte di cocco fino a cremosità. Aggiungi acqua di cocco, lime e zenzero grattugiato. Frulla 60 secondi. Guarnisci con foglie di menta fresca. Perfetto per idratazione post-allenamento estivo.',
        obiettivo_fitness: ['endurance', 'maintenance'], macro_focus: 'balanced', fonte: 'database',
        tags: ['tropicale', 'hydration', 'summer'], rating: 4.5, reviewCount: 178, createdAt: new Date().toISOString()
      },
      {
        id: 'sig_smo_004', nome: 'Pre-Workout Energy Smoothie', categoria: 'smoothie', tipoDieta: ['balanced', 'high_protein'],
        difficolta: 'facile', tempoPreparazione: 4, porzioni: 1, calorie: 295, proteine: 20, carboidrati: 28, grassi: 12,
        ingredienti: ['20g proteine whey neutro', '1 banana piccola', '200ml latte scremato', '1 cucchiaio miele', '1 shot espresso freddo', 'cannella', 'ghiaccio'],
        preparazione: 'Prepara espresso e lascia raffreddare. Frulla banana, proteine, latte e miele per 45 secondi. Aggiungi espresso freddo e cannella. Incorpora ghiaccio e frulla brevemente. Consumare 30-45 min prima del workout per energia ottimale.',
        obiettivo_fitness: ['strength', 'endurance'], macro_focus: 'balanced', fonte: 'database',
        tags: ['pre_workout', 'energy', 'caffeina'], rating: 4.7, reviewCount: 156, createdAt: new Date().toISOString()
      },
      {
        id: 'sig_smo_005', nome: 'Recovery Smoothie Ciliegie', categoria: 'smoothie', tipoDieta: ['vegetariana', 'high_protein'],
        difficolta: 'medio', tempoPreparazione: 6, porzioni: 1, calorie: 325, proteine: 24, carboidrati: 32, grassi: 8,
        ingredienti: ['150g ciliegie denocciolate congelate', '25g proteine whey vaniglia', '200ml latte mandorla', '1 cucchiaino curcuma', 'zenzero fresco', 'miele'],
        preparazione: 'Le ciliegie congelate danno consistenza perfetta. Frulla ciliegie con proteine e latte di mandorla. Aggiungi curcuma, zenzero grattugiato e miele. Frulla 90 secondi. Il mix ciliegie-curcuma è potente antinfiammatorio per recovery muscolare.',
        obiettivo_fitness: ['recovery', 'anti_inflammatory'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['recovery', 'anti_inflammatory', 'ciliegie'], rating: 4.6, reviewCount: 198, createdAt: new Date().toISOString()
      },

      // PRANZI SIGNATURE (4)
      {
        id: 'sig_pra_001', nome: 'Pollo Grigliato Quinoa e Verdure', categoria: 'pranzo', tipoDieta: ['high_protein', 'balanced'],
        difficolta: 'medio', tempoPreparazione: 25, porzioni: 1, calorie: 485, proteine: 38, carboidrati: 45, grassi: 12,
        ingredienti: ['150g petto pollo', '80g quinoa', '100g broccoli', '50g carote', '1 cucchiaio olio EVO', 'spezie miste', 'limone'],
        preparazione: 'Marina petto di pollo con spezie miste per 15 min. Cuoci quinoa in brodo vegetale per 15 min. Griglia pollo per 6-7 min per lato. Cuoci broccoli e carote al vapore per 8 min. Componi piatto bilanciando tutti i macronutrienti. Condisci con limone.',
        obiettivo_fitness: ['bulking', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['pollo', 'quinoa', 'complete_meal'], rating: 4.7, reviewCount: 256, createdAt: new Date().toISOString()
      },
      {
        id: 'sig_pra_002', nome: 'Salmone Teriyaki Riso Venere', categoria: 'pranzo', tipoDieta: ['high_protein', 'mediterranea'],
        difficolta: 'medio', tempoPreparazione: 30, porzioni: 1, calorie: 525, proteine: 35, carboidrati: 48, grassi: 18,
        ingredienti: ['150g filetto salmone', '70g riso venere', 'salsa teriyaki', 'zenzero', 'sesamo', 'edamame', 'alga nori'],
        preparazione: 'Cuoci riso venere per 40 min in abbondante acqua salata. Marina salmone in salsa teriyaki con zenzero per 20 min. Cuoci salmone in padella antiaderente per 4 min per lato. Servi con riso, edamame saltati e sesamo tostato.',
        obiettivo_fitness: ['bulking', 'endurance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['salmone', 'omega3', 'asian_fusion'], rating: 4.9, reviewCount: 189, createdAt: new Date().toISOString()
      },
      {
        id: 'sig_pra_003', nome: 'Buddha Bowl Vegetariano Completo', categoria: 'pranzo', tipoDieta: ['vegetariana', 'balanced'],
        difficolta: 'medio', tempoPreparazione: 35, porzioni: 1, calorie: 465, proteine: 18, carboidrati: 58, grassi: 16,
        ingredienti: ['80g ceci cotti', '60g quinoa', '1/2 avocado', 'carote julienne', 'cavolo rosso', 'hummus', 'semi girasole', 'tahini'],
        preparazione: 'Cuoci quinoa in brodo vegetale. Prepara hummus fresco con ceci, tahini e limone. Taglia verdure a julienne sottile. Componi bowl disponendo tutti ingredienti a sezioni. Condisci con salsa tahini diluita con limone.',
        obiettivo_fitness: ['maintenance', 'endurance'], macro_focus: 'balanced', fonte: 'database',
        tags: ['buddha_bowl', 'plant_based', 'colorful'], rating: 4.6, reviewCount: 167, createdAt: new Date().toISOString()
      },
      {
        id: 'sig_pra_004', nome: 'Poke Bowl Salmone Avocado', categoria: 'pranzo', tipoDieta: ['high_protein', 'balanced'],
        difficolta: 'medio', tempoPreparazione: 15, porzioni: 1, calorie: 525, proteine: 32, carboidrati: 48, grassi: 22,
        ingredienti: ['120g salmone crudo sashimi', '80g riso sushi', '1/2 avocado', 'edamame', 'cetriolo', 'salsa soia', 'sesamo nero', 'wakame'],
        preparazione: 'Cuoci riso sushi con aceto di riso. Taglia salmone crudo a cubetti uniformi. Affetta avocado e cetriolo. Componi poke bowl stratificando riso, salmone, verdure. Condisci con salsa soia e cospargi sesamo nero. Aggiungi alga wakame reidratata.',
        obiettivo_fitness: ['cutting', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['poke', 'raw_fish', 'japanese'], rating: 4.8, reviewCount: 267, createdAt: new Date().toISOString()
      },

      // CENE SIGNATURE (4)
      {
        id: 'sig_cen_001', nome: 'Orata al Sale con Verdure Grigliate', categoria: 'cena', tipoDieta: ['mediterranea', 'paleo'],
        difficolta: 'difficile', tempoPreparazione: 45, porzioni: 2, calorie: 385, proteine: 32, carboidrati: 18, grassi: 18,
        ingredienti: ['1 orata 400g', '500g sale grosso', 'zucchine', 'melanzane', 'peperoni', '2 cucchiai olio EVO', 'erbe aromatiche', 'limone'],
        preparazione: 'Pulisci orata lasciando squame. Crea letto di sale grosso aromatizzato con erbe in teglia. Posiziona orata, copri completamente con sale. Cuoci 30 min a 200°C. Griglia verdure a fette spesse. Rompi crosta di sale, servi pesce con verdure e limone.',
        obiettivo_fitness: ['cutting', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['pesce', 'al_sale', 'gourmet'], rating: 4.9, reviewCount: 156, createdAt: new Date().toISOString()
      },
      {
        id: 'sig_cen_002', nome: 'Pollo Ripieno Spinaci e Ricotta', categoria: 'cena', tipoDieta: ['keto', 'high_protein'],
        difficolta: 'medio', tempoPreparazione: 25, porzioni: 1, calorie: 425, proteine: 38, carboidrati: 6, grassi: 26,
        ingredienti: ['150g petto pollo', '100g spinaci', '50g ricotta', '30g parmigiano', 'aglio', '1 cucchiaio olio oliva', 'spezie'],
        preparazione: 'Apri petto di pollo a libro con coltello affilato. Saltare spinaci con aglio 2 min. Mescola spinaci con ricotta e parmigiano. Farcisci pollo, chiudi con stecchini. Cuoci in forno a 180°C per 20 min. Riposa 5 min prima di affettare.',
        obiettivo_fitness: ['cutting', 'strength'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['pollo_ripieno', 'keto', 'elegant'], rating: 4.7, reviewCount: 189, createdAt: new Date().toISOString()
      },
      {
        id: 'sig_cen_003', nome: 'Salmone in Crosta di Pistacchi', categoria: 'cena', tipoDieta: ['keto', 'high_protein'],
        difficolta: 'medio', tempoPreparazione: 20, porzioni: 1, calorie: 485, proteine: 32, carboidrati: 8, grassi: 34,
        ingredienti: ['150g filetto salmone', '30g pistacchi tritati', '1 cucchiaio senape Digione', 'erbe aromatiche', 'limone', 'olio oliva'],
        preparazione: 'Spalma sottile strato di senape su filetto di salmone. Mescola pistacchi tritati con erbe aromatiche. Pressa crosta di pistacchi sul pesce. Cuoci in forno a 200°C per 12 min. Servi con spicchi di limone e filo di olio EVO.',
        obiettivo_fitness: ['cutting', 'maintenance'], macro_focus: 'high_fat', fonte: 'database',
        tags: ['salmone', 'pistacchi', 'omega3'], rating: 4.8, reviewCount: 234, createdAt: new Date().toISOString()
      },
      {
        id: 'sig_cen_004', nome: 'Frittata al Forno con Broccoli', categoria: 'cena', tipoDieta: ['keto', 'vegetariana'],
        difficolta: 'facile', tempoPreparazione: 20, porzioni: 4, calorie: 245, proteine: 18, carboidrati: 8, grassi: 16,
        ingredienti: ['6 uova grandi', '200g broccoli', '80g formaggio magro', '1 cipolla media', '2 cucchiai olio oliva', 'erbe aromatiche'],
        preparazione: 'Sbollenta broccoli in acqua salata per 5 min. Soffriggi cipolla affettata sottile. Sbatti uova con formaggio grattugiato ed erbe. Mescola verdure con uova, versa in teglia oleata. Cuoci in forno a 180°C per 15 min fino a doratura.',
        obiettivo_fitness: ['cutting', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['frittata', 'meal_prep', 'vegetables'], rating: 4.4, reviewCount: 156, createdAt: new Date().toISOString()
      },

      // SPUNTINI SIGNATURE (4)
      {
        id: 'sig_spu_001', nome: 'Energy Balls Cocco e Lime', categoria: 'spuntino', tipoDieta: ['vegana', 'paleo'],
        difficolta: 'medio', tempoPreparazione: 15, porzioni: 8, calorie: 95, proteine: 3, carboidrati: 12, grassi: 4,
        ingredienti: ['100g datteri Medjoul', '30g cocco rapé', '20g mandorle crude', 'buccia 2 lime', 'succo 1 lime', '1 cucchiaio olio cocco'],
        preparazione: 'Ammolla datteri in acqua calda 15 min per ammorbidire. Tosta leggermente mandorle 3-4 min in padella. Nel food processor, trita datteri scolati fino a pasta omogenea. Aggiungi cocco, mandorle e buccia di lime. Forma 8 palline, refrigera 30 min.',
        obiettivo_fitness: ['endurance', 'maintenance'], macro_focus: 'balanced', fonte: 'database',
        tags: ['energy_balls', 'tropical', 'portable'], rating: 4.7, reviewCount: 167, createdAt: new Date().toISOString()
      },
      {
        id: 'sig_spu_002', nome: 'Yogurt Greco con Noci e Miele', categoria: 'spuntino', tipoDieta: ['vegetariana', 'high_protein'],
        difficolta: 'facile', tempoPreparazione: 2, porzioni: 1, calorie: 265, proteine: 18, carboidrati: 12, grassi: 16,
        ingredienti: ['150g yogurt greco 0%', '30g noci sgusciate', '1 cucchiaino miele grezzo', 'cannella in polvere'],
        preparazione: 'Versa yogurt greco in coppetta. Spezza noci grossolanamente a mano. Distribuisci noci sopra yogurt, completa con filo di miele e spolverata di cannella. Mix perfetto di proteine complete, grassi sani e probiotici naturali.',
        obiettivo_fitness: ['cutting', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['yogurt_greco', 'probiotics', 'nuts'], rating: 4.5, reviewCount: 198, createdAt: new Date().toISOString()
      },
      {
        id: 'sig_spu_003', nome: 'Apple Slices con Burro di Mandorle', categoria: 'spuntino', tipoDieta: ['paleo', 'balanced'],
        difficolta: 'facile', tempoPreparazione: 3, porzioni: 1, calorie: 245, proteine: 6, carboidrati: 22, grassi: 16,
        ingredienti: ['1 mela Granny Smith', '2 cucchiai burro mandorle naturale', 'cannella', '1 cucchiaino miele'],
        preparazione: 'Lava e taglia mela a spicchi uniformi, lasciando buccia ricca di fibre. Servi con burro di mandorle naturale per intingere ogni spicchio. Spolverizza con cannella e aggiungi goccia di miele. Equilibrio perfetto tra zuccheri naturali e grassi sani.',
        obiettivo_fitness: ['maintenance', 'endurance'], macro_focus: 'balanced', fonte: 'database',
        tags: ['apple', 'almond_butter', 'natural_sugars'], rating: 4.6, reviewCount: 189, createdAt: new Date().toISOString()
      },
      {
        id: 'sig_spu_004', nome: 'Protein Bites Cioccolato', categoria: 'spuntino', tipoDieta: ['vegetariana', 'high_protein'],
        difficolta: 'medio', tempoPreparazione: 10, porzioni: 6, calorie: 125, proteine: 8, carboidrati: 10, grassi: 6,
        ingredienti: ['25g proteine whey cioccolato', '2 cucchiai burro arachidi', '2 cucchiai avena istantanea', '1 cucchiaio miele', 'mini chocolate chips'],
        preparazione: 'Mescola proteine whey con burro di arachidi e miele fino a crema omogenea. Incorpora avena istantanea e chocolate chips. Se impasto troppo morbido, refrigera 15 min. Forma 6 palline uniformi con mani leggermente umide. Conserva in frigo fino a 5 giorni.',
        obiettivo_fitness: ['bulking', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['protein_bites', 'chocolate', 'meal_prep'], rating: 4.8, reviewCount: 156, createdAt: new Date().toISOString()
      },

      // PRE/POST WORKOUT SIGNATURE (5)
      {
        id: 'sig_pre_001', nome: 'Banana Toast con Burro di Mandorle', categoria: 'pre_workout', tipoDieta: ['balanced', 'vegetariana'],
        difficolta: 'facile', tempoPreparazione: 5, porzioni: 1, calorie: 285, proteine: 8, carboidrati: 38, grassi: 12,
        ingredienti: ['1 fetta pane integrale', '1 banana matura', '1 cucchiaio burro mandorle', 'miele', 'cannella'],
        preparazione: 'Tosta pane integrale fino a doratura. Spalma uniformemente burro di mandorle. Affetta banana a rondelle e disponi su toast. Completa con filo di miele e spolverata di cannella. Consumare 30-45 min prima del workout per energia immediata e sostenuta.',
        obiettivo_fitness: ['endurance', 'maintenance'], macro_focus: 'balanced', fonte: 'database',
        tags: ['pre_workout', 'quick_energy', 'portable'], rating: 4.6, reviewCount: 189, createdAt: new Date().toISOString()
      },
      {
        id: 'sig_pre_002', nome: 'Energy Balls Datteri e Cacao', categoria: 'pre_workout', tipoDieta: ['vegana', 'paleo'],
        difficolta: 'medio', tempoPreparazione: 15, porzioni: 8, calorie: 85, proteine: 3, carboidrati: 16, grassi: 2,
        ingredienti: ['8 datteri Medjoul denocciolati', '30g cacao crudo in polvere', '20g mandorle crude', '1 cucchiaio olio cocco', 'cocco rapé'],
        preparazione: 'Ammolla datteri in acqua tiepida per 10 min. Scola e frulla nel food processor fino a pasta densa. Aggiungi cacao crudo, mandorle e olio di cocco. Mixa fino a impasto omogeneo. Forma 8 palline, rotola nel cocco rapé. Refrigera 30 min per rassodare.',
        obiettivo_fitness: ['endurance', 'strength'], macro_focus: 'balanced', fonte: 'database',
        tags: ['energy_balls', 'natural_sugars', 'cacao'], rating: 4.7, reviewCount: 145, createdAt: new Date().toISOString()
      },
      {
        id: 'sig_pos_001', nome: 'Smoothie Recovery Proteico', categoria: 'post_workout', tipoDieta: ['vegetariana', 'high_protein'],
        difficolta: 'facile', tempoPreparazione: 5, porzioni: 1, calorie: 385, proteine: 35, carboidrati: 28, grassi: 12,
        ingredienti: ['30g proteine whey vaniglia', '1 banana matura', '250ml latte scremato', '1 cucchiaio burro mandorle', '100g spinaci', 'ghiaccio'],
        preparazione: 'Pela banana e tagliala a pezzi. Frulla tutti gli ingredienti ad alta velocità per 60 secondi fino a consistenza completamente liscia. Aggiungi ghiaccio e frulla altri 30 secondi. Consistenza deve essere cremosa. Consumare entro 30 min dal workout per massimo assorbimento proteico.',
        obiettivo_fitness: ['bulking', 'strength'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['post_workout', 'recovery', 'anabolic_window'], rating: 4.9, reviewCount: 267, createdAt: new Date().toISOString()
      },
      {
        id: 'sig_pos_002', nome: 'Yogurt Greco Power Bowl', categoria: 'post_workout', tipoDieta: ['vegetariana', 'high_protein'],
        difficolta: 'facile', tempoPreparazione: 5, porzioni: 1, calorie: 425, proteine: 32, carboidrati: 35, grassi: 16,
        ingredienti: ['200g yogurt greco 0%', '15g granola proteica', '100g frutti di bosco misti', '1 cucchiaio miele', '15g mandorle a scaglie'],
        preparazione: 'Versa yogurt greco denso in bowl capiente. Aggiungi granola proteica, frutti di bosco freschi o scongelati e mandorle a scaglie. Completa con miele per carboidrati veloci. Mix ottimale di proteine caseine e whey per recovery prolungato.',
        obiettivo_fitness: ['maintenance', 'cutting'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['post_workout', 'probiotics', 'antioxidants'], rating: 4.7, reviewCount: 198, createdAt: new Date().toISOString()
      },
      {
        id: 'sig_pos_003', nome: 'Pancakes Proteici Post-Workout', categoria: 'post_workout', tipoDieta: ['high_protein', 'balanced'],
        difficolta: 'medio', tempoPreparazione: 12, porzioni: 1, calorie: 445, proteine: 28, carboidrati: 42, grassi: 16,
        ingredienti: ['25g proteine whey vaniglia', '1 banana matura', '2 uova intere', '30g avena istantanea', '150ml latte scremato', 'mirtilli', 'sciroppo acero'],
        preparazione: 'Frulla proteine, banana, uova e avena con latte fino a impasto liscio. Lascia riposare 5 min per idratazione avena. Cuoci piccoli pancakes in padella antiaderente 2 min per lato. Servi caldi con mirtilli freschi e sciroppo d\'acero per carboidrati rapidi.',
        obiettivo_fitness: ['bulking', 'maintenance'], macro_focus: 'high_protein', fonte: 'database',
        tags: ['pancakes', 'comfort', 'muscle_building'], rating: 4.8, reviewCount: 234, createdAt: new Date().toISOString()
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
    console.log('🤖 Generating AI FITNESS recipes with advanced filters:', aiFilters);
    
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
              stagione: aiFilters.stagione,
              // PARAMETRI FITNESS SPECIALIZZATI
              fonte_fitness: aiFilters.fonte_fitness,
              timing_workout: aiFilters.timing_workout,
              macro_focus: aiFilters.macro_focus,
              // PROMPT FITNESS ENHANCEMENT
              fitness_context: `Generate recipe optimized for ${aiFilters.obiettivo_fitness} athletes, inspired by ${aiFilters.fonte_fitness} nutritional principles. Focus on ${aiFilters.timing_workout} timing requirements. Use proven sports nutrition combinations from elite athletes, bodybuilders, and certified sports nutritionists. Ingredients should support performance, recovery, and body composition goals specific to ${aiFilters.obiettivo_fitness} phase.`
            }
          })
        });

        const result = await response.json();
        return result.success ? result.data.ricetta : null;
      });

      const results = await Promise.all(promises);
      const validRecipes = results.filter(recipe => recipe !== null);

      // Bypass Airtable - Crea ricette direttamente in stato locale
      const newAiRecipes: Recipe[] = [];
      
      for (const aiRecipe of validRecipes) {
        console.log('✅ Processing AI recipe:', aiRecipe.nome);
        
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
          tags: ['ai_generated', 'fitness_optimized', aiFilters.fonte_fitness || 'fitness', aiFilters.timing_workout || 'anytime'],
          rating: 4.7,
          reviewCount: 1,
          createdAt: new Date().toISOString()
        };
        newAiRecipes.push(newRecipe);
        
        // Salva anche in localStorage come backup
        const existingRecipes = JSON.parse(localStorage.getItem('ai_generated_recipes') || '[]');
        existingRecipes.push(newRecipe);
        localStorage.setItem('ai_generated_recipes', JSON.stringify(existingRecipes));
      }

      // Aggiorna stato
      setAiGeneratedRecipes(prev => [...newAiRecipes, ...prev]);
      setShowAiFiltersModal(false);
      setActiveSection('ai_generated');
      
      console.log(`✅ Generated ${newAiRecipes.length} FITNESS-optimized AI recipes successfully`);
      
    } catch (error) {
      console.error('❌ AI generation error:', error);
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
          alert('⚠️ Puoi avere massimo 10 ricette preferite!');
          return;
        }
        newFavorites.add(recipeId);
      }
      setFavoriteRecipes(newFavorites);
    } catch (error) {
      console.error('❌ Error toggling favorite:', error);
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

  // Get category color
  const getCategoryColor = (categoria: string) => {
    const colors: { [key: string]: string } = {
      'colazione': 'bg-yellow-100 text-yellow-800',
      'pre_workout': 'bg-red-100 text-red-800',
      'post_workout': 'bg-green-100 text-green-800',
      'pranzo': 'bg-blue-100 text-blue-800',
      'cena': 'bg-purple-100 text-purple-800',
      'spuntino': 'bg-gray-100 text-gray-800',
      'smoothie': 'bg-teal-100 text-teal-800',
    };
    return colors[categoria] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Caricando Database FITNESS...</h2>
          <p className="text-gray-400">30 ricette signature + AI specializzata!</p>
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
            Ricette FITNESS Unificate - Signature + AI Specializzata
          </h1>
          <p className="text-xl text-gray-100 mb-6 max-w-4xl mx-auto">
            30 ricette signature perfette + AI fitness che attinge da atleti pro, nutrizionisti sportivi e preparatori atletici per ricette infinite!
          </p>

          {/* Stats unificate */}
          <div className="bg-white bg-opacity-10 rounded-lg p-4 max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-200">
              <div className="text-center">
                <div className="font-semibold text-lg">{signatureRecipes.length}</div>
                <div>Ricette Signature</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">{aiGeneratedRecipes.length}</div>
                <div>AI Generated</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">{signatureRecipes.filter(r => r.categoria === 'smoothie').length}</div>
                <div>Smoothies Integrati</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">{favoriteRecipes.size}/10</div>
                <div>Preferite</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categorie Quick Access */}
      <section className="bg-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-6">Categorie Unificate</h2>
          <div className="grid grid-cols-3 md:grid-cols-7 gap-4">
            {MEAL_CATEGORIES.map((category) => {
              const Icon = category.icon;
              const count = signatureRecipes.filter(r => r.categoria === category.value).length;
              return (
                <button
                  key={category.value}
                  onClick={() => {
                    setSelectedCategory(category.value);
                    setActiveSection('signature');
                  }}
                  className="flex flex-col items-center p-4 bg-gray-700 hover:bg-gray-600 rounded-xl transition-all duration-300 transform hover:scale-105 border border-gray-600"
                >
                  <div className="text-2xl mb-2">{category.emoji}</div>
                  <Icon className="h-6 w-6 text-green-400 mb-2" />
                  <div className="text-sm font-semibold text-white text-center">{category.label}</div>
                  <div className="text-xs text-gray-400">{count} ricette</div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="bg-gray-800 py-4 sticky top-0 z-40 border-b border-gray-700">
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
                AI Fitness Generated ({aiGeneratedRecipes.length})
              </button>
            </div>

            {/* Generate AI Button */}
            <button
              onClick={() => setShowAiFiltersModal(true)}
              disabled={aiGenerating}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition-colors font-semibold flex items-center gap-2"
            >
              {aiGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Genera AI FITNESS</span>
                </>
              )}
            </button>
          </div>

          {/* Search and Quick Filters */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="relative md:col-span-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Cerca ricette, smoothies, spuntini..."
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
                  const smoothies = (activeSection === 'signature' ? signatureRecipes : aiGeneratedRecipes)
                    .filter(r => r.categoria === 'smoothie');
                  setFilteredRecipes(smoothies);
                }}
                className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                Smoothies
              </button>

              <button
                onClick={() => {
                  const quick = (activeSection === 'signature' ? signatureRecipes : aiGeneratedRecipes)
                    .filter(r => r.tempoPreparazione <= 10);
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
                    setFilteredRecipes(activeSection === 'signature' ? signatureRecipes : aiGeneratedRecipes);
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
                  ? 'Prova a modificare i filtri o genera nuove ricette con AI FITNESS'
                  : 'Genera le tue prime ricette AI specializzate!'
                }
              </p>
              <button
                onClick={() => setShowAiFiltersModal(true)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Genera con AI FITNESS
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

                    {/* Badge Categoria */}
                    <div className="absolute top-2 left-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCategoryColor(recipe.categoria)}`}>
                        {MEAL_CATEGORIES.find(c => c.value === recipe.categoria)?.label || recipe.categoria}
                      </span>
                    </div>

                    {/* Badge Fonte */}
                    {recipe.fonte === 'ai_generated' && (
                      <div className="absolute top-8 left-2">
                        <span className="px-2 py-1 bg-purple-600 text-white rounded-full text-xs font-semibold flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          AI
                        </span>
                      </div>
                    )}

                    {/* Titolo */}
                    <h3 className="text-base font-bold text-white mb-2 line-clamp-2 mt-8">
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

      {/* Modal AI Filters FITNESS Specializzati */}
      {showAiFiltersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Settings className="h-6 w-6" />
                AI FITNESS Generator - Database Atleti & Nutrizionisti Sportivi
              </h2>
              <button
                onClick={() => setShowAiFiltersModal(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 bg-opacity-20 rounded-lg border border-blue-600 border-opacity-30 p-4 mb-6">
                <h4 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  AI FITNESS SPECIALIZZATA:
                </h4>
                <p className="text-blue-200 text-sm">
                  Ricette generate attingendo da database di atleti professionisti, bodybuilders, powerlifters, nutrizionisti sportivi certificati e preparatori atletici. Ogni ricetta è ottimizzata per timing, performance e obiettivi specifici.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Colonna 1 - Parametri Base */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Parametri Base</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Categoria</label>
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">Tempo Max</label>
                    <select
                      value={aiFilters.tempo_max}
                      onChange={(e) => setAiFilters({...aiFilters, tempo_max: e.target.value})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="15">15 minuti</option>
                      <option value="30">30 minuti</option>
                      <option value="45">45 minuti</option>
                      <option value="60">60 minuti</option>
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
                </div>

                {/* Colonna 2 - Parametri FITNESS Specializzati */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Specializzazione FITNESS</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Fonte Fitness</label>
                    <select
                      value={aiFilters.fonte_fitness}
                      onChange={(e) => setAiFilters({...aiFilters, fonte_fitness: e.target.value})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    >
                      {FITNESS_SOURCES.map(source => (
                        <option key={source.value} value={source.value}>{source.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Timing Workout</label>
                    <select
                      value={aiFilters.timing_workout}
                      onChange={(e) => setAiFilters({...aiFilters, timing_workout: e.target.value})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    >
                      {WORKOUT_TIMING.map(timing => (
                        <option key={timing.value} value={timing.value}>{timing.label}</option>
                      ))}
                    </select>
                  </div>

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
                    <label className="block text-sm font-medium text-gray-300 mb-2">Focus Macro</label>
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
                </div>

                {/* Colonna 3 - Personalizzazione Avanzata */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Personalizzazione</h3>
                  
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">Numero Ricette</label>
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

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Ingredienti Base</label>
                    <input
                      type="text"
                      placeholder="es. pollo, broccoli, quinoa"
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

                  {/* Preview generazione */}
                  <div className="bg-gray-700 rounded-lg p-3 mt-4">
                    <h4 className="text-white text-sm font-semibold mb-2">Anteprima Generazione:</h4>
                    <p className="text-gray-300 text-xs">
                      {aiFilters.numero_ricette} ricette {aiFilters.categoria} per {aiFilters.obiettivo_fitness}, 
                      stile {aiFilters.fonte_fitness}, timing {aiFilters.timing_workout}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pulsanti azione */}
              <div className="flex gap-4 pt-6 mt-6 border-t border-gray-700">
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
                      <span>Generando {aiFilters.numero_ricette} ricette FITNESS...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      <span>Genera {aiFilters.numero_ricette} Ricette FITNESS AI</span>
                    </>
                  )}
                </button>
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
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCategoryColor(selectedRecipe.categoria)}`}>
                    {MEAL_CATEGORIES.find(c => c.value === selectedRecipe.categoria)?.label || selectedRecipe.categoria}
                  </span>
                  {selectedRecipe.fonte === 'ai_generated' && (
                    <span className="px-2 py-1 bg-purple-600 text-white rounded-full text-xs font-semibold flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      AI FITNESS Generated
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
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Flame className="h-5 w-5 text-orange-500" />
                      Valori Nutrizionali
                    </h3>
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
                        <span className="text-gray-300 flex items-center gap-2">
                          <Clock size={16} />
                          Tempo:
                        </span>
                        <span className="text-white font-medium">{selectedRecipe.tempoPreparazione} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300 flex items-center gap-2">
                          <Users size={16} />
                          Porzioni:
                        </span>
                        <span className="text-white font-medium">{selectedRecipe.porzioni}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300 flex items-center gap-2">
                          <Target size={16} />
                          Difficoltà:
                        </span>
                        <span className="text-white font-medium">{selectedRecipe.difficolta}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300 flex items-center gap-2">
                          <Activity size={16} />
                          Macro Focus:
                        </span>
                        <span className="text-white font-medium">{selectedRecipe.macro_focus.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Dumbbell className="h-5 w-5" />
                      Obiettivi FITNESS
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedRecipe.obiettivo_fitness.map((obj) => (
                        <span key={obj} className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-medium">
                          {FITNESS_OBJECTIVES.find(o => o.value === obj)?.label || obj}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Colonna destra - Ingredienti e Preparazione */}
                <div>
                  <div className="bg-gray-700 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <ChefHat className="h-5 w-5 text-green-400" />
                      Ingredienti
                    </h3>
                    <ul className="space-y-2">
                      {selectedRecipe.ingredienti.map((ingrediente, index) => (
                        <li key={index} className="flex items-start space-x-3 bg-gray-600 p-2 rounded">
                          <span className="text-green-400 mt-1 font-bold">•</span>
                          <span className="text-gray-200 text-sm">{ingrediente}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-400" />
                      Preparazione
                    </h3>
                    <div className="text-gray-200 leading-relaxed text-sm">
                      {selectedRecipe.preparazione}
                    </div>
                    
                    <div className="mt-4 p-3 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg">
                      <div className="flex items-center space-x-2 text-white">
                        <Clock className="h-5 w-5" />
                        <span className="font-semibold">Tempo totale: {selectedRecipe.tempoPreparazione} minuti</span>
                      </div>
                    </div>
                  </div>

                  {/* Tags e Azioni */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-300 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedRecipe.tags.map((tag) => (
                          <span key={tag} className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-sm">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Azioni */}
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
                          alert('✅ Ricetta FITNESS copiata negli appunti!');
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors font-semibold flex items-center justify-center gap-2"
                      >
                        📋 Copia Ricetta FITNESS
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
      <footer className="bg-gray-900 py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center items-center gap-3 mb-3">
            <ChefHat className="h-6 w-6 text-green-400" />
            <h3 className="text-lg font-bold text-white">Ricette FITNESS Unificate - Signature + Smoothies + AI</h3>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            {signatureRecipes.length} ricette signature (inclusi {signatureRecipes.filter(r => r.categoria === 'smoothie').length} smoothies) + infinite varianti AI da database atleti professionisti
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