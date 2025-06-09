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

  // Função CORRETA para calcular o mês da fatura
  const calculateBillingMonth = (purchaseDate: string, closingDay: number) => {
    const purchase = new Date(purchaseDate);
    const purchaseDay = purchase.getDate();
    const purchaseMonth = purchase.getMonth();
    const purchaseYear = purchase.getFullYear();

    let billingMonth, billingYear;

    // Se a compra foi feita até o dia de fechamento (inclusive)
    if (purchaseDay <= closingDay) {
      // A fatura é do mês SEGUINTE à compra
      billingMonth = purchaseMonth + 1;
      billingYear = purchaseYear;
      
      // Se passou de dezembro, vai para janeiro do próximo ano
      if (billingMonth > 11) {
        billingMonth = 0;
        billingYear++;
      }
    } else {
      // Se a compra foi feita após o dia de fechamento
      // A fatura é do mês seguinte + 1 (dois meses à frente)
      billingMonth = purchaseMonth + 2;
      billingYear = purchaseYear;
      
      // Ajustar virada de ano
      if (billingMonth > 11) {
        billingYear += Math.floor(billingMonth / 12);
        billingMonth = billingMonth % 12;
      }
    }

    // Retorna a data da fatura (primeiro dia do mês de cobrança)
    return new Date(billingYear, billingMonth, 1);
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
        // Para compras parceladas, criar uma entrada para cada parcela
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
      // Se estiver atualizando a data de compra, recalcular o billing_month
      if (updates.purchase_date) {
        const { data: expenseData, error: expenseError } = await supabase
          .from('card_expenses')
          .select('card_id')
          .eq('id', id)
          .single();

        if (expenseError) throw expenseError;

        const { data: cardData, error: cardError } = await supabase
          .from('cards')
          .select('closing_date')
          .eq('id', expenseData.card_id)
          .single();

        if (cardError) throw cardError;

        const closingDate = cardData?.closing_date || 1;
        const newBillingMonth = calculateBillingMonth(updates.purchase_date, closingDate);
        updates.billing_month = format(newBillingMonth, 'yyyy-MM-dd');
      }

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
