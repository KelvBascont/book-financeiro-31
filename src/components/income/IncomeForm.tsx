
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import CategorySelector from '@/components/CategorySelector';
import type { Income } from '@/hooks/useIncomes';

interface IncomeFormProps {
  showAddIncome: boolean;
  editingIncome: Income | null;
  incomeForm: {
    description: string;
    amount: string;
    date: string;
    type: 'salary' | 'bonus' | 'investment' | 'other';
    is_recurring: boolean;
    recurrence_months: string;
    category_id: string;
  };
  onFormChange: (field: string, value: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const IncomeForm = ({ 
  showAddIncome, 
  editingIncome, 
  incomeForm, 
  onFormChange, 
  onSubmit, 
  onCancel 
}: IncomeFormProps) => {
  const { incomeCategories, loading: categoriesLoading } = useCategories();

  if (!showAddIncome) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {editingIncome ? 'Editar Receita' : 'Cadastrar Nova Receita'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="description">Descrição *</Label>
            <Input 
              id="description" 
              placeholder="Ex: Salário, Freelance..." 
              value={incomeForm.description} 
              onChange={e => onFormChange('description', e.target.value)} 
            />
          </div>
          <div>
            <Label htmlFor="amount">Valor *</Label>
            <Input 
              id="amount" 
              type="number" 
              step="0.01" 
              placeholder="0,00" 
              value={incomeForm.amount} 
              onChange={e => onFormChange('amount', e.target.value)} 
            />
          </div>
          <div>
            <Label htmlFor="date">Data *</Label>
            <Input 
              id="date" 
              type="date" 
              value={incomeForm.date} 
              onChange={e => onFormChange('date', e.target.value)} 
            />
          </div>
          <div>
            <Label htmlFor="type">Tipo</Label>
            <Select 
              value={incomeForm.type} 
              onValueChange={(value: 'salary' | 'bonus' | 'investment' | 'other') => 
                onFormChange('type', value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="salary">Salário</SelectItem>
                <SelectItem value="bonus">Bônus</SelectItem>
                <SelectItem value="investment">Investimento</SelectItem>
                <SelectItem value="other">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="category">Categoria</Label>
            {categoriesLoading ? (
              <div className="h-10 bg-gray-200 rounded animate-pulse" />
            ) : (
              <CategorySelector 
                categories={incomeCategories} 
                value={incomeForm.category_id} 
                onValueChange={value => onFormChange('category_id', value)} 
                placeholder="Selecione uma categoria" 
              />
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch 
            id="recurring" 
            checked={incomeForm.is_recurring} 
            onCheckedChange={checked => onFormChange('is_recurring', checked)} 
          />
          <Label htmlFor="recurring">Receita recorrente</Label>
        </div>
        
        {incomeForm.is_recurring && (
          <div className="w-full sm:w-48">
            <Label htmlFor="recurrence">Repetir por quantos meses</Label>
            <Input 
              id="recurrence" 
              type="number" 
              min="1" 
              max="60" 
              placeholder="Ex: 12" 
              value={incomeForm.recurrence_months} 
              onChange={e => onFormChange('recurrence_months', e.target.value)} 
            />
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row justify-end gap-2">
          <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button onClick={onSubmit} className="w-full sm:w-auto">
            {editingIncome ? 'Atualizar' : 'Cadastrar'} Receita
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default IncomeForm;
