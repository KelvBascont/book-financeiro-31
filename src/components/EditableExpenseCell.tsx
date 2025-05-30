
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { useFormatters } from '@/hooks/useFormatters';

interface EditableExpenseCellProps {
  value: number;
  onSave: (newValue: number) => void;
  onCancel: () => void;
  isEditing: boolean;
}

const EditableExpenseCell = ({ value, onSave, onCancel, isEditing }: EditableExpenseCellProps) => {
  const [editValue, setEditValue] = useState(value.toString());
  const formatters = useFormatters();

  const handleSave = () => {
    const numericValue = parseFloat(editValue);
    if (!isNaN(numericValue) && numericValue > 0) {
      onSave(numericValue);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  if (!isEditing) {
    return <span>{formatters.currency(value)}</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        step="0.01"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyPress}
        className="w-24 h-8"
        autoFocus
      />
      <Button size="sm" variant="ghost" onClick={handleSave} className="h-8 w-8 p-0">
        <Check className="h-4 w-4 text-green-600" />
      </Button>
      <Button size="sm" variant="ghost" onClick={onCancel} className="h-8 w-8 p-0">
        <X className="h-4 w-4 text-red-600" />
      </Button>
    </div>
  );
};

export default EditableExpenseCell;
