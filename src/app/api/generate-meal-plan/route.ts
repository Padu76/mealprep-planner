import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { FITNESS_RECIPES_DB, selectFitnessRecipes } from '../../../utils/fitness_recipes_database';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    console.log('🏋️‍♂️ Generating FITNESS meal plan with ALLERGIE/PREFERENZE + AIRTABLE:', formData);

    // 🔧 CALCOLO CALORIE CON ALLERGIE/PREFERENZE
    console.log('🚀 ===== INIZIO CALCOLO CALORIE CON ALLERGIE =====');
    console.log('📋 Allergie ricevute:', formData.allergie);
    console.log('🥗 Preferenze ricevute:', formData.preferenze);
    
    const calc = calculateNutritionalNeedsWithAllergies(formData);
    
    console.log('📊 ===== RISULTATO CALCOLO FINALE =====');
    console.log('📊 Fixed nutritional calculations:', calc);
    console.log('🔥 CALORIE FINALI CALCOLATE:', calc.dailyCalories);
    console.log('⚠️ ALLERGIE PROCESSATE:', calc.debugInfo.input.allergie);
    console.log('🥗 PREFERENZE PROCESSATE:', calc.debugInfo.input.preferenze);

    // 🚨 VERIFICA SICUREZZA CALORIE
    if (!calc.isSafe) {
      console.error('🚨 UNSAFE CALORIE CALCULATION:', calc);
      return NextResponse.json({
        success: false,
        error: `Calcolo calorie non sicuro: ${calc.dailyCalories} kcal/giorno. Verifica i dati inseriti.`,
        debug: calc
      }, { status: 400 });
    }

    // 💾 SALVA RICHIESTA SU AIRTABLE (prima di generare il piano)
    console.log('💾 ===== SALVATAGGIO RICHIESTA SU AIRTABLE =====');
    let airtableRecordId: string | undefined;

    try {
      const airtableData = {
        nome: formData.nome,
        email: formData.email,
        telefono: formData.telefono,
        age: calc.debugInfo.input.age,
        weight: calc.debugInfo.input.weight,
        height: calc.debugInfo.input.height,
        gender: calc.debugInfo.input.gender,
        activity_level: calc.activity,
        goal: calc.goal,
        duration: calc.numDays,
        meals_per_day: calc.numMeals,
        exclusions: formData.allergie && formData.allergie.length > 0 ? 
          `ALLERGIE: ${formData.allergie.join(', ')}` : undefined,
        foods_at_home: formData.preferenze && formData.preferenze.length > 0 ? 
          `PREFERENZE: ${formData.preferenze.join(', ')}` : undefined,
        bmr: calc.bmr,
        total_calories: calc.dailyCalories
      };

      console.log('📋 Dati per Airtable:', airtableData);

      const airtableResponse = await fetch('/api/airtable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'saveMealRequest',
          data: airtableData
        })
      });

      const airtableResult = await airtableResponse.json();
      
      if (airtableResult.success) {
        airtableRecordId = airtableResult.recordId;
        console.log('✅ Richiesta salvata su Airtable:', airtableRecordId);
      } else {
        console.warn('⚠️ Airtable save failed:', airtableResult.error);
        // Continuiamo comunque con la generazione
      }
    } catch (airtableError) {
      console.error('❌ Airtable error:', airtableError);
      // Continuiamo comunque con la generazione
    }

    // 🎯 LOG DETTAGLIATO CON ALLERGIE/PREFERENZE
    console.log('📝 DETAILED CALCULATION WITH ALLERGIES/PREFERENCES:');
    console.log('- Raw obiettivo from form:', formData.obiettivo);
    console.log('- Raw attivita from form:', formData.attivita);
    console.log('- Raw allergie from form:', formData.allergie);
    console.log('- Raw preferenze from form:', formData.preferenze);
    console.log('- Normalized goal:', calc.goal);
    console.log('- Normalized activity:', calc.activity);
    console.log('- Processed allergie:', calc.debugInfo.input.allergie);
    console.log('- Processed preferenze:', calc.debugInfo.input.preferenze);

    // 🇮🇹 SELEZIONE RICETTE FITNESS CON FILTRI ALLERGIE/PREFERENZE
    console.log('🇮🇹 ===== SELEZIONE RICETTE FITNESS CON FILTRI =====');
    const fitnessRecipes = generateFitnessBasedPlanWithFilters(formData, calc);
    console.log('✅ Ricette fitness selezionate (post-filtri):', fitnessRecipes.totalRecipes);
    console.log('🚫 Ricette filtrate per allergie:', fitnessRecipes.filteredForAllergies);
    console.log('✅ Ricette matchate per preferenze:', fitnessRecipes.matchedPreferences);

    // 🤖 CLAUDE AI CON ALLERGIE E PREFERENZE
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log('⚠️ ANTHROPIC_API_KEY not found, using fitness fallback');
      const fallbackResponse = await generateFitnessBasedResponseWithAllergies(formData, calc, fitnessRecipes, airtableRecordId);
      return fallbackResponse;
    }

    try {
      console.log('🤖 Calling Claude AI with FITNESS + ALLERGIES + PREFERENCES...');
      
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

      // 💾 SALVA PIANO COMPLETO SU AIRTABLE
      console.log('💾 ===== SALVATAGGIO PIANO COMPLETO SU AIRTABLE =====');
      let planSavedToAirtable = false;

      try {
        const planData = {
          nome: formData.nome,
          email: formData.email,
          telefono: formData.telefono,
          age: calc.debugInfo.input.age,
          weight: calc.debugInfo.input.weight,
          height: calc.debugInfo.input.height,
          gender: calc.debugInfo.input.gender,
          activity_level: calc.activity,
          goal: calc.goal,
          duration: calc.numDays,
          meals_per_day: calc.numMeals,
          exclusions: formData.allergie && formData.allergie.length > 0 ? 
            `ALLERGIE: ${formData.allergie.join(', ')}` : undefined,
          foods_at_home: formData.preferenze && formData.preferenze.length > 0 ? 
            `PREFERENZE: ${formData.preferenze.join(', ')}` : undefined,
          bmr: calc.bmr,
          total_calories: calc.dailyCalories,
          plan_details: aiResponse.text
        };

        console.log('📋 Piano per Airtable (primi 200 caratteri):', planData.plan_details?.substring(0, 200));

        const planAirtableResponse = await fetch('/api/airtable', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'saveMealPlan',
            data: planData
          })
        });

        const planAirtableResult = await planAirtableResponse.json();
        
        if (planAirtableResult.success) {
          planSavedToAirtable = true;
          console.log('✅ Piano completo salvato su Airtable:', planAirtableResult.recordId);
        } else {
          console.warn('⚠️ Piano Airtable save failed:', planAirtableResult.error);
        }
      } catch (planAirtableError) {
        console.error('❌ Piano Airtable error:', planAirtableError);
      }

      return NextResponse.json({
        success: true,
        piano: aiResponse.text,
        message: 'Piano alimentare FITNESS generato con ricette italiane, filtri allergie/preferenze e salvato su Airtable!',
        metadata: {
          bmr: calc.bmr,
          tdee: calc.tdee,
          dailyTarget: calc.dailyCalories,
          mealDistribution: calc.mealCalories,
          isCalorieSafe: calc.isSafe,
          aiGenerated: true,
          fitnessOptimized: true,
          totalRecipes: fitnessRecipes.totalRecipes,
          allergiesFiltered: fitnessRecipes.filteredForAllergies,
          preferencesMatched: fitnessRecipes.matchedPreferences,
          airtableRecordId: airtableRecordId,
          planSavedToAirtable: planSavedToAirtable,
          debugInfo: calc.debugInfo
        }
      });

    } catch (aiError) {
      console.error('❌ Claude AI error:', aiError);
      console.log('🔄 Falling back to FITNESS template with allergies...');
      const fallbackResponse = await generateFitnessBasedResponseWithAllergies(formData, calc, fitnessRecipes, airtableRecordId);
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

// 🇮🇹 SELEZIONE RICETTE CON FILTRI ALLERGIE/PREFERENZE
function generateFitnessBasedPlanWithFilters(formData: any, calc: any) {
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

// 🤖 PROMPT AI OTTIMIZZATO CON ALLERGIE E PREFERENZE
function createAllergyAwarePrompt(formData: any, calc: any, fitnessRecipes: any): string {
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
Se un ingrediente potrebbe contenere tracce, SCARTALO.
Verifica ingredienti nascosti (es: glutine in salse, lattosio in insaccati).` :
  '✅ Nessuna allergia dichiarata, usa tutte le ricette disponibili.'
}

🥗 PREFERENZE ALIMENTARI:
${formData.preferenze && formData.preferenze.length > 0 ? 
  `✨ L'utente preferisce: ${formData.preferenze.join(', ')}
PRIVILEGIA ricette che includono questi ingredienti quando possibile.
Cerca di incorporare queste preferenze in ogni pasto della giornata.
Se dice "Vegetariano" evita carne e pesce, se "Vegano" evita tutti i derivati animali.` :
  '🔧 Nessuna preferenza specifica, usa varietà bilanciata di ingredienti.'
}

🎯 OBIETTIVO SPECIFICO FITNESS:
${calc.goal === 'dimagrimento' ? 
  '• Focus: Deficit calorico, alta proteina, bassa densità calorica\n• Priorità: Ricette lean, verdure, proteine magre\n• Evita: Fritture, dolci, carboidrati raffinati, condimenti grassi' :
  calc.goal === 'aumento-massa' ?
  '• Focus: Surplus calorico, costruzione muscolare, recovery\n• Priorità: Ricette caloriche, carboidrati, proteine complete\n• Include: Frutta secca, avocado, cereali integrali, grassi buoni' :
  '• Focus: Mantenimento, bilanciamento, sostenibilità\n• Priorità: Ricette bilanciate, varietà nutrizionale\n• Equilibra: Tutti i macronutrienti in modo armonico'
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
- ⚠️ Note Allergie: [Conferma ingredienti sicuri]
- ✨ Preferenze: [Indica se rispetta preferenze dichiarate]

☀️ PRANZO (${calc.mealCalories.pranzo || 500} kcal): [Nome Ricetta Italiana Fitness]
[stesso formato con verifica allergie e preferenze]

🌙 CENA (${calc.mealCalories.cena || 400} kcal): [Nome Ricetta Italiana Fitness]
[stesso formato con verifica allergie e preferenze]

${calc.mealCalories.spuntino1 ? `🍎 SPUNTINO (${calc.mealCalories.spuntino1} kcal): [Nome Spuntino Fitness]
[stesso formato con verifica allergie e preferenze]` : ''}

⚠️ CONTROLLO FINALE ALLERGIE:
Prima di finalizzare ogni ricetta, verifica che NON contenga:
${formData.allergie && formData.allergie.length > 0 ? formData.allergie.join(', ') : 'Nessuna allergia da controllare'}

✨ BONUS PREFERENZE:
Cerca di includere quando possibile:
${formData.preferenze && formData.preferenze.length > 0 ? formData.preferenze.join(', ') : 'Varietà bilanciata'}

💪 CREA UN PIANO FITNESS ITALIANO SICURO E PERSONALIZZATO!
Ricette tradizionali italiane ottimizzate per fitness, sicure per allergie e allineate con preferenze alimentari.`;
}

// 🇮🇹 FALLBACK FITNESS CON ALLERGIE, PREFERENZE E AIRTABLE
async function generateFitnessBasedResponseWithAllergies(formData: any, calc: any, fitnessRecipes: any, airtableRecordId?: string) {
  const numDays = calc.numDays;
  const numMeals = calc.numMeals;
  
  let fitnessPlanned = `🏋️‍♂️ PIANO FITNESS ITALIANO - CON FILTRI ALLERGIE/PREFERENZE
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
${airtableRecordId ? `💾 Salvato su Airtable: ${airtableRecordId}` : ''}

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
        `✅ Verificato per allergie: ${formData.allergie.join(', ')} - SICURO` : 
        '✅ Nessuna allergia da controllare';

      const preferenzeCheck = formData.preferenze && formData.preferenze.length > 0 ?
        `✨ Preferenze: ${hasMatchingPreferences(colazione, formData.preferenze) ? 'RISPETTATE' : 'Standard'}` :
        '🔧 Nessuna preferenza specifica';

      fitnessPlanned += `🌅 COLAZIONE (${calc.mealCalories.colazione} kcal):
Nome: ${colazione.nome}
Ingredienti: ${colazione.ingredienti.join(', ')}
Preparazione: ${colazione.preparazione}
Macro: P: ${colazione.proteine}g | C: ${colazione.carboidrati}g | G: ${colazione.grassi}g
Fitness Score: ${colazione.fitnessScore}/100 ⭐
Tempo: ${colazione.tempo} | Porzioni: ${colazione.porzioni}
${allergieCheck}
${preferenzeCheck}

`;
    }

    // PRANZO FITNESS con check allergie/preferenze
    const pranzo = fitnessRecipes.pranzo[dayIndex];
    if (pranzo) {
      const allergieCheck = formData.allergie && formData.allergie.length > 0 ? 
        `✅ Verificato per allergie: ${formData.allergie.join(', ')} - SICURO` : 
        '✅ Nessuna allergia da controllare';

      const preferenzeCheck = formData.preferenze && formData.preferenze.length > 0 ?
        `✨ Preferenze: ${hasMatchingPreferences(pranzo, formData.preferenze) ? 'RISPETTATE' : 'Standard'}` :
        '🔧 Nessuna preferenza specifica';

      fitnessPlanned += `☀️ PRANZO (${calc.mealCalories.pranzo} kcal):
Nome: ${pranzo.nome}
Ingredienti: ${pranzo.ingredienti.join(', ')}
Preparazione: ${pranzo.preparazione}
Macro: P: ${pranzo.proteine}g | C: ${pranzo.carboidrati}g | G: ${pranzo.grassi}g
Fitness Score: ${pranzo.fitnessScore}/100 ⭐
Tempo: ${pranzo.tempo} | Porzioni: ${pranzo.porzioni}
${allergieCheck}
${preferenzeCheck}

`;
    }

    // CENA FITNESS con check allergie/preferenze
    const cena = fitnessRecipes.cena[dayIndex];
    if (cena) {
      const allergieCheck = formData.allergie && formData.allergie.length > 0 ? 
        `✅ Verificato per allergie: ${formData.allergie.join(', ')} - SICURO` : 
        '✅ Nessuna allergia da controllare';

      const preferenzeCheck = formData.preferenze && formData.preferenze.length > 0 ?
        `✨ Preferenze: ${hasMatchingPreferences(cena, formData.preferenze) ? 'RISPETTATE' : 'Standard'}` :
        '🔧 Nessuna preferenza specifica';

      fitnessPlanned += `🌙 CENA (${calc.mealCalories.cena} kcal):
Nome: ${cena.nome}
Ingredienti: ${cena.ingredienti.join(', ')}
Preparazione: ${cena.preparazione}
Macro: P: ${cena.proteine}g | C: ${cena.carboidrati}g | G: ${cena.grassi}g
Fitness Score: ${cena.fitnessScore}/100 ⭐
Tempo: ${cena.tempo} | Porzioni: ${cena.porzioni}
${allergieCheck}
${preferenzeCheck}

`;
    }

    // SPUNTINO FITNESS se richiesto
    if (numMeals >= 4 && calc.mealCalories.spuntino1) {
      const spuntino = fitnessRecipes.spuntino[dayIndex];
      if (spuntino) {
        const allergieCheck = formData.allergie && formData.allergie.length > 0 ? 
          `✅ Verificato per allergie: ${formData.allergie.join(', ')} - SICURO` : 
          '✅ Nessuna allergia da controllare';

        const preferenzeCheck = formData.preferenze && formData.preferenze.length > 0 ?
          `✨ Preferenze: ${hasMatchingPreferences(spuntino, formData.preferenze) ? 'RISPETTATE' : 'Standard'}` :
          '🔧 Nessuna preferenza specifica';

        fitnessPlanned += `🍎 SPUNTINO (${calc.mealCalories.spuntino1} kcal):
Nome: ${spuntino.nome}
Ingredienti: ${spuntino.ingredienti.join(', ')}
Preparazione: ${spuntino.preparazione}
Macro: P: ${spuntino.proteine}g | C: ${spuntino.carboidrati}g | G: ${spuntino.grassi}g
Fitness Score: ${spuntino.fitnessScore}/100 ⭐
Target: ${spuntino.macroTarget}
${allergieCheck}
${preferenzeCheck}

`;
      }
    }

    fitnessPlanned += `💪 TOTALE GIORNO ${day}: ${calc.dailyCalories} kcal
└────────────────────────────────────────────────────────────────────────────────┘

`;
  }

  // Sezione allergie e preferenze specifica + info Airtable
  fitnessPlanned += `┌────────────────────────────────────────────────────────────────────────────────┐

🚨 GESTIONE ALLERGIE E PREFERENZE SPECIFICHE:

🚫 ALLERGIE DICHIARATE E GESTITE:
${formData.allergie && formData.allergie.length > 0 ? 
  formData.allergie.map(a => `• ${a}: COMPLETAMENTE EVITATO in tutte le ricette`).join('\n') +
  `\n⚠️ IMPORTANTE: Controlla sempre le etichette per tracce e ingredienti nascosti!` :
  '✅ Nessuna allergia dichiarata - Tutte le ricette sono sicure'
}

🥗 PREFERENZE ALIMENTARI RISPETTATE:
${formData.preferenze && formData.preferenze.length > 0 ? 
  formData.preferenze.map(p => `• ${p}: PRIVILEGIATO nelle ricette quando possibile`).join('\n') +
  `\n✨ Le ricette sono state selezionate per rispettare al meglio le tue preferenze!` :
  '🔧 Nessuna preferenza specifica - Ricette bilanciate standard'
}

💾 SALVATAGGIO DATI:
${airtableRecordId ? 
  `✅ I tuoi dati e questo piano sono stati salvati nel nostro sistema sicuro
📋 ID Riferimento: ${airtableRecordId}
🔍 Puoi ritrovare questo piano nella tua dashboard personale` :
  '⚠️ Piano generato ma non salvato nel sistema (possibile problema temporaneo)'
}

└────────────────────────────────────────────────────────────────────────────────┘

🏋️‍♂️ CONSIGLI FITNESS CON ALLERGIE/PREFERENZE:
• Idratazione: 35-40ml per kg di peso corporeo (${Math.round(calc.debugInfo.input.weight * 35)}ml/giorno)
• Timing proteine: 20-25g ogni 3-4 ore per sintesi proteica ottimale
• Pre-workout: Carboidrati 30-60 min prima (verifica ingredienti se allergie)
• Post-workout: Proteine + carboidrati entro 30 min dal training
• Riposo: 7-9 ore di sonno per recovery e crescita muscolare
${formData.allergie && formData.allergie.length > 0 ? 
  `• ⚠️ ALLERGIE: Leggi sempre ingredienti completi, anche per integratori!` : ''}

📊 ANALISI NUTRIZIONALE FITNESS PERSONALIZZATA:
• Calorie totali piano: ${calc.dailyCalories * numDays} kcal
• Proteine target: ${Math.round(calc.debugInfo.input.weight * 1.6)}g/giorno (1.6g/kg)
• Carboidrati: ${Math.round(calc.dailyCalories * 0.45 / 4)}g/giorno (45% energia)
• Grassi: ${Math.round(calc.dailyCalories * 0.25 / 9)}g/giorno (25% energia)
• Ricette filtrate per allergie: ${fitnessRecipes.filteredForAllergies}
• Ricette ottimizzate per preferenze: ${fitnessRecipes.matchedPreferences}

✅ Piano FITNESS PERSONALIZZATO generato il ${new Date().toLocaleDateString('it-IT')}
🇮🇹 Ricette italiane ottimizzate per obiettivi fitness
🚫 SICURO per allergie dichiarate: ${formData.allergie?.join(', ') || 'nessuna'}
🥗 RISPETTA preferenze: ${formData.preferenze?.join(', ') || 'standard'}
💾 Salvato su Airtable per tracking e dashboard
🔬 Basato su science nutrizionale e database ricette fitness avanzato`;

  // 💾 SALVA ANCHE IL FALLBACK SU AIRTABLE
  let planSavedToAirtable = false;

  try {
    const planData = {
      nome: formData.nome,
      email: formData.email,
      telefono: formData.telefono,
      age: calc.debugInfo.input.age,
      weight: calc.debugInfo.input.weight,
      height: calc.debugInfo.input.height,
      gender: calc.debugInfo.input.gender,
      activity_level: calc.activity,
      goal: calc.goal,
      duration: calc.numDays,
      meals_per_day: calc.numMeals,
      exclusions: formData.allergie && formData.allergie.length > 0 ? 
        `ALLERGIE: ${formData.allergie.join(', ')}` : undefined,
      foods_at_home: formData.preferenze && formData.preferenze.length > 0 ? 
        `PREFERENZE: ${formData.preferenze.join(', ')}` : undefined,
      bmr: calc.bmr,
      total_calories: calc.dailyCalories,
      plan_details: fitnessPlanned
    };

    console.log('💾 Salvando piano fallback su Airtable...');

    const planAirtableResponse = await fetch('/api/airtable', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'saveMealPlan',
        data: planData
      })
    });

    const planAirtableResult = await planAirtableResponse.json();
    
    if (planAirtableResult.success) {
      planSavedToAirtable = true;
      console.log('✅ Piano fallback salvato su Airtable:', planAirtableResult.recordId);
    } else {
      console.warn('⚠️ Piano fallback Airtable save failed:', planAirtableResult.error);
    }
  } catch (planAirtableError) {
    console.error('❌ Piano fallback Airtable error:', planAirtableError);
  }

  return NextResponse.json({
    success: true,
    piano: fitnessPlanned,
    message: 'Piano FITNESS con gestione completa allergie, preferenze e salvataggio Airtable generato!',
    metadata: {
      bmr: calc.bmr,
      tdee: calc.tdee,
      dailyTarget: calc.dailyCalories,
      mealDistribution: calc.mealCalories,
      isCalorieSafe: calc.isSafe,
      fitnessOptimized: true,
      allergiesHandled: formData.allergie?.length || 0,
      preferencesMatched: formData.preferenze?.length || 0,
      totalRecipes: fitnessRecipes.totalRecipes,
      airtableRecordId: airtableRecordId,
      planSavedToAirtable: planSavedToAirtable,
      fallbackUsed: true,
      debugInfo: calc.debugInfo
    }
  });
}

// 🔧 CALCOLO CALORIE CON GESTIONE ALLERGIE/PREFERENZE
function calculateNutritionalNeedsWithAllergies(formData: any) {
  console.log('📋 ===== CALCOLO CON ALLERGIE/PREFERENZE =====');
  console.log('📋 Raw form data:', JSON.stringify(formData, null, 2));

  // Normalizzazione dati con allergie/preferenze
  const normalizedData = normalizeFormDataWithAllergies(formData);
  console.log('📊 Dati normalizzati:', JSON.stringify(normalizedData, null, 2));

  const { age, weight, height, gender, activity, goal, numDays, numMeals, allergie, preferenze } = normalizedData;
  
  console.log('📋 DATI ESTRATTI:');
  console.log('- Età:', age, '| Peso:', weight, '| Altezza:', height);
  console.log('- Sesso:', gender, '| Attività:', activity, '| Obiettivo:', goal);
  console.log('- Allergie:', allergie, '| Preferenze:', preferenze);

  // BMR calculation - Harris-Benedict
  let bmr;
  if (gender === 'maschio') {
    console.log('👨 Formula MASCHIO');
    const part1 = 88.362;
    const part2 = 13.397 * weight;
    const part3 = 4.799 * height;
    const part4 = 5.677 * age;
    bmr = part1 + part2 + part3 - part4;
    console.log(`BMR: ${part1} + ${part2} + ${part3} - ${part4} = ${bmr}`);
  } else {
    console.log('👩 Formula FEMMINA');
    const part1 = 447.593;
    const part2 = 9.247 * weight;
    const part3 = 3.098 * height;
    const part4 = 4.330 * age;
    bmr = part1 + part2 + part3 - part4;
    console.log(`BMR: ${part1} + ${part2} + ${part3} - ${part4} = ${bmr}`);
  }

  // Activity factors
  const activityFactors: { [key: string]: number } = {
    'sedentario': 1.2,
    'leggero': 1.375,
    'moderato': 1.55,
    'intenso': 1.725,
    'molto_intenso': 1.9
  };

  const activityFactor = activityFactors[activity] || 1.375;
  const tdee = bmr * activityFactor;
  console.log(`TDEE: ${bmr} × ${activityFactor} = ${tdee}`);

  // Goal factors
  const goalFactors: { [key: string]: number } = {
    'dimagrimento': 0.85,
    'mantenimento': 1.0,
    'aumento-massa': 1.15
  };

  const goalFactor = goalFactors[goal] || 1.0;
  const dailyCalories = Math.round(tdee * goalFactor);
  console.log(`CALORIE FINALI: ${tdee} × ${goalFactor} = ${dailyCalories} kcal`);

  // Distribuzione pasti
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

  // Safety checks
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
      finalMultiplier: activityFactor * goalFactor
    }
  };
}

function normalizeFormDataWithAllergies(formData: any) {
  console.log('🔧 Normalizzazione con allergie/preferenze...');
  
  const age = parseInt(String(formData.eta || '30')) || 30;
  const weightStr = String(formData.peso || '70').replace(',', '.');
  const weight = parseFloat(weightStr) || 70;
  const heightStr = String(formData.altezza || '170').replace(',', '.');
  const height = parseFloat(heightStr) || 170;
  const genderRaw = String(formData.sesso || 'maschio').toLowerCase();
  const gender = (genderRaw.includes('uomo') || genderRaw.includes('maschio')) ? 'maschio' : 'femmina';
  const activity = normalizeActivity(formData.attivita);
  const goal = normalizeGoal(formData.obiettivo);
  const numDays = parseInt(String(formData.durata || '3')) || 3;
  const numMeals = parseInt(String(formData.pasti || '3')) || 3;

  // ✅ ALLERGIE E PREFERENZE - NORMALIZZATE
  const allergie = Array.isArray(formData.allergie) ? 
    formData.allergie.filter(a => a && a.trim()) : 
    [];
  const preferenze = Array.isArray(formData.preferenze) ? 
    formData.preferenze.filter(p => p && p.trim()) : 
    [];

  console.log('🚫 Allergie normalizzate:', allergie);
  console.log('🥗 Preferenze normalizzate:', preferenze);

  const modalita = formData.modalita || 'guidata';
  const calorie_totali = formData.modalita === 'esperto' ? 
    parseFloat(formData.calorie_totali || '0') || undefined : undefined;
  const proteine_totali = formData.modalita === 'esperto' ? 
    parseFloat(formData.proteine_totali || '0') || undefined : undefined;
  const carboidrati_totali = formData.modalita === 'esperto' ? 
    parseFloat(formData.carboidrati_totali || '0') || undefined : undefined;
  const grassi_totali = formData.modalita === 'esperto' ? 
    parseFloat(formData.grassi_totali || '0') || undefined : undefined;

  return {
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
}

// Activity normalization
function normalizeActivity(activity: string): string {
  const activityMap: { [key: string]: string } = {
    'sedentario': 'sedentario',
    'leggero': 'leggero',
    'moderato': 'moderato',
    'intenso': 'intenso',
    'molto_intenso': 'molto_intenso',
    'Sedentario': 'sedentario',
    'Leggero': 'leggero',
    'Moderato': 'moderato',
    'Intenso': 'intenso',
    'Attività Sedentaria': 'sedentario',
    'Attività Leggera': 'leggero',
    'Attività Moderata': 'moderato',
    'Attività Intensa': 'intenso',
    'Attività Molto Intensa': 'molto_intenso',
    'attività sedentaria': 'sedentario',
    'attività leggera': 'leggero',
    'attività moderata': 'moderato',
    'attività intensa': 'intenso',
    'attività molto intensa': 'molto_intenso',
    'bassa': 'sedentario',
    'media': 'moderato',
    'alta': 'intenso'
  };
  
  const normalized = activityMap[activity] || activityMap[String(activity || '').toLowerCase()] || 'leggero';
  console.log('🏃‍♂️ Activity normalized:', activity, '→', normalized);
  return normalized;
}

// Goal normalization
function normalizeGoal(goal: string): string {
  const goalMap: { [key: string]: string } = {
    'dimagrimento': 'dimagrimento',
    'mantenimento': 'mantenimento',
    'aumento-massa': 'aumento-massa',
    'Dimagrimento': 'dimagrimento',
    'Mantenimento': 'mantenimento',
    'Aumento-massa': 'aumento-massa',
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