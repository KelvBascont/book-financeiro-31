
export const DASHBOARD_CONSTANTS = {
  MONTHS_RANGE: {
    PREVIOUS: 6,
    FUTURE: 5
  },
  CHART: {
    HEIGHT: 350,
    MARGIN: { top: 20, right: 30, left: 20, bottom: 5 },
    BAR_CATEGORY_GAP: "20%"
  },
  COLORS: {
    INCOME: {
      PRIMARY: "#10b981",
      SECONDARY: "#059669",
      STROKE: "#059669"
    },
    CASH_EXPENSES: {
      PRIMARY: "#ef4444",
      SECONDARY: "#dc2626",
      STROKE: "#dc2626"
    },
    CARD_EXPENSES: {
      PRIMARY: "#f97316",
      SECONDARY: "#ea580c",
      STROKE: "#ea580c"
    }
  }
} as const;

export const CHART_LABELS = {
  income: 'Receitas',
  expenses: 'Despesas',
  cardExpenses: 'Cartão de Crédito'
} as const;
