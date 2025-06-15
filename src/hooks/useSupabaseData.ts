
import { useCashExpenses } from '@/hooks/useCashExpenses';
import { useIncomes } from '@/hooks/useIncomes';
import { useBills } from '@/hooks/useBills';

export const useSupabaseData = () => {
  const {
    cashExpenses,
    loading: cashExpensesLoading,
    addCashExpense,
    updateCashExpense,
    deleteCashExpense,
    refreshCashExpenses
  } = useCashExpenses();

  const {
    incomes,
    loading: incomesLoading,
    addIncome,
    updateIncome,
    deleteIncome,
    refreshIncomes
  } = useIncomes();

  const {
    bills,
    loading: billsLoading,
    createBill,
    updateBill,
    deleteBill,
    refreshBills
  } = useBills();

  const loading = cashExpensesLoading || incomesLoading || billsLoading;

  return {
    // Cash Expenses
    cashExpenses,
    addCashExpense,
    updateCashExpense,
    deleteCashExpense,
    refreshCashExpenses,

    // Incomes
    incomes,
    addIncome,
    updateIncome,
    deleteIncome,
    refreshIncomes,

    // Bills
    bills,
    addBill: createBill,
    updateBill,
    deleteBill,
    refreshBills,

    loading
  };
};
