import { NextRequest, NextResponse } from 'next/server';

interface AnalisiGiorno {
  data: string;
  user_email: string;
  pasti: {
    colazione: string[];
    spuntino_mattina: string[];
    pranzo: string[];
    spuntino_pomeriggio: string[];
    cena: string[];
    spuntino_sera: string[];
    bevande_alcoliche: string[];
  };
  pliche: {
    mattino_addome: number;
    mattino_fianchi: number;
    colazione_post_addome: number;
    colazione_post_fianchi: number;
    spuntino_mattina_post_addome: number;
    spuntino_mattina_post_fianchi: number;
    pranzo_post_addome: number;
    pranzo_post_fianchi: number;
    spuntino_pomeriggio_post_addome: number;
    spuntino_pomeriggio_post_fianchi: number;
    cena_post_addome: number;
    cena_post_fianchi: number;
    spuntino_sera_post_addome: number;
    spuntino_sera_post_fianchi: number;
  };
  idratazione: number;
  sonno?: number;
  stress?: number;
  digestione?: string;
  note?: string;
  foto?: string[];
}

interface AnalisiAI {
  cibi_trigger: {
    alimento: string;
    aumento_medio_pliche: number;
    frequenza_problemi: number;
    confidence_score: number;
  }[];
  trend_settimanale: {
    giorno: string;
    variazione_addome: number;
    variazione_fianchi: number;
    pasti_problematici: string[];
  }[];
  consigli: {
    tipo: 'evitare' | 'limitare' | 'preferire';
    alimento: string;
    motivo: string;
    evidenza: string;
  }[];
  metriche: {
    giorni_analizzati: number;
    variabilita_media: number;
    miglioramento_trend: boolean;
    food_score: number;
  };
}

// Configurazione Airtable
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = 'Analisi_Grasso';
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    console.log('🔧 Analisi Grasso API called:', action);

    switch (action) {
      case 'saveData':
        return await saveToAirtable(data);
      
      case 'generateAnalysis':
        return await generateAIAnalysis(data);
      
      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Azione non valida' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Errore server interno' 
    }, { status: 500 });
  }
}

// Salva dati su Airtable
async function saveToAirtable(data: AnalisiGiorno) {
  try {
    console.log('💾 Saving to Airtable:', data.data);

    if (!AIRTABLE_BASE_ID || !AIRTABLE_API_KEY) {
      console.log('⚠️ Airtable non configurato, salvataggio saltato');
      return NextResponse.json({ 
        success: true, 
        message: 'Salvato localmente (Airtable non configurato)' 
      });
    }

    const airtableData = {
      fields: {
        User_Email: data.user_email,
        Data: data.data,
        Pasti_JSON: JSON.stringify(data.pasti),
        Pliche_JSON: JSON.stringify(data.pliche),
        Idratazione: data.idratazione,
        Sonno: data.sonno || 0,
        Stress: data.stress || 0,
        Digestione: data.digestione || '',
        Note: data.note || '',
        Foto_URLs: data.foto?.join(',') || '',
        Created_Time: new Date().toISOString()
      }
    };

    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(airtableData)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Airtable error:', errorText);
      throw new Error(`Airtable error: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Saved to Airtable:', result.id);

    return NextResponse.json({ 
      success: true, 
      recordId: result.id 
    });

  } catch (error) {
    console.error('❌ Save error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Errore salvataggio' 
    }, { status: 500 });
  }
}

// Genera analisi AI
async function generateAIAnalysis(data: AnalisiGiorno[]) {
  try {
    console.log('🧠 Generating AI analysis for', data.length, 'days');

    if (data.length < 3) {
      return NextResponse.json({ 
        success: false, 
        error: 'Servono almeno 3 giorni di dati' 
      }, { status: 400 });
    }

    // Analisi pattern base
    const analysis = analyzePatterns(data);
    
    // Se disponibile, integra con Claude AI
    const enhancedAnalysis = await enhanceWithClaude(analysis, data);

    return NextResponse.json({ 
      success: true, 
      analysis: enhancedAnalysis 
    });

  } catch (error) {
    console.error('❌ Analysis error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Errore analisi' 
    }, { status: 500 });
  }
}

// Analisi pattern base
function analyzePatterns(data: AnalisiGiorno[]): AnalisiAI {
  console.log('📊 Analyzing patterns...');
  
  const foodTriggers = new Map<string, {
    increases: number[];
    occurrences: number;
  }>();

  // Analizza ogni giorno
  data.forEach(day => {
    const allFoods = [
      ...day.pasti.colazione,
      ...day.pasti.spuntino_mattina,
      ...day.pasti.pranzo,
      ...day.pasti.spuntino_pomeriggio,
      ...day.pasti.cena,
      ...day.pasti.spuntino_sera,
      ...day.pasti.bevande_alcoliche
    ];

    // Calcola variazione media giornaliera
    const avgAddomeIncrease = calculateAverageIncrease(day.pliche, 'addome');
    const avgFianchiIncrease = calculateAverageIncrease(day.pliche, 'fianchi');
    const avgTotalIncrease = (avgAddomeIncrease + avgFianchiIncrease) / 2;

    // Associa alimenti alle variazioni
    allFoods.forEach(food => {
      if (!foodTriggers.has(food)) {
        foodTriggers.set(food, { increases: [], occurrences: 0 });
      }
      
      const trigger = foodTriggers.get(food)!;
      trigger.increases.push(avgTotalIncrease);
      trigger.occurrences++;
    });
  });

  // Calcola cibi trigger
  const cibi_trigger = Array.from(foodTriggers.entries())
    .map(([alimento, data]) => ({
      alimento,
      aumento_medio_pliche: data.increases.reduce((a, b) => a + b, 0) / data.increases.length,
      frequenza_problemi: data.occurrences,
      confidence_score: Math.min(100, data.occurrences * 20)
    }))
    .filter(trigger => trigger.aumento_medio_pliche > 1) // Solo se aumento > 1mm
    .sort((a, b) => b.aumento_medio_pliche - a.aumento_medio_pliche)
    .slice(0, 10);

  // Trend settimanale
  const trend_settimanale = data.slice(-7).map(day => ({
    giorno: new Date(day.data).toLocaleDateString('it-IT'),
    variazione_addome: calculateAverageIncrease(day.pliche, 'addome'),
    variazione_fianchi: calculateAverageIncrease(day.pliche, 'fianchi'),
    pasti_problematici: identifyProblematicMeals(day)
  }));

  // Consigli base
  const consigli = generateBasicAdvice(cibi_trigger);

  // Metriche
  const metriche = {
    giorni_analizzati: data.length,
    variabilita_media: calculateAverageVariability(data),
    miglioramento_trend: checkImprovementTrend(data),
    food_score: calculateFoodScore(cibi_trigger)
  };

  return {
    cibi_trigger,
    trend_settimanale,
    consigli,
    metriche
  };
}

// Calcola aumento medio pliche
function calculateAverageIncrease(pliche: any, zona: 'addome' | 'fianchi'): number {
  const baseValue = pliche[`mattino_${zona}`];
  const measurements = [
    pliche[`colazione_post_${zona}`],
    pliche[`spuntino_mattina_post_${zona}`],
    pliche[`pranzo_post_${zona}`],
    pliche[`spuntino_pomeriggio_post_${zona}`],
    pliche[`cena_post_${zona}`],
    pliche[`spuntino_sera_post_${zona}`]
  ].filter(val => val > 0);

  if (measurements.length === 0) return 0;

  const avgMeasurement = measurements.reduce((a, b) => a + b, 0) / measurements.length;
  return Math.max(0, avgMeasurement - baseValue);
}

// Identifica pasti problematici
function identifyProblematicMeals(day: AnalisiGiorno): string[] {
  const problematic = [];
  const baseAddome = day.pliche.mattino_addome;
  const baseFianchi = day.pliche.mattino_fianchi;
  
  const pastiToCheck = [
    { name: 'colazione', addome: 'colazione_post_addome', fianchi: 'colazione_post_fianchi' },
    { name: 'spuntino_mattina', addome: 'spuntino_mattina_post_addome', fianchi: 'spuntino_mattina_post_fianchi' },
    { name: 'pranzo', addome: 'pranzo_post_addome', fianchi: 'pranzo_post_fianchi' },
    { name: 'spuntino_pomeriggio', addome: 'spuntino_pomeriggio_post_addome', fianchi: 'spuntino_pomeriggio_post_fianchi' },
    { name: 'cena', addome: 'cena_post_addome', fianchi: 'cena_post_fianchi' },
    { name: 'spuntino_sera', addome: 'spuntino_sera_post_addome', fianchi: 'spuntino_sera_post_fianchi' }
  ];

  pastiToCheck.forEach(pasto => {
    const addomeIncrease = (day.pliche[pasto.addome as keyof typeof day.pliche] as number) - baseAddome;
    const fianchiIncrease = (day.pliche[pasto.fianchi as keyof typeof day.pliche] as number) - baseFianchi;
    const avgIncrease = (addomeIncrease + fianchiIncrease) / 2;
    
    if (avgIncrease > 3) {
      problematic.push(pasto.name);
    }
  });

  return problematic;
}

// Genera consigli base
function generateBasicAdvice(triggers: any[]): any[] {
  const advice = [];
  
  // Consigli per i top trigger
  triggers.slice(0, 5).forEach(trigger => {
    if (trigger.aumento_medio_pliche > 5) {
      advice.push({
        tipo: 'evitare',
        alimento: trigger.alimento,
        motivo: `Causa un aumento medio di ${trigger.aumento_medio_pliche.toFixed(1)}mm`,
        evidenza: `Osservato in ${trigger.frequenza_problemi} occasioni`
      });
    } else if (trigger.aumento_medio_pliche > 2) {
      advice.push({
        tipo: 'limitare',
        alimento: trigger.alimento,
        motivo: `Causa gonfiore moderato (+${trigger.aumento_medio_pliche.toFixed(1)}mm)`,
        evidenza: `Confidence score: ${trigger.confidence_score}%`
      });
    }
  });

  // Consigli generali
  if (advice.length === 0) {
    advice.push({
      tipo: 'preferire',
      alimento: 'Verdure a foglia verde',
      motivo: 'Favoriscono la digestione e riducono il gonfiore',
      evidenza: 'Raccomandazione generale'
    });
  }

  return advice;
}

// Calcola variabilità media
function calculateAverageVariability(data: AnalisiGiorno[]): number {
  const variations = data.map(day => {
    const addomeVar = calculateAverageIncrease(day.pliche, 'addome');
    const fianchiVar = calculateAverageIncrease(day.pliche, 'fianchi');
    return (addomeVar + fianchiVar) / 2;
  });

  return variations.reduce((a, b) => a + b, 0) / variations.length;
}

// Verifica trend di miglioramento
function checkImprovementTrend(data: AnalisiGiorno[]): boolean {
  if (data.length < 5) return false;

  const recent = data.slice(-3);
  const older = data.slice(-6, -3);

  const recentAvg = recent.reduce((sum, day) => {
    return sum + calculateAverageIncrease(day.pliche, 'addome') + calculateAverageIncrease(day.pliche, 'fianchi');
  }, 0) / (recent.length * 2);

  const olderAvg = older.reduce((sum, day) => {
    return sum + calculateAverageIncrease(day.pliche, 'addome') + calculateAverageIncrease(day.pliche, 'fianchi');
  }, 0) / (older.length * 2);

  return recentAvg < olderAvg;
}

// Calcola food score
function calculateFoodScore(triggers: any[]): number {
  if (triggers.length === 0) return 90;
  
  const avgTriggerIncrease = triggers.reduce((sum, t) => sum + t.aumento_medio_pliche, 0) / triggers.length;
  const score = Math.max(0, 100 - (avgTriggerIncrease * 10));
  
  return Math.round(score);
}

// Potenzia con Claude AI
async function enhanceWithClaude(baseAnalysis: AnalisiAI, data: AnalisiGiorno[]): Promise<AnalisiAI> {
  try {
    // TODO: Integrazione con Claude AI per analisi avanzata
    console.log('🤖 Claude AI enhancement not implemented yet');
    return baseAnalysis;
  } catch (error) {
    console.error('❌ Claude AI enhancement failed:', error);
    return baseAnalysis;
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    success: true, 
    message: 'Analisi Grasso API attiva' 
  });
}