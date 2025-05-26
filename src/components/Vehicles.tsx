
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Car, Check, Clock, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Vehicles = () => {
  const { toast } = useToast();
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  
  const [vehicleForm, setVehicleForm] = useState({
    description: '',
    totalAmount: '',
    installments: '',
    startDate: '',
    installmentValue: ''
  });

  const mockVehicles = [
    {
      id: '1',
      description: 'Honda Civic 2023',
      totalAmount: 120000.00,
      installments: 60,
      startDate: '2024-01-15',
      installmentValue: 2000.00,
      paidInstallments: 5,
      nextDueDate: '2024-06-15'
    },
    {
      id: '2',
      description: 'Yamaha MT-03',
      totalAmount: 24000.00,
      installments: 24,
      startDate: '2024-03-01',
      installmentValue: 1000.00,
      paidInstallments: 3,
      nextDueDate: '2024-06-01'
    }
  ];

  const mockPayments = [
    { id: '1', vehicleId: '1', installmentNumber: 5, dueDate: '2024-05-15', isPaid: true, paidDate: '2024-05-14' },
    { id: '2', vehicleId: '1', installmentNumber: 6, dueDate: '2024-06-15', isPaid: false },
    { id: '3', vehicleId: '2', installmentNumber: 3, dueDate: '2024-05-01', isPaid: true, paidDate: '2024-04-30' },
    { id: '4', vehicleId: '2', installmentNumber: 4, dueDate: '2024-06-01', isPaid: false },
  ];

  const handleAddVehicle = () => {
    if (!vehicleForm.description || !vehicleForm.totalAmount || !vehicleForm.installments || !vehicleForm.startDate) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Veículo cadastrado!",
      description: `Financiamento de "${vehicleForm.description}" foi adicionado com sucesso`,
    });
    
    setVehicleForm({ description: '', totalAmount: '', installments: '', startDate: '', installmentValue: '' });
    setShowAddVehicle(false);
  };

  const markAsPaid = (paymentId: string) => {
    toast({
      title: "Parcela paga!",
      description: "Parcela marcada como paga com sucesso",
    });
  };

  const getProgress = (paid: number, total: number) => {
    return (paid / total) * 100;
  };

  const getRemainingAmount = (vehicle: any) => {
    const remainingInstallments = vehicle.installments - vehicle.paidInstallments;
    return remainingInstallments * vehicle.installmentValue;
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Gestão de Veículos</h2>
          <p className="text-gray-600 mt-1">Controle seus financiamentos e parcelas</p>
        </div>
        <Button onClick={() => setShowAddVehicle(!showAddVehicle)} className="bg-purple-500 hover:bg-purple-600">
          <Plus className="h-4 w-4 mr-2" />
          Novo Financiamento
        </Button>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  value={vehicleForm.totalAmount}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, totalAmount: e.target.value })}
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
                    const totalAmount = parseFloat(vehicleForm.totalAmount) || 0;
                    const installmentValue = installments > 0 ? (totalAmount / installments).toFixed(2) : '';
                    
                    setVehicleForm({ 
                      ...vehicleForm, 
                      installments: e.target.value,
                      installmentValue
                    });
                  }}
                />
              </div>
              <div>
                <Label htmlFor="startDate">Data de Início *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={vehicleForm.startDate}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, startDate: e.target.value })}
                />
              </div>
            </div>
            
            {vehicleForm.installmentValue && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Valor da parcela:</strong> R$ {vehicleForm.installmentValue}
                </p>
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddVehicle(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddVehicle} className="bg-purple-500 hover:bg-purple-600">
                Cadastrar Financiamento
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockVehicles.map((vehicle) => {
          const progress = getProgress(vehicle.paidInstallments, vehicle.installments);
          const remainingAmount = getRemainingAmount(vehicle);
          const paidAmount = vehicle.paidInstallments * vehicle.installmentValue;
          
          return (
            <Card key={vehicle.id} className="relative overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-purple-600" />
                  {vehicle.description}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Valor Total</p>
                    <p className="font-bold">R$ {vehicle.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Parcela</p>
                    <p className="font-bold">R$ {vehicle.installmentValue.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Pago</p>
                    <p className="font-bold text-green-600">R$ {paidAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Restante</p>
                    <p className="font-bold text-red-600">R$ {remainingAmount.toFixed(2)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso</span>
                    <span>{vehicle.paidInstallments}/{vehicle.installments} parcelas</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                  <p className="text-xs text-gray-600 text-center">{progress.toFixed(1)}% concluído</p>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">Próximo vencimento</span>
                  </div>
                  <span className="text-sm font-bold">
                    {new Date(vehicle.nextDueDate).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <Button variant="outline" className="w-full">
                  Ver Todas as Parcelas
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Parcelas Próximas ao Vencimento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockPayments.filter(p => !p.isPaid).map((payment) => {
              const vehicle = mockVehicles.find(v => v.id === payment.vehicleId);
              const daysUntilDue = Math.ceil((new Date(payment.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              
              return (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Car className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">{vehicle?.description}</p>
                      <p className="text-sm text-gray-600">
                        Parcela {payment.installmentNumber} • Vence em {daysUntilDue} dias
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(payment.dueDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold">R$ {vehicle?.installmentValue.toFixed(2)}</p>
                      <Badge variant={daysUntilDue <= 3 ? "destructive" : "secondary"}>
                        {daysUntilDue <= 0 ? "Vencida" : `${daysUntilDue} dias`}
                      </Badge>
                    </div>
                    <Button 
                      onClick={() => markAsPaid(payment.id)}
                      className="bg-green-500 hover:bg-green-600"
                      size="sm"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Pagar
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Vehicles;
