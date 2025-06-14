
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useFormatters } from '@/hooks/useFormatters';
import ExpensesDueSoonCard from '@/components/ExpensesDueSoonCard';

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  cardExpenses: number;
}

interface ChartsSectionProps {
  monthlyData: MonthlyData[];
}

const ChartsSection = ({ monthlyData }: ChartsSectionProps) => {
  const formatters = useFormatters();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
              Fluxo de Caixa Mensal
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-300">Receitas e despesas por categoria</p>
          </CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart 
                data={monthlyData} 
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                barCategoryGap="20%"
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
                    const labels = {
                      income: 'Receitas',
                      expenses: 'Despesas em Dinheiro',
                      cardExpenses: 'Despesas de Cartão'
                    };
                    return [formatters.currency(value), labels[name as keyof typeof labels] || name];
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
                  name="Receitas"
                  radius={[4, 4, 0, 0]}
                  stroke="#059669"
                  strokeWidth={1}
                />
                <Bar 
                  dataKey="expenses" 
                  fill="url(#expensesGradient)" 
                  name="Despesas em Dinheiro"
                  radius={[4, 4, 0, 0]}
                  stroke="#dc2626"
                  strokeWidth={1}
                />
                <Bar 
                  dataKey="cardExpenses" 
                  fill="url(#cardExpensesGradient)" 
                  name="Despesas de Cartão"
                  radius={[4, 4, 0, 0]}
                  stroke="#ea580c"
                  strokeWidth={1}
                />
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.9}/>
                  </linearGradient>
                  <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#dc2626" stopOpacity={0.9}/>
                  </linearGradient>
                  <linearGradient id="cardExpensesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#ea580c" stopOpacity={0.9}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <ExpensesDueSoonCard />
      </div>
    </div>
  );
};

export default ChartsSection;
