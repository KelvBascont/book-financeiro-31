
import { useState, useMemo } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useCards } from '@/hooks/useCards';
import { useCardExpenses } from '@/hooks/useCardExpenses';
import { useInvestments } from '@/hooks/useInvestments';
import { useSavingsGoals } from '@/hooks/useSavingsGoals';
import { useVehicles } from '@/hooks/useVehicles';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useRecurrenceFilter } from '@/hooks/useRecurrenceFilter';
import { format, isWithinInterval, parse, addMonths } from 'date-fns';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import AssetsSummaryCards from '@/components/dashboard/AssetsSummaryCards';
import FinancialSummaryCard from '@/components/dashboard/FinancialSummaryCard';
import ChartsSection from '@/components/dashboard/ChartsSection';

const Dashboard = () => {
  const [dateFilter, setDateFilter] = useState<{ start: string; end: string } | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  
  const { 
    monthlyData, 
    loading 
  } = useDashboardData();
  
  const { cards } = useCards();
  const { cardExpenses } = useCardExpenses();
  const { investments } = useInvestments();
  const { savingsGoals } = useSavingsGoals();
  const { vehicles } = useVehicles();
  const { cashExpenses, incomes } = useSupabaseData();
  const { calculateTotalForMonth } = useRecurrenceFilter();

  // Calculate financial summary data using the same logic as FinancialSpreadsheet
  const financialSummaryData = useMemo(() => {
    const monthString = format(selectedMonth, 'MM/yyyy');
    
    // Use recurring logic for incomes and cash expenses
    const totalIncomes = calculateTotalForMonth(incomes, monthString);
    const totalCashExpenses = calculateTotalForMonth(cashExpenses, monthString);
    
    // Calculate card expenses for selected month using real data
    // Os gastos do cartão aparecem +1 mês após o mês de cobrança
    const previousMonth = addMonths(selectedMonth, -1);
    const previousMonthString = format(previousMonth, 'MM/yyyy');
    
    const totalCardExpenses = cardExpenses
      .filter(expense => {
        const expenseMonth = format(new Date(expense.billing_month), 'MM/yyyy');
        return expenseMonth === previousMonthString;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    const currentBalance = totalIncomes - totalCashExpenses - totalCardExpenses;
    
    return {
      totalIncome: totalIncomes,
      totalExpenses: totalCashExpenses,
      currentMonthCardExpenses: totalCardExpenses,
      currentBalance
    };
  }, [selectedMonth, incomes, cashExpenses, cardExpenses, calculateTotalForMonth]);

  // Filtered data based on date range
  const filteredData = useMemo(() => {
    if (!dateFilter) {
      return {
        monthlyData,
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
      cardExpenses: filteredCardExpenses,
      investments,
      savingsGoals,
      vehicles
    };
  }, [dateFilter, monthlyData, cardExpenses, investments, savingsGoals, vehicles]);

  // Calculate values from filtered data
  const totalInvestments = filteredData.investments.reduce((sum, inv) => sum + (inv.current_price * inv.quantity), 0);
  const totalSavings = filteredData.savingsGoals.reduce((sum, goal) => sum + goal.current_amount, 0);
  const totalCards = cards.length;
  const totalVehicles = filteredData.vehicles.reduce((sum, vehicle) => sum + vehicle.total_amount, 0);

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
      <DashboardHeader
        dateFilter={dateFilter}
        selectedMonth={selectedMonth}
        onFilterChange={handleFilterChange}
        onClearFilter={handleClearFilter}
        onMonthChange={handleMonthChange}
      />

      {/* Assets Summary Cards */}
      <AssetsSummaryCards
        totalInvestments={totalInvestments}
        totalSavings={totalSavings}
        totalCards={totalCards}
        totalVehicles={totalVehicles}
        investmentsCount={filteredData.investments.length}
        savingsCount={filteredData.savingsGoals.length}
        vehiclesCount={filteredData.vehicles.length}
      />

      {/* Financial Summary Card */}
      <FinancialSummaryCard
        financialSummaryData={financialSummaryData}
        dateFilter={dateFilter}
        selectedMonth={selectedMonth}
      />

      {/* Charts and Expenses Due Soon */}
      <ChartsSection monthlyData={filteredData.monthlyData} />
    </div>
  );
};

export default Dashboard;
