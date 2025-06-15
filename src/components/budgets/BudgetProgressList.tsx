
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Edit2, Trash2, Check, X } from 'lucide-react';
import { BudgetProgress } from '@/hooks/useBudgetProgress';
import { BudgetAlert } from '@/hooks/useMonthlyBudgets';

interface BudgetProgressListProps {
  budgetProgress: BudgetProgress[];
  alerts: BudgetAlert[];
  onUpdateBudget: (id: string, updates: any) => Promise<any>;
  onDeleteBudget: (id: string) => Promise<void>;
}

const BudgetProgressList = ({ 
  budgetProgress, 
  alerts, 
  onUpdateBudget, 
  onDeleteBudget 
}: BudgetProgressListProps) => {
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleEdit = (categoryId: string, currentLimit: number) => {
    setEditingBudget(categoryId);
    setEditValue(currentLimit.toString());
  };

  const handleSaveEdit = async (categoryId: string) => {
    const newLimit = parseFloat(editValue);
    if (newLimit > 0) {
      await onUpdateBudget(categoryId, { budget_limit: newLimit });
    }
    setEditingBudget(null);
  };

  const handleCancelEdit = () => {
    setEditingBudget(null);
    setEditValue('');
  };

  const getAlertForCategory = (categoryId: string) => {
    return alerts.find(alert => alert.category_id === categoryId);
  };

  const shouldShowAlert = (progress: BudgetProgress) => {
    const alert = getAlertForCategory(progress.categoryId);
    if (!alert || !alert.is_enabled) return false;
    return progress.percentage >= alert.alert_threshold;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-4">
      {budgetProgress.map((progress) => {
        const isEditing = editingBudget === progress.categoryId;
        const showAlert = shouldShowAlert(progress);
        const alert = getAlertForCategory(progress.categoryId);

        return (
          <div key={progress.categoryId} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{progress.categoryName}</h3>
                {showAlert && (
                  <div className="flex items-center gap-1 text-amber-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-xs">
                      {alert?.alert_threshold}% atingido
                    </span>
                  </div>
                )}
                {progress.isOverBudget && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                    Orçamento excedido
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Input
                      type="number"
                      step="0.01"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-24 h-8"
                    />
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleSaveEdit(progress.categoryId)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={handleCancelEdit}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleEdit(progress.categoryId, progress.budgetLimit)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => onDeleteBudget(progress.categoryId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  Gasto: {formatCurrency(progress.spent)} de {formatCurrency(progress.budgetLimit)}
                </span>
                <span className={progress.isOverBudget ? 'text-red-600' : 'text-gray-600'}>
                  {progress.percentage.toFixed(1)}%
                </span>
              </div>
              
              <Progress 
                value={Math.min(progress.percentage, 100)} 
                className={`h-2 ${progress.isOverBudget ? 'bg-red-100' : ''}`}
              />
              
              <div className="text-xs text-gray-500">
                {progress.remaining >= 0 ? (
                  <>Restante: {formatCurrency(progress.remaining)}</>
                ) : (
                  <span className="text-red-600">
                    Excesso: {formatCurrency(Math.abs(progress.remaining))}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BudgetProgressList;
