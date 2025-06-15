
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, AlertTriangle, CheckCircle, Info, Lightbulb, ExternalLink } from 'lucide-react';
import { useIntelligentBudgetAlerts } from '@/hooks/useIntelligentBudgetAlerts';
import { useFormatters } from '@/hooks/useFormatters';
import { useNavigate } from 'react-router-dom';

const IntelligentAlertsCard = () => {
  const { intelligentAlerts, alertStats } = useIntelligentBudgetAlerts();
  const formatters = useFormatters();
  const navigate = useNavigate();

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'exceeded':
      case 'trend_warning': return <AlertTriangle className="h-4 w-4" />;
      case 'near_limit': return <Info className="h-4 w-4" />;
      case 'optimization': return <Lightbulb className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'critical': return 'Crítico';
      case 'high': return 'Alto';
      case 'medium': return 'Médio';
      case 'low': return 'Baixo';
      default: return 'Info';
    }
  };

  const handleViewBudgets = () => {
    navigate('/budgets');
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Bell className="h-5 w-5 text-red-500" />
            Alertas Inteligentes
          </CardTitle>
          {intelligentAlerts.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleViewBudgets}
              className="flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              Ver Orçamentos
            </Button>
          )}
        </div>
        
        {/* Estatísticas dos alertas */}
        {alertStats.total > 0 && (
          <div className="flex gap-2 flex-wrap">
            {alertStats.critical > 0 && (
              <Badge variant="destructive" className="text-xs">
                {alertStats.critical} Crítico{alertStats.critical > 1 ? 's' : ''}
              </Badge>
            )}
            {alertStats.high > 0 && (
              <Badge className="bg-orange-100 text-orange-700 text-xs">
                {alertStats.high} Alto{alertStats.high > 1 ? 's' : ''}
              </Badge>
            )}
            {alertStats.medium > 0 && (
              <Badge className="bg-amber-100 text-amber-700 text-xs">
                {alertStats.medium} Médio{alertStats.medium > 1 ? 's' : ''}
              </Badge>
            )}
            {alertStats.low > 0 && (
              <Badge variant="outline" className="text-xs">
                {alertStats.low} Baixo{alertStats.low > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {intelligentAlerts.length > 0 ? (
          <div className="space-y-3">
            {intelligentAlerts.slice(0, 6).map((alert) => (
              <div 
                key={alert.id}
                className={`p-3 rounded-lg border ${getAlertColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getAlertIcon(alert.type)}
                    <div>
                      <h4 className="font-medium text-sm">{alert.title}</h4>
                      <p className="text-xs opacity-90">{alert.message}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {getSeverityText(alert.severity)}
                  </Badge>
                </div>

                {/* Detalhes do orçamento */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                  <div className="flex justify-between">
                    <span className="opacity-75">Gasto:</span>
                    <span className="font-medium">{formatters.currency(alert.currentSpent)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-75">Orçamento:</span>
                    <span className="font-medium">{formatters.currency(alert.budgetLimit)}</span>
                  </div>
                </div>

                {/* Barra de progresso visual */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className={`h-2 rounded-full ${
                      alert.percentage > 100 ? 'bg-red-500' :
                      alert.percentage > 90 ? 'bg-orange-500' :
                      alert.percentage > 80 ? 'bg-amber-500' :
                      'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(alert.percentage, 100)}%` }}
                  />
                </div>

                {/* Recomendação */}
                {alert.recommendation && (
                  <div className="mt-2 p-2 bg-white/50 rounded text-xs">
                    <strong>💡 Recomendação:</strong> {alert.recommendation}
                  </div>
                )}

                {/* Estimativa de excesso */}
                {alert.estimatedOverage && (
                  <div className="mt-1 text-xs font-medium text-red-600">
                    Excesso: {formatters.currency(alert.estimatedOverage)}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-2" />
            <p className="text-gray-600 dark:text-gray-300">
              Todos os orçamentos estão sob controle!
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Configure orçamentos para receber alertas inteligentes
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IntelligentAlertsCard;
