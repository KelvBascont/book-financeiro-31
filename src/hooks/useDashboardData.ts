
import { useMemo } from 'react';
import { useIntegratedFinancialData } from '@/hooks/useIntegratedFinancialData';
import { useCardExpenses } from '@/hooks/useCardExpenses';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, addMonths } from 'date-fns';

export const useDashboardData = () => {
  const { cardExpenses } = useCardExpenses();

  const monthlyData = useMemo(() => {
    const today = new Date();
    const startDate = subMonths(today, 5);
    const endDate = addMonths(today, 1);
    
    const months = eachMonthOfInterval({ start: startDate, end: endDate });
    
    return months.map(month => {
      const monthString = format(month, 'MM/yyyy');
      
      // Use integrated data for each month
      const { expensesTotal, incomesTotal } = useIntegratedFinancialData(monthString);
      
      // Calculate card expenses for the billing month
      const monthlyCardExpenses = cardExpenses
        .filter(expense => {
          const billingMonth = format(new Date(expense.billing_month), 'MM/yyyy');
          return billingMonth === monthString;
        })
        .reduce((sum, expense) => sum + expense.amount, 0);
      
      return {
        month: format(month, 'MMM yyyy'),
        income: incomesTotal,
        expenses: Math.abs(expensesTotal), // Convert to positive for chart display
        cardExpenses: monthlyCardExpenses
      };
    });
  }, [cardExpenses]);

  // Get current month data
  const currentMonth = format(new Date(), 'MM/yyyy');
  const { expensesTotal, incomesTotal, loading } = useIntegratedFinancialData(currentMonth);

  const totalIncome = incomesTotal;
  const totalExpenses = Math.abs(expensesTotal);

  return {
    monthlyData,
    totalIncome,
    totalExpenses,
    loading
  };
};
