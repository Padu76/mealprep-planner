// utils/aiRecipeEnhancer.ts
export interface FitnessScore {
  score: number; // 0-100
  reasons: string[];
  improvements: string[];
}

export interface EnhancedRecipe extends Recipe {
  fitnessScore: FitnessScore;
  imageUrl?: string;
  aiGenerated?: boolean;
}

export class AIRecipeEnhancer {
  private static instance: AIRecipeEnhancer;
  
  static getInstance(): AIRecipeEnhancer {
    if (!AIRecipeEnhancer.instance) {
      AIRecipeEnhancer.instance = new AIRecipeEnhancer();
    }
    return AIRecipeEnhancer.instance;
  }

  // Calcola fitness score per una ricetta
  calculateFitnessScore(recipe: Recipe, userGoals: string): FitnessScore {
    let score = 0;
    const reasons: string[] = [];
    const improvements: string[] = [];

    // ANALISI MACRONUTRIENTI
    const proteinRatio = recipe.proteine / recipe.calorie * 4; // % proteine
    const carbRatio = recipe.carboidrati / recipe.calorie * 4; // % carbs
    const fatRatio = recipe.grassi / recipe.calorie * 9; // % grassi

    // SCORING PROTEINE (20-35% ideale)
    if (proteinRatio >= 0.20 && proteinRatio <= 0.35) {
      score += 25;
      reasons.push(`Ottimo rapporto proteico (${(proteinRatio * 100).toFixed(1)}%)`);
    } else if (proteinRatio < 0.15) {
      score += 5;
      improvements.push('Aumentare contenuto proteico per massa muscolare');
    } else if (proteinRatio > 0.40) {
      score += 15;
      improvements.push('Bilanciare con più carboidrati per energia');
    }

    // SCORING CALORIE PER PORZIONE
    const caloriePerPortion = recipe.calorie / recipe.porzioni;
    if (userGoals === 'perdita-peso') {
      if (caloriePerPortion <= 400) {
        score += 20;
        reasons.push('Calorie controllate per perdita peso');
      } else if (caloriePerPortion > 600) {
        improvements.push('Ridurre porzioni per deficit calorico');
      }
    } else if (userGoals === 'aumento-massa') {
      if (caloriePerPortion >= 500) {
        score += 20;
        reasons.push('Calorie adeguate per massa muscolare');
      } else {
        improvements.push('Aumentare porzioni per surplus calorico');
      }
    }

    // SCORING INGREDIENTI FITNESS
    const fitnessIngredients = [
      'avena', 'quinoa', 'pollo', 'pesce', 'uova', 'spinaci', 
      'broccoli', 'yogurt greco', 'mandorle', 'salmone', 
      'riso integrale', 'lenticchie', 'avocado'
    ];
    
    const fitCount = recipe.ingredienti.filter(ing => 
      fitnessIngredients.some(fit => ing.toLowerCase().includes(fit))
    ).length;
    
    if (fitCount >= 3) {
      score += 15;
      reasons.push(`${fitCount} ingredienti fitness-friendly`);
    }

    // SCORING TEMPO PREPARAZIONE
    if (recipe.tempoPreparazione <= 30) {
      score += 10;
      reasons.push('Preparazione rapida per routine fitness');
    }

    // SCORING CATEGORIA FITNESS
    const fitnessCategories = ['colazione', 'spuntino'];
    if (fitnessCategories.includes(recipe.categoria)) {
      score += 10;
      reasons.push('Categoria ottimale per fitness');
    }

    // PENALITÀ INGREDIENTI NON-FITNESS
    const unhealthyIngredients = [
      'zucchero', 'burro', 'panna', 'fritta', 'fritto', 'dolce'
    ];
    
    const unhealthyCount = recipe.ingredienti.filter(ing => 
      unhealthyIngredients.some(bad => ing.toLowerCase().includes(bad))
    ).length;
    
    if (unhealthyCount > 0) {
      score -= unhealthyCount * 10;
      improvements.push('Sostituire ingredienti meno salutari');
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      reasons,
      improvements
    };
  }

  // Migliora ricetta con AI per fitness
  async enhanceRecipeForFitness(recipe: Recipe, userGoals: string): Promise<string> {
    const fitnessScore = this.calculateFitnessScore(recipe, userGoals);
    
    if (fitnessScore.score >= 80) {
      return recipe.preparazione; // Già ottima
    }

    const prompt = `Migliora questa ricetta per fitness:
Nome: ${recipe.nome}
Ingredienti: ${recipe.ingredienti.join(', ')}
Preparazione: ${recipe.preparazione}
Obiettivo: ${userGoals}
Problemi: ${fitnessScore.improvements.join(', ')}

Fornisci una versione migliorata mantenendo il sapore ma ottimizzando per fitness.`;

    try {
      const response = await fetch('/api/enhance-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      
      const result = await response.json();
      return result.success ? result.enhancedPreparation : recipe.preparazione;
    } catch (error) {
      console.log('Error enhancing recipe:', error);
      return recipe.preparazione;
    }
  }

  // Genera immagine per ricetta
  async generateRecipeImage(recipe: Recipe): Promise<string> {
    const imagePrompt = `Professional food photography of ${recipe.nome}, healthy fitness meal, clean presentation, natural lighting, appetizing, ingredients visible: ${recipe.ingredienti.slice(0, 3).join(', ')}, macro-friendly, fit lifestyle`;

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: imagePrompt,
          style: 'food-photography',
          aspectRatio: '4:3'
        })
      });
      
      const result = await response.json();
      return result.success ? result.imageUrl : '/images/recipe-placeholder.jpg';
    } catch (error) {
      console.log('Error generating image:', error);
      return '/images/recipe-placeholder.jpg';
    }
  }

  // Filtra e ordina ricette per fitness
  async filterAndRankForFitness(
    recipes: Recipe[], 
    userGoals: string,
    userAllergies: string[] = []
  ): Promise<EnhancedRecipe[]> {
    
    const enhancedRecipes: EnhancedRecipe[] = [];

    for (const recipe of recipes) {
      // Skip se contiene allergie
      const hasAllergies = userAllergies.some(allergy => 
        recipe.allergie.includes(allergy)
      );
      
      if (hasAllergies) continue;

      // Calcola fitness score
      const fitnessScore = this.calculateFitnessScore(recipe, userGoals);
      
      // Genera immagine (cache per ricette popolari)
      const imageUrl = await this.generateRecipeImage(recipe);
      
      enhancedRecipes.push({
        ...recipe,
        fitnessScore,
        imageUrl,
        aiGenerated: true
      });
    }

    // Ordina per fitness score (priorità ricette fit)
    return enhancedRecipes.sort((a, b) => {
      // Prima priorità: fitness score
      if (b.fitnessScore.score !== a.fitnessScore.score) {
        return b.fitnessScore.score - a.fitnessScore.score;
      }
      
      // Seconda priorità: rating
      return (b.rating || 0) - (a.rating || 0);
    });
  }

  // Suggerisci ricette fitness per obiettivo
  suggestFitnessRecipesByGoal(userGoals: string): {
    categories: string[];
    ingredients: string[];
    maxCalories: number;
    minProtein: number;
  } {
    
    const suggestions = {
      'perdita-peso': {
        categories: ['colazione', 'spuntino', 'cena'],
        ingredients: ['pollo', 'pesce', 'verdure', 'quinoa', 'yogurt greco'],
        maxCalories: 400,
        minProtein: 25
      },
      'aumento-massa': {
        categories: ['colazione', 'pranzo', 'spuntino'],
        ingredients: ['avena', 'uova', 'salmone', 'mandorle', 'riso integrale'],
        maxCalories: 700,
        minProtein: 30
      },
      'mantenimento': {
        categories: ['colazione', 'pranzo', 'cena'],
        ingredients: ['pollo', 'quinoa', 'verdure', 'avocado', 'lenticchie'],
        maxCalories: 500,
        minProtein: 20
      }
    };

    return suggestions[userGoals as keyof typeof suggestions] || suggestions.mantenimento;
  }

  // Crea prompt AI fitness-ottimizzato
  createFitnessOptimizedPrompt(formData: any): string {
    const goalMapping = {
      'perdita-peso': 'perdita di peso con deficit calorico',
      'aumento-massa': 'aumento massa muscolare con surplus calorico',
      'mantenimento': 'mantenimento peso e composizione corporea'
    };

    const goal = goalMapping[formData.obiettivo as keyof typeof goalMapping] || 'benessere generale';
    
    return `Crea un piano meal prep FITNESS-OTTIMIZZATO per ${formData.nome}:

🎯 OBIETTIVO FITNESS: ${goal}
📊 DATI: ${formData.eta} anni, ${formData.sesso}, ${formData.peso}kg, attività ${formData.attivita}
⚠️ ALLERGIE: ${formData.allergie?.join(', ') || 'nessuna'}
🥗 PREFERENZE: ${formData.preferenze?.join(', ') || 'standard'}
📅 DURATA: ${formData.durata} giorni, ${formData.pasti} pasti/giorno

🔥 PRIORITÀ FITNESS:
- Ricette ad alto valore proteico (20-35% calorie da proteine)
- Ingredienti fitness-friendly: avena, quinoa, pollo, pesce, uova, verdure
- Preparazioni semplici e veloci per routine attiva
- Bilanciamento macronutrienti per l'obiettivo specifico
- Porzioni ottimizzate per il goal calorico

Genera ricette che un fitness enthusiast apprezzerebbe, con focus su performance e composizione corporea.`;
  }
}

// Export per uso in altri file
export const aiRecipeEnhancer = AIRecipeEnhancer.getInstance();