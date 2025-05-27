import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, CreditCard, Calendar, AlertCircle, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFormatters } from '@/hooks/useFormatters';
import { useFinancial } from '@/contexts/FinancialContext';
import { useAuth } from '@/contexts/AuthContext';

const Cards = () => {
  const { toast } = useToast();
  const formatters = useFormatters();
  const { user } = useAuth();
  const {
    addCard,
    deleteCard,
    getCards,
    addCardExpense,
    deleteCardExpense,
    getCardExpenses,
    loading
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
    installments: ''
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
        installments: '' 
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
      const billingMonth = new Date(year, month + 2, 1);
      return formatters.dateMonthYear(billingMonth);
    } else {
      const billingMonth = new Date(year, month + 1, 1);
      return formatters.dateMonthYear(billingMonth);
    }
  };

  const cards = getCards();
  const cardExpenses = getCardExpenses();
  const totalExpenses = cardExpenses.reduce((total, expense) => total + expense.amount, 0);

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
      {/* ... (mesmo conteúdo anterior até as seções de listagem) */}

      {/* Cartões Cadastrados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cartões Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cards.map((card) => (
                <div key={card.id} className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-800">
                  {/* ... (mesmo conteúdo anterior) */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteCard(card.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Excluir
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Últimas Despesas */}
        <Card>
          <CardHeader>
            <CardTitle>Últimas Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cardExpenses.slice(0, 5).map((expense) => (
                <div key={expense.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-800 gap-2">
                  {/* ... (mesmo conteúdo anterior) */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteCardExpense(expense.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
