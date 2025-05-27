
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFormatters } from '@/hooks/useFormatters';
import { Plus, Receipt, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CashExpense {
  id: string;
  description: string;
  amount: number;
  date: string;
}

const CashExpenses = () => {
  const formatters = useFormatters();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<CashExpense[]>([
    { id: '1', description: 'Conta de Luz', amount: 150.50, date: '2024-01-15' },
    { id: '2', description: 'Conta de Água', amount: 85.30, date: '2024-01-10' },
    { id: '3', description: 'Condomínio', amount: 450.00, date: '2024-01-05' },
  ]);
  
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleAddExpense = () => {
    if (!newExpense.description || !newExpense.amount) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const expense: CashExpense = {
      id: Date.now().toString(),
      description: newExpense.description,
      amount: parseFloat(newExpense.amount),
      date: newExpense.date
    };

    setExpenses([...expenses, expense]);
    setNewExpense({ description: '', amount: '', date: new Date().toISOString().split('T')[0] });
    
    toast({
      title: "Sucesso",
      description: "Despesa adicionada com sucesso"
    });
  };

  const handleRemoveExpense = (id: string) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
    toast({
      title: "Removido",
      description: "Despesa removida com sucesso"
    });
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="p-3 sm:p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Despesas à Vista</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Gerencie despesas pagas fora do cartão de crédito
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <Input
              type="date"
              value={newExpense.date}
              onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
            />
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
              Despesas Registradas
            </div>
            <div className="text-xl font-bold text-red-600">
              Total: {formatters.currency(totalExpenses)}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{expense.description}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {formatters.date(expense.date)}
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
