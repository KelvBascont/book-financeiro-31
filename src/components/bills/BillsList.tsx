
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { Bill } from '@/hooks/useBills';
import { useFormatters } from '@/hooks/useFormatters';
import { cn } from '@/lib/utils';

interface BillsListProps {
  bills: Bill[];
  onEdit: (bill: Bill) => void;
  onDelete: (id: string) => void;
  onMarkAsPaid: (id: string) => void;
  onView: (bill: Bill) => void;
}

const BillsList = ({ bills, onEdit, onDelete, onMarkAsPaid, onView }: BillsListProps) => {
  const formatters = useFormatters();
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Pago';
      case 'overdue':
        return 'Vencido';
      case 'pending':
        return 'Pendente';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const filteredBills = bills.filter(bill => {
    if (filter === 'all') return true;
    return bill.status === filter;
  });

  const isOverdue = (dueDate: string, status: string) => {
    return status === 'pending' && new Date(dueDate) < new Date();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          Todas ({bills.length})
        </Button>
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('pending')}
        >
          Pendentes ({bills.filter(b => b.status === 'pending').length})
        </Button>
        <Button
          variant={filter === 'overdue' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('overdue')}
        >
          Vencidas ({bills.filter(b => b.status === 'overdue').length})
        </Button>
        <Button
          variant={filter === 'paid' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('paid')}
        >
          Pagas ({bills.filter(b => b.status === 'paid').length})
        </Button>
      </div>

      <div className="grid gap-4">
        {filteredBills.map((bill) => (
          <Card 
            key={bill.id} 
            className={cn(
              "transition-all hover:shadow-md",
              isOverdue(bill.due_date, bill.status) && "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20"
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{bill.title}</h3>
                    <Badge className={getStatusColor(bill.status)}>
                      {getStatusIcon(bill.status)}
                      <span className="ml-1">{getStatusText(bill.status)}</span>
                    </Badge>
                    {bill.type === 'receivable' && (
                      <Badge variant="outline" className="text-green-600">
                        A Receber
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-medium">{formatters.currency(bill.amount)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Vence: {format(new Date(bill.due_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                    </div>
                    {bill.is_recurring && (
                      <Badge variant="outline" className="text-xs">
                        Recorrente
                      </Badge>
                    )}
                  </div>
                  
                  {bill.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{bill.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onView(bill)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onEdit(bill)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(bill.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {bill.status === 'pending' && (
                    <Button size="sm" onClick={() => onMarkAsPaid(bill.id)}>
                      Marcar como Pago
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredBills.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma conta encontrada</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BillsList;
