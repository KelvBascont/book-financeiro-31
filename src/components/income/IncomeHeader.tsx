import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PlusCircle, Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface IncomeHeaderProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  onAddIncome: () => void;
}

const IncomeHeader = ({ selectedMonth, onMonthChange, onAddIncome }: IncomeHeaderProps) => {
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

  // Funções para navegar entre os meses
  const onPreviousMonth = () => {
    const currentDate = getDateFromMonthString(selectedMonth);
    const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const previousMonthString = getMonthStringFromDate(previousMonth);
    onMonthChange(previousMonthString);
  };

  const onNextMonth = () => {
    const currentDate = getDateFromMonthString(selectedMonth);
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    const nextMonthString = getMonthStringFromDate(nextMonth);
    onMonthChange(nextMonthString);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Receitas</h2>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Gerencie suas receitas mensais</p>
      </div>
      <div className="flex items-center gap-4">
      {/* Botões de navegação de mês */}
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onPreviousMonth} 
          className="
            border-gray-300 dark:border-gray-600 
            text-gray-800 dark:text-white 
            hover:bg-gray-100 dark:hover:bg-gray-800
            transition-colors
          "
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onNextMonth} 
          className="
            border-gray-300 dark:border-gray-600 
            text-gray-800 dark:text-white 
            hover:bg-gray-100 dark:hover:bg-gray-800
            transition-colors
          "
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

        {/* Dropdown de seleção de mês */}
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
        <Button onClick={onAddIncome} className="w-full sm:w-auto">
          <PlusCircle className="h-4 w-4 mr-2" />
          Nova Receita
        </Button>
      </div>
    </div>
  );
};

export default IncomeHeader;