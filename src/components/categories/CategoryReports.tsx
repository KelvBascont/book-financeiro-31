
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { useFormatters } from '@/hooks/useFormatters';
import { CategoryReportData } from '@/hooks/useCategoryReports';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface CategoryReportsProps {
  reportData: CategoryReportData[];
  loading: boolean;
  categories: any[];
}

const CategoryReports = ({ reportData, loading, categories }: CategoryReportsProps) => {
  const formatters = useFormatters();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  const expenseData = reportData.filter(cat => cat.categoryType === 'expense');
  const incomeData = reportData.filter(cat => cat.categoryType === 'income');

  const totalExpenses = expenseData.reduce((sum, cat) => sum + Math.abs(cat.totalAmount), 0);
  const totalIncomes = incomeData.reduce((sum, cat) => sum + cat.totalAmount, 0);

  // Preparar dados para o gráfico de barras mensal
  const monthlyChartData = reportData.length > 0 ? 
    reportData[0].monthlyData.map((month, index) => {
      const monthData: any = { month: month.month };
      
      expenseData.forEach(cat => {
        monthData[cat.categoryName] = Math.abs(cat.monthlyData[index]?.amount || 0);
      });
      
      return monthData;
    }) : [];

  // Preparar dados para gráfico de pizza
  const expensePieData = expenseData
    .filter(cat => cat.totalAmount !== 0)
    .map(cat => ({
      name: cat.categoryName,
      value: Math.abs(cat.totalAmount),
      color: cat.categoryColor
    }));

  const incomePieData = incomeData
    .filter(cat => cat.totalAmount !== 0)
    .map(cat => ({
      name: cat.categoryName,
      value: cat.totalAmount,
      color: cat.categoryColor
    }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">Relatórios por Categoria</h2>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span className="text-sm text-gray-600">Ano: {new Date().getFullYear()}</span>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Despesas</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatters.currency(totalExpenses)}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Receitas</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatters.currency(totalIncomes)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categorias Despesas</p>
                <p className="text-2xl font-bold">{expenseData.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categorias Receitas</p>
                <p className="text-2xl font-bold">{incomeData.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Pizza */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pizza de Despesas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Distribuição de Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {expensePieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expensePieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expensePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatters.currency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Nenhuma despesa encontrada para o período
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pizza de Receitas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Distribuição de Receitas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {incomePieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={incomePieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {incomePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatters.currency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Nenhuma receita encontrada para o período
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabela Detalhada de Categorias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Despesas Detalhadas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expenseData
                .sort((a, b) => Math.abs(b.totalAmount) - Math.abs(a.totalAmount))
                .map((category) => (
                <div key={category.categoryId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                      style={{ backgroundColor: category.categoryColor + '20', color: category.categoryColor }}
                    >
                      {category.categoryName}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {category.transactionCount} transações
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">
                      {formatters.currency(Math.abs(category.totalAmount))}
                    </p>
                    <p className="text-xs text-gray-500">
                      {category.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Receitas Detalhadas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Receitas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {incomeData
                .sort((a, b) => b.totalAmount - a.totalAmount)
                .map((category) => (
                <div key={category.categoryId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                      style={{ backgroundColor: category.categoryColor + '20', color: category.categoryColor }}
                    >
                      {category.categoryName}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {category.transactionCount} transações
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      {formatters.currency(category.totalAmount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {category.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Evolução Mensal */}
      {monthlyChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Evolução Mensal por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatters.currencyCompact(value)} />
                <Tooltip 
                  formatter={(value) => formatters.currency(Number(value))}
                  labelFormatter={(label) => `Mês: ${label}`}
                />
                {expenseData.map((category, index) => (
                  <Bar 
                    key={category.categoryId}
                    dataKey={category.categoryName} 
                    fill={category.categoryColor}
                    stackId="expenses"
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CategoryReports;
