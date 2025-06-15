
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash, Check, X } from 'lucide-react';
import { useFormatters } from '@/hooks/useFormatters';

interface IntegratedIncomeRowProps {
  income: any;
  onUpdateOccurrence?: (id: string, occurrenceIndex: number, newAmount: number) => Promise<void>;
  onDeleteIncome: (id: string) => Promise<void>;
  onEditIncome?: (income: any) => void;
}

const IntegratedIncomeRow = ({ 
  income, 
  onUpdateOccurrence, 
  onDeleteIncome, 
  onEditIncome 
}: IntegratedIncomeRowProps) => {
  const formatters = useFormatters();
  const [isEditing, setIsEditing] = useState(false);
  const [editAmount, setEditAmount] = useState(income.amount);

  const handleSaveEdit = async () => {
    if (income.source === 'income' && onUpdateOccurrence && income.isRecurringOccurrence) {
      await onUpdateOccurrence(income.id, income.occurrenceIndex || 0, editAmount);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditAmount(income.amount);
    setIsEditing(false);
  };

  const getSourceBadge = () => {
    if (income.source === 'bill') {
      return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Conta Recebida</Badge>;
    }
    return <Badge variant="outline">Receita</Badge>;
  };

  const getTypeLabel = (type: string) => {
    const typeLabels = {
      salary: 'Salário',
      bonus: 'Bônus',
      investment: 'Investimento',
      other: 'Outros'
    };
    return typeLabels[type as keyof typeof typeLabels] || type;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      salary: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      bonus: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      investment: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  return (
    <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
      <td className="py-3 px-2">
        <div className="flex flex-col gap-1">
          <span className="font-medium">{income.description}</span>
          {getSourceBadge()}
        </div>
      </td>
      <td className="py-3 px-2">
        {income.type && (
          <Badge className={getTypeColor(income.type)}>
            {getTypeLabel(income.type)}
          </Badge>
        )}
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
          <span className={`font-semibold ${income.isModified ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'}`}>
            {formatters.currency(income.amount)}
          </span>
        )}
      </td>
      <td className="py-3 px-2 text-sm text-gray-600 dark:text-gray-300">
        {formatters.date(new Date(income.date))}
      </td>
      <td className="py-3 px-2">
        <div className="flex items-center gap-1">
          {income.source === 'income' && income.isRecurringOccurrence && onUpdateOccurrence ? (
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
          ) : income.source === 'income' && onEditIncome ? (
            <Button size="sm" variant="ghost" onClick={() => onEditIncome(income)}>
              <Pencil className="h-3 w-3" />
            </Button>
          ) : null}
          
          {income.source === 'income' && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => onDeleteIncome(income.id)}
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

export default IntegratedIncomeRow;
