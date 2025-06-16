import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useFormatters } from '@/hooks/useFormatters';

interface MonthNavigationProps {
  selectedMonth: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  totalInBills: number;
}

const MonthNavigation = ({
  selectedMonth,
  onPreviousMonth,
  onNextMonth,
  totalInBills
}: MonthNavigationProps) => {
  const formatters = useFormatters();
  
  // Calcular o mês da fatura (mês selecionado + 1)
  const billMonth = addMonths(selectedMonth, 1);
  const billMonthName = format(billMonth, 'MMMM', { locale: ptBR });
  // Capitalizar a primeira letra
  const capitalizedBillMonth = billMonthName.charAt(0).toUpperCase() + billMonthName.slice(1);

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onPreviousMonth} 
          className="border-gray-600 text-white hover:bg-gray-800"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="text-center min-w-[200px]">
          <h2 className="text-xl font-semibold">
            {format(selectedMonth, 'MMMM/yyyy', {
              locale: ptBR
            })}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Fatura - {capitalizedBillMonth}
          </p>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onNextMonth} 
          className="border-gray-600 text-white hover:bg-gray-800"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="text-right">
        <p className="text-gray-400">Total do Mês</p>
        <p className="text-2xl font-bold text-orange-400">
          {formatters.currency(totalInBills)}
        </p>
        <p className="text-sm text-gray-400">Soma das Despesas</p>
      </div>
    </div>
  );
};

export default MonthNavigation;