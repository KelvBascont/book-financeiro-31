
export const formatters = {
  currency: (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  },

  currencyCompact: (value: number): string => {
    if (value >= 1000000) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        notation: 'compact',
        maximumFractionDigits: 1
      }).format(value);
    }
    return formatters.currency(value);
  },

  percentage: (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  },

  date: (dateString: string | Date): string => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return new Intl.DateTimeFormat('pt-BR').format(date);
  },

  dateTime: (dateString: string | Date): string => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return new Intl.DateTimeFormat('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  },

  dateShort: (dateString: string | Date): string => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return new Intl.DateTimeFormat('pt-BR', {
      month: 'short',
      year: 'numeric'
    }).format(date);
  },

  dateMonthYear: (dateString: string | Date): string => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return new Intl.DateTimeFormat('pt-BR', {
      month: 'long',
      year: 'numeric'
    }).format(date);
  }
};
