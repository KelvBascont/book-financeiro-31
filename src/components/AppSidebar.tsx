
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
        { name: 'Dashboard', href: '/', icon: Home },
      ]
    },
    {
      label: "Movimentações",
      items: [
        { name: 'Despesas Correntes', href: '/cash-expenses', icon: Receipt },
        { name: 'Receitas', href: '/income', icon: TrendingUp },
        { name: 'Cartões', href: '/cards', icon: CreditCard },
        { name: 'Contas', href: '/bills', icon: DollarSign },
      ]
    },
    {
      label: "Planejamento",
      items: [
        { name: 'Categorias', href: '/categories', icon: Tag },
        { name: 'Orçamentos', href: '/budgets', icon: Target },
      ]
    },
    {
      label: "Investimentos & Patrimônio",
      items: [
        { name: 'Investimentos', href: '/investments', icon: LineChart },
        { name: 'Poupança', href: '/savings', icon: PiggyBank },
        { name: 'Veículos', href: '/vehicles', icon: Car },
      ]
    },
    {
      label: "Relatórios",
      items: [
        { name: 'Planilha', href: '/spreadsheet', icon: FileSpreadsheet },
      ]
    }
  ];

  return (
    <Sidebar variant="inset">
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
                        <item.icon className="h-4 w-4" />
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
