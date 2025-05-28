
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Menu, X, DollarSign, CreditCard, Target, TrendingUp, PiggyBank, Receipt } from 'lucide-react';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import MonthSelector from '@/components/MonthSelector';
import WelcomeScreen from '@/components/WelcomeScreen';
import Income from '@/components/Income';
import CashExpenses from '@/components/CashExpenses';
import Cards from '@/components/Cards';
import Savings from '@/components/Savings';
import Vehicles from '@/components/Vehicles';
import Investments from '@/components/Investments';
import { useFinancial } from '@/contexts/FinancialContext';
import { useSupabaseTables } from '@/hooks/useSupabaseTables';
import { useAssetUpdater } from '@/hooks/useAssetUpdater';
import { useFormatters } from '@/hooks/useFormatters';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showWelcome, setShowWelcome] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  
  const { selectedMonth, getTotalIncomes, getTotalCashExpenses, getBalance } = useFinancial();
  const { cards, investments, vehicles, savingsGoals } = useSupabaseTables();
  const formatters = useFormatters();

  // Ativar atualizador de ativos
  useAssetUpdater({
    enabled: activeTab === 'investments' || activeTab === 'dashboard',
    interval: 30000
  });

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('finance_app_welcome_seen');
    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }
  }, []);

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const shouldShowSidebar = activeTab === 'dashboard' || sidebarVisible || sidebarHovered;

  const renderContent = () => {
    switch (activeTab) {
      case 'income':
        return <Income />;
      case 'cash-expenses':
        return <CashExpenses />;
      case 'cards':
        return <Cards />;
      case 'savings':
        return <Savings />;
      case 'vehicles':
        return <Vehicles />;
      case 'investments':
        return <Investments />;
      default:
        return <DashboardContent />;
    }
  };

  const DashboardContent = () => {
    // Calcular totais para o mês selecionado
    const totalIncomes = getTotalIncomes(selectedMonth);
    const totalExpenses = getTotalCashExpenses(selectedMonth);
    const balance = getBalance(selectedMonth);
    
    // Calcular total de investimentos
    const totalInvestments = investments.reduce((sum, inv) => {
      return sum + (inv.quantity * inv.current_price);
    }, 0);
    
    // Calcular total de metas de poupança
    const totalSavings = savingsGoals.reduce((sum, goal) => sum + goal.current_amount, 0);
    
    // Calcular total de financiamentos de veículos
    const totalVehicleFinancing = vehicles.reduce((sum, vehicle) => sum + vehicle.total_amount, 0);

    return (
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Dashboard Financeiro</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Visão geral das suas finanças</p>
          </div>
          <MonthSelector />
        </div>

        {/* Resumo Financeiro para o mês selecionado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Resumo Financeiro - {formatters.dateMonthYear(selectedMonth)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">Receitas</p>
                <p className="text-xl sm:text-2xl font-bold text-green-700 dark:text-green-300">
                  {formatters.currency(totalIncomes)}
                </p>
              </div>
              
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">Despesas</p>
                <p className="text-xl sm:text-2xl font-bold text-red-700 dark:text-red-300">
                  {formatters.currency(totalExpenses)}
                </p>
              </div>
              
              <div className={`text-center p-4 rounded-lg ${
                balance >= 0 
                  ? 'bg-blue-50 dark:bg-blue-900/20' 
                  : 'bg-red-50 dark:bg-red-900/20'
              }`}>
                <p className={`text-sm font-medium ${
                  balance >= 0 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  Saldo do Mês
                </p>
                <p className={`text-xl sm:text-2xl font-bold ${
                  balance >= 0 
                    ? 'text-blue-700 dark:text-blue-300' 
                    : 'text-red-700 dark:text-red-300'
                }`}>
                  {formatters.currency(Math.abs(balance))}
                </p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Patrimônio</p>
                <p className="text-xl sm:text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {formatters.currency(totalInvestments + totalSavings)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cards de Visão Geral */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('investments')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Investimentos</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatters.currencyCompact(totalInvestments)}</div>
              <p className="text-xs text-muted-foreground">{investments.length} ativos</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('savings')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reservas/Metas</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatters.currencyCompact(totalSavings)}</div>
              <p className="text-xs text-muted-foreground">{savingsGoals.length} metas</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('cards')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cartões</CardTitle>
              <CreditCard className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cards.length}</div>
              <p className="text-xs text-muted-foreground">cartões cadastrados</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('vehicles')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Veículos</CardTitle>
              <PiggyBank className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatters.currencyCompact(totalVehicleFinancing)}</div>
              <p className="text-xs text-muted-foreground">{vehicles.length} financiamentos</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  if (showWelcome) {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />;
  }

  return (
    <div className="min-h-screen flex w-full bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
          shouldShowSidebar ? 'translate-x-0' : '-translate-x-full'
        }`}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        <Navigation 
          activeTab={activeTab} 
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (window.innerWidth < 1024) {
              setSidebarVisible(false);
            }
          }}
          isVisible={shouldShowSidebar}
        />
      </div>

      {/* Overlay para mobile */}
      {sidebarVisible && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarVisible(false)}
        />
      )}

      {/* Botão flutuante para mostrar sidebar */}
      {!shouldShowSidebar && (
        <Button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 lg:hidden"
          size="sm"
          variant="outline"
        >
          <Menu className="h-4 w-4" />
        </Button>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onToggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
