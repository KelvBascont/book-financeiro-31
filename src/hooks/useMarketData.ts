
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
      
      if (uniqueTickers.length === 0) return [];
      
      console.log(`Buscando cotações para: ${uniqueTickers.join(', ')}`);
      
      // Usar a API com múltiplos tickers separados por vírgula
      const tickersString = uniqueTickers.join(',');
      const response = await fetch(
        `${BRAPI_BASE_URL}/quote/${tickersString}?token=${BRAPI_TOKEN}`
      );
      
      if (!response.ok) {
        console.error(`Erro ao buscar cotações: ${response.status} - ${response.statusText}`);
        throw new Error(`Erro ao buscar cotações: ${response.statusText}`);
      }
      
      const data: BrapiResponse = await response.json();
      console.log(`Cotações recebidas:`, data.results);
      
      return data.results || [];
    },
    enabled: tickers && tickers.length > 0,
    staleTime: 60000, // 1 minuto
    refetchInterval: false, // Desabilitar refetch automático
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
