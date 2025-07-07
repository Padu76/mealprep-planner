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

  // Funzione per generare lista della spesa consolidata
  const generateShoppingList = (days: any[]) => {
    const ingredients: { [key: string]: { quantity: number, unit: string } } = {};
    
    days.forEach(day => {
      Object.values(day.meals).forEach((meal: any) => {
        meal.ingredienti.forEach((ingredient: string) => {
          // Estrai quantità e nome ingrediente
          const match = ingredient.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)\s+(.+)$/);
          if (match) {
            const [, qty, unit, name] = match;
            const key = `${name} (${unit})`;
            ingredients[key] = ingredients[key] || { quantity: 0, unit };
            ingredients[key].quantity += parseFloat(qty);
          } else {
            // Ingrediente senza quantità specifica
            const key = ingredient;
            ingredients[key] = ingredients[key] || { quantity: 1, unit: 'pz' };
            ingredients[key].quantity += 1;
          }
        });
      });
    });
    
    return ingredients;
  };

  // Funzione per generare il documento completo
  const generateCompleteDocument = (parsedPlan: any) => {
    const shoppingList = generateShoppingList(parsedPlan.days);
    const totalCalories = parsedPlan.days.reduce((sum: number, day: any) => 
      sum + Object.values(day.meals).reduce((daySum: number, meal: any) => daySum + meal.calorie, 0), 0
    );
    
    return `Meal Prep Planner - Piano Personalizzato
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
${Object.entries(shoppingList)
  .filter(([name]) => name.toLowerCase().includes('pomodor') || name.toLowerCase().includes('sedano') || 
    name.toLowerCase().includes('carota') || name.toLowerCase().includes('cipolla') || 
    name.toLowerCase().includes('aglio') || name.toLowerCase().includes('fungh') || 
    name.toLowerCase().includes('rucola') || name.toLowerCase().includes('verdur'))
  .map(([name, data]) => `□ ${name}: ${data.quantity}${data.unit === 'pz' ? ' pz' : data.unit}`)
  .join('\n')}

🍖 CARNE E PESCE
${Object.entries(shoppingList)
  .filter(([name]) => name.toLowerCase().includes('manzo') || name.toLowerCase().includes('salmone') || 
    name.toLowerCase().includes('pollo') || name.toLowerCase().includes('merluzzo') || 
    name.toLowerCase().includes('carne'))
  .map(([name, data]) => `□ ${name}: ${data.quantity}${data.unit === 'pz' ? ' pz' : data.unit}`)
  .join('\n')}

🥛 LATTICINI E UOVA
${Object.entries(shoppingList)
  .filter(([name]) => name.toLowerCase().includes('uovo') || name.toLowerCase().includes('yogurt') || 
    name.toLowerCase().includes('latte') || name.toLowerCase().includes('parmigiano') || 
    name.toLowerCase().includes('formaggio'))
  .map(([name, data]) => `□ ${name}: ${data.quantity}${data.unit === 'pz' ? ' pz' : data.unit}`)
  .join('\n')}

🌾 CEREALI E LEGUMI
${Object.entries(shoppingList)
  .filter(([name]) => name.toLowerCase().includes('pasta') || name.toLowerCase().includes('pane') || 
    name.toLowerCase().includes('avena') || name.toLowerCase().includes('quinoa') || 
    name.toLowerCase().includes('fagioli') || name.toLowerCase().includes('riso'))
  .map(([name, data]) => `□ ${name}: ${data.quantity}${data.unit === 'pz' ? ' pz' : data.unit}`)
  .join('\n')}

🥑 FRUTTA E ALTRO
${Object.entries(shoppingList)
  .filter(([name]) => name.toLowerCase().includes('avocado') || name.toLowerCase().includes('limone') || 
    name.toLowerCase().includes('banana') || name.toLowerCase().includes('frutti') || 
    name.toLowerCase().includes('granola') || name.toLowerCase().includes('miele') || 
    name.toLowerCase().includes('olio') || name.toLowerCase().includes('aceto'))
  .map(([name, data]) => `□ ${name}: ${data.quantity}${data.unit === 'pz' ? ' pz' : data.unit}`)
  .join('\n')}

📅 PROGRAMMA GIORNALIERO DETTAGLIATO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${parsedPlan.days.map((day: any, index: number) => `
${day.day.toUpperCase()}
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

🌅 COLAZIONE: ${day.meals.colazione.nome}
   🔥 ${day.meals.colazione.calorie} kcal | 🥩 ${day.meals.colazione.proteine}g | 🍞 ${day.meals.colazione.carboidrati}g | 🥑 ${day.meals.colazione.grassi}g
   
☀️ PRANZO: ${day.meals.pranzo.nome}
   🔥 ${day.meals.pranzo.calorie} kcal | 🥩 ${day.meals.pranzo.proteine}g | 🍞 ${day.meals.pranzo.carboidrati}g | 🥑 ${day.meals.pranzo.grassi}g
   
🌙 CENA: ${day.meals.cena.nome}
   🔥 ${day.meals.cena.calorie} kcal | 🥩 ${day.meals.cena.proteine}g | 🍞 ${day.meals.cena.carboidrati}g | 🥑 ${day.meals.cena.grassi}g

📊 TOTALE GIORNO: ${day.meals.colazione.calorie + day.meals.pranzo.calorie + day.meals.cena.calorie} kcal
`).join('')}

👨‍🍳 RICETTE PASSO-PASSO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${Object.entries(parsedPlan.days[0].meals).map(([mealType, meal]: [string, any]) => `
🍽️ ${meal.nome.toUpperCase()}
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

📊 VALORI NUTRIZIONALI:
• Calorie: ${meal.calorie} kcal
• Proteine: ${meal.proteine}g
• Carboidrati: ${meal.carboidrati}g  
• Grassi: ${meal.grassi}g

🛒 INGREDIENTI:
${meal.ingredienti.map((ing: string, idx: number) => `${idx + 1}. ${ing}`).join('\n')}

👩‍🍳 PREPARAZIONE:
${meal.preparazione}

⏱️ TEMPO PREPARAZIONE: 15-20 minuti
🍽️ PORZIONI: 1 persona

`).join('')}

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
Generated by Meal Prep Planner - ${new Date().toLocaleDateString('it-IT')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  };

  // Funzione per parsare il piano AI in struttura dati GRAFICA
  const parsePlanFromAI = (aiResponse: string) => {
    // Dati mock strutturati per l'anteprima grafica
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

    // Duplica i giorni in base alla durata e varietà scelta
    const numDays = parseInt(formData.durata) || 1;
    const allDays = [];
    
    if (formData.varieta === 'ripetuti') {
      // STESSI PASTI TUTTI I GIORNI - ripete sempre il Giorno 1
      for (let i = 0; i < numDays; i++) {
        allDays.push({
          ...mockPlan.days[0], // Sempre il primo giorno
          day: `Giorno ${i + 1}`
        });
      }
    } else {
      // PASTI DIVERSI - alterna tra i giorni disponibili
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

    // Carica automaticamente i dati salvati come "preferiti"
    loadSavedData();
  }, []);

  const checkSavedData = () => {
    const savedData = localStorage.getItem('mealPrepFormData');
    setHasSavedData(!!savedData);
  };

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
    
    // Clear existing timeout
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    
    // Set new timeout for auto-save
    const timeout = setTimeout(() => {
      localStorage.setItem('mealPrepFormData', JSON.stringify(newFormData));
      setHasSavedData(true);
      console.log('Dati salvati automaticamente come preferiti');
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
        // Rianalizza il piano per l'anteprima grafica
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

  // Funzione per salvare dati utente per analytics admin
  const saveUserToAdminDB = (userData: any, planData: any) => {
    const timestamp = Date.now();
    const userId = `user_${timestamp}`;
    
    // Crea record utente per dashboard admin
    const userRecord = {
      id: userId,
      timestamp,
      createdAt: new Date().toLocaleDateString('it-IT'),
      createdTime: new Date().toLocaleTimeString('it-IT'),
      sessionId: sessionStorage.getItem('sessionId') || `session_${timestamp}`,
      ...userData,
      planDetails: {
        durata: planData.durata,
        pasti: planData.pasti,
        varieta: planData.varieta === 'ripetuti' ? 'Stessi pasti' : 'Pasti diversi'
      },
      planType: 'free', // Default tutti free
      plansUsed: 1,
      lastAccess: new Date().toISOString(),
      status: 'active',
      leadScore: calculateLeadScore(userData),
      userAgent: navigator.userAgent,
      referrer: document.referrer || 'direct'
    };

    // Salva nel localStorage per dashboard admin
    localStorage.setItem(userId, JSON.stringify(userRecord));
    
    // Aggiorna statistiche globali
    updateGlobalStats();
    
    console.log('✅ Utente registrato nella dashboard admin:', userId);
  };

  // Calcola punteggio lead
  const calculateLeadScore = (userData: any) => {
    let score = 50; // Base score
    
    // Obiettivi specifici = più motivazione
    if (userData.obiettivo === 'perdita-peso') score += 20;
    if (userData.obiettivo === 'aumento-massa') score += 15;
    
    // Età target
    const eta = parseInt(userData.eta);
    if (eta >= 25 && eta <= 45) score += 15; // Target demografico
    
    // Attività fisica = più commitment
    if (userData.attivita === 'moderato' || userData.attivita === 'intenso') score += 10;
    
    // Allergie/preferenze specifiche = più engagement
    if (userData.allergie && userData.allergie.trim()) score += 5;
    if (userData.preferenze && userData.preferenze.trim()) score += 5;
    
    return Math.min(score, 100); // Max 100
  };

  // Aggiorna statistiche globali
  const updateGlobalStats = () => {
    const globalStats = JSON.parse(localStorage.getItem('globalStats') || '{}');
    
    globalStats.totalUsers = (globalStats.totalUsers || 0) + 1;
    globalStats.totalPlansGenerated = (globalStats.totalPlansGenerated || 0) + 1;
    globalStats.lastUpdate = new Date().toISOString();
    globalStats.todayUsers = (globalStats.todayUsers || 0) + 1;
    
    localStorage.setItem('globalStats', JSON.stringify(globalStats));
  };

  // Crea session ID univoco se non esiste
  useEffect(() => {
    if (!sessionStorage.getItem('sessionId')) {
      sessionStorage.setItem('sessionId', `session_${Date.now()}`);
    }
  }, []);

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
        
        // 📊 TRACKING AUTOMATICO - Salva utente nella dashboard admin
        saveUserToAdminDB(formData, formData);
        
        setShowPreview(true);
        
        // Scroll to preview
        setTimeout(() => {
          document.getElementById('preview-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        alert(`❌ Errore: ${result.error}\n\nDettagli: ${result.details || 'Nessun dettaglio disponibile'}`);
      }
    } catch (error) {
      alert('❌ Errore di connessione. Riprova più tardi.');
      console.error('Errore submit:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <header className="bg-gray-900/90 backdrop-blur-md shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full" style={{backgroundColor: '#8FBC8F'}}></div>
            <h1 className="text-2xl font-bold">Meal Prep Planner</h1>
          </div>
          
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="hover:text-green-400 transition-colors">Home</Link>
            <Link href="/dashboard" className="hover:text-green-400 transition-colors">Dashboard</Link>
            <Link href="/ricette" className="hover:text-green-400 transition-colors">Ricette</Link>
          </nav>

          {/* API Status */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              apiStatus === 'connected' ? 'bg-green-400' : 
              apiStatus === 'error' ? 'bg-red-400' : 'bg-yellow-400'
            }`}></div>
            <span className="text-sm">
              {apiStatus === 'connected' ? 'Attiva' : 
               apiStatus === 'error' ? 'Errore' : 'Verificando...'}
            </span>
          </div>
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
            <div className="bg-gradient-to-br from-orange-400 to-red-500 h-48 rounded-t-xl flex items-center justify-center p-3">
              <img src="/images/image1.png" alt="Risparmio di Tempo" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-3">Risparmio di Tempo</h3>
              <p className="text-gray-300 text-sm">Prepara i tuoi pasti per più giorni in una sola sessione.</p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl">
            <div className="bg-gradient-to-br from-green-400 to-emerald-500 h-48 rounded-t-xl flex items-center justify-center p-3">
              <img src="/images/image2.png" alt="Riduzione degli Sprechi" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-3">Riduzione degli Sprechi</h3>
              <p className="text-gray-300 text-sm">Lista spesa precisa per comprare solo ciò che serve.</p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl">
            <div className="bg-gradient-to-br from-blue-400 to-purple-500 h-48 rounded-t-xl flex items-center justify-center p-3">
              <img src="/images/image3.png" alt="Obiettivi Raggiungibili" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-3">Obiettivi Raggiungibili</h3>
              <p className="text-gray-300 text-sm">Piani personalizzati con calcolo calorico dettagliato.</p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 h-48 rounded-t-xl flex items-center justify-center p-3">
              <img src="/images/image4.png" alt="Ricette Varie e Gustose" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-3">Ricette Varie e Gustose</h3>
              <p className="text-gray-300 text-sm">Scopri nuove ricette adatte alle tue preferenze.</p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl">
            <div className="bg-gradient-to-br from-pink-400 to-purple-500 h-48 rounded-t-xl flex items-center justify-center p-3">
              <img src="/images/image5.png" alt="Mobile-Friendly" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-3">Mobile-Friendly</h3>
              <p className="text-gray-300 text-sm">Accedi ovunque dal tuo smartphone o tablet.</p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl">
            <div className="bg-gradient-to-br from-teal-400 to-green-500 h-48 rounded-t-xl flex items-center justify-center p-3">
              <img src="/images/image6.png" alt="Semplice e Intuitivo" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-3">Semplice e Intuitivo</h3>
              <p className="text-gray-300 text-sm">Interfaccia chiara e facile da usare per tutti.</p>
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

        {/* Status e Clear Data Button */}
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

      {/* NUOVA ANTEPRIMA GRAFICA CON CARD COLORATE */}
      {showPreview && parsedPlan && (
        <section id="preview-section" className="max-w-7xl mx-auto px-4 py-20">
          <h2 className="text-4xl font-bold mb-8 text-center" style={{color: '#8FBC8F'}}>
            📋 Anteprima del Tuo Piano Alimentare
          </h2>
          <p className="text-center text-gray-300 mb-8">
            Controlla il piano e clicca &quot;🔄 Cambia&quot; per sostituire un singolo pasto
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
                    
                    {/* Macronutrienti */}
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

                    {/* Ingredienti */}
                    <details className="group">
                      <summary className="cursor-pointer font-semibold mb-2 hover:text-orange-100">
                        📝 Ingredienti ({day.meals.colazione.ingredienti.length})
                      </summary>
                      <ul className="space-y-1 text-sm">
                        {day.meals.colazione.ingredienti.map((ing: string, i: number) => (
                          <li key={i} className="text-orange-100">• {ing}</li>
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
                    
                    {/* Macronutrienti */}
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

                    {/* Ingredienti */}
                    <details className="group">
                      <summary className="cursor-pointer font-semibold mb-2 hover:text-blue-100">
                        📝 Ingredienti ({day.meals.pranzo.ingredienti.length})
                      </summary>
                      <ul className="space-y-1 text-sm">
                        {day.meals.pranzo.ingredienti.map((ing: string, i: number) => (
                          <li key={i} className="text-blue-100">• {ing}</li>
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
                    
                    {/* Macronutrienti */}
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

                    {/* Ingredienti */}
                    <details className="group">
                      <summary className="cursor-pointer font-semibold mb-2 hover:text-purple-100">
                        📝 Ingredienti ({day.meals.cena.ingredienti.length})
                      </summary>
                      <ul className="space-y-1 text-sm">
                        {day.meals.cena.ingredienti.map((ing: string, i: number) => (
                          <li key={i} className="text-purple-100">• {ing}</li>
                        ))}
                      </ul>
                    </details>
                  </div>
                </div>
                
                {/* Totale Giornaliero */}
                <div className="mt-6 bg-gray-700 rounded-lg p-4">
                  <p className="text-center font-bold text-lg">
                    📊 Totale Giorno: {day.meals.colazione.calorie + day.meals.pranzo.calorie + day.meals.cena.calorie} kcal
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Preview Action Buttons */}
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

      {/* Results Section - Only show after confirmation */}
      {!showPreview && generatedPlan && (
        <section id="results-section" className="max-w-4xl mx-auto px-4 py-20">
          <h2 className="text-4xl font-bold mb-8 text-center" style={{color: '#8FBC8F'}}>
            🎉 La Tua Programmazione Pasti è Pronta!
          </h2>
          
          <div className="bg-gray-800 rounded-xl p-8 shadow-2xl mb-8">
            <div className="mb-6">
              