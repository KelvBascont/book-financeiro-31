
import DashboardFilters from './DashboardFilters';

interface DashboardHeaderProps {
  dateFilter: { start: string; end: string } | null;
  selectedMonth: Date;
  onFilterChange: (startDate: string, endDate: string) => void;
  onClearFilter: () => void;
  onMonthChange: (month: Date) => void;
}

const DashboardHeader = ({
  selectedMonth,
  onMonthChange
}: DashboardHeaderProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Visão geral das suas finanças</p>
        </div>
        
        <div className="flex items-center gap-4">
          <DashboardFilters
            selectedMonth={selectedMonth}
            onMonthChange={onMonthChange}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
