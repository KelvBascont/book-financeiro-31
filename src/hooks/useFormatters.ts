
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const useFormatters = () => {
  const currency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

      
  };

  const currencyCompact = (value: number): string => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(1)}K`;
    }
    return currency(value);
  };

  const percentage = (value: number, decimals: number = 1): string => {
    return `${value.toFixed(decimals)}%`;
  };

  const number = (value: number, decimals: number = 2): string => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  const date = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
  };

  const dateShort = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'dd/MM', { locale: ptBR });
  };

  const dateMonthYear = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'MMM/yyyy', { locale: ptBR });
  };

  const dateTime = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: ptBR });
  };

   // Adicione esta nova função
  const dateISO = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString(); 
  };


  return {
    currency,
    currencyCompact,
    percentage,
    number,
    date,
    dateShort,
    dateMonthYear,
    dateTime,
    dateISO,
  };
};
