
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronDown, Calendar } from 'lucide-react';
import DateRangeFilter from '@/components/DateRangeFilter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

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
  const generateMonths = () => {
    const months = [];
    const currentDate = new Date();
    
    // Gera 12 meses: 6 anteriores, atual e 5 posteriores
    for (let i = -6; i <= 5; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      months.push(date);
    }
    
    return months;
  };

  const months = generateMonths();

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Visão geral das suas finanças</p>
        </div>
        
        <div className="flex items-center gap-4">
          <DateRangeFilter
            onFilterChange={onFilterChange}
            onClearFilter={onClearFilter}
            isActive={!!dateFilter}
          />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="min-w-[140px] justify-between bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {format(selectedMonth, 'MMM/yyyy', { locale: ptBR })}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-48 max-h-64 overflow-y-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            >
              {months.map((month) => {
                const isSelected = format(month, 'yyyy-MM') === format(selectedMonth, 'yyyy-MM');
                const isCurrent = format(month, 'yyyy-MM') === format(new Date(), 'yyyy-MM');
                
                return (
                  <DropdownMenuItem
                    key={format(month, 'yyyy-MM')}
                    onClick={() => onMonthChange(month)}
                    className={`
                      cursor-pointer flex items-center justify-between px-3 py-2
                      ${isSelected 
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <span>{format(month, 'MMM/yyyy', { locale: ptBR })}</span>
                    {isCurrent && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                        Atual
                      </span>
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
