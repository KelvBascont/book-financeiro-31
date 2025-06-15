
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle, Target } from 'lucide-react';
import { BudgetProgress } from '@/hooks/useBudgetProgress';

interface BudgetDashboardProps {
  budgetProgress: BudgetProgress[];
  summary: {
    totalBudget: number;
    totalSpent: number;
    totalRemaining: number;
    overallPercentage: number;
    categoriesOverBudget: number;
    totalCategories: number;
  };
}

const BudgetDashboard = ({ budgetProgress, summary }: BudgetDashboardProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Preparar dados para o gráfico de barras
  const chartData = budgetProgress.map(item => ({
    name: item.categoryName.length > 10 ? item.categoryName.substring(0, 10) + '...' : item.categoryName,
    orcado: item.budgetLimit,
    gasto: item.spent,
    percentual: item.percentage
  }));

  // Preparar dados para o gráfico de pizza
  const pieData = [
    { name: 'Gasto', value: summary.totalSpent, color: '#EF4444' },
    { name: 'Restante', value: Math.max(0, summary.totalRemaining), color: '#10B981' }
  ];

  // Categorias próximas do limite (>= 80%)
  const nearLimitCategories = budgetProgress.filter(item => item.percentage >= 80 && item.percentage < 100);
  const overBudgetCategories = budgetProgress.filter(item => item.isOverBudget);

  return (
    <div className="space-y-6">
      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Barras */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Orçado vs Realizado por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => `Categoria: ${label}`}
                />
                <Bar dataKey="orcado" fill="#3B82F6" name="Orçado" />
                <Bar dataKey="gasto" fill="#EF4444" name="Gasto" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Distribuição do Orçamento Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alertas e Categorias em Destaque */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categorias Próximas do Limite */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Categorias Próximas do Limite
              <span className="text-sm bg-amber-100 text-amber-700 px-2 py-1 rounded">
                {nearLimitCategories.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nearLimitCategories.length > 0 ? (
              <div className="space-y-3">
                {nearLimitCategories.slice(0, 5).map((category) => (
                  <div key={category.categoryId} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{category.categoryName}</span>
                      <span className="text-amber-600">{category.percentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={category.percentage} className="h-2" />
                    <div className="text-xs text-gray-500">
                      {formatCurrency(category.spent)} de {formatCurrency(category.budgetLimit)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-2" />
                <p className="text-gray-500">Todas as categorias estão dentro do limite!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Categorias que Excederam o Orçamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Categorias Acima do Orçamento
              <span className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded">
                {overBudgetCategories.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {overBudgetCategories.length > 0 ? (
              <div className="space-y-3">
                {overBudgetCategories.slice(0, 5).map((category) => (
                  <div key={category.categoryId} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{category.categoryName}</span>
                      <span className="text-red-600">{category.percentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={Math.min(category.percentage, 100)} className="h-2 bg-red-100" />
                    <div className="text-xs text-red-600">
                      Excesso: {formatCurrency(Math.abs(category.remaining))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-2" />
                <p className="text-gray-500">Nenhuma categoria excedeu o orçamento!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resumo de Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Resumo de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {((summary.totalCategories - summary.categoriesOverBudget) / summary.totalCategories * 100).toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600">Categorias no Limite</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.totalRemaining)}
              </div>
              <p className="text-sm text-gray-600">Saldo Disponível</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(summary.totalSpent / summary.totalCategories)}
              </div>
              <p className="text-sm text-gray-600">Gasto Médio/Categoria</p>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${summary.overallPercentage <= 100 ? 'text-green-600' : 'text-red-600'}`}>
                {summary.overallPercentage.toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600">Utilização Total</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetDashboard;
