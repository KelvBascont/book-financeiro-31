import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, TrendingUp, TrendingDown, DollarSign, Percent, RefreshCw, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseTables } from '@/hooks/useSupabaseTables';
import { useFormatters } from '@/hooks/useFormatters';
import { useMultipleStockQuotes } from '@/hooks/useMarketData';
import CrudActions from '@/components/CrudActions';

const Investments = () => {
  const { toast } = useToast();
  const formatters = useFormatters();
  const [showAddInvestment, setShowAddInvestment] = useState(false);
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false);
  
  const {
    investments,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    loading
  } = useSupabaseTables();

  const tickers = [...new Set(investments.map(inv => inv.ticker))];
  const { data: stockQuotes } = useMultipleStockQuotes(tickers);
  
  const [investmentForm, setInvestmentForm] = useState({
    ticker: '',
    quantity: '',
    average_price: ''
  });

  const handleAddInvestment = async () => {
    if (!investmentForm.ticker || !investmentForm.quantity || !investmentForm.average_price) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios!",
        variant: "destructive"
      });
      return;
    }
    
    const result = await addInvestment({
      ticker: investmentForm.ticker.toUpperCase(),
      quantity: parseInt(investmentForm.quantity),
      average_price: parseFloat(investmentForm.average_price),
      current_price: parseFloat(investmentForm.average_price) // Inicialmente igual ao preço médio
    });

    if (result) {
      setInvestmentForm({ ticker: '', quantity: '', average_price: '' });
      setShowAddInvestment(false);
    }
  };

  const handleDeleteInvestment = async (id: string) => {
    await deleteInvestment(id);
  };

  const handleUpdatePrices = async () => {
    setIsUpdatingPrices(true);
    try {
      if (!stockQuotes || stockQuotes.length === 0) {
        toast({
          title: "Erro",
          description: "Não foi possível obter as cotações. Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      // Criar um mapa de preços por ticker
      const priceMap: Record<string, number> = {};
      stockQuotes.forEach(quote => {
        priceMap[quote.symbol] = quote.regularMarketPrice;
      });
      
      // Atualizar cada investimento com o novo preço e timestamp
      for (const investment of investments) {
        const newPrice = priceMap[investment.ticker];
        if (newPrice !== undefined) {
          await updateInvestment(investment.id, {
            current_price: newPrice,
            last_manual_update: new Date().toISOString()
          });
        }
      }
      
      toast({
        title: "Sucesso",
        description: "Preços atualizados com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao atualizar preços:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar preços. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingPrices(false);
    }
  };

  const calculateTotals = () => {
    const totalInvested = investments.reduce((sum, inv) => sum + (inv.quantity * inv.average_price), 0);
    const currentValue = investments.reduce((sum, inv) => sum + (inv.quantity * inv.current_price), 0);
    const totalGainLoss = currentValue - totalInvested;
    const totalGainLossPercentage = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;
    
    return {
      totalInvested,
      currentValue,
      totalGainLoss,
      totalGainLossPercentage
    };
  };

  const getLastUpdateInfo = () => {
    const lastUpdates = investments
      .filter(inv => inv.last_manual_update)
      .map(inv => new Date(inv.last_manual_update!))
      .sort((a, b) => b.getTime() - a.getTime());
    
    return lastUpdates.length > 0 ? lastUpdates[0] : null;
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

  const totals = calculateTotals();
  const lastUpdate = getLastUpdateInfo();

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Carteira de Investimentos</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Acompanhe seus investimentos em ações</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={handleUpdatePrices} 
            disabled={isUpdatingPrices || investments.length === 0}
            variant="outline" 
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isUpdatingPrices ? 'animate-spin' : ''}`} />
            {isUpdatingPrices ? 'Atualizando...' : 'Atualizar Preços'}
          </Button>
          <Button onClick={() => setShowAddInvestment(!showAddInvestment)} className="bg-blue-500 hover:bg-blue-600 w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Novo Investimento
          </Button>
        </div>
      </div>

      {/* Última atualização manual */}
      {lastUpdate && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800 dark:text-blue-200">
                Última atualização manual: {formatters.dateTime(lastUpdate)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumo da carteira */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Total Investido</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatters.currency(totals.totalInvested)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Valor Atual</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatters.currency(totals.currentValue)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Ganho/Perda</p>
                <p className={`text-2xl font-bold ${
                  totals.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatters.currency(Math.abs(totals.totalGainLoss))}
                </p>
              </div>
              {totals.totalGainLoss >= 0 ? (
                <TrendingUp className="h-8 w-8 text-green-500" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Rentabilidade</p>
                <p className={`text-2xl font-bold ${
                  totals.totalGainLossPercentage >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {totals.totalGainLossPercentage >= 0 ? '+' : ''}{formatters.percentage(totals.totalGainLossPercentage)}
                </p>
              </div>
              <Percent className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {showAddInvestment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Adicionar Novo Investimento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="ticker">Ticker *</Label>
                <Input
                  id="ticker"
                  placeholder="Ex: PETR4, VALE3..."
                  value={investmentForm.ticker}
                  onChange={(e) => setInvestmentForm({ ...investmentForm, ticker: e.target.value.toUpperCase() })}
                />
              </div>
              <div>
                <Label htmlFor="quantity">Quantidade *</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="100"
                  value={investmentForm.quantity}
                  onChange={(e) => setInvestmentForm({ ...investmentForm, quantity: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="averagePrice">Preço Médio *</Label>
                <Input
                  id="averagePrice"
                  type="number"
                  step="0.01"
                  placeholder="25,50"
                  value={investmentForm.average_price}
                  onChange={(e) => setInvestmentForm({ ...investmentForm, average_price: e.target.value })}
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddInvestment(false)} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button onClick={handleAddInvestment} className="bg-blue-500 hover:bg-blue-600 w-full sm:w-auto">
                Adicionar Investimento
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Posições em Carteira</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {investments.map((investment) => {
                const totalInvested = investment.quantity * investment.average_price;
                const currentValue = investment.quantity * investment.current_price;
                const gainLoss = currentValue - totalInvested;
                const gainLossPercentage = totalInvested > 0 ? (gainLoss / totalInvested) * 100 : 0;
                
                return (
                  <div key={investment.id} className="p-4 border rounded-lg bg-white dark:bg-gray-800">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg">{investment.ticker}</h3>
                            <Badge className={gainLoss >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {gainLoss >= 0 ? '+' : ''}{formatters.percentage(gainLossPercentage)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {investment.quantity} ações • Preço médio: {formatters.currency(investment.average_price)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Preço Atual</p>
                          <p className="font-bold">{formatters.currency(investment.current_price)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Total Investido</p>
                          <p className="font-bold">{formatters.currency(totalInvested)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Valor Atual</p>
                          <p className="font-bold">{formatters.currency(currentValue)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Ganho/Perda</p>
                          <p className={`font-bold ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {gainLoss >= 0 ? '+' : ''}{formatters.currency(Math.abs(gainLoss))}
                          </p>
                        </div>
                      </div>
                      
                      <CrudActions
                        item={investment}
                        onDelete={() => handleDeleteInvestment(investment.id)}
                        showEdit={false}
                        showView={false}
                        deleteTitle="Confirmar exclusão"
                        deleteDescription="Esta ação não pode ser desfeita. O investimento será permanentemente removido."
                      />
                    </div>
                  </div>
                );
              })}
              
              {investments.length === 0 && (
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Nenhum investimento cadastrado</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Clique em "Novo Investimento" para começar</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Investments;
