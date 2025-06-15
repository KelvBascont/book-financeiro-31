
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Bill = Database['public']['Tables']['bills']['Row'];
type BillInsert = Database['public']['Tables']['bills']['Insert'];

export const useBills = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBills = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;
      setBills(data || []);
    } catch (error) {
      console.error('Error fetching bills:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar contas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createBill = async (billData: Omit<BillInsert, 'user_id'>) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Usuário não autenticado');
      }

      const billWithUserId = {
        ...billData,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('bills')
        .insert([billWithUserId])
        .select()
        .single();

      if (error) throw error;

      setBills(prev => [...prev, data]);
      toast({
        title: 'Sucesso',
        description: 'Conta criada com sucesso',
      });
      return data;
    } catch (error) {
      console.error('Error creating bill:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao criar conta',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateBill = async (id: string, updates: Partial<Bill>) => {
    try {
      const { data, error } = await supabase
        .from('bills')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setBills(prev => prev.map(bill => bill.id === id ? data : bill));
      toast({
        title: 'Sucesso',
        description: 'Conta atualizada com sucesso',
      });
      return data;
    } catch (error) {
      console.error('Error updating bill:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar conta',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteBill = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bills')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBills(prev => prev.filter(bill => bill.id !== id));
      toast({
        title: 'Sucesso',
        description: 'Conta removida com sucesso',
      });
    } catch (error) {
      console.error('Error deleting bill:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao remover conta',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const markAsPaid = async (id: string, paidAmount?: number) => {
    const bill = bills.find(b => b.id === id);
    if (!bill) return;

    await updateBill(id, {
      status: 'paid',
      paid_date: new Date().toISOString().split('T')[0],
      paid_amount: paidAmount || bill.amount,
    });
  };

  useEffect(() => {
    fetchBills();
  }, []);

  return {
    bills,
    loading,
    createBill,
    updateBill,
    deleteBill,
    markAsPaid,
    refreshBills: fetchBills,
  };
};

export type { Bill };
