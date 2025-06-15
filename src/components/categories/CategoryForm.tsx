
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tag } from 'lucide-react';

interface CategoryFormData {
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
}

interface CategoryFormProps {
  isVisible: boolean;
  isEditing: boolean;
  editingCategory?: any;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  onCancel: () => void;
}

const CategoryForm = ({ 
  isVisible, 
  isEditing, 
  editingCategory, 
  onSubmit, 
  onCancel 
}: CategoryFormProps) => {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    type: 'expense',
    color: '#6B7280',
    icon: 'Tag'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditing && editingCategory) {
      setFormData({
        name: editingCategory.name,
        type: editingCategory.type,
        color: editingCategory.color || '#6B7280',
        icon: editingCategory.icon || 'Tag'
      });
    } else if (!isEditing) {
      setFormData({
        name: '',
        type: 'expense',
        color: '#6B7280',
        icon: 'Tag'
      });
    }
  }, [isEditing, editingCategory]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting category:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (field: keyof CategoryFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isVisible) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          {isEditing ? 'Editar Categoria' : 'Nova Categoria'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="categoryName">Nome da Categoria *</Label>
            <Input
              id="categoryName"
              placeholder="Ex: Alimentação, Salário..."
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="categoryType">Tipo *</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => handleFieldChange('type', value as 'income' | 'expense')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Despesa</SelectItem>
                <SelectItem value="income">Receita</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="categoryColor">Cor</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="categoryColor"
                type="color"
                value={formData.color}
                onChange={(e) => handleFieldChange('color', e.target.value)}
                className="w-12 h-10 p-1 border rounded"
              />
              <Input
                placeholder="#6B7280"
                value={formData.color}
                onChange={(e) => handleFieldChange('color', e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="categoryIcon">Ícone</Label>
            <Select 
              value={formData.icon} 
              onValueChange={(value) => handleFieldChange('icon', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um ícone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tag">Tag</SelectItem>
                <SelectItem value="Home">Casa</SelectItem>
                <SelectItem value="Car">Carro</SelectItem>
                <SelectItem value="UtensilsCrossed">Alimentação</SelectItem>
                <SelectItem value="Heart">Saúde</SelectItem>
                <SelectItem value="GraduationCap">Educação</SelectItem>
                <SelectItem value="Gamepad2">Lazer</SelectItem>
                <SelectItem value="ShoppingBag">Compras</SelectItem>
                <SelectItem value="Briefcase">Trabalho</SelectItem>
                <SelectItem value="TrendingUp">Investimentos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.name.trim()}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar')} Categoria
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryForm;
