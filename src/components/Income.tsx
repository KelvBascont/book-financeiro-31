
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, DollarSign, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFormatters } from '@/hooks/useFormatters';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import CrudActions from '@/components/CrudActions';
import MonthSelector from '@/components/income/MonthSelector';

const Income = () => {
  const { toast } = useToast();
  const formatters = useFormatters();
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [editingIncome, setEditingIncome] = useState<any>(null);
  const currentMonth = `${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${new Date().getFullYear()}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  
  const {
    incomes,
    addIncome,
    updateIncome,
    deleteIncome,
    loading
  } = useSupabaseData();
  
  const [incomeForm, setIncomeForm] = useState({
    description: '',
    amount: '',
    date: '',
    type: 'salary' as 'salary' | 'bonus' | 'investment' | 'other',
    is_recurring: false,
    recurrence_months: ''
  });

  const handleAddIncome = async () => {
    if (!incomeForm.description || !incomeForm.amount || !incomeForm.date) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    const result = await addIncome({
      description: incomeForm.description,
      amount: parseFloat(incomeForm.amount),
      date: incomeForm.date,
      type: incomeForm.type,
      is_recurring: incomeForm.is_recurring,
      recurrence_months: incomeForm.is_recurring ? parseInt(incomeForm.recurrence_months) : undefined
    });

    if (result) {
      setIncomeForm({ 
        description: '', 
        amount: '', 
        date: '', 
        type: 'salary', 
        is_recurring: false, 
        recurrence_months: '' 
      });
      setShowAddIncome(false);
    }
  };

  const handleEditIncome = (income: any) => {
    setEditingIncome(income);
    setIncomeForm({
      description: income.description,
      amount: income.amount.toString(),
      date: income.date,
      type: income.type,
      is_recurring: income.is_recurring,
      recurrence_months: income.recurrence_months?.toString() || ''
    });
    setShowAddIncome(true);
  };

  const handleUpdateIncome = async () => {
    if (!editingIncome || !incomeForm.description || !incomeForm.amount || !incomeForm.date) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    const result = await updateIncome(editingIncome.id, {
      description: incomeForm.description,
      amount: parseFloat(incomeForm.amount),
      date: incomeForm.date,
      type: incomeForm.type,
      is_recurring: incomeForm.is_recurring,
      recurrence_months: incomeForm.is_recurring ? parseInt(incomeForm.recurrence_months) : undefined
    });

    if (result) {
      setIncomeForm({ 
        description: '', 
        amount: '', 
        date: '', 
        type: 'salary', 
        is_recurring: false, 
        recurrence_months: '' 
      });
      setShowAddIncome(false);
      setEditingIncome(null);
    }
  };

  const handleDeleteIncome = async (id: string) => {
    await deleteIncome(id);
  };

  const getFilteredIncomes = () => {
    const [month, year] = selectedMonth.split('/');
    return incomes.filter(income => {
      const incomeDate = new Date(income.date);
      const incomeMonth = (incomeDate.getMonth() + 1).toString().padStart(2, '0');
      const incomeYear = incomeDate.getFullYear().toString();
      return incomeMonth === month && incomeYear === year;
    });
  };

  const getTotalIncome = () => {
    return getFilteredIncomes().reduce((total, income) => total + income.amount, 0);
  };

  const typeLabels = {
    salary: 'Salário',
    bonus: 'Bônus',
    investment: 'Investimento',
    other: 'Outros'
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  const filteredIncomes = getFilteredIncomes();

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Receitas</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Gerencie suas fontes de renda</p>
        </div>
        <Button onClick={() => setShowAddIncome(!showAddIncome)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nova Receita
        </Button>
      </div>

      {/* Month Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Filtrar por Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <MonthSelector 
            selectedMonth={selectedMonth} 
            onMonthChange={setSelectedMonth} 
          />
        </CardContent>
      </Card>

      {/* Resumo das receitas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Total do Mês</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatters.currency(getTotalIncome())}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Receitas do Mês</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredIncomes.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {showAddIncome && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {editingIncome ? 'Editar Receita' : 'Cadastrar Nova Receita'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="description">Descrição *</Label>
                <Input
                  id="description"
                  placeholder="Ex: Salário, Freelance..."
                  value={incomeForm.description}
                  onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="amount">Valor *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={incomeForm.amount}
                  onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="date">Data *</Label>
                <Input
                  id="date"
                  type="date"
                  value={incomeForm.date}
                  onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="type">Tipo *</Label>
                <Select value={incomeForm.type} onValueChange={(value: any) => setIncomeForm({ ...incomeForm, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salary">Salário</SelectItem>
                    <SelectItem value="bonus">Bônus</SelectItem>
                    <SelectItem value="investment">Investimento</SelectItem>
                    <SelectItem value="other">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="recurring"
                checked={incomeForm.is_recurring}
                onCheckedChange={(checked) => setIncomeForm({ ...incomeForm, is_recurring: checked })}
              />
              <Label htmlFor="recurring">Receita recorrente</Label>
            </div>
            
            {incomeForm.is_recurring && (
              <div className="w-full sm:w-48">
                <Label htmlFor="recurrence">Repetir por quantos meses</Label>
                <Input
                  id="recurrence"
                  type="number"
                  min="1"
                  max="60"
                  placeholder="Ex: 12"
                  value={incomeForm.recurrence_months}
                  onChange={(e) => setIncomeForm({ ...incomeForm, recurrence_months: e.target.value })}
                />
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddIncome(false);
                  setEditingIncome(null);
                  setIncomeForm({ 
                    description: '', 
                    amount: '', 
                    date: '', 
                    type: 'salary', 
                    is_recurring: false, 
                    recurrence_months: '' 
                  });
                }} 
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button 
                onClick={editingIncome ? handleUpdateIncome : handleAddIncome} 
                className="w-full sm:w-auto"
              >
                {editingIncome ? 'Atualizar' : 'Cadastrar'} Receita
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Receitas Cadastradas - {selectedMonth}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredIncomes.map((income) => (
              <div key={income.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-800 gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{income.description}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {typeLabels[income.type]} • {formatters.date(income.date)}
                  </p>
                  {income.is_recurring && (
                    <span className="inline-block px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full mt-1">
                      Recorrente ({income.recurrence_months} meses)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-bold text-lg text-green-600">{formatters.currency(income.amount)}</p>
                  </div>
                  <CrudActions
                    item={income}
                    onEdit={handleEditIncome}
                    onDelete={() => handleDeleteIncome(income.id)}
                    showView={false}
                    deleteTitle="Confirmar exclusão"
                    deleteDescription="Esta receita será permanentemente removida."
                  />
                </div>
              </div>
            ))}
            
            {filteredIncomes.length === 0 && (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Nenhuma receita encontrada para {selectedMonth}</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Clique em "Nova Receita" para começar</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Income;
