import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Recipe enhancement request received');
    
    const { recipe, goal } = await request.json();
    
    // Mock enhancement per ora
    const enhancedRecipe = {
      ...recipe,
      fitnessScore: 75,
      healthBenefits: ['Ricco di proteine', 'Bilanciato', 'Nutriente'],
      cookingTips: ['Usa ingredienti freschi', 'Controlla le porzioni'],
      enhanced: true
    };
    
    return NextResponse.json({
      success: true,
      enhancedRecipe: enhancedRecipe,
      message: 'Recipe enhanced successfully'
    });
    
  } catch (error) {
    console.error('❌ Enhance recipe error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Enhancement failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Enhance recipe API is working',
    timestamp: new Date().toISOString()
  });
}