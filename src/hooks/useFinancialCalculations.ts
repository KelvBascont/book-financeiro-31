
import { useMemo } from 'react';
import { useIntegratedFinancialData } from '@/hooks/useIntegratedFinancialData';
import { useCardExpenses } from '@/hooks/useCardExpenses';
import { format } from 'date-fns';

export const useFinancialCalculations = (selectedMonth: Date) => {
  const monthString = format(selectedMonth, 'MM/yyyy');
  const { cardExpenses } = useCardExpenses();
  
  // Use integrated financial data that includes bills
  const {
    expensesTotal: integratedExpensesTotal,
    incomesTotal: integratedIncomesTotal,
    loading
  } = useIntegratedFinancialData(monthString);

  const financialSummary = useMemo(() => {
    // Calculate card expenses for the selected month
    const currentMonthCardExpenses = cardExpenses
      .filter(expense => {
        const billingMonth = format(new Date(expense.billing_month), 'MM/yyyy');
        return billingMonth === monthString;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);

    // Use integrated totals (already include bills)
    const totalIncome = integratedIncomesTotal;
    const totalExpenses = Math.abs(integratedExpensesTotal); // Convert to positive
    
    // Calculate current balance including all sources
    const currentBalance = totalIncome - totalExpenses - currentMonthCardExpenses;

    return {
      totalIncome,
      totalExpenses,
      currentMonthCardExpenses,
      currentBalance
    };
  }, [integratedIncomesTotal, integratedExpensesTotal, cardExpenses, monthString]);

  return {
    financialSummary,
    loading
  };
};
