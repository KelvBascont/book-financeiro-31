import { Moon, Sun, Bell } from 'lucide-react'; // Importe o ícone Bell
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
    <div className="flex gap-2"> {/* Adicione um container para agrupar os botões */}
      {/* Botão de Tema */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(isLightTheme ? 'dark' : 'light')}
              className="h-9 w-9 relative"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 text-yellow-400 transition-all dark:-rotate-90 dark:scale-0 dark:text-transparent" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 text-transparent transition-all dark:rotate-0 dark:scale-100 dark:text-blue-400" />
              <span className="sr-only">Alternar tema</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isLightTheme ? 'Alternar para modo escuro' : 'Alternar para modo claro'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Botão de Notificações */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => console.log('Notificações clicadas')} // Adicione sua lógica aqui
              className="h-9 w-9 relative"
            >
              <Bell className="h-4 w-4" />
              <span className="sr-only">Notificações</span>
              
              {/* Indicador de notificações não lidas (opcional) */}
              <span className="absolute top-0 right-0 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Ver notificações</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}