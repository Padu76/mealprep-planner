import { useState } from 'react';
import { IngredientSubstitute, SelectedIngredient, ParsedPlan, FormData } from '../types';

export const useAISubstitute = (
  parsedPlan: ParsedPlan | null,
  formData: FormData,
  setParsedPlan: (plan: ParsedPlan) => void,
  setGeneratedPlan: (plan: string) => void,
  generateCompleteDocument: (plan: ParsedPlan) => string
) => {
  const [showSubstituteModal, setShowSubstituteModal] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<SelectedIngredient | null>(null);
  const [isLoadingSubstitutes, setIsLoadingSubstitutes] = useState(false);
  const [substitutes, setSubstitutes] = useState<IngredientSubstitute[]>([]);

  const handleIngredientSubstitution = async (
    ingredient: string, 
    dayIndex: number, 
    mealType: string, 
    ingredientIndex: number
  ) => {
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
          mealContext: `${mealType} del ${parsedPlan?.days[dayIndex].day}`
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

  const applySubstitution = (newIngredient: string) => {
    if (!selectedIngredient || !parsedPlan) return;

    const { dayIndex, mealType, ingredientIndex } = selectedIngredient;
    
    const updatedPlan = { ...parsedPlan };
    updatedPlan.days = [...parsedPlan.days];
    updatedPlan.days[dayIndex] = { ...parsedPlan.days[dayIndex] };
    updatedPlan.days[dayIndex].meals = { ...parsedPlan.days[dayIndex].meals };
    (updatedPlan.days[dayIndex].meals as any)[mealType] = { ...(parsedPlan.days[dayIndex].meals as any)[mealType] };
    (updatedPlan.days[dayIndex].meals as any)[mealType].ingredienti = [...(parsedPlan.days[dayIndex].meals as any)[mealType].ingredienti];
    
    (updatedPlan.days[dayIndex].meals as any)[mealType].ingredienti[ingredientIndex] = newIngredient;
    
    setParsedPlan(updatedPlan);
    
    const completeDocument = generateCompleteDocument(updatedPlan);
    setGeneratedPlan(completeDocument);
    
    setShowSubstituteModal(false);
    setSelectedIngredient(null);
    setSubstitutes([]);
  };

  const closeModal = () => {
    setShowSubstituteModal(false);
    setSelectedIngredient(null);
    setSubstitutes([]);
  };

  return {
    showSubstituteModal,
    selectedIngredient,
    isLoadingSubstitutes,
    substitutes,
    handleIngredientSubstitution,
    applySubstitution,
    closeModal
  };
};