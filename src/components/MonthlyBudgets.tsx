
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Plus, Target, AlertTriangle, TrendingUp, BarChart3, Copy, FileText } from 'lucide-react';
import { useMonthlyBudgets } from '@/hooks/useMonthlyBudgets';
import { useBudgetProgress } from '@/hooks/useBudgetProgress';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import BudgetForm from './budgets/BudgetForm';
import BudgetProgressList from './budgets/BudgetProgressList';
import BudgetSummaryCards from './budgets/BudgetSummaryCards';
import BudgetAlertsConfig from './budgets/BudgetAlertsConfig';
import BudgetDashboard from './budgets/BudgetDashboard';
import BudgetTemplates from './budgets/BudgetTemplates';
import BudgetReports from './budgets/BudgetReports';

const MonthlyBudgets = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [showAlertsConfig, setShowAlertsConfig] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  
  const { budgets, alerts, loading, createBudget, updateBudget, deleteBudget, updateAlert } = useMonthlyBudgets();
  const { budgetProgress, summary } = useBudgetProgress(budgets, selectedMonth);

  const handleCreateBudgetsFromTemplate = async (newBudgets: any[]) => {
    for (const budget of newBudgets) {
      await createBudget(budget);
    }
  };

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
            onClick={() => setShowTemplates(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Templates
          </Button>
          <Button 
            onClick={() => setShowAlertsConfig(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <AlertTriangle className="h-4 w-4" />
            Alertas
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

      {/* Tabs Navigation */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Acompanhamento
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Resumo do Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              {budgetProgress.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {budgetProgress.slice(0, 6).map((progress) => (
                    <div key={progress.categoryId} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{progress.categoryName}</h3>
                        <span className={`text-sm ${progress.isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                          {progress.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Gasto: R$ {progress.spent.toFixed(2)}</span>
                          <span>Limite: R$ {progress.budgetLimit.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${progress.isOverBudget ? 'bg-red-500' : 'bg-green-500'}`}
                            style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
        </TabsContent>

        {/* Dashboard */}
        <TabsContent value="dashboard">
          <BudgetDashboard budgetProgress={budgetProgress} summary={summary} />
        </TabsContent>

        {/* Acompanhamento Detalhado */}
        <TabsContent value="progress">
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
        </TabsContent>

        {/* Relatórios */}
        <TabsContent value="reports">
          <BudgetReports 
            budgets={budgets}
            currentProgress={budgetProgress}
            selectedMonth={selectedMonth}
          />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showBudgetForm && (
        <BudgetForm
          selectedMonth={selectedMonth}
          onSubmit={createBudget}
          onClose={() => setShowBudgetForm(false)}
        />
      )}

      {showAlertsConfig && (
        <BudgetAlertsConfig
          alerts={alerts}
          onUpdateAlert={updateAlert}
          onClose={() => setShowAlertsConfig(false)}
        />
      )}

      {showTemplates && (
        <BudgetTemplates
          budgets={budgets}
          selectedMonth={selectedMonth}
          onCreateBudgetsFromTemplate={handleCreateBudgetsFromTemplate}
          onClose={() => setShowTemplates(false)}
        />
      )}
    </div>
  );
};

export default MonthlyBudgets;
