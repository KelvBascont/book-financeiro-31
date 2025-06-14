import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, Receipt, TrendingUp, CreditCard, LineChart, PiggyBank, Car, FileSpreadsheet, Tag } from 'lucide-react';
import { cn } from "@/lib/utils";

interface NavItemProps {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const Navigation = () => {
  const location = useLocation();
  const isActive = (href: string) => location.pathname === href;

  const navigationItems = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Despesas Correntes', href: '/cash-expenses', icon: Receipt },
    { name: 'Receitas', href: '/income', icon: TrendingUp },
    { name: 'Cartões', href: '/cards', icon: CreditCard },
    { name: 'Categorias', href: '/categories', icon: Tag },
    { name: 'Investimentos', href: '/investments', icon: LineChart },
    { name: 'Poupança', href: '/savings', icon: PiggyBank },
    { name: 'Veículos', href: '/vehicles', icon: Car },
    { name: 'Planilha', href: '/spreadsheet', icon: FileSpreadsheet }
  ];

  return (
    <aside className="w-64 border-r flex-none h-full overflow-y-auto py-4 px-3 bg-gray-50 dark:bg-gray-900 dark:border-gray-700">
      <div className="pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
        <Link to="/" className="flex items-center space-x-2.5">
          <span className="self-center text-lg font-semibold whitespace-nowrap dark:text-white">
            Financial Manager
          </span>
        </Link>
      </div>
      <ul className="space-y-2 font-medium">
        {navigationItems.map((item) => (
          <li key={item.href}>
            <Link
              to={item.href}
              className={cn(
                "flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group",
                isActive(item.href) ? "bg-gray-100 dark:bg-gray-700" : ""
              )}
            >
              <item.icon className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              <span className="ml-3">{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Navigation;
