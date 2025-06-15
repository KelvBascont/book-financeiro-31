import { useState, useMemo } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useFinancialCalculations } from '@/hooks/useFinancialCalculations';
import { useCards } from '@/hooks/useCards';
import { useInvestments } from '@/hooks/useInvestments';
import { useSavingsGoals } from '@/hooks/useSavingsGoals';
import { useVehicles } from '@/hooks/useVehicles';
import { format, isWithinInterval, parse } from 'date-fns';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import AssetsSummaryCards from '@/components/dashboard/AssetsSummaryCards';
import FinancialSummaryCard from '@/components/dashboard/FinancialSummaryCard';
import ChartsSection from '@/components/dashboard/ChartsSection';
import AdvancedInsightsCard from '@/components/dashboard/AdvancedInsightsCard';
import CashFlowPredictionsCard from '@/components/dashboard/CashFlowPredictionsCard';
import IntelligentAlertsCard from '@/components/dashboard/IntelligentAlertsCard';

const Dashboard = () => {
  const [dateFilter, setDateFilter] = useState<{ start: string; end: string } | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  
  const { monthlyData, loading } = useDashboardData();
  const { financialSummary } = useFinancialCalculations(selectedMonth);
  const { cards } = useCards();
  const { investments } = useInvestments();
  const { savingsGoals } = useSavingsGoals();
  const { vehicles } = useVehicles();

  // Filtered data based on date range
  const filteredData = useMemo(() => {
    if (!dateFilter) {
      return {
        monthlyData,
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

    return {
      monthlyData: filteredMonthlyData,
      investments,
      savingsGoals,
      vehicles
    };
  }, [dateFilter, monthlyData, investments, savingsGoals, vehicles]);

  // Calculate asset totals
  const assetTotals = useMemo(() => ({
    totalInvestments: filteredData.investments.reduce((sum, inv) => sum + (inv.current_price * inv.quantity), 0),
    totalSavings: filteredData.savingsGoals.reduce((sum, goal) => sum + goal.current_amount, 0),
    totalCards: cards.length,
    totalVehicles: filteredData.vehicles.reduce((sum, vehicle) => sum + vehicle.total_amount, 0),
    investmentsCount: filteredData.investments.length,
    savingsCount: filteredData.savingsGoals.length,
    vehiclesCount: filteredData.vehicles.length
  }), [filteredData, cards.length]);

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
    <div className="p-3 sm:p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Cabeçalho */}
      <DashboardHeader
        dateFilter={dateFilter}
        selectedMonth={selectedMonth}
        onFilterChange={handleFilterChange}
        onClearFilter={handleClearFilter}
        onMonthChange={handleMonthChange}
      />

      {/* Cards de Resumo de Ativos */}
      <AssetsSummaryCards {...assetTotals} />

      {/* Resumo Financeiro */}
      <FinancialSummaryCard
        financialSummaryData={financialSummary}
        dateFilter={dateFilter}
        selectedMonth={selectedMonth}
      />

      {/* Seção de Insights e Análises Inteligentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Insights Inteligentes - Card principal */}
        <div className="lg:col-span-2">
          <AdvancedInsightsCard />
        </div>
        
        {/* Alertas Inteligentes */}
        <div>
          <IntelligentAlertsCard />
        </div>
      </div>

      {/* Previsões de Fluxo de Caixa */}
      <div className="grid grid-cols-1">
        <CashFlowPredictionsCard />
      </div>

      {/* Gráficos e Análises */}
      <ChartsSection monthlyData={filteredData.monthlyData} />
    </div>
  );
};

export default Dashboard;
