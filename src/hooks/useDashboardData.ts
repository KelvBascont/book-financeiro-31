
import { useMemo } from 'react';
import { useIntegratedFinancialData } from '@/hooks/useIntegratedFinancialData';
import { useCardExpenses } from '@/hooks/useCardExpenses';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, addMonths } from 'date-fns';

export const useDashboardData = () => {
  const { cardExpenses } = useCardExpenses();

  // Get current month data using integrated financial data
  const currentMonth = format(new Date(), 'MM/yyyy');
  const { expensesTotal, incomesTotal, loading } = useIntegratedFinancialData(currentMonth);

  const monthlyData = useMemo(() => {
    const today = new Date();
    const startDate = subMonths(today, 5);
    const endDate = addMonths(today, 1);
    
    const months = eachMonthOfInterval({ start: startDate, end: endDate });
    
    return months.map(month => {
      const monthString = format(month, 'MM/yyyy');
      
      // Calculate card expenses for the billing month
      const monthlyCardExpenses = cardExpenses
        .filter(expense => {
          const billingMonth = format(new Date(expense.billing_month), 'MM/yyyy');
          return billingMonth === monthString;
        })
        .reduce((sum, expense) => sum + expense.amount, 0);
      
      // For historical data, we'll use a simplified calculation
      // In a real app, you might want to cache this data or calculate it differently
      return {
        month: format(month, 'MMM yyyy'),
        income: monthString === currentMonth ? incomesTotal : 0, // Only current month for now
        expenses: monthString === currentMonth ? Math.abs(expensesTotal) : 0, // Only current month for now
        cardExpenses: monthlyCardExpenses
      };
    });
  }, [cardExpenses, currentMonth, incomesTotal, expensesTotal]);

  const totalIncome = incomesTotal;
  const totalExpenses = Math.abs(expensesTotal);

  return {
    monthlyData,
    totalIncome,
    totalExpenses,
    loading
  };
};
