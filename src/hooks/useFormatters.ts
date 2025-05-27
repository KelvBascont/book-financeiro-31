
import { useMemo } from 'react';

export const useFormatters = () => {
  const formatters = useMemo(() => ({
    currency: (value: number) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    },
    
    currencyCompact: (value: number) => {
      if (Math.abs(value) >= 1000000) {
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          notation: 'compact',
          compactDisplay: 'short',
        }).format(value);
      }
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    },
    
    percentage: (value: number, decimals = 2) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value / 100);
    },
    
    number: (value: number, decimals = 0) => {
      return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value);
    },
    
    date: (date: string | Date) => {
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(new Date(date));
    },
    
    dateShort: (date: string | Date) => {
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'short',
      }).format(new Date(date));
    },
    
    dateMonthYear: (date: string | Date) => {
      return new Intl.DateTimeFormat('pt-BR', {
        month: 'short',
        year: 'numeric',
      }).format(new Date(date));
    },

    dateTime: (date: string | Date) => {
      return new Intl.DateTimeFormat('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(date));
    }
  }), []);

  return formatters;
};
