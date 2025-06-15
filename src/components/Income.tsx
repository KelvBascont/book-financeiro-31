import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, DollarSign, TrendingUp, Calendar, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useFormatters } from '@/hooks/useFormatters';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useIntegratedFinancialData } from '@/hooks/useIntegratedFinancialData';
import { useOccurrenceOverrides } from '@/hooks/useOccurrenceOverrides';
import { useCategories } from '@/hooks/useCategories';
import CategorySelector from '@/components/CategorySelector';
import IntegratedIncomeRow from '@/components/IntegratedIncomeRow';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Income = () => {
  const { toast } = useToast();
  const formatters = useFormatters();
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [editingIncome, setEditingIncome] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  
  const {
    addIncome,
    updateIncome,
    deleteIncome,
    loading: supabaseLoading
  } = useSupabaseData();

  const { addOverride } = useOccurrenceOverrides();
  const { incomeCategories, loading: categoriesLoading } = useCategories();
  
  const [incomeForm, setIncomeForm] = useState({
    description: '',
    amount: '',
    date: '',
    type: 'salary' as 'salary' | 'bonus' | 'investment' | 'other',
    is_recurring: false,
    recurrence_months: '',
    category_id: ''
  });

  // Convert selectedMonth to the format used by the integrated hook
  const selectedMonthString = `${(selectedMonth.getMonth() + 1).toString().padStart(2, '0')}/${selectedMonth.getFullYear()}`;
  
  const {
    loading: integratedLoading,
    integratedIncomes,
    incomesTotal
  } = useIntegratedFinancialData(selectedMonthString);

  const loading = supabaseLoading || integratedLoading;

  // Helper function to generate months
  const generateMonths = () => {
    const months = [];
    const currentDate = new Date();
    
    // Gera 12 meses: 6 anteriores, atual e 5 posteriores
    for (let i = -6; i <= 5; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      months.push(date);
    }
    
    return months;
  };

  const months = generateMonths();

  // Helper function to format month display
  const formatMonthDisplay = (monthString: string) => {
    const [month, year] = monthString.split('/');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return formatters.dateMonthYear(date);
  };

  const handleUpdateOccurrence = async (id: string, occurrenceIndex: number, newAmount: number) => {
    try {
      // Calcular a data da ocorrência baseada no índice
      const originalIncome = integratedIncomes.find(income => income.id === id && income.source === 'income');
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
      recurrence_months: incomeForm.is_recurring ? parseInt(incomeForm.recurrence_months) : undefined,
      category_id: incomeForm.category_id || null
    });

    if (result) {
      setIncomeForm({ 
        description: '', 
        amount: '', 
        date: '', 
        type: 'salary', 
        is_recurring: false, 
        recurrence_months: '',
        category_id: ''
      });
      setShowAddIncome(false);
    }
  };

  const handleEditIncome = (income: any) => {
    // Só permitir edição de incomes, não bills
    if (income.source === 'income') {
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
      recurrence_months: incomeForm.is_recurring ? parseInt(incomeForm.recurrence_months) : undefined,
      category_id: incomeForm.category_id || null
    });

    if (result) {
      setIncomeForm({ 
        description: '', 
        amount: '', 
        date: '', 
        type: 'salary', 
        is_recurring: false, 
        recurrence_months: '',
        category_id: ''
      });
      setShowAddIncome(false);
      setEditingIncome(null);
    }
  };

  const handleDeleteIncome = async (id: string) => {
    await deleteIncome(id);
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

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Receitas</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Gerencie suas fontes de renda</p>
        </div>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="min-w-[110px] justify-between bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-blue-500 shadow-md px-3 py-1.5"
              >
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">
                    {format(selectedMonth, 'MMM/yyyy', { locale: ptBR })}
                  </span>
                </div>
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-48 max-h-64 overflow-y-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            >
              {months.map((month) => {
                const isSelected = format(month, 'yyyy-MM') === format(selectedMonth, 'yyyy-MM');
                const isCurrent = format(month, 'yyyy-MM') === format(new Date(), 'yyyy-MM');
                
                return (
                  <DropdownMenuItem
                    key={format(month, 'yyyy-MM')}
                    onClick={() => setSelectedMonth(month)}
                    className={`
                      cursor-pointer flex items-center justify-between px-3 py-2
                      ${isSelected 
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <span>{format(month, 'MMM/yyyy', { locale: ptBR })}</span>
                    {isCurrent && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                        Atual
                      </span>
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => setShowAddIncome(!showAddIncome)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Nova Receita
          </Button>
        </div>
      </div>

      {/* Resumo das receitas - atualizado com dados integrados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Total do Mês</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatters.currency(incomesTotal)}
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
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{integratedIncomes.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formulário de receitas */}
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
              <div>
                <Label htmlFor="category">Categoria</Label>
                {categoriesLoading ? (
                  <div className="h-10 bg-gray-200 rounded animate-pulse" />
                ) : (
                  <CategorySelector
                    categories={incomeCategories}
                    value={incomeForm.category_id}
                    onValueChange={(value) => setIncomeForm({ ...incomeForm, category_id: value })}
                    placeholder="Selecione uma categoria"
                  />
                )}
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
                    recurrence_months: '',
                    category_id: ''
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

      {/* Tabela integrada de receitas */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Receitas - {format(selectedMonth, 'MMM/yyyy', { locale: ptBR })}
            </CardTitle>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-300">Total do Mês</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {formatters.currency(incomesTotal)}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {integratedIncomes.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Nenhuma receita encontrada para {format(selectedMonth, 'MMM/yyyy', { locale: ptBR })}
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
                  {integratedIncomes.map((income) => (
                    <IntegratedIncomeRow
                      key={`${income.source}-${income.id}-${income.occurrenceIndex || 0}`}
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
