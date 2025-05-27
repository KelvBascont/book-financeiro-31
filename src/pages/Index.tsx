
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

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <div className="w-64 flex-shrink-0 hidden lg:block">
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        <div className="flex-1 overflow-auto">
          {renderContent()}
        </div>
        {/* Mobile Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>
    </div>
  );
};

export default Index;
