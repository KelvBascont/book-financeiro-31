
import { useFormatters } from './useFormatters';
import { useFinancial } from '@/contexts/FinancialContext';

export const usePrint = () => {
  const formatters = useFormatters();
  const { getTotalCashExpenses, getTotalIncomes, getBalance } = useFinancial();

  const generatePrintableSpreadsheet = () => {
    const months = [];
    const currentDate = new Date();
    
    // Gera dados para 12 meses
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const totalIncomes = getTotalIncomes(date);
      const totalCashExpenses = getTotalCashExpenses(date);
      const mockCardExpenses = 2500 + (Math.random() * 1000);
      const mockFixedExpenses = 1200;
      const totalExpenses = totalCashExpenses + mockCardExpenses + mockFixedExpenses;
      const balance = totalIncomes - totalExpenses;
      const percentageLeft = totalIncomes > 0 ? (balance / totalIncomes) * 100 : 0;

      months.push({
        month: formatters.dateShort(date),
        incomes: formatters.currency(totalIncomes),
        cashExpenses: formatters.currency(totalCashExpenses),
        cardExpenses: formatters.currency(mockCardExpenses),
        fixedExpenses: formatters.currency(mockFixedExpenses),
        totalExpenses: formatters.currency(totalExpenses),
        balance: formatters.currency(balance),
        percentageLeft: formatters.percentage(percentageLeft),
        balancePositive: balance >= 0
      });
    }
    
    return months;
  };

  const printSpreadsheet = () => {
    const monthsData = generatePrintableSpreadsheet();
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Planilha Financeira</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px;
              color: #333;
            }
            h1 { 
              text-align: center; 
              color: #2563eb;
              margin-bottom: 30px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 20px 0;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 12px; 
              text-align: right;
            }
            th { 
              background-color: #f8f9fa; 
              font-weight: bold;
              color: #495057;
            }
            .month-col { 
              text-align: left;
              font-weight: bold;
            }
            .positive { color: #059669; }
            .negative { 
              color: #dc2626; 
              background-color: #fef2f2;
            }
            .header-incomes { background-color: #d1fae5; }
            .header-cash { background-color: #fef3c7; }
            .header-card { background-color: #fee2e2; }
            .header-fixed { background-color: #e0e7ff; }
            .header-total { background-color: #fecaca; }
            .header-balance { background-color: #d1fae5; }
            .header-percentage { background-color: #e0e7ff; }
            @media print {
              body { margin: 0; }
              table { font-size: 12px; }
            }
          </style>
        </head>
        <body>
          <h1>Planilha Financeira - Controle de Finanças</h1>
          <table>
            <thead>
              <tr>
                <th class="month-col">Mês</th>
                <th class="header-incomes">Receitas</th>
                <th class="header-cash">Desp. à Vista</th>
                <th class="header-card">Desp. Cartão</th>
                <th class="header-fixed">Desp. Fixas</th>
                <th class="header-total">Total Desp.</th>
                <th class="header-balance">Saldo</th>
                <th class="header-percentage">% Sobra</th>
              </tr>
            </thead>
            <tbody>
              ${monthsData.map(row => `
                <tr ${!row.balancePositive ? 'class="negative"' : ''}>
                  <td class="month-col">${row.month}</td>
                  <td class="positive">${row.incomes}</td>
                  <td>${row.cashExpenses}</td>
                  <td>${row.cardExpenses}</td>
                  <td>${row.fixedExpenses}</td>
                  <td>${row.totalExpenses}</td>
                  <td class="${row.balancePositive ? 'positive' : 'negative'}">${row.balance}</td>
                  <td class="${row.balancePositive ? 'positive' : 'negative'}">${row.percentageLeft}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="margin-top: 30px; text-align: center; color: #6b7280; font-size: 12px;">
            Relatório gerado em ${formatters.dateTime(new Date())}
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return { printSpreadsheet, generatePrintableSpreadsheet };
};
