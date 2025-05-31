
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useFormatters } from '@/hooks/useFormatters';
import { Edit2, Save, X, AlertCircle } from 'lucide-react';
import { type FilteredRecurrentTransaction } from '@/hooks/useRecurrenceFilter';

interface EditableIncomeRowProps {
  income: FilteredRecurrentTransaction;
  onUpdateOccurrence: (id: string, occurrenceIndex: number, newAmount: number) => Promise<void>;
  onDeleteIncome: (id: string) => Promise<void>;
}

const EditableIncomeRow = ({ 
  income, 
  onUpdateOccurrence, 
  onDeleteIncome 
}: EditableIncomeRowProps) => {
  const { toast } = useToast();
  const formatters = useFormatters();
  const [isEditing, setIsEditing] = useState(false);
  const [editAmount, setEditAmount] = useState(income.amount.toString());
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    const newAmount = parseFloat(editAmount);
    if (isNaN(newAmount) || newAmount <= 0) {
      toast({
        title: "Erro",
        description: "Digite um valor válido",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await onUpdateOccurrence(income.id, income.occurrenceIndex || 0, newAmount);
      setIsEditing(false);
      toast({
        title: "Sucesso",
        description: "Receita atualizada com sucesso"
      });
    } catch (error) {
      console.error('Error updating income occurrence:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar receita",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditAmount(income.amount.toString());
    setIsEditing(false);
  };

  const canEdit = true;
  const canDelete = !income.isRecurringOccurrence;

  return (
    <tr className="border-b border-gray-100 dark:border-gray-800">
      <td className="py-3 px-2">
        <div className="flex items-center gap-2">
          {income.description}
          {income.is_recurring && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-xs text-white">↻</span>
              </div>
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                #{(income.occurrenceIndex || 0) + 1}
              </span>
            </div>
          )}
          {(income.isModified || (income.isRecurringOccurrence && income.amount !== income.amount)) && (
            <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-3 w-3" />
              <span>Modificada</span>
            </div>
          )}
        </div>
      </td>
      <td className="py-3 px-2">
        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
          {income.type}
        </span>
      </td>
      <td className="py-3 px-2 font-medium text-green-600 dark:text-green-400">
        {isEditing ? (
          <Input
            type="number"
            step="0.01"
            value={editAmount}
            onChange={(e) => setEditAmount(e.target.value)}
            className="w-24"
            disabled={isLoading}
          />
        ) : (
          formatters.currency(income.amount)
        )}
      </td>
      <td className="py-3 px-2">
        {income.displayDate}
        {income.isRecurringOccurrence && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Original: {formatters.date(income.originalDate)}
          </div>
        )}
      </td>
      <td className="py-3 px-2">
        <div className="flex justify-center gap-2">
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                disabled={isLoading}
                className="h-8 w-8 p-0 text-green-600 dark:text-green-400"
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                disabled={isLoading}
                className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="h-8 w-8 p-0"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteIncome(income.id)}
                  className="h-8 w-8 p-0 text-red-600 dark:text-red-400"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

export default EditableIncomeRow;
