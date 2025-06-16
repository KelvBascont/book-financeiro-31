import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="h-9 w-9"
    >
      {/* Ícone do Sol - visível apenas no tema claro */}
      <Sun className="h-4 w-4 rotate-0 scale-100 text-yellow-400 transition-all dark:-rotate-90 dark:scale-0 dark:text-transparent" />
      
      {/* Ícone da Lua - visível apenas no tema escuro */}
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 text-transparent transition-all dark:rotate-0 dark:scale-100 dark:text-blue-400" />
      
      <span className="sr-only">Alternar tema</span>
    </Button>
  );
}