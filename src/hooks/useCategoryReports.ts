
import { useState, useEffect, useMemo } from 'react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useCardExpenses } from '@/hooks/useCardExpenses';
import { useCategories } from '@/hooks/useCategories';
import { useRecurrenceFilter } from '@/hooks/useRecurrenceFilter';
import { format, startOfYear, endOfYear, eachMonthOfInterval } from 'date-fns';

export interface CategoryReportData {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryType: 'income' | 'expense';
  totalAmount: number;
  monthlyData: {
    month: string;
    amount: number;
  }[];
  transactionCount: number;
  percentage: number;
}

export const useCategoryReports = () => {
  const { cashExpenses, incomes, loading: dataLoading } = useSupabaseData();
  const { cardExpenses, loading: cardLoading } = useCardExpenses();
  const { categories } = useCategories();
  const { calculateTotalForMonth } = useRecurrenceFilter();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'year'>('year');

  const reportData = useMemo(() => {
    if (!categories.length) return [];

    const yearStart = startOfYear(new Date(selectedYear, 0, 1));
    const yearEnd = endOfYear(new Date(selectedYear, 0, 1));
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

    // Calcular totais por categoria
    const categoryData: Record<string, CategoryReportData> = {};

    // Inicializar todas as categorias
    categories.forEach(category => {
      categoryData[category.id] = {
        categoryId: category.id,
        categoryName: category.name,
        categoryColor: category.color || '#6B7280',
        categoryType: category.type as 'income' | 'expense',
        totalAmount: 0,
        monthlyData: months.map(month => ({
          month: format(month, 'MMM'),
          amount: 0
        })),
        transactionCount: 0,
        percentage: 0
      };
    });

    // Processar despesas correntes
    cashExpenses.forEach(expense => {
      if (expense.category_id && categoryData[expense.category_id]) {
        const expenseYear = new Date(expense.date).getFullYear();
        if (expenseYear === selectedYear) {
          categoryData[expense.category_id].totalAmount += expense.amount;
          categoryData[expense.category_id].transactionCount += 1;

          // Adicionar aos dados mensais
          const monthIndex = new Date(expense.date).getMonth();
          if (categoryData[expense.category_id].monthlyData[monthIndex]) {
            categoryData[expense.category_id].monthlyData[monthIndex].amount += expense.amount;
          }
        }
      }
    });

    // Processar despesas de cartão (verificar se category_id existe na resposta)
    cardExpenses.forEach(expense => {
      // Como category_id pode não existir no tipo CardExpense, usamos any temporariamente
      const expenseWithCategory = expense as any;
      if (expenseWithCategory.category_id && categoryData[expenseWithCategory.category_id]) {
        const expenseYear = new Date(expense.billing_month).getFullYear();
        if (expenseYear === selectedYear) {
          categoryData[expenseWithCategory.category_id].totalAmount += expense.amount;
          categoryData[expenseWithCategory.category_id].transactionCount += 1;

          // Adicionar aos dados mensais
          const monthIndex = new Date(expense.billing_month).getMonth();
          if (categoryData[expenseWithCategory.category_id].monthlyData[monthIndex]) {
            categoryData[expenseWithCategory.category_id].monthlyData[monthIndex].amount += expense.amount;
          }
        }
      }
    });

    // Processar receitas (verificar se category_id existe na resposta)
    incomes.forEach(income => {
      // Como category_id pode não existir no tipo Income, usamos any temporariamente
      const incomeWithCategory = income as any;
      if (incomeWithCategory.category_id && categoryData[incomeWithCategory.category_id]) {
        const incomeYear = new Date(income.date).getFullYear();
        if (incomeYear === selectedYear) {
          categoryData[incomeWithCategory.category_id].totalAmount += income.amount;
          categoryData[incomeWithCategory.category_id].transactionCount += 1;

          // Adicionar aos dados mensais
          const monthIndex = new Date(income.date).getMonth();
          if (categoryData[incomeWithCategory.category_id].monthlyData[monthIndex]) {
            categoryData[incomeWithCategory.category_id].monthlyData[monthIndex].amount += income.amount;
          }
        }
      }
    });

    // Calcular percentuais
    const expenseCategories = Object.values(categoryData).filter(cat => cat.categoryType === 'expense');
    const incomeCategories = Object.values(categoryData).filter(cat => cat.categoryType === 'income');

    const totalExpenses = expenseCategories.reduce((sum, cat) => sum + Math.abs(cat.totalAmount), 0);
    const totalIncomes = incomeCategories.reduce((sum, cat) => sum + cat.totalAmount, 0);

    expenseCategories.forEach(category => {
      if (totalExpenses > 0) {
        category.percentage = (Math.abs(category.totalAmount) / totalExpenses) * 100;
      }
    });

    incomeCategories.forEach(category => {
      if (totalIncomes > 0) {
        category.percentage = (category.totalAmount / totalIncomes) * 100;
      }
    });

    return Object.values(categoryData).filter(cat => cat.totalAmount !== 0 || cat.transactionCount > 0);
  }, [categories, cashExpenses, cardExpenses, incomes, selectedYear]);

  const summary = useMemo(() => {
    const expenseData = reportData.filter(cat => cat.categoryType === 'expense');
    const incomeData = reportData.filter(cat => cat.categoryType === 'income');

    return {
      totalExpenses: expenseData.reduce((sum, cat) => sum + Math.abs(cat.totalAmount), 0),
      totalIncomes: incomeData.reduce((sum, cat) => sum + cat.totalAmount, 0),
      expenseCategoriesCount: expenseData.length,
      incomeCategoriesCount: incomeData.length,
      mostExpensiveCategory: expenseData.sort((a, b) => Math.abs(b.totalAmount) - Math.abs(a.totalAmount))[0],
      highestIncomeCategory: incomeData.sort((a, b) => b.totalAmount - a.totalAmount)[0]
    };
  }, [reportData]);

  const loading = dataLoading || cardLoading;

  return {
    reportData,
    summary,
    loading,
    selectedYear,
    setSelectedYear,
    selectedPeriod,
    setSelectedPeriod
  };
};
