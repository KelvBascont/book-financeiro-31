
export const getBalanceColorClass = (value: number) => {
  return value < 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500';
};

export const getPercentageColorClass = (value: number) => {
  if (value > 0) return 'text-green-600 dark:text-green-400';
  if (value < 0) return 'text-red-500 dark:text-red-400';
  return 'text-gray-500 dark:text-gray-400';
};

export const getTrendColorClass = (trend: 'up' | 'down' | 'neutral') => {
  switch (trend) {
    case 'up': return 'text-green-600 dark:text-green-400';
    case 'down': return 'text-red-500 dark:text-red-400';
    default: return 'text-gray-500 dark:text-gray-400';
  }
};
