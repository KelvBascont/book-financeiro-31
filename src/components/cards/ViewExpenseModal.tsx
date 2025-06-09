
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useFormatters } from '@/hooks/useFormatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ViewExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: any;
  cardName?: string;
}

const ViewExpenseModal = ({ open, onOpenChange, expense, cardName }: ViewExpenseModalProps) => {
  const formatters = useFormatters();

  if (!expense) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Detalhes da Despesa</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Descrição</label>
            <p className="text-lg font-semibold">{expense.description}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Cartão</label>
            <p className="text-base">{cardName}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Valor</label>
              <p className="text-lg font-bold text-green-600">{formatters.currency(expense.amount)}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Data da Compra</label>
              <p className="text-base">{formatters.date(expense.purchase_date)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Fatura</label>
              <p className="text-base">{format(new Date(expense.billing_month), 'MMMM/yyyy', { locale: ptBR })}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Parcela</label>
              <Badge variant={expense.is_installment ? "default" : "secondary"}>
                {expense.is_installment 
                  ? `${expense.current_installment}/${expense.installments}`
                  : 'À vista'
                }
              </Badge>
            </div>
          </div>

          {expense.is_installment && (
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Valor Total da Compra</label>
              <p className="text-base font-semibold">
                {formatters.currency(expense.amount * (expense.installments || 1))}
              </p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Cadastrado em</label>
            <p className="text-sm text-gray-500">{formatters.dateTime(expense.created_at)}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewExpenseModal;
