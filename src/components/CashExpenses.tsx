
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Receipt, Calendar, AlertCircle, TrendingDown, Repeat } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useFormatters } from '@/hooks/useFormatters';
import CrudActions from '@/components/CrudActions';

const CashExpenses = () => {
  const { toast } = useToast();
  const formatters = useFormatters();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  
  const {
    cashExpenses,
    addCashExpense,
    updateCashExpense,
    deleteCashExpense,
    loading
  } = useSupabaseData();
  
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    date: '',
    due_date: '',
    is_recurring: false,
    recurrence_months: ''
  });

  const handleAddExpense = async () => {
    if (!expenseForm.description || !expenseForm.amount || !expenseForm.date || !expenseForm.due_date) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    const result = await addCashExpense({
      description: expenseForm.description,
      amount: parseFloat(expenseForm.amount),
      date: expenseForm.date,
      due_date: expenseForm.due_date,
      is_recurring: expenseForm.is_recurring,
      recurrence_months: expenseForm.is_recurring ? parseInt(expenseForm.recurrence_months) : undefined
    });

    if (result) {
      setExpenseForm({
        description: '',
        amount: '',
        date: '',
        due_date: '',
        is_recurring: false,
        recurrence_months: ''
      });
      setShowAddExpense(false);
    }
  };

  const handleEditExpense = (expense: any) => {
    setEditingExpense(expense);
    setExpenseForm({
      description: expense.description,
      amount: expense.amount.toString(),
      date: expense.date,
      due_date: expense.due_date,
      is_recurring: expense.is_recurring,
      recurrence_months: expense.recurrence_months?.toString() || ''
    });
    setShowAddExpense(true);
  };

  const handleUpdateExpense = async () => {
    if (!editingExpense || !expenseForm.description || !expenseForm.amount || !expenseForm.date || !expenseForm.due_date) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    const result = await updateCashExpense(editingExpense.id, {
      description: expenseForm.description,
      amount: parseFloat(expenseForm.amount),
      date: expenseForm.date,
      due_date: expenseForm.due_date,
      is_recurring: expenseForm.is_recurring,
      recurrence_months: expenseForm.is_recurring ? parseInt(expenseForm.recurrence_months) : undefined
    });

    if (result) {
      setExpenseForm({
        description: '',
        amount: '',
        date: '',
        due_date: '',
        is_recurring: false,
        recurrence_months: ''
      });
      setShowAddExpense(false);
      setEditingExpense(null);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    await deleteCashExpense(id);
  };

  const getTotalExpenses = () => {
    return cashExpenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const getMonthlyExpenses = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return cashExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });
  };

  const getUpcomingExpenses = () => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    return cashExpenses.filter(expense => {
      const dueDate = new Date(expense.due_date);
      return dueDate >= today && dueDate <= thirtyDaysFromNow;
    }).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
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

  const monthlyExpenses = getMonthlyExpenses();
  const upcomingExpenses = getUpcomingExpenses();

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Despesas Correntes</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Gerencie suas despesas à vista</p>
        </div>
        <Button onClick={() => setShowAddExpense(!showAddExpense)} className="bg-red-500 hover:bg-red-600 w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nova Despesa
        </Button>
      </div>

      {/* Resumo das despesas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Total de Despesas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatters.currency(getTotalExpenses())}
                </p>
              </div>
              <Receipt className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Despesas do Mês</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatters.currency(monthlyExpenses.reduce((total, expense) => total + expense.amount, 0))}
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
                <p className="text-sm text-gray-600 dark:text-gray-300">Próximos Vencimentos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{upcomingExpenses.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Despesas com vencimento próximo */}
      {upcomingExpenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Despesas com Vencimento Próximo (30 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingExpenses.slice(0, 5).map((expense) => {
                const daysUntilDue = Math.ceil((new Date(expense.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg bg-orange-50 dark:bg-orange-900/20">
                    <div>
                      <p className="font-medium">{expense.description}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Vence em {daysUntilDue} dias ({formatters.date(expense.due_date)})
                      </p>
                    </div>
                    <p className="font-bold text-lg text-red-600">
                      {formatters.currency(expense.amount)}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {showAddExpense && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              {editingExpense ? 'Editar Despesa' : 'Cadastrar Nova Despesa'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="description">Descrição *</Label>
                <Input
                  id="description"
                  placeholder="Ex: Aluguel, Conta de luz..."
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="amount">Valor *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="date">Data da Despesa *</Label>
                <Input
                  id="date"
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="dueDate">Data de Vencimento *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={expenseForm.due_date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, due_date: e.target.value })}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="recurring"
                checked={expenseForm.is_recurring}
                onCheckedChange={(checked) => setExpenseForm({ ...expenseForm, is_recurring: checked })}
              />
              <Label htmlFor="recurring">Despesa recorrente</Label>
            </div>
            
            {expenseForm.is_recurring && (
              <div className="w-full sm:w-40">
                <Label htmlFor="recurrence">Repetir a cada (meses)</Label>
                <Input
                  id="recurrence"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={expenseForm.recurrence_months}
                  onChange={(e) => setExpenseForm({ ...expenseForm, recurrence_months: e.target.value })}
                />
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddExpense(false);
                  setEditingExpense(null);
                  setExpenseForm({
                    description: '',
                    amount: '',
                    date: '',
                    due_date: '',
                    is_recurring: false,
                    recurrence_months: ''
                  });
                }} 
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button 
                onClick={editingExpense ? handleUpdateExpense : handleAddExpense} 
                className="bg-red-500 hover:bg-red-600 w-full sm:w-auto"
              >
                {editingExpense ? 'Atualizar' : 'Cadastrar'} Despesa
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Despesas do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monthlyExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-800">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Receipt className="h-8 w-8 text-red-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{expense.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {expense.is_recurring && (
                          <Badge variant="outline" className="text-xs">
                            <Repeat className="h-3 w-3 mr-1" />
                            Recorrente
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Vence: {formatters.date(expense.due_date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-lg text-red-600">
                      {formatters.currency(expense.amount)}
                    </p>
                    <CrudActions
                      item={expense}
                      onEdit={handleEditExpense}
                      onDelete={() => handleDeleteExpense(expense.id)}
                      showView={false}
                      deleteTitle="Confirmar exclusão"
                      deleteDescription="Esta ação não pode ser desfeita. A despesa será permanentemente removida."
                    />
                  </div>
                </div>
              ))}
              
              {monthlyExpenses.length === 0 && (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Nenhuma despesa para este mês</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Clique em "Nova Despesa" para começar</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Todas as Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {cashExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-800">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Receipt className="h-6 w-6 text-red-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate text-sm">{expense.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {expense.is_recurring && (
                          <Badge variant="outline" className="text-xs">
                            <Repeat className="h-3 w-3 mr-1" />
                            Recorrente
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        Vence: {formatters.date(expense.due_date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-red-600">
                      {formatters.currency(expense.amount)}
                    </p>
                    <CrudActions
                      item={expense}
                      onEdit={handleEditExpense}
                      onDelete={() => handleDeleteExpense(expense.id)}
                      showView={false}
                      deleteTitle="Confirmar exclusão"
                      deleteDescription="Esta ação não pode ser desfeita. A despesa será permanentemente removida."
                    />
                  </div>
                </div>
              ))}
              
              {cashExpenses.length === 0 && (
                <div className="text-center py-8">
                  <TrendingDown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Nenhuma despesa cadastrada</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Clique em "Nova Despesa" para começar</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CashExpenses;
