
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DateRangeFilterProps {
  onFilterChange: (startDate: string, endDate: string) => void;
  onClearFilter: () => void;
  isActive: boolean;
}

const DateRangeFilter = ({ onFilterChange, onClearFilter, isActive }: DateRangeFilterProps) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const handlePreviousMonth = () => {
    const newMonth = subMonths(selectedMonth, 1);
    setSelectedMonth(newMonth);
    const monthStr = format(newMonth, 'yyyy-MM');
    onFilterChange(monthStr, monthStr);
  };

  const handleNextMonth = () => {
    const newMonth = addMonths(selectedMonth, 1);
    setSelectedMonth(newMonth);
    const monthStr = format(newMonth, 'yyyy-MM');
    onFilterChange(monthStr, monthStr);
  };

  const handleCurrentMonth = () => {
    const currentMonth = new Date();
    setSelectedMonth(currentMonth);
    onClearFilter();
  };

  return (
    <div className="flex items-center gap-4">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handlePreviousMonth}
        className="border-gray-600 text-white hover:bg-gray-800"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <button 
        onClick={handleCurrentMonth}
        className="text-xl font-semibold min-w-[150px] text-center text-white hover:text-gray-300 transition-colors"
      >
        {format(selectedMonth, 'MMMM/yyyy', { locale: ptBR })}
      </button>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleNextMonth}
        className="border-gray-600 text-white hover:bg-gray-800"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default DateRangeFilter;
