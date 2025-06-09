
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format, addMonths } from 'date-fns';

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

  // Função corrigida para calcular o mês da fatura baseado na data de fechamento
  const calculateBillingMonth = (purchaseDate: string, closingDate: number) => {
    const purchase = new Date(purchaseDate);
    const purchaseDay = purchase.getDate();
    
    // Se a compra foi feita ANTES ou NO dia do fechamento, vai para a fatura do mês seguinte
    // Se a compra foi feita DEPOIS do fechamento, vai para a fatura de dois meses à frente
    if (purchaseDay <= closingDate) {
      return addMonths(purchase, 1);
    } else {
      return addMonths(purchase, 2);
    }
  };

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
      // Buscar dados do cartão para obter a data de fechamento
      const { data: cardData, error: cardError } = await supabase
        .from('cards')
        .select('closing_date')
        .eq('id', expense.card_id)
        .single();

      if (cardError) throw cardError;

      const closingDate = cardData?.closing_date || 1;

      if (expense.is_installment && expense.installments && expense.installments > 1) {
        // Para compras parceladas, criar uma entrada para cada parcela em seu respectivo mês
        const installmentAmount = expense.amount / expense.installments;
        const firstBillingMonth = calculateBillingMonth(expense.purchase_date, closingDate);
        
        const installmentPromises = [];
        
        for (let i = 0; i < expense.installments; i++) {
          // Cada parcela vai para um mês diferente (sequencial)
          const currentBillingMonth = addMonths(firstBillingMonth, i);
          const installmentExpense = {
            ...expense,
            amount: installmentAmount,
            current_installment: i + 1,
            billing_month: format(currentBillingMonth, 'yyyy-MM-dd'),
            user_id: user.id
          };
          
          installmentPromises.push(
            supabase
              .from('card_expenses')
              .insert([installmentExpense])
              .select()
              .single()
          );
        }

        const results = await Promise.all(installmentPromises);
        const newExpenses = results.map(result => result.data).filter(Boolean);
        
        setCardExpenses(prev => [...newExpenses, ...prev]);
        
        toast({
          title: "Sucesso",
          description: `Despesa parcelada adicionada com ${expense.installments} parcelas distribuídas pelos próximos meses`
        });
        
        return newExpenses;
      } else {
        // Para compras à vista
        const billingMonth = calculateBillingMonth(expense.purchase_date, closingDate);
        const singleExpense = {
          ...expense,
          current_installment: 1,
          billing_month: format(billingMonth, 'yyyy-MM-dd'),
          user_id: user.id
        };

        const { data, error } = await supabase
          .from('card_expenses')
          .insert([singleExpense])
          .select()
          .single();

        if (error) throw error;
        setCardExpenses(prev => [data, ...prev]);
        toast({
          title: "Sucesso",
          description: "Despesa de cartão adicionada com sucesso"
        });
        return data;
      }
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
