'use client';

import React from 'react';
import { useHangout } from '@/context/HangoutContext';
import { HangoutPageKey } from '@/types/hangout';
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
} from 'lucide-react';

interface NavItem {
  key: HangoutPageKey;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard Geral', icon: LayoutDashboard },
  { key: 'services', label: 'Dados de Cultos', icon: Calendar },
  { key: 'visitor_card', label: 'Ficha do Visitante', icon: ClipboardList, badge: 'Voluntários' },
  { key: 'ministries', label: 'Ministérios (10)', icon: Building2 },
  { key: 'volunteers', label: 'Voluntários', icon: Users },
  { key: 'reports', label: 'Relatórios Mensais', icon: BarChart3 },
  { key: 'approvals', label: 'Painel de Aprovação', icon: CheckSquare, badge: 'Líder' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { activeTab, setActiveTab } = useHangout();

  const handleSelect = (key: HangoutPageKey) => {
    setActiveTab(key);
    onClose();
  };

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
            Módulos Oficiais
          </p>

          {NAV_ITEMS.map((item) => {
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
                    item.badge === 'Líder' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer profile info */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center justify-between rounded-xl bg-white/5 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-bold text-white text-xs">
                HG
              </div>
              <div className="overflow-hidden">
                <p className="truncate text-xs font-semibold text-white">Liderança Hangout</p>
                <p className="truncate text-[10px] text-emerald-400">● Produção Vercel</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
