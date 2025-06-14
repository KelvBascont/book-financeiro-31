
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useFormatters } from '@/hooks/useFormatters';
import ExpensesDueSoonCard from '@/components/ExpensesDueSoonCard';

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}

interface ChartsSectionProps {
  monthlyData: MonthlyData[];
}

const ChartsSection = ({ monthlyData }: ChartsSectionProps) => {
  const formatters = useFormatters();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Fluxo de Caixa Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-600" />
                <XAxis dataKey="month" stroke="#6b7280" className="dark:stroke-gray-300" />
                <YAxis tickFormatter={(value) => formatters.currency(value)} stroke="#6b7280" className="dark:stroke-gray-300" />
                <Tooltip 
                  formatter={(value: number) => [formatters.currency(value), '']}
                  labelFormatter={(label) => `Mês: ${label}`}
                  contentStyle={{
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--foreground)'
                  }}
                />
                <Legend />
                <Bar dataKey="income" fill="#16a34a" name="Receitas" />
                <Bar dataKey="expenses" fill="#dc2626" name="Despesas" />
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
