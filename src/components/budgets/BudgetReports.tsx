
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Calendar, Download, Target, AlertTriangle } from 'lucide-react';
import { format, subMonths, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MonthlyBudget } from '@/hooks/useMonthlyBudgets';
import { BudgetProgress } from '@/hooks/useBudgetProgress';

interface BudgetReportsProps {
  budgets: MonthlyBudget[];
  currentProgress: BudgetProgress[];
  selectedMonth: Date;
}

const BudgetReports = ({ budgets, currentProgress, selectedMonth }: BudgetReportsProps) => {
  const [reportPeriod, setReportPeriod] = useState('6months');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Gerar dados históricos
  const generateHistoricalData = () => {
    const months = parseInt(reportPeriod.replace('months', ''));
    const data = [];

    for (let i = months - 1; i >= 0; i--) {
      const month = subMonths(selectedMonth, i);
      const monthString = format(month, 'yyyy-MM-dd');
      
      const monthBudgets = budgets.filter(budget => budget.month_year === monthString);
      const totalBudget = monthBudgets.reduce((sum, budget) => sum + budget.budget_limit, 0);
      
      // Para este exemplo, vamos simular gastos (em produção viria do useBudgetProgress)
      const totalSpent = i === 0 ? 
        currentProgress.reduce((sum, progress) => sum + progress.spent, 0) :
        totalBudget * (0.7 + Math.random() * 0.4); // Simula 70-110% do orçamento

      data.push({
        month: format(month, "MMM/yy", { locale: ptBR }),
        orcado: totalBudget,
        gasto: totalSpent,
        percentual: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
      });
    }

    return data;
  };

  // Gerar dados por categoria
  const generateCategoryData = () => {
    if (selectedCategory === 'all') {
      return currentProgress.map(progress => ({
        categoria: progress.categoryName,
        orcado: progress.budgetLimit,
        gasto: progress.spent,
        percentual: progress.percentage,
        status: progress.isOverBudget ? 'Excedido' : progress.percentage >= 80 ? 'Alerta' : 'OK'
      }));
    }

    const categoryProgress = currentProgress.find(p => p.categoryId === selectedCategory);
    if (!categoryProgress) return [];

    // Gerar histórico da categoria específica (simulado)
    const months = parseInt(reportPeriod.replace('months', ''));
    const data = [];

    for (let i = months - 1; i >= 0; i--) {
      const month = subMonths(selectedMonth, i);
      const monthString = format(month, 'yyyy-MM-dd');
      
      const categoryBudget = budgets.find(budget => 
        budget.month_year === monthString && budget.category_id === selectedCategory
      );

      if (categoryBudget) {
        const spent = i === 0 ? categoryProgress.spent : 
          categoryBudget.budget_limit * (0.6 + Math.random() * 0.5);

        data.push({
          month: format(month, "MMM/yy", { locale: ptBR }),
          orcado: categoryBudget.budget_limit,
          gasto: spent,
          percentual: (spent / categoryBudget.budget_limit) * 100
        });
      }
    }

    return data;
  };

  const historicalData = generateHistoricalData();
  const categoryData = generateCategoryData();

  // Análises e insights
  const getInsights = () => {
    const insights = [];

    // Análise de tendência
    if (historicalData.length >= 2) {
      const lastMonth = historicalData[historicalData.length - 1];
      const previousMonth = historicalData[historicalData.length - 2];
      
      if (lastMonth.percentual > previousMonth.percentual) {
        insights.push({
          type: 'warning',
          title: 'Tendência de Aumento',
          description: `Os gastos aumentaram ${(lastMonth.percentual - previousMonth.percentual).toFixed(1)}% em relação ao mês anterior.`
        });
      } else {
        insights.push({
          type: 'success',
          title: 'Melhoria no Controle',
          description: `Os gastos diminuíram ${(previousMonth.percentual - lastMonth.percentual).toFixed(1)}% em relação ao mês anterior.`
        });
      }
    }

    // Análise de categorias problemáticas
    const problematicCategories = currentProgress.filter(p => p.isOverBudget);
    if (problematicCategories.length > 0) {
      insights.push({
        type: 'error',
        title: 'Categorias Excedidas',
        description: `${problematicCategories.length} categoria(s) excederam o orçamento: ${problematicCategories.map(p => p.categoryName).join(', ')}.`
      });
    }

    // Análise de economia
    const totalSaved = currentProgress.reduce((sum, p) => sum + Math.max(0, p.remaining), 0);
    if (totalSaved > 0) {
      insights.push({
        type: 'success',
        title: 'Economia Realizada',
        description: `Você economizou ${formatCurrency(totalSaved)} neste mês em relação ao orçamento planejado.`
      });
    }

    return insights;
  };

  const insights = getInsights();

  // Dados para recomendações
  const getRecommendations = () => {
    const recommendations = [];

    // Recomendação baseada em gastos excessivos
    const overBudgetCategories = currentProgress.filter(p => p.isOverBudget);
    overBudgetCategories.forEach(category => {
      const excess = Math.abs(category.remaining);
      const suggestedIncrease = excess * 1.1; // 10% a mais que o excesso
      recommendations.push({
        category: category.categoryName,
        type: 'increase',
        current: category.budgetLimit,
        suggested: category.budgetLimit + suggestedIncrease,
        reason: `Categoria excedeu em ${formatCurrency(excess)}. Sugerimos aumentar o orçamento.`
      });
    });

    // Recomendação baseada em economias
    const underBudgetCategories = currentProgress.filter(p => !p.isOverBudget && p.percentage < 70);
    underBudgetCategories.forEach(category => {
      const savings = category.remaining;
      const suggestedDecrease = savings * 0.5; // Reduzir metade da economia
      if (suggestedDecrease > 50) { // Só sugerir se a redução for significativa
        recommendations.push({
          category: category.categoryName,
          type: 'decrease',
          current: category.budgetLimit,
          suggested: category.budgetLimit - suggestedDecrease,
          reason: `Categoria com baixa utilização (${category.percentage.toFixed(1)}%). Pode reduzir o orçamento.`
        });
      }
    });

    return recommendations.slice(0, 5); // Limitar a 5 recomendações
  };

  const recommendations = getRecommendations();

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Select value={reportPeriod} onValueChange={setReportPeriod}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Últimos 3 meses</SelectItem>
              <SelectItem value="6months">Últimos 6 meses</SelectItem>
              <SelectItem value="12months">Últimos 12 meses</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {currentProgress.map(progress => (
                <SelectItem key={progress.categoryId} value={progress.categoryId}>
                  {progress.categoryName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </div>

      {/* Gráfico de Tendência */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {selectedCategory === 'all' ? 'Tendência Geral' : 'Tendência da Categoria'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={selectedCategory === 'all' ? historicalData : categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  name === 'percentual' ? `${value.toFixed(1)}%` : formatCurrency(value),
                  name === 'orcado' ? 'Orçado' : name === 'gasto' ? 'Gasto' : 'Percentual'
                ]}
              />
              <Line type="monotone" dataKey="orcado" stroke="#3B82F6" name="Orçado" />
              <Line type="monotone" dataKey="gasto" stroke="#EF4444" name="Gasto" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Insights e Análises */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Insights e Análises
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg border-l-4 ${
                  insight.type === 'success' ? 'bg-green-50 border-green-500' :
                  insight.type === 'warning' ? 'bg-amber-50 border-amber-500' :
                  'bg-red-50 border-red-500'
                }`}
              >
                <h4 className="font-medium">{insight.title}</h4>
                <p className="text-sm text-gray-600">{insight.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recomendações */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Recomendações para o Próximo Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{rec.category}</h4>
                    <span className={`text-xs px-2 py-1 rounded ${
                      rec.type === 'increase' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {rec.type === 'increase' ? 'Aumentar' : 'Reduzir'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{rec.reason}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span>Atual: {formatCurrency(rec.current)}</span>
                    <span>→</span>
                    <span className="font-medium">Sugerido: {formatCurrency(rec.suggested)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BudgetReports;
