// app/api/generate-image/route.ts
import { NextRequest, NextResponse } from 'next/server';

// OPZIONE 1: Unsplash (Gratuito con API key)
async function generateWithUnsplash(prompt: string): Promise<string> {
  const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
  
  if (!UNSPLASH_ACCESS_KEY) {
    throw new Error('Unsplash API key not configured');
  }

  // Estrai keywords dal prompt
  const keywords = prompt.toLowerCase()
    .replace(/professional food photography of|healthy meal|appetizing|clean background|natural lighting|ingredients:/g, '')
    .split(',')[0]
    .trim();

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keywords + ' food meal')}&per_page=1&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
        }
      }
    );

    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      return data.results[0].urls.regular;
    }
    
    throw new Error('No images found');
  } catch (error) {
    console.error('Unsplash API error:', error);
    throw error;
  }
}

// OPZIONE 2: DALL-E (OpenAI - A pagamento)
async function generateWithDALLE(prompt: string): Promise<string> {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard"
      })
    });

    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      return data.data[0].url;
    }
    
    throw new Error('DALL-E generation failed');
  } catch (error) {
    console.error('DALL-E API error:', error);
    throw error;
  }
}

// OPZIONE 3: Placeholder intelligente (Fallback sempre funzionante)
function generatePlaceholder(prompt: string): string {
  // Estrai il nome del piatto dal prompt
  const dishName = prompt.split(',')[0]
    .replace('Professional food photography of', '')
    .trim();
  
  const encodedName = encodeURIComponent(dishName);
  
  // Placeholder colorato e appetitoso
  return `https://via.placeholder.com/400x300/8FBC8F/ffffff?text=${encodedName}`;
}

// MAIN API HANDLER
export async function POST(request: NextRequest) {
  try {
    const { prompt, style = 'food-photography', aspectRatio = '4:3' } = await request.json();
    
    if (!prompt) {
      return NextResponse.json({ 
        success: false, 
        error: 'Prompt is required' 
      }, { status: 400 });
    }

    console.log('🖼️ Generating image for:', prompt);

    let imageUrl: string;
    
    try {
      // PRIORITÀ 1: Prova Unsplash (gratuito)
      if (process.env.UNSPLASH_ACCESS_KEY) {
        console.log('📸 Trying Unsplash...');
        imageUrl = await generateWithUnsplash(prompt);
        console.log('✅ Unsplash success:', imageUrl);
      } 
      // PRIORITÀ 2: Prova DALL-E (a pagamento)
      else if (process.env.OPENAI_API_KEY) {
        console.log('🎨 Trying DALL-E...');
        imageUrl = await generateWithDALLE(prompt);
        console.log('✅ DALL-E success:', imageUrl);
      } 
      // FALLBACK: Placeholder intelligente
      else {
        throw new Error('No image generation service configured');
      }
    } catch (error) {
      console.log('⚠️ Image generation failed, using placeholder:', error);
      imageUrl = generatePlaceholder(prompt);
    }

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      source: imageUrl.includes('placeholder') ? 'placeholder' : 'generated'
    });

  } catch (error) {
    console.error('❌ Image generation API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to generate image',
      imageUrl: 'https://via.placeholder.com/400x300/8FBC8F/ffffff?text=Recipe+Image'
    }, { status: 500 });
  }
}