
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Home, 
  Receipt, 
  TrendingUp, 
  CreditCard, 
  LineChart, 
  PiggyBank, 
  Car, 
  FileSpreadsheet, 
  Tag, 
  Target, 
  DollarSign,
  Wallet,
  BarChart3,
  Settings
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const AppSidebar = () => {
  const location = useLocation();
  const isActive = (href: string) => location.pathname === href;

  const menuGroups = [
    {
      label: "Principal",
      items: [
        { name: 'Dashboard', href: '/', icon: Home, color: 'text-blue-600' },
      ]
    },
    {
      label: "Movimentações",
      items: [
        { name: 'Despesas', href: '/cash-expenses', icon: Receipt, color: 'text-red-600' },
        { name: 'Receitas', href: '/income', icon: TrendingUp, color: 'text-green-600' },
        { name: 'Cartões', href: '/cards', icon: CreditCard, color: 'text-purple-600' },
        { name: 'Contas', href: '/bills', icon: DollarSign, color: 'text-yellow-600' },
      ]
    },
    {
      label: "Planejamento",
      items: [
        { name: 'Categorias', href: '/categories', icon: Tag, color: 'text-orange-600' },
        { name: 'Orçamentos', href: '/budgets', icon: Target, color: 'text-pink-600' },
      ]
    },
    {
      label: "Investimentos & Patrimônio",
      items: [
        { name: 'Investimentos', href: '/investments', icon: LineChart, color: 'text-indigo-600' },
        { name: 'Poupança', href: '/savings', icon: PiggyBank, color: 'text-emerald-600' },
        { name: 'Veículos', href: '/vehicles', icon: Car, color: 'text-slate-600' },
      ]
    },
    {
      label: "Relatórios",
      items: [
        { name: 'Planilha', href: '/spreadsheet', icon: FileSpreadsheet, color: 'text-cyan-600' },
      ]
    }
  ];

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <Wallet className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">App Financeiro</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {menuGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive(item.href)}>
                      <Link to={item.href}>
                        <item.icon className={`h-4 w-4 ${item.color}`} />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
