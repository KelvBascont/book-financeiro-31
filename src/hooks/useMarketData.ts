
import { useQuery } from '@tanstack/react-query';

const BRAPI_TOKEN = 'sgJcY993z7C8YKSiehjj8g';
const BRAPI_BASE_URL = 'https://brapi.dev/api';

interface StockQuote {
  symbol: string;
  shortName: string;
  longName: string;
  currency: string;
  regularMarketPrice: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketDayRange: string;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketTime: string;
  marketCap: number;
  regularMarketVolume: number;
  regularMarketPreviousClose: number;
  regularMarketOpen: number;
  averageDailyVolume10Day: number;
  averageDailyVolume3Month: number;
  fiftyTwoWeekLow: number;
  fiftyTwoWeekHigh: number;
  priceEarnings: number;
  earningsPerShare: number;
  logourl: string;
}

interface BrapiResponse {
  results: StockQuote[];
  requestedAt: string;
  took: string;
}

interface SelicResponse {
  prime_rate: Array<{
    value: number;
    date: string;
  }>;
}

export const useStockQuote = (ticker: string) => {
  return useQuery({
    queryKey: ['stock-quote', ticker],
    queryFn: async (): Promise<StockQuote | null> => {
      if (!ticker) return null;
      
      console.log(`Buscando cotação para ${ticker}...`);
      
      const response = await fetch(
        `${BRAPI_BASE_URL}/quote/${ticker}?token=${BRAPI_TOKEN}`
      );
      
      if (!response.ok) {
        console.error(`Erro ao buscar cotação: ${response.status} - ${response.statusText}`);
        throw new Error(`Erro ao buscar cotação: ${response.statusText}`);
      }
      
      const data: BrapiResponse = await response.json();
      console.log(`Cotação recebida para ${ticker}:`, data);
      
      return data.results?.[0] || null;
    },
    enabled: !!ticker,
    staleTime: 60000, // 1 minuto
    refetchInterval: 30000, // 30 segundos
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useMultipleStockQuotes = (tickers: string[]) => {
  return useQuery({
    queryKey: ['multiple-stock-quotes', tickers],
    queryFn: async (): Promise<StockQuote[]> => {
      if (!tickers || tickers.length === 0) return [];
      
      const uniqueTickers = [...new Set(tickers.filter(Boolean))];
      
      console.log(`Buscando cotações individuais para: ${uniqueTickers.join(', ')}`);
      
      // Fazer requisições individuais para cada ticker (plano gratuito BRAPI)
      const quotes: StockQuote[] = [];
      
      for (const ticker of uniqueTickers) {
        try {
          console.log(`Buscando cotação individual para: ${ticker}`);
          
          const response = await fetch(
            `${BRAPI_BASE_URL}/quote/${ticker}?token=${BRAPI_TOKEN}`
          );
          
          if (!response.ok) {
            console.error(`Erro ao buscar cotação para ${ticker}: ${response.status}`);
            continue; // Pula para o próximo ticker em caso de erro
          }
          
          const data: BrapiResponse = await response.json();
          
          if (data.results && data.results.length > 0) {
            quotes.push(data.results[0]);
            console.log(`Cotação obtida para ${ticker}: R$ ${data.results[0].regularMarketPrice}`);
          }
          
          // Delay entre requisições para evitar rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.error(`Erro ao processar ${ticker}:`, error);
          continue;
        }
      }
      
      console.log(`Total de cotações obtidas: ${quotes.length}/${uniqueTickers.length}`);
      return quotes;
    },
    enabled: tickers && tickers.length > 0,
    staleTime: 60000, // 1 minuto
    refetchInterval: false, // Desabilitar refetch automático para evitar muitas requisições
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};

export const useSelicRate = () => {
  return useQuery({
    queryKey: ['selic-rate'],
    queryFn: async () => {
      console.log('Buscando taxa SELIC...');
      
      const response = await fetch(
        `${BRAPI_BASE_URL}/v2/prime-rate?country=brazil&token=${BRAPI_TOKEN}`
      );
      
      if (!response.ok) {
        console.error(`Erro ao buscar taxa SELIC: ${response.status} - ${response.statusText}`);
        throw new Error('Erro ao buscar taxa SELIC');
      }
      
      const data: SelicResponse = await response.json();
      console.log('Taxa SELIC recebida:', data);
      
      return {
        value: data.prime_rate?.[0]?.value || 0,
        date: data.prime_rate?.[0]?.date || new Date().toISOString()
      };
    },
    staleTime: 3600000, // 1 hora
    refetchInterval: 3600000, // 1 hora
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
