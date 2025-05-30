
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, TrendingUp, TrendingDown, DollarSign, Percent, RefreshCw, Clock, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseTables } from '@/hooks/useSupabaseTables';
import { useFormatters } from '@/hooks/useFormatters';
import { useStockQuote } from '@/hooks/useMarketData';

const Investments = () => {
  const { toast } = useToast();
  const formatters = useFormatters();
  const [showAddInvestment, setShowAddInvestment] = useState(false);
  const [showEditInvestment, setShowEditInvestment] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<any>(null);
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false);
  const [updatingIndividual, setUpdatingIndividual] = useState<string | null>(null);
  
  const {
    investments,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    loading
  } = useSupabaseTables();
  
  const [investmentForm, setInvestmentForm] = useState({
    ticker: '',
    quantity: '',
    average_price: ''
  });

  const [editForm, setEditForm] = useState({
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
      current_price: parseFloat(investmentForm.average_price)
    });

    if (result) {
      setInvestmentForm({ ticker: '', quantity: '', average_price: '' });
      setShowAddInvestment(false);
    }
  };

  const handleEditInvestment = async () => {
    if (!editForm.ticker || !editForm.quantity || !editForm.average_price) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios!",
        variant: "destructive"
      });
      return;
    }
    
    const result = await updateInvestment(editingInvestment.id, {
      ticker: editForm.ticker.toUpperCase(),
      quantity: parseInt(editForm.quantity),
      average_price: parseFloat(editForm.average_price)
    });

    if (result) {
      setShowEditInvestment(false);
      setEditingInvestment(null);
      setEditForm({ ticker: '', quantity: '', average_price: '' });
    }
  };

  const handleDeleteInvestment = async (id: string) => {
    await deleteInvestment(id);
  };

  const openEditModal = (investment: any) => {
    setEditingInvestment(investment);
    setEditForm({
      ticker: investment.ticker,
      quantity: investment.quantity.toString(),
      average_price: investment.average_price.toString()
    });
    setShowEditInvestment(true);
  };

  const handleUpdateAllPrices = async () => {
    setIsUpdatingPrices(true);
    try {
      const tickers = [...new Set(investments.map(inv => inv.ticker))];
      
      for (let i = 0; i < tickers.length; i++) {
        const ticker = tickers[i];
        
        try {
          const response = await fetch(
            `https://brapi.dev/api/quote/${ticker}?token=sgJcY993z7C8YKSiehjj8g`
          );
          
          if (response.ok) {
            const data = await response.json();
            const quote = data.results?.[0];
            
            if (quote && quote.regularMarketPrice) {
              // Atualizar todos os investimentos com este ticker
              const investmentsToUpdate = investments.filter(inv => inv.ticker === ticker);
              
              for (const investment of investmentsToUpdate) {
                await updateInvestment(investment.id, {
                  current_price: quote.regularMarketPrice,
                  last_manual_update: new Date().toISOString()
                });
              }
            }
          }
        } catch (error) {
          console.error(`Erro ao atualizar ${ticker}:`, error);
        }
        
        // Delay de 500ms entre requests
        if (i < tickers.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
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

  const handleUpdateIndividualPrice = async (investment: any) => {
    setUpdatingIndividual(investment.id);
    try {
      const response = await fetch(
        `https://brapi.dev/api/quote/${investment.ticker}?token=sgJcY993z7C8YKSiehjj8g`
      );
      
      if (!response.ok) {
        throw new Error('Erro ao buscar cotação');
      }
      
      const data = await response.json();
      const quote = data.results?.[0];
      
      if (quote && quote.regularMarketPrice) {
        await updateInvestment(investment.id, {
          current_price: quote.regularMarketPrice,
          last_manual_update: new Date().toISOString()
        });
        
        toast({
          title: "Sucesso",
          description: `Preço do ${investment.ticker} atualizado!`
        });
      } else {
        throw new Error('Cotação não encontrada');
      }
    } catch (error) {
      console.error('Erro ao atualizar preço individual:', error);
      toast({
        title: "Erro",
        description: `Erro ao atualizar preço do ${investment.ticker}`,
        variant: "destructive"
      });
    } finally {
      setUpdatingIndividual(null);
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
    <TooltipProvider>
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Carteira de Investimentos</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Acompanhe seus investimentos em ações</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={handleUpdateAllPrices} 
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
                        
                        <div className="flex gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditModal(investment)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Editar investimento</p>
                            </TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                onClick={() => handleUpdateIndividualPrice(investment)}
                                disabled={updatingIndividual === investment.id}
                              >
                                <RefreshCw className={`h-4 w-4 ${updatingIndividual === investment.id ? 'animate-spin' : ''}`} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Atualizar preço</p>
                            </TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteInvestment(investment.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Excluir investimento</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
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

        {/* Dialog para editar investimento */}
        <Dialog open={showEditInvestment} onOpenChange={setShowEditInvestment}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Investimento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="editTicker">Ticker *</Label>
                <Input
                  id="editTicker"
                  placeholder="Ex: PETR4, VALE3..."
                  value={editForm.ticker}
                  onChange={(e) => setEditForm({ ...editForm, ticker: e.target.value.toUpperCase() })}
                />
              </div>
              <div>
                <Label htmlFor="editQuantity">Quantidade *</Label>
                <Input
                  id="editQuantity"
                  type="number"
                  placeholder="100"
                  value={editForm.quantity}
                  onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editAveragePrice">Preço Médio *</Label>
                <Input
                  id="editAveragePrice"
                  type="number"
                  step="0.01"
                  placeholder="25,50"
                  value={editForm.average_price}
                  onChange={(e) => setEditForm({ ...editForm, average_price: e.target.value })}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowEditInvestment(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleEditInvestment} className="bg-blue-500 hover:bg-blue-600">
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default Investments;
