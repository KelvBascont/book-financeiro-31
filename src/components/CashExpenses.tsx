import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Wallet, TrendingDown, Receipt, Edit2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFormatters } from '@/hooks/useFormatters';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import CrudActions from '@/components/CrudActions';
import MonthSelector from '@/components/income/MonthSelector';
import { useRecurrenceFilter } from '@/hooks/useRecurrenceFilter';
import RecurringIndicator from '@/components/RecurringIndicator';

const CashExpenses = () => {
  const { toast } = useToast();
  const formatters = useFormatters();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const currentMonth = `${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${new Date().getFullYear()}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  
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

  const { filterByReferenceMonth, calculateTotalForMonth } = useRecurrenceFilter();
  
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

  const getFilteredExpenses = () => {
    const [month, year] = selectedMonth.split('/');
    return cashExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const expenseMonth = (expenseDate.getMonth() + 1).toString().padStart(2, '0');
      const expenseYear = expenseDate.getFullYear().toString();
      return expenseMonth === month && expenseYear === year;
    });
  };

  const filteredExpenses = filterByReferenceMonth(cashExpenses, selectedMonth);
  const monthlyTotal = calculateTotalForMonth(cashExpenses, selectedMonth);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Despesas Correntes</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Gerencie suas despesas mensais</p>
        </div>
        <Button onClick={() => setShowAddExpense(!showAddExpense)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nova Despesa
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

      {/* Resumo das despesas */}
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
              <Wallet className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Despesas do Mês</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredExpenses.length}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {showAddExpense && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              {editingExpense ? 'Editar Despesa' : 'Cadastrar Nova Despesa'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="description">Descrição *</Label>
                <Input
                  id="description"
                  placeholder="Ex: Aluguel, Luz, Água..."
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
                <Label htmlFor="date">Data de Início *</Label>
                <Input
                  id="date"
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="due_date">Data de Vencimento *</Label>
                <Input
                  id="due_date"
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
              <div className="w-full sm:w-48">
                <Label htmlFor="recurrence">Repetir por quantos meses</Label>
                <Input
                  id="recurrence"
                  type="number"
                  min="1"
                  max="60"
                  placeholder="Ex: 12"
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
                className="w-full sm:w-auto"
              >
                {editingExpense ? 'Atualizar' : 'Cadastrar'} Despesa
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Despesas Correntes - {formatters.dateMonthYear(selectedMonth)}
            </CardTitle>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-300">Total do Mês</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">
                {formatters.currency(monthlyTotal)}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Nenhuma despesa encontrada para {formatters.dateMonthYear(selectedMonth)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-2">Descrição</th>
                    <th className="text-left py-3 px-2">Valor</th>
                    <th className="text-left py-3 px-2">Data</th>
                    <th className="text-left py-3 px-2">Vencimento</th>
                    <th className="text-center py-3 px-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense) => (
                    <tr key={`${expense.id}-${expense.occurrenceIndex || 0}`} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          {expense.description}
                          <RecurringIndicator transaction={expense} />
                        </div>
                      </td>
                      <td className="py-3 px-2 font-medium text-red-600 dark:text-red-400">
                        {formatters.currency(expense.amount)}
                      </td>
                      <td className="py-3 px-2">
                        {expense.displayDate}
                        {expense.isRecurringOccurrence && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Original: {formatters.date(expense.originalDate)}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        {formatters.date(expense.due_date)}
                      </td>
                      <td className="py-3 px-2">
                        {!expense.isRecurringOccurrence && (
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingExpense(expense)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteCashExpense(expense.id)}
                              className="h-8 w-8 p-0 text-red-600 dark:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
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

export default CashExpenses;
