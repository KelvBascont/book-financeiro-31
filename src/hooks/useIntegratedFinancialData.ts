
import { useMemo } from 'react';
import { useBills } from '@/hooks/useBills';
import { useCashExpenses } from '@/hooks/useCashExpenses';
import { useIncomes } from '@/hooks/useIncomes';
import { useRecurrenceFilter } from '@/hooks/useRecurrenceFilter';

export const useIntegratedFinancialData = (selectedMonth: string) => {
  const { bills, loading: billsLoading } = useBills();
  const { cashExpenses, loading: expensesLoading } = useCashExpenses();
  const { incomes, loading: incomesLoading } = useIncomes();
  const { filterByReferenceMonth, calculateTotalForMonth } = useRecurrenceFilter();

  const loading = billsLoading || expensesLoading || incomesLoading;

  // Filtrar contas pagas do tipo payable (despesas)
  const paidPayableBills = useMemo(() => {
    return bills
      .filter(bill => bill.type === 'payable' && bill.status === 'paid')
      .map(bill => ({
        id: bill.id,
        description: bill.title,
        amount: -(bill.paid_amount || bill.amount), // Negativo para despesas
        // Usar a data de vencimento como referência principal para o mês
        date: bill.due_date,
        due_date: bill.due_date,
        paid_date: bill.paid_date,
        is_recurring: bill.is_recurring || false,
        recurrence_months: bill.recurrence_months,
        category_id: bill.category_id,
        user_id: bill.user_id,
        source: 'bill' as const,
        originalBill: bill
      }));
  }, [bills]);

  // Filtrar contas recebidas do tipo receivable (receitas)
  const paidReceivableBills = useMemo(() => {
    return bills
      .filter(bill => bill.type === 'receivable' && bill.status === 'paid')
      .map(bill => ({
        id: bill.id,
        description: bill.title,
        amount: bill.paid_amount || bill.amount, // Positivo para receitas
        // Usar a data de vencimento como referência principal para o mês
        date: bill.due_date,
        due_date: bill.due_date,
        paid_date: bill.paid_date,
        type: 'other' as const,
        is_recurring: bill.is_recurring || false,
        recurrence_months: bill.recurrence_months,
        category_id: bill.category_id,
        user_id: bill.user_id,
        source: 'bill' as const,
        originalBill: bill
      }));
  }, [bills]);

  // Combinar despesas correntes com contas pagas
  const integratedExpenses = useMemo(() => {
    const cashExpensesWithSource = cashExpenses.map(expense => ({
      ...expense,
      source: 'cash_expense' as const
    }));
    
    const combined = [...cashExpensesWithSource, ...paidPayableBills];
    return filterByReferenceMonth(combined, selectedMonth);
  }, [cashExpenses, paidPayableBills, selectedMonth, filterByReferenceMonth]);

  // Combinar receitas com contas recebidas
  const integratedIncomes = useMemo(() => {
    const incomesWithSource = incomes.map(income => ({
      ...income,
      source: 'income' as const
    }));
    
    const combined = [...incomesWithSource, ...paidReceivableBills];
    return filterByReferenceMonth(combined, selectedMonth);
  }, [incomes, paidReceivableBills, selectedMonth, filterByReferenceMonth]);

  // Calcular totais
  const expensesTotal = useMemo(() => {
    const cashExpensesTotal = calculateTotalForMonth(cashExpenses, selectedMonth);
    const billsTotal = calculateTotalForMonth(paidPayableBills, selectedMonth);
    return cashExpensesTotal + billsTotal;
  }, [cashExpenses, paidPayableBills, selectedMonth, calculateTotalForMonth]);

  const incomesTotal = useMemo(() => {
    const incomesBaseTotal = calculateTotalForMonth(incomes, selectedMonth);
    const billsTotal = calculateTotalForMonth(paidReceivableBills, selectedMonth);
    return incomesBaseTotal + billsTotal;
  }, [incomes, paidReceivableBills, selectedMonth, calculateTotalForMonth]);

  return {
    loading,
    integratedExpenses,
    integratedIncomes,
    expensesTotal,
    incomesTotal,
    paidPayableBills,
    paidReceivableBills
  };
};
