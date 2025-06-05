
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useFormatters } from '@/hooks/useFormatters';
import { Edit2, Save, X, AlertCircle } from 'lucide-react';
import { type FilteredRecurrentTransaction } from '@/hooks/useRecurrenceFilter';

interface EditableOccurrenceRowProps {
  transaction: FilteredRecurrentTransaction;
  onUpdateOccurrence: (id: string, occurrenceIndex: number, newAmount: number) => Promise<void>;
  onDeleteTransaction: (id: string) => Promise<void>;
}

const EditableOccurrenceRow = ({ 
  transaction, 
  onUpdateOccurrence, 
  onDeleteTransaction 
}: EditableOccurrenceRowProps) => {
  const { toast } = useToast();
  const formatters = useFormatters();
  const [isEditing, setIsEditing] = useState(false);
  const [editAmount, setEditAmount] = useState(transaction.amount.toString());
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
      // Para todas as ocorrências (incluindo recorrentes), vamos criar/atualizar uma entrada específica
      await onUpdateOccurrence(transaction.id, transaction.occurrenceIndex || 0, newAmount);
      setIsEditing(false);
      toast({
        title: "Sucesso",
        description: "Ocorrência atualizada com sucesso"
      });
    } catch (error) {
      console.error('Error updating occurrence:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar ocorrência",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditAmount(transaction.amount.toString());
    setIsEditing(false);
  };

  // Permitir edição de todas as ocorrências agora
  const canEdit = true;
  const canDelete = !transaction.isRecurringOccurrence; // Só pode deletar a transação original

  return (
    <tr className="border-b border-gray-100 dark:border-gray-800">
      <td className="py-3 px-2">
        <div className="flex items-center gap-2">
          {transaction.description}
          {transaction.is_recurring && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-xs text-white">↻</span>
              </div>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                #{(transaction.occurrenceIndex || 0) + 1}/{transaction.recurrence_months}
              </span>
            </div>
          )}
          {(transaction.isModified || (transaction.isRecurringOccurrence && transaction.amount !== transaction.amount)) && (
            <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-3 w-3" />
              <span>Modificada</span>
            </div>
          )}
        </div>
      </td>
      <td className="py-3 px-2 font-medium text-red-600 dark:text-red-400">
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
          formatters.currency(transaction.amount)
        )}
      </td>
      <td className="py-3 px-2">
        <div className="text-sm">
          <div className="font-medium">
            {transaction.displayDate}
          </div>
          {transaction.isRecurringOccurrence && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Original: {formatters.date(transaction.originalDate)}
            </div>
          )}
        </div>
      </td>
      <td className="py-3 px-2">
        <div className="text-sm">
          {transaction.due_date && (
            <div className="font-medium text-orange-600 dark:text-orange-400">
              {formatters.date(transaction.due_date)}
            </div>
          )}
          {transaction.is_recurring && transaction.due_date && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Parcela {(transaction.occurrenceIndex || 0) + 1}
            </div>
          )}
        </div>
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
                  onClick={() => onDeleteTransaction(transaction.id)}
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

export default EditableOccurrenceRow;
