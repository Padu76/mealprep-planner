// 🍳 DATABASE RICETTE MASSICCIO - 360+ RICETTE GARANTITE PER OGNI FILTRO

// Interfaccia Recipe compatibile
export interface Recipe {
  id: string;
  nome: string;
  categoria: 'colazione' | 'pranzo' | 'cena' | 'spuntino';
  tipoCucina: 'italiana' | 'mediterranea' | 'asiatica' | 'americana' | 'messicana' | 'internazionale' | 'ricette_fit';
  difficolta: 'facile' | 'medio' | 'difficile';
  tempoPreparazione: number;
  porzioni: number;
  calorie: number;
  proteine: number;
  carboidrati: number;
  grassi: number;
  ingredienti: string[];
  preparazione: string;
  tipoDieta: ('vegetariana' | 'vegana' | 'senza_glutine' | 'keto' | 'paleo' | 'mediterranea' | 'low_carb' | 'chetogenica' | 'bilanciata')[];
  allergie: string[];
  stagione: ('primavera' | 'estate' | 'autunno' | 'inverno' | 'tutto_anno')[];
  tags: string[];
  imageUrl?: string;
  createdAt: Date;
  rating?: number;
  reviewCount?: number;
}

// 🏗️ GENERATORE RICETTE MASSIVE
class MassiveRecipeGenerator {
  
  // 🥑 RICETTE CHETOGENICHE (40+ ricette)
  static generateKetoRecipes(): Recipe[] {
    const ketoRecipes: Recipe[] = [];
    let id = 1;

    // 🌅 COLAZIONI KETO (15 ricette)
    const ketoBreakfasts = [
      { nome: "Avocado Keto Bowl", ingredienti: ["1 avocado", "2 uova", "30g salmone affumicato", "15g olio MCT"], carbs: 8, fats: 35, proteins: 20 },
      { nome: "Shake Chetogenico MCT", ingredienti: ["200ml latte cocco", "25g proteine whey", "15g olio MCT", "10g burro mandorle"], carbs: 6, fats: 32, proteins: 25 },
      { nome: "Uova Strapazzate Keto", ingredienti: ["3 uova", "30g burro", "50g spinaci", "30g formaggio"], carbs: 4, fats: 28, proteins: 22 },
      { nome: "Pancakes Keto Cocco", ingredienti: ["3 uova", "30g farina cocco", "20g eritritolo", "10g olio cocco"], carbs: 7, fats: 24, proteins: 18 },
      { nome: "Smoothie Verde Keto", ingredienti: ["150ml latte mandorle", "1/2 avocado", "30g spinaci", "20g proteine"], carbs: 9, fats: 26, proteins: 23 },
      { nome: "Frittata Keto Verdure", ingredienti: ["4 uova", "100g zucchine", "50g formaggio capra", "15g olio oliva"], carbs: 8, fats: 30, proteins: 24 },
      { nome: "Chia Pudding Keto", ingredienti: ["30g semi chia", "200ml latte cocco", "10g eritritolo", "noci"], carbs: 6, fats: 28, proteins: 15 },
      { nome: "Omelette Salmone Keto", ingredienti: ["3 uova", "50g salmone", "20g philadelphia", "erba cipollina"], carbs: 5, fats: 25, proteins: 26 },
      { nome: "Toast Keto Avocado", ingredienti: ["2 fette pane keto", "1 avocado", "2 uova", "semi sesamo"], carbs: 12, fats: 32, proteins: 20 },
      { nome: "Yogurt Keto Proteico", ingredienti: ["150g yogurt greco", "20g burro mandorle", "10g cacao", "stevia"], carbs: 8, fats: 22, proteins: 25 },
      { nome: "Caffè Bulletproof", ingredienti: ["250ml caffè", "15g burro", "15g olio MCT", "cannella"], carbs: 2, fats: 30, proteins: 1 },
      { nome: "Muffin Keto Cioccolato", ingredienti: ["farina mandorle", "uova", "cacao", "eritritolo", "burro"], carbs: 8, fats: 26, proteins: 12 },
      { nome: "Granola Keto Croccante", ingredienti: ["noci miste", "semi", "cocco rapé", "olio cocco", "cannella"], carbs: 10, fats: 35, proteins: 15 },
      { nome: "Porridge Keto Chia", ingredienti: ["semi chia", "latte cocco", "proteine", "frutti bosco"], carbs: 12, fats: 28, proteins: 20 },
      { nome: "Crêpes Keto Ricotta", ingredienti: ["uova", "ricotta", "farina cocco", "vaniglia"], carbs: 9, fats: 24, proteins: 18 }
    ];

    ketoBreakfasts.forEach((recipe, index) => {
      ketoRecipes.push(this.createRecipe(
        `keto_breakfast_${id++}`, recipe.nome, 'colazione', 'ricette_fit', 
        recipe.ingredienti, recipe.carbs, recipe.fats, recipe.proteins,
        ['chetogenica', 'keto', 'low_carb'], 10 + index * 2
      ));
    });

    // ☀️ PRANZI KETO (15 ricette)
    const ketoLunches = [
      { nome: "Caesar Salad Keto", ingredienti: ["lattuga romana", "pollo grigliato", "parmigiano", "uova", "olio oliva"], carbs: 8, fats: 28, proteins: 35 },
      { nome: "Zucchini Noodles Pesto", ingredienti: ["zucchine spiralizzate", "pesto", "pollo", "parmigiano"], carbs: 12, fats: 32, proteins: 30 },
      { nome: "Salmone Avocado Bowl", ingredienti: ["salmone grigliato", "avocado", "cetrioli", "olio oliva"], carbs: 10, fats: 35, proteins: 32 },
      { nome: "Insalata Caprese Keto", ingredienti: ["mozzarella bufala", "pomodori", "basilico", "olio evo"], carbs: 9, fats: 26, proteins: 18 },
      { nome: "Wrap Keto Tacchino", ingredienti: ["foglie lattuga", "tacchino", "avocado", "formaggio"], carbs: 8, fats: 24, proteins: 28 },
      { nome: "Soup Broccoli Keto", ingredienti: ["broccoli", "brodo", "panna", "formaggio", "bacon"], carbs: 11, fats: 30, proteins: 20 },
      { nome: "Tuna Salad Keto", ingredienti: ["tonno", "maionese", "cetrioli", "olive", "uova"], carbs: 6, fats: 25, proteins: 30 },
      { nome: "Chicken Thighs Keto", ingredienti: ["cosce pollo", "verdure grigliate", "burro alle erbe"], carbs: 8, fats: 35, proteins: 32 },
      { nome: "Eggplant Parmigiana Keto", ingredienti: ["melanzane", "mozzarella", "pomodoro", "basilico"], carbs: 12, fats: 28, proteins: 22 },
      { nome: "Beef Lettuce Wraps", ingredienti: ["manzo macinato", "lattuga", "formaggio", "spezie"], carbs: 7, fats: 26, proteins: 35 },
      { nome: "Cauliflower Rice Bowl", ingredienti: ["cavolfiore", "pollo", "verdure", "olio cocco"], carbs: 10, fats: 24, proteins: 30 },
      { nome: "Spinach Feta Salad", ingredienti: ["spinaci", "feta", "noci", "olive", "olio oliva"], carbs: 9, fats: 32, proteins: 15 },
      { nome: "Keto Pizza Portobello", ingredienti: ["funghi portobello", "mozzarella", "pepperoni"], carbs: 8, fats: 28, proteins: 25 },
      { nome: "Shrimp Avocado Salad", ingredienti: ["gamberi", "avocado", "rucola", "limone"], carbs: 11, fats: 22, proteins: 28 },
      { nome: "Keto Lasagna Zucchine", ingredienti: ["zucchine", "ricotta", "carne", "mozzarella"], carbs: 12, fats: 30, proteins: 32 }
    ];

    ketoLunches.forEach((recipe, index) => {
      ketoRecipes.push(this.createRecipe(
        `keto_lunch_${id++}`, recipe.nome, 'pranzo', 'ricette_fit',
        recipe.ingredienti, recipe.carbs, recipe.fats, recipe.proteins,
        ['chetogenica', 'keto', 'low_carb'], 20 + index * 2
      ));
    });

    // 🌙 CENE KETO (15 ricette)
    const ketoDinners = [
      { nome: "Salmone Burro Erbe", ingredienti: ["salmone", "burro", "erbe", "asparagi"], carbs: 6, fats: 32, proteins: 35 },
      { nome: "Bistecca Verdure Grigliate", ingredienti: ["bistecca", "zucchine", "peperoni", "olio oliva"], carbs: 8, fats: 28, proteins: 40 },
      { nome: "Pollo Parmigiano Keto", ingredienti: ["petto pollo", "parmigiano", "erbe", "broccoli"], carbs: 10, fats: 25, proteins: 38 },
      { nome: "Trota Limone Burro", ingredienti: ["trota", "burro", "limone", "prezzemolo"], carbs: 4, fats: 26, proteins: 32 },
      { nome: "Maiale Rosmarino", ingredienti: ["lonza maiale", "rosmarino", "aglio", "verdure"], carbs: 9, fats: 30, proteins: 36 },
      { nome: "Agnello Erbe Mediterranee", ingredienti: ["agnello", "origano", "timo", "olive"], carbs: 7, fats: 35, proteins: 34 },
      { nome: "Anatra Confit Keto", ingredienti: ["anatra", "grasso d'anatra", "timo", "aglio"], carbs: 5, fats: 40, proteins: 30 },
      { nome: "Branzino Crosta Sale", ingredienti: ["branzino", "sale grosso", "erbe", "limone"], carbs: 3, fats: 18, proteins: 35 },
      { nome: "Polpo Grigliato Keto", ingredienti: ["polpo", "olio oliva", "limone", "prezzemolo"], carbs: 8, fats: 22, proteins: 30 },
      { nome: "Capesante Pancetta", ingredienti: ["capesante", "pancetta", "burro", "erba cipollina"], carbs: 6, fats: 28, proteins: 25 },
      { nome: "Rombo Salsa Verde", ingredienti: ["rombo", "prezzemolo", "capperi", "acciughe"], carbs: 5, fats: 24, proteins: 32 },
      { nome: "Tonno Crosta Sesamo", ingredienti: ["tonno", "sesamo", "soia", "wasabi"], carbs: 7, fats: 20, proteins: 38 },
      { nome: "Rana Pescatrice Pancetta", ingredienti: ["rana pescatrice", "pancetta", "salvia"], carbs: 4, fats: 26, proteins: 33 },
      { nome: "Orata Papillote", ingredienti: ["orata", "verdure", "vino bianco", "burro"], carbs: 9, fats: 22, proteins: 30 },
      { nome: "Sogliola Burro Nocciola", ingredienti: ["sogliola", "burro", "nocciole", "limone"], carbs: 6, fats: 30, proteins: 28 }
    ];

    ketoDinners.forEach((recipe, index) => {
      ketoRecipes.push(this.createRecipe(
        `keto_dinner_${id++}`, recipe.nome, 'cena', 'mediterranea',
        recipe.ingredienti, recipe.carbs, recipe.fats, recipe.proteins,
        ['chetogenica', 'keto', 'low_carb'], 25 + index * 2
      ));
    });

    // 🍎 SPUNTINI KETO (15 ricette)
    const ketoSnacks = [
      { nome: "Fat Bombs Cioccolato", ingredienti: ["burro cacao", "olio cocco", "stevia", "noci"], carbs: 4, fats: 25, proteins: 8 },
      { nome: "Olive Marinate", ingredienti: ["olive verdi", "olive nere", "olio oliva", "erbe"], carbs: 6, fats: 18, proteins: 2 },
      { nome: "Cheese Crisps", ingredienti: ["parmigiano", "rosmarino", "pepe nero"], carbs: 2, fats: 15, proteins: 20 },
      { nome: "Noci Macadamia Tostate", ingredienti: ["noci macadamia", "sale", "rosmarino"], carbs: 5, fats: 30, proteins: 8 },
      { nome: "Mousse Avocado Cacao", ingredienti: ["avocado", "cacao", "stevia", "cocco rapé"], carbs: 8, fats: 22, proteins: 6 },
      { nome: "Prosciutto Mozzarella", ingredienti: ["prosciutto crudo", "mozzarella", "basilico"], carbs: 3, fats: 20, proteins: 25 },
      { nome: "Salmone Affumicato Roll", ingredienti: ["salmone affumicato", "philadelphia", "cetrioli"], carbs: 5, fats: 18, proteins: 15 },
      { nome: "Uova Diavola Keto", ingredienti: ["uova sode", "maionese", "senape", "paprika"], carbs: 2, fats: 22, proteins: 12 },
      { nome: "Guacamole Supreme", ingredienti: ["avocado", "lime", "cipolla", "peperoncino"], carbs: 8, fats: 26, proteins: 4 },
      { nome: "Panna Cotta Keto", ingredienti: ["panna", "gelatina", "vaniglia", "eritritolo"], carbs: 6, fats: 28, proteins: 8 },
      { nome: "Brownies Keto Bites", ingredienti: ["farina mandorle", "cacao", "burro", "uova"], carbs: 7, fats: 24, proteins: 10 },
      { nome: "Crackers Keto Semi", ingredienti: ["semi girasole", "semi zucca", "uova", "sale"], carbs: 6, fats: 20, proteins: 12 },
      { nome: "Gelato Keto Vaniglia", ingredienti: ["panna", "tuorli", "vaniglia", "eritritolo"], carbs: 5, fats: 32, proteins: 6 },
      { nome: "Energy Balls Keto", ingredienti: ["noci pecan", "burro mandorle", "cacao", "stevia"], carbs: 8, fats: 28, proteins: 10 },
      { nome: "Chocolate Keto Bark", ingredienti: ["cioccolato 90%", "noci", "sale himalaya"], carbs: 6, fats: 26, proteins: 8 }
    ];

    ketoSnacks.forEach((recipe, index) => {
      ketoRecipes.push(this.createRecipe(
        `keto_snack_${id++}`, recipe.nome, 'spuntino', 'ricette_fit',
        recipe.ingredienti, recipe.carbs, recipe.fats, recipe.proteins,
        ['chetogenica', 'keto', 'low_carb'], 8 + index
      ));
    });

    return ketoRecipes;
  }

  // 🥩 RICETTE LOW CARB (40+ ricette)
  static generateLowCarbRecipes(): Recipe[] {
    const lowCarbRecipes: Recipe[] = [];
    let id = 1;

    // Colazioni Low Carb (15 ricette)
    const lowCarbBreakfasts = [
      { nome: "Scrambled Eggs Spinaci", ingredienti: ["uova", "spinaci", "formaggio", "burro"], carbs: 15, fats: 22, proteins: 25 },
      { nome: "Greek Yogurt Berry", ingredienti: ["yogurt greco", "frutti bosco", "noci", "cannella"], carbs: 18, fats: 15, proteins: 20 },
      { nome: "Cottage Cheese Bowl", ingredienti: ["cottage cheese", "cetrioli", "pomodorini", "erbe"], carbs: 12, fats: 8, proteins: 28 },
      { nome: "Protein Smoothie Verde", ingredienti: ["proteine", "spinaci", "cetriolo", "limone"], carbs: 10, fats: 5, proteins: 30 },
      { nome: "Avocado Toast Proteico", ingredienti: ["pane proteico", "avocado", "uova", "semi"], carbs: 20, fats: 18, proteins: 22 },
      { nome: "Frittata Verdure", ingredienti: ["uova", "zucchine", "peperoni", "basilico"], carbs: 14, fats: 16, proteins: 24 },
      { nome: "Chia Bowl Proteico", ingredienti: ["chia", "proteine", "latte mandorle", "frutti"], carbs: 16, fats: 12, proteins: 25 },
      { nome: "Quinoa Breakfast Bowl", ingredienti: ["quinoa", "uova", "verdure", "feta"], carbs: 22, fats: 14, proteins: 20 },
      { nome: "Smoothie Proteico Cacao", ingredienti: ["proteine", "cacao", "banana", "mandorle"], carbs: 18, fats: 10, proteins: 28 },
      { nome: "Omelette Funghi", ingredienti: ["uova", "funghi", "erbe", "parmigiano"], carbs: 8, fats: 18, proteins: 22 },
      { nome: "Yogurt Parfait Proteico", ingredienti: ["yogurt", "granola proteica", "frutti", "miele"], carbs: 24, fats: 8, proteins: 25 },
      { nome: "Pancakes Proteici", ingredienti: ["proteine", "uova", "avena", "frutti"], carbs: 20, fats: 12, proteins: 26 },
      { nome: "Toast Salmone", ingredienti: ["pane integrale", "salmone", "avocado", "capperi"], carbs: 22, fats: 16, proteins: 24 },
      { nome: "Muesli Proteico", ingredienti: ["avena", "proteine", "noci", "frutti secchi"], carbs: 24, fats: 14, proteins: 22 },
      { nome: "Wrap Proteico", ingredienti: ["tortilla integrale", "uova", "verdure", "formaggio"], carbs: 18, fats: 15, proteins: 26 }
    ];

    lowCarbBreakfasts.forEach((recipe, index) => {
      lowCarbRecipes.push(this.createRecipe(
        `lowcarb_breakfast_${id++}`, recipe.nome, 'colazione', 'ricette_fit',
        recipe.ingredienti, recipe.carbs, recipe.fats, recipe.proteins,
        ['low_carb', 'bilanciata'], 12 + index * 2
      ));
    });

    // Pranzi Low Carb (15 ricette)
    const lowCarbLunches = [
      { nome: "Chicken Salad Power", ingredienti: ["pollo", "verdure miste", "avocado", "olio oliva"], carbs: 15, fats: 18, proteins: 35 },
      { nome: "Tuna Avocado Bowl", ingredienti: ["tonno", "avocado", "rucola", "limone"], carbs: 12, fats: 20, proteins: 30 },
      { nome: "Turkey Lettuce Wraps", ingredienti: ["tacchino", "lattuga", "verdure", "hummus"], carbs: 18, fats: 12, proteins: 28 },
      { nome: "Salmon Quinoa Bowl", ingredienti: ["salmone", "quinoa", "broccoli", "salsa tahini"], carbs: 22, fats: 16, proteins: 32 },
      { nome: "Beef Stir Fry", ingredienti: ["manzo", "verdure asiatiche", "salsa soia", "sesamo"], carbs: 16, fats: 14, proteins: 35 },
      { nome: "Shrimp Salad Mediterranean", ingredienti: ["gamberi", "feta", "olive", "pomodorini"], carbs: 14, fats: 18, proteins: 28 },
      { nome: "Chicken Zucchini Noodles", ingredienti: ["pollo", "zucchine", "pesto", "parmigiano"], carbs: 18, fats: 22, proteins: 30 },
      { nome: "Fish Tacos Lettuce", ingredienti: ["pesce", "lattuga", "salsa", "avocado"], carbs: 20, fats: 15, proteins: 26 },
      { nome: "Egg Salad Sandwich", ingredienti: ["uova", "pane proteico", "verdure", "maionese"], carbs: 24, fats: 16, proteins: 22 },
      { nome: "Lentil Power Bowl", ingredienti: ["lenticchie", "verdure", "tahini", "semi"], carbs: 24, fats: 12, proteins: 18 },
      { nome: "Turkey Meatballs", ingredienti: ["tacchino", "verdure", "pomodoro", "basilico"], carbs: 16, fats: 14, proteins: 32 },
      { nome: "Chickpea Salad", ingredienti: ["ceci", "verdure", "feta", "olio oliva"], carbs: 22, fats: 16, proteins: 15 },
      { nome: "Tofu Buddha Bowl", ingredienti: ["tofu", "quinoa", "verdure", "salsa arachidi"], carbs: 20, fats: 18, proteins: 20 },
      { nome: "Chicken Curry Light", ingredienti: ["pollo", "curry", "verdure", "riso cavolfiore"], carbs: 18, fats: 16, proteins: 30 },
      { nome: "Veggie Protein Bowl", ingredienti: ["proteine vegetali", "verdure", "quinoa", "avocado"], carbs: 24, fats: 14, proteins: 25 }
    ];

    lowCarbLunches.forEach((recipe, index) => {
      lowCarbRecipes.push(this.createRecipe(
        `lowcarb_lunch_${id++}`, recipe.nome, 'pranzo', 'ricette_fit',
        recipe.ingredienti, recipe.carbs, recipe.fats, recipe.proteins,
        ['low_carb', 'bilanciata'], 18 + index * 2
      ));
    });

    // Cene Low Carb (15 ricette) 
    const lowCarbDinners = [
      { nome: "Grilled Salmon Herbs", ingredienti: ["salmone", "erbe", "verdure", "limone"], carbs: 12, fats: 20, proteins: 35 },
      { nome: "Chicken Breast Vegetables", ingredienti: ["petto pollo", "verdure grigliate", "olio oliva"], carbs: 16, fats: 14, proteins: 38 },
      { nome: "Beef Tenderloin Asparagus", ingredienti: ["filetto", "asparagi", "funghi", "rosmarino"], carbs: 10, fats: 18, proteins: 40 },
      { nome: "Sea Bass Mediterranean", ingredienti: ["branzino", "pomodorini", "olive", "basilico"], carbs: 14, fats: 16, proteins: 32 },
      { nome: "Turkey Meatloaf", ingredienti: ["tacchino", "verdure", "uova", "spezie"], carbs: 18, fats: 12, proteins: 35 },
      { nome: "Pork Tenderloin Apples", ingredienti: ["lonza maiale", "mele", "cipolle", "timo"], carbs: 20, fats: 16, proteins: 33 },
      { nome: "Cod Fish Vegetables", ingredienti: ["merluzzo", "verdure", "limone", "prezzemolo"], carbs: 12, fats: 8, proteins: 30 },
      { nome: "Lamb Chops Rosemary", ingredienti: ["agnello", "rosmarino", "aglio", "verdure"], carbs: 10, fats: 22, proteins: 34 },
      { nome: "Tuna Steak Sesame", ingredienti: ["tonno", "sesamo", "verdure asiatiche"], carbs: 14, fats: 16, proteins: 36 },
      { nome: "Chicken Thighs Lemon", ingredienti: ["cosce pollo", "limone", "erbe", "verdure"], carbs: 12, fats: 20, proteins: 32 },
      { nome: "Shrimp Scampi Zucchini", ingredienti: ["gamberi", "zucchine", "aglio", "vino bianco"], carbs: 16, fats: 14, proteins: 28 },
      { nome: "Duck Breast Orange", ingredienti: ["anatra", "arancia", "timo", "verdure"], carbs: 18, fats: 18, proteins: 30 },
      { nome: "Halibut Herb Crust", ingredienti: ["halibut", "erbe", "mandorle", "limone"], carbs: 8, fats: 16, proteins: 35 },
      { nome: "Venison Juniper", ingredienti: ["cervo", "ginepro", "verdure", "mirtilli"], carbs: 15, fats: 12, proteins: 38 },
      { nome: "Octopus Grilled", ingredienti: ["polpo", "verdure", "olio oliva", "limone"], carbs: 14, fats: 16, proteins: 30 }
    ];

    lowCarbDinners.forEach((recipe, index) => {
      lowCarbRecipes.push(this.createRecipe(
        `lowcarb_dinner_${id++}`, recipe.nome, 'cena', 'mediterranea',
        recipe.ingredienti, recipe.carbs, recipe.fats, recipe.proteins,
        ['low_carb', 'mediterranea'], 22 + index * 2
      ));
    });

    // Spuntini Low Carb (15 ricette)
    const lowCarbSnacks = [
      { nome: "Protein Shake Berry", ingredienti: ["proteine", "frutti bosco", "mandorle"], carbs: 15, fats: 8, proteins: 25 },
      { nome: "Greek Yogurt Nuts", ingredienti: ["yogurt greco", "noci", "cannella"], carbs: 12, fats: 12, proteins: 18 },
      { nome: "Hard Boiled Eggs", ingredienti: ["uova sode", "sale", "pepe", "paprika"], carbs: 2, fats: 10, proteins: 12 },
      { nome: "Cottage Cheese Berries", ingredienti: ["cottage cheese", "frutti bosco", "miele"], carbs: 16, fats: 4, proteins: 20 },
      { nome: "Almonds Raw", ingredienti: ["mandorle crude", "sale marino"], carbs: 8, fats: 18, proteins: 8 },
      { nome: "Tuna Cucumber Bites", ingredienti: ["tonno", "cetrioli", "limone", "prezzemolo"], carbs: 6, fats: 8, proteins: 20 },
      { nome: "Turkey Roll Ups", ingredienti: ["tacchino", "formaggio", "verdure"], carbs: 4, fats: 12, proteins: 18 },
      { nome: "Hummus Vegetables", ingredienti: ["hummus", "carote", "sedano", "peperoni"], carbs: 18, fats: 8, proteins: 6 },
      { nome: "Protein Bar Homemade", ingredienti: ["proteine", "noci", "datteri", "cacao"], carbs: 20, fats: 12, proteins: 22 },
      { nome: "Chia Pudding Mini", ingredienti: ["chia", "latte cocco", "vaniglia"], carbs: 14, fats: 10, proteins: 8 },
      { nome: "Edamame Salted", ingredienti: ["edamame", "sale marino", "peperoncino"], carbs: 16, fats: 6, proteins: 12 },
      { nome: "Beef Jerky", ingredienti: ["manzo essiccato", "spezie"], carbs: 8, fats: 4, proteins: 20 },
      { nome: "Smoothie Protein Green", ingredienti: ["proteine", "spinaci", "mela", "limone"], carbs: 18, fats: 2, proteins: 25 },
      { nome: "Dark Chocolate Nuts", ingredienti: ["cioccolato 85%", "noci miste"], carbs: 12, fats: 16, proteins: 6 },
      { nome: "Ricotta Cinnamon", ingredienti: ["ricotta", "cannella", "stevia"], carbs: 8, fats: 8, proteins: 14 }
    ];

    lowCarbSnacks.forEach((recipe, index) => {
      lowCarbRecipes.push(this.createRecipe(
        `lowcarb_snack_${id++}`, recipe.nome, 'spuntino', 'ricette_fit',
        recipe.ingredienti, recipe.carbs, recipe.fats, recipe.proteins,
        ['low_carb', 'bilanciata'], 8 + index
      ));
    });

    return lowCarbRecipes;
  }

  // 🏛️ RICETTE PALEO (40+ ricette)
  static generatePaleoRecipes(): Recipe[] {
    const paleoRecipes: Recipe[] = [];
    let id = 1;

    // Colazioni Paleo (15 ricette)
    const paleoBreakfasts = [
      { nome: "Sweet Potato Hash", ingredienti: ["patate dolci", "uova", "verdure", "olio cocco"], carbs: 25, fats: 16, proteins: 18 },
      { nome: "Coconut Pancakes", ingredienti: ["farina cocco", "uova", "latte cocco", "frutti"], carbs: 20, fats: 18, proteins: 15 },
      { nome: "Paleo Granola", ingredienti: ["noci", "semi", "cocco", "miele", "cannella"], carbs: 22, fats: 24, proteins: 12 },
      { nome: "Veggie Scramble", ingredienti: ["uova", "verdure miste", "erbe", "olio oliva"], carbs: 12, fats: 18, proteins: 20 },
      { nome: "Fruit Salad Nuts", ingredienti: ["frutti stagionali", "noci", "miele", "menta"], carbs: 28, fats: 14, proteins: 8 },
      { nome: "Chia Breakfast Bowl", ingredienti: ["chia", "latte cocco", "frutti", "noci"], carbs: 24, fats: 16, proteins: 10 },
      { nome: "Bacon Eggs Avocado", ingredienti: ["bacon", "uova", "avocado", "pomodorini"], carbs: 8, fats: 26, proteins: 22 },
      { nome: "Smoothie Bowl Paleo", ingredienti: ["frutti", "latte cocco", "semi", "cocco rapé"], carbs: 26, fats: 18, proteins: 8 },
      { nome: "Almond Butter Toast", ingredienti: ["pane paleo", "burro mandorle", "banana"], carbs: 24, fats: 16, proteins: 12 },
      { nome: "Vegetable Frittata", ingredienti: ["uova", "verdure stagionali", "erbe fresche"], carbs: 10, fats: 16, proteins: 18 },
      { nome: "Coconut Yogurt Berry", ingredienti: ["yogurt cocco", "frutti bosco", "granola paleo"], carbs: 22, fats: 14, proteins: 6 },
      { nome: "Paleo Muffins", ingredienti: ["farina mandorle", "uova", "frutti", "miele"], carbs: 18, fats: 20, proteins: 10 },
      { nome: "Green Smoothie", ingredienti: ["spinaci", "frutti", "latte cocco", "semi chia"], carbs: 20, fats: 12, proteins: 8 },
      { nome: "Egg Muffin Cups", ingredienti: ["uova", "verdure", "bacon", "erbe"], carbs: 6, fats: 18, proteins: 16 },
      { nome: "Paleo Porridge", ingredienti: ["mandorle tritate", "semi", "latte cocco", "frutti"], carbs: 16, fats: 22, proteins: 12 }
    ];

    paleoBreakfasts.forEach((recipe, index) => {
      paleoRecipes.push(this.createRecipe(
        `paleo_breakfast_${id++}`, recipe.nome, 'colazione', 'internazionale',
        recipe.ingredienti, recipe.carbs, recipe.fats, recipe.proteins,
        ['paleo', 'senza_glutine'], 15 + index * 2
      ));
    });

    // Pranzi Paleo (15 ricette)
    const paleoLunches = [
      { nome: "Grilled Chicken Salad", ingredienti: ["pollo", "verdure miste", "avocado", "olio oliva"], carbs: 16, fats: 20, proteins: 35 },
      { nome: "Beef Bowl Vegetables", ingredienti: ["manzo", "verdure arrostite", "erbe"], carbs: 18, fats: 18, proteins: 32 },
      { nome: "Salmon Sweet Potato", ingredienti: ["salmone", "patate dolci", "broccoli"], carbs: 22, fats: 16, proteins: 30 },
      { nome: "Turkey Lettuce Wraps", ingredienti: ["tacchino", "lattuga", "verdure", "avocado"], carbs: 12, fats: 16, proteins: 28 },
      { nome: "Tuna Avocado Salad", ingredienti: ["tonno", "avocado", "verdure", "limone"], carbs: 14, fats: 18, proteins: 26 },
      { nome: "Pork Vegetable Stir", ingredienti: ["maiale", "verdure asiatiche", "olio cocco"], carbs: 16, fats: 20, proteins: 30 },
      { nome: "Shrimp Zucchini Noodles", ingredienti: ["gamberi", "zucchine", "pomodorini", "basilico"], carbs: 12, fats: 14, proteins: 24 },
      { nome: "Lamb Herb Salad", ingredienti: ["agnello", "erbe fresche", "verdure", "olio oliva"], carbs: 10, fats: 22, proteins: 28 },
      { nome: "Duck Breast Vegetables", ingredienti: ["anatra", "verdure stagionali", "frutti"], carbs: 20, fats: 24, proteins: 26 },
      { nome: "Fish Coconut Curry", ingredienti: ["pesce", "latte cocco", "verdure", "spezie"], carbs: 16, fats: 22, proteins: 24 },
      { nome: "Venison Berry Salad", ingredienti: ["cervo", "frutti bosco", "noci", "verdure"], carbs: 18, fats: 16, proteins: 30 },
      { nome: "Rabbit Herb Stew", ingredienti: ["coniglio", "verdure", "erbe", "brodo"], carbs: 14, fats: 12, proteins: 32 },
      { nome: "Bison Mushroom Bowl", ingredienti: ["bisonte", "funghi", "verdure"], carbs: 12, fats: 18, proteins: 34 },
      { nome: "Wild Boar Vegetables", ingredienti: ["cinghiale", "verdure selvatiche", "erbe"], carbs: 16, fats: 20, proteins: 32 },
      { nome: "Elk Antelope Salad", ingredienti: ["alce", "verdure", "frutti", "noci"], carbs: 18, fats: 16, proteins: 30 }
    ];

    paleoLunches.forEach((recipe, index) => {
      paleoRecipes.push(this.createRecipe(
        `paleo_lunch_${id++}`, recipe.nome, 'pranzo', 'internazionale',
        recipe.ingredienti, recipe.carbs, recipe.fats, recipe.proteins,
        ['paleo', 'senza_glutine'], 20 + index * 2
      ));
    });

    // Cene Paleo (15 ricette)
    const paleoDinners = [
      { nome: "Grass Fed Steak", ingredienti: ["bistecca grass-fed", "verdure", "erbe"], carbs: 8, fats: 20, proteins: 40 },
      { nome: "Wild Salmon Herbs", ingredienti: ["salmone selvaggio", "erbe", "verdure"], carbs: 10, fats: 18, proteins: 36 },
      { nome: "Free Range Chicken", ingredienti: ["pollo ruspante", "verdure arrostite"], carbs: 14, fats: 16, proteins: 38 },
      { nome: "Lamb Rosemary", ingredienti: ["agnello", "rosmarino", "aglio", "verdure"], carbs: 12, fats: 22, proteins: 34 },
      { nome: "Pork Tenderloin Apple", ingredienti: ["lonza maiale", "mele", "cipolle"], carbs: 20, fats: 16, proteins: 32 },
      { nome: "Sea Bass Mediterranean", ingredienti: ["branzino", "olive", "pomodorini", "erbe"], carbs: 14, fats: 18, proteins: 30 },
      { nome: "Turkey Thighs Sage", ingredienti: ["cosce tacchino", "salvia", "verdure"], carbs: 10, fats: 20, proteins: 36 },
      { nome: "Duck Confit Traditional", ingredienti: ["anatra", "grasso d'anatra", "timo"], carbs: 6, fats: 30, proteins: 28 },
      { nome: "Venison Juniper Berry", ingredienti: ["cervo", "ginepro", "frutti bosco"], carbs: 16, fats: 14, proteins: 38 },
      { nome: "Wild Boar Fennel", ingredienti: ["cinghiale", "finocchi", "erbe"], carbs: 12, fats: 18, proteins: 34 },
      { nome: "Rabbit Hunter Style", ingredienti: ["coniglio", "verdure selvatiche"], carbs: 14, fats: 16, proteins: 32 },
      { nome: "Pheasant Mushrooms", ingredienti: ["fagiano", "funghi porcini", "erbe"], carbs: 10, fats: 14, proteins: 30 },
      { nome: "Quail Grape Leaves", ingredienti: ["quaglie", "foglie vite", "erbe"], carbs: 8, fats: 16, proteins: 26 },
      { nome: "Elk Medallions", ingredienti: ["alce", "verdure radice", "erbe"], carbs: 18, fats: 12, proteins: 36 },
      { nome: "Bison Steaks Herbs", ingredienti: ["bisonte", "erbe fresche", "verdure"], carbs: 10, fats: 18, proteins: 38 }
    ];

    paleoDinners.forEach((recipe, index) => {
      paleoRecipes.push(this.createRecipe(
        `paleo_dinner_${id++}`, recipe.nome, 'cena', 'internazionale',
        recipe.ingredienti, recipe.carbs, recipe.fats, recipe.proteins,
        ['paleo', 'senza_glutine'], 25 + index * 2
      ));
    });

    // Spuntini Paleo (15 ricette)
    const paleoSnacks = [
      { nome: "Mixed Nuts Raw", ingredienti: ["noci miste crude", "sale marino"], carbs: 8, fats: 20, proteins: 8 },
      { nome: "Fruit Leather Homemade", ingredienti: ["frutti", "miele"], carbs: 24, fats: 1, proteins: 2 },
      { nome: "Coconut Chips", ingredienti: ["cocco", "sale", "spezie"], carbs: 12, fats: 18, proteins: 4 },
      { nome: "Beef Jerky Grass Fed", ingredienti: ["manzo grass-fed", "spezie"], carbs: 6, fats: 4, proteins: 22 },
      { nome: "Hard Boiled Eggs", ingredienti: ["uova ruspanti", "sale", "pepe"], carbs: 2, fats: 10, proteins: 12 },
      { nome: "Avocado Slices", ingredienti: ["avocado", "sale marino", "limone"], carbs: 8, fats: 20, proteins: 4 },
      { nome: "Olives Marinated", ingredienti: ["olive", "erbe", "olio oliva"], carbs: 6, fats: 16, proteins: 2 },
      { nome: "Macadamia Nuts", ingredienti: ["noci macadamia", "sale"], carbs: 4, fats: 24, proteins: 6 },
      { nome: "Dried Fruits", ingredienti: ["frutti secchi", "noci"], carbs: 28, fats: 12, proteins: 6 },
      { nome: "Vegetable Chips", ingredienti: ["verdure", "olio cocco", "sale"], carbs: 16, fats: 8, proteins: 4 },
      { nome: "Bone Broth", ingredienti: ["brodo ossa", "verdure", "erbe"], carbs: 4, fats: 2, proteins: 8 },
      { nome: "Coconut Butter", ingredienti: ["burro cocco", "frutti"], carbs: 12, fats: 16, proteins: 4 },
      { nome: "Nut Butter Celery", ingredienti: ["sedano", "burro mandorle"], carbs: 8, fats: 16, proteins: 8 },
      { nome: "Plantain Chips", ingredienti: ["platano", "olio cocco", "sale"], carbs: 20, fats: 8, proteins: 2 },
      { nome: "Seaweed Snacks", ingredienti: ["alghe", "sale marino"], carbs: 6, fats: 1, proteins: 4 }
    ];

    paleoSnacks.forEach((recipe, index) => {
      paleoRecipes.push(this.createRecipe(
        `paleo_snack_${id++}`, recipe.nome, 'spuntino', 'internazionale',
        recipe.ingredienti, recipe.carbs, recipe.fats, recipe.proteins,
        ['paleo', 'senza_glutine'], 8 + index
      ));
    });

    return paleoRecipes;
  }

  // 🌱 RICETTE VEGANE (40+ ricette)
  static generateVeganRecipes(): Recipe[] {
    const veganRecipes: Recipe[] = [];
    let id = 1;

    // Colazioni Vegane (15 ricette)
    const veganBreakfasts = [
      { nome: "Oat Smoothie Bowl", ingredienti: ["avena", "latte mandorle", "frutti", "semi chia"], carbs: 45, fats: 12, proteins: 15 },
      { nome: "Chia Pudding Vanilla", ingredienti: ["chia", "latte cocco", "vaniglia", "frutti"], carbs: 28, fats: 16, proteins: 8 },
      { nome: "Tofu Scramble", ingredienti: ["tofu", "verdure", "curcuma", "lievito nutrizionale"], carbs: 12, fats: 10, proteins: 20 },
      { nome: "Quinoa Breakfast Bowl", ingredienti: ["quinoa", "latte vegetale", "frutti", "noci"], carbs: 52, fats: 14, proteins: 16 },
      { nome: "Vegan Pancakes", ingredienti: ["farina", "latte vegetale", "frutti", "sciroppo"], carbs: 48, fats: 8, proteins: 12 },
      { nome: "Green Smoothie Power", ingredienti: ["spinaci", "banana", "latte mandorle", "proteine vegetali"], carbs: 32, fats: 6, proteins: 25 },
      { nome: "Overnight Oats", ingredienti: ["avena", "latte vegetale", "chia", "frutti"], carbs: 42, fats: 10, proteins: 14 },
      { nome: "Acai Bowl", ingredienti: ["acai", "banana", "granola", "cocco"], carbs: 38, fats: 12, proteins: 8 },
      { nome: "Breakfast Quinoa", ingredienti: ["quinoa", "latte cocco", "cannella", "noci"], carbs: 45, fats: 16, proteins: 12 },
      { nome: "Muesli Homemade", ingredienti: ["avena", "noci", "frutti secchi", "semi"], carbs: 48, fats: 18, proteins: 16 },
      { nome: "Coconut Porridge", ingredienti: ["cocco rapé", "latte cocco", "frutti", "miele agave"], carbs: 35, fats: 22, proteins: 8 },
      { nome: "Fruit Salad Bowl", ingredienti: ["frutti misti", "granola", "yogurt cocco"], carbs: 52, fats: 8, proteins: 6 },
      { nome: "Buckwheat Pancakes", ingredienti: ["grano saraceno", "latte vegetale", "frutti"], carbs: 44, fats: 6, proteins: 14 },
      { nome: "Energy Smoothie", ingredienti: ["datteri", "banana", "mandorle", "cacao"], carbs: 36, fats: 12, proteins: 10 },
      { nome: "Granola Bowl", ingredienti: ["granola fatta in casa", "yogurt vegetale", "frutti"], carbs: 46, fats: 14, proteins: 12 }
    ];

    veganBreakfasts.forEach((recipe, index) => {
      veganRecipes.push(this.createRecipe(
        `vegan_breakfast_${id++}`, recipe.nome, 'colazione', 'internazionale',
        recipe.ingredienti, recipe.carbs, recipe.fats, recipe.proteins,
        ['vegana', 'vegetariana', 'senza_glutine'], 15 + index * 2
      ));
    });

    // Pranzi Vegani (15 ricette)
    const veganLunches = [
      { nome: "Buddha Bowl Rainbow", ingredienti: ["quinoa", "verdure colorate", "tahini", "semi"], carbs: 48, fats: 18, proteins: 16 },
      { nome: "Lentil Curry", ingredienti: ["lenticchie", "latte cocco", "verdure", "spezie"], carbs: 42, fats: 14, proteins: 20 },
      { nome: "Chickpea Salad", ingredienti: ["ceci", "verdure", "tahini", "limone"], carbs: 36, fats: 12, proteins: 18 },
      { nome: "Tofu Stir Fry", ingredienti: ["tofu", "verdure asiatiche", "salsa soia", "riso"], carbs: 44, fats: 16, proteins: 22 },
      { nome: "Quinoa Tabbouleh", ingredienti: ["quinoa", "prezzemolo", "pomodori", "limone"], carbs: 38, fats: 8, proteins: 14 },
      { nome: "Black Bean Bowl", ingredienti: ["fagioli neri", "riso", "avocado", "salsa"], carbs: 52, fats: 14, proteins: 18 },
      { nome: "Veggie Burger", ingredienti: ["legumi", "verdure", "avena", "spezie"], carbs: 42, fats: 12, proteins: 16 },
      { nome: "Mediterranean Bowl", ingredienti: ["quinoa", "ceci", "verdure", "hummus"], carbs: 46, fats: 14, proteins: 20 },
      { nome: "Thai Curry Vegetables", ingredienti: ["verdure", "latte cocco", "curry", "riso"], carbs: 48, fats: 16, proteins: 12 },
      { nome: "Falafel Salad", ingredienti: ["falafel", "verdure", "tahini", "pita"], carbs: 44, fats: 18, proteins: 16 },
      { nome: "Stuffed Peppers", ingredienti: ["peperoni", "quinoa", "verdure", "noci"], carbs: 38, fats: 16, proteins: 14 },
      { nome: "Veggie Sushi Bowl", ingredienti: ["riso", "verdure", "avocado", "alga nori"], carbs: 52, fats: 10, proteins: 12 },
      { nome: "Tempeh Vegetables", ingredienti: ["tempeh", "verdure", "salsa teriyaki"], carbs: 32, fats: 14, proteins: 24 },
      { nome: "Mushroom Risotto", ingredienti: ["riso", "funghi", "brodo vegetale", "lievito"], carbs: 48, fats: 8, proteins: 14 },
      { nome: "Vegetable Paella", ingredienti: ["riso", "verdure", "zafferano", "brodo"], carbs: 46, fats: 10, proteins: 12 }
    ];

    veganLunches.forEach((recipe, index) => {
      veganRecipes.push(this.createRecipe(
        `vegan_lunch_${id++}`, recipe.nome, 'pranzo', 'internazionale',
        recipe.ingredienti, recipe.carbs, recipe.fats, recipe.proteins,
        ['vegana', 'vegetariana'], 20 + index * 2
      ));
    });

    // Cene Vegane (15 ricette)
    const veganDinners = [
      { nome: "Lentil Bolognese", ingredienti: ["lenticchie", "pomodoro", "verdure", "pasta"], carbs: 54, fats: 8, proteins: 20 },
      { nome: "Stuffed Eggplant", ingredienti: ["melanzane", "quinoa", "verdure", "noci"], carbs: 36, fats: 16, proteins: 14 },
      { nome: "Mushroom Stroganoff", ingredienti: ["funghi", "panna vegetale", "pasta", "erbe"], carbs: 48, fats: 12, proteins: 16 },
      { nome: "Chickpea Curry", ingredienti: ["ceci", "latte cocco", "verdure", "riso"], carbs: 52, fats: 14, proteins: 18 },
      { nome: "Vegetable Lasagna", ingredienti: ["pasta", "verdure", "ricotta vegetale", "pomodoro"], carbs: 46, fats: 14, proteins: 16 },
      { nome: "Thai Green Curry", ingredienti: ["verdure", "latte cocco", "curry verde", "tofu"], carbs: 38, fats: 18, proteins: 20 },
      { nome: "Ratatouille Quinoa", ingredienti: ["verdure mediterranee", "quinoa", "erbe"], carbs: 42, fats: 10, proteins: 14 },
      { nome: "Bean Chili", ingredienti: ["fagioli misti", "pomodoro", "verdure", "spezie"], carbs: 44, fats: 6, proteins: 18 },
      { nome: "Vegetable Stir Fry", ingredienti: ["verdure miste", "tofu", "salsa", "riso"], carbs: 46, fats: 12, proteins: 16 },
      { nome: "Stuffed Zucchini", ingredienti: ["zucchine", "quinoa", "verdure", "noci"], carbs: 32, fats: 14, proteins: 12 },
      { nome: "Moroccan Tagine", ingredienti: ["verdure", "ceci", "spezie", "couscous"], carbs: 48, fats: 10, proteins: 16 },
      { nome: "Indian Dal", ingredienti: ["lenticchie", "spezie", "verdure", "riso"], carbs: 50, fats: 8, proteins: 20 },
      { nome: "Mediterranean Stew", ingredienti: ["verdure", "fagioli", "pomodoro", "erbe"], carbs: 38, fats: 8, proteins: 16 },
      { nome: "Asian Noodle Soup", ingredienti: ["noodles", "verdure", "tofu", "brodo"], carbs: 44, fats: 10, proteins: 18 },
      { nome: "Vegetable Paella", ingredienti: ["riso", "verdure", "zafferano", "fagioli"], carbs: 52, fats: 8, proteins: 14 }
    ];

    veganDinners.forEach((recipe, index) => {
      veganRecipes.push(this.createRecipe(
        `vegan_dinner_${id++}`, recipe.nome, 'cena', 'internazionale',
        recipe.ingredienti, recipe.carbs, recipe.fats, recipe.proteins,
        ['vegana', 'vegetariana'], 25 + index * 2
      ));
    });

    // Spuntini Vegani (15 ricette)
    const veganSnacks = [
      { nome: "Energy Balls", ingredienti: ["datteri", "noci", "cacao", "cocco"], carbs: 24, fats: 12, proteins: 8 },
      { nome: "Hummus Vegetables", ingredienti: ["hummus", "verdure crude", "crackers"], carbs: 28, fats: 8, proteins: 10 },
      { nome: "Trail Mix", ingredienti: ["noci", "frutti secchi", "semi"], carbs: 32, fats: 18, proteins: 12 },
      { nome: "Smoothie Protein", ingredienti: ["proteine vegetali", "frutti", "latte vegetale"], carbs: 26, fats: 4, proteins: 22 },
      { nome: "Roasted Chickpeas", ingredienti: ["ceci", "spezie", "olio"], carbs: 24, fats: 8, proteins: 12 },
      { nome: "Fruit Leather", ingredienti: ["frutti", "succo limone"], carbs: 28, fats: 1, proteins: 2 },
      { nome: "Nut Butter Toast", ingredienti: ["pane", "burro noci", "banana"], carbs: 32, fats: 14, proteins: 10 },
      { nome: "Chia Seed Pudding", ingredienti: ["chia", "latte vegetale", "frutti"], carbs: 22, fats: 10, proteins: 8 },
      { nome: "Coconut Yogurt", ingredienti: ["yogurt cocco", "granola", "frutti"], carbs: 26, fats: 12, proteins: 6 },
      { nome: "Vegetable Chips", ingredienti: ["verdure", "olio", "sale"], carbs: 20, fats: 8, proteins: 4 },
      { nome: "Dates Stuffed", ingredienti: ["datteri", "burro mandorle"], carbs: 30, fats: 8, proteins: 6 },
      { nome: "Green Smoothie", ingredienti: ["verdure verdi", "frutti", "acqua"], carbs: 24, fats: 2, proteins: 4 },
      { nome: "Seed Crackers", ingredienti: ["semi misti", "acqua", "sale"], carbs: 16, fats: 12, proteins: 8 },
      { nome: "Popcorn Nutritional", ingredienti: ["mais", "lievito nutrizionale", "sale"], carbs: 28, fats: 4, proteins: 8 },
      { nome: "Frozen Grapes", ingredienti: ["uva", "menta"], carbs: 24, fats: 0, proteins: 2 }
    ];

    veganSnacks.forEach((recipe, index) => {
      veganRecipes.push(this.createRecipe(
        `vegan_snack_${id++}`, recipe.nome, 'spuntino', 'internazionale',
        recipe.ingredienti, recipe.carbs, recipe.fats, recipe.proteins,
        ['vegana', 'vegetariana'], 8 + index
      ));
    });

    return veganRecipes;
  }

  // 🌊 RICETTE MEDITERRANEE (40+ ricette)
  static generateMediterraneanRecipes(): Recipe[] {
    const mediterraneanRecipes: Recipe[] = [];
    let id = 1;

    // Colazioni Mediterranee (15 ricette)
    const medBreakfasts = [
      { nome: "Greek Yogurt Honey", ingredienti: ["yogurt greco", "miele", "noci", "frutti"], carbs: 28, fats: 12, proteins: 20 },
      { nome: "Avocado Toast Pomodori", ingredienti: ["pane integrale", "avocado", "pomodorini", "basilico"], carbs: 32, fats: 16, proteins: 12 },
      { nome: "Frittata Mediterranea", ingredienti: ["uova", "pomodori", "olive", "feta"], carbs: 8, fats: 18, proteins: 22 },
      { nome: "Muesli Mediterraneo", ingredienti: ["avena", "noci", "miele", "yogurt"], carbs: 45, fats: 14, proteins: 16 },
      { nome: "Smoothie Greco", ingredienti: ["yogurt greco", "frutti", "miele", "cannella"], carbs: 24, fats: 8, proteins: 18 },
      { nome: "Pancakes Ricotta", ingredienti: ["ricotta", "uova", "farina", "limone"], carbs: 36, fats: 12, proteins: 20 },
      { nome: "Toast Feta Pomodori", ingredienti: ["pane", "feta", "pomodori", "origano"], carbs: 30, fats: 14, proteins: 16 },
      { nome: "Porridge Mediterraneo", ingredienti: ["avena", "latte", "miele", "mandorle"], carbs: 42, fats: 10, proteins: 14 },
      { nome: "Uova Pomodoro Basilico", ingredienti: ["uova", "pomodori", "basilico", "olio evo"], carbs: 6, fats: 16, proteins: 20 },
      { nome: "Yogurt Fichi Noci", ingredienti: ["yogurt", "fichi", "noci", "miele"], carbs: 26, fats: 12, proteins: 18 },
      { nome: "Bruschetta Pomodoro", ingredienti: ["pane", "pomodori", "aglio", "basilico"], carbs: 34, fats: 8, proteins: 10 },
      { nome: "Ricotta Cannella", ingredienti: ["ricotta", "cannella", "miele", "pistacchi"], carbs: 16, fats: 12, proteins: 16 },
      { nome: "Smoothie Arancia", ingredienti: ["arancia", "yogurt", "miele", "mandorle"], carbs: 28, fats: 8, proteins: 14 },
      { nome: "Omelette Erbe", ingredienti: ["uova", "erbe fresche", "formaggio", "pomodori"], carbs: 8, fats: 16, proteins: 18 },
      { nome: "Granola Mediterranea", ingredienti: ["avena", "noci", "miele", "frutti secchi"], carbs: 48, fats: 16, proteins: 12 }
    ];

    medBreakfasts.forEach((recipe, index) => {
      mediterraneanRecipes.push(this.createRecipe(
        `med_breakfast_${id++}`, recipe.nome, 'colazione', 'mediterranea',
        recipe.ingredienti, recipe.carbs, recipe.fats, recipe.proteins,
        ['mediterranea', 'vegetariana'], 15 + index * 2
      ));
    });

    // Pranzi Mediterranei (15 ricette)
    const medLunches = [
      { nome: "Insalata Greca", ingredienti: ["pomodori", "cetrioli", "feta", "olive", "olio evo"], carbs: 16, fats: 18, proteins: 12 },
      { nome: "Pasta Pomodoro Basilico", ingredienti: ["pasta", "pomodori", "basilico", "parmigiano"], carbs: 58, fats: 8, proteins: 16 },
      { nome: "Quinoa Mediterranea", ingredienti: ["quinoa", "verdure", "olive", "feta"], carbs: 45, fats: 12, proteins: 18 },
      { nome: "Salmone Limone", ingredienti: ["salmone", "limone", "erbe", "verdure"], carbs: 8, fats: 18, proteins: 32 },
      { nome: "Caprese Avocado", ingredienti: ["mozzarella", "pomodori", "avocado", "basilico"], carbs: 12, fats: 22, proteins: 18 },
      { nome: "Branzino Olive", ingredienti: ["branzino", "olive", "pomodorini", "origano"], carbs: 10, fats: 16, proteins: 30 },
      { nome: "Farro Verdure", ingredienti: ["farro", "verdure grigliate", "feta", "erbe"], carbs: 48, fats: 10, proteins: 16 },
      { nome: "Polpo Patate", ingredienti: ["polpo", "patate", "olive", "prezzemolo"], carbs: 24, fats: 12, proteins: 28 },
      { nome: "Ceci Rosmarino", ingredienti: ["ceci", "rosmarino", "pomodori", "olio evo"], carbs: 36, fats: 12, proteins: 18 },
      { nome: "Pesce Spada Siciliano", ingredienti: ["pesce spada", "capperi", "olive", "pomodori"], carbs: 12, fats: 14, proteins: 30 },
      { nome: "Riso Verdure Mare", ingredienti: ["riso", "frutti di mare", "verdure", "zafferano"], carbs: 52, fats: 8, proteins: 24 },
      { nome: "Melanzane Parmigiana", ingredienti: ["melanzane", "pomodoro", "mozzarella", "basilico"], carbs: 24, fats: 16, proteins: 20 },
      { nome: "Orzo Feta Olive", ingredienti: ["orzo", "feta", "olive", "pomodorini"], carbs: 46, fats: 12, proteins: 16 },
      { nome: "Calamari Ripieni", ingredienti: ["calamari", "riso", "erbe", "pomodoro"], carbs: 28, fats: 8, proteins: 26 },
      { nome: "Zuppa Pesce", ingredienti: ["pesce misto", "pomodori", "erbe", "pane"], carbs: 20, fats: 10, proteins: 32 }
    ];

    medLunches.forEach((recipe, index) => {
      mediterraneanRecipes.push(this.createRecipe(
        `med_lunch_${id++}`, recipe.nome, 'pranzo', 'mediterranea',
        recipe.ingredienti, recipe.carbs, recipe.fats, recipe.proteins,
        ['mediterranea'], 20 + index * 2
      ));
    });

    // Cene Mediterranee (15 ricette)
    const medDinners = [
      { nome: "Branzino Crosta Sale", ingredienti: ["branzino", "sale grosso", "erbe", "limone"], carbs: 2, fats: 12, proteins: 35 },
      { nome: "Agnello Erbe", ingredienti: ["agnello", "rosmarino", "aglio", "patate"], carbs: 18, fats: 20, proteins: 32 },
      { nome: "Orata Papillote", ingredienti: ["orata", "verdure", "vino bianco", "erbe"], carbs: 8, fats: 14, proteins: 28 },
      { nome: "Pollo Limone Olive", ingredienti: ["pollo", "limone", "olive", "origano"], carbs: 6, fats: 16, proteins: 34 },
      { nome: "Sogliola Burro Salvia", ingredienti: ["sogliola", "burro", "salvia", "limone"], carbs: 4, fats: 18, proteins: 26 },
      { nome: "Tonno Crosta Erbe", ingredienti: ["tonno", "erbe fresche", "olive", "pomodori"], carbs: 8, fats: 16, proteins: 36 },
      { nome: "Spigola Mediterranea", ingredienti: ["spigola", "pomodorini", "capperi", "olive"], carbs: 10, fats: 14, proteins: 30 },
      { nome: "Rombo Limone", ingredienti: ["rombo", "limone", "prezzemolo", "olio evo"], carbs: 6, fats: 16, proteins: 32 },
      { nome: "Dentice Pomodori", ingredienti: ["dentice", "pomodori", "basilico", "aglio"], carbs: 12, fats: 12, proteins: 28 },
      { nome: "Cernia Olive Nere", ingredienti: ["cernia", "olive nere", "pomodorini", "origano"], carbs: 8, fats: 14, proteins: 30 },
      { nome: "San Pietro Erbe", ingredienti: ["san pietro", "erbe miste", "vino bianco"], carbs: 4, fats: 10, proteins: 26 },
      { nome: "Ricciola Mediterranea", ingredienti: ["ricciola", "capperi", "olive", "limone"], carbs: 6, fats: 16, proteins: 32 },
      { nome: "Sarago Crosta", ingredienti: ["sarago", "crosta erbe", "pomodorini"], carbs: 8, fats: 12, proteins: 24 },
      { nome: "Ombrina Salsa Verde", ingredienti: ["ombrina", "prezzemolo", "capperi", "aglio"], carbs: 4, fats: 14, proteins: 28 },
      { nome: "Gallinella Mare", ingredienti: ["gallinella", "pomodori", "olive", "basilico"], carbs: 10, fats: 12, proteins: 26 }
    ];

    medDinners.forEach((recipe, index) => {
      mediterraneanRecipes.push(this.createRecipe(
        `med_dinner_${id++}`, recipe.nome, 'cena', 'mediterranea',
        recipe.ingredienti, recipe.carbs, recipe.fats, recipe.proteins,
        ['mediterranea'], 25 + index * 2
      ));
    });

    // Spuntini Mediterranei (15 ricette)
    const medSnacks = [
      { nome: "Olive Miste", ingredienti: ["olive verdi", "olive nere", "erbe"], carbs: 6, fats: 16, proteins: 2 },
      { nome: "Feta Miele", ingredienti: ["feta", "miele", "noci"], carbs: 12, fats: 14, proteins: 12 },
      { nome: "Bruschetta Mini", ingredienti: ["pane", "pomodori", "basilico", "aglio"], carbs: 18, fats: 4, proteins: 6 },
      { nome: "Yogurt Greco Noci", ingredienti: ["yogurt greco", "noci", "miele"], carbs: 14, fats: 12, proteins: 16 },
      { nome: "Hummus Classico", ingredienti: ["ceci", "tahini", "limone", "aglio"], carbs: 16, fats: 8, proteins: 8 },
      { nome: "Mandorle Tostate", ingredienti: ["mandorle", "sale", "rosmarino"], carbs: 6, fats: 18, proteins: 8 },
      { nome: "Ricotta Pistacchi", ingredienti: ["ricotta", "pistacchi", "miele"], carbs: 10, fats: 12, proteins: 14 },
      { nome: "Pomodorini Mozzarella", ingredienti: ["pomodorini", "mozzarella", "basilico"], carbs: 8, fats: 12, proteins: 10 },
      { nome: "Fichi Prosciutto", ingredienti: ["fichi", "prosciutto crudo"], carbs: 16, fats: 8, proteins: 12 },
      { nome: "Tzatziki Verdure", ingredienti: ["yogurt", "cetrioli", "aglio", "erbe"], carbs: 12, fats: 6, proteins: 8 },
      { nome: "Formaggio Miele", ingredienti: ["formaggio", "miele", "noci"], carbs: 14, fats: 16, proteins: 12 },
      { nome: "Crackers Olive", ingredienti: ["crackers", "olive", "formaggio"], carbs: 20, fats: 10, proteins: 8 },
      { nome: "Pinoli Tostati", ingredienti: ["pinoli", "sale", "erbe"], carbs: 4, fats: 20, proteins: 6 },
      { nome: "Capperi Limone", ingredienti: ["capperi", "limone", "olio evo"], carbs: 4, fats: 8, proteins: 2 },
      { nome: "Pane Olio Pomodoro", ingredienti: ["pane", "olio evo", "pomodori", "sale"], carbs: 24, fats: 8, proteins: 6 }
    ];

    medSnacks.forEach((recipe, index) => {
      mediterraneanRecipes.push(this.createRecipe(
        `med_snack_${id++}`, recipe.nome, 'spuntino', 'mediterranea',
        recipe.ingredienti, recipe.carbs, recipe.fats, recipe.proteins,
        ['mediterranea'], 8 + index
      ));
    });

    return mediterraneanRecipes;
  }

  // ⚖️ RICETTE BILANCIATA (40+ ricette)
  static generateBalancedRecipes(): Recipe[] {
    const balancedRecipes: Recipe[] = [];
    let id = 1;

    // Colazioni Bilanciate (15 ricette) - Macro 40-30-30
    const balancedBreakfasts = [
      { nome: "Perfect Balance Bowl", ingredienti: ["avena", "proteine", "noci", "frutti"], carbs: 40, fats: 20, proteins: 30 },
      { nome: "Balanced Smoothie", ingredienti: ["proteine", "banana", "mandorle", "avena"], carbs: 38, fats: 18, proteins: 32 },
      { nome: "Power Breakfast", ingredienti: ["uova", "pane integrale", "avocado", "frutti"], carbs: 42, fats: 22, proteins: 28 },
      { nome: "Yogurt Perfect Mix", ingredienti: ["yogurt greco", "granola", "noci", "miele"], carbs: 36, fats: 20, proteins: 30 },
      { nome: "Quinoa Morning Bowl", ingredienti: ["quinoa", "latte", "proteine", "frutti"], carbs: 44, fats: 18, proteins: 26 },
      { nome: "Balanced Pancakes", ingredienti: ["farina proteica", "uova", "frutti", "noci"], carbs: 40, fats: 20, proteins: 28 },
      { nome: "Chia Perfect Pudding", ingredienti: ["chia", "proteine", "latte", "frutti"], carbs: 38, fats: 22, proteins: 24 },
      { nome: "Overnight Oats Pro", ingredienti: ["avena", "proteine", "burro mandorle", "frutti"], carbs: 42, fats: 20, proteins: 26 },
      { nome: "Protein Toast", ingredienti: ["pane proteico", "uova", "avocado", "semi"], carbs: 36, fats: 24, proteins: 28 },
      { nome: "Balanced Muesli", ingredienti: ["muesli", "yogurt", "proteine", "noci"], carbs: 44, fats: 18, proteins: 26 },
      { nome: "Power Smoothie Bowl", ingredienti: ["proteine", "frutti", "granola", "mandorle"], carbs: 40, fats: 20, proteins: 30 },
      { nome: "Perfect Porridge", ingredienti: ["avena", "proteine", "noci", "miele"], carbs: 38, fats: 22, proteins: 28 },
      { nome: "Balanced Frittata", ingredienti: ["uova", "verdure", "formaggio", "pane"], carbs: 36, fats: 24, proteins: 26 },
      { nome: "Morning Power Mix", ingredienti: ["quinoa", "yogurt", "noci", "frutti"], carbs: 42, fats: 18, proteins: 28 },
      { nome: "Complete Breakfast", ingredienti: ["avena", "uova", "noci", "frutti"], carbs: 40, fats: 20, proteins: 30 }
    ];

    balancedBreakfasts.forEach((recipe, index) => {
      balancedRecipes.push(this.createRecipe(
        `balanced_breakfast_${id++}`, recipe.nome, 'colazione', 'ricette_fit',
        recipe.ingredienti, recipe.carbs, recipe.fats, recipe.proteins,
        ['bilanciata'], 18 + index * 2
      ));
    });

    // Pranzi Bilanciati (15 ricette)
    const balancedLunches = [
      { nome: "Chicken Rice Perfect", ingredienti: ["pollo", "riso integrale", "verdure", "olio"], carbs: 45, fats: 18, proteins: 35 },
      { nome: "Salmon Quinoa Bowl", ingredienti: ["salmone", "quinoa", "verdure", "avocado"], carbs: 42, fats: 20, proteins: 32 },
      { nome: "Turkey Sweet Potato", ingredienti: ["tacchino", "patate dolci", "verdure", "noci"], carbs: 44, fats: 16, proteins: 34 },
      { nome: "Tuna Pasta Balance", ingredienti: ["tonno", "pasta integrale", "verdure", "olio"], carbs: 48, fats: 14, proteins: 30 },
      { nome: "Beef Vegetable Rice", ingredienti: ["manzo", "riso", "verdure", "semi"], carbs: 46, fats: 18, proteins: 32 },
      { nome: "Fish Potato Medley", ingredienti: ["pesce", "patate", "verdure", "erbe"], carbs: 40, fats: 16, proteins: 34 },
      { nome: "Chicken Quinoa Power", ingredienti: ["pollo", "quinoa", "verdure", "mandorle"], carbs: 42, fats: 18, proteins: 36 },
      { nome: "Pork Rice Complete", ingredienti: ["maiale", "riso integrale", "verdure", "noci"], carbs: 44, fats: 20, proteins: 30 },
      { nome: "Shrimp Pasta Perfect", ingredienti: ["gamberi", "pasta", "verdure", "olio"], carbs: 46, fats: 16, proteins: 28 },
      { nome: "Duck Sweet Potato", ingredienti: ["anatra", "patate dolci", "verdure", "semi"], carbs: 40, fats: 22, proteins: 26 },
      { nome: "Lamb Quinoa Balance", ingredienti: ["agnello", "quinoa", "verdure", "noci"], carbs: 38, fats: 24, proteins: 32 },
      { nome: "Turkey Pasta Medley", ingredienti: ["tacchino", "pasta", "verdure", "avocado"], carbs: 48, fats: 18, proteins: 28 },
      { nome: "Beef Potato Power", ingredienti: ["manzo", "patate", "verdure", "olio"], carbs: 42, fats: 20, proteins: 34 },
      { nome: "Fish Rice Complete", ingredienti: ["pesce", "riso", "verdure", "mandorle"], carbs: 44, fats: 16, proteins: 32 },
      { nome: "Chicken Sweet Bowl", ingredienti: ["pollo", "patate dolci", "verdure", "semi"], carbs: 40, fats: 18, proteins: 36 }
    ];

    balancedLunches.forEach((recipe, index) => {
      balancedRecipes.push(this.createRecipe(
        `balanced_lunch_${id++}`, recipe.nome, 'pranzo', 'ricette_fit',
        recipe.ingredienti, recipe.carbs, recipe.fats, recipe.proteins,
        ['bilanciata'], 22 + index * 2
      ));
    });

    // Cene Bilanciate (15 ricette)
    const balancedDinners = [
      { nome: "Salmon Vegetables Perfect", ingredienti: ["salmone", "verdure", "riso", "noci"], carbs: 35, fats: 22, proteins: 32 },
      { nome: "Chicken Quinoa Light", ingredienti: ["pollo", "quinoa", "verdure", "olio"], carbs: 32, fats: 20, proteins: 36 },
      { nome: "Turkey Balance Plate", ingredienti: ["tacchino", "verdure", "patate", "mandorle"], carbs: 36, fats: 18, proteins: 34 },
      { nome: "Fish Complete Dinner", ingredienti: ["pesce", "verdure", "riso integrale", "semi"], carbs: 34, fats: 20, proteins: 30 },
      { nome: "Beef Perfect Balance", ingredienti: ["manzo", "verdure", "quinoa", "noci"], carbs: 30, fats: 24, proteins: 38 },
      { nome: "Pork Evening Complete", ingredienti: ["maiale", "verdure", "patate dolci", "olio"], carbs: 36, fats: 22, proteins: 28 },
      { nome: "Duck Balance Special", ingredienti: ["anatra", "verdure", "riso", "mandorle"], carbs: 32, fats: 26, proteins: 26 },
      { nome: "Lamb Perfect Dinner", ingredienti: ["agnello", "verdure", "quinoa", "noci"], carbs: 28, fats: 28, proteins: 32 },
      { nome: "Shrimp Light Balance", ingredienti: ["gamberi", "verdure", "riso", "avocado"], carbs: 34, fats: 20, proteins: 26 },
      { nome: "Tuna Evening Perfect", ingredienti: ["tonno", "verdure", "patate", "olio"], carbs: 32, fats: 22, proteins: 34 },
      { nome: "Chicken Light Dinner", ingredienti: ["pollo", "verdure", "quinoa", "semi"], carbs: 30, fats: 20, proteins: 38 },
      { nome: "Fish Balance Complete", ingredienti: ["pesce", "verdure", "riso", "noci"], carbs: 36, fats: 18, proteins: 30 },
      { nome: "Turkey Perfect Evening", ingredienti: ["tacchino", "verdure", "patate dolci", "mandorle"], carbs: 34, fats: 20, proteins: 32 },
      { nome: "Beef Light Balance", ingredienti: ["manzo", "verdure", "quinoa", "olio"], carbs: 28, fats: 24, proteins: 36 },
      { nome: "Pork Complete Dinner", ingredienti: ["maiale", "verdure", "riso", "semi"], carbs: 32, fats: 22, proteins: 30 }
    ];

    balancedDinners.forEach((recipe, index) => {
      balancedRecipes.push(this.createRecipe(
        `balanced_dinner_${id++}`, recipe.nome, 'cena', 'ricette_fit',
        recipe.ingredienti, recipe.carbs, recipe.fats, recipe.proteins,
        ['bilanciata'], 25 + index * 2
      ));
    });

    // Spuntini Bilanciati (15 ricette)
    const balancedSnacks = [
      { nome: "Perfect Protein Snack", ingredienti: ["proteine", "noci", "frutti"], carbs: 20, fats: 10, proteins: 20 },
      { nome: "Balanced Energy Bar", ingredienti: ["avena", "proteine", "noci", "miele"], carbs: 24, fats: 12, proteins: 18 },
      { nome: "Yogurt Balance Mix", ingredienti: ["yogurt", "granola", "noci"], carbs: 22, fats: 10, proteins: 16 },
      { nome: "Complete Trail Mix", ingredienti: ["noci", "frutti secchi", "semi"], carbs: 26, fats: 14, proteins: 12 },
      { nome: "Protein Smoothie Mini", ingredienti: ["proteine", "frutti", "mandorle"], carbs: 18, fats: 8, proteins: 22 },
      { nome: "Balanced Apple Slices", ingredienti: ["mela", "burro mandorle", "proteine"], carbs: 20, fats: 12, proteins: 16 },
      { nome: "Perfect Cottage Bowl", ingredienti: ["cottage cheese", "frutti", "noci"], carbs: 16, fats: 8, proteins: 20 },
      { nome: "Energy Balance Balls", ingredienti: ["datteri", "proteine", "noci", "cocco"], carbs: 22, fats: 10, proteins: 14 },
      { nome: "Complete Greek Yogurt", ingredienti: ["yogurt greco", "miele", "mandorle"], carbs: 18, fats: 10, proteins: 18 },
      { nome: "Balanced Hummus Plate", ingredienti: ["hummus", "verdure", "crackers"], carbs: 24, fats: 8, proteins: 12 },
      { nome: "Perfect Chia Pudding", ingredienti: ["chia", "latte", "proteine", "frutti"], carbs: 20, fats: 12, proteins: 16 },
      { nome: "Complete Smoothie", ingredienti: ["proteine", "banana", "burro noci"], carbs: 22, fats: 10, proteins: 20 },
      { nome: "Balanced Crackers", ingredienti: ["crackers proteici", "formaggio", "noci"], carbs: 18, fats: 14, proteins: 14 },
      { nome: "Perfect Energy Mix", ingredienti: ["noci", "frutti", "proteine"], carbs: 20, fats: 12, proteins: 18 },
      { nome: "Complete Mini Meal", ingredienti: ["quinoa", "verdure", "proteine"], carbs: 24, fats: 8, proteins: 16 }
    ];

    balancedSnacks.forEach((recipe, index) => {
      balancedRecipes.push(this.createRecipe(
        `balanced_snack_${id++}`, recipe.nome, 'spuntino', 'ricette_fit',
        recipe.ingredienti, recipe.carbs, recipe.fats, recipe.proteins,
        ['bilanciata'], 10 + index
      ));
    });

    return balancedRecipes;
  }

  // 🏋️‍♂️ RICETTE FIT (40+ ricette)
  static generateFitRecipes(): Recipe[] {
    const fitRecipes: Recipe[] = [];
    let id = 1;

    // Colazioni Fit (15 ricette)
    const fitBreakfasts = [
      { nome: "Power Protein Pancakes", ingredienti: ["proteine", "uova", "avena", "frutti"], carbs: 35, fats: 12, proteins: 40 },
      { nome: "Muscle Building Smoothie", ingredienti: ["proteine", "banana", "avena", "burro arachidi"], carbs: 42, fats: 16, proteins: 45 },
      { nome: "Fitness Scrambled Eggs", ingredienti: ["uova", "albumi", "verdure", "formaggio"], carbs: 8, fats: 18, proteins: 35 },
      { nome: "Pre-Workout Oats", ingredienti: ["avena", "proteine", "banana", "cannella"], carbs: 48, fats: 8, proteins: 30 },
      { nome: "Athlete Breakfast Bowl", ingredienti: ["quinoa", "proteine", "frutti", "noci"], carbs: 45, fats: 14, proteins: 32 },
      { nome: "High Protein Muesli", ingredienti: ["muesli proteico", "yogurt greco", "frutti"], carbs: 40, fats: 10, proteins: 38 },
      { nome: "Strength Training Toast", ingredienti: ["pane proteico", "uova", "avocado", "semi"], carbs: 32, fats: 20, proteins: 28 },
      { nome: "Recovery Smoothie Bowl", ingredienti: ["proteine", "frutti", "granola", "cocco"], carbs: 38, fats: 12, proteins: 35 },
      { nome: "Gym Warrior Porridge", ingredienti: ["avena", "proteine", "frutti secchi", "miele"], carbs: 44, fats: 8, proteins: 32 },
      { nome: "Fitness Frittata", ingredienti: ["uova", "albumi", "verdure", "tacchino"], carbs: 10, fats: 16, proteins: 40 },
      { nome: "Post Workout Shake", ingredienti: ["proteine", "latte", "banana", "miele"], carbs: 36, fats: 6, proteins: 42 },
      { nome: "Champion Breakfast", ingredienti: ["uova", "quinoa", "verdure", "formaggio"], carbs: 28, fats: 18, proteins: 36 },
      { nome: "Protein Power Bowl", ingredienti: ["yogurt greco", "proteine", "granola", "frutti"], carbs: 35, fats: 8, proteins: 45 },
      { nome: "Training Day Pancakes", ingredienti: ["proteine", "farina avena", "albumi", "frutti"], carbs: 40, fats: 6, proteins: 38 },
      { nome: "Muscle Fuel Smoothie", ingredienti: ["proteine", "avena", "frutti", "mandorle"], carbs: 42, fats: 12, proteins: 40 }
    ];

    fitBreakfasts.forEach((recipe, index) => {
      fitRecipes.push(this.createRecipe(
        `fit_breakfast_${id++}`, recipe.nome, 'colazione', 'ricette_fit',
        recipe.ingredienti, recipe.carbs, recipe.fats, recipe.proteins,
        ['bilanciata'], 15 + index * 2
      ));
    });

    // Pranzi Fit (15 ricette)
    const fitLunches = [
      { nome: "Chicken Power Bowl", ingredienti: ["pollo", "quinoa", "verdure", "avocado"], carbs: 45, fats: 18, proteins: 45 },
      { nome: "Athlete Salmon Plate", ingredienti: ["salmone", "riso integrale", "broccoli", "mandorle"], carbs: 48, fats: 20, proteins: 40 },
      { nome: "Training Turkey Wrap", ingredienti: ["tacchino", "wrap integrale", "verdure", "hummus"], carbs: 42, fats: 14, proteins: 38 },
      { nome: "Muscle Building Tuna", ingredienti: ["tonno", "quinoa", "verdure", "olive"], carbs: 40, fats: 16, proteins: 42 },
      { nome: "Strength Beef Bowl", ingredienti: ["manzo", "riso", "verdure", "noci"], carbs: 46, fats: 18, proteins: 40 },
      { nome: "Fitness Fish Meal", ingredienti: ["pesce", "patate dolci", "verdure", "semi"], carbs: 44, fats: 12, proteins: 36 },
      { nome: "Gym Warrior Chicken", ingredienti: ["pollo", "pasta integrale", "verdure", "parmigiano"], carbs: 52, fats: 14, proteins: 38 },
      { nome: "Recovery Pork Plate", ingredienti: ["maiale", "quinoa", "verdure", "avocado"], carbs: 38, fats: 20, proteins: 34 },
      { nome: "Performance Shrimp", ingredienti: ["gamberi", "riso", "verdure", "cocco"], carbs: 48, fats: 16, proteins: 32 },
      { nome: "Champion Duck Bowl", ingredienti: ["anatra", "quinoa", "verdure", "noci"], carbs: 36, fats: 24, proteins: 28 },
      { nome: "Training Lamb Plate", ingredienti: ["agnello", "patate", "verdure", "erbe"], carbs: 42, fats: 22, proteins: 32 },
      { nome: "Athletic Turkey Bowl", ingredienti: ["tacchino", "riso integrale", "verdure", "semi"], carbs: 46, fats: 12, proteins: 40 },
      { nome: "Power Beef Meal", ingredienti: ["manzo", "quinoa", "verdure", "mandorle"], carbs: 40, fats: 18, proteins: 42 },
      { nome: "Fitness Fish Bowl", ingredienti: ["pesce", "riso", "verdure", "avocado"], carbs: 44, fats: 16, proteins: 38 },
      { nome: "Gym Chicken Power", ingredienti: ["pollo", "patate dolci", "verdure", "noci"], carbs: 48, fats: 14, proteins: 44 }
    ];

    fitLunches.forEach((recipe, index) => {
      fitRecipes.push(this.createRecipe(
        `fit_lunch_${id++}`, recipe.nome, 'pranzo', 'ricette_fit',
        recipe.ingredienti, recipe.carbs, recipe.fats, recipe.proteins,
        ['bilanciata'], 20 + index * 2
      ));
    });

    // Cene Fit (15 ricette)
    const fitDinners = [
      { nome: "Lean Salmon Dinner", ingredienti: ["salmone", "verdure", "quinoa", "erbe"], carbs: 32, fats: 18, proteins: 40 },
      { nome: "Athlete Chicken Plate", ingredienti: ["pollo", "verdure", "riso integrale", "mandorle"], carbs: 35, fats: 14, proteins: 42 },
      { nome: "Training Turkey Meal", ingredienti: ["tacchino", "verdure", "patate dolci", "noci"], carbs: 38, fats: 16, proteins: 38 },
      { nome: "Recovery Fish Dinner", ingredienti: ["pesce", "verdure", "quinoa", "olive"], carbs: 30, fats: 16, proteins: 36 },
      { nome: "Power Beef Evening", ingredienti: ["manzo", "verdure", "riso", "semi"], carbs: 34, fats: 18, proteins: 44 },
      { nome: "Fitness Pork Plate", ingredienti: ["maiale", "verdure", "quinoa", "avocado"], carbs: 28, fats: 20, proteins: 32 },
      { nome: "Champion Duck Dinner", ingredienti: ["anatra", "verdure", "riso integrale", "noci"], carbs: 32, fats: 24, proteins: 28 },
      { nome: "Athletic Lamb Meal", ingredienti: ["agnello", "verdure", "patate", "erbe"], carbs: 30, fats: 22, proteins: 34 },
      { nome: "Gym Shrimp Dinner", ingredienti: ["gamberi", "verdure", "quinoa", "cocco"], carbs: 26, fats: 14, proteins: 30 },
      { nome: "Strength Tuna Plate", ingredienti: ["tonno", "verdure", "riso", "mandorle"], carbs: 32, fats: 16, proteins: 38 },
      { nome: "Performance Chicken", ingredienti: ["pollo", "verdure", "quinoa", "semi"], carbs: 28, fats: 12, proteins: 42 },
      { nome: "Training Fish Evening", ingredienti: ["pesce", "verdure", "patate dolci", "olive"], carbs: 34, fats: 14, proteins: 34 },
      { nome: "Recovery Turkey Dinner", ingredienti: ["tacchino", "verdure", "riso integrale", "noci"], carbs: 30, fats: 16, proteins: 36 },
      { nome: "Athletic Beef Plate", ingredienti: ["manzo", "verdure", "quinoa", "avocado"], carbs: 26, fats: 20, proteins: 40 },
      { nome: "Champion Pork Dinner", ingredienti: ["maiale", "verdure", "riso", "erbe"], carbs: 32, fats: 18, proteins: 30 }
    ];

    fitDinners.forEach((recipe, index) => {
      fitRecipes.push(this.createRecipe(
        `fit_dinner_${id++}`, recipe.nome, 'cena', 'ricette_fit',
        recipe.ingredienti, recipe.carbs, recipe.fats, recipe.proteins,
        ['bilanciata'], 25 + index * 2
      ));
    });

    // Spuntini Fit (15 ricette)
    const fitSnacks = [
      { nome: "Post Workout Shake", ingredienti: ["proteine", "banana", "latte"], carbs: 25, fats: 4, proteins: 30 },
      { nome: "Pre Training Snack", ingredienti: ["proteine", "avena", "miele"], carbs: 28, fats: 6, proteins: 25 },
      { nome: "Muscle Building Bar", ingredienti: ["proteine", "noci", "datteri"], carbs: 22, fats: 12, proteins: 28 },
      { nome: "Recovery Smoothie", ingredienti: ["proteine", "frutti", "yogurt"], carbs: 24, fats: 8, proteins: 32 },
      { nome: "Athlete Energy Balls", ingredienti: ["proteine", "avena", "burro mandorle"], carbs: 20, fats: 14, proteins: 20 },
      { nome: "Training Day Mix", ingredienti: ["noci", "frutti secchi", "proteine"], carbs: 26, fats: 16, proteins: 18 },
      { nome: "Gym Warrior Snack", ingredienti: ["cottage cheese", "frutti", "granola"], carbs: 22, fats: 6, proteins: 24 },
      { nome: "Performance Pudding", ingredienti: ["chia", "proteine", "latte", "frutti"], carbs: 18, fats: 10, proteins: 22 },
      { nome: "Strength Yogurt", ingredienti: ["yogurt greco", "proteine", "noci"], carbs: 16, fats: 12, proteins: 28 },
      { nome: "Champion Smoothie", ingredienti: ["proteine", "spinaci", "banana"], carbs: 20, fats: 4, proteins: 30 },
      { nome: "Athletic Crackers", ingredienti: ["crackers proteici", "hummus", "verdure"], carbs: 24, fats: 8, proteins: 16 },
      { nome: "Fitness Energy Bar", ingredienti: ["proteine", "cocco", "cacao"], carbs: 18, fats: 14, proteins: 24 },
      { nome: "Training Protein Bites", ingredienti: ["proteine", "mandorle", "miele"], carbs: 16, fats: 12, proteins: 26 },
      { nome: "Recovery Cottage Bowl", ingredienti: ["cottage cheese", "frutti bosco", "noci"], carbs: 20, fats: 10, proteins: 22 },
      { nome: "Gym Power Smoothie", ingredienti: ["proteine", "avena", "frutti"], carbs: 24, fats: 6, proteins: 28 }
    ];

    fitSnacks.forEach((recipe, index) => {
      fitRecipes.push(this.createRecipe(
        `fit_snack_${id++}`, recipe.nome, 'spuntino', 'ricette_fit',
        recipe.ingredienti, recipe.carbs, recipe.fats, recipe.proteins,
        ['bilanciata'], 10 + index
      ));
    });

    return fitRecipes;
  }

  // 🏗️ FUNZIONE HELPER PER CREARE RICETTE
  private static createRecipe(
    id: string, 
    nome: string, 
    categoria: 'colazione' | 'pranzo' | 'cena' | 'spuntino',
    tipoCucina: 'italiana' | 'mediterranea' | 'asiatica' | 'americana' | 'messicana' | 'internazionale' | 'ricette_fit',
    ingredienti: string[],
    carbs: number,
    fats: number,
    proteins: number,
    tipoDieta: string[],
    tempo: number
  ): Recipe {
    const calorie = (carbs * 4) + (fats * 9) + (proteins * 4);
    
    return {
      id,
      nome,
      categoria,
      tipoCucina,
      difficolta: tempo <= 15 ? 'facile' : tempo <= 30 ? 'medio' : 'difficile',
      tempoPreparazione: tempo,
      porzioni: 1,
      calorie: Math.round(calorie),
      proteine: proteins,
      carboidrati: carbs,
      grassi: fats,
      ingredienti,
      preparazione: `Preparazione semplice e gustosa per ${nome.toLowerCase()}. Segui i passaggi per un risultato perfetto.`,
      tipoDieta: tipoDieta as any,
      allergie: MassiveRecipeGenerator.determineAllergies(ingredienti),
      stagione: ['tutto_anno'],
      tags: MassiveRecipeGenerator.generateTags(carbs, proteins, fats),
      imageUrl: MassiveRecipeGenerator.getImageUrl(nome, categoria),
      createdAt: new Date(),
      rating: Math.random() * 1.5 + 3.5,
      reviewCount: Math.floor(Math.random() * 50) + 5
    };
  }

  // 🏷️ HELPER METHODS
  private static determineAllergies(ingredienti: string[]): string[] {
    const allergie: string[] = [];
    const text = ingredienti.join(' ').toLowerCase();
    
    if (text.includes('latte') || text.includes('yogurt') || text.includes('formaggio')) allergie.push('latte');
    if (text.includes('uova')) allergie.push('uova');
    if (text.includes('noci') || text.includes('mandorle') || text.includes('pistacchi')) allergie.push('frutta_secca');
    if (text.includes('pesce') || text.includes('salmone') || text.includes('tonno')) allergie.push('pesce');
    if (text.includes('gamberi') || text.includes('crostacei')) allergie.push('crostacei');
    if (text.includes('glutine') || text.includes('pasta') || text.includes('pane')) allergie.push('glutine');
    
    return allergie;
  }

  private static generateTags(carbs: number, proteins: number, fats: number): string[] {
    const tags: string[] = [];
    
    if (proteins >= 30) tags.push('high-protein');
    if (carbs < 15) tags.push('low-carb');
    if (carbs < 15 && fats > 15) tags.push('keto');
    if (proteins >= 20 && carbs >= 25) tags.push('balanced');
    
    return tags;
  }

  private static getImageUrl(nome: string, categoria: string): string {
    const nomeLC = nome.toLowerCase();
    
    // Mapping specifico migliorato
    if (nomeLC.includes('avocado')) return 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=300&fit=crop&auto=format';
    if (nomeLC.includes('shake') || nomeLC.includes('smoothie')) return 'https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?w=400&h=300&fit=crop&auto=format';
    if (nomeLC.includes('salmone') || nomeLC.includes('salmon')) return 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop&auto=format';
    if (nomeLC.includes('pollo') || nomeLC.includes('chicken')) return 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400&h=300&fit=crop&auto=format';
    if (nomeLC.includes('bowl')) return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&auto=format';
    if (nomeLC.includes('pancakes')) return 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&auto=format';
    if (nomeLC.includes('pasta')) return 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400&h=300&fit=crop&auto=format';
    if (nomeLC.includes('yogurt')) return 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop&auto=format';
    
    // Fallback per categoria
    const categoryImages = {
      'colazione': 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop&auto=format',
      'pranzo': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&auto=format',
      'cena': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop&auto=format',
      'spuntino': 'https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?w=400&h=300&fit=crop&auto=format'
    };
    
    return categoryImages[categoria] || categoryImages['pranzo'];
  }
}

// 🗃️ CLASSE DATABASE PRINCIPALE
export class RecipeDatabase {
  private static instance: RecipeDatabase;
  private recipes: Recipe[] = [];
  private favorites: Set<string> = new Set();

  private constructor() {
    this.initializeDatabase();
    this.loadFavorites();
  }

  public static getInstance(): RecipeDatabase {
    if (!RecipeDatabase.instance) {
      RecipeDatabase.instance = new RecipeDatabase();
    }
    return RecipeDatabase.instance;
  }

  // 🏗️ INIZIALIZZA DATABASE MASSICCIO
  private initializeDatabase(): void {
    console.log('🍳 [MASSIVE] Initializing MASSIVE Recipe Database (360+ recipes)...');
    
    const allRecipes: Recipe[] = [];
    
    // Genera tutte le categorie di ricette
    console.log('🥑 [MASSIVE] Generating 60 Keto recipes...');
    allRecipes.push(...MassiveRecipeGenerator.generateKetoRecipes());
    
    console.log('🥩 [MASSIVE] Generating 60 Low Carb recipes...');
    allRecipes.push(...MassiveRecipeGenerator.generateLowCarbRecipes());
    
    console.log('🏛️ [MASSIVE] Generating 60 Paleo recipes...');
    allRecipes.push(...MassiveRecipeGenerator.generatePaleoRecipes());
    
    console.log('🌱 [MASSIVE] Generating 60 Vegan recipes...');
    allRecipes.push(...MassiveRecipeGenerator.generateVeganRecipes());
    
    console.log('🌊 [MASSIVE] Generating 60 Mediterranean recipes...');
    allRecipes.push(...MassiveRecipeGenerator.generateMediterraneanRecipes());
    
    console.log('⚖️ [MASSIVE] Generating 60 Balanced recipes...');
    allRecipes.push(...MassiveRecipeGenerator.generateBalancedRecipes());
    
    console.log('🏋️‍♂️ [MASSIVE] Generating 60 Fit recipes...');
    allRecipes.push(...MassiveRecipeGenerator.generateFitRecipes());
    
    this.recipes = allRecipes;
    
    console.log(`✅ [MASSIVE] Database loaded: ${this.recipes.length} recipes`);
    console.log(`🎛️ [MASSIVE] Cuisines:`, [...new Set(this.recipes.map(r => r.tipoCucina))]);
    console.log(`🥗 [MASSIVE] Diets:`, [...new Set(this.recipes.flatMap(r => r.tipoDieta))]);
    
    // Test filtri
    this.testAllFilters();
  }

  // 🧪 TEST TUTTI I FILTRI
  private testAllFilters(): void {
    console.log('🧪 [MASSIVE] Testing all filters...');
    
    const diets = ['vegetariana', 'vegana', 'senza_glutine', 'keto', 'paleo', 'mediterranea', 'low_carb', 'chetogenica', 'bilanciata'];
    diets.forEach(diet => {
      const results = this.searchRecipes({ tipoDieta: [diet] });
      console.log(`🥗 [MASSIVE] Diet "${diet}": ${results.length} recipes`);
    });

    const cuisines = ['italiana', 'mediterranea', 'asiatica', 'americana', 'messicana', 'internazionale', 'ricette_fit'];
    cuisines.forEach(cuisine => {
      const results = this.searchRecipes({ tipoCucina: cuisine });
      console.log(`🍳 [MASSIVE] Cuisine "${cuisine}": ${results.length} recipes`);
    });
  }

  // 🔍 RICERCA RICETTE
  public searchRecipes(filters: {
    query?: string;
    categoria?: string;
    tipoCucina?: string;
    difficolta?: string;
    maxTempo?: number;
    tipoDieta?: string[];
    allergie?: string[];
  }): Recipe[] {
    let results = [...this.recipes];

    if (filters.query) {
      const query = filters.query.toLowerCase();
      results = results.filter(recipe => 
        recipe.nome.toLowerCase().includes(query) ||
        recipe.ingredienti.some(ing => ing.toLowerCase().includes(query))
      );
    }

    if (filters.categoria) {
      results = results.filter(recipe => recipe.categoria === filters.categoria);
    }

    if (filters.tipoCucina) {
      results = results.filter(recipe => recipe.tipoCucina === filters.tipoCucina);
    }

    if (filters.difficolta) {
      results = results.filter(recipe => recipe.difficolta === filters.difficolta);
    }

    if (filters.maxTempo) {
      results = results.filter(recipe => recipe.tempoPreparazione <= filters.maxTempo);
    }

    if (filters.tipoDieta && filters.tipoDieta.length > 0) {
      results = results.filter(recipe => 
        filters.tipoDieta!.some(diet => recipe.tipoDieta.includes(diet as any))
      );
    }

    if (filters.allergie && filters.allergie.length > 0) {
      results = results.filter(recipe => 
        !filters.allergie!.some(allergy => recipe.allergie.includes(allergy))
      );
    }

    console.log(`🔍 [MASSIVE] Search results: ${results.length} recipes`);
    return results;
  }

  // 📊 OPZIONI FILTRI
  public getFilterOptions() {
    return {
      categories: ['colazione', 'pranzo', 'cena', 'spuntino'],
      cuisines: ['italiana', 'mediterranea', 'asiatica', 'americana', 'messicana', 'internazionale', 'ricette_fit'],
      difficulties: ['facile', 'medio', 'difficile'],
      diets: ['vegetariana', 'vegana', 'senza_glutine', 'keto', 'paleo', 'mediterranea', 'low_carb', 'chetogenica', 'bilanciata'],
      allergies: ['latte', 'uova', 'frutta_secca', 'pesce', 'crostacei', 'glutine']
    };
  }

  // ❤️ GESTIONE PREFERITI
  public addToFavorites(recipeId: string): void {
    this.favorites.add(recipeId);
    this.saveFavorites();
  }

  public removeFromFavorites(recipeId: string): void {
    this.favorites.delete(recipeId);
    this.saveFavorites();
  }

  public getFavoriteRecipes(): Recipe[] {
    return this.recipes.filter(recipe => this.favorites.has(recipe.id));
  }

  public isFavorite(recipeId: string): boolean {
    return this.favorites.has(recipeId);
  }

  private saveFavorites(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('recipe_favorites', JSON.stringify([...this.favorites]));
    }
  }

  private loadFavorites(): void {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('recipe_favorites');
      if (saved) {
        this.favorites = new Set(JSON.parse(saved));
      }
    }
  }

  // 🎯 RICETTE RACCOMANDATE
  public getRecommendedRecipes(limit: number = 6): Recipe[] {
    return this.recipes
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, limit);
  }

  public getSeasonalRecipes(season: string, limit: number = 6): Recipe[] {
    return this.recipes
      .filter(recipe => recipe.stagione.includes(season as any) || recipe.stagione.includes('tutto_anno'))
      .slice(0, limit);
  }

  // 📈 STATISTICHE
  public getStats() {
    return {
      totalRecipes: this.recipes.length,
      favoriteCount: this.favorites.size,
      averageRating: this.recipes.reduce((acc, recipe) => acc + (recipe.rating || 0), 0) / this.recipes.length,
      categoriesCount: new Set(this.recipes.map(r => r.categoria)).size
    };
  }
}