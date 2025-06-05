
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, AlertTriangle } from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useFormatters } from '@/hooks/useFormatters';
import { useRecurrenceFilter } from '@/hooks/useRecurrenceFilter';
import { addDays, format, isWithinInterval, parseISO } from 'date-fns';

const ExpensesDueSoonCard = () => {
  const formatters = useFormatters();
  const { cashExpenses, loading } = useSupabaseData();
  const { filterByReferenceMonth, generateOccurrences } = useRecurrenceFilter();

  // Filtrar despesas com vencimento nos próximos 30 dias
  const getExpensesDueSoon = () => {
    const today = new Date();
    const endDate = addDays(today, 30);
    
    // Gerar todas as ocorrências das despesas (incluindo recorrentes)
    const allOccurrences = cashExpenses.flatMap(expense => generateOccurrences(expense));

    // Filtrar apenas as que vencem nos próximos 30 dias
    return allOccurrences
      .filter(expense => {
        if (!expense.due_date) return false;
        const dueDate = parseISO(expense.due_date);
        return isWithinInterval(dueDate, { start: today, end: endDate });
      })
      .sort((a, b) => {
        if (!a.due_date || !b.due_date) return 0;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      })
      .slice(0, 8); // Limitar a 8 itens para não sobrecarregar o card
  };

  const expensesDueSoon = getExpensesDueSoon();

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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Despesas com Vencimento
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
          Despesas com Vencimento
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
            (30 dias)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {expensesDueSoon.length === 0 ? (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma despesa com vencimento próximo</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {expensesDueSoon.map((expense, index) => {
              const daysUntilDue = getDaysUntilDue(expense.due_date!);
              const urgencyColor = getUrgencyColor(daysUntilDue);
              
              return (
                <div key={`${expense.id}-${expense.occurrenceIndex || 0}-${index}`} 
                     className="flex justify-between items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {expense.description}
                      </p>
                      {expense.is_recurring && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <div className="w-3 h-3 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-xs text-white">↻</span>
                          </div>
                          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                            #{(expense.occurrenceIndex || 0) + 1}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <p className={`text-xs ${urgencyColor}`}>
                        {formatters.date(expense.due_date!)}
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
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                      {formatters.currency(expense.amount)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {expensesDueSoon.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Total (30 dias):
              </span>
              <span className="font-semibold text-red-600 dark:text-red-400">
                {formatters.currency(
                  expensesDueSoon.reduce((sum, expense) => sum + expense.amount, 0)
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
