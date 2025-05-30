import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useCards } from './useCards';
import { useCardExpenses } from './useCardExpenses';
import { useInvestments } from './useInvestments';

// Re-export interfaces
export { type Card } from './useCards';
export { type CardExpense } from './useCardExpenses';
export { type Investment } from './useInvestments';

export interface Vehicle {
  id: string;
  user_id: string;
  description: string;
  total_amount: number;
  total_amountii: number;
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
  
  const cardsHook = useCards();
  const cardExpensesHook = useCardExpenses();
  const investmentsHook = useInvestments();
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehiclePayments, setVehiclePayments] = useState<VehiclePayment[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [savingsTransactions, setSavingsTransactions] = useState<SavingsTransaction[]>([]);

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
    // Data from imported hooks
    cards: cardsHook.cards,
    cardExpenses: cardExpensesHook.cardExpenses,
    investments: investmentsHook.investments,
    
    // Data from this hook
    vehicles,
    vehiclePayments,
    savingsGoals,
    savingsTransactions,
    
    // Loading state
    loading: loading || cardsHook.loading || cardExpensesHook.loading || investmentsHook.loading,
    
    // CRUD Operations from imported hooks
    addCard: cardsHook.addCard,
    updateCard: cardsHook.updateCard,
    deleteCard: cardsHook.deleteCard,
    addCardExpense: cardExpensesHook.addCardExpense,
    updateCardExpense: cardExpensesHook.updateCardExpense,
    deleteCardExpense: cardExpensesHook.deleteCardExpense,
    addInvestment: investmentsHook.addInvestment,
    updateInvestment: investmentsHook.updateInvestment,
    deleteInvestment: investmentsHook.deleteInvestment,
    
    // CRUD Operations from this hook
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
      cardsHook.refreshCards(),
      cardExpensesHook.refreshCardExpenses(),
      investmentsHook.refreshInvestments(),
      fetchVehicles(),
      fetchVehiclePayments(),
      fetchSavingsGoals(),
      fetchSavingsTransactions()
    ])
  };
};
