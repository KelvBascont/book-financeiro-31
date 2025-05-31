
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Vehicle {
  id: string;
  user_id: string;
  description: string;
  total_amount: number;
  installments: number;
  start_date: string;
  installment_value: number;
  paid_installments: number;
  created_at: string;
}

export const useVehicles = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVehicles = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar veículos",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchVehicles().finally(() => setLoading(false));
    }
  }, [user]);

  return {
    vehicles,
    loading,
    refreshVehicles: fetchVehicles
  };
};
