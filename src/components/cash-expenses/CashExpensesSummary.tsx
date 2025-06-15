
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, TrendingDown } from 'lucide-react';
import { useFormatters } from '@/hooks/useFormatters';
import { getBalanceColorClass } from '@/utils/styleHelpers';

interface CashExpensesSummaryProps {
  monthlyTotal: number;
  expenseCount: number;
}

const CashExpensesSummary = ({ monthlyTotal, expenseCount }: CashExpensesSummaryProps) => {
  const formatters = useFormatters();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Total do Mês</p>
              <p className={`text-2xl font-bold ${getBalanceColorClass(monthlyTotal)}`}>
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
