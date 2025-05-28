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
import { useAuth } from '@/contexts/AuthContext'; // Adicionado para obter o usuário

const Cards = () => {
  const { toast } = useToast();
  const formatters = useFormatters();
  const [showAddCard, setShowAddCard] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingCard, setEditingCard] = useState<any>(null);
  const { user } = useAuth(); // Obtém o usuário logado
  
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

  // ... (código anterior permanece igual até handleAddExpense)

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
    if (!selectedCard || !user) return; // Garante que temos usuário

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
      user_id: user.id // Adiciona o user_id obrigatório
    };

    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Corrigido: passando um array com o objeto
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

  // Corrigido: usando toISOString() diretamente
  const calculateBillingMonth = (purchaseDate: string, closingDate: number) => {
    const purchase = new Date(purchaseDate);
    const month = purchase.getMonth();
    const year = purchase.getFullYear();
    
    if (purchase.getDate() > closingDate) {
      const billingMonth = new Date(year, month + 2, 1);
      return billingMonth.toISOString(); // Corrigido
    } else {
      const billingMonth = new Date(year, month + 1, 1);
      return billingMonth.toISOString(); // Corrigido
    }
  };

  // ... (restante do código permanece igual)

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* ... (código anterior) */}

      {showAddExpense && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Registrar Nova Despesa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* ... (campos do formulário) */}

            {expenseForm.purchase_date && expenseForm.card_id && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <span className="text-sm text-blue-800 dark:text-blue-200">
                  Esta despesa será cobrada na fatura de{' '}
                  <strong>
                    {/* Corrigido: usando dateMonthYear diretamente */}
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
            
            {/* ... (botões) */}
          </CardContent>
        </Card>
      )}

      {/* ... (restante do código) */}
    </div>
  );
};

export default Cards;