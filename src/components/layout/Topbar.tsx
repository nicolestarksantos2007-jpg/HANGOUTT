'use client';

import React from 'react';
import { useHangout, HangoutPageKey } from '@/context/HangoutContext';
import { Menu, Plus, RefreshCw, Sparkles } from 'lucide-react';

interface TopbarProps {
  onOpenSidebar: () => void;
  onOpenNewService?: () => void;
  onOpenNewVisitor?: () => void;
}

const PAGE_TITLES: Record<HangoutPageKey, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard Geral', subtitle: 'Indicadores oficiais e crescimento do ministério' },
  services: { title: 'Gestão de Cultos', subtitle: 'Registro, conferência e aprovação dos cultos' },
  ministries: { title: 'Gestão de Ministérios', subtitle: 'Times de serviço, líderes e voluntários' },
  volunteers: { title: 'Base Geral de Voluntários', subtitle: 'Histórico individual de escalas e serviço' },
  visitors: { title: 'Visitantes por Culto', subtitle: 'Recepção, contatos e voluntários captadores' },
  decisions: { title: 'Decisões e Batismo', subtitle: 'Aceitaram Jesus, reconciliações e passos de fé' },
  integration: { title: 'Acompanhamento de Vidas', subtitle: 'Funil de integração de novas pessoas' },
  reports: { title: 'Relatórios & Histórico', subtitle: 'Análises mensais e evolução dos cultos' },
  approvals: { title: 'Painel de Aprovações', subtitle: 'Revisão, devolução e auditoria de registros' },
};

export const Topbar: React.FC<TopbarProps> = ({ 
  onOpenSidebar,
  onOpenNewService,
  onOpenNewVisitor
}) => {
  const { activeTab, refreshData, loading } = useHangout();
  const current = PAGE_TITLES[activeTab] || PAGE_TITLES.dashboard;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3.5 backdrop-blur-md sm:px-6 lg:px-8">
      {/* Lado Esquerdo: Botão Menu + Título da Página */}
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
              Hangout Oficial
            </span>
          </div>
          <p className="hidden text-xs text-slate-500 sm:block">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Lado Direito: Ações Rápidas */}
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

        {onOpenNewVisitor && (
          <button
            onClick={onOpenNewVisitor}
            className="flex items-center gap-1.5 rounded-xl border border-blue-600/20 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 transition-all hover:bg-blue-100 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Cadastrar Visitante</span>
            <span className="sm:hidden">Visitante</span>
          </button>
        )}

        {onOpenNewService && (
          <button
            onClick={onOpenNewService}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm shadow-blue-600/30 transition-all hover:bg-blue-700 active:scale-95"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Novo Culto</span>
          </button>
        )}
      </div>
    </header>
  );
};
