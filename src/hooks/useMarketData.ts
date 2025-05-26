
import { useState, useEffect } from 'react';
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
      
      const response = await fetch(
        `https://brapi.dev/api/quote/${ticker}?token=${BRAPI_TOKEN}`
      );
      
      if (!response.ok) {
        throw new Error('Erro ao buscar cotação');
      }
      
      const data = await response.json();
      return data.results?.[0] as StockQuote;
    },
    enabled: !!ticker,
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });
};

export const useSelicRate = () => {
  return useQuery({
    queryKey: ['selic-rate'],
    queryFn: async () => {
      const response = await fetch(
        'https://brapi.dev/api/v2/prime-rate?country=brazil'
      );
      
      if (!response.ok) {
        throw new Error('Erro ao buscar taxa SELIC');
      }
      
      const data = await response.json();
      return data.prime_rate?.[0] as SelicRate;
    },
    refetchInterval: 300000, // Atualiza a cada 5 minutos
  });
};
