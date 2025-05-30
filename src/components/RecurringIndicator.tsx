
import { RotateCcw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useRecurrenceFilter, type FilteredRecurrentTransaction } from '@/hooks/useRecurrenceFilter';

interface RecurringIndicatorProps {
  transaction: FilteredRecurrentTransaction;
  className?: string;
}

const RecurringIndicator = ({ transaction, className = "" }: RecurringIndicatorProps) => {
  const { getRecurrenceTooltip } = useRecurrenceFilter();

  if (!transaction.is_recurring) {
    return null;
  }

  const tooltipText = getRecurrenceTooltip(transaction);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`inline-flex items-center gap-1 ${className}`}>
            <RotateCcw className="h-3 w-3 text-blue-600 dark:text-blue-400" />
            {transaction.isRecurringOccurrence && (
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                #{(transaction.occurrenceIndex || 0) + 1}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default RecurringIndicator;
