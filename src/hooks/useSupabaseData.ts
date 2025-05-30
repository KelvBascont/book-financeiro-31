
import { useCashExpenses } from './useCashExpenses';
import { useIncomes } from './useIncomes';

export { type CashExpense } from './useCashExpenses';
export { type Income } from './useIncomes';

export const useSupabaseData = () => {
  const cashExpensesHook = useCashExpenses();
  const incomesHook = useIncomes();

  return {
    ...cashExpensesHook,
    ...incomesHook,
    loading: cashExpensesHook.loading || incomesHook.loading,
    refreshData: () => Promise.all([
      cashExpensesHook.refreshCashExpenses(),
      incomesHook.refreshIncomes()
    ])
  };
};
