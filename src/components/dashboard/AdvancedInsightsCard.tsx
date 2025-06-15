
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Info, Zap } from 'lucide-react';
import { useAdvancedInsights } from '@/hooks/useAdvancedInsights';
import { useFormatters } from '@/hooks/useFormatters';

const AdvancedInsightsCard = () => {
  const { insights } = useAdvancedInsights();
  const formatters = useFormatters();

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'info': return <Info className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (trend?: string) => {
    if (trend === 'up') return <TrendingUp className="h-3 w-3" />;
    if (trend === 'down') return <TrendingDown className="h-3 w-3" />;
    return null;
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <Zap className="h-5 w-5 text-purple-600" />
          Insights Inteligentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {insights.length > 0 ? (
          <div className="space-y-3">
            {insights.slice(0, 5).map((insight, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border ${getInsightColor(insight.type)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getInsightIcon(insight.type)}
                    <div>
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      <p className="text-xs opacity-90">{insight.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    {insight.value && (
                      <span className="font-medium">
                        {insight.value > 1 ? `${insight.value.toFixed(1)}%` : formatters.currency(insight.value)}
                      </span>
                    )}
                    {getTrendIcon(insight.trend)}
                  </div>
                </div>
                {insight.actionable && (
                  <Badge variant="outline" className="mt-2 text-xs">
                    Ação Recomendada
                  </Badge>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-2" />
            <p className="text-gray-600 dark:text-gray-300">
              Todas as suas métricas estão estáveis!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedInsightsCard;
