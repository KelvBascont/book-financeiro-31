
import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Header = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao realizar logout",
        variant: "destructive"
      });
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">FinanceApp</h1>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />
          
          {user && (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-32">
                  {user.email}
                </span>
              </div>
              
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 sm:gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
