
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { X, AlertTriangle, Save } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { BudgetAlert } from '@/hooks/useMonthlyBudgets';

interface BudgetAlertsConfigProps {
  alerts: BudgetAlert[];
  onUpdateAlert: (categoryId: string, alertData: Partial<BudgetAlert>) => Promise<any>;
  onClose: () => void;
}

const BudgetAlertsConfig = ({ alerts, onUpdateAlert, onClose }: BudgetAlertsConfigProps) => {
  const { expenseCategories } = useCategories();
  const [alertSettings, setAlertSettings] = useState<Record<string, { threshold: number; enabled: boolean }>>(() => {
    const settings: Record<string, { threshold: number; enabled: boolean }> = {};
    
    expenseCategories.forEach(category => {
      const existingAlert = alerts.find(alert => alert.category_id === category.id);
      settings[category.id] = {
        threshold: existingAlert?.alert_threshold || 80,
        enabled: existingAlert?.is_enabled || false
      };
    });
    
    return settings;
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleThresholdChange = (categoryId: string, threshold: number) => {
    setAlertSettings(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        threshold: Math.max(1, Math.min(100, threshold))
      }
    }));
  };

  const handleEnabledChange = (categoryId: string, enabled: boolean) => {
    setAlertSettings(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        enabled
      }
    }));
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const promises = Object.entries(alertSettings).map(([categoryId, settings]) => {
        return onUpdateAlert(categoryId, {
          alert_threshold: settings.threshold,
          is_enabled: settings.enabled
        });
      });
      
      await Promise.all(promises);
      onClose();
    } catch (error) {
      console.error('Error saving alerts:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Configurar Alertas de Orçamento
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              disabled={isSaving}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-y-auto">
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Configure alertas para ser notificado quando os gastos em uma categoria atingirem uma porcentagem específica do orçamento.
            </p>

            <div className="space-y-4">
              {expenseCategories.map((category) => {
                const settings = alertSettings[category.id];
                if (!settings) return null;

                return (
                  <div key={category.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        <h3 className="font-medium">{category.name}</h3>
                      </div>
                      
                      <Switch
                        checked={settings.enabled}
                        onCheckedChange={(checked) => handleEnabledChange(category.id, checked)}
                      />
                    </div>

                    {settings.enabled && (
                      <div className="space-y-2">
                        <Label htmlFor={`threshold-${category.id}`}>
                          Alerta quando atingir (%)
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id={`threshold-${category.id}`}
                            type="number"
                            min="1"
                            max="100"
                            value={settings.threshold}
                            onChange={(e) => handleThresholdChange(category.id, parseInt(e.target.value) || 80)}
                            className="w-20"
                          />
                          <span className="text-sm text-muted-foreground">
                            % do orçamento
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Você será alertado quando os gastos desta categoria atingirem {settings.threshold}% do orçamento definido.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={onClose}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveAll}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetAlertsConfig;
