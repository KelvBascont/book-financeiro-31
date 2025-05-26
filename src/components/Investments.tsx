
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, TrendingUp, TrendingDown, DollarSign, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Investments = () => {
  const { toast } = useToast();
  const [showAddInvestment, setShowAddInvestment] = useState(false);
  
  const [investmentForm, setInvestmentForm] = useState({
    ticker: '',
    averagePrice: '',
    quantity: '',
    currentPrice: ''
  });

  const mockInvestments = [
    {
      id: '1',
      ticker: 'MXRF11',
      averagePrice: 10.50,
      quantity: 100,
      currentPrice: 11.80,
      createdAt: '2024-01-15',
      updatedAt: '2024-05-25'
    },
    {
      id: '2',
      ticker: 'SELIC',
      averagePrice: 100.00,
      quantity: 50,
      currentPrice: 108.20,
      createdAt: '2024-02-01',
      updatedAt: '2024-05-25'
    },
    {
      id: '3',
      ticker: 'PETR4',
      averagePrice: 32.45,
      quantity: 200,
      currentPrice: 31.50,
      createdAt: '2024-03-10',
      updatedAt: '2024-05-25'
    },
    {
      id: '4',
      ticker: 'ITUB4',
      averagePrice: 28.90,
      quantity: 150,
      currentPrice: 31.20,
      createdAt: '2024-04-05',
      updatedAt: '2024-05-25'
    }
  ];

  const handleAddInvestment = () => {
    if (!investmentForm.ticker || !investmentForm.averagePrice || !investmentForm.quantity || !investmentForm.currentPrice) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Investimento cadastrado!",
      description: `${investmentForm.ticker} foi adicionado ao seu portfólio`,
    });
    
    setInvestmentForm({ ticker: '', averagePrice: '', quantity: '', currentPrice: '' });
    setShowAddInvestment(false);
  };

  const updatePrice = (investmentId: string) => {
    toast({
      title: "Preço atualizado!",
      description: "O preço atual foi atualizado com sucesso",
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
    
    mockInvestments.forEach(investment => {
      const { invested, currentValue } = calculateGain(
        investment.averagePrice,
        investment.currentPrice,
        investment.quantity
      );
      totalInvested += invested;
      totalCurrent += currentValue;
    });
    
    const totalGain = totalCurrent - totalInvested;
    const totalGainPercentage = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;
    
    return { totalInvested, totalCurrent, totalGain, totalGainPercentage };
  };

  const portfolioSummary = getTotalPortfolio();

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Carteira de Investimentos</h2>
          <p className="text-gray-600 mt-1">Acompanhe a performance dos seus ativos</p>
        </div>
        <Button onClick={() => setShowAddInvestment(!showAddInvestment)} className="bg-blue-500 hover:bg-blue-600">
          <Plus className="h-4 w-4 mr-2" />
          Novo Investimento
        </Button>
      </div>

      {showAddInvestment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Cadastrar Novo Investimento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  value={investmentForm.averagePrice}
                  onChange={(e) => setInvestmentForm({ ...investmentForm, averagePrice: e.target.value })}
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
              <div>
                <Label htmlFor="currentPrice">Preço Atual *</Label>
                <Input
                  id="currentPrice"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={investmentForm.currentPrice}
                  onChange={(e) => setInvestmentForm({ ...investmentForm, currentPrice: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddInvestment(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddInvestment} className="bg-blue-500 hover:bg-blue-600">
                Cadastrar Investimento
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investido</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {portfolioSummary.totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Atual</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {portfolioSummary.totalCurrent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganho/Perda</CardTitle>
            {portfolioSummary.totalGain >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${portfolioSummary.totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {Math.abs(portfolioSummary.totalGain).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rentabilidade</CardTitle>
            {portfolioSummary.totalGainPercentage >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${portfolioSummary.totalGainPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {portfolioSummary.totalGainPercentage >= 0 ? '+' : ''}{portfolioSummary.totalGainPercentage.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Minha Carteira</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockInvestments.map((investment) => {
              const { gain, gainPercentage, invested, currentValue } = calculateGain(
                investment.averagePrice,
                investment.currentPrice,
                investment.quantity
              );
              
              return (
                <div key={investment.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="font-bold text-blue-600 text-sm">{investment.ticker}</span>
                    </div>
                    <div>
                      <p className="font-bold text-lg">{investment.ticker}</p>
                      <p className="text-sm text-gray-600">
                        {investment.quantity} cotas • Preço médio: R$ {investment.averagePrice.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Última atualização: {new Date(investment.updatedAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Preço Atual</p>
                    <p className="font-bold text-lg">R$ {investment.currentPrice.toFixed(2)}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updatePrice(investment.id)}
                      className="mt-1"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Atualizar
                    </Button>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Valor Investido</p>
                    <p className="font-bold">R$ {invested.toFixed(2)}</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Valor Atual</p>
                    <p className="font-bold">R$ {currentValue.toFixed(2)}</p>
                  </div>
                  
                  <div className="text-right">
                    <Badge variant={gain >= 0 ? "default" : "destructive"} className="mb-2">
                      {gain >= 0 ? '+' : ''}R$ {Math.abs(gain).toFixed(2)}
                    </Badge>
                    <p className={`font-bold ${gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {gainPercentage >= 0 ? '+' : ''}{gainPercentage.toFixed(2)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Investments;
