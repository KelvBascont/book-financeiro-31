
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFormatters } from '@/hooks/useFormatters';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useCardExpenses } from '@/hooks/useCardExpenses';
import { useFilterRecurringTransactions } from '@/hooks/useFilterRecurringTransactions';
import { useFinancialConsistency } from '@/hooks/useFinancialConsistency';
import { usePrint } from '@/hooks/usePrint';
import { FileSpreadsheet, Printer } from 'lucide-react';

const FinancialSpreadsheet = () => {
  const formatters = useFormatters();
  const { cashExpenses, incomes } = useSupabaseData();
  const { cardExpenses } = useCardExpenses();
  const { calculateRecurringTotal } = useFilterRecurringTransactions();
  const { validateConsistency } = useFinancialConsistency();
  const { printSpreadsheet } = usePrint();

  const generateMonthsData = () => {
    const months = [];
    const currentDate = new Date();
    
    // Gera dados para 12 meses
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      
      // Usar nova lógica de recorrência
      const totalIncomes = calculateRecurringTotal(incomes, date);
      const totalCashExpenses = calculateRecurringTotal(cashExpenses, date);
      
      // Calcular despesas de cartão para o mês específico
      const cardExpensesForMonth = cardExpenses
        .filter(expense => {
          const expenseDate = new Date(expense.billing_month);
          return expenseDate.getMonth() === date.getMonth() && 
                 expenseDate.getFullYear() === date.getFullYear();
        })
        .reduce((sum, expense) => sum + expense.amount, 0);

      const totalExpenses = totalCashExpenses + cardExpensesForMonth;
      const balance = totalIncomes - totalExpenses;
      const percentageLeft = totalIncomes > 0 ? (balance / totalIncomes) * 100 : 0;

      // Validar consistência
      const validation = validateConsistency(date);

      months.push({
        month: date,
        incomes: totalIncomes,
        cashExpenses: totalCashExpenses,
        cardExpenses: cardExpensesForMonth,
        totalExpenses,
        balance,
        percentageLeft,
        validation
      });
    }
    
    return months;
  };

  const monthsData = generateMonthsData();

  const formatMonth = (date: Date) => {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${year}`;
  };

  return (
    <div className="p-3 sm:p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Planilha Financeira</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Visão detalhada de receitas e despesas por mês (com recorrência corrigida)
          </p>
        </div>
        <Button 
          onClick={printSpreadsheet}
          className="bg-blue-500 hover:bg-blue-600"
        >
          <Printer className="h-4 w-4 mr-2" />
          Imprimir Planilha
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            Resumo Mensal Completo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Mês</TableHead>
                  <TableHead className="text-right">Receitas</TableHead>
                  <TableHead className="text-right">Desp. à Vista</TableHead>
                  <TableHead className="text-right">Desp. Cartão</TableHead>
                  <TableHead className="text-right">Total Desp.</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                  <TableHead className="text-right">% Sobra</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthsData.map((monthData, index) => (
                  <TableRow key={index} className={monthData.balance >= 0 ? '' : 'bg-red-50 dark:bg-red-900/20'}>
                    <TableCell className="font-medium">
                      {formatMonth(monthData.month)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {formatters.currency(monthData.incomes)}
                    </TableCell>
                    <TableCell className="text-right text-orange-600">
                      {formatters.currency(monthData.cashExpenses)}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      {formatters.currency(monthData.cardExpenses)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-red-700">
                      {formatters.currency(monthData.totalExpenses)}
                    </TableCell>
                    <TableCell className={`text-right font-bold ${monthData.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatters.currency(monthData.balance)}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${monthData.percentageLeft >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-green-600">Meses Positivos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {monthsData.filter(m => m.balance >= 0).length}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              de {monthsData.length} meses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-blue-600">Média de Sobra</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatters.percentage(
                monthsData.reduce((sum, m) => sum + m.percentageLeft, 0) / monthsData.length
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              em média por mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-purple-600">Maior Sobra</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
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
