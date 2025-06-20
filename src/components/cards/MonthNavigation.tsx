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
  const nextMonth = addMonths(selectedMonth, 1);
  return <div className="flex justify-between items-center w-full">
      {/* Seção Esquerda - Navegação do Mês */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onPreviousMonth} className="border-gray-600 text-white hover:bg-gray-800">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {/* <h2 className="text-lg font-semibold min-w-[120px] text-center">
          {format(selectedMonth, 'MMMM/yyyy', {
          locale: ptBR
         })}
         </h2> */}
        <Button variant="outline" size="sm" onClick={onNextMonth} className="border-gray-600 text-white hover:bg-gray-800">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Seção Central - Fatura */}
      <div className="flex flex-col items-center">
        <p className="text-sm text-gray-400">Fatura referente ao mês de
      </p>
        <p className="font-bold text-orange-400 text-4xl">
          {format(nextMonth, 'MMMM', {
          locale: ptBR
        })}
        </p>
      </div>
      
      {/* Seção Direita - Total */}
      <div className="flex flex-col items-end">
        <p className="text-sm text-gray-400">Total do Mês</p>
        <p className="text-xl font-bold text-orange-400">{formatters.currency(totalInBills)}</p>
        <p className="text-gray-400 text-xs font-bold">Soma das Faturas</p>
      </div>
    </div>;
};
export default MonthNavigation;