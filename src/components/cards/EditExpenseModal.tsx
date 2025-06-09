
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface EditExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: any;
  onSave: (expenseId: string, updates: any) => void;
}

const EditExpenseModal = ({ open, onOpenChange, expense, onSave }: EditExpenseModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    purchase_date: ''
  });

  useEffect(() => {
    if (expense) {
      setFormData({
        description: expense.description || '',
        amount: expense.amount?.toString() || '',
        purchase_date: expense.purchase_date || ''
      });
    }
  }, [expense]);

  const handleSave = () => {
    if (!formData.description.trim() || !formData.amount || !formData.purchase_date) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Erro",
        description: "Valor deve ser um número válido maior que zero",
        variant: "destructive"
      });
      return;
    }

    onSave(expense.id, {
      description: formData.description.trim(),
      amount: amount,
      purchase_date: formData.purchase_date
    });

    onOpenChange(false);
  };

  if (!expense) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Despesa</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="description">Descrição *</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ex: Supermercado, Gasolina..."
            />
          </div>

          <div>
            <Label htmlFor="amount">Valor *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0,00"
            />
          </div>

          <div>
            <Label htmlFor="purchase_date">Data da Compra *</Label>
            <Input
              id="purchase_date"
              type="date"
              value={formData.purchase_date}
              onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
            />
          </div>

          {expense.is_installment && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Atenção:</strong> Esta é uma compra parcelada. Alterações afetarão apenas esta parcela.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditExpenseModal;
