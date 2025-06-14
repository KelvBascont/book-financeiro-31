
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tag, Palette } from 'lucide-react';

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
  onSubmit: (data: any) => Promise<void>;
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

  const colorOptions = [
    { value: '#EF4444', label: 'Vermelho' },
    { value: '#F97316', label: 'Laranja' },
    { value: '#F59E0B', label: 'Amarelo' },
    { value: '#10B981', label: 'Verde' },
    { value: '#3B82F6', label: 'Azul' },
    { value: '#8B5CF6', label: 'Roxo' },
    { value: '#EC4899', label: 'Rosa' },
    { value: '#6B7280', label: 'Cinza' }
  ];

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
      if (isEditing && editingCategory) {
        await onSubmit(editingCategory.id, formData);
      } else {
        await onSubmit(formData);
      }
      onCancel();
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="categoryName">Nome da Categoria *</Label>
            <Input
              id="categoryName"
              placeholder="Ex: Alimentação, Transporte..."
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="categoryType">Tipo *</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value: 'income' | 'expense') => handleFieldChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Despesa</SelectItem>
                <SelectItem value="income">Receita</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="categoryColor">Cor</Label>
            <Select 
              value={formData.color} 
              onValueChange={(value) => handleFieldChange('color', value)}
            >
              <SelectTrigger>
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full border" 
                      style={{ backgroundColor: formData.color }}
                    />
                    <span>{colorOptions.find(c => c.value === formData.color)?.label}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {colorOptions.map((color) => (
                  <SelectItem key={color.value} value={color.value}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full border" 
                        style={{ backgroundColor: color.value }}
                      />
                      <span>{color.label}</span>
                    </div>
                  </SelectItem>
                ))}
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
