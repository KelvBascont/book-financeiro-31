
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
        { 
          name: 'Dashboard', 
          href: '/', 
          icon: Home, 
          color: 'text-blue-600',
          tooltip: 'Dashboard - Visão geral das suas finanças, gráficos e resumos'
        },
      ]
    },
    {
      label: "Movimentações",
      items: [
        { 
          name: 'Despesas', 
          href: '/cash-expenses', 
          icon: Receipt, 
          color: 'text-red-600',
          tooltip: 'Despesas - Registre e gerencie suas despesas em dinheiro'
        },
        { 
          name: 'Receitas', 
          href: '/income', 
          icon: TrendingUp, 
          color: 'text-green-600',
          tooltip: 'Receitas - Controle seus ganhos e fontes de renda'
        },
        { 
          name: 'Cartões', 
          href: '/cards', 
          icon: CreditCard, 
          color: 'text-purple-600',
          tooltip: 'Cartões - Gerencie gastos dos seus cartões de crédito'
        },
        { 
          name: 'Contas', 
          href: '/bills', 
          icon: DollarSign, 
          color: 'text-yellow-600',
          tooltip: 'Contas - Organize contas a pagar e receber'
        },
      ]
    },
    {
      label: "Planejamento",
      items: [
        { 
          name: 'Categorias', 
          href: '/categories', 
          icon: Tag, 
          color: 'text-orange-600',
          tooltip: 'Categorias - Organize suas transações por categorias'
        },
        { 
          name: 'Orçamentos', 
          href: '/budgets', 
          icon: Target, 
          color: 'text-pink-600',
          tooltip: 'Orçamentos - Defina metas e controle gastos mensais'
        },
      ]
    },
    {
      label: "Investimentos & Patrimônio",
      items: [
        { 
          name: 'Investimentos', 
          href: '/investments', 
          icon: LineChart, 
          color: 'text-indigo-600',
          tooltip: 'Investimentos - Acompanhe sua carteira de investimentos'
        },
        { 
          name: 'Poupança', 
          href: '/savings', 
          icon: PiggyBank, 
          color: 'text-emerald-600',
          tooltip: 'Poupança - Controle suas economias e metas de poupança'
        },
        { 
          name: 'Veículos', 
          href: '/vehicles', 
          icon: Car, 
          color: 'text-slate-600',
          tooltip: 'Veículos - Gerencie informações dos seus veículos'
        },
      ]
    },
    {
      label: "Relatórios",
      items: [
        { 
          name: 'Planilha', 
          href: '/spreadsheet', 
          icon: FileSpreadsheet, 
          color: 'text-cyan-600',
          tooltip: 'Planilha - Visualize dados em formato de planilha'
        },
      ]
    }
  ];

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader />
      <SidebarContent>
        {menuGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive(item.href)}
                      tooltip={item.tooltip}
                    >
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
