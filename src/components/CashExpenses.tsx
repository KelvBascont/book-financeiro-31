
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useFormatters } from '@/hooks/useFormatters';
import { Plus, Receipt, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFinancial } from '@/contexts/FinancialContext';

const CashExpenses = () => {
  const formatters = useFormatters();
  const { toast } = useToast();
  const { cashExpenses, setCashExpenses, selectedMonth, getCashExpensesForMonth } = useFinancial();
  
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    isRecurring: false,
    recurrenceMonths: '1'
  });

  const handleAddExpense = () => {
    if (!newExpense.description || !newExpense.amount || !newExpense.dueDate) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const expense = {
      id: Date.now().toString(),
      description: newExpense.description,
      amount: parseFloat(newExpense.amount),
      date: newExpense.date,
      dueDate: newExpense.dueDate,
      isRecurring: newExpense.isRecurring,
      recurrenceMonths: newExpense.isRecurring ? parseInt(newExpense.recurrenceMonths) : undefined
    };

    setCashExpenses([...cashExpenses, expense]);
    setNewExpense({ 
      description: '', 
      amount: '', 
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      isRecurring: false,
      recurrenceMonths: '1'
    });
    
    toast({
      title: "Sucesso",
      description: `Despesa adicionada${newExpense.isRecurring ? ` com recorrência de ${newExpense.recurrenceMonths} meses` : ''}`
    });
  };

  const handleRemoveExpense = (id: string) => {
    setCashExpenses(cashExpenses.filter(expense => expense.id !== id));
    toast({
      title: "Removido",
      description: "Despesa removida com sucesso"
    });
  };

  const monthExpenses = getCashExpensesForMonth(selectedMonth);
  const totalExpenses = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="p-3 sm:p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Despesas à Vista</h2>
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
                value={newExpense.dueDate}
                onChange={(e) => setNewExpense({...newExpense, dueDate: e.target.value})}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recurring"
                checked={newExpense.isRecurring}
                onCheckedChange={(checked) => setNewExpense({...newExpense, isRecurring: !!checked})}
              />
              <label htmlFor="recurring" className="text-sm">Despesa recorrente?</label>
            </div>
            
            {newExpense.isRecurring && (
              <div className="flex items-center space-x-2">
                <label className="text-sm">Por quantos meses:</label>
                <Input
                  type="number"
                  min="1"
                  max="24"
                  className="w-20"
                  value={newExpense.recurrenceMonths}
                  onChange={(e) => setNewExpense({...newExpense, recurrenceMonths: e.target.value})}
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
                    Vencimento: {formatters.date(expense.dueDate)}
                    {expense.isRecurring && (
                      <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                        Recorrente
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-red-600">
                    {formatters.currency(expense.amount)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveExpense(expense.id)}
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
