// useSupabaseTables.ts
const useSupabaseTables = () => {
  // ...
  
  const fetchInvestments = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvestments(data || []);
    } catch (error) {
      console.error('Error fetching investments:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar investimentos",
        variant: "destructive"
      });
    }
  };

  const addInvestment = async (investmentData: Omit<Investment, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('investments')
        .insert([investmentData])
        .select();

      if (error) throw error;
      if (data) {
        toast({
          title: "Sucesso",
          description: "Investimento adicionado com sucesso",
        });
        return data[0];
      }
    } catch (error) {
      console.error('Error adding investment:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar investimento",
        variant: "destructive"
      });
      return null;
    }
  };

  // ...
  
  return {
    investments,
    addInvestment,
    deleteInvestment,
    fetchInvestments, // Certifique-se de exportar esta função
    loading
  };
};