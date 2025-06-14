
import { useMemo } from 'react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useCardExpenses } from '@/hooks/useCardExpenses';
import { useRecurrenceFilter } from '@/hooks/useRecurrenceFilter';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, addMonths } from 'date-fns';

export const useDashboardData = () => {
  const { cashExpenses, incomes, loading } = useSupabaseData();
  const { cardExpenses } = useCardExpenses();
  const { filterByReferenceMonth, calculateTotalForMonth } = useRecurrenceFilter();

  const monthlyData = useMemo(() => {
    const today = new Date();
    const startDate = subMonths(today, 5);
    const endDate = addMonths(today, 1);
    
    const months = eachMonthOfInterval({ start: startDate, end: endDate });
    
    return months.map(month => {
      const monthString = format(month, 'MM/yyyy');
      const monthlyIncomes = calculateTotalForMonth(incomes, monthString);
      const monthlyCashExpenses = calculateTotalForMonth(cashExpenses, monthString);
      
      // Calculate card expenses for the billing month
      // Card expenses appear in the billing_month, so we need to filter by that
      const monthlyCardExpenses = cardExpenses
        .filter(expense => {
          const billingMonth = format(new Date(expense.billing_month), 'MM/yyyy');
          return billingMonth === monthString;
        })
        .reduce((sum, expense) => sum + expense.amount, 0);
      
      return {
        month: format(month, 'MMM yyyy'),
        income: monthlyIncomes,
        expenses: monthlyCashExpenses,
        cardExpenses: monthlyCardExpenses
      };
    });
  }, [cashExpenses, incomes, cardExpenses, calculateTotalForMonth]);

  const totalIncome = useMemo(() => {
    const currentMonth = format(new Date(), 'MM/yyyy');
    return calculateTotalForMonth(incomes, currentMonth);
  }, [incomes, calculateTotalForMonth]);

  const totalExpenses = useMemo(() => {
    const currentMonth = format(new Date(), 'MM/yyyy');
    return calculateTotalForMonth(cashExpenses, currentMonth);
  }, [cashExpenses, calculateTotalForMonth]);

  return {
    monthlyData,
    totalIncome,
    totalExpenses,
    loading
  };
};
