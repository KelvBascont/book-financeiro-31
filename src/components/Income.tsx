
import { useState } from 'react';
import { useIncomeOperationsIntegrated } from '@/hooks/useIncomeOperationsIntegrated';
import { useBills } from '@/hooks/useBills';
import { useToast } from '@/hooks/use-toast';
import { useIncomeOperationsIntegrated } from '@/hooks/useIncomeOperationsIntegrated';
import BillForm from '@/components/bills/BillForm';
import IncomeHeader from '@/components/income/IncomeHeader';
import IncomeSummary from '@/components/income/IncomeSummary';
import IncomeForm from '@/components/income/IncomeForm';
import IncomeTable from '@/components/income/IncomeTable';
import type { Income } from '@/hooks/useIncomes';

const Income = () => {
  const { toast } = useToast();
  
  const currentMonth = `${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${new Date().getFullYear()}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [showBillForm, setShowBillForm] = useState(false);
  
  const {
    loading,
    filteredIncomes,
    monthlyTotal,
    handleAddIncome,
    handleUpdateIncome,
    handleDeleteIncome,
    handleUpdateOccurrence
  } = useIncomeOperationsIntegrated(selectedMonth);
  
  const { createBill } = useBills();
  
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [incomeForm, setIncomeForm] = useState({
    description: '',
    amount: '',
    date: '',
    type: 'other' as 'salary' | 'bonus' | 'investment' | 'other',
    is_recurring: false,
    recurrence_months: '',
    category_id: ''
  });

  const resetForm = () => {
    setIncomeForm({
      description: '',
      amount: '',
      date: '',
      type: 'other',
      is_recurring: false,
      recurrence_months: '',
      category_id: ''
    });
    setShowAddIncome(false);
    setEditingIncome(null);
  };

  const validateForm = () => {
    if (!incomeForm.description || !incomeForm.amount || !incomeForm.date) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    const formData = {
      description: incomeForm.description,
      amount: parseFloat(incomeForm.amount),
      date: incomeForm.date,
      type: incomeForm.type,
      is_recurring: incomeForm.is_recurring,
      recurrence_months: incomeForm.is_recurring ? parseInt(incomeForm.recurrence_months) : undefined,
      category_id: incomeForm.category_id || null
    };
    const result = editingIncome ? await handleUpdateIncome(editingIncome.id, formData) : await handleAddIncome(formData);
    if (result) {
      resetForm();
    }
  };

  const handleEditIncome = (income: any) => {
    if (!income.isRecurringOccurrence) {
      setEditingIncome(income);
      setIncomeForm({
        description: income.description,
        amount: income.amount.toString(),
        date: income.date,
        type: income.type,
        is_recurring: income.is_recurring,
        recurrence_months: income.recurrence_months?.toString() || '',
        category_id: income.category_id || ''
      });
      setShowAddIncome(true);
    }
  };

  const handleBillSubmit = async (billData: any) => {
    try {
      await createBill(billData);
      setShowBillForm(false);
    } catch (error) {
      console.error('Erro ao criar conta:', error);
    }
  };

  const handleAddIncomeClick = () => {
    setShowBillForm(true);
  };

  const handleFormChange = (field: string, value: any) => {
    setIncomeForm(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <IncomeHeader 
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        onAddIncome={handleAddIncomeClick}
      />

      <IncomeSummary 
        monthlyTotal={monthlyTotal}
        incomeCount={filteredIncomes.length}
      />

      <IncomeForm 
        showAddIncome={showAddIncome}
        editingIncome={editingIncome}
        incomeForm={incomeForm}
        onFormChange={handleFormChange}
        onSubmit={handleSubmit}
        onCancel={resetForm}
      />

      {showBillForm && (
        <BillForm
          onSubmit={handleBillSubmit}
          onCancel={() => setShowBillForm(false)}
          initialType="receivable"
          typeDisabled={true}
        />
      )}

      <IncomeTable 
        filteredIncomes={filteredIncomes}
        monthlyTotal={monthlyTotal}
        selectedMonth={selectedMonth}
        onUpdateOccurrence={handleUpdateOccurrence}
        onDeleteIncome={handleDeleteIncome}
        onEditIncome={handleEditIncome}
      />
    </div>
  );
};

export default Income;
