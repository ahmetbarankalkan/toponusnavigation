import { NextResponse } from 'next/server';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request) {
  try {
    const { messages, functions } = await request.json();

    // OpenAI API anahtarını kontrol et
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY is not set in environment variables');
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please set OPENAI_API_KEY in environment variables.' },
        { status: 500, headers: corsHeaders }
      );
    }

    // Retry mekanizması
    const maxRetries = 3;
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // OpenAI API'sine istek gönder (30 saniye timeout)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiApiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: messages,
            functions: functions,
            function_call: 'auto', // GPT'nin function call yapmasını sağla
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.text();
          
          // 502, 503, 504 hatalarında retry yap
          if ([502, 503, 504].includes(response.status) && attempt < maxRetries) {
            console.warn(`⚠️ OpenAI API hatası ${response.status}, ${attempt}. deneme başarısız. ${attempt + 1}. deneme yapılıyor...`);
            lastError = new Error(`OpenAI API error: ${response.status}`);
            
            // Exponential backoff: 1s, 2s, 4s
            const delay = Math.pow(2, attempt - 1) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          
          console.error('OpenAI API error:', response.status, errorData);
          return NextResponse.json(
            { error: `OpenAI API error: ${response.status}`, details: errorData },
            { status: response.status, headers: corsHeaders }
          );
        }

        const data = await response.json();
        return NextResponse.json(data, { headers: corsHeaders });

      } catch (error) {
        lastError = error;
        
        // Timeout veya network hatası ise retry yap
        if (attempt < maxRetries && (error.name === 'AbortError' || error.message.includes('fetch'))) {
          console.warn(`⚠️ ${error.name === 'AbortError' ? 'Timeout' : 'Network error'}, ${attempt}. deneme başarısız. ${attempt + 1}. deneme yapılıyor...`);
          const delay = Math.pow(2, attempt - 1) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        throw error;
      }
    }

    // Tüm retryleri tükettik
    console.error('Chat API error after retries:', lastError);
    return NextResponse.json(
      { error: 'OpenAI API request failed after retries', details: lastError?.message },
      { status: 503, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
