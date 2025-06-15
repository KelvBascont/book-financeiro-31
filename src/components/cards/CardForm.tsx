
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CardFormProps {
  showForm: boolean;
  editingCard: any;
  onSubmit: (card: any) => Promise<void>;
  onCancel: () => void;
}

const CardForm = ({ showForm, editingCard, onSubmit, onCancel }: CardFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [cardForm, setCardForm] = useState({
    name: '',
    due_date: '',
    closing_date: ''
  });

  useEffect(() => {
    if (editingCard) {
      setCardForm({
        name: editingCard.name || '',
        due_date: editingCard.due_date?.toString() || '',
        closing_date: editingCard.closing_date?.toString() || ''
      });
    } else {
      setCardForm({
        name: '',
        due_date: '',
        closing_date: ''
      });
    }
  }, [editingCard, showForm]);

  const handleSubmit = async () => {
    if (!cardForm.name || !cardForm.due_date || !cardForm.closing_date) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const dueDate = parseInt(cardForm.due_date);
    const closingDate = parseInt(cardForm.closing_date);

    if (isNaN(dueDate) || isNaN(closingDate) || dueDate < 1 || dueDate > 31 || closingDate < 1 || closingDate > 31) {
      toast({
        title: "Erro",
        description: "Os dias devem ser números válidos entre 1 e 31",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      await onSubmit({
        name: cardForm.name,
        due_date: dueDate,
        closing_date: closingDate
      });
      
      toast({
        title: "Sucesso",
        description: editingCard ? "Cartão atualizado com sucesso" : "Cartão adicionado com sucesso"
      });
    } catch (error) {
      console.error('Erro ao salvar cartão:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar cartão",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={showForm} onOpenChange={onCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {editingCard ? 'Editar Cartão' : 'Cadastrar Novo Cartão'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 p-4">
          <div>
            <Label htmlFor="cardName">Nome do Cartão *</Label>
            <Input
              id="cardName"
              placeholder="Ex: Nubank, Itaú..."
              value={cardForm.name}
              onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
              disabled={loading}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
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
                disabled={loading}
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
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onCancel} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Salvando...' : (editingCard ? 'Atualizar' : 'Cadastrar')} Cartão
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CardForm;
