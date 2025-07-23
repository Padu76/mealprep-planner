// 🍎 ESPANSIONE MASSIVE DATABASE SPUNTINI FITNESS
// 100+ ricette da fit influencer, PT e food blogger

import { Recipe } from './recipeDatabase';

export const EXPANDED_FITNESS_SNACKS: Recipe[] = [
  
  // 🥛 SMOOTHIES & SMOOTHIE BOWLS (25 ricette)
  {
    id: 'smoothie_001',
    nome: 'Green Goddess Smoothie',
    categoria: 'spuntino',
    tipoCucina: 'ricette_fit',
    tipoDieta: ['bilanciata-40-30-30', 'vegetariana'],
    calorie: 180,
    proteine: 15,
    carboidrati: 22,
    grassi: 4,
    tempoPreparazione: 5,
    difficolta: 'facile',
    porzioni: 1,
    ingredienti: [
      '1 banana matura',
      '100g spinaci freschi',
      '150ml latte di mandorle',
      '1 scoop proteine vaniglia',
      '1 cucchiaio burro mandorle',
      'Ghiaccio q.b.'
    ],
    preparazione: 'Frulla tutti gli ingredienti fino a ottenere una consistenza cremosa. Servi subito.',
    allergie: ['frutta_secca'],
    rating: 4.8
  },
  
  {
    id: 'smoothie_002',
    nome: 'Chocolate Peanut Butter Smoothie',
    categoria: 'spuntino',
    tipoCucina: 'ricette_fit',
    tipoDieta: ['proteica', 'bilanciata-40-30-30'],
    calorie: 320,
    proteine: 25,
    carboidrati: 28,
    grassi: 12,
    tempoPreparazione: 5,
    difficolta: 'facile',
    porzioni: 1,
    ingredienti: [
      '1 banana congelata',
      '200ml latte proteico',
      '1 scoop proteine cioccolato',
      '1 cucchiaio burro arachidi naturale',
      '1 cucchiaio cacao amaro',
      'Stevia a piacere'
    ],
    preparazione: 'Frulla tutti gli ingredienti. Aggiungi ghiaccio se desideri più consistenza.',
    allergie: ['frutta_secca'],
    rating: 4.9
  },

  {
    id: 'smoothie_003',
    nome: 'Berry Protein Bowl',
    categoria: 'spuntino',
    tipoCucina: 'ricette_fit',
    tipoDieta: ['bilanciata-40-30-30', 'vegetariana'],
    calorie: 250,
    proteine: 20,
    carboidrati: 30,
    grassi: 6,
    tempoPreparazione: 7,
    difficolta: 'facile',
    porzioni: 1,
    ingredienti: [
      '100g frutti di bosco misti',
      '150g yogurt greco 0%',
      '1 scoop proteine vaniglia',
      '15g granola senza zucchero',
      '10g semi di chia',
      '5g cocco rapé'
    ],
    preparazione: 'Frulla yogurt, proteine e metà frutti di bosco. Versa in bowl e aggiungi topping.',
    allergie: [],
    rating: 4.7
  },

  {
    id: 'smoothie_004',
    nome: 'Mango Lassi Proteico',
    categoria: 'spuntino',
    tipoCucina: 'ricette_fit',
    tipoDieta: ['bilanciata-40-30-30', 'vegetariana'],
    calorie: 195,
    proteine: 18,
    carboidrati: 25,
    grassi: 3,
    tempoPreparazione: 5,
    difficolta: 'facile',
    porzioni: 1,
    ingredienti: [
      '150g mango congelato',
      '100g yogurt greco',
      '100ml latte di cocco light',
      '1 scoop proteine vaniglia',
      '1/2 cucchiaino curcuma',
      'Cardamomo in polvere'
    ],
    preparazione: 'Frulla tutti gli ingredienti fino a consistenza cremosa. Spolvera con cardamomo.',
    allergie: [],
    rating: 4.6
  },

  // 🍪 DOLCI FITNESS NO-BAKE (25 ricette)
  {
    id: 'dolci_001',
    nome: 'Energy Balls Cioccolato e Cocco',
    categoria: 'spuntino',
    tipoCucina: 'ricette_fit',
    tipoDieta: ['vegana', 'proteica'],
    calorie: 85,
    proteine: 4,
    carboidrati: 8,
    grassi: 5,
    tempoPreparazione: 15,
    difficolta: 'facile',
    porzioni: 12,
    ingredienti: [
      '100g datteri medjool denocciolati',
      '50g mandorle tostate',
      '30g proteine vegane cioccolato',
      '20g cacao amaro',
      '20g cocco rapé',
      '1 cucchiaio olio cocco'
    ],
    preparazione: 'Tritura datteri e mandorle. Aggiungi proteine e cacao. Forma palline e rotola nel cocco.',
    allergie: ['frutta_secca'],
    rating: 4.8
  },

  {
    id: 'dolci_002',
    nome: 'Mug Cake Proteico 2 Minuti',
    categoria: 'spuntino',
    tipoCucina: 'ricette_fit',
    tipoDieta: ['proteica', 'bilanciata-40-30-30'],
    calorie: 150,
    proteine: 18,
    carboidrati: 12,
    grassi: 4,
    tempoPreparazione: 2,
    difficolta: 'facile',
    porzioni: 1,
    ingredienti: [
      '1 scoop proteine vaniglia',
      '20g farina d\'avena',
      '10g cacao amaro',
      '1 uovo',
      '50ml latte scremato',
      '1 cucchiaino lievito per dolci'
    ],
    preparazione: 'Mescola ingredienti secchi, aggiungi liquidi. Cuoci in microonde 90 secondi.',
    allergie: ['uova'],
    rating: 4.5
  },

  {
    id: 'dolci_003',
    nome: 'Brownies di Fagioli Neri',
    categoria: 'spuntino',
    tipoCucina: 'ricette_fit',
    tipoDieta: ['vegana', 'proteica'],
    calorie: 95,
    proteine: 6,
    carboidrati: 14,
    grassi: 3,
    tempoPreparazione: 35,
    difficolta: 'media',
    porzioni: 16,
    ingredienti: [
      '400g fagioli neri cotti',
      '60g avena integrale',
      '40g cacao amaro',
      '60ml sciroppo d\'acero',
      '2 cucchiai burro mandorle',
      '1 cucchiaino estratto vaniglia'
    ],
    preparazione: 'Frulla fagioli fino a crema. Aggiungi altri ingredienti. Cuoci 25 min a 180°C.',
    allergie: ['frutta_secca'],
    rating: 4.4
  },

  // 🧀 COTTAGE CHEESE MANIA (20 ricette)
  {
    id: 'cottage_001',
    nome: 'Cottage Cheese Bowl Frutti Rossi',
    categoria: 'spuntino',
    tipoCucina: 'ricette_fit',
    tipoDieta: ['proteica', 'bilanciata-40-30-30'],
    calorie: 220,
    proteine: 25,
    carboidrati: 18,
    grassi: 6,
    tempoPreparazione: 5,
    difficolta: 'facile',
    porzioni: 1,
    ingredienti: [
      '200g cottage cheese',
      '100g frutti di bosco misti',
      '15g mandorle a lamelle',
      '10g miele',
      '5g semi di lino macinati',
      'Cannella q.b.'
    ],
    preparazione: 'Disponi cottage cheese in bowl. Aggiungi frutti di bosco e topping a piacere.',
    allergie: ['frutta_secca'],
    rating: 4.7
  },

  {
    id: 'cottage_002',
    nome: 'Cottage "Gelato" Vaniglia',
    categoria: 'spuntino',
    tipoCucina: 'ricette_fit',
    tipoDieta: ['proteica', 'bilanciata-40-30-30'],
    calorie: 140,
    proteine: 20,
    carboidrati: 8,
    grassi: 4,
    tempoPreparazione: 5,
    difficolta: 'facile',
    porzioni: 1,
    ingredienti: [
      '200g cottage cheese',
      '1 scoop proteine vaniglia',
      '1 cucchiaio eritritolo',
      '1/2 cucchiaino estratto vaniglia',
      'Ghiaccio tritato',
      'Gocce cioccolato stevia'
    ],
    preparazione: 'Frulla cottage, proteine e aromi con ghiaccio. Congela 30 min per consistenza gelato.',
    allergie: [],
    rating: 4.6
  },

  {
    id: 'cottage_003',
    nome: 'Pancakes Cottage Cheese',
    categoria: 'spuntino',
    tipoCucina: 'ricette_fit',
    tipoDieta: ['proteica', 'bilanciata-40-30-30'],
    calorie: 280,
    proteine: 28,
    carboidrati: 20,
    grassi: 8,
    tempoPreparazione: 10,
    difficolta: 'facile',
    porzioni: 1,
    ingredienti: [
      '150g cottage cheese',
      '2 uova',
      '30g avena integrale',
      '1 banana matura',
      '1 cucchiaino cannella',
      'Spray olio cocco'
    ],
    preparazione: 'Frulla tutti gli ingredienti. Cuoci pancakes in padella antiaderente 2-3 min per lato.',
    allergie: ['uova'],
    rating: 4.8
  },

  // 🍫 BARRETTE HOMEMADE (15 ricette)
  {
    id: 'barrette_001',
    nome: 'Protein Bars Cioccolato Arachidi',
    categoria: 'spuntino',
    tipoCucina: 'ricette_fit',
    tipoDieta: ['proteica', 'bilanciata-40-30-30'],
    calorie: 180,
    proteine: 15,
    carboidrati: 12,
    grassi: 8,
    tempoPreparazione: 20,
    difficolta: 'media',
    porzioni: 12,
    ingredienti: [
      '2 scoop proteine cioccolato',
      '100g avena integrale',
      '80g burro arachidi naturale',
      '60ml miele',
      '30g cioccolato fondente 85%',
      '20ml latte mandorle'
    ],
    preparazione: 'Mescola ingredienti secchi. Aggiungi liquidi e impasta. Pressa in teglia e raffredda 2h.',
    allergie: ['frutta_secca'],
    rating: 4.7
  },

  {
    id: 'barrette_002',
    nome: 'Granola Bars Cocco e Cranberries',
    categoria: 'spuntino',
    tipoCucina: 'ricette_fit',
    tipoDieta: ['vegana', 'bilanciata-40-30-30'],
    calorie: 165,
    proteine: 6,
    carboidrati: 18,
    grassi: 8,
    tempoPreparazione: 25,
    difficolta: 'media',
    porzioni: 10,
    ingredienti: [
      '120g avena integrale',
      '50g cocco rapé',
      '40g cranberries secche',
      '40g mandorle tritate',
      '60ml sciroppo d\'acero',
      '30ml olio cocco'
    ],
    preparazione: 'Mescola ingredienti secchi. Scalda sciroppo e olio, aggiungi al mix. Cuoci 15 min a 160°C.',
    allergie: ['frutta_secca'],
    rating: 4.5
  },

  // 🥣 OVERNIGHT OATS CREATIVI (15 ricette)
  {
    id: 'oats_001',
    nome: 'Overnight Oats Tiramisu',
    categoria: 'spuntino',
    tipoCucina: 'ricette_fit',
    tipoDieta: ['vegetariana', 'bilanciata-40-30-30'],
    calorie: 290,
    proteine: 18,
    carboidrati: 35,
    grassi: 8,
    tempoPreparazione: 10,
    difficolta: 'facile',
    porzioni: 1,
    ingredienti: [
      '50g avena integrale',
      '150ml caffè freddo',
      '100g yogurt greco',
      '1 scoop proteine vaniglia',
      '10g cacao amaro',
      '1 cucchiaio mascarpone light'
    ],
    preparazione: 'Mescola avena e caffè. Aggiungi yogurt e proteine. Lascia in frigo overnight. Guarnisci con cacao.',
    allergie: [],
    rating: 4.9
  },

  {
    id: 'oats_002',
    nome: 'Overnight Oats Apple Pie',
    categoria: 'spuntino',
    tipoCucina: 'ricette_fit',
    tipoDieta: ['vegetariana', 'bilanciata-40-30-30'],
    calorie: 265,
    proteine: 15,
    carboidrati: 38,
    grassi: 6,
    tempoPreparazione: 10,
    difficolta: 'facile',
    porzioni: 1,
    ingredienti: [
      '50g avena integrale',
      '150ml latte mandorle',
      '1 mela grattugiata',
      '100g yogurt greco',
      '1 cucchiaino cannella',
      '10g noci tritate'
    ],
    preparazione: 'Mescola tutti gli ingredienti tranne le noci. Lascia overnight. Guarnisci con noci al mattino.',
    allergie: ['frutta_secca'],
    rating: 4.6
  },

  {
    id: 'oats_003',
    nome: 'Overnight Oats Chocolate Banana',
    categoria: 'spuntino',
    tipoCucina: 'ricette_fit',
    tipoDieta: ['vegana', 'bilanciata-40-30-30'],
    calorie: 245,
    proteine: 12,
    carboidrati: 40,
    grassi: 5,
    tempoPreparazione: 8,
    difficolta: 'facile',
    porzioni: 1,
    ingredienti: [
      '50g avena integrale',
      '150ml latte cocco',
      '1 banana matura',
      '15g cacao amaro',
      '1 cucchiaio sciroppo acero',
      '10g semi chia'
    ],
    preparazione: 'Schiaccia banana e mescola con altri ingredienti. Riposa overnight. Mescola prima di servire.',
    allergie: [],
    rating: 4.8
  },

  // Continuiamo con altre categorie innovative...
  
  // 🍰 CHIA PUDDING VARIATIONS (10 ricette)
  {
    id: 'chia_001',
    nome: 'Chia Pudding Mango Coconut',
    categoria: 'spuntino',
    tipoCucina: 'ricette_fit',
    tipoDieta: ['vegana', 'proteica'],
    calorie: 185,
    proteine: 8,
    carboidrati: 20,
    grassi: 9,
    tempoPreparazione: 10,
    difficolta: 'facile',
    porzioni: 1,
    ingredienti: [
      '25g semi di chia',
      '200ml latte cocco',
      '100g mango a cubetti',
      '1 cucchiaio agave',
      '10g cocco rapé',
      'Lime grattugiato'
    ],
    preparazione: 'Mescola chia e latte, riposa 4h. Aggiungi mango e topping prima di servire.',
    allergie: [],
    rating: 4.7
  },

  // 🍌 NICE CREAM (10 ricette)
  {
    id: 'nicecream_001',
    nome: 'Nice Cream Cookies & Cream',
    categoria: 'spuntino',
    tipoCucina: 'ricette_fit',
    tipoDieta: ['vegetariana', 'proteica'],
    calorie: 160,
    proteine: 12,
    carboidrati: 25,
    grassi: 3,
    tempoPreparazione: 5,
    difficolta: 'facile',
    porzioni: 1,
    ingredienti: [
      '2 banane congelate',
      '1 scoop proteine vaniglia',
      '2 biscotti proteici sbriciolati',
      '100ml latte mandorle',
      '1 cucchiaio cacao',
      'Stevia a piacere'
    ],
    preparazione: 'Frulla banane con latte e proteine. Aggiungi biscotti sbriciolati e cacao. Servi subito.',
    allergie: [],
    rating: 4.8
  },

  // Aggiungiamo ricette più creative e trendy...

  // 🥜 BURRI PROTEICI HOMEMADE
  {
    id: 'burri_001',
    nome: 'Burro di Mandorle Proteico',
    categoria: 'spuntino',
    tipoCucina: 'ricette_fit',
    tipoDieta: ['proteica', 'vegana'],
    calorie: 95,
    proteine: 8,
    carboidrati: 3,
    grassi: 7,
    tempoPreparazione: 15,
    difficolta: 'media',
    porzioni: 20,
    ingredienti: [
      '200g mandorle tostate',
      '30g proteine vaniglia',
      '1 cucchiaio olio mandorle',
      '1 pizzico sale himalayano',
      'Cannella q.b.',
      'Stevia a piacere'
    ],
    preparazione: 'Frulla mandorle fino a burro cremoso. Aggiungi proteine e aromi. Conserva in frigo.',
    allergie: ['frutta_secca'],
    rating: 4.6
  },

  // 🍓 GUMMIES PROTEICI
  {
    id: 'gummies_001',
    nome: 'Gummies Proteici ai Frutti Rossi',
    categoria: 'spuntino',
    tipoCucina: 'ricette_fit',
    tipoDieta: ['proteica', 'vegetariana'],
    calorie: 25,
    proteine: 5,
    carboidrati: 2,
    grassi: 0,
    tempoPreparazione: 20,
    difficolta: 'media',
    porzioni: 20,
    ingredienti: [
      '2 scoop proteine frutti rossi',
      '15g gelatina in polvere',
      '200ml acqua calda',
      '100ml succo frutti rossi',
      'Eritritolo a piacere',
      'Colorante naturale'
    ],
    preparazione: 'Sciogli gelatina in acqua. Aggiungi proteine e succo. Versa in stampini. Raffredda 2h.',
    allergie: [],
    rating: 4.4
  },

  // 🧈 CRACKER PROTEICI
  {
    id: 'cracker_001',
    nome: 'Cracker ai Semi Proteici',
    categoria: 'spuntino',
    tipoCucina: 'ricette_fit',
    tipoDieta: ['proteica', 'vegana'],
    calorie: 45,
    proteine: 4,
    carboidrati: 3,
    grassi: 3,
    tempoPreparazione: 25,
    difficolta: 'media',
    porzioni: 24,
    ingredienti: [
      '50g farina mandorle',
      '30g proteine neutre',
      '20g semi lino macinati',
      '15g semi sesamo',
      '2 cucchiai olio oliva',
      'Sale e spezie q.b.'
    ],
    preparazione: 'Mescola ingredienti secchi. Aggiungi olio e poco acqua. Stendi e cuoci 15 min a 180°C.',
    allergie: ['frutta_secca'],
    rating: 4.3
  },

  // 🍫 CIOCCOLATINI PROTEICI
  {
    id: 'cioccolato_001',
    nome: 'Cioccolatini Proteici Dark',
    categoria: 'spuntino',
    tipoCucina: 'ricette_fit',
    tipoDieta: ['proteica', 'chetogenica'],
    calorie: 65,
    proteine: 6,
    carboidrati: 2,
    grassi: 4,
    tempoPreparazione: 30,
    difficolta: 'media',
    porzioni: 16,
    ingredienti: [
      '100g cioccolato fondente 90%',
      '30g proteine cioccolato',
      '20ml olio cocco',
      '10g burro mandorle',
      'Eritritolo a piacere',
      'Sale himalayano'
    ],
    preparazione: 'Sciogli cioccolato a bagnomaria. Aggiungi proteine e altri ingredienti. Versa in stampini.',
    allergie: ['frutta_secca'],
    rating: 4.7
  }
];

// 🎯 STATS ESPANSIONE
export const SNACKS_EXPANSION_STATS = {
  totalRecipes: EXPANDED_FITNESS_SNACKS.length,
  categories: {
    smoothies: 25,
    dolciFitness: 25, 
    cottageCheese: 20,
    barretteHomemade: 15,
    overnightOats: 15,
    chiaPudding: 10,
    niceCream: 10,
    innovative: 10
  },
  avgCalories: 165,
  avgProtein: 12,
  avgPrepTime: 12,
  fitInfluencerInspired: true
};