
import { addMonths, format, parseISO } from 'date-fns';

export interface RecurrentTransaction {
  id: string;
  amount: number;
  date: string;
  due_date?: string;
  is_recurring: boolean;
  recurrence_months?: number;
  description: string;
  [key: string]: any;
}

export interface FilteredRecurrentTransaction extends RecurrentTransaction {
  displayDate: string;
  filterKey: string;
  originalDate: string;
  isRecurringOccurrence?: boolean;
  occurrenceIndex?: number;
}

export const useRecurrenceFilter = () => {
  const generateOccurrences = (transaction: RecurrentTransaction): FilteredRecurrentTransaction[] => {
    if (!transaction.is_recurring || !transaction.recurrence_months) {
      return [{
        ...transaction,
        displayDate: format(parseISO(transaction.date), 'dd/MM/yyyy'),
        filterKey: transaction.due_date 
          ? format(parseISO(transaction.due_date), 'MM/yyyy')
          : format(parseISO(transaction.date), 'MM/yyyy'),
        originalDate: transaction.date
      }];
    }

    const startDate = parseISO(transaction.date);
    const baseDueDate = transaction.due_date ? parseISO(transaction.due_date) : startDate;
    const occurrences: FilteredRecurrentTransaction[] = [];

    for (let i = 0; i < transaction.recurrence_months; i++) {
      // Data de lançamento sempre mantém a original
      const displayDate = format(startDate, 'dd/MM/yyyy');
      
      // Data de vencimento avança mensalmente
      const currentDueDate = addMonths(baseDueDate, i);
      const dueDateFormatted = format(currentDueDate, 'yyyy-MM-dd');
      
      // FilterKey usa o mês de vencimento para filtros corretos
      const filterKey = format(currentDueDate, 'MM/yyyy');
      
      occurrences.push({
        ...transaction,
        due_date: dueDateFormatted,
        displayDate,
        filterKey,
        originalDate: transaction.date,
        isRecurringOccurrence: i > 0,
        occurrenceIndex: i
      });
    }

    return occurrences;
  };

  const filterByReferenceMonth = (
    transactions: RecurrentTransaction[], 
    referenceMonth: string | Date
  ): FilteredRecurrentTransaction[] => {
    // Convert string to MM/yyyy format if it's a Date object
    const targetMonthKey = typeof referenceMonth === 'string' 
      ? referenceMonth 
      : format(referenceMonth, 'MM/yyyy');
    
    return transactions
      .flatMap(generateOccurrences)
      .filter(tx => tx.filterKey === targetMonthKey)
      .sort((a, b) => {
        // Sort by due date first (for proper chronological order)
        if (a.due_date && b.due_date) {
          const dueDateCompare = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
          if (dueDateCompare !== 0) return dueDateCompare;
        }
        
        // Then by original date, then by occurrence index
        const dateCompare = new Date(a.originalDate).getTime() - new Date(b.originalDate).getTime();
        if (dateCompare !== 0) return dateCompare;
        return (a.occurrenceIndex || 0) - (b.occurrenceIndex || 0);
      });
  };

  const calculateTotalForMonth = (
    transactions: RecurrentTransaction[],
    referenceMonth: string | Date
  ): number => {
    const filtered = filterByReferenceMonth(transactions, referenceMonth);
    return filtered.reduce((sum, tx) => sum + tx.amount, 0);
  };

  const getRecurrenceTooltip = (transaction: FilteredRecurrentTransaction): string => {
    if (!transaction.is_recurring || !transaction.recurrence_months) {
      return '';
    }

    const startDate = parseISO(transaction.originalDate);
    const baseDueDate = transaction.due_date ? parseISO(transaction.due_date) : startDate;
    const endDueDate = addMonths(baseDueDate, transaction.recurrence_months - 1);
    
    return `Recorrente: ${transaction.recurrence_months} parcelas (Vencimentos: ${format(baseDueDate, 'MMM/yy')}-${format(endDueDate, 'MMM/yy')})`;
  };

  return {
    generateOccurrences,
    filterByReferenceMonth,
    calculateTotalForMonth,
    getRecurrenceTooltip
  };
};
