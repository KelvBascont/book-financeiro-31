
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Home, CreditCard, TrendingDown, TrendingUp, PiggyBank, Car, BarChart3, Menu, LogOut, FileSpreadsheet, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const Navigation = React.memo(({ currentView, onViewChange }: NavigationProps) => {
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, color: 'text-blue-600 dark:text-blue-400' },
    { id: 'cash-expenses', label: 'Despesas', icon: TrendingDown, color: 'text-red-600 dark:text-red-400' },
    { id: 'incomes', label: 'Receitas', icon: TrendingUp, color: 'text-green-600 dark:text-green-400' },
    { id: 'cards', label: 'Cartões', icon: CreditCard, color: 'text-orange-600 dark:text-orange-400' },
    { id: 'spreadsheet', label: 'Planilhas', icon: FileSpreadsheet, color: 'text-teal-600 dark:text-teal-400' },
    { id: 'investments', label: 'Investimentos', icon: BarChart3, color: 'text-purple-600 dark:text-purple-400' },
    { id: 'savings', label: 'Poupança', icon: PiggyBank, color: 'text-indigo-600 dark:text-indigo-400' },
    { id: 'vehicles', label: 'Veículos', icon: Car, color: 'text-pink-600 dark:text-pink-400' },
  ];

  const handleItemClick = React.useCallback((itemId: string) => {
    onViewChange(itemId);
    setOpen(false);
  }, [onViewChange]);

  const handleSignOut = React.useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error during signout:', error);
    }
  }, [signOut]);

  const NavItems = React.memo(({ collapsed = false }: { collapsed?: boolean }) => (
    <>
      {navigationItems.map((item) => {
        const Icon = item.icon;
        return (
          <Button
            key={item.id}
            variant={currentView === item.id ? "default" : "ghost"}
            className={`
              ${collapsed ? 'w-12 h-12 p-0' : 'w-full justify-start'} 
              transition-all duration-200 group
              ${currentView === item.id 
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }
              rounded-lg
            `}
            onClick={() => handleItemClick(item.id)}
            title={collapsed ? item.label : undefined}
          >
            <Icon className={`
              ${collapsed ? 'h-5 w-5' : 'mr-3 h-4 w-4'} 
              transition-transform group-hover:scale-110
              ${currentView === item.id ? 'text-white' : (collapsed ? item.color : '')}
            `} />
            {!collapsed && <span className="font-medium">{item.label}</span>}
          </Button>
        );
      })}
      <div className={`${collapsed ? 'space-y-2' : 'mt-auto pt-4 space-y-2'}`}>
        <div className={collapsed ? 'flex justify-center' : ''}>
          <ThemeToggle />
        </div>
        <Button
          variant="ghost"
          className={`
            ${collapsed ? 'w-12 h-12 p-0' : 'w-full justify-start'} 
            text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20
            transition-all duration-200
            rounded-lg
          `}
          onClick={handleSignOut}
          title={collapsed ? 'Sair' : undefined}
        >
          <LogOut className={`${collapsed ? 'h-5 w-5' : 'mr-3 h-4 w-4'} text-red-600 dark:text-red-400`} />
          {!collapsed && <span className="font-medium">Sair</span>}
        </Button>
      </div>
    </>
  ));

  return (
    <>
      {/* Desktop Navigation */}
      <div className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 transition-all duration-300 ${isCollapsed ? 'md:w-20' : 'md:w-64'}`}>
        <div className="flex-1 flex flex-col min-h-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-r border-gray-200/50 dark:border-gray-700/50 shadow-lg">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
              {!isCollapsed && (
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Controle Financeiro
                </h1>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
              >
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
            </div>
            <nav className={`mt-5 flex-1 ${isCollapsed ? 'px-2 space-y-2' : 'px-2 space-y-1'}`}>
              <NavItems collapsed={isCollapsed} />
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="flex items-center justify-between p-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Controle Financeiro
          </h1>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
              <nav className="flex flex-col space-y-2 mt-6">
                <NavItems />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
});

Navigation.displayName = 'Navigation';

export default Navigation;
