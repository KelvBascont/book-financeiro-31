
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Subcategory {
  id: string;
  user_id: string;
  category_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export const useSubcategories = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubcategories = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('subcategories')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setSubcategories((data || []) as Subcategory[]);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar subcategorias",
        variant: "destructive"
      });
    }
  };

  const addSubcategory = async (subcategory: Omit<Subcategory, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('subcategories')
        .insert([{ ...subcategory, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      setSubcategories(prev => [...prev, data as Subcategory]);
      toast({
        title: "Sucesso",
        description: "Subcategoria adicionada com sucesso"
      });
      
      return data;
    } catch (error) {
      console.error('Error adding subcategory:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar subcategoria",
        variant: "destructive"
      });
    }
  };

  const updateSubcategory = async (id: string, updates: Partial<Subcategory>) => {
    try {
      const { data, error } = await supabase
        .from('subcategories')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      
      setSubcategories(prev => prev.map(sub => sub.id === id ? data as Subcategory : sub));
      toast({
        title: "Sucesso",
        description: "Subcategoria atualizada com sucesso"
      });
      
      return data;
    } catch (error) {
      console.error('Error updating subcategory:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar subcategoria",
        variant: "destructive"
      });
    }
  };

  const deleteSubcategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('subcategories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setSubcategories(prev => prev.filter(sub => sub.id !== id));
      toast({
        title: "Removido",
        description: "Subcategoria removida com sucesso"
      });
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover subcategoria",
        variant: "destructive"
      });
    }
  };

  const getSubcategoriesByCategory = (categoryId: string) => {
    return subcategories.filter(sub => sub.category_id === categoryId);
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchSubcategories().finally(() => setLoading(false));
    }
  }, [user]);

  return {
    subcategories,
    loading,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory,
    getSubcategoriesByCategory,
    refreshSubcategories: fetchSubcategories
  };
};
