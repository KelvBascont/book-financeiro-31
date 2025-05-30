
import { addMonths, format, isWithinInterval, parseISO } from 'date-fns';

export interface RecurringTransaction {
  id: string;
  amount: number;
  date: string;
  is_recurring: boolean;
  recurrence_months?: number;
  description: string;
  [key: string]: any;
}

export interface FilteredTransaction extends RecurringTransaction {
  displayDate: string;
  filteredDate: string;
  isRecurringOccurrence?: boolean;
  originalDate: string;
}

export const useFilterRecurringTransactions = () => {
  const getRecurringDates = (startDate: string, recurrenceMonths: number): Date[] => {
    const dates: Date[] = [];
    const start = parseISO(startDate);
    const currentDate = new Date();
    
    // Gerar ocorrências até 12 meses no futuro
    const endLimit = addMonths(currentDate, 12);
    
    let currentOccurrence = start;
    let monthsElapsed = 0;
    
    while (currentOccurrence <= endLimit && monthsElapsed < recurrenceMonths) {
      dates.push(new Date(currentOccurrence));
      currentOccurrence = addMonths(start, monthsElapsed + 1);
      monthsElapsed++;
    }
    
    return dates;
  };

  const filterRecurringTransactions = (
    transactions: RecurringTransaction[], 
    monthFilter?: Date
  ): FilteredTransaction[] => {
    return transactions.flatMap(transaction => {
      if (!transaction.is_recurring) {
        const filtered: FilteredTransaction = {
          ...transaction,
          displayDate: transaction.date,
          filteredDate: format(parseISO(transaction.date), 'MM/yyyy'),
          originalDate: transaction.date
        };
        
        // Se tem filtro de mês, verificar se a transação se enquadra
        if (monthFilter) {
          const transactionMonth = format(parseISO(transaction.date), 'MM/yyyy');
          const filterMonth = format(monthFilter, 'MM/yyyy');
          return transactionMonth === filterMonth ? [filtered] : [];
        }
        
        return [filtered];
      }
      
      const occurrences = getRecurringDates(
        transaction.date,
        transaction.recurrence_months || 12
      );
      
      const recurringOccurrences = occurrences.map(date => ({
        ...transaction,
        displayDate: format(date, 'yyyy-MM-dd'),
        filteredDate: format(date, 'MM/yyyy'),
        isRecurringOccurrence: true,
        originalDate: transaction.date
      }));
      
      // Se tem filtro de mês, filtrar as ocorrências
      if (monthFilter) {
        const filterMonth = format(monthFilter, 'MM/yyyy');
        return recurringOccurrences.filter(occurrence => 
          occurrence.filteredDate === filterMonth
        );
      }
      
      return recurringOccurrences;
    });
  };

  const isWithinRecurringPeriod = (transaction: RecurringTransaction, targetMonth: Date): boolean => {
    if (!transaction.is_recurring) {
      const transactionDate = parseISO(transaction.date);
      return format(transactionDate, 'MM/yyyy') === format(targetMonth, 'MM/yyyy');
    }
    
    const startDate = parseISO(transaction.date);
    const endDate = addMonths(startDate, transaction.recurrence_months || 12);
    
    return isWithinInterval(targetMonth, { start: startDate, end: endDate });
  };

  const calculateRecurringTotal = (
    transactions: RecurringTransaction[], 
    targetMonth: Date
  ): number => {
    const filteredTransactions = filterRecurringTransactions(transactions, targetMonth);
    return filteredTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  };

  return {
    filterRecurringTransactions,
    getRecurringDates,
    isWithinRecurringPeriod,
    calculateRecurringTotal
  };
};
