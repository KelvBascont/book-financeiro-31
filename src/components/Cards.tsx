
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, CreditCard, Calendar } from 'lucide-react';
import { useSupabaseTables } from '@/hooks/useSupabaseTables';
import { useCardExpenses } from '@/hooks/useCardExpenses';
import { useFormatters } from '@/hooks/useFormatters';
import { format, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ExpenseModal from './cards/ExpenseModal';
import PayBillModal from './cards/PayBillModal';
import CardsModal from './cards/CardsModal';
import CardForm from './cards/CardForm';
import MonthSelector from './MonthSelector';

const Cards = () => {
  const formatters = useFormatters();
  const { cards, addCard, updateCard, deleteCard } = useSupabaseTables();
  const { cardExpenses, addCardExpense } = useCardExpenses();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showCardForm, setShowCardForm] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showPayBillModal, setShowPayBillModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  const currentMonthStr = format(selectedMonth, 'yyyy-MM');
  
  // Calcular total em faturas de todos os cartões no mês selecionado
  const totalInBills = cardExpenses
    .filter(expense => {
      const expenseMonth = format(new Date(expense.billing_month), 'yyyy-MM');
      return expenseMonth === currentMonthStr;
    })
    .reduce((sum, expense) => sum + expense.amount, 0);

  // Calcular próximo vencimento
  const getNextDueDate = () => {
    if (cards.length === 0) return null;
    
    const currentDate = new Date();
    const nextDueDates = cards.map(card => {
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      const dueDate = new Date(currentYear, currentMonth, card.due_date);
      
      if (dueDate < currentDate) {
        return new Date(currentYear, currentMonth + 1, card.due_date);
      }
      return dueDate;
    });
    
    return nextDueDates.sort((a, b) => a.getTime() - b.getTime())[0];
  };

  const nextDueDate = getNextDueDate();

  // Calcular limite total disponível
  const totalAvailableLimit = 27200.00; // Exemplo fixo, pode ser calculado dinamicamente

  // Calcular estatísticas por cartão
  const getCardStats = (card: any) => {
    const cardExpensesCurrentMonth = cardExpenses.filter(expense => {
      const expenseMonth = format(new Date(expense.billing_month), 'yyyy-MM');
      return expenseMonth === currentMonthStr && expense.card_id === card.id;
    });

    const currentBill = cardExpensesCurrentMonth.reduce((sum, expense) => sum + expense.amount, 0);
    const totalLimit = 15000; // Exemplo fixo por cartão
    const available = totalLimit - currentBill;
    const usagePercentage = (currentBill / totalLimit) * 100;

    return {
      currentBill,
      totalLimit,
      available,
      usagePercentage,
      dueDate: new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, card.due_date)
    };
  };

  // Obter cores por cartão
  const getCardColor = (index: number) => {
    const colors = [
      'from-purple-500 to-purple-700',
      'from-orange-500 to-orange-700', 
      'from-red-500 to-red-700'
    ];
    return colors[index % colors.length];
  };

  const handleAddCard = () => {
    setEditingCard(null);
    setShowCardForm(true);
  };

  const handleEditCard = (card: any) => {
    setEditingCard(card);
    setShowCardForm(true);
  };

  const handlePayBill = (cardId: string, amount: number) => {
    const card = cards.find(c => c.id === cardId);
    const dueDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, card?.due_date || 1);
    
    setSelectedBill({
      cardId,
      cardName: card?.name || '',
      totalAmount: amount,
      dueDate
    });
    setShowPayBillModal(true);
  };

  const handleConfirmPayment = (cardId: string, amount: number, paymentDate: string) => {
    console.log('Pagamento confirmado:', { cardId, amount, paymentDate });
    setShowPayBillModal(false);
    setSelectedBill(null);
  };

  const handleCardFormSubmit = (cardData: any) => {
    if (editingCard) {
      updateCard(editingCard.id, cardData);
    } else {
      addCard(cardData);
    }
    setShowCardForm(false);
    setEditingCard(null);
  };

  const handleCardFormCancel = () => {
    setShowCardForm(false);
    setEditingCard(null);
  };

  // Filtrar despesas do mês selecionado
  const monthlyExpenses = cardExpenses.filter(expense => {
    const expenseMonth = format(new Date(expense.billing_month), 'yyyy-MM');
    return expenseMonth === currentMonthStr;
  }).sort((a, b) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime());

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Cartões de Crédito</h1>
        <div className="flex items-center gap-4">
          <MonthSelector />
          <Button onClick={handleAddCard} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Novo Cartão
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total em Faturas</p>
                <p className="text-gray-400 text-xs mb-2">Todos os cartões</p>
                <p className="text-2xl font-bold">{formatters.currency(totalInBills)}</p>
              </div>
              <div className="p-3 bg-red-600 rounded-full">
                <CreditCard className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Cartões Ativos</p>
                <p className="text-gray-400 text-xs mb-2">Em uso</p>
                <p className="text-2xl font-bold">{cards.length}</p>
              </div>
              <div className="p-3 bg-blue-600 rounded-full">
                <CreditCard className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Próximo Vencimento</p>
                <p className="text-gray-400 text-xs mb-2">Data mais próxima</p>
                <p className="text-2xl font-bold">
                  {nextDueDate ? format(nextDueDate, 'dd/MM/yyyy') : '--'}
                </p>
              </div>
              <div className="p-3 bg-orange-600 rounded-full">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Limite Disponível</p>
                <p className="text-gray-400 text-xs mb-2">Total disponível</p>
                <p className="text-2xl font-bold">{formatters.currency(totalAvailableLimit)}</p>
              </div>
              <div className="p-3 bg-green-600 rounded-full">
                <CreditCard className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cards dos Cartões */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => {
          const stats = getCardStats(card);
          return (
            <Card key={card.id} className={`bg-gradient-to-br ${getCardColor(index)} border-0 text-white`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{card.name}</h3>
                    <p className="text-sm opacity-80">**** {card.id.slice(-4)}</p>
                  </div>
                  <CreditCard className="h-8 w-8 opacity-80" />
                </div>

                <div className="space-y-2 mb-4">
                  <div>
                    <p className="text-sm opacity-80">Limite Total</p>
                    <p className="text-2xl font-bold">{formatters.currency(stats.totalLimit)}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Fatura Atual</span>
                    <span className="text-red-300">{formatters.currency(stats.currentBill)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Vencimento: {format(stats.dueDate, 'dd/MM/yyyy')}</span>
                    <span className="text-green-300">{stats.usagePercentage.toFixed(1)}% usado</span>
                  </div>

                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(stats.usagePercentage, 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Disponível</span>
                    <span className="text-green-300">{formatters.currency(stats.available)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-white/30 text-white hover:bg-white/10"
                  >
                    Ver Fatura
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={() => handlePayBill(card.id, stats.currentBill)}
                  >
                    Pagar
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Despesas Recentes */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Despesas Recentes</CardTitle>
          <div className="flex items-center gap-4">
            <select className="bg-gray-700 border-gray-600 text-white rounded px-3 py-1 text-sm">
              <option>Todos os cartões</option>
              {cards.map(card => (
                <option key={card.id} value={card.id}>{card.name}</option>
              ))}
            </select>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-blue-400">💰 Total:</span>
              <span className="font-bold text-blue-400">{formatters.currency(totalInBills)}</span>
            </div>
            <Button 
              onClick={() => setShowExpenseModal(true)}
              className="bg-green-600 hover:bg-green-700"
              size="sm"
            >
              ✏️ Editar Lançamentos
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {monthlyExpenses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 text-gray-400 font-medium">DATA</th>
                    <th className="text-left py-3 text-gray-400 font-medium">DESCRIÇÃO</th>
                    <th className="text-left py-3 text-gray-400 font-medium">CATEGORIA</th>
                    <th className="text-left py-3 text-gray-400 font-medium">CARTÃO</th>
                    <th className="text-right py-3 text-gray-400 font-medium">VALOR</th>
                    <th className="text-center py-3 text-gray-400 font-medium">AÇÕES</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyExpenses.map((expense) => {
                    const card = cards.find(c => c.id === expense.card_id);
                    return (
                      <tr key={expense.id} className="border-b border-gray-700/50">
                        <td className="py-3 text-sm">{formatters.date(expense.purchase_date)}</td>
                        <td className="py-3 text-sm">{expense.description}</td>
                        <td className="py-3 text-sm">
                          <span className="px-2 py-1 bg-blue-600 text-xs rounded">Categoria</span>
                        </td>
                        <td className="py-3 text-sm">{card?.name}</td>
                        <td className="py-3 text-sm text-right font-medium">
                          {formatters.currency(expense.amount)}
                        </td>
                        <td className="py-3 text-center">
                          <div className="flex gap-1 justify-center">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-400 hover:bg-blue-600/20">
                              ✏️
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400 hover:bg-red-600/20">
                              🗑️
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Nenhuma despesa neste mês</p>
              <Button 
                onClick={() => setShowExpenseModal(true)}
                className="mt-3 bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Registrar Despesa
              </Button>
            </div>
          )}
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

      <CardForm
        showForm={showCardForm}
        editingCard={editingCard}
        onSubmit={handleCardFormSubmit}
        onCancel={handleCardFormCancel}
      />
    </div>
  );
};

export default Cards;
