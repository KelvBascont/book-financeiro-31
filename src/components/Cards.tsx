
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, CreditCard, Calendar, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Cards = () => {
  const { toast } = useToast();
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

  const mockCards = [
    { id: '1', name: 'Nubank', dueDate: 15, closingDate: 8 },
    { id: '2', name: 'Itaú', dueDate: 5, closingDate: 28 },
  ];

  const mockExpenses = [
    {
      id: '1',
      cardId: '1',
      description: 'Supermercado Extra',
      amount: 450.00,
      purchaseDate: '2024-05-25',
      billingMonth: 'Jul/2024',
      isInstallment: false
    },
    {
      id: '2',
      cardId: '1',
      description: 'Notebook Dell',
      amount: 2800.00,
      purchaseDate: '2024-05-20',
      billingMonth: 'Jun/2024',
      isInstallment: true,
      installments: '3/12'
    }
  ];

  const handleAddCard = () => {
    if (!cardForm.name || !cardForm.dueDate || !cardForm.closingDate) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Cartão cadastrado!",
      description: `Cartão ${cardForm.name} foi adicionado com sucesso`,
    });
    
    setCardForm({ name: '', dueDate: '', closingDate: '' });
    setShowAddCard(false);
  };

  const calculateBillingMonth = (purchaseDate: string, closingDate: number) => {
    const purchase = new Date(purchaseDate);
    const month = purchase.getMonth();
    const year = purchase.getFullYear();
    
    if (purchase.getDate() > closingDate) {
      const billingMonth = new Date(year, month + 2, 1);
      return billingMonth.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    } else {
      const billingMonth = new Date(year, month + 1, 1);
      return billingMonth.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Gestão de Cartões</h2>
          <p className="text-gray-600 mt-1">Cadastre cartões e registre suas despesas</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddCard(!showAddCard)} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Novo Cartão
          </Button>
          <Button onClick={() => setShowAddExpense(!showAddExpense)} className="bg-orange-500 hover:bg-orange-600">
            <Plus className="h-4 w-4 mr-2" />
            Nova Despesa
          </Button>
        </div>
      </div>

      {showAddCard && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Cadastrar Novo Cartão
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="cardName">Nome do Cartão *</Label>
                <Input
                  id="cardName"
                  placeholder="Ex: Nubank, Itaú..."
                  value={cardForm.name}
                  onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="dueDate">Dia do Vencimento *</Label>
                <Input
                  id="dueDate"
                  type="number"
                  min="1"
                  max="31"
                  placeholder="Ex: 15"
                  value={cardForm.dueDate}
                  onChange={(e) => setCardForm({ ...cardForm, dueDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="closingDate">Dia do Fechamento *</Label>
                <Input
                  id="closingDate"
                  type="number"
                  min="1"
                  max="31"
                  placeholder="Ex: 8"
                  value={cardForm.closingDate}
                  onChange={(e) => setCardForm({ ...cardForm, closingDate: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddCard(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddCard}>
                Cadastrar Cartão
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showAddExpense && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Registrar Nova Despesa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="expenseCard">Cartão *</Label>
                <Select value={expenseForm.cardId} onValueChange={(value) => setExpenseForm({ ...expenseForm, cardId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cartão" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCards.map((card) => (
                      <SelectItem key={card.id} value={card.id}>
                        {card.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="purchaseDate">Data da Compra *</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={expenseForm.purchaseDate}
                  onChange={(e) => setExpenseForm({ ...expenseForm, purchaseDate: e.target.value })}
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
                checked={expenseForm.isInstallment}
                onCheckedChange={(checked) => setExpenseForm({ ...expenseForm, isInstallment: checked })}
              />
              <Label htmlFor="installment">Compra parcelada</Label>
            </div>
            
            {expenseForm.isInstallment && (
              <div className="w-32">
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

            {expenseForm.purchaseDate && expenseForm.cardId && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-blue-800">
                  Esta despesa será cobrada na fatura de{' '}
                  <strong>
                    {calculateBillingMonth(expenseForm.purchaseDate, mockCards.find(c => c.id === expenseForm.cardId)?.closingDate || 0)}
                  </strong>
                </span>
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddExpense(false)}>
                Cancelar
              </Button>
              <Button className="bg-orange-500 hover:bg-orange-600">
                Registrar Despesa
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cartões Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockCards.map((card) => (
                <div key={card.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-medium">{card.name}</p>
                      <p className="text-sm text-gray-600">
                        Venc: {card.dueDate} | Fech: {card.closingDate}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimas Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-sm text-gray-600">
                      {mockCards.find(c => c.id === expense.cardId)?.name} • {expense.purchaseDate}
                    </p>
                    <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full mt-1">
                      Fatura: {expense.billingMonth}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">R$ {expense.amount.toFixed(2)}</p>
                    {expense.isInstallment && (
                      <p className="text-xs text-gray-600">{expense.installments}</p>
                    )}
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
