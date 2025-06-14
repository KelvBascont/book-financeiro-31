import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, TrendingUp, Calendar, ChevronDown } from 'lucide-react';
import { useIncomeOperationsIntegrated } from '@/hooks/useIncomeOperationsIntegrated';
import { useToast } from '@/hooks/use-toast';
import { useFormatters } from '@/hooks/useFormatters';
import { useCategories } from '@/hooks/useCategories';
import CategorySelector from '@/components/CategorySelector';
import IntegratedIncomeRow from '@/components/IntegratedIncomeRow';
import type { Income } from '@/hooks/useIncomes';

const Income = () => {
  const { toast } = useToast();
  const formatters = useFormatters();
  const { incomeCategories, loading: categoriesLoading } = useCategories();
  
  const currentMonth = `${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${new Date().getFullYear()}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  
  const {
    loading,
    filteredIncomes,
    monthlyTotal,
    handleAddIncome,
    handleUpdateIncome,
    handleDeleteIncome,
    handleUpdateOccurrence
  } = useIncomeOperationsIntegrated(selectedMonth);
  
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [incomeForm, setIncomeForm] = useState({
    description: '',
    amount: '',
    date: '',
    type: 'other' as 'salary' | 'bonus' | 'investment' | 'other',
    is_recurring: false,
    recurrence_months: '',
    category_id: ''
  });

  // Generate month options (past and future)
  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();

    // Add past months (24 months back)
    for (let i = 24; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthValue = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
      const monthLabel = formatters.dateMonthYear(date).toLowerCase();
      options.push({
        value: monthValue,
        label: monthLabel
      });
    }

    // Add future months (12 months forward)
    for (let i = 1; i <= 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthValue = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
      const monthLabel = formatters.dateMonthYear(date).toLowerCase();
      options.push({
        value: monthValue,
        label: monthLabel
      });
    }
    return options;
  };

  const resetForm = () => {
    setIncomeForm({
      description: '',
      amount: '',
      date: '',
      type: 'other',
      is_recurring: false,
      recurrence_months: '',
      category_id: ''
    });
    setShowAddIncome(false);
    setEditingIncome(null);
  };

  const validateForm = () => {
    if (!incomeForm.description || !incomeForm.amount || !incomeForm.date) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    const formData = {
      description: incomeForm.description,
      amount: parseFloat(incomeForm.amount),
      date: incomeForm.date,
      type: incomeForm.type,
      is_recurring: incomeForm.is_recurring,
      recurrence_months: incomeForm.is_recurring ? parseInt(incomeForm.recurrence_months) : undefined,
      category_id: incomeForm.category_id || null
    };
    const result = editingIncome ? await handleUpdateIncome(editingIncome.id, formData) : await handleAddIncome(formData);
    if (result) {
      resetForm();
    }
  };

  const handleEditIncome = (income: any) => {
    if (!income.isRecurringOccurrence) {
      setEditingIncome(income);
      setIncomeForm({
        description: income.description,
        amount: income.amount.toString(),
        date: income.date,
        type: income.type,
        is_recurring: income.is_recurring,
        recurrence_months: income.recurrence_months?.toString() || '',
        category_id: income.category_id || ''
      });
      setShowAddIncome(true);
    }
  };

  const formatMonthDisplay = (monthString: string) => {
    const [month, year] = monthString.split('/');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return formatters.dateMonthYear(date);
  };

  const getTotalColorClass = (value: number) => {
    return value > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400';
  };

  const getSelectedMonthLabel = () => {
    const option = generateMonthOptions().find(opt => opt.value === selectedMonth);
    return option ? option.label : 'Selecionar';
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

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Receitas</h1>
          <p className="text-gray-600 dark:text-gray-300">Gerencie suas receitas mensais</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Styled Month Filter */}
          <div className="relative">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="
                w-full sm:w-52 h-11 px-4 py-2.5
                bg-gradient-to-r from-blue-600 to-blue-700 
                hover:from-blue-700 hover:to-blue-800 
                border-blue-600 hover:border-blue-700
                text-white font-medium
                rounded-xl shadow-lg hover:shadow-xl
                transition-all duration-300 ease-in-out
                transform hover:scale-[1.02]
                focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
                dark:focus:ring-offset-gray-900
              ">
                <div className="flex items-center gap-3 w-full">
                  <div className="p-1.5 bg-white/20 rounded-lg">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col items-start min-w-0 flex-1">
                    <span className="text-xs opacity-90 font-normal">Período</span>
                    <span className="text-sm font-semibold truncate">
                      {getSelectedMonthLabel()}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 opacity-80" />
                </div>
              </SelectTrigger>
              <SelectContent className="
                w-52 max-h-64 
                bg-white dark:bg-gray-800 
                border border-gray-200 dark:border-gray-700 
                shadow-2xl rounded-xl
                backdrop-blur-sm
              ">
                {generateMonthOptions().map(option => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    className="
                      cursor-pointer px-3 py-2.5 mx-1 my-0.5 rounded-lg
                      hover:bg-blue-50 dark:hover:bg-gray-700 
                      focus:bg-blue-100 dark:focus:bg-gray-600
                      transition-colors duration-150
                      text-gray-700 dark:text-gray-200
                      font-medium
                    "
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      <span className="capitalize">{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={() => setShowAddIncome(!showAddIncome)} 
            className="
              w-full sm:w-auto h-11 px-6
              bg-gradient-to-r from-green-600 to-green-700 
              hover:from-green-700 hover:to-green-800
              text-white font-medium rounded-xl
              shadow-lg hover:shadow-xl
              transition-all duration-300 ease-in-out
              transform hover:scale-[1.02]
            "
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            {showAddIncome ? 'Cancelar' : 'Nova Receita'}
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-0 shadow-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Total do Mês</p>
                <p className={`text-3xl font-bold ${getTotalColorClass(monthlyTotal)} mt-1`}>
                  {formatters.currency(monthlyTotal)}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <TrendingUp className="h-7 w-7 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Qtd. Receitas</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {filteredIncomes.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <TrendingUp className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form */}
      {showAddIncome && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {editingIncome ? 'Editar Receita' : 'Cadastrar Nova Receita'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="description">Descrição *</Label>
                <Input 
                  id="description" 
                  placeholder="Ex: Salário, Freelance..." 
                  value={incomeForm.description} 
                  onChange={e => setIncomeForm({ ...incomeForm, description: e.target.value })} 
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
                  onChange={e => setIncomeForm({ ...incomeForm, amount: e.target.value })} 
                />
              </div>
              <div>
                <Label htmlFor="date">Data *</Label>
                <Input 
                  id="date" 
                  type="date" 
                  value={incomeForm.date} 
                  onChange={e => setIncomeForm({ ...incomeForm, date: e.target.value })} 
                />
              </div>
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select 
                  value={incomeForm.type} 
                  onValueChange={(value: 'salary' | 'bonus' | 'investment' | 'other') => 
                    setIncomeForm({ ...incomeForm, type: value })
                  }
                >
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
              <div>
                <Label htmlFor="category">Categoria</Label>
                {categoriesLoading ? (
                  <div className="h-10 bg-gray-200 rounded animate-pulse" />
                ) : (
                  <CategorySelector 
                    categories={incomeCategories} 
                    value={incomeForm.category_id} 
                    onValueChange={value => setIncomeForm({ ...incomeForm, category_id: value })} 
                    placeholder="Selecione uma categoria" 
                  />
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="recurring" 
                checked={incomeForm.is_recurring} 
                onCheckedChange={checked => setIncomeForm({ ...incomeForm, is_recurring: checked })} 
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
                  onChange={e => setIncomeForm({ ...incomeForm, recurrence_months: e.target.value })} 
                />
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button variant="outline" onClick={resetForm} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button onClick={handleSubmit} className="w-full sm:w-auto">
                {editingIncome ? 'Atualizar' : 'Cadastrar'} Receita
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Receitas - {formatMonthDisplay(selectedMonth)}
            </CardTitle>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-300">Total do Mês</p>
              <p className={`text-xl font-bold ${getTotalColorClass(monthlyTotal)}`}>
                {formatters.currency(monthlyTotal)}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredIncomes.length === 0 ? (
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
                  {filteredIncomes.map(income => (
                    <IntegratedIncomeRow 
                      key={`${income.id}-${income.occurrenceIndex || 0}`} 
                      income={income} 
                      onUpdateOccurrence={handleUpdateOccurrence} 
                      onDeleteIncome={handleDeleteIncome} 
                      onEditIncome={handleEditIncome} 
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
