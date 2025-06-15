
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Bill } from '@/hooks/useBills';

interface BillFormProps {
  bill?: Bill;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialType?: 'payable' | 'receivable';
  typeDisabled?: boolean;
}

const BillForm = ({ bill, onSubmit, onCancel, initialType, typeDisabled = false }: BillFormProps) => {
  const { categories } = useCategories();
  const [formData, setFormData] = useState({
    title: bill?.title || '',
    description: bill?.description || '',
    amount: bill?.amount || 0,
    type: bill?.type || initialType || 'payable' as 'payable' | 'receivable',
    category_id: bill?.category_id || '',
    due_date: bill?.due_date || '',
    is_recurring: bill?.is_recurring || false,
    recurrence_months: bill?.recurrence_months || 1,
    reminder_days: bill?.reminder_days || 3,
    status: bill?.status || 'pending',
    paid_date: bill?.paid_date || '',
    paid_amount: bill?.paid_amount || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Se está marcando como pago e não tem data de pagamento, usar hoje
    let submitData = { ...formData };
    if (submitData.status === 'paid' && !submitData.paid_date) {
      submitData.paid_date = new Date().toISOString().split('T')[0];
    }
    if (submitData.status === 'paid' && !submitData.paid_amount) {
      submitData.paid_amount = submitData.amount;
    }
    
    onSubmit(submitData);
  };

  // Filter categories based on bill type
  const filteredCategories = categories.filter(cat => 
    formData.type === 'payable' ? cat.type === 'expense' : cat.type === 'income'
  );

  // Helper para gerar datas rápidas
  const getQuickDate = (monthsBack: number) => {
    const date = subMonths(new Date(), monthsBack);
    return format(endOfMonth(date), 'yyyy-MM-dd');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {formData.status === 'paid' ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <Clock className="h-5 w-5 text-orange-600" />
          )}
          {bill ? 'Editar Conta' : 'Nova Conta'}
        </CardTitle>
        {!bill && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Você pode registrar contas de qualquer período, incluindo meses anteriores
          </div>
        )}
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
                placeholder="Ex: Conta de luz, Salário..."
                required
              />
            </div>

            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ 
                  ...formData, 
                  type: value as 'payable' | 'receivable',
                  category_id: '' // Reset category when type changes
                })}
                disabled={typeDisabled}
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
                placeholder="0,00"
                required
              />
            </div>

            <div>
              <Label htmlFor="due_date">Data de Vencimento</Label>
              <div className="space-y-2">
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  required
                />
                <div className="flex gap-1 flex-wrap">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({ ...formData, due_date: getQuickDate(0) })}
                  >
                    Este mês
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({ ...formData, due_date: getQuickDate(1) })}
                  >
                    Mês passado
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({ ...formData, due_date: getQuickDate(2) })}
                  >
                    2 meses atrás
                  </Button>
                </div>
              </div>
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
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="overdue">Vencido</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.status === 'paid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div>
                <Label htmlFor="paid_date">Data do Pagamento</Label>
                <Input
                  id="paid_date"
                  type="date"
                  value={formData.paid_date}
                  onChange={(e) => setFormData({ ...formData, paid_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="paid_amount">Valor Pago</Label>
                <Input
                  id="paid_amount"
                  type="number"
                  step="0.01"
                  value={formData.paid_amount || formData.amount}
                  onChange={(e) => setFormData({ ...formData, paid_amount: parseFloat(e.target.value) || 0 })}
                  placeholder="Deixe vazio para usar o valor total"
                />
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detalhes adicionais sobre esta conta..."
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
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
          )}

          {formData.due_date && (
            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Calendar className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {formData.status === 'paid' ? 'Conta paga' : 'Conta vence'} em:{' '}
                <strong>
                  {format(new Date(formData.due_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </strong>
              </span>
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit">
              {bill ? 'Salvar Alterações' : 'Criar Conta'}
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
