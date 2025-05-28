
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useFormatters } from '@/hooks/useFormatters';
import { Plus, Receipt, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFinancial } from '@/contexts/FinancialContext';
import { useAuth } from '@/contexts/AuthContext';

const CashExpenses = () => {
  const formatters = useFormatters();
  const { toast } = useToast();
  const { user } = useAuth();
  const { 
    selectedMonth, 
    getCashExpensesForMonth, 
    addCashExpense, 
    deleteCashExpense,
    loading
  } = useFinancial();
  
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    due_date: new Date().toISOString().split('T')[0],
    is_recurring: false,
    recurrence_months: '1'
  });

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p>Por favor, faça login para gerenciar suas despesas.</p>
      </div>
    );
  }

  const handleAddExpense = async () => {
    if (!newExpense.description || !newExpense.amount || !newExpense.due_date) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    await addCashExpense({
      description: newExpense.description,
      amount: parseFloat(newExpense.amount),
      date: newExpense.date,
      due_date: newExpense.due_date,
      is_recurring: newExpense.is_recurring,
      recurrence_months: newExpense.is_recurring ? parseInt(newExpense.recurrence_months) : undefined
    });

    setNewExpense({ 
      description: '', 
      amount: '', 
      date: new Date().toISOString().split('T')[0],
      due_date: new Date().toISOString().split('T')[0],
      is_recurring: false,
      recurrence_months: '1'
    });
  };

  const monthExpenses = getCashExpensesForMonth(selectedMonth);
  const totalExpenses = monthExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Despesas Correntes</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Gerencie despesas pagas fora do cartão de crédito - {formatters.dateMonthYear(selectedMonth)}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-blue-600" />
            Adicionar Nova Despesa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              placeholder="Descrição da despesa"
              value={newExpense.description}
              onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
            />
            <Input
              type="number"
              step="0.01"
              placeholder="Valor"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
            />
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300">Data de Criação</label>
              <Input
                type="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300">Data de Vencimento</label>
              <Input
                type="date"
                value={newExpense.due_date}
                onChange={(e) => setNewExpense({...newExpense, due_date: e.target.value})}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recurring"
                checked={newExpense.is_recurring}
                onCheckedChange={(checked) => setNewExpense({...newExpense, is_recurring: !!checked})}
              />
              <label htmlFor="recurring" className="text-sm">Despesa recorrente?</label>
            </div>
            
            {newExpense.is_recurring && (
              <div className="flex items-center space-x-2">
                <label className="text-sm">Por quantos meses:</label>
                <Input
                  type="number"
                  min="1"
                  max="24"
                  className="w-20"
                  value={newExpense.recurrence_months}
                  onChange={(e) => setNewExpense({...newExpense, recurrence_months: e.target.value})}
                />
              </div>
            )}
          </div>
          
          <Button onClick={handleAddExpense} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Despesa
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-green-600" />
              Despesas do Mês
            </div>
            <div className="text-xl font-bold text-red-600">
              Total: {formatters.currency(totalExpenses)}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {monthExpenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{expense.description}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Vencimento: {formatters.date(expense.due_date)}
                    {expense.is_recurring && (
                      <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                        Recorrente
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-red-600">
                    {formatters.currency(Number(expense.amount))}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteCashExpense(expense.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CashExpenses;
