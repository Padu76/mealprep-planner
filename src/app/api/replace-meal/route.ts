import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { formData, mealType, dayNumber, currentPlan } = await request.json();
    
    console.log('🔄 Replace meal request:', { mealType, dayNumber });
    
    // Mock replacement - cambia il nome del pasto
    const alternatives = {
      colazione: [
        "Pancakes Proteici ai Mirtilli",
        "Smoothie Bowl Tropicale", 
        "Avocado Toast con Salmone"
      ],
      pranzo: [
        "Risotto ai Funghi Porcini",
        "Insalata di Quinoa e Verdure",
        "Pollo alla Griglia con Verdure"
      ],
      cena: [
        "Salmone in Crosta di Pistacchi",
        "Zuppa di Lenticchie e Verdure",
        "Orata al Sale con Contorno"
      ],
      spuntino1: [
        "Frullato Proteico alla Banana",
        "Mix di Frutta Secca e Semi",
        "Yogurt Greco con Granola"
      ]
    };
    
    // Seleziona un'alternativa random
    const mealAlternatives = alternatives[mealType as keyof typeof alternatives] || alternatives.pranzo;
    const newMealName = mealAlternatives[Math.floor(Math.random() * mealAlternatives.length)];
    
    // Simula un piano aggiornato (in realtà dovrebbe chiamare l'AI)
    const updatedPlan = currentPlan.replace(
      /🍽 [^▬]+/g, 
      `🍽 ${newMealName.toUpperCase()}`
    );
    
    return NextResponse.json({
      success: true,
      updatedPlan: updatedPlan,
      message: `Pasto ${mealType} sostituito con ${newMealName}`
    });
    
  } catch (error) {
    console.error('❌ Replace meal error:', error);
    return NextResponse.json({
      success: false,
      error: 'Errore nella sostituzione del pasto',
      details: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { status: 500 });
  }
}