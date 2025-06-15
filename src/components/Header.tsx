
import { LogOut, User, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationCenter from '@/components/notifications/NotificationCenter';

const Header = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const getUserName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    
    if (user?.email) {
      const emailName = user.email.split('@')[0];
      return emailName
        .replace(/[^a-zA-Z\s]/g, '')
        .split(/[\s_.-]+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ') || 'Usuário';
    }
    
    return 'Usuário';
  };

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
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      
      <div className="flex-1 flex justify-center">
        <h1 className="text-xl font-bold text-primary">App Financeiro</h1>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 relative"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                  {unreadCount}
                </span>
              )}
              <span className="sr-only">Notificações</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-0 max-h-96 overflow-y-auto" align="end">
            <NotificationCenter
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
              onDelete={deleteNotification}
            />
          </PopoverContent>
        </Popover>
        
        <ThemeToggle />
        
        {user && (
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground truncate max-w-32">
                {getUserName()}
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
    </header>
  );
};

export default Header;
