
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign,
  Check,
  Trash2,
  Settings
} from 'lucide-react';
import type { Notification } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

interface NotificationCenterProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
}

const NotificationCenter = ({ 
  notifications, 
  unreadCount, 
  onMarkAsRead, 
  onMarkAllAsRead, 
  onDelete 
}: NotificationCenterProps) => {
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'bill_reminder':
        return <Bell className="h-5 w-5 text-blue-500" />;
      case 'bill_overdue':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'payment_received':
        return <DollarSign className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'bill_reminder':
        return 'Lembrete';
      case 'bill_overdue':
        return 'Vencido';
      case 'payment_received':
        return 'Pagamento';
      case 'system':
        return 'Sistema';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bill_reminder':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'bill_overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'payment_received':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Central de Notificações
            </CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount}</Badge>
            )}
          </div>
          
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={onMarkAllAsRead}>
                <CheckCircle className="h-4 w-4 mr-1" />
                Marcar Todas
              </Button>
            )}
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma notificação</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                "p-4 border rounded-lg transition-colors",
                !notification.is_read 
                  ? "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800" 
                  : "bg-white dark:bg-gray-800"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{notification.title}</h4>
                    <Badge className={getTypeColor(notification.type)}>
                      {getTypeLabel(notification.type)}
                    </Badge>
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    {notification.message}
                  </p>
                  
                  <p className="text-xs text-gray-500">
                    {format(new Date(notification.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </p>
                </div>
                
                <div className="flex items-center gap-1">
                  {!notification.is_read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onMarkAsRead(notification.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(notification.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationCenter;
