
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, PiggyBank, CreditCard, Car } from 'lucide-react';
import { useFormatters } from '@/hooks/useFormatters';

interface AssetsSummaryCardsProps {
  totalInvestments: number;
  totalSavings: number;
  totalCards: number;
  totalVehicles: number;
  investmentsCount: number;
  savingsCount: number;
  vehiclesCount: number;
}

const AssetsSummaryCards = ({
  totalInvestments,
  totalSavings,
  totalCards,
  totalVehicles,
  investmentsCount,
  savingsCount,
  vehiclesCount
}: AssetsSummaryCardsProps) => {
  const formatters = useFormatters();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Investimentos</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatters.currencyCompact(totalInvestments)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{investmentsCount} ativos</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Reservas/Metas</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatters.currencyCompact(totalSavings)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{savingsCount} metas</p>
            </div>
            <PiggyBank className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Cartões</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{totalCards}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">cartões cadastrados</p>
            </div>
            <CreditCard className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Veículos</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatters.currencyCompact(totalVehicles)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{vehiclesCount} veículos</p>
            </div>
            <Car className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssetsSummaryCards;
