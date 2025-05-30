
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, TrendingUp } from 'lucide-react';
import { useFormatters } from '@/hooks/useFormatters';
import CrudActions from '@/components/CrudActions';

interface CardsOverviewProps {
  cards: any[];
  cardExpenses: any[];
  onEditCard: (card: any) => void;
  onDeleteCard: (id: string) => void;
}

const CardsOverview = ({ cards, cardExpenses, onEditCard, onDeleteCard }: CardsOverviewProps) => {
  const formatters = useFormatters();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Cartões Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {cards.map((card) => (
              <div key={card.id} className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-8 w-8 text-blue-600 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{card.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Venc: {card.due_date} | Fech: {card.closing_date}
                    </p>
                  </div>
                </div>
                <CrudActions
                  item={card}
                  onEdit={onEditCard}
                  onDelete={() => onDeleteCard(card.id)}
                  showView={false}
                  deleteTitle="Confirmar exclusão"
                  deleteDescription="Esta ação não pode ser desfeita. O cartão será permanentemente removido."
                />
              </div>
            ))}
            
            {cards.length === 0 && (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Nenhum cartão cadastrado</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Clique em "Novo Cartão" para começar</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Últimas Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {cardExpenses.slice(0, 5).map((expense) => (
              <div key={expense.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-800 gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{expense.description}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {cards.find(c => c.id === expense.card_id)?.name} • {formatters.date(expense.purchase_date)}
                  </p>
                  <span className="inline-block px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full mt-1">
                    Fatura: {formatters.dateMonthYear(new Date(expense.billing_month))}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{formatters.currency(expense.amount)}</p>
                  {expense.is_installment && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {expense.current_installment}/{expense.installments}
                    </p>
                  )}
                </div>
              </div>
            ))}
            
            {cardExpenses.length === 0 && (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Nenhuma despesa registrada</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Clique em "Nova Despesa" para começar</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CardsOverview;
