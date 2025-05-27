
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CashExpense {
  id: string;
  description: string;
  amount: number;
  date: string;
  dueDate: string;
  isRecurring: boolean;
  recurrenceMonths?: number;
}

interface Income {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'salary' | 'bonus' | 'investment' | 'other';
  isRecurring: boolean;
  recurrenceMonths?: number;
}

interface FinancialContextType {
  cashExpenses: CashExpense[];
  incomes: Income[];
  selectedMonth: Date;
  setCashExpenses: (expenses: CashExpense[]) => void;
  setIncomes: (incomes: Income[]) => void;
  setSelectedMonth: (month: Date) => void;
  getTotalCashExpenses: (month?: Date) => number;
  getTotalIncomes: (month?: Date) => number;
  getBalance: (month?: Date) => number;
  getCashExpensesForMonth: (month: Date) => CashExpense[];
  getIncomesForMonth: (month: Date) => Income[];
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};

interface FinancialProviderProps {
  children: ReactNode;
}

export const FinancialProvider: React.FC<FinancialProviderProps> = ({ children }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [cashExpenses, setCashExpenses] = useState<CashExpense[]>([
    { 
      id: '1', 
      description: 'Conta de Luz', 
      amount: 150.50, 
      date: '2024-01-15',
      dueDate: '2024-01-25',
      isRecurring: true,
      recurrenceMonths: 12
    },
    { 
      id: '2', 
      description: 'Conta de Água', 
      amount: 85.30, 
      date: '2024-01-10',
      dueDate: '2024-01-20',
      isRecurring: true,
      recurrenceMonths: 12
    },
    { 
      id: '3', 
      description: 'Condomínio', 
      amount: 450.00, 
      date: '2024-01-05',
      dueDate: '2024-01-15',
      isRecurring: true,
      recurrenceMonths: 12
    },
  ]);

  const [incomes, setIncomes] = useState<Income[]>([
    { 
      id: '1', 
      description: 'Salário', 
      amount: 5000.00, 
      date: '2024-01-01', 
      type: 'salary',
      isRecurring: true,
      recurrenceMonths: 12
    },
    { 
      id: '2', 
      description: 'Freelance', 
      amount: 800.00, 
      date: '2024-01-15', 
      type: 'other',
      isRecurring: false
    },
  ]);

  const isInMonth = (itemDate: string, targetMonth: Date) => {
    const date = new Date(itemDate);
    return date.getMonth() === targetMonth.getMonth() && 
           date.getFullYear() === targetMonth.getFullYear();
  };

  const getCashExpensesForMonth = (month: Date) => {
    return cashExpenses.filter(expense => {
      if (expense.isRecurring) {
        const expenseDate = new Date(expense.date);
        const monthsDiff = (month.getFullYear() - expenseDate.getFullYear()) * 12 + 
                          (month.getMonth() - expenseDate.getMonth());
        return monthsDiff >= 0 && (!expense.recurrenceMonths || monthsDiff < expense.recurrenceMonths);
      }
      return isInMonth(expense.date, month);
    });
  };

  const getIncomesForMonth = (month: Date) => {
    return incomes.filter(income => {
      if (income.isRecurring) {
        const incomeDate = new Date(income.date);
        const monthsDiff = (month.getFullYear() - incomeDate.getFullYear()) * 12 + 
                          (month.getMonth() - incomeDate.getMonth());
        return monthsDiff >= 0 && (!income.recurrenceMonths || monthsDiff < income.recurrenceMonths);
      }
      return isInMonth(income.date, month);
    });
  };

  const getTotalCashExpenses = (month?: Date) => {
    const targetMonth = month || selectedMonth;
    const monthExpenses = getCashExpensesForMonth(targetMonth);
    return monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getTotalIncomes = (month?: Date) => {
    const targetMonth = month || selectedMonth;
    const monthIncomes = getIncomesForMonth(targetMonth);
    return monthIncomes.reduce((sum, income) => sum + income.amount, 0);
  };

  const getBalance = (month?: Date) => {
    return getTotalIncomes(month) - getTotalCashExpenses(month);
  };

  return (
    <FinancialContext.Provider
      value={{
        cashExpenses,
        incomes,
        selectedMonth,
        setCashExpenses,
        setIncomes,
        setSelectedMonth,
        getTotalCashExpenses,
        getTotalIncomes,
        getBalance,
        getCashExpensesForMonth,
        getIncomesForMonth,
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};
