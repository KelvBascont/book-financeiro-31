
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Copy, Save, Download, Upload } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { MonthlyBudget } from '@/hooks/useMonthlyBudgets';
import { format, addMonths, subMonths } from 'date-fns';

interface BudgetTemplatesProps {
  budgets: MonthlyBudget[];
  selectedMonth: Date;
  onCreateBudgetsFromTemplate: (budgets: Omit<MonthlyBudget, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]) => Promise<void>;
  onClose: () => void;
}

const BudgetTemplates = ({ budgets, selectedMonth, onCreateBudgetsFromTemplate, onClose }: BudgetTemplatesProps) => {
  const { expenseCategories } = useCategories();
  const [templateType, setTemplateType] = useState<'previous' | 'preset' | 'custom'>('previous');
  const [selectedPreset, setSelectedPreset] = useState('');
  const [customTemplate, setCustomTemplate] = useState<Record<string, number>>({});
  const [isCreating, setIsCreating] = useState(false);

  // Templates pré-definidos
  const presetTemplates = {
    'basico': {
      name: 'Orçamento Básico',
      description: 'Orçamento simples para gastos essenciais',
      budgets: {
        'Alimentação': 800,
        'Transporte': 300,
        'Moradia': 1200,
        'Saúde': 200,
        'Lazer': 150
      }
    },
    'completo': {
      name: 'Orçamento Completo',
      description: 'Orçamento detalhado para todas as categorias',
      budgets: {
        'Alimentação': 800,
        'Transporte': 300,
        'Moradia': 1200,
        'Saúde': 200,
        'Educação': 150,
        'Lazer': 200,
        'Compras': 250,
        'Serviços': 100
      }
    },
    'conservador': {
      name: 'Orçamento Conservador',
      description: 'Valores mais baixos para economia',
      budgets: {
        'Alimentação': 600,
        'Transporte': 200,
        'Moradia': 1000,
        'Saúde': 150,
        'Lazer': 100
      }
    }
  };

  const handleCustomTemplateChange = (categoryName: string, value: string) => {
    setCustomTemplate(prev => ({
      ...prev,
      [categoryName]: parseFloat(value) || 0
    }));
  };

  const handleCreateFromPrevious = () => {
    const previousMonth = subMonths(selectedMonth, 1);
    const previousMonthString = format(previousMonth, 'yyyy-MM-dd');
    
    const previousBudgets = budgets.filter(budget => budget.month_year === previousMonthString);
    
    if (previousBudgets.length === 0) {
      return;
    }

    const newBudgets = previousBudgets.map(budget => ({
      category_id: budget.category_id,
      month_year: format(selectedMonth, 'yyyy-MM-dd'),
      budget_limit: budget.budget_limit
    }));

    createBudgets(newBudgets);
  };

  const handleCreateFromPreset = () => {
    if (!selectedPreset || !presetTemplates[selectedPreset as keyof typeof presetTemplates]) {
      return;
    }

    const preset = presetTemplates[selectedPreset as keyof typeof presetTemplates];
    const newBudgets: Omit<MonthlyBudget, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = [];

    Object.entries(preset.budgets).forEach(([categoryName, amount]) => {
      const category = expenseCategories.find(cat => cat.name === categoryName);
      if (category) {
        newBudgets.push({
          category_id: category.id,
          month_year: format(selectedMonth, 'yyyy-MM-dd'),
          budget_limit: amount
        });
      }
    });

    createBudgets(newBudgets);
  };

  const handleCreateFromCustom = () => {
    const newBudgets: Omit<MonthlyBudget, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = [];

    Object.entries(customTemplate).forEach(([categoryName, amount]) => {
      if (amount > 0) {
        const category = expenseCategories.find(cat => cat.name === categoryName);
        if (category) {
          newBudgets.push({
            category_id: category.id,
            month_year: format(selectedMonth, 'yyyy-MM-dd'),
            budget_limit: amount
          });
        }
      }
    });

    createBudgets(newBudgets);
  };

  const createBudgets = async (newBudgets: Omit<MonthlyBudget, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]) => {
    setIsCreating(true);
    try {
      await onCreateBudgetsFromTemplate(newBudgets);
      onClose();
    } catch (error) {
      console.error('Error creating budgets from template:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreate = () => {
    switch (templateType) {
      case 'previous':
        handleCreateFromPrevious();
        break;
      case 'preset':
        handleCreateFromPreset();
        break;
      case 'custom':
        handleCreateFromCustom();
        break;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Copy className="h-5 w-5" />
              Templates de Orçamento
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              disabled={isCreating}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-y-auto">
          <div className="space-y-6">
            {/* Seleção do Tipo de Template */}
            <div>
              <Label>Tipo de Template</Label>
              <Select value={templateType} onValueChange={(value: any) => setTemplateType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="previous">Copiar Mês Anterior</SelectItem>
                  <SelectItem value="preset">Template Pré-definido</SelectItem>
                  <SelectItem value="custom">Template Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Template do Mês Anterior */}
            {templateType === 'previous' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Copiar do Mês Anterior</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Copia todos os valores de orçamento do mês anterior para o mês atual.
                  </p>
                  {(() => {
                    const previousMonth = subMonths(selectedMonth, 1);
                    const previousMonthString = format(previousMonth, 'yyyy-MM-dd');
                    const previousBudgets = budgets.filter(budget => budget.month_year === previousMonthString);
                    
                    if (previousBudgets.length === 0) {
                      return (
                        <p className="text-amber-600">
                          Nenhum orçamento encontrado para o mês anterior.
                        </p>
                      );
                    }

                    return (
                      <div className="space-y-2">
                        <p className="font-medium">Orçamentos a serem copiados:</p>
                        {previousBudgets.map(budget => (
                          <div key={budget.id} className="flex justify-between p-2 bg-gray-50 rounded">
                            <span>{budget.category?.name}</span>
                            <span className="font-medium">{formatCurrency(budget.budget_limit)}</span>
                          </div>
                        ))}
                        <div className="pt-2 border-t">
                          <div className="flex justify-between font-bold">
                            <span>Total:</span>
                            <span>{formatCurrency(previousBudgets.reduce((sum, b) => sum + b.budget_limit, 0))}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Templates Pré-definidos */}
            {templateType === 'preset' && (
              <div className="space-y-4">
                <div>
                  <Label>Template Pré-definido</Label>
                  <Select value={selectedPreset} onValueChange={setSelectedPreset}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um template" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(presetTemplates).map(([key, template]) => (
                        <SelectItem key={key} value={key}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedPreset && presetTemplates[selectedPreset as keyof typeof presetTemplates] && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {presetTemplates[selectedPreset as keyof typeof presetTemplates].name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        {presetTemplates[selectedPreset as keyof typeof presetTemplates].description}
                      </p>
                      <div className="space-y-2">
                        {Object.entries(presetTemplates[selectedPreset as keyof typeof presetTemplates].budgets).map(([category, amount]) => (
                          <div key={category} className="flex justify-between p-2 bg-gray-50 rounded">
                            <span>{category}</span>
                            <span className="font-medium">{formatCurrency(amount)}</span>
                          </div>
                        ))}
                        <div className="pt-2 border-t">
                          <div className="flex justify-between font-bold">
                            <span>Total:</span>
                            <span>
                              {formatCurrency(
                                Object.values(presetTemplates[selectedPreset as keyof typeof presetTemplates].budgets)
                                  .reduce((sum, amount) => sum + amount, 0)
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Template Personalizado */}
            {templateType === 'custom' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Template Personalizado</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Defina valores personalizados para cada categoria.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {expenseCategories.map((category) => (
                      <div key={category.id} className="space-y-2">
                        <Label htmlFor={`custom-${category.id}`}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </div>
                        </Label>
                        <Input
                          id={`custom-${category.id}`}
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0,00"
                          value={customTemplate[category.name] || ''}
                          onChange={(e) => handleCustomTemplateChange(category.name, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                  {Object.keys(customTemplate).length > 0 && (
                    <div className="mt-4 p-3 bg-gray-50 rounded">
                      <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span>
                          {formatCurrency(
                            Object.values(customTemplate).reduce((sum, amount) => sum + amount, 0)
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Botões de Ação */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={onClose}
                disabled={isCreating}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCreate}
                disabled={isCreating || (templateType === 'preset' && !selectedPreset)}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isCreating ? 'Criando...' : 'Criar Orçamentos'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetTemplates;
