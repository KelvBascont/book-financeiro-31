import { useState, useMemo } from 'react';
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
import DateRangeFilter from '@/components/DateRangeFilter';
import MonthChipsFilter from '@/components/MonthChipsFilter';
import { format, isWithinInterval, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Dashboard = () => {
  const formatters = useFormatters();
  const [dateFilter, setDateFilter] = useState<{ start: string; end: string } | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  
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

  // Filtered data based on date range
  const filteredData = useMemo(() => {
    if (!dateFilter) {
      return {
        monthlyData,
        totalIncome,
        totalExpenses,
        cardExpenses,
        investments,
        savingsGoals,
        vehicles
      };
    }

    const startDate = parse(dateFilter.start, 'yyyy-MM', new Date());
    const endDate = parse(dateFilter.end, 'yyyy-MM', new Date());
    endDate.setMonth(endDate.getMonth() + 1, 0); // Last day of end month

    // Filter monthly data
    const filteredMonthlyData = monthlyData.filter(data => {
      const monthDate = parse(data.month, 'MMM yyyy', new Date());
      return isWithinInterval(monthDate, { start: startDate, end: endDate });
    });

    // Filter card expenses
    const filteredCardExpenses = cardExpenses.filter(expense => {
      const expenseDate = new Date(expense.billing_month);
      return isWithinInterval(expenseDate, { start: startDate, end: endDate });
    });

    return {
      monthlyData: filteredMonthlyData,
      totalIncome: filteredMonthlyData.reduce((sum, data) => sum + data.income, 0),
      totalExpenses: filteredMonthlyData.reduce((sum, data) => sum + data.expenses, 0),
      cardExpenses: filteredCardExpenses,
      investments,
      savingsGoals,
      vehicles
    };
  }, [dateFilter, monthlyData, totalIncome, totalExpenses, cardExpenses, investments, savingsGoals, vehicles]);

  // Calculate values from filtered data
  const totalInvestments = filteredData.investments.reduce((sum, inv) => sum + (inv.current_price * inv.quantity), 0);
  const totalSavings = filteredData.savingsGoals.reduce((sum, goal) => sum + goal.current_amount, 0);
  const totalCards = cards.length;
  const totalVehicles = filteredData.vehicles.reduce((sum, vehicle) => sum + vehicle.total_amount, 0);

  // Calculate card expenses for current month or filtered period
  const currentMonth = format(new Date(), 'yyyy-MM');
  const currentMonthCardExpenses = filteredData.cardExpenses
    .filter(expense => expense.billing_month.startsWith(currentMonth))
    .reduce((sum, expense) => sum + expense.amount, 0);

  const currentBalance = filteredData.totalIncome - filteredData.totalExpenses - currentMonthCardExpenses;
  const totalPatrimony = totalInvestments + totalSavings + totalVehicles + currentBalance;

  const handleFilterChange = (startDate: string, endDate: string) => {
    setDateFilter({ start: startDate, end: endDate });
  };

  const handleClearFilter = () => {
    setDateFilter(null);
  };

  const handleMonthChange = (month: Date) => {
    setSelectedMonth(month);
    // Clear date range filter when using month chips
    setDateFilter(null);
  };

  if (loading) {
    return (
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Visão geral das suas finanças</p>
            </div>
            <DateRangeFilter
              onFilterChange={handleFilterChange}
              onClearFilter={handleClearFilter}
              isActive={!!dateFilter}
            />
          </div>
          
          {/* Month Chips Filter */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <MonthChipsFilter
              selectedMonth={selectedMonth}
              onMonthChange={handleMonthChange}
            />
          </div>
        </div>
      </div>

      {/* New Cards Row - Investments, Savings, Cards, Vehicles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Investimentos</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatters.currencyCompact(totalInvestments)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{filteredData.investments.length} ativos</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Reservas/Metas</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatters.currencyCompact(totalSavings)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{filteredData.savingsGoals.length} metas</p>
              </div>
              <PiggyBank className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Cartões</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{totalCards}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">cartões cadastrados</p>
              </div>
              <CreditCard className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Veículos</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatters.currencyCompact(totalVehicles)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{filteredData.vehicles.length} veículos</p>
              </div>
              <Car className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary Row */}
      <Card className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <FileSpreadsheet className="h-5 w-5 text-green-600 dark:text-green-400" />
            Resumo Financeiro - {dateFilter ? `${dateFilter.start} a ${dateFilter.end}` : format(selectedMonth, 'MMM/yyyy', { locale: ptBR })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <p className="text-sm text-gray-600 dark:text-gray-300">Receitas</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatters.currency(filteredData.totalIncome)}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <p className="text-sm text-gray-600 dark:text-gray-300">Despesas em Dinheiro</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatters.currency(filteredData.totalExpenses)}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <p className="text-sm text-gray-600 dark:text-gray-300">Despesas com Cartão</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {formatters.currency(currentMonthCardExpenses)}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <p className="text-sm text-gray-600 dark:text-gray-300">Saldo do Período</p>
              <p className={`text-2xl font-bold ${currentBalance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatters.currency(currentBalance)}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <p className="text-sm text-gray-600 dark:text-gray-300">Patrimônio Líquido</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatters.currency(totalPatrimony)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts and Expenses Due Soon */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Monthly Cash Flow Chart */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Fluxo de Caixa Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={filteredData.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-600" />
                  <XAxis dataKey="month" stroke="#6b7280" className="dark:stroke-gray-300" />
                  <YAxis tickFormatter={(value) => formatters.currency(value)} stroke="#6b7280" className="dark:stroke-gray-300" />
                  <Tooltip 
                    formatter={(value: number) => [formatters.currency(value), '']}
                    labelFormatter={(label) => `Mês: ${label}`}
                    contentStyle={{
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--foreground)'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="income" fill="#16a34a" name="Receitas" />
                  <Bar dataKey="expenses" fill="#dc2626" name="Despesas" />
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
