import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ExpensesDueSoonCard from '@/components/ExpensesDueSoonCard';
import CashFlowChart from './CashFlowChart';
interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  cardExpenses: number;
}
interface ChartsSectionProps {
  monthlyData: MonthlyData[];
}
const ChartsSection = ({
  monthlyData
}: ChartsSectionProps) => {
  return <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
            <CashFlowChart data={monthlyData} />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <ExpensesDueSoonCard />
      </div>
    </div>;
};
export default ChartsSection;