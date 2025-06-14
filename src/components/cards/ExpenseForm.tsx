
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFormatters } from '@/hooks/useFormatters';
import { useCategories } from '@/hooks/useCategories';
import CategorySelector from '@/components/CategorySelector';

interface ExpenseFormProps {
  showForm: boolean;
  cards: any[];
  onSubmit: (expense: any) => void;
  onCancel: () => void;
}

const ExpenseForm = ({ showForm, cards, onSubmit, onCancel }: ExpenseFormProps) => {
  const { toast } = useToast();
  const formatters = useFormatters();
  const { expenseCategories, loading: categoriesLoading } = useCategories();
  const [expenseForm, setExpenseForm] = useState({
    card_id: '',
    purchase_date: '',
    description: '',
    amount: '',
    is_installment: false,
    installments: '',
    billing_month: '',
    category_id: ''
  });

  const calculateBillingMonth = (purchaseDate: string, closingDate: number) => {
    const purchase = new Date(purchaseDate);
    const month = purchase.getMonth();
    const year = purchase.getFullYear();
    
    if (purchase.getDate() > closingDate) {
      const billingMonth = new Date(year, month + 2, 1);
      return billingMonth.toISOString().split('T')[0];
    } else {
      const billingMonth = new Date(year, month + 1, 1);
      return billingMonth.toISOString().split('T')[0];
    }
  };

  const handleSubmit = () => {
    if (expenseForm.card_id === 'no-cards') {
      toast({
        title: "Erro",
        description: "Nenhum cartão disponível",
        variant: "destructive"
      });
      return;
    }

    if (!expenseForm.card_id || !expenseForm.purchase_date || !expenseForm.description || !expenseForm.amount) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const selectedCard = cards.find(c => c.id === expenseForm.card_id);
    if (!selectedCard) return;

    const billingMonth = calculateBillingMonth(expenseForm.purchase_date, selectedCard.closing_date);
    
    onSubmit({
      card_id: expenseForm.card_id,
      description: expenseForm.description,
      amount: parseFloat(expenseForm.amount),
      purchase_date: expenseForm.purchase_date,
      billing_month: billingMonth,
      is_installment: expenseForm.is_installment,
      installments: expenseForm.is_installment ? parseInt(expenseForm.installments) : undefined,
      current_installment: expenseForm.is_installment ? 1 : undefined,
      category_id: expenseForm.category_id || undefined
    });

    setExpenseForm({ 
      card_id: '', 
      purchase_date: '', 
      description: '', 
      amount: '', 
      is_installment: false, 
      installments: '',
      billing_month: '',
      category_id: ''
    });
  };

  if (!showForm) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Registrar Nova Despesa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <Label htmlFor="expenseCard">Cartão *</Label>
            <Select 
              value={expenseForm.card_id} 
              onValueChange={(value) => setExpenseForm({ ...expenseForm, card_id: value })}
              disabled={cards.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o cartão" />
              </SelectTrigger>
              <SelectContent>
                {cards.length > 0 ? (
                  cards.map((card) => (
                    <SelectItem key={card.id} value={card.id}>
                      {card.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-cards" disabled className="text-gray-400">
                    Nenhum cartão cadastrado
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {cards.length === 0 && (
              <p className="text-xs text-orange-500 mt-1">
                Cadastre um cartão antes de adicionar despesas
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="category">Categoria</Label>
            <CategorySelector
              categories={expenseCategories}
              value={expenseForm.category_id}
              onValueChange={(value) => setExpenseForm({ ...expenseForm, category_id: value })}
              placeholder="Selecione uma categoria"
              disabled={categoriesLoading}
            />
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

        {expenseForm.purchase_date && expenseForm.card_id && expenseForm.card_id !== 'no-cards' && (
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
          <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto"
            disabled={cards.length === 0}
          >
            Registrar Despesa
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseForm;
