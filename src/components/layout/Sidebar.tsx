'use client';

import React from 'react';
import { useHangout } from '@/context/HangoutContext';
import { useAuth } from '@/context/AuthContext';
import { HangoutPageKey, UserRole } from '@/types/hangout';
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  Building2,
  Users,
  BarChart3,
  CheckSquare,
  X,
  Flame,
  ShieldCheck,
  LogOut,
  Sparkles
} from 'lucide-react';

interface NavItem {
  key: HangoutPageKey;
  label: string;
  icon: React.ElementType;
  badge?: string;
  allowedRoles?: UserRole[];
}

const ALL_NAV_ITEMS: NavItem[] = [
  { 
    key: 'dashboard', 
    label: 'Dashboard Geral', 
    icon: LayoutDashboard,
    allowedRoles: ['lider_base', 'lider_time']
  },
  { 
    key: 'services', 
    label: 'Dados de Cultos', 
    icon: Calendar,
    allowedRoles: ['lider_base', 'lider_time', 'volunteer']
  },
  { 
    key: 'visitor_card', 
    label: 'Ficha do Visitante', 
    icon: ClipboardList, 
    badge: 'Acolhimento',
    allowedRoles: ['lider_base', 'lider_time', 'volunteer']
  },
  { 
    key: 'volunteers', 
    label: 'Voluntários', 
    icon: Users,
    allowedRoles: ['lider_base', 'lider_time', 'volunteer']
  },
  { 
    key: 'ministries', 
    label: 'Ministérios (10)', 
    icon: Building2,
    allowedRoles: ['lider_base', 'lider_time']
  },
  { 
    key: 'reports', 
    label: 'Relatórios Mensais', 
    icon: BarChart3,
    allowedRoles: ['lider_base', 'lider_time']
  },
  { 
    key: 'approvals', 
    label: 'Aprovação de Cultos', 
    icon: CheckSquare, 
    badge: 'Líder',
    allowedRoles: ['lider_base']
  },
  { 
    key: 'user_admin', 
    label: 'Painel de Liderança', 
    icon: ShieldCheck, 
    badge: 'Base',
    allowedRoles: ['lider_base']
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { activeTab, setActiveTab } = useHangout();
  const { profile, signOut } = useAuth();

  const userRole: UserRole = profile?.role || 'volunteer';

  const visibleNavItems = ALL_NAV_ITEMS.filter(item => 
    !item.allowedRoles || item.allowedRoles.includes(userRole)
  );

  const handleSelect = (key: HangoutPageKey) => {
    setActiveTab(key);
    onClose();
  };

  const roleBadgeText = 
    userRole === 'lider_base' 
      ? '👑 Líder Base' 
      : userRole === 'lider_time' 
      ? `⚡ Líder • ${profile?.team || 'Time'}` 
      : `🛡️ Voluntário • ${profile?.team || 'Time'}`;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#0A192F] text-white transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 shadow-lg shadow-blue-600/30">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">HANGOUT</h1>
              <p className="text-xs font-medium text-blue-300">Gestão de Cultos & Vidas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-6 scrollbar-thin">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-blue-300/60">
            Navegação do Sistema
          </p>

          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleSelect(item.key)}
                className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon
                    className={`h-5 w-5 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-blue-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                    item.badge === 'Base' ? 'bg-purple-500/30 text-purple-200 border border-purple-400/30' :
                    item.badge === 'Líder' ? 'bg-amber-500/20 text-amber-300' : 
                    'bg-blue-500/20 text-blue-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer com Informações do Usuário Logado e Logout */}
        <div className="border-t border-white/10 p-4">
          <div className="rounded-2xl bg-white/5 p-3.5 border border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 font-bold text-white text-xs shadow-md">
                  {profile?.full_name ? profile.full_name.substring(0, 2).toUpperCase() : 'HG'}
                </div>
                <div className="overflow-hidden">
                  <p className="truncate text-xs font-bold text-white">
                    {profile?.full_name || 'Usuário Hangout'}
                  </p>
                  <p className="truncate text-[10px] text-blue-300 font-medium">
                    {roleBadgeText}
                  </p>
                </div>
              </div>

              <button
                onClick={() => signOut()}
                title="Sair do sistema"
                className="rounded-xl p-2 text-slate-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
