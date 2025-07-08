'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [parsedPlan, setParsedPlan] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isReplacing, setIsReplacing] = useState<string | null>(null);
  const [hasSavedData, setHasSavedData] = useState(false);
  
  // Nuovi stati per sostituzione ingredienti AI
  const [showSubstituteModal, setShowSubstituteModal] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<{
    ingredient: string;
    dayIndex: number;
    mealType: string;
    ingredientIndex: number;
  } | null>(null);
  const [isLoadingSubstitutes, setIsLoadingSubstitutes] = useState(false);
  const [substitutes, setSubstitutes] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    nome: '',
    eta: '',
    sesso: '',
    peso: '',
    altezza: '',
    attivita: '',
    obiettivo: '',
    allergie: '',
    preferenze: '',
    pasti: '',
    durata: '',
    varieta: ''
  });

  // Funzione per richiedere sostituzione ingrediente AI
  const handleIngredientSubstitution = async (ingredient: string, dayIndex: number, mealType: string, ingredientIndex: number) => {
    setSelectedIngredient({ ingredient, dayIndex, mealType, ingredientIndex });
    setShowSubstituteModal(true);
    setIsLoadingSubstitutes(true);
    setSubstitutes([]);

    try {
      const response = await fetch('/api/substitute-ingredient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredient,
          userPreferences: formData.preferenze,
          allergies: formData.allergie,
          mealContext: `${mealType} del ${parsedPlan.days[dayIndex].day}`
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setSubstitutes(result.substitutes);
      } else {
        alert('❌ Errore nella ricerca di sostituti: ' + result.error);
        setShowSubstituteModal(false);
      }
    } catch (error) {
      alert('❌ Errore di connessione per la sostituzione ingrediente');
      setShowSubstituteModal(false);
    } finally {
      setIsLoadingSubstitutes(false);
    }
  };

  // Funzione per applicare la sostituzione
  const applySubstitution = (newIngredient: string) => {
    if (!selectedIngredient || !parsedPlan) return;

    const { dayIndex, mealType, ingredientIndex } = selectedIngredient;
    
    // Crea una copia del piano parsed
    const updatedPlan = { ...parsedPlan };
    updatedPlan.days = [...parsedPlan.days];
    updatedPlan.days[dayIndex] = { ...parsedPlan.days[dayIndex] };
    updatedPlan.days[dayIndex].meals = { ...parsedPlan.days[dayIndex].meals };
    updatedPlan.days[dayIndex].meals[mealType] = { ...parsedPlan.days[dayIndex].meals[mealType] };
    updatedPlan.days[dayIndex].meals[mealType].ingredienti = [...parsedPlan.days[dayIndex].meals[mealType].ingredienti];
    
    // Sostituisci l'ingrediente
    updatedPlan.days[dayIndex].meals[mealType].ingredienti[ingredientIndex] = newIngredient;
    
    // Aggiorna lo stato
    setParsedPlan(updatedPlan);
    
    // Rigenera il documento completo
    const completeDocument = generateCompleteDocument(updatedPlan);
    setGeneratedPlan(completeDocument);
    
    // Chiudi il modal
    setShowSubstituteModal(false);
    setSelectedIngredient(null);
    setSubstitutes([]);
  };

  // Funzione per generare lista della spesa consolidata
  const generateShoppingList = (days: any[]) => {
    const ingredients: { [key: string]: { quantity: number, unit: string } } = {};
    
    days.forEach(day => {
      const meals = Object.values(day.meals);
      meals.forEach((meal: any) => {
        if (meal.ingredienti && Array.isArray(meal.ingredienti)) {
          meal.ingredienti.forEach((ingredient: string) => {
            const match = ingredient.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)\s+(.+)$/);
            if (match) {
              const [, qty, unit, name] = match;
              const key = `${name} (${unit})`;
              ingredients[key] = ingredients[key] || { quantity: 0, unit };
              ingredients[key].quantity += parseFloat(qty);
            } else {
              const key = ingredient;
              ingredients[key] = ingredients[key] || { quantity: 1, unit: 'pz' };
              ingredients[key].quantity += 1;
            }
          });
        }
      });
    });
    
    return ingredients;
  };

  // Funzione per generare il documento completo
  const generateCompleteDocument = (parsedPlan: any) => {
    const shoppingList = generateShoppingList(parsedPlan.days);
    const totalCalories = parsedPlan.days.reduce((sum: number, day: any) => {
      const dayTotal = Object.values(day.meals).reduce((daySum: number, meal: any) => daySum + meal.calorie, 0);
      return sum + dayTotal;
    }, 0);
    
    const verdureList = Object.entries(shoppingList)
      .filter(([name]) => {
        const nameLower = name.toLowerCase();
        return nameLower.includes('pomodor') || nameLower.includes('sedano') || 
          nameLower.includes('carota') || nameLower.includes('cipolla') || 
          nameLower.includes('aglio') || nameLower.includes('fungh') || 
          nameLower.includes('rucola') || nameLower.includes('verdur');
      })
      .map(([name, data]) => `□ ${name}: ${data.quantity}${data.unit === 'pz' ? ' pz' : data.unit}`)
      .join('\n');

    const carneList = Object.entries(shoppingList)
      .filter(([name]) => {
        const nameLower = name.toLowerCase();
        return nameLower.includes('manzo') || nameLower.includes('salmone') || 
          nameLower.includes('pollo') || nameLower.includes('merluzzo') || 
          nameLower.includes('carne');
      })
      .map(([name, data]) => `□ ${name}: ${data.quantity}${data.unit === 'pz' ? ' pz' : data.unit}`)
      .join('\n');

    const latticiniList = Object.entries(shoppingList)
      .filter(([name]) => {
        const nameLower = name.toLowerCase();
        return nameLower.includes('uovo') || nameLower.includes('yogurt') || 
          nameLower.includes('latte') || nameLower.includes('parmigiano') || 
          nameLower.includes('formaggio');
      })
      .map(([name, data]) => `□ ${name}: ${data.quantity}${data.unit === 'pz' ? ' pz' : data.unit}`)
      .join('\n');

    const cerealiList = Object.entries(shoppingList)
      .filter(([name]) => {
        const nameLower = name.toLowerCase();
        return nameLower.includes('pasta') || nameLower.includes('pane') || 
          nameLower.includes('avena') || nameLower.includes('quinoa') || 
          nameLower.includes('fagioli') || nameLower.includes('riso');
      })
      .map(([name, data]) => `□ ${name}: ${data.quantity}${data.unit === 'pz' ? ' pz' : data.unit}`)
      .join('\n');

    const fruttaList = Object.entries(shoppingList)
      .filter(([name]) => {
        const nameLower = name.toLowerCase();
        return nameLower.includes('avocado') || nameLower.includes('limone') || 
          nameLower.includes('banana') || nameLower.includes('frutti') || 
          nameLower.includes('granola') || nameLower.includes('miele') || 
          nameLower.includes('olio') || nameLower.includes('aceto');
      })
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

  // Funzione per parsare il piano AI in struttura dati GRAFICA
  const parsePlanFromAI = (aiResponse: string) => {
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
        },
        {
          day: "Giorno 2",
          meals: {
            colazione: {
              nome: "Bowl Energetico Yogurt e Granola",
              calorie: 633,
              proteine: 32,
              carboidrati: 87,
              grassi: 18,
              ingredienti: [
                "150g yogurt greco 0% grassi",
                "30g granola artigianale",
                "1/2 banana matura (60g)",
                "10g noci di pecan tritate",
                "1 cucchiaino burro di mandorle",
                "1 cucchiaino miele",
                "5g bacche di goji"
              ],
              preparazione: "In una bowl, versa lo yogurt greco. Taglia la banana a rondelle e disponila sopra. Aggiungi la granola, le noci tritate e le bacche di goji. Concludi con il burro di mandorle e il miele."
            },
            pranzo: {
              nome: "Salmone in Crosta di Erbe",
              calorie: 886,
              proteine: 66,
              carboidrati: 100,
              grassi: 25,
              ingredienti: [
                "120g filetto di salmone",
                "1 cucchiaio pangrattato (10g)",
                "Prezzemolo fresco (5g)",
                "1/2 spicchio aglio",
                "Zest di 1/4 limone",
                "1 cucchiaio olio extravergine",
                "100g verdure miste di stagione",
                "Sale e pepe q.b."
              ],
              preparazione: "Preriscalda il forno a 200°C. Mescola pangrattato, prezzemolo tritato, aglio e zest di limone. Condisci il salmone con olio, sale e pepe. Ricopri con la crosta di erbe. Cuoci in forno 12-15 minuti. Servi con verdure saltate."
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
          ...mockPlan.days[i % 2],
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

  // Carica automaticamente i dati salvati
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

  // Cancella i dati salvati
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

  // Auto-save form data come "preferiti"
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

  const handleReplacement = async (mealType: string, dayNumber: string) => {
    setIsReplacing(`${dayNumber}-${mealType}`);
    
    try {
      const response = await fetch('/api/replace-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData,
          mealType,
          dayNumber,
          currentPlan: generatedPlan
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setGeneratedPlan(result.updatedPlan);
        const parsed = parsePlanFromAI(result.updatedPlan);
        setParsedPlan(parsed);
      } else {
        alert('Errore nella sostituzione del pasto');
      }
    } catch (error) {
      alert('Errore di connessione per la sostituzione');
    } finally {
      setIsReplacing(null);
    }
  };

  const confirmPlan = () => {
    setShowPreview(false);
    setTimeout(() => {
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
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
      {/* Modal Sostituzione Ingredienti AI */}
      {showSubstituteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold mb-2" style={{color: '#8FBC8F'}}>
                    🔀 AI Sostituzione Ingrediente
                  </h3>
                  <p className="text-gray-300">
                    <span className="font-semibold">Ingrediente:</span> {selectedIngredient?.ingredient}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowSubstituteModal(false);
                    setSelectedIngredient(null);
                    setSubstitutes([]);
                  }}
                  className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              {isLoadingSubstitutes ? (
                <div className="text-center py-8">
                  <div className="animate-spin text-4xl mb-4">🤖</div>
                  <p className="text-lg">L'AI sta analizzando alternative intelligenti...</p>
                  <p className="text-sm text-gray-400 mt-2">Considerando allergie, preferenze e funzione culinaria</p>
                </div>
              ) : substitutes.length > 0 ? (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold mb-4">🎯 Alternative Consigliate:</h4>
                  {substitutes.map((substitute, index) => (
                    <div key={index} className="bg-gray-700 rounded-xl p-4 hover:bg-gray-600 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <h5 className="font-bold text-lg" style={{color: '#8FBC8F'}}>
                          {substitute.ingredient}
                        </h5>
                        <div className="flex gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            substitute.difficulty === 'Facile' ? 'bg-green-600' :
                            substitute.difficulty === 'Medio' ? 'bg-yellow-600' : 'bg-red-600'
                          }`}>
                            {substitute.difficulty}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            substitute.tasteChange === 'Minimo' ? 'bg-green-600' :
                            substitute.tasteChange === 'Moderato' ? 'bg-yellow-600' : 'bg-red-600'
                          }`}>
                            Sapore: {substitute.tasteChange}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 mb-3">{substitute.reason}</p>
                      
                      {substitute.cookingNotes && (
                        <p className="text-sm text-blue-300 mb-3">
                          💡 <strong>Note:</strong> {substitute.cookingNotes}
                        </p>
                      )}
                      
                      <button
                        onClick={() => applySubstitution(substitute.ingredient)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                      >
                        ✅ Usa Questo Ingrediente
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>Nessuna alternativa trovata</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-gray-900/90 backdrop-blur-md shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/images/icon-192x192.png" alt="Meal Prep Logo" className="w-10 h-10 rounded-full" />
            <h1 className="text-2xl font-bold">Meal Prep Planner</h1>
          </div>
          
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="hover:text-green-400 transition-colors">Home</Link>
            <Link href="/dashboard" className="hover:text-green-400 transition-colors">Dashboard</Link>
            <Link href="/ricette" className="hover:text-green-400 transition-colors">Ricette</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="text-center py-12 px-4" style={{background: 'linear-gradient(to right, #8FBC8F, #9ACD32)'}}>
        <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
          Rivoluziona la Tua Alimentazione con<br />Meal Prep Planner
        </h1>
        <p className="text-lg text-gray-800 mb-6 max-w-2xl mx-auto">
          Generazione meal prep, Lista della Spesa Intelligente e Ricette Passo-Passo per una Vita più Sana e Semplice.
        </p>
        <button 
          onClick={() => document.getElementById('meal-form')?.scrollIntoView({ behavior: 'smooth' })}
          className="bg-black text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-800 transition-all transform hover:scale-105"
        >
          Inizia Ora!
        </button>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold mb-12 text-center" style={{color: '#8FBC8F'}}>
          Perché Scegliere Meal Prep Planner?
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl">
            <div className="bg-gradient-to-br from-orange-400 to-red-500 h-48 rounded-t-xl flex items-center justify-center p-4">
              <img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&crop=center" alt="Risparmio di Tempo" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-3">Risparmio di Tempo</h3>
              <p className="text-gray-300">Prepara i tuoi pasti per più giorni in una sola sessione, liberando tempo prezioso durante la settimana.</p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl">
            <div className="bg-gradient-to-br from-green-400 to-emerald-500 h-48 rounded-t-xl flex items-center justify-center p-4">
              <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop&crop=center" alt="Riduzione degli Sprechi" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-3">Riduzione degli Sprechi</h3>
              <p className="text-gray-300">Una lista spesa precisa ti aiuta a comprare solo ciò che serve, riducendo gli sprechi alimentari e il budget.</p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl">
            <div className="bg-gradient-to-br from-blue-400 to-purple-500 h-48 rounded-t-xl flex items-center justify-center p-4">
              <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center" alt="Obiettivi Raggiungibili" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-3">Obiettivi Raggiungibili</h3>
              <p className="text-gray-300">Piani personalizzati per perdita peso, aumento massa o mantenimento, con calcolo calorico dettagliato.</p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 h-48 rounded-t-xl flex items-center justify-center p-4">
              <img src="/images/image4.png" alt="Ricette Varie e Gustose" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-3">Ricette Varie e Gustose</h3>
              <p className="text-gray-300">Scopri nuove ricette adatte alle tue preferenze e restrizioni alimentari.</p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl">
            <div className="bg-gradient-to-br from-pink-400 to-purple-500 h-48 rounded-t-xl flex items-center justify-center p-4">
              <img src="/images/image5.png" alt="Mobile-Friendly" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-3">Mobile-Friendly</h3>
              <p className="text-gray-300">Accedi ai tuoi piani e ricette ovunque, dal tuo smartphone o tablet.</p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl">
            <div className="bg-gradient-to-br from-teal-400 to-green-500 h-48 rounded-t-xl flex items-center justify-center p-4">
              <img src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&h=300&fit=crop&crop=center" alt="AI Sostituzione Ingredienti" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-3">🤖 AI Sostituzione Ingredienti</h3>
              <p className="text-gray-300">Non hai un ingrediente? L'AI ti suggerisce alternative intelligenti considerando allergie e preferenze.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12 text-center" style={{color: '#8FBC8F'}}>
            Come Funziona
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold" style={{backgroundColor: '#8FBC8F', color: 'black'}}>1</div>
              <h3 className="text-xl font-bold mb-3">Compila il Modulo</h3>
              <p className="text-gray-300">Inserisci le tue informazioni personali, obiettivi e preferenze alimentari.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold" style={{backgroundColor: '#8FBC8F', color: 'black'}}>2</div>
              <h3 className="text-xl font-bold mb-3">Ricevi Pasti e Ricette</h3>
              <p className="text-gray-300">Ottieni una programmazione personalizzata con ricette dettagliate e lista spesa.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold" style={{backgroundColor: '#8FBC8F', color: 'black'}}>3</div>
              <h3 className="text-xl font-bold mb-3">Prepara i Pasti</h3>
              <p className="text-gray-300">Segui le ricette passo-passo e prepara i tuoi meal prep.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold" style={{backgroundColor: '#8FBC8F', color: 'black'}}>4</div>
              <h3 className="text-xl font-bold mb-3">Goditi i Risultati</h3>
              <p className="text-gray-300">Risparmia tempo, denaro e raggiungi i tuoi obiettivi di salute.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section id="meal-form" className="max-w-4xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold mb-8 text-center" style={{color: '#8FBC8F'}}>
          🍽️ Crea la Tua Programmazione Pasti e Ricette
        </h2>

        <div className="flex flex-wrap gap-4 justify-center mb-8">
          {hasSavedData && (
            <div className="bg-green-600/20 border border-green-500 rounded-lg px-4 py-2 flex items-center gap-2">
              <span className="text-green-400">✅ Dati preferiti caricati</span>
            </div>
          )}
          
          {hasSavedData && (
            <button
              onClick={clearSavedData}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              🗑️ Cancella Dati e Inserisci Nuovi
            </button>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-8 shadow-2xl">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Nome</label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-green-400 focus:outline-none"
                required
                disabled={isGenerating}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Età</label>
              <input
                type="number"
                value={formData.eta}
                onChange={(e) => handleInputChange('eta', e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-green-400 focus:outline-none"
                required
                disabled={isGenerating}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Sesso</label>
              <select
                value={formData.sesso}
                onChange={(e) => handleInputChange('sesso', e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-green-400 focus:outline-none"
                required
                disabled={isGenerating}
              >
                <option value="">Seleziona...</option>
                <option value="maschio">Maschio</option>
                <option value="femmina">Femmina</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Peso (kg)</label>
              <input
                type="number"
                value={formData.peso}
                onChange={(e) => handleInputChange('peso', e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-green-400 focus:outline-none"
                required
                disabled={isGenerating}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Altezza (cm)</label>
              <input
                type="number"
                value={formData.altezza}
                onChange={(e) => handleInputChange('altezza', e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-green-400 focus:outline-none"
                required
                disabled={isGenerating}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Livello di Attività</label>
              <select
                value={formData.attivita}
                onChange={(e) => handleInputChange('attivita', e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-green-400 focus:outline-none"
                required
                disabled={isGenerating}
              >
                <option value="">Seleziona...</option>
                <option value="sedentario">Sedentario</option>
                <option value="leggero">Attività Leggera</option>
                <option value="moderato">Attività Moderata</option>
                <option value="intenso">Attività Intensa</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Obiettivo</label>
              <select
                value={formData.obiettivo}
                onChange={(e) => handleInputChange('obiettivo', e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-green-400 focus:outline-none"
                required
                disabled={isGenerating}
              >
                <option value="">Seleziona...</option>
                <option value="perdita-peso">Perdita di Peso</option>
                <option value="mantenimento">Mantenimento</option>
                <option value="aumento-massa">Aumento Massa Muscolare</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Durata Meal Prep (giorni)</label>
              <select
                value={formData.durata}
                onChange={(e) => handleInputChange('durata', e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-green-400 focus:outline-none"
                required
                disabled={isGenerating}
              >
                <option value="">Seleziona...</option>
                <option value="2">2 Giorni</option>
                <option value="3">3 Giorni</option>
                <option value="5">5 Giorni</option>
                <option value="7">7 Giorni</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Numero Pasti al Giorno</label>
              <select
                value={formData.pasti}
                onChange={(e) => handleInputChange('pasti', e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-green-400 focus:outline-none"
                required
                disabled={isGenerating}
              >
                <option value="">Seleziona...</option>
                <option value="3">3 Pasti</option>
                <option value="4">4 Pasti</option>
                <option value="5">5 Pasti</option>
                <option value="6">6 Pasti</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Varietà Pasti</label>
              <select
                value={formData.varieta}
                onChange={(e) => handleInputChange('varieta', e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-green-400 focus:outline-none"
                required
                disabled={isGenerating}
              >
                <option value="">Seleziona...</option>
                <option value="diversi">🔄 Pasti Diversi per Giorno</option>
                <option value="ripetuti">🎯 Stessi Pasti Tutti i Giorni</option>
              </select>
            </div>

          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">Allergie e Intolleranze</label>
            <textarea
              value={formData.allergie}
              onChange={(e) => handleInputChange('allergie', e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-green-400 focus:outline-none"
              rows={3}
              placeholder="Es: lattosio, glutine, noci..."
              disabled={isGenerating}
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">Preferenze Alimentari</label>
            <textarea
              value={formData.preferenze}
              onChange={(e) => handleInputChange('preferenze', e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-green-400 focus:outline-none"
              rows={3}
              placeholder="Es: vegetariano, vegano, mediterraneo..."
              disabled={isGenerating}
            />
          </div>

          <div className="mt-8 text-center">
            <button
              type="submit"
              disabled={isGenerating}
              className={`px-12 py-4 rounded-full text-lg font-semibold transition-all transform hover:scale-105 ${
                isGenerating 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'hover:opacity-90'
              }`}
              style={{backgroundColor: isGenerating ? '#6B7280' : '#8FBC8F', color: 'black'}}
            >
              {isGenerating ? '🍽️ Creando programmazione pasti...' : '🚀 Crea Programmazione Pasti e Ricette'}
            </button>
          </div>
        </form>
      </section>

      {/* ANTEPRIMA GRAFICA CON CARD COLORATE E AI */}
      {showPreview && parsedPlan && (
        <section id="preview-section" className="max-w-7xl mx-auto px-4 py-20">
          <h2 className="text-4xl font-bold mb-8 text-center" style={{color: '#8FBC8F'}}>
            📋 Anteprima del Tuo Piano Alimentare
          </h2>
          <p className="text-center text-gray-300 mb-8">
            Controlla il piano e clicca "🔄 Cambia" per sostituire un singolo pasto o "🔀" per sostituire un ingrediente
          </p>
          
          <div className="space-y-12">
            {parsedPlan.days.map((day: any, dayIndex: number) => (
              <div key={dayIndex} className="bg-gray-800 rounded-2xl p-8 shadow-2xl">
                <h3 className="text-3xl font-bold mb-8 text-center" style={{color: '#8FBC8F'}}>
                  {day.day}
                </h3>
                
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Colazione - Card Arancione */}
                  <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-xl">🌅 Colazione</h4>
                      <button
                        onClick={() => handleReplacement('colazione', day.day)}
                        disabled={isReplacing === `${day.day}-colazione`}
                        className="bg-white/20 hover:bg-white/30 disabled:bg-gray-600 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                      >
                        {isReplacing === `${day.day}-colazione` ? '⏳' : '🔄 Cambia'}
                      </button>
                    </div>
                    <h5 className="font-bold text-lg mb-3">{day.meals.colazione.nome}</h5>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="bg-red-700 px-3 py-1 rounded-full text-sm font-bold">
                        🔥 {day.meals.colazione.calorie} kcal
                      </span>
                      <span className="bg-green-700 px-3 py-1 rounded-full text-sm font-bold">
                        🥩 {day.meals.colazione.proteine}g
                      </span>
                      <span className="bg-yellow-600 px-3 py-1 rounded-full text-sm font-bold">
                        🍞 {day.meals.colazione.carboidrati}g
                      </span>
                      <span className="bg-purple-700 px-3 py-1 rounded-full text-sm font-bold">
                        🥑 {day.meals.colazione.grassi}g
                      </span>
                    </div>

                    <details className="group">
                      <summary className="cursor-pointer font-semibold mb-2 hover:text-orange-100">
                        📝 Ingredienti ({day.meals.colazione.ingredienti.length})
                      </summary>
                      <ul className="space-y-1 text-sm">
                        {day.meals.colazione.ingredienti.map((ing: string, i: number) => (
                          <li key={i} className="text-orange-100 flex items-center justify-between group/ingredient hover:bg-white/10 rounded px-2 py-1 transition-colors">
                            <span>• {ing}</span>
                            <button
                              onClick={() => handleIngredientSubstitution(ing, dayIndex, 'colazione', i)}
                              className="opacity-0 group-hover/ingredient:opacity-100 bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-xs font-bold transition-all"
                              title="Sostituisci con AI"
                            >
                              🔀
                            </button>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </div>

                  {/* Pranzo - Card Blu */}
                  <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-xl">☀️ Pranzo</h4>
                      <button
                        onClick={() => handleReplacement('pranzo', day.day)}
                        disabled={isReplacing === `${day.day}-pranzo`}
                        className="bg-white/20 hover:bg-white/30 disabled:bg-gray-600 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                      >
                        {isReplacing === `${day.day}-pranzo` ? '⏳' : '🔄 Cambia'}
                      </button>
                    </div>
                    <h5 className="font-bold text-lg mb-3">{day.meals.pranzo.nome}</h5>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="bg-red-700 px-3 py-1 rounded-full text-sm font-bold">
                        🔥 {day.meals.pranzo.calorie} kcal
                      </span>
                      <span className="bg-green-700 px-3 py-1 rounded-full text-sm font-bold">
                        🥩 {day.meals.pranzo.proteine}g
                      </span>
                      <span className="bg-yellow-600 px-3 py-1 rounded-full text-sm font-bold">
                        🍞 {day.meals.pranzo.carboidrati}g
                      </span>
                      <span className="bg-purple-700 px-3 py-1 rounded-full text-sm font-bold">
                        🥑 {day.meals.pranzo.grassi}g
                      </span>
                    </div>

                    <details className="group">
                      <summary className="cursor-pointer font-semibold mb-2 hover:text-blue-100">
                        📝 Ingredienti ({day.meals.pranzo.ingredienti.length})
                      </summary>
                      <ul className="space-y-1 text-sm">
                        {day.meals.pranzo.ingredienti.map((ing: string, i: number) => (
                          <li key={i} className="text-blue-100 flex items-center justify-between group/ingredient hover:bg-white/10 rounded px-2 py-1 transition-colors">
                            <span>• {ing}</span>
                            <button
                              onClick={() => handleIngredientSubstitution(ing, dayIndex, 'pranzo', i)}
                              className="opacity-0 group-hover/ingredient:opacity-100 bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-xs font-bold transition-all"
                              title="Sostituisci con AI"
                            >
                              🔀
                            </button>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </div>

                  {/* Cena - Card Viola */}
                  <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-xl">🌙 Cena</h4>
                      <button
                        onClick={() => handleReplacement('cena', day.day)}
                        disabled={isReplacing === `${day.day}-cena`}
                        className="bg-white/20 hover:bg-white/30 disabled:bg-gray-600 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                      >
                        {isReplacing === `${day.day}-cena` ? '⏳' : '🔄 Cambia'}
                      </button>
                    </div>
                    <h5 className="font-bold text-lg mb-3">{day.meals.cena.nome}</h5>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="bg-red-700 px-3 py-1 rounded-full text-sm font-bold">
                        🔥 {day.meals.cena.calorie} kcal
                      </span>
                      <span className="bg-green-700 px-3 py-1 rounded-full text-sm font-bold">
                        🥩 {day.meals.cena.proteine}g
                      </span>
                      <span className="bg-yellow-600 px-3 py-1 rounded-full text-sm font-bold">
                        🍞 {day.meals.cena.carboidrati}g
                      </span>
                      <span className="bg-purple-700 px-3 py-1 rounded-full text-sm font-bold">
                        🥑 {day.meals.cena.grassi}g
                      </span>
                    </div>

                    <details className="group">
                      <summary className="cursor-pointer font-semibold mb-2 hover:text-purple-100">
                        📝 Ingredienti ({day.meals.cena.ingredienti.length})
                      </summary>
                      <ul className="space-y-1 text-sm">
                        {day.meals.cena.ingredienti.map((ing: string, i: number) => (
                          <li key={i} className="text-purple-100 flex items-center justify-between group/ingredient hover:bg-white/10 rounded px-2 py-1 transition-colors">
                            <span>• {ing}</span>
                            <button
                              onClick={() => handleIngredientSubstitution(ing, dayIndex, 'cena', i)}
                              className="opacity-0 group-hover/ingredient:opacity-100 bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-xs font-bold transition-all"
                              title="Sostituisci con AI"
                            >
                              🔀
                            </button>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </div>
                </div>
                
                <div className="mt-6 bg-gray-700 rounded-lg p-4">
                  <p className="text-center font-bold text-lg">
                    📊 Totale Giorno: {day.meals.colazione.calorie + day.meals.pranzo.calorie + day.meals.cena.calorie} kcal
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 justify-center mt-12">
            <button
              onClick={confirmPlan}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors shadow-lg"
            >
              ✅ Conferma Piano
            </button>

            <button
              onClick={() => {
                setShowPreview(false);
                setGeneratedPlan(null);
                setParsedPlan(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors shadow-lg"
            >
              🔄 Genera Nuovo Piano
            </button>
          </div>
        </section>
      )}

      {/* Results Section */}
      {!showPreview && generatedPlan && (
        <section id="results-section" className="max-w-4xl mx-auto px-4 py-20">
          <h2 className="text-4xl font-bold mb-8 text-center" style={{color: '#8FBC8F'}}>
            🎉 La Tua Programmazione Pasti è Pronta!
          </h2>
          
          <div className="bg-gray-800 rounded-xl p-8 shadow-2xl mb-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-4">📋 Il Tuo Piano Alimentare</h3>
              <div className="bg-gray-700 rounded-lg p-6 max-h-96 overflow-y-auto" style={{fontFamily: 'Georgia, serif'}}>
                <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{generatedPlan}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => {
                  const text = `🍽️ Ecco il mio piano alimentare personalizzato!\n\n${generatedPlan}`;
                  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
                  window.open(whatsappUrl, '_blank');
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                📱 Condividi su WhatsApp
              </button>

              <button
                onClick={() => {
                  const printContent = `
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <meta charset="utf-8">
                        <title>Piano Alimentare - ${formData.nome || 'Utente'}</title>
                        <style>
                          @page { margin: 15mm; size: A4; }
                          body { 
                            font-family: 'Georgia', 'Times New Roman', serif; 
                            line-height: 1.4; color: #333; font-size: 12px;
                            margin: 0; padding: 0;
                          }
                          .header {
                            text-align: center; margin-bottom: 20px;
                            border-bottom: 2px solid #8FBC8F; padding-bottom: 10px;
                          }
                          .title { font-size: 20px; font-weight: bold; color: #2F4F4F; margin-bottom: 5px; }
                          .subtitle { font-size: 14px; color: #666; }
                          h2 {
                            color: #8FBC8F; font-size: 16px; margin: 20px 0 10px 0;
                            border-bottom: 1px solid #8FBC8F; padding-bottom: 5px;
                          }
                          pre { font-family: 'Georgia', serif; white-space: pre-wrap; font-size: 11px; line-height: 1.3; }
                          @media print { body { font-size: 11px; } .no-print { display: none; } }
                        </style>
                      </head>
                      <body>
                        <div class="header">
                          <div class="title">Piano Preparazione Pasti Personalizzato</div>
                          <div class="subtitle">Generato il ${new Date().toLocaleDateString('it-IT')} per ${formData.nome || 'Utente'}</div>
                        </div>
                        <div style="white-space: pre-wrap; font-family: Georgia, serif; line-height: 1.4;">
                          ${generatedPlan}
                        </div>
                      </body>
                    </html>
                  `;
                  
                  const printWindow = window.open('', '_blank', 'width=800,height=600');
                  if (printWindow) {
                    printWindow.document.write(printContent);
                    printWindow.document.close();
                    printWindow.onload = () => {
                      setTimeout(() => {
                        printWindow.print();
                      }, 500);
                    };
                  } else {
                    alert('Popup bloccato! Abilita i popup per scaricare il PDF');
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                📥 Scarica PDF
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedPlan);
                  alert('Piano copiato negli appunti!');
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                📋 Copia Testo
              </button>

              <button
                onClick={() => {
                  setGeneratedPlan(null);
                  setShowPreview(false);
                  setFormData({
                    nome: '', eta: '', sesso: '', peso: '', altezza: '', attivita: '', 
                    obiettivo: '', allergie: '', preferenze: '', pasti: '', durata: '', varieta: ''
                  });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                🔄 Nuovo Piano
              </button>
            </div>
          </div>
        </section>
      )}
      
      {/* FAQ Section */}
      {!generatedPlan && (
      <section className="bg-gray-800 py-20">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12 text-center" style={{color: '#8FBC8F'}}>
            Domande Frequenti
          </h2>
          
          <div className="space-y-6">
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3">Come funziona la programmazione?</h3>
              <p className="text-gray-300">Il sistema analizza i tuoi dati personali e crea una programmazione completa con ricette, lista spesa e consigli nutrizionali.</p>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3">Quanto tempo richiede la creazione?</h3>
              <p className="text-gray-300">La programmazione viene creata in 10-30 secondi, con un piano settimanale completo e ricette dettagliate.</p>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3">Posso modificare la programmazione?</h3>
              <p className="text-gray-300">Sì, puoi sempre creare una nuova programmazione con preferenze diverse o richiedere modifiche specifiche.</p>
            </div>

            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3">🤖 Come funziona la sostituzione ingredienti AI?</h3>
              <p className="text-gray-300">L'AI analizza ogni ingrediente e suggerisce alternative intelligenti considerando allergie, preferenze e funzione culinaria. Basta fare hover su un ingrediente e cliccare "🔀".</p>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-3 mb-6">
            <img src="/images/icon-192x192.png" alt="Meal Prep Logo" className="w-10 h-10 rounded-full" />
            <h3 className="text-2xl font-bold">Meal Prep Planner</h3>
          </div>
          <p className="text-gray-400 mb-6">
            Semplificare la tua alimentazione con programmazione intelligente.
          </p>
          <div className="flex justify-center gap-6">
            <Link href="/privacy" className="text-gray-400 hover:text-green-400">Privacy</Link>
            <Link href="/terms" className="text-gray-400 hover:text-green-400">Termini</Link>
            <Link href="/contact" className="text-gray-400 hover:text-green-400">Contatti</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

                