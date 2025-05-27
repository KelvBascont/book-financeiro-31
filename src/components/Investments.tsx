import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Plus, RefreshCw } from 'lucide-react';
import { useSelicRate, useMultipleStockQuotes } from '@/hooks/useMarketData';
import { useFormatters } from '@/hooks/useFormatters';

import SelicCard from './investments/SelicCard';
import InvestmentForm from './investments/InvestmentForm';
import PortfolioSummary from './investments/PortfolioSummary';
import InvestmentList from './investments/InvestmentList';

interface InvestmentData {
  id: string;
  ticker: string;
  average_price: number;
  quantity: number;
  user_id: string;
  created_at: string;
}

interface InvestmentFormState {
  ticker: string;
  averagePrice: string;
  quantity: string;
}

const Investments = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const formatters = useFormatters();
  const [showAddInvestment, setShowAddInvestment] = useState(false);
  
  const [investmentForm, setInvestmentForm] = useState<InvestmentFormState>({
    ticker: '',
    averagePrice: '',
    quantity: '',
  });

  const [investments, setInvestments] = useState<InvestmentData[]>([]);

  const fetchInvestments = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) {
      toast({ title: "Erro", description: "Erro ao carregar investimentos", variant: "destructive" });
    } else {
      setInvestments(data as InvestmentData[] || []);
    }
  };

  const handleAddInvestment = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado.",
        variant: "destructive"
      });
      return;
    }
    if (!investmentForm.ticker || !investmentForm.averagePrice || !investmentForm.quantity) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    const { error } = await supabase.from('investments').insert([{
      ticker: investmentForm.ticker.toUpperCase(),
      average_price: Number(investmentForm.averagePrice),
      quantity: Number(investmentForm.quantity),
      user_id: user.id 
    }]);

    if (error) {
      toast({ title: "Erro", description: `Erro ao adicionar investimento: ${error.message}`, variant: "destructive" });
    } else {
      toast({
        title: "Investimento cadastrado!",
        description: `${investmentForm.ticker.toUpperCase()} foi adicionado ao seu portfólio`,
      });
      
      setInvestmentForm({ ticker: '', averagePrice: '', quantity: '' });
      setShowAddInvestment(false);
      fetchInvestments(); 
    }
  };

  const tickers = investments.map(inv => inv.ticker);
  const { data: stockQuotes, isLoading: quotesLoading, refetch: refetchQuotes } = useMultipleStockQuotes(tickers);
  const { data: selicData, isLoading: selicLoading } = useSelicRate();

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
    const gainPercentage = averagePrice !== 0 ? ((currentPrice - averagePrice) / averagePrice) * 100 : 0;
    
    return { gain, gainPercentage, invested, currentValue };
  };

  const getTotalPortfolio = () => {
    let totalInvested = 0;
    let totalCurrent = 0;
    
    investments.forEach(investment => {
      if (investment.ticker && typeof investment.average_price === 'number' && typeof investment.quantity === 'number') {
        const quote = stockQuotes?.find(q => q.symbol === investment.ticker);
        if (quote && typeof quote.regularMarketPrice === 'number') {
          const { invested, currentValue } = calculateGain(
            investment.average_price,
            quote.regularMarketPrice,
            investment.quantity
          );
          totalInvested += invested;
          totalCurrent += currentValue;
        } else if (!quote) { 
          totalInvested += investment.average_price * investment.quantity;
          totalCurrent += investment.average_price * investment.quantity;
        }
      }
    });
    
    const totalGain = totalCurrent - totalInvested;
    const totalGainPercentage = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;
    
    return { totalInvested, totalCurrent, totalGain, totalGainPercentage };
  };

  const portfolioSummary = getTotalPortfolio();

  useEffect(() => { 
    if (user) { 
      fetchInvestments(); 
    }
  }, [user]); 

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
            disabled={quotesLoading || tickers.length === 0}
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

      <SelicCard selicData={selicData} selicLoading={selicLoading} formatters={formatters} />

      {showAddInvestment && (
        <InvestmentForm
          investmentForm={investmentForm}
          setInvestmentForm={setInvestmentForm}
          handleAddInvestment={handleAddInvestment}
          setShowAddInvestment={setShowAddInvestment}
        />
      )}

      <PortfolioSummary portfolioSummary={portfolioSummary} formatters={formatters} />
      
      <InvestmentList
        investments={investments}
        stockQuotes={stockQuotes}
        quotesLoading={quotesLoading}
        formatters={formatters}
        calculateGain={calculateGain}
      />
    </div>
  );
};

export default Investments;
