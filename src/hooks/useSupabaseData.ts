
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
}

export interface Income {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'salary' | 'bonus' | 'investment' | 'other';
  is_recurring: boolean;
  recurrence_months?: number;
  user_id: string;
}

export const useSupabaseData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cashExpenses, setCashExpenses] = useState<CashExpense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Cash Expenses
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

  // Fetch Incomes
  const fetchIncomes = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('incomes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type cast to ensure correct type
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

  // Add Cash Expense
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

  // Update Cash Expense
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

  // Add Income
  const addIncome = async (income: Omit<Income, 'id' | 'user_id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('incomes')
        .insert([{ ...income, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      // Type cast the returned data
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

  // Update Income
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

  // Delete Cash Expense
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

  // Delete Income
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

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        setLoading(true);
        await Promise.all([fetchCashExpenses(), fetchIncomes()]);
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  return {
    cashExpenses,
    incomes,
    loading,
    addCashExpense,
    updateCashExpense,
    addIncome,
    updateIncome,
    deleteCashExpense,
    deleteIncome,
    refreshData: () => Promise.all([fetchCashExpenses(), fetchIncomes()])
  };
};
