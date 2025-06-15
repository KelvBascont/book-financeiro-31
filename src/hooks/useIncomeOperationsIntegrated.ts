
import { useIntegratedFinancialData } from '@/hooks/useIntegratedFinancialData';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useOccurrenceOverrides } from '@/hooks/useOccurrenceOverrides';

export const useIncomeOperationsIntegrated = (selectedMonth: string) => {
  const {
    addIncome,
    updateIncome,
    deleteIncome,
    loading: supabaseLoading,
    refreshIncomes
  } = useSupabaseData();

  const { 
    addOverride, 
    getOverrideForOccurrence 
  } = useOccurrenceOverrides();

  const {
    loading: integratedLoading,
    integratedIncomes,
    incomesTotal
  } = useIntegratedFinancialData(selectedMonth);

  const loading = supabaseLoading || integratedLoading;

  const handleAddIncome = async (formData: any) => {
    const result = await addIncome(formData);
    if (result) {
      await refreshIncomes();
    }
    return result;
  };

  const handleUpdateIncome = async (incomeId: string, formData: any) => {
    const result = await updateIncome(incomeId, formData);
    if (result) {
      await refreshIncomes();
    }
    return result;
  };

  const handleDeleteIncome = async (id: string) => {
    await deleteIncome(id);
    await refreshIncomes();
  };

  const handleUpdateOccurrence = async (transactionId: string, occurrenceIndex: number, newAmount: number) => {
    const transaction = integratedIncomes.find(t => t.id === transactionId && t.source === 'income');
    if (!transaction) return;

    // Calcular a data da ocorrência
    const baseDate = new Date(transaction.date);
    const occurrenceDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + occurrenceIndex, baseDate.getDate());
    
    await addOverride(transactionId, occurrenceIndex, newAmount, occurrenceDate.toISOString().split('T')[0]);
  };

  // Apply overrides to filtered incomes
  const incomesWithOverrides = integratedIncomes.map(income => {
    if (income.source === 'income' && income.isRecurringOccurrence && income.occurrenceIndex !== undefined) {
      const override = getOverrideForOccurrence(income.id, income.occurrenceIndex);
      if (override) {
        return {
          ...income,
          amount: override.amount,
          isModified: true
        };
      }
    }
    return income;
  });

  return {
    loading,
    filteredIncomes: incomesWithOverrides,
    monthlyTotal: incomesTotal,
    handleAddIncome,
    handleUpdateIncome,
    handleDeleteIncome,
    handleUpdateOccurrence
  };
};
