
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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

export const useCardExpenses = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cardExpenses, setCardExpenses] = useState<CardExpense[]>([]);
  const [loading, setLoading] = useState(true);

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

  const updateCardExpense = async (id: string, updates: Partial<CardExpense>) => {
    try {
      const { data, error } = await supabase
        .from('card_expenses')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      setCardExpenses(prev => prev.map(expense => expense.id === id ? data : expense));
      toast({
        title: "Sucesso",
        description: "Despesa de cartão atualizada com sucesso"
      });
      return data;
    } catch (error) {
      console.error('Error updating card expense:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar despesa de cartão",
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

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchCardExpenses().finally(() => setLoading(false));
    }
  }, [user]);

  return {
    cardExpenses,
    loading,
    addCardExpense,
    updateCardExpense,
    deleteCardExpense,
    refreshCardExpenses: fetchCardExpenses
  };
};
