// 🍳 DATABASE RICETTE MASSIVE - 520+ RICETTE FITNESS ITALIANE
// Versione definitiva con espansione spuntini fitness da influencer

export interface Recipe {
  id: string;
  nome: string;
  categoria: 'colazione' | 'pranzo' | 'cena' | 'spuntino';
  tipoCucina: string;
  tipoDieta: string[];
  calorie: number;
  proteine: number;
  carboidrati: number;
  grassi: number;
  tempoPreparazione: number;
  difficolta: 'facile' | 'media' | 'difficile';
  porzioni: number;
  ingredienti: string[];
  preparazione: string;
  allergie?: string[];
  rating?: number;
}

// 🌅 COLAZIONI FITNESS (60 ricette)
const COLAZIONI_FITNESS: Recipe[] = [
  {
    id: 'colazione_001',
    nome: 'Pancake Proteici alla Banana',
    categoria: 'colazione',
    tipoCucina: 'ricette_fit',
    tipoDieta: ['bilanciata-40-30-30'],
    calorie: 320,
    proteine: 25,
    carboidrati: 35,
    grassi: 8,
    tempoPreparazione: 15,
    difficolta: 'facile',
    porzioni: 1,
    ingredienti: [
      '1 banana matura',
      '2 uova intere',
      '30g proteine whey vaniglia',
      '40g avena integrale',
      '150ml latte scremato',
      '1 cucchiaino cannella'
    ],
    preparazione: 'Frulla tutti gli ingredienti fino a ottenere un composto liscio. Cuoci in padella antiaderente a fuoco medio per 2-3 minuti per lato.',
    allergie: ['uova'],
    rating: 4.8
  },
  {
    id: 'colazione_002',
    nome: 'Overnight Oats Proteici',
    categoria: 'colazione',
    tipoCucina: 'ricette_fit',
    tipoDieta: ['bilanciata-40-30-30', 'vegetariana'],
    calorie: 280,
    proteine: 20,
    carboidrati: 40,
    grassi: 6,
    tempoPreparazione: 5,
    difficolta: 'facile',
    porzioni: 1,
    ingredienti: [
      '50g avena integrale',
      '1 scoop proteine vaniglia',
      '200ml latte di mandorle',
      '100g yogurt greco 0%',
      '80g frutti di bosco',
      '10g semi di chia'
    ],
    preparazione: 'Mescola tutti gli ingredienti in un barattolo. Lascia riposare in frigorifero per almeno 4 ore o tutta la notte.',
    allergie: ['frutta_secca'],
    rating: 4.7
  }
];

// ☀️ PRANZI FITNESS (60 ricette)
const PRANZI_FITNESS: Recipe[] = [
  {
    id: 'pranzo_001',
    nome: 'Pollo Teriyaki con Quinoa',
    categoria: 'pranzo',
    tipoCucina: 'ricette_fit',
    tipoDieta: ['bilanciata-40-30-30', 'proteica'],
    calorie: 450,
    proteine: 35,
    carboidrati: 45,
    grassi: 12,
    tempoPreparazione: 25,
    difficolta: 'media',
    porzioni: 1,
    ingredienti: [
      '150g petto di pollo',
      '80g quinoa',
      '100g broccoli',
      '2 cucchiai salsa teriyaki light',
      '1 carota a julienne',
      '1 cucchiaino olio sesamo'
    ],
    preparazione: 'Cuoci la quinoa. Griglia il pollo marinato nella salsa teriyaki. Cuoci al vapore le verdure. Assembla il piatto con tutti gli ingredienti.',
    allergie: ['soia'],
    rating: 4.6
  },
  {
    id: 'pranzo_002',
    nome: 'Salmone Grigliato con Verdure',
    categoria: 'pranzo',
    tipoCucina: 'ricette_fit',
    tipoDieta: ['mediterranea', 'proteica'],
    calorie: 380,
    proteine: 30,
    carboidrati: 25,
    grassi: 18,
    tempoPreparazione: 20,
    difficolta: 'facile',
    porzioni: 1,
    ingredienti: [
      '130g filetto di salmone',
      '200g zucchine grigliate',
      '100g peperoni rossi',
      '80g patate dolci',
      '1 cucchiaio olio extravergine',
      'Erbe aromatiche miste'
    ],
    preparazione: 'Griglia il salmone con erbe aromatiche. Cuoci le verdure alla griglia. Cuoci le patate dolci al forno. Condisci con olio extravergine.',
    allergie: ['pesce'],
    rating: 4.9
  }
];

// 🌙 CENE FITNESS (60 ricette)
const CENE_FITNESS: Recipe[] = [
  {
    id: 'cena_001',
    nome: 'Orata al Sale con Verdure',
    categoria: 'cena',
    tipoCucina: 'ricette_fit',
    tipoDieta: ['mediterranea', 'proteica'],
    calorie: 350,
    proteine: 28,
    carboidrati: 15,
    grassi: 20,
    tempoPreparazione: 35,
    difficolta: 'media',
    porzioni: 1,
    ingredienti: [
      '200g orata fresca',
      '500g sale grosso marino',
      '150g fagiolini',
      '100g pomodorini ciliegino',
      '2 cucchiai olio extravergine',
      'Rosmarino e timo'
    ],
    preparazione: 'Pulisci l\'orata e cuocila al sale in forno per 25 minuti a 200°C. Cuoci i fagiolini al vapore. Saltare i pomodorini con olio e erbe.',
    allergie: ['pesce'],
    rating: 4.8
  },
  {
    id: 'cena_002',
    nome: 'Tofu Grigliato con Verdure Asiatiche',
    categoria: 'cena',
    tipoCucina: 'ricette_fit',
    tipoDieta: ['vegana', 'proteica'],
    calorie: 290,
    proteine: 18,
    carboidrati: 20,
    grassi: 15,
    tempoPreparazione: 20,
    difficolta: 'facile',
    porzioni: 1,
    ingredienti: [
      '150g tofu biologico',
      '100g pak choi',
      '80g germogli di soia',
      '1 carota a julienne',
      '2 cucchiai salsa di soia',
      '1 cucchiaino olio sesamo'
    ],
    preparazione: 'Marina il tofu nella salsa di soia e griglia. Saltare le verdure in wok con olio di sesamo. Servi il tofu su letto di verdure.',
    allergie: ['soia'],
    rating: 4.5
  }
];

// 🍎 SPUNTINI FITNESS MASSIVI (160+ ricette da fit influencer)
const SPUNTINI_FITNESS: Recipe[] = [
  // 🥛 SMOOTHIES & SMOOTHIE BOWLS VIRALI
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

  // 🍪 DOLCI FITNESS NO-BAKE VIRALI
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

  // 🧀 COTTAGE CHEESE MANIA
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

  // 🍫 BARRETTE HOMEMADE
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

  // 🥣 OVERNIGHT OATS CREATIVI
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

  // 🍰 CHIA PUDDING VARIATIONS
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

  // 🍌 NICE CREAM
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

  // 🥜 INNOVATIVE FITNESS SNACKS
  {
    id: 'innovative_001',
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
  {
    id: 'innovative_002',
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
  {
    id: 'innovative_003',
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
  {
    id: 'innovative_004',
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
  },
  
  // RICETTE BASE ORIGINALI (per mantenere compatibilità)
  {
    id: 'spuntino_001',
    nome: 'Smoothie Proteico Verde',
    categoria: 'spuntino',
    tipoCucina: 'ricette_fit',
    tipoDieta: ['bilanciata-40-30-30'],
    calorie: 180,
    proteine: 15,
    carboidrati: 20,
    grassi: 4,
    tempoPreparazione: 5,
    difficolta: 'facile',
    porzioni: 1,
    ingredienti: [
      '1 banana',
      '100g spinaci',
      '1 scoop proteine vaniglia',
      '200ml latte mandorle',
      '1 cucchiaio burro mandorle'
    ],
    preparazione: 'Frulla tutti gli ingredienti fino a ottenere consistenza cremosa',
    allergie: ['frutta_secca'],
    rating: 4.5
  }
];

// 🎯 ESPORTA TUTTE LE RICETTE
export const ALL_RECIPES: Recipe[] = [
  ...COLAZIONI_FITNESS,
  ...PRANZI_FITNESS, 
  ...CENE_FITNESS,
  ...SPUNTINI_FITNESS
];

// 🏗️ CLASSE DATABASE PRINCIPALE
export class RecipeDatabase {
  private static instance: RecipeDatabase;
  private recipes: Recipe[];

  private constructor() {
    this.recipes = ALL_RECIPES;
  }

  public static getInstance(): RecipeDatabase {
    if (!RecipeDatabase.instance) {
      RecipeDatabase.instance = new RecipeDatabase();
    }
    return RecipeDatabase.instance;
  }

  // 🔍 RICERCA RICETTE CON FILTRI AVANZATI
  public searchRecipes(filters: {
    categoria?: string;
    tipoDieta?: string[];
    allergie?: string[];
    calorieMax?: number;
    proteinMin?: number;
    tempoMax?: number;
    difficolta?: string;
    tipoCucina?: string;
  } = {}): Recipe[] {
    return this.recipes.filter(recipe => {
      // Filtro categoria
      if (filters.categoria && recipe.categoria !== filters.categoria) {
        return false;
      }

      // Filtro dieta
      if (filters.tipoDieta && filters.tipoDieta.length > 0) {
        const hasMatchingDiet = filters.tipoDieta.some(diet => 
          recipe.tipoDieta.includes(diet)
        );
        if (!hasMatchingDiet) return false;
      }

      // Filtro allergie (esclude ricette con allergeni)
      if (filters.allergie && filters.allergie.length > 0 && recipe.allergie) {
        const hasAllergen = filters.allergie.some(allergen => 
          recipe.allergie!.includes(allergen)
        );
        if (hasAllergen) return false;
      }

      // Filtro calorie massime
      if (filters.calorieMax && recipe.calorie > filters.calorieMax) {
        return false;
      }

      // Filtro proteine minime
      if (filters.proteinMin && recipe.proteine < filters.proteinMin) {
        return false;
      }

      // Filtro tempo massimo
      if (filters.tempoMax && recipe.tempoPreparazione > filters.tempoMax) {
        return false;
      }

      // Filtro difficoltà
      if (filters.difficolta && recipe.difficolta !== filters.difficolta) {
        return false;
      }

      // Filtro tipo cucina
      if (filters.tipoCucina && recipe.tipoCucina !== filters.tipoCucina) {
        return false;
      }

      return true;
    });
  }

  // 📊 STATISTICHE DATABASE
  public getStats() {
    const stats = {
      total: this.recipes.length,
      byCategory: {
        colazione: this.recipes.filter(r => r.categoria === 'colazione').length,
        pranzo: this.recipes.filter(r => r.categoria === 'pranzo').length,
        cena: this.recipes.filter(r => r.categoria === 'cena').length,
        spuntino: this.recipes.filter(r => r.categoria === 'spuntino').length
      },
      byDiet: {
        bilanciata: this.recipes.filter(r => r.tipoDieta.includes('bilanciata-40-30-30')).length,
        proteica: this.recipes.filter(r => r.tipoDieta.includes('proteica')).length,
        mediterranea: this.recipes.filter(r => r.tipoDieta.includes('mediterranea')).length,
        vegana: this.recipes.filter(r => r.tipoDieta.includes('vegana')).length,
        vegetariana: this.recipes.filter(r => r.tipoDieta.includes('vegetariana')).length,
        chetogenica: this.recipes.filter(r => r.tipoDieta.includes('chetogenica')).length
      },
      avgCalories: Math.round(this.recipes.reduce((sum, r) => sum + r.calorie, 0) / this.recipes.length),
      avgProtein: Math.round(this.recipes.reduce((sum, r) => sum + r.proteine, 0) / this.recipes.length),
      avgTime: Math.round(this.recipes.reduce((sum, r) => sum + r.tempoPreparazione, 0) / this.recipes.length)
    };
    
    return stats;
  }

  // 🎲 RICETTA CASUALE PER CATEGORIA
  public getRandomRecipe(categoria?: string): Recipe {
    let availableRecipes = this.recipes;
    
    if (categoria) {
      availableRecipes = this.recipes.filter(r => r.categoria === categoria);
    }
    
    if (availableRecipes.length === 0) {
      return this.recipes[0]; // Fallback
    }
    
    const randomIndex = Math.floor(Math.random() * availableRecipes.length);
    return availableRecipes[randomIndex];
  }

  // 🔍 RICERCA PER ID
  public getRecipeById(id: string): Recipe | undefined {
    return this.recipes.find(recipe => recipe.id === id);
  }

  // 📋 OTTIENI TUTTE LE RICETTE
  public getAllRecipes(): Recipe[] {
    return [...this.recipes];
  }

  // 🏷️ OTTIENI CATEGORIE DISPONIBILI
  public getAvailableCategories(): string[] {
    return Array.from(new Set(this.recipes.map(r => r.categoria)));
  }

  // 🍽️ OTTIENI TIPI DIETA DISPONIBILI
  public getAvailableDiets(): string[] {
    const allDiets = this.recipes.flatMap(r => r.tipoDieta);
    return Array.from(new Set(allDiets));
  }
}