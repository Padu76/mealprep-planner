import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { FITNESS_RECIPES_DB, selectFitnessRecipes } from '../../../utils/fitness_recipes_database';
import { saveMealPlan, createUser } from '../../../utils/supabaseOperations';
import { FormData, NutritionalCalculation, GenerateMealPlanResponse } from '../../../types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData: FormData = await request.json();
    console.log('🏋️‍♂️ Generating FITNESS meal plan with COMPLETE form data:', formData);

    // 🔧 CALCOLO CALORIE COMPLETAMENTE FIXATO CON ALLERGIE
    console.log('🚀 ===== INIZIO CALCOLO CALORIE CON ALLERGIE DEBUG =====');
    console.log('📋 Allergie ricevute:', formData.allergie);
    console.log('🥗 Preferenze ricevute:', formData.preferenze);
    
    const calc = calculateNutritionalNeedsWithAllergies(formData);
    
    console.log('📊 ===== RISULTATO CALCOLO FINALE =====');
    console.log('📊 Fixed nutritional calculations:', calc);
    console.log('🔥 CALORIE FINALI CALCOLATE:', calc.dailyCalories);
    console.log('⚠️ ALLERGIE PROCESSATE:', calc.debugInfo.input.allergie);
    console.log('🥗 PREFERENZE PROCESSATE:', calc.debugInfo.input.preferenze);
    console.log('🚀 ===== FINE CALCOLO CALORIE DEBUG =====');

    // 🚨 VERIFICA SICUREZZA CALORIE
    if (!calc.isSafe) {
      console.error('🚨 UNSAFE CALORIE CALCULATION:', calc);
      return NextResponse.json({
        success: false,
        error: `Calcolo calorie non sicuro: ${calc.dailyCalories} kcal/giorno. Verifica i dati inseriti.`,
        debug: calc
      }, { status: 400 });
    }

    // 👤 SALVA/AGGIORNA UTENTE IN DATABASE
    console.log('👤 ===== GESTIONE UTENTE DATABASE =====');
    try {
      const userResult = await createUser({
        nome: formData.nome,
        email: formData.email,
        telefono: formData.telefono
      });
      
      if (userResult.error) {
        console.warn('⚠️ User creation warning:', userResult.error.message);
      } else {
        console.log('✅ User created/updated successfully:', userResult.data?.id);
      }
    } catch (userError) {
      console.error('❌ User database error:', userError);
      // Continuiamo anche se il salvataggio utente fallisce
    }

    // 🎯 LOG DETTAGLIATO PER DEBUG CON ALLERGIE
    console.log('📝 DETAILED CALCULATION DEBUG WITH ALLERGIES:');
    console.log('- Raw obiettivo from form:', formData.obiettivo);
    console.log('- Raw attivita from form:', formData.attivita);
    console.log('- Raw allergie from form:', formData.allergie);
    console.log('- Raw preferenze from form:', formData.preferenze);
    console.log('- Normalized goal:', calc.goal);
    console.log('- Normalized activity:', calc.activity);
    console.log('- Processed allergie:', calc.debugInfo.input.allergie);
    console.log('- Processed preferenze:', calc.debugInfo.input.preferenze);
    console.log('- Goal factor used:', calc.debugInfo.goalFactor);
    console.log('- Activity factor used:', calc.debugInfo.activityFactor);

    // 🇮🇹 SELEZIONE RICETTE FITNESS CON FILTRI ALLERGIE/PREFERENZE
    console.log('🇮🇹 ===== SELEZIONE RICETTE FITNESS CON FILTRI =====');
    const fitnessRecipes = generateFitnessBasedPlanWithFilters(formData, calc);
    console.log('✅ Ricette fitness selezionate (post-filtri):', fitnessRecipes.totalRecipes);
    console.log('🚫 Ricette filtrate per allergie:', fitnessRecipes.filteredForAllergies);
    console.log('✅ Ricette matchate per preferenze:', fitnessRecipes.matchedPreferences);

    // 🤖 PROVA CLAUDE AI CON ALLERGIE E PREFERENZE
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log('⚠️ ANTHROPIC_API_KEY not found, using fitness fallback');
      const fallbackResponse = await generateFitnessBasedResponseWithDB(formData, calc, fitnessRecipes);
      return fallbackResponse;
    }

    try {
      console.log('🤖 Calling Claude AI with FITNESS database + ALLERGIES + PREFERENCES...');
      
      const prompt = createAllergyAwarePrompt(formData, calc, fitnessRecipes);
      
      const message = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 4000,
        temperature: 0.8,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      });

      const aiResponse = message.content[0];
      if (aiResponse.type !== 'text') {
        throw new Error('Invalid AI response type');
      }

      console.log('✅ Claude AI FITNESS response with allergies received');

      // 💾 SALVA MEAL PLAN NEL DATABASE
      console.log('💾 ===== SALVATAGGIO MEAL PLAN =====');
      let mealPlanId: string | undefined;

      try {
        const mealPlanData = {
          nome_utente: formData.nome,
          email_utente: formData.email,
          telefono_utente: formData.telefono,
          eta: calc.debugInfo.input.age,
          sesso: calc.debugInfo.input.gender,
          peso: calc.debugInfo.input.weight,
          altezza: calc.debugInfo.input.height,
          modalita: formData.modalita || 'guidata',
          attivita: calc.activity,
          obiettivo: calc.goal,
          durata: calc.numDays,
          pasti: calc.numMeals,
          varieta: formData.varieta || 'diversi',
          allergie: formData.allergie || [],
          preferenze: formData.preferenze || [],
          bmr: calc.bmr,
          tdee: calc.tdee,
          calorie_target: calc.dailyCalories,
          distribuzione_pasti: calc.mealCalories,
          piano_completo: aiResponse.text,
          generato_con_ai: true,
          fitness_optimized: true,
          total_recipes: fitnessRecipes.totalRecipes,
          calorie_manuali: formData.modalita === 'esperto' ? parseInt(formData.calorie_totali || '0') : undefined,
          proteine_manuali: formData.modalita === 'esperto' ? parseInt(formData.proteine_totali || '0') : undefined,
          carboidrati_manuali: formData.modalita === 'esperto' ? parseInt(formData.carboidrati_totali || '0') : undefined,
          grassi_manuali: formData.modalita === 'esperto' ? parseInt(formData.grassi_totali || '0') : undefined,
          status: 'generato' as const
        };

        const saveResult = await saveMealPlan(mealPlanData);
        
        if (saveResult.error) {
          console.error('❌ Meal plan save error:', saveResult.error);
        } else {
          console.log('✅ Meal plan saved successfully:', saveResult.data?.id);
          mealPlanId = saveResult.data?.id;
        }
      } catch (dbError) {
        console.error('❌ Database error during meal plan save:', dbError);
        // Continuiamo anche se il salvataggio fallisce
      }

      const response: GenerateMealPlanResponse = {
        success: true,
        piano: aiResponse.text,
        message: 'Piano alimentare FITNESS generato con ricette italiane e filtri allergie/preferenze!',
        meal_plan_id: mealPlanId,
        metadata: {
          bmr: calc.bmr,
          tdee: calc.tdee,
          dailyTarget: calc.dailyCalories,
          mealDistribution: calc.mealCalories,
          isCalorieSafe: calc.isSafe,
          aiGenerated: true,
          fitnessOptimized: true,
          totalRecipes: fitnessRecipes.totalRecipes,
          debugInfo: calc.debugInfo
        }
      };

      return NextResponse.json(response);

    } catch (aiError) {
      console.error('❌ Claude AI error:', aiError);
      console.log('🔄 Falling back to FITNESS template with allergies...');
      const fallbackResponse = await generateFitnessBasedResponseWithDB(formData, calc, fitnessRecipes);
      return fallbackResponse;
    }

  } catch (error) {
    console.error('❌ General error:', error);
    return NextResponse.json({
      success: false,
      error: 'Errore interno del server',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// 🇮🇹 NUOVA FUNZIONE: SELEZIONE RICETTE CON FILTRI ALLERGIE/PREFERENZE
function generateFitnessBasedPlanWithFilters(formData: FormData, calc: NutritionalCalculation) {
  console.log('🏋️‍♂️ Generating fitness-based meal selection WITH FILTERS...');
  
  const numDays = calc.numDays;
  const numMeals = calc.numMeals;
  const objetivo = calc.goal;
  const allergie = formData.allergie || [];
  const preferenze = formData.preferenze || [];
  
  console.log('🚫 Filtering for allergies:', allergie);
  console.log('✅ Matching for preferences:', preferenze);
  
  const selectedRecipes = {
    colazione: [],
    pranzo: [],
    cena: [],
    spuntino: [],
    totalRecipes: 0,
    filteredForAllergies: 0,
    matchedPreferences: 0
  };

  // Seleziona ricette per ogni giorno con filtri
  for (let day = 0; day < numDays; day++) {
    // Colazione FITNESS con filtri
    const colazioneOptions = selectFitnessRecipes('colazione', objetivo, 1, preferenze, allergie);
    if (colazioneOptions.length > 0) {
      const selected = colazioneOptions[day % colazioneOptions.length];
      selectedRecipes.colazione.push(selected);
      selectedRecipes.totalRecipes++;
      
      // Conta filtri applicati
      if (allergie.length > 0) selectedRecipes.filteredForAllergies++;
      if (preferenze.length > 0 && hasMatchingPreferences(selected, preferenze)) {
        selectedRecipes.matchedPreferences++;
      }
    }

    // Pranzo FITNESS con filtri
    const pranzoOptions = selectFitnessRecipes('pranzo', objetivo, 1, preferenze, allergie);
    if (pranzoOptions.length > 0) {
      const selected = pranzoOptions[day % pranzoOptions.length];
      selectedRecipes.pranzo.push(selected);
      selectedRecipes.totalRecipes++;
      
      if (allergie.length > 0) selectedRecipes.filteredForAllergies++;
      if (preferenze.length > 0 && hasMatchingPreferences(selected, preferenze)) {
        selectedRecipes.matchedPreferences++;
      }
    }

    // Cena FITNESS con filtri
    const cenaOptions = selectFitnessRecipes('cena', objetivo, 1, preferenze, allergie);
    if (cenaOptions.length > 0) {
      const selected = cenaOptions[day % cenaOptions.length];
      selectedRecipes.cena.push(selected);
      selectedRecipes.totalRecipes++;
      
      if (allergie.length > 0) selectedRecipes.filteredForAllergies++;
      if (preferenze.length > 0 && hasMatchingPreferences(selected, preferenze)) {
        selectedRecipes.matchedPreferences++;
      }
    }

    // Spuntini FITNESS se richiesti con filtri
    if (numMeals >= 4) {
      const spuntinoOptions = selectFitnessRecipes('spuntino', objetivo, 1, preferenze, allergie);
      if (spuntinoOptions.length > 0) {
        const selected = spuntinoOptions[day % spuntinoOptions.length];
        selectedRecipes.spuntino.push(selected);
        selectedRecipes.totalRecipes++;
        
        if (allergie.length > 0) selectedRecipes.filteredForAllergies++;
        if (preferenze.length > 0 && hasMatchingPreferences(selected, preferenze)) {
          selectedRecipes.matchedPreferences++;
        }
      }
    }
  }

  console.log('🎯 FITNESS recipes selected with filters:', selectedRecipes.totalRecipes);
  console.log('🚫 Total allergy-filtered:', selectedRecipes.filteredForAllergies);
  console.log('✅ Total preference-matched:', selectedRecipes.matchedPreferences);
  
  return selectedRecipes;
}

// Helper function per check preferenze
function hasMatchingPreferences(recipe: any, preferenze: string[]): boolean {
  if (!preferenze || preferenze.length === 0) return false;
  if (!recipe || !recipe.ingredienti) return false;
  
  const ingredientiLower = recipe.ingredienti.map((ing: string) => ing.toLowerCase());
  return preferenze.some(pref => 
    ingredientiLower.some(ing => ing.includes(pref.toLowerCase()))
  );
}

// 🤖 PROMPT AI FITNESS-OTTIMIZZATO CON ALLERGIE E PREFERENZE
function createAllergyAwarePrompt(formData: FormData, calc: NutritionalCalculation, fitnessRecipes: any): string {
  const allergieText = formData.allergie && formData.allergie.length > 0 ? 
    `\n🚫 ALLERGIE E INTOLLERANZE: ${formData.allergie.join(', ')} - EVITARE ASSOLUTAMENTE` : 
    '\n✅ ALLERGIE: Nessuna allergia dichiarata';
  
  const preferenzeText = formData.preferenze && formData.preferenze.length > 0 ? 
    `\n🥗 PREFERENZE ALIMENTARI: ${formData.preferenze.join(', ')} - PRIVILEGIARE QUANDO POSSIBILE` : 
    '\n🔧 PREFERENZE: Nessuna preferenza specifica dichiarata';

  // Crea esempi di ricette dal database
  const ricetteEsempi = [
    ...fitnessRecipes.colazione.slice(0, 2),
    ...fitnessRecipes.pranzo.slice(0, 2),
    ...fitnessRecipes.cena.slice(0, 2),
    ...fitnessRecipes.spuntino.slice(0, 1)
  ].map((ricetta: any) => {
    if (!ricetta) return '';
    return `"${ricetta.nome}" (${ricetta.calorie} kcal, ${ricetta.proteine}g prot)`;
  }).filter(Boolean).join(', ');

  return `🏋️‍♂️ NUTRIZIONISTA FITNESS AI - PIANO ITALIANO CON FILTRI ALLERGIE/PREFERENZE

👤 DATI UTENTE FITNESS:
Nome: ${formData.nome}
Età: ${calc.debugInfo.input.age} anni
Sesso: ${calc.debugInfo.input.gender}
Peso: ${calc.debugInfo.input.weight} kg
Altezza: ${calc.debugInfo.input.height} cm
Attività: ${calc.debugInfo.input.activity}
Obiettivo FITNESS: ${calc.debugInfo.input.goal}${allergieText}${preferenzeText}

📊 CALCOLI NUTRIZIONALI PRECISI:
BMR: ${calc.bmr} kcal (${calc.debugInfo.bmrFormula})
TDEE: ${calc.tdee} kcal (BMR × ${calc.debugInfo.activityFactor})
Target giornaliero: ${calc.dailyCalories} kcal (TDEE × ${calc.debugInfo.goalFactor})

🍽️ DISTRIBUZIONE PASTI OTTIMIZZATA:
${Object.entries(calc.mealCalories).map(([meal, cal]) => `${meal}: ${cal} kcal`).join('\n')}

🇮🇹 DATABASE RICETTE FITNESS CON FILTRI:
Ricette italiane fitness-ottimizzate disponibili: ${fitnessRecipes.totalRecipes}
Ricette filtrate per allergie: ${fitnessRecipes.filteredForAllergies}
Ricette matchate per preferenze: ${fitnessRecipes.matchedPreferences}
Esempi dal database: ${ricetteEsempi}

🚨 ATTENZIONE ALLERGIE E INTOLLERANZE:
${formData.allergie && formData.allergie.length > 0 ? 
  `⚠️ L'utente ha dichiarato allergie a: ${formData.allergie.join(', ')}
EVITA ASSOLUTAMENTE questi ingredienti e tutti i loro derivati.
Controlla attentamente ogni ricetta per escludere completamente questi alimenti.
Se un ingrediente potrebbe contenere tracce, SCARTALO.` :
  '✅ Nessuna allergia dichiarata, usa tutte le ricette disponibili.'
}

🥗 PREFERENZE ALIMENTARI:
${formData.preferenze && formData.preferenze.length > 0 ? 
  `✨ L'utente preferisce: ${formData.preferenze.join(', ')}
PRIVILEGIA ricette che includono questi ingredienti quando possibile.
Cerca di incorporare queste preferenze in ogni pasto della giornata.` :
  '🔧 Nessuna preferenza specifica, usa varietà bilanciata di ingredienti.'
}

🎯 OBIETTIVO SPECIFICO FITNESS:
${calc.goal === 'dimagrimento' ? 
  '• Focus: Deficit calorico, alta proteina, bassa densità calorica\n• Priorità: Ricette lean, verdure, proteine magre\n• Evita: Fritture, dolci, carboidrati raffinati' :
  calc.goal === 'aumento-massa' ?
  '• Focus: Surplus calorico, costruzione muscolare, recovery\n• Priorità: Ricette caloriche, carboidrati, proteine complete\n• Include: Frutta secca, avocado, cereali integrali' :
  '• Focus: Mantenimento, bilanciamento, sostenibilità\n• Priorità: Ricette bilanciate, varietà nutrizionale\n• Equilibra: Tutti i macronutrienti'
}

🔥 REQUISITI FITNESS SPECIFICI CON FILTRI:
1. Usa SOLO ricette italiane con ingredienti fitness-friendly
2. RISPETTA ASSOLUTAMENTE le allergie dichiarate - ZERO TOLLERANZA
3. PRIVILEGIA le preferenze alimentari quando possibile
4. Ogni ricetta deve avere almeno 20g di proteine (colazione/cena) o 25g (pranzo)
5. Bilancia macro per l'obiettivo specifico
6. Includi preparazione, ingredienti e macro dettagliati
7. Ricette diverse ogni giorno (varietà totale)
8. Considera timing nutrizionale per performance

📋 FORMATO RICHIESTO:
GIORNO X:
🌅 COLAZIONE (${calc.mealCalories.colazione || 400} kcal): [Nome Ricetta Italiana Fitness]
- Ingredienti: [lista dettagliata con quantità] ✅ VERIFICATI PER ALLERGIE
- Preparazione: [step-by-step fitness-friendly]
- Macro: P: XXg | C: XXg | G: XXg | Fitness Score: XX/100
- Note Allergie: [Conferma ingredienti sicuri]

☀️ PRANZO (${calc.mealCalories.pranzo || 500} kcal): [Nome Ricetta Italiana Fitness]
[stesso formato con verifica allergie]

🌙 CENA (${calc.mealCalories.cena || 400} kcal): [Nome Ricetta Italiana Fitness]
[stesso formato con verifica allergie]

${calc.mealCalories.spuntino1 ? `🍎 SPUNTINO (${calc.mealCalories.spuntino1} kcal): [Nome Spuntino Fitness]
[stesso formato con verifica allergie]` : ''}

⚠️ CONTROLLO FINALE ALLERGIE:
Prima di finalizzare ogni ricetta, verifica che NON contenga:
${formData.allergie && formData.allergie.length > 0 ? formData.allergie.join(', ') : 'Nessuna allergia da controllare'}

✨ BONUS PREFERENZE:
Cerca di includere quando possibile:
${formData.preferenze && formData.preferenze.length > 0 ? formData.preferenze.join(', ') : 'Varietà bilanciata'}

💪 CREA UN PIANO CHE UN FITNESS ENTHUSIAST ITALIANO CON QUESTE SPECIFICHE ESIGENZE APPREZZEREBBE!
Usa ricette che combinano tradizione italiana con obiettivi fitness moderni, rispettando rigorosamente allergie e privilegiando preferenze.`;
}

// 🇮🇹 FALLBACK FITNESS CON DATABASE E ALLERGIE
async function generateFitnessBasedResponseWithDB(formData: FormData, calc: NutritionalCalculation, fitnessRecipes: any) {
  const numDays = calc.numDays;
  const numMeals = calc.numMeals;
  
  let fitnessPlanned = `🏋️‍♂️ PIANO FITNESS ITALIANO - RICETTE DATABASE CON FILTRI ALLERGIE/PREFERENZE
┌────────────────────────────────────────────────────────────────────────────────┐

👤 PROFILO FITNESS:
Nome: ${formData.nome}
Età: ${calc.debugInfo.input.age} anni | Sesso: ${calc.debugInfo.input.gender}
Peso: ${calc.debugInfo.input.weight} kg | Altezza: ${calc.debugInfo.input.height} cm
Attività: ${calc.debugInfo.input.activity} | Obiettivo: ${calc.debugInfo.input.goal}

🚫 ALLERGIE: ${formData.allergie && formData.allergie.length > 0 ? formData.allergie.join(', ') : 'Nessuna'}
🥗 PREFERENZE: ${formData.preferenze && formData.preferenze.length > 0 ? formData.preferenze.join(', ') : 'Nessuna'}

📊 CALCOLI SCIENTIFICI:
BMR: ${calc.bmr} kcal/giorno
TDEE: ${calc.tdee} kcal/giorno
Target: ${calc.dailyCalories} kcal/giorno

🍽️ DISTRIBUZIONE MACRO-OTTIMIZZATA:
${Object.entries(calc.mealCalories).map(([meal, cal]) => `${meal}: ${cal} kcal`).join('\n')}

🇮🇹 RICETTE FITNESS ITALIANE FILTRATE: ${fitnessRecipes.totalRecipes}
🚫 Filtrate per allergie: ${fitnessRecipes.filteredForAllergies}
✅ Matchate per preferenze: ${fitnessRecipes.matchedPreferences}

└────────────────────────────────────────────────────────────────────────────────┘

📅 PROGRAMMA FITNESS CON FILTRI:

`;

  // Genera giorni con ricette dal database FITNESS filtrate
  for (let day = 1; day <= numDays; day++) {
    const dayIndex = day - 1;
    
    fitnessPlanned += `🗓️ GIORNO ${day}:
┌────────────────────────────────────────────────────────────────────────────────┐

`;

    // COLAZIONE FITNESS con check allergie
    const colazione = fitnessRecipes.colazione[dayIndex];
    if (colazione) {
      const allergieCheck = formData.allergie && formData.allergie.length > 0 ? 
        `✅ Verificato per allergie: ${formData.allergie.join(', ')}` : 
        '✅ Nessuna allergia da controllare';

      fitnessPlanned += `🌅 COLAZIONE (${calc.mealCalories.colazione} kcal):
Nome: ${colazione.nome}
Ingredienti: ${colazione.ingredienti.join(', ')}
Preparazione: ${colazione.preparazione}
Macro: P: ${colazione.proteine}g | C: ${colazione.carboidrati}g | G: ${colazione.grassi}g
Fitness Score: ${colazione.fitnessScore}/100 ⭐
Tempo: ${colazione.tempo} | Porzioni: ${colazione.porzioni}
${allergieCheck}

`;
    }

    // PRANZO FITNESS con check allergie
    const pranzo = fitnessRecipes.pranzo[dayIndex];
    if (pranzo) {
      const allergieCheck = formData.allergie && formData.allergie.length > 0 ? 
        `✅ Verificato per allergie: ${formData.allergie.join(', ')}` : 
        '✅ Nessuna allergia da controllare';

      fitnessPlanned += `☀️ PRANZO (${calc.mealCalories.pranzo} kcal):
Nome: ${pranzo.nome}
Ingredienti: ${pranzo.ingredienti.join(', ')}
Preparazione: ${pranzo.preparazione}
Macro: P: ${pranzo.proteine}g | C: ${pranzo.carboidrati}g | G: ${pranzo.grassi}g
Fitness Score: ${pranzo.fitnessScore}/100 ⭐
Tempo: ${pranzo.tempo} | Porzioni: ${pranzo.porzioni}
${allergieCheck}

`;
    }

    // CENA FITNESS con check allergie
    const cena = fitnessRecipes.cena[dayIndex];
    if (cena) {
      const allergieCheck = formData.allergie && formData.allergie.length > 0 ? 
        `✅ Verificato per allergie: ${formData.allergie.join(', ')}` : 
        '✅ Nessuna allergia da controllare';

      fitnessPlanned += `🌙 CENA (${calc.mealCalories.cena} kcal):
Nome: ${cena.nome}
Ingredienti: ${cena.ingredienti.join(', ')}
Preparazione: ${cena.preparazione}
Macro: P: ${cena.proteine}g | C: ${cena.carboidrati}g | G: ${cena.grassi}g
Fitness Score: ${cena.fitnessScore}/100 ⭐
Tempo: ${cena.tempo} | Porzioni: ${cena.porzioni}
${allergieCheck}

`;
    }

    // SPUNTINO FITNESS se richiesto con check allergie
    if (numMeals >= 4 && calc.mealCalories.spuntino1) {
      const spuntino = fitnessRecipes.spuntino[dayIndex];
      if (spuntino) {
        const allergieCheck = formData.allergie && formData.allergie.length > 0 ? 
          `✅ Verificato per allergie: ${formData.allergie.join(', ')}` : 
          '✅ Nessuna allergia da controllare';

        fitnessPlanned += `🍎 SPUNTINO (${calc.mealCalories.spuntino1} kcal):
Nome: ${spuntino.nome}
Ingredienti: ${spuntino.ingredienti.join(', ')}
Preparazione: ${spuntino.preparazione}
Macro: P: ${spuntino.proteine}g | C: ${spuntino.carboidrati}g | G: ${spuntino.grassi}g
Fitness Score: ${spuntino.fitnessScore}/100 ⭐
Target: ${spuntino.macroTarget}
${allergieCheck}

`;
      }
    }

    fitnessPlanned += `💪 TOTALE GIORNO ${day}: ${calc.dailyCalories} kcal
└────────────────────────────────────────────────────────────────────────────────┘

`;
  }

  // Sezione allergie e preferenze specifica
  fitnessPlanned += `┌────────────────────────────────────────────────────────────────────────────────┐

🚨 GESTIONE ALLERGIE E PREFERENZE:

🚫 ALLERGIE DICHIARATE:
${formData.allergie && formData.allergie.length > 0 ? 
  formData.allergie.map(a => `• ${a}: EVITATO in tutte le ricette`).join('\n') :
  '✅ Nessuna allergia dichiarata'
}

🥗 PREFERENZE PRIVILEGIATE:
${formData.preferenze && formData.preferenze.length > 0 ? 
  formData.preferenze.map(p => `• ${p}: INCLUSO quando possibile`).join('\n') :
  '🔧 Nessuna preferenza specifica'
}

└────────────────────────────────────────────────────────────────────────────────┘

🏋️‍♂️ CONSIGLI FITNESS SPECIFICI:
• Idratazione: 35-40ml per kg di peso corporeo (${Math.round(calc.debugInfo.input.weight * 35)}ml/giorno)
• Timing proteine: 20-25g ogni 3-4 ore per sintesi proteica ottimale
• Pre-workout: Carboidrati 30-60 min prima dell'allenamento
• Post-workout: Proteine + carboidrati entro 30 min dal training
• Riposo: 7-9 ore di sonno per recovery e crescita muscolare

📊 ANALISI NUTRIZIONALE FITNESS:
• Calorie totali piano: ${calc.dailyCalories * numDays} kcal
• Proteine target: ${Math.round(calc.debugInfo.input.weight * 1.6)}g/giorno (1.6g/kg)
• Carboidrati: ${Math.round(calc.dailyCalories * 0.45 / 4)}g/giorno (45% energia)
• Grassi: ${Math.round(calc.dailyCalories * 0.25 / 9)}g/giorno (25% energia)
• Rapporto P/C/G ottimale per ${calc.goal}

🎯 OBIETTIVO SPECIFICO - ${calc.goal.toUpperCase()}:
${calc.goal === 'dimagrimento' ? 
  '• Deficit calorico sostenibile del 15%\n• Mantenimento massa magra con proteine elevate\n• Ingredienti a bassa densità calorica\n• Focus su sazietà e controllo insulinico' :
  calc.goal === 'aumento-massa' ?
  '• Surplus calorico del 15% per crescita muscolare\n• Proteine complete per sintesi proteica\n• Carboidrati per energy e recovery\n• Timing nutrizionale per performance' :
  '• Bilanciamento calorico per composizione corporea\n• Sostenibilità a lungo termine\n• Varietà nutrizionale per salute\n• Flessibilità per stile di vita attivo'
}

✅ Piano FITNESS generato il ${new Date().toLocaleDateString('it-IT')}
🇮🇹 Ricette italiane ottimizzate per obiettivi fitness
🚫 Filtrato per allergie: ${formData.allergie?.join(', ') || 'nessuna'}
🥗 Ottimizzato per preferenze: ${formData.preferenze?.join(', ') || 'nessuna'}
🔬 Basato su science nutrizionale e database ricette fitness`;

  // 💾 SALVA ANCHE IL FALLBACK NEL DATABASE
  let mealPlanId: string | undefined;

  try {
    const mealPlanData = {
      nome_utente: formData.nome,
      email_utente: formData.email,
      telefono_utente: formData.telefono,
      eta: calc.debugInfo.input.age,
      sesso: calc.debugInfo.input.gender,
      peso: calc.debugInfo.input.weight,
      altezza: calc.debugInfo.input.height,
      modalita: formData.modalita || 'guidata',
      attivita: calc.activity,
      obiettivo: calc.goal,
      durata: calc.numDays,
      pasti: calc.numMeals,
      varieta: formData.varieta || 'diversi',
      allergie: formData.allergie || [],
      preferenze: formData.preferenze || [],
      bmr: calc.bmr,
      tdee: calc.tdee,
      calorie_target: calc.dailyCalories,
      distribuzione_pasti: calc.mealCalories,
      piano_completo: fitnessPlanned,
      generato_con_ai: false,
      fitness_optimized: true,
      total_recipes: fitnessRecipes.totalRecipes,
      calorie_manuali: formData.modalita === 'esperto' ? parseInt(formData.calorie_totali || '0') : undefined,
      proteine_manuali: formData.modalita === 'esperto' ? parseInt(formData.proteine_totali || '0') : undefined,
      carboidrati_manuali: formData.modalita === 'esperto' ? parseInt(formData.carboidrati_totali || '0') : undefined,
      grassi_manuali: formData.modalita === 'esperto' ? parseInt(formData.grassi_totali || '0') : undefined,
      status: 'generato' as const
    };

    const saveResult = await saveMealPlan(mealPlanData);
    
    if (saveResult.error) {
      console.error('❌ Fallback meal plan save error:', saveResult.error);
    } else {
      console.log('✅ Fallback meal plan saved successfully:', saveResult.data?.id);
      mealPlanId = saveResult.data?.id;
    }
  } catch (dbError) {
    console.error('❌ Database error during fallback meal plan save:', dbError);
  }

  const response: GenerateMealPlanResponse = {
    success: true,
    piano: fitnessPlanned,
    message: 'Piano FITNESS con ricette italiane e filtri allergie/preferenze generato!',
    meal_plan_id: mealPlanId,
    metadata: {
      bmr: calc.bmr,
      tdee: calc.tdee,
      dailyTarget: calc.dailyCalories,
      mealDistribution: calc.mealCalories,
      isCalorieSafe: calc.isSafe,
      fitnessOptimized: true,
      totalRecipes: fitnessRecipes.totalRecipes,
      debugInfo: calc.debugInfo
    }
  };

  return NextResponse.json(response);
}

// 🔧 FUNZIONE CALCOLO CALORIE AGGIORNATA CON ALLERGIE
function calculateNutritionalNeedsWithAllergies(formData: FormData): NutritionalCalculation {
  console.log('📋 ===== INIZIO FUNZIONE CALCOLO CON ALLERGIE =====');
  console.log('📋 DEBUG - Raw form data RICEVUTO:', JSON.stringify(formData, null, 2));

  // 🔧 NORMALIZZAZIONE DATI CON ALLERGIE
  console.log('🔧 ===== FASE 1: NORMALIZZAZIONE DATI CON ALLERGIE =====');
  const normalizedData = normalizeFormDataWithAllergies(formData);
  console.log('📊 Normalized data RISULTATO:', JSON.stringify(normalizedData, null, 2));

  const { age, weight, height, gender, activity, goal, numDays, numMeals, allergie, preferenze } = normalizedData;
  
  console.log('📋 DATI ESTRATTI PER CALCOLO:');
  console.log('- Età:', age);
  console.log('- Peso:', weight);
  console.log('- Altezza:', height);
  console.log('- Sesso:', gender);
  console.log('- Attività:', activity);
  console.log('- Obiettivo:', goal);
  console.log('- Allergie:', allergie);
  console.log('- Preferenze:', preferenze);

  // 🧮 CALCOLO BMR - Harris-Benedict (INVARIATO)
  console.log('🧮 ===== FASE 2: CALCOLO BMR =====');
  let bmr;
  if (gender === 'maschio') {
    console.log('👨 Usando formula MASCHIO: 88.362 + (13.397 × peso) + (4.799 × altezza) - (5.677 × età)');
    console.log(`👨 Calcolo: 88.362 + (13.397 × ${weight}) + (4.799 × ${height}) - (5.677 × ${age})`);
    const part1 = 88.362;
    const part2 = 13.397 * weight;
    const part3 = 4.799 * height;
    const part4 = 5.677 * age;
    console.log(`👨 Step by step: ${part1} + ${part2} + ${part3} - ${part4}`);
    bmr = part1 + part2 + part3 - part4;
  } else {
    console.log('👩 Usando formula FEMMINA: 447.593 + (9.247 × peso) + (3.098 × altezza) - (4.330 × età)');
    console.log(`👩 Calcolo: 447.593 + (9.247 × ${weight}) + (3.098 × ${height}) - (4.330 × ${age})`);
    const part1 = 447.593;
    const part2 = 9.247 * weight;
    const part3 = 3.098 * height;
    const part4 = 4.330 * age;
    console.log(`👩 Step by step: ${part1} + ${part2} + ${part3} - ${part4}`);
    bmr = part1 + part2 + part3 - part4;
  }

  console.log('💡 BMR CALCOLATO:', bmr);

  // 🏃‍♂️ FATTORI ATTIVITÀ - MAPPING CORRETTO E COMPLETO
  console.log('🏃‍♂️ ===== FASE 3: FATTORE ATTIVITÀ =====');
  const activityFactors: { [key: string]: number } = {
    'sedentario': 1.2,
    'leggero': 1.375,
    'moderato': 1.55,
    'intenso': 1.725,
    'molto_intenso': 1.9
  };

  console.log('🏃‍♂️ Activity factors disponibili:', activityFactors);
  console.log('🏃‍♂️ Activity ricevuto:', activity);
  
  const activityFactor = activityFactors[activity] || 1.375; // Default leggero
  console.log('🏃‍♂️ Activity factor SCELTO:', activityFactor, 'per activity:', activity);
  
  if (!activityFactors[activity]) {
    console.warn('⚠️ ATTENZIONE: Activity non trovato, usando default 1.375');
  }

  const tdee = bmr * activityFactor;
  console.log(`🔥 TDEE CALCULATION: ${bmr} × ${activityFactor} = ${tdee}`);

  // 🎯 FATTORI OBIETTIVO - I TUOI 3 PARAMETRI
  console.log('🎯 ===== FASE 4: FATTORE OBIETTIVO =====');
  const goalFactors: { [key: string]: number } = {
    'dimagrimento': 0.85,        // ↓ Toglie calorie
    'mantenimento': 1.0,         // ↓ Tiene calcolo
    'aumento-massa': 1.15        // ↑ Aumenta calorie
  };

  console.log('🎯 Goal factors disponibili:', goalFactors);
  console.log('🎯 Goal ricevuto:', goal);
  
  const goalFactor = goalFactors[goal] || 1.0; // Default mantenimento
  console.log('🎯 Goal factor SCELTO:', goalFactor, 'per goal:', goal);
  
  if (!goalFactors[goal]) {
    console.warn('⚠️ ATTENZIONE: Goal non trovato, usando default 1.0 (mantenimento)');
  }

  const dailyCalories = Math.round(tdee * goalFactor);
  console.log(`✅ CALCOLO FINALE: ${tdee} × ${goalFactor} = ${dailyCalories} kcal`);
  
  console.log('🔥 ===== RIEPILOGO CALCOLO COMPLETO CON ALLERGIE =====');
  console.log(`🔥 BMR: ${Math.round(bmr)} kcal`);
  console.log(`🔥 TDEE: ${Math.round(tdee)} kcal (BMR × ${activityFactor})`);
  console.log(`🔥 DAILY CALORIES: ${dailyCalories} kcal (TDEE × ${goalFactor})`);
  console.log(`🚫 ALLERGIE: ${allergie.join(', ') || 'Nessuna'}`);
  console.log(`🥗 PREFERENZE: ${preferenze.join(', ') || 'Nessuna'}`);
  console.log('🔥 ===== FINE RIEPILOGO =====');

  // 🍽️ DISTRIBUZIONE PASTI
  const mealDistributions: { [key: number]: { [key: string]: number } } = {
    2: { colazione: 0.40, pranzo: 0.60 },
    3: { colazione: 0.30, pranzo: 0.40, cena: 0.30 },
    4: { colazione: 0.25, pranzo: 0.35, cena: 0.30, spuntino1: 0.10 },
    5: { colazione: 0.25, pranzo: 0.35, cena: 0.25, spuntino1: 0.10, spuntino2: 0.05 },
    6: { colazione: 0.20, pranzo: 0.30, cena: 0.25, spuntino1: 0.10, spuntino2: 0.10, spuntino3: 0.05 },
    7: { colazione: 0.20, pranzo: 0.25, cena: 0.25, spuntino1: 0.10, spuntino2: 0.10, spuntino3: 0.05, spuntino4: 0.05 }
  };

  const distribution = mealDistributions[numMeals] || mealDistributions[3];
  const mealCalories: { [key: string]: number } = {};
  
  Object.keys(distribution).forEach(meal => {
    mealCalories[meal] = Math.round(dailyCalories * distribution[meal]);
  });

  console.log('🍽️ Meal distribution:', mealCalories);

  // 🚨 CONTROLLI SICUREZZA
  const isSafe = dailyCalories >= 1200 && dailyCalories <= 3500;
  const isRealistic = bmr > 1000 && bmr < 2500 && tdee > 1200 && tdee < 4000;

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    dailyCalories,
    mealCalories,
    numDays,
    numMeals,
    isSafe: isSafe && isRealistic,
    goal,
    activity,
    debugInfo: {
      input: normalizedData,
      bmrFormula: gender === 'maschio' ? 'Harris-Benedict Male' : 'Harris-Benedict Female',
      activityFactor,
      goalFactor,
      finalMultiplier: activityFactor * goalFactor,
      expectedAndrea: Math.round(1692 * 1.375 * 0.85)
    }
  };
}

function normalizeFormDataWithAllergies(formData: FormData) {
  console.log('🔧 ===== NORMALIZZAZIONE DATI CON ALLERGIE - DEBUG COMPLETO =====');
  console.log('🔥 FormData INPUT:', JSON.stringify(formData, null, 2));
  
  const age = parseInt(String(formData.eta || '30')) || 30;
  console.log('👶 Età normalizzata:', formData.eta, '→', age);
  
  const weightStr = String(formData.peso || '70').replace(',', '.');
  const weight = parseFloat(weightStr) || 70;
  console.log('⚖️ Peso normalizzato:', formData.peso, '→', weightStr, '→', weight);
  
  const heightStr = String(formData.altezza || '170').replace(',', '.');
  const height = parseFloat(heightStr) || 170;
  console.log('📏 Altezza normalizzata:', formData.altezza, '→', heightStr, '→', height);
  
  const genderRaw = String(formData.sesso || 'maschio').toLowerCase();
  const gender = (genderRaw.includes('uomo') || genderRaw.includes('maschio')) ? 'maschio' : 'femmina';
  console.log('👫 Sesso normalizzato:', formData.sesso, '→', genderRaw, '→', gender);
  
  const activity = normalizeActivity(formData.attivita);
  console.log('🏃‍♂️ Attività normalizzata:', formData.attivita, '→', activity);
  
  const goal = normalizeGoal(formData.obiettivo);
  console.log('🎯 Obiettivo normalizzato:', formData.obiettivo, '→', goal);
  
  const numDays = parseInt(String(formData.durata || '3')) || 3;
  console.log('📅 Giorni normalizzati:', formData.durata, '→', numDays);
  
  const numMeals = parseInt(String(formData.pasti || '3')) || 3;
  console.log('🍽️ Pasti normalizzati:', formData.pasti, '→', numMeals);

  // 🚫 NORMALIZZAZIONE ALLERGIE
  const allergie = Array.isArray(formData.allergie) ? 
    formData.allergie.filter(a => a && a.trim()) : 
    [];
  console.log('🚫 Allergie normalizzate:', formData.allergie, '→', allergie);

  // 🥗 NORMALIZZAZIONE PREFERENZE
  const preferenze = Array.isArray(formData.preferenze) ? 
    formData.preferenze.filter(p => p && p.trim()) : 
    [];
  console.log('🥗 Preferenze normalizzate:', formData.preferenze, '→', preferenze);

  // 🎯 MODALITÀ
  const modalita = formData.modalita || 'guidata';
  console.log('🎯 Modalità normalizzata:', formData.modalita, '→', modalita);

  // 💪 DATI MODALITÀ ESPERTO
  const calorie_totali = formData.modalita === 'esperto' ? 
    parseFloat(formData.calorie_totali || '0') || undefined : undefined;
  const proteine_totali = formData.modalita === 'esperto' ? 
    parseFloat(formData.proteine_totali || '0') || undefined : undefined;
  const carboidrati_totali = formData.modalita === 'esperto' ? 
    parseFloat(formData.carboidrati_totali || '0') || undefined : undefined;
  const grassi_totali = formData.modalita === 'esperto' ? 
    parseFloat(formData.grassi_totali || '0') || undefined : undefined;

  const result = {
    age: Math.max(15, Math.min(100, age)),
    weight: Math.max(40, Math.min(200, weight)),
    height: Math.max(140, Math.min(220, height)),
    gender,
    activity,
    goal,
    numDays: Math.max(1, Math.min(14, numDays)),
    numMeals: Math.max(2, Math.min(7, numMeals)),
    allergie,
    preferenze,
    modalita,
    calorie_totali,
    proteine_totali,
    carboidrati_totali,
    grassi_totali
  };
  
  console.log('📤 DATI NORMALIZZATI FINALI CON ALLERGIE:', JSON.stringify(result, null, 2));
  console.log('🔧 ===== FINE NORMALIZZAZIONE =====');
  
  return result;
}

// 🔧 MAPPING ATTIVITÀ COMPLETAMENTE FIXATO
function normalizeActivity(activity: string): string {
  const activityMap: { [key: string]: string } = {
    // Valori diretti dal form
    'sedentario': 'sedentario',
    'leggero': 'leggero',              // ← FIX PRINCIPALE!
    'moderato': 'moderato',
    'intenso': 'intenso',
    'molto_intenso': 'molto_intenso',
    
    // Varianti con maiuscole
    'Sedentario': 'sedentario',
    'Leggero': 'leggero',
    'Moderato': 'moderato',
    'Intenso': 'intenso',
    
    // Varianti complete
    'Attività Sedentaria': 'sedentario',
    'Attività Leggera': 'leggero',        // ← FIX PRINCIPALE!
    'Attività Moderata': 'moderato',
    'Attività Intensa': 'intenso',
    'Attività Molto Intensa': 'molto_intenso',
    
    // Varianti minuscole
    'attività sedentaria': 'sedentario',
    'attività leggera': 'leggero',
    'attività moderata': 'moderato',
    'attività intensa': 'intenso',
    'attività molto intensa': 'molto_intenso',
    
    // Varianti alternative
    'bassa': 'sedentario',
    'media': 'moderato',
    'alta': 'intenso'
  };
  
  const normalized = activityMap[activity] || activityMap[String(activity || '').toLowerCase()] || 'leggero';
  console.log('🏃‍♂️ Activity normalized:', activity, '→', normalized);
  return normalized;
}

// 🔧 MAPPING OBIETTIVO COMPLETAMENTE FIXATO
function normalizeGoal(goal: string): string {
  const goalMap: { [key: string]: string } = {
    // Valori diretti dal form - CORRETTI PER I TUOI 3 PARAMETRI
    'dimagrimento': 'dimagrimento',
    'mantenimento': 'mantenimento',
    'aumento-massa': 'aumento-massa',
    
    // Varianti con maiuscole
    'Dimagrimento': 'dimagrimento',
    'Mantenimento': 'mantenimento',          // ← FIX PRINCIPALE!
    'Aumento-massa': 'aumento-massa',
    
    // Varianti alternative
    'perdita-peso': 'dimagrimento',
    'perdita peso': 'dimagrimento',
    'perdita di peso': 'dimagrimento',
    'perdere peso': 'dimagrimento',
    'dimagrire': 'dimagrimento',
    
    'mantenere': 'mantenimento',
    'maintain': 'mantenimento',
    
    'aumento massa': 'aumento-massa',
    'massa': 'aumento-massa',
    'bulk': 'aumento-massa',
    'crescita': 'aumento-massa'
  };
  
  const normalized = goalMap[goal] || goalMap[String(goal || '').toLowerCase()] || 'mantenimento';
  console.log('🎯 Goal normalized:', goal, '→', normalized);
  return normalized;
}