
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useRecurrenceFilter } from '@/hooks/useRecurrenceFilter';
import { useOccurrenceOverrides } from '@/hooks/useOccurrenceOverrides';
import CashExpensesHeader from '@/components/cash-expenses/CashExpensesHeader';
import CashExpensesSummary from '@/components/cash-expenses/CashExpensesSummary';
import CashExpenseForm from '@/components/cash-expenses/CashExpenseForm';
import CashExpensesTable from '@/components/cash-expenses/CashExpensesTable';

const CashExpenses = () => {
  const { toast } = useToast();
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

  const { 
    addOverride, 
    getOverrideForOccurrence 
  } = useOccurrenceOverrides();
  
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
      resetForm();
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
      resetForm();
    }
  };

  const resetForm = () => {
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
  };

  const handleDeleteExpense = async (id: string) => {
    await deleteCashExpense(id);
  };

  const handleUpdateOccurrence = async (transactionId: string, occurrenceIndex: number, newAmount: number) => {
    const transaction = cashExpenses.find(t => t.id === transactionId);
    if (!transaction) return;

    // Calcular a data da ocorrência
    const baseDate = new Date(transaction.date);
    const occurrenceDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + occurrenceIndex, baseDate.getDate());
    
    await addOverride(transactionId, occurrenceIndex, newAmount, occurrenceDate.toISOString().split('T')[0]);
  };

  const filteredExpenses = filterByReferenceMonth(cashExpenses, selectedMonth);
  const monthlyTotal = calculateTotalForMonth(cashExpenses, selectedMonth);

  // Apply overrides to filtered expenses
  const expensesWithOverrides = filteredExpenses.map(expense => {
    if (expense.isRecurringOccurrence && expense.occurrenceIndex !== undefined) {
      const override = getOverrideForOccurrence(expense.id, expense.occurrenceIndex);
      if (override) {
        return {
          ...expense,
          amount: override.amount,
          isModified: true
        };
      }
    }
    return expense;
  });

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
      <CashExpensesHeader
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        onAddExpense={() => setShowAddExpense(!showAddExpense)}
      />

      <CashExpensesSummary
        monthlyTotal={monthlyTotal}
        expenseCount={filteredExpenses.length}
      />

      <CashExpenseForm
        isVisible={showAddExpense}
        isEditing={!!editingExpense}
        formData={expenseForm}
        onFormChange={setExpenseForm}
        onSubmit={editingExpense ? handleUpdateExpense : handleAddExpense}
        onCancel={resetForm}
      />

      <CashExpensesTable
        expenses={expensesWithOverrides}
        monthlyTotal={monthlyTotal}
        selectedMonth={selectedMonth}
        onUpdateOccurrence={handleUpdateOccurrence}
        onDeleteExpense={handleDeleteExpense}
      />
    </div>
  );
};

export default CashExpenses;
