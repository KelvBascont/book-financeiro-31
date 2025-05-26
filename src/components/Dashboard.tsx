
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, CreditCard, Target, Car, DollarSign, BarChart, Calendar } from 'lucide-react';
import { useFormatters } from '@/hooks/useFormatters';
import { useSelicRate } from '@/hooks/useMarketData';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const formatters = useFormatters();
  const { data: selicData, isLoading: selicLoading } = useSelicRate();

  const mockData = {
    totalExpenses: 4250.80,
    totalSavings: 15000.00,
    totalInvestments: 25000.00,
    vehiclePayments: 1200.00,
    monthlyGrowth: 5.2,
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = "blue", isLoading = false }: any) => (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</CardTitle>
        <Icon className={`h-5 w-5 text-${color}-600`} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {formatters.currencyCompact(value)}
          </div>
        )}
        {trend && !isLoading && (
          <div className={`flex items-center text-sm mt-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
            {formatters.percentage(trendValue)} em relação ao mês anterior
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Dashboard Financeiro</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Visão geral das suas finanças em {formatters.dateMonthYear(new Date())}
          </p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto">
          Exportar Relatório
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatCard
          title="Gastos em Cartões"
          value={mockData.totalExpenses}
          icon={CreditCard}
          trend="down"
          trendValue={2.1}
          color="red"
        />
        <StatCard
          title="Total em Reservas"
          value={mockData.totalSavings}
          icon={Target}
          trend="up"
          trendValue={8.5}
          color="green"
        />
        <StatCard
          title="Investimentos"
          value={mockData.totalInvestments}
          icon={TrendingUp}
          trend="up"
          trendValue={12.3}
          color="blue"
        />
        <StatCard
          title="Parcelas Veículos"
          value={mockData.vehiclePayments}
          icon={Car}
          color="purple"
        />
      </div>

      {/* Taxa SELIC Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Taxa SELIC Atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              {selicLoading ? (
                <Skeleton className="h-10 w-20" />
              ) : (
                <div className="text-3xl font-bold text-green-600">
                  {selicData ? `${selicData.value.toFixed(2)}%` : 'N/A'}
                </div>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Taxa básica de juros do Brasil
              </p>
            </div>
            {selicData && (
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Última atualização:
                </p>
                <p className="text-sm font-medium">
                  {formatters.date(selicData.date)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-blue-600" />
              Gastos por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent className="h-48 sm:h-64 flex items-center justify-center">
            <div className="text-gray-500 dark:text-gray-400 text-center">
              <BarChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Gráfico de pizza em desenvolvimento</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Evolução Patrimonial
            </CardTitle>
          </CardHeader>
          <CardContent className="h-48 sm:h-64 flex items-center justify-center">
            <div className="text-gray-500 dark:text-gray-400 text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Gráfico de linha em desenvolvimento</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Próximos Vencimentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 dark:text-white">Cartão Nubank</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Vence em 3 dias</p>
              </div>
              <span className="text-red-600 dark:text-red-400 font-bold text-sm sm:text-base">
                {formatters.currency(1250.00)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 dark:text-white">Financiamento Honda</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Vence em 5 dias</p>
              </div>
              <span className="text-yellow-600 dark:text-yellow-400 font-bold text-sm sm:text-base">
                {formatters.currency(1200.00)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Metas de Reserva</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Emergência</span>
                <span className="text-sm text-gray-600 dark:text-gray-300">75%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{formatters.currency(22500)}</span>
                <span>{formatters.currency(30000)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Viagem</span>
                <span className="text-sm text-gray-600 dark:text-gray-300">45%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{formatters.currency(4500)}</span>
                <span>{formatters.currency(10000)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance Investimentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">MXRF11</span>
              <span className="text-green-600 dark:text-green-400 font-bold">+{formatters.percentage(12.5)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">SELIC</span>
              <span className="text-green-600 dark:text-green-400 font-bold">+{formatters.percentage(8.2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">PETR4</span>
              <span className="text-red-600 dark:text-red-400 font-bold">{formatters.percentage(-3.1)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">ITUB4</span>
              <span className="text-green-600 dark:text-green-400 font-bold">+{formatters.percentage(7.9)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
