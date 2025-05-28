
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface CrudActionsProps {
  item: any;
  onEdit?: (item: any) => void;
  onDelete?: (id: string) => void;
  onView?: (item: any) => void;
  showView?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  deleteTitle?: string;
  deleteDescription?: string;
  size?: 'sm' | 'default' | 'lg';
}

const CrudActions = ({
  item,
  onEdit,
  onDelete,
  onView,
  showView = false,
  showEdit = true,
  showDelete = true,
  deleteTitle = "Confirmar exclusão",
  deleteDescription = "Esta ação não pode ser desfeita. O item será permanentemente removido.",
  size = 'sm'
}: CrudActionsProps) => {
  return (
    <div className="flex items-center gap-1">
      {showView && onView && (
        <Button
          variant="ghost"
          size={size}
          onClick={() => onView(item)}
          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          <Eye className="h-4 w-4" />
        </Button>
      )}
      
      {showEdit && onEdit && (
        <Button
          variant="ghost"
          size={size}
          onClick={() => onEdit(item)}
          className="h-8 w-8 p-0 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
        >
          <Edit className="h-4 w-4" />
        </Button>
      )}
      
      {showDelete && onDelete && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size={size}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{deleteTitle}</AlertDialogTitle>
              <AlertDialogDescription>
                {deleteDescription}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(item.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default CrudActions;
