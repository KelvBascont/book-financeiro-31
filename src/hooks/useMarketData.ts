
import { useQuery } from '@tanstack/react-query';

interface StockQuote {
  symbol: string;
  shortName: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  currency: string;
}

interface SelicRate {
  value: number;
  date: string;
}

const BRAPI_TOKEN = 'sgJcY993z7C8YKSiehjj8g';

export const useStockQuote = (ticker: string) => {
  return useQuery({
    queryKey: ['stock-quote', ticker],
    queryFn: async () => {
      if (!ticker) return null;
      
      console.log(`Buscando cotação para: ${ticker}`);
      
      const response = await fetch(
        `https://brapi.dev/api/quote/${ticker}?token=${BRAPI_TOKEN}`
      );
      
      if (!response.ok) {
        throw new Error('Erro ao buscar cotação');
      }
      
      const data = await response.json();
      console.log(`Cotação recebida para ${ticker}:`, data);
      
      return data.results?.[0] as StockQuote;
    },
    enabled: !!ticker,
    refetchInterval: 30000, // Atualiza a cada 30 segundos
    staleTime: 20000, // Considera dados obsoletos após 20 segundos
  });
};

export const useSelicRate = () => {
  return useQuery({
    queryKey: ['selic-rate'],
    queryFn: async () => {
      console.log('Buscando taxa SELIC...');
      
      const response = await fetch(
        `https://brapi.dev/api/v2/prime-rate?country=brazil`
      );
      
      if (!response.ok) {
        throw new Error('Erro ao buscar taxa SELIC');
      }
      
      const data = await response.json();
      console.log('Taxa SELIC recebida:', data);
      
      return data.prime_rate?.[0] as SelicRate;
    },
    refetchInterval: 300000, // Atualiza a cada 5 minutos
    staleTime: 240000, // Considera dados obsoletos após 4 minutos
  });
};

export const useMultipleStockQuotes = (tickers: string[]) => {
  return useQuery({
    queryKey: ['multiple-stock-quotes', tickers],
    queryFn: async () => {
      if (!tickers.length) return [];
      
      const tickerString = tickers.join(',');
      console.log(`Buscando cotações para: ${tickerString}`);
      
      const response = await fetch(
        `https://brapi.dev/api/quote/${tickerString}?token=${BRAPI_TOKEN}`
      );
      
      if (!response.ok) {
        throw new Error('Erro ao buscar cotações');
      }
      
      const data = await response.json();
      console.log('Cotações recebidas:', data);
      
      return data.results as StockQuote[];
    },
    enabled: tickers.length > 0,
    refetchInterval: 30000,
    staleTime: 20000,
  });
};
