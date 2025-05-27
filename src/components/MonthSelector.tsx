
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFormatters } from '@/hooks/useFormatters';
import { useFinancial } from '@/contexts/FinancialContext';

const MonthSelector = () => {
  const formatters = useFormatters();
  const { selectedMonth, setSelectedMonth } = useFinancial();

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

  const handleMonthChange = (value: string) => {
    const selectedDate = new Date(value);
    setSelectedMonth(selectedDate);
  };

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Mês de Referência:
      </label>
      <Select
        value={selectedMonth.toISOString().slice(0, 7)}
        onValueChange={handleMonthChange}
      >
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {months.map((month) => (
            <SelectItem 
              key={month.toISOString().slice(0, 7)} 
              value={month.toISOString().slice(0, 7)}
            >
              {formatters.dateMonthYear(month)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default MonthSelector;
