
export interface Card {
  id: string;
  name: string;
  dueDate: number; // dia do vencimento (1-31)
  closingDate: number; // dia do fechamento (1-31)
  createdAt: Date;
}

export interface CardExpense {
  id: string;
  cardId: string;
  purchaseDate: Date;
  description: string;
  amount: number;
  isInstallment: boolean;
  installments?: number;
  currentInstallment?: number;
  billingMonth: Date; // mês de cobrança calculado
  createdAt: Date;
}

export interface SavingsGoal {
  id: string;
  name: string;
  initialAmount: number;
  currentAmount: number;
  createdAt: Date;
}

export interface SavingsTransaction {
  id: string;
  goalId: string;
  amount: number;
  date: Date;
  description?: string;
}

export interface Vehicle {
  id: string;
  description: string;
  totalAmount: number;
  installments: number;
  startDate: Date;
  installmentValue: number;
}

export interface VehiclePayment {
  id: string;
  vehicleId: string;
  installmentNumber: number;
  dueDate: Date;
  isPaid: boolean;
  paidDate?: Date;
}

export interface Investment {
  id: string;
  ticker: string;
  averagePrice: number;
  quantity: number;
  currentPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MonthlyOverview {
  month: Date;
  cardExpenses: number;
  savingsTotal: number;
  vehiclePayments: number;
  investmentValue: number;
  investmentGain: number;
}
