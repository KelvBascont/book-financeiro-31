// FinancialContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useSupabaseData } from '@/hooks/useSupabaseData';

interface CashExpense {/* manter mesma estrutura anterior */}
interface Income {/* manter mesma estrutura anterior */}

interface Card {
  id: string;
  name: string;
  due_date: number;
  closing_date: number;
  user_id: string;
  created_at: string;
}

interface CardExpense {
  id: string;
  card_id: string;
  description: string;
  amount: number;
  purchase_date: string;
  is_installment: boolean;
  installments: number | null;
  billing_month: string;
  user_id: string;
}

interface FinancialContextType {
  // Existing properties
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
  addCashExpense: (expense: Omit<CashExpense, 'id' | 'user_id'>) => Promise<void>;
  addIncome: (income: Omit<Income, 'id' | 'user_id'>) => Promise<void>;
  deleteCashExpense: (id: string) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;

  // New card properties
  cards: Card[];
  cardExpenses: CardExpense[];
  addCard: (card: Omit<Card, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  addCardExpense: (expense: Omit<CardExpense, 'id' | 'user_id' | 'billing_month'>) => Promise<void>;
  deleteCardExpense: (id: string) => Promise<void>;
  getCardsForMonth: (month: Date) => CardExpense[];
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
    cards,
    cardExpenses,
    loading,
    addCashExpense,
    addIncome,
    deleteCashExpense,
    deleteIncome,
    addCard,
    deleteCard,
    addCardExpense,
    deleteCardExpense
  } = useSupabaseData();

  // Existing filter functions...

  // New card expense filter
  const getCardsForMonth = (month: Date) => {
    return cardExpenses.filter(expense => {
      const billingMonth = new Date(expense.billing_month);
      return billingMonth.getMonth() === month.getMonth() && 
             billingMonth.getFullYear() === month.getFullYear();
    });
  };

  return (
    <FinancialContext.Provider
      value={{
        // Existing values
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

        // New card values
        cards,
        cardExpenses,
        addCard,
        deleteCard,
        addCardExpense,
        deleteCardExpense,
        getCardsForMonth
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};
