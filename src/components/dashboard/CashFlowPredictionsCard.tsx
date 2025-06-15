
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, AlertTriangle, Target } from 'lucide-react';
import { useCashFlowPredictions } from '@/hooks/useCashFlowPredictions';
import { useFormatters } from '@/hooks/useFormatters';

const CashFlowPredictionsCard = () => {
  const { predictions } = useCashFlowPredictions();
  const formatters = useFormatters();

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getConfidenceText = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'Alta Confiança';
      case 'medium': return 'Média Confiança';
      case 'low': return 'Baixa Confiança';
      default: return 'Indefinida';
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Previsões de Fluxo de Caixa
        </CardTitle>
      </CardHeader>
      <CardContent>
        {predictions.length > 0 ? (
          <div className="space-y-6">
            {/* Gráfico de Previsões */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={predictions}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="month" 
                    fontSize={12}
                    stroke="#6b7280"
                  />
                  <YAxis 
                    tickFormatter={(value) => formatters.currencyCompact(value)}
                    fontSize={12}
                    stroke="#6b7280"
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      formatters.currency(value),
                      name === 'projectedIncome' ? 'Receita Projetada' :
                      name === 'projectedExpenses' ? 'Despesas Projetadas' :
                      name === 'projectedCardExpenses' ? 'Cartão Projetado' :
                      'Saldo Projetado'
                    ]}
                    contentStyle={{
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="projectedIncome" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="projectedIncome"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="projectedExpenses" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="projectedExpenses"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="projectedBalance" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    name="projectedBalance"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Resumo das Previsões */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {predictions.slice(0, 2).map((prediction, index) => (
                <div key={index} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{prediction.month}</h4>
                    <Badge className={getConfidenceColor(prediction.confidence)}>
                      {getConfidenceText(prediction.confidence)}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Saldo Projetado:</span>
                      <span className={`font-medium ${prediction.projectedBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatters.currency(prediction.projectedBalance)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Receitas:</span>
                      <span className="text-green-600">{formatters.currency(prediction.projectedIncome)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Despesas:</span>
                      <span className="text-red-600">{formatters.currency(prediction.projectedExpenses)}</span>
                    </div>
                  </div>

                  {/* Riscos e Oportunidades */}
                  {prediction.risks.length > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center gap-1 text-xs text-red-600 mb-1">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Riscos:</span>
                      </div>
                      {prediction.risks.slice(0, 2).map((risk, riskIndex) => (
                        <div key={riskIndex} className="text-xs text-red-600 ml-4">
                          • {risk}
                        </div>
                      ))}
                    </div>
                  )}

                  {prediction.opportunities.length > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center gap-1 text-xs text-green-600 mb-1">
                        <Target className="h-3 w-3" />
                        <span>Oportunidades:</span>
                      </div>
                      {prediction.opportunities.slice(0, 2).map((opportunity, oppIndex) => (
                        <div key={oppIndex} className="text-xs text-green-600 ml-4">
                          • {opportunity}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <TrendingUp className="h-12 w-12 mx-auto text-blue-500 mb-2 opacity-50" />
            <p className="text-gray-600 dark:text-gray-300">
              Adicione mais dados para gerar previsões precisas
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CashFlowPredictionsCard;
