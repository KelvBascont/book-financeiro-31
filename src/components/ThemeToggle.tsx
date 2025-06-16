import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from './ThemeProvider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isLightTheme = theme === 'light';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(isLightTheme ? 'dark' : 'light')}
            className="h-9 w-9 relative"
          >
            {/* Ícone do Sol - visível apenas no tema claro */}
            <Sun className="h-4 w-4 rotate-0 scale-100 text-yellow-400 transition-all dark:-rotate-90 dark:scale-0 dark:text-transparent" />
            
            {/* Ícone da Lua - visível apenas no tema escuro */}
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 text-transparent transition-all dark:rotate-0 dark:scale-100 dark:text-gray-300" />
            
            <span className="sr-only">Alternar tema</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isLightTheme ? 'Alternar para modo escuro' : 'Alternar para modo claro'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}