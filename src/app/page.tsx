'use client';

import { useState, useEffect } from 'react';

// Componenti modulari
import Header from '../../components/Header';
import Hero from '../../components/Hero';

// Hooks custom
import { useAISubstitute } from '../../hooks/useAISubstitute';

// Utils
import { generateShoppingList, calculateTotalCalories, filterIngredientsByCategory } from '../../utils/calculations';

// Types
import { FormData, ParsedPlan, ApiStatus } from '../../types';

export default function HomePage() {
  // Stati principali
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking');
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [parsedPlan, setParsedPlan] = useState<ParsedPlan | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isReplacing, setIsReplacing] = useState<string | null>(null);
  const [hasSavedData, setHasSavedData] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    nome: '', eta: '', sesso: '', peso: '', altezza: '', attivita: '', 
    obiettivo: '', allergie: '', preferenze: '', pasti: '', durata: '', varieta: ''
  });

  // Funzione per generare il documento completo
  const generateCompleteDocument = (parsedPlan: ParsedPlan): string => {
    const shoppingList = generateShoppingList(parsedPlan.days);
    const totalCalories = calculateTotalCalories(parsedPlan.days);
    
    const verdureList = filterIngredientsByCategory(shoppingList, ['pomodor', 'sedano', 'carota', 'cipolla', 'aglio', 'fungh', 'rucola', 'verdur'])
      .map(([name, data]) => `□ ${name}: ${data.quantity}${data.unit === 'pz' ? ' pz' : data.unit}`)
      .join('\n');

    const carneList = filterIngredientsByCategory(shoppingList, ['manzo', 'salmone', 'pollo', 'merluzzo', 'carne'])
      .map(([name, data]) => `□ ${name}: ${data.quantity}${data.unit === 'pz' ? ' pz' : data.unit}`)
      .join('\n');

    const latticiniList = filterIngredientsByCategory(shoppingList, ['uovo', 'yogurt', 'latte', 'parmigiano', 'formaggio'])
      .map(([name, data]) => `□ ${name}: ${data.quantity}${data.unit === 'pz' ? ' pz' : data.unit}`)
      .join('\n');

    const cerealiList = filterIngredientsByCategory(shoppingList, ['pasta', 'pane', 'avena', 'quinoa', 'fagioli', 'riso'])
      .map(([name, data]) => `□ ${name}: ${data.quantity}${data.unit === 'pz' ? ' pz' : data.unit}`)
      .join('\n');

    const fruttaList = filterIngredientsByCategory(shoppingList, ['avocado', 'limone', 'banana', 'frutti', 'granola', 'miele', 'olio', 'aceto'])
      .map(([name, data]) => `□ ${name}: ${data.quantity}${data.unit === 'pz' ? ' pz' : data.unit}`)
      .join('\n');

    const giornitxt = parsedPlan.days.map((day: any) => {
      const dayTotal = day.meals.colazione.calorie + day.meals.pranzo.calorie + day.meals.cena.calorie;
      return `
${day.day.toUpperCase()}
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

🌅 COLAZIONE: ${day.meals.colazione.nome}
   🔥 ${day.meals.colazione.calorie} kcal | 🥩 ${day.meals.colazione.proteine}g | 🍞 ${day.meals.colazione.carboidrati}g | 🥑 ${day.meals.colazione.grassi}g
   
☀️ PRANZO: ${day.meals.pranzo.nome}
   🔥 ${day.meals.pranzo.calorie} kcal | 🥩 ${day.meals.pranzo.proteine}g | 🍞 ${day.meals.pranzo.carboidrati}g | 🥑 ${day.meals.pranzo.grassi}g
   
🌙 CENA: ${day.meals.cena.nome}
   🔥 ${day.meals.cena.calorie} kcal | 🥩 ${day.meals.cena.proteine}g | 🍞 ${day.meals.cena.carboidrati}g | 🥑 ${day.meals.cena.grassi}g

📊 TOTALE GIORNO: ${dayTotal} kcal
`;
    }).join('');

    const ricetteTxt = Object.entries(parsedPlan.days[0].meals).map(([mealType, meal]: [string, any]) => {
      const ingredientsList = meal.ingredienti.map((ing: string, idx: number) => `${idx + 1}. ${ing}`).join('\n');
      return `
🍽️ ${meal.nome.toUpperCase()}
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

📊 VALORI NUTRIZIONALI:
• Calorie: ${meal.calorie} kcal
• Proteine: ${meal.proteine}g
• Carboidrati: ${meal.carboidrati}g  
• Grassi: ${meal.grassi}g

🛒 INGREDIENTI:
${ingredientsList}

👩‍🍳 PREPARAZIONE:
${meal.preparazione}

⏱️ TEMPO PREPARAZIONE: 15-20 minuti
🍽️ PORZIONI: 1 persona

`;
    }).join('');
    
    return `Piano preparazione pasti personalizzato
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 DATI UTENTE
• Nome: ${formData.nome}
• Età: ${formData.eta} anni
• Sesso: ${formData.sesso}
• Peso: ${formData.peso} kg
• Altezza: ${formData.altezza} cm
• Livello attività: ${formData.attivita}
• Obiettivo: ${formData.obiettivo}
• Durata piano: ${formData.durata} giorni
• Pasti al giorno: ${formData.pasti}
• Varietà: ${formData.varieta === 'ripetuti' ? 'Stessi pasti tutti i giorni' : 'Pasti diversi per giorno'}

🎯 RIEPILOGO PIANO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Totale calorie piano: ${totalCalories.toLocaleString()} kcal
• Media giornaliera: ${Math.round(totalCalories / parsedPlan.days.length).toLocaleString()} kcal/giorno
• Numero ricette: ${Object.keys(parsedPlan.days[0].meals).length} per giorno
• Allergie/Intolleranze: ${formData.allergie || 'Nessuna'}
• Preferenze: ${formData.preferenze || 'Nessuna'}

🛒 LISTA DELLA SPESA CONSOLIDATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🥬 VERDURE E ORTAGGI
${verdureList}

🍖 CARNE E PESCE
${carneList}

🥛 LATTICINI E UOVA
${latticiniList}

🌾 CEREALI E LEGUMI
${cerealiList}

🥑 FRUTTA E ALTRO
${fruttaList}

📅 PROGRAMMA GIORNALIERO DETTAGLIATO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${giornitxt}

👨‍🍳 RICETTE PASSO-PASSO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${ricetteTxt}

💡 CONSIGLI UTILI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 MEAL PREP:
• Prepara gli ingredienti la domenica per tutta la settimana
• Conserva i pasti in contenitori ermetici in frigorifero
• Alcuni piatti si possono congelare per un uso futuro

🥗 CONSERVAZIONE:
• Massimo 3-4 giorni in frigorifero
• Congela le porzioni che non consumi subito
• Riscalda sempre bene prima del consumo

🍴 VARIAZIONI:
• Puoi sostituire verdure simili (broccoli/cavolfiori)
• Adatta le spezie ai tuoi gusti
• Aggiungi erbe fresche per più sapore

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🍽️ Buon appetito e buon meal prep! 
Generated by Meal Prep Planner Pro - ${new Date().toLocaleDateString('it-IT')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  };

  // Hook AI per sostituzione ingredienti
  const aiSubstitute = useAISubstitute(
    parsedPlan,
    formData,
    setParsedPlan,
    setGeneratedPlan,
    generateCompleteDocument
  );

  // Mock data per il piano (da spostare in un file separato)
  const parsePlanFromAI = (aiResponse: string): ParsedPlan => {
    const mockPlan = {
      days: [
        {
          day: "Giorno 1",
          meals: {
            colazione: {
              nome: "Toast Avocado e Uovo in Camicia",
              calorie: 633,
              proteine: 32,
              carboidrati: 87,
              grassi: 18,
              ingredienti: [
                "2 fette pane integrale (60g)",
                "1/2 avocado maturo (80g)",
                "1 uovo fresco biologico",
                "1 cucchiaino aceto bianco",
                "Succo di 1/4 limone",
                "Sale e pepe q.b.",
                "Scaglie di peperoncino (opzionale)"
              ],
              preparazione: "Porta a bollore una casseruola d'acqua con l'aceto. Tosta il pane fino a doratura. In una ciotola, schiaccia l'avocado con una forchetta, aggiungi succo di limone, sale e pepe. Crea un vortice nell'acqua caliente e immergi delicatamente l'uovo per 3-4 minuti. Spalma l'avocado sul pane tostato, adagia sopra l'uovo scodellato e condisci con pepe e peperoncino."
            },
            pranzo: {
              nome: "Pasta e Fagioli",
              calorie: 886,
              proteine: 66,
              carboidrati: 100,
              grassi: 25,
              ingredienti: [
                "75g pasta corta",
                "100g fagioli borlotti lessati",
                "1/2 costa di sedano (15g)",
                "1/4 carota (20g)",
                "1/4 cipolla (25g)",
                "1/2 spicchio aglio",
                "100g passata di pomodoro",
                "200ml brodo vegetale",
                "Rosmarino fresco",
                "1 cucchiaio olio extravergine"
              ],
              preparazione: "Prepara un soffritto con sedano, carota e cipolla tritati. Soffriggi in olio con aglio e rosmarino per 5 minuti. Aggiungi metà fagioli schiacciati e quelli interi. Incorpora la passata e cuoci 10 minuti. Aggiungi brodo e pasta, cuoci mescolando spesso fino a consistenza cremosa."
            },
            cena: {
              nome: "Tagliata di Manzo ai Funghi",
              calorie: 759,
              proteine: 66,
              carboidrati: 66,
              grassi: 25,
              ingredienti: [
                "120g controfiletto di manzo",
                "60g funghi porcini freschi",
                "1/2 spicchio aglio",
                "Prezzemolo fresco (3g)",
                "40g rucola",
                "20g scaglie di Parmigiano",
                "1 cucchiaio olio extravergine",
                "Sale, pepe, rosmarino q.b."
              ],
              preparazione: "Porta la carne a temperatura ambiente. Pulisci e affetta i porcini. Cuoci la carne 3-4 minuti per lato. Lascia riposare 5 minuti. Saltare i porcini con aglio e prezzemolo. Taglia la carne, servi su rucola con porcini e Parmigiano."
            }
          }
        }
      ]
    };

    const numDays = parseInt(formData.durata) || 1;
    const allDays = [];
    
    if (formData.varieta === 'ripetuti') {
      for (let i = 0; i < numDays; i++) {
        allDays.push({
          ...mockPlan.days[0],
          day: `Giorno ${i + 1}`
        });
      }
    } else {
      for (let i = 0; i < numDays; i++) {
        allDays.push({
          ...mockPlan.days[0], // Simplified for demo
          day: `Giorno ${i + 1}`
        });
      }
    }

    return { ...mockPlan, days: allDays };
  };

  // Test connessione API all'avvio
  useEffect(() => {
    const testAPI = async () => {
      try {
        const response = await fetch('/api/test-connection');
        if (response.ok) {
          setApiStatus('connected');
        } else {
          setApiStatus('error');
        }
      } catch (error) {
        setApiStatus('error');
      }
    };
    testAPI();
    loadSavedData();
  }, []);

  const loadSavedData = () => {
    const savedData = localStorage.getItem('mealPrepFormData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(parsedData);
        setHasSavedData(true);
      } catch (error) {
        console.error('Errore nel caricamento dei dati salvati');
      }
    }
  };

  const clearSavedData = () => {
    if (confirm('Sei sicuro di voler cancellare i dati salvati e inserire nuovi dati?')) {
      localStorage.removeItem('mealPrepFormData');
      setHasSavedData(false);
      setFormData({
        nome: '', eta: '', sesso: '', peso: '', altezza: '', attivita: '', 
        obiettivo: '', allergie: '', preferenze: '', pasti: '', durata: '', varieta: ''
      });
      alert('✅ Dati cancellati! Puoi inserire nuovi dati.');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    
    const timeout = setTimeout(() => {
      localStorage.setItem('mealPrepFormData', JSON.stringify(newFormData));
      setHasSavedData(true);
    }, 1000);
    
    setAutoSaveTimeout(timeout);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate-meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        const parsed = parsePlanFromAI(result.piano);
        setParsedPlan(parsed);
        const completeDocument = generateCompleteDocument(parsed);
        setGeneratedPlan(completeDocument);
        setShowPreview(true);
        
        setTimeout(() => {
          document.getElementById('preview-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        alert(`❌ Errore: ${result.error}\n\nDettagli: ${result.details || 'Nessun dettaglio disponibile'}`);
      }
    } catch (error) {
      alert('❌ Errore di connessione. Riprova più tardi.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Componenti modulari */}
      <Header />
      <Hero />
      
      {/* TODO: Spezzare anche questi in componenti separati */}
      {/* Features, Form, Preview, Results, FAQ, Footer */}
      
      <div className="text-center py-20 text-gray-400">
        <h2 className="text-2xl font-bold mb-4">🚧 REFACTORING IN CORSO</h2>
        <p>L'app è stata spezzata in moduli. Ora aggiungeremo gli altri componenti...</p>
        <div className="mt-8 space-y-2">
          <div className="text-green-400">✅ Header → Componente separato</div>
          <div className="text-green-400">✅ Hero → Componente separato</div>
          <div className="text-green-400">✅ Types → Centralizzati</div>
          <div className="text-green-400">✅ Utils → Funzioni estratte</div>
          <div className="text-green-400">✅ AI Hook → Logica separata</div>
          <div className="text-yellow-400">⏳ Features → Da estrarre</div>
          <div className="text-yellow-400">⏳ Form → Da estrarre</div>
          <div className="text-yellow-400">⏳ Preview → Da estrarre</div>
        </div>
      </div>
    </div>
  );
}