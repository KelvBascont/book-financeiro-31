
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Card {
  id: string;
  user_id: string;
  name: string;
  due_date: number;
  closing_date: number;
  created_at: string;
}

export interface CardExpense {
  id: string;
  user_id: string;
  card_id: string;
  description: string;
  amount: number;
  purchase_date: string;
  billing_month: string;
  is_installment: boolean;
  installments?: number;
  current_installment?: number;
  created_at: string;
}

export interface Investment {
  id: string;
  user_id: string;
  ticker: string;
  quantity: number;
  average_price: number;
  current_price: number;
  created_at: string;
  updated_at: string;
  last_manual_update?: string;
}

export interface Vehicle {
  id: string;
  user_id: string;
  description: string;
  total_amount: number;
  installments: number;
  installment_value: number;
  start_date: string;
  created_at: string;
  paid_installments: number;
}

export interface VehiclePayment {
  id: string;
  user_id: string;
  vehicle_id: string;
  installment_number: number;
  due_date: string;
  is_paid: boolean;
  paid_date?: string;
  created_at: string;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  initial_amount: number;
  created_at: string;
}

export interface SavingsTransaction {
  id: string;
  user_id: string;
  goal_id: string;
  amount: number;
  date: string;
  description?: string;
  created_at: string;
}

export const useSupabaseTables = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  const [cards, setCards] = useState<Card[]>([]);
  const [cardExpenses, setCardExpenses] = useState<CardExpense[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehiclePayments, setVehiclePayments] = useState<VehiclePayment[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [savingsTransactions, setSavingsTransactions] = useState<SavingsTransaction[]>([]);

  // Fetch Cards
  const fetchCards = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCards(data || []);
    } catch (error) {
      console.error('Error fetching cards:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar cartões",
        variant: "destructive"
      });
    }
  };

  // Fetch Card Expenses
  const fetchCardExpenses = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('card_expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCardExpenses(data || []);
    } catch (error) {
      console.error('Error fetching card expenses:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar despesas de cartão",
        variant: "destructive"
      });
    }
  };

  // Fetch Investments
  const fetchInvestments = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvestments(data || []);
    } catch (error) {
      console.error('Error fetching investments:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar investimentos",
        variant: "destructive"
      });
    }
  };

  // Fetch Vehicles
  const fetchVehicles = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar veículos",
        variant: "destructive"
      });
    }
  };

  // Fetch Vehicle Payments
  const fetchVehiclePayments = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('vehicle_payments')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setVehiclePayments(data || []);
    } catch (error) {
      console.error('Error fetching vehicle payments:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar parcelas de veículos",
        variant: "destructive"
      });
    }
  };

  // Fetch Savings Goals
  const fetchSavingsGoals = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavingsGoals(data || []);
    } catch (error) {
      console.error('Error fetching savings goals:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar metas de poupança",
        variant: "destructive"
      });
    }
  };

  // Fetch Savings Transactions
  const fetchSavingsTransactions = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('savings_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavingsTransactions(data || []);
    } catch (error) {
      console.error('Error fetching savings transactions:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar transações de poupança",
        variant: "destructive"
      });
    }
  };

  // CRUD Operations for Cards
  const addCard = async (card: Omit<Card, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('cards')
        .insert([{ ...card, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setCards(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Cartão adicionado com sucesso"
      });
      return data;
    } catch (error) {
      console.error('Error adding card:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar cartão",
        variant: "destructive"
      });
    }
  };

  const updateCard = async (id: string, updates: Partial<Card>) => {
    try {
      const { data, error } = await supabase
        .from('cards')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      setCards(prev => prev.map(card => card.id === id ? data : card));
      toast({
        title: "Sucesso",
        description: "Cartão atualizado com sucesso"
      });
      return data;
    } catch (error) {
      console.error('Error updating card:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar cartão",
        variant: "destructive"
      });
    }
  };

  const deleteCard = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      setCards(prev => prev.filter(card => card.id !== id));
      toast({
        title: "Removido",
        description: "Cartão removido com sucesso"
      });
    } catch (error) {
      console.error('Error deleting card:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover cartão",
        variant: "destructive"
      });
    }
  };

  // CRUD Operations for Card Expenses
  const addCardExpense = async (expense: Omit<CardExpense, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('card_expenses')
        .insert([{ ...expense, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setCardExpenses(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Despesa de cartão adicionada com sucesso"
      });
      return data;
    } catch (error) {
      console.error('Error adding card expense:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar despesa de cartão",
        variant: "destructive"
      });
    }
  };

  const deleteCardExpense = async (id: string) => {
    try {
      const { error } = await supabase
        .from('card_expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      setCardExpenses(prev => prev.filter(expense => expense.id !== id));
      toast({
        title: "Removido",
        description: "Despesa de cartão removida com sucesso"
      });
    } catch (error) {
      console.error('Error deleting card expense:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover despesa de cartão",
        variant: "destructive"
      });
    }
  };

  // CRUD Operations for Investments
  const addInvestment = async (investment: Omit<Investment, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('investments')
        .insert([{ ...investment, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setInvestments(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Investimento adicionado com sucesso"
      });
      return data;
    } catch (error) {
      console.error('Error adding investment:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar investimento",
        variant: "destructive"
      });
    }
  };

  const updateInvestment = async (id: string, updates: Partial<Investment>) => {
    try {
      const { data, error } = await supabase
        .from('investments')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      setInvestments(prev => prev.map(inv => inv.id === id ? data : inv));
      return data;
    } catch (error) {
      console.error('Error updating investment:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar investimento",
        variant: "destructive"
      });
    }
  };

  const deleteInvestment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('investments')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      setInvestments(prev => prev.filter(inv => inv.id !== id));
      toast({
        title: "Removido",
        description: "Investimento removido com sucesso"
      });
    } catch (error) {
      console.error('Error deleting investment:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover investimento",
        variant: "destructive"
      });
    }
  };

  // CRUD Operations for Vehicles
  const addVehicle = async (vehicle: Omit<Vehicle, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .insert([{ ...vehicle, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setVehicles(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Veículo adicionado com sucesso"
      });
      return data;
    } catch (error) {
      console.error('Error adding vehicle:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar veículo",
        variant: "destructive"
      });
    }
  };

  const updateVehicle = async (id: string, updates: Partial<Vehicle>) => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      setVehicles(prev => prev.map(vehicle => vehicle.id === id ? data : vehicle));
      toast({
        title: "Sucesso",
        description: "Veículo atualizado com sucesso"
      });
      return data;
    } catch (error) {
      console.error('Error updating vehicle:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar veículo",
        variant: "destructive"
      });
    }
  };

  const deleteVehicle = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      setVehicles(prev => prev.filter(vehicle => vehicle.id !== id));
      toast({
        title: "Removido",
        description: "Veículo removido com sucesso"
      });
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover veículo",
        variant: "destructive"
      });
    }
  };

  // CRUD Operations for Vehicle Payments
  const updateVehiclePayment = async (id: string, updates: Partial<VehiclePayment>) => {
    try {
      const { data, error } = await supabase
        .from('vehicle_payments')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      setVehiclePayments(prev => prev.map(payment => payment.id === id ? data : payment));
      toast({
        title: "Sucesso",
        description: "Parcela atualizada com sucesso"
      });
      return data;
    } catch (error) {
      console.error('Error updating vehicle payment:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar parcela",
        variant: "destructive"
      });
    }
  };

  // CRUD Operations for Savings Goals
  const addSavingsGoal = async (goal: Omit<SavingsGoal, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .insert([{ ...goal, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setSavingsGoals(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Meta de poupança adicionada com sucesso"
      });
      return data;
    } catch (error) {
      console.error('Error adding savings goal:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar meta de poupança",
        variant: "destructive"
      });
    }
  };

  const updateSavingsGoal = async (id: string, updates: Partial<SavingsGoal>) => {
    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      setSavingsGoals(prev => prev.map(goal => goal.id === id ? data : goal));
      toast({
        title: "Sucesso",
        description: "Meta atualizada com sucesso"
      });
      return data;
    } catch (error) {
      console.error('Error updating savings goal:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar meta",
        variant: "destructive"
      });
    }
  };

  const deleteSavingsGoal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('savings_goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      setSavingsGoals(prev => prev.filter(goal => goal.id !== id));
      toast({
        title: "Removido",
        description: "Meta removida com sucesso"
      });
    } catch (error) {
      console.error('Error deleting savings goal:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover meta",
        variant: "destructive"
      });
    }
  };

  // CRUD Operations for Savings Transactions
  const addSavingsTransaction = async (transaction: Omit<SavingsTransaction, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('savings_transactions')
        .insert([{ ...transaction, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setSavingsTransactions(prev => [data, ...prev]);
      
      // Atualizar o valor atual da meta
      const goal = savingsGoals.find(g => g.id === transaction.goal_id);
      if (goal) {
        await updateSavingsGoal(goal.id, {
          current_amount: goal.current_amount + transaction.amount
        });
      }
      
      toast({
        title: "Sucesso",
        description: "Transação adicionada com sucesso"
      });
      return data;
    } catch (error) {
      console.error('Error adding savings transaction:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar transação",
        variant: "destructive"
      });
    }
  };

  // Load initial data
  useEffect(() => {
    const loadAllData = async () => {
      if (user) {
        setLoading(true);
        await Promise.all([
          fetchCards(),
          fetchCardExpenses(),
          fetchInvestments(),
          fetchVehicles(),
          fetchVehiclePayments(),
          fetchSavingsGoals(),
          fetchSavingsTransactions()
        ]);
        setLoading(false);
      }
    };

    loadAllData();
  }, [user]);

  return {
    // Data
    cards,
    cardExpenses,
    investments,
    vehicles,
    vehiclePayments,
    savingsGoals,
    savingsTransactions,
    loading,
    
    // CRUD Operations
    addCard,
    updateCard,
    deleteCard,
    addCardExpense,
    deleteCardExpense,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    updateVehiclePayment,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    addSavingsTransaction,
    
    // Refresh functions
    refreshData: () => Promise.all([
      fetchCards(),
      fetchCardExpenses(),
      fetchInvestments(),
      fetchVehicles(),
      fetchVehiclePayments(),
      fetchSavingsGoals(),
      fetchSavingsTransactions()
    ])
  };
};
