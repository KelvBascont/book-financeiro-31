
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Plus, Car, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseTables } from '@/hooks/useSupabaseTables';
import { useFormatters } from '@/hooks/useFormatters';
import CrudActions from '@/components/CrudActions';

const Vehicles = () => {
  const { toast } = useToast();
  const formatters = useFormatters();
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  
  const {
    vehicles,
    addVehicle,
    deleteVehicle,
    loading
  } = useSupabaseTables();
  
  const [vehicleForm, setVehicleForm] = useState({
    description: '',
    total_amount: '',
    installments: '',
    start_date: '',
    installment_value: ''
  });

  const handleAddVehicle = async () => {
    if (!vehicleForm.description || !vehicleForm.total_amount || !vehicleForm.installments || !vehicleForm.start_date) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    const totalAmount = parseFloat(vehicleForm.total_amount);
    const installments = parseInt(vehicleForm.installments);
    const installmentValue = totalAmount / installments;
    
    const result = await addVehicle({
      description: vehicleForm.description,
      total_amount: totalAmount,
      installments: installments,
      start_date: vehicleForm.start_date,
      installment_value: installmentValue
    });

    if (result) {
      setVehicleForm({ description: '', total_amount: '', installments: '', start_date: '', installment_value: '' });
      setShowAddVehicle(false);
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    await deleteVehicle(id);
  };

  const calculateProgress = (vehicle: any) => {
    const startDate = new Date(vehicle.start_date);
    const currentDate = new Date();
    const monthsDiff = Math.max(0, (currentDate.getFullYear() - startDate.getFullYear()) * 12 + currentDate.getMonth() - startDate.getMonth());
    const paidInstallments = Math.min(monthsDiff, vehicle.installments);
    return {
      paidInstallments,
      progress: (paidInstallments / vehicle.installments) * 100,
      remainingAmount: (vehicle.installments - paidInstallments) * vehicle.installment_value,
      paidAmount: paidInstallments * vehicle.installment_value
    };
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

      {showAddVehicle && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Cadastrar Novo Financiamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <Label htmlFor="totalAmount">Valor Total *</Label>
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
          const { paidInstallments, progress, remainingAmount, paidAmount } = calculateProgress(vehicle);
          
          return (
            <Card key={vehicle.id} className="relative overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-purple-600" />
                    <span className="truncate">{vehicle.description}</span>
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
                    <p className="text-gray-600 dark:text-gray-300">Valor Total</p>
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

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso</span>
                    <span>{paidInstallments}/{vehicle.installments} parcelas</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                  <p className="text-xs text-gray-600 dark:text-gray-400 text-center">{progress.toFixed(1)}% concluído</p>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-yellow-600" />
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
    </div>
  );
};

export default Vehicles;
