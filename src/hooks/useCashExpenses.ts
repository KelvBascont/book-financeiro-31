
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface CashExpense {
  id: string;
  description: string;
  amount: number;
  date: string;
  due_date: string;
  is_recurring: boolean;
  recurrence_months?: number;
  user_id: string;
  category_id?: string;
}

export const useCashExpenses = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cashExpenses, setCashExpenses] = useState<CashExpense[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCashExpenses = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('cash_expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCashExpenses(data || []);
    } catch (error) {
      console.error('Error fetching cash expenses:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar despesas Correntes",
        variant: "destructive"
      });
    }
  };

  const addCashExpense = async (expense: Omit<CashExpense, 'id' | 'user_id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('cash_expenses')
        .insert([{ ...expense, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      setCashExpenses(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Despesa adicionada com sucesso"
      });
      
      return data;
    } catch (error) {
      console.error('Error adding cash expense:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar despesa",
        variant: "destructive"
      });
    }
  };

  const updateCashExpense = async (id: string, updates: Partial<CashExpense>) => {
    try {
      const { data, error } = await supabase
        .from('cash_expenses')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      
      setCashExpenses(prev => prev.map(expense => expense.id === id ? data : expense));
      toast({
        title: "Sucesso",
        description: "Despesa atualizada com sucesso"
      });
      
      return data;
    } catch (error) {
      console.error('Error updating cash expense:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar despesa",
        variant: "destructive"
      });
    }
  };

  const deleteCashExpense = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cash_expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setCashExpenses(prev => prev.filter(expense => expense.id !== id));
      toast({
        title: "Removido",
        description: "Despesa removida com sucesso"
      });
    } catch (error) {
      console.error('Error deleting cash expense:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover despesa",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchCashExpenses().finally(() => setLoading(false));
    }
  }, [user]);

  return {
    cashExpenses,
    loading,
    addCashExpense,
    updateCashExpense,
    deleteCashExpense,
    refreshCashExpenses: fetchCashExpenses
  };
};
