
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { useFormatters } from '@/hooks/useFormatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CardExpense } from '@/hooks/useCardExpenses';
import CrudActions from '@/components/CrudActions';

interface ExpenseDetailsTableProps {
  expenses: CardExpense[];
  selectedCard: any;
  selectedMonth: Date;
  onViewExpense: (expense: any) => void;
  onEditExpense: (expense: any) => void;
  onDeleteExpense: (expenseId: string) => void;
}

const ExpenseDetailsTable = ({ 
  expenses, 
  selectedCard, 
  selectedMonth,
  onViewExpense,
  onEditExpense,
  onDeleteExpense
}: ExpenseDetailsTableProps) => {
  const formatters = useFormatters();

  // Não retornar null quando selectedCard for null - mostrar para "Todos"
  if (!selectedCard && expenses.length === 0) return null;

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Despesas Detalhadas - {selectedCard?.name || 'Todos os Cartões'} ({format(selectedMonth, 'MMMM/yyyy', { locale: ptBR })})
        </CardTitle>
        <p className="text-sm text-gray-400 mt-1">
          {expenses.length} compra{expenses.length !== 1 ? 's' : ''} nestas despesas
          {selectedCard?.closing_date && selectedCard.closing_date !== 'Variável' && (
            <> • Fechamento dia {selectedCard.closing_date}</>
          )}
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 text-gray-400 font-medium">Data da Compra</th>
                <th className="text-left py-3 text-gray-400 font-medium">Descrição</th>
                <th className="text-left py-3 text-gray-400 font-medium">Valor da Parcela</th>
                <th className="text-center py-3 text-gray-400 font-medium">Parcela</th>
                <th className="text-left py-3 text-gray-400 font-medium">Despesas</th>
                <th className="text-center py-3 text-gray-400 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className="border-b border-gray-700/50">
                  <td className="py-3">
                    <div>
                      <p className="text-sm">{formatters.date(expense.purchase_date)}</p>
                      <p className="text-xs text-gray-400">Compra original</p>
                    </div>
                  </td>
                  <td className="py-3">
                    <div>
                      <p className="text-sm font-medium">{expense.description}</p>
                      {expense.is_installment && (
                        <p className="text-xs text-blue-400">Parcelamento em {expense.installments}x</p>
                      )}
                    </div>
                  </td>
                  <td className="py-3">
                    <div>
                      <p className="text-sm font-medium">{formatters.currency(expense.amount)}</p>
                      <p className="text-xs text-gray-400">Parcela atual</p>
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      {expense.current_installment || 1}/{expense.installments || 1}
                    </span>
                  </td>
                  <td className="py-3">
                    <div>
                      <p className="text-sm">{format(new Date(expense.billing_month), 'MMM/yyyy', { locale: ptBR })}</p>
                      <p className="text-xs text-gray-400">Despesas atuais</p>
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    <CrudActions
                      item={expense}
                      onView={onViewExpense}
                      onEdit={onEditExpense}
                      onDelete={() => onDeleteExpense(expense.id)}
                      showView={true}
                      showEdit={true}
                      showDelete={true}
                      deleteTitle="Confirmar exclusão"
                      deleteDescription="Esta parcela será permanentemente removida."
                      size="sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 p-4 bg-gray-700/50 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-400">Total das Despesas ({format(selectedMonth, 'MMMM/yyyy', { locale: ptBR })}):</p>
              <p className="text-xs text-gray-500">Soma das parcelas do período atual</p>
            </div>
            <p className="text-2xl font-bold">{formatters.currency(
              expenses.reduce((sum, expense) => sum + expense.amount, 0)
            )}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseDetailsTable;
