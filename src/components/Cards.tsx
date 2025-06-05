
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, CreditCard, Calendar, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFormatters } from '@/hooks/useFormatters';
import { useSupabaseTables } from '@/hooks/useSupabaseTables';
import CardForm from '@/components/cards/CardForm';
import ExpenseForm from '@/components/cards/ExpenseForm';
import BillsOverview from '@/components/cards/BillsOverview';
import CardsModal from '@/components/cards/CardsModal';
import CardExpenseDetails from '@/components/CardExpenseDetails';
import { format, subMonths, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Cards = () => {
  const { toast } = useToast();
  const formatters = useFormatters();
  const [showAddCard, setShowAddCard] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingCard, setEditingCard] = useState<any>(null);
  const [selectedCardForDetails, setSelectedCardForDetails] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const {
    cards,
    cardExpenses,
    addCard,
    updateCard,
    deleteCard,
    addCardExpense,
    loading
  } = useSupabaseTables();

  const handleAddCard = async (cardData: any) => {
    const result = await addCard(cardData);
    if (result) {
      setShowAddCard(false);
    }
  };

  const handleEditCard = (card: any) => {
    setEditingCard(card);
    setShowAddCard(true);
  };

  const handleUpdateCard = async (cardData: any) => {
    if (!editingCard) return;
    
    const result = await updateCard(editingCard.id, cardData);
    if (result) {
      setShowAddCard(false);
      setEditingCard(null);
    }
  };

  const handleDeleteCard = async (id: string) => {
    await deleteCard(id);
  };

  const handleAddExpense = async (expenseData: any) => {
    const result = await addCardExpense(expenseData);
    if (result) {
      setShowAddExpense(false);
    }
  };

  const getTotalExpenses = () => {
    const currentMonthStr = format(currentMonth, 'yyyy-MM');
    return cardExpenses
      .filter(expense => expense.billing_month.startsWith(currentMonthStr))
      .reduce((total, expense) => total + expense.amount, 0);
  };

  const selectedCard = cards.find(card => card.id === selectedCardForDetails);
  const currentMonthName = format(currentMonth, 'MMMM/yyyy', { locale: ptBR });

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    );
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
          <p className="text-gray-600 dark:text-gray-300 mt-1">Controle de gastos e faturas de cartões</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <CardsModal
            cards={cards}
            onEditCard={handleEditCard}
            onDeleteCard={handleDeleteCard}
            onAddCard={() => setShowAddCard(true)}
          />
          <Button 
            onClick={() => setShowAddExpense(!showAddExpense)} 
            className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto"
            disabled={cards.length === 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Despesa
          </Button>
        </div>
      </div>

      {/* Navegação de mês e resumo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg border">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
          >
            ←
          </Button>
          <h3 className="text-lg font-semibold capitalize">{currentMonthName}</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
          >
            →
          </Button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-300">Total do Mês</p>
            <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
              {formatters.currency(getTotalExpenses())}
            </p>
          </div>
        </div>
      </div>

      {/* Resumo dos gastos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Gastos do Mês</p>
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
                <p className="text-sm text-gray-600 dark:text-gray-300">Compras do Mês</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {cardExpenses.filter(e => e.billing_month.startsWith(format(currentMonth, 'yyyy-MM'))).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card Forms */}
      <CardForm
        showForm={showAddCard}
        editingCard={editingCard}
        onSubmit={editingCard ? handleUpdateCard : handleAddCard}
        onCancel={() => {
          setShowAddCard(false);
          setEditingCard(null);
        }}
      />

      <ExpenseForm
        showForm={showAddExpense}
        cards={cards}
        onSubmit={handleAddExpense}
        onCancel={() => setShowAddExpense(false)}
      />

      {/* Bills Overview - Substitui Cartões Cadastrados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <BillsOverview
          cards={cards}
          cardExpenses={cardExpenses}
          currentMonth={currentMonth}
        />

        <Card>
          <CardHeader>
            <CardTitle>Últimas Compras</CardTitle>
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
                  <p className="text-gray-500 dark:text-gray-400">Nenhuma compra registrada</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Clique em "Nova Despesa" para começar</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seção para seleção de cartão e visualização detalhada */}
      <Card>
        <CardHeader>
          <CardTitle>Selecionar cartão para ver despesas detalhadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label htmlFor="cardSelect">Cartão</Label>
            <Select value={selectedCardForDetails} onValueChange={setSelectedCardForDetails}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cartão para ver suas despesas detalhadas" />
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
        </CardContent>
      </Card>

      {/* Despesas detalhadas do cartão selecionado */}
      {selectedCard && (
        <CardExpenseDetails 
          cardId={selectedCard.id} 
          cardName={selectedCard.name}
          currentMonth={currentMonth}
        />
      )}
    </div>
  );
};

export default Cards;
