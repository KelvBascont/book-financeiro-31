
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Target } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { format, startOfMonth } from 'date-fns';
import { MonthlyBudget } from '@/hooks/useMonthlyBudgets';

interface BudgetFormProps {
  selectedMonth: Date;
  onSubmit: (budget: Omit<MonthlyBudget, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<any>;
  onClose: () => void;
}

const BudgetForm = ({ selectedMonth, onSubmit, onClose }: BudgetFormProps) => {
  const { expenseCategories } = useCategories();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    category_id: '',
    budget_limit: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category_id || !formData.budget_limit) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        category_id: formData.category_id,
        month_year: format(startOfMonth(selectedMonth), 'yyyy-MM-dd'),
        budget_limit: parseFloat(formData.budget_limit)
      });
      onClose();
    } catch (error) {
      console.error('Error creating budget:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Novo Orçamento
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="category">Categoria *</Label>
              <Select 
                value={formData.category_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria de despesa" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="budget_limit">Limite do Orçamento (R$) *</Label>
              <Input
                id="budget_limit"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={formData.budget_limit}
                onChange={(e) => setFormData(prev => ({ ...prev, budget_limit: e.target.value }))}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting || !formData.category_id || !formData.budget_limit}
              >
                {isSubmitting ? 'Salvando...' : 'Criar Orçamento'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetForm;
