
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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

export const useInvestments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchInvestments().finally(() => setLoading(false));
    }
  }, [user]);

  return {
    investments,
    loading,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    refreshInvestments: fetchInvestments
  };
};
