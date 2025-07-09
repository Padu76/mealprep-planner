import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { formData, mealType, dayNumber, currentPlan } = await request.json();
    
    console.log('🔄 Replace meal request:', { mealType, dayNumber });
    
    // Alternative specifiche per tipo pasto
    const alternatives = {
      colazione: [
        {
          nome: "Pancakes Proteici ai Mirtilli",
          calorie: 645,
          proteine: 35,
          carboidrati: 82,
          grassi: 19,
          tempo: "20 min",
          porzioni: 1,
          ingredienti: [
            "40g avena in fiocchi",
            "1 uovo intero + 1 albume",
            "150ml latte scremato",
            "80g mirtilli freschi",
            "10g miele",
            "1 cucchiaino lievito in polvere",
            "Cannella in polvere q.b."
          ],
          preparazione: "Frulla avena, uova, latte e lievito. Aggiungi mirtilli e cuoci in padella antiaderente. Servi con miele e cannella."
        },
        {
          nome: "Smoothie Bowl Tropicale",
          calorie: 598,
          proteine: 28,
          carboidrati: 89,
          grassi: 16,
          tempo: "10 min",
          porzioni: 1,
          ingredienti: [
            "1/2 banana congelata",
            "100g mango a cubetti",
            "150g yogurt greco 0%",
            "200ml latte di cocco",
            "15g granola integrale",
            "10g cocco rapé",
            "5g semi di chia"
          ],
          preparazione: "Frulla banana, mango, yogurt e latte di cocco. Versa in una bowl e guarnisci con granola, cocco e semi di chia."
        }
      ],
      pranzo: [
        {
          nome: "Risotto ai Funghi Porcini",
          calorie: 892,
          proteine: 68,
          carboidrati: 98,
          grassi: 24,
          tempo: "35 min",
          porzioni: 1,
          ingredienti: [
            "80g riso carnaroli",
            "80g funghi porcini secchi",
            "300ml brodo vegetale",
            "1/4 cipolla (30g)",
            "20g Parmigiano grattugiato",
            "1 cucchiaio olio extravergine",
            "Prezzemolo fresco",
            "Sale e pepe q.b."
          ],
          preparazione: "Ammolla i porcini, soffriggi la cipolla, tosta il riso e aggiungi brodo caldo poco alla volta. Manteca con Parmigiano."
        },
        {
          nome: "Insalata di Quinoa e Verdure",
          calorie: 847,
          proteine: 61,
          carboidrati: 105,
          grassi: 22,
          tempo: "25 min",
          porzioni: 1,
          ingredienti: [
            "70g quinoa",
            "100g ceci lessati",
            "80g zucchine a dadini",
            "60g peperoni rossi",
            "40g feta greca",
            "10 pomodorini ciliegino",
            "1 cucchiaio olio extravergine",
            "Basilico fresco"
          ],
          preparazione: "Cuoci la quinoa, griglia le verdure, mescola tutti gli ingredienti e condisci con olio e basilico."
        }
      ],
      cena: [
        {
          nome: "Salmone in Crosta di Pistacchi",
          calorie: 768,
          proteine: 63,
          carboidrati: 71,
          grassi: 26,
          tempo: "30 min",
          porzioni: 1,
          ingredienti: [
            "120g filetto di salmone",
            "20g pistacchi tritati",
            "1 cucchiaio pangrattato",
            "1/2 limone",
            "100g patate novelle",
            "80g broccoli",
            "1 cucchiaio olio extravergine",
            "Erbe aromatiche"
          ],
          preparazione: "Ricopri il salmone con pistacchi e pangrattato, cuoci in forno con patate e broccoli. Finisci con limone."
        },
        {
          nome: "Zuppa di Lenticchie e Verdure",
          calorie: 723,
          proteine: 69,
          carboidrati: 68,
          grassi: 23,
          tempo: "40 min",
          porzioni: 1,
          ingredienti: [
            "100g lenticchie rosse",
            "1/2 carota (40g)",
            "1/2 costa sedano (20g)",
            "1/4 cipolla (25g)",
            "400ml brodo vegetale",
            "100g passata pomodoro",
            "1 cucchiaio olio extravergine",
            "Timo e alloro"
          ],
          preparazione: "Soffriggi le verdure, aggiungi lenticchie, brodo e pomodoro. Cuoci 25 minuti finché cremosa."
        }
      ],
      spuntino1: [
        {
          nome: "Energy Balls ai Datteri",
          calorie: 185,
          proteine: 14,
          carboidrati: 22,
          grassi: 4,
          tempo: "10 min",
          porzioni: 1,
          ingredienti: [
            "3 datteri Medjool denocciolati",
            "15g mandorle",
            "10g proteine in polvere",
            "5g cacao amaro",
            "Cocco rapé per rotolare"
          ],
          preparazione: "Frulla datteri e mandorle, aggiungi proteine e cacao. Forma palline e rotola nel cocco."
        }
      ]
    };
    
    // Seleziona un'alternativa random per il tipo di pasto
    const mealAlternatives = alternatives[mealType as keyof typeof alternatives] || alternatives.pranzo;
    const newMeal = mealAlternatives[Math.floor(Math.random() * mealAlternatives.length)];
    
    console.log('🔄 Selected new meal:', newMeal.nome);
    
    return NextResponse.json({
      success: true,
      newMeal: newMeal,
      mealType: mealType,
      dayNumber: dayNumber,
      message: `Pasto ${mealType} sostituito con ${newMeal.nome}`
    });
    
  } catch (error) {
    console.error('❌ Replace meal error:', error);
    return NextResponse.json({
      success: false,
      error: 'Errore nella sostituzione del pasto',
      details: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { status: 500 });
  }
}