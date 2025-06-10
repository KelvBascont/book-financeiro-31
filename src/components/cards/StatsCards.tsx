
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, Calendar } from 'lucide-react';
import { useFormatters } from '@/hooks/useFormatters';

interface StatsCardsProps {
  totalInBills: number;
  cardsCount: number;
  monthlyExpensesCount: number;
}

const StatsCards = ({ totalInBills, cardsCount, monthlyExpensesCount }: StatsCardsProps) => {
  const formatters = useFormatters();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Gastos do Mês</p>
              <p className="text-2xl font-bold">{formatters.currency(totalInBills)}</p>
              <p className="text-gray-400 text-xs">Soma das parcelas do período</p>
            </div>
            <div className="p-3 bg-orange-600 rounded-full">
              <CreditCard className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Cartões Ativos</p>
              <p className="text-2xl font-bold">{cardsCount}</p>
            </div>
            <div className="p-3 bg-blue-600 rounded-full">
              <CreditCard className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Compras do Mês</p>
              <p className="text-2xl font-bold">{monthlyExpensesCount}</p>
            </div>
            <div className="p-3 bg-green-600 rounded-full">
              <Calendar className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
