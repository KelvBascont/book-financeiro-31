
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface SelicData {
  value: number;
  date: string;
  lastUpdate: Date;
}

export const useSelic = (autoUpdate: boolean = true, interval: number = 300000) => {
  const [selic, setSelic] = useState<SelicData | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['selic-rate-auto'],
    queryFn: async () => {
      console.log('Buscando taxa SELIC automática...');
      
      const response = await fetch(
        'https://brapi.dev/api/v2/prime-rate?country=brazil&token=sgJcY993z7C8YKSiehjj8g'
      );
      
      if (!response.ok) {
        throw new Error('Erro ao buscar taxa SELIC');
      }
      
      const data = await response.json();
      console.log('Taxa SELIC recebida:', data);
      
      const selicData: SelicData = {
        value: data.prime_rate?.[0]?.value || 0,
        date: data.prime_rate?.[0]?.date || new Date().toISOString(),
        lastUpdate: new Date()
      };
      
      return selicData;
    },
    refetchInterval: autoUpdate ? interval : false,
    staleTime: 240000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data) {
      setSelic(data);
    }
  }, [data]);

  const forceUpdate = async () => {
    try {
      const result = await refetch();
      return result.data;
    } catch (error) {
      console.error('Erro ao atualizar SELIC manualmente:', error);
      throw error;
    }
  };

  const isStale = selic ? 
    (new Date().getTime() - new Date(selic.lastUpdate).getTime()) > 86400000 : 
    false;

  return {
    selic,
    isLoading,
    error,
    forceUpdate,
    isStale,
    lastUpdate: selic?.lastUpdate
  };
};
