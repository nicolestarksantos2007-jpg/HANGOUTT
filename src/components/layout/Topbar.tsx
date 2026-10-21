'use client';

import React from 'react';
import { useHangout } from '@/context/HangoutContext';
import { useAuth } from '@/context/AuthContext';
import { HangoutPageKey } from '@/types/hangout';
import { Menu, Plus, RefreshCw, Sparkles, ClipboardList, LogOut, ShieldCheck } from 'lucide-react';

interface TopbarProps {
  onOpenSidebar: () => void;
  onOpenNewService?: () => void;
  onOpenVisitorCard?: () => void;
}

const PAGE_TITLES: Record<HangoutPageKey, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard Geral', subtitle: 'Métricas oficiais de cultos, presenças, decisões e voluntários' },
  services: { title: 'Dados de Cultos', subtitle: 'Registros detalhados por data: presentes, visitantes, decisões e equipe' },
  visitor_card: { title: 'Ficha do Visitante', subtitle: 'Preenchimento oficial para voluntários em serviço no Hangout' },
  ministries: { title: '10 Ministérios Oficiais', subtitle: 'Hangout, Staff, Projeção, Stories, Fotos, Infra, Gestão, Profético, Músicos, Ministração' },
  volunteers: { title: 'Base Geral de Voluntários', subtitle: 'Escalas de serviço e participação nos cultos por time' },
  reports: { title: 'Relatórios Mensais', subtitle: 'Análises detalhadas mês a mês e exportação de dados' },
  approvals: { title: 'Painel de Aprovações', subtitle: 'Revisão, devolução e auditoria de registros da liderança' },
  user_admin: { title: 'Painel de Liderança', subtitle: 'Aprovação de novos voluntários e líderes de time' },
};

export const Topbar: React.FC<TopbarProps> = ({ 
  onOpenSidebar,
  onOpenNewService,
  onOpenVisitorCard
}) => {
  const { activeTab, refreshData, loading } = useHangout();
  const { profile, signOut } = useAuth();
  const current = PAGE_TITLES[activeTab] || PAGE_TITLES.dashboard;

  const roleBadgeLabel = 
    profile?.role === 'lider_base' 
      ? 'Líder Base' 
      : profile?.role === 'lider_time' 
      ? `Líder: ${profile?.team || 'Time'}` 
      : `Voluntário: ${profile?.team || 'Time'}`;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3.5 backdrop-blur-md sm:px-6 lg:px-8">
      {/* Lado Esquerdo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          aria-label="Abrir menu lateral"
          className="rounded-xl border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-[#0A192F] sm:text-xl">
              {current.title}
            </h1>
            <span className="hidden rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 sm:inline-flex">
              {roleBadgeLabel}
            </span>
          </div>
          <p className="hidden text-xs text-slate-500 sm:block">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Lado Direito */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => refreshData()}
          disabled={loading}
          title="Recarregar dados do banco"
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition-all hover:bg-slate-100 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          <span className="hidden sm:inline">Atualizar</span>
        </button>

        {onOpenVisitorCard && (
          <button
            onClick={onOpenVisitorCard}
            className="flex items-center gap-1.5 rounded-xl border border-blue-600/20 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 transition-all hover:bg-blue-100 active:scale-95"
          >
            <ClipboardList className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Ficha de Visitante</span>
            <span className="sm:hidden">Ficha</span>
          </button>
        )}

        {onOpenNewService && (
          <button
            onClick={onOpenNewService}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm shadow-blue-600/30 transition-all hover:bg-blue-700 active:scale-95"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Lançar Culto</span>
            <span className="sm:hidden">Culto</span>
          </button>
        )}

        <button
          onClick={() => signOut()}
          title="Sair do sistema"
          className="flex items-center gap-1 rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};
