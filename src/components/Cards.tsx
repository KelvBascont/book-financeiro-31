// Cards.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, CreditCard, Calendar, AlertCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFormatters } from '@/hooks/useFormatters';
import { useFinancial } from '@/contexts/FinancialContext';
import { useAuth } from '@/contexts/AuthContext';

const Cards = () => {
  const { toast } = useToast();
  const formatters = useFormatters();
  const { user } = useAuth();
  const { 
    cards,
    cardExpenses,
    loading,
    addCard,
    deleteCard,
    addCardExpense,
    deleteCardExpense,
    getCardsForMonth,
    selectedMonth
  } = useFinancial();

  const [showAddCard, setShowAddCard] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  
  const [cardForm, setCardForm] = useState({
    name: '',
    dueDate: '',
    closingDate: ''
  });

  const [expenseForm, setExpenseForm] = useState({
    cardId: '',
    purchaseDate: '',
    description: '',
    amount: '',
    isInstallment: false,
    installments: '1'
  });

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p>Por favor, faça login para gerenciar seus cartões.</p>
      </div>
    );
  }

  const handleAddCard = async () => {
    if (!cardForm.name || !cardForm.dueDate || !cardForm.closingDate) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await addCard({
        name: cardForm.name,
        due_date: parseInt(cardForm.dueDate),
        closing_date: parseInt(cardForm.closingDate)
      });

      toast({
        title: "Cartão cadastrado!",
        description: `Cartão ${cardForm.name} foi adicionado com sucesso`,
      });

      setCardForm({ name: '', dueDate: '', closingDate: '' });
      setShowAddCard(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao cadastrar cartão",
        variant: "destructive"
      });
    }
  };

  const handleAddExpense = async () => {
    if (!expenseForm.cardId || !expenseForm.purchaseDate || !expenseForm.description || !expenseForm.amount) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await addCardExpense({
        card_id: expenseForm.cardId,
        description: expenseForm.description,
        amount: parseFloat(expenseForm.amount),
        purchase_date: expenseForm.purchaseDate,
        is_installment: expenseForm.isInstallment,
        installments: expenseForm.isInstallment ? parseInt(expenseForm.installments) : null
      });

      toast({
        title: "Despesa registrada!",
        description: `Despesa de ${formatters.currency(parseFloat(expenseForm.amount))} foi adicionada`,
      });

      setExpenseForm({ 
        cardId: '', 
        purchaseDate: '', 
        description: '', 
        amount: '', 
        isInstallment: false, 
        installments: '1' 
      });
      setShowAddExpense(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao registrar despesa",
        variant: "destructive"
      });
    }
  };

  const calculateBillingMonth = (purchaseDate: string, closingDate: number) => {
    const purchase = new Date(purchaseDate);
    const month = purchase.getMonth();
    const year = purchase.getFullYear();
    
    if (purchase.getDate() > closingDate) {
      return new Date(year, month + 2, 1);
    }
    return new Date(year, month + 1, 1);
  };

  const currentMonthExpenses = getCardsForMonth(selectedMonth);
  const totalExpenses = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header e botões mantidos */}
      
      {/* Seção de Adicionar Cartão */}
      {showAddCard && (
        <Card>
          {/* Formulário de cartão mantido */}
        </Card>
      )}

      {/* Seção de Adicionar Despesa */}
      {showAddExpense && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Registrar Nova Despesa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Campos do formulário mantidos */}
            
            {expenseForm.purchaseDate && expenseForm.cardId && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <span className="text-sm text-blue-800 dark:text-blue-200">
                  Esta despesa será cobrada na fatura de{' '}
                  <strong>
                    {formatters.dateMonthYear(
                      calculateBillingMonth(
                        expenseForm.purchaseDate,
                        cards.find(c => c.id === expenseForm.cardId)?.closing_date || 0
                      )
                    )}
                  </strong>
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Listagem de Cartões e Despesas */}
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteCard(card.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Despesas do Mês</CardTitle>
            <div className="text-xl font-bold text-red-600">
              Total: {formatters.currency(totalExpenses)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentMonthExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-800">
                  <div className="flex-1">
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {cards.find(c => c.id === expense.card_id)?.name} • 
                      {formatters.date(expense.purchase_date)}
                      {expense.is_installment && (
                        <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                          Parcelado ({expense.installments}x)
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-red-600">
                      {formatters.currency(expense.amount)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteCardExpense(expense.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
