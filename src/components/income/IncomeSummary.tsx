
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { useFormatters } from '@/hooks/useFormatters';

interface IncomeSummaryProps {
  monthlyTotal: number;
  incomeCount: number;
}

const IncomeSummary = ({ monthlyTotal, incomeCount }: IncomeSummaryProps) => {
  const formatters = useFormatters();

  const getTotalColorClass = (value: number) => {
    return value > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card className="border-0 shadow-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Total do Mês</p>
              <p className={`text-3xl font-bold ${getTotalColorClass(monthlyTotal)} mt-1`}>
                {formatters.currency(monthlyTotal)}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <TrendingUp className="h-7 w-7 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-0 shadow-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Qtd. Receitas</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {incomeCount}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <TrendingUp className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IncomeSummary;
