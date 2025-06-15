
import { useMemo } from 'react';
import { useIntegratedFinancialData } from '@/hooks/useIntegratedFinancialData';
import { useCardExpenses } from '@/hooks/useCardExpenses';
import { useBills } from '@/hooks/useBills';
import { format, addMonths, eachMonthOfInterval, startOfMonth, endOfMonth, isAfter, isBefore } from 'date-fns';

export interface CashFlowPrediction {
  month: string;
  projectedIncome: number;
  projectedExpenses: number;
  projectedCardExpenses: number;
  projectedBalance: number;
  confidence: 'high' | 'medium' | 'low';
  risks: string[];
  opportunities: string[];
}

export const useCashFlowPredictions = () => {
  const { cardExpenses } = useCardExpenses();
  const { bills } = useBills();
  const currentMonth = format(new Date(), 'MM/yyyy');
  const { incomesTotal, expensesTotal } = useIntegratedFinancialData(currentMonth);

  const predictions = useMemo(() => {
    const today = new Date();
    const futureMonths = eachMonthOfInterval({
      start: addMonths(today, 1),
      end: addMonths(today, 6)
    });

    return futureMonths.map(month => {
      const monthString = format(month, 'MM/yyyy');
      
      // Calcular receitas recorrentes projetadas
      const recurringIncomes = bills.filter(bill => 
        bill.type === 'receivable' && 
        bill.is_recurring &&
        bill.status === 'pending'
      );
      const projectedIncome = recurringIncomes.reduce((sum, bill) => sum + bill.amount, 0) || incomesTotal;

      // Calcular despesas recorrentes projetadas
      const recurringExpenses = bills.filter(bill => 
        bill.type === 'payable' && 
        bill.is_recurring &&
        bill.status === 'pending'
      );
      const projectedExpenses = recurringExpenses.reduce((sum, bill) => sum + bill.amount, 0) || Math.abs(expensesTotal);

      // Calcular gastos de cartão projetados (parcelas futuras)
      const futureCardExpenses = cardExpenses.filter(expense => {
        const billingMonth = format(new Date(expense.billing_month), 'MM/yyyy');
        return billingMonth === monthString;
      });
      const projectedCardExpenses = futureCardExpenses.reduce((sum, expense) => sum + expense.amount, 0);

      const projectedBalance = projectedIncome - projectedExpenses - projectedCardExpenses;

      // Calcular confiança baseada em dados históricos
      const confidence = recurringIncomes.length > 0 && recurringExpenses.length > 0 ? 'high' : 
                        futureCardExpenses.length > 0 ? 'medium' : 'low';

      // Identificar riscos
      const risks: string[] = [];
      if (projectedBalance < 0) risks.push('Saldo negativo projetado');
      if (projectedCardExpenses > projectedIncome * 0.3) risks.push('Gastos de cartão altos');
      if (recurringExpenses.length === 0) risks.push('Falta de dados de despesas recorrentes');

      // Identificar oportunidades
      const opportunities: string[] = [];
      if (projectedBalance > projectedIncome * 0.2) opportunities.push('Oportunidade de investimento');
      if (projectedExpenses < incomesTotal * 0.7) opportunities.push('Margem para aumentar poupança');

      return {
        month: format(month, 'MMM/yyyy'),
        projectedIncome,
        projectedExpenses,
        projectedCardExpenses,
        projectedBalance,
        confidence,
        risks,
        opportunities
      };
    });
  }, [cardExpenses, bills, incomesTotal, expensesTotal]);

  return { predictions };
};
