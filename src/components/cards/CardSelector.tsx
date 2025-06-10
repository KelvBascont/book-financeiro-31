
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from 'lucide-react';

interface CardSelectorProps {
  cards: any[];
  selectedCard: string;
  onCardChange: (cardId: string) => void;
}

const CardSelector = ({ cards, selectedCard, onCardChange }: CardSelectorProps) => {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Selecionar cartão para ver despesas detalhadas</p>
            <CardTitle className="flex items-center gap-2 mt-2">
              <Calendar className="h-5 w-5" />
              Cartão
            </CardTitle>
          </div>
          <Select value={selectedCard} onValueChange={onCardChange}>
            <SelectTrigger className="w-64 bg-gray-700 border-gray-600">
              <SelectValue placeholder="Selecione um cartão" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              {cards.map(card => (
                <SelectItem key={card.id} value={card.id}>{card.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
    </Card>
  );
};

export default CardSelector;
