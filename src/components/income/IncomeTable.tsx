
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { useFormatters } from '@/hooks/useFormatters';
import IntegratedIncomeRow from '@/components/IntegratedIncomeRow';
import type { Income } from '@/hooks/useIncomes';

interface IncomeTableProps {
  filteredIncomes: any[];
  monthlyTotal: number;
  selectedMonth: string;
  onUpdateOccurrence: (transactionId: string, occurrenceIndex: number, newAmount: number) => Promise<void>;
  onDeleteIncome: (id: string) => Promise<void>;
  onEditIncome: (income: Income) => void;
}

const IncomeTable = ({ 
  filteredIncomes, 
  monthlyTotal, 
  selectedMonth, 
  onUpdateOccurrence, 
  onDeleteIncome, 
  onEditIncome 
}: IncomeTableProps) => {
  const formatters = useFormatters();

  const getTotalColorClass = (value: number) => {
    return value > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400';
  };

  const formatMonthDisplay = (monthString: string) => {
    const [month, year] = monthString.split('/');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return formatters.dateMonthYear(date);
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Receitas - {formatMonthDisplay(selectedMonth)}
          </CardTitle>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-300">Total do Mês</p>
            <p className={`text-xl font-bold ${getTotalColorClass(monthlyTotal)}`}>
              {formatters.currency(monthlyTotal)}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredIncomes.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Nenhuma receita encontrada para {formatMonthDisplay(selectedMonth)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-2">Descrição</th>
                  <th className="text-left py-3 px-2">Tipo</th>
                  <th className="text-left py-3 px-2">Valor</th>
                  <th className="text-left py-3 px-2">Data</th>
                  <th className="text-center py-3 px-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredIncomes.map(income => (
                  <IntegratedIncomeRow 
                    key={`${income.id}-${income.occurrenceIndex || 0}`} 
                    income={income} 
                    onUpdateOccurrence={onUpdateOccurrence} 
                    onDeleteIncome={onDeleteIncome} 
                    onEditIncome={onEditIncome} 
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IncomeTable;
