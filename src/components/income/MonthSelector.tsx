
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MonthSelectorProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

const MonthSelector = ({ selectedMonth, onMonthChange }: MonthSelectorProps) => {
  const currentDate = new Date();
  const months = [];

  // Generate 24 months (12 past + current + 11 future)
  for (let i = -12; i <= 11; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
    const monthKey = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    const monthLabel = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    months.push({ key: monthKey, label: monthLabel });
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="monthSelect">Mês de Referência</Label>
      <Select value={selectedMonth} onValueChange={onMonthChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione o mês" />
        </SelectTrigger>
        <SelectContent>
          {months.map((month) => (
            <SelectItem key={month.key} value={month.key}>
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default MonthSelector;
