
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tag } from 'lucide-react';
import { Category } from '@/hooks/useCategories';

interface CategorySelectorProps {
  categories: Category[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const CategorySelector = ({ 
  categories, 
  value, 
  onValueChange, 
  placeholder = "Selecione uma categoria",
  disabled = false 
}: CategorySelectorProps) => {
  const selectedCategory = categories.find(cat => cat.id === value);

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder}>
          {selectedCategory && (
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                style={{ backgroundColor: selectedCategory.color + '20', color: selectedCategory.color }}
                className="text-xs"
              >
                <Tag className="h-3 w-3 mr-1" />
                {selectedCategory.name}
              </Badge>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {categories.length > 0 ? (
          categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              <div className="flex items-center gap-2">
                <Badge 
                  variant="secondary" 
                  style={{ backgroundColor: category.color + '20', color: category.color }}
                  className="text-xs"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {category.name}
                </Badge>
              </div>
            </SelectItem>
          ))
        ) : (
          <SelectItem value="no-categories" disabled className="text-gray-400">
            Nenhuma categoria disponível
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
};

export default CategorySelector;
