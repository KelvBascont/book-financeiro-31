import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, CreditCard, Target, Car, DollarSign, BarChart, Calendar } from 'lucide-react';
import { useFormatters } from '@/hooks/useFormatters';
import { useSelicRate } from '@/hooks/useMarketData';
import { useFinancial } from '@/contexts/FinancialContext';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const formatters = useFormatters();
  const { data: selicData, isLoading: selicLoading } = useSelicRate();
  const { getTotalCashExpenses, getTotalIncomes, getBalance } = useFinancial();

  const mockData = {
    totalExpenses: 4250.80,
    totalSavings: 15000.00,
    totalInvestments: 25000.00,
    vehiclePayments: 1200.00,
    monthlyGrowth: 5.2,
  };

  const totalCashExpenses = getTotalCashExpenses();
  const totalIncomes = getTotalIncomes();
  const balance = getBalance();

  // Dados para o gráfico comparativo
  const compareData = [
    {
      name: 'Receitas',
      value: totalIncomes,
      color: '#10b981'
    },
    {
      name: 'Despesas Cartão',
      value: mockData.totalExpenses,
      color: '#ef4444'
    },
    {
      name: 'Despesas à Vista',
      value: totalCashExpenses,
      color: '#f59e0b'
    }
  ];

  const totalExpenses = mockData.totalExpenses + totalCashExpenses;
  const finalBalance = totalIncomes - totalExpenses;

  const balanceData = [
    {
      name: 'Receitas',
      value: totalIncomes,
    },
    {
      name: 'Despesas',
      value: totalExpenses,
    }
  ];

  const chartConfig = {
    receitas: {
      label: 'Receitas',
      color: '#10b981',
    },
    despesas: {
      label: 'Despesas',
      color: '#ef4444',
    },
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

      {/* Indicadores de Saldo */}
      <Card className={`border-l-4 ${finalBalance >= 0 ? 'border-green-500' : 'border-red-500'}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Resumo Financeiro do Mês</span>
            <div className={`text-2xl font-bold ${finalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {finalBalance >= 0 ? 'Sobra: ' : 'Falta: '}
              {formatters.currency(Math.abs(finalBalance))}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-green-600 dark:text-green-400 font-semibold">Total Receitas</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {formatters.currency(totalIncomes)}
              </p>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-red-600 dark:text-red-400 font-semibold">Total Despesas</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                {formatters.currency(totalExpenses)}
              </p>
            </div>
            <div className={`p-4 ${finalBalance >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'} rounded-lg`}>
              <p className={`font-semibold ${finalBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {finalBalance >= 0 ? 'Sobra' : 'Déficit'}
              </p>
              <p className={`text-2xl font-bold ${finalBalance >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                {formatters.currency(Math.abs(finalBalance))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6">
        <StatCard
          title="Receitas"
          value={totalIncomes}
          icon={DollarSign}
          trend="up"
          trendValue={5.2}
          color="green"
        />
        <StatCard
          title="Gastos em Cartões"
          value={mockData.totalExpenses}
          icon={CreditCard}
          trend="down"
          trendValue={2.1}
          color="red"
        />
        <StatCard
          title="Despesas à Vista"
          value={totalCashExpenses}
          icon={BarChart}
          color="orange"
        />
        <StatCard
          title="Total em Reservas"
          value={mockData.totalSavings}
          icon={Target}
          trend="up"
          trendValue={8.5}
          color="blue"
        />
        <StatCard
          title="Investimentos"
          value={mockData.totalInvestments}
          icon={TrendingUp}
          trend="up"
          trendValue={12.3}
          color="purple"
        />
      </div>

      {/* Gráfico Comparativo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-blue-600" />
              Receitas vs Despesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={balanceData}>
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => formatters.currencyCompact(value)} />
                  <ChartTooltip 
                    content={<ChartTooltipContent 
                      formatter={(value) => formatters.currency(Number(value))}
                    />} 
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                </RechartsBarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Distribuição de Gastos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={compareData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {compareData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={<ChartTooltipContent 
                      formatter={(value) => formatters.currency(Number(value))}
                    />} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="flex justify-center mt-4 space-x-4">
              {compareData.map((entry, index) => (
                <div key={index} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

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
