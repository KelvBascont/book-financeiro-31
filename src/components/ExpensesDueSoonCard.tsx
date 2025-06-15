
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, AlertTriangle, DollarSign, TrendingUp } from 'lucide-react';
import { useBills } from '@/hooks/useBills';
import { useFormatters } from '@/hooks/useFormatters';
import { addDays, format, isWithinInterval, parseISO } from 'date-fns';

const ExpensesDueSoonCard = () => {
  const formatters = useFormatters();
  const { bills, loading } = useBills();

  // Filtrar contas com vencimento nos próximos 30 dias
  const getBillsDueSoon = () => {
    const today = new Date();
    const endDate = addDays(today, 30);
    
    return bills
      .filter(bill => {
        // Apenas contas pendentes ou vencidas
        if (bill.status === 'paid') return false;
        
        const dueDate = parseISO(bill.due_date);
        return isWithinInterval(dueDate, { start: today, end: endDate });
      })
      .sort((a, b) => {
        const dateA = new Date(a.due_date).getTime();
        const dateB = new Date(b.due_date).getTime();
        return dateA - dateB;
      })
      .slice(0, 8); // Limitar a 8 itens para não sobrecarregar o card
  };

  const billsDueSoon = getBillsDueSoon();

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = parseISO(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyColor = (daysUntilDue: number) => {
    if (daysUntilDue <= 0) return 'text-red-700 dark:text-red-300 font-bold';
    if (daysUntilDue <= 3) return 'text-red-600 dark:text-red-400';
    if (daysUntilDue <= 7) return 'text-orange-600 dark:text-orange-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getTypeIcon = (type: string) => {
    return type === 'payable' ? (
      <DollarSign className="h-3 w-3 text-red-500" />
    ) : (
      <TrendingUp className="h-3 w-3 text-green-500" />
    );
  };

  const getTypeColor = (type: string) => {
    return type === 'payable' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Contas com Vencimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between items-center animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Contas com Vencimento
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
            (30 dias)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {billsDueSoon.length === 0 ? (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma conta com vencimento próximo</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {billsDueSoon.map((bill) => {
              const daysUntilDue = getDaysUntilDue(bill.due_date);
              const urgencyColor = getUrgencyColor(daysUntilDue);
              
              return (
                <div key={bill.id} className="flex justify-between items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {bill.title}
                      </p>
                      {getTypeIcon(bill.type)}
                      <span className={`text-xs font-medium ${getTypeColor(bill.type)}`}>
                        {bill.type === 'payable' ? 'Pagar' : 'Receber'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <p className={`text-xs ${urgencyColor}`}>
                        {formatters.date(bill.due_date)}
                      </p>
                      {daysUntilDue <= 3 && (
                        <AlertTriangle className="h-3 w-3 text-red-500" />
                      )}
                      <span className={`text-xs ${urgencyColor}`}>
                        {daysUntilDue <= 0 ? 'Vencida' :
                         daysUntilDue === 1 ? 'Amanhã' : 
                         `${daysUntilDue} dias`}
                      </span>
                    </div>
                    {bill.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                        {bill.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className={`text-sm font-semibold ${getTypeColor(bill.type)}`}>
                      {formatters.currency(bill.amount)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {billsDueSoon.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Total (30 dias):
              </span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {formatters.currency(
                  billsDueSoon.reduce((sum, bill) => {
                    return bill.type === 'payable' 
                      ? sum + bill.amount 
                      : sum - bill.amount;
                  }, 0)
                )}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>
                A Pagar: {formatters.currency(
                  billsDueSoon.filter(b => b.type === 'payable').reduce((sum, bill) => sum + bill.amount, 0)
                )}
              </span>
              <span>
                A Receber: {formatters.currency(
                  billsDueSoon.filter(b => b.type === 'receivable').reduce((sum, bill) => sum + bill.amount, 0)
                )}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpensesDueSoonCard;
