
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFormatters } from '@/hooks/useFormatters';
import { Plus, DollarSign, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Income {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'salary' | 'bonus' | 'investment' | 'other';
}

const Income = () => {
  const formatters = useFormatters();
  const { toast } = useToast();
  const [incomes, setIncomes] = useState<Income[]>([
    { id: '1', description: 'Salário', amount: 5000.00, date: '2024-01-01', type: 'salary' },
    { id: '2', description: 'Freelance', amount: 800.00, date: '2024-01-15', type: 'other' },
  ]);
  
  const [newIncome, setNewIncome] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    type: 'salary' as Income['type']
  });

  const handleAddIncome = () => {
    if (!newIncome.description || !newIncome.amount) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const income: Income = {
      id: Date.now().toString(),
      description: newIncome.description,
      amount: parseFloat(newIncome.amount),
      date: newIncome.date,
      type: newIncome.type
    };

    setIncomes([...incomes, income]);
    setNewIncome({ 
      description: '', 
      amount: '', 
      date: new Date().toISOString().split('T')[0], 
      type: 'salary' 
    });
    
    toast({
      title: "Sucesso",
      description: "Receita adicionada com sucesso"
    });
  };

  const handleRemoveIncome = (id: string) => {
    setIncomes(incomes.filter(income => income.id !== id));
    toast({
      title: "Removido",
      description: "Receita removida com sucesso"
    });
  };

  const totalIncomes = incomes.reduce((sum, income) => sum + income.amount, 0);

  const getTypeLabel = (type: Income['type']) => {
    const labels = {
      salary: 'Salário',
      bonus: 'Bônus',
      investment: 'Investimento',
      other: 'Outros'
    };
    return labels[type];
  };

  return (
    <div className="p-3 sm:p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Receitas</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Gerencie suas fontes de renda
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-green-600" />
            Adicionar Nova Receita
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Input
              placeholder="Descrição da receita"
              value={newIncome.description}
              onChange={(e) => setNewIncome({...newIncome, description: e.target.value})}
            />
            <Input
              type="number"
              step="0.01"
              placeholder="Valor"
              value={newIncome.amount}
              onChange={(e) => setNewIncome({...newIncome, amount: e.target.value})}
            />
            <Input
              type="date"
              value={newIncome.date}
              onChange={(e) => setNewIncome({...newIncome, date: e.target.value})}
            />
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={newIncome.type}
              onChange={(e) => setNewIncome({...newIncome, type: e.target.value as Income['type']})}
            >
              <option value="salary">Salário</option>
              <option value="bonus">Bônus</option>
              <option value="investment">Investimento</option>
              <option value="other">Outros</option>
            </select>
          </div>
          <Button onClick={handleAddIncome} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Receita
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Receitas Registradas
            </div>
            <div className="text-xl font-bold text-green-600">
              Total: {formatters.currency(totalIncomes)}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {incomes.map((income) => (
              <div key={income.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{income.description}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {getTypeLabel(income.type)} • {formatters.date(income.date)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-green-600">
                    {formatters.currency(income.amount)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveIncome(income.id)}
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

export default Income;
