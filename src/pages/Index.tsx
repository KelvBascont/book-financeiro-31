
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Dashboard from '@/components/Dashboard';
import Cards from '@/components/Cards';
import Savings from '@/components/Savings';
import Vehicles from '@/components/Vehicles';
import Investments from '@/components/Investments';
import Income from '@/components/Income';
import CashExpenses from '@/components/CashExpenses';
import { FinancialProvider } from '@/contexts/FinancialContext';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isNavigationVisible, setIsNavigationVisible] = useState(true);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Auto-hide navigation when viewing content (except dashboard)
  useEffect(() => {
    if (activeTab === 'dashboard') {
      setIsNavigationVisible(true);
    } else {
      // Hide navigation after a short delay when switching to other tabs
      const timer = setTimeout(() => {
        setIsNavigationVisible(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  // Show navigation on hover when hidden
  const handleMouseEnter = () => {
    if (!isNavigationVisible) {
      setIsNavigationVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (activeTab !== 'dashboard') {
      const timer = setTimeout(() => {
        setIsNavigationVisible(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'income':
        return <Income />;
      case 'cash-expenses':
        return <CashExpenses />;
      case 'cards':
        return <Cards />;
      case 'savings':
        return <Savings />;
      case 'vehicles':
        return <Vehicles />;
      case 'investments':
        return <Investments />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <FinancialProvider>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
        <Header />
        <div className="flex-1 flex">
          <div 
            className={`transition-all duration-300 ease-in-out hidden lg:block ${
              isNavigationVisible ? 'w-64' : 'w-0 overflow-hidden'
            }`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <Navigation 
              activeTab={activeTab} 
              onTabChange={setActiveTab}
              isVisible={isNavigationVisible}
            />
          </div>
          <div className="flex-1 overflow-auto">
            {renderContent()}
          </div>
          {/* Mobile Navigation */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
            <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </div>

        {/* Floating button to show navigation when hidden */}
        {!isNavigationVisible && activeTab !== 'dashboard' && (
          <button
            onClick={() => setIsNavigationVisible(true)}
            className="fixed left-4 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg z-50 lg:block hidden"
          >
            <BarChart3 className="h-5 w-5" />
          </button>
        )}
      </div>
    </FinancialProvider>
  );
};

export default Index;
