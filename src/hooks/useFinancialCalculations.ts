
import { useMemo } from 'react';
import { format, addMonths } from 'date-fns';
import { useSupabaseData } from './useSupabaseData';
import { useCardExpenses } from './useCardExpenses';
import { useRecurrenceFilter } from './useRecurrenceFilter';

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  currentMonthCardExpenses: number;
  currentBalance: number;
}

export const useFinancialCalculations = (selectedMonth: Date) => {
  const { cashExpenses, incomes } = useSupabaseData();
  const { cardExpenses } = useCardExpenses();
  const { calculateTotalForMonth } = useRecurrenceFilter();

  const financialSummary = useMemo((): FinancialSummary => {
    const monthString = format(selectedMonth, 'MM/yyyy');
    
    // Use recurring logic for incomes and cash expenses
    const totalIncomes = calculateTotalForMonth(incomes, monthString);
    const totalCashExpenses = calculateTotalForMonth(cashExpenses, monthString);
    
    // Calculate card expenses for selected month using real data
    // Os gastos do cartão aparecem +1 mês após o mês de cobrança
    const previousMonth = addMonths(selectedMonth, -1);
    const previousMonthString = format(previousMonth, 'MM/yyyy');
    
    const totalCardExpenses = cardExpenses
      .filter(expense => {
        const expenseMonth = format(new Date(expense.billing_month), 'MM/yyyy');
        return expenseMonth === previousMonthString;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    const currentBalance = totalIncomes - totalCashExpenses - totalCardExpenses;
    
    return {
      totalIncome: totalIncomes,
      totalExpenses: totalCashExpenses,
      currentMonthCardExpenses: totalCardExpenses,
      currentBalance
    };
  }, [selectedMonth, incomes, cashExpenses, cardExpenses, calculateTotalForMonth]);

  return {
    financialSummary,
    rawData: {
      cashExpenses,
      incomes,
      cardExpenses
    }
  };
};
