
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

export const useCards = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchCards().finally(() => setLoading(false));
    }
  }, [user]);

  return {
    cards,
    loading,
    addCard,
    updateCard,
    deleteCard,
    refreshCards: fetchCards
  };
};
