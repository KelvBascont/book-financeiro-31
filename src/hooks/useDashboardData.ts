
import { useMemo } from 'react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useRecurrenceFilter } from '@/hooks/useRecurrenceFilter';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, addMonths } from 'date-fns';

export const useDashboardData = () => {
  const { cashExpenses, incomes, loading } = useSupabaseData();
  const { filterByReferenceMonth, calculateTotalForMonth } = useRecurrenceFilter();

  const monthlyData = useMemo(() => {
    const today = new Date();
    const startDate = subMonths(today, 5);
    const endDate = addMonths(today, 1);
    
    const months = eachMonthOfInterval({ start: startDate, end: endDate });
    
    return months.map(month => {
      const monthString = format(month, 'MM/yyyy');
      const monthlyIncomes = calculateTotalForMonth(incomes, monthString);
      const monthlyExpenses = calculateTotalForMonth(cashExpenses, monthString);
      
      return {
        month: format(month, 'MMM yyyy'),
        income: monthlyIncomes,
        expenses: monthlyExpenses
      };
    });
  }, [cashExpenses, incomes, calculateTotalForMonth]);

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
