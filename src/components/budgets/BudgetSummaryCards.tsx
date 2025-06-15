
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';

interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  overallPercentage: number;
  categoriesOverBudget: number;
  totalCategories: number;
}

interface BudgetSummaryCardsProps {
  summary: BudgetSummary;
}

const BudgetSummaryCards = ({ summary }: BudgetSummaryCardsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const cards = [
    {
      title: 'Orçamento Total',
      value: formatCurrency(summary.totalBudget),
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Gasto',
      value: formatCurrency(summary.totalSpent),
      subtitle: `${summary.overallPercentage.toFixed(1)}% do orçamento`,
      icon: DollarSign,
      color: summary.overallPercentage > 100 ? 'text-red-600' : 'text-green-600',
      bgColor: summary.overallPercentage > 100 ? 'bg-red-50' : 'bg-green-50'
    },
    {
      title: 'Saldo Restante',
      value: formatCurrency(summary.totalRemaining),
      icon: TrendingUp,
      color: summary.totalRemaining >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: summary.totalRemaining >= 0 ? 'bg-green-50' : 'bg-red-50'
    },
    {
      title: 'Categorias em Alerta',
      value: `${summary.categoriesOverBudget}/${summary.totalCategories}`,
      subtitle: summary.categoriesOverBudget > 0 ? 'categorias excederam o orçamento' : 'todas dentro do limite',
      icon: AlertTriangle,
      color: summary.categoriesOverBudget > 0 ? 'text-amber-600' : 'text-green-600',
      bgColor: summary.categoriesOverBudget > 0 ? 'bg-amber-50' : 'bg-green-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${card.bgColor}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div>
                <div className={`text-2xl font-bold ${card.color}`}>
                  {card.value}
                </div>
                {card.subtitle && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {card.subtitle}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BudgetSummaryCards;
