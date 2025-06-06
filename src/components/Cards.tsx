
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, CreditCard, Calendar, ChevronLeft, ChevronRight, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import { useSupabaseTables } from '@/hooks/useSupabaseTables';
import { useCardExpenses } from '@/hooks/useCardExpenses';
import { useFormatters } from '@/hooks/useFormatters';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ExpenseModal from './cards/ExpenseModal';
import PayBillModal from './cards/PayBillModal';
import CardsModal from './cards/CardsModal';
import CardForm from './cards/CardForm';

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
  const [selectedCardForDetails, setSelectedCardForDetails] = useState('');
  const [showCardsModal, setShowCardsModal] = useState(false);

  const currentMonthStr = format(selectedMonth, 'yyyy-MM');
  
  // Calcular total em faturas de todos os cartões no mês selecionado
  const totalInBills = cardExpenses
    .filter(expense => {
      const expenseMonth = format(new Date(expense.billing_month), 'yyyy-MM');
      return expenseMonth === currentMonthStr;
    })
    .reduce((sum, expense) => sum + expense.amount, 0);

  // Calcular estatísticas por cartão
  const getCardStats = (card: any) => {
    const cardExpensesCurrentMonth = cardExpenses.filter(expense => {
      const expenseMonth = format(new Date(expense.billing_month), 'yyyy-MM');
      return expenseMonth === currentMonthStr && expense.card_id === card.id;
    });

    const currentBill = cardExpensesCurrentMonth.reduce((sum, expense) => sum + expense.amount, 0);
    return {
      currentBill,
      expensesCount: cardExpensesCurrentMonth.length,
      dueDate: new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, card.due_date)
    };
  };

  // Calcular faturas por cartão
  const calculateBills = () => {
    return cards.map(card => {
      const stats = getCardStats(card);
      const today = new Date();
      let status: 'pending' | 'overdue' | 'paid' = 'pending';
      
      if (stats.dueDate < today && stats.currentBill > 0) {
        status = 'overdue';
      }
      
      return {
        cardId: card.id,
        cardName: card.name,
        totalAmount: stats.currentBill,
        dueDate: stats.dueDate,
        status,
        expensesCount: stats.expensesCount
      };
    }).filter(bill => bill.totalAmount > 0);
  };

  const bills = calculateBills();

  const handlePreviousMonth = () => {
    setSelectedMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth(prev => addMonths(prev, 1));
  };

  const handlePayBill = (bill: any) => {
    setSelectedBill(bill);
    setShowPayBillModal(true);
  };

  const handleConfirmPayment = (cardId: string, amount: number, paymentDate: string) => {
    console.log('Pagamento confirmado:', { cardId, amount, paymentDate });
    setShowPayBillModal(false);
    setSelectedBill(null);
  };

  const handleEditBill = (bill: any) => {
    // Implementar edição da fatura
    console.log('Editar fatura:', bill);
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

  // Filtrar despesas do mês selecionado para últimas compras
  const monthlyExpenses = cardExpenses.filter(expense => {
    const expenseMonth = format(new Date(expense.billing_month), 'yyyy-MM');
    return expenseMonth === currentMonthStr;
  }).sort((a, b) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime());

  // Filtrar despesas por cartão selecionado (se houver)
  const filteredExpenses = selectedCardForDetails 
    ? monthlyExpenses.filter(expense => expense.card_id === selectedCardForDetails)
    : monthlyExpenses;

  const selectedCard = cards.find(c => c.id === selectedCardForDetails);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Cartões</h1>
          <p className="text-gray-400">Controle de gastos e faturas de cartões</p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => setShowCardsModal(true)}
            variant="outline" 
            className="border-gray-600 text-white hover:bg-gray-800"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Cartões Cadastrados
          </Button>
          <Button 
            onClick={() => setShowExpenseModal(true)}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Despesa
          </Button>
        </div>
      </div>

      {/* Month Selector */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePreviousMonth}
            className="border-gray-600 text-white hover:bg-gray-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold min-w-[150px] text-center">
            {format(selectedMonth, 'MMMM/yyyy', { locale: ptBR })}
          </h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleNextMonth}
            className="border-gray-600 text-white hover:bg-gray-800"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="text-right">
          <p className="text-gray-400">Total do Mês</p>
          <p className="text-2xl font-bold text-orange-400">{formatters.currency(totalInBills)}</p>
          <p className="text-sm text-gray-400">Soma das parcelas</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Gastos do Mês</p>
                <p className="text-2xl font-bold">{formatters.currency(totalInBills)}</p>
                <p className="text-gray-400 text-xs">Soma das parcelas do período</p>
              </div>
              <div className="p-3 bg-orange-600 rounded-full">
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
                <p className="text-gray-400 text-sm">Compras do Mês</p>
                <p className="text-2xl font-bold">{monthlyExpenses.length}</p>
              </div>
              <div className="p-3 bg-green-600 rounded-full">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Faturas */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Faturas - {format(selectedMonth, 'MMMM/yyyy', { locale: ptBR })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bills.map((bill) => (
                <div key={bill.cardId} className="p-4 border border-gray-700 rounded-lg bg-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {bill.status === 'overdue' && (
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium">{bill.cardName}</p>
                        <p className="text-sm text-gray-400">
                          {bill.expensesCount} parcela{bill.expensesCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatters.currency(bill.totalAmount)}</p>
                        <p className="text-sm text-gray-400">
                          Venc: {formatters.date(bill.dueDate)}
                        </p>
                        <p className="text-xs text-gray-500">Parcelas do mês</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${
                          bill.status === 'overdue' ? 'text-red-400' : 'text-orange-400'
                        }`}>
                          {bill.status === 'overdue' ? 'Vencido' : 'Vencido'}
                        </span>
                        
                        <div className="flex gap-1">
                          <Button 
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handlePayBill(bill)}
                          >
                            Pagar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-gray-600 text-white hover:bg-gray-700"
                            onClick={() => handleEditBill(bill)}
                          >
                            Editar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {bills.length === 0 && (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">Nenhuma fatura para {format(selectedMonth, 'MMMM/yyyy', { locale: ptBR })}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Últimas Compras */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle>Últimas Compras</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredExpenses.slice(0, 4).map((expense) => {
                const card = cards.find(c => c.id === expense.card_id);
                return (
                  <div key={expense.id} className="p-4 border border-gray-700 rounded-lg bg-gray-700/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{expense.description}</p>
                        <p className="text-sm text-gray-400">
                          {card?.name} • {formatters.date(expense.purchase_date)}
                        </p>
                        <div className="mt-1">
                          <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                            Fatura: {format(new Date(expense.billing_month), 'MMM/yyyy', { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatters.currency(expense.amount)}</p>
                        {expense.is_installment && (
                          <p className="text-sm text-gray-400">
                            {expense.current_installment}/{expense.installments}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          Total: {formatters.currency(expense.amount * (expense.installments || 1))}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {filteredExpenses.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">Nenhuma compra neste mês</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card Details Section */}
      {selectedCardForDetails && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Selecionar cartão para ver despesas detalhadas</p>
                <CardTitle className="flex items-center gap-2 mt-2">
                  <Calendar className="h-5 w-5" />
                  Despesas Detalhadas - {selectedCard?.name} ({format(selectedMonth, 'MMMM/yyyy', { locale: ptBR })})
                </CardTitle>
                <p className="text-sm text-gray-400 mt-1">
                  {filteredExpenses.length} compra{filteredExpenses.length !== 1 ? 's' : ''} nesta fatura • Fechamento dia {selectedCard?.closing_date}
                </p>
              </div>
              <Select value={selectedCardForDetails} onValueChange={setSelectedCardForDetails}>
                <SelectTrigger className="w-64 bg-gray-700 border-gray-600">
                  <SelectValue placeholder="Selecione um cartão" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {cards.map(card => (
                    <SelectItem key={card.id} value={card.id}>{card.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 text-gray-400 font-medium">Data da Compra</th>
                    <th className="text-left py-3 text-gray-400 font-medium">Descrição</th>
                    <th className="text-left py-3 text-gray-400 font-medium">Valor da Parcela</th>
                    <th className="text-center py-3 text-gray-400 font-medium">Parcela</th>
                    <th className="text-left py-3 text-gray-400 font-medium">Fatura</th>
                    <th className="text-center py-3 text-gray-400 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense) => (
                    <tr key={expense.id} className="border-b border-gray-700/50">
                      <td className="py-3">
                        <div>
                          <p className="text-sm">{formatters.date(expense.purchase_date)}</p>
                          <p className="text-xs text-gray-400">Compra original</p>
                        </div>
                      </td>
                      <td className="py-3">
                        <div>
                          <p className="text-sm font-medium">{expense.description}</p>
                          {expense.is_installment && (
                            <p className="text-xs text-blue-400">Parcelamento em {expense.installments}x</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3">
                        <div>
                          <p className="text-sm font-medium">{formatters.currency(expense.amount)}</p>
                          <p className="text-xs text-gray-400">Parcela atual</p>
                        </div>
                      </td>
                      <td className="py-3 text-center">
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          {expense.current_installment || 1}/{expense.installments || 1}
                        </span>
                      </td>
                      <td className="py-3">
                        <div>
                          <p className="text-sm">{format(new Date(expense.billing_month), 'MMM/yyyy', { locale: ptBR })}</p>
                          <p className="text-xs text-gray-400">Fatura atual</p>
                        </div>
                      </td>
                      <td className="py-3 text-center">
                        <div className="flex gap-1 justify-center">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-400 hover:bg-blue-600/20">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400 hover:bg-red-600/20">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 p-4 bg-gray-700/50 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-400">Total da Fatura ({format(selectedMonth, 'MMMM/yyyy', { locale: ptBR })}):</p>
                  <p className="text-xs text-gray-500">Soma das parcelas do período atual</p>
                </div>
                <p className="text-2xl font-bold">{formatters.currency(
                  filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
                )}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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

      <CardsModal
        open={showCardsModal}
        onOpenChange={setShowCardsModal}
        cards={cards}
        onAddCard={() => {
          setShowCardsModal(false);
          setShowCardForm(true);
        }}
        onEditCard={(card) => {
          setShowCardsModal(false);
          setEditingCard(card);
          setShowCardForm(true);
        }}
        onDeleteCard={deleteCard}
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
