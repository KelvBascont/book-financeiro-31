
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, CreditCard } from 'lucide-react';
import { useSupabaseTables } from '@/hooks/useSupabaseTables';
import { useCardExpenses } from '@/hooks/useCardExpenses';
import { useFormatters } from '@/hooks/useFormatters';
import { format } from 'date-fns';
import BillsOverview from './cards/BillsOverview';
import CardExpenseDetails from './CardExpenseDetails';
import ExpenseModal from './cards/ExpenseModal';
import PayBillModal from './cards/PayBillModal';
import CardsModal from './cards/CardsModal';
import CardForm from './cards/CardForm';

const Cards = () => {
  const formatters = useFormatters();
  const { cards, addCard, updateCard, deleteCard } = useSupabaseTables();
  const { cardExpenses, addCardExpense } = useCardExpenses();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCardForm, setShowCardForm] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showPayBillModal, setShowPayBillModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  const currentMonthStr = format(currentMonth, 'yyyy-MM');
  
  // Calcular últimas 5 compras
  const recentExpenses = cardExpenses
    .filter(expense => {
      const expenseMonth = format(new Date(expense.billing_month), 'yyyy-MM');
      return expenseMonth === currentMonthStr;
    })
    .sort((a, b) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime())
    .slice(0, 5);

  // Gastos do mês atual
  const monthlySpending = cardExpenses
    .filter(expense => {
      const expenseMonth = format(new Date(expense.billing_month), 'yyyy-MM');
      return expenseMonth === currentMonthStr;
    })
    .reduce((sum, expense) => sum + expense.amount, 0);

  const handleAddCard = () => {
    setEditingCard(null);
    setShowCardForm(true);
  };

  const handleEditCard = (card: any) => {
    setEditingCard(card);
    setShowCardForm(true);
  };

  const handlePayBill = (bill: any) => {
    setSelectedBill(bill);
    setShowPayBillModal(true);
  };

  const handleConfirmPayment = (cardId: string, amount: number, paymentDate: string) => {
    // TODO: Implementar lógica de pagamento na base de dados
    console.log('Pagamento confirmado:', { cardId, amount, paymentDate });
    // Por enquanto, apenas fechar o modal
  };

  const selectedCard = selectedCardId ? cards.find(card => card.id === selectedCardId) : null;

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <CreditCard className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Gastos do Mês</p>
                <p className="text-2xl font-bold">{formatters.currency(monthlySpending)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Cartões Ativos</p>
                <p className="text-2xl font-bold">{cards.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Compras do Mês</p>
                <p className="text-2xl font-bold">{recentExpenses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Gestão de Cartões</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={() => setShowExpenseModal(true)}
            className="bg-orange-500 hover:bg-orange-600"
            disabled={cards.length === 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Despesa
          </Button>
          <CardsModal
            cards={cards}
            onEditCard={handleEditCard}
            onDeleteCard={deleteCard}
            onAddCard={handleAddCard}
          />
        </div>
      </div>

      {/* Faturas Overview */}
      <BillsOverview
        cards={cards}
        cardExpenses={cardExpenses}
        currentMonth={currentMonth}
        onPayBill={handlePayBill}
      />

      {/* Últimas Compras */}
      <Card>
        <CardHeader>
          <CardTitle>Últimas Compras</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentExpenses.map((expense) => {
              const card = cards.find(c => c.id === expense.card_id);
              return (
                <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">{expense.description}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {card?.name} • {formatters.date(expense.purchase_date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatters.currency(expense.amount)}</p>
                    <p className="text-xs text-gray-500">
                      Fatura: {formatters.dateMonthYear(new Date(expense.billing_month))}
                    </p>
                  </div>
                </div>
              );
            })}
            
            {recentExpenses.length === 0 && (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Nenhuma compra este mês</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Suas compras aparecerão aqui
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Despesas Detalhadas por Cartão */}
      {selectedCardId && selectedCard && (
        <CardExpenseDetails
          cardId={selectedCardId}
          cardName={selectedCard.name}
          currentMonth={currentMonth}
        />
      )}

      {/* Seletor de cartão para detalhes */}
      <Card>
        <CardHeader>
          <CardTitle>Ver Despesas por Cartão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {cards.map((card) => (
              <Button
                key={card.id}
                variant={selectedCardId === card.id ? "default" : "outline"}
                onClick={() => setSelectedCardId(card.id)}
                className="justify-start h-auto p-4"
              >
                <CreditCard className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <p className="font-medium">{card.name}</p>
                  <p className="text-sm opacity-70">
                    Fecha dia {card.closing_date}
                  </p>
                </div>
              </Button>
            ))}
            
            {cards.length === 0 && (
              <div className="col-span-full text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Nenhum cartão cadastrado</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Cadastre um cartão para ver as despesas
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modais */}
      <ExpenseModal
        open={showExpenseModal}
        onOpenChange={setShowExpenseModal}
        cards={cards}
        onSubmit={addCardExpense}
      />

      <PayBillModal
        open={showPayBillModal}
        onOpenChange={setShowPayBillModal}
        bill={selectedBill}
        onConfirmPayment={handleConfirmPayment}
      />

      {showCardForm && (
        <CardForm
          card={editingCard}
          onSave={editingCard ? updateCard : addCard}
          onCancel={() => {
            setShowCardForm(false);
            setEditingCard(null);
          }}
        />
      )}
    </div>
  );
};

export default Cards;
