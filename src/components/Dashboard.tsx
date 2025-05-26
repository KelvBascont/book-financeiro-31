
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, CreditCard, Target, Car, DollarSign } from 'lucide-react';

const Dashboard = () => {
  const mockData = {
    totalExpenses: 4250.80,
    totalSavings: 15000.00,
    totalInvestments: 25000.00,
    vehiclePayments: 1200.00,
    monthlyGrowth: 5.2,
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = "blue" }: any) => (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <Icon className={`h-5 w-5 text-${color}-600`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">
          R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
        {trend && (
          <div className={`flex items-center text-sm mt-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
            {trendValue}% em relação ao mês anterior
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard Financeiro</h2>
          <p className="text-gray-600 mt-1">Visão geral das suas finanças em {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600">
          Exportar Relatório
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Gastos em Cartões"
          value={mockData.totalExpenses}
          icon={CreditCard}
          trend="down"
          trendValue="2.1"
          color="red"
        />
        <StatCard
          title="Total em Reservas"
          value={mockData.totalSavings}
          icon={Target}
          trend="up"
          trendValue="8.5"
          color="green"
        />
        <StatCard
          title="Investimentos"
          value={mockData.totalInvestments}
          icon={TrendingUp}
          trend="up"
          trendValue="12.3"
          color="blue"
        />
        <StatCard
          title="Parcelas Veículos"
          value={mockData.vehiclePayments}
          icon={Car}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Gastos por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <div className="text-gray-500">Gráfico de pizza em desenvolvimento</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Evolução Patrimonial
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
            <div className="text-gray-500">Gráfico de linha em desenvolvimento</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Próximos Vencimentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Cartão Nubank</p>
                <p className="text-sm text-gray-600">Vence em 3 dias</p>
              </div>
              <span className="text-red-600 font-bold">R$ 1.250,00</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Financiamento Honda</p>
                <p className="text-sm text-gray-600">Vence em 5 dias</p>
              </div>
              <span className="text-yellow-600 font-bold">R$ 1.200,00</span>
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
                <span className="text-sm text-gray-600">75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Viagem</span>
                <span className="text-sm text-gray-600">45%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
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
              <span className="text-green-600 font-bold">+12.5%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">SELIC</span>
              <span className="text-green-600 font-bold">+8.2%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">PETR4</span>
              <span className="text-red-600 font-bold">-3.1%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
