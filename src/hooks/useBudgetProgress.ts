
import { useMemo } from 'react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useCardExpenses } from '@/hooks/useCardExpenses';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { MonthlyBudget } from './useMonthlyBudgets';

export interface BudgetProgress {
  categoryId: string;
  categoryName: string;
  budgetLimit: number;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
}

export const useBudgetProgress = (budgets: MonthlyBudget[], selectedMonth: Date) => {
  const { cashExpenses } = useSupabaseData();
  const { cardExpenses } = useCardExpenses();

  const budgetProgress = useMemo(() => {
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    const monthString = format(monthStart, 'yyyy-MM-dd');

    return budgets
      .filter(budget => budget.month_year === monthString)
      .map(budget => {
        // Calcular gastos em dinheiro para a categoria no mês
        const cashSpent = cashExpenses
          .filter(expense => {
            const expenseDate = new Date(expense.date);
            return expense.category_id === budget.category_id &&
                   expenseDate >= monthStart &&
                   expenseDate <= monthEnd;
          })
          .reduce((sum, expense) => sum + expense.amount, 0);

        // Calcular gastos no cartão para a categoria no mês
        const cardSpent = cardExpenses
          .filter(expense => {
            const billingDate = new Date(expense.billing_month);
            return (expense as any).category_id === budget.category_id &&
                   billingDate >= monthStart &&
                   billingDate <= monthEnd;
          })
          .reduce((sum, expense) => sum + expense.amount, 0);

        const totalSpent = cashSpent + cardSpent;
        const remaining = budget.budget_limit - totalSpent;
        const percentage = budget.budget_limit > 0 ? (totalSpent / budget.budget_limit) * 100 : 0;

        return {
          categoryId: budget.category_id,
          categoryName: budget.category?.name || 'Categoria Desconhecida',
          budgetLimit: budget.budget_limit,
          spent: totalSpent,
          remaining,
          percentage,
          isOverBudget: totalSpent > budget.budget_limit
        };
      });
  }, [budgets, cashExpenses, cardExpenses, selectedMonth]);

  const summary = useMemo(() => {
    const totalBudget = budgetProgress.reduce((sum, item) => sum + item.budgetLimit, 0);
    const totalSpent = budgetProgress.reduce((sum, item) => sum + item.spent, 0);
    const categoriesOverBudget = budgetProgress.filter(item => item.isOverBudget).length;

    return {
      totalBudget,
      totalSpent,
      totalRemaining: totalBudget - totalSpent,
      overallPercentage: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
      categoriesOverBudget,
      totalCategories: budgetProgress.length
    };
  }, [budgetProgress]);

  return {
    budgetProgress,
    summary
  };
};
