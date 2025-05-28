
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  Target, 
  Car, 
  BarChart3,
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFormatters } from '@/hooks/useFormatters';

interface WelcomeScreenProps {
  onComplete: () => void;
}

const WelcomeScreen = ({ onComplete }: WelcomeScreenProps) => {
  const { user } = useAuth();
  const formatters = useFormatters();
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  // Extrair nome do usuário do email ou metadata
  const getUserName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    
    if (user?.email) {
      // Extrair nome do email (parte antes do @)
      const emailName = user.email.split('@')[0];
      // Capitalizar primeira letra e remover números/caracteres especiais
      return emailName
        .replace(/[^a-zA-Z\s]/g, '')
        .split(/[\s_.-]+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ') || 'Usuário';
    }
    
    return 'Usuário';
  };

  const features = [
    {
      icon: BarChart3,
      title: 'Dashboard Completo',
      description: 'Visualize todos os seus dados financeiros em um só lugar',
      color: 'text-blue-600'
    },
    {
      icon: DollarSign,
      title: 'Gestão de Receitas',
      description: 'Controle suas fontes de renda e receitas recorrentes',
      color: 'text-green-600'
    },
    {
      icon: CreditCard,
      title: 'Cartões de Crédito',
      description: 'Monitore gastos e vencimentos dos seus cartões',
      color: 'text-orange-600'
    },
    {
      icon: Target,
      title: 'Metas e Reservas',
      description: 'Defina objetivos financeiros e acompanhe seu progresso',
      color: 'text-purple-600'
    },
    {
      icon: TrendingUp,
      title: 'Investimentos',
      description: 'Acompanhe sua carteira de investimentos em tempo real',
      color: 'text-indigo-600'
    },
    {
      icon: Car,
      title: 'Financiamentos',
      description: 'Controle parcelas de veículos e outros financiamentos',
      color: 'text-red-600'
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (currentStep < features.length) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [currentStep, features.length]);

  const handleGetStarted = () => {
    // Marcar como visualizado no localStorage
    localStorage.setItem('finance_app_welcome_seen', 'true');
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header de Boas-vindas */}
        <div className={`text-center mb-12 transition-all duration-1000 ${isAnimating ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'}`}>
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full">
              <Sparkles className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Bem-vindo, {getUserName()}! 👋
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Sua jornada para uma <span className="font-semibold text-blue-600 dark:text-blue-400">gestão financeira inteligente</span> começa agora!
          </p>
          
          <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            Logado como: <span className="font-medium">{user?.email}</span>
          </div>
        </div>

        {/* Grid de Funcionalidades */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isVisible = currentStep > index;
            
            return (
              <Card 
                key={index}
                className={`relative overflow-hidden transition-all duration-700 hover:shadow-lg hover:scale-105 ${
                  isVisible 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 ${feature.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                    
                    {isVisible && (
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 animate-pulse" />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className={`text-center transition-all duration-1000 delay-1000 ${
          currentStep >= features.length ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 text-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">
                Pronto para começar?
              </h2>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Todas as ferramentas estão configuradas e prontas para uso. 
                Comece organizando suas finanças de forma inteligente e eficiente!
              </p>
              
              <Button 
                onClick={handleGetStarted}
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-3 group"
              >
                Iniciar Jornada Financeira
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <div className="mt-4 text-sm text-blue-100">
                ✨ Atualizações automáticas • 📊 Dados em tempo real • 🔒 Totalmente seguro
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
