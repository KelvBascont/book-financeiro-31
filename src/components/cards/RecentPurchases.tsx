
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { useFormatters } from '@/hooks/useFormatters';
import { format, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CardExpense } from '@/hooks/useCardExpenses';

interface RecentPurchasesProps {
  expenses: CardExpense[];
  cards: any[];
}

const RecentPurchases = ({ expenses, cards }: RecentPurchasesProps) => {
  const formatters = useFormatters();

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle>Últimas Compras</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {expenses.slice(0, 4).map((expense) => {
            const card = cards.find(c => c.id === expense.card_id);
            // Adicionar 1 mês ao billing_month para mostrar o mês seguinte
            const displayMonth = addMonths(new Date(expense.billing_month), 1);
            return (
              <div key={expense.id} className="p-4 border border-gray-700 rounded-lg bg-gray-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-sm text-gray-400">
                      {card?.name} • {formatters.date(expense.purchase_date)}
                    </p>
                    <div className="mt-1">
                      <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                        Fatura: {format(displayMonth, 'MMM/yyyy', { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatters.currency(expense.amount)}</p>
                    {expense.is_installment && (
                      <p className="text-sm text-gray-400">
                        {expense.current_installment}/{expense.installments}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Total: {formatters.currency(expense.amount * (expense.installments || 1))}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          
          {expenses.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Nenhuma compra neste mês</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentPurchases;
