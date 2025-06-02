
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Filter, X } from 'lucide-react';
import { format } from 'date-fns';

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

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant={isActive ? "default" : "outline"} 
          className="relative"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtrar por Período
          {isActive && (
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 rounded-full" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-900 dark:text-white">
              Filtrar por Período
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-month" className="text-gray-700 dark:text-gray-300">
                  Mês Inicial
                </Label>
                <Input
                  id="start-month"
                  type="month"
                  value={startMonth}
                  onChange={(e) => setStartMonth(e.target.value)}
                  max={getCurrentMonth()}
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
              </div>
              <div>
                <Label htmlFor="end-month" className="text-gray-700 dark:text-gray-300">
                  Mês Final
                </Label>
                <Input
                  id="end-month"
                  type="month"
                  value={endMonth}
                  onChange={(e) => setEndMonth(e.target.value)}
                  min={startMonth}
                  max={getCurrentMonth()}
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
              </div>
            </div>
            <div className="flex justify-between gap-2">
              <Button 
                variant="outline" 
                onClick={handleClearFilter}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Limpar
              </Button>
              <Button 
                onClick={handleApplyFilter} 
                disabled={!startMonth || !endMonth}
                className="flex-1"
              >
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
