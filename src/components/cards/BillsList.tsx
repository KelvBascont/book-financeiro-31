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
const BillsList = ({
  bills,
  selectedMonth,
  onPayBill,
  onEditBill
}: BillsListProps) => {
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
        return 'text-green-400';
      case 'overdue':
        return 'text-red-400';
      default:
        return 'text-orange-400';
    }
  };
  return <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="text-slate-50">
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Despesas - {format(selectedMonth, 'MMMM/yyyy', {
          locale: ptBR
        })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {bills.map(bill => <div key={bill.cardId} className="p-4 border border-gray-700 rounded-lg bg-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {bill.status === 'overdue' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                  <div>
                    <p className="font-medium">{bill.cardName}</p>
                    <p className="text-sm text-gray-400">
                      {bill.expensesCount} parcela{bill.expensesCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatters.currency(bill.totalAmount)}</p>
                    <p className="text-sm text-gray-400">
                      Venc: {formatters.date(bill.dueDate)}
                    </p>
                    <p className="text-xs text-gray-500">Parcelas do mês</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${getStatusColor(bill.status)}`}>
                      {getStatusText(bill.status)}
                    </span>
                    
                    {bill.status !== 'paid' && <div className="flex gap-1">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => onPayBill(bill)}>
                          Pagar
                        </Button>
                        <Button variant="outline" size="sm" className="border-gray-600 text-white hover:bg-gray-700" onClick={() => onEditBill(bill)}>
                          Editar
                        </Button>
                      </div>}
                  </div>
                </div>
              </div>
            </div>)}
          
          {bills.length === 0 && <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Nenhuma despesa para {format(selectedMonth, 'MMMM/yyyy', {
              locale: ptBR
            })}</p>
            </div>}
        </div>
      </CardContent>
    </Card>;
};
export default BillsList;