
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useFormatters } from '@/hooks/useFormatters';
import { DASHBOARD_CONSTANTS, CHART_LABELS } from '@/constants/dashboard';

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  cardExpenses: number;
}

interface CashFlowChartProps {
  data: MonthlyData[];
}

const CashFlowChart = ({ data }: CashFlowChartProps) => {
  const formatters = useFormatters();
  const { CHART, COLORS } = DASHBOARD_CONSTANTS;

  return (
    <ResponsiveContainer width="100%" height={CHART.HEIGHT}>
      <BarChart 
        data={data} 
        margin={CHART.MARGIN}
        barCategoryGap={CHART.BAR_CATEGORY_GAP}
      >
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="#e5e7eb" 
          className="dark:stroke-gray-600" 
          opacity={0.7}
        />
        <XAxis 
          dataKey="month" 
          stroke="#6b7280" 
          className="dark:stroke-gray-300"
          fontSize={12}
          fontWeight={500}
        />
        <YAxis 
          tickFormatter={(value) => formatters.currencyCompact(value)} 
          stroke="#6b7280" 
          className="dark:stroke-gray-300"
          fontSize={12}
          fontWeight={500}
        />
        <Tooltip 
          formatter={(value: number, name: string) => {
            return [formatters.currency(value), CHART_LABELS[name as keyof typeof CHART_LABELS] || name];
          }}
          labelFormatter={(label) => `Período: ${label}`}
          contentStyle={{
            backgroundColor: 'var(--background)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            color: 'var(--foreground)',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            fontSize: '14px',
            fontWeight: '500'
          }}
          cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
        />
        <Legend 
          wrapperStyle={{ 
            paddingTop: '20px',
            fontSize: '14px',
            fontWeight: '500'
          }}
        />
        <Bar 
          dataKey="income" 
          fill="url(#incomeGradient)" 
          name="income"
          radius={[4, 4, 0, 0]}
          stroke={COLORS.INCOME.STROKE}
          strokeWidth={1}
        />
        <Bar 
          dataKey="expenses" 
          fill="url(#expensesGradient)" 
          name="expenses"
          radius={[4, 4, 0, 0]}
          stroke={COLORS.CASH_EXPENSES.STROKE}
          strokeWidth={1}
        />
        <Bar 
          dataKey="cardExpenses" 
          fill="url(#cardExpensesGradient)" 
          name="cardExpenses"
          radius={[4, 4, 0, 0]}
          stroke={COLORS.CARD_EXPENSES.STROKE}
          strokeWidth={1}
        />
        <defs>
          <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.INCOME.PRIMARY} stopOpacity={0.8}/>
            <stop offset="100%" stopColor={COLORS.INCOME.SECONDARY} stopOpacity={0.9}/>
          </linearGradient>
          <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.CASH_EXPENSES.PRIMARY} stopOpacity={0.8}/>
            <stop offset="100%" stopColor={COLORS.CASH_EXPENSES.SECONDARY} stopOpacity={0.9}/>
          </linearGradient>
          <linearGradient id="cardExpensesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.CARD_EXPENSES.PRIMARY} stopOpacity={0.8}/>
            <stop offset="100%" stopColor={COLORS.CARD_EXPENSES.SECONDARY} stopOpacity={0.9}/>
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CashFlowChart;
