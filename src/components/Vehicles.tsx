import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Car, Calendar, DollarSign, TrendingUp, CheckCircle, Circle, Eye, Clock, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseTables } from '@/hooks/useSupabaseTables';
import { useFormatters } from '@/hooks/useFormatters';
import CrudActions from '@/components/CrudActions';

const Vehicles = () => {
  const { toast } = useToast();
  const formatters = useFormatters();
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [showPayments, setShowPayments] = useState(false);
  
  const {
    vehicles,
    vehiclePayments,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    updateVehiclePayment,
    loading
  } = useSupabaseTables();
  
  const [vehicleForm, setVehicleForm] = useState({
    description: '',
    total_amount: '',
    total_amountii: '',
    installments: '',
    start_date: '',
    installment_value: '',
    paid_installments: '0'
  });

  const handleAddVehicle = async () => {
    if (!vehicleForm.description || !vehicleForm.total_amount || !vehicleForm.total_amountii || !vehicleForm.installments || !vehicleForm.start_date) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    const totalAmount = parseFloat(vehicleForm.total_amount);
    const totalAmountii = parseFloat(vehicleForm.total_amountii);
    const installments = parseInt(vehicleForm.installments);
    const installmentValue = totalAmount / installments;
    const paidInstallments = parseInt(vehicleForm.paid_installments) || 0;
    
    const result = await addVehicle({
      description: vehicleForm.description,
      total_amount: totalAmount,
      total_amountii: totalAmountii,
      installments: installments,
      start_date: vehicleForm.start_date,
      installment_value: installmentValue,
      paid_installments: paidInstallments
    });

    if (result) {
      setVehicleForm({ 
        description: '', 
        total_amount: '', 
        total_amountii: '',
        installments: '', 
        start_date: '', 
        installment_value: '',
        paid_installments: '0'
      });
      setShowAddVehicle(false);
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    await deleteVehicle(id);
  };

  const updatePaidInstallments = async (vehicleId: string, newPaidInstallments: number) => {
    await updateVehicle(vehicleId, { paid_installments: newPaidInstallments });
  };

  const markPaymentAsPaid = async (paymentId: string, vehicleId: string) => {
    const payment = vehiclePayments.find(p => p.id === paymentId);
    if (!payment) return;

    await updateVehiclePayment(paymentId, {
      is_paid: true,
      paid_date: new Date().toISOString().split('T')[0]
    });

    // Atualizar o veículo também
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      const paidCount = vehiclePayments.filter(p => 
        p.vehicle_id === vehicleId && (p.is_paid || p.id === paymentId)
      ).length;
      await updateVehicle(vehicleId, { paid_installments: paidCount });
    }
  };

  const calculateProgress = (vehicle: any) => {
    const paidInstallments = vehicle.paid_installments || 0;
    const totalInstallments = vehicle.installments;
    const progress = (paidInstallments / totalInstallments) * 100;
    const remainingAmount = (totalInstallments - paidInstallments) * vehicle.installment_value;
    const paidAmount = paidInstallments * vehicle.installment_value;
    
    return {
      paidInstallments,
      progress,
      remainingAmount,
      paidAmount,
      isCompleted: paidInstallments >= totalInstallments
    };
  };

  const getUpcomingPayments = () => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    return vehiclePayments
      .filter(payment => {
        const dueDate = new Date(payment.due_date);
        return !payment.is_paid && dueDate >= today && dueDate <= thirtyDaysFromNow;
      })
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
      .slice(0, 5);
  };

  const getVehiclePayments = (vehicleId: string) => {
    return vehiclePayments
      .filter(payment => payment.vehicle_id === vehicleId)
      .sort((a, b) => a.installment_number - b.installment_number);
  };

  const getNextPayment = (vehicleId: string) => {
    const payments = getVehiclePayments(vehicleId);
    return payments.find(payment => !payment.is_paid);
  };

  const getTotalInvested = () => {
    return vehicles.reduce((total, vehicle) => {
      const { paidAmount } = calculateProgress(vehicle);
      return total + paidAmount;
    }, 0);
  };

  const getTotalRemaining = () => {
    return vehicles.reduce((total, vehicle) => {
      const { remainingAmount } = calculateProgress(vehicle);
      return total + remainingAmount;
    }, 0);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  const upcomingPayments = getUpcomingPayments();

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Gestão de Veículos</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Controle seus financiamentos e parcelas</p>
        </div>
        <Button onClick={() => setShowAddVehicle(!showAddVehicle)} className="bg-purple-500 hover:bg-purple-600 w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Novo Financiamento
        </Button>
      </div>

      {/* Resumo dos financiamentos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Total Pago</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatters.currencyCompact(getTotalInvested())}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Valor Restante</p>
                <p className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">
                  {formatters.currencyCompact(getTotalRemaining())}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Veículos Ativos</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{vehicles.length}</p>
              </div>
              <Car className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Parcelas próximas ao vencimento */}
      {upcomingPayments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Parcelas Próximas ao Vencimento (30 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingPayments.map((payment) => {
                const vehicle = vehicles.find(v => v.id === payment.vehicle_id);
                const daysUntilDue = Math.ceil((new Date(payment.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg bg-orange-50 dark:bg-orange-900/20">
                    <div>
                      <p className="font-medium">{vehicle?.description}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Parcela {payment.installment_number} - Vence em {daysUntilDue} dias ({formatters.date(payment.due_date)})
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{formatters.currency(vehicle?.installment_value || 0)}</p>
                      <Button
                        size="sm"
                        onClick={() => markPaymentAsPaid(payment.id, payment.vehicle_id)}
                        className="mt-1"
                      >
                        Marcar como Pago
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {showAddVehicle && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Cadastrar Novo Financiamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              <div>
                <Label htmlFor="description">Descrição *</Label>
                <Input
                  id="description"
                  placeholder="Ex: Honda Civic 2023"
                  value={vehicleForm.description}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="totalAmountii">Valor do Bem *</Label>
                <Input
                  id="totalAmountii"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={vehicleForm.total_amountii}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, total_amountii: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="totalAmount">Valor Financiado *</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={vehicleForm.total_amount}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, total_amount: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="installments">Número de Parcelas *</Label>
                <Input
                  id="installments"
                  type="number"
                  placeholder="Ex: 60"
                  value={vehicleForm.installments}
                  onChange={(e) => {
                    const installments = parseInt(e.target.value) || 0;
                    const totalAmount = parseFloat(vehicleForm.total_amount) || 0;
                    const installmentValue = installments > 0 ? (totalAmount / installments).toFixed(2) : '';
                    
                    setVehicleForm({ 
                      ...vehicleForm, 
                      installments: e.target.value,
                      installment_value: installmentValue
                    });
                  }}
                />
              </div>
              <div>
                <Label htmlFor="paidInstallments">Parcelas Pagas</Label>
                <Input
                  id="paidInstallments"
                  type="number"
                  min="0"
                  placeholder="Ex: 12"
                  value={vehicleForm.paid_installments}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, paid_installments: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="startDate">Data de Início *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={vehicleForm.start_date}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, start_date: e.target.value })}
                />
              </div>
            </div>
            
            {vehicleForm.installment_value && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Valor da parcela:</strong> {formatters.currency(parseFloat(vehicleForm.installment_value))}
                </p>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddVehicle(false)} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button onClick={handleAddVehicle} className="bg-purple-500 hover:bg-purple-600 w-full sm:w-auto">
                Cadastrar Financiamento
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {vehicles.map((vehicle) => {
          const { paidInstallments, progress, remainingAmount, paidAmount, isCompleted } = calculateProgress(vehicle);
          const nextPayment = getNextPayment(vehicle.id);
          
          return (
            <Card key={vehicle.id} className="relative overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-purple-600" />
                    <span className="truncate">{vehicle.description}</span>
                    {isCompleted && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Quitado
                      </Badge>
                    )}
                  </CardTitle>
                  <CrudActions
                    item={vehicle}
                    onDelete={() => handleDeleteVehicle(vehicle.id)}
                    showEdit={false}
                    showView={false}
                    deleteTitle="Confirmar exclusão"
                    deleteDescription="Esta ação não pode ser desfeita. O veículo será permanentemente removido."
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-300">Valor do Bem</p>
                    <p className="font-bold">{formatters.currency(vehicle.total_amountii || 0)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-300">Valor Financiado</p>
                    <p className="font-bold">{formatters.currency(vehicle.total_amount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-300">Parcela</p>
                    <p className="font-bold">{formatters.currency(vehicle.installment_value)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-300">Pago</p>
                    <p className="font-bold text-green-600">{formatters.currency(paidAmount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-300">Restante</p>
                    <p className="font-bold text-red-600">{formatters.currency(remainingAmount)}</p>
                  </div>
                </div>

                {/* Próximo vencimento */}
                {nextPayment && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium">Próximo Vencimento</span>
                      </div>
                      <span className="text-sm font-bold">
                        Parcela {nextPayment.installment_number} - {formatters.date(nextPayment.due_date)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedVehicle(vehicle);
                      setShowPayments(true);
                    }}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Todas as Parcelas
                  </Button>
                  
                  {!isCompleted && nextPayment && (
                    <Button
                      size="sm"
                      onClick={() => markPaymentAsPaid(nextPayment.id, vehicle.id)}
                      className="flex-1"
                    >
                      Dar Baixa
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Início do financiamento</span>
                  </div>
                  <span className="text-sm font-bold">
                    {formatters.date(vehicle.start_date)}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {vehicles.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Nenhum financiamento cadastrado</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Clique em "Novo Financiamento" para começar</p>
          </div>
        )}
      </div>

      {/* Dialog para mostrar todas as parcelas */}
      <Dialog open={showPayments} onOpenChange={setShowPayments}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              Parcelas - {selectedVehicle?.description}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {selectedVehicle && getVehiclePayments(selectedVehicle.id).map((payment) => (
              <div
                key={payment.id}
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  payment.is_paid 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200' 
                    : 'bg-white dark:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  {payment.is_paid ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                  <div>
                    <p className="font-medium">Parcela {payment.installment_number}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Vencimento: {formatters.date(payment.due_date)}
                      {payment.paid_date && (
                        <span className="ml-2 text-green-600">
                          • Pago em {formatters.date(payment.paid_date)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatters.currency(selectedVehicle.installment_value)}</p>
                  {!payment.is_paid && (
                    <Button
                      size="sm"
                      onClick={() => markPaymentAsPaid(payment.id, selectedVehicle.id)}
                      className="mt-1"
                    >
                      Marcar como Pago
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Vehicles;
