
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface OccurrenceOverride {
  id: string;
  user_id: string;
  transaction_id: string;
  occurrence_index: number;
  amount: number;
  date: string;
  created_at: string;
}

export const useOccurrenceOverrides = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [overrides, setOverrides] = useState<OccurrenceOverride[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOverrides = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('occurrence_overrides')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOverrides(data || []);
    } catch (error) {
      console.error('Error fetching occurrence overrides:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar modificações de ocorrências",
        variant: "destructive"
      });
    }
  };

  const addOverride = async (transactionId: string, occurrenceIndex: number, amount: number, date: string) => {
    if (!user) return;

    try {
      // Verificar se já existe um override para esta ocorrência
      const existingOverride = overrides.find(
        override => override.transaction_id === transactionId && 
                   override.occurrence_index === occurrenceIndex
      );

      if (existingOverride) {
        // Se já existe, atualizar
        return await updateOverride(existingOverride.id, { amount, date });
      }

      // Se não existe, criar novo
      const { data, error } = await supabase
        .from('occurrence_overrides')
        .insert([{
          user_id: user.id,
          transaction_id: transactionId,
          occurrence_index: occurrenceIndex,
          amount: amount,
          date: date
        }])
        .select()
        .single();

      if (error) throw error;
      
      setOverrides(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Ocorrência modificada com sucesso"
      });
      
      return data;
    } catch (error) {
      console.error('Error adding occurrence override:', error);
      toast({
        title: "Erro",
        description: "Erro ao modificar ocorrência",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateOverride = async (id: string, updates: Partial<OccurrenceOverride>) => {
    try {
      const { data, error } = await supabase
        .from('occurrence_overrides')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      
      setOverrides(prev => prev.map(override => override.id === id ? data : override));
      toast({
        title: "Sucesso",
        description: "Modificação atualizada com sucesso"
      });
      
      return data;
    } catch (error) {
      console.error('Error updating occurrence override:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar modificação",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteOverride = async (id: string) => {
    try {
      const { error } = await supabase
        .from('occurrence_overrides')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setOverrides(prev => prev.filter(override => override.id !== id));
      toast({
        title: "Removido",
        description: "Modificação removida com sucesso"
      });
    } catch (error) {
      console.error('Error deleting occurrence override:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover modificação",
        variant: "destructive"
      });
    }
  };

  const getOverrideForOccurrence = (transactionId: string, occurrenceIndex: number) => {
    return overrides.find(
      override => override.transaction_id === transactionId && 
                 override.occurrence_index === occurrenceIndex
    );
  };

  const applyOverridesToTransactions = (transactions: any[]) => {
    return transactions.map(transaction => {
      if (transaction.isRecurringOccurrence && transaction.occurrenceIndex !== undefined) {
        const override = getOverrideForOccurrence(transaction.id, transaction.occurrenceIndex);
        if (override) {
          return {
            ...transaction,
            amount: override.amount,
            isModified: true
          };
        }
      }
      return transaction;
    });
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchOverrides().finally(() => setLoading(false));
    }
  }, [user]);

  return {
    overrides,
    loading,
    addOverride,
    updateOverride,
    deleteOverride,
    getOverrideForOccurrence,
    applyOverridesToTransactions,
    refreshOverrides: fetchOverrides
  };
};
