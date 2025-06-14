
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import DateRangeFilter from '@/components/DateRangeFilter';
import MonthChipsFilter from '@/components/MonthChipsFilter';

interface DashboardHeaderProps {
  dateFilter: { start: string; end: string } | null;
  selectedMonth: Date;
  onFilterChange: (startDate: string, endDate: string) => void;
  onClearFilter: () => void;
  onMonthChange: (month: Date) => void;
}

const DashboardHeader = ({
  dateFilter,
  selectedMonth,
  onFilterChange,
  onClearFilter,
  onMonthChange
}: DashboardHeaderProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Visão geral das suas finanças</p>
          </div>
          <DateRangeFilter
            onFilterChange={onFilterChange}
            onClearFilter={onClearFilter}
            isActive={!!dateFilter}
          />
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <MonthChipsFilter
            selectedMonth={selectedMonth}
            onMonthChange={onMonthChange}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
