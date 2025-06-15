
import { useState } from 'react';
import { useCashExpenseForm } from '@/hooks/useCashExpenseForm';
import { useCashExpenseOperationsIntegrated } from '@/hooks/useCashExpenseOperationsIntegrated';
import CashExpensesHeader from '@/components/cash-expenses/CashExpensesHeader';
import CashExpensesSummary from '@/components/cash-expenses/CashExpensesSummary';
import CashExpenseForm from '@/components/cash-expenses/CashExpenseForm';
import IntegratedExpensesTable from '@/components/IntegratedExpensesTable';

const CashExpenses = () => {
  const currentMonth = `${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${new Date().getFullYear()}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  
  const {
    showAddExpense,
    setShowAddExpense,
    editingExpense,
    expenseForm,
    setExpenseForm,
    resetForm,
    validateForm,
    setEditingData,
    getFormDataForSubmission
  } = useCashExpenseForm();

  const {
    loading,
    filteredExpenses,
    monthlyTotal,
    handleAddExpense,
    handleUpdateExpense,
    handleDeleteExpense,
    handleUpdateOccurrence
  } = useCashExpenseOperationsIntegrated(selectedMonth);

  const handleFormSubmit = async () => {
    if (!validateForm()) return;
    
    const formData = getFormDataForSubmission();
    
    const result = editingExpense 
      ? await handleUpdateExpense(editingExpense.id, formData)
      : await handleAddExpense(formData);

    if (result) {
      resetForm();
    }
  };

  const handleEditExpense = (expense: any) => {
    // Só permitir edição de cash_expenses, não bills
    if (expense.source === 'cash_expense') {
      setEditingData(expense);
    }
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
      <CashExpensesHeader
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        onAddExpense={() => setShowAddExpense(!showAddExpense)}
      />

      <CashExpensesSummary
        monthlyTotal={monthlyTotal}
        expenseCount={filteredExpenses.length}
      />

      <CashExpenseForm
        isVisible={showAddExpense}
        isEditing={!!editingExpense}
        formData={expenseForm}
        onFormChange={setExpenseForm}
        onSubmit={handleFormSubmit}
        onCancel={resetForm}
      />

      <IntegratedExpensesTable
        expenses={filteredExpenses}
        monthlyTotal={monthlyTotal}
        selectedMonth={selectedMonth}
        onUpdateOccurrence={handleUpdateOccurrence}
        onDeleteExpense={handleDeleteExpense}
        onEditExpense={handleEditExpense}
      />
    </div>
  );
};

export default CashExpenses;
