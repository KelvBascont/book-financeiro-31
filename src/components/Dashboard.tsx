
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Menu, DollarSign, CreditCard, Target, TrendingUp, PiggyBank, Receipt } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
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
import FinancialSpreadsheet from '@/components/FinancialSpreadsheet';
import { useFinancial } from '@/contexts/FinancialContext';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useCardExpenses } from '@/hooks/useCardExpenses';
import { useInvestments } from '@/hooks/useInvestments';
import { useSupabaseTables } from '@/hooks/useSupabaseTables';
import { useFilterRecurringTransactions } from '@/hooks/useFilterRecurringTransactions';
import { useFormatters } from '@/hooks/useFormatters';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showWelcome, setShowWelcome] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  
  const { selectedMonth } = useFinancial();
  const { cashExpenses, incomes } = useSupabaseData();
  const { cardExpenses } = useCardExpenses();
  const { investments } = useInvestments();
  const { vehicles, savingsGoals } = useSupabaseTables();
  const { calculateRecurringTotal } = useFilterRecurringTransactions();
  const formatters = useFormatters();

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
      case 'spreadsheet':
        return <FinancialSpreadsheet />;
      default:
        return <DashboardContent />;
    }
  };

  const DashboardContent = () => {
    // Calcular totais usando nova lógica de recorrência
    const totalIncomes = calculateRecurringTotal(incomes, selectedMonth);
    const totalExpenses = calculateRecurringTotal(cashExpenses, selectedMonth);
    
    // Calcular total de investimentos
    const totalInvestments = investments.reduce((sum, inv) => {
      return sum + (inv.quantity * inv.current_price);
    }, 0);
    
    // Calcular total de metas de poupança
    const totalSavings = savingsGoals.reduce((sum, goal) => sum + goal.current_amount, 0);
    
    // Calcular valor total dos veículos (valor do bem, não financiamento) - CORRIGIDO
    const totalVehicleValue = vehicles.reduce((sum, vehicle) => sum + vehicle.total_amountii, 0);

    // Calcular gastos de cartão para o mês selecionado
    const cardExpensesForMonth = cardExpenses.filter(expense => {
      const expenseDate = new Date(expense.billing_month);
      return expenseDate.getMonth() === selectedMonth.getMonth() && 
             expenseDate.getFullYear() === selectedMonth.getFullYear();
    }).reduce((sum, expense) => sum + expense.amount, 0);

    const balance = totalIncomes - totalExpenses;

    // Patrimônio líquido = Investimentos + Poupanças + Valor dos veículos - CORRIGIDO
    const netWorth = totalInvestments + totalSavings + totalVehicleValue;

    // Dados para gráfico de pizza - Distribuição de gastos
    const expenseData = [
      {
        name: 'Despesas Correntes',
        value: totalExpenses,
        color: '#ef4444'
      },
      {
        name: 'Cartões',
        value: cardExpensesForMonth,
        color: '#f97316'
      }
    ].filter(item => item.value > 0);

    // Dados para gráfico de barras - Receita vs Despesas
    const barData = [
      {
        name: 'Receitas',
        value: totalIncomes,
        fill: '#22c55e'
      },
      {
        name: 'Despesas',
        value: totalExpenses + cardExpensesForMonth,
        fill: '#ef4444'
      }
    ];

    return (
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Dashboard Financeiro</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Visão geral das suas finanças (com recorrência corrigida)</p>
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
                  {formatters.currency(totalExpenses + cardExpensesForMonth)}
                </p>
              </div>
              
              <div className={`text-center p-4 rounded-lg ${
                (balance - cardExpensesForMonth) >= 0 
                  ? 'bg-blue-50 dark:bg-blue-900/20' 
                  : 'bg-red-50 dark:bg-red-900/20'
              }`}>
                <p className={`text-sm font-medium ${
                  (balance - cardExpensesForMonth) >= 0 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  Saldo do Mês
                </p>
                <p className={`text-xl sm:text-2xl font-bold ${
                  (balance - cardExpensesForMonth) >= 0 
                    ? 'text-blue-700 dark:text-blue-300' 
                    : 'text-red-700 dark:text-red-300'
                }`}>
                  {formatters.currency(balance - cardExpensesForMonth)}
                </p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Patrimônio Líquido</p>
                <p className="text-xl sm:text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {formatters.currency(netWorth)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Pizza - Distribuição de Gastos */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Gastos - {formatters.dateMonthYear(selectedMonth)}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${formatters.currency(value)}`}
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatters.currency(Number(value))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              {expenseData.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma despesa registrada para este mês
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gráfico de Barras - Receita vs Despesas */}
          <Card>
            <CardHeader>
              <CardTitle>Receitas vs Despesas - {formatters.dateMonthYear(selectedMonth)}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => formatters.currencyCompact(value)} />
                  <Tooltip formatter={(value) => formatters.currency(Number(value))} />
                  <Bar dataKey="value" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

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
              <div className="text-2xl font-bold">{formatters.currencyCompact(totalVehicleValue)}</div>
              <p className="text-xs text-muted-foreground">{vehicles.length} veículos</p>
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
