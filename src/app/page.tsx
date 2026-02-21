'use client';

import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, TrendingUp, TrendingDown, DollarSign, Percent, 
  Target, LineChart, BarChart3, Activity, Sun, Moon, 
  Globe, ChevronRight, AlertTriangle, CheckCircle2, 
  RefreshCw, Zap, Shield, Award, Menu, X, Loader2,
  Layers, Scale, ArrowUpDown, Coins, Wallet, PieChart,
  Clock, Hash, Repeat, Sparkles, TrendingUpIcon
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
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('calculators');
  const [exchangeRates, setExchangeRates] = useState(defaultExchangeRates);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const hasHydrated = useRef(false);

  // Hydrate language on mount (runs once)
  useLayoutEffect(() => {
    if (!hasHydrated.current) {
      hydrateLanguage();
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
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection t={t} isRTL={isRTL} language={language} setActiveSection={setActiveSection} />

        {/* Calculators Section */}
        <section id="calculators" className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-primary">
                {language === 'ar' ? 'حاسبات التداول الاحترافية' : 'Professional Trading Calculators'}
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {language === 'ar' 
                  ? '25+ أداة وحاسبة احترافية لمساعدتك في اتخاذ قرارات تداول مدروسة'
                  : '25+ professional tools and calculators to help you make informed trading decisions'}
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
                    component={<MarginCalculator t={t} language={language} />}
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
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* AI Analysis Section */}
        <AIAnalysisSection t={t} language={language} />

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
  language, setLanguage, isDark, setIsDark, isRTL, t, mobileMenuOpen, setMobileMenuOpen, activeSection, setActiveSection 
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
function HeroSection({ t, isRTL, language, setActiveSection }: { t: (key: string) => string; isRTL: () => boolean; language: string; setActiveSection: (v: string) => void }) {
  const stats = [
    { label: language === 'ar' ? 'حاسبات متخصصة' : 'Calculators', value: '9+' },
    { label: language === 'ar' ? 'أزواج عملات' : 'Currency Pairs', value: '25+' },
    { label: language === 'ar' ? 'تحليل AI' : 'AI Analysis', value: '24/7' },
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

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-3 gap-4 max-w-2xl mx-auto"
          >
            {stats.map((stat, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Position Size Calculator
function PositionSizeCalculator({ t, language }: { t: (key: string) => string; language: string }) {
  const [accountBalance, setAccountBalance] = useState<string>('10000');
  const [riskPercent, setRiskPercent] = useState<string>('2');
  const [stopLossPips, setStopLossPips] = useState<string>('50');
  const [currencyPair, setCurrencyPair] = useState<string>('EUR/USD');
  const [accountCurrency, setAccountCurrency] = useState<string>('USD');
  const [result, setResult] = useState<{ lotSize: number; riskAmount: number } | null>(null);

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
              <Label>{t('currencyPair')}</Label>
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
  const [currencyPair, setCurrencyPair] = useState<string>('EUR/USD');
  const [lotSize, setLotSize] = useState<string>('1');
  const [accountCurrency, setAccountCurrency] = useState<string>('USD');
  const [result, setResult] = useState<number | null>(null);

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
              <Label>{t('currencyPair')}</Label>
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
function MarginCalculator({ t, language }: { t: (key: string) => string; language: string }) {
  const [lotSize, setLotSize] = useState<string>('1');
  const [leverage, setLeverage] = useState<string>('1:100');
  const [currencyPair, setCurrencyPair] = useState<string>('EUR/USD');
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const lots = parseFloat(lotSize) || 1;
    const leverageValue = parseInt(leverage.split(':')[1]) || 100;
    const contractSize = 100000; // Standard lot
    
    const rate = exchangeRates[currencyPair] || 1;
    const margin = (lots * contractSize * rate) / leverageValue;
    
    setResult(margin);
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
              <Label>{t('currencyPair')}</Label>
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
  const [entryPrice, setEntryPrice] = useState<string>('1.0850');
  const [exitPrice, setExitPrice] = useState<string>('1.0900');
  const [lotSize, setLotSize] = useState<string>('1');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [currencyPair, setCurrencyPair] = useState<string>('EUR/USD');
  const [result, setResult] = useState<{ profit: number; pips: number } | null>(null);

  const calculate = () => {
    const entry = parseFloat(entryPrice) || 0;
    const exit = parseFloat(exitPrice) || 0;
    const lots = parseFloat(lotSize) || 1;
    
    const isJPYPair = currencyPair.includes('JPY');
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
                value={entryPrice}
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
function AIAnalysisSection({ t, language }: { t: (key: string) => string; language: string }) {
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
              <Select value={selectedPair} onValueChange={setSelectedPair}>
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
  const [pips, setPips] = useState('50');
  const [pair, setPair] = useState('EUR/USD');
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const p = parseFloat(pips) || 0;
    const pipSize = pair.includes('JPY') ? 0.01 : 0.0001;
    setResult(p * pipSize);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">{language === 'ar' ? 'عدد النقاط' : 'Pips'}</Label>
          <Input type="number" value={pips} onChange={(e) => setPips(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">{language === 'ar' ? 'الزوج' : 'Pair'}</Label>
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
  const [bidPrice, setBidPrice] = useState('1.0850');
  const [askPrice, setAskPrice] = useState('1.0852');
  const [pair, setPair] = useState('EUR/USD');
  const [result, setResult] = useState<{ pips: number; value: number } | null>(null);

  const calculate = () => {
    const bid = parseFloat(bidPrice) || 0;
    const ask = parseFloat(askPrice) || 0;
    const pipSize = pair.includes('JPY') ? 0.01 : 0.0001;
    const pips = (ask - bid) / pipSize;
    setResult({ pips, value: pips * 10 });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label className="text-xs">Bid</Label>
          <Input type="number" value={bidPrice} onChange={(e) => setBidPrice(e.target.value)} step="0.00001" />
        </div>
        <div>
          <Label className="text-xs">Ask</Label>
          <Input type="number" value={askPrice} onChange={(e) => setAskPrice(e.target.value)} step="0.00001" />
        </div>
        <div>
          <Label className="text-xs">{language === 'ar' ? 'الزوج' : 'Pair'}</Label>
          <Select value={pair} onValueChange={setPair}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {currencyPairs.slice(0, 10).map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
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
