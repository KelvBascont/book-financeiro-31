
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tag } from 'lucide-react';
import { Category } from '@/hooks/useCategories';

interface SubcategoryFormData {
  name: string;
  category_id: string;
  description: string;
}

interface SubcategoryFormProps {
  isVisible: boolean;
  isEditing: boolean;
  editingSubcategory?: any;
  categories: Category[];
  onSubmit: (data: SubcategoryFormData) => Promise<void>;
  onCancel: () => void;
}

const SubcategoryForm = ({ 
  isVisible, 
  isEditing, 
  editingSubcategory, 
  categories,
  onSubmit, 
  onCancel 
}: SubcategoryFormProps) => {
  const [formData, setFormData] = useState<SubcategoryFormData>({
    name: '',
    category_id: '',
    description: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditing && editingSubcategory) {
      setFormData({
        name: editingSubcategory.name,
        category_id: editingSubcategory.category_id,
        description: editingSubcategory.description || ''
      });
    } else if (!isEditing) {
      setFormData({
        name: '',
        category_id: '',
        description: ''
      });
    }
  }, [isEditing, editingSubcategory]);

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.category_id) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting subcategory:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (field: keyof SubcategoryFormData, value: string) => {
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
          {isEditing ? 'Editar Subcategoria' : 'Nova Subcategoria'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="subcategoryName">Nome da Subcategoria *</Label>
            <Input
              id="subcategoryName"
              placeholder="Ex: Supermercado, Gasolina..."
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="parentCategory">Categoria Pai *</Label>
            <Select 
              value={formData.category_id} 
              onValueChange={(value) => handleFieldChange('category_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                      <span className="text-xs text-gray-500">
                        ({category.type === 'income' ? 'Receita' : 'Despesa'})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="subcategoryDescription">Descrição (Opcional)</Label>
          <Textarea
            id="subcategoryDescription"
            placeholder="Descrição da subcategoria..."
            value={formData.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            rows={3}
          />
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
            disabled={isSubmitting || !formData.name.trim() || !formData.category_id}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar')} Subcategoria
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubcategoryForm;
