
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth } from 'date-fns';

export interface MonthlyBudget {
  id: string;
  user_id: string;
  category_id: string;
  month_year: string;
  budget_limit: number;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
    color: string;
    type: string;
  };
}

export interface BudgetAlert {
  id: string;
  user_id: string;
  category_id: string;
  alert_threshold: number;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export const useMonthlyBudgets = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [budgets, setBudgets] = useState<MonthlyBudget[]>([]);
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBudgets = async (monthYear?: Date) => {
    if (!user) return;
    
    try {
      let query = supabase
        .from('monthly_budgets')
        .select(`
          *,
          category:categories(id, name, color, type)
        `)
        .eq('user_id', user.id)
        .order('month_year', { ascending: false });

      if (monthYear) {
        const monthString = format(startOfMonth(monthYear), 'yyyy-MM-dd');
        query = query.eq('month_year', monthString);
      }

      const { data, error } = await query;

      if (error) throw error;
      setBudgets((data || []) as MonthlyBudget[]);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar orçamentos",
        variant: "destructive"
      });
    }
  };

  const fetchAlerts = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('budget_alerts')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setAlerts((data || []) as BudgetAlert[]);
    } catch (error) {
      console.error('Error fetching budget alerts:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar alertas de orçamento",
        variant: "destructive"
      });
    }
  };

  const createBudget = async (budget: Omit<MonthlyBudget, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('monthly_budgets')
        .insert([{ ...budget, user_id: user.id }])
        .select(`
          *,
          category:categories(id, name, color, type)
        `)
        .single();

      if (error) throw error;
      
      setBudgets(prev => [data as MonthlyBudget, ...prev]);
      toast({
        title: "Sucesso",
        description: "Orçamento criado com sucesso"
      });
      
      return data;
    } catch (error) {
      console.error('Error creating budget:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar orçamento",
        variant: "destructive"
      });
    }
  };

  const updateBudget = async (id: string, updates: Partial<MonthlyBudget>) => {
    try {
      const { data, error } = await supabase
        .from('monthly_budgets')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select(`
          *,
          category:categories(id, name, color, type)
        `)
        .single();

      if (error) throw error;
      
      setBudgets(prev => prev.map(budget => budget.id === id ? data as MonthlyBudget : budget));
      toast({
        title: "Sucesso",
        description: "Orçamento atualizado com sucesso"
      });
      
      return data;
    } catch (error) {
      console.error('Error updating budget:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar orçamento",
        variant: "destructive"
      });
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      const { error } = await supabase
        .from('monthly_budgets')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      setBudgets(prev => prev.filter(budget => budget.id !== id));
      toast({
        title: "Removido",
        description: "Orçamento removido com sucesso"
      });
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover orçamento",
        variant: "destructive"
      });
    }
  };

  const updateAlert = async (categoryId: string, alertData: Partial<BudgetAlert>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('budget_alerts')
        .upsert([{ 
          user_id: user.id, 
          category_id: categoryId,
          ...alertData 
        }])
        .select()
        .single();

      if (error) throw error;
      
      setAlerts(prev => {
        const existing = prev.find(alert => alert.category_id === categoryId);
        if (existing) {
          return prev.map(alert => alert.category_id === categoryId ? data as BudgetAlert : alert);
        } else {
          return [...prev, data as BudgetAlert];
        }
      });
      
      toast({
        title: "Sucesso",
        description: "Configuração de alerta atualizada"
      });
      
      return data;
    } catch (error) {
      console.error('Error updating alert:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar configuração de alerta",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([fetchBudgets(), fetchAlerts()]).finally(() => setLoading(false));
    }
  }, [user]);

  return {
    budgets,
    alerts,
    loading,
    createBudget,
    updateBudget,
    deleteBudget,
    updateAlert,
    refreshBudgets: fetchBudgets,
    refreshAlerts: fetchAlerts
  };
};
