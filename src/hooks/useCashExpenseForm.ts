
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ExpenseFormData {
  description: string;
  amount: string;
  date: string;
  due_date: string;
  is_recurring: boolean;
  recurrence_months: string;
  category_id: string;
}

export const useCashExpenseForm = () => {
  const { toast } = useToast();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  
  const [expenseForm, setExpenseForm] = useState<ExpenseFormData>({
    description: '',
    amount: '',
    date: '',
    due_date: '',
    is_recurring: false,
    recurrence_months: '',
    category_id: ''
  });

  const resetForm = () => {
    setExpenseForm({ 
      description: '', 
      amount: '', 
      date: '', 
      due_date: '', 
      is_recurring: false, 
      recurrence_months: '',
      category_id: ''
    });
    setShowAddExpense(false);
    setEditingExpense(null);
  };

  const validateForm = (): boolean => {
    if (!expenseForm.description || !expenseForm.amount || !expenseForm.date || !expenseForm.due_date) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const setEditingData = (expense: any) => {
    setEditingExpense(expense);
    setExpenseForm({
      description: expense.description,
      amount: expense.amount.toString(),
      date: expense.date,
      due_date: expense.due_date,
      is_recurring: expense.is_recurring,
      recurrence_months: expense.recurrence_months?.toString() || '',
      category_id: expense.category_id || ''
    });
    setShowAddExpense(true);
  };

  const getFormDataForSubmission = () => ({
    description: expenseForm.description,
    amount: parseFloat(expenseForm.amount),
    date: expenseForm.date,
    due_date: expenseForm.due_date,
    is_recurring: expenseForm.is_recurring,
    recurrence_months: expenseForm.is_recurring ? parseInt(expenseForm.recurrence_months) : undefined,
    category_id: expenseForm.category_id || undefined
  });

  return {
    showAddExpense,
    setShowAddExpense,
    editingExpense,
    expenseForm,
    setExpenseForm,
    resetForm,
    validateForm,
    setEditingData,
    getFormDataForSubmission
  };
};
