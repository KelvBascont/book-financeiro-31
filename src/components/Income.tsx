
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useFormatters } from '@/hooks/useFormatters';
import { Plus, DollarSign, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFinancial } from '@/contexts/FinancialContext';
import { useAuth } from '@/contexts/AuthContext';
import { Income as IncomeType } from '@/hooks/useSupabaseData';

const Income = () => {
  const formatters = useFormatters();
  const { toast } = useToast();
  const { user } = useAuth();
  const { 
    getIncomesForMonth, 
    selectedMonth,
    addIncome, 
    deleteIncome,
    loading
  } = useFinancial();
  
  const [newIncome, setNewIncome] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    type: 'salary' as IncomeType['type'],
    is_recurring: false,
    recurrence_months: '1'
  });

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p>Por favor, faça login para gerenciar suas receitas.</p>
      </div>
    );
  }

  const handleAddIncome = async () => {
    if (!newIncome.description || !newIncome.amount) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    await addIncome({
      description: newIncome.description,
      amount: parseFloat(newIncome.amount),
      date: newIncome.date,
      type: newIncome.type,
      is_recurring: newIncome.is_recurring,
      recurrence_months: newIncome.is_recurring ? parseInt(newIncome.recurrence_months) : undefined
    });

    setNewIncome({ 
      description: '', 
      amount: '', 
      date: new Date().toISOString().split('T')[0], 
      type: 'salary',
      is_recurring: false,
      recurrence_months: '1'
    });
  };

  const monthIncomes = getIncomesForMonth(selectedMonth);
  const totalIncomes = monthIncomes.reduce((sum, income) => sum + Number(income.amount), 0);

  const getTypeLabel = (type: IncomeType['type']) => {
    const labels = {
      salary: 'Salário',
      bonus: 'Bônus',
      investment: 'Investimento',
      other: 'Outros'
    };
    return labels[type];
  };

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
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Receitas</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Gerencie suas fontes de renda - {formatters.dateMonthYear(selectedMonth)}
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
              onChange={(e) => setNewIncome({...newIncome, type: e.target.value as IncomeType['type']})}
            >
              <option value="salary">Salário</option>
              <option value="bonus">Bônus</option>
              <option value="investment">Investimento</option>
              <option value="other">Outros</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recurring-income"
                checked={newIncome.is_recurring}
                onCheckedChange={(checked) => setNewIncome({...newIncome, is_recurring: !!checked})}
              />
              <label htmlFor="recurring-income" className="text-sm">Receita recorrente?</label>
            </div>
            
            {newIncome.is_recurring && (
              <div className="flex items-center space-x-2">
                <label className="text-sm">Por quantos meses:</label>
                <Input
                  type="number"
                  min="1"
                  max="24"
                  className="w-20"
                  value={newIncome.recurrence_months}
                  onChange={(e) => setNewIncome({...newIncome, recurrence_months: e.target.value})}
                />
              </div>
            )}
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
              Receitas do Mês
            </div>
            <div className="text-xl font-bold text-green-600">
              Total: {formatters.currency(totalIncomes)}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {monthIncomes.map((income) => (
              <div key={income.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{income.description}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {getTypeLabel(income.type)} • {formatters.date(income.date)}
                    {income.is_recurring && (
                      <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs">
                        Recorrente
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-green-600">
                    {formatters.currency(Number(income.amount))}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteIncome(income.id)}
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
