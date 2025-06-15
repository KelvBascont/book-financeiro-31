
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Income {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'salary' | 'bonus' | 'investment' | 'other';
  is_recurring: boolean;
  recurrence_months?: number;
  category_id?: string;
  user_id: string;
}

export const useIncomes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIncomes = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('incomes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const typedIncomes = (data || []).map(income => ({
        ...income,
        type: income.type as 'salary' | 'bonus' | 'investment' | 'other'
      }));
      
      setIncomes(typedIncomes);
    } catch (error) {
      console.error('Error fetching incomes:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar receitas",
        variant: "destructive"
      });
    }
  };

  const addIncome = async (income: Omit<Income, 'id' | 'user_id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('incomes')
        .insert([{ ...income, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      const typedIncome: Income = {
        ...data,
        type: data.type as 'salary' | 'bonus' | 'investment' | 'other'
      };
      
      setIncomes(prev => [typedIncome, ...prev]);
      toast({
        title: "Sucesso",
        description: "Receita adicionada com sucesso"
      });
      
      return typedIncome;
    } catch (error) {
      console.error('Error adding income:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar receita",
        variant: "destructive"
      });
    }
  };

  const updateIncome = async (id: string, updates: Partial<Income>) => {
    try {
      const { data, error } = await supabase
        .from('incomes')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      
      const typedIncome: Income = {
        ...data,
        type: data.type as 'salary' | 'bonus' | 'investment' | 'other'
      };
      
      setIncomes(prev => prev.map(income => income.id === id ? typedIncome : income));
      toast({
        title: "Sucesso",
        description: "Receita atualizada com sucesso"
      });
      
      return typedIncome;
    } catch (error) {
      console.error('Error updating income:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar receita",
        variant: "destructive"
      });
    }
  };

  const deleteIncome = async (id: string) => {
    try {
      const { error } = await supabase
        .from('incomes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setIncomes(prev => prev.filter(income => income.id !== id));
      toast({
        title: "Removido",
        description: "Receita removida com sucesso"
      });
    } catch (error) {
      console.error('Error deleting income:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover receita",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchIncomes().finally(() => setLoading(false));
    }
  }, [user]);

  return {
    incomes,
    loading,
    addIncome,
    updateIncome,
    deleteIncome,
    refreshIncomes: fetchIncomes
  };
};
