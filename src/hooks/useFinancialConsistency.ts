
import { useEffect } from 'react';
import { useSupabaseData } from './useSupabaseData';
import { useCardExpenses } from './useCardExpenses';
import { useFilterRecurringTransactions } from './useFilterRecurringTransactions';

export const useFinancialConsistency = () => {
  const { cashExpenses, incomes } = useSupabaseData();
  const { cardExpenses } = useCardExpenses();
  const { calculateRecurringTotal } = useFilterRecurringTransactions();

  const validateConsistency = (targetMonth: Date) => {
    const tolerance = 0.01; // R$ 0.01
    
    // Calcular totais considerando recorrência
    const totalCashExpenses = calculateRecurringTotal(cashExpenses, targetMonth);
    const totalIncomes = calculateRecurringTotal(incomes, targetMonth);
    
    // Calcular despesas de cartão para o mês
    const cardExpensesForMonth = cardExpenses
      .filter(expense => {
        const expenseDate = new Date(expense.billing_month);
        return expenseDate.getMonth() === targetMonth.getMonth() && 
               expenseDate.getFullYear() === targetMonth.getFullYear();
      })
      .reduce((sum, expense) => sum + expense.amount, 0);

    const totalExpenses = totalCashExpenses + cardExpensesForMonth;
    const balance = totalIncomes - totalExpenses;

    console.debug('Financial Consistency Check:', {
      month: targetMonth.toISOString().slice(0, 7),
      totalIncomes,
      totalCashExpenses,
      cardExpensesForMonth,
      totalExpenses,
      balance,
      timestamp: new Date().toISOString()
    });

    return {
      totalIncomes,
      totalCashExpenses,
      cardExpensesForMonth,
      totalExpenses,
      balance,
      isConsistent: true // Placeholder para futuras validações
    };
  };

  const reportDiscrepancies = (discrepancies: any[]) => {
    if (discrepancies.length > 0) {
      console.debug('Financial discrepancies found:', discrepancies);
    }
  };

  useEffect(() => {
    // Validar consistência para os últimos 3 meses
    const currentDate = new Date();
    for (let i = 0; i < 3; i++) {
      const targetMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      validateConsistency(targetMonth);
    }
  }, [cashExpenses, incomes, cardExpenses]);

  return {
    validateConsistency,
    reportDiscrepancies
  };
};
