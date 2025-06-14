
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense';
  color?: string;
  icon?: string;
  is_system?: boolean;
  created_at: string;
  updated_at: string;
}

export const useCategories = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar categorias",
        variant: "destructive"
      });
    }
  };

  const addCategory = async (category: Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ ...category, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      setCategories(prev => [...prev, data]);
      toast({
        title: "Sucesso",
        description: "Categoria adicionada com sucesso"
      });
      
      return data;
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar categoria",
        variant: "destructive"
      });
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      
      setCategories(prev => prev.map(cat => cat.id === id ? data : cat));
      toast({
        title: "Sucesso",
        description: "Categoria atualizada com sucesso"
      });
      
      return data;
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar categoria",
        variant: "destructive"
      });
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setCategories(prev => prev.filter(cat => cat.id !== id));
      toast({
        title: "Removido",
        description: "Categoria removida com sucesso"
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover categoria",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchCategories().finally(() => setLoading(false));
    }
  }, [user]);

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    refreshCategories: fetchCategories,
    expenseCategories: categories.filter(cat => cat.type === 'expense'),
    incomeCategories: categories.filter(cat => cat.type === 'income')
  };
};
