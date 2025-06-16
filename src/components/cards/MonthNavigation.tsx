import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths } from 'date-fns'; // Importe addMonths
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
  
  // Calcula o próximo mês (mês da fatura)
  const nextMonth = addMonths(selectedMonth, 1);

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onPreviousMonth} className="border-gray-600 text-white hover:bg-gray-800">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold min-w-[150px] text-center">
          {format(selectedMonth, 'MMMM/yyyy', {
            locale: ptBR
          })}
        </h2>
        <Button variant="outline" size="sm" onClick={onNextMonth} className="border-gray-600 text-white hover:bg-gray-800">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Nova seção central para mostrar a fatura */}
      <div className="text-center">
        <p className="text-lg font-semibold">
          Fatura - {format(nextMonth, 'MMMM', { locale: ptBR })}
        </p>
      </div>
      
      <div className="text-right">
        <p className="text-gray-400">Total do Mês</p>
        <p className="text-2xl font-bold text-orange-400">{formatters.currency(totalInBills)}</p>
        <p className="text-sm text-gray-400">Soma das Despesas</p>
      </div>
    </div>
  );
};

export default MonthNavigation;