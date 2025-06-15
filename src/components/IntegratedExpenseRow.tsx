
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash, Check, X, Tag } from 'lucide-react';
import { useFormatters } from '@/hooks/useFormatters';
import { useCategories } from '@/hooks/useCategories';

interface IntegratedExpenseRowProps {
  expense: any;
  onUpdateOccurrence: (transactionId: string, occurrenceIndex: number, newAmount: number) => Promise<void>;
  onDeleteExpense: (id: string) => Promise<void>;
  onEditExpense: (expense: any) => void;
}

const IntegratedExpenseRow = ({ 
  expense, 
  onUpdateOccurrence, 
  onDeleteExpense,
  onEditExpense 
}: IntegratedExpenseRowProps) => {
  const formatters = useFormatters();
  const { categories } = useCategories();
  const [isEditing, setIsEditing] = useState(false);
  const [editAmount, setEditAmount] = useState(Math.abs(expense.amount));

  const handleSaveEdit = async () => {
    if (expense.source === 'cash_expense' && expense.isRecurringOccurrence) {
      await onUpdateOccurrence(expense.id, expense.occurrenceIndex || 0, editAmount);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditAmount(Math.abs(expense.amount));
    setIsEditing(false);
  };

  const getSourceBadge = () => {
    if (expense.source === 'bill') {
      return <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Conta Paga</Badge>;
    }
    return <Badge variant="outline">Despesa</Badge>;
  };

  const getCategoryBadge = () => {
    if (expense.category_id) {
      const category = categories.find(cat => cat.id === expense.category_id);
      if (category) {
        return (
          <Badge 
            variant="secondary" 
            style={{ backgroundColor: category.color + '20', color: category.color }}
            className="text-xs"
          >
            <Tag className="h-3 w-3 mr-1" />
            {category.name}
          </Badge>
        );
      }
    }
    return null;
  };

  return (
    <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
      <td className="py-3 px-2">
        <div className="flex flex-col gap-1">
          <span className="font-medium">{expense.description}</span>
          <div className="flex gap-1 flex-wrap">
            {getSourceBadge()}
            {getCategoryBadge()}
          </div>
        </div>
      </td>
      <td className="py-3 px-2">
        {isEditing ? (
          <Input
            type="number"
            step="0.01"
            value={editAmount}
            onChange={(e) => setEditAmount(parseFloat(e.target.value) || 0)}
            className="w-24"
          />
        ) : (
          <span className={`font-semibold ${expense.isModified ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatters.currency(Math.abs(expense.amount))}
          </span>
        )}
      </td>
      <td className="py-3 px-2 text-sm text-gray-600 dark:text-gray-300">
        {formatters.date(new Date(expense.date))}
      </td>
      <td className="py-3 px-2 text-sm text-gray-600 dark:text-gray-300">
        {expense.due_date ? formatters.date(new Date(expense.due_date)) : '-'}
      </td>
      <td className="py-3 px-2">
        <div className="flex items-center gap-1">
          {expense.source === 'cash_expense' && expense.isRecurringOccurrence ? (
            isEditing ? (
              <>
                <Button size="sm" variant="ghost" onClick={handleSaveEdit}>
                  <Check className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                  <X className="h-3 w-3" />
                </Button>
              </>
            ) : (
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
                <Pencil className="h-3 w-3" />
              </Button>
            )
          ) : expense.source === 'cash_expense' ? (
            <Button size="sm" variant="ghost" onClick={() => onEditExpense(expense)}>
              <Pencil className="h-3 w-3" />
            </Button>
          ) : null}
          
          {expense.source === 'cash_expense' && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => onDeleteExpense(expense.id)}
              className="text-red-600 hover:text-red-700 dark:text-red-400"
            >
              <Trash className="h-3 w-3" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default IntegratedExpenseRow;
