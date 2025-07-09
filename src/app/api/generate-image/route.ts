// app/api/generate-image/route.ts
import { NextRequest, NextResponse } from 'next/server';

// OPZIONE 1: Unsplash (Gratuito con API key)
async function generateWithUnsplash(prompt: string): Promise<string> {
  const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
  
  if (!UNSPLASH_ACCESS_KEY) {
    console.log('❌ Unsplash API key not found');
    throw new Error('Unsplash API key not configured');
  }

  // Estrai keywords dal prompt per cercare meglio
  const keywords = prompt.toLowerCase()
    .replace(/professional food photography of|healthy meal|appetizing|clean background|natural lighting|ingredients:/g, '')
    .split(',')[0]
    .split(' ')
    .slice(0, 3) // Solo prime 3 parole
    .join(' ')
    .trim();

  console.log('🔍 Searching Unsplash for:', keywords);

  try {
    const searchUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keywords + ' food healthy meal')}&per_page=1&orientation=landscape&content_filter=high`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.log('❌ Unsplash API error:', response.status, response.statusText);
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('📊 Unsplash response:', data.total, 'images found');
    
    if (data.results && data.results.length > 0) {
      const imageUrl = data.results[0].urls.regular;
      console.log('✅ Unsplash image found:', imageUrl);
      return imageUrl;
    }
    
    console.log('⚠️ No images found for:', keywords);
    throw new Error('No images found');
  } catch (error) {
    console.error('❌ Unsplash API error:', error);
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
  let dishName = prompt.split(',')[0]
    .replace('Professional food photography of', '')
    .replace(/[^a-zA-Z0-9\s]/g, '') // Rimuovi caratteri speciali
    .trim()
    .substring(0, 20); // Limita lunghezza
  
  if (!dishName) dishName = 'Recipe';
  
  const encodedName = encodeURIComponent(dishName);
  
  // Placeholder colorato e appetitoso con diverse varianti
  const colors = ['8FBC8F', 'FF6B6B', 'FFD93D', '6BCF7F', 'A8E6CF', 'FFB347'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  
  // URL sicuro e funzionante
  return `https://via.placeholder.com/400x300/${randomColor}/ffffff?text=${encodedName}`;
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
      // PRIORITÀ 1: Prova Unsplash con logging dettagliato
      if (process.env.UNSPLASH_ACCESS_KEY) {
        console.log('📸 Trying Unsplash with key:', process.env.UNSPLASH_ACCESS_KEY ? 'Found' : 'Missing');
        imageUrl = await generateWithUnsplash(prompt);
        console.log('✅ Unsplash success:', imageUrl);
      } 
      // PRIORITÀ 2: Fallback a placeholder se Unsplash fallisce
      else {
        console.log('⚠️ No Unsplash key, using placeholder');
        throw new Error('No image generation service configured');
      }
    } catch (error) {
      console.log('⚠️ Image generation failed, using safe placeholder:', error);
      imageUrl = generatePlaceholder(prompt);
    }

    // Verifica che l'URL sia valido
    if (!imageUrl || !imageUrl.startsWith('http')) {
      console.log('❌ Invalid imageUrl, using fallback');
      imageUrl = 'https://via.placeholder.com/400x300/8FBC8F/ffffff?text=Recipe+Image';
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