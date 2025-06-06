
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, AlertTriangle, Clock } from 'lucide-react';
import { useFormatters } from '@/hooks/useFormatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Card {
  id: string;
  name: string;
  due_date: number;
  closing_date: number;
}

interface CardExpense {
  id: string;
  card_id: string;
  amount: number;
  billing_month: string;
  description: string;
  purchase_date: string;
  is_installment: boolean;
  installments?: number;
  current_installment?: number;
}

interface BillsOverviewProps {
  cards: Card[];
  cardExpenses: CardExpense[];
  currentMonth: Date;
}

const BillsOverview = ({ cards, cardExpenses, currentMonth }: BillsOverviewProps) => {
  const formatters = useFormatters();
  
  // Calcular faturas por cartão no mês atual
  const calculateBills = () => {
    const currentMonthStr = format(currentMonth, 'yyyy-MM');
    
    return cards.map(card => {
      // Filtrar despesas do cartão que se enquadram na fatura do mês atual
      // Agora usar billing_month que já vem calculado corretamente do banco
      const monthExpenses = cardExpenses.filter(expense => {
        if (expense.card_id !== card.id) return false;
        
        const expenseBillingMonth = format(new Date(expense.billing_month), 'yyyy-MM');
        return expenseBillingMonth === currentMonthStr;
      });
      
      // Somar os valores das parcelas (amount já é o valor da parcela individual)
      const totalAmount = monthExpenses.reduce((sum, expense) => {
        return sum + expense.amount;
      }, 0);
      
      // Calcular data de vencimento da fatura
      const billDueDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), card.due_date);
      const today = new Date();
      
      // Determinar status da fatura - apenas pendente ou vencido por ora
      let status: 'pending' | 'overdue' = 'pending';
      if (billDueDate < today) {
        status = 'overdue';
      }
      // TODO: Aqui poderia ter lógica para verificar se está pago baseado em uma tabela de pagamentos
      
      return {
        cardId: card.id,
        cardName: card.name,
        totalAmount,
        dueDate: billDueDate,
        status,
        expensesCount: monthExpenses.length
      };
    }).filter(bill => bill.totalAmount > 0); // Só mostrar cartões com despesas
  };

  const bills = calculateBills();
  const currentMonthName = format(currentMonth, 'MMMM/yyyy', { locale: ptBR });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'overdue':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-orange-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'Vencido';
      default:
        return 'Pendente';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-orange-600 dark:text-orange-400';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Faturas - {currentMonthName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {bills.map((bill) => (
            <div key={bill.cardId} className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-800">
              <div className="flex items-center gap-3 flex-1">
                <div className="flex items-center gap-2">
                  {getStatusIcon(bill.status)}
                  <div>
                    <p className="font-medium">{bill.cardName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {bill.expensesCount} parcela{bill.expensesCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-bold text-lg">{formatters.currency(bill.totalAmount)}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Venc: {formatters.date(bill.dueDate)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Parcelas do mês
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${getStatusColor(bill.status)}`}>
                    {getStatusText(bill.status)}
                  </span>
                  
                  <div className="flex gap-1">
                    <Button 
                      variant="default" 
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Pagar
                    </Button>
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {bills.length === 0 && (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Nenhuma fatura para {currentMonthName}</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                As faturas aparecerão aqui quando houver despesas no mês
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BillsOverview;
