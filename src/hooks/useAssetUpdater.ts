
import { useEffect, useRef, useState } from 'react';
import { useMultipleStockQuotes } from '@/hooks/useMarketData';
import { useSupabaseTables } from '@/hooks/useSupabaseTables';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AssetUpdateConfig {
  interval?: number;
  maxRetries?: number;
  enabled?: boolean;
}

export const useAssetUpdater = (config: AssetUpdateConfig = {}) => {
  const {
    interval = 30000, // 30 segundos
    maxRetries = 3,
    enabled = true
  } = config;

  const { investments, refreshData } = useSupabaseTables();
  const { toast } = useToast();
  const timerRef = useRef<NodeJS.Timeout>();
  const retryCountRef = useRef(0);
  const lastUpdateRef = useRef<Date>();
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Extrair tickers únicos dos investimentos
  const activeTickers = investments.map(inv => inv.ticker).filter(Boolean);

  // Buscar cotações para os tickers ativos
  const { data: quotes, isLoading } = useMultipleStockQuotes(activeTickers);

  // Função para dividir array em chunks
  const chunkArray = <T>(arr: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  // Função para atualizar preços no Supabase
  const updateInvestmentPrices = async (quotes: any[]) => {
    if (!quotes || quotes.length === 0) return;

    try {
      setIsUpdating(true);
      
      // Agrupar atualizações por ticker
      const updates = quotes.map(quote => ({
        ticker: quote.symbol,
        current_price: quote.regularMarketPrice || 0,
        updated_at: new Date().toISOString()
      }));

      // Executar atualizações em lotes
      const chunks = chunkArray(updates, 5);
      
      for (const chunk of chunks) {
        await Promise.all(
          chunk.map(async (update) => {
            const { error } = await supabase
              .from('investments')
              .update({
                current_price: update.current_price,
                updated_at: update.updated_at
              })
              .eq('ticker', update.ticker);

            if (error) {
              console.error(`Error updating ${update.ticker}:`, error);
            }
          })
        );
        
        // Pequeno delay entre chunks para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Refresh dos dados locais
      await refreshData();
      
      setLastUpdate(new Date());
      lastUpdateRef.current = new Date();
      retryCountRef.current = 0; // Reset retry count on success
      
      console.log(`Assets updated successfully: ${updates.length} investments`);
      
    } catch (error) {
      console.error('Error updating investment prices:', error);
      
      retryCountRef.current += 1;
      
      if (retryCountRef.current >= maxRetries) {
        toast({
          title: "Erro de Atualização",
          description: "Falha ao atualizar preços dos ativos após várias tentativas",
          variant: "destructive"
        });
        retryCountRef.current = 0; // Reset para próximas tentativas
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Função principal de atualização
  const performUpdate = async () => {
    if (!enabled || isUpdating || activeTickers.length === 0) {
      return;
    }

    // Verificar se é horário de pregão (9h às 18h, seg-sex)
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    const isMarketHours = day >= 1 && day <= 5 && hour >= 9 && hour <= 18;

    // Fora do horário de pregão, aumentar intervalo
    const currentInterval = isMarketHours ? interval : interval * 3;

    // Verificar se passou tempo suficiente desde última atualização
    if (lastUpdateRef.current) {
      const timeSinceLastUpdate = now.getTime() - lastUpdateRef.current.getTime();
      if (timeSinceLastUpdate < currentInterval) {
        return;
      }
    }

    try {
      if (quotes && quotes.length > 0) {
        await updateInvestmentPrices(quotes);
      }
    } catch (error) {
      console.error('Update cycle error:', error);
    }
  };

  // Agendar próxima atualização
  const scheduleNextUpdate = () => {
    if (!enabled) return;

    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    const isMarketHours = day >= 1 && day <= 5 && hour >= 9 && hour <= 18;
    
    // Intervalo dinâmico baseado no horário
    const dynamicInterval = isMarketHours ? interval : interval * 2;
    
    // Backoff exponencial em caso de erros
    const backoffMultiplier = Math.min(Math.pow(2, retryCountRef.current), 8);
    const finalInterval = dynamicInterval * backoffMultiplier;

    timerRef.current = setTimeout(() => {
      performUpdate().then(() => {
        scheduleNextUpdate();
      });
    }, finalInterval);
  };

  // Iniciar/parar atualizações baseado na configuração
  useEffect(() => {
    if (enabled && activeTickers.length > 0) {
      // Primeira atualização imediata
      performUpdate();
      
      // Agendar atualizações subsequentes
      scheduleNextUpdate();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [enabled, activeTickers.length, interval]);

  // Limpar timer quando componente desmonta
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    isUpdating,
    lastUpdate,
    activeTickers: activeTickers.length,
    retryCount: retryCountRef.current,
    forceUpdate: performUpdate
  };
};
