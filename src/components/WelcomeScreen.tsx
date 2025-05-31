
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, CreditCard, TrendingDown, TrendingUp, PiggyBank, Car, BarChart3 } from 'lucide-react';

interface WelcomeScreenProps {
  onNavigate: (view: string) => void;
}

const WelcomeScreen = ({ onNavigate }: WelcomeScreenProps) => {
  const features = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Visão geral das suas finanças',
      icon: Home,
      color: 'bg-blue-500'
    },
    {
      id: 'cash-expenses',
      title: 'Despesas',
      description: 'Gerencie suas despesas mensais',
      icon: TrendingDown,
      color: 'bg-red-500'
    },
    {
      id: 'incomes',
      title: 'Receitas',
      description: 'Controle suas fontes de renda',
      icon: TrendingUp,
      color: 'bg-green-500'
    },
    {
      id: 'cards',
      title: 'Cartões',
      description: 'Gestão de cartões de crédito',
      icon: CreditCard,
      color: 'bg-orange-500'
    },
    {
      id: 'investments',
      title: 'Investimentos',
      description: 'Acompanhe sua carteira',
      icon: BarChart3,
      color: 'bg-purple-500'
    },
    {
      id: 'savings',
      title: 'Poupança',
      description: 'Metas de economia',
      icon: PiggyBank,
      color: 'bg-pink-500'
    },
    {
      id: 'vehicles',
      title: 'Veículos',
      description: 'Financiamentos de veículos',
      icon: Car,
      color: 'bg-indigo-500'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Bem-vindo ao Controle Financeiro
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Escolha uma das opções abaixo para começar a gerenciar suas finanças
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <div className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {feature.description}
                </p>
                <Button 
                  onClick={() => onNavigate(feature.id)}
                  className="w-full"
                >
                  Acessar
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default WelcomeScreen;
