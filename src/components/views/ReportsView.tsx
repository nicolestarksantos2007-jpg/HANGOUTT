'use client';

import React from 'react';
import { useHangout } from '@/context/HangoutContext';
import { useAuth } from '@/context/AuthContext';
import { BarChart3, TrendingUp, Users, HeartHandshake, Download, Crown } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { metrics, services } = useHangout();
  const { profile } = useAuth();

  const isTeamLeader = profile?.role === 'lider_time';
  const userTeam = profile?.team;

  const scopedServices = isTeamLeader && userTeam
    ? services.filter(s => s.serving_team === userTeam)
    : services;

  const totalServices = isTeamLeader ? scopedServices.length : metrics.totalServicesCount;
  const totalAttendance = isTeamLeader 
    ? scopedServices.reduce((acc, s) => acc + (s.total_attendance || 0), 0)
    : metrics.totalAttendance;
  const totalVisitors = isTeamLeader
    ? scopedServices.reduce((acc, s) => acc + (s.total_visitors || 0), 0)
    : metrics.totalVisitors;
  const totalDecisions = isTeamLeader
    ? scopedServices.reduce((acc, s) => acc + ((s.decisions_jesus || 0) + (s.reconciliations || 0)), 0)
    : (metrics.totalDecisionsJesus + metrics.totalReconciliations);

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Data,Culto,Time,Presentes,Visitantes,Decisoes,Batismos,Status\n"
      + scopedServices.map(s => `${s.service_date},${s.service_name},${s.serving_team || 'Geral'},${s.total_attendance},${s.total_visitors},${(s.decisions_jesus || 0) + (s.reconciliations || 0)},${s.baptism_decisions || 0},${s.status}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `hangout_relatorio_${isTeamLeader ? userTeam?.replace(/\s+/g, '_') : 'geral'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 sm:text-2xl">Relatórios Oficiais & Histórico</h2>
            {isTeamLeader ? (
              <span className="rounded-full bg-amber-100 px-3 py-0.5 text-xs font-bold text-amber-800 border border-amber-200">
                ⚡ Seu Time: {userTeam}
              </span>
            ) : (
              <span className="rounded-full bg-purple-100 px-3 py-0.5 text-xs font-bold text-purple-800 border border-purple-200 flex items-center gap-1">
                <Crown className="h-3 w-3" /> Acesso Geral (Líder Base)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            {isTeamLeader 
              ? `Métricas auditadas e consolidadas para os cultos do ${userTeam}`
              : 'Métricas auditadas e consolidadas para a liderança e igreja'}
          </p>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 active:scale-95"
        >
          <Download className="h-4 w-4 text-blue-600" />
          <span>Exportar Dados (CSV)</span>
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base">
          {isTeamLeader ? `Consolidado Oficial - ${userTeam}` : 'Consolidado Geral'}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {isTeamLeader 
            ? `Indicadores calculados a partir dos cultos realizados pelo ${userTeam}`
            : 'Indicadores calculados a partir de todos os cultos cadastrados'}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500">Total de Cultos</span>
            <p className="text-xl font-black text-slate-900 mt-1">{totalServices}</p>
          </div>
          <div className="rounded-xl bg-blue-50 p-4 border border-blue-100">
            <span className="text-[11px] font-semibold text-blue-600">Presenças Consolidadas</span>
            <p className="text-xl font-black text-blue-700 mt-1">{totalAttendance.toLocaleString('pt-BR')}</p>
          </div>
          <div className="rounded-xl bg-indigo-50 p-4 border border-indigo-100">
            <span className="text-[11px] font-semibold text-indigo-600">Visitantes Recebidos</span>
            <p className="text-xl font-black text-indigo-700 mt-1">{totalVisitors.toLocaleString('pt-BR')}</p>
          </div>
          <div className="rounded-xl bg-rose-50 p-4 border border-rose-100">
            <span className="text-[11px] font-semibold text-rose-600">Decisões por Cristo</span>
            <p className="text-xl font-black text-rose-700 mt-1">{totalDecisions.toLocaleString('pt-BR')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
