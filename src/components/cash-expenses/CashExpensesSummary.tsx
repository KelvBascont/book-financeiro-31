
import { Card, CardContent } from '@/components/ui/card';
import { TrendingDown, Receipt } from 'lucide-react';
import { useFormatters } from '@/hooks/useFormatters';

interface CashExpensesSummaryProps {
  monthlyTotal: number;
  expenseCount: number;
  isFiltered?: boolean;
}

const CashExpensesSummary = ({ monthlyTotal, expenseCount, isFiltered }: CashExpensesSummaryProps) => {
  const formatters = useFormatters();

  const getTotalColorClass = (value: number) => {
    return value > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {isFiltered ? 'Total do Período' : 'Total do Mês'}
              </p>
              <p className={`text-2xl font-bold ${getTotalColorClass(monthlyTotal)}`}>
                {formatters.currency(monthlyTotal)}
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Qtd. Despesas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {expenseCount}
              </p>
            </div>
            <Receipt className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CashExpensesSummary;
