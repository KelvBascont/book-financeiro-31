
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, TrendingUp, TrendingDown, DollarSign, RefreshCw, Activity, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useStockQuote, useSelicRate, useMultipleStockQuotes } from '@/hooks/useMarketData';
import { useSupabaseTables } from '@/hooks/useSupabaseTables';
import { useFormatters } from '@/hooks/useFormatters';
import CrudActions from '@/components/CrudActions';

const Investments = () => {
  const { toast } = useToast();
  const formatters = useFormatters();
  const [showAddInvestment, setShowAddInvestment] = useState(false);
  
  const {
    investments,
    addInvestment,
    deleteInvestment,
    loading
  } = useSupabaseTables();
  
  const [investmentForm, setInvestmentForm] = useState({
    ticker: '',
    average_price: '',
    quantity: '',
  });

  const tickers = investments.map(inv => inv.ticker);
  const { data: stockQuotes, isLoading: quotesLoading, refetch: refetchQuotes } = useMultipleStockQuotes(tickers);
  const { data: selicData, isLoading: selicLoading } = useSelicRate();

  const handleAddInvestment = async () => {
    if (!investmentForm.ticker || !investmentForm.average_price || !investmentForm.quantity) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    const result = await addInvestment({
      ticker: investmentForm.ticker.toUpperCase(),
      average_price: parseFloat(investmentForm.average_price),
      quantity: parseInt(investmentForm.quantity),
      current_price: 0
    });

    if (result) {
      setInvestmentForm({ ticker: '', average_price: '', quantity: '' });
      setShowAddInvestment(false);
    }
  };

  const handleDeleteInvestment = async (id: string) => {
    await deleteInvestment(id);
  };

  const updatePrices = () => {
    refetchQuotes();
    toast({
      title: "Preços atualizados!",
      description: "Todas as cotações foram atualizadas",
    });
  };

  const calculateGain = (averagePrice: number, currentPrice: number, quantity: number) => {
    const invested = averagePrice * quantity;
    const currentValue = currentPrice * quantity;
    const gain = currentValue - invested;
    const gainPercentage = ((currentPrice - averagePrice) / averagePrice) * 100;
    
    return { gain, gainPercentage, invested, currentValue };
  };

  const getTotalPortfolio = () => {
    let totalInvested = 0;
    let totalCurrent = 0;
    
    investments.forEach(investment => {
      const quote = stockQuotes?.find(q => q.symbol === investment.ticker);
      if (quote) {
        const { invested, currentValue } = calculateGain(
          investment.average_price,
          quote.regularMarketPrice,
          investment.quantity
        );
        totalInvested += invested;
        totalCurrent += currentValue;
      }
    });
    
    const totalGain = totalCurrent - totalInvested;
    const totalGainPercentage = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;
    
    return { totalInvested, totalCurrent, totalGain, totalGainPercentage };
  };

  const portfolioSummary = getTotalPortfolio();

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Carteira de Investimentos</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Acompanhe a performance dos seus ativos</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={updatePrices} 
            variant="outline" 
            className="w-full sm:w-auto"
            disabled={quotesLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${quotesLoading ? 'animate-spin' : ''}`} />
            Atualizar Preços
          </Button>
          <Button 
            onClick={() => setShowAddInvestment(!showAddInvestment)} 
            className="bg-blue-500 hover:bg-blue-600 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Investimento
          </Button>
        </div>
      </div>

      {/* Taxa SELIC */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Taxa SELIC</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Taxa básica de juros</p>
              </div>
            </div>
            <div className="text-right">
              {selicLoading ? (
                <Skeleton className="h-6 w-16" />
              ) : (
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {selicData ? `${selicData.value.toFixed(2)}%` : 'N/A'}
                </p>
              )}
              {selicData && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatters.date(selicData.date)}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {showAddInvestment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Cadastrar Novo Investimento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="ticker">Ticker/Código *</Label>
                <Input
                  id="ticker"
                  placeholder="Ex: PETR4, MXRF11"
                  value={investmentForm.ticker}
                  onChange={(e) => setInvestmentForm({ ...investmentForm, ticker: e.target.value.toUpperCase() })}
                />
              </div>
              <div>
                <Label htmlFor="averagePrice">Preço Médio *</Label>
                <Input
                  id="averagePrice"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={investmentForm.average_price}
                  onChange={(e) => setInvestmentForm({ ...investmentForm, average_price: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="quantity">Quantidade *</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="0"
                  value={investmentForm.quantity}
                  onChange={(e) => setInvestmentForm({ ...investmentForm, quantity: e.target.value })}
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddInvestment(false)} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button onClick={handleAddInvestment} className="bg-blue-500 hover:bg-blue-600 w-full sm:w-auto">
                Cadastrar Investimento
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumo do Portfólio */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Investido</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">
              {formatters.currencyCompact(portfolioSummary.totalInvested)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Valor Atual</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">
              {formatters.currencyCompact(portfolioSummary.totalCurrent)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Ganho/Perda</CardTitle>
            {portfolioSummary.totalGain >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-lg sm:text-2xl font-bold ${portfolioSummary.totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {portfolioSummary.totalGain >= 0 ? '+' : ''}{formatters.currencyCompact(portfolioSummary.totalGain)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Rentabilidade</CardTitle>
            {portfolioSummary.totalGainPercentage >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-lg sm:text-2xl font-bold ${portfolioSummary.totalGainPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {portfolioSummary.totalGainPercentage >= 0 ? '+' : ''}{formatters.percentage(portfolioSummary.totalGainPercentage)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Investimentos */}
      <Card>
        <CardHeader>
          <CardTitle>Minha Carteira</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {investments.map((investment) => {
              const quote = stockQuotes?.find(q => q.symbol === investment.ticker);
              
              if (quotesLoading) {
                return (
                  <div key={investment.id} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                );
              }

              if (!quote) {
                return (
                  <div key={investment.id} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="font-bold text-gray-500 text-sm">{investment.ticker}</span>
                        </div>
                        <div>
                          <p className="font-bold text-lg">{investment.ticker}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {formatters.number(investment.quantity)} cotas • Preço médio: {formatters.currency(investment.average_price)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Sem dados</Badge>
                        <CrudActions
                          item={investment}
                          onDelete={() => handleDeleteInvestment(investment.id)}
                          showEdit={false}
                          showView={false}
                          deleteTitle="Confirmar remoção"
                          deleteDescription="Tem certeza que deseja remover este investimento?"
                        />
                      </div>
                    </div>
                  </div>
                );
              }

              const { gain, gainPercentage, invested, currentValue } = calculateGain(
                investment.average_price,
                quote.regularMarketPrice,
                investment.quantity
              );
              
              return (
                <div key={investment.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">{investment.ticker}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-lg truncate">{quote.shortName || investment.ticker}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {formatters.number(investment.quantity)} cotas • Preço médio: {formatters.currency(investment.average_price)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Atual: {formatters.currency(quote.regularMarketPrice)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                      <div className="text-center sm:text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-300">Investido</p>
                        <p className="font-bold">{formatters.currency(invested)}</p>
                      </div>
                      
                      <div className="text-center sm:text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-300">Valor Atual</p>
                        <p className="font-bold">{formatters.currency(currentValue)}</p>
                      </div>
                      
                      <div className="text-center sm:text-right">
                        <Badge variant={gain >= 0 ? "default" : "destructive"} className="mb-2">
                          {gain >= 0 ? '+' : ''}{formatters.currency(Math.abs(gain))}
                        </Badge>
                        <p className={`font-bold text-sm ${gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {gainPercentage >= 0 ? '+' : ''}{formatters.percentage(gainPercentage)}
                        </p>
                      </div>

                      <CrudActions
                        item={investment}
                        onDelete={() => handleDeleteInvestment(investment.id)}
                        showEdit={false}
                        showView={false}
                        deleteTitle="Confirmar remoção"
                        deleteDescription="Tem certeza que deseja remover este investimento?"
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {investments.length === 0 && (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Nenhum investimento cadastrado</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Clique em "Novo Investimento" para começar</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Investments;
