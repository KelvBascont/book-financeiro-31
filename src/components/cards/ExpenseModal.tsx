import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFormatters } from '@/hooks/useFormatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cards: any[];
  onSubmit: (expense: any) => void;
}

const ExpenseModal = ({ open, onOpenChange, cards, onSubmit }: ExpenseModalProps) => {
  const { toast } = useToast();
  const formatters = useFormatters();
  const [expenseForm, setExpenseForm] = useState({
    card_id: '',
    purchase_date: '',
    description: '',
    amount: '',
    is_installment: false,
    installments: '',
  });

  // Função CORRETA para calcular o mês da fatura
  const calculateBillingMonth = (purchaseDate: string, closingDay: number) => {
    const purchase = new Date(purchaseDate);
    const purchaseDay = purchase.getDate();
    const purchaseMonth = purchase.getMonth();
    const purchaseYear = purchase.getFullYear();

    let billingMonth, billingYear;

    // Se a compra foi feita até o dia de fechamento (inclusive)
    if (purchaseDay <= closingDay) {
      // A fatura é do mês SEGUINTE à compra
      billingMonth = purchaseMonth + 1;
      billingYear = purchaseYear;
      
      // Se passou de dezembro, vai para janeiro do próximo ano
      if (billingMonth > 11) {
        billingMonth = 0;
        billingYear++;
      }
    } else {
      // Se a compra foi feita após o dia de fechamento
      // A fatura é do mês seguinte + 1 (dois meses à frente)
      billingMonth = purchaseMonth + 2;
      billingYear = purchaseYear;
      
      // Ajustar virada de ano
      if (billingMonth > 11) {
        billingYear += Math.floor(billingMonth / 12);
        billingMonth = billingMonth % 12;
      }
    }

    // Retorna a data da fatura (primeiro dia do mês de cobrança)
    return new Date(billingYear, billingMonth, 1);
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
      billing_month: format(billingMonth, 'yyyy-MM-dd'),
      is_installment: expenseForm.is_installment,
      installments: expenseForm.is_installment ? parseInt(expenseForm.installments) : undefined,
      current_installment: expenseForm.is_installment ? 1 : undefined
    });

    // Reset form
    setExpenseForm({ 
      card_id: '', 
      purchase_date: '', 
      description: '', 
      amount: '', 
      is_installment: false, 
      installments: ''
    });
    
    onOpenChange(false);
  };

  const selectedCard = cards.find(c => c.id === expenseForm.card_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Nova Despesa</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
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
          
          <div className="flex items-center space-x-2">
            <Switch
              id="installment"
              checked={expenseForm.is_installment}
              onCheckedChange={(checked) => setExpenseForm({ ...expenseForm, is_installment: checked })}
            />
            <Label htmlFor="installment">Compra parcelada</Label>
          </div>
          
          {expenseForm.is_installment && (
            <div>
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

          {expenseForm.purchase_date && expenseForm.card_id && expenseForm.card_id !== 'no-cards' && selectedCard && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <span className="text-sm text-blue-800 dark:text-blue-200">
                Esta despesa será cobrada na fatura de{' '}
                <strong>
                  {format(
                    calculateBillingMonth(expenseForm.purchase_date, selectedCard.closing_date),
                    'MMMM/yyyy',
                    { locale: ptBR }
                  )}
                </strong>
              </span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="bg-orange-500 hover:bg-orange-600"
            disabled={cards.length === 0}
          >
            Registrar Despesa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseModal;
