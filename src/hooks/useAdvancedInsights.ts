
import { useMemo } from 'react';
import { useIntegratedFinancialData } from '@/hooks/useIntegratedFinancialData';
import { useCardExpenses } from '@/hooks/useCardExpenses';
import { useBudgetProgress } from '@/hooks/useBudgetProgress';
import { format, subMonths, startOfMonth } from 'date-fns';

export interface FinancialInsight {
  type: 'warning' | 'success' | 'info' | 'critical';
  title: string;
  description: string;
  value?: number;
  trend?: 'up' | 'down' | 'stable';
  actionable?: boolean;
}

export const useAdvancedInsights = () => {
  const currentMonth = format(new Date(), 'MM/yyyy');
  const previousMonth = format(subMonths(new Date(), 1), 'MM/yyyy');
  
  const { expensesTotal: currentExpenses, incomesTotal: currentIncome } = useIntegratedFinancialData(currentMonth);
  const { expensesTotal: previousExpenses, incomesTotal: previousIncome } = useIntegratedFinancialData(previousMonth);
  const { cardExpenses } = useCardExpenses();
  const { budgetProgress } = useBudgetProgress(startOfMonth(new Date()));

  const insights = useMemo((): FinancialInsight[] => {
    const insights: FinancialInsight[] = [];

    // Análise de tendência de gastos
    const expenseChange = ((Math.abs(currentExpenses) - Math.abs(previousExpenses)) / Math.abs(previousExpenses)) * 100;
    if (expenseChange > 15) {
      insights.push({
        type: 'warning',
        title: 'Aumento Significativo de Gastos',
        description: `Seus gastos aumentaram ${expenseChange.toFixed(1)}% em relação ao mês passado`,
        value: expenseChange,
        trend: 'up',
        actionable: true
      });
    } else if (expenseChange < -15) {
      insights.push({
        type: 'success',
        title: 'Excelente Controle de Gastos',
        description: `Você reduziu seus gastos em ${Math.abs(expenseChange).toFixed(1)}% este mês`,
        value: Math.abs(expenseChange),
        trend: 'down',
        actionable: false
      });
    }

    // Análise de receitas
    const incomeChange = ((currentIncome - previousIncome) / previousIncome) * 100;
    if (incomeChange > 10) {
      insights.push({
        type: 'success',
        title: 'Crescimento de Receitas',
        description: `Suas receitas cresceram ${incomeChange.toFixed(1)}% este mês`,
        value: incomeChange,
        trend: 'up',
        actionable: false
      });
    } else if (incomeChange < -10) {
      insights.push({
        type: 'warning',
        title: 'Queda nas Receitas',
        description: `Suas receitas diminuíram ${Math.abs(incomeChange).toFixed(1)}% este mês`,
        value: Math.abs(incomeChange),
        trend: 'down',
        actionable: true
      });
    }

    // Análise de cartão de crédito
    const currentMonthCardExpenses = cardExpenses
      .filter(expense => {
        const billingMonth = format(new Date(expense.billing_month), 'MM/yyyy');
        return billingMonth === currentMonth;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);

    if (currentMonthCardExpenses > currentIncome * 0.4) {
      insights.push({
        type: 'critical',
        title: 'Gastos de Cartão Elevados',
        description: `Gastos no cartão representam ${((currentMonthCardExpenses / currentIncome) * 100).toFixed(1)}% da sua renda`,
        value: currentMonthCardExpenses,
        trend: 'up',
        actionable: true
      });
    }

    // Análise de orçamento
    const overBudgetCategories = budgetProgress.filter(progress => progress.isOverBudget);
    if (overBudgetCategories.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Categorias Excedidas',
        description: `${overBudgetCategories.length} categoria(s) excederam o orçamento este mês`,
        actionable: true
      });
    }

    // Análise de saúde financeira geral
    const savingsRate = ((currentIncome - Math.abs(currentExpenses) - currentMonthCardExpenses) / currentIncome) * 100;
    if (savingsRate > 20) {
      insights.push({
        type: 'success',
        title: 'Excelente Taxa de Poupança',
        description: `Você está poupando ${savingsRate.toFixed(1)}% da sua renda`,
        value: savingsRate,
        actionable: false
      });
    } else if (savingsRate < 5) {
      insights.push({
        type: 'critical',
        title: 'Taxa de Poupança Baixa',
        description: `Você está poupando apenas ${savingsRate.toFixed(1)}% da sua renda`,
        value: savingsRate,
        actionable: true
      });
    }

    return insights;
  }, [currentExpenses, previousExpenses, currentIncome, previousIncome, cardExpenses, budgetProgress, currentMonth]);

  return { insights };
};
