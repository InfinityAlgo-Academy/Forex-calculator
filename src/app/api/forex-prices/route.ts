import { NextRequest, NextResponse } from 'next/server';

// Realistic forex prices with small variations
const basePrices: Record<string, number> = {
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
  'NZD/JPY': 91.95,
  'EUR/AUD': 1.6550,
  'GBP/AUD': 1.9300,
  'EUR/CAD': 1.4800,
  'GBP/CAD': 1.7250,
  'AUD/CAD': 0.8950,
  'AUD/NZD': 1.0650,
  'NZD/CAD': 0.8400,
  'XAU/USD': 2350.00,
  'XAG/USD': 28.50,
  'BTC/USD': 67500.00,
  'ETH/USD': 3450.00
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pairs = searchParams.get('pairs')?.split(',') || Object.keys(basePrices);

  try {
    // Generate realistic prices with small random variations
    const prices: Record<string, number> = {};
    
    pairs.forEach(pair => {
      const base = basePrices[pair] || 1.0;
      // Add small random variation (±0.1%)
      const variation = (Math.random() - 0.5) * base * 0.002;
      prices[pair] = Number((base + variation).toFixed(5));
    });

    return NextResponse.json({
      success: true,
      prices,
      timestamp: new Date().toISOString(),
      source: 'simulated',
    });

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      prices: basePrices, 
      error: 'Failed to fetch prices' 
    });
  }
}
