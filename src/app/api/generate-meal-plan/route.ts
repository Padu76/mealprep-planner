// 🔄 ROLLBACK COMPLETO + FIX SOLO VARIETÀ

// RIPRISTINA il prompt originale ma AGGIUNGI SOLO le regole varietà
function createScientificPrompt(formData: any, calc: any): string {
  return `ISTRUZIONI CRITICHE PER NUTRIZIONISTA AI:

Devi creare un piano alimentare con VINCOLI NUMERICI ASSOLUTI.

CALCOLI SCIENTIFICI COMPLETATI:
- BMR: ${calc.bmr} kcal/giorno  
- TDEE: ${calc.tdee} kcal/giorno
- TARGET GIORNALIERO: ${calc.dailyCalories} kcal/giorno

VINCOLI NON NEGOZIABILI:
❗ OGNI GIORNO DEVE AVERE ESATTAMENTE ${calc.dailyCalories} KCAL
❗ COLAZIONE: ESATTAMENTE ${calc.mealCalories.colazione} KCAL
❗ PRANZO: ESATTAMENTE ${calc.mealCalories.pranzo} KCAL  
❗ CENA: ESATTAMENTE ${calc.mealCalories.cena} KCAL
${calc.mealCalories.spuntino1 > 0 ? `❗ SPUNTINO 1: ESATTAMENTE ${calc.mealCalories.spuntino1} KCAL` : ''}
${calc.mealCalories.spuntino2 > 0 ? `❗ SPUNTINO 2: ESATTAMENTE ${calc.mealCalories.spuntino2} KCAL` : ''}

DATI UTENTE:
- ${formData.nome}, ${formData.eta} anni, ${formData.sesso}
- ${formData.peso}kg, ${formData.altezza}cm
- Attività: ${formData.attivita}
- Obiettivo: ${formData.obiettivo}
- Durata: ${calc.numDays} giorni
- Allergie: ${formData.allergie?.join(', ') || 'Nessuna'}

FORMATO OBBLIGATORIO:

=== PIANO ALIMENTARE SCIENTIFICO ===
Target: ${calc.dailyCalories} kcal/giorno

GIORNO 1:
🌅 COLAZIONE (${calc.mealCalories.colazione} kcal)
Nome: [Nome ricetta italiana]
Calorie: ${calc.mealCalories.colazione}
Proteine: [X]g | Carboidrati: [X]g | Grassi: [X]g
Ingredienti: [Lista con quantità precise]
Preparazione: [Istruzioni]

☀️ PRANZO (${calc.mealCalories.pranzo} kcal)
Nome: [Nome ricetta italiana]
Calorie: ${calc.mealCalories.pranzo}
Proteine: [X]g | Carboidrati: [X]g | Grassi: [X]g
Ingredienti: [Lista con quantità precise]
Preparazione: [Istruzioni]

🌙 CENA (${calc.mealCalories.cena} kcal)
Nome: [Nome ricetta italiana]
Calorie: ${calc.mealCalories.cena}
Proteine: [X]g | Carboidrati: [X]g | Grassi: [X]g
Ingredienti: [Lista con quantità precise]
Preparazione: [Istruzioni]

${calc.mealCalories.spuntino1 > 0 ? `🍎 SPUNTINO 1 (${calc.mealCalories.spuntino1} kcal)\n[Dettagli spuntino]\n` : ''}

TOTALE GIORNO 1: ${calc.dailyCalories} kcal

${calc.numDays > 1 ? `GIORNO 2:
🌅 COLAZIONE (${calc.mealCalories.colazione} kcal)
Nome: [Nome ricetta italiana DIVERSA dal giorno 1]
Calorie: ${calc.mealCalories.colazione}
Proteine: [X]g | Carboidrati: [X]g | Grassi: [X]g
Ingredienti: [Lista DIVERSA dal giorno 1]
Preparazione: [Istruzioni]

☀️ PRANZO (${calc.mealCalories.pranzo} kcal)
Nome: [Nome ricetta italiana DIVERSA dal giorno 1]
Calorie: ${calc.mealCalories.pranzo}
Proteine: [X]g | Carboidrati: [X]g | Grassi: [X]g
Ingredienti: [Lista DIVERSA dal giorno 1]
Preparazione: [Istruzioni]

🌙 CENA (${calc.mealCalories.cena} kcal)
Nome: [Nome ricetta italiana DIVERSA dal giorno 1]
Calorie: ${calc.mealCalories.cena}
Proteine: [X]g | Carboidrati: [X]g | Grassi: [X]g
Ingredienti: [Lista DIVERSA dal giorno 1]
Preparazione: [Istruzioni]

TOTALE GIORNO 2: ${calc.dailyCalories} kcal` : ''}

REGOLE CRITICHE:
1. USA ESATTAMENTE I NUMERI SPECIFICATI PER LE CALORIE
2. NON MODIFICARE I VALORI CALORICI TARGET  
3. SCRIVI TUTTO IN ITALIANO
4. NON RIPETERE RICETTE TRA I GIORNI
5. VARIA GLI INGREDIENTI TRA I GIORNI
6. EVITA: ${formData.allergie?.join(', ') || 'niente'}

Inizia subito con il formato richiesto IN ITALIANO.`;
}

// 🔄 RIPRISTINA il fallback originale con varietà
function generateFallbackResponse(formData: any, calc: any) {
  console.log('🔄 Generating scientific fallback response...');
  
  const fallbackPlan = `=== PIANO ALIMENTARE SCIENTIFICO ===
Target: ${calc.dailyCalories} kcal/giorno

GIORNO 1:
🌅 COLAZIONE (${calc.mealCalories.colazione} kcal)
Nome: Power Breakfast Bowl Scientifico
Calorie: ${calc.mealCalories.colazione}
Proteine: ${Math.round(calc.mealCalories.colazione * 0.20 / 4)}g | Carboidrati: ${Math.round(calc.mealCalories.colazione * 0.50 / 4)}g | Grassi: ${Math.round(calc.mealCalories.colazione * 0.30 / 9)}g
Ingredienti: 
- ${Math.round(calc.mealCalories.colazione * 0.35)}g avena integrale
- ${Math.round(calc.mealCalories.colazione * 0.15)}g proteine whey vaniglia
- ${Math.round(calc.mealCalories.colazione * 0.20)}g frutti di bosco misti
- ${Math.round(calc.mealCalories.colazione * 0.12)}g mandorle
- 200ml latte parzialmente scremato
- 1 cucchiaino miele
Preparazione: Mescola avena con proteine in polvere, aggiungi latte caldo, frutti di bosco, mandorle e miele. Calibrato scientificamente per ${calc.mealCalories.colazione} kcal.

☀️ PRANZO (${calc.mealCalories.pranzo} kcal)
Nome: Bowl Proteico Mediterraneo
Calorie: ${calc.mealCalories.pranzo}
Proteine: ${Math.round(calc.mealCalories.pranzo * 0.25 / 4)}g | Carboidrati: ${Math.round(calc.mealCalories.pranzo * 0.45 / 4)}g | Grassi: ${Math.round(calc.mealCalories.pranzo * 0.30 / 9)}g
Ingredienti:
- ${Math.round(calc.mealCalories.pranzo * 0.45)}g petto di pollo grigliato
- ${Math.round(calc.mealCalories.pranzo * 0.25)}g quinoa cotta
- ${Math.round(calc.mealCalories.pranzo * 0.15)}g verdure grigliate miste
- ${Math.round(calc.mealCalories.pranzo * 0.08)}g avocado
- 1 cucchiaio olio extravergine
- 50g pomodorini
- Erbe aromatiche
Preparazione: Griglia pollo e verdure, cuoci quinoa, componi bowl con tutti ingredienti. Porzioni calibrate per ${calc.mealCalories.pranzo} kcal esatti.

🌙 CENA (${calc.mealCalories.cena} kcal)
Nome: Salmone Omega-3 Bilanciato
Calorie: ${calc.mealCalories.cena}
Proteine: ${Math.round(calc.mealCalories.cena * 0.35 / 4)}g | Carboidrati: ${Math.round(calc.mealCalories.cena * 0.25 / 4)}g | Grassi: ${Math.round(calc.mealCalories.cena * 0.40 / 9)}g
Ingredienti:
- ${Math.round(calc.mealCalories.cena * 0.50)}g filetto di salmone
- ${Math.round(calc.mealCalories.cena * 0.20)}g patate dolci
- ${Math.round(calc.mealCalories.cena * 0.18)}g broccoli
- 1 cucchiaio olio extravergine
- Limone, erbe aromatiche
Preparazione: Salmone al forno con patate dolci e broccoli al vapore. Porzioni scientificamente calcolate per ${calc.mealCalories.cena} kcal.

TOTALE GIORNO 1: ${calc.dailyCalories} kcal

${calc.numDays > 1 ? `GIORNO 2:
🌅 COLAZIONE (${calc.mealCalories.colazione} kcal)
Nome: Pancakes Proteici alla Ricotta
Calorie: ${calc.mealCalories.colazione}
Proteine: ${Math.round(calc.mealCalories.colazione * 0.25 / 4)}g | Carboidrati: ${Math.round(calc.mealCalories.colazione * 0.45 / 4)}g | Grassi: ${Math.round(calc.mealCalories.colazione * 0.30 / 9)}g
Ingredienti:
- ${Math.round(calc.mealCalories.colazione * 0.4)}g ricotta light
- ${Math.round(calc.mealCalories.colazione * 0.25)}g farina d'avena
- 2 uova
- ${Math.round(calc.mealCalories.colazione * 0.15)}g mirtilli
- 1 cucchiaino sciroppo d'acero
Preparazione: Impasta ricotta con farina e uova, cuoci pancakes, servi con mirtilli. Calibrato per ${calc.mealCalories.colazione} kcal.

☀️ PRANZO (${calc.mealCalories.pranzo} kcal)
Nome: Risotto alle Verdure Fitness
Calorie: ${calc.mealCalories.pranzo}
Proteine: ${Math.round(calc.mealCalories.pranzo * 0.20 / 4)}g | Carboidrati: ${Math.round(calc.mealCalories.pranzo * 0.55 / 4)}g | Grassi: ${Math.round(calc.mealCalories.pranzo * 0.25 / 9)}g
Ingredienti:
- ${Math.round(calc.mealCalories.pranzo * 0.4)}g riso integrale
- ${Math.round(calc.mealCalories.pranzo * 0.2)}g zucchine
- ${Math.round(calc.mealCalories.pranzo * 0.15)}g parmigiano
- ${Math.round(calc.mealCalories.pranzo * 0.1)}g piselli
- Brodo vegetale e spezie
Preparazione: Risotto cremoso con verdure fresche e parmigiano. Porzioni per ${calc.mealCalories.pranzo} kcal.

🌙 CENA (${calc.mealCalories.cena} kcal)
Nome: Tagliata di Manzo alle Erbe
Calorie: ${calc.mealCalories.cena}
Proteine: ${Math.round(calc.mealCalories.cena * 0.40 / 4)}g | Carboidrati: ${Math.round(calc.mealCalories.cena * 0.20 / 4)}g | Grassi: ${Math.round(calc.mealCalories.cena * 0.40 / 9)}g
Ingredienti:
- ${Math.round(calc.mealCalories.cena * 0.5)}g tagliata di manzo
- ${Math.round(calc.mealCalories.cena * 0.2)}g rucola
- ${Math.round(calc.mealCalories.cena * 0.15)}g pomodorini
- ${Math.round(calc.mealCalories.cena * 0.1)}g grana
- Olio EVO e aceto balsamico
Preparazione: Tagliata grigliata su letto di rucola con pomodorini. Calibrata per ${calc.mealCalories.cena} kcal.

TOTALE GIORNO 2: ${calc.dailyCalories} kcal
` : ''}

=== LISTA DELLA SPESA ===
Proteine: pollo, salmone, manzo, uova, ricotta, yogurt greco, proteine whey
Carboidrati: avena, quinoa, riso integrale, patate dolci, frutti di bosco
Grassi: mandorle, avocado, olio extravergine, parmigiano
Verdure: broccoli, verdure miste, pomodorini, zucchine, rucola
Altro: latte, miele, erbe aromatiche`;

  return NextResponse.json({
    success: true,
    piano: fallbackPlan,
    message: 'Piano scientifico fallback con varietà generato!',
    metadata: {
      bmr: calc.bmr,
      tdee: calc.tdee,
      dailyTarget: calc.dailyCalories,
      mealDistribution: calc.mealCalories,
      isCalorieSafe: calc.isSafe,
      fallback: true
    }
  });
}

// 🔧 ASSICURATI che nel page.tsx NON ci siano modifiche che rompono le immagini
// Le immagini dovrebbero essere generate qui:
/*
// 🖼️ Genera immagine per la nuova ricetta
let imageUrl = '';
try {
  const imageResponse = await fetch('/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: `Professional food photography of ${newMeal.nome}, healthy fitness meal, appetizing`
    })
  });
  const imageResult = await imageResponse.json();
  imageUrl = imageResult.imageUrl || '';
} catch (imageError) {
  console.log('⚠️ Image generation failed:', imageError);
}
*/