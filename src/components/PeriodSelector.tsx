
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, ChevronDown } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

interface PeriodSelectorProps {
  onPeriodChange: (startDate: string, endDate: string) => void;
  onClearFilter: () => void;
  isActive: boolean;
}

const PeriodSelector = ({ onPeriodChange, onClearFilter, isActive }: PeriodSelectorProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState('');

  const getCurrentMonth = () => {
    const now = new Date();
    return {
      start: format(startOfMonth(now), 'yyyy-MM'),
      end: format(endOfMonth(now), 'yyyy-MM')
    };
  };

  const getLastThreeMonths = () => {
    const now = new Date();
    const threeMonthsAgo = subMonths(now, 2);
    return {
      start: format(startOfMonth(threeMonthsAgo), 'yyyy-MM'),
      end: format(endOfMonth(now), 'yyyy-MM')
    };
  };

  const getLastSixMonths = () => {
    const now = new Date();
    const sixMonthsAgo = subMonths(now, 5);
    return {
      start: format(startOfMonth(sixMonthsAgo), 'yyyy-MM'),
      end: format(endOfMonth(now), 'yyyy-MM')
    };
  };

  const getLastYear = () => {
    const now = new Date();
    const oneYearAgo = subMonths(now, 11);
    return {
      start: format(startOfMonth(oneYearAgo), 'yyyy-MM'),
      end: format(endOfMonth(now), 'yyyy-MM')
    };
  };

  const handlePeriodSelect = (value: string) => {
    setSelectedPeriod(value);
    
    let period;
    switch (value) {
      case 'current':
        period = getCurrentMonth();
        break;
      case 'last3':
        period = getLastThreeMonths();
        break;
      case 'last6':
        period = getLastSixMonths();
        break;
      case 'last12':
        period = getLastYear();
        break;
      case 'clear':
        onClearFilter();
        setSelectedPeriod('');
        return;
      default:
        return;
    }
    
    onPeriodChange(period.start, period.end);
  };

  const getDisplayText = () => {
    if (!isActive || !selectedPeriod) return "Selecionar Período";
    
    switch (selectedPeriod) {
      case 'current':
        return "Mês Atual";
      case 'last3':
        return "Últimos 3 Meses";
      case 'last6':
        return "Últimos 6 Meses";
      case 'last12':
        return "Últimos 12 Meses";
      default:
        return "Período Personalizado";
    }
  };

  return (
    <Select value={selectedPeriod} onValueChange={handlePeriodSelect}>
      <SelectTrigger asChild>
        <Button 
          variant={isActive ? "default" : "outline"} 
          className={`
            relative group transition-all duration-300 ease-in-out
            ${isActive 
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg' 
              : 'hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600'
            }
            rounded-lg px-4 py-2.5 font-medium w-full sm:w-auto
          `}
        >
          <Calendar className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
          <span className="truncate max-w-40">{getDisplayText()}</span>
          <ChevronDown className="h-4 w-4 ml-2 transition-transform duration-200" />
          {isActive && (
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-amber-400 rounded-full animate-pulse shadow-sm" />
          )}
        </Button>
      </SelectTrigger>
      <SelectContent className="w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl">
        <SelectItem value="current" className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span>Mês Atual</span>
          </div>
        </SelectItem>
        <SelectItem value="last3" className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-green-600" />
            <span>Últimos 3 Meses</span>
          </div>
        </SelectItem>
        <SelectItem value="last6" className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-orange-600" />
            <span>Últimos 6 Meses</span>
          </div>
        </SelectItem>
        <SelectItem value="last12" className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-purple-600" />
            <span>Últimos 12 Meses</span>
          </div>
        </SelectItem>
        <SelectItem value="clear" className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 text-red-600 dark:text-red-400">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Limpar Filtro</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

export default PeriodSelector;
