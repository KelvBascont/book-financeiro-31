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
import { useOccurrenceOverrides } from '@/hooks/useOccurrenceOverrides';
import MonthSelector from '@/components/income/MonthSelector';
import { useRecurrenceFilter } from '@/hooks/useRecurrenceFilter';
import EditableIncomeRow from '@/components/EditableIncomeRow';

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

  const { addOverride, applyOverridesToTransactions } = useOccurrenceOverrides();
  
  const [incomeForm, setIncomeForm] = useState({
    description: '',
    amount: '',
    date: '',
    type: 'salary' as 'salary' | 'bonus' | 'investment' | 'other',
    is_recurring: false,
    recurrence_months: ''
  });

  const { filterByReferenceMonth, calculateTotalForMonth } = useRecurrenceFilter();

  // Helper function to format month display
  const formatMonthDisplay = (monthString: string) => {
    const [month, year] = monthString.split('/');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return formatters.dateMonthYear(date);
  };

  const handleUpdateOccurrence = async (id: string, occurrenceIndex: number, newAmount: number) => {
    try {
      // Calcular a data da ocorrência baseada no índice
      const originalIncome = incomes.find(income => income.id === id);
      if (!originalIncome) return;

      const originalDate = new Date(originalIncome.date);
      const occurrenceDate = new Date(originalDate);
      occurrenceDate.setMonth(occurrenceDate.getMonth() + occurrenceIndex);

      await addOverride(id, occurrenceIndex, newAmount, occurrenceDate.toISOString().split('T')[0]);
    } catch (error) {
      console.error('Error updating income occurrence:', error);
      throw error;
    }
  };

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

  const getTypeColor = (type: 'salary' | 'bonus' | 'investment' | 'other') => {
    const colors = {
      salary: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      bonus: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      investment: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    };
    return colors[type];
  };

  const getTypeLabel = (type: 'salary' | 'bonus' | 'investment' | 'other') => {
    return typeLabels[type];
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

  const filteredIncomes = filterByReferenceMonth(incomes, selectedMonth);
  const filteredIncomesWithOverrides = applyOverridesToTransactions(filteredIncomes);
  const monthlyTotal = calculateTotalForMonth(incomes, selectedMonth);

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
                  {formatters.currency(monthlyTotal)}
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
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredIncomesWithOverrides.length}</p>
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Receitas - {formatMonthDisplay(selectedMonth)}
            </CardTitle>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-300">Total do Mês</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {formatters.currency(monthlyTotal)}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredIncomesWithOverrides.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Nenhuma receita encontrada para {formatMonthDisplay(selectedMonth)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-2">Descrição</th>
                    <th className="text-left py-3 px-2">Tipo</th>
                    <th className="text-left py-3 px-2">Valor</th>
                    <th className="text-left py-3 px-2">Data</th>
                    <th className="text-center py-3 px-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIncomesWithOverrides.map((income) => (
                    <EditableIncomeRow
                      key={`${income.id}-${income.occurrenceIndex || 0}`}
                      income={income}
                      onUpdateOccurrence={handleUpdateOccurrence}
                      onDeleteIncome={handleDeleteIncome}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Income;
