'use client';

import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, TrendingUp, TrendingDown, DollarSign, Percent, 
  Target, LineChart, BarChart3, Activity, Sun, Moon, 
  Globe, ChevronRight, AlertTriangle, CheckCircle2, 
  RefreshCw, Zap, Shield, Award, Menu, X, Loader2,
  Layers, Scale, ArrowUpDown, Coins, Wallet, PieChart,
  Clock, Hash, Repeat, Sparkles, TrendingUpIcon, Flame,
  Gift, Timer, Star, ExternalLink, Crown, Diamond
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useLanguage, hydrateLanguage } from '@/hooks/useLanguage';
import { useTradingState, hydrateTradingState } from '@/hooks/useTradingState';

// Currency pairs data
const currencyPairs = [
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD',
  'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'EUR/CHF', 'AUD/JPY', 'CAD/JPY', 'NZD/JPY',
  'EUR/AUD', 'GBP/AUD', 'EUR/CAD', 'GBP/CAD', 'AUD/CAD', 'AUD/NZD', 'NZD/CAD',
  'XAU/USD', 'XAG/USD', 'BTC/USD', 'ETH/USD'
];

const accountCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD'];

const leverageOptions = ['1:10', '1:20', '1:50', '1:100', '1:200', '1:500', '1:1000'];

// Real-time exchange rates - will be fetched from API
const defaultExchangeRates: Record<string, number> = {
  'EUR/USD': 1.0850, 'GBP/USD': 1.2650, 'USD/JPY': 149.50, 'USD/CHF': 0.8850,
  'AUD/USD': 0.6550, 'USD/CAD': 1.3650, 'NZD/USD': 0.6150, 'XAU/USD': 2350.00,
  'BTC/USD': 67500.00, 'ETH/USD': 3450.00
};

// Calculator Card Component
function CalculatorCard({ 
  title, 
  description, 
  icon, 
  component 
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode; 
  component: React.ReactNode;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <motion.div
      layout
      className="group"
    >
      <Card className={`
        overflow-hidden transition-all duration-300 cursor-pointer
        ${isExpanded 
          ? 'ring-2 ring-primary shadow-xl scale-[1.02]' 
          : 'hover:shadow-lg hover:scale-[1.01] border-2 border-transparent hover:border-primary/20'
        }
      `}>
        <div onClick={() => setIsExpanded(!isExpanded)}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-4">
              <motion.div 
                className={`
                  w-14 h-14 rounded-2xl flex items-center justify-center
                  ${isExpanded 
                    ? 'gradient-primary text-white shadow-lg' 
                    : 'bg-gradient-to-br from-primary/10 to-accent/10 text-primary group-hover:from-primary/20 group-hover:to-accent/20'
                  }
                `}
                whileHover={{ rotate: isExpanded ? 0 : 5 }}
                transition={{ duration: 0.2 }}
              >
                {icon}
              </motion.div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-bold truncate">{title}</CardTitle>
                <p className="text-sm text-muted-foreground truncate">{description}</p>
              </div>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  ${isExpanded ? 'bg-primary text-primary-foreground' : 'bg-muted'}
                `}
              >
                <ChevronRight className="w-5 h-5" />
              </motion.div>
            </div>
          </CardHeader>
        </div>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="px-6 pb-2">
                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>
              <CardContent className="pt-4">
                {component}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

export default function ForexCalculatorApp() {
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { 
    globalPair, 
    setGlobalPair, 
    exchangeRates, 
    setExchangeRates, 
    stats,
    incrementCalculation 
  } = useTradingState();
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('calculators');
  const [loadingPrices, setLoadingPrices] = useState(false);
  const hasHydrated = useRef(false);

  // Hydrate both stores on mount (runs once)
  useLayoutEffect(() => {
    if (!hasHydrated.current) {
      hydrateLanguage();
      hydrateTradingState();
      hasHydrated.current = true;
    }
  }, []);

  // Fetch real forex prices
  const fetchRealPrices = async () => {
    setLoadingPrices(true);
    try {
      const response = await fetch('/api/forex-prices');
      if (response.ok) {
        const data = await response.json();
        if (data.prices) {
          setExchangeRates(prev => ({ ...prev, ...data.prices }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch prices:', error);
    } finally {
      setLoadingPrices(false);
    }
  };

  // Fetch prices on mount
  useEffect(() => {
    fetchRealPrices();
    // Refresh every 30 seconds
    const interval = setInterval(fetchRealPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  // Toggle dark mode
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Set RTL direction
  useEffect(() => {
    document.documentElement.dir = isRTL() ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <Header 
        language={language} 
        setLanguage={setLanguage} 
        isDark={isDark} 
        setIsDark={setIsDark}
        isRTL={isRTL}
        t={t}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        globalPair={globalPair}
        setGlobalPair={setGlobalPair}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection 
          t={t} 
          isRTL={isRTL} 
          language={language} 
          setActiveSection={setActiveSection} 
          stats={stats}
          totalCalculators={50}
        />

        {/* Global Pair Selector */}
        <section className="py-4 px-4 sm:px-6 lg:px-8 bg-card border-b">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <span className="text-sm font-medium text-muted-foreground">
                {language === 'ar' ? 'اختر زوج العملات لجميع الحاسبات:' : 'Select currency pair for all calculators:'}
              </span>
              <Select value={globalPair} onValueChange={setGlobalPair}>
                <SelectTrigger className="w-40 gradient-primary text-white border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencyPairs.map(pair => (
                    <SelectItem key={pair} value={pair}>{pair}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant="outline" className="text-xs">
                {language === 'ar' ? 'السعر الحالي:' : 'Current Price:'} {exchangeRates[globalPair]?.toFixed(5) || 'N/A'}
              </Badge>
            </div>
          </div>
        </section>

        {/* Professional Ads Section */}
        <ProfessionalAdsSection language={language} />

        {/* Calculators Section */}
        <section id="calculators" className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-primary">
                {language === 'ar' ? 'حاسبات التداول الاحترافية' : 'Professional Trading Calculators'}
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {language === 'ar' 
                  ? '50+ أداة وحاسبة احترافية لمساعدتك في اتخاذ قرارات تداول مدروسة'
                  : '50+ professional tools and calculators to help you make informed trading decisions'}
              </p>
            </div>

            {/* Calculator Categories */}
            <Tabs defaultValue="risk" className="w-full">
              <TabsList className="grid grid-cols-4 sm:grid-cols-6 gap-2 h-auto p-2 bg-card rounded-xl mb-8">
                <TabsTrigger value="risk" className="text-xs px-3 py-2">
                  <Shield className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">{language === 'ar' ? 'إدارة المخاطر' : 'Risk'}</span>
                </TabsTrigger>
                <TabsTrigger value="position" className="text-xs px-3 py-2">
                  <Layers className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">{language === 'ar' ? 'الصفقات' : 'Position'}</span>
                </TabsTrigger>
                <TabsTrigger value="technical" className="text-xs px-3 py-2">
                  <LineChart className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">{language === 'ar' ? 'التحليل الفني' : 'Technical'}</span>
                </TabsTrigger>
                <TabsTrigger value="money" className="text-xs px-3 py-2">
                  <Wallet className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">{language === 'ar' ? 'إدارة رأس المال' : 'Money'}</span>
                </TabsTrigger>
                <TabsTrigger value="convert" className="text-xs px-3 py-2">
                  <Globe className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">{language === 'ar' ? 'تحويل' : 'Convert'}</span>
                </TabsTrigger>
                <TabsTrigger value="advanced" className="text-xs px-3 py-2">
                  <Sparkles className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">{language === 'ar' ? 'متقدم' : 'Advanced'}</span>
                </TabsTrigger>
              </TabsList>

              {/* Risk Management Calculators */}
              <TabsContent value="risk" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <CalculatorCard 
                    title={language === 'ar' ? 'حجم الصفقة' : 'Position Size'}
                    description={language === 'ar' ? 'احسب الحجم الأمثل لصفقتك' : 'Calculate optimal position size'}
                    icon={<Calculator className="w-5 h-5" />}
                    component={<PositionSizeCalculator t={t} language={language} />}
                  />
                  <CalculatorCard 
                    title={language === 'ar' ? 'المخاطرة/المكافأة' : 'Risk/Reward'}
                    description={language === 'ar' ? 'نسبة المخاطرة للمكافأة' : 'Risk to reward ratio'}
                    icon={<Target className="w-5 h-5" />}
                    component={<RiskRewardCalculator t={t} language={language} />}
                  />
                  <CalculatorCard 
                    title={language === 'ar' ? 'المخاطرة بالنسبة المئوية' : 'Risk Percentage'}
                    description={language === 'ar' ? 'احسب نسبة المخاطرة' : 'Calculate risk percentage'}
                    icon={<Percent className="w-5 h-5" />}
                    component={<RiskPercentageCalculator t={t} language={language} />}
                  />
                  <CalculatorCard 
                    title={language === 'ar' ? 'الحد الأقصى للخسارة' : 'Max Drawdown'}
                    description={language === 'ar' ? 'احسب أقصى خسارة مسموحة' : 'Calculate maximum drawdown'}
                    icon={<TrendingDown className="w-5 h-5" />}
                    component={<DrawdownCalculator t={t} language={language} />}
                  />
                  <CalculatorCard 
                    title={language === 'ar' ? 'نقطة التعادل' : 'Break Even'}
                    description={language === 'ar' ? 'احسب نقطة التعادل' : 'Calculate break even point'}
                    icon={<ArrowUpDown className="w-5 h-5" />}
                    component={<BreakEvenCalculator t={t} language={language} />}
                  />
                  <CalculatorCard 
                    title={language === 'ar' ? 'مستوى الهامش' : 'Margin Level'}
                    description={language === 'ar' ? 'احسب مستوى الهامش' : 'Calculate margin level'}
                    icon={<Scale className="w-5 h-5" />}
                    component={<MarginLevelCalculator t={t} language={language} />}
                  />
                </div>
              </TabsContent>

              {/* Position Calculators */}
              <TabsContent value="position" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <CalculatorCard 
                    title={language === 'ar' ? 'قيمة النقطة' : 'Pip Value'}
                    description={language === 'ar' ? 'احسب قيمة النقطة' : 'Calculate pip value'}
                    icon={<Activity className="w-5 h-5" />}
                    component={<PipValueCalculator t={t} language={language} />}
                  />
                  <CalculatorCard 
                    title={language === 'ar' ? 'الهامش المطلوب' : 'Margin Required'}
                    description={language === 'ar' ? 'احسب الهامش المطلوب' : 'Calculate required margin'}
                    icon={<DollarSign className="w-5 h-5" />}
                    component={<MarginCalculator t={t} language={language} exchangeRates={exchangeRates} />}
                  />
                  <CalculatorCard 
                    title={language === 'ar' ? 'الربح والخسارة' : 'Profit/Loss'}
                    description={language === 'ar' ? 'احسب الربح أو الخسارة' : 'Calculate profit or loss'}
                    icon={<TrendingUp className="w-5 h-5" />}
                    component={<ProfitLossCalculator t={t} language={language} />}
                  />
                  <CalculatorCard 
                    title={language === 'ar' ? 'السواب' : 'Swap'}
                    description={language === 'ar' ? 'احسب رسوم السواب' : 'Calculate swap fees'}
                    icon={<RefreshCw className="w-5 h-5" />}
                    component={<SwapCalculator t={t} language={language} />}
                  />
                  <CalculatorCard 
                    title={language === 'ar' ? 'الرافعة المالية' : 'Leverage'}
                    description={language === 'ar' ? 'احسب الرافعة المالية' : 'Calculate leverage'}
                    icon={<Layers className="w-5 h-5" />}
                    component={<LeverageCalculator t={t} language={language} />}
                  />
                  <CalculatorCard 
                    title={language === 'ar' ? 'حجم اللوت' : 'Lot Size'}
                    description={language === 'ar' ? 'احسب حجم اللوت' : 'Calculate lot size'}
                    icon={<Hash className="w-5 h-5" />}
                    component={<LotSizeCalculator t={t} language={language} />}
                  />
                </div>
              </TabsContent>

              {/* Technical Analysis Calculators */}
              <TabsContent value="technical" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <CalculatorCard 
                    title={language === 'ar' ? 'مستويات فيبوناتشي' : 'Fibonacci Levels'}
                    description={language === 'ar' ? 'احسب مستويات فيبوناتشي' : 'Calculate Fibonacci levels'}
                    icon={<LineChart className="w-5 h-5" />}
                    component={<FibonacciCalculator t={t} language={language} />}
                  />
                  <CalculatorCard 
                    title={language === 'ar' ? 'نقاط البيفوت' : 'Pivot Points'}
                    description={language === 'ar' ? 'احسب نقاط البيفوت' : 'Calculate pivot points'}
                    icon={<BarChart3 className="w-5 h-5" />}
                    component={<PivotPointsCalculator t={t} language={language} />}
                  />
                  <CalculatorCard 
                    title={language === 'ar' ? 'المتوسط المتحرك' : 'Moving Average'}
                    description={language === 'ar' ? 'احسب المتوسط المتحرك' : 'Calculate moving average'}
                    icon={<TrendingUpIcon className="w-5 h-5" />}
                    component={<MovingAverageCalculator t={t} language={language} />}
                  />
                  <CalculatorCard 
                    title="ATR"
                    description={language === 'ar' ? 'متوسط المدى الحقيقي' : 'Average True Range'}
                    icon={<Activity className="w-5 h-5" />}
                    component={<ATRCalculator t={t} language={language} />}
                  />
                  <CalculatorCard 
                    title="RSI"
                    description={language === 'ar' ? 'مؤشر القوة النسبية' : 'Relative Strength Index'}
                    icon={<Activity className="w-5 h-5" />}
                    component={<RSICalculator t={t} language={language} />}
                  />
                  <CalculatorCard 
                    title="MACD"
                    description={language === 'ar' ? 'مؤشر التقارب والتباعد' : 'Moving Average Convergence Divergence'}
                    icon={<BarChart3 className="w-5 h-5" />}
                    component={<MACDCalculator t={t} language={language} />}
                  />
                  <CalculatorCard 
                    title="Bollinger Bands"
                    description={language === 'ar' ? 'نطاقات بولينجر' : 'Bollinger Bands'}
                    icon={<TrendingUp className="w-5 h-5" />}
                    component={<BollingerBandsCalculator t={t} language={language} />}
                  />
                  <CalculatorCard 
                    title="Stochastic"
                    description={language === 'ar' ? 'مذبذب ستوكاستيك' : 'Stochastic Oscillator'}
                    icon={<Activity className="w-5 h-5" />}
                    component={<StochasticCalculator t={t} language={language} />}
                  />
                  <CalculatorCard 
                    title={language === 'ar' ? 'معامل الارتباط' : 'Correlation'}
                    description={language === 'ar' ? 'احسب معامل الارتباط' : 'Calculate correlation'}
                    icon={<Repeat className="w-5 h-5" />}
                    component={<CorrelationCalculator t={t} language={language} />}
                  />
                  <CalculatorCard 
                    title={language === 'ar' ? 'الانحراف المعياري' : 'Standard Deviation'}
                    description={language === 'ar' ? 'احسب الانحراف المعياري' : 'Calculate standard deviation'}
                    icon={<Activity className="w-5 h-5" />}
                    component={<StandardDeviationCalculator t={t} language={language} />}
                  />
                  <CalculatorCard 
                    title={language === 'ar' ? 'الزخم' : 'Momentum'}
                    description={language === 'ar' ? 'احسب الزخم' : 'Calculate momentum'}
                    icon={<Zap className="w-5 h-5" />}
                    component={<MomentumCalculator t={t} language={language} />}
                  />
                </div>
              </TabsContent>

              {/* Money Management Calculators */}
              <TabsContent value="money" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <CalculatorCard 
                    title={language === 'ar' ? 'الفائدة المركبة' : 'Compound Interest'}
                    description={language === 'ar' ? 'احسب الفائدة المركبة' : 'Calculate compound interest'}
                    icon={<PieChart className="w-5 h-5" />}
                    component={<CompoundInterestCalculator t={t} language={language} />}
                  />
                  <CalculatorCard 
                    title={language === 'ar' ? 'معامل كيلي' : 'Kelly Criterion'}
                    description={language === 'ar' ? 'احسب معامل كيلي' : 'Calculate Kelly criterion'}
                    icon={<Percent className="w-5 h-5" />}
                    component={<KellyCriterionCalculator t={t} language={language} />}
                  />
                  <CalculatorCard 
                    title={language === 'ar' ? 'نسبة شارب' : 'Sharpe Ratio'}
                    description={language === 'ar' ? 'احسب نسبة شارب' : 'Calculate Sharpe ratio'}
                    icon={<BarChart3 className="w-5 h-5" />}
                    component={<SharpeRatioCalculator t={t} language={language} />}
                  />
                  <CalculatorCard 
                    title={language === 'ar' ? 'القيمة المتوقعة' : 'Expected Value'}
                    description={language === 'ar' ? 'احسب القيمة المتوقعة' : 'Calculate expected value'}
                    icon={<Calculator className="w-5 h-5" />}
                    component={<ExpectedValueCalculator t={t} language={language} />}
                  />
                  <CalculatorCard 
                    title={language === 'ar' ? 'العائد على الاستثمار' : 'ROI'}
                    description={language === 'ar' ? 'احسب العائد على الاستثمار' : 'Calculate return on investment'}
                    icon={<TrendingUp className="w-5 h-5" />}
                    component={<ROICalculator t={t} language={language} />}
                  />
                  <CalculatorCard 
                    title={language === 'ar' ? 'حجم الحساب المطلوب' : 'Account Size'}
                    description={language === 'ar' ? 'احسب حجم الحساب المطلوب' : 'Calculate required account size'}
                    icon={<Wallet className="w-5 h-5" />}
                    component={<AccountSizeCalculator t={t} language={language} />}
                  />
                  <CalculatorCard 
                    title="Profit Factor"
                    description={language === 'ar' ? 'معامل الربحية' : 'Profit Factor Calculator'}
                    icon={<TrendingUp className="w-5 h-5" />}
                    component={<ProfitFactorCalculator t={t} language={language} />}
                  />
                  <CalculatorCard 
                    title={language === 'ar' ? 'منحنى الأسهم' : 'Equity Curve'}
                    description={language === 'ar' ? 'توقع نمو الحساب' : 'Project account growth'}
                    icon={<LineChart className="w-5 h-5" />}
                    component={<EquityCurveCalculator t={t} language={language} />}
                  />
                  <CalculatorCard 
                    title={language === 'ar' ? 'متوسط الصفقة' : 'Avg Trade'}
                    description={language === 'ar' ? 'متوسط الربح للصفقة' : 'Average profit per trade'}
                    icon={<Calculator className="w-5 h-5" />}
                    component={<AverageTradeCalculator t={t} language={language} />}
                  />
                </div>
              </TabsContent>

              {/* Conversion Calculators */}
              <TabsContent value="convert" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <CalculatorCard 
                    title={language === 'ar' ? 'تحويل العملات' : 'Currency Converter'}
                    description={language === 'ar' ? 'حول بين العملات' : 'Convert between currencies'}
                    icon={<Globe className="w-5 h-5" />}
                    component={<CurrencyConverter t={t} language={language} />}
                  />
                  <CalculatorCard 
                    title={language === 'ar' ? 'تحويل النقاط' : 'Pips Converter'}
                    description={language === 'ar' ? 'حول النقاط للسعر' : 'Convert pips to price'}
                    icon={<Hash className="w-5 h-5" />}
                    component={<PipsConverter t={t} language={language} />}
                  />
                  <CalculatorCard 
                    title={language === 'ar' ? 'تحويل اللوت' : 'Lot Converter'}
                    description={language === 'ar' ? 'حول بين أحجام اللوت' : 'Convert between lot sizes'}
                    icon={<Layers className="w-5 h-5" />}
                    component={<LotConverter t={t} language={language} />}
                  />
                  <CalculatorCard 
                    title={language === 'ar' ? 'تحويل الوقت' : 'Time Zone'}
                    description={language === 'ar' ? 'حول بين المناطق الزمنية' : 'Convert between time zones'}
                    icon={<Clock className="w-5 h-5" />}
                    component={<TimeZoneConverter t={t} language={language} />}
                  />
                  <CalculatorCard 
                    title={language === 'ar' ? 'تداخل الجلسات' : 'Session Overlap'}
                    description={language === 'ar' ? 'أفضل وقت للتداول' : 'Best trading times'}
                    icon={<Clock className="w-5 h-5" />}
                    component={<SessionOverlapCalculator t={t} language={language} />}
                  />
                </div>
              </TabsContent>

              {/* Advanced Calculators */}
              <TabsContent value="advanced" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <CalculatorCard 
                    title={language === 'ar' ? 'السبريد' : 'Spread'}
                    description={language === 'ar' ? 'احسب السبريد' : 'Calculate spread'}
                    icon={<ArrowUpDown className="w-5 h-5" />}
                    component={<SpreadCalculator t={t} language={language} />}
                  />
                  <CalculatorCard 
                    title={language === 'ar' ? 'تكلفة الصفقة' : 'Trade Cost'}
                    description={language === 'ar' ? 'احسب تكلفة الصفقة' : 'Calculate trade cost'}
                    icon={<Coins className="w-5 h-5" />}
                    component={<TradeCostCalculator t={t} language={language} />}
                  />
                  <CalculatorCard 
                    title={language === 'ar' ? 'حجم الصفقات المتعددة' : 'Multi-Position'}
                    description={language === 'ar' ? 'احسب حجم صفقات متعددة' : 'Calculate multiple positions'}
                    icon={<Layers className="w-5 h-5" />}
                    component={<MultiPositionCalculator t={t} language={language} />}
                  />
                  <CalculatorCard 
                    title={language === 'ar' ? 'معدل الربح' : 'Win Rate'}
                    description={language === 'ar' ? 'احسب معدل الربح' : 'Calculate win rate'}
                    icon={<CheckCircle2 className="w-5 h-5" />}
                    component={<WinRateCalculator t={t} language={language} />}
                  />
                  <CalculatorCard 
                    title={language === 'ar' ? 'التقلب' : 'Volatility'}
                    description={language === 'ar' ? 'احسب التقلب' : 'Calculate volatility'}
                    icon={<Activity className="w-5 h-5" />}
                    component={<VolatilityCalculator t={t} language={language} />}
                  />
                  <CalculatorCard 
                    title={language === 'ar' ? 'القيمة المعرضة للخطر' : 'Value at Risk'}
                    description={language === 'ar' ? 'احسب VaR' : 'Calculate VaR'}
                    icon={<AlertTriangle className="w-5 h-5" />}
                    component={<VaRCalculator t={t} language={language} />}
                  />
                  <CalculatorCard 
                    title={language === 'ar' ? 'حرارة المراكز' : 'Position Heat'}
                    description={language === 'ar' ? 'مخاطر المراكز المفتوحة' : 'Open positions risk'}
                    icon={<Zap className="w-5 h-5" />}
                    component={<PositionHeatCalculator t={t} language={language} />}
                  />
                  <CalculatorCard 
                    title={language === 'ar' ? 'مسافة وقف الخسارة' : 'SL Distance'}
                    description={language === 'ar' ? 'احسب مسافة الوقف' : 'Calculate stop loss distance'}
                    icon={<Target className="w-5 h-5" />}
                    component={<StopLossDistanceCalculator t={t} language={language} />}
                  />
                  <CalculatorCard 
                    title={language === 'ar' ? 'جني الأرباح' : 'Take Profit'}
                    description={language === 'ar' ? 'احسب مستوى الهدف' : 'Calculate take profit level'}
                    icon={<TrendingUp className="w-5 h-5" />}
                    component={<TakeProfitCalculator t={t} language={language} />}
                  />
                  <CalculatorCard 
                    title={language === 'ar' ? 'مخاطر الإفلاس' : 'Risk of Ruin'}
                    description={language === 'ar' ? 'احسب مخاطر الإفلاس' : 'Calculate risk of ruin'}
                    icon={<AlertTriangle className="w-5 h-5" />}
                    component={<RiskOfRuinCalculator t={t} language={language} />}
                  />
                  <CalculatorCard 
                    title={language === 'ar' ? 'العمولات' : 'Commission'}
                    description={language === 'ar' ? 'احسب تكاليف العمولة' : 'Calculate commission costs'}
                    icon={<Coins className="w-5 h-5" />}
                    component={<CommissionCalculator t={t} language={language} />}
                  />
                  <CalculatorCard 
                    title={language === 'ar' ? 'تأثير الرافعة' : 'Leverage Impact'}
                    description={language === 'ar' ? 'تأثير الرافعة على الربح' : 'Leverage effect on profit'}
                    icon={<Layers className="w-5 h-5" />}
                    component={<LeverageImpactCalculator t={t} language={language} />}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* AI Analysis Section */}
        <AIAnalysisSection t={t} language={language} exchangeRates={exchangeRates} />

        {/* Features Section */}
        <FeaturesSection t={t} language={language} />

        {/* Disclaimer */}
        <section className="py-8 px-4 bg-destructive/5 border-y border-destructive/20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <span className="font-semibold text-destructive">
                {language === 'ar' ? 'تنبيه المخاطر' : 'Risk Warning'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('disclaimer')}
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer t={t} language={language} />
    </div>
  );
}

// Header Component
function Header({ 
  language, setLanguage, isDark, setIsDark, isRTL, t, mobileMenuOpen, setMobileMenuOpen, activeSection, setActiveSection, globalPair, setGlobalPair
}: {
  language: string;
  setLanguage: (lang: 'en' | 'ar') => void;
  isDark: boolean;
  setIsDark: (v: boolean) => void;
  isRTL: () => boolean;
  t: (key: string) => string;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (v: boolean) => void;
  activeSection: string;
  setActiveSection: (v: string) => void;
  globalPair: string;
  setGlobalPair: (v: string) => void;
}) {
  const navItems = [
    { id: 'calculators', label: language === 'ar' ? 'الحاسبات' : 'Calculators' },
    { id: 'ai-analysis', label: language === 'ar' ? 'تحليل AI' : 'AI Analysis' },
    { id: 'features', label: language === 'ar' ? 'المميزات' : 'Features' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-primary">{t('appName')}</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">{t('tagline')}</p>
            </div>
          </div>

          {/* Global Pair Quick Selector - Desktop */}
          <div className="hidden lg:flex items-center gap-2">
            <Select value={globalPair} onValueChange={setGlobalPair}>
              <SelectTrigger className="w-28 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencyPairs.slice(0, 15).map(pair => (
                  <SelectItem key={pair} value={pair}>{pair}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  activeSection === item.id ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="rounded-full"
            >
              <Globe className="w-5 h-5" />
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDark(!isDark)}
              className="rounded-full"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {/* Mobile Menu */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden py-4 border-t"
          >
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-3 px-4 text-sm font-medium hover:bg-muted rounded-lg"
              >
                {item.label}
              </button>
            ))}
          </motion.nav>
        )}
      </div>
    </header>
  );
}

// Hero Section
function HeroSection({ t, isRTL, language, setActiveSection, stats, totalCalculators }: { 
  t: (key: string) => string; 
  isRTL: () => boolean; 
  language: string; 
  setActiveSection: (v: string) => void;
  stats: {
    totalCalculations: number;
    visitors: number;
    popularCalculators: { name: string; count: number }[];
  };
  totalCalculators: number;
}) {
  const displayStats = [
    { label: language === 'ar' ? 'حاسبات ذكية' : 'Smart Calculators', value: `${totalCalculators}+`, icon: Calculator },
    { label: language === 'ar' ? 'العمليات المنفذة' : 'Calculations', value: stats.totalCalculations.toLocaleString(), icon: Activity, dynamic: true },
    { label: language === 'ar' ? 'المستخدمين النشطين' : 'Active Users', value: stats.visitors.toLocaleString(), icon: TrendingUp, dynamic: true },
  ];

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 gradient-primary opacity-5" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="outline" className="mb-6 px-4 py-2 border-primary/30 text-primary">
              <Zap className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {language === 'ar' ? 'الأداة الأكثر شمولاً للمتداولين' : 'The Most Comprehensive Trading Tool'}
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
          >
            <span className="text-primary">{t('appName')}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10"
          >
            {language === 'ar'
              ? 'أدوات احترافية متكاملة لحساب حجم الصفقات، إدارة المخاطر، تحليل السوق بالذكاء الاصطناعي، والمزيد'
              : 'Professional integrated tools for position sizing, risk management, AI market analysis, and more'}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Button
              size="lg"
              className="gradient-primary text-white px-8 h-12"
              onClick={() => {
                setActiveSection('calculators');
                document.getElementById('calculators')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {language === 'ar' ? 'ابدأ الآن' : 'Get Started'}
              <ChevronRight className="w-5 h-5 ml-2 rtl:mr-2 rtl:ml-0 rtl:rotate-180" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 h-12"
              onClick={() => {
                setActiveSection('ai-analysis');
                document.getElementById('ai-analysis')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Zap className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" />
              {language === 'ar' ? 'تحليل AI' : 'AI Analysis'}
            </Button>
          </motion.div>

          {/* Dynamic Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-3 gap-4 max-w-2xl mx-auto"
          >
            {displayStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className={`bg-card/50 backdrop-blur ${stat.dynamic ? 'ring-1 ring-primary/30' : ''}`}>
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Icon className={`w-4 h-4 ${stat.dynamic ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
                    </div>
                    <motion.div 
                      className="text-2xl sm:text-3xl font-bold text-primary"
                      key={stat.value}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {stat.value}
                    </motion.div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </motion.div>

          {/* Popular Calculators */}
          {stats.totalCalculations > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-8"
            >
              <p className="text-sm text-muted-foreground mb-3">
                {language === 'ar' ? 'الحاسبات الأكثر استخداماً:' : 'Most used calculators:'}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {stats.popularCalculators.slice(0, 3).map((calc, i) => (
                  <Badge key={i} variant="secondary" className="px-3 py-1">
                    {calc.name} ({calc.count})
                  </Badge>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

// Position Size Calculator
function PositionSizeCalculator({ t, language }: { t: (key: string) => string; language: string }) {
  const { globalPair, incrementCalculation } = useTradingState();
  const [accountBalance, setAccountBalance] = useState<string>('10000');
  const [riskPercent, setRiskPercent] = useState<string>('2');
  const [stopLossPips, setStopLossPips] = useState<string>('50');
  const [currencyPair, setCurrencyPair] = useState<string>('EUR/USD');
  const [accountCurrency, setAccountCurrency] = useState<string>('USD');
  const [result, setResult] = useState<{ lotSize: number; riskAmount: number } | null>(null);

  // Sync with global pair
  useEffect(() => {
    setCurrencyPair(globalPair);
  }, [globalPair]);

  const calculate = () => {
    const balance = parseFloat(accountBalance) || 0;
    const risk = parseFloat(riskPercent) || 0;
    const slPips = parseFloat(stopLossPips) || 1;

    const riskAmount = (balance * risk) / 100;
    const pipValue = 10; // Standard lot pip value for most pairs
    const lotSize = riskAmount / (slPips * pipValue);

    setResult({
      lotSize: Math.min(Math.max(lotSize, 0.01), 100),
      riskAmount
    });
    incrementCalculation('Position Size');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-6 h-6 text-primary" />
            {t('positionSize')}
          </CardTitle>
          <CardDescription>
            {language === 'ar'
              ? 'احسب الحجم الأمثل لصفقتك بناءً على رصيدك ونسبة المخاطرة'
              : 'Calculate the optimal position size based on your balance and risk percentage'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('accountBalance')}</Label>
              <Input
                type="number"
                value={accountBalance}
                onChange={(e) => setAccountBalance(e.target.value)}
                placeholder="10000"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('riskPercentage')}</Label>
              <Input
                type="number"
                value={riskPercent}
                onChange={(e) => setRiskPercent(e.target.value)}
                placeholder="2"
                min="0.1"
                max="100"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('stopLossPips')}</Label>
              <Input
                type="number"
                value={stopLossPips}
                onChange={(e) => setStopLossPips(e.target.value)}
                placeholder="50"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                {t('currencyPair')}
                {currencyPair === globalPair && (
                  <Badge variant="outline" className="text-xs">{language === 'ar' ? 'متزامن' : 'Synced'}</Badge>
                )}
              </Label>
              <Select value={currencyPair} onValueChange={setCurrencyPair}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencyPairs.map(pair => (
                    <SelectItem key={pair} value={pair}>{pair}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('accountCurrency')}</Label>
              <Select value={accountCurrency} onValueChange={setAccountCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {accountCurrencies.map(curr => (
                    <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={calculate} className="w-full gradient-primary text-white">
            {t('calculate')}
          </Button>

          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="result-box"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">{t('lotSizeResult')}</p>
                  <p className="text-3xl font-bold text-primary">{result.lotSize.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Lots</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">{t('riskAmount')}</p>
                  <p className="text-3xl font-bold text-destructive">{result.riskAmount.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{accountCurrency}</p>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Pip Value Calculator
function PipValueCalculator({ t, language }: { t: (key: string) => string; language: string }) {
  const { globalPair, incrementCalculation } = useTradingState();
  const [currencyPair, setCurrencyPair] = useState<string>('EUR/USD');
  const [lotSize, setLotSize] = useState<string>('1');
  const [accountCurrency, setAccountCurrency] = useState<string>('USD');
  const [result, setResult] = useState<number | null>(null);

  // Sync with global pair
  useEffect(() => {
    setCurrencyPair(globalPair);
  }, [globalPair]);

  const calculate = () => {
    const lots = parseFloat(lotSize) || 1;
    // Simplified pip value calculation
    let pipValue = 10 * lots; // Standard lot = $10 per pip for pairs with USD as quote
    
    if (currencyPair.includes('JPY')) {
      pipValue = 1000 * lots / 100; // JPY pairs have different pip value
    }
    
    if (accountCurrency === 'EUR') pipValue *= 0.92;
    else if (accountCurrency === 'GBP') pipValue *= 0.79;
    else if (accountCurrency === 'JPY') pipValue *= 149.5;
    
    setResult(pipValue);
    incrementCalculation('Pip Value');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            {t('pipValue')}
          </CardTitle>
          <CardDescription>{t('pipValueTitle')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                {t('currencyPair')}
                {currencyPair === globalPair && (
                  <Badge variant="outline" className="text-xs">{language === 'ar' ? 'متزامن' : 'Synced'}</Badge>
                )}
              </Label>
              <Select value={currencyPair} onValueChange={setCurrencyPair}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencyPairs.map(pair => (
                    <SelectItem key={pair} value={pair}>{pair}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('tradeSize')}</Label>
              <Input
                type="number"
                value={lotSize}
                onChange={(e) => setLotSize(e.target.value)}
                placeholder="1"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('accountCurrency')}</Label>
              <Select value={accountCurrency} onValueChange={setAccountCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {accountCurrencies.map(curr => (
                    <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={calculate} className="w-full gradient-primary text-white">
            {t('calculate')}
          </Button>

          {result !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="result-box"
            >
              <div className="text-center">
                <p className="text-sm text-muted-foreground">{t('pipValueResult')}</p>
                <p className="text-4xl font-bold text-primary">
                  {result.toFixed(2)} <span className="text-lg">{accountCurrency}</span>
                </p>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Margin Calculator
function MarginCalculator({ t, language, exchangeRates }: { t: (key: string) => string; language: string; exchangeRates: Record<string, number> }) {
  const { globalPair, incrementCalculation } = useTradingState();
  const [lotSize, setLotSize] = useState<string>('1');
  const [leverage, setLeverage] = useState<string>('1:100');
  const [currencyPair, setCurrencyPair] = useState<string>('EUR/USD');
  const [result, setResult] = useState<number | null>(null);

  // Sync with global pair
  useEffect(() => {
    setCurrencyPair(globalPair);
  }, [globalPair]);

  const calculate = () => {
    const lots = parseFloat(lotSize) || 1;
    const leverageValue = parseInt(leverage.split(':')[1]) || 100;
    const contractSize = 100000; // Standard lot
    
    const rate = exchangeRates[currencyPair] || 1;
    const margin = (lots * contractSize * rate) / leverageValue;
    
    setResult(margin);
    incrementCalculation('Margin');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-primary" />
            {t('marginCalculator')}
          </CardTitle>
          <CardDescription>{t('marginTitle')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{t('tradeSize')}</Label>
              <Input
                type="number"
                value={lotSize}
                onChange={(e) => setLotSize(e.target.value)}
                placeholder="1"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('leverage')}</Label>
              <Select value={leverage} onValueChange={setLeverage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {leverageOptions.map(lev => (
                    <SelectItem key={lev} value={lev}>{lev}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                {t('currencyPair')}
                {currencyPair === globalPair && (
                  <Badge variant="outline" className="text-xs">{language === 'ar' ? 'متزامن' : 'Synced'}</Badge>
                )}
              </Label>
              <Select value={currencyPair} onValueChange={setCurrencyPair}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencyPairs.map(pair => (
                    <SelectItem key={pair} value={pair}>{pair}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={calculate} className="w-full gradient-primary text-white">
            {t('calculate')}
          </Button>

          {result !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="result-box"
            >
              <div className="text-center">
                <p className="text-sm text-muted-foreground">{t('marginRequired')}</p>
                <p className="text-4xl font-bold text-primary">
                  ${result.toFixed(2)}
                </p>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Profit/Loss Calculator
function ProfitLossCalculator({ t, language }: { t: (key: string) => string; language: string }) {
  const { globalPair, exchangeRates, incrementCalculation } = useTradingState();
  const [entryPrice, setEntryPrice] = useState<string>('');
  const [exitPrice, setExitPrice] = useState<string>('1.0900');
  const [lotSize, setLotSize] = useState<string>('1');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [result, setResult] = useState<{ profit: number; pips: number } | null>(null);

  // Set initial entry price based on global pair price
  const currentPrice = exchangeRates[globalPair];
  const displayEntryPrice = entryPrice || (currentPrice ? currentPrice.toFixed(5) : '1.0850');

  const calculate = () => {
    const entry = parseFloat(displayEntryPrice) || 0;
    const exit = parseFloat(exitPrice) || 0;
    const lots = parseFloat(lotSize) || 1;
    
    const isJPYPair = globalPair.includes('JPY');
    const pipSize = isJPYPair ? 0.01 : 0.0001;
    
    let pips: number;
    let profit: number;
    
    if (tradeType === 'buy') {
      pips = (exit - entry) / pipSize;
      profit = pips * 10 * lots; // $10 per pip per lot
    } else {
      pips = (entry - exit) / pipSize;
      profit = pips * 10 * lots;
    }
    
    setResult({ profit, pips });
    incrementCalculation('Profit/Loss');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            {t('profitLoss')}
          </CardTitle>
          <CardDescription>
            {language === 'ar' 
              ? 'احسب ربح أو خسارة صفقتك المحتملة'
              : 'Calculate your potential profit or loss'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('entryPrice')}</Label>
              <Input
                type="number"
                value={displayEntryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                step="0.00001"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('exitPrice')}</Label>
              <Input
                type="number"
                value={exitPrice}
                onChange={(e) => setExitPrice(e.target.value)}
                step="0.00001"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('tradeSize')}</Label>
              <Input
                type="number"
                value={lotSize}
                onChange={(e) => setLotSize(e.target.value)}
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('currencyPair')}</Label>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="px-3 py-2">{globalPair}</Badge>
                <span className="text-xs text-muted-foreground">{language === 'ar' ? '(متزامن)' : '(synced)'}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              variant={tradeType === 'buy' ? 'default' : 'outline'}
              className={`flex-1 ${tradeType === 'buy' ? 'gradient-primary text-white' : ''}`}
              onClick={() => setTradeType('buy')}
            >
              <TrendingUp className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {t('buyTrade')}
            </Button>
            <Button
              variant={tradeType === 'sell' ? 'destructive' : 'outline'}
              className={`flex-1 ${tradeType === 'sell' ? 'bg-destructive text-white' : ''}`}
              onClick={() => setTradeType('sell')}
            >
              <TrendingDown className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {t('sellTrade')}
            </Button>
          </div>

          <Button onClick={calculate} className="w-full gradient-primary text-white">
            {t('calculate')}
          </Button>

          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`result-box ${result.profit >= 0 ? 'border-success' : 'border-destructive'}`}
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Pips</p>
                  <p className={`text-3xl font-bold ${result.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {result.pips.toFixed(1)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">{result.profit >= 0 ? t('profit') : t('loss')}</p>
                  <p className={`text-3xl font-bold ${result.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                    ${Math.abs(result.profit).toFixed(2)}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Risk/Reward Calculator
function RiskRewardCalculator({ t, language }: { t: (key: string) => string; language: string }) {
  const [entryPrice, setEntryPrice] = useState<string>('1.0850');
  const [stopLoss, setStopLoss] = useState<string>('1.0800');
  const [takeProfit, setTakeProfit] = useState<string>('1.0950');
  const [result, setResult] = useState<{ ratio: number; risk: number; reward: number } | null>(null);

  const calculate = () => {
    const entry = parseFloat(entryPrice) || 0;
    const sl = parseFloat(stopLoss) || 0;
    const tp = parseFloat(takeProfit) || 0;
    
    const risk = Math.abs(entry - sl);
    const reward = Math.abs(tp - entry);
    const ratio = reward / risk;
    
    setResult({ ratio, risk: risk * 10000, reward: reward * 10000 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            {t('riskReward')}
          </CardTitle>
          <CardDescription>
            {language === 'ar'
              ? 'احسب نسبة المخاطرة إلى المكافأة لصفقتك'
              : 'Calculate the risk to reward ratio for your trade'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{t('entryPoint')}</Label>
              <Input
                type="number"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                step="0.00001"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('stopLoss')}</Label>
              <Input
                type="number"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                step="0.00001"
                className="border-destructive/50"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('takeProfit')}</Label>
              <Input
                type="number"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                step="0.00001"
                className="border-success/50"
              />
            </div>
          </div>

          <Button onClick={calculate} className="w-full gradient-primary text-white">
            {t('calculate')}
          </Button>

          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="result-box"
            >
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground">{t('riskRewardRatio')}</p>
                <p className={`text-5xl font-bold ${result.ratio >= 2 ? 'text-success' : result.ratio >= 1 ? 'text-warning' : 'text-destructive'}`}>
                  1:{result.ratio.toFixed(2)}
                </p>
                <Badge className={result.ratio >= 2 ? 'bg-success' : result.ratio >= 1 ? 'bg-warning' : 'bg-destructive'}>
                  {result.ratio >= 2 
                    ? (language === 'ar' ? 'نسبة ممتازة' : 'Excellent Ratio')
                    : result.ratio >= 1 
                    ? (language === 'ar' ? 'نسبة مقبولة' : 'Acceptable Ratio')
                    : (language === 'ar' ? 'نسبة ضعيفة' : 'Poor Ratio')}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-destructive/10">
                  <p className="text-sm text-muted-foreground">{t('riskAmount')}</p>
                  <p className="text-xl font-bold text-destructive">{result.risk.toFixed(1)} pips</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-success/10">
                  <p className="text-sm text-muted-foreground">{t('rewardAmount')}</p>
                  <p className="text-xl font-bold text-success">{result.reward.toFixed(1)} pips</p>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Fibonacci Calculator
function FibonacciCalculator({ t, language }: { t: (key: string) => string; language: string }) {
  const [highPrice, setHighPrice] = useState<string>('1.1000');
  const [lowPrice, setLowPrice] = useState<string>('1.0800');
  const [isUptrend, setIsUptrend] = useState<boolean>(true);
  const [results, setResults] = useState<{ level: number; price: number }[]>([]);

  const fibLevels = [0, 23.6, 38.2, 50, 61.8, 78.6, 100];

  const calculate = () => {
    const high = parseFloat(highPrice) || 0;
    const low = parseFloat(lowPrice) || 0;
    const range = high - low;
    
    const calculated = fibLevels.map(level => {
      const price = isUptrend 
        ? high - (range * level / 100)
        : low + (range * level / 100);
      return { level, price };
    });
    
    setResults(calculated);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="w-6 h-6 text-primary" />
            {t('fibonacci')}
          </CardTitle>
          <CardDescription>
            {language === 'ar'
              ? 'احسب مستويات فيبوناتشي الارتدادية'
              : 'Calculate Fibonacci retracement levels'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('highPrice')}</Label>
              <Input
                type="number"
                value={highPrice}
                onChange={(e) => setHighPrice(e.target.value)}
                step="0.00001"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('lowPrice')}</Label>
              <Input
                type="number"
                value={lowPrice}
                onChange={(e) => setLowPrice(e.target.value)}
                step="0.00001"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              variant={isUptrend ? 'default' : 'outline'}
              className={`flex-1 ${isUptrend ? 'gradient-primary text-white' : ''}`}
              onClick={() => setIsUptrend(true)}
            >
              <TrendingUp className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {language === 'ar' ? 'اتجاه صاعد' : 'Uptrend'}
            </Button>
            <Button
              variant={!isUptrend ? 'destructive' : 'outline'}
              className={`flex-1 ${!isUptrend ? 'bg-destructive text-white' : ''}`}
              onClick={() => setIsUptrend(false)}
            >
              <TrendingDown className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {language === 'ar' ? 'اتجاه هابط' : 'Downtrend'}
            </Button>
          </div>

          <Button onClick={calculate} className="w-full gradient-primary text-white">
            {t('calculate')}
          </Button>

          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-2"
            >
              <h4 className="font-semibold text-center mb-4">{t('fibonacciLevels')}</h4>
              <div className="grid gap-2">
                {results.map((item, index) => (
                  <div
                    key={index}
                    className={`flex justify-between items-center p-3 rounded-lg ${
                      item.level === 61.8 ? 'bg-primary/20 border border-primary' : 'bg-muted'
                    }`}
                  >
                    <span className="font-medium">Fib {item.level}%</span>
                    <span className={`font-bold ${item.level === 61.8 ? 'text-primary' : ''}`}>
                      {item.price.toFixed(5)}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Pivot Points Calculator
function PivotPointsCalculator({ t, language }: { t: (key: string) => string; language: string }) {
  const [highPrice, setHighPrice] = useState<string>('1.1000');
  const [lowPrice, setLowPrice] = useState<string>('1.0800');
  const [closePrice, setClosePrice] = useState<string>('1.0900');
  const [pivotType, setPivotType] = useState<string>('standard');
  const [results, setResults] = useState<{ label: string; value: number }[]>([]);

  const calculate = () => {
    const high = parseFloat(highPrice) || 0;
    const low = parseFloat(lowPrice) || 0;
    const close = parseFloat(closePrice) || 0;

    const pivot = (high + low + close) / 3;
    const r1 = 2 * pivot - low;
    const s1 = 2 * pivot - high;
    const r2 = pivot + (high - low);
    const s2 = pivot - (high - low);
    const r3 = high + 2 * (pivot - low);
    const s3 = low - 2 * (high - pivot);

    setResults([
      { label: 'R3', value: r3 },
      { label: 'R2', value: r2 },
      { label: 'R1', value: r1 },
      { label: 'Pivot', value: pivot },
      { label: 'S1', value: s1 },
      { label: 'S2', value: s2 },
      { label: 'S3', value: s3 },
    ]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            {t('pivotPoints')}
          </CardTitle>
          <CardDescription>
            {language === 'ar'
              ? 'احسب النقاط المحورية ومستويات الدعم والمقاومة'
              : 'Calculate pivot points and support/resistance levels'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{t('highPrice')}</Label>
              <Input
                type="number"
                value={highPrice}
                onChange={(e) => setHighPrice(e.target.value)}
                step="0.00001"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('lowPrice')}</Label>
              <Input
                type="number"
                value={lowPrice}
                onChange={(e) => setLowPrice(e.target.value)}
                step="0.00001"
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'سعر الإغلاق' : 'Close Price'}</Label>
              <Input
                type="number"
                value={closePrice}
                onChange={(e) => setClosePrice(e.target.value)}
                step="0.00001"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('pivotPointType')}</Label>
            <Select value={pivotType} onValueChange={setPivotType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">{t('standardPivot')}</SelectItem>
                <SelectItem value="fibonacci">{t('fibonacciPivot')}</SelectItem>
                <SelectItem value="camarilla">{t('camarillaPivot')}</SelectItem>
                <SelectItem value="woodie">{t('woodiePivot')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={calculate} className="w-full gradient-primary text-white">
            {t('calculate')}
          </Button>

          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-2"
            >
              {results.map((item, index) => (
                <div
                  key={index}
                  className={`flex justify-between items-center p-3 rounded-lg ${
                    item.label === 'Pivot' 
                      ? 'bg-primary/20 border border-primary' 
                      : item.label.startsWith('R') 
                        ? 'bg-destructive/10' 
                        : 'bg-success/10'
                  }`}
                >
                  <span className="font-medium">{item.label}</span>
                  <span className="font-bold">{item.value.toFixed(5)}</span>
                </div>
              ))}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Swap Calculator
function SwapCalculator({ t, language }: { t: (key: string) => string; language: string }) {
  const [lotSize, setLotSize] = useState<string>('1');
  const [swapLong, setSwapLong] = useState<string>('-5.50');
  const [swapShort, setSwapShort] = useState<string>('-2.30');
  const [holdingDays, setHoldingDays] = useState<string>('1');
  const [result, setResult] = useState<{ longSwap: number; shortSwap: number } | null>(null);

  const calculate = () => {
    const lots = parseFloat(lotSize) || 1;
    const longRate = parseFloat(swapLong) || 0;
    const shortRate = parseFloat(swapShort) || 0;
    const days = parseFloat(holdingDays) || 1;

    setResult({
      longSwap: longRate * lots * days,
      shortSwap: shortRate * lots * days,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-6 h-6 text-primary" />
            {t('swapCalculator')}
          </CardTitle>
          <CardDescription>
            {language === 'ar'
              ? 'احسب تكلفة أو ربح السواب (التمويل الليلي)'
              : 'Calculate swap (overnight) costs or earnings'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('tradeSize')}</Label>
              <Input
                type="number"
                value={lotSize}
                onChange={(e) => setLotSize(e.target.value)}
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('holdingDays')}</Label>
              <Input
                type="number"
                value={holdingDays}
                onChange={(e) => setHoldingDays(e.target.value)}
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('swapLong')} (points)</Label>
              <Input
                type="number"
                value={swapLong}
                onChange={(e) => setSwapLong(e.target.value)}
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('swapShort')} (points)</Label>
              <Input
                type="number"
                value={swapShort}
                onChange={(e) => setSwapShort(e.target.value)}
                step="0.01"
              />
            </div>
          </div>

          <Button onClick={calculate} className="w-full gradient-primary text-white">
            {t('calculate')}
          </Button>

          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="result-box"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">{t('swapLong')}</p>
                  <p className={`text-2xl font-bold ${result.longSwap >= 0 ? 'text-success' : 'text-destructive'}`}>
                    ${result.longSwap.toFixed(2)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">{t('swapShort')}</p>
                  <p className={`text-2xl font-bold ${result.shortSwap >= 0 ? 'text-success' : 'text-destructive'}`}>
                    ${result.shortSwap.toFixed(2)}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Currency Converter
function CurrencyConverter({ t, language }: { t: (key: string) => string; language: string }) {
  const [amount, setAmount] = useState<string>('1000');
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('EUR');
  const [result, setResult] = useState<number | null>(null);

  const rates: Record<string, number> = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 149.50,
    CHF: 0.88,
    AUD: 1.53,
    CAD: 1.36,
    NZD: 1.63,
  };

  const calculate = () => {
    const amt = parseFloat(amount) || 0;
    const fromRate = rates[fromCurrency] || 1;
    const toRate = rates[toCurrency] || 1;
    
    const converted = (amt / fromRate) * toRate;
    setResult(converted);
  };

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
    if (result !== null) {
      setAmount(result.toFixed(2));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-primary" />
            {language === 'ar' ? 'محول العملات' : 'Currency Converter'}
          </CardTitle>
          <CardDescription>
            {language === 'ar'
              ? 'حوّل بين العملات المختلفة بأسعار السوق الحالية'
              : 'Convert between different currencies at current market rates'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'المبلغ' : 'Amount'}</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'من' : 'From'}</Label>
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {accountCurrencies.map(curr => (
                    <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'إلى' : 'To'}</Label>
              <Select value={toCurrency} onValueChange={setToCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {accountCurrencies.map(curr => (
                    <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={calculate} className="flex-1 gradient-primary text-white">
              {language === 'ar' ? 'تحويل' : 'Convert'}
            </Button>
            <Button variant="outline" onClick={swapCurrencies}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          {result !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="result-box"
            >
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">
                  {result.toFixed(2)} <span className="text-xl">{toCurrency}</span>
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  1 {fromCurrency} = {(rates[toCurrency] / rates[fromCurrency]).toFixed(4)} {toCurrency}
                </p>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Compound Interest Calculator
function CompoundInterestCalculator({ t, language }: { t: (key: string) => string; language: string }) {
  const [principal, setPrincipal] = useState<string>('10000');
  const [monthlyContribution, setMonthlyContribution] = useState<string>('500');
  const [annualRate, setAnnualRate] = useState<string>('12');
  const [years, setYears] = useState<string>('5');
  const [compoundFrequency, setCompoundFrequency] = useState<string>('12');
  const [result, setResult] = useState<{
    futureValue: number;
    totalContributions: number;
    totalInterest: number;
  } | null>(null);

  const calculate = () => {
    const P = parseFloat(principal) || 0;
    const PMT = parseFloat(monthlyContribution) || 0;
    const r = (parseFloat(annualRate) || 0) / 100;
    const n = parseInt(compoundFrequency) || 12;
    const t = parseFloat(years) || 1;

    // Future value of principal with compound interest
    const futureValuePrincipal = P * Math.pow(1 + r / n, n * t);

    // Future value of monthly contributions (annuity)
    const futureValueContributions = PMT * ((Math.pow(1 + r / n, n * t) - 1) / (r / n));

    const futureValue = futureValuePrincipal + futureValueContributions;
    const totalContributions = P + (PMT * 12 * t);
    const totalInterest = futureValue - totalContributions;

    setResult({
      futureValue,
      totalContributions,
      totalInterest,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="w-6 h-6 text-primary" />
            {language === 'ar' ? 'حاسبة الفائدة المركبة' : 'Compound Interest Calculator'}
          </CardTitle>
          <CardDescription>
            {language === 'ar'
              ? 'احسب نمو استثمارك مع الفائدة المركبة'
              : 'Calculate your investment growth with compound interest'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'رأس المال الأولي' : 'Initial Principal'}</Label>
              <Input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                placeholder="10000"
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'المساهمة الشهرية' : 'Monthly Contribution'}</Label>
              <Input
                type="number"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(e.target.value)}
                placeholder="500"
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'نسبة الفائدة السنوية (%)' : 'Annual Interest Rate (%)'}</Label>
              <Input
                type="number"
                value={annualRate}
                onChange={(e) => setAnnualRate(e.target.value)}
                placeholder="12"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'عدد السنوات' : 'Number of Years'}</Label>
              <Input
                type="number"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                placeholder="5"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{language === 'ar' ? 'تكرار الفائدة' : 'Compound Frequency'}</Label>
              <Select value={compoundFrequency} onValueChange={setCompoundFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">{language === 'ar' ? 'سنوياً' : 'Annually'}</SelectItem>
                  <SelectItem value="2">{language === 'ar' ? 'نصف سنوي' : 'Semi-Annually'}</SelectItem>
                  <SelectItem value="4">{language === 'ar' ? 'ربع سنوي' : 'Quarterly'}</SelectItem>
                  <SelectItem value="12">{language === 'ar' ? 'شهرياً' : 'Monthly'}</SelectItem>
                  <SelectItem value="365">{language === 'ar' ? 'يومياً' : 'Daily'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={calculate} className="w-full gradient-primary text-white">
            {t('calculate')}
          </Button>

          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="result-box"
            >
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground">{language === 'ar' ? 'القيمة المستقبلية' : 'Future Value'}</p>
                <p className="text-4xl font-bold text-primary">
                  ${result.futureValue.toFixed(2)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground">{language === 'ar' ? 'إجمالي المساهمات' : 'Total Contributions'}</p>
                  <p className="text-xl font-bold">${result.totalContributions.toFixed(2)}</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-success/10">
                  <p className="text-xs text-muted-foreground">{language === 'ar' ? 'إجمالي الفائدة' : 'Total Interest'}</p>
                  <p className="text-xl font-bold text-success">${result.totalInterest.toFixed(2)}</p>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// AI Analysis Section
function AIAnalysisSection({ t, language, exchangeRates }: { t: (key: string) => string; language: string; exchangeRates: Record<string, number> }) {
  const { globalPair, setGlobalPair } = useTradingState();
  const [selectedPair, setSelectedPair] = useState<string>('EUR/USD');
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<{
    sentiment: 'bullish' | 'bearish' | 'neutral';
    confidence: number;
    entryPrice: number;
    stopLoss: number;
    takeProfit: number;
    riskLevel: 'low' | 'medium' | 'high';
    recommendation: string;
    technicalAnalysis?: string;
    keyLevels?: {
      support1: number;
      support2: number;
      resistance1: number;
      resistance2: number;
    };
    indicators?: {
      rsi: string;
      macd: string;
      trend: string;
    };
    marketContext?: string;
  } | null>(null);

  // Sync with global pair
  useEffect(() => {
    setSelectedPair(globalPair);
  }, [globalPair]);

  // Update global pair when user changes selection here
  const handlePairChange = (pair: string) => {
    setSelectedPair(pair);
    setGlobalPair(pair);
  };

  const analyzeMarket = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pair: selectedPair, language }),
      });
      
      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      // Fallback to mock data
      const currentPrice = exchangeRates[selectedPair] || 1.0850;
      const sentiment = Math.random() > 0.5 ? 'bullish' : Math.random() > 0.5 ? 'bearish' : 'neutral';
      const pipSize = selectedPair.includes('JPY') ? 0.01 : 0.0001;
      
      setAnalysis({
        sentiment,
        confidence: Math.floor(Math.random() * 25) + 70,
        entryPrice: currentPrice,
        stopLoss: sentiment === 'bullish' 
          ? Number((currentPrice - 40 * pipSize).toFixed(5))
          : Number((currentPrice + 40 * pipSize).toFixed(5)),
        takeProfit: sentiment === 'bullish' 
          ? Number((currentPrice + 80 * pipSize).toFixed(5))
          : Number((currentPrice - 80 * pipSize).toFixed(5)),
        riskLevel: Math.random() > 0.6 ? 'low' : Math.random() > 0.4 ? 'medium' : 'high',
        recommendation: language === 'ar'
          ? `تحليل ${selectedPair}: ${sentiment === 'bullish' ? 'فرص شراء محتملة' : sentiment === 'bearish' ? 'فرص بيع محتملة' : 'الانتظار أفضل'}`
          : `${selectedPair} Analysis: ${sentiment === 'bullish' ? 'Potential buying opportunity' : sentiment === 'bearish' ? 'Potential selling opportunity' : 'Better to wait'}`,
        technicalAnalysis: language === 'ar'
          ? `يظهر ${selectedPair} اتجاه ${sentiment === 'bullish' ? 'صعودي' : sentiment === 'bearish' ? 'هبوطي' : 'عرضي'} مع زخم ${sentiment === 'bullish' ? 'إيجابي' : sentiment === 'bearish' ? 'سلبي' : 'محايد'}.`
          : `${selectedPair} shows a ${sentiment} trend with ${sentiment === 'bullish' ? 'positive' : sentiment === 'bearish' ? 'negative' : 'neutral'} momentum.`,
        keyLevels: {
          support1: Number((currentPrice - 20 * pipSize).toFixed(5)),
          support2: Number((currentPrice - 40 * pipSize).toFixed(5)),
          resistance1: Number((currentPrice + 20 * pipSize).toFixed(5)),
          resistance2: Number((currentPrice + 40 * pipSize).toFixed(5)),
        },
        indicators: {
          rsi: sentiment === 'bullish' ? '58 (Neutral-Bullish)' : sentiment === 'bearish' ? '42 (Neutral-Bearish)' : '50 (Neutral)',
          macd: sentiment === 'bullish' ? 'Bullish signal' : sentiment === 'bearish' ? 'Bearish signal' : 'Consolidating',
          trend: sentiment === 'bullish' ? 'Uptrend' : sentiment === 'bearish' ? 'Downtrend' : 'Sideways',
        },
        marketContext: language === 'ar'
          ? 'السوق يشهد تقلبات معتدلة مع انتظار بيانات اقتصادية مهمة.'
          : 'Market experiencing moderate volatility awaiting important economic data.',
      });
    }
    
    setIsLoading(false);
  };

  return (
    <section id="ai-analysis" className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 px-4 py-2 border-primary/30 text-primary">
            <Zap className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {language === 'ar' ? 'مدعوم بالذكاء الاصطناعي' : 'AI-Powered'}
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {t('aiMarketAnalysis')}
          </h2>
          <p className="text-muted-foreground text-lg">
            {language === 'ar'
              ? 'احصل على تحليل ذكي للسوق مع توصيات الدخول والخروج'
              : 'Get intelligent market analysis with entry and exit recommendations'}
          </p>
        </div>

        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle>{t('selectInstrument')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={selectedPair} onValueChange={handlePairChange}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencyPairs.filter(p => !p.includes('BTC') && !p.includes('ETH') && !p.includes('XAG')).map(pair => (
                    <SelectItem key={pair} value={pair}>{pair}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={analyzeMarket} 
                disabled={isLoading}
                className="gradient-primary text-white px-8"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0 animate-spin" />
                    {t('loading')}
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                    {t('analyzeMarket')}
                  </>
                )}
              </Button>
            </div>

            {analysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Sentiment Card */}
                <div className={`p-6 rounded-xl ${
                  analysis.sentiment === 'bullish' 
                    ? 'bg-success/10 border border-success/30' 
                    : analysis.sentiment === 'bearish'
                      ? 'bg-destructive/10 border border-destructive/30'
                      : 'bg-warning/10 border border-warning/30'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {analysis.sentiment === 'bullish' ? (
                        <TrendingUp className="w-8 h-8 text-success" />
                      ) : analysis.sentiment === 'bearish' ? (
                        <TrendingDown className="w-8 h-8 text-destructive" />
                      ) : (
                        <Activity className="w-8 h-8 text-warning" />
                      )}
                      <div>
                        <p className="text-sm text-muted-foreground">{t('marketSentiment')}</p>
                        <p className={`text-xl font-bold ${
                          analysis.sentiment === 'bullish' 
                            ? 'text-success' 
                            : analysis.sentiment === 'bearish' 
                              ? 'text-destructive' 
                              : 'text-warning'
                        }`}>
                          {t(analysis.sentiment)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right rtl:text-left">
                      <p className="text-sm text-muted-foreground">{t('confidence')}</p>
                      <p className="text-xl font-bold">{analysis.confidence}%</p>
                    </div>
                  </div>
                  <Progress value={analysis.confidence} className="h-2" />
                </div>

                {/* Trading Levels */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card className="bg-success/5 border-success/30">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">{t('entryRecommendation')}</p>
                      <p className="text-2xl font-bold text-success">{analysis.entryPrice?.toFixed(5) || '-'}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-destructive/5 border-destructive/30">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">{t('stopLossRecommendation')}</p>
                      <p className="text-2xl font-bold text-destructive">{analysis.stopLoss?.toFixed(5) || '-'}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-primary/5 border-primary/30">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">{t('targetPrice')}</p>
                      <p className="text-2xl font-bold text-primary">{analysis.takeProfit?.toFixed(5) || '-'}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Risk Level */}
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield className={`w-5 h-5 ${
                      analysis.riskLevel === 'low' 
                        ? 'text-success' 
                        : analysis.riskLevel === 'medium' 
                          ? 'text-warning' 
                          : 'text-destructive'
                    }`} />
                    <span className="font-medium">{t('riskLevel')}</span>
                  </div>
                  <Badge className={
                    analysis.riskLevel === 'low' 
                      ? 'bg-success' 
                      : analysis.riskLevel === 'medium' 
                        ? 'bg-warning' 
                        : 'bg-destructive'
                  }>
                    {t(analysis.riskLevel)}
                  </Badge>
                </div>

                {/* Technical Analysis */}
                {analysis.technicalAnalysis && (
                  <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <LineChart className="w-5 h-5 text-primary" />
                        {language === 'ar' ? 'التحليل الفني' : 'Technical Analysis'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{analysis.technicalAnalysis}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Key Levels */}
                {analysis.keyLevels && (
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      {language === 'ar' ? 'المستويات الرئيسية' : 'Key Levels'}
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                        <p className="text-xs text-muted-foreground">{language === 'ar' ? 'الدعم 1' : 'Support 1'}</p>
                        <p className="font-bold text-success">{analysis.keyLevels.support1?.toFixed(5) || '-'}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                        <p className="text-xs text-muted-foreground">{language === 'ar' ? 'الدعم 2' : 'Support 2'}</p>
                        <p className="font-bold text-success">{analysis.keyLevels.support2?.toFixed(5) || '-'}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                        <p className="text-xs text-muted-foreground">{language === 'ar' ? 'المقاومة 1' : 'Resistance 1'}</p>
                        <p className="font-bold text-destructive">{analysis.keyLevels.resistance1?.toFixed(5) || '-'}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                        <p className="text-xs text-muted-foreground">{language === 'ar' ? 'المقاومة 2' : 'Resistance 2'}</p>
                        <p className="font-bold text-destructive">{analysis.keyLevels.resistance2?.toFixed(5) || '-'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Indicators */}
                {analysis.indicators && (
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      {language === 'ar' ? 'المؤشرات الفنية' : 'Technical Indicators'}
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-lg bg-muted text-center">
                        <p className="text-xs text-muted-foreground mb-1">RSI</p>
                        <p className="text-sm font-semibold">{analysis.indicators.rsi}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted text-center">
                        <p className="text-xs text-muted-foreground mb-1">MACD</p>
                        <p className="text-sm font-semibold">{analysis.indicators.macd}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted text-center">
                        <p className="text-xs text-muted-foreground mb-1">{language === 'ar' ? 'الترند' : 'Trend'}</p>
                        <p className="text-sm font-semibold">{analysis.indicators.trend}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Market Context */}
                {analysis.marketContext && (
                  <div className="p-4 bg-muted/50 rounded-lg border">
                    <p className="text-xs text-muted-foreground mb-1">{language === 'ar' ? 'السياق السوقي' : 'Market Context'}</p>
                    <p className="text-sm">{analysis.marketContext}</p>
                  </div>
                )}

                {/* Recommendation */}
                <div className="p-4 bg-card border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    {language === 'ar' ? 'التوصية' : 'Recommendation'}
                  </p>
                  <p className="font-medium">{analysis.recommendation}</p>
                </div>

                {/* Risk/Reward Calculator Link */}
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    {language === 'ar' ? 'احسب نسبة المخاطرة للمكافأة' : 'Calculate Risk/Reward Ratio'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {language === 'ar' 
                      ? `الدخول: ${analysis.entryPrice?.toFixed(5) || '-'} | الوقف: ${analysis.stopLoss?.toFixed(5) || '-'} | الهدف: ${analysis.takeProfit?.toFixed(5) || '-'}`
                      : `Entry: ${analysis.entryPrice?.toFixed(5) || '-'} | SL: ${analysis.stopLoss?.toFixed(5) || '-'} | TP: ${analysis.takeProfit?.toFixed(5) || '-'}`}
                  </p>
                  <div className="mt-2 flex justify-center gap-2">
                    <Badge variant="outline" className="border-success text-success">
                      {language === 'ar' ? 'مخاطرة: ' : 'Risk: '}{analysis.entryPrice && analysis.stopLoss ? Math.abs(analysis.entryPrice - analysis.stopLoss).toFixed(5) : '-'}
                    </Badge>
                    <Badge variant="outline" className="border-primary text-primary">
                      {language === 'ar' ? 'مكافأة: ' : 'Reward: '}{analysis.takeProfit && analysis.entryPrice ? Math.abs(analysis.takeProfit - analysis.entryPrice).toFixed(5) : '-'}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

// Features Section
function FeaturesSection({ t, language }: { t: (key: string) => string; language: string }) {
  const features = [
    {
      icon: Calculator,
      title: language === 'ar' ? '9+ حاسبات متخصصة' : '9+ Specialized Calculators',
      description: language === 'ar' 
        ? 'مجموعة شاملة من الحاسبات لجميع احتياجات التداول'
        : 'A comprehensive suite of calculators for all trading needs',
    },
    {
      icon: Zap,
      title: language === 'ar' ? 'تحليل AI ذكي' : 'Smart AI Analysis',
      description: language === 'ar' 
        ? 'تحليل السوق بالذكاء الاصطناعي مع توصيات محدثة'
        : 'AI-powered market analysis with updated recommendations',
    },
    {
      icon: Globe,
      title: language === 'ar' ? 'دعم متعدد اللغات' : 'Multi-Language Support',
      description: language === 'ar' 
        ? 'واجهة بالعربية والإنجليزية مع دعم RTL كامل'
        : 'Interface in Arabic and English with full RTL support',
    },
    {
      icon: Shield,
      title: language === 'ar' ? 'حسابات دقيقة' : 'Accurate Calculations',
      description: language === 'ar' 
        ? 'معادلات رياضية دقيقة لجميع العمليات الحسابية'
        : 'Precise mathematical formulas for all calculations',
    },
    {
      icon: Award,
      title: language === 'ar' ? 'تصميم احترافي' : 'Professional Design',
      description: language === 'ar' 
        ? 'واجهة عصرية وسهلة الاستخدام على جميع الأجهزة'
        : 'Modern and user-friendly interface on all devices',
    },
    {
      icon: Activity,
      title: language === 'ar' ? 'تحديثات حية' : 'Live Updates',
      description: language === 'ar' 
        ? 'أسعار الصرف والتحديثات في الوقت الحقيقي'
        : 'Real-time exchange rates and updates',
    },
  ];

  return (
    <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {language === 'ar' ? 'لماذا تختار تطبيقنا؟' : 'Why Choose Our App?'}
          </h2>
          <p className="text-muted-foreground text-lg">
            {language === 'ar'
              ? 'أدوات احترافية مصممة خصيصاً للمتداولين'
              : 'Professional tools designed specifically for traders'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full card-hover">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Footer Component
function Footer({ t, language }: { t: (key: string) => string; language: string }) {
  return (
    <footer className="bg-card border-t py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-primary">{t('appName')}</p>
              <p className="text-xs text-muted-foreground">{t('tagline')}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">{t('termsOfService')}</a>
            <a href="#" className="hover:text-primary transition-colors">{t('privacyPolicy')}</a>
            <a href="#" className="hover:text-primary transition-colors">{t('contactUs')}</a>
          </div>

          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {t('appName')}. {t('allRightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  );
}

// ============== NEW CALCULATORS ==============

// Risk Percentage Calculator
function RiskPercentageCalculator({ t, language }: { t: (key: string) => string; language: string }) {
  const [balance, setBalance] = useState('10000');
  const [riskAmount, setRiskAmount] = useState('200');
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const bal = parseFloat(balance) || 0;
    const risk = parseFloat(riskAmount) || 0;
    setResult((risk / bal) * 100);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">{language === 'ar' ? 'رصيد الحساب' : 'Account Balance'}</Label>
          <Input type="number" value={balance} onChange={(e) => setBalance(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">{language === 'ar' ? 'مبلغ المخاطرة' : 'Risk Amount'}</Label>
          <Input type="number" value={riskAmount} onChange={(e) => setRiskAmount(e.target.value)} />
        </div>
      </div>
      <Button onClick={calculate} className="w-full gradient-primary text-white text-sm py-1">{t('calculate')}</Button>
      {result !== null && <p className="text-center font-bold text-primary">{result.toFixed(2)}%</p>}
    </div>
  );
}

// Drawdown Calculator
function DrawdownCalculator({ t, language }: { t: (key: string) => string; language: string }) {
  const [peakBalance, setPeakBalance] = useState('10000');
  const [currentBalance, setCurrentBalance] = useState('8500');
  const [result, setResult] = useState<{ drawdown: number; amount: number } | null>(null);

  const calculate = () => {
    const peak = parseFloat(peakBalance) || 0;
    const current = parseFloat(currentBalance) || 0;
    const amount = peak - current;
    setResult({ drawdown: (amount / peak) * 100, amount });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">{language === 'ar' ? 'أعلى رصيد' : 'Peak Balance'}</Label>
          <Input type="number" value={peakBalance} onChange={(e) => setPeakBalance(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">{language === 'ar' ? 'الرصيد الحالي' : 'Current Balance'}</Label>
          <Input type="number" value={currentBalance} onChange={(e) => setCurrentBalance(e.target.value)} />
        </div>
      </div>
      <Button onClick={calculate} className="w-full gradient-primary text-white text-sm py-1">{t('calculate')}</Button>
      {result && (
        <div className="text-center">
          <p className="text-destructive font-bold">{result.drawdown.toFixed(2)}%</p>
          <p className="text-xs text-muted-foreground">-${result.amount.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
}

// Break Even Calculator
function BreakEvenCalculator({ t, language }: { t: (key: string) => string; language: string }) {
  const [entryPrice, setEntryPrice] = useState('1.0850');
  const [spread, setSpread] = useState('2');
  const [commission, setCommission] = useState('7');
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const entry = parseFloat(entryPrice) || 0;
    const sp = parseFloat(spread) || 0;
    const comm = parseFloat(commission) || 0;
    // Simplified calculation
    setResult(entry + (sp * 0.0001) + (comm * 0.00001));
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label className="text-xs">{language === 'ar' ? 'سعر الدخول' : 'Entry'}</Label>
          <Input type="number" value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} step="0.00001" />
        </div>
        <div>
          <Label className="text-xs">{language === 'ar' ? 'السبريد' : 'Spread'}</Label>
          <Input type="number" value={spread} onChange={(e) => setSpread(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">{language === 'ar' ? 'العمولة' : 'Commission'}</Label>
          <Input type="number" value={commission} onChange={(e) => setCommission(e.target.value)} />
        </div>
      </div>
      <Button onClick={calculate} className="w-full gradient-primary text-white text-sm py-1">{t('calculate')}</Button>
      {result !== null && <p className="text-center font-bold text-primary">{result.toFixed(5)}</p>}
    </div>
  );
}

// Margin Level Calculator
function MarginLevelCalculator({ t, language }: { t: (key: string) => string; language: string }) {
  const [equity, setEquity] = useState('10500');
  const [usedMargin, setUsedMargin] = useState('1000');
  const [result, setResult] = useState<{ level: number; freeMargin: number } | null>(null);

  const calculate = () => {
    const eq = parseFloat(equity) || 0;
    const margin = parseFloat(usedMargin) || 1;
    setResult({ level: (eq / margin) * 100, freeMargin: eq - margin });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">{language === 'ar' ? 'حقوق الملكية' : 'Equity'}</Label>
          <Input type="number" value={equity} onChange={(e) => setEquity(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">{language === 'ar' ? 'الهامش المستخدم' : 'Used Margin'}</Label>
          <Input type="number" value={usedMargin} onChange={(e) => setUsedMargin(e.target.value)} />
        </div>
      </div>
      <Button onClick={calculate} className="w-full gradient-primary text-white text-sm py-1">{t('calculate')}</Button>
      {result && (
        <div className="text-center">
          <p className="font-bold text-primary">{result.level.toFixed(2)}%</p>
          <p className="text-xs text-muted-foreground">{language === 'ar' ? 'هامش حر' : 'Free Margin'}: ${result.freeMargin.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
}

// Leverage Calculator
function LeverageCalculator({ t, language }: { t: (key: string) => string; language: string }) {
  const [positionSize, setPositionSize] = useState('100000');
  const [margin, setMargin] = useState('1000');
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const size = parseFloat(positionSize) || 1;
    const mg = parseFloat(margin) || 1;
    setResult(size / mg);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">{language === 'ar' ? 'حجم الصفقة' : 'Position Size'}</Label>
          <Input type="number" value={positionSize} onChange={(e) => setPositionSize(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">{language === 'ar' ? 'الهامش' : 'Margin'}</Label>
          <Input type="number" value={margin} onChange={(e) => setMargin(e.target.value)} />
        </div>
      </div>
      <Button onClick={calculate} className="w-full gradient-primary text-white text-sm py-1">{t('calculate')}</Button>
      {result !== null && <p className="text-center font-bold text-primary">1:{result.toFixed(0)}</p>}
    </div>
  );
}

// Lot Size Calculator
function LotSizeCalculator({ t, language }: { t: (key: string) => string; language: string }) {
  const [units, setUnits] = useState('100000');
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const u = parseFloat(units) || 0;
    setResult(u / 100000);
  };

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">{language === 'ar' ? 'عدد الوحدات' : 'Units'}</Label>
        <Input type="number" value={units} onChange={(e) => setUnits(e.target.value)} />
      </div>
      <Button onClick={calculate} className="w-full gradient-primary text-white text-sm py-1">{t('calculate')}</Button>
      {result !== null && (
        <div className="text-center">
          <p className="font-bold text-primary">{result.toFixed(2)} {language === 'ar' ? 'لوت' : 'Lots'}</p>
        </div>
      )}
    </div>
  );
}

// Moving Average Calculator
function MovingAverageCalculator({ t, language }: { t: (key: string) => string; language: string }) {
  const [prices, setPrices] = useState('1.0850,1.0860,1.0855,1.0870,1.0865');
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const priceArray = prices.split(',').map(p => parseFloat(p.trim())).filter(p => !isNaN(p));
    if (priceArray.length > 0) {
      const sum = priceArray.reduce((a, b) => a + b, 0);
      setResult(sum / priceArray.length);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">{language === 'ar' ? 'الأسعار (مفصولة بفاصلة)' : 'Prices (comma separated)'}</Label>
        <Input value={prices} onChange={(e) => setPrices(e.target.value)} />
      </div>
      <Button onClick={calculate} className="w-full gradient-primary text-white text-sm py-1">{t('calculate')}</Button>
      {result !== null && <p className="text-center font-bold text-primary">{result.toFixed(5)}</p>}
    </div>
  );
}

// Correlation Calculator
function CorrelationCalculator({ t, language }: { t: (key: string) => string; language: string }) {
  const [pair1Change, setPair1Change] = useState('1.5');
  const [pair2Change, setPair2Change] = useState('1.2');
  const [result, setResult] = useState<{ correlation: string; strength: string } | null>(null);

  const calculate = () => {
    const p1 = parseFloat(pair1Change) || 0;
    const p2 = parseFloat(pair2Change) || 0;
    const corr = p1 > 0 && p2 > 0 ? 'Positive' : p1 < 0 && p2 < 0 ? 'Positive' : 'Negative';
    const strength = Math.abs(p1 - p2) < 0.5 ? 'Strong' : Math.abs(p1 - p2) < 1 ? 'Moderate' : 'Weak';
    setResult({ correlation: corr, strength });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">{language === 'ar' ? 'تغير الزوج 1 %' : 'Pair 1 Change %'}</Label>
          <Input type="number" value={pair1Change} onChange={(e) => setPair1Change(e.target.value)} step="0.1" />
        </div>
        <div>
          <Label className="text-xs">{language === 'ar' ? 'تغير الزوج 2 %' : 'Pair 2 Change %'}</Label>
          <Input type="number" value={pair2Change} onChange={(e) => setPair2Change(e.target.value)} step="0.1" />
        </div>
      </div>
      <Button onClick={calculate} className="w-full gradient-primary text-white text-sm py-1">{t('calculate')}</Button>
      {result && (
        <div className="text-center">
          <p className="font-bold text-primary">{result.correlation}</p>
          <p className="text-xs text-muted-foreground">{result.strength}</p>
        </div>
      )}
    </div>
  );
}

// Standard Deviation Calculator
function StandardDeviationCalculator({ t, language }: { t: (key: string) => string; language: string }) {
  const [prices, setPrices] = useState('1.0850,1.0860,1.0855,1.0870,1.0865,1.0880,1.0875');
  const [result, setResult] = useState<{ std: number; mean: number } | null>(null);

  const calculate = () => {
    const priceArray = prices.split(',').map(p => parseFloat(p.trim())).filter(p => !isNaN(p));
    if (priceArray.length > 1) {
      const mean = priceArray.reduce((a, b) => a + b, 0) / priceArray.length;
      const squaredDiffs = priceArray.map(p => Math.pow(p - mean, 2));
      const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / priceArray.length;
      setResult({ std: Math.sqrt(avgSquaredDiff), mean });
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">{language === 'ar' ? 'الأسعار' : 'Prices'}</Label>
        <Input value={prices} onChange={(e) => setPrices(e.target.value)} />
      </div>
      <Button onClick={calculate} className="w-full gradient-primary text-white text-sm py-1">{t('calculate')}</Button>
      {result && (
        <div className="text-center">
          <p className="font-bold text-primary">σ = {result.std.toFixed(6)}</p>
          <p className="text-xs text-muted-foreground">Mean: {result.mean.toFixed(5)}</p>
        </div>
      )}
    </div>
  );
}

// Momentum Calculator
function MomentumCalculator({ t, language }: { t: (key: string) => string; language: string }) {
  const [currentPrice, setCurrentPrice] = useState('1.0870');
  const [previousPrice, setPreviousPrice] = useState('1.0850');
  const [periods, setPeriods] = useState('10');
  const [result, setResult] = useState<{ momentum: number; percent: number } | null>(null);

  const calculate = () => {
    const current = parseFloat(currentPrice) || 0;
    const previous = parseFloat(previousPrice) || 1;
    const p = parseFloat(periods) || 10;
    setResult({ 
      momentum: current - previous, 
      percent: ((current - previous) / previous) * 100 
    });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label className="text-xs">{language === 'ar' ? 'السعر الحالي' : 'Current'}</Label>
          <Input type="number" value={currentPrice} onChange={(e) => setCurrentPrice(e.target.value)} step="0.00001" />
        </div>
        <div>
          <Label className="text-xs">{language === 'ar' ? 'السعر السابق' : 'Previous'}</Label>
          <Input type="number" value={previousPrice} onChange={(e) => setPreviousPrice(e.target.value)} step="0.00001" />
        </div>
        <div>
          <Label className="text-xs">{language === 'ar' ? 'الفترات' : 'Periods'}</Label>
          <Input type="number" value={periods} onChange={(e) => setPeriods(e.target.value)} />
        </div>
      </div>
      <Button onClick={calculate} className="w-full gradient-primary text-white text-sm py-1">{t('calculate')}</Button>
      {result && (
        <div className="text-center">
          <p className={`font-bold ${result.momentum >= 0 ? 'text-success' : 'text-destructive'}`}>
            {result.momentum >= 0 ? '+' : ''}{result.percent.toFixed(2)}%
          </p>
        </div>
      )}
    </div>
  );
}

// Kelly Criterion Calculator
function KellyCriterionCalculator({ t, language }: { t: (key: string) => string; language: string }) {
  const [winRate, setWinRate] = useState('55');
  const [avgWin, setAvgWin] = useState('100');
  const [avgLoss, setAvgLoss] = useState('80');
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const w = parseFloat(winRate) / 100 || 0;
    const win = parseFloat(avgWin) || 1;
    const loss = parseFloat(avgLoss) || 1;
    const r = win / loss;
    const kelly = ((w * r) - (1 - w)) / r;
    setResult(Math.max(0, kelly * 100));
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label className="text-xs">{language === 'ar' ? 'معدل الفوز %' : 'Win Rate %'}</Label>
          <Input type="number" value={winRate} onChange={(e) => setWinRate(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">{language === 'ar' ? 'متوسط الربح' : 'Avg Win'}</Label>
          <Input type="number" value={avgWin} onChange={(e) => setAvgWin(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">{language === 'ar' ? 'متوسط الخسارة' : 'Avg Loss'}</Label>
          <Input type="number" value={avgLoss} onChange={(e) => setAvgLoss(e.target.value)} />
        </div>
      </div>
      <Button onClick={calculate} className="w-full gradient-primary text-white text-sm py-1">{t('calculate')}</Button>
      {result !== null && (
        <p className="text-center font-bold text-primary">{result.toFixed(2)}% {language === 'ar' ? 'من رأس المال' : 'of capital'}</p>
      )}
    </div>
  );
}

// Sharpe Ratio Calculator
function SharpeRatioCalculator({ t, language }: { t: (key: string) => string; language: string }) {
  const [avgReturn, setAvgReturn] = useState('15');
  const [riskFreeRate, setRiskFreeRate] = useState('5');
  const [stdDev, setStdDev] = useState('10');
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const ret = parseFloat(avgReturn) || 0;
    const rf = parseFloat(riskFreeRate) || 0;
    const std = parseFloat(stdDev) || 1;
    setResult((ret - rf) / std);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label className="text-xs">{language === 'ar' ? 'العائد %' : 'Return %'}</Label>
          <Input type="number" value={avgReturn} onChange={(e) => setAvgReturn(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">{language === 'ar' ? 'معدل خالي من المخاطر' : 'Risk Free %'}</Label>
          <Input type="number" value={riskFreeRate} onChange={(e) => setRiskFreeRate(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">{language === 'ar' ? 'الانحراف المعياري' : 'Std Dev %'}</Label>
          <Input type="number" value={stdDev} onChange={(e) => setStdDev(e.target.value)} />
        </div>
      </div>
      <Button onClick={calculate} className="w-full gradient-primary text-white text-sm py-1">{t('calculate')}</Button>
      {result !== null && <p className="text-center font-bold text-primary">{result.toFixed(2)}</p>}
    </div>
  );
}

// Expected Value Calculator
function ExpectedValueCalculator({ t, language }: { t: (key: string) => string; language: string }) {
  const [winRate, setWinRate] = useState('60');
  const [avgWin, setAvgWin] = useState('150');
  const [avgLoss, setAvgLoss] = useState('100');
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const w = parseFloat(winRate) / 100 || 0;
    const win = parseFloat(avgWin) || 0;
    const loss = parseFloat(avgLoss) || 0;
    setResult((w * win) - ((1 - w) * loss));
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label className="text-xs">{language === 'ar' ? 'معدل الفوز %' : 'Win %'}</Label>
          <Input type="number" value={winRate} onChange={(e) => setWinRate(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">{language === 'ar' ? 'متوسط الربح' : 'Avg Win'}</Label>
          <Input type="number" value={avgWin} onChange={(e) => setAvgWin(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">{language === 'ar' ? 'متوسط الخسارة' : 'Avg Loss'}</Label>
          <Input type="number" value={avgLoss} onChange={(e) => setAvgLoss(e.target.value)} />
        </div>
      </div>
      <Button onClick={calculate} className="w-full gradient-primary text-white text-sm py-1">{t('calculate')}</Button>
      {result !== null && (
        <p className={`text-center font-bold ${result >= 0 ? 'text-success' : 'text-destructive'}`}>
          ${result.toFixed(2)}
        </p>
      )}
    </div>
  );
}

// ROI Calculator
function ROICalculator({ t, language }: { t: (key: string) => string; language: string }) {
  const [initialInvestment, setInitialInvestment] = useState('10000');
  const [finalValue, setFinalValue] = useState('12500');
  const [result, setResult] = useState<{ roi: number; profit: number } | null>(null);

  const calculate = () => {
    const initial = parseFloat(initialInvestment) || 1;
    const final = parseFloat(finalValue) || 0;
    const profit = final - initial;
    setResult({ roi: (profit / initial) * 100, profit });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">{language === 'ar' ? 'الاستثمار الأولي' : 'Initial'}</Label>
          <Input type="number" value={initialInvestment} onChange={(e) => setInitialInvestment(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">{language === 'ar' ? 'القيمة النهائية' : 'Final Value'}</Label>
          <Input type="number" value={finalValue} onChange={(e) => setFinalValue(e.target.value)} />
        </div>
      </div>
      <Button onClick={calculate} className="w-full gradient-primary text-white text-sm py-1">{t('calculate')}</Button>
      {result && (
        <div className="text-center">
          <p className={`font-bold ${result.roi >= 0 ? 'text-success' : 'text-destructive'}`}>
            {result.roi >= 0 ? '+' : ''}{result.roi.toFixed(2)}%
          </p>
          <p className="text-xs text-muted-foreground">${result.profit.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
}

// Account Size Calculator
function AccountSizeCalculator({ t, language }: { t: (key: string) => string; language: string }) {
  const [monthlyIncome, setMonthlyIncome] = useState('5000');
  const [riskPercent, setRiskPercent] = useState('2');
  const [monthlyTrades, setMonthlyTrades] = useState('20');
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const income = parseFloat(monthlyIncome) || 0;
    const risk = parseFloat(riskPercent) / 100 || 0.02;
    const trades = parseFloat(monthlyTrades) || 1;
    setResult((income / risk) / trades);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label className="text-xs">{language === 'ar' ? 'الدخل الشهري' : 'Monthly Income'}</Label>
          <Input type="number" value={monthlyIncome} onChange={(e) => setMonthlyIncome(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">{language === 'ar' ? 'نسبة المخاطرة' : 'Risk %'}</Label>
          <Input type="number" value={riskPercent} onChange={(e) => setRiskPercent(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">{language === 'ar' ? 'عدد الصفقات' : 'Trades'}</Label>
          <Input type="number" value={monthlyTrades} onChange={(e) => setMonthlyTrades(e.target.value)} />
        </div>
      </div>
      <Button onClick={calculate} className="w-full gradient-primary text-white text-sm py-1">{t('calculate')}</Button>
      {result !== null && <p className="text-center font-bold text-primary">${result.toFixed(2)}</p>}
    </div>
  );
}

// Pips Converter
function PipsConverter({ t, language }: { t: (key: string) => string; language: string }) {
  const { globalPair, incrementCalculation } = useTradingState();
  const [pips, setPips] = useState('50');
  const [pair, setPair] = useState('EUR/USD');
  const [result, setResult] = useState<number | null>(null);

  // Sync with global pair
  useEffect(() => {
    setPair(globalPair);
  }, [globalPair]);

  const calculate = () => {
    const p = parseFloat(pips) || 0;
    const pipSize = pair.includes('JPY') ? 0.01 : 0.0001;
    setResult(p * pipSize);
    incrementCalculation('Pips Converter');
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">{language === 'ar' ? 'عدد النقاط' : 'Pips'}</Label>
          <Input type="number" value={pips} onChange={(e) => setPips(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs flex items-center gap-1">
            {language === 'ar' ? 'الزوج' : 'Pair'}
            {pair === globalPair && (
              <Badge variant="outline" className="text-[10px] px-1 py-0">{language === 'ar' ? 'متزامن' : 'Synced'}</Badge>
            )}
          </Label>
          <Select value={pair} onValueChange={setPair}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {currencyPairs.slice(0, 10).map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button onClick={calculate} className="w-full gradient-primary text-white text-sm py-1">{t('calculate')}</Button>
      {result !== null && <p className="text-center font-bold text-primary">{result.toFixed(5)}</p>}
    </div>
  );
}

// Lot Converter
function LotConverter({ t, language }: { t: (key: string) => string; language: string }) {
  const [lots, setLots] = useState('1.5');
  const [result, setResult] = useState<{ units: number; mini: number; micro: number } | null>(null);

  const calculate = () => {
    const l = parseFloat(lots) || 0;
    setResult({ units: l * 100000, mini: l * 10, micro: l * 100 });
  };

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">{language === 'ar' ? 'حجم اللوت' : 'Lot Size'}</Label>
        <Input type="number" value={lots} onChange={(e) => setLots(e.target.value)} step="0.01" />
      </div>
      <Button onClick={calculate} className="w-full gradient-primary text-white text-sm py-1">{t('calculate')}</Button>
      {result && (
        <div className="text-center text-sm">
          <p className="font-bold text-primary">{result.units.toLocaleString()} {language === 'ar' ? 'وحدة' : 'units'}</p>
          <p className="text-xs text-muted-foreground">Mini: {result.mini} | Micro: {result.micro}</p>
        </div>
      )}
    </div>
  );
}

// Time Zone Converter
function TimeZoneConverter({ t, language }: { t: (key: string) => string; language: string }) {
  const [time, setTime] = useState('14:30');
  const [fromZone, setFromZone] = useState('UTC');
  const [toZone, setToZone] = useState('EST');
  const [result, setResult] = useState<string | null>(null);

  const offsets: Record<string, number> = { UTC: 0, EST: -5, PST: -8, GMT: 0, CET: 1, JST: 9, AST: 3 };
  
  const calculate = () => {
    const [hours, minutes] = time.split(':').map(Number);
    const fromOffset = offsets[fromZone] || 0;
    const toOffset = offsets[toZone] || 0;
    let newHours = hours + (toOffset - fromOffset);
    if (newHours < 0) newHours += 24;
    if (newHours >= 24) newHours -= 24;
    setResult(`${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label className="text-xs">{language === 'ar' ? 'الوقت' : 'Time'}</Label>
          <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">{language === 'ar' ? 'من' : 'From'}</Label>
          <Select value={fromZone} onValueChange={setFromZone}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.keys(offsets).map(z => <SelectItem key={z} value={z}>{z}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">{language === 'ar' ? 'إلى' : 'To'}</Label>
          <Select value={toZone} onValueChange={setToZone}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.keys(offsets).map(z => <SelectItem key={z} value={z}>{z}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button onClick={calculate} className="w-full gradient-primary text-white text-sm py-1">{t('calculate')}</Button>
      {result && <p className="text-center font-bold text-primary">{result}</p>}
    </div>
  );
}

// Spread Calculator
function SpreadCalculator({ t, language }: { t: (key: string) => string; language: string }) {
  const { globalPair, exchangeRates, incrementCalculation } = useTradingState();
  const [bidPrice, setBidPrice] = useState('');
  const [askPrice, setAskPrice] = useState('');
  const [result, setResult] = useState<{ pips: number; value: number } | null>(null);

  // Use global pair directly with calculated default prices
  const currentPrice = exchangeRates[globalPair];
  const displayBidPrice = bidPrice || (currentPrice ? (currentPrice - 0.0001).toFixed(5) : '1.0849');
  const displayAskPrice = askPrice || (currentPrice ? (currentPrice + 0.0001).toFixed(5) : '1.0851');

  const calculate = () => {
    const bid = parseFloat(displayBidPrice) || 0;
    const ask = parseFloat(displayAskPrice) || 0;
    const pipSize = globalPair.includes('JPY') ? 0.01 : 0.0001;
    const pips = (ask - bid) / pipSize;
    setResult({ pips, value: pips * 10 });
    incrementCalculation('Spread');
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label className="text-xs">Bid</Label>
          <Input type="number" value={displayBidPrice} onChange={(e) => setBidPrice(e.target.value)} step="0.00001" />
        </div>
        <div>
          <Label className="text-xs">Ask</Label>
          <Input type="number" value={displayAskPrice} onChange={(e) => setAskPrice(e.target.value)} step="0.00001" />
        </div>
        <div>
          <Label className="text-xs">{language === 'ar' ? 'الزوج' : 'Pair'}</Label>
          <Badge variant="secondary" className="w-full justify-center py-2">{globalPair}</Badge>
        </div>
      </div>
      <Button onClick={calculate} className="w-full gradient-primary text-white text-sm py-1">{t('calculate')}</Button>
      {result && (
        <div className="text-center">
          <p className="font-bold text-primary">{result.pips.toFixed(1)} pips</p>
          <p className="text-xs text-muted-foreground">~${result.value.toFixed(2)}/lot</p>
        </div>
      )}
    </div>
  );
}

// Trade Cost Calculator
function TradeCostCalculator({ t, language }: { t: (key: string) => string; language: string }) {
  const [lotSize, setLotSize] = useState('1');
  const [spread, setSpread] = useState('2');
  const [commission, setCommission] = useState('7');
  const [result, setResult] = useState<{ total: number; spreadCost: number; commissionCost: number } | null>(null);

  const calculate = () => {
    const lots = parseFloat(lotSize) || 0;
    const sp = parseFloat(spread) || 0;
    const comm = parseFloat(commission) || 0;
    const spreadCost = sp * 10 * lots;
    const commissionCost = comm * lots;
    setResult({ total: spreadCost + commissionCost, spreadCost, commissionCost });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label className="text-xs">{language === 'ar' ? 'حجم اللوت' : 'Lots'}</Label>
          <Input type="number" value={lotSize} onChange={(e) => setLotSize(e.target.value)} step="0.01" />
        </div>
        <div>
          <Label className="text-xs">{language === 'ar' ? 'السبريد' : 'Spread'}</Label>
          <Input type="number" value={spread} onChange={(e) => setSpread(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">{language === 'ar' ? 'العمولة' : 'Commission'}</Label>
          <Input type="number" value={commission} onChange={(e) => setCommission(e.target.value)} />
        </div>
      </div>
      <Button onClick={calculate} className="w-full gradient-primary text-white text-sm py-1">{t('calculate')}</Button>
      {result && (
        <div className="text-center">
          <p className="font-bold text-primary">${result.total.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">Spread: ${result.spreadCost.toFixed(2)} | Comm: ${result.commissionCost.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
}

// Multi Position Calculator
function MultiPositionCalculator({ t, language }: { t: (key: string) => string; language: string }) {
  const [totalRisk, setTotalRisk] = useState('500');
  const [numTrades, setNumTrades] = useState('5');
  const [result, setResult] = useState<{ perTrade: number; maxLoss: number } | null>(null);

  const calculate = () => {
    const risk = parseFloat(totalRisk) || 0;
    const trades = parseFloat(numTrades) || 1;
    setResult({ perTrade: risk / trades, maxLoss: risk });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">{language === 'ar' ? 'إجمالي المخاطرة' : 'Total Risk'}</Label>
          <Input type="number" value={totalRisk} onChange={(e) => setTotalRisk(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">{language === 'ar' ? 'عدد الصفقات' : 'Trades'}</Label>
          <Input type="number" value={numTrades} onChange={(e) => setNumTrades(e.target.value)} />
        </div>
      </div>
      <Button onClick={calculate} className="w-full gradient-primary text-white text-sm py-1">{t('calculate')}</Button>
      {result && (
        <div className="text-center">
          <p className="font-bold text-primary">${result.perTrade.toFixed(2)} {language === 'ar' ? 'لكل صفقة' : 'per trade'}</p>
        </div>
      )}
    </div>
  );
}

// Win Rate Calculator
function WinRateCalculator({ t, language }: { t: (key: string) => string; language: string }) {
  const [totalTrades, setTotalTrades] = useState('100');
  const [winningTrades, setWinningTrades] = useState('60');
  const [result, setResult] = useState<{ winRate: number; lossRate: number } | null>(null);

  const calculate = () => {
    const total = parseFloat(totalTrades) || 1;
    const wins = parseFloat(winningTrades) || 0;
    setResult({ winRate: (wins / total) * 100, lossRate: ((total - wins) / total) * 100 });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">{language === 'ar' ? 'إجمالي الصفقات' : 'Total Trades'}</Label>
          <Input type="number" value={totalTrades} onChange={(e) => setTotalTrades(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">{language === 'ar' ? 'الصفقات الرابحة' : 'Winning Trades'}</Label>
          <Input type="number" value={winningTrades} onChange={(e) => setWinningTrades(e.target.value)} />
        </div>
      </div>
      <Button onClick={calculate} className="w-full gradient-primary text-white text-sm py-1">{t('calculate')}</Button>
      {result && (
        <div className="text-center">
          <p className="font-bold text-success">{result.winRate.toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground">{language === 'ar' ? 'خاسرة' : 'Loss'}: {result.lossRate.toFixed(1)}%</p>
        </div>
      )}
    </div>
  );
}

// Volatility Calculator
function VolatilityCalculator({ t, language }: { t: (key: string) => string; language: string }) {
  const [highPrice, setHighPrice] = useState('1.0900');
  const [lowPrice, setLowPrice] = useState('1.0800');
  const [currentPrice, setCurrentPrice] = useState('1.0850');
  const [result, setResult] = useState<{ range: number; percent: number } | null>(null);

  const calculate = () => {
    const high = parseFloat(highPrice) || 0;
    const low = parseFloat(lowPrice) || 0;
    const current = parseFloat(currentPrice) || 1;
    const range = high - low;
    setResult({ range, percent: (range / current) * 100 });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label className="text-xs">{language === 'ar' ? 'أعلى سعر' : 'High'}</Label>
          <Input type="number" value={highPrice} onChange={(e) => setHighPrice(e.target.value)} step="0.0001" />
        </div>
        <div>
          <Label className="text-xs">{language === 'ar' ? 'أدنى سعر' : 'Low'}</Label>
          <Input type="number" value={lowPrice} onChange={(e) => setLowPrice(e.target.value)} step="0.0001" />
        </div>
        <div>
          <Label className="text-xs">{language === 'ar' ? 'السعر الحالي' : 'Current'}</Label>
          <Input type="number" value={currentPrice} onChange={(e) => setCurrentPrice(e.target.value)} step="0.0001" />
        </div>
      </div>
      <Button onClick={calculate} className="w-full gradient-primary text-white text-sm py-1">{t('calculate')}</Button>
      {result && (
        <div className="text-center">
          <p className="font-bold text-primary">{result.percent.toFixed(2)}%</p>
          <p className="text-xs text-muted-foreground">{language === 'ar' ? 'المدى' : 'Range'}: {result.range.toFixed(5)}</p>
        </div>
      )}
    </div>
  );
}

// VaR Calculator
function VaRCalculator({ t, language }: { t: (key: string) => string; language: string }) {
  const [portfolioValue, setPortfolioValue] = useState('100000');
  const [confidenceLevel, setConfidenceLevel] = useState('95');
  const [dailyVolatility, setDailyVolatility] = useState('2');
  const [result, setResult] = useState<{ var: number; percent: number } | null>(null);

  const calculate = () => {
    const value = parseFloat(portfolioValue) || 0;
    const conf = parseFloat(confidenceLevel) || 95;
    const vol = parseFloat(dailyVolatility) / 100 || 0.02;
    // Simplified VaR calculation
    const zScore = conf === 95 ? 1.645 : conf === 99 ? 2.326 : 1.96;
    const varValue = value * vol * zScore;
    setResult({ var: varValue, percent: (varValue / value) * 100 });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label className="text-xs">{language === 'ar' ? 'قيمة المحفظة' : 'Portfolio'}</Label>
          <Input type="number" value={portfolioValue} onChange={(e) => setPortfolioValue(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">{language === 'ar' ? 'مستوى الثقة' : 'Confidence %'}</Label>
          <Input type="number" value={confidenceLevel} onChange={(e) => setConfidenceLevel(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">{language === 'ar' ? 'التقلب اليومي %' : 'Daily Vol %'}</Label>
          <Input type="number" value={dailyVolatility} onChange={(e) => setDailyVolatility(e.target.value)} />
        </div>
      </div>
      <Button onClick={calculate} className="w-full gradient-primary text-white text-sm py-1">{t('calculate')}</Button>
      {result && (
        <div className="text-center">
          <p className="font-bold text-destructive">${result.var.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">{result.percent.toFixed(2)}%</p>
        </div>
      )}
    </div>
  );
}

// ATR Calculator
function ATRCalculator({ t, language }: { t: (key: string) => string; language: string }) {
  const [highs, setHighs] = useState('1.0920,1.0930,1.0925,1.0940,1.0935');
  const [lows, setLows] = useState('1.0880,1.0890,1.0885,1.0900,1.0895');
  const [closes, setCloses] = useState('1.0900,1.0910,1.0905,1.0920,1.0915');
  const [result, setResult] = useState<{ atr: number; range: string } | null>(null);

  const calculate = () => {
    const highArr = highs.split(',').map(Number);
    const lowArr = lows.split(',').map(Number);
    const closeArr = closes.split(',').map(Number);
    
    const trueRanges = highArr.map((h, i) => Math.max(h - lowArr[i], Math.abs(h - closeArr[i-1] || closeArr[i]), Math.abs(lowArr[i] - closeArr[i-1] || closeArr[i])));
    const atr = trueRanges.reduce((a, b) => a + b, 0) / trueRanges.length;
    
    setResult({ atr, range: `${Math.min(...trueRanges).toFixed(5)} - ${Math.max(...trueRanges).toFixed(5)}` });
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label className="text-xs">{language === 'ar' ? 'القمم' : 'Highs'}</Label>
        <Input value={highs} onChange={(e) => setHighs(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label className="text-xs">{language === 'ar' ? 'القيعان' : 'Lows'}</Label>
        <Input value={lows} onChange={(e) => setLows(e.target.value)} />
      </div>
      <Button onClick={calculate} className="w-full gradient-primary text-white text-sm py-1">{t('calculate')}</Button>
      {result && <div className="text-center"><p className="font-bold text-primary">{result.atr.toFixed(5)}</p></div>}
    </div>
  );
}

// Bollinger Bands Calculator
function BollingerBandsCalculator({ t, language }: { t: (key: string) => string; language: string }) {
  const [prices, setPrices] = useState('1.0900,1.0910,1.0905,1.0920,1.0915,1.0930,1.0925,1.0940,1.0935,1.0950');
  const [stdDev, setStdDev] = useState('2');
  const [result, setResult] = useState<{ upper: number; middle: number; lower: number } | null>(null);

  const calculate = () => {
    const priceArr = prices.split(',').map(Number);
    const sma = priceArr.reduce((a, b) => a + b, 0) / priceArr.length;
    const variance = priceArr.reduce((acc, val) => acc + Math.pow(val - sma, 2), 0) / priceArr.length;
    const std = Math.sqrt(variance);
    const multiplier = parseFloat(stdDev) || 2;
    setResult({ upper: sma + std * multiplier, middle: sma, lower: sma - std * multiplier });
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label className="text-xs">{language === 'ar' ? 'الأسعار' : 'Prices'}</Label>
        <Input value={prices} onChange={(e) => setPrices(e.target.value)} />
      </div>
      <Button onClick={calculate} className="w-full gradient-primary text-white text-sm py-1">{t('calculate')}</Button>
      {result && (
        <div className="grid grid-cols-3 gap-2 text-center">
          <div><p className="text-xs text-muted-foreground">Upper</p><p className="font-bold text-success">{result.upper.toFixed(5)}</p></div>
          <div><p className="text-xs text-muted-foreground">Middle</p><p className="font-bold text-primary">{result.middle.toFixed(5)}</p></div>
          <div><p className="text-xs text-muted-foreground">Lower</p><p className="font-bold text-destructive">{result.lower.toFixed(5)}</p></div>
        </div>
      )}
    </div>
  );
}

// RSI Calculator
function RSICalculator({ t, language }: { t: (key: string) => string; language: string }) {
  const [prices, setPrices] = useState('1.0900,1.0910,1.0905,1.0920,1.0915,1.0900,1.0895,1.0910,1.0925,1.0930,1.0920,1.0915,1.0930,1.0940');
  const [result, setResult] = useState<{ rsi: number; signal: string } | null>(null);

  const calculate = () => {
    const priceArr = prices.split(',').map(Number);
    let gains = 0, losses = 0;
    for (let i = 1; i < priceArr.length; i++) {
      const change = priceArr[i] - priceArr[i - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }
    const avgGain = gains / (priceArr.length - 1);
    const avgLoss = losses / (priceArr.length - 1);
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    setResult({ rsi, signal: rsi > 70 ? 'Overbought' : rsi < 30 ? 'Oversold' : 'Neutral' });
  };

  return (
    <div className="space-y-3">
      <Label className="text-xs">{language === 'ar' ? 'الأسعار' : 'Prices'}</Label>
      <Input value={prices} onChange={(e) => setPrices(e.target.value)} />
      <Button onClick={calculate} className="w-full gradient-primary text-white text-sm py-1">{t('calculate')}</Button>
      {result && (
        <div className="text-center">
          <p className={`font-bold ${result.rsi > 70 ? 'text-destructive' : result.rsi < 30 ? 'text-success' : 'text-primary'}`}>{result.rsi.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">{result.signal}</p>
        </div>
      )}
    </div>
  );
}

// MACD Calculator
function MACDCalculator({ t, language }: { t: (key: string) => string; language: string }) {
  const [prices, setPrices] = useState('1.0900,1.0910,1.0905,1.0920,1.0915,1.0930,1.0925,1.0940');
  const [result, setResult] = useState<{ macd: number; histogram: number } | null>(null);

  const calculate = () => {
    const priceArr = prices.split(',').map(Number);
    const sma = priceArr.reduce((a, b) => a + b, 0) / priceArr.length;
    const macd = priceArr[priceArr.length - 1] - sma;
    setResult({ macd, histogram: macd * 0.2 });
  };

  return (
    <div className="space-y-3">
      <Label className="text-xs">{language === 'ar' ? 'الأسعار' : 'Prices'}</Label>
      <Input value={prices} onChange={(e) => setPrices(e.target.value)} />
      <Button onClick={calculate} className="w-full gradient-primary text-white text-sm py-1">{t('calculate')}</Button>
      {result && (
        <div className="grid grid-cols-2 gap-2 text-center">
          <div><p className="text-xs text-muted-foreground">MACD</p><p className="font-bold text-primary">{result.macd.toFixed(6)}</p></div>
          <div><p className="text-xs text-muted-foreground">Histogram</p><p className={`font-bold ${result.histogram >= 0 ? 'text-success' : 'text-destructive'}`}>{result.histogram.toFixed(6)}</p></div>
        </div>
      )}
    </div>
  );
}

// Stochastic Calculator
function StochasticCalculator({ t, language }: { t: (key: string) => string; language: string }) {
  const [highs, setHighs] = useState('1.0920,1.0930,1.0925,1.0940,1.0935');
  const [lows, setLows] = useState('1.0880,1.0890,1.0885,1.0900,1.0895');
  const [closes, setCloses] = useState('1.0910,1.0920,1.0915,1.0930,1.0920');
  const [result, setResult] = useState<{ k: number; signal: string } | null>(null);

  const calculate = () => {
    const highArr = highs.split(',').map(Number);
    const lowArr = lows.split(',').map(Number);
    const closeArr = closes.split(',').map(Number);
    const periodHigh = Math.max(...highArr);
    const periodLow = Math.min(...lowArr);
    const currentClose = closeArr[closeArr.length - 1];
    const k = ((currentClose - periodLow) / (periodHigh - periodLow)) * 100;
    setResult({ k, signal: k > 80 ? 'Overbought' : k < 20 ? 'Oversold' : 'Neutral' });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <Input value={highs} onChange={(e) => setHighs(e.target.value)} placeholder="Highs" />
        <Input value={lows} onChange={(e) => setLows(e.target.value)} placeholder="Lows" />
        <Input value={closes} onChange={(e) => setCloses(e.target.value)} placeholder="Closes" />
      </div>
      <Button onClick={calculate} className="w-full gradient-primary text-white text-sm py-1">{t('calculate')}</Button>
      {result && <div className="text-center"><p className="font-bold text-primary">%K: {result.k.toFixed(2)}</p><p className="text-xs">{result.signal}</p></div>}
    </div>
  );
}

// Position Heat Calculator
function PositionHeatCalculator({ t, language }: { t: (key: string) => string; language: string }) {
  const [positions, setPositions] = useState('3');
  const [riskPerPosition, setRiskPerPosition] = useState('2');
  const [result, setResult] = useState<{ totalRisk: number; heatLevel: string } | null>(null);

  const calculate = () => {
    const pos = parseFloat(positions) || 0;
    const risk = parseFloat(riskPerPosition) || 0;
    const totalRisk = pos * risk;
    const heatLevel = totalRisk < 6 ? 'Low' : totalRisk < 12 ? 'Medium' : totalRisk < 20 ? 'High' : 'Extreme';
    setResult({ totalRisk, heatLevel });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div><Label className="text-xs">{language === 'ar' ? 'صفقات' : 'Positions'}</Label><Input type="number" value={positions} onChange={(e) => setPositions(e.target.value)} /></div>
        <div><Label className="text-xs">{language === 'ar' ? 'مخاطرة %' : 'Risk %'}</Label><Input type="number" value={riskPerPosition} onChange={(e) => setRiskPerPosition(e.target.value)} /></div>
      </div>
      <Button onClick={calculate} className="w-full gradient-primary text-white text-sm py-1">{t('calculate')}</Button>
      {result && <div className="text-center"><p className="font-bold text-primary">{result.totalRisk.toFixed(1)}%</p><p className="text-xs">{result.heatLevel}</p></div>}
    </div>
  );
}

// Stop Loss Distance Calculator
function StopLossDistanceCalculator({ t, language }: { t: (key: string) => string; language: string }) {
  const [entryPrice, setEntryPrice] = useState('1.0900');
  const [riskPercent, setRiskPercent] = useState('1');
  const [accountBalance, setAccountBalance] = useState('10000');
  const [lotSize, setLotSize] = useState('1');
  const [result, setResult] = useState<{ pips: number; price: number } | null>(null);

  const calculate = () => {
    const entry = parseFloat(entryPrice) || 0;
    const risk = parseFloat(riskPercent) || 0;
    const balance = parseFloat(accountBalance) || 0;
    const lots = parseFloat(lotSize) || 1;
    const riskAmount = (balance * risk) / 100;
    const pipValue = 10 * lots;
    const pips = riskAmount / pipValue;
    const price = entry - (pips * 0.0001);
    setResult({ pips, price });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Input type="number" value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} placeholder="Entry" />
        <Input type="number" value={riskPercent} onChange={(e) => setRiskPercent(e.target.value)} placeholder="Risk %" />
        <Input type="number" value={accountBalance} onChange={(e) => setAccountBalance(e.target.value)} placeholder="Balance" />
        <Input type="number" value={lotSize} onChange={(e) => setLotSize(e.target.value)} placeholder="Lot Size" />
      </div>
      <Button onClick={calculate} className="w-full gradient-primary text-white text-sm py-1">{t('calculate')}</Button>
      {result && <div className="grid grid-cols-2 gap-2 text-center"><div><p className="text-xs">Pips</p><p className="font-bold">{result.pips.toFixed(1)}</p></div><div><p className="text-xs">Price</p><p className="font-bold text-destructive">{result.price.toFixed(5)}</p></div></div>}
    </div>
  );
}

// Take Profit Calculator
function TakeProfitCalculator({ t, language }: { t: (key: string) => string; language: string }) {
  const [entryPrice, setEntryPrice] = useState('1.0900');
  const [riskReward, setRiskReward] = useState('2');
  const [stopLossPips, setStopLossPips] = useState('50');
  const [result, setResult] = useState<{ tpPips: number; tpPrice: number } | null>(null);

  const calculate = () => {
    const entry = parseFloat(entryPrice) || 0;
    const rr = parseFloat(riskReward) || 2;
    const sl = parseFloat(stopLossPips) || 0;
    const tpPips = sl * rr;
    const tpPrice = entry + (tpPips * 0.0001);
    setResult({ tpPips, tpPrice });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <Input type="number" value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} placeholder="Entry" />
        <Input type="number" value={riskReward} onChange={(e) => setRiskReward(e.target.value)} placeholder="R:R" />
        <Input type="number" value={stopLossPips} onChange={(e) => setStopLossPips(e.target.value)} placeholder="SL Pips" />
      </div>
      <Button onClick={calculate} className="w-full gradient-primary text-white text-sm py-1">{t('calculate')}</Button>
      {result && <div className="grid grid-cols-2 gap-2 text-center"><div><p className="text-xs">TP Pips</p><p className="font-bold">{result.tpPips.toFixed(1)}</p></div><div><p className="text-xs">TP Price</p><p className="font-bold text-success">{result.tpPrice.toFixed(5)}</p></div></div>}
    </div>
  );
}

// Profit Factor Calculator
function ProfitFactorCalculator({ t, language }: { t: (key: string) => string; language: string }) {
  const [grossProfit, setGrossProfit] = useState('5000');
  const [grossLoss, setGrossLoss] = useState('2500');
  const [result, setResult] = useState<{ factor: number; rating: string } | null>(null);

  const calculate = () => {
    const profit = parseFloat(grossProfit) || 0;
    const loss = parseFloat(grossLoss) || 1;
    const factor = profit / loss;
    const rating = factor >= 2 ? 'Excellent' : factor >= 1.5 ? 'Good' : factor >= 1 ? 'Acceptable' : 'Poor';
    setResult({ factor, rating });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Input type="number" value={grossProfit} onChange={(e) => setGrossProfit(e.target.value)} placeholder="Gross Profit" />
        <Input type="number" value={grossLoss} onChange={(e) => setGrossLoss(e.target.value)} placeholder="Gross Loss" />
      </div>
      <Button onClick={calculate} className="w-full gradient-primary text-white text-sm py-1">{t('calculate')}</Button>
      {result && <div className="text-center"><p className="font-bold text-primary text-2xl">{result.factor.toFixed(2)}</p><p className="text-xs">{result.rating}</p></div>}
    </div>
  );
}

// Risk of Ruin Calculator
function RiskOfRuinCalculator({ t, language }: { t: (key: string) => string; language: string }) {
  const [winRate, setWinRate] = useState('55');
  const [riskPerTrade, setRiskPerTrade] = useState('2');
  const [result, setResult] = useState<{ riskOfRuin: number } | null>(null);

  const calculate = () => {
    const win = parseFloat(winRate) / 100 || 0.5;
    const risk = parseFloat(riskPerTrade) || 2;
    const loss = 1 - win;
    const riskOfRuin = Math.min(Math.pow(loss / win, 100 / risk) * 100, 100);
    setResult({ riskOfRuin });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Input type="number" value={winRate} onChange={(e) => setWinRate(e.target.value)} placeholder="Win Rate %" />
        <Input type="number" value={riskPerTrade} onChange={(e) => setRiskPerTrade(e.target.value)} placeholder="Risk %" />
      </div>
      <Button onClick={calculate} className="w-full gradient-primary text-white text-sm py-1">{t('calculate')}</Button>
      {result && <div className="text-center"><p className={`font-bold text-2xl ${result.riskOfRuin < 1 ? 'text-success' : result.riskOfRuin < 10 ? 'text-warning' : 'text-destructive'}`}>{result.riskOfRuin.toFixed(2)}%</p><p className="text-xs">{language === 'ar' ? 'مخاطر الإفلاس' : 'Risk of Ruin'}</p></div>}
    </div>
  );
}

// Commission Calculator
function CommissionCalculator({ t, language }: { t: (key: string) => string; language: string }) {
  const [lotSize, setLotSize] = useState('1');
  const [commissionPerLot, setCommissionPerLot] = useState('7');
  const [trades, setTrades] = useState('10');
  const [result, setResult] = useState<{ perTrade: number; total: number } | null>(null);

  const calculate = () => {
    const lots = parseFloat(lotSize) || 1;
    const commission = parseFloat(commissionPerLot) || 0;
    const numTrades = parseFloat(trades) || 1;
    const perTrade = lots * commission;
    const total = perTrade * numTrades;
    setResult({ perTrade, total });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <Input type="number" value={lotSize} onChange={(e) => setLotSize(e.target.value)} placeholder="Lot" />
        <Input type="number" value={commissionPerLot} onChange={(e) => setCommissionPerLot(e.target.value)} placeholder="Comm/Lot" />
        <Input type="number" value={trades} onChange={(e) => setTrades(e.target.value)} placeholder="Trades" />
      </div>
      <Button onClick={calculate} className="w-full gradient-primary text-white text-sm py-1">{t('calculate')}</Button>
      {result && <div className="grid grid-cols-2 gap-2 text-center"><div><p className="text-xs">{language === 'ar' ? 'للصفقة' : 'Per Trade'}</p><p className="font-bold">${result.perTrade.toFixed(2)}</p></div><div><p className="text-xs">{language === 'ar' ? 'الإجمالي' : 'Total'}</p><p className="font-bold">${result.total.toFixed(2)}</p></div></div>}
    </div>
  );
}

// Session Overlap Calculator
function SessionOverlapCalculator({ t, language }: { t: (key: string) => string; language: string }) {
  const [pair, setPair] = useState('EUR/USD');
  const [result, setResult] = useState<{ bestSession: string; overlap: string } | null>(null);

  const sessions: Record<string, { best: string; overlap: string }> = {
    'EUR/USD': { best: 'London/NY', overlap: '13:00-17:00 UTC' },
    'GBP/USD': { best: 'London/NY', overlap: '13:00-17:00 UTC' },
    'USD/JPY': { best: 'Tokyo/London', overlap: '08:00-09:00 UTC' },
    'XAU/USD': { best: 'London/NY', overlap: '13:00-17:00 UTC' },
  };

  const calculate = () => {
    const session = sessions[pair] || sessions['EUR/USD'];
    setResult({ bestSession: session.best, overlap: session.overlap });
  };

  return (
    <div className="space-y-3">
      <Select value={pair} onValueChange={setPair}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {Object.keys(sessions).map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
        </SelectContent>
      </Select>
      <Button onClick={calculate} className="w-full gradient-primary text-white text-sm py-1">{t('calculate')}</Button>
      {result && <div className="text-center"><p className="font-bold text-primary">{result.bestSession}</p><p className="text-xs">{result.overlap}</p></div>}
    </div>
  );
}

// Equity Curve Calculator
function EquityCurveCalculator({ t, language }: { t: (key: string) => string; language: string }) {
  const [initialCapital, setInitialCapital] = useState('10000');
  const [monthlyReturn, setMonthlyReturn] = useState('5');
  const [months, setMonths] = useState('12');
  const [result, setResult] = useState<{ finalValue: number; totalReturn: number } | null>(null);

  const calculate = () => {
    const capital = parseFloat(initialCapital) || 0;
    const monthly = parseFloat(monthlyReturn) / 100 || 0;
    const m = parseFloat(months) || 1;
    const finalValue = capital * Math.pow(1 + monthly, m);
    const totalReturn = ((finalValue - capital) / capital) * 100;
    setResult({ finalValue, totalReturn });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <Input type="number" value={initialCapital} onChange={(e) => setInitialCapital(e.target.value)} placeholder="Capital" />
        <Input type="number" value={monthlyReturn} onChange={(e) => setMonthlyReturn(e.target.value)} placeholder="Monthly %" />
        <Input type="number" value={months} onChange={(e) => setMonths(e.target.value)} placeholder="Months" />
      </div>
      <Button onClick={calculate} className="w-full gradient-primary text-white text-sm py-1">{t('calculate')}</Button>
      {result && <div className="grid grid-cols-2 gap-2 text-center"><div><p className="text-xs">{language === 'ar' ? 'القيمة' : 'Value'}</p><p className="font-bold">${result.finalValue.toFixed(2)}</p></div><div><p className="text-xs">{language === 'ar' ? 'العائد' : 'Return'}</p><p className="font-bold text-success">{result.totalReturn.toFixed(2)}%</p></div></div>}
    </div>
  );
}

// Leverage Impact Calculator
function LeverageImpactCalculator({ t, language }: { t: (key: string) => string; language: string }) {
  const [capital, setCapital] = useState('1000');
  const [leverage, setLeverage] = useState('100');
  const [priceChange, setPriceChange] = useState('1');
  const [result, setResult] = useState<{ profit: number; actualChange: number } | null>(null);

  const calculate = () => {
    const cap = parseFloat(capital) || 0;
    const lev = parseFloat(leverage) || 1;
    const change = parseFloat(priceChange) || 0;
    const positionValue = cap * lev;
    const profit = positionValue * (change / 100);
    const actualChange = lev * change;
    setResult({ profit, actualChange });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <Input type="number" value={capital} onChange={(e) => setCapital(e.target.value)} placeholder="Capital" />
        <Input type="number" value={leverage} onChange={(e) => setLeverage(e.target.value)} placeholder="Leverage" />
        <Input type="number" value={priceChange} onChange={(e) => setPriceChange(e.target.value)} placeholder="Price %" />
      </div>
      <Button onClick={calculate} className="w-full gradient-primary text-white text-sm py-1">{t('calculate')}</Button>
      {result && <div className="text-center"><p className="text-xs">{language === 'ar' ? 'تغير فعلي' : 'Actual Change'}: {result.actualChange.toFixed(2)}%</p><p className="font-bold text-success">+${result.profit.toFixed(2)}</p></div>}
    </div>
  );
}

// Average Trade Calculator
function AverageTradeCalculator({ t, language }: { t: (key: string) => string; language: string }) {
  const [totalProfit, setTotalProfit] = useState('10000');
  const [totalTrades, setTotalTrades] = useState('100');
  const [result, setResult] = useState<{ avgProfit: number } | null>(null);

  const calculate = () => {
    const profit = parseFloat(totalProfit) || 0;
    const trades = parseFloat(totalTrades) || 1;
    setResult({ avgProfit: profit / trades });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Input type="number" value={totalProfit} onChange={(e) => setTotalProfit(e.target.value)} placeholder="Total Profit" />
        <Input type="number" value={totalTrades} onChange={(e) => setTotalTrades(e.target.value)} placeholder="Trades" />
      </div>
      <Button onClick={calculate} className="w-full gradient-primary text-white text-sm py-1">{t('calculate')}</Button>
      {result && <div className="text-center"><p className="font-bold text-primary">${result.avgProfit.toFixed(2)}</p><p className="text-xs">{language === 'ar' ? 'متوسط/صفقة' : 'Avg/Trade'}</p></div>}
    </div>
  );
}

// ============== PROFESSIONAL ADS SECTION ==============

// Countdown Timer Component
function CountdownTimer({ language }: { language: string }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            }
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <Timer className="w-4 h-4 animate-pulse" />
      <div className="flex gap-1 font-mono">
        <span className="bg-black/30 px-2 py-1 rounded text-sm font-bold">
          {String(timeLeft.hours).padStart(2, '0')}
        </span>
        <span className="text-sm">:</span>
        <span className="bg-black/30 px-2 py-1 rounded text-sm font-bold">
          {String(timeLeft.minutes).padStart(2, '0')}
        </span>
        <span className="text-sm">:</span>
        <span className="bg-black/30 px-2 py-1 rounded text-sm font-bold">
          {String(timeLeft.seconds).padStart(2, '0')}
        </span>
      </div>
      <span className="text-xs opacity-80">
        {language === 'ar' ? 'متبقي' : 'left'}
      </span>
    </div>
  );
}

// Professional Ads Section
function ProfessionalAdsSection({ language }: { language: string }) {
  const [currentAd, setCurrentAd] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAd(prev => (prev + 1) % 2);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const ads = [
    {
      id: 1,
      checkoutUrl: 'https://infinityalgoacademy.net/checkout/?fct_cart_hash=d74ccfb0eaaca7ce3994e3361c3ca105',
      productName: language === 'ar' ? 'Gold One MT4 - الكود المصدري' : 'Gold One MT4 Source Code',
      originalPrice: 100,
      salePrice: 75,
      discount: 25,
      discountPercent: 25,
      badge: language === 'ar' ? '🔥 أفضل عرض - خصم 25%' : '🔥 Best Offer – 25% Discount',
      subtitle: language === 'ar' ? 'عرض محدود الوقت' : 'Limited Time Offer',
      features: language === 'ar' 
        ? ['كود مصدري كامل', 'دعم فني مجاني', 'تحديثات مدى الحياة']
        : ['Full Source Code', 'Free Support', 'Lifetime Updates'],
      gradient: 'from-amber-500 via-orange-500 to-red-500',
      icon: Crown,
    },
    {
      id: 2,
      checkoutUrl: 'https://infinityalgoacademy.net/checkout/?fct_cart_hash=8d9777f0d0cc255238afa75597c95be5',
      productName: language === 'ar' ? 'InfinityRSI Divergence V6.2' : 'InfinityRSI-Divergence-V.6.2',
      originalPrice: 50,
      salePrice: 12.50,
      discount: 37.50,
      discountPercent: 75,
      badge: language === 'ar' ? '🔥 ترقية خاصة - خصم 75%' : '🔥 Yes! Upgrade with 75% OFF',
      subtitle: language === 'ar' ? 'عرض حصري - مرة واحدة فقط' : 'One-Time Exclusive Offer',
      features: language === 'ar'
        ? ['مؤشر RSI متقدم', 'كشف التباعد القوي', 'تنبيهات ذكية']
        : ['Advanced RSI Indicator', 'Strong Divergence Detection', 'Smart Alerts'],
      gradient: 'from-purple-600 via-pink-500 to-rose-500',
      icon: Diamond,
    }
  ];

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          {ads.map((ad, index) => (
            currentAd === index && (
              <motion.div
                key={ad.id}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="relative"
              >
                <motion.a
                  href={ad.checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`
                    block relative overflow-hidden rounded-2xl
                    bg-gradient-to-r ${ad.gradient}
                    shadow-2xl cursor-pointer group
                  `}
                  whileHover={{ scale: 1.01, y: -2 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {/* Animated Background Elements */}
                  <div className="absolute inset-0 overflow-hidden">
                    <motion.div 
                      className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3]
                      }}
                      transition={{ duration: 4, repeat: Infinity }}
                    />
                    <motion.div 
                      className="absolute -bottom-20 -left-20 w-60 h-60 bg-black/10 rounded-full blur-3xl"
                      animate={{ 
                        scale: [1.2, 1, 1.2],
                        opacity: [0.5, 0.3, 0.5]
                      }}
                      transition={{ duration: 4, repeat: Infinity }}
                    />
                    {/* Floating Particles */}
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-white/20 rounded-full"
                        style={{
                          left: `${20 + i * 15}%`,
                          top: `${20 + (i % 3) * 30}%`,
                        }}
                        animate={{
                          y: [-10, 10, -10],
                          opacity: [0.2, 0.5, 0.2],
                        }}
                        transition={{
                          duration: 2 + i * 0.5,
                          repeat: Infinity,
                          delay: i * 0.3,
                        }}
                      />
                    ))}
                  </div>

                  {/* Content */}
                  <div className="relative z-10 p-6 sm:p-8">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                      {/* Left Side - Badge & Timer */}
                      <div className="flex flex-col items-center lg:items-start gap-4">
                        {/* Badge */}
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, type: 'spring' }}
                          className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30"
                        >
                          <Flame className="w-5 h-5 animate-pulse text-yellow-200" />
                          <span className="font-bold text-white text-sm">{ad.badge}</span>
                        </motion.div>

                        {/* Countdown Timer */}
                        <div className="text-white/90">
                          <CountdownTimer language={language} />
                        </div>
                      </div>

                      {/* Center - Product Info */}
                      <div className="flex-1 text-center lg:text-left">
                        <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
                          <motion.div
                            className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center"
                            whileHover={{ rotate: 10 }}
                          >
                            <ad.icon className="w-7 h-7 text-white" />
                          </motion.div>
                          <h3 className="text-xl sm:text-2xl font-bold text-white">
                            {ad.productName}
                          </h3>
                        </div>

                        {/* Features */}
                        <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-4">
                          {ad.features.map((feature, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 + i * 0.1 }}
                              className="flex items-center gap-1 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-white/90 text-xs"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              {feature}
                            </motion.div>
                          ))}
                        </div>

                        {/* Pricing */}
                        <div className="flex items-center justify-center lg:justify-start gap-4">
                          <span className="text-white/60 line-through text-lg">
                            ${ad.originalPrice.toFixed(2)}
                          </span>
                          <span className="text-3xl sm:text-4xl font-bold text-white">
                            ${ad.salePrice.toFixed(2)}
                          </span>
                          <motion.span
                            className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold"
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            -{ad.discountPercent}%
                          </motion.span>
                        </div>
                        <p className="text-white/70 text-sm mt-1">
                          {language === 'ar' ? `وفر $${ad.discount.toFixed(2)}` : `Save $${ad.discount.toFixed(2)}`}
                        </p>
                      </div>

                      {/* Right Side - CTA Button */}
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="flex flex-col items-center gap-3">
                          <div className="bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-yellow-50 transition-colors flex items-center gap-2">
                            <Gift className="w-5 h-5" />
                            {language === 'ar' ? 'احصل على العرض' : 'Get This Deal'}
                          </div>
                          <div className="flex items-center gap-1 text-white/70 text-xs">
                            <ExternalLink className="w-3 h-3" />
                            {language === 'ar' ? 'سينتهي عند مغادرة الصفحة' : 'Ends when you leave this page'}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  {/* Urgency Bar */}
                  <div className="bg-black/20 px-6 py-3 flex items-center justify-center gap-2 text-white/80 text-sm">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    </motion.div>
                    <span>
                      {language === 'ar' 
                        ? '⚡ عرض حصري للمستخدمين المميزين - لا تفوت هذه الفرصة!'
                        : '⚡ Exclusive offer for premium users - Don\'t miss this opportunity!'}
                    </span>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    </motion.div>
                  </div>
                </motion.a>
              </motion.div>
            )
          ))}
        </AnimatePresence>

        {/* Ad Indicators */}
        <div className="flex justify-center gap-2 mt-4">
          {ads.map((ad, index) => (
            <button
              key={ad.id}
              onClick={() => setCurrentAd(index)}
              className={`
                w-3 h-3 rounded-full transition-all duration-300
                ${currentAd === index 
                  ? `bg-gradient-to-r ${ad.gradient} w-8` 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }
              `}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
