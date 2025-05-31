
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useFormatters } from '@/hooks/useFormatters';
import { useCards } from '@/hooks/useCards';
import { useCardExpenses } from '@/hooks/useCardExpenses';
import { useInvestments } from '@/hooks/useInvestments';
import { useSavingsGoals } from '@/hooks/useSavingsGoals';
import { useVehicles } from '@/hooks/useVehicles';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, PiggyBank, CreditCard, Car, FileSpreadsheet } from 'lucide-react';
import ExpensesDueSoonCard from '@/components/ExpensesDueSoonCard';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Dashboard = () => {
  const formatters = useFormatters();
  const { 
    monthlyData, 
    totalIncome, 
    totalExpenses, 
    loading 
  } = useDashboardData();
  
  const { cards } = useCards();
  const { cardExpenses } = useCardExpenses();
  const { investments } = useInvestments();
  const { savingsGoals } = useSavingsGoals();
  const { vehicles } = useVehicles();

  // Calcular valores dos novos cards
  const totalInvestments = investments.reduce((sum, inv) => sum + (inv.current_price * inv.quantity), 0);
  const totalSavings = savingsGoals.reduce((sum, goal) => sum + goal.current_amount, 0);
  const totalCards = cards.length;
  const totalVehicles = vehicles.reduce((sum, vehicle) => sum + vehicle.total_amount, 0);

  // Calcular despesas de cartão do mês atual
  const currentMonth = format(new Date(), 'yyyy-MM');
  const currentMonthCardExpenses = cardExpenses
    .filter(expense => expense.billing_month.startsWith(currentMonth))
    .reduce((sum, expense) => sum + expense.amount, 0);

  const currentBalance = totalIncome - totalExpenses - currentMonthCardExpenses;
  const totalPatrimony = totalInvestments + totalSavings + totalVehicles + currentBalance;

  if (loading) {
    return (
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Visão geral das suas finanças</p>
      </div>

      {/* New Cards Row - Investments, Savings, Cards, Vehicles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800 text-white border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Investimentos</p>
                <p className="text-2xl font-bold text-green-400">
                  {formatters.currencyCompact(totalInvestments)}
                </p>
                <p className="text-xs text-gray-400">{investments.length} ativos</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 text-white border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Reservas/Metas</p>
                <p className="text-2xl font-bold text-blue-400">
                  {formatters.currencyCompact(totalSavings)}
                </p>
                <p className="text-xs text-gray-400">{savingsGoals.length} metas</p>
              </div>
              <PiggyBank className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 text-white border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Cartões</p>
                <p className="text-2xl font-bold text-orange-400">{totalCards}</p>
                <p className="text-xs text-gray-400">cartões cadastrados</p>
              </div>
              <CreditCard className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 text-white border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Veículos</p>
                <p className="text-2xl font-bold text-purple-400">
                  {formatters.currencyCompact(totalVehicles)}
                </p>
                <p className="text-xs text-gray-400">{vehicles.length} veículos</p>
              </div>
              <Car className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary Row */}
      <Card className="bg-gray-800 text-white border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <FileSpreadsheet className="h-5 w-5 text-green-400" />
            Resumo Financeiro - {format(new Date(), 'MMM/yyyy', { locale: ptBR })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-300">Receitas</p>
              <p className="text-2xl font-bold text-green-400">
                {formatters.currency(totalIncome)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-300">Despesas</p>
              <p className="text-2xl font-bold text-red-400">
                {formatters.currency(totalExpenses + currentMonthCardExpenses)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-300">Saldo do Mês</p>
              <p className={`text-2xl font-bold ${currentBalance >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                {formatters.currency(currentBalance)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-300">Patrimônio Líquido</p>
              <p className="text-2xl font-bold text-purple-400">
                {formatters.currency(totalPatrimony)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Original Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">Receita Total</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatters.currency(totalIncome)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">Despesa Total</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatters.currency(totalExpenses)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">Saldo</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatters.currency(totalIncome - totalExpenses)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">% Sobra</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {totalIncome > 0 ? formatters.percentage(((totalIncome - totalExpenses) / totalIncome) * 100) : '0%'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Expenses Due Soon */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Monthly Cash Flow Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Fluxo de Caixa Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => formatters.currency(value)} />
                  <Tooltip 
                    formatter={(value: number) => [formatters.currency(value), '']}
                    labelFormatter={(label) => `Mês: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="income" fill="#10b981" name="Receitas" />
                  <Bar dataKey="expenses" fill="#ef4444" name="Despesas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Expenses Due Soon Card */}
        <div className="space-y-6">
          <ExpensesDueSoonCard />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
