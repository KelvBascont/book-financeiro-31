
import { useMemo } from 'react';
import { useIntegratedFinancialData } from '@/hooks/useIntegratedFinancialData';
import { useCardExpenses } from '@/hooks/useCardExpenses';
import { useBudgetProgress } from '@/hooks/useBudgetProgress';
import { useMonthlyBudgets } from '@/hooks/useMonthlyBudgets';
import { format, subMonths, startOfMonth } from 'date-fns';

export interface FinancialInsight {
  type: 'warning' | 'success' | 'info' | 'critical';
  title: string;
  description: string;
  value?: number;
  trend?: 'up' | 'down' | 'stable';
  actionable?: boolean;
  actionTip?: string;
}

export const useAdvancedInsights = () => {
  const currentMonth = format(new Date(), 'MM/yyyy');
  const previousMonth = format(subMonths(new Date(), 1), 'MM/yyyy');
  
  const { expensesTotal: currentExpenses, incomesTotal: currentIncome } = useIntegratedFinancialData(currentMonth);
  const { expensesTotal: previousExpenses, incomesTotal: previousIncome } = useIntegratedFinancialData(previousMonth);
  const { cardExpenses } = useCardExpenses();
  const { budgets } = useMonthlyBudgets();
  const { budgetProgress } = useBudgetProgress(budgets, startOfMonth(new Date()));

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
        actionable: true,
        actionTip: 'Revise suas categorias de gastos e identifique onde houve maior aumento. Considere criar um orçamento mais restritivo para as categorias que mais cresceram. Analise se foram gastos pontuais ou se representam uma nova tendência de consumo.'
      });
    } else if (expenseChange < -15) {
      insights.push({
        type: 'success',
        title: 'Excelente Controle de Gastos',
        description: `Você reduziu seus gastos em ${Math.abs(expenseChange).toFixed(1)}% este mês`,
        value: Math.abs(expenseChange),
        trend: 'down',
        actionable: false,
        actionTip: 'Parabéns! Continue com essa disciplina financeira. Considere direcionar essa economia para uma reserva de emergência ou investimentos. Documente quais estratégias funcionaram para manter esse controle.'
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
        actionable: false,
        actionTip: 'Ótimo momento para aumentar sua reserva de emergência ou fazer aportes em investimentos. Considere destinar pelo menos 20% desse aumento para poupança antes de ajustar seu padrão de vida.'
      });
    } else if (incomeChange < -10) {
      insights.push({
        type: 'warning',
        title: 'Queda nas Receitas',
        description: `Suas receitas diminuíram ${Math.abs(incomeChange).toFixed(1)}% este mês`,
        value: Math.abs(incomeChange),
        trend: 'down',
        actionable: true,
        actionTip: 'Revise seu orçamento e corte gastos não essenciais. Priorize despesas básicas como alimentação, moradia e transporte. Considere buscar fontes de renda complementar e evite usar cartão de crédito para cobrir a diferença.'
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
        actionable: true,
        actionTip: 'URGENTE: Reduza imediatamente o uso do cartão de crédito. Quite o máximo possível da fatura atual para evitar juros. Negocie parcelamentos se necessário. Estabeleça um limite mental de até 30% da renda para cartão.'
      });
    }

    // Análise de orçamento
    const overBudgetCategories = budgetProgress.filter(progress => progress.isOverBudget);
    if (overBudgetCategories.length > 0) {
      const categoryNames = overBudgetCategories.map(c => c.categoryName).join(', ');
      insights.push({
        type: 'warning',
        title: 'Categorias Excedidas',
        description: `${overBudgetCategories.length} categoria(s) excederam o orçamento este mês`,
        actionable: true,
        actionTip: `Categorias problemáticas: ${categoryNames}. Analise os gastos dessas categorias e identifique compras desnecessárias. Considere reajustar os limites do orçamento se os gastos foram justificados, ou implemente alertas para controle em tempo real.`
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
        actionable: false,
        actionTip: 'Excelente! Com essa taxa de poupança, considere diversificar seus investimentos. Mantenha a reserva de emergência (6-12 meses de gastos) e invista o excedente em diferentes classes de ativos como ações, fundos e títulos.'
      });
    } else if (savingsRate < 5) {
      insights.push({
        type: 'critical',
        title: 'Taxa de Poupança Baixa',
        description: `Você está poupando apenas ${savingsRate.toFixed(1)}% da sua renda`,
        value: savingsRate,
        actionable: true,
        actionTip: 'ATENÇÃO: Sua capacidade de poupança está muito baixa. Comece cortando gastos supérfluos e tente poupar pelo menos 10% da renda. Use a regra 50-30-20: 50% necessidades, 30% desejos, 20% poupança/investimentos.'
      });
    }

    return insights;
  }, [currentExpenses, previousExpenses, currentIncome, previousIncome, cardExpenses, budgetProgress, currentMonth]);

  return { insights };
};
