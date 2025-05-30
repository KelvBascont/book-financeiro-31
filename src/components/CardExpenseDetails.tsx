
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { useFormatters } from '@/hooks/useFormatters';
import { useSupabaseTables, CardExpense } from '@/hooks/useSupabaseTables';
import EditableExpenseCell from './EditableExpenseCell';
import CrudActions from './CrudActions';

interface CardExpenseDetailsProps {
  cardId: string;
  cardName: string;
}

const CardExpenseDetails = ({ cardId, cardName }: CardExpenseDetailsProps) => {
  const formatters = useFormatters();
  const { cardExpenses, updateCardExpense, deleteCardExpense } = useSupabaseTables();
  const [editingExpense, setEditingExpense] = useState<string | null>(null);

  const filteredExpenses = cardExpenses.filter(expense => expense.card_id === cardId);

  const handleUpdateExpense = async (expenseId: string, newAmount: number) => {
    await updateCardExpense(expenseId, { amount: newAmount });
    setEditingExpense(null);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    await deleteCardExpense(expenseId);
  };

  if (filteredExpenses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Despesas Detalhadas - {cardName}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            Nenhuma despesa encontrada para este cartão
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Despesas Detalhadas - {cardName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Parcelas</TableHead>
                <TableHead>Fatura</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{formatters.date(expense.purchase_date)}</TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>
                    <EditableExpenseCell
                      value={expense.amount}
                      isEditing={editingExpense === expense.id}
                      onSave={(newValue) => handleUpdateExpense(expense.id, newValue)}
                      onCancel={() => setEditingExpense(null)}
                    />
                  </TableCell>
                  <TableCell>
                    {expense.is_installment 
                      ? `${expense.current_installment}/${expense.installments}`
                      : 'À vista'
                    }
                  </TableCell>
                  <TableCell>
                    {formatters.dateMonthYear(new Date(expense.billing_month))}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingExpense(expense.id)}
                        disabled={editingExpense === expense.id}
                        className="h-8 w-8 p-0"
                        aria-label="Editar despesa"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <CrudActions
                        item={expense}
                        onDelete={() => handleDeleteExpense(expense.id)}
                        showEdit={false}
                        showView={false}
                        deleteTitle="Confirmar exclusão"
                        deleteDescription="Esta despesa será permanentemente removida."
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default CardExpenseDetails;
