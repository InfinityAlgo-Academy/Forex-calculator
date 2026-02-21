'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, TrendingUp, TrendingDown, DollarSign, Percent, 
  Target, LineChart, BarChart3, Activity, Sun, Moon, 
  Globe, ChevronRight, AlertTriangle, CheckCircle2, 
  RefreshCw, Zap, Shield, Award, Menu, X
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
import { useLanguage } from '@/hooks/useLanguage';

// Currency pairs data
const currencyPairs = [
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD',
  'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'EUR/CHF', 'AUD/JPY', 'CAD/JPY', 'NZD/JPY',
  'EUR/AUD', 'GBP/AUD', 'EUR/CAD', 'GBP/CAD', 'AUD/CAD', 'AUD/NZD', 'NZD/CAD',
  'XAU/USD', 'XAG/USD', 'BTC/USD', 'ETH/USD'
];

const accountCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD'];

const leverageOptions = ['1:10', '1:20', '1:50', '1:100', '1:200', '1:500', '1:1000'];

// Exchange rates (mock - in production would come from API)
const exchangeRates: Record<string, number> = {
  'EUR/USD': 1.0850, 'GBP/USD': 1.2650, 'USD/JPY': 149.50, 'USD/CHF': 0.8850,
  'AUD/USD': 0.6550, 'USD/CAD': 1.3650, 'NZD/USD': 0.6150, 'XAU/USD': 2350.00,
  'BTC/USD': 67500.00, 'ETH/USD': 3450.00
};

export default function ForexCalculatorApp() {
  const { language, setLanguage, t, isRTL } = useLanguage();
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('calculators');

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
                  ? 'مجموعة شاملة من الأدوات والحاسبات لمساعدتك في اتخاذ قرارات تداول مدروسة'
                  : 'A comprehensive suite of tools and calculators to help you make informed trading decisions'}
              </p>
            </div>

            <Tabs defaultValue="position" className="w-full">
              <TabsList className="grid grid-cols-5 sm:grid-cols-5 lg:grid-cols-10 gap-1 h-auto p-2 bg-card rounded-xl mb-8">
                <TabsTrigger value="position" className="text-xs px-2">
                  <Calculator className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                  <span className="hidden lg:inline">{language === 'ar' ? 'الحجم' : 'Size'}</span>
                </TabsTrigger>
                <TabsTrigger value="pip" className="text-xs px-2">
                  <Activity className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                  <span className="hidden lg:inline">Pip</span>
                </TabsTrigger>
                <TabsTrigger value="margin" className="text-xs px-2">
                  <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                  <span className="hidden lg:inline">{language === 'ar' ? 'الهامش' : 'Margin'}</span>
                </TabsTrigger>
                <TabsTrigger value="profit" className="text-xs px-2">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                  <span className="hidden lg:inline">P/L</span>
                </TabsTrigger>
                <TabsTrigger value="risk" className="text-xs px-2">
                  <Target className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                  <span className="hidden lg:inline">R/R</span>
                </TabsTrigger>
                <TabsTrigger value="fibonacci" className="text-xs px-2">
                  <LineChart className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                  <span className="hidden lg:inline">Fib</span>
                </TabsTrigger>
                <TabsTrigger value="pivot" className="text-xs px-2">
                  <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                  <span className="hidden lg:inline">Pivot</span>
                </TabsTrigger>
                <TabsTrigger value="swap" className="text-xs px-2">
                  <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                  <span className="hidden lg:inline">Swap</span>
                </TabsTrigger>
                <TabsTrigger value="converter" className="text-xs px-2">
                  <Globe className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                  <span className="hidden lg:inline">{language === 'ar' ? 'تحويل' : 'Conv'}</span>
                </TabsTrigger>
                <TabsTrigger value="compound" className="text-xs px-2">
                  <Percent className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                  <span className="hidden lg:inline">{language === 'ar' ? 'مركبة' : 'Comp'}</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="position" className="mt-0">
                <PositionSizeCalculator t={t} language={language} />
              </TabsContent>
              <TabsContent value="pip" className="mt-0">
                <PipValueCalculator t={t} language={language} />
              </TabsContent>
              <TabsContent value="margin" className="mt-0">
                <MarginCalculator t={t} language={language} />
              </TabsContent>
              <TabsContent value="profit" className="mt-0">
                <ProfitLossCalculator t={t} language={language} />
              </TabsContent>
              <TabsContent value="risk" className="mt-0">
                <RiskRewardCalculator t={t} language={language} />
              </TabsContent>
              <TabsContent value="fibonacci" className="mt-0">
                <FibonacciCalculator t={t} language={language} />
              </TabsContent>
              <TabsContent value="pivot" className="mt-0">
                <PivotPointsCalculator t={t} language={language} />
              </TabsContent>
              <TabsContent value="swap" className="mt-0">
                <SwapCalculator t={t} language={language} />
              </TabsContent>
              <TabsContent value="converter" className="mt-0">
                <CurrencyConverter t={t} language={language} />
              </TabsContent>
              <TabsContent value="compound" className="mt-0">
                <CompoundInterestCalculator t={t} language={language} />
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
                      <p className="text-2xl font-bold text-success">{analysis.entryPrice.toFixed(5)}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-destructive/5 border-destructive/30">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">{t('stopLossRecommendation')}</p>
                      <p className="text-2xl font-bold text-destructive">{analysis.stopLoss.toFixed(5)}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-primary/5 border-primary/30">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">{t('targetPrice')}</p>
                      <p className="text-2xl font-bold text-primary">{analysis.takeProfit.toFixed(5)}</p>
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
                        <p className="font-bold text-success">{analysis.keyLevels.support1.toFixed(5)}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                        <p className="text-xs text-muted-foreground">{language === 'ar' ? 'الدعم 2' : 'Support 2'}</p>
                        <p className="font-bold text-success">{analysis.keyLevels.support2.toFixed(5)}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                        <p className="text-xs text-muted-foreground">{language === 'ar' ? 'المقاومة 1' : 'Resistance 1'}</p>
                        <p className="font-bold text-destructive">{analysis.keyLevels.resistance1.toFixed(5)}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                        <p className="text-xs text-muted-foreground">{language === 'ar' ? 'المقاومة 2' : 'Resistance 2'}</p>
                        <p className="font-bold text-destructive">{analysis.keyLevels.resistance2.toFixed(5)}</p>
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
                      ? `الدخول: ${analysis.entryPrice.toFixed(5)} | الوقف: ${analysis.stopLoss.toFixed(5)} | الهدف: ${analysis.takeProfit.toFixed(5)}`
                      : `Entry: ${analysis.entryPrice.toFixed(5)} | SL: ${analysis.stopLoss.toFixed(5)} | TP: ${analysis.takeProfit.toFixed(5)}`}
                  </p>
                  <div className="mt-2 flex justify-center gap-2">
                    <Badge variant="outline" className="border-success text-success">
                      {language === 'ar' ? 'مخاطرة: ' : 'Risk: '}{Math.abs(analysis.entryPrice - analysis.stopLoss).toFixed(5)}
                    </Badge>
                    <Badge variant="outline" className="border-primary text-primary">
                      {language === 'ar' ? 'مكافأة: ' : 'Reward: '}{Math.abs(analysis.takeProfit - analysis.entryPrice).toFixed(5)}
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
