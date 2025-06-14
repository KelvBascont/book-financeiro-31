
import { Badge } from '@/components/ui/badge';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MonthChipsFilterProps {
  selectedMonth: Date;
  onMonthChange: (month: Date) => void;
}

const MonthChipsFilter = ({ selectedMonth, onMonthChange }: MonthChipsFilterProps) => {
  const generateMonths = () => {
    const months = [];
    const currentDate = new Date();
    
    // Gera 7 meses: 3 anteriores, atual e 3 posteriores
    for (let i = -3; i <= 3; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      months.push(date);
    }
    
    return months;
  };

  const months = generateMonths();
  const currentMonth = new Date();

  const isSelected = (month: Date) => {
    return format(month, 'yyyy-MM') === format(selectedMonth, 'yyyy-MM');
  };

  const isCurrent = (month: Date) => {
    return format(month, 'yyyy-MM') === format(currentMonth, 'yyyy-MM');
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
        Filtrar por mês:
      </span>
      {months.map((month) => {
        const isSelectedMonth = isSelected(month);
        const isCurrentMonth = isCurrent(month);
        
        return (
          <Badge
            key={format(month, 'yyyy-MM')}
            variant={isSelectedMonth ? "default" : "outline"}
            className={`
              cursor-pointer transition-all duration-200 hover:scale-105 
              ${isSelectedMonth 
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }
              ${isCurrentMonth && !isSelectedMonth 
                ? 'ring-2 ring-blue-400 dark:ring-blue-500' 
                : ''
              }
              px-3 py-1.5 text-sm font-medium
            `}
            onClick={() => onMonthChange(month)}
          >
            {format(month, 'MMM/yy', { locale: ptBR })}
            {isCurrentMonth && (
              <span className="ml-1 text-xs opacity-75">•</span>
            )}
          </Badge>
        );
      })}
    </div>
  );
};

export default MonthChipsFilter;
