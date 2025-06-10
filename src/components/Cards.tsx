import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useSupabaseTables } from '@/hooks/useSupabaseTables';
import { useCardExpenses } from '@/hooks/useCardExpenses';
import { addMonths, subMonths } from 'date-fns';
import ExpenseModal from './cards/ExpenseModal';
import PayBillModal from './cards/PayBillModal';
import CardsModal from './cards/CardsModal';
import CardForm from './cards/CardForm';
import ViewExpenseModal from './cards/ViewExpenseModal';
import EditExpenseModal from './cards/EditExpenseModal';
import MonthNavigation from './cards/MonthNavigation';
import StatsCards from './cards/StatsCards';
import BillsList from './cards/BillsList';
import RecentPurchases from './cards/RecentPurchases';
import CardSelector from './cards/CardSelector';
import ExpenseDetailsTable from './cards/ExpenseDetailsTable';
import { useCardStatistics } from '@/hooks/useCardStatistics';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const Cards = () => {
  const { cards, deleteCard } = useSupabaseTables();
  const { addCardExpense, updateCardExpense, deleteCardExpense } = useCardExpenses();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showCardForm, setShowCardForm] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showPayBillModal, setShowPayBillModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [selectedCardForDetails, setSelectedCardForDetails] = useState('');
  const [paidBills, setPaidBills] = useState<Set<string>>(new Set<string>());
  const [editingBill, setEditingBill] = useState(null);
  const [showEditBillModal, setShowEditBillModal] = useState(false);
  
  // Estados para os modais CRUD das despesas
  const [showViewExpenseModal, setShowViewExpenseModal] = useState(false);
  const [showEditExpenseModal, setShowEditExpenseModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const { 
    totalInBills, 
    calculateBills, 
    monthlyExpenses,
    currentMonthStr 
  } = useCardStatistics(selectedMonth);

  const bills = calculateBills(paidBills);

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
    const billKey = `${cardId}-${currentMonthStr}`;
    setPaidBills(prev => new Set([...prev, billKey]));
    setShowPayBillModal(false);
    setSelectedBill(null);
  };

  const handleEditBill = (bill: any) => {
    setEditingBill(bill);
    setShowEditBillModal(true);
  };

  const handleCardFormSubmit = (cardData: any) => {
    if (editingCard) {
      // updateCard function will be called through useSupabaseTables
    } else {
      // addCard function will be called through useSupabaseTables
    }
    setShowCardForm(false);
    setEditingCard(null);
  };

  const handleCardFormCancel = () => {
    setShowCardForm(false);
    setEditingCard(null);
  };

  // Funções CRUD para despesas detalhadas
  const handleViewExpense = (expense: any) => {
    setSelectedExpense(expense);
    setShowViewExpenseModal(true);
  };

  const handleEditExpense = (expense: any) => {
    setSelectedExpense(expense);
    setShowEditExpenseModal(true);
  };

  const handleSaveEditedExpense = async (expenseId: string, updates: any) => {
    try {
      await updateCardExpense(expenseId, updates);
      setShowEditExpenseModal(false);
      setSelectedExpense(null);
    } catch (error) {
      console.error('Erro ao salvar despesa editada:', error);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      await deleteCardExpense(expenseId);
    } catch (error) {
      console.error('Erro ao deletar despesa:', error);
    }
  };

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
          <CardsModal
            cards={cards}
            onAddCard={() => {
              setShowCardForm(true);
            }}
            onEditCard={(card) => {
              setEditingCard(card);
              setShowCardForm(true);
            }}
            onDeleteCard={deleteCard}
          />
          <Button 
            onClick={() => setShowExpenseModal(true)}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Despesa
          </Button>
        </div>
      </div>

      {/* Month Navigation */}
      <MonthNavigation
        selectedMonth={selectedMonth}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
        totalInBills={totalInBills}
      />

      {/* Stats Cards */}
      <StatsCards
        totalInBills={totalInBills}
        cardsCount={cards.length}
        monthlyExpensesCount={monthlyExpenses.length}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BillsList
          bills={bills}
          selectedMonth={selectedMonth}
          onPayBill={handlePayBill}
          onEditBill={handleEditBill}
        />

        <RecentPurchases
          expenses={filteredExpenses}
          cards={cards}
        />
      </div>

      {/* Card Selector */}
      <CardSelector
        cards={cards}
        selectedCard={selectedCardForDetails}
        onCardChange={setSelectedCardForDetails}
      />

      {/* Expense Details Table */}
      {selectedCardForDetails && (
        <ExpenseDetailsTable
          expenses={filteredExpenses}
          selectedCard={selectedCard}
          selectedMonth={selectedMonth}
          onViewExpense={handleViewExpense}
          onEditExpense={handleEditExpense}
          onDeleteExpense={handleDeleteExpense}
        />
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

      <CardForm
        showForm={showCardForm}
        editingCard={editingCard}
        onSubmit={handleCardFormSubmit}
        onCancel={handleCardFormCancel}
      />

      <ViewExpenseModal
        open={showViewExpenseModal}
        onOpenChange={setShowViewExpenseModal}
        expense={selectedExpense}
        cardName={selectedExpense ? cards.find(c => c.id === selectedExpense.card_id)?.name : ''}
      />

      <EditExpenseModal
        open={showEditExpenseModal}
        onOpenChange={setShowEditExpenseModal}
        expense={selectedExpense}
        onSave={handleSaveEditedExpense}
      />

      <Dialog open={showEditBillModal} onOpenChange={setShowEditBillModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Fatura - {editingBill?.cardName}</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-4">
              Funcionalidade de edição de fatura será implementada em breve.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditBillModal(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setShowEditBillModal(false)}>
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cards;
