import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import type { CashExpense } from '@/hooks/useCashExpenses';
import type { Income } from '@/hooks/useIncomes';

interface FinancialContextType {
  cashExpenses: CashExpense[];
  incomes: Income[];
  selectedMonth: Date;
  loading: boolean;
  setSelectedMonth: (month: Date) => void;
  getTotalCashExpenses: (month?: Date) => number;
  getTotalIncomes: (month?: Date) => number;
  getBalance: (month?: Date) => number;
  getCashExpensesForMonth: (month: Date) => CashExpense[];
  getIncomesForMonth: (month: Date) => Income[];
  addCashExpense: (expense: Omit<CashExpense, 'id' | 'user_id'>) => Promise<any>;
  addIncome: (income: Omit<Income, 'id' | 'user_id'>) => Promise<any>;
  deleteCashExpense: (id: string) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
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
  const {
    cashExpenses,
    incomes,
    loading,
    addCashExpense,
    addIncome,
    deleteCashExpense,
    deleteIncome
  } = useSupabaseData();

  const isInMonth = (itemDate: string, targetMonth: Date) => {
    const date = new Date(itemDate);
    return date.getMonth() === targetMonth.getMonth() && 
           date.getFullYear() === targetMonth.getFullYear();
  };

  const getCashExpensesForMonth = (month: Date) => {
    return cashExpenses.filter(expense => {
      if (expense.is_recurring) {
        const expenseDate = new Date(expense.date);
        const monthsDiff = (month.getFullYear() - expenseDate.getFullYear()) * 12 + 
                          (month.getMonth() - expenseDate.getMonth());
        return monthsDiff >= 0 && (!expense.recurrence_months || monthsDiff < expense.recurrence_months);
      }
      return isInMonth(expense.due_date, month);
    });
  };

  const getIncomesForMonth = (month: Date) => {
    return incomes.filter(income => {
      if (income.is_recurring) {
        const incomeDate = new Date(income.date);
        const monthsDiff = (month.getFullYear() - incomeDate.getFullYear()) * 12 + 
                          (month.getMonth() - incomeDate.getMonth());
        return monthsDiff >= 0 && (!income.recurrence_months || monthsDiff < income.recurrence_months);
      }
      return isInMonth(income.date, month);
    });
  };

  const getTotalCashExpenses = (month?: Date) => {
    const targetMonth = month || selectedMonth;
    const monthExpenses = getCashExpensesForMonth(targetMonth);
    return monthExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  };

  const getTotalIncomes = (month?: Date) => {
    const targetMonth = month || selectedMonth;
    const monthIncomes = getIncomesForMonth(targetMonth);
    return monthIncomes.reduce((sum, income) => sum + Number(income.amount), 0);
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
        loading,
        setSelectedMonth,
        getTotalCashExpenses,
        getTotalIncomes,
        getBalance,
        getCashExpensesForMonth,
        getIncomesForMonth,
        addCashExpense,
        addIncome,
        deleteCashExpense,
        deleteIncome,
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};
