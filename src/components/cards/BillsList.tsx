import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, AlertTriangle } from 'lucide-react';
import { useFormatters } from '@/hooks/useFormatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Bill {
  cardId: string;
  cardName: string;
  totalAmount: number;
  dueDate: Date;
  status: 'pending' | 'overdue' | 'paid';
  expensesCount: number;
}

interface BillsListProps {
  bills: Bill[];
  selectedMonth: Date;
  onPayBill: (bill: Bill) => void;
  onEditBill: (bill: Bill) => void;
}

const BillsList = ({ bills, selectedMonth, onPayBill, onEditBill }: BillsListProps) => {
  const formatters = useFormatters();

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Pago';
      case 'overdue':
        return 'Vencido';
      default:
        return 'Pendente';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/10 text-green-400';
      case 'overdue':
        return 'bg-red-500/10 text-red-400';
      default:
        return 'bg-orange-500/10 text-orange-400';
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-400">
          <CreditCard className="h-5 w-5" />
          Despesas - {format(selectedMonth, 'MMMM/yyyy', { locale: ptBR })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {bills.map((bill) => (
            <div key={bill.cardId} className="p-4 border border-gray-700 rounded-lg bg-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-bold text-lg text-orange-400">{bill.cardName}</p>
                    {bill.status === 'overdue' && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        Vencido
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-400">
                    {bill.expensesCount} transação{bill.expensesCount !== 1 ? 'es' : ''} em {format(selectedMonth, 'MMMM', { locale: ptBR })}
                  </p>
                </div>
                
                <div className="flex flex-col items-end">
                  <p className="font-bold text-xl text-white">{formatters.currency(bill.totalAmount)}</p>
                  
                  <div className="flex gap-4 mt-1">
                    <div className="text-right">
                      <span className="text-xs text-gray-400">Vencimento</span>
                      <p className="text-sm">{formatters.date(bill.dueDate)}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-400">Tipo</span>
                      <p className="text-sm">Parcelas mensais</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-700">
                <div>
                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(bill.status)}`}>
                    {getStatusText(bill.status)}
                  </span>
                </div>
                
                {bill.status !== 'paid' && (
                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={() => onPayBill(bill)}
                    >
                      Pagar agora
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-gray-600 text-white hover:bg-gray-700"
                      onClick={() => onEditBill(bill)}
                    >
                      Detalhes
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {bills.length === 0 && (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Nenhuma despesa para {format(selectedMonth, 'MMMM/yyyy', { locale: ptBR })}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BillsList;