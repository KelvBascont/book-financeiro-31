
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={selectedCard === '' ? 'default' : 'outline'}
            className={`cursor-pointer transition-colors ${
              selectedCard === '' 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600'
            }`}
            onClick={() => onCardChange('')}
          >
            Todos ({cards.length})
          </Badge>
          {cards.map(card => (
            <Badge
              key={card.id}
              variant={selectedCard === card.id ? 'default' : 'outline'}
              className={`cursor-pointer transition-colors ${
                selectedCard === card.id 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600'
              }`}
              onClick={() => onCardChange(card.id)}
            >
              {card.name}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CardSelector;
