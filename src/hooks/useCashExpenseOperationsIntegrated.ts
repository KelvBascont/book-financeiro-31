
import { useIntegratedFinancialData } from '@/hooks/useIntegratedFinancialData';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useOccurrenceOverrides } from '@/hooks/useOccurrenceOverrides';

export const useCashExpenseOperationsIntegrated = (selectedMonth: string) => {
  const {
    addCashExpense,
    updateCashExpense,
    deleteCashExpense,
    loading: supabaseLoading,
    refreshCashExpenses
  } = useSupabaseData();

  const { 
    addOverride, 
    getOverrideForOccurrence 
  } = useOccurrenceOverrides();

  const {
    loading: integratedLoading,
    integratedExpenses,
    expensesTotal
  } = useIntegratedFinancialData(selectedMonth);

  const loading = supabaseLoading || integratedLoading;

  const handleAddExpense = async (formData: any) => {
    const result = await addCashExpense(formData);
    if (result) {
      await refreshCashExpenses();
    }
    return result;
  };

  const handleUpdateExpense = async (expenseId: string, formData: any) => {
    const result = await updateCashExpense(expenseId, formData);
    if (result) {
      await refreshCashExpenses();
    }
    return result;
  };

  const handleDeleteExpense = async (id: string) => {
    await deleteCashExpense(id);
    await refreshCashExpenses();
  };

  const handleUpdateOccurrence = async (transactionId: string, occurrenceIndex: number, newAmount: number) => {
    const transaction = integratedExpenses.find(t => t.id === transactionId && t.source === 'cash_expense');
    if (!transaction) return;

    // Calcular a data da ocorrência
    const baseDate = new Date(transaction.date);
    const occurrenceDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + occurrenceIndex, baseDate.getDate());
    
    await addOverride(transactionId, occurrenceIndex, newAmount, occurrenceDate.toISOString().split('T')[0]);
  };

  // Apply overrides to filtered expenses
  const expensesWithOverrides = integratedExpenses.map(expense => {
    if (expense.source === 'cash_expense' && expense.isRecurringOccurrence && expense.occurrenceIndex !== undefined) {
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
    loading,
    filteredExpenses: expensesWithOverrides,
    monthlyTotal: expensesTotal,
    handleAddExpense,
    handleUpdateExpense,
    handleDeleteExpense,
    handleUpdateOccurrence
  };
};
