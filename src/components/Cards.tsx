import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, CreditCard, Calendar, AlertCircle, Edit, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFormatters } from '@/hooks/useFormatters';
import { useSupabaseTables } from '@/hooks/useSupabaseTables';
import CrudActions from '@/components/CrudActions';
import { useAuth } from '@/contexts/AuthContext';

const Cards = () => {
  const { toast } = useToast();
  const formatters = useFormatters();
  const [showAddCard, setShowAddCard] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingCard, setEditingCard] = useState<any>(null);
  const { user } = useAuth();
  
  const {
    cards,
    cardExpenses,
    addCard,
    updateCard,
    deleteCard,
    loading
  } = useSupabaseTables();
  
  const [cardForm, setCardForm] = useState({
    name: '',
    due_date: '',
    closing_date: ''
  });

  const [expenseForm, setExpenseForm] = useState({
    card_id: '',
    purchase_date: '',
    description: '',
    amount: '',
    is_installment: false,
    installments: '',
    billing_month: ''
  });

  const handleAddCard = async () => {
    if (!cardForm.name || !cardForm.due_date || !cardForm.closing_date) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    const result = await addCard({
      name: cardForm.name,
      due_date: parseInt(cardForm.due_date),
      closing_date: parseInt(cardForm.closing_date)
    });

    if (result) {
      setCardForm({ name: '', due_date: '', closing_date: '' });
      setShowAddCard(false);
    }
  };

  const handleEditCard = (card: any) => {
    setEditingCard(card);
    setCardForm({
      name: card.name,
      due_date: card.due_date.toString(),
      closing_date: card.closing_date.toString()
    });
    setShowAddCard(true);
  };

  const handleUpdateCard = async () => {
    if (!editingCard || !cardForm.name || !cardForm.due_date || !cardForm.closing_date) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    const result = await updateCard(editingCard.id, {
      name: cardForm.name,
      due_date: parseInt(cardForm.due_date),
      closing_date: parseInt(cardForm.closing_date)
    });

    if (result) {
      setCardForm({ name: '', due_date: '', closing_date: '' });
      setShowAddCard(false);
      setEditingCard(null);
    }
  };

  const handleDeleteCard = async (id: string) => {
    await deleteCard(id);
  };

  const handleAddExpense = async () => {
    if (!expenseForm.card_id || !expenseForm.purchase_date || !expenseForm.description || !expenseForm.amount) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const selectedCard = cards.find(c => c.id === expenseForm.card_id);
    if (!selectedCard || !user) return;

    const billingMonth = calculateBillingMonth(expenseForm.purchase_date, selectedCard.closing_date);
    
    const expenseData = {
      card_id: expenseForm.card_id,
      description: expenseForm.description,
      amount: parseFloat(expenseForm.amount),
      purchase_date: expenseForm.purchase_date,
      billing_month: billingMonth,
      is_installment: expenseForm.is_installment,
      installments: expenseForm.is_installment ? parseInt(expenseForm.installments) : null,
      current_installment: expenseForm.is_installment ? 1 : null,
      user_id: user.id
    };

    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { error } = await supabase
        .from('card_expenses')
        .insert([expenseData]);

      if (error) throw error;

      toast({
        title: "Despesa registrada!",
        description: `Despesa de ${formatters.currency(parseFloat(expenseForm.amount))} foi adicionada`,
      });
      
      setExpenseForm({ 
        card_id: '', 
        purchase_date: '', 
        description: '', 
        amount: '', 
        is_installment: false, 
        installments: '',
        billing_month: ''
      });
      setShowAddExpense(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao registrar despesa",
        variant: "destructive"
      });
    }
  };

  const calculateBillingMonth = (purchaseDate: string, closingDate: number) => {
    const purchase = new Date(purchaseDate);
    const month = purchase.getMonth();
    const year = purchase.getFullYear();
    
    if (purchase.getDate() > closingDate) {
      const billingMonth = new Date(year, month + 2, 1);
      return billingMonth.toISOString();
    } else {
      const billingMonth = new Date(year, month + 1, 1);
      return billingMonth.toISOString();
    }
  };

  const getTotalExpenses = () => {
    return cardExpenses.reduce((total, expense) => total + expense.amount, 0);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

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
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{cardExpenses.length}</p>
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
              {editingCard ? 'Editar Cartão' : 'Cadastrar Novo Cartão'}
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
                  value={cardForm.due_date}
                  onChange={(e) => setCardForm({ ...cardForm, due_date: e.target.value })}
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
                  value={cardForm.closing_date}
                  onChange={(e) => setCardForm({ ...cardForm, closing_date: e.target.value })}
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddCard(false);
                  setEditingCard(null);
                  setCardForm({ name: '', due_date: '', closing_date: '' });
                }} 
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button 
                onClick={editingCard ? handleUpdateCard : handleAddCard} 
                className="w-full sm:w-auto"
              >
                {editingCard ? 'Atualizar' : 'Cadastrar'} Cartão
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
                <Select value={expenseForm.card_id} onValueChange={(value) => setExpenseForm({ ...expenseForm, card_id: value })}>
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
                  value={expenseForm.purchase_date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, purchase_date: e.target.value })}
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
                checked={expenseForm.is_installment}
                onCheckedChange={(checked) => setExpenseForm({ ...expenseForm, is_installment: checked })}
              />
              <Label htmlFor="installment">Compra parcelada</Label>
            </div>
            
            {expenseForm.is_installment && (
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

            {expenseForm.purchase_date && expenseForm.card_id && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <span className="text-sm text-blue-800 dark:text-blue-200">
                  Esta despesa será cobrada na fatura de{' '}
                  <strong>
                    {formatters.dateMonthYear(
                      new Date(
                        calculateBillingMonth(
                          expenseForm.purchase_date, 
                          cards.find(c => c.id === expenseForm.card_id)?.closing_date || 0
                        )
                      )
                    )}
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
                        Venc: {card.due_date} | Fech: {card.closing_date}
                      </p>
                    </div>
                  </div>
                  <CrudActions
                    item={card}
                    onEdit={handleEditCard}
                    onDelete={() => handleDeleteCard(card.id)}
                    showView={false}
                    deleteTitle="Confirmar exclusão"
                    deleteDescription="Esta ação não pode ser desfeita. O cartão será permanentemente removido."
                  />
                </div>
              ))}
              
              {cards.length === 0 && (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Nenhum cartão cadastrado</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Clique em "Novo Cartão" para começar</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimas Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cardExpenses.slice(0, 5).map((expense) => (
                <div key={expense.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-800 gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{expense.description}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {cards.find(c => c.id === expense.card_id)?.name} • {formatters.date(expense.purchase_date)}
                    </p>
                    <span className="inline-block px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full mt-1">
                      Fatura: {formatters.dateMonthYear(new Date(expense.billing_month))}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatters.currency(expense.amount)}</p>
                    {expense.is_installment && (
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {expense.current_installment}/{expense.installments}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              
              {cardExpenses.length === 0 && (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Nenhuma despesa registrada</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Clique em "Nova Despesa" para começar</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Cards;