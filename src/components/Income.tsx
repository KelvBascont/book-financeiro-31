
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, DollarSign, TrendingUp, Calendar, Repeat, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useFormatters } from '@/hooks/useFormatters';
import CrudActions from '@/components/CrudActions';

const Income = () => {
  const { toast } = useToast();
  const formatters = useFormatters();
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [editingIncome, setEditingIncome] = useState<any>(null);
  
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

  const getTypeLabel = (type: string) => {
    const labels = {
      salary: 'Salário',
      bonus: 'Bônus',
      investment: 'Investimento',
      other: 'Outros'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      salary: 'bg-green-100 text-green-800',
      bonus: 'bg-blue-100 text-blue-800',
      investment: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTotalIncomes = () => {
    return incomes.reduce((total, income) => total + income.amount, 0);
  };

  const getMonthlyIncomes = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return incomes.filter(income => {
      const incomeDate = new Date(income.date);
      return incomeDate.getMonth() === currentMonth && incomeDate.getFullYear() === currentYear;
    });
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

  const monthlyIncomes = getMonthlyIncomes();

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Gestão de Receitas</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Registre suas fontes de renda</p>
        </div>
        <Button onClick={() => setShowAddIncome(!showAddIncome)} className="bg-green-500 hover:bg-green-600 w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nova Receita
        </Button>
      </div>

      {/* Resumo das receitas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Total de Receitas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatters.currency(getTotalIncomes())}
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
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatters.currency(monthlyIncomes.reduce((total, income) => total + income.amount, 0))}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Fontes Ativas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{incomes.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
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
              <div className="w-full sm:w-40">
                <Label htmlFor="recurrence">Repetir a cada (meses)</Label>
                <Input
                  id="recurrence"
                  type="number"
                  min="1"
                  placeholder="1"
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
                className="bg-green-500 hover:bg-green-600 w-full sm:w-auto"
              >
                {editingIncome ? 'Atualizar' : 'Cadastrar'} Receita
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Receitas do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monthlyIncomes.map((income) => (
                <div key={income.id} className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-800">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <DollarSign className="h-8 w-8 text-green-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{income.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getTypeColor(income.type)}>
                          {getTypeLabel(income.type)}
                        </Badge>
                        {income.is_recurring && (
                          <Badge variant="outline" className="text-xs">
                            <Repeat className="h-3 w-3 mr-1" />
                            Recorrente
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {formatters.date(income.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-lg text-green-600">
                      {formatters.currency(income.amount)}
                    </p>
                    <CrudActions
                      item={income}
                      onEdit={handleEditIncome}
                      onDelete={() => handleDeleteIncome(income.id)}
                      showView={false}
                      deleteTitle="Confirmar exclusão"
                      deleteDescription="Esta ação não pode ser desfeita. A receita será permanentemente removida."
                    />
                  </div>
                </div>
              ))}
              
              {monthlyIncomes.length === 0 && (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Nenhuma receita para este mês</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Clique em "Nova Receita" para começar</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Todas as Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {incomes.map((income) => (
                <div key={income.id} className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-800">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <DollarSign className="h-6 w-6 text-green-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate text-sm">{income.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`${getTypeColor(income.type)} text-xs`}>
                          {getTypeLabel(income.type)}
                        </Badge>
                        {income.is_recurring && (
                          <Badge variant="outline" className="text-xs">
                            <Repeat className="h-3 w-3 mr-1" />
                            Recorrente
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        {formatters.date(income.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-green-600">
                      {formatters.currency(income.amount)}
                    </p>
                    <CrudActions
                      item={income}
                      onEdit={handleEditIncome}
                      onDelete={() => handleDeleteIncome(income.id)}
                      showView={false}
                      deleteTitle="Confirmar exclusão"
                      deleteDescription="Esta ação não pode ser desfeita. A receita será permanentemente removida."
                    />
                  </div>
                </div>
              ))}
              
              {incomes.length === 0 && (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Nenhuma receita cadastrada</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Clique em "Nova Receita" para começar</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Income;
