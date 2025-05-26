
import { Bell, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Controle Financeiro</h1>
        <p className="text-sm text-gray-600">Gerencie suas finanças de forma inteligente</p>
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon">
          <User className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
