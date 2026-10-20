'use client';

import React from 'react';
import { useHangout } from '@/context/HangoutContext';
import { HangoutPageKey } from '@/types/hangout';
import { LayoutDashboard, Calendar, ClipboardList, Building2, Menu } from 'lucide-react';

interface MobileNavProps {
  onOpenSidebar: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenSidebar }) => {
  const { activeTab, setActiveTab } = useHangout();

  const handleNav = (tab: HangoutPageKey) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-2 py-1.5 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl lg:hidden">
      <div className="relative mx-auto flex max-w-md items-center justify-around">
        {/* Início */}
        <button
          onClick={() => handleNav('dashboard')}
          className={`flex flex-col items-center justify-center rounded-xl px-2.5 py-1 transition-colors ${
            activeTab === 'dashboard' ? 'font-bold text-blue-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="mt-0.5 text-[10px] font-medium">Início</span>
        </button>

        {/* Dados de Cultos */}
        <button
          onClick={() => handleNav('services')}
          className={`flex flex-col items-center justify-center rounded-xl px-2.5 py-1 transition-colors ${
            activeTab === 'services' ? 'font-bold text-blue-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="h-5 w-5" />
          <span className="mt-0.5 text-[10px] font-medium">Cultos</span>
        </button>

        {/* Botão Central: + Ficha do Visitante */}
        <div className="relative -mt-6">
          <button
            onClick={() => handleNav('visitor_card')}
            aria-label="Preencher ficha de visitante"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-4 ring-white transition-transform active:scale-95"
          >
            <ClipboardList className="h-6 w-6 stroke-[2.2]" />
          </button>
          <span className="mt-0.5 block text-center text-[9px] font-bold text-blue-600">
            Ficha
          </span>
        </div>

        {/* Ministérios */}
        <button
          onClick={() => handleNav('ministries')}
          className={`flex flex-col items-center justify-center rounded-xl px-2.5 py-1 transition-colors ${
            activeTab === 'ministries' ? 'font-bold text-blue-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="h-5 w-5" />
          <span className="mt-0.5 text-[10px] font-medium">Equipes</span>
        </button>

        {/* Menu Geral */}
        <button
          onClick={onOpenSidebar}
          className="flex flex-col items-center justify-center rounded-xl px-2.5 py-1 text-slate-500 transition-colors hover:text-slate-800"
        >
          <Menu className="h-5 w-5" />
          <span className="mt-0.5 text-[10px] font-medium">Mais</span>
        </button>
      </div>
    </nav>
  );
};
