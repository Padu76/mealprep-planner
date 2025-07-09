// AI Learning System per Meal Prep Planner
// src/utils/aiLearningSystem.ts

interface UserPreferences {
  preferenceColazione: string;
  preferencePranzo: string;
  preferenceCena: string;
  stileAlimentare: string;
  livelloElaborazione: string;
  preferenzeCottura: string;
  evitaRipetizioni: boolean;
}

interface HistoricalPlan {
  id: string;
  nome: string;
  preferences: UserPreferences;
  generatedMeals: {
    colazione: string[];
    pranzo: string[];
    cena: string[];
    spuntini: string[];
  };
  userRating?: number; // Per feedback futuro
  createdAt: string;
}

interface AIInsights {
  favoriteIngredients: string[];
  preferredMealTypes: {
    colazione: string[];
    pranzo: string[];
    cena: string[];
  };
  avoidedIngredients: string[];
  preferredComplexity: string;
  suggestions: string[];
}

export class AILearningSystem {
  private static instance: AILearningSystem;
  private userHistory: HistoricalPlan[] = [];

  private constructor() {
    this.loadUserHistory();
  }

  static getInstance(): AILearningSystem {
    if (!AILearningSystem.instance) {
      AILearningSystem.instance = new AILearningSystem();
    }
    return AILearningSystem.instance;
  }

  // Carica storico utente da Airtable
  private async loadUserHistory(): Promise<void> {
    try {
      const response = await fetch('/api/airtable?action=getUserHistory');
      const data = await response.json();
      
      if (data.success) {
        this.userHistory = data.plans || [];
        console.log('📊 AI Learning: Loaded', this.userHistory.length, 'historical plans');
      }
    } catch (error) {
      console.error('❌ AI Learning: Error loading history:', error);
    }
  }

  // Salva nuovo piano nello storico
  async savePlanToHistory(plan: HistoricalPlan): Promise<void> {
    try {
      this.userHistory.push(plan);
      
      // Salva in Airtable
      await fetch('/api/airtable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'saveUserHistory',
          data: plan
        })
      });
      
      console.log('✅ AI Learning: Plan saved to history');
    } catch (error) {
      console.error('❌ AI Learning: Error saving plan:', error);
    }
  }

  // Analizza preferenze utente
  analyzeUserPreferences(userName: string): AIInsights {
    const userPlans = this.userHistory.filter(plan => 
      plan.nome.toLowerCase() === userName.toLowerCase()
    );

    if (userPlans.length === 0) {
      return this.getDefaultInsights();
    }

    console.log(`🧠 AI Learning: Analyzing ${userPlans.length} plans for ${userName}`);

    // Analizza ingredienti preferiti
    const allIngredients = userPlans.flatMap(plan => 
      [...plan.generatedMeals.colazione, ...plan.generatedMeals.pranzo, ...plan.generatedMeals.cena]
    );
    
    const ingredientFrequency = this.calculateFrequency(allIngredients);
    const favoriteIngredients = Object.entries(ingredientFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([ingredient]) => ingredient);

    // Analizza tipi di pasto preferiti
    const preferredMealTypes = {
      colazione: this.analyzeMealTypePreferences(userPlans, 'colazione'),
      pranzo: this.analyzeMealTypePreferences(userPlans, 'pranzo'),
      cena: this.analyzeMealTypePreferences(userPlans, 'cena')
    };

    // Calcola complessità preferita
    const complexityPreference = this.calculateComplexityPreference(userPlans);

    // Genera suggerimenti intelligenti
    const suggestions = this.generateIntelligentSuggestions(userPlans, favoriteIngredients);

    return {
      favoriteIngredients,
      preferredMealTypes,
      avoidedIngredients: this.findAvoidedIngredients(userPlans),
      preferredComplexity: complexityPreference,
      suggestions
    };
  }

  // Genera prompt AI personalizzato
  generatePersonalizedPrompt(
    basePrompt: string, 
    userPreferences: UserPreferences, 
    userName: string
  ): string {
    const insights = this.analyzeUserPreferences(userName);
    
    let enhancedPrompt = basePrompt;

    // Aggiungi preferenze specifiche per pasto
    if (userPreferences.preferenceColazione) {
      enhancedPrompt += `\n\n🌅 COLAZIONE - PREFERENZA: ${userPreferences.preferenceColazione}`;
    }
    if (userPreferences.preferencePranzo) {
      enhancedPrompt += `\n☀️ PRANZO - PREFERENZA: ${userPreferences.preferencePranzo}`;
    }
    if (userPreferences.preferenceCena) {
      enhancedPrompt += `\n🌙 CENA - PREFERENZA: ${userPreferences.preferenceCena}`;
    }

    // Aggiungi stile alimentare
    if (userPreferences.stileAlimentare !== 'bilanciato') {
      enhancedPrompt += `\n🎨 STILE ALIMENTARE: ${userPreferences.stileAlimentare}`;
    }

    // Aggiungi livello elaborazione
    enhancedPrompt += `\n⚡ COMPLESSITÀ: ${userPreferences.livelloElaborazione}`;

    // Aggiungi preferenze cottura
    if (userPreferences.preferenzeCottura) {
      enhancedPrompt += `\n🔥 COTTURA PREFERITA: ${userPreferences.preferenzeCottura}`;
    }

    // Aggiungi insights AI se disponibili
    if (insights.favoriteIngredients.length > 0) {
      enhancedPrompt += `\n\n🤖 AI INSIGHTS - INGREDIENTI PREFERITI: ${insights.favoriteIngredients.slice(0, 5).join(', ')}`;
    }

    // Evita ripetizioni se richiesto
    if (userPreferences.evitaRipetizioni && insights.favoriteIngredients.length > 0) {
      const recentMeals = this.getRecentMeals(userName, 2);
      if (recentMeals.length > 0) {
        enhancedPrompt += `\n\n⚠️ EVITA RIPETIZIONI: Non utilizzare queste ricette recenti: ${recentMeals.join(', ')}`;
      }
    }

    // Aggiungi suggerimenti AI
    if (insights.suggestions.length > 0) {
      enhancedPrompt += `\n\n💡 SUGGERIMENTI AI: ${insights.suggestions.join(', ')}`;
    }

    enhancedPrompt += `\n\n🎯 PERSONALIZZAZIONE: Adatta le ricette considerando queste preferenze specifiche per creare un piano ancora più in linea con i gusti dell'utente.`;

    return enhancedPrompt;
  }

  // Calcola frequenza ingredienti
  private calculateFrequency(items: string[]): { [key: string]: number } {
    return items.reduce((acc, item) => {
      const normalized = item.toLowerCase().trim();
      acc[normalized] = (acc[normalized] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }

  // Analizza preferenze tipo pasto
  private analyzeMealTypePreferences(plans: HistoricalPlan[], mealType: keyof HistoricalPlan['generatedMeals']): string[] {
    const mealTypes = plans.flatMap(plan => plan.generatedMeals[mealType]);
    const frequency = this.calculateFrequency(mealTypes);
    
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([type]) => type);
  }

  // Calcola complessità preferita
  private calculateComplexityPreference(plans: HistoricalPlan[]): string {
    const complexityCount = plans.reduce((acc, plan) => {
      acc[plan.preferences.livelloElaborazione] = (acc[plan.preferences.livelloElaborazione] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return Object.entries(complexityCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'medio';
  }

  // Trova ingredienti evitati
  private findAvoidedIngredients(plans: HistoricalPlan[]): string[] {
    // Logica per identificare ingredienti che l'utente tende a evitare
    // Basata su allergie/intolleranze dai piani precedenti
    const avoided: string[] = [];
    
    plans.forEach(plan => {
      // Analizza pattern di evitamento (da implementare con più dati)
    });

    return avoided;
  }

  // Genera suggerimenti intelligenti
  private generateIntelligentSuggestions(plans: HistoricalPlan[], favoriteIngredients: string[]): string[] {
    const suggestions: string[] = [];
    
    // Suggerimenti basati su stagionalità
    const currentMonth = new Date().getMonth();
    const seasonalSuggestions = this.getSeasonalSuggestions(currentMonth);
    suggestions.push(...seasonalSuggestions);

    // Suggerimenti basati su ingredienti preferiti
    if (favoriteIngredients.includes('pollo')) {
      suggestions.push('Varia le preparazioni del pollo: marinato, alla griglia, al curry');
    }
    if (favoriteIngredients.includes('pasta')) {
      suggestions.push('Prova paste integrali o di legumi per più varietà');
    }

    // Suggerimenti per bilanciamento nutrizionale
    suggestions.push('Includi sempre una fonte di proteine magre');
    suggestions.push('Aggiungi verdure di stagione per più colore e nutrienti');

    return suggestions.slice(0, 3);
  }

  // Suggerimenti stagionali
  private getSeasonalSuggestions(month: number): string[] {
    const seasons = {
      spring: [2, 3, 4], // Mar, Apr, Mag
      summer: [5, 6, 7], // Giu, Lug, Ago
      autumn: [8, 9, 10], // Set, Ott, Nov
      winter: [11, 0, 1] // Dic, Gen, Feb
    };

    if (seasons.spring.includes(month)) {
      return ['Utilizza verdure primaverili: asparagi, piselli, fave'];
    } else if (seasons.summer.includes(month)) {
      return ['Preferisci piatti freschi: insalate, gazpacho, frutta'];
    } else if (seasons.autumn.includes(month)) {
      return ['Sperimenta con zucca, castagne, funghi porcini'];
    } else {
      return ['Comfort food: zuppe, stufati, brasati'];
    }
  }

  // Ottieni pasti recenti
  private getRecentMeals(userName: string, lastNPlans: number): string[] {
    const userPlans = this.userHistory
      .filter(plan => plan.nome.toLowerCase() === userName.toLowerCase())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, lastNPlans);

    return userPlans.flatMap(plan => 
      [...plan.generatedMeals.colazione, ...plan.generatedMeals.pranzo, ...plan.generatedMeals.cena]
    );
  }

  // Insights di default per nuovi utenti
  private getDefaultInsights(): AIInsights {
    return {
      favoriteIngredients: [],
      preferredMealTypes: {
        colazione: ['toast', 'yogurt', 'cereali'],
        pranzo: ['pasta', 'riso', 'insalata'],
        cena: ['pollo', 'pesce', 'verdure']
      },
      avoidedIngredients: [],
      preferredComplexity: 'medio',
      suggestions: [
        'Inizia con ricette semplici e bilanciate',
        'Sperimenta con ingredienti di stagione',
        'Mantieni varietà tra i macronutrienti'
      ]
    };
  }

  // Ottieni insights per dashboard
  getUserInsights(userName: string): AIInsights {
    return this.analyzeUserPreferences(userName);
  }
}