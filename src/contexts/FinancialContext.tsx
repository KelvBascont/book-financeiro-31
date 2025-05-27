
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CashExpense {
  id: string;
  description: string;
  amount: number;
  date: string;
}

interface Income {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'salary' | 'bonus' | 'investment' | 'other';
}

interface FinancialContextType {
  cashExpenses: CashExpense[];
  incomes: Income[];
  setCashExpenses: (expenses: CashExpense[]) => void;
  setIncomes: (incomes: Income[]) => void;
  getTotalCashExpenses: () => number;
  getTotalIncomes: () => number;
  getBalance: () => number;
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
  const [cashExpenses, setCashExpenses] = useState<CashExpense[]>([
    { id: '1', description: 'Conta de Luz', amount: 150.50, date: '2024-01-15' },
    { id: '2', description: 'Conta de Água', amount: 85.30, date: '2024-01-10' },
    { id: '3', description: 'Condomínio', amount: 450.00, date: '2024-01-05' },
  ]);

  const [incomes, setIncomes] = useState<Income[]>([
    { id: '1', description: 'Salário', amount: 5000.00, date: '2024-01-01', type: 'salary' },
    { id: '2', description: 'Freelance', amount: 800.00, date: '2024-01-15', type: 'other' },
  ]);

  const getTotalCashExpenses = () => {
    return cashExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getTotalIncomes = () => {
    return incomes.reduce((sum, income) => sum + income.amount, 0);
  };

  const getBalance = () => {
    return getTotalIncomes() - getTotalCashExpenses();
  };

  return (
    <FinancialContext.Provider
      value={{
        cashExpenses,
        incomes,
        setCashExpenses,
        setIncomes,
        getTotalCashExpenses,
        getTotalIncomes,
        getBalance,
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};
