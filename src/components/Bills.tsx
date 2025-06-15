
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, DollarSign, TrendingUp, AlertTriangle, Bell } from 'lucide-react';
import { useBills } from '@/hooks/useBills';
import { useNotifications } from '@/hooks/useNotifications';
import { useFormatters } from '@/hooks/useFormatters';
import BillForm from './bills/BillForm';
import BillsList from './bills/BillsList';
import NotificationCenter from './notifications/NotificationCenter';

const Bills = () => {
  const { bills, loading, createBill, updateBill, deleteBill, markAsPaid } = useBills();
  const { 
    notifications, 
    unreadCount,
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();
  const formatters = useFormatters();
  
  const [showForm, setShowForm] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [viewingBill, setViewingBill] = useState(null);

  const handleSubmit = async (data) => {
    try {
      if (editingBill) {
        await updateBill(editingBill.id, data);
      } else {
        await createBill(data);
      }
      setShowForm(false);
      setEditingBill(null);
    } catch (error) {
      console.error('Error saving bill:', error);
    }
  };

  const handleEdit = (bill) => {
    setEditingBill(bill);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Tem certeza que deseja excluir esta conta?')) {
      await deleteBill(id);
    }
  };

  // Calcular estatísticas
  const totalPayable = bills
    .filter(b => b.type === 'payable' && b.status === 'pending')
    .reduce((sum, b) => sum + b.amount, 0);

  const totalReceivable = bills
    .filter(b => b.type === 'receivable' && b.status === 'pending')
    .reduce((sum, b) => sum + b.amount, 0);

  const overdueBills = bills.filter(b => 
    b.status === 'overdue' || 
    (b.status === 'pending' && new Date(b.due_date) < new Date())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando contas...</p>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            {editingBill ? 'Editar Conta' : 'Nova Conta'}
          </h1>
        </div>
        
        <BillForm
          bill={editingBill}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingBill(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Contas a Pagar/Receber</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Conta
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">A Pagar</p>
                <p className="text-lg font-semibold text-red-600">
                  {formatters.currency(totalPayable)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">A Receber</p>
                <p className="text-lg font-semibold text-green-600">
                  {formatters.currency(totalReceivable)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Vencidas</p>
                <p className="text-lg font-semibold text-orange-600">
                  {overdueBills.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Notificações</p>
                <p className="text-lg font-semibold text-blue-600">
                  {unreadCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principais */}
      <Tabs defaultValue="bills" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bills">Contas</TabsTrigger>
          <TabsTrigger value="notifications" className="relative">
            Notificações
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bills">
          <BillsList
            bills={bills}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onMarkAsPaid={markAsPaid}
            onView={setViewingBill}
          />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationCenter
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onDelete={deleteNotification}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Bills;
