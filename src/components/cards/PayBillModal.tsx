
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Check } from 'lucide-react';
import { useFormatters } from '@/hooks/useFormatters';

interface PayBillModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill: {
    cardId: string;
    cardName: string;
    totalAmount: number;
    dueDate: Date;
  } | null;
  onConfirmPayment: (cardId: string, amount: number, paymentDate: string) => void;
}

const PayBillModal = ({ open, onOpenChange, bill, onConfirmPayment }: PayBillModalProps) => {
  const formatters = useFormatters();
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  const handleConfirmPayment = () => {
    if (!bill) return;
    
    onConfirmPayment(bill.cardId, bill.totalAmount, paymentDate);
    onOpenChange(false);
  };

  if (!bill) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            Confirmar Pagamento
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
            <CreditCard className="h-8 w-8 text-blue-600" />
            <div>
              <p className="font-medium">{bill.cardName}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Vencimento: {formatters.date(bill.dueDate)}
              </p>
            </div>
          </div>

          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300">Valor a pagar</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
              {formatters.currency(bill.totalAmount)}
            </p>
          </div>

          <div>
            <Label htmlFor="paymentDate">Data do Pagamento</Label>
            <Input
              id="paymentDate"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmPayment}
            className="bg-green-600 hover:bg-green-700"
          >
            Confirmar Pagamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PayBillModal;
