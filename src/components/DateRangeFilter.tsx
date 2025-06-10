
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar, X, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DateRangeFilterProps {
  onFilterChange: (startDate: string, endDate: string) => void;
  onClearFilter: () => void;
  isActive: boolean;
}

const DateRangeFilter = ({ onFilterChange, onClearFilter, isActive }: DateRangeFilterProps) => {
  const [startMonth, setStartMonth] = useState('');
  const [endMonth, setEndMonth] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleApplyFilter = () => {
    if (startMonth && endMonth) {
      onFilterChange(startMonth, endMonth);
      setIsOpen(false);
    }
  };

  const handleClearFilter = () => {
    setStartMonth('');
    setEndMonth('');
    onClearFilter();
    setIsOpen(false);
  };

  const getCurrentMonth = () => {
    return format(new Date(), 'yyyy-MM');
  };

  const getFilterDisplayText = () => {
    if (!isActive || !startMonth || !endMonth) return "Filtrar por Período";
    
    const start = format(new Date(startMonth + '-01'), 'MMM/yyyy', { locale: ptBR });
    const end = format(new Date(endMonth + '-01'), 'MMM/yyyy', { locale: ptBR });
    return `${start} - ${end}`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant={isActive ? "default" : "outline"} 
          className={`
            relative group transition-all duration-300 ease-in-out
            ${isActive 
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg' 
              : 'hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600'
            }
            rounded-lg px-4 py-2.5 font-medium
          `}
        >
          <Calendar className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
          <span className="truncate max-w-40">{getFilterDisplayText()}</span>
          <ChevronDown className={`h-4 w-4 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          {isActive && (
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-amber-400 rounded-full animate-pulse shadow-sm" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-96 p-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl rounded-xl"
        align="end"
      >
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="pb-4 pt-6 px-6">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Selecionar Período
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Escolha o intervalo de datas para filtrar os dados
            </p>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-month" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Período Inicial
                </Label>
                <div className="relative">
                  <Input
                    id="start-month"
                    type="month"
                    value={startMonth}
                    onChange={(e) => setStartMonth(e.target.value)}
                    max={getCurrentMonth()}
                    className="
                      bg-white dark:bg-gray-700 
                      border-gray-300 dark:border-gray-600 
                      focus:border-blue-500 dark:focus:border-blue-400
                      focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20
                      rounded-lg transition-all duration-200
                      text-gray-900 dark:text-white
                    "
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-month" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Período Final
                </Label>
                <div className="relative">
                  <Input
                    id="end-month"
                    type="month"
                    value={endMonth}
                    onChange={(e) => setEndMonth(e.target.value)}
                    min={startMonth}
                    max={getCurrentMonth()}
                    className="
                      bg-white dark:bg-gray-700 
                      border-gray-300 dark:border-gray-600 
                      focus:border-blue-500 dark:focus:border-blue-400
                      focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20
                      rounded-lg transition-all duration-200
                      text-gray-900 dark:text-white
                    "
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-between gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={handleClearFilter}
                className="
                  flex-1 rounded-lg border-gray-300 dark:border-gray-600
                  hover:bg-gray-50 dark:hover:bg-gray-700
                  transition-all duration-200
                "
              >
                <X className="h-4 w-4 mr-2" />
                Limpar
              </Button>
              <Button 
                onClick={handleApplyFilter} 
                disabled={!startMonth || !endMonth}
                className="
                  flex-1 rounded-lg
                  bg-gradient-to-r from-blue-600 to-blue-700 
                  hover:from-blue-700 hover:to-blue-800
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200
                  shadow-md hover:shadow-lg
                "
              >
                <Calendar className="h-4 w-4 mr-2" />
                Aplicar Filtro
              </Button>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default DateRangeFilter;
