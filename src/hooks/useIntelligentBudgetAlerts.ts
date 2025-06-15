
import { useMemo } from 'react';
import { useBudgetProgress } from '@/hooks/useBudgetProgress';
import { useMonthlyBudgets } from '@/hooks/useMonthlyBudgets';
import { startOfMonth, format } from 'date-fns';

export interface BudgetAlert {
  id: string;
  categoryId: string;
  categoryName: string;
  type: 'near_limit' | 'exceeded' | 'trend_warning' | 'optimization';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  currentSpent: number;
  budgetLimit: number;
  percentage: number;
  recommendation?: string;
  estimatedOverage?: number;
}

export const useIntelligentBudgetAlerts = () => {
  const currentMonth = startOfMonth(new Date());
  const { budgets, alerts: budgetAlertsConfig } = useMonthlyBudgets();
  const { budgetProgress } = useBudgetProgress(budgets, currentMonth);

  const intelligentAlerts = useMemo((): BudgetAlert[] => {
    const alerts: BudgetAlert[] = [];

    budgetProgress.forEach(progress => {
      const alertConfig = budgetAlertsConfig.find(config => 
        config.category_id === progress.categoryId && config.is_enabled
      );
      
      const threshold = alertConfig?.alert_threshold || 80;

      // Alerta de limite próximo
      if (progress.percentage >= threshold && progress.percentage < 100) {
        alerts.push({
          id: `near_limit_${progress.categoryId}`,
          categoryId: progress.categoryId,
          categoryName: progress.categoryName,
          type: 'near_limit',
          severity: progress.percentage >= 90 ? 'high' : 'medium',
          title: 'Limite Próximo',
          message: `${progress.categoryName} está em ${progress.percentage.toFixed(1)}% do orçamento`,
          currentSpent: progress.spent,
          budgetLimit: progress.budgetLimit,
          percentage: progress.percentage,
          recommendation: `Considere reduzir gastos em ${progress.categoryName} pelos próximos dias`
        });
      }

      // Alerta de orçamento excedido
      if (progress.isOverBudget) {
        const overage = Math.abs(progress.remaining);
        alerts.push({
          id: `exceeded_${progress.categoryId}`,
          categoryId: progress.categoryId,
          categoryName: progress.categoryName,
          type: 'exceeded',
          severity: 'critical',
          title: 'Orçamento Excedido',
          message: `${progress.categoryName} excedeu o orçamento em R$ ${overage.toFixed(2)}`,
          currentSpent: progress.spent,
          budgetLimit: progress.budgetLimit,
          percentage: progress.percentage,
          estimatedOverage: overage,
          recommendation: `Revise seus gastos em ${progress.categoryName} ou ajuste o orçamento para o próximo mês`
        });
      }

      // Alerta de tendência preocupante (baseado na velocidade de gasto)
      const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
      const currentDay = new Date().getDate();
      const expectedPercentage = (currentDay / daysInMonth) * 100;
      
      if (progress.percentage > expectedPercentage * 1.5 && progress.percentage < 100) {
        alerts.push({
          id: `trend_warning_${progress.categoryId}`,
          categoryId: progress.categoryId,
          categoryName: progress.categoryName,
          type: 'trend_warning',
          severity: 'medium',
          title: 'Ritmo de Gastos Elevado',
          message: `${progress.categoryName} está gastando ${(progress.percentage / expectedPercentage).toFixed(1)}x mais rápido que o esperado`,
          currentSpent: progress.spent,
          budgetLimit: progress.budgetLimit,
          percentage: progress.percentage,
          recommendation: `No ritmo atual, você pode exceder o orçamento. Considere desacelerar os gastos`
        });
      }

      // Alerta de otimização (muito baixo uso do orçamento)
      if (progress.percentage < 30 && currentDay > daysInMonth * 0.7) {
        alerts.push({
          id: `optimization_${progress.categoryId}`,
          categoryId: progress.categoryId,
          categoryName: progress.categoryName,
          type: 'optimization',
          severity: 'low',
          title: 'Oportunidade de Otimização',
          message: `${progress.categoryName} usou apenas ${progress.percentage.toFixed(1)}% do orçamento`,
          currentSpent: progress.spent,
          budgetLimit: progress.budgetLimit,
          percentage: progress.percentage,
          recommendation: `Considere reduzir o orçamento desta categoria ou realocar para outras áreas`
        });
      }
    });

    // Ordenar por severidade
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return alerts.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);
  }, [budgetProgress, budgetAlertsConfig]);

  // Estatísticas dos alertas
  const alertStats = useMemo(() => {
    const stats = {
      total: intelligentAlerts.length,
      critical: intelligentAlerts.filter(a => a.severity === 'critical').length,
      high: intelligentAlerts.filter(a => a.severity === 'high').length,
      medium: intelligentAlerts.filter(a => a.severity === 'medium').length,
      low: intelligentAlerts.filter(a => a.severity === 'low').length
    };
    
    return stats;
  }, [intelligentAlerts]);

  return {
    intelligentAlerts,
    alertStats
  };
};
