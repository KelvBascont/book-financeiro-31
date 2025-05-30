
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CardFormProps {
  showForm: boolean;
  editingCard: any;
  onSubmit: (card: any) => void;
  onCancel: () => void;
}

const CardForm = ({ showForm, editingCard, onSubmit, onCancel }: CardFormProps) => {
  const { toast } = useToast();
  const [cardForm, setCardForm] = useState({
    name: editingCard?.name || '',
    due_date: editingCard?.due_date?.toString() || '',
    closing_date: editingCard?.closing_date?.toString() || ''
  });

  const handleSubmit = () => {
    if (!cardForm.name || !cardForm.due_date || !cardForm.closing_date) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    onSubmit({
      name: cardForm.name,
      due_date: parseInt(cardForm.due_date),
      closing_date: parseInt(cardForm.closing_date)
    });
  };

  if (!showForm) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          {editingCard ? 'Editar Cartão' : 'Cadastrar Novo Cartão'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              value={cardForm.due_date}
              onChange={(e) => setCardForm({ ...cardForm, due_date: e.target.value })}
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
              value={cardForm.closing_date}
              onChange={(e) => setCardForm({ ...cardForm, closing_date: e.target.value })}
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-end gap-2">
          <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="w-full sm:w-auto">
            {editingCard ? 'Atualizar' : 'Cadastrar'} Cartão
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CardForm;
