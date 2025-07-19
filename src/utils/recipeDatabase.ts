// 🏋️‍♂️ DATABASE RICETTE FITNESS - 40 RICETTE COMPLETE
// ✅ 10 COLAZIONI + 10 PRANZI + 10 SPUNTINI + 10 CENE
// 🎯 COMPATIBILI CON TUTTI I FILTRI DROPDOWN
// 🔄 SINGLETON PATTERN PER COMPATIBILITÀ

export interface Recipe {
  id: string;
  nome: string;
  categoria: 'colazione' | 'pranzo' | 'spuntino' | 'cena';
  tipo_dieta: 'low_carb' | 'paleo' | 'chetogenica' | 'bilanciata' | 'mediterranea' | 'vegetariana' | 'vegana';
  difficolta: 'facile' | 'media' | 'difficile';
  tempo: 5 | 10 | 15 | 30;
  ingredienti: string[];
  preparazione: string[];
  calorie: number;
  proteine: number;
  carboidrati: number;
  grassi: number;
  porzioni: number;
  rating: number;
  recensioni: number;
  foto: string;
  allergie: string[];
}

export class RecipeDatabase {
  private static recipes: Recipe[] = [];
  private static instance: RecipeDatabase;

  // 🔄 SINGLETON PATTERN per compatibilità
  static getInstance(): RecipeDatabase {
    if (!RecipeDatabase.instance) {
      RecipeDatabase.instance = new RecipeDatabase();
    }
    return RecipeDatabase.instance;
  }

  // 🔧 METODI ISTANZA per compatibilità
  getAllRecipes(): Recipe[] {
    return RecipeDatabase.getAllRecipes();
  }

  getRecipesByFilter(filter: {
    categoria?: string;
    tipo_dieta?: string;
    difficolta?: string;
    tempo?: number;
  }): Recipe[] {
    return RecipeDatabase.getRecipesByFilter(filter);
  }

  searchRecipes(query: string): Recipe[] {
    return RecipeDatabase.searchRecipes(query);
  }

  getTopRatedRecipes(limit: number = 10): Recipe[] {
    return RecipeDatabase.getTopRatedRecipes(limit);
  }

  // 🌅 COLAZIONI FITNESS (10 ricette)
  static getColazioni(): Recipe[] {
    return [
      {
        id: "col_01",
        nome: "Pancakes Proteici Banana e Avena",
        categoria: "colazione",
        tipo_dieta: "bilanciata",
        difficolta: "facile",
        tempo: 10,
        ingredienti: [
          "80g fiocchi d'avena",
          "1 banana matura media",
          "30g proteine whey vaniglia",
          "2 albumi d'uovo",
          "150ml latte scremato",
          "1 cucchiaino cannella",
          "1 cucchiaino olio cocco"
        ],
        preparazione: [
          "Frulla i fiocchi d'avena fino ad ottenere una farina grossolana",
          "In una ciotola schiaccia la banana con una forchetta fino a renderla cremosa",
          "Aggiungi le proteine in polvere, gli albumi e il latte, mescola bene",
          "Incorpora la farina d'avena e la cannella, amalgama fino a ottenere un composto liscio",
          "Scalda l'olio di cocco in una padella antiaderente a fuoco medio-basso",
          "Versa il composto formando piccoli pancakes di circa 8cm di diametro",
          "Cuoci 2-3 minuti per lato fino a doratura, servire caldi"
        ],
        calorie: 385,
        proteine: 28,
        carboidrati: 45,
        grassi: 8,
        porzioni: 1,
        rating: 4.7,
        recensioni: 156,
        foto: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400",
        allergie: ["glutine", "latte", "uova"]
      },
      {
        id: "col_02", 
        nome: "Overnight Oats Proteici ai Frutti di Bosco",
        categoria: "colazione",
        tipo_dieta: "vegetariana",
        difficolta: "facile",
        tempo: 5,
        ingredienti: [
          "60g fiocchi d'avena",
          "25g proteine whey ai frutti di bosco",
          "200ml latte di mandorla",
          "1 cucchiaio semi di chia",
          "100g mirtilli freschi",
          "50g lamponi",
          "1 cucchiaio miele",
          "10g mandorle a lamelle"
        ],
        preparazione: [
          "In un barattolo di vetro mescola i fiocchi d'avena con le proteine in polvere",
          "Aggiungi il latte di mandorla e i semi di chia, mescola energicamente",
          "Incorpora il miele e mescola fino a scioglimento completo",
          "Aggiungi metà dei frutti di bosco e mescola delicatamente",
          "Copri il barattolo e conserva in frigorifero per almeno 4 ore o tutta la notte",
          "Al mattino guarnisci con i frutti di bosco rimanenti e le mandorle",
          "Consuma freddo direttamente dal barattolo"
        ],
        calorie: 425,
        proteine: 25,
        carboidrati: 52,
        grassi: 12,
        porzioni: 1,
        rating: 4.8,
        recensioni: 203,
        foto: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400",
        allergie: ["frutta_secca"]
      },
      {
        id: "col_03",
        nome: "Scrambled Eggs Proteici con Spinaci",
        categoria: "colazione", 
        tipo_dieta: "low_carb",
        difficolta: "facile",
        tempo: 10,
        ingredienti: [
          "3 uova intere",
          "2 albumi",
          "100g spinaci freschi",
          "50g ricotta magra",
          "1 cucchiaio olio extravergine",
          "50g pomodorini ciliegino",
          "Sale e pepe q.b.",
          "Erba cipollina fresca"
        ],
        preparazione: [
          "Lava e asciuga gli spinaci, taglia i pomodorini a metà",
          "In una padella scalda metà olio e salta gli spinaci per 2 minuti",
          "Rimuovi gli spinaci e tienili da parte",
          "Sbatti le uova con gli albumi, sale e pepe in una ciotola",
          "Nella stessa padella versa le uova sbattute a fuoco basso",
          "Mescola delicatamente con una spatola fino a ottenere una consistenza cremosa",
          "Negli ultimi 30 secondi aggiungi spinaci, ricotta e pomodorini",
          "Guarnisci con erba cipollina e servi immediatamente"
        ],
        calorie: 320,
        proteine: 26,
        carboidrati: 8,
        grassi: 20,
        porzioni: 1,
        rating: 4.5,
        recensioni: 128,
        foto: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400",
        allergie: ["uova", "latte"]
      },
      {
        id: "col_04",
        nome: "Smoothie Bowl Verde Energetico",
        categoria: "colazione",
        tipo_dieta: "vegana",
        difficolta: "facile", 
        tempo: 5,
        ingredienti: [
          "1 banana congelata",
          "100g spinaci freschi",
          "25g proteine vegetali vaniglia",
          "200ml latte di cocco",
          "1 cucchiaio burro di mandorle",
          "1 kiwi maturo",
          "15g granola senza zucchero",
          "1 cucchiaio semi di zucca"
        ],
        preparazione: [
          "Nel frullatore aggiungi la banana congelata a pezzi",
          "Unisci spinaci lavati, proteine in polvere e latte di cocco",
          "Frulla ad alta velocità fino ad ottenere una consistenza cremosa e omogenea",
          "Versa il smoothie in una bowl capiente",
          "Pela e taglia il kiwi a rondelle sottili",
          "Disponi artisticamente kiwi, granola e semi di zucca sulla superficie",
          "Completa con una spirale di burro di mandorle e servi subito"
        ],
        calorie: 445,
        proteine: 22,
        carboidrati: 38,
        grassi: 24,
        porzioni: 1,
        rating: 4.6,
        recensioni: 189,
        foto: "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400",
        allergie: ["frutta_secca"]
      },
      {
        id: "col_05",
        nome: "Porridge Proteico Cannella e Mela",
        categoria: "colazione",
        tipo_dieta: "mediterranea",
        difficolta: "facile",
        tempo: 15,
        ingredienti: [
          "70g fiocchi d'avena",
          "25g proteine caseine vaniglia", 
          "300ml latte parzialmente scremato",
          "1 mela golden media",
          "1 cucchiaino cannella in polvere",
          "1 cucchiaio miele acacia",
          "15g noci sgusciate",
          "Pizzico di sale"
        ],
        preparazione: [
          "Pela e taglia la mela a cubetti piccoli e regolari",
          "In un pentolino scalda il latte a fuoco medio senza farlo bollire",
          "Aggiungi i fiocchi d'avena e mescola continuamente per 5 minuti",
          "Incorpora i cubetti di mela e la cannella, cuoci altri 3 minuti",
          "Rimuovi dal fuoco e lascia raffreddare 2 minuti", 
          "Aggiungi le proteine in polvere e mescola energicamente per evitare grumi",
          "Dolcifica con miele e guarnisci con noci tritate grossolanamente"
        ],
        calorie: 465,
        proteine: 30,
        carboidrati: 58,
        grassi: 12,
        porzioni: 1,
        rating: 4.4,
        recensioni: 142,
        foto: "https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=400",
        allergie: ["latte", "frutta_secca"]
      },
      {
        id: "col_06",
        nome: "Avocado Toast Proteico Integrale",
        categoria: "colazione",
        tipo_dieta: "bilanciata",
        difficolta: "facile",
        tempo: 10,
        ingredienti: [
          "2 fette pane integrale",
          "1 avocado maturo medio",
          "2 uova",
          "100g ricotta magra",
          "Succo di 1/2 limone",
          "Sale marino e pepe nero",
          "Paprika dolce",
          "Rucola fresca"
        ],
        preparazione: [
          "Tosta le fette di pane integrale fino a doratura uniforme",
          "Taglia l'avocado a metà, rimuovi il nocciolo e schiaccia la polpa con una forchetta",
          "Condisci l'avocado con succo di limone, sale e pepe",
          "Cuoci le uova in camicia in acqua bollente salata per 3-4 minuti",
          "Spalma la ricotta su una fetta di pane tostato",
          "Distribuisci l'avocado condito sulla ricotta",
          "Corona con l'uovo in camicia, rucola fresca e una spolverata di paprika"
        ],
        calorie: 485,
        proteine: 24,
        carboidrati: 35,
        grassi: 28,
        porzioni: 1,
        rating: 4.7,
        recensioni: 167,
        foto: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400",
        allergie: ["glutine", "uova", "latte"]
      },
      {
        id: "col_07",
        nome: "Greek Yogurt Bowl Proteico",
        categoria: "colazione",
        tipo_dieta: "low_carb",
        difficolta: "facile",
        tempo: 5,
        ingredienti: [
          "200g yogurt greco 0% grassi",
          "20g proteine whey neutro",
          "30g mandorle tostate",
          "15g semi di girasole",
          "100g fragole fresche",
          "1 cucchiaino estratto vaniglia",
          "Stevia liquida q.b.",
          "Menta fresca"
        ],
        preparazione: [
          "In una ciotola mescola lo yogurt greco con le proteine in polvere",
          "Aggiungi l'estratto di vaniglia e dolcifica con stevia a piacere",
          "Mescola energicamente fino ad ottenere una consistenza omogenea",
          "Lava e taglia le fragole a fettine sottili",
          "Trita grossolanamente le mandorle tostate",
          "Versa il composto proteico in una bowl",
          "Decora con fragole, mandorle tritate e semi di girasole",
          "Completa con foglioline di menta fresca"
        ],
        calorie: 395,
        proteine: 35,
        carboidrati: 18,
        grassi: 20,
        porzioni: 1,
        rating: 4.8,
        recensioni: 234,
        foto: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400",
        allergie: ["latte", "frutta_secca"]
      },
      {
        id: "col_08",
        nome: "Chia Pudding Cioccolato Proteico",
        categoria: "colazione",
        tipo_dieta: "chetogenica",
        difficolta: "facile",
        tempo: 10,
        ingredienti: [
          "40g semi di chia",
          "25g proteine cacao",
          "300ml latte di mandorla non zuccherato",
          "15g cacao amaro in polvere",
          "1 cucchiaio olio MCT",
          "Eritritolo q.b.",
          "50g lamponi freschi",
          "15g mandorle a lamelle"
        ],
        preparazione: [
          "In una ciotola mescola i semi di chia con il cacao amaro",
          "Aggiungi le proteine in polvere e mescola i ingredienti secchi",
          "Versa gradualmente il latte di mandorla mescolando continuamente",
          "Incorpora l'olio MCT e dolcifica con eritritolo a piacere",
          "Mescola energicamente per 2 minuti per evitare grumi",
          "Copri e riponi in frigorifero per almeno 6 ore o tutta la notte",
          "Al momento del consumo guarnisci con lamponi e mandorle a lamelle"
        ],
        calorie: 420,
        proteine: 26,
        carboidrati: 12,
        grassi: 28,
        porzioni: 1,
        rating: 4.5,
        recensioni: 156,
        foto: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400",
        allergie: ["frutta_secca"]
      },
      {
        id: "col_09",
        nome: "Frittata Proteica agli Spinaci",
        categoria: "colazione",
        tipo_dieta: "paleo",
        difficolta: "media",
        tempo: 15,
        ingredienti: [
          "4 uova intere",
          "150g spinaci freschi",
          "100g prosciutto crudo tagliato spesso",
          "50g parmigiano grattugiato",
          "2 cucchiai olio extravergine",
          "1 scalogno medio",
          "Sale marino e pepe",
          "Basilico fresco"
        ],
        preparazione: [
          "Lava e asciuga accuratamente gli spinaci, trita finemente lo scalogno",
          "Taglia il prosciutto crudo a listarelle e rosolalo in padella per 2 minuti",
          "Aggiungi lo scalogno e cuoci fino a doratura",
          "Unisci gli spinaci e cuoci finché non appassiscono completamente",
          "Sbatti le uova in una ciotola con sale, pepe e parmigiano",
          "Versa le uova nella padella con gli spinaci a fuoco medio-basso",
          "Cuoci 8-10 minuti fino a quando la base è dorata e la superficie quasi rappresa",
          "Termina la cottura sotto il grill per 2-3 minuti, guarnisci con basilico"
        ],
        calorie: 445,
        proteine: 32,
        carboidrati: 6,
        grassi: 32,
        porzioni: 1,
        rating: 4.6,
        recensioni: 198,
        foto: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=400",
        allergie: ["uova", "latte"]
      },
      {
        id: "col_10",
        nome: "Power Smoothie Banana e Burro di Arachidi",
        categoria: "colazione",
        tipo_dieta: "bilanciata",
        difficolta: "facile",
        tempo: 5,
        ingredienti: [
          "1 banana media matura",
          "30g proteine whey vaniglia",
          "250ml latte scremato",
          "2 cucchiai burro di arachidi naturale",
          "1 cucchiaio semi di lino macinati",
          "100g ghiaccio",
          "1 cucchiaino miele",
          "Cannella in polvere"
        ],
        preparazione: [
          "Pela e taglia la banana a rondelle",
          "Nel frullatore aggiungi banana, latte scremato e ghiaccio",
          "Unisci le proteine in polvere e il burro di arachidi",
          "Aggiungi i semi di lino macinati e il miele",
          "Frulla ad alta velocità per 60-90 secondi fino a consistenza cremosa",
          "Verifica la dolcezza e aggiungi miele se necessario",
          "Versa in un bicchiere alto e spolverizza con cannella",
          "Consuma immediatamente per mantenere la cremosità"
        ],
        calorie: 520,
        proteine: 35,
        carboidrati: 42,
        grassi: 22,
        porzioni: 1,
        rating: 4.9,
        recensioni: 289,
        foto: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400",
        allergie: ["latte", "arachidi"]
      }
    ];
  }

  // 🍽️ PRANZI FITNESS (10 ricette)
  static getPranzi(): Recipe[] {
    return [
      {
        id: "pra_01",
        nome: "Bowl di Pollo Teriyaki con Quinoa",
        categoria: "pranzo",
        tipo_dieta: "bilanciata",
        difficolta: "media",
        tempo: 30,
        ingredienti: [
          "150g petto di pollo",
          "80g quinoa tricolore",
          "100g edamame sgusciati",
          "1 carota media",
          "100g cavolo rosso",
          "2 cucchiai salsa teriyaki light",
          "1 cucchiaio olio sesamo",
          "1 cucchiaino zenzero grattugiato",
          "Semi di sesamo"
        ],
        preparazione: [
          "Cuoci la quinoa in acqua salata per 15 minuti, scola e raffredda",
          "Taglia il petto di pollo a strisce di 1cm di spessore",
          "Marina il pollo con metà salsa teriyaki e zenzero per 10 minuti",
          "Julienne la carota e affetta finemente il cavolo rosso",
          "Cuoci il pollo marinato in padella con olio di sesamo per 6-8 minuti",
          "Sbollenta gli edamame in acqua salata per 3 minuti",
          "Componi la bowl: quinoa come base, verdure crude da un lato",
          "Adagia il pollo caldo, irrora con salsa teriyaki rimanente e sesamo"
        ],
        calorie: 485,
        proteine: 38,
        carboidrati: 45,
        grassi: 16,
        porzioni: 1,
        rating: 4.7,
        recensioni: 156,
        foto: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
        allergie: ["soia", "sesamo"]
      },
      {
        id: "pra_02",
        nome: "Salmone Grigliato con Verdure Mediterranee",
        categoria: "pranzo",
        tipo_dieta: "mediterranea",
        difficolta: "media",
        tempo: 25,
        ingredienti: [
          "150g filetto di salmone",
          "1 zucchina media",
          "1 melanzana piccola",
          "100g pomodorini ciliegino",
          "80g riso integrale",
          "3 cucchiai olio extravergine",
          "Succo di 1 limone",
          "Origano e timo freschi",
          "Sale marino grosso"
        ],
        preparazione: [
          "Cuoci il riso integrale in abbondante acqua salata per 20 minuti",
          "Taglia zucchina e melanzana a rondelle di 1cm di spessore",
          "Dimezza i pomodorini e condisci tutte le verdure con olio, sale e origano",
          "Griglia le verdure su piastra calda per 4-5 minuti per lato",
          "Condisci il salmone con olio, limone, sale e timo",
          "Griglia il salmone 4 minuti per lato mantenendo l'interno rosato",
          "Scola il riso e condiscilo con olio e limone",
          "Componi il piatto con riso come base, verdure e salmone sopra"
        ],
        calorie: 520,
        proteine: 35,
        carboidrati: 42,
        grassi: 24,
        porzioni: 1,
        rating: 4.8,
        recensioni: 203,
        foto: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400",
        allergie: ["pesce"]
      },
      {
        id: "pra_03",
        nome: "Insalata di Tacchino e Avocado",
        categoria: "pranzo",
        tipo_dieta: "low_carb",
        difficolta: "facile",
        tempo: 15,
        ingredienti: [
          "120g petto di tacchino arrosto",
          "1 avocado maturo",
          "150g mix insalate baby",
          "100g pomodorini datterini",
          "50g cetrioli",
          "30g parmigiano a scaglie",
          "2 cucchiai olio extravergine",
          "1 cucchiaio aceto balsamico",
          "Sale e pepe nero"
        ],
        preparazione: [
          "Lava e asciuga accuratamente il mix di insalate",
          "Taglia il tacchino a listarelle di media grandezza",
          "Pela e taglia l'avocado a fette spesse",
          "Dimezza i pomodorini e taglia i cetrioli a rondelle",
          "Prepara la vinaigrette mescolando olio, aceto, sale e pepe",
          "In una bowl capiente disponi le insalate come base",
          "Aggiungi tacchino, avocado, pomodorini e cetrioli",
          "Completa con scaglie di parmigiano e condisci con vinaigrette"
        ],
        calorie: 425,
        proteine: 32,
        carboidrati: 12,
        grassi: 28,
        porzioni: 1,
        rating: 4.5,
        recensioni: 134,
        foto: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
        allergie: ["latte"]
      },
      {
        id: "pra_04",
        nome: "Curry di Lenticchie Rosse Proteico",
        categoria: "pranzo",
        tipo_dieta: "vegana",
        difficolta: "media",
        tempo: 30,
        ingredienti: [
          "120g lenticchie rosse secche",
          "25g proteine vegetali neutro",
          "200ml latte di cocco",
          "1 cipolla media",
          "2 spicchi aglio",
          "1 cucchiaio pasta di curry",
          "1 cucchiaino curcuma",
          "200g spinaci freschi",
          "Coriandolo fresco"
        ],
        preparazione: [
          "Sciacqua le lenticchie rosse sotto acqua corrente fredda",
          "Trita finemente cipolla e aglio",
          "In una pentola soffriggi cipolla e aglio in olio per 3 minuti",
          "Aggiungi pasta di curry e curcuma, mescola per 1 minuto",
          "Unisci lenticchie, latte di cocco e 300ml acqua",
          "Porta a ebollizione e cuoci a fuoco medio per 15 minuti",
          "Incorpora le proteine in polvere mescolando bene",
          "Aggiungi gli spinaci negli ultimi 3 minuti di cottura",
          "Guarnisci con coriandolo fresco tritato"
        ],
        calorie: 465,
        proteine: 28,
        carboidrati: 48,
        grassi: 16,
        porzioni: 1,
        rating: 4.6,
        recensioni: 178,
        foto: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400",
        allergie: []
      },
      {
        id: "pra_05",
        nome: "Tagliata di Manzo con Rucola",
        categoria: "pranzo",
        tipo_dieta: "paleo",
        difficolta: "media",
        tempo: 20,
        ingredienti: [
          "150g tagliata di manzo",
          "100g rucola selvatica",
          "100g pomodorini pachino",
          "50g grana padano a scaglie",
          "3 cucchiai olio extravergine",
          "1 cucchiaio aceto balsamico",
          "Sale grosso marino",
          "Pepe nero macinato fresco",
          "Rosmarino fresco"
        ],
        preparazione: [
          "Porta la carne a temperatura ambiente 30 minuti prima della cottura",
          "Scalda una piastra o padella antiaderente a fuoco alto",
          "Condisci la tagliata con olio, sale grosso, pepe e rosmarino",
          "Cuoci la carne 2-3 minuti per lato per mantenerla al sangue",
          "Lascia riposare la carne coperta con carta stagnola per 5 minuti",
          "Nel frattempo lava la rucola e dimezza i pomodorini",
          "Taglia la tagliata a fette oblique di 1cm di spessore",
          "Componi il piatto: rucola, carne a fette, pomodorini, grana e aceto"
        ],
        calorie: 440,
        proteine: 38,
        carboidrati: 8,
        grassi: 28,
        porzioni: 1,
        rating: 4.7,
        recensioni: 189,
        foto: "https://images.unsplash.com/photo-1558030006-450675393462?w=400",
        allergie: ["latte"]
      },
      {
        id: "pra_06",
        nome: "Wrap Proteico di Tonno e Avocado",
        categoria: "pranzo",
        tipo_dieta: "bilanciata",
        difficolta: "facile",
        tempo: 10,
        ingredienti: [
          "1 tortilla integrale grande",
          "150g tonno in scatola al naturale",
          "1/2 avocado maturo",
          "50g yogurt greco 0%",
          "1 carota media grattugiata",
          "Foglie di lattuga iceberg",
          "1 cucchiaio succo di limone",
          "Sale e pepe q.b.",
          "Paprika dolce"
        ],
        preparazione: [
          "Scola perfettamente il tonno e sminuzzalo con una forchetta",
          "Schiaccia l'avocado con il succo di limone, sale e pepe",
          "Mescola il tonno con lo yogurt greco fino a ottenere una crema",
          "Grattugia finemente la carota e condiscila con una goccia di limone",
          "Scalda leggermente la tortilla in padella per 30 secondi per lato",
          "Spalma la crema di avocado su metà tortilla",
          "Distribuisci tonno, carote grattugiate e lattuga",
          "Arrotola stretto la tortilla, taglia a metà e spolverizza con paprika"
        ],
        calorie: 395,
        proteine: 35,
        carboidrati: 28,
        grassi: 16,
        porzioni: 1,
        rating: 4.4,
        recensioni: 145,
        foto: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400",
        allergie: ["glutine", "pesce", "latte"]
      },
      {
        id: "pra_07",
        nome: "Risotto Proteico ai Funghi Porcini",
        categoria: "pranzo",
        tipo_dieta: "vegetariana",
        difficolta: "difficile",
        tempo: 30,
        ingredienti: [
          "80g riso arborio",
          "25g proteine caseine neutro",
          "200g funghi porcini freschi",
          "500ml brodo vegetale",
          "1 scalogno medio",
          "50ml vino bianco secco",
          "30g parmigiano grattugiato",
          "2 cucchiai olio extravergine",
          "Prezzemolo fresco tritato"
        ],
        preparazione: [
          "Pulisci i funghi porcini e tagliali a fette spesse",
          "Scalda il brodo vegetale e tienilo al caldo",
          "Trita finemente lo scalogno e rosola in olio per 2 minuti",
          "Aggiungi i funghi e cuoci a fuoco alto per 5 minuti",
          "Unisci il riso e tosta per 2 minuti mescolando continuamente",
          "Sfuma con vino bianco e lascia evaporare",
          "Aggiungi brodo caldo un mestolo alla volta, mescolando sempre",
          "A cottura ultimata (18 min) manteca con proteine e parmigiano",
          "Guarnisci con prezzemolo fresco e servi immediatamente"
        ],
        calorie: 485,
        proteine: 26,
        carboidrati: 52,
        grassi: 18,
        porzioni: 1,
        rating: 4.8,
        recensioni: 167,
        foto: "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=400",
        allergie: ["latte"]
      },
      {
        id: "pra_08",
        nome: "Caesar Salad Proteica con Pollo",
        categoria: "pranzo",
        tipo_dieta: "low_carb",
        difficolta: "media",
        tempo: 20,
        ingredienti: [
          "150g petto di pollo",
          "200g lattuga romana",
          "30g parmigiano reggiano",
          "2 cucchiai yogurt greco 0%",
          "1 cucchiaio senape di Digione",
          "1 spicchio aglio",
          "Succo di 1/2 limone",
          "2 cucchiai olio extravergine",
          "Acciughe sott'olio (facoltativo)"
        ],
        preparazione: [
          "Condisci il petto di pollo con olio, sale e pepe",
          "Cuoci il pollo su piastra per 6-7 minuti per lato",
          "Lascia riposare il pollo e taglialo a strisce sottili",
          "Lava e asciuga la lattuga, tagliala a listarelle larghe",
          "Prepara la salsa: mescola yogurt, senape, aglio tritato e limone",
          "Aggiungi olio gradualmente emulsionando con una frusta",
          "In una bowl capiente condisci la lattuga con la salsa caesar",
          "Aggiungi il pollo a strisce e scaglie di parmigiano",
          "Mescola delicatamente e completa con acciughe se gradite"
        ],
        calorie: 385,
        proteine: 42,
        carboidrati: 8,
        grassi: 20,
        porzioni: 1,
        rating: 4.6,
        recensioni: 198,
        foto: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400",
        allergie: ["latte", "pesce"]
      },
      {
        id: "pra_09",
        nome: "Bowl Vegano di Ceci e Tahina",
        categoria: "pranzo",
        tipo_dieta: "vegana",
        difficolta: "facile",
        tempo: 15,
        ingredienti: [
          "150g ceci lessati",
          "80g quinoa cotta",
          "100g carote baby",
          "100g cetrioli",
          "50g hummus di tahina",
          "2 cucchiai tahina pura",
          "1 cucchiaio succo di limone",
          "1 cucchiaino paprika",
          "Menta fresca",
          "Semi di zucca tostati"
        ],
        preparazione: [
          "Se usi ceci secchi, lasciali in ammollo una notte e cuocili 45 minuti",
          "Cuoci la quinoa in acqua salata per 12 minuti e lasciala raffreddare",
          "Taglia le carote baby a bastoncini e i cetrioli a tocchetti",
          "Prepara la salsa mescolando tahina, succo di limone e un po' d'acqua",
          "Aggiusta la consistenza della salsa fino a renderla cremosa",
          "In una bowl disponi quinoa come base",
          "Aggiungi ceci, verdure crude e hummus in settori separati",
          "Irrora con salsa di tahina, spolverizza paprika e semi di zucca",
          "Guarnisci con foglie di menta fresca"
        ],
        calorie: 465,
        proteine: 22,
        carboidrati: 54,
        grassi: 18,
        porzioni: 1,
        rating: 4.5,
        recensioni: 156,
        foto: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
        allergie: ["sesamo"]
      },
      {
        id: "pra_10",
        nome: "Orata al Sale con Verdure Grigliate",
        categoria: "pranzo",
        tipo_dieta: "mediterranea",
        difficolta: "difficile",
        tempo: 30,
        ingredienti: [
          "1 orata intera da 300g",
          "500g sale grosso marino",
          "2 albumi d'uovo",
          "1 zucchina",
          "1 peperone rosso",
          "1 melanzana",
          "Rosmarino e timo freschi",
          "4 cucchiai olio extravergine",
          "Limone per servire"
        ],
        preparazione: [
          "Preriscalda il forno a 200°C",
          "Pulisci l'orata mantenendo le squame, riempi la cavità con erbe aromatiche",
          "Mescola sale grosso con albumi fino a ottenere un impasto umido",
          "Stendi metà sale in una teglia, adagia l'orata e copri con sale rimanente",
          "Inforna per 25 minuti senza aprire il forno",
          "Nel frattempo taglia tutte le verdure a fette spesse",
          "Condisci le verdure con olio, sale e pepe",
          "Griglia le verdure su piastra calda per 4-5 minuti per lato",
          "Rompi la crosta di sale, elimina pelle e lische, servi con verdure e limone"
        ],
        calorie: 425,
        proteine: 35,
        carboidrati: 15,
        grassi: 26,
        porzioni: 1,
        rating: 4.9,
        recensioni: 234,
        foto: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400",
        allergie: ["pesce", "uova"]
      }
    ];
  }

  // 🥜 SPUNTINI FITNESS (10 ricette)
  static getSpuntini(): Recipe[] {
    return [
      {
        id: "spu_01",
        nome: "Energy Balls Proteiche al Cioccolato",
        categoria: "spuntino",
        tipo_dieta: "vegetariana",
        difficolta: "facile",
        tempo: 10,
        ingredienti: [
          "100g datteri denocciolati",
          "30g proteine whey cioccolato",
          "40g mandorle tostate",
          "20g cacao amaro",
          "2 cucchiai burro di mandorle",
          "1 cucchiaio olio di cocco",
          "Cocco rapé per decorare",
          "Pizzico di sale"
        ],
        preparazione: [
          "Metti i datteri in ammollo in acqua tiepida per 10 minuti",
          "Scola i datteri e frullali fino a ottenere una pasta omogenea",
          "Aggiungi le proteine in polvere, cacao e sale",
          "Incorpora mandorle tritate grossolanamente e burro di mandorle",
          "Unisci l'olio di cocco sciolto e mescola bene",
          "Con le mani umide forma delle palline di 3cm di diametro",
          "Rotola ogni pallina nel cocco rapé",
          "Riponi in frigorifero per almeno 30 minuti prima di consumare"
        ],
        calorie: 285,
        proteine: 18,
        carboidrati: 28,
        grassi: 12,
        porzioni: 1,
        rating: 4.7,
        recensioni: 189,
        foto: "https://images.unsplash.com/photo-1558030006-450675393462?w=400",
        allergie: ["frutta_secca", "latte"]
      },
      {
        id: "spu_02",
        nome: "Hummus Proteico con Verdure Crude",
        categoria: "spuntino",
        tipo_dieta: "vegana",
        difficolta: "facile",
        tempo: 5,
        ingredienti: [
          "150g ceci lessati",
          "20g proteine vegetali neutro",
          "2 cucchiai tahina",
          "Succo di 1 limone",
          "1 spicchio aglio",
          "3 cucchiai acqua di cottura ceci",
          "Bastoncini di carote",
          "Bastoncini di cetriolo",
          "Paprika dolce"
        ],
        preparazione: [
          "Nel frullatore inserisci ceci scolati, aglio e tahina",
          "Aggiungi succo di limone e proteine in polvere",
          "Frulla aggiungendo gradualmente l'acqua di cottura",
          "Continua fino a ottenere una consistenza cremosa e omogenea",
          "Aggiusta di sale e acidità con limone",
          "Trasferisci in una ciotola e livella la superficie",
          "Spolvera con paprika e un filo d'olio",
          "Servi con bastoncini di verdure fresche per intingere"
        ],
        calorie: 245,
        proteine: 16,
        carboidrati: 24,
        grassi: 8,
        porzioni: 1,
        rating: 4.4,
        recensioni: 134,
        foto: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400",
        allergie: ["sesamo"]
      },
      {
        id: "spu_03",
        nome: "Smoothie Proteico Verde Detox",
        categoria: "spuntino",
        tipo_dieta: "low_carb",
        difficolta: "facile",
        tempo: 5,
        ingredienti: [
          "25g proteine whey vaniglia",
          "100g spinaci baby",
          "1/2 avocado piccolo",
          "200ml acqua di cocco",
          "Succo di 1/2 limone",
          "1 cucchiaino zenzero fresco",
          "Ghiaccio q.b.",
          "Stevia liquida q.b."
        ],
        preparazione: [
          "Lava accuratamente gli spinaci e asciugali",
          "Pela e taglia l'avocado a pezzi",
          "Pela e grattugia finemente lo zenzero fresco",
          "Nel frullatore aggiungi tutti gli ingredienti eccetto il ghiaccio",
          "Frulla ad alta velocità per 60 secondi",
          "Aggiungi ghiaccio e frulla altri 30 secondi",
          "Assaggia e dolcifica con stevia se necessario",
          "Versa in un bicchiere alto e consuma immediatamente"
        ],
        calorie: 185,
        proteine: 22,
        carboidrati: 8,
        grassi: 8,
        porzioni: 1,
        rating: 4.3,
        recensioni: 98,
        foto: "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400",
        allergie: ["latte"]
      },
      {
        id: "spu_04",
        nome: "Yogurt Greco con Noci e Miele",
        categoria: "spuntino",
        tipo_dieta: "mediterranea",
        difficolta: "facile",
        tempo: 5,
        ingredienti: [
          "150g yogurt greco 0% grassi",
          "30g noci sgusciate",
          "1 cucchiaio miele acacia",
          "1 cucchiaino cannella",
          "15g semi di girasole",
          "Buccia grattugiata di 1/2 arancia",
          "Menta fresca per guarnire"
        ],
        preparazione: [
          "Versa lo yogurt greco in una ciotola capiente",
          "Trita grossolanamente le noci mantenendo pezzi di varie dimensioni",
          "Grattugia finemente la buccia di arancia lavata",
          "Mescola delicatamente yogurt con metà delle noci tritate",
          "Trasferisci in una bowl da servizio",
          "Irrora uniformemente con il miele",
          "Completa con noci rimanenti, semi di girasole e buccia d'arancia",
          "Spolverizza con cannella e guarnisci con menta fresca"
        ],
        calorie: 265,
        proteine: 20,
        carboidrati: 22,
        grassi: 12,
        porzioni: 1,
        rating: 4.6,
        recensioni: 167,
        foto: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400",
        allergie: ["latte", "frutta_secca"]
      },
      {
        id: "spu_05",
        nome: "Barretta Energetica Fatta in Casa",
        categoria: "spuntino",
        tipo_dieta: "paleo",
        difficolta: "media",
        tempo: 15,
        ingredienti: [
          "50g mandorle",
          "30g nocciole",
          "80g datteri medjoul",
          "20g semi di girasole",
          "15g semi di zucca",
          "2 cucchiai burro di mandorle",
          "1 cucchiaino estratto vaniglia",
          "Pizzico di sale marino"
        ],
        preparazione: [
          "Preriscalda il forno a 160°C e tosta mandorle e nocciole per 8 minuti",
          "Lascia raffreddare la frutta secca e tritala grossolanamente",
          "Denoccola i datteri e frullali fino a ottenere una pasta densa",
          "In una ciotola mescola frutta secca, semi e pasta di datteri",
          "Aggiungi burro di mandorle, vaniglia e sale",
          "Impasta con le mani fino a formare un composto compatto",
          "Stendi il composto su carta forno formando un rettangolo",
          "Refrigera per 2 ore, poi taglia a barrette di 6x3 cm"
        ],
        calorie: 295,
        proteine: 12,
        carboidrati: 28,
        grassi: 16,
        porzioni: 1,
        rating: 4.5,
        recensioni: 145,
        foto: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400",
        allergie: ["frutta_secca"]
      },
      {
        id: "spu_06",
        nome: "Shake Post-Workout Banana e Avena",
        categoria: "spuntino",
        tipo_dieta: "bilanciata",
        difficolta: "facile",
        tempo: 5,
        ingredienti: [
          "30g proteine whey vaniglia",
          "1 banana media",
          "30g fiocchi d'avena",
          "250ml latte di mandorla",
          "1 cucchiaio burro di arachidi",
          "1 cucchiaino creatina (opzionale)",
          "Cannella in polvere",
          "Ghiaccio tritato"
        ],
        preparazione: [
          "Pela e taglia la banana a rondelle",
          "Nel frullatore aggiungi latte di mandorla e fiocchi d'avena",
          "Lascia ammorbidire l'avena per 2 minuti",
          "Aggiungi banana, proteine in polvere e burro di arachidi",
          "Incorpora creatina se la utilizzi nel tuo protocollo",
          "Frulla ad alta velocità per 90 secondi",
          "Aggiungi ghiaccio tritato e frulla altri 30 secondi",
          "Versa in uno shaker e consuma entro 30 minuti dal workout"
        ],
        calorie: 385,
        proteine: 28,
        carboidrati: 35,
        grassi: 14,
        porzioni: 1,
        rating: 4.8,
        recensioni: 223,
        foto: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400",
        allergie: ["arachidi", "frutta_secca", "latte"]
      },
      {
        id: "spu_07",
        nome: "Toast Avocado e Uovo Sodo",
        categoria: "spuntino",
        tipo_dieta: "vegetariana",
        difficolta: "facile",
        tempo: 10,
        ingredienti: [
          "1 fetta pane integrale",
          "1/2 avocado maturo",
          "1 uovo sodo",
          "Succo di 1/2 limone",
          "Sale marino e pepe nero",
          "Paprika affumicata",
          "Semi di sesamo",
          "Erba cipollina fresca"
        ],
        preparazione: [
          "Cuoci l'uovo in acqua bollente per 8 minuti, raffredda in acqua ghiacciata",
          "Tosta la fetta di pane integrale fino a doratura uniforme",
          "Schiaccia l'avocado con succo di limone, sale e pepe",
          "Sguscia l'uovo sodo e taglialo a rondelle sottili",
          "Spalma generosamente l'avocado condito sul pane tostato",
          "Disponi le rondelle di uovo sopra l'avocado",
          "Spolverizza con paprika affumicata e semi di sesamo",
          "Completa con erba cipollina tritata finemente"
        ],
        calorie: 255,
        proteine: 12,
        carboidrati: 18,
        grassi: 16,
        porzioni: 1,
        rating: 4.4,
        recensioni: 156,
        foto: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400",
        allergie: ["glutine", "uova", "sesamo"]
      },
      {
        id: "spu_08",
        nome: "Mix di Frutta Secca e Semi",
        categoria: "spuntino",
        tipo_dieta: "chetogenica",
        difficolta: "facile",
        tempo: 5,
        ingredienti: [
          "20g mandorle crude",
          "15g noci brasiliane",
          "15g nocciole tostate",
          "10g semi di zucca",
          "10g semi di girasole",
          "5g semi di lino",
          "Pizzico di sale marino",
          "1/2 cucchiaino paprika dolce"
        ],
        preparazione: [
          "Se necessario tosta leggermente mandorle e nocciole in padella",
          "Lascia raffreddare completamente tutta la frutta secca",
          "In una ciotola mescola tutti i tipi di frutta secca",
          "Aggiungi i semi di zucca, girasole e lino",
          "Condisci con un pizzico di sale marino",
          "Spolvera con paprika dolce e mescola bene",
          "Conserva in contenitore ermetico per massimo 5 giorni",
          "Porzione ideale: un piccolo pugno (circa 75g)"
        ],
        calorie: 425,
        proteine: 16,
        carboidrati: 8,
        grassi: 36,
        porzioni: 1,
        rating: 4.2,
        recensioni: 89,
        foto: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400",
        allergie: ["frutta_secca"]
      },
      {
        id: "spu_09",
        nome: "Ricotta con Mirtilli e Cannella",
        categoria: "spuntino",
        tipo_dieta: "vegetariana",
        difficolta: "facile",
        tempo: 5,
        ingredienti: [
          "120g ricotta fresca magra",
          "100g mirtilli freschi",
          "1 cucchiaino miele millefiori",
          "1/2 cucchiaino cannella",
          "15g mandorle a lamelle",
          "Buccia grattugiata di 1/2 limone",
          "Menta fresca per decorare"
        ],
        preparazione: [
          "Verifica che la ricotta sia a temperatura ambiente",
          "Lava delicatamente i mirtilli e asciugali su carta assorbente",
          "In una ciotola mescola la ricotta con il miele",
          "Aggiungi metà della cannella e la buccia di limone grattugiata",
          "Mescola delicatamente per amalgamare gli ingredienti",
          "Trasferisci il composto in una bowl da servizio",
          "Distribuisci i mirtilli e le mandorle a lamelle sulla superficie",
          "Completa con cannella rimanente e foglioline di menta"
        ],
        calorie: 225,
        proteine: 16,
        carboidrati: 20,
        grassi: 8,
        porzioni: 1,
        rating: 4.6,
        recensioni: 134,
        foto: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400",
        allergie: ["latte", "frutta_secca"]
      },
      {
        id: "spu_10",
        nome: "Chips di Verdure al Forno",
        categoria: "spuntino",
        tipo_dieta: "vegana",
        difficolta: "media",
        tempo: 30,
        ingredienti: [
          "1 barbabietola media",
          "2 carote grandi",
          "1 zucchina",
          "3 cucchiai olio extravergine",
          "1 cucchiaino sale marino",
          "1/2 cucchiaino paprika",
          "1/2 cucchiaino curcuma",
          "Rosmarino secco tritato"
        ],
        preparazione: [
          "Preriscalda il forno a 180°C con ventilazione",
          "Lava accuratamente tutte le verdure mantenendo la buccia",
          "Con una mandolina taglia le verdure a fette sottilissime (2mm)",
          "Immergile in acqua fredda per 10 minuti, poi asciuga perfettamente",
          "In una ciotola condisci con olio, sale e spezie",
          "Disponi le fette su teglie rivestite di carta forno senza sovrapporle",
          "Cuoci per 25-30 minuti girando a metà cottura",
          "Sforna quando sono dorate e croccanti, conserva in contenitore ermetico"
        ],
        calorie: 185,
        proteine: 4,
        carboidrati: 24,
        grassi: 9,
        porzioni: 1,
        rating: 4.3,
        recensioni: 112,
        foto: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400",
        allergie: []
      }
    ];
  }

  // 🌙 CENE FITNESS (10 ricette)
  static getCene(): Recipe[] {
    return [
      {
        id: "cen_01",
        nome: "Filetto di Branzino con Verdure al Vapore",
        categoria: "cena",
        tipo_dieta: "mediterranea",
        difficolta: "media",
        tempo: 25,
        ingredienti: [
          "150g filetto di branzino",
          "200g broccoli",
          "150g zucchine",
          "100g carote baby",
          "3 cucchiai olio extravergine",
          "Succo di 1 limone",
          "2 spicchi aglio",
          "Timo fresco",
          "Sale marino e pepe"
        ],
        preparazione: [
          "Pulisci il filetto di branzino eliminando eventuali lische",
          "Taglia le verdure a pezzi uniformi per cottura omogenea",
          "Cuoci le verdure al vapore per 12-15 minuti fino alla giusta consistenza",
          "Nel frattempo scalda una padella antiaderente con poco olio",
          "Condisci il pesce con sale, pepe e timo fresco",
          "Cuoci il branzino 4 minuti per lato mantenendo l'interno umido",
          "Condisci le verdure con olio, aglio tritato e limone",
          "Componi il piatto con le verdure come base e il pesce sopra"
        ],
        calorie: 325,
        proteine: 28,
        carboidrati: 18,
        grassi: 16,
        porzioni: 1,
        rating: 4.7,
        recensioni: 178,
        foto: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400",
        allergie: ["pesce"]
      },
      {
        id: "cen_02",
        nome: "Tofu Grigliato con Verdure Asiatiche",
        categoria: "cena",
        tipo_dieta: "vegana",
        difficolta: "media",
        tempo: 20,
        ingredienti: [
          "150g tofu compatto",
          "100g pak choi",
          "100g germogli di soia",
          "1 peperone rosso",
          "2 cucchiai salsa di soia light",
          "1 cucchiaio olio sesamo",
          "1 cucchiaino zenzero grattugiato",
          "1 spicchio aglio",
          "Semi di sesamo tostati"
        ],
        preparazione: [
          "Pressa il tofu tra carta assorbente per eliminare l'acqua in eccesso",
          "Taglia il tofu a fette spesse 1cm e marinalo con salsa di soia",
          "Prepara le verdure: taglia pak choi, peperone a listarelle",
          "Griglia il tofu marinato su piastra calda per 3 minuti per lato",
          "In un wok scalda l'olio di sesamo a fuoco vivace",
          "Salta aglio e zenzero per 30 secondi",
          "Aggiungi peperone e cuoci 2 minuti, poi pak choi per altri 2 minuti",
          "Unisci germogli di soia negli ultimi 30 secondi",
          "Servi il tofu con le verdure saltate e semi di sesamo"
        ],
        calorie: 285,
        proteine: 22,
        carboidrati: 15,
        grassi: 16,
        porzioni: 1,
        rating: 4.4,
        recensioni: 134,
        foto: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
        allergie: ["soia", "sesamo"]
      },
      {
        id: "cen_03",
        nome: "Petto di Pollo alle Erbe con Spinaci",
        categoria: "cena",
        tipo_dieta: "low_carb",
        difficolta: "facile",
        tempo: 20,
        ingredienti: [
          "150g petto di pollo",
          "200g spinaci freschi",
          "50g ricotta light",
          "2 cucchiai olio extravergine",
          "1 cucchiaino origano secco",
          "1 cucchiaino rosmarino tritato",
          "2 spicchi aglio",
          "Pomodorini ciliegino",
          "Sale e pepe nero"
        ],
        preparazione: [
          "Batti leggermente il petto di pollo per uniformare lo spessore",
          "Condisci con sale, pepe, origano e rosmarino",
          "Scalda una padella con olio e cuoci il pollo 6-7 minuti per lato",
          "Rimuovi il pollo e tienilo al caldo coperto con stagnola",
          "Nella stessa padella aggiungi aglio tritato e pomodorini",
          "Cuoci 2 minuti poi aggiungi gli spinaci",
          "Quando gli spinaci appassiscono, incorpora la ricotta",
          "Taglia il pollo a fette oblique e servi con gli spinaci cremosi"
        ],
        calorie: 315,
        proteine: 35,
        carboidrati: 8,
        grassi: 16,
        porzioni: 1,
        rating: 4.6,
        recensioni: 189,
        foto: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
        allergie: ["latte"]
      },
      {
        id: "cen_04",
        nome: "Salmone al Cartoccio con Verdure",
        categoria: "cena",
        tipo_dieta: "paleo",
        difficolta: "media",
        tempo: 25,
        ingredienti: [
          "150g filetto di salmone",
          "1 zucchina media",
          "100g asparagi",
          "100g pomodorini",
          "2 cucchiai olio extravergine",
          "Succo di 1/2 limone",
          "Aneto fresco",
          "Sale marino e pepe",
          "Carta da forno"
        ],
        preparazione: [
          "Preriscalda il forno a 200°C",
          "Taglia zucchina a rondelle e asparagi a pezzi di 4cm",
          "Dimezza i pomodorini e condisci tutte le verdure con olio e sale",
          "Stendi un foglio di carta forno e disponi le verdure al centro",
          "Adagia il salmone sulle verdure e condisci con limone, sale e pepe",
          "Aggiungi aneto fresco e chiudi il cartoccio sigillando bene i bordi",
          "Cuoci in forno per 18-20 minuti",
          "Apri il cartoccio al tavolo per conservare aromi e umidità"
        ],
        calorie: 365,
        proteine: 32,
        carboidrati: 12,
        grassi: 22,
        porzioni: 1,
        rating: 4.8,
        recensioni: 203,
        foto: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400",
        allergie: ["pesce"]
      },
      {
        id: "cen_05",
        nome: "Zuppa di Lenticchie e Verdure",
        categoria: "cena",
        tipo_dieta: "vegetariana",
        difficolta: "facile",
        tempo: 30,
        ingredienti: [
          "100g lenticchie rosse",
          "1 carota media",
          "1 costa di sedano",
          "1 cipolla piccola",
          "500ml brodo vegetale",
          "100g spinaci freschi",
          "2 cucchiai olio extravergine",
          "1 cucchiaino curcuma",
          "Sale e pepe q.b."
        ],
        preparazione: [
          "Trita finemente cipolla, carota e sedano",
          "Sciacqua le lenticchie rosse sotto acqua corrente",
          "In una pentola soffriggi il trito di verdure con olio per 5 minuti",
          "Aggiungi le lenticchie e la curcuma, mescola per 1 minuto",
          "Versa il brodo caldo e porta a ebollizione",
          "Cuoci a fuoco medio per 15 minuti fino a quando le lenticchie si sfaldano",
          "Aggiungi gli spinaci negli ultimi 3 minuti di cottura",
          "Aggiusta di sale e pepe, servi ben caldo"
        ],
        calorie: 285,
        proteine: 18,
        carboidrati: 38,
        grassi: 8,
        porzioni: 1,
        rating: 4.3,
        recensioni: 156,
        foto: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400",
        allergie: []
      },
      {
        id: "cen_06",
        nome: "Omelette Proteica con Funghi",
        categoria: "cena",
        tipo_dieta: "chetogenica",
        difficolta: "facile",
        tempo: 15,
        ingredienti: [
          "3 uova intere",
          "2 albumi",
          "150g funghi misti",
          "50g formaggio spalmabile light",
          "2 cucchiai olio extravergine",
          "1 scalogno piccolo",
          "Prezzemolo fresco",
          "Sale e pepe nero",
          "Erba cipollina"
        ],
        preparazione: [
          "Pulisci e affetta i funghi, trita finemente lo scalogno",
          "In una padella salta funghi e scalogno con olio per 5 minuti",
          "Sbatti le uova con gli albumi, sale e pepe in una ciotola",
          "Versa il composto di uova nella padella con i funghi",
          "Cuoci a fuoco medio mescolando delicatamente i bordi",
          "Quando la base è rappresa ma la superficie ancora cremosa",
          "Aggiungi il formaggio spalmabile su metà omelette",
          "Piega a metà l'omelette e guarnisci con erbe fresche"
        ],
        calorie: 385,
        proteine: 28,
        carboidrati: 6,
        grassi: 28,
        porzioni: 1,
        rating: 4.5,
        recensioni: 167,
        foto: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400",
        allergie: ["uova", "latte"]
      },
      {
        id: "cen_07",
        nome: "Merluzzo in Crosta di Erbe",
        categoria: "cena",
        tipo_dieta: "mediterranea",
        difficolta: "media",
        tempo: 20,
        ingredienti: [
          "150g filetto di merluzzo",
          "30g pangrattato integrale",
          "2 cucchiai olio extravergine",
          "1 spicchio aglio",
          "Prezzemolo, basilico, timo",
          "Succo di 1/2 limone",
          "200g fagiolini",
          "Pomodorini ciliegino",
          "Sale marino"
        ],
        preparazione: [
          "Preriscalda il forno a 190°C",
          "Trita finemente aglio ed erbe aromatiche",
          "Mescola pangrattato con erbe, aglio e metà dell'olio",
          "Condisci il merluzzo con sale, pepe e succo di limone",
          "Pressa la crosta di erbe sul filetto di pesce",
          "Cuoci in forno per 12-15 minuti fino a doratura",
          "Sbollenta i fagiolini per 5 minuti, saltali con pomodorini",
          "Servi il pesce con i fagiolini come contorno"
        ],
        calorie: 295,
        proteine: 32,
        carboidrati: 18,
        grassi: 12,
        porzioni: 1,
        rating: 4.6,
        recensioni: 143,
        foto: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400",
        allergie: ["pesce", "glutine"]
      },
      {
        id: "cen_08",
        nome: "Insalata Proteica di Quinoa e Ceci",
        categoria: "cena",
        tipo_dieta: "vegana",
        difficolta: "facile",
        tempo: 15,
        ingredienti: [
          "80g quinoa",
          "150g ceci lessati",
          "100g cetrioli",
          "100g pomodorini",
          "50g olive taggiasche",
          "3 cucchiai olio extravergine",
          "2 cucchiai aceto di mele",
          "Menta e basilico freschi",
          "Sale e pepe"
        ],
        preparazione: [
          "Cuoci la quinoa in acqua salata per 12 minuti, scola e raffredda",
          "Taglia cetrioli a dadini e dimezza i pomodorini",
          "Sciacqua i ceci e scolali perfettamente",
          "Prepara la vinaigrette con olio, aceto, sale e pepe",
          "In una bowl capiente mescola quinoa fredda con i ceci",
          "Aggiungi cetrioli, pomodorini e olive",
          "Condisci con la vinaigrette e mescola delicatamente",
          "Guarnisci con erbe fresche tritate al momento"
        ],
        calorie: 425,
        proteine: 16,
        carboidrati: 48,
        grassi: 18,
        porzioni: 1,
        rating: 4.4,
        recensioni: 189,
        foto: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
        allergie: []
      },
      {
        id: "cen_09",
        nome: "Bistecca di Tonno con Ratatouille",
        categoria: "cena",
        tipo_dieta: "paleo",
        difficolta: "media",
        tempo: 25,
        ingredienti: [
          "150g bistecca di tonno",
          "1 melanzana piccola",
          "1 zucchina",
          "1 peperone rosso",
          "200g pomodorini",
          "1 cipolla",
          "3 cucchiai olio extravergine",
          "Timo e origano freschi",
          "Sale grosso marino"
        ],
        preparazione: [
          "Taglia tutte le verdure a cubetti di dimensioni uniformi",
          "In una padella larga soffriggi la cipolla con olio per 3 minuti",
          "Aggiungi melanzana e peperone, cuoci 5 minuti",
          "Unisci zucchina e pomodorini, condisci con erbe e sale",
          "Cuoci la ratatouille a fuoco medio per 15 minuti mescolando",
          "Nel frattempo scalda una piastra a fuoco alto",
          "Condisci il tonno con olio, sale grosso e pepe",
          "Griglia il tonno 2 minuti per lato mantenendolo rosa al centro",
          "Servi la bistecca di tonno sulla ratatouille calda"
        ],
        calorie: 385,
        proteine: 35,
        carboidrati: 20,
        grassi: 18,
        porzioni: 1,
        rating: 4.7,
        recensioni: 198,
        foto: "https://images.unsplash.com/photo-1558030006-450675393462?w=400",
        allergie: ["pesce"]
      },
      {
        id: "cen_10",
        nome: "Zucchine Ripiene Proteiche",
        categoria: "cena",
        tipo_dieta: "bilanciata",
        difficolta: "media",
        tempo: 30,
        ingredienti: [
          "2 zucchine grandi",
          "100g tacchino macinato",
          "30g quinoa",
          "50g ricotta magra",
          "1 uovo",
          "30g parmigiano grattugiato",
          "1 spicchio aglio",
          "Basilico fresco",
          "Olio extravergine"
        ],
        preparazione: [
          "Preriscalda il forno a 180°C",
          "Taglia le zucchine a metà nel senso della lunghezza",
          "Svuota le zucchine creando delle barchette, trita la polpa",
          "Cuoci la quinoa in acqua salata per 10 minuti",
          "Soffriggi aglio e polpa di zucchina per 3 minuti",
          "Aggiungi tacchino macinato e cuoci fino a doratura",
          "Mescola con quinoa, ricotta, uovo e parmigiano",
          "Riempi le barchette di zucchina con il composto",
          "Cuoci in forno per 20 minuti fino a doratura superficiale"
        ],
        calorie: 345,
        proteine: 28,
        carboidrati: 22,
        grassi: 16,
        porzioni: 1,
        rating: 4.5,
        recensioni: 156,
        foto: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
        allergie: ["uova", "latte"]
      }
    ];
  }

  // 🏋️‍♂️ FUNZIONE PRINCIPALE - GENERA TUTTE LE RICETTE
  static getAllRecipes(): Recipe[] {
    const allRecipes = [
      ...this.getColazioni(),
      ...this.getPranzi(),
      ...this.getSpuntini(),
      ...this.getCene()
    ];

    console.log(`🍳 [FITNESS RECIPES] Database caricato con successo: ${allRecipes.length} ricette`);
    console.log(`📊 [FITNESS RECIPES] Distribuzione:`, {
      colazioni: this.getColazioni().length,
      pranzi: this.getPranzi().length,
      spuntini: this.getSpuntini().length,
      cene: this.getCene().length
    });

    return allRecipes;
  }

  // 🎛️ FILTRI COMPATIBILI
  static getRecipesByFilter(filter: {
    categoria?: string;
    tipo_dieta?: string;
    difficolta?: string;
    tempo?: number;
  }): Recipe[] {
    let filteredRecipes = this.getAllRecipes();

    if (filter.categoria) {
      filteredRecipes = filteredRecipes.filter(recipe => 
        recipe.categoria === filter.categoria
      );
    }

    if (filter.tipo_dieta) {
      filteredRecipes = filteredRecipes.filter(recipe => 
        recipe.tipo_dieta === filter.tipo_dieta
      );
    }

    if (filter.difficolta) {
      filteredRecipes = filteredRecipes.filter(recipe => 
        recipe.difficolta === filter.difficolta
      );
    }

    if (filter.tempo) {
      filteredRecipes = filteredRecipes.filter(recipe => 
        recipe.tempo <= filter.tempo
      );
    }

    return filteredRecipes;
  }

  // 🔍 RICERCA TESTO
  static searchRecipes(query: string): Recipe[] {
    const allRecipes = this.getAllRecipes();
    const searchTerm = query.toLowerCase();

    return allRecipes.filter(recipe =>
      recipe.nome.toLowerCase().includes(searchTerm) ||
      recipe.ingredienti.some(ingredient => 
        ingredient.toLowerCase().includes(searchTerm)
      )
    );
  }

  // ⭐ RICETTE TOP RATED
  static getTopRatedRecipes(limit: number = 10): Recipe[] {
    return this.getAllRecipes()
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }
}