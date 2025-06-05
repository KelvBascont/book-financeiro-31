
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Calendar } from 'lucide-react';
import { useFormatters } from '@/hooks/useFormatters';
import { useSupabaseTables, CardExpense } from '@/hooks/useSupabaseTables';
import EditableExpenseCell from './EditableExpenseCell';
import CrudActions from './CrudActions';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CardExpenseDetailsProps {
  cardId: string;
  cardName: string;
  currentMonth?: Date;
}

const CardExpenseDetails = ({ cardId, cardName, currentMonth = new Date() }: CardExpenseDetailsProps) => {
  const formatters = useFormatters();
  const { cardExpenses, updateCardExpense, deleteCardExpense } = useSupabaseTables();
  const [editingExpense, setEditingExpense] = useState<string | null>(null);

  // Filtrar despesas do cartão no mês atual
  const currentMonthStr = format(currentMonth, 'yyyy-MM');
  const filteredExpenses = cardExpenses.filter(expense => 
    expense.card_id === cardId && 
    expense.billing_month.startsWith(currentMonthStr)
  );

  const handleUpdateExpense = async (expenseId: string, newAmount: number) => {
    await updateCardExpense(expenseId, { amount: newAmount });
    setEditingExpense(null);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    await deleteCardExpense(expenseId);
  };

  const getInstallmentInfo = (expense: CardExpense) => {
    if (!expense.is_installment) {
      return 'À vista';
    }
    return `${expense.current_installment}/${expense.installments}`;
  };

  const currentMonthName = format(currentMonth, 'MMMM/yyyy', { locale: ptBR });

  if (filteredExpenses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Despesas Detalhadas - {cardName} ({currentMonthName})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Nenhuma despesa encontrada para este cartão em {currentMonthName}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              As despesas com fatura deste mês aparecerão aqui
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Despesas Detalhadas - {cardName} ({currentMonthName})
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          {filteredExpenses.length} compra{filteredExpenses.length !== 1 ? 's' : ''} nesta fatura
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data da Compra</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Parcela</TableHead>
                <TableHead>Fatura</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    <div className="font-medium">
                      {formatters.date(expense.purchase_date)}
                    </div>
                    {expense.is_installment && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Compra original
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{expense.description}</div>
                    {expense.is_installment && (
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        Parcelado em {expense.installments}x
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <EditableExpenseCell
                      value={expense.amount}
                      isEditing={editingExpense === expense.id}
                      onSave={(newValue) => handleUpdateExpense(expense.id, newValue)}
                      onCancel={() => setEditingExpense(null)}
                    />
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      expense.is_installment 
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                        : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    }`}>
                      {getInstallmentInfo(expense)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {formatters.dateMonthYear(new Date(expense.billing_month))}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Fatura atual
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingExpense(expense.id)}
                        disabled={editingExpense === expense.id}
                        className="h-8 w-8 p-0"
                        aria-label="Editar compra"
                        title="Editar esta compra"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <CrudActions
                        item={expense}
                        onDelete={() => handleDeleteExpense(expense.id)}
                        showEdit={false}
                        showView={false}
                        deleteTitle="Confirmar exclusão"
                        deleteDescription="Esta compra será permanentemente removida de todas as faturas."
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Total da Fatura ({currentMonthName}):
            </span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {formatters.currency(filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0))}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CardExpenseDetails;
