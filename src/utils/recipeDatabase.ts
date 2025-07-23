// Database Ricette FITNESS - 40 Ricette Complete
export interface Recipe {
  id: string;
  nome: string;
  categoria: 'colazione' | 'pranzo' | 'cena' | 'spuntino';
  tipoCucina: 'italiana' | 'mediterranea' | 'asiatica' | 'americana' | 'messicana' | 'internazionale';
  difficolta: 'facile' | 'medio' | 'difficile';
  tempoPreparazione: number;
  porzioni: number;
  calorie: number;
  proteine: number;
  carboidrati: number;
  grassi: number;
  ingredienti: string[];
  preparazione: string;
  tipoDieta: ('vegetariana' | 'vegana' | 'senza_glutine' | 'keto' | 'paleo' | 'mediterranea' | 'proteica' | 'bilanciata-40-30-30')[];
  allergie: string[];
  stagione: ('primavera' | 'estate' | 'autunno' | 'inverno' | 'tutto_anno')[];
  tags: string[];
  imageUrl?: string;
  createdAt: Date;
  rating?: number;
  reviewCount?: number;
}

export class RecipeDatabase {
  private static instance: RecipeDatabase;
  private recipes: Recipe[] = [];
  private favorites: Set<string> = new Set();
  private recentlyViewed: Recipe[] = [];

  private constructor() {
    this.initializeDatabase();
    this.loadFavorites();
  }

  static getInstance(): RecipeDatabase {
    if (!RecipeDatabase.instance) {
      RecipeDatabase.instance = new RecipeDatabase();
    }
    return RecipeDatabase.instance;
  }

  private initializeDatabase(): void {
    this.recipes = [
      // COLAZIONI
      {
        id: 'col_001', nome: 'Pancake Proteici alla Banana e Avena', categoria: 'colazione', tipoCucina: 'americana',
        difficolta: 'facile', tempoPreparazione: 15, porzioni: 1, calorie: 385, proteine: 28, carboidrati: 45, grassi: 8,
        ingredienti: ['80g fiocchi avena', '1 banana matura', '30g proteine whey vaniglia', '2 albumi', '150ml latte scremato', 'cannella', 'olio cocco'],
        preparazione: 'Frulla avena fino a farina grossolana. Schiaccia banana, aggiungi proteine, albumi e latte. Incorpora avena e cannella. Cuoci in padella con olio cocco 2-3 min per lato.',
        tipoDieta: ['vegetariana', 'paleo', 'bilanciata-40-30-30'], allergie: ['glutine', 'latte', 'uova'], stagione: ['tutto_anno'], tags: ['proteico', 'fitness'],
        createdAt: new Date(), rating: 4.7, reviewCount: 156
      },
      {
        id: 'col_002', nome: 'Avena Proteica ai Frutti di Bosco - Overnight', categoria: 'colazione', tipoCucina: 'internazionale',
        difficolta: 'facile', tempoPreparazione: 5, porzioni: 1, calorie: 425, proteine: 25, carboidrati: 52, grassi: 12,
        ingredienti: ['60g fiocchi avena', '25g proteine whey frutti bosco', '200ml latte mandorla', 'semi chia', '100g mirtilli', '50g lamponi', 'miele', 'mandorle lamelle'],
        preparazione: 'Mescola avena con proteine e latte mandorla. Aggiungi chia, miele e metà frutti. Riponi in frigo 4+ ore. Guarnisci con frutti rimasti e mandorle.',
        tipoDieta: ['vegetariana', 'proteica'], allergie: ['frutta_secca'], stagione: ['estate'], tags: ['overnight', 'frutti_bosco'],
        createdAt: new Date(), rating: 4.8, reviewCount: 203
      },
      {
        id: 'col_003', nome: 'Uova Strapazzate Proteiche con Spinaci', categoria: 'colazione', tipoCucina: 'internazionale',
        difficolta: 'facile', tempoPreparazione: 10, porzioni: 1, calorie: 320, proteine: 26, carboidrati: 8, grassi: 20,
        ingredienti: ['3 uova intere', '2 albumi', '100g spinaci baby', '50g ricotta magra', 'olio extravergine', '50g pomodorini', 'erba cipollina'],
        preparazione: 'Salta spinaci in padella. Sbatti uova con albumi. Cuoci uova a fuoco basso mescolando. Aggiungi spinaci, ricotta e pomodorini. Guarnisci con erba cipollina.',
        tipoDieta: ['vegetariana', 'keto', 'proteica'], allergie: ['uova', 'latte'], stagione: ['tutto_anno'], tags: ['proteico', 'keto'],
        createdAt: new Date(), rating: 4.5, reviewCount: 128
      },
      {
        id: 'col_004', nome: 'Ciotola Frullato Verde Energizzante', categoria: 'colazione', tipoCucina: 'internazionale',
        difficolta: 'facile', tempoPreparazione: 8, porzioni: 1, calorie: 445, proteine: 22, carboidrati: 38, grassi: 24,
        ingredienti: ['1 banana congelata', '100g spinaci', '25g proteine vegetali vaniglia', '200ml latte cocco', 'burro mandorle', '1 kiwi', 'granola', 'semi zucca'],
        preparazione: 'Frulla banana, spinaci, proteine, latte cocco e burro mandorle. Versa in bowl. Guarnisci con kiwi a rondelle, granola e semi zucca.',
        tipoDieta: ['vegana', 'paleo'], allergie: ['frutta_secca'], stagione: ['tutto_anno'], tags: ['smoothie_bowl', 'verde'],
        createdAt: new Date(), rating: 4.6, reviewCount: 189
      },
      {
        id: 'col_005', nome: 'Porridge Proteico alla Cannella e Mela', categoria: 'colazione', tipoCucina: 'internazionale',
        difficolta: 'facile', tempoPreparazione: 15, porzioni: 1, calorie: 465, proteine: 30, carboidrati: 58, grassi: 12,
        ingredienti: ['70g fiocchi avena', '25g proteine caseine vaniglia', '300ml latte parzialmente scremato', '1 mela Golden', 'cannella', 'miele acacia', 'noci'],
        preparazione: 'Cuoci avena nel latte 5 min. Aggiungi mela a cubetti e cannella, cuoci 3 min. Raffredda 2 min, incorpora proteine. Dolcifica con miele, guarnisci con noci.',
        tipoDieta: ['vegetariana', 'bilanciata-40-30-30'], allergie: ['latte', 'frutta_secca'], stagione: ['autunno'], tags: ['porridge', 'comfort'],
        createdAt: new Date(), rating: 4.4, reviewCount: 142
      },
      {
        id: 'col_006', nome: 'Toast Integrale all\'Avocado Proteico', categoria: 'colazione', tipoCucina: 'americana',
        difficolta: 'facile', tempoPreparazione: 12, porzioni: 1, calorie: 485, proteine: 24, carboidrati: 35, grassi: 28,
        ingredienti: ['2 fette pane integrale', '1 avocado maturo', '2 uova', '100g ricotta magra', 'succo limone', 'paprika', 'rucola'],
        preparazione: 'Tosta pane. Schiaccia avocado con limone, sale e pepe. Cuoci uova in camicia. Spalma ricotta su pane, aggiungi avocado e uova. Guarnisci con rucola e paprika.',
        tipoDieta: ['vegetariana', 'paleo'], allergie: ['glutine', 'uova', 'latte'], stagione: ['tutto_anno'], tags: ['avocado_toast', 'trendy'],
        createdAt: new Date(), rating: 4.7, reviewCount: 167
      },
      {
        id: 'col_007', nome: 'Ciotola di Yogurt Greco Proteico', categoria: 'colazione', tipoCucina: 'mediterranea',
        difficolta: 'facile', tempoPreparazione: 5, porzioni: 1, calorie: 395, proteine: 35, carboidrati: 18, grassi: 20,
        ingredienti: ['200g yogurt greco 0%', '20g proteine whey neutro', '30g mandorle tostate', '15g semi girasole', '100g fragole', 'estratto vaniglia', 'stevia'],
        preparazione: 'Mescola yogurt con proteine e vaniglia. Dolcifica con stevia. Taglia fragole a fettine. Trita mandorle. Componi bowl con fragole, mandorle e semi girasole.',
        tipoDieta: ['vegetariana', 'keto', 'proteica'], allergie: ['latte', 'frutta_secca'], stagione: ['estate'], tags: ['yogurt_greco', 'fresh'],
        createdAt: new Date(), rating: 4.8, reviewCount: 234
      },
      {
        id: 'col_008', nome: 'Budino di Semi di Chia al Cioccolato Proteico', categoria: 'colazione', tipoCucina: 'internazionale',
        difficolta: 'facile', tempoPreparazione: 10, porzioni: 1, calorie: 420, proteine: 26, carboidrati: 12, grassi: 28,
        ingredienti: ['40g semi chia', '25g proteine cacao', '300ml latte mandorla', '15g cacao amaro', 'olio MCT', 'eritritolo', '50g lamponi', 'mandorle lamelle'],
        preparazione: 'Mescola chia con cacao e proteine. Aggiungi latte mandorla e olio MCT. Dolcifica con eritritolo. Riponi in frigo 6+ ore. Guarnisci con lamponi e mandorle.',
        tipoDieta: ['vegana', 'keto', 'paleo'], allergie: ['frutta_secca'], stagione: ['tutto_anno'], tags: ['chia_pudding', 'cioccolato'],
        createdAt: new Date(), rating: 4.5, reviewCount: 156
      },
      {
        id: 'col_009', nome: 'Frittata Proteica agli Spinaci', categoria: 'colazione', tipoCucina: 'italiana',
        difficolta: 'medio', tempoPreparazione: 18, porzioni: 1, calorie: 445, proteine: 32, carboidrati: 6, grassi: 32,
        ingredienti: ['4 uova biologiche', '150g spinaci', '100g prosciutto crudo', '50g parmigiano', 'olio extravergine', '1 scalogno', 'basilico'],
        preparazione: 'Rosola prosciutto e scalogno. Aggiungi spinaci e cuoci fino appassimento. Sbatti uova con parmigiano. Versa in padella, cuoci 3-4 min. Finisci in forno 8-10 min.',
        tipoDieta: ['keto', 'proteica'], allergie: ['uova', 'latte'], stagione: ['tutto_anno'], tags: ['frittata', 'italiana'],
        createdAt: new Date(), rating: 4.6, reviewCount: 198
      },
      {
        id: 'col_010', nome: 'Frullato Energetico Banana e Burro di Arachidi', categoria: 'colazione', tipoCucina: 'americana',
        difficolta: 'facile', tempoPreparazione: 5, porzioni: 1, calorie: 520, proteine: 35, carboidrati: 42, grassi: 22,
        ingredienti: ['1 banana matura', '30g proteine whey vaniglia', '250ml latte scremato', '2 cucchiai burro arachidi naturale', 'semi lino macinati', 'ghiaccio', 'miele', 'cannella'],
        preparazione: 'Frulla banana, latte, proteine, burro arachidi, semi lino e miele. Aggiungi ghiaccio e frulla. Versa in bicchiere e spolverizza con cannella.',
        tipoDieta: ['vegetariana', 'paleo', 'proteica'], allergie: ['latte', 'arachidi'], stagione: ['tutto_anno'], tags: ['power_smoothie', 'energizzante'],
        createdAt: new Date(), rating: 4.9, reviewCount: 289
      },

      // PRANZI
      {
        id: 'pra_001', nome: 'Ciotola di Pollo Teriyaki con Quinoa', categoria: 'pranzo', tipoCucina: 'asiatica',
        difficolta: 'medio', tempoPreparazione: 35, porzioni: 1, calorie: 485, proteine: 38, carboidrati: 45, grassi: 16,
        ingredienti: ['150g petto pollo', '80g quinoa tricolore', '100g edamame', '1 carota', '100g cavolo rosso', 'salsa teriyaki light', 'olio sesamo', 'zenzero', 'semi sesamo'],
        preparazione: 'Cuoci quinoa 15 min. Marina pollo con teriyaki e zenzero. Prepara verdure a julienne. Cuoci pollo in wok con olio sesamo 6-8 min. Assembla bowl con tutti ingredienti.',
        tipoDieta: ['senza_glutine', 'bilanciata-40-30-30'], allergie: ['soia', 'sesamo'], stagione: ['tutto_anno'], tags: ['bowl', 'asiatico'],
        createdAt: new Date(), rating: 4.7, reviewCount: 156
      },
      {
        id: 'pra_002', nome: 'Salmone Grigliato con Verdure Mediterranee', categoria: 'pranzo', tipoCucina: 'mediterranea',
        difficolta: 'medio', tempoPreparazione: 30, porzioni: 1, calorie: 520, proteine: 35, carboidrati: 42, grassi: 24,
        ingredienti: ['150g filetto salmone', '1 zucchina', '1 melanzana piccola', '100g pomodorini', '80g riso integrale', 'olio extravergine', 'limone', 'origano', 'timo'],
        preparazione: 'Cuoci riso integrale 20 min. Taglia verdure a rondelle, condisci con olio e origano. Griglia verdure 4-5 min per lato. Griglia salmone 4 min per lato. Componi piatto.',
        tipoDieta: ['mediterranea', 'paleo', 'proteica'], allergie: ['pesce'], stagione: ['estate'], tags: ['salmone', 'grigliato'],
        createdAt: new Date(), rating: 4.8, reviewCount: 203
      },
      {
        id: 'pra_003', nome: 'Insalata di Tacchino e Avocado', categoria: 'pranzo', tipoCucina: 'americana',
        difficolta: 'facile', tempoPreparazione: 15, porzioni: 1, calorie: 425, proteine: 32, carboidrati: 12, grassi: 28,
        ingredienti: ['120g tacchino arrosto', '1 avocado', '150g mix insalate', '100g pomodorini datterini', '50g cetrioli', '30g parmigiano scaglie', 'olio extravergine', 'aceto balsamico'],
        preparazione: 'Lava e asciuga insalate. Taglia tacchino a listarelle, avocado a fette. Dimezza pomodorini, taglia cetrioli. Prepara vinaigrette. Assembla insalata e condisci.',
        tipoDieta: ['keto', 'paleo', 'proteica'], allergie: ['latte'], stagione: ['tutto_anno'], tags: ['insalata', 'fresh'],
        createdAt: new Date(), rating: 4.5, reviewCount: 134
      },
      {
        id: 'pra_004', nome: 'Curry di Lenticchie Rosse Proteico', categoria: 'pranzo', tipoCucina: 'asiatica',
        difficolta: 'medio', tempoPreparazione: 35, porzioni: 1, calorie: 465, proteine: 28, carboidrati: 48, grassi: 16,
        ingredienti: ['120g lenticchie rosse', '25g proteine vegetali', '200ml latte cocco', '1 cipolla', '2 spicchi aglio', 'pasta curry', 'curcuma', '200g spinaci', 'coriandolo'],
        preparazione: 'Soffriggi cipolla e aglio. Aggiungi curry e curcuma. Incorpora lenticchie, latte cocco e acqua. Cuoci 15-18 min. Aggiungi proteine e spinaci. Guarnisci con coriandolo.',
        tipoDieta: ['vegana'], allergie: [], stagione: ['inverno'], tags: ['curry', 'speziato'],
        createdAt: new Date(), rating: 4.6, reviewCount: 178
      },
      {
        id: 'pra_005', nome: 'Tagliata di Manzo con Rucola', categoria: 'pranzo', tipoCucina: 'italiana',
        difficolta: 'medio', tempoPreparazione: 25, porzioni: 1, calorie: 440, proteine: 38, carboidrati: 8, grassi: 28,
        ingredienti: ['150g controfiletto manzo', '100g rucola selvatica', '100g pomodorini pachino', '50g grana scaglie', 'olio extravergine', 'aceto balsamico', 'rosmarino'],
        preparazione: 'Porta carne a temperatura ambiente. Condisci con sale, pepe e rosmarino. Cuoci in piastra 2-3 min per lato. Riposa 5 min. Taglia a fette. Servi su rucola con pomodorini e grana.',
        tipoDieta: ['keto'], allergie: ['latte'], stagione: ['tutto_anno'], tags: ['tagliata', 'gourmet'],
        createdAt: new Date(), rating: 4.7, reviewCount: 189
      },
      {
        id: 'pra_006', nome: 'Wrap Proteico al Tonno e Avocado', categoria: 'pranzo', tipoCucina: 'americana',
        difficolta: 'facile', tempoPreparazione: 12, porzioni: 1, calorie: 395, proteine: 35, carboidrati: 28, grassi: 16,
        ingredienti: ['1 tortilla integrale', '150g tonno naturale', '1/2 avocado', '50g yogurt greco 0%', '1 carota grattugiata', 'lattuga iceberg', 'succo limone', 'paprika'],
        preparazione: 'Sminuzza tonno e mescola con yogurt. Schiaccia avocado con limone. Scalda tortilla. Spalma avocado, aggiungi lattuga, tonno e carota. Arrotola stretto e taglia a metà.',
        tipoDieta: ['mediterranea'], allergie: ['glutine', 'pesce'], stagione: ['tutto_anno'], tags: ['wrap', 'portatile'],
        createdAt: new Date(), rating: 4.4, reviewCount: 145
      },
      {
        id: 'pra_007', nome: 'Risotto Proteico ai Funghi Porcini', categoria: 'pranzo', tipoCucina: 'italiana',
        difficolta: 'difficile', tempoPreparazione: 35, porzioni: 1, calorie: 485, proteine: 26, carboidrati: 52, grassi: 18,
        ingredienti: ['80g riso Arborio', '25g proteine caseine', '200g funghi porcini', '500ml brodo vegetale', '1 scalogno', 'vino bianco', '30g parmigiano', 'prezzemolo'],
        preparazione: 'Pulisci e affetta funghi. Soffriggi scalogno e funghi. Tosta riso 2 min. Sfuma con vino. Aggiungi brodo caldo a mestoli. Cuoci 16-18 min. Manteca con proteine e parmigiano.',
        tipoDieta: ['vegetariana'], allergie: ['latte'], stagione: ['autunno'], tags: ['risotto', 'gourmet'],
        createdAt: new Date(), rating: 4.8, reviewCount: 167
      },
      {
        id: 'pra_008', nome: 'Insalata Caesar Proteica con Pollo', categoria: 'pranzo', tipoCucina: 'americana',
        difficolta: 'medio', tempoPreparazione: 25, porzioni: 1, calorie: 385, proteine: 42, carboidrati: 8, grassi: 20,
        ingredienti: ['150g petto pollo', '200g lattuga romana', '30g parmigiano', '2 cucchiai yogurt greco', 'senape Digione', '1 spicchio aglio', 'succo limone', 'olio extravergine'],
        preparazione: 'Marina e cuoci pollo 6-7 min per lato. Prepara salsa Caesar con yogurt, senape, aglio e limone. Taglia lattuga a listarelle. Condisci lattuga, aggiungi pollo a strisce e parmigiano.',
        tipoDieta: ['keto'], allergie: ['latte'], stagione: ['tutto_anno'], tags: ['caesar_salad', 'classica'],
        createdAt: new Date(), rating: 4.6, reviewCount: 198
      },
      {
        id: 'pra_009', nome: 'Ciotola Vegana di Ceci e Tahina', categoria: 'pranzo', tipoCucina: 'mediorientale',
        difficolta: 'facile', tempoPreparazione: 20, porzioni: 1, calorie: 465, proteine: 22, carboidrati: 54, grassi: 18,
        ingredienti: ['150g ceci lessati', '80g quinoa cotta', '100g carote baby', '100g cetrioli', '50g hummus tahina', '2 cucchiai tahina pura', 'succo limone', 'paprika', 'menta', 'semi zucca'],
        preparazione: 'Prepara verdure a bastoncini. Prepara salsa tahina con limone e acqua. Assembla bowl con quinoa, ceci, verdure e hummus. Irrora con salsa tahina, spolverizza paprika e semi.',
        tipoDieta: ['vegana'], allergie: ['sesamo'], stagione: ['tutto_anno'], tags: ['bowl', 'mediorientale'],
        createdAt: new Date(), rating: 4.5, reviewCount: 156
      },
      {
        id: 'pra_010', nome: 'Orata al Sale con Verdure Grigliate', categoria: 'pranzo', tipoCucina: 'mediterranea',
        difficolta: 'difficile', tempoPreparazione: 40, porzioni: 1, calorie: 425, proteine: 35, carboidrati: 15, grassi: 26,
        ingredienti: ['1 orata 300g', '500g sale grosso', '2 albumi', '1 zucchina', '1 peperone rosso', '1 melanzana', 'rosmarino', 'timo', 'olio extravergine', 'limone'],
        preparazione: 'Riempi orata con erbe. Mescola sale con albumi. Avvolgi orata nel sale. Cuoci in forno 25-30 min. Griglia verdure condite. Rompi crosta sale e filetta pesce. Servi con verdure.',
        tipoDieta: ['mediterranea'], allergie: ['pesce', 'uova'], stagione: ['tutto_anno'], tags: ['orata', 'tecnica_avanzata'],
        createdAt: new Date(), rating: 4.9, reviewCount: 234
      },

      // SPUNTINI
      {
        id: 'spu_001', nome: 'Palline Energetiche Proteiche al Cioccolato', categoria: 'spuntino', tipoCucina: 'internazionale',
        difficolta: 'facile', tempoPreparazione: 15, porzioni: 8, calorie: 85, proteine: 4, carboidrati: 12, grassi: 3,
        ingredienti: ['100g datteri Medjoul', '30g proteine whey cioccolato', '40g mandorle tostate', '20g cacao amaro', 'burro mandorle', 'olio cocco', 'cocco rapé'],
        preparazione: 'Ammolla datteri 10 min. Frulla datteri, proteine, mandorle e cacao. Aggiungi burro mandorle e olio cocco. Forma palline e rotola nel cocco. Riponi in frigo 30 min.',
        tipoDieta: ['vegetariana'], allergie: ['frutta_secca'], stagione: ['tutto_anno'], tags: ['energy_balls', 'portatile'],
        createdAt: new Date(), rating: 4.7, reviewCount: 189
      },
      {
        id: 'spu_002', nome: 'Hummus Proteico con Verdure Crude', categoria: 'spuntino', tipoCucina: 'mediorientale',
        difficolta: 'facile', tempoPreparazione: 10, porzioni: 4, calorie: 95, proteine: 6, carboidrati: 8, grassi: 4,
        ingredienti: ['150g ceci lessati', '20g proteine vegetali', '2 cucchiai tahina', 'succo limone', '1 spicchio aglio', 'acqua cottura ceci', 'carote', 'cetrioli', 'paprika'],
        preparazione: 'Frulla ceci, aglio e tahina. Aggiungi limone e proteine. Diluisci con acqua cottura fino consistenza cremosa. Servi con bastoncini verdure crude. Spolverizza con paprika.',
        tipoDieta: ['vegana'], allergie: ['sesamo'], stagione: ['tutto_anno'], tags: ['hummus', 'dip'],
        createdAt: new Date(), rating: 4.4, reviewCount: 134
      },
      {
        id: 'spu_003', nome: 'Frullato Proteico Verde Detox', categoria: 'spuntino', tipoCucina: 'internazionale',
        difficolta: 'facile', tempoPreparazione: 5, porzioni: 1, calorie: 185, proteine: 22, carboidrati: 8, grassi: 8,
        ingredienti: ['25g proteine whey vaniglia', '100g spinaci baby', '1/2 avocado piccolo', '200ml acqua cocco', 'succo limone', 'zenzero fresco', 'ghiaccio', 'stevia'],
        preparazione: 'Frulla tutti ingredienti ad alta velocità 60 sec. Aggiungi ghiaccio e frulla 30 sec. Dolcifica con stevia se necessario. Consuma immediatamente.',
        tipoDieta: ['vegetariana', 'keto'], allergie: ['latte'], stagione: ['tutto_anno'], tags: ['smoothie', 'detox'],
        createdAt: new Date(), rating: 4.3, reviewCount: 98
      },
      {
        id: 'spu_004', nome: 'Yogurt Greco con Noci e Miele', categoria: 'spuntino', tipoCucina: 'mediterranea',
        difficolta: 'facile', tempoPreparazione: 3, porzioni: 1, calorie: 265, proteine: 20, carboidrati: 22, grassi: 12,
        ingredienti: ['150g yogurt greco 0%', '30g noci sgusciate', '1 cucchiaio miele millefiori', 'cannella', '15g semi girasole', 'buccia arancia', 'menta'],
        preparazione: 'Versa yogurt in ciotola. Trita noci grossolanamente. Irrora con miele. Completa con noci, semi girasole, buccia arancia e cannella. Guarnisci con menta.',
        tipoDieta: ['vegetariana'], allergie: ['latte', 'frutta_secca'], stagione: ['tutto_anno'], tags: ['yogurt', 'mediterraneo'],
        createdAt: new Date(), rating: 4.6, reviewCount: 167
      },
      {
        id: 'spu_005', nome: 'Barretta Energetica Fatta Casa', categoria: 'spuntino', tipoCucina: 'internazionale',
        difficolta: 'medio', tempoPreparazione: 20, porzioni: 8, calorie: 145, proteine: 6, carboidrati: 18, grassi: 6,
        ingredienti: ['50g mandorle crude', '30g nocciole crude', '80g datteri Medjoul', '20g semi girasole', '15g semi zucca', 'burro mandorle', 'estratto vaniglia'],
        preparazione: 'Tosta frutta secca 8-10 min. Frulla datteri fino pasta densa. Mescola tutto, impasta bene. Stendi tra carta forno spessore 1,5cm. Refrigera 2 ore. Taglia a barrette.',
        tipoDieta: ['vegana'], allergie: ['frutta_secca'], stagione: ['tutto_anno'], tags: ['barretta', 'homemade'],
        createdAt: new Date(), rating: 4.5, reviewCount: 145
      },
      {
        id: 'spu_006', nome: 'Frullato Post-Allenamento Banana e Avena', categoria: 'spuntino', tipoCucina: 'americana',
        difficolta: 'facile', tempoPreparazione: 5, porzioni: 1, calorie: 385, proteine: 28, carboidrati: 35, grassi: 14,
        ingredienti: ['30g proteine whey vaniglia', '1 banana matura', '30g fiocchi avena', '250ml latte mandorla', 'burro arachidi naturale', 'creatina', 'cannella', 'ghiaccio'],
        preparazione: 'Ammolla avena in latte 2 min. Aggiungi banana, proteine, burro arachidi e creatina. Frulla 90 sec. Aggiungi ghiaccio e frulla 30 sec. Consuma entro 30 min da workout.',
        tipoDieta: ['vegetariana'], allergie: ['arachidi', 'latte'], stagione: ['tutto_anno'], tags: ['post_workout', 'recovery'],
        createdAt: new Date(), rating: 4.8, reviewCount: 223
      },
      {
        id: 'spu_007', nome: 'Toast all\'Avocado con Uovo Sodo', categoria: 'spuntino', tipoCucina: 'americana',
        difficolta: 'facile', tempoPreparazione: 12, porzioni: 1, calorie: 255, proteine: 12, carboidrati: 18, grassi: 16,
        ingredienti: ['1 fetta pane integrale', '1/2 avocado', '1 uovo fresco', 'succo limone', 'sale', 'pepe', 'paprika affumicata', 'semi sesamo', 'erba cipollina'],
        preparazione: 'Cuoci uovo sodo 8 min. Tosta pane. Schiaccia avocado con limone, sale e pepe. Spalma avocado su pane. Taglia uovo a rondelle. Completa con paprika, sesamo ed erba cipollina.',
        tipoDieta: ['vegetariana'], allergie: ['glutine', 'uova'], stagione: ['tutto_anno'], tags: ['toast', 'saziante'],
        createdAt: new Date(), rating: 4.4, reviewCount: 156
      },
      {
        id: 'spu_008', nome: 'Mix di Frutta Secca e Semi', categoria: 'spuntino', tipoCucina: 'internazionale',
        difficolta: 'facile', tempoPreparazione: 8, porzioni: 5, calorie: 165, proteine: 6, carboidrati: 4, grassi: 14,
        ingredienti: ['20g mandorle crude', '15g noci Brasile', '15g nocciole tostate', '10g semi zucca', '10g semi girasole', '5g semi lino', 'sale marino', 'paprika dolce'],
        preparazione: 'Tosta mandorle e nocciole 3-4 min se necessario. Tosta semi zucca e girasole 2-3 min. Mescola tutto con sale e paprika. Conserva in contenitore ermetico max 5 giorni.',
        tipoDieta: ['vegana', 'keto'], allergie: ['frutta_secca'], stagione: ['tutto_anno'], tags: ['trail_mix', 'energizzante'],
        createdAt: new Date(), rating: 4.2, reviewCount: 89
      },
      {
        id: 'spu_009', nome: 'Ricotta con Mirtilli e Cannella', categoria: 'spuntino', tipoCucina: 'italiana',
        difficolta: 'facile', tempoPreparazione: 5, porzioni: 1, calorie: 225, proteine: 16, carboidrati: 20, grassi: 8,
        ingredienti: ['120g ricotta fresca', '100g mirtilli freschi', '1 cucchiaino miele', 'cannella Ceylon', '15g mandorle lamelle', 'buccia limone', 'menta'],
        preparazione: 'Lavora ricotta con miele e cannella. Lava mirtilli. Disponi ricotta in bowl, aggiungi mirtilli e mandorle. Completa con buccia limone, cannella e menta.',
        tipoDieta: ['vegetariana'], allergie: ['latte', 'frutta_secca'], stagione: ['estate'], tags: ['ricotta', 'antiossidanti'],
        createdAt: new Date(), rating: 4.6, reviewCount: 134
      },
      {
        id: 'spu_010', nome: 'Chips di Verdure al Forno', categoria: 'spuntino', tipoCucina: 'internazionale',
        difficolta: 'medio', tempoPreparazione: 45, porzioni: 4, calorie: 75, proteine: 2, carboidrati: 12, grassi: 3,
        ingredienti: ['1 barbabietola', '2 carote grandi', '1 zucchina', 'olio extravergine', 'sale marino', 'paprika dolce', 'curcuma', 'rosmarino secco'],
        preparazione: 'Preriscalda forno 180°C. Taglia verdure a fette sottilissime 2mm. Immergile in acqua 10 min. Asciuga bene. Condisci con olio e spezie. Cuoci 25-30 min girando a metà.',
        tipoDieta: ['vegana'], allergie: [], stagione: ['tutto_anno'], tags: ['chips', 'croccante'],
        createdAt: new Date(), rating: 4.3, reviewCount: 112
      },

      // CENE
      {
        id: 'cen_001', nome: 'Filetto di Branzino con Verdure al Vapore', categoria: 'cena', tipoCucina: 'mediterranea',
        difficolta: 'medio', tempoPreparazione: 25, porzioni: 1, calorie: 325, proteine: 28, carboidrati: 18, grassi: 16,
        ingredienti: ['150g filetto branzino', '200g broccoli', '150g zucchine', '100g carote baby', 'olio extravergine', 'succo limone', '2 spicchi aglio', 'timo'],
        preparazione: 'Cuoci verdure al vapore 12-15 min. Condisci branzino con sale, pepe e timo. Cuoci in padella 4 min per lato. Condisci verdure con olio, aglio e limone. Componi piatto.',
        tipoDieta: ['mediterranea'], allergie: ['pesce'], stagione: ['tutto_anno'], tags: ['branzino', 'light'],
        createdAt: new Date(), rating: 4.7, reviewCount: 178
      },
      {
        id: 'cen_002', nome: 'Tofu Grigliato con Verdure Asiatiche', categoria: 'cena', tipoCucina: 'asiatica',
        difficolta: 'medio', tempoPreparazione: 25, porzioni: 1, calorie: 285, proteine: 22, carboidrati: 15, grassi: 16,
        ingredienti: ['150g tofu compatto', '100g pak choi', '100g germogli soia', '1 peperone rosso', 'salsa soia light', 'olio sesamo', 'zenzero', 'aglio', 'semi sesamo'],
        preparazione: 'Pressa tofu 15 min. Marina con salsa soia. Griglia tofu 3 min per lato. Salta verdure in wok con olio sesamo, aglio e zenzero 4-5 min. Completa con semi sesamo.',
        tipoDieta: ['vegana'], allergie: ['soia', 'sesamo'], stagione: ['tutto_anno'], tags: ['tofu', 'asiatico'],
        createdAt: new Date(), rating: 4.4, reviewCount: 134
      },
      {
        id: 'cen_003', nome: 'Petto di Pollo alle Erbe con Spinaci', categoria: 'cena', tipoCucina: 'mediterranea',
        difficolta: 'facile', tempoPreparazione: 20, porzioni: 1, calorie: 315, proteine: 35, carboidrati: 8, grassi: 16,
        ingredienti: ['150g petto pollo', '200g spinaci freschi', '50g ricotta light', 'olio extravergine', 'origano', 'rosmarino', '2 spicchi aglio', 'pomodorini'],
        preparazione: 'Batti pollo per uniformare spessore. Condisci con erbe e spezie. Cuoci 6-7 min per lato. Salta aglio e pomodorini, aggiungi spinaci. Incorpora ricotta. Servi pollo su spinaci.',
        tipoDieta: ['mediterranea'], allergie: ['latte'], stagione: ['tutto_anno'], tags: ['pollo', 'protein_rich'],
        createdAt: new Date(), rating: 4.6, reviewCount: 189
      },
      {
        id: 'cen_004', nome: 'Salmone in Cartoccio con Verdure', categoria: 'cena', tipoCucina: 'mediterranea',
        difficolta: 'medio', tempoPreparazione: 30, porzioni: 1, calorie: 365, proteine: 32, carboidrati: 12, grassi: 22,
        ingredienti: ['150g filetto salmone', '1 zucchina', '100g asparagi', '100g pomodorini', 'olio extravergine', 'succo limone', 'aneto fresco', 'carta forno'],
        preparazione: 'Taglia verdure e condisci con olio. Disponi su carta forno. Adagia salmone condito con limone e aneto. Chiudi cartoccio sigillando bene. Cuoci in forno 200°C per 18-20 min.',
        tipoDieta: ['mediterranea'], allergie: ['pesce'], stagione: ['primavera'], tags: ['salmone', 'cartoccio'],
        createdAt: new Date(), rating: 4.8, reviewCount: 203
      },
      {
        id: 'cen_005', nome: 'Zuppa di Lenticchie e Verdure', categoria: 'cena', tipoCucina: 'mediterranea',
        difficolta: 'facile', tempoPreparazione: 35, porzioni: 1, calorie: 285, proteine: 18, carboidrati: 38, grassi: 8,
        ingredienti: ['100g lenticchie rosse', '1 carota', '1 costa sedano', '1 cipolla piccola', '500ml brodo vegetale', '100g spinaci', 'olio extravergine', 'curcuma'],
        preparazione: 'Trita verdure finemente. Soffriggi in olio 5 min. Aggiungi lenticchie e curcuma. Versa brodo e cuoci 15 min. Aggiungi spinaci ultimi 3 min. Aggiusta di sale e pepe.',
        tipoDieta: ['vegana'], allergie: [], stagione: ['inverno'], tags: ['zuppa', 'comfort_food'],
        createdAt: new Date(), rating: 4.3, reviewCount: 156
      },
      {
        id: 'cen_006', nome: 'Omelette Proteica ai Funghi', categoria: 'cena', tipoCucina: 'francese',
        difficolta: 'medio', tempoPreparazione: 15, porzioni: 1, calorie: 385, proteine: 28, carboidrati: 6, grassi: 28,
        ingredienti: ['3 uova intere', '2 albumi', '150g funghi misti', '50g formaggio spalmabile light', 'olio extravergine', '1 scalogno', 'prezzemolo', 'erba cipollina'],
        preparazione: 'Affetta funghi e scalogno. Salta in padella 6-8 min. Sbatti uova con albumi. Cuoci omelette a fuoco medio-basso. Riempi con funghi e formaggio. Piega a metà e guarnisci.',
        tipoDieta: ['vegetariana', 'keto'], allergie: ['uova', 'latte'], stagione: ['tutto_anno'], tags: ['omelette', 'cremosa'],
        createdAt: new Date(), rating: 4.5, reviewCount: 167
      },
      {
        id: 'cen_007', nome: 'Merluzzo in Crosta di Erbe', categoria: 'cena', tipoCucina: 'mediterranea',
        difficolta: 'medio', tempoPreparazione: 25, porzioni: 1, calorie: 295, proteine: 32, carboidrati: 18, grassi: 12,
        ingredienti: ['150g filetto merluzzo', '30g pangrattato integrale', 'olio extravergine', '1 spicchio aglio', 'prezzemolo', 'basilico', 'timo', 'succo limone', '200g fagiolini', 'pomodorini'],
        preparazione: 'Mescola pangrattato con erbe, aglio e olio. Pressa su merluzzo condito con limone. Cuoci in forno 190°C per 12-15 min. Sbollenta fagiolini, salta con pomodorini. Servi insieme.',
        tipoDieta: ['mediterranea'], allergie: ['pesce', 'glutine'], stagione: ['tutto_anno'], tags: ['merluzzo', 'crosta_erbe'],
        createdAt: new Date(), rating: 4.6, reviewCount: 143
      },
      {
        id: 'cen_008', nome: 'Insalata Proteica di Quinoa e Ceci', categoria: 'cena', tipoCucina: 'internazionale',
        difficolta: 'facile', tempoPreparazione: 20, porzioni: 1, calorie: 425, proteine: 16, carboidrati: 48, grassi: 18,
        ingredienti: ['80g quinoa', '150g ceci lessati', '100g cetrioli', '100g pomodorini', '50g olive taggiasche', 'olio extravergine', 'aceto mele', 'menta', 'basilico'],
        preparazione: 'Cuoci quinoa 12-15 min e raffredda. Taglia verdure a dadini. Mescola quinoa con ceci, verdure e olive. Prepara vinaigrette con olio e aceto. Condisci e aggiungi erbe fresche.',
        tipoDieta: ['vegana'], allergie: [], stagione: ['tutto_anno'], tags: ['quinoa', 'fresh'],
        createdAt: new Date(), rating: 4.4, reviewCount: 189
      },
      {
        id: 'cen_009', nome: 'Bistecca di Tonno con Ratatouille', categoria: 'cena', tipoCucina: 'mediterranea',
        difficolta: 'medio', tempoPreparazione: 30, porzioni: 1, calorie: 385, proteine: 35, carboidrati: 20, grassi: 18,
        ingredienti: ['150g bistecca tonno', '1 melanzana piccola', '1 zucchina', '1 peperone rosso', '200g pomodorini', '1 cipolla', 'olio extravergine', 'timo', 'origano'],
        preparazione: 'Taglia verdure a cubetti uniformi. Soffriggi cipolla, aggiungi verdure in sequenza. Cuoci ratatouille 15 min. Griglia tonno 2 min per lato per cottura al sangue. Servi insieme.',
        tipoDieta: ['mediterranea'], allergie: ['pesce'], stagione: ['estate'], tags: ['tonno', 'provenzale'],
        createdAt: new Date(), rating: 4.7, reviewCount: 198
      },
      {
        id: 'cen_010', nome: 'Zucchine Ripiene Proteiche', categoria: 'cena', tipoCucina: 'italiana',
        difficolta: 'medio', tempoPreparazione: 35, porzioni: 1, calorie: 345, proteine: 28, carboidrati: 22, grassi: 16,
        ingredienti: ['2 zucchine grandi', '100g tacchino macinato', '30g quinoa', '50g ricotta magra', '1 uovo', '30g parmigiano', '1 spicchio aglio', 'basilico'],
        preparazione: 'Svuota zucchine creando barchette. Pre-cuoci in forno 10 min. Cuoci quinoa. Rosola tacchino con aglio e polpa zucchine. Mescola con quinoa, ricotta, uovo e parmigiano. Riempi zucchine e cuoci 18-20 min.',
        tipoDieta: ['mediterranea'], allergie: ['uova', 'latte'], stagione: ['estate'], tags: ['zucchine_ripiene', 'family_style'],
        createdAt: new Date(), rating: 4.5, reviewCount: 156
      }
    ];

    console.log(`✅ Database inizializzato con ${this.recipes.length} ricette complete`);
  }

  // METODI RICERCA E FILTRI
  searchRecipes(filters: {
    query?: string;
    categoria?: string;
    tipoCucina?: string;
    difficolta?: string;
    maxTempo?: number;
    maxCalorie?: number;
    tipoDieta?: string[];
    allergie?: string[];
    tags?: string[];
    rating?: number;
  } = {}): Recipe[] {
    return this.recipes.filter(recipe => {
      if (filters.query) {
        const query = filters.query.toLowerCase();
        if (!recipe.nome.toLowerCase().includes(query) &&
            !recipe.ingredienti.some(ing => ing.toLowerCase().includes(query)) &&
            !recipe.tags.some(tag => tag.toLowerCase().includes(query))) {
          return false;
        }
      }

      if (filters.categoria && recipe.categoria !== filters.categoria) return false;
      if (filters.tipoCucina && recipe.tipoCucina !== filters.tipoCucina) return false;
      if (filters.difficolta && recipe.difficolta !== filters.difficolta) return false;
      if (filters.maxTempo && recipe.tempoPreparazione > filters.maxTempo) return false;
      if (filters.maxCalorie && recipe.calorie > filters.maxCalorie) return false;
      if (filters.rating && recipe.rating && recipe.rating < filters.rating) return false;

      if (filters.tipoDieta && filters.tipoDieta.length > 0) {
        if (!filters.tipoDieta.some(diet => recipe.tipoDieta.includes(diet as any))) return false;
      }

      if (filters.allergie && filters.allergie.length > 0) {
        if (filters.allergie.some(allergia => recipe.allergie.includes(allergia))) return false;
      }

      if (filters.tags && filters.tags.length > 0) {
        if (!filters.tags.some(tag => recipe.tags.includes(tag))) return false;
      }

      return true;
    });
  }

  getRecipeById(id: string): Recipe | undefined {
    return this.recipes.find(recipe => recipe.id === id);
  }

  getRecipesByCategory(categoria: string): Recipe[] {
    return this.recipes.filter(recipe => recipe.categoria === categoria);
  }

  getRecommendedRecipes(limit: number = 10): Recipe[] {
    return this.recipes
      .filter(recipe => recipe.rating && recipe.rating >= 4.5)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, limit);
  }

  getSeasonalRecipes(season: string): Recipe[] {
    return this.recipes.filter(recipe => 
      recipe.stagione.includes(season as any) || 
      recipe.stagione.includes('tutto_anno')
    );
  }

  // GESTIONE PREFERITI
  addToFavorites(recipeId: string): void {
    this.favorites.add(recipeId);
    this.saveFavorites();
  }

  removeFromFavorites(recipeId: string): void {
    this.favorites.delete(recipeId);
    this.saveFavorites();
  }

  isFavorite(recipeId: string): boolean {
    return this.favorites.has(recipeId);
  }

  getFavoriteRecipes(): Recipe[] {
    return Array.from(this.favorites)
      .map(id => this.getRecipeById(id))
      .filter(recipe => recipe !== undefined) as Recipe[];
  }

  private saveFavorites(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('recipe_favorites', JSON.stringify(Array.from(this.favorites)));
    }
  }

  private loadFavorites(): void {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('recipe_favorites');
        if (saved) {
          this.favorites = new Set(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    }
  }

  // GESTIONE CRONOLOGIA
  addToRecentlyViewed(recipe: Recipe): void {
    this.recentlyViewed = this.recentlyViewed.filter(r => r.id !== recipe.id);
    this.recentlyViewed.unshift(recipe);
    this.recentlyViewed = this.recentlyViewed.slice(0, 10);
  }

  getRecentlyViewed(): Recipe[] {
    return this.recentlyViewed;
  }

  // RICETTE SIMILI
  getSimilarRecipes(recipe: Recipe, limit: number = 5): Recipe[] {
    return this.recipes
      .filter(r => r.id !== recipe.id)
      .filter(r => 
        r.categoria === recipe.categoria ||
        r.tipoCucina === recipe.tipoCucina ||
        r.tags.some(tag => recipe.tags.includes(tag))
      )
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, limit);
  }

  // STATISTICHE
  getStats(): {
    total: number;
    byCategory: { [key: string]: number };
    byCuisine: { [key: string]: number };
    byDifficulty: { [key: string]: number };
    averageRating: number;
  } {
    const stats = {
      total: this.recipes.length,
      byCategory: {} as { [key: string]: number },
      byCuisine: {} as { [key: string]: number },
      byDifficulty: {} as { [key: string]: number },
      averageRating: 0
    };

    let totalRating = 0;
    let ratedRecipes = 0;

    this.recipes.forEach(recipe => {
      stats.byCategory[recipe.categoria] = (stats.byCategory[recipe.categoria] || 0) + 1;
      stats.byCuisine[recipe.tipoCucina] = (stats.byCuisine[recipe.tipoCucina] || 0) + 1;
      stats.byDifficulty[recipe.difficolta] = (stats.byDifficulty[recipe.difficolta] || 0) + 1;
      
      if (recipe.rating) {
        totalRating += recipe.rating;
        ratedRecipes++;
      }
    });

    stats.averageRating = ratedRecipes > 0 ? totalRating / ratedRecipes : 0;
    return stats;
  }

  // OPZIONI FILTRI
  getFilterOptions(): {
    categories: string[];
    cuisines: string[];
    difficulties: string[];
    diets: string[];
    allergies: string[];
    tags: string[];
  } {
    return {
      categories: [...new Set(this.recipes.map(r => r.categoria))],
      cuisines: [...new Set(this.recipes.map(r => r.tipoCucina))],
      difficulties: [...new Set(this.recipes.map(r => r.difficolta))],
      diets: [...new Set(this.recipes.flatMap(r => r.tipoDieta))],
      allergies: [...new Set(this.recipes.flatMap(r => r.allergie))],
      tags: [...new Set(this.recipes.flatMap(r => r.tags))]
    };
  }
}