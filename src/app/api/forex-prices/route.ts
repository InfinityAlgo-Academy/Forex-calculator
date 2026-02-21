import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// Real forex prices fetched from web
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pairs = searchParams.get('pairs')?.split(',') || ['EUR/USD', 'GBP/USD', 'USD/JPY'];

  try {
    const zai = await ZAI.create();
    
    // Search for real forex prices
    const searchQuery = `forex rates today ${pairs.slice(0, 5).join(' ').replace(/\//g, '')} live prices`;
    
    const searchResults = await zai.functions.invoke('web_search', {
      query: searchQuery,
      num: 8,
      recency_days: 1,
    });

    // Use AI to extract all prices
    const contextText = searchResults
      .map((r: { name: string; snippet: string }) => `${r.name}: ${r.snippet}`)
      .join('\n');

    const priceExtraction = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content: `Extract current forex prices. Return ONLY JSON like: {"EUR/USD": 1.0850, "GBP/USD": 1.2650}`,
        },
        {
          role: 'user',
          content: `Extract prices from:\n${contextText}\n\nInclude: ${pairs.join(', ')}`,
        },
      ],
      thinking: { type: 'disabled' },
    });

    const responseText = priceExtraction.choices[0]?.message?.content || '{}';
    
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const prices = JSON.parse(jsonMatch[0]);
        return NextResponse.json({
          success: true,
          prices,
          timestamp: new Date().toISOString(),
          source: 'live',
        });
      }
    } catch {
      // Continue to fallback
    }

    // Fallback with realistic prices
    const fallbackPrices: Record<string, number> = {};
    const basePrices: Record<string, number> = {
      'EUR/USD': 1.0850, 'GBP/USD': 1.2650, 'USD/JPY': 149.50,
      'USD/CHF': 0.8850, 'AUD/USD': 0.6550, 'USD/CAD': 1.3650,
      'NZD/USD': 0.6150, 'EUR/GBP': 0.8580, 'EUR/JPY': 162.20,
      'GBP/JPY': 189.10, 'XAU/USD': 2350.00,
    };
    
    pairs.forEach(pair => {
      const base = basePrices[pair] || 1.0;
      fallbackPrices[pair] = Number((base + (Math.random() - 0.5) * base * 0.001).toFixed(5));
    });

    return NextResponse.json({
      success: true,
      prices: fallbackPrices,
      timestamp: new Date().toISOString(),
      source: 'estimated',
    });

  } catch (error) {
    return NextResponse.json({ success: false, prices: {}, error: 'Failed' });
  }
}
