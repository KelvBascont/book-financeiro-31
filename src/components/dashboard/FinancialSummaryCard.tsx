
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileSpreadsheet } from 'lucide-react';
import { useFormatters } from '@/hooks/useFormatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FinancialSummaryData {
  totalIncome: number;
  totalExpenses: number;
  currentMonthCardExpenses: number;
  currentBalance: number;
}

interface FinancialSummaryCardProps {
  financialSummaryData: FinancialSummaryData;
  dateFilter: { start: string; end: string } | null;
  selectedMonth: Date;
}

const FinancialSummaryCard = ({
  financialSummaryData,
  dateFilter,
  selectedMonth
}: FinancialSummaryCardProps) => {
  const formatters = useFormatters();

  return (
    <Card className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <FileSpreadsheet className="h-5 w-5 text-green-600 dark:text-green-400" />
          Resumo Financeiro - {dateFilter ? `${dateFilter.start} a ${dateFilter.end}` : format(selectedMonth, 'MMM/yyyy', { locale: ptBR })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-600 dark:text-gray-300">Receitas</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatters.currency(financialSummaryData.totalIncome)}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-600 dark:text-gray-300">Despesas em Dinheiro</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatters.currency(financialSummaryData.totalExpenses)}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-600 dark:text-gray-300">Despesas com Cartão</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {formatters.currency(financialSummaryData.currentMonthCardExpenses)}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-600 dark:text-gray-300">Saldo do Período</p>
            <p className={`text-2xl font-bold ${financialSummaryData.currentBalance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatters.currency(financialSummaryData.currentBalance)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialSummaryCard;
