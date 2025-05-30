
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, CreditCard, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFormatters } from '@/hooks/useFormatters';
import { useSupabaseTables } from '@/hooks/useSupabaseTables';
import CardForm from '@/components/cards/CardForm';
import ExpenseForm from '@/components/cards/ExpenseForm';
import CardsOverview from '@/components/cards/CardsOverview';
import CardExpenseDetails from '@/components/CardExpenseDetails';

const Cards = () => {
  const { toast } = useToast();
  const formatters = useFormatters();
  const [showAddCard, setShowAddCard] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingCard, setEditingCard] = useState<any>(null);
  const [selectedCardForDetails, setSelectedCardForDetails] = useState<string>('');
  
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
    return cardExpenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const selectedCard = cards.find(card => card.id === selectedCardForDetails);

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

      {/* Nova seção para seleção de cartão e visualização detalhada */}
      <Card>
        <CardHeader>
          <CardTitle>Selecionar cartão para ver despesas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label htmlFor="cardSelect">Cartão</Label>
            <Select value={selectedCardForDetails} onValueChange={setSelectedCardForDetails}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cartão para ver suas despesas" />
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
        />
      )}

      {/* Cards Overview */}
      <CardsOverview
        cards={cards}
        cardExpenses={cardExpenses}
        onEditCard={handleEditCard}
        onDeleteCard={handleDeleteCard}
      />
    </div>
  );
};

export default Cards;
