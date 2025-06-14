
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, TrendingDown } from 'lucide-react';
import { useFormatters } from '@/hooks/useFormatters';

interface CashExpensesSummaryProps {
  monthlyTotal: number;
  expenseCount: number;
}

const CashExpensesSummary = ({ monthlyTotal, expenseCount }: CashExpensesSummaryProps) => {
  const formatters = useFormatters();

  // Determine color based on value (negative = green, positive = red)
  const getTotalColorClass = (value: number) => {
    return value < 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Total do Mês</p>
              <p className={`text-2xl font-bold ${getTotalColorClass(monthlyTotal)}`}>
                {formatters.currency(monthlyTotal)}
              </p>
            </div>
            <Wallet className="h-8 w-8 text-red-500" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Despesas do Mês</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{expenseCount}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-orange-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CashExpensesSummary;
