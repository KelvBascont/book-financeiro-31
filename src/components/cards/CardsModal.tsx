
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CreditCard, Plus } from 'lucide-react';
import CrudActions from '@/components/CrudActions';
import { useFormatters } from '@/hooks/useFormatters';

interface Card {
  id: string;
  name: string;
  due_date: number;
  closing_date: number;
  created_at: string;
}

interface CardsModalProps {
  cards: Card[];
  onEditCard: (card: Card) => void;
  onDeleteCard: (id: string) => void;
  onAddCard: () => void;
}

const CardsModal = ({ cards, onEditCard, onDeleteCard, onAddCard }: CardsModalProps) => {
  const formatters = useFormatters();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">
          <CreditCard className="h-4 w-4 mr-2" />
          Cartões Cadastrados
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Cartões Cadastrados
            </DialogTitle>
            <Button onClick={onAddCard} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Novo Cartão
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-3 mt-4">
          {cards.map((card) => (
            <div key={card.id} className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-800">
              <div className="flex items-center gap-3 flex-1">
                <CreditCard className="h-8 w-8 text-blue-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{card.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Vencimento: dia {card.due_date} | Fechamento: dia {card.closing_date}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Criado em: {formatters.date(card.created_at)}
                  </p>
                </div>
              </div>
              <CrudActions
                item={card}
                onEdit={onEditCard}
                onDelete={() => onDeleteCard(card.id)}
                showView={false}
                deleteTitle="Confirmar exclusão"
                deleteDescription="Esta ação não pode ser desfeita. O cartão será permanentemente removido."
              />
            </div>
          ))}
          
          {cards.length === 0 && (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Nenhum cartão cadastrado</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Clique em "Novo Cartão" para adicionar seu primeiro cartão
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CardsModal;
