
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt } from 'lucide-react';
import { useFormatters } from '@/hooks/useFormatters';
import IntegratedExpenseRow from '@/components/IntegratedExpenseRow';

interface IntegratedExpensesTableProps {
  expenses: any[];
  monthlyTotal: number;
  selectedMonth: string;
  onUpdateOccurrence: (transactionId: string, occurrenceIndex: number, newAmount: number) => Promise<void>;
  onDeleteExpense: (id: string) => Promise<void>;
  onEditExpense: (expense: any) => void;
}

const IntegratedExpensesTable = ({ 
  expenses, 
  monthlyTotal, 
  selectedMonth, 
  onUpdateOccurrence, 
  onDeleteExpense,
  onEditExpense 
}: IntegratedExpensesTableProps) => {
  const formatters = useFormatters();

  // Helper function to format month display
  const formatMonthDisplay = (monthString: string) => {
    const [month, year] = monthString.split('/');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return formatters.dateMonthYear(date);
  };

  // Determine color based on value (negative = red for expenses)
  const getTotalColorClass = (value: number) => {
    return value < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Despesas Correntes - {formatMonthDisplay(selectedMonth)}
          </CardTitle>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-300">Total do Mês</p>
            <p className={`text-xl font-bold ${getTotalColorClass(monthlyTotal)}`}>
              {formatters.currency(Math.abs(monthlyTotal))}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Nenhuma despesa encontrada para {formatMonthDisplay(selectedMonth)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-2">Descrição</th>
                  <th className="text-left py-3 px-2">Valor</th>
                  <th className="text-left py-3 px-2">Data</th>
                  <th className="text-left py-3 px-2">Vencimento</th>
                  <th className="text-center py-3 px-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <IntegratedExpenseRow
                    key={`${expense.source}-${expense.id}-${expense.occurrenceIndex || 0}`}
                    expense={expense}
                    onUpdateOccurrence={onUpdateOccurrence}
                    onDeleteExpense={onDeleteExpense}
                    onEditExpense={onEditExpense}
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

export default IntegratedExpensesTable;
