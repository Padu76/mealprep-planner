// 🔧 FIX SISTEMA VARIETÀ PASTI - Aggiungi al prompt dell'API

// MODIFICA createScientificPrompt nel route.ts:
function createScientificPrompt(formData: any, calc: any): string {
  return `ISTRUZIONI CRITICHE PER NUTRIZIONISTA AI:

Devi creare un piano alimentare con VINCOLI NUMERICI ASSOLUTI e VARIETÀ OBBLIGATORIA.

CALCOLI SCIENTIFICI COMPLETATI:
- BMR: ${calc.bmr} kcal/giorno  
- TDEE: ${calc.tdee} kcal/giorno
- TARGET GIORNALIERO: ${calc.dailyCalories} kcal/giorno

VINCOLI NON NEGOZIABILI:
❗ OGNI GIORNO DEVE AVERE ESATTAMENTE ${calc.dailyCalories} KCAL
❗ COLAZIONE: ESATTAMENTE ${calc.mealCalories.colazione} KCAL
❗ PRANZO: ESATTAMENTE ${calc.mealCalories.pranzo} KCAL  
❗ CENA: ESATTAMENTE ${calc.mealCalories.cena} KCAL
❗ OGNI GIORNO DEVE AVERE RICETTE COMPLETAMENTE DIVERSE
❗ NESSUNA RICETTA DEVE RIPETERSI TRA I GIORNI

DATI UTENTE:
- ${formData.nome}, ${formData.eta} anni, ${formData.sesso}
- ${formData.peso}kg, ${formData.altezza}cm
- Attività: ${formData.attivita}
- Obiettivo: ${formData.obiettivo}
- Durata: ${calc.numDays} giorni
- Allergie: ${formData.allergie?.join(', ') || 'Nessuna'}

VARIETÀ OBBLIGATORIA:
${calc.numDays > 1 ? `
- GIORNO 1: Ricette italiane/mediterranee
- GIORNO 2: Ricette internazionali/fusion
${calc.numDays > 2 ? '- GIORNO 3: Ricette vegetariane/plant-based' : ''}
${calc.numDays > 3 ? '- GIORNO 4: Ricette asiatiche/orientali' : ''}
${calc.numDays > 4 ? '- GIORNO 5: Ricette nordiche/scandinave' : ''}
` : ''}

FORMATO OBBLIGATORIO:

=== PIANO ALIMENTARE SCIENTIFICO CON VARIETÀ ===
Target: ${calc.dailyCalories} kcal/giorno

GIORNO 1 - CUCINA ITALIANA/MEDITERRANEA:
🌅 COLAZIONE (${calc.mealCalories.colazione} kcal)
Nome: [Nome ricetta italiana/mediterranea - UNICA]
Calorie: ${calc.mealCalories.colazione}
Proteine: [X]g | Carboidrati: [X]g | Grassi: [X]g
Ingredienti: [Lista con quantità precise - ingredienti tipici italiani]
Preparazione: [Istruzioni dettagliate]

☀️ PRANZO (${calc.mealCalories.pranzo} kcal)
Nome: [Nome ricetta italiana/mediterranea - DIVERSA dalla colazione]
Calorie: ${calc.mealCalories.pranzo}
Proteine: [X]g | Carboidrati: [X]g | Grassi: [X]g
Ingredienti: [Lista con quantità precise - ingredienti mediterranei]
Preparazione: [Istruzioni dettagliate]

🌙 CENA (${calc.mealCalories.cena} kcal)
Nome: [Nome ricetta italiana/mediterranea - DIVERSA da colazione e pranzo]
Calorie: ${calc.mealCalories.cena}
Proteine: [X]g | Carboidrati: [X]g | Grassi: [X]g
Ingredienti: [Lista con quantità precise - ingredienti del sud Italia]
Preparazione: [Istruzioni dettagliate]

TOTALE GIORNO 1: ${calc.dailyCalories} kcal

${calc.numDays > 1 ? `
GIORNO 2 - CUCINA INTERNAZIONALE/FUSION:
🌅 COLAZIONE (${calc.mealCalories.colazione} kcal)
Nome: [Nome ricetta internazionale - COMPLETAMENTE DIVERSA dal giorno 1]
Calorie: ${calc.mealCalories.colazione}
Proteine: [X]g | Carboidrati: [X]g | Grassi: [X]g
Ingredienti: [Ingredienti esotici/internazionali - NON usati nel giorno 1]
Preparazione: [Tecnica di cottura diversa dal giorno 1]

☀️ PRANZO (${calc.mealCalories.pranzo} kcal)
Nome: [Nome ricetta fusion - NUOVO stile cucina]
Calorie: ${calc.mealCalories.pranzo}
Proteine: [X]g | Carboidrati: [X]g | Grassi: [X]g
Ingredienti: [Combinazione unica - MAI vista nei pasti precedenti]
Preparazione: [Metodo innovativo]

🌙 CENA (${calc.mealCalories.cena} kcal)
Nome: [Nome ricetta internazionale - TEMA DIVERSO da tutti i pasti precedenti]
Calorie: ${calc.mealCalories.cena}
Proteine: [X]g | Carboidrati: [X]g | Grassi: [X]g
Ingredienti: [Spezie e ingredienti esotici]
Preparazione: [Tecnica etnica specifica]

TOTALE GIORNO 2: ${calc.dailyCalories} kcal
` : ''}

REGOLE CRITICHE VARIETÀ:
1. USA ESATTAMENTE I NUMERI SPECIFICATI PER LE CALORIE
2. NON RIPETERE MAI UNA RICETTA TRA I GIORNI
3. NON RIPETERE INGREDIENTI PRINCIPALI TRA I GIORNI
4. VARIA TECNICHE DI COTTURA (griglia, forno, vapore, padella)
5. VARIA ORIGINI ETNICHE DELLE RICETTE
6. OGNI PASTO DEVE ESSERE UNICO E MEMORABILE
7. EVITA: ${formData.allergie?.join(', ') || 'niente'}

ESEMPI DI VARIETÀ RICHIESTA:
- GIORNO 1 Colazione: "Pancakes Proteici Italiani con Ricotta"
- GIORNO 2 Colazione: "Bowl Azteco con Quinoa e Avocado"
- GIORNO 1 Pranzo: "Risotto alle Verdure con Parmigiano"
- GIORNO 2 Pranzo: "Buddha Bowl Thailandese con Tofu"

Inizia subito con il formato richiesto garantendo MASSIMA VARIETÀ.`;
}

// 🔧 MODIFICA ANCHE IL FALLBACK per garantire varietà:
function generateFallbackResponse(formData: any, calc: any) {
  console.log('🔄 Generating scientific fallback response with VARIETY...');
  
  // Template varietà per diversi giorni
  const varietyTemplates = {
    day1: {
      theme: "Italiana/Mediterranea",
      colazione: {
        nome: "Pancakes Proteici alla Ricotta",
        ingredienti: [
          `${Math.round(calc.mealCalories.colazione * 0.3)}g ricotta fresca`,
          `${Math.round(calc.mealCalories.colazione * 0.25)}g farina d'avena`,
          `2 uova fresche`,
          `${Math.round(calc.mealCalories.colazione * 0.15)}g frutti di bosco`,
          `1 cucchiaino miele italiano`
        ]
      },
      pranzo: {
        nome: "Risotto Integrale con Verdure",
        ingredienti: [
          `${Math.round(calc.mealCalories.pranzo * 0.35)}g riso integrale`,
          `${Math.round(calc.mealCalories.pranzo * 0.25)}g zucchine`,
          `${Math.round(calc.mealCalories.pranzo * 0.2)}g parmigiano`,
          `${Math.round(calc.mealCalories.pranzo * 0.15)}g pomodorini`,
          `1 cucchiaio olio EVO`
        ]
      },
      cena: {
        nome: "Branzino in Crosta di Sale",
        ingredienti: [
          `${Math.round(calc.mealCalories.cena * 0.5)}g branzino fresco`,
          `${Math.round(calc.mealCalories.cena * 0.2)}g patate novelle`,
          `${Math.round(calc.mealCalories.cena * 0.15)}g olive taggiasche`,
          `Rosmarino e timo fresco`,
          `Sale grosso marino`
        ]
      }
    },
    day2: {
      theme: "Internazionale/Fusion",
      colazione: {
        nome: "Buddha Bowl Azteco",
        ingredienti: [
          `${Math.round(calc.mealCalories.colazione * 0.3)}g quinoa`,
          `${Math.round(calc.mealCalories.colazione * 0.25)}g avocado`,
          `${Math.round(calc.mealCalories.colazione * 0.2)}g semi di chia`,
          `${Math.round(calc.mealCalories.colazione * 0.15)}g mango`,
          `Latte di cocco e lime`
        ]
      },
      pranzo: {
        nome: "Poke Bowl Hawaiano",
        ingredienti: [
          `${Math.round(calc.mealCalories.pranzo * 0.4)}g salmone sashimi`,
          `${Math.round(calc.mealCalories.pranzo * 0.25)}g riso venere`,
          `${Math.round(calc.mealCalories.pranzo * 0.15)}g edamame`,
          `${Math.round(calc.mealCalories.pranzo * 0.1)}g alga wakame`,
          `Salsa teriyaki e sesamo`
        ]
      },
      cena: {
        nome: "Curry Verde Thailandese",
        ingredienti: [
          `${Math.round(calc.mealCalories.cena * 0.35)}g pollo al curry`,
          `${Math.round(calc.mealCalories.cena * 0.25)}g latte di cocco`,
          `${Math.round(calc.mealCalories.cena * 0.2)}g bambù e peperoni`,
          `${Math.round(calc.mealCalories.cena * 0.15)}g riso basmati`,
          `Pasta di curry verde e basilico thai`
        ]
      }
    }
  };
  
  const numDays = calc.numDays;
  let fallbackPlan = `=== PIANO ALIMENTARE SCIENTIFICO CON VARIETÀ ===
Target: ${calc.dailyCalories} kcal/giorno\n\n`;
  
  for (let day = 1; day <= numDays; day++) {
    const template = day === 1 ? varietyTemplates.day1 : varietyTemplates.day2;
    
    fallbackPlan += `GIORNO ${day} - CUCINA ${template.theme.toUpperCase()}:
🌅 COLAZIONE (${calc.mealCalories.colazione} kcal)
Nome: ${template.colazione.nome}
Calorie: ${calc.mealCalories.colazione}
Proteine: ${Math.round(calc.mealCalories.colazione * 0.20 / 4)}g | Carboidrati: ${Math.round(calc.mealCalories.colazione * 0.50 / 4)}g | Grassi: ${Math.round(calc.mealCalories.colazione * 0.30 / 9)}g
Ingredienti: 
${template.colazione.ingredienti.map(ing => `- ${ing}`).join('\n')}
Preparazione: Ricetta ${template.theme.toLowerCase()} con tecniche tradizionali. Calibrato per ${calc.mealCalories.colazione} kcal.

☀️ PRANZO (${calc.mealCalories.pranzo} kcal)
Nome: ${template.pranzo.nome}
Calorie: ${calc.mealCalories.pranzo}
Proteine: ${Math.round(calc.mealCalories.pranzo * 0.25 / 4)}g | Carboidrati: ${Math.round(calc.mealCalories.pranzo * 0.45 / 4)}g | Grassi: ${Math.round(calc.mealCalories.pranzo * 0.30 / 9)}g
Ingredienti:
${template.pranzo.ingredienti.map(ing => `- ${ing}`).join('\n')}
Preparazione: Piatto principale ${template.theme.toLowerCase()} con ingredienti freschi. Porzioni per ${calc.mealCalories.pranzo} kcal.

🌙 CENA (${calc.mealCalories.cena} kcal)
Nome: ${template.cena.nome}
Calorie: ${calc.mealCalories.cena}
Proteine: ${Math.round(calc.mealCalories.cena * 0.35 / 4)}g | Carboidrati: ${Math.round(calc.mealCalories.cena * 0.25 / 4)}g | Grassi: ${Math.round(calc.mealCalories.cena * 0.40 / 9)}g
Ingredienti:
${template.cena.ingredienti.map(ing => `- ${ing}`).join('\n')}
Preparazione: Cena ${template.theme.toLowerCase()} con cottura specifica. Calibrata per ${calc.mealCalories.cena} kcal.

TOTALE GIORNO ${day}: ${calc.dailyCalories} kcal

`;
  }
  
  fallbackPlan += `=== LISTA DELLA SPESA VARIETÀ ===
GIORNO 1 (${varietyTemplates.day1.theme}): ricotta, avena, uova, frutti bosco, riso integrale, zucchine, parmigiano, branzino, patate novelle
GIORNO 2 (${varietyTemplates.day2.theme}): quinoa, avocado, chia, mango, salmone, riso venere, edamame, pollo curry, latte cocco
SPEZIE: miele, olio EVO, rosmarino, timo, lime, teriyaki, sesamo, curry verde, basilico thai`;

  return NextResponse.json({
    success: true,
    piano: fallbackPlan,
    message: 'Piano scientifico con varietà generato!',
    metadata: {
      bmr: calc.bmr,
      tdee: calc.tdee,
      dailyTarget: calc.dailyCalories,
      mealDistribution: calc.mealCalories,
      isCalorieSafe: calc.isSafe,
      fallback: true,
      variety: true
    }
  });
}