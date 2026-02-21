import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// Forex pair to search query mapping
const forexSearchQueries: Record<string, string> = {
  'EUR/USD': 'EURUSD live forex rate price today',
  'GBP/USD': 'GBPUSD live forex rate price today',
  'USD/JPY': 'USDJPY live forex rate price today',
  'USD/CHF': 'USDCHF live forex rate price today',
  'AUD/USD': 'AUDUSD live forex rate price today',
  'USD/CAD': 'USDCAD live forex rate price today',
  'NZD/USD': 'NZDUSD live forex rate price today',
  'EUR/GBP': 'EURGBP live forex rate price today',
  'EUR/JPY': 'EURJPY live forex rate price today',
  'GBP/JPY': 'GBPJPY live forex rate price today',
  'EUR/CHF': 'EURCHF live forex rate price today',
  'AUD/JPY': 'AUDJPY live forex rate price today',
  'XAU/USD': 'XAUUSD gold spot price live today',
};

// Fallback prices (approximate)
const fallbackPrices: Record<string, number> = {
  'EUR/USD': 1.0850,
  'GBP/USD': 1.2650,
  'USD/JPY': 149.50,
  'USD/CHF': 0.8850,
  'AUD/USD': 0.6550,
  'USD/CAD': 1.3650,
  'NZD/USD': 0.6150,
  'EUR/GBP': 0.8580,
  'EUR/JPY': 162.20,
  'GBP/JPY': 189.10,
  'EUR/CHF': 0.9600,
  'AUD/JPY': 97.90,
  'CAD/JPY': 109.40,
  'NZD/JPY': 92.00,
  'EUR/AUD': 1.6550,
  'GBP/AUD': 1.9310,
  'EUR/CAD': 1.4820,
  'GBP/CAD': 1.7280,
  'AUD/CAD': 0.8950,
  'AUD/NZD': 1.0650,
  'NZD/CAD': 0.8400,
  'XAU/USD': 2350.00,
  'XAG/USD': 27.50,
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pair = searchParams.get('pair');

  if (!pair) {
    return NextResponse.json({ error: 'Pair is required' }, { status: 400 });
  }

  try {
    const zai = await ZAI.create();
    
    // Search for current forex price
    const searchQuery = forexSearchQueries[pair] || `${pair.replace('/', '')} live forex rate price today`;
    
    const searchResults = await zai.functions.invoke('web_search', {
      query: searchQuery,
      num: 5,
      recency_days: 1,
    });

    // Use AI to extract precise price from search results
    const contextText = searchResults
      .slice(0, 5)
      .map((r: { name: string; snippet: string }) => `${r.name}: ${r.snippet}`)
      .join('\n');

    const priceExtraction = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content: `You are a forex price extractor. Extract the CURRENT live price for ${pair} from the search results.
Return ONLY a JSON object with this exact format: {"price": number, "bid": number, "ask": number, "change": number}
The price should be a single number. For example, if EUR/USD is trading at 1.0850, return {"price": 1.0850, "bid": 1.0849, "ask": 1.0851, "change": 0.0010}
If you cannot find the price, return {"price": 0, "bid": 0, "ask": 0, "change": 0}`,
        },
        {
          role: 'user',
          content: `Extract the current ${pair} price from these search results:\n\n${contextText}`,
        },
      ],
      thinking: { type: 'disabled' },
    });

    const responseText = priceExtraction.choices[0]?.message?.content || '{"price": 0}';
    
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const priceData = JSON.parse(jsonMatch[0]);
        
        if (priceData.price > 0) {
          return NextResponse.json({
            pair,
            price: priceData.price,
            bid: priceData.bid || priceData.price,
            ask: priceData.ask || priceData.price,
            change: priceData.change || 0,
            timestamp: new Date().toISOString(),
            source: 'live',
          });
        }
      }
    } catch {
      // Continue to fallback
    }

    // Fallback
    return NextResponse.json({
      pair,
      price: fallbackPrices[pair] || 1.0000,
      bid: fallbackPrices[pair] || 1.0000,
      ask: fallbackPrices[pair] || 1.0000,
      change: 0,
      timestamp: new Date().toISOString(),
      source: 'fallback',
    });

  } catch (error) {
    console.error('Forex price fetch error:', error);
    
    return NextResponse.json({
      pair,
      price: fallbackPrices[pair] || 1.0000,
      bid: fallbackPrices[pair] || 1.0000,
      ask: fallbackPrices[pair] || 1.0000,
      change: 0,
      timestamp: new Date().toISOString(),
      source: 'fallback',
      error: 'Failed to fetch live price',
    });
  }
}
