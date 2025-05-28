
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Plus, Target, TrendingUp, PiggyBank } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseTables } from '@/hooks/useSupabaseTables';
import { useFormatters } from '@/hooks/useFormatters';
import CrudActions from '@/components/CrudActions';

const Savings = () => {
  const { toast } = useToast();
  const formatters = useFormatters();
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  
  const {
    savingsGoals,
    savingsTransactions,
    addSavingsGoal,
    deleteSavingsGoal,
    addSavingsTransaction,
    loading
  } = useSupabaseTables();
  
  const [goalForm, setGoalForm] = useState({
    name: '',
    initial_amount: '',
    target_amount: ''
  });

  const [transactionForm, setTransactionForm] = useState({
    goal_id: '',
    amount: '',
    date: '',
    description: ''
  });

  const handleAddGoal = async () => {
    if (!goalForm.name || !goalForm.initial_amount) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    const initialAmount = parseFloat(goalForm.initial_amount);
    const targetAmount = goalForm.target_amount ? parseFloat(goalForm.target_amount) : 0;
    
    const result = await addSavingsGoal({
      name: goalForm.name,
      initial_amount: initialAmount,
      current_amount: initialAmount,
      target_amount: targetAmount
    });

    if (result) {
      setGoalForm({ name: '', initial_amount: '', target_amount: '' });
      setShowAddGoal(false);
    }
  };

  const handleAddTransaction = async () => {
    if (!transactionForm.goal_id || !transactionForm.amount || !transactionForm.date) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    const result = await addSavingsTransaction({
      goal_id: transactionForm.goal_id,
      amount: parseFloat(transactionForm.amount),
      date: transactionForm.date,
      description: transactionForm.description
    });

    if (result) {
      setTransactionForm({ goal_id: '', amount: '', date: '', description: '' });
      setShowAddTransaction(false);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    await deleteSavingsGoal(id);
  };

  const getProgress = (current: number, target: number) => {
    return target > 0 ? (current / target) * 100 : 0;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Reservas e Metas</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Crie e acompanhe suas "caixinhas" de economia</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddGoal(!showAddGoal)} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Nova Meta
          </Button>
          <Button onClick={() => setShowAddTransaction(!showAddTransaction)} className="bg-green-500 hover:bg-green-600">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Valor
          </Button>
        </div>
      </div>

      {showAddGoal && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Criar Nova Meta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="goalName">Nome da Meta *</Label>
                <Input
                  id="goalName"
                  placeholder="Ex: Reserva de Emergência"
                  value={goalForm.name}
                  onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="initialAmount">Valor Inicial *</Label>
                <Input
                  id="initialAmount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={goalForm.initial_amount}
                  onChange={(e) => setGoalForm({ ...goalForm, initial_amount: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="targetAmount">Meta de Valor (opcional)</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={goalForm.target_amount}
                  onChange={(e) => setGoalForm({ ...goalForm, target_amount: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddGoal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddGoal}>
                Criar Meta
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showAddTransaction && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Adicionar Rendimento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="transactionGoal">Meta *</Label>
                <select
                  id="transactionGoal"
                  className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-600"
                  value={transactionForm.goal_id}
                  onChange={(e) => setTransactionForm({ ...transactionForm, goal_id: e.target.value })}
                >
                  <option value="">Selecione a meta</option>
                  {savingsGoals.map((goal) => (
                    <option key={goal.id} value={goal.id}>
                      {goal.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="transactionAmount">Valor *</Label>
                <Input
                  id="transactionAmount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={transactionForm.amount}
                  onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="transactionDate">Data *</Label>
                <Input
                  id="transactionDate"
                  type="date"
                  value={transactionForm.date}
                  onChange={(e) => setTransactionForm({ ...transactionForm, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="transactionDescription">Descrição</Label>
                <Input
                  id="transactionDescription"
                  placeholder="Ex: Depósito mensal"
                  value={transactionForm.description}
                  onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddTransaction(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddTransaction} className="bg-green-500 hover:bg-green-600">
                Adicionar Rendimento
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {savingsGoals.map((goal) => {
          const progress = getProgress(goal.current_amount, goal.target_amount);
          
          return (
            <Card key={goal.id} className="relative overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <PiggyBank className="h-5 w-5 text-green-600" />
                    {goal.name}
                  </CardTitle>
                  <CrudActions
                    item={goal}
                    onDelete={() => handleDeleteGoal(goal.id)}
                    showEdit={false}
                    showView={false}
                    deleteTitle="Confirmar exclusão"
                    deleteDescription="Esta ação não pode ser desfeita. A meta será permanentemente removida."
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {formatters.currency(goal.current_amount)}
                  </div>
                  {goal.target_amount > 0 && (
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      de {formatters.currency(goal.target_amount)}
                    </div>
                  )}
                </div>
                
                {goal.target_amount > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span>{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
                
                <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                  <div className="flex justify-between">
                    <span>Criado em:</span>
                    <span>{formatters.date(goal.created_at)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {savingsGoals.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Nenhuma meta cadastrada</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Clique em "Nova Meta" para começar</p>
          </div>
        )}
      </div>

      {savingsTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Últimas Movimentações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {savingsTransactions.slice(0, 10).map((transaction) => {
                const goal = savingsGoals.find(g => g.id === transaction.goal_id);
                return (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{goal?.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {transaction.description} • {formatters.date(transaction.date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        +{formatters.currency(transaction.amount)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Savings;
