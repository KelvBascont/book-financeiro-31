
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFormatters } from '@/hooks/useFormatters';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useCardExpenses } from '@/hooks/useCardExpenses';
import { useRecurrenceFilter } from '@/hooks/useRecurrenceFilter';
import { usePrint } from '@/hooks/usePrint';
import DateRangeFilter from '@/components/DateRangeFilter';
import { FileSpreadsheet, Printer } from 'lucide-react';
import { format, eachMonthOfInterval, addMonths, parse, isWithinInterval } from 'date-fns';

const FinancialSpreadsheet = () => {
  const formatters = useFormatters();
  const [dateFilter, setDateFilter] = useState<{ start: string; end: string } | null>(null);
  const { cashExpenses, incomes } = useSupabaseData();
  const { cardExpenses } = useCardExpenses();
  const { calculateTotalForMonth } = useRecurrenceFilter();
  const { printSpreadsheet } = usePrint();

  const generateMonthsData = () => {
    const currentDate = new Date();
    let startDate = currentDate;
    let endDate = addMonths(currentDate, 11);

    // If filter is active, use filter dates
    if (dateFilter) {
      startDate = parse(dateFilter.start, 'yyyy-MM', new Date());
      endDate = parse(dateFilter.end, 'yyyy-MM', new Date());
    }
    
    // Generate months for the period
    const monthsToGenerate = eachMonthOfInterval({
      start: startDate,
      end: endDate
    });
    
    const months = [];
    
    monthsToGenerate.forEach(date => {
      const monthString = format(date, 'MM/yyyy');
      
      // Use recurring logic from hook
      const totalIncomes = calculateTotalForMonth(incomes, monthString);
      const totalCashExpenses = calculateTotalForMonth(cashExpenses, monthString);
      
      // Calculate card expenses for specific month
      const cardExpensesForMonth = cardExpenses
        .filter(expense => {
          const expenseMonth = format(new Date(expense.billing_month), 'MM/yyyy');
          return expenseMonth === monthString;
        })
        .reduce((sum, expense) => sum + expense.amount, 0);

      const totalExpenses = totalCashExpenses + cardExpensesForMonth;
      const balance = totalIncomes - totalExpenses;
      const percentageLeft = totalIncomes > 0 ? (balance / totalIncomes) * 100 : 0;

      months.push({
        month: date,
        incomes: totalIncomes,
        cashExpenses: totalCashExpenses,
        cardExpenses: cardExpensesForMonth,
        totalExpenses,
        balance,
        percentageLeft
      });
    });
    
    return months;
  };

  const monthsData = useMemo(() => generateMonthsData(), [dateFilter, incomes, cashExpenses, cardExpenses, calculateTotalForMonth]);

  const handleFilterChange = (startDate: string, endDate: string) => {
    setDateFilter({ start: startDate, end: endDate });
  };

  const handleClearFilter = () => {
    setDateFilter(null);
  };

  const formatMonth = (date: Date) => {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${year}`;
  };

  const getFilterPeriodText = () => {
    if (!dateFilter) return "Próximos 12 meses";
    return `Período: ${dateFilter.start} a ${dateFilter.end}`;
  };

  return (
    <div className="p-3 sm:p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Planilha Financeira</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Visão detalhada de receitas e despesas por mês
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <DateRangeFilter
            onFilterChange={handleFilterChange}
            onClearFilter={handleClearFilter}
            isActive={!!dateFilter}
          />
          <Button 
            onClick={printSpreadsheet}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimir Planilha
          </Button>
        </div>
      </div>

      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            Resumo Mensal Completo - {getFilterPeriodText()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24 text-gray-900 dark:text-white">Mês</TableHead>
                  <TableHead className="text-right text-gray-900 dark:text-white">Receitas</TableHead>
                  <TableHead className="text-right text-gray-900 dark:text-white">Desp. à Vista</TableHead>
                  <TableHead className="text-right text-gray-900 dark:text-white">Desp. Cartão</TableHead>
                  <TableHead className="text-right text-gray-900 dark:text-white">Total Desp.</TableHead>
                  <TableHead className="text-right text-gray-900 dark:text-white">Saldo</TableHead>
                  <TableHead className="text-right text-gray-900 dark:text-white">% Sobra</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthsData.map((monthData, index) => (
                  <TableRow 
                    key={index} 
                    className={`${monthData.balance >= 0 ? 'bg-white dark:bg-gray-800' : 'bg-red-50 dark:bg-red-900/20'} border-gray-200 dark:border-gray-700`}
                  >
                    <TableCell className="font-medium text-gray-900 dark:text-white">
                      {formatMonth(monthData.month)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600 dark:text-green-400">
                      {formatters.currency(monthData.incomes)}
                    </TableCell>
                    <TableCell className="text-right text-orange-600 dark:text-orange-400">
                      {formatters.currency(monthData.cashExpenses)}
                    </TableCell>
                    <TableCell className="text-right text-red-600 dark:text-red-400">
                      {formatters.currency(monthData.cardExpenses)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-red-700 dark:text-red-500">
                      {formatters.currency(monthData.totalExpenses)}
                    </TableCell>
                    <TableCell className={`text-right font-bold ${monthData.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatters.currency(monthData.balance)}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${monthData.percentageLeft >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatters.percentage(monthData.percentageLeft)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg text-green-600 dark:text-green-400">Meses Positivos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {monthsData.filter(m => m.balance >= 0).length}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              de {monthsData.length} meses
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg text-blue-600 dark:text-blue-400">Média de Sobra</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatters.percentage(
                monthsData.reduce((sum, m) => sum + m.percentageLeft, 0) / monthsData.length
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              em média por mês
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg text-purple-600 dark:text-purple-400">Maior Sobra</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {formatters.currency(Math.max(...monthsData.map(m => m.balance)))}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              melhor mês
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialSpreadsheet;
