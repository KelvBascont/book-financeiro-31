
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, Target, AlertTriangle, TrendingUp } from 'lucide-react';
import { useMonthlyBudgets } from '@/hooks/useMonthlyBudgets';
import { useBudgetProgress } from '@/hooks/useBudgetProgress';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import BudgetForm from './budgets/BudgetForm';
import BudgetProgressList from './budgets/BudgetProgressList';
import BudgetSummaryCards from './budgets/BudgetSummaryCards';
import BudgetAlertsConfig from './budgets/BudgetAlertsConfig';

const MonthlyBudgets = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [showAlertsConfig, setShowAlertsConfig] = useState(false);
  
  const { budgets, alerts, loading, createBudget, updateBudget, deleteBudget, updateAlert } = useMonthlyBudgets();
  const { budgetProgress, summary } = useBudgetProgress(budgets, selectedMonth);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Orçamento Mensal</h1>
          <p className="text-muted-foreground">
            {format(selectedMonth, "MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="month"
            value={format(selectedMonth, 'yyyy-MM')}
            onChange={(e) => setSelectedMonth(new Date(e.target.value + '-01'))}
            className="px-3 py-2 border rounded-md"
          />
          <Button 
            onClick={() => setShowAlertsConfig(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <AlertTriangle className="h-4 w-4" />
            Configurar Alertas
          </Button>
          <Button 
            onClick={() => setShowBudgetForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Novo Orçamento
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <BudgetSummaryCards summary={summary} />

      {/* Budget Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Acompanhamento por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          {budgetProgress.length > 0 ? (
            <BudgetProgressList 
              budgetProgress={budgetProgress}
              alerts={alerts}
              onUpdateBudget={updateBudget}
              onDeleteBudget={deleteBudget}
            />
          ) : (
            <div className="text-center py-8">
              <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-muted-foreground">
                Nenhum orçamento definido para este mês
              </p>
              <Button 
                onClick={() => setShowBudgetForm(true)}
                className="mt-4"
              >
                Criar Primeiro Orçamento
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Budget Form Modal */}
      {showBudgetForm && (
        <BudgetForm
          selectedMonth={selectedMonth}
          onSubmit={createBudget}
          onClose={() => setShowBudgetForm(false)}
        />
      )}

      {/* Alerts Configuration Modal */}
      {showAlertsConfig && (
        <BudgetAlertsConfig
          alerts={alerts}
          onUpdateAlert={updateAlert}
          onClose={() => setShowAlertsConfig(false)}
        />
      )}
    </div>
  );
};

export default MonthlyBudgets;
