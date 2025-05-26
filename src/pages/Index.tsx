
import { useState } from 'react';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Dashboard from '@/components/Dashboard';
import Cards from '@/components/Cards';
import Savings from '@/components/Savings';
import Vehicles from '@/components/Vehicles';
import Investments from '@/components/Investments';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <div className="w-64 flex-shrink-0">
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        <div className="flex-1 overflow-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Index;
