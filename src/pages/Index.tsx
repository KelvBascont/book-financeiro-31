
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import Navigation from '@/components/Navigation';
import Dashboard from '@/components/Dashboard';
import CashExpenses from '@/components/CashExpenses';
import Income from '@/components/Income';
import Cards from '@/components/Cards';
import Investments from '@/components/Investments';
import Savings from '@/components/Savings';
import Vehicles from '@/components/Vehicles';

const Index = () => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'cash-expenses':
        return <CashExpenses />;
      case 'incomes':
        return <Income />;
      case 'cards':
        return <Cards />;
      case 'investments':
        return <Investments />;
      case 'savings':
        return <Savings />;
      case 'vehicles':
        return <Vehicles />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      
      {/* Main content */}
      <div className="md:pl-64">
        <main className="flex-1">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
};

export default Index;
