
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Receipt } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import CategorySelector from '@/components/CategorySelector';
import type { CashExpenseForm as CashExpenseFormType } from '@/hooks/useCashExpenseForm';

interface CashExpenseFormProps {
  isVisible: boolean;
  isEditing: boolean;
  formData: CashExpenseFormType;
  onFormChange: (data: CashExpenseFormType) => void;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
}

const CashExpenseForm = ({
  isVisible,
  isEditing,
  formData,
  onFormChange,
  onSubmit,
  onCancel
}: CashExpenseFormProps) => {
  const { expenseCategories, loading: categoriesLoading } = useCategories();

  if (!isVisible) return null;

  const handleSubmit = async () => {
    await onSubmit();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          {isEditing ? 'Editar Despesa' : 'Cadastrar Nova Despesa'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="description">Descrição *</Label>
            <Input
              id="description"
              placeholder="Ex: Supermercado, Conta de luz..."
              value={formData.description}
              onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="amount">Valor *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={formData.amount}
              onChange={(e) => onFormChange({ ...formData, amount: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="date">Data *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => onFormChange({ ...formData, date: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="due_date">Data de Vencimento *</Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => onFormChange({ ...formData, due_date: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="category">Categoria</Label>
            {categoriesLoading ? (
              <div className="h-10 bg-gray-200 rounded animate-pulse" />
            ) : (
              <CategorySelector
                categories={expenseCategories}
                value={formData.category_id}
                onValueChange={(value) => onFormChange({ ...formData, category_id: value })}
                placeholder="Selecione uma categoria"
              />
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="recurring"
            checked={formData.is_recurring}
            onCheckedChange={(checked) => onFormChange({ ...formData, is_recurring: checked })}
          />
          <Label htmlFor="recurring">Despesa recorrente</Label>
        </div>
        
        {formData.is_recurring && (
          <div className="w-full sm:w-48">
            <Label htmlFor="recurrence">Repetir por quantos meses</Label>
            <Input
              id="recurrence"
              type="number"
              min="1"
              max="60"
              placeholder="Ex: 12"
              value={formData.recurrence_months}
              onChange={(e) => onFormChange({ ...formData, recurrence_months: e.target.value })}
            />
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            className="w-full sm:w-auto"
          >
            {isEditing ? 'Atualizar' : 'Cadastrar'} Despesa
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CashExpenseForm;
