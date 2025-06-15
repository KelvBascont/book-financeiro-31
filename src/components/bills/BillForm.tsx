
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCategories } from '@/hooks/useCategories';
import { Bill } from '@/hooks/useBills';

interface BillFormProps {
  bill?: Bill;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const BillForm = ({ bill, onSubmit, onCancel }: BillFormProps) => {
  const { categories } = useCategories();
  const [formData, setFormData] = useState({
    title: bill?.title || '',
    description: bill?.description || '',
    amount: bill?.amount || 0,
    type: bill?.type || 'payable',
    category_id: bill?.category_id || '',
    due_date: bill?.due_date || '',
    is_recurring: bill?.is_recurring || false,
    recurrence_months: bill?.recurrence_months || 1,
    reminder_days: bill?.reminder_days || 3,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{bill ? 'Editar Conta' : 'Nova Conta'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as 'payable' | 'receivable' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payable">A Pagar</SelectItem>
                  <SelectItem value="receivable">A Receber</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount">Valor</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div>
              <Label htmlFor="due_date">Data de Vencimento</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar categoria" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reminder_days">Lembrete (dias antes)</Label>
              <Input
                id="reminder_days"
                type="number"
                min="1"
                value={formData.reminder_days}
                onChange={(e) => setFormData({ ...formData, reminder_days: parseInt(e.target.value) || 3 })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_recurring"
              checked={formData.is_recurring}
              onCheckedChange={(checked) => setFormData({ ...formData, is_recurring: checked })}
            />
            <Label htmlFor="is_recurring">Conta recorrente</Label>
          </div>

          {formData.is_recurring && (
            <div>
              <Label htmlFor="recurrence_months">Repetir a cada (meses)</Label>
              <Input
                id="recurrence_months"
                type="number"
                min="1"
                value={formData.recurrence_months}
                onChange={(e) => setFormData({ ...formData, recurrence_months: parseInt(e.target.value) || 1 })}
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit">
              {bill ? 'Salvar' : 'Criar Conta'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default BillForm;
