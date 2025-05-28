
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

export const useSupabaseTables = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  // Estados para cada tabela
  const [cards, setCards] = useState<Card[]>([]);
  const [cardExpenses, setCardExpenses] = useState<CardExpense[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);

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
          fetchSavingsGoals()
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
    savingsGoals,
    loading,
    
    // CRUD Operations
    addCard,
    updateCard,
    deleteCard,
    
    // Refresh functions
    refreshData: () => Promise.all([
      fetchCards(),
      fetchCardExpenses(),
      fetchInvestments(),
      fetchVehicles(),
      fetchSavingsGoals()
    ])
  };
};
