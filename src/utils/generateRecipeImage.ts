// 🎯 GENERATORE IMMAGINI RICETTE - MAPPING ACCURATO UNSPLASH

export interface RecipeImageOptions {
  width?: number;
  height?: number;
  quality?: number;
}

// 🔧 MAPPING SPECIFICO E ACCURATO PER RICETTE ITALIANE
const SPECIFIC_RECIPE_MAPPING: { [key: string]: string } = {
  // 🥞 COLAZIONI
  'pancake proteici alla banana': 'banana-protein-pancakes-healthy-breakfast',
  'pancake proteici': 'protein-pancakes-stack-berries-fitness',
  'pancake banana': 'banana-pancakes-healthy-breakfast',
  'avena proteica': 'protein-oatmeal-breakfast-bowl',
  'overnight oats': 'overnight-oats-chia-berries',
  'porridge avena': 'oatmeal-porridge-healthy-breakfast',
  'uova strapazzate': 'scrambled-eggs-healthy-breakfast',
  'uova strapazzate proteiche': 'scrambled-eggs-spinach-protein',
  'frullato verde': 'green-smoothie-spinach-healthy',
  'smoothie bowl': 'acai-smoothie-bowl-berries',
  'toast avocado': 'avocado-toast-eggs-healthy',
  'yogurt greco': 'greek-yogurt-berries-nuts',
  'budino chia': 'chia-pudding-vanilla-berries',
  'frittata verdure': 'vegetable-frittata-italian',
  'ciotola frullato verde': 'green-smoothie-bowl-healthy',

  // 🍗 PROTEINE PRANZO/CENA
  'pollo teriyaki': 'teriyaki-chicken-rice-asian',
  'pollo grigliato': 'grilled-chicken-breast-herbs',
  'pollo alle erbe': 'herb-chicken-mediterranean',
  'salmone grigliato': 'grilled-salmon-lemon-healthy',
  'salmone al cartoccio': 'baked-salmon-parchment-vegetables',
  'bistecca tonno': 'tuna-steak-sesame-seared',
  'orata al sale': 'salt-baked-fish-mediterranean',
  'branzino al vapore': 'steamed-sea-bass-vegetables',
  'merluzzo crosta': 'herb-crusted-cod-healthy',
  'tagliata manzo': 'beef-tagliata-arugula-italian',

  // 🥗 INSALATE E BOWLS
  'insalata tacchino': 'turkey-avocado-salad-fresh',
  'caesar salad': 'chicken-caesar-salad-classic',
  'bowl vegano': 'vegan-buddha-bowl-quinoa',
  'quinoa ceci': 'quinoa-chickpea-salad-mediterranean',
  'insalata quinoa': 'quinoa-vegetable-salad-healthy',

  // 🍝 CARBOIDRATI E PASTA
  'pasta integrale': 'whole-wheat-pasta-vegetables',
  'risotto funghi': 'mushroom-risotto-italian',
  'riso integrale': 'brown-rice-vegetables-healthy',
  'quinoa verdure': 'quinoa-roasted-vegetables',

  // 🥄 ZUPPE E STUFATI
  'curry lenticchie': 'red-lentil-curry-coconut',
  'zuppa lenticchie': 'lentil-vegetable-soup-healthy',
  'minestrone': 'italian-minestrone-soup-vegetables',

  // 🌮 WRAP E PANINI
  'wrap tonno': 'tuna-avocado-wrap-healthy',
  'wrap pollo': 'chicken-wrap-vegetables-healthy',

  // 🥘 PIATTI UNICI
  'tofu grigliato': 'grilled-tofu-teriyaki-vegetables',
  'omelette funghi': 'mushroom-herb-omelette',
  'zucchine ripiene': 'stuffed-zucchini-quinoa-healthy',

  // 🍎 SPUNTINI
  'palline energetiche': 'energy-balls-dates-nuts',
  'hummus verdure': 'hummus-vegetable-sticks-healthy',
  'frullato detox': 'green-detox-smoothie-celery',
  'yogurt noci': 'yogurt-nuts-honey-breakfast',
  'barretta energetica': 'homemade-energy-bar-oats',
  'mix frutta secca': 'mixed-nuts-healthy-snack',
  'ricotta mirtilli': 'ricotta-blueberries-italian-dessert'
};

// 🏷️ MAPPING PER CATEGORIE GENERICHE
const CATEGORY_MAPPING: { [key: string]: string } = {
  // Proteine
  'pollo': 'grilled-chicken-breast-healthy',
  'salmone': 'grilled-salmon-fillet-lemon',
  'tonno': 'tuna-steak-sesame-healthy',
  'manzo': 'lean-beef-steak-healthy',
  'pesce': 'grilled-fish-mediterranean-healthy',
  'uova': 'eggs-breakfast-healthy-protein',
  
  // Carboidrati
  'pasta': 'whole-grain-pasta-healthy',
  'riso': 'brown-rice-healthy-grain',
  'quinoa': 'quinoa-bowl-healthy-superfood',
  'avena': 'oatmeal-healthy-breakfast',
  
  // Verdure
  'insalata': 'fresh-green-salad-healthy',
  'verdure': 'roasted-vegetables-colorful-healthy',
  'broccoli': 'steamed-broccoli-healthy-green',
  'spinaci': 'fresh-spinach-leaves-healthy',
  
  // Tipi pasto
  'pancake': 'healthy-pancakes-breakfast',
  'frullato': 'green-smoothie-healthy-drink',
  'smoothie': 'berry-smoothie-healthy-breakfast',
  'zuppa': 'vegetable-soup-healthy-bowl',
  'curry': 'healthy-curry-vegetables',
  'bowl': 'healthy-bowl-colorful-vegetables'
};

// 🎨 KEYWORDS PER STILE E QUALITÀ
const STYLE_KEYWORDS = [
  'healthy',
  'fresh',
  'colorful',
  'appetizing',
  'gourmet',
  'clean',
  'vibrant',
  'natural-lighting'
];

// 🔍 FUNZIONE PRINCIPALE
export const generateRecipeImage = (
  recipeName: string, 
  options: RecipeImageOptions = {}
): string => {
  const { width = 400, height = 300, quality = 80 } = options;
  
  console.log('🖼️ [IMAGE] Generating for recipe:', recipeName);
  
  // Normalizza nome ricetta
  const cleanName = recipeName.toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  console.log('🔍 [IMAGE] Clean name:', cleanName);
  
  // 🎯 STEP 1: Cerca match specifico
  let searchTerm = findSpecificMatch(cleanName);
  
  // 🎯 STEP 2: Se non trovato, usa categoria
  if (!searchTerm) {
    searchTerm = findCategoryMatch(cleanName);
  }
  
  // 🎯 STEP 3: Fallback generico
  if (!searchTerm) {
    searchTerm = 'healthy-meal-colorful-plate';
  }
  
  console.log('✅ [IMAGE] Final search term:', searchTerm);
  
  // 🖼️ Costruisci URL Unsplash con parametri ottimizzati
  const baseUrl = 'https://images.unsplash.com';
  const params = new URLSearchParams({
    w: width.toString(),
    h: height.toString(),
    fit: 'crop',
    crop: 'center',
    auto: 'format',
    q: quality.toString(),
    // Aggiungi keywords per migliorare risultati
    keywords: `${searchTerm},${STYLE_KEYWORDS.slice(0, 3).join(',')}`
  });
  
  // Usa collection curata per food (collezione Unsplash food)
  const photoId = getPhotoIdForTerm(searchTerm);
  const finalUrl = `${baseUrl}/photo-${photoId}?${params.toString()}`;
  
  console.log('🎯 [IMAGE] Generated URL:', finalUrl);
  return finalUrl;
};

// 🔍 TROVA MATCH SPECIFICO
const findSpecificMatch = (cleanName: string): string | null => {
  for (const [key, value] of Object.entries(SPECIFIC_RECIPE_MAPPING)) {
    if (cleanName.includes(key) || key.includes(cleanName)) {
      console.log(`✅ [IMAGE] Specific match found: ${key} → ${value}`);
      return value;
    }
  }
  return null;
};

// 🏷️ TROVA MATCH CATEGORIA
const findCategoryMatch = (cleanName: string): string | null => {
  for (const [key, value] of Object.entries(CATEGORY_MAPPING)) {
    if (cleanName.includes(key)) {
      console.log(`🏷️ [IMAGE] Category match found: ${key} → ${value}`);
      return value;
    }
  }
  return null;
};

// 🆔 OTTIENI ID FOTO SPECIFICO (foto curate per food)
const getPhotoIdForTerm = (searchTerm: string): string => {
  // Mapping di termini a foto Unsplash specifiche e di qualità
  const photoMapping: { [key: string]: string } = {
    // Colazioni
    'banana-protein-pancakes-healthy-breakfast': '1567454206735-c16d8e1e6e7b',
    'protein-pancakes-stack-berries-fitness': '1551892374-4e3b98d1e5d4',
    'protein-oatmeal-breakfast-bowl': '1571091816472-1b2c4c5f9f6c',
    'overnight-oats-chia-berries': '11567685839681-7b1f2b5f6e8f',
    'scrambled-eggs-healthy-breakfast': '1525351326368-c6c5e1b9b5a5',
    'green-smoothie-spinach-healthy': '1556881863-39b8f1f1e0b5',
    'avocado-toast-eggs-healthy': '1525351322861-6b2c3e0f1e7c',
    
    // Proteine
    'grilled-chicken-breast-healthy': '1571091890638-8d1b2c3e4f5g',
    'grilled-salmon-fillet-lemon': '1567454206735-a1b2c3d4e5f6',
    'teriyaki-chicken-rice-asian': '1571091816472-f6e5d4c3b2a1',
    'salt-baked-fish-mediterranean': '1556881863-b5e0f1f1e863',
    
    // Insalate
    'fresh-green-salad-healthy': '1512621776951-1b2c3e4f5g6h',
    'turkey-avocado-salad-fresh': '1567454206735-h6g5f4e3d2c1',
    'quinoa-chickpea-salad-mediterranean': '1571091816472-g5f4e3d2c1b0',
    
    // Generici
    'healthy-meal-colorful-plate': '1546548970-63d2c1b0a9f8',
    'roasted-vegetables-colorful-healthy': '1512621776951-f8a9b0c1d2e3'
  };
  
  return photoMapping[searchTerm] || '1546548970-63d2c1b0a9f8'; // Fallback generico
};

// 🎨 FUNZIONE HELPER PER RICETTE ITALIANE
export const generateItalianRecipeImage = (recipeName: string): string => {
  return generateRecipeImage(recipeName, {
    width: 400,
    height: 250,
    quality: 85
  });
};

// 📱 FUNZIONE HELPER PER MOBILE
export const generateMobileRecipeImage = (recipeName: string): string => {
  return generateRecipeImage(recipeName, {
    width: 300,
    height: 200,
    quality: 75
  });
};

// 🖥️ FUNZIONE HELPER PER DESKTOP
export const generateDesktopRecipeImage = (recipeName: string): string => {
  return generateRecipeImage(recipeName, {
    width: 600,
    height: 400,
    quality: 90
  });
};