
import { CreditCard, Target, Car, TrendingUp, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'cards', label: 'Cartões', icon: CreditCard },
    { id: 'savings', label: 'Reservas/Metas', icon: Target },
    { id: 'vehicles', label: 'Veículos', icon: Car },
    { id: 'investments', label: 'Investimentos', icon: TrendingUp },
  ];

  return (
    <nav className="bg-gradient-to-b from-blue-900 to-blue-800 text-white p-6">
      <div className="space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left',
                activeTab === tab.id
                  ? 'bg-white text-blue-900 shadow-lg'
                  : 'hover:bg-blue-700 text-blue-100'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
