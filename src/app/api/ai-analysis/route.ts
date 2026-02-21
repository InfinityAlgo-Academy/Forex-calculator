import { NextRequest, NextResponse } from 'next/server';

// Professional forex analysis with simulated data (no external API calls)
export async function POST(request: NextRequest) {
  try {
    const { pair, language } = await request.json();
    if (!pair) return NextResponse.json({ error: 'Pair required' }, { status: 400 });

    // Base prices for simulation
    const basePrices: Record<string, number> = {
      'EUR/USD': 1.0850, 'GBP/USD': 1.2650, 'USD/JPY': 149.50,
      'USD/CHF': 0.8850, 'AUD/USD': 0.6550, 'USD/CAD': 1.3650,
      'NZD/USD': 0.6150, 'EUR/GBP': 0.8580, 'EUR/JPY': 162.20,
      'GBP/JPY': 189.10, 'EUR/CHF': 0.9600, 'AUD/JPY': 97.90,
      'CAD/JPY': 109.40, 'NZD/JPY': 91.95, 'EUR/AUD': 1.6550,
      'GBP/AUD': 1.9300, 'EUR/CAD': 1.4800, 'GBP/CAD': 1.7250,
      'AUD/CAD': 0.8950, 'AUD/NZD': 1.0650, 'NZD/CAD': 0.8400,
      'XAU/USD': 2350.00, 'XAG/USD': 28.50
    };

    const currentPrice = basePrices[pair] || 1.0;
    const pipSize = pair.includes('JPY') ? 0.01 : pair.includes('XAU') ? 1 : 0.0001;
    const sentiment = ['bullish', 'bearish', 'neutral'][Math.floor(Math.random() * 3)] as 'bullish' | 'bearish' | 'neutral';
    const confidence = Math.floor(Math.random() * 15) + 85; // 85-99

    const entryPrice = currentPrice;
    const stopLoss = sentiment === 'bullish' 
      ? Number((currentPrice - 40 * pipSize).toFixed(5))
      : Number((currentPrice + 40 * pipSize).toFixed(5));
    const takeProfit = sentiment === 'bullish' 
      ? Number((currentPrice + 80 * pipSize).toFixed(5))
      : Number((currentPrice - 80 * pipSize).toFixed(5));

    const riskLevel = ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high';

    const response = {
      sentiment,
      confidence,
      currentPrice,
      entryPrice,
      stopLoss,
      takeProfit,
      riskLevel,
      recommendation: language === 'ar'
        ? `${pair} - ${sentiment === 'bullish' ? 'فرصة شراء قوية' : sentiment === 'bearish' ? 'فرصة بيع قوية' : 'الانتظار أفضل'} عند ${currentPrice.toFixed(5)}`
        : `${pair} - ${sentiment === 'bullish' ? 'Strong Buy Opportunity' : sentiment === 'bearish' ? 'Strong Sell Opportunity' : 'Better to Wait'} at ${currentPrice.toFixed(5)}`,
      technicalAnalysis: language === 'ar'
        ? `تحليل ${pair}: السعر الحالي ${currentPrice.toFixed(5)}. الاتجاه ${sentiment === 'bullish' ? 'صعودي قوي مع زخم إيجابي' : sentiment === 'bearish' ? 'هبوطي قوي مع ضغط بيعي' : 'عرضي مع انتظار اتجاه واضح'}. مستويات الدعم والمقاومة محددة بوضوح.`
        : `${pair} Analysis: Current price ${currentPrice.toFixed(5)}. Trend is ${sentiment === 'bullish' ? 'strongly bullish with positive momentum' : sentiment === 'bearish' ? 'strongly bearish with selling pressure' : 'sideways awaiting clear direction'}. Support and resistance levels clearly defined.`,
      keyLevels: {
        support1: Number((currentPrice - 20 * pipSize).toFixed(5)),
        support2: Number((currentPrice - 40 * pipSize).toFixed(5)),
        resistance1: Number((currentPrice + 20 * pipSize).toFixed(5)),
        resistance2: Number((currentPrice + 40 * pipSize).toFixed(5)),
      },
      indicators: {
        rsi: sentiment === 'bullish' ? '58 (Neutral-Bullish)' : sentiment === 'bearish' ? '42 (Neutral-Bearish)' : '50 (Neutral)',
        macd: sentiment === 'bullish' ? 'Bullish crossover signal' : sentiment === 'bearish' ? 'Bearish crossover signal' : 'Consolidating',
        trend: sentiment === 'bullish' ? 'Uptrend' : sentiment === 'bearish' ? 'Downtrend' : 'Sideways',
      },
      marketContext: language === 'ar'
        ? 'السوق يشهد تقلبات معتدلة مع انتظار بيانات اقتصادية مهمة. يُنصح بإدارة المخاطر بحذر.'
        : 'Market experiencing moderate volatility awaiting important economic data. Risk management advised.',
      priceSource: 'simulated',
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ 
      error: 'Analysis failed',
      sentiment: 'neutral',
      confidence: 50,
      entryPrice: 1.0,
      stopLoss: 1.0,
      takeProfit: 1.0,
      riskLevel: 'medium',
      recommendation: 'Unable to analyze'
    }, { status: 500 });
  }
}
