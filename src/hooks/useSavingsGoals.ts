
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  initial_amount: number;
  current_amount: number;
  target_amount?: number;
  created_at: string;
}

export const useSavingsGoals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchSavingsGoals().finally(() => setLoading(false));
    }
  }, [user]);

  return {
    savingsGoals,
    loading,
    refreshSavingsGoals: fetchSavingsGoals
  };
};
