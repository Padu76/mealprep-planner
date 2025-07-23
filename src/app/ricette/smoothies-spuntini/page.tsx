'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Clock, Users, Star, ChefHat, Filter, Search, X, Eye, Zap, Droplets, Apple, Coffee } from 'lucide-react';

// 🍹 INTERFACCIA SMOOTHIE/SPUNTINO SPECIALIZZATA
interface SmoothieRecipe {
  id: string;
  nome: string;
  tipo: 'smoothie' | 'frullato' | 'shake' | 'bowl' | 'spuntino_solido' | 'energy_ball' | 'barretta';
  momento: 'pre_workout' | 'post_workout' | 'colazione' | 'merenda' | 'sera' | 'qualsiasi';
  difficolta: 'facile' | 'medio';
  tempoPreparazione: number;
  porzioni: number;
  calorie: number;
  proteine: number;
  carboidrati: number;
  grassi: number;
  ingredienti: string[];
  preparazione: string;
  benefici: string[];
  consistenza: 'liquido' | 'denso' | 'cremoso' | 'solido';
  sapore: 'dolce' | 'fruttato' | 'cioccolato' | 'vaniglia' | 'tropicale' | 'verde' | 'neutro';
  allergie: string[];
  stagione: ('primavera' | 'estate' | 'autunno' | 'inverno' | 'tutto_anno')[];
  tags: string[];
  createdAt: Date;
  rating: number;
  reviewCount: number;
  imageUrl: string;
}

export default function SmoothiesSpuntiniPage() {
  // 🍹 STATI PRINCIPALI
  const [recipes, setRecipes] = useState<SmoothieRecipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<SmoothieRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // 🔍 STATI FILTRI
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTipo, setSelectedTipo] = useState('');
  const [selectedMomento, setSelectedMomento] = useState('');
  const [selectedSapore, setSelectedSapore] = useState('');
  const [selectedConsistenza, setSelectedConsistenza] = useState('');

  // 📄 STATI PAGINAZIONE
  const [currentPage, setCurrentPage] = useState(1);
  const recipesPerPage = 12;

  // 👁️ STATI MODAL
  const [selectedRecipe, setSelectedRecipe] = useState<SmoothieRecipe | null>(null);
  const [showModal, setShowModal] = useState(false);

  // 🍹 DATABASE SMOOTHIES E SPUNTINI FIT (30+ ricette)
  useEffect(() => {
    console.log('🍹 [SMOOTHIES] Initializing specialized database...');
    setLoading(true);

    const smoothiesDatabase: SmoothieRecipe[] = [
      // 🥤 SMOOTHIES CLASSICI
      {
        id: 'smo_001', nome: 'Smoothie Verde Detox Spinaci e Mela', tipo: 'smoothie', momento: 'colazione',
        difficolta: 'facile', tempoPreparazione: 5, porzioni: 1, calorie: 185, proteine: 22, carboidrati: 12, grassi: 8,
        ingredienti: ['25g proteine whey vaniglia', '100g spinaci baby freschi', '1 mela verde Granny Smith', '200ml acqua di cocco', '1/2 avocado piccolo', 'succo di 1/2 limone', 'zenzero fresco 1cm', 'ghiaccio tritato', 'stevia liquida'],
        preparazione: 'Lava accuratamente gli spinaci e la mela. Pela e taglia la mela a pezzi. Frulla tutti gli ingredienti ad alta velocità per 90 secondi fino a consistenza completamente liscia. Aggiungi ghiaccio e frulla altri 30 secondi. Assaggia e regola dolcezza con stevia. Consuma immediatamente per massimi benefici.',
        benefici: ['Disintossicante naturale', 'Alto contenuto di ferro', 'Antiossidanti potenti', 'Idratazione ottimale'],
        consistenza: 'liquido', sapore: 'verde', allergie: ['latte'], stagione: ['tutto_anno'],
        tags: ['detox', 'verde', 'antiossidante', 'idratante'], createdAt: new Date(), rating: 4.6, reviewCount: 189,
        imageUrl: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&h=300&fit=crop'
      },
      {
        id: 'smo_002', nome: 'Frullato Proteico Banana e Burro di Mandorle', tipo: 'frullato', momento: 'post_workout',
        difficolta: 'facile', tempoPreparazione: 4, porzioni: 1, calorie: 485, proteine: 32, carboidrati: 38, grassi: 18,
        ingredienti: ['30g proteine whey vaniglia', '1 banana matura grande', '2 cucchiai burro mandorle naturale', '250ml latte di mandorla non zuccherato', '1 cucchiaio semi di lino macinati', '1 cucchiaino estratto vaniglia', 'cannella in polvere', 'ghiaccio'],
        preparazione: 'Pela la banana e tagliala a rondelle. Nel frullatore, combina banana, proteine, burro di mandorle e latte di mandorla. Aggiungi semi di lino, vaniglia e un pizzico di cannella. Frulla per 60 secondi fino a completa cremosità. Incorpora ghiaccio e frulla altri 30 secondi. La consistenza deve essere densa ma bevibile.',
        benefici: ['Recovery post-allenamento', 'Proteine complete', 'Energia sostenuta', 'Grassi sani'],
        consistenza: 'cremoso', sapore: 'dolce', allergie: ['frutta_secca', 'latte'], stagione: ['tutto_anno'],
        tags: ['post_workout', 'proteico', 'recovery', 'cremoso'], createdAt: new Date(), rating: 4.9, reviewCount: 267,
        imageUrl: 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=400&h=300&fit=crop'
      },
      {
        id: 'smo_003', nome: 'Smoothie Bowl Açaí e Frutti di Bosco', tipo: 'bowl', momento: 'colazione',
        difficolta: 'medio', tempoPreparazione: 8, porzioni: 1, calorie: 425, proteine: 18, carboidrati: 52, grassi: 16,
        ingredienti: ['100g polpa açaí congelata', '1/2 banana congelata', '100g mix frutti di bosco congelati', '20g proteine vegetali ai frutti di bosco', '150ml latte di cocco', '15g granola senza zucchero', '10g semi di chia', '50g mirtilli freschi', '10g mandorle a lamelle', 'miele di manuka'],
        preparazione: 'Frulla açaí, banana, frutti di bosco congelati, proteine e latte di cocco fino a consistenza molto densa (simile a gelato). Versa in una bowl preraffreddata. Disponi artisticamente granola, semi di chia, mirtilli freschi e mandorle creando sezioni colorate. Completa con un filo di miele di manuka.',
        benefici: ['Antiossidanti massimi', 'Energia naturale', 'Omega-3', 'Fibra saziante'],
        consistenza: 'denso', sapore: 'fruttato', allergie: ['frutta_secca'], stagione: ['primavera', 'estate'],
        tags: ['acai_bowl', 'instagram', 'antiossidante', 'colorato'], createdAt: new Date(), rating: 4.8, reviewCount: 203,
        imageUrl: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=300&fit=crop'
      },
      {
        id: 'smo_004', nome: 'Shake Cioccolato e Caffeina Pre-Workout', tipo: 'shake', momento: 'pre_workout',
        difficolta: 'facile', tempoPreparazione: 3, porzioni: 1, calorie: 295, proteine: 28, carboidrati: 18, grassi: 12,
        ingredienti: ['25g proteine whey cioccolato', '1 shot espresso freddo', '200ml latte scremato', '1 cucchiaio cacao amaro', '1 cucchiaino olio MCT', '1/2 banana piccola', 'estratto vaniglia', 'ghiaccio abbondante', 'stevia'],
        preparazione: 'Prepara un espresso e lascialo raffreddare completamente. Nel frullatore, combina proteine al cioccolato, espresso freddo, latte e cacao amaro. Aggiungi olio MCT, banana e vaniglia. Frulla 45 secondi, aggiungi ghiaccio abbondante e frulla altri 30 secondi. Dolcifica con stevia se necessario.',
        benefici: ['Energy boost immediato', 'Focus mentale', 'Termogenesi', 'Performance atletica'],
        consistenza: 'liquido', sapore: 'cioccolato', allergie: ['latte', 'caffeina'], stagione: ['tutto_anno'],
        tags: ['pre_workout', 'caffeina', 'energy', 'performance'], createdAt: new Date(), rating: 4.7, reviewCount: 156,
        imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'
      },
      {
        id: 'smo_005', nome: 'Frullato Tropicale Mango e Cocco', tipo: 'frullato', momento: 'merenda',
        difficolta: 'facile', tempoPreparazione: 5, porzioni: 1, calorie: 365, proteine: 15, carboidrati: 45, grassi: 14,
        ingredienti: ['150g mango maturo congelato', '100ml latte di cocco', '20g proteine whey vaniglia', '1 cucchiaio cocco rapé', '100ml acqua di cocco', 'succo di 1/2 lime', '1 cucchiaino zenzero fresco', 'foglie di menta', 'ghiaccio'],
        preparazione: 'Taglia il mango a cubetti se fresco, o usa direttamente quello congelato. Frulla mango, latte di cocco, proteine e cocco rapé fino a cremosità. Aggiungi acqua di cocco, lime e zenzero. Frulla 60 secondi. Incorpora ghiaccio e frulla brevemente. Guarnisci con menta fresca.',
        benefici: ['Vitamina C potente', 'Elettroliti naturali', 'Gusto esotico', 'Idratazione tropicale'],
        consistenza: 'cremoso', sapore: 'tropicale', allergie: [], stagione: ['estate', 'primavera'],
        tags: ['tropicale', 'esotico', 'vitamina_c', 'rinfrescante'], createdAt: new Date(), rating: 4.5, reviewCount: 178,
        imageUrl: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&h=300&fit=crop'
      },
      {
        id: 'smo_006', nome: 'Smoothie Proteico alla Vaniglia e Frutti Rossi', tipo: 'smoothie', momento: 'qualsiasi',
        difficolta: 'facile', tempoPreparazione: 4, porzioni: 1, calorie: 315, proteine: 25, carboidrati: 28, grassi: 8,
        ingredienti: ['25g proteine whey vaniglia', '100g fragole fresche', '80g lamponi', '200ml latte di mandorla', '1 cucchiaio yogurt greco 0%', 'estratto vaniglia', '1 cucchiaino miele', 'ghiaccio', 'foglie basilico'],
        preparazione: 'Lava delicatamente fragole e lamponi. Rimuovi il picciolo dalle fragole. Frulla tutti i frutti con le proteine e il latte di mandorla. Aggiungi yogurt greco e estratto di vaniglia. Dolcifica con miele. Frulla fino a consistenza vellutata. Guarnisci con basilico fresco per un tocco gourmet.',
        benefici: ['Antiossidanti dei frutti rossi', 'Proteine complete', 'Basso indice glicemico', 'Sapore delicato'],
        consistenza: 'cremoso', sapore: 'fruttato', allergie: ['latte', 'frutta_secca'], stagione: ['primavera', 'estate'],
        tags: ['frutti_rossi', 'antiossidante', 'delicato', 'versatile'], createdAt: new Date(), rating: 4.6, reviewCount: 142,
        imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop'
      },
      {
        id: 'smo_007', nome: 'Green Smoothie Avocado e Spinaci Power', tipo: 'smoothie', momento: 'colazione',
        difficolta: 'facile', tempoPreparazione: 6, porzioni: 1, calorie: 395, proteine: 20, carboidrati: 22, grassi: 24,
        ingredienti: ['1/2 avocado maturo', '150g spinaci baby', '20g proteine vegetali vaniglia', '250ml latte di cocco', '1 mela verde', '1 cucchiaio burro di mandorle', 'succo di limone', 'zenzero fresco', 'ghiaccio', 'stevia'],
        preparazione: 'Sbuccia e denoccola l\'avocado. Lava spinaci e mela. Pela la mela e tagliala a pezzi. Frulla avocado, spinaci e proteine con metà del latte di cocco. Aggiungi mela, burro di mandorle e il resto del latte. Insaporisci con limone e zenzero. Frulla 90 secondi fino a completa cremosità.',
        benefici: ['Grassi sani omega-3', 'Ferro biodisponibile', 'Energia sostenuta', 'Sazietà prolungata'],
        consistenza: 'cremoso', sapore: 'verde', allergie: ['frutta_secca'], stagione: ['tutto_anno'],
        tags: ['green_power', 'omega3', 'sazietà', 'nutriente'], createdAt: new Date(), rating: 4.4, reviewCount: 198,
        imageUrl: 'https://images.unsplash.com/photo-1581485495319-3f3e43e21b64?w=400&h=300&fit=crop'
      },
      {
        id: 'smo_008', nome: 'Frullato Energetico Caffè e Dates', tipo: 'frullato', momento: 'pre_workout',
        difficolta: 'medio', tempoPreparazione: 7, porzioni: 1, calorie: 385, proteine: 24, carboidrati: 35, grassi: 16,
        ingredienti: ['25g proteine whey neutro', '4 datteri Medjoul denocciolati', '1 shot espresso doppio', '200ml latte di avena', '1 cucchiaio burro di arachidi', '1 cucchiaino cacao crudo', 'cannella', 'ghiaccio', 'sale marino pizzico'],
        preparazione: 'Ammolla i datteri in acqua calda per 10 minuti per ammorbidirli. Prepara espresso doppio e lascia raffreddare. Scola datteri e frulla con proteine, espresso e latte di avena. Aggiungi burro di arachidi, cacao e cannella. Frulla 2 minuti fino a consistenza perfettamente liscia. Un pizzico di sale esalta tutti i sapori.',
        benefici: ['Energia immediata e sostenuta', 'Caffeina naturale', 'Zuccheri naturali', 'Performance cognitiva'],
        consistenza: 'denso', sapore: 'dolce', allergie: ['arachidi', 'caffeina'], stagione: ['tutto_anno'],
        tags: ['caffeina', 'dates', 'energy_boost', 'natural_sweet'], createdAt: new Date(), rating: 4.7, reviewCount: 167,
        imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop'
      },

      // 🍪 SPUNTINI SOLIDI
      {
        id: 'spu_011', nome: 'Energy Balls Cocco e Lime', tipo: 'energy_ball', momento: 'merenda',
        difficolta: 'medio', tempoPreparazione: 15, porzioni: 8, calorie: 95, proteine: 4, carboidrati: 12, grassi: 4,
        ingredienti: ['100g datteri Medjoul', '30g proteine whey vaniglia', '50g cocco rapé', '20g mandorle crude', 'buccia di 2 lime', 'succo di 1 lime', '1 cucchiaio olio cocco', 'pizzico sale marino'],
        preparazione: 'Ammolla datteri 15 min. Tosta leggermente le mandorle 3-4 min. Nel food processor, trita datteri scolati fino a pasta omogenea. Aggiungi proteine, cocco rapé, mandorle e buccia lime. Incorpora succo di lime e olio di cocco. Mixa fino a impasto compatto. Forma 8 palline uniformi. Rotola nel cocco extra. Riponi in frigo 30 min per rassodare.',
        benefici: ['Energia rapida naturale', 'Elettroliti dal cocco', 'Vitamina C', 'Portabilità perfetta'],
        consistenza: 'solido', sapore: 'tropicale', allergie: ['frutta_secca'], stagione: ['estate'],
        tags: ['energy_balls', 'portable', 'lime', 'coconut'], createdAt: new Date(), rating: 4.8, reviewCount: 134,
        imageUrl: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=300&fit=crop'
      },
      {
        id: 'spu_012', nome: 'Barrette Proteiche Cioccolato e Nocciole', tipo: 'barretta', momento: 'post_workout',
        difficolta: 'medio', tempoPreparazione: 20, porzioni: 6, calorie: 165, proteine: 8, carboidrati: 15, grassi: 8,
        ingredienti: ['40g proteine whey cioccolato', '60g fiocchi avena', '80g datteri', '40g nocciole tostate', '20g cacao amaro', '2 cucchiai burro mandorle', '1 cucchiaio miele', 'estratto vaniglia', 'dark chocolate chips'],
        preparazione: 'Tosta nocciole in forno 8 min a 180°C. Frulla datteri fino a pasta densa. In una bowl, mescola proteine, avena e cacao. Aggiungi pasta di datteri, burro di mandorle e miele. Incorpora nocciole tritate e chocolate chips. Impasta bene, stendi in teglia 20x15cm rivestita. Refrigera 2 ore. Taglia in 6 barrette.',
        benefici: ['Recovery muscolare', 'Proteine complete', 'Grassi sani', 'Energia sostenuta'],
        consistenza: 'solido', sapore: 'cioccolato', allergie: ['frutta_secca'], stagione: ['tutto_anno'],
        tags: ['barrette', 'homemade', 'cioccolato', 'nocciole'], createdAt: new Date(), rating: 4.9, reviewCount: 189,
        imageUrl: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=400&h=300&fit=crop'
      },
      {
        id: 'spu_013', nome: 'Bites Proteici al Burro di Arachidi', tipo: 'energy_ball', momento: 'qualsiasi',
        difficolta: 'facile', tempoPreparazione: 10, porzioni: 10, calorie: 85, proteine: 5, carboidrati: 8, grassi: 4,
        ingredienti: ['3 cucchiai burro arachidi naturale', '25g proteine whey vaniglia', '2 cucchiai fiocchi avena', '1 cucchiaio miele grezzo', '1 cucchiaio semi lino macinati', 'cannella', 'chocolate chips mini', 'cocco rapé per rotolare'],
        preparazione: 'In una bowl, mescola burro di arachidi, proteine e miele fino a crema omogenea. Incorpora avena, semi di lino e cannella. Aggiungi chocolate chips. Se troppo morbido, riponi in frigo 15 min. Forma 10 palline con le mani leggermente umide. Rotola metà nel cocco rapé. Conserva in frigo fino a 5 giorni.',
        benefici: ['Proteine vegetali', 'Grassi monoinsaturi', 'Fibra saziante', 'Snack pratico'],
        consistenza: 'solido', sapore: 'dolce', allergie: ['arachidi', 'frutta_secca'], stagione: ['tutto_anno'],
        tags: ['peanut_butter', 'quick', 'protein_bites', 'kid_friendly'], createdAt: new Date(), rating: 4.6, reviewCount: 245,
        imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop'
      },
      {
        id: 'spu_014', nome: 'Crackers Proteici ai Semi', tipo: 'spuntino_solido', momento: 'merenda',
        difficolta: 'medio', tempoPreparazione: 25, porzioni: 12, calorie: 75, proteine: 6, carboidrati: 4, grassi: 4,
        ingredienti: ['30g proteine whey neutro', '60g farina mandorle', '2 cucchiai semi girasole', '2 cucchiai semi zucca', '1 cucchiaio semi sesamo', '1 uovo', '2 cucchiai olio oliva', 'sale marino', 'rosmarino secco', 'paprika'],
        preparazione: 'Preriscalda forno 160°C. Mescola proteine, farina di mandorle, tutti i semi e spezie. In un\'altra bowl, sbatti uovo con olio. Unisci ingredienti secchi e umidi fino a impasto omogeneo. Stendi tra 2 fogli carta forno spessore 3mm. Rimuovi foglio superiore, incidi quadretti. Cuoci 15-18 min fino doratura. Spezza lungo incisioni.',
        benefici: ['Proteine complete', 'Grassi omega-3', 'Croccantezza saziante', 'Zero carboidrati raffinati'],
        consistenza: 'solido', sapore: 'neutro', allergie: ['uova', 'frutta_secca', 'sesamo'], stagione: ['tutto_anno'],
        tags: ['crackers', 'keto', 'crunchy', 'homemade'], createdAt: new Date(), rating: 4.3, reviewCount: 98,
        imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop'
      },

      // 🥤 SMOOTHIES SPECIALI
      {
        id: 'smo_015', nome: 'Smoothie Recovery Ciliegie e Curcuma', tipo: 'smoothie', momento: 'post_workout',
        difficolta: 'medio', tempoPreparazione: 6, porzioni: 1, calorie: 295, proteine: 22, carboidrati: 32, grassi: 6,
        ingredienti: ['150g ciliegie denocciolate congelate', '20g proteine whey vaniglia', '200ml latte mandorla', '1 cucchiaino curcuma in polvere', '1/2 cucchiaino zenzero fresco', 'pepe nero pizzico', '1 cucchiaio miele', 'ghiaccio'],
        preparazione: 'Le ciliegie congelate danno la consistenza perfetta. Frulla ciliegie con proteine e latte di mandorla. Aggiungi curcuma, zenzero e un pizzico di pepe nero (potenzia assorbimento curcuma). Dolcifica con miele. Frulla 90 secondi fino a cremosità perfetta. Il colore rosso-arancio è spettacolare!',
        benefici: ['Antiinfiammatorio potente', 'Recovery muscolare', 'Antiossidanti ciliegie', 'Curcuma attiva'],
        consistenza: 'cremoso', sapore: 'fruttato', allergie: ['frutta_secca'], stagione: ['estate'],
        tags: ['recovery', 'anti_inflammatory', 'ciliegie', 'curcuma'], createdAt: new Date(), rating: 4.5, reviewCount: 123,
        imageUrl: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=300&fit=crop'
      },
      {
        id: 'smo_016', nome: 'Frullato Notturno Banana e Magnesio', tipo: 'frullato', momento: 'sera',
        difficolta: 'facile', tempoPreparazione: 4, porzioni: 1, calorie: 285, proteine: 18, carboidrati: 28, grassi: 12,
        ingredienti: ['1 banana matura', '20g proteine caseine vaniglia', '200ml latte mandorla', '1 cucchiaio burro mandorle', '1 cucchiaino polvere magnesio', 'cannella', 'noce moscata', 'estratto vaniglia'],
        preparazione: 'Usa proteine caseine per rilascio lento notturno. Frulla banana molto matura (più zuccheri naturali per rilassamento) con proteine e latte. Il magnesio in polvere si scioglie meglio se aggiunto gradualmente. Aromatizza con spezie calde rilassanti. Consistenza deve essere cremosa e avvolgente.',
        benefici: ['Rilascio proteico notturno', 'Magnesio per sonno', 'Triptofano naturale', 'Relax muscolare'],
        consistenza: 'cremoso', sapore: 'dolce', allergie: ['frutta_secca'], stagione: ['tutto_anno'],
        tags: ['nighttime', 'magnesio', 'relax', 'caseine'], createdAt: new Date(), rating: 4.4, reviewCount: 167,
        imageUrl: 'https://images.unsplash.com/photo-1576673442511-7e39b6545c87?w=400&h=300&fit=crop'
      },
      {
        id: 'smo_017', nome: 'Smoothie Immunità Zenzero e Arancia', tipo: 'smoothie', momento: 'colazione',
        difficolta: 'facile', tempoPreparazione: 5, porzioni: 1, calorie: 245, proteine: 15, carboidrati: 35, grassi: 6,
        ingredienti: ['2 arance fresche spremute', '20g proteine whey neutro', '2cm zenzero fresco', '1 carota media', '100ml acqua cocco', '1 cucchiaino miele manuka', 'curcuma pizzico', 'ghiaccio', 'menta'],
        preparazione: 'Spremi arance fresche (vitamin C massima). Pela e grattugia zenzero fresco. Pela carota e tagliala a pezzi. Frulla succo arancia, proteine e zenzero. Aggiungi carota, acqua di cocco e spezie. Frulla fino a consistenza liscia. Il sapore deve essere bilanciato: dolce agrumato con kick piccante dello zenzero.',
        benefici: ['Vitamina C mega dose', 'Antivirale naturale', 'Digestione stimolata', 'Sistema immunitario'],
        consistenza: 'liquido', sapore: 'fruttato', allergie: [], stagione: ['autunno', 'inverno'],
        tags: ['immunity', 'vitamin_c', 'ginger', 'wellness'], createdAt: new Date(), rating: 4.2, reviewCount: 189,
        imageUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&h=300&fit=crop'
      },

      // 🏃‍♂️ SMOOTHIES PERFORMANCE
      {
        id: 'smo_018', nome: 'Pre-Workout Energizer Beetroot', tipo: 'smoothie', momento: 'pre_workout',
        difficolta: 'medio', tempoPreparazione: 8, porzioni: 1, calorie: 325, proteine: 20, carboidrati: 42, grassi: 8,
        ingredienti: ['1 barbabietola rossa cotta', '1 mela rossa', '20g proteine whey frutti rossi', '200ml succo ciliegia', '1 cucchiaio miele', '1/2 limone spremuto', 'zenzero 1cm', 'ghiaccio abbondante'],
        preparazione: 'La barbabietola deve essere pre-cotta (bollita 45 min o al forno). Pela e taglia a pezzi. Il succo di ciliegia è fondamentale per nitrati extra. Frulla barbabietola, mela e proteine con metà liquidi. Aggiungi resto ingredienti. Frulla 2 minuti per eliminare fibrosità barbabietola. Colore rosso intenso magnifico!',
        benefici: ['Nitrati per vasodilatazione', 'Ossigenazione muscoli', 'Resistenza aumentata', 'Performance endurance'],
        consistenza: 'denso', sapore: 'fruttato', allergie: [], stagione: ['tutto_anno'],
        tags: ['beetroot', 'nitrates', 'endurance', 'performance'], createdAt: new Date(), rating: 4.6, reviewCount: 145,
        imageUrl: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=300&fit=crop'
      },
      {
        id: 'smo_019', nome: 'Hydration Boost Cetriolo e Menta', tipo: 'smoothie', momento: 'qualsiasi',
        difficolta: 'facile', tempoPreparazione: 4, porzioni: 1, calorie: 165, proteine: 18, carboidrati: 8, grassi: 4,
        ingredienti: ['1 cetriolo grande sbucciato', '20g proteine whey neutro', '200ml acqua cocco', 'foglie menta fresca', '1/2 lime spremuto', '1 cucchiaino miele agave', 'ghiaccio tritato', 'sale marino pizzico'],
        preparazione: 'Il cetriolo deve essere molto fresco e croccante. Sbuccialo e rimuovi semi se grandi. La menta fresca è essenziale - usa foglie giovani. Frulla cetriolo con proteine e acqua di cocco. Aggiungi menta, lime e dolcificante. Un pizzico di sale marino esalta tutti i sapori e fornisce elettroliti. Super idratante!',
        benefici: ['Idratazione massima', 'Elettroliti naturali', 'Detox delicato', 'Refresh immediato'],
        consistenza: 'liquido', sapore: 'neutro', allergie: [], stagione: ['estate'],
        tags: ['hydration', 'cucumber', 'fresh', 'cooling'], createdAt: new Date(), rating: 4.1, reviewCount: 98,
        imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&fit=crop'
      },
      {
        id: 'smo_020', nome: 'Smoothie Proteico Vaniglia e Cannella', tipo: 'smoothie', momento: 'qualsiasi',
        difficolta: 'facile', tempoPreparazione: 3, porzioni: 1, calorie: 285, proteine: 28, carboidrati: 18, grassi: 10,
        ingredienti: ['30g proteine whey vaniglia premium', '250ml latte mandorla vaniglia', '1 cucchiaino estratto vaniglia puro', '1 cucchiaino cannella Ceylon', '1/2 banana congelata', '1 cucchiaio yogurt greco 0%', 'ghiaccio', 'stevia'],
        preparazione: 'Usa proteine di altissima qualità per sapore pulito. L\'estratto di vaniglia puro fa la differenza (no artificiale). Cannella Ceylon è più dolce e delicata della Cassia. Frulla tutti ingredienti 60 secondi. La banana congelata dona cremosità senza aggiungere troppi zuccheri. Equilibrio perfetto dolce-speziato.',
        benefici: ['Proteine purissime', 'Controllo glicemico', 'Sapore premium', 'Versatilità assoluta'],
        consistenza: 'cremoso', sapore: 'vaniglia', allergie: ['latte', 'frutta_secca'], stagione: ['tutto_anno'],
        tags: ['vanilla', 'cinnamon', 'premium', 'versatile'], createdAt: new Date(), rating: 4.7, reviewCount: 234,
        imageUrl: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=300&fit=crop'
      }
    ];

    setRecipes(smoothiesDatabase);
    setFilteredRecipes(smoothiesDatabase);
    
    // Carica preferiti
    const savedFavorites = localStorage.getItem('smoothie_favorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }

    console.log(`🍹 [SMOOTHIES] Loaded ${smoothiesDatabase.length} specialized recipes`);
    setLoading(false);
  }, []);

  // 🔍 APPLICAZIONE FILTRI
  useEffect(() => {
    let filtered = recipes.filter(recipe => {
      if (searchQuery && !recipe.nome.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !recipe.ingredienti.some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase()))) {
        return false;
      }
      if (selectedTipo && recipe.tipo !== selectedTipo) return false;
      if (selectedMomento && recipe.momento !== selectedMomento) return false;
      if (selectedSapore && recipe.sapore !== selectedSapore) return false;
      if (selectedConsistenza && recipe.consistenza !== selectedConsistenza) return false;
      return true;
    });

    setFilteredRecipes(filtered);
    setCurrentPage(1);
  }, [searchQuery, selectedTipo, selectedMomento, selectedSapore, selectedConsistenza, recipes]);

  // ❤️ GESTIONE PREFERITI
  const toggleFavorite = (recipeId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(recipeId)) {
      newFavorites.delete(recipeId);
    } else {
      newFavorites.add(recipeId);
    }
    setFavorites(newFavorites);
    localStorage.setItem('smoothie_favorites', JSON.stringify(Array.from(newFavorites)));
  };

  // 👁️ MODAL GESTIONE
  const openModal = (recipe: SmoothieRecipe) => {
    setSelectedRecipe(recipe);
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedRecipe(null);
    setShowModal(false);
    document.body.style.overflow = 'unset';
  };

  // 🧹 RESET FILTRI
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedTipo('');
    setSelectedMomento('');
    setSelectedSapore('');
    setSelectedConsistenza('');
  };

  // 📄 PAGINAZIONE
  const totalPages = Math.ceil(filteredRecipes.length / recipesPerPage);
  const startIndex = (currentPage - 1) * recipesPerPage;
  const currentRecipes = filteredRecipes.slice(startIndex, startIndex + recipesPerPage);

  // 🎨 COLORI PER TIPI
  const getTipoColor = (tipo: string) => {
    const colors = {
      'smoothie': 'bg-green-100 text-green-800',
      'frullato': 'bg-purple-100 text-purple-800',
      'shake': 'bg-blue-100 text-blue-800',
      'bowl': 'bg-pink-100 text-pink-800',
      'energy_ball': 'bg-orange-100 text-orange-800',
      'barretta': 'bg-yellow-100 text-yellow-800',
      'spuntino_solido': 'bg-gray-100 text-gray-800'
    };
    return colors[tipo as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // 🎨 COLORI PER MOMENTI
  const getMomentoColor = (momento: string) => {
    const colors = {
      'pre_workout': 'bg-red-100 text-red-800',
      'post_workout': 'bg-green-100 text-green-800',
      'colazione': 'bg-yellow-100 text-yellow-800',
      'merenda': 'bg-blue-100 text-blue-800',
      'sera': 'bg-purple-100 text-purple-800',
      'qualsiasi': 'bg-gray-100 text-gray-800'
    };
    return colors[momento as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">🍹 Caricando Smoothies & Spuntini FIT...</h2>
          <p className="text-gray-300">Ricette specializzate in arrivo!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 text-white">
      {/* Header */}
      <header className="bg-black bg-opacity-30 backdrop-blur-sm shadow-lg">
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
              <Link href="/ricette" className="hover:text-green-400 transition-colors">Ricette</Link>
              <span className="text-green-400 font-semibold">🍹 Smoothies FIT</span>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            🍹 Smoothies & Spuntini FIT
          </h1>
          <p className="text-xl text-gray-100 mb-8 max-w-4xl mx-auto">
            La collezione definitiva per fitness enthusiasts: smoothies energizzanti, frullati proteici, energy balls e spuntini sani. 
            Ogni ricetta è ottimizzata per performance, recovery e gusto incredibile!
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <Droplets className="h-8 w-8 text-white mx-auto mb-2" />
              <div className="text-sm font-semibold">{filteredRecipes.filter(r => r.tipo === 'smoothie').length} Smoothies</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <Zap className="h-8 w-8 text-white mx-auto mb-2" />
              <div className="text-sm font-semibold">{filteredRecipes.filter(r => r.tipo === 'energy_ball').length} Energy Balls</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <Apple className="h-8 w-8 text-white mx-auto mb-2" />
              <div className="text-sm font-semibold">{filteredRecipes.filter(r => r.tipo === 'bowl').length} Smoothie Bowls</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <Coffee className="h-8 w-8 text-white mx-auto mb-2" />
              <div className="text-sm font-semibold">{filteredRecipes.filter(r => r.momento === 'pre_workout').length} Pre-Workout</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filtri Specializzati */}
      <section className="bg-black bg-opacity-30 backdrop-blur-sm py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Barra ricerca */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end mb-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Cerca smoothies e spuntini..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <select
                value={selectedTipo}
                onChange={(e) => setSelectedTipo(e.target.value)}
                className="w-full bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                style={{
                  backgroundImage: 'none',
                  color: 'white'
                }}
              >
                <option value="" style={{ backgroundColor: '#1f2937', color: 'white' }}>Tutti i tipi</option>
                <option value="smoothie" style={{ backgroundColor: '#1f2937', color: 'white' }}>🥤 Smoothie</option>
                <option value="frullato" style={{ backgroundColor: '#1f2937', color: 'white' }}>🥛 Frullato</option>
                <option value="shake" style={{ backgroundColor: '#1f2937', color: 'white' }}>💪 Shake</option>
                <option value="bowl" style={{ backgroundColor: '#1f2937', color: 'white' }}>🍯 Bowl</option>
                <option value="energy_ball" style={{ backgroundColor: '#1f2937', color: 'white' }}>⚡ Energy Ball</option>
                <option value="barretta" style={{ backgroundColor: '#1f2937', color: 'white' }}>🍫 Barretta</option>
                <option value="spuntino_solido" style={{ backgroundColor: '#1f2937', color: 'white' }}>🍪 Spuntino</option>
              </select>
            </div>

            <div>
              <select
                value={selectedMomento}
                onChange={(e) => setSelectedMomento(e.target.value)}
                className="w-full bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                style={{
                  backgroundImage: 'none',
                  color: 'white'
                }}
              >
                <option value="" style={{ backgroundColor: '#1f2937', color: 'white' }}>Momento</option>
                <option value="pre_workout" style={{ backgroundColor: '#1f2937', color: 'white' }}>🏃‍♂️ Pre-Workout</option>
                <option value="post_workout" style={{ backgroundColor: '#1f2937', color: 'white' }}>💪 Post-Workout</option>
                <option value="colazione" style={{ backgroundColor: '#1f2937', color: 'white' }}>🌅 Colazione</option>
                <option value="merenda" style={{ backgroundColor: '#1f2937', color: 'white' }}>🍎 Merenda</option>
                <option value="sera" style={{ backgroundColor: '#1f2937', color: 'white' }}>🌙 Sera</option>
                <option value="qualsiasi" style={{ backgroundColor: '#1f2937', color: 'white' }}>⏰ Qualsiasi</option>
              </select>
            </div>

            <div>
              <select
                value={selectedSapore}
                onChange={(e) => setSelectedSapore(e.target.value)}
                className="w-full bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                style={{
                  backgroundImage: 'none',
                  color: 'white'
                }}
              >
                <option value="" style={{ backgroundColor: '#1f2937', color: 'white' }}>Sapore</option>
                <option value="dolce" style={{ backgroundColor: '#1f2937', color: 'white' }}>🍯 Dolce</option>
                <option value="fruttato" style={{ backgroundColor: '#1f2937', color: 'white' }}>🍓 Fruttato</option>
                <option value="cioccolato" style={{ backgroundColor: '#1f2937', color: 'white' }}>🍫 Cioccolato</option>
                <option value="vaniglia" style={{ backgroundColor: '#1f2937', color: 'white' }}>🌟 Vaniglia</option>
                <option value="tropicale" style={{ backgroundColor: '#1f2937', color: 'white' }}>🥥 Tropicale</option>
                <option value="verde" style={{ backgroundColor: '#1f2937', color: 'white' }}>🥬 Verde</option>
                <option value="neutro" style={{ backgroundColor: '#1f2937', color: 'white' }}>⚪ Neutro</option>
              </select>
            </div>

            <div className="flex gap-2">
              {(searchQuery || selectedTipo || selectedMomento || selectedSapore) && (
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm font-medium"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Filtri aggiuntivi */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <select
                value={selectedConsistenza}
                onChange={(e) => setSelectedConsistenza(e.target.value)}
                className="w-full bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                style={{
                  backgroundImage: 'none',
                  color: 'white'
                }}
              >
                <option value="" style={{ backgroundColor: '#1f2937', color: 'white' }}>Consistenza</option>
                <option value="liquido" style={{ backgroundColor: '#1f2937', color: 'white' }}>💧 Liquido</option>
                <option value="cremoso" style={{ backgroundColor: '#1f2937', color: 'white' }}>🥛 Cremoso</option>
                <option value="denso" style={{ backgroundColor: '#1f2937', color: 'white' }}>🍯 Denso</option>
                <option value="solido" style={{ backgroundColor: '#1f2937', color: 'white' }}>🍪 Solido</option>
              </select>
            </div>
            
            <div>
              <button
                onClick={() => {
                  const proteinRich = recipes.filter(r => r.proteine >= 20);
                  setFilteredRecipes(proteinRich);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors font-medium"
              >
                💪 Alto Proteico (20g+)
              </button>
            </div>

            <div>
              <button
                onClick={() => {
                  const favoritesList = Array.from(favorites);
                  const favRecipes = recipes.filter(r => favoritesList.includes(r.id));
                  setFilteredRecipes(favRecipes);
                }}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white px-3 py-2 rounded-lg transition-colors font-medium"
              >
                ❤️ Preferiti ({favorites.size})
              </button>
            </div>

            <div>
              <button
                onClick={() => {
                  const quickRecipes = recipes.filter(r => r.tempoPreparazione <= 5);
                  setFilteredRecipes(quickRecipes);
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors font-medium"
              >
                ⚡ Veloci (≤5 min)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Ricette */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {currentRecipes.length === 0 ? (
            <div className="text-center py-12">
              <Droplets className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-300 mb-2">Nessun smoothie trovato</h3>
              <p className="text-gray-400 mb-4">Prova a modificare i filtri di ricerca</p>
              <button
                onClick={resetFilters}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                Reset Filtri
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentRecipes.map((recipe) => (
                  <div key={recipe.id} className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-white border-opacity-20">
                    {/* Immagine */}
                    <div className="relative h-48">
                      <img
                        src={recipe.imageUrl}
                        alt={recipe.nome}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.src = 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=400&h=300&fit=crop';
                        }}
                      />
                      
                      {/* Bottone Preferito */}
                      <button
                        onClick={() => toggleFavorite(recipe.id)}
                        className="absolute top-3 right-3 p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-all"
                      >
                        <Heart
                          className={`h-5 w-5 ${
                            favorites.has(recipe.id)
                              ? 'text-red-500 fill-current'
                              : 'text-white'
                          }`}
                        />
                      </button>

                      {/* Badge Tipo */}
                      <div className="absolute top-3 left-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTipoColor(recipe.tipo)}`}>
                          {recipe.tipo.charAt(0).toUpperCase() + recipe.tipo.slice(1)}
                        </span>
                      </div>

                      {/* Badge Momento */}
                      <div className="absolute bottom-3 left-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getMomentoColor(recipe.momento)}`}>
                          {recipe.momento.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Overlay Click */}
                      <div 
                        onClick={() => openModal(recipe)}
                        className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-all cursor-pointer"
                      >
                        <div className="bg-white bg-opacity-20 rounded-full p-3">
                          <Eye className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Contenuto Card */}
                    <div className="p-4">
                      {/* Titolo e Rating */}
                      <div className="mb-3">
                        <h3 className="text-lg font-bold text-white mb-1 line-clamp-2 min-h-[3.5rem]">
                          {recipe.nome}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-300 ml-1">
                              {recipe.rating.toFixed(1)}
                            </span>
                          </div>
                          <span className="text-gray-500">•</span>
                          <span className="text-sm text-gray-400">
                            {recipe.reviewCount} recensioni
                          </span>
                        </div>
                      </div>

                      {/* Info Nutrizionali */}
                      <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                        <div className="text-center bg-white bg-opacity-10 rounded py-1">
                          <div className="font-semibold text-white">{recipe.calorie}</div>
                          <div className="text-gray-300">kcal</div>
                        </div>
                        <div className="text-center bg-white bg-opacity-10 rounded py-1">
                          <div className="font-semibold text-white">{recipe.proteine}g</div>
                          <div className="text-gray-300">prot</div>
                        </div>
                        <div className="text-center bg-white bg-opacity-10 rounded py-1">
                          <div className="font-semibold text-white">{recipe.tempoPreparazione}min</div>
                          <div className="text-gray-300">prep</div>
                        </div>
                      </div>

                      {/* Benefici Preview */}
                      <div className="mb-3">
                        <div className="text-xs text-gray-300 font-medium mb-1">Benefici:</div>
                        <div className="text-xs text-green-300">
                          {recipe.benefici.slice(0, 2).join(' • ')}
                        </div>
                      </div>

                      {/* Bottone Visualizza */}
                      <button
                        onClick={() => openModal(recipe)}
                        className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-2 px-4 rounded-lg transition-all font-semibold flex items-center justify-center space-x-2"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Vedi Ricetta</span>
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
                      className="px-4 py-2 bg-white bg-opacity-10 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-20 transition-colors"
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
                                : 'bg-white bg-opacity-10 text-gray-300 hover:bg-opacity-20'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-white bg-opacity-10 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-20 transition-colors"
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

      {/* Modal Ricetta Dettagliata */}
      {showModal && selectedRecipe && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            {/* Header Modal */}
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-white">{selectedRecipe.nome}</h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            {/* Contenuto Modal */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Colonna Sinistra */}
                <div>
                  <img
                    src={selectedRecipe.imageUrl}
                    alt={selectedRecipe.nome}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                  
                  {/* Info Nutrizionali */}
                  <div className="bg-gray-800 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Valori Nutrizionali</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center bg-gray-700 rounded py-2">
                        <div className="font-bold text-white">{selectedRecipe.calorie}</div>
                        <div className="text-gray-300">Calorie</div>
                      </div>
                      <div className="text-center bg-gray-700 rounded py-2">
                        <div className="font-bold text-white">{selectedRecipe.proteine}g</div>
                        <div className="text-gray-300">Proteine</div>
                      </div>
                      <div className="text-center bg-gray-700 rounded py-2">
                        <div className="font-bold text-white">{selectedRecipe.carboidrati}g</div>
                        <div className="text-gray-300">Carboidrati</div>
                      </div>
                      <div className="text-center bg-gray-700 rounded py-2">
                        <div className="font-bold text-white">{selectedRecipe.grassi}g</div>
                        <div className="text-gray-300">Grassi</div>
                      </div>
                    </div>
                  </div>

                  {/* Caratteristiche Speciali */}
                  <div className="bg-gray-800 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Caratteristiche</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Tipo:</span>
                        <span className="text-white font-medium">{selectedRecipe.tipo.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Momento:</span>
                        <span className="text-white font-medium">{selectedRecipe.momento.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Consistenza:</span>
                        <span className="text-white font-medium">{selectedRecipe.consistenza}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Sapore:</span>
                        <span className="text-white font-medium">{selectedRecipe.sapore}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Tempo:</span>
                        <span className="text-white font-medium">{selectedRecipe.tempoPreparazione} minuti</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Porzioni:</span>
                        <span className="text-white font-medium">{selectedRecipe.porzioni}</span>
                      </div>
                    </div>
                  </div>

                  {/* Benefici */}
                  <div className="bg-gradient-to-r from-green-800 to-blue-800 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-3">💪 Benefici</h3>
                    <ul className="space-y-2">
                      {selectedRecipe.benefici.map((beneficio, index) => (
                        <li key={index} className="flex items-start space-x-2 text-sm">
                          <span className="text-green-400 mt-1">✓</span>
                          <span className="text-gray-200">{beneficio}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Colonna Destra */}
                <div>
                  {/* Ingredienti */}
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-white mb-4">🛒 Ingredienti</h3>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <ul className="space-y-2">
                        {selectedRecipe.ingredienti.map((ingrediente, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <span className="text-green-400 mt-1">•</span>
                            <span className="text-gray-200">{ingrediente}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Preparazione */}
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-white mb-4">👨‍🍳 Preparazione</h3>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="text-gray-200 leading-relaxed">
                        {selectedRecipe.preparazione}
                      </div>
                      
                      {/* Tempo evidenziato */}
                      <div className="mt-4 p-3 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg">
                        <div className="flex items-center space-x-2 text-white">
                          <Clock className="h-5 w-5" />
                          <span className="font-semibold">Tempo totale: {selectedRecipe.tempoPreparazione} minuti</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tags e Rating */}
                  <div className="space-y-4">
                    {/* Tags */}
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

                    {/* Rating */}
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-400 fill-current" />
                        <span className="text-white ml-1 font-semibold text-lg">
                          {selectedRecipe.rating.toFixed(1)}
                        </span>
                      </div>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-400">
                        {selectedRecipe.reviewCount} recensioni
                      </span>
                    </div>

                    {/* Allergie se presenti */}
                    {selectedRecipe.allergie.length > 0 && (
                      <div className="p-3 bg-red-900 bg-opacity-30 rounded-lg border border-red-600 border-opacity-30">
                        <div className="flex items-center space-x-2 text-red-400 text-sm">
                          <span>⚠️</span>
                          <span className="font-semibold">Contiene: {selectedRecipe.allergie.join(', ')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-black bg-opacity-50 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Droplets className="h-8 w-8 text-green-400" />
            <h3 className="text-xl font-bold">Smoothies & Spuntini FIT Collection</h3>
          </div>
          <p className="text-gray-400 mb-4">
            {recipes.length} ricette specializzate per fitness enthusiasts. Energia, performance e gusto in ogni sorso!
          </p>
          <div className="flex justify-center gap-6 text-sm">
            <Link href="/" className="text-gray-400 hover:text-green-400 transition-colors">Home</Link>
            <Link href="/ricette" className="text-gray-400 hover:text-green-400 transition-colors">Tutte le Ricette</Link>
            <Link href="/dashboard" className="text-gray-400 hover:text-green-400 transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}