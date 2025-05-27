import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useUser } from '@/hooks/use-user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, Input, Label } from '@/components/ui';
import { useToast } from '@/hooks/use-toast';

const Cards = () => {
  const { toast } = useToast();
  const { user } = useUser();

  const [cards, setCards] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', dueDate: '', closingDate: '' });

  // Buscar cartões
  const fetchCards = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) toast({ title: "Erro", description: "Erro ao carregar cartões", variant: "destructive" });
    else setCards(data || []);
  };

  // Adicionar cartão
  const handleAddCard = async () => {
    if (!form.name || !form.dueDate || !form.closingDate) {
      toast({ title: "Erro", description: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from('cards').insert([{
      name: form.name,
      due_date: form.dueDate,
      closing_date: form.closingDate,
      user_id: user.id
    }]);
    if (error) toast({ title: "Erro", description: "Erro ao adicionar cartão", variant: "destructive" });
    else {
      setForm({ name: '', dueDate: '', closingDate: '' });
      fetchCards();
    }
  };

  // Atualizar cartão
  const handleUpdateCard = async (id: string, updates: any) => {
    const { error } = await supabase.from('cards').update(updates).eq('id', id);
    if (error) toast({ title: "Erro", description: "Erro ao atualizar cartão", variant: "destructive" });
    else fetchCards();
  };

  // Remover cartão
  const handleDeleteCard = async (id: string) => {
    const { error } = await supabase.from('cards').delete().eq('id', id);
    if (error) toast({ title: "Erro", description: "Erro ao remover cartão", variant: "destructive" });
    else fetchCards();
  };

  useEffect(() => { fetchCards(); }, [user]);

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Gestão de Cartões</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Cadastre cartões e registre suas despesas</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={() => setShowAddCard(!showAddCard)} variant="outline" className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Novo Cartão
          </Button>
          <Button onClick={() => setShowAddExpense(!showAddExpense)} className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Nova Despesa
          </Button>
        </div>
      </div>

      {/* Resumo dos gastos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Total de Gastos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatters.currency(getTotalExpenses())}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Cartões Ativos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{cards.length}</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Despesas do Mês</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{expenses.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {showAddCard && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Cadastrar Novo Cartão
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="cardName">Nome do Cartão *</Label>
                <Input
                  id="cardName"
                  placeholder="Ex: Nubank, Itaú..."
                  value={cardForm.name}
                  onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="dueDate">Dia do Vencimento *</Label>
                <Input
                  id="dueDate"
                  type="number"
                  min="1"
                  max="31"
                  placeholder="Ex: 15"
                  value={cardForm.dueDate}
                  onChange={(e) => setCardForm({ ...cardForm, dueDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="closingDate">Dia do Fechamento *</Label>
                <Input
                  id="closingDate"
                  type="number"
                  min="1"
                  max="31"
                  placeholder="Ex: 8"
                  value={cardForm.closingDate}
                  onChange={(e) => setCardForm({ ...cardForm, closingDate: e.target.value })}
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddCard(false)} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button onClick={handleAddCard} className="w-full sm:w-auto">
                Cadastrar Cartão
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showAddExpense && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Registrar Nova Despesa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="expenseCard">Cartão *</Label>
                <Select value={expenseForm.cardId} onValueChange={(value) => setExpenseForm({ ...expenseForm, cardId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cartão" />
                  </SelectTrigger>
                  <SelectContent>
                    {cards.map((card) => (
                      <SelectItem key={card.id} value={card.id}>
                        {card.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="purchaseDate">Data da Compra *</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={expenseForm.purchaseDate}
                  onChange={(e) => setExpenseForm({ ...expenseForm, purchaseDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição *</Label>
                <Input
                  id="description"
                  placeholder="Ex: Supermercado, Gasolina..."
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="amount">Valor *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="installment"
                checked={expenseForm.isInstallment}
                onCheckedChange={(checked) => setExpenseForm({ ...expenseForm, isInstallment: checked })}
              />
              <Label htmlFor="installment">Compra parcelada</Label>
            </div>
            
            {expenseForm.isInstallment && (
              <div className="w-full sm:w-32">
                <Label htmlFor="installments">Número de Parcelas</Label>
                <Input
                  id="installments"
                  type="number"
                  min="1"
                  max="24"
                  placeholder="Ex: 12"
                  value={expenseForm.installments}
                  onChange={(e) => setExpenseForm({ ...expenseForm, installments: e.target.value })}
                />
              </div>
            )}

            {expenseForm.purchaseDate && expenseForm.cardId && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <span className="text-sm text-blue-800 dark:text-blue-200">
                  Esta despesa será cobrada na fatura de{' '}
                  <strong>
                    {calculateBillingMonth(expenseForm.purchaseDate, cards.find(c => c.id === expenseForm.cardId)?.closingDate || 0)}
                  </strong>
                </span>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddExpense(false)} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button onClick={handleAddExpense} className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto">
                Registrar Despesa
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cartões Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cards.map((card) => (
                <div key={card.id} className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-800">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-8 w-8 text-blue-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{card.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Venc: {card.dueDate} | Fech: {card.closingDate}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimas Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expenses.slice(0, 5).map((expense) => (
                <div key={expense.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-800 gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{expense.description}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {cards.find(c => c.id === expense.cardId)?.name} • {formatters.date(expense.purchaseDate)}
                    </p>
                    <span className="inline-block px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full mt-1">
                      Fatura: {expense.billingMonth}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatters.currency(expense.amount)}</p>
                    {expense.isInstallment && (
                      <p className="text-xs text-gray-600 dark:text-gray-400">{expense.installments}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Cards;
