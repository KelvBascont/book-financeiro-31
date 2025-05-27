import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient'; // ajuste o path conforme seu projeto
import { useUser } from '@/hooks/use-user'; // ajuste o path conforme seu projeto
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Plus, Target, TrendingUp, PiggyBank } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Savings = () => {
  const { toast } = useToast();
  const { user } = useUser(); // para pegar o usuário logado

  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  const [goalForm, setGoalForm] = useState({
    name: '',
    initialAmount: '',
    targetAmount: ''
  });

  const [transactionForm, setTransactionForm] = useState({
    goalId: '',
    amount: '',
    date: '',
    description: ''
  });

  // Estados para dados vindos do Supabase
  const [goals, setGoals] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Buscar metas do Supabase
  const fetchGoals = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) {
      toast({ title: "Erro", description: "Erro ao carregar metas", variant: "destructive" });
    } else {
      setGoals(data || []);
    }
    setLoading(false);
  };

  // Buscar transações do Supabase
  const fetchTransactions = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('savings_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });
    if (error) {
      toast({ title: "Erro", description: "Erro ao carregar movimentações", variant: "destructive" });
    } else {
      setTransactions(data || []);
    }
  };

  useEffect(() => {
    if (user) {
      fetchGoals();
      fetchTransactions();
    }
    // eslint-disable-next-line
  }, [user]);

  // Adicionar meta no Supabase
  const handleAddGoal = async () => {
    if (!goalForm.name || !goalForm.initialAmount) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .insert([{
          name: goalForm.name,
          current_amount: Number(goalForm.initialAmount),
          target_amount: goalForm.targetAmount ? Number(goalForm.targetAmount) : null,
          user_id: user.id
        }])
        .select()
        .single();
      if (error) throw error;
      toast({
        title: "Meta criada!",
        description: `Meta "${goalForm.name}" foi criada com sucesso`,
      });
      setGoalForm({ name: '', initialAmount: '', targetAmount: '' });
      setShowAddGoal(false);
      fetchGoals();
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao criar meta", variant: "destructive" });
    }
  };

  // Adicionar transação no Supabase
  const handleAddTransaction = async () => {
    if (!transactionForm.goalId || !transactionForm.amount || !transactionForm.date) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    try {
      const { data, error } = await supabase
        .from('savings_transactions')
        .insert([{
          goal_id: transactionForm.goalId,
          amount: Number(transactionForm.amount),
          date: transactionForm.date,
          description: transactionForm.description,
          user_id: user.id
        }])
        .select()
        .single();
      if (error) throw error;

      // Atualiza o valor atual da meta
      await supabase.rpc('increment_savings_goal', {
        goal_id_input: transactionForm.goalId,
        amount_input: Number(transactionForm.amount)
      });

      toast({
        title: "Rendimento adicionado!",
        description: `R$ ${transactionForm.amount} foi adicionado à sua meta`,
      });
      setTransactionForm({ goalId: '', amount: '', date: '', description: '' });
      setShowAddTransaction(false);
      fetchGoals();
      fetchTransactions();
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao adicionar rendimento", variant: "destructive" });
    }
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

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Reservas e Metas</h2>
          <p className="text-gray-600 mt-1">Crie e acompanhe suas "caixinhas" de economia</p>
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
                  value={goalForm.initialAmount}
                  onChange={(e) => setGoalForm({ ...goalForm, initialAmount: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="targetAmount">Meta de Valor (opcional)</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={goalForm.targetAmount}
                  onChange={(e) => setGoalForm({ ...goalForm, targetAmount: e.target.value })}
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
                  className="w-full p-2 border rounded-md"
                  value={transactionForm.goalId}
                  onChange={(e) => setTransactionForm({ ...transactionForm, goalId: e.target.value })}
                >
                  <option value="">Selecione a meta</option>
                  {goals.map((goal) => (
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
        {goals.map((goal) => {
          const progress = getProgress(goal.current_amount, goal.target_amount);
          const progressColor = getProgressColor(progress);

          return (
            <Card key={goal.id} className="relative overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PiggyBank className="h-5 w-5 text-green-600" />
                  {goal.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    R$ {goal.current_amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  {goal.target_amount > 0 && (
                    <div className="text-sm text-gray-600">
                      de R$ {goal.target_amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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

                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Criado em:</span>
                    <span>{new Date(goal.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Última atualização:</span>
                    <span>{new Date(goal.updated_at || goal.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  Ver Histórico
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimas Movimentações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.map((transaction) => {
              const goal = goals.find(g => g.id === transaction.goal_id);
              return (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{goal?.name}</p>
                      <p className="text-sm text-gray-600">
                        {transaction.description} • {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      +R$ {Number(transaction.amount).toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Savings;
