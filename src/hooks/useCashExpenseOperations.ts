
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useRecurrenceFilter } from '@/hooks/useRecurrenceFilter';
import { useOccurrenceOverrides } from '@/hooks/useOccurrenceOverrides';

export const useCashExpenseOperations = (selectedMonth: string) => {
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
  
  const { filterByReferenceMonth, calculateTotalForMonth } = useRecurrenceFilter();

  const handleAddExpense = async (formData: any) => {
    return await addCashExpense(formData);
  };

  const handleUpdateExpense = async (expenseId: string, formData: any) => {
    return await updateCashExpense(expenseId, formData);
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

  return {
    cashExpenses,
    loading,
    filteredExpenses: expensesWithOverrides,
    monthlyTotal,
    handleAddExpense,
    handleUpdateExpense,
    handleDeleteExpense,
    handleUpdateOccurrence
  };
};
