
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PlusCircle, Calendar, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CashExpensesHeaderProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  onAddExpense: () => void;
}

const CashExpensesHeader = ({ selectedMonth, onMonthChange, onAddExpense }: CashExpensesHeaderProps) => {
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

  // Convert MM/yyyy to Date for dropdown
  const getDateFromMonthString = (monthString: string) => {
    const [month, year] = monthString.split('/');
    return new Date(parseInt(year), parseInt(month) - 1, 1);
  };

  // Convert Date to MM/yyyy string
  const getMonthStringFromDate = (date: Date) => {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return `${month}/${year}`;
  };

  // Get current month string for comparison
  const currentMonthString = getMonthStringFromDate(new Date());

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Despesas Correntes</h2>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Gerencie suas despesas mensais</p>
      </div>
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="min-w-[110px] justify-between bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-blue-500 shadow-md px-3 py-1.5"
            >
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">
                  {format(getDateFromMonthString(selectedMonth), 'MMM/yyyy', { locale: ptBR })}
                </span>
              </div>
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-48 max-h-64 overflow-y-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          >
            {months.map((month) => {
              const monthString = getMonthStringFromDate(month);
              const isSelected = monthString === selectedMonth;
              const isCurrent = monthString === currentMonthString;
              
              return (
                <DropdownMenuItem
                  key={format(month, 'yyyy-MM')}
                  onClick={() => onMonthChange(monthString)}
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
        <Button onClick={onAddExpense} className="w-full sm:w-auto">
          <PlusCircle className="h-4 w-4 mr-2" />
          Nova Despesa
        </Button>
      </div>
    </div>
  );
};

export default CashExpensesHeader;
