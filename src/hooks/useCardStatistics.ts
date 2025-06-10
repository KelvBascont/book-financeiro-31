
import { format, addMonths, subMonths } from 'date-fns';
import { useCardExpenses } from '@/hooks/useCardExpenses';
import { useSupabaseTables } from '@/hooks/useSupabaseTables';

export const useCardStatistics = (selectedMonth: Date) => {
  const { cards } = useSupabaseTables();
  const { cardExpenses } = useCardExpenses();
  
  const currentMonthStr = format(selectedMonth, 'yyyy-MM');
  
  // Calcular total em faturas de todos os cartões no mês selecionado
  const totalInBills = cardExpenses
    .filter(expense => {
      const expenseMonth = format(new Date(expense.billing_month), 'yyyy-MM');
      return expenseMonth === currentMonthStr;
    })
    .reduce((sum, expense) => sum + expense.amount, 0);

  // Calcular estatísticas por cartão
  const getCardStats = (card: any) => {
    const cardExpensesCurrentMonth = cardExpenses.filter(expense => {
      const expenseMonth = format(new Date(expense.billing_month), 'yyyy-MM');
      return expenseMonth === currentMonthStr && expense.card_id === card.id;
    });

    const currentBill = cardExpensesCurrentMonth.reduce((sum, expense) => sum + expense.amount, 0);
    return {
      currentBill,
      expensesCount: cardExpensesCurrentMonth.length,
      dueDate: new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, card.due_date)
    };
  };

  // Calcular faturas por cartão
  const calculateBills = (paidBills: Set<string>) => {
    return cards.map(card => {
      const stats = getCardStats(card);
      const today = new Date();
      const billKey = `${card.id}-${currentMonthStr}`;
      let status: 'pending' | 'overdue' | 'paid' = 'pending';
      
      if (paidBills.has(billKey)) {
        status = 'paid';
      } else if (stats.dueDate < today && stats.currentBill > 0) {
        status = 'overdue';
      }
      
      return {
        cardId: card.id,
        cardName: card.name,
        totalAmount: stats.currentBill,
        dueDate: stats.dueDate,
        status,
        expensesCount: stats.expensesCount
      };
    }).filter(bill => bill.totalAmount > 0);
  };

  // Filtrar despesas do mês selecionado para últimas compras
  const monthlyExpenses = cardExpenses.filter(expense => {
    const expenseMonth = format(new Date(expense.billing_month), 'yyyy-MM');
    return expenseMonth === currentMonthStr;
  }).sort((a, b) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime());

  return {
    totalInBills,
    calculateBills,
    monthlyExpenses,
    currentMonthStr,
    getCardStats
  };
};
