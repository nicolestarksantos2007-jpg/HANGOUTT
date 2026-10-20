'use client';

import React, { useState } from 'react';
import { useHangout } from '@/context/HangoutContext';
import { 
  Users, 
  UserPlus, 
  HeartHandshake, 
  Flame, 
  Filter, 
  CheckCircle2, 
  Droplets,
  Building2,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';

const OFFICIAL_MINISTRIES = [
  'Hangout',
  'Staff',
  'Projeção',
  'Stories',
  'Fotos',
  'Infra',
  'Gestão',
  'Profético',
  'Músicos',
  'Ministração'
];

export const DashboardView: React.FC = () => {
  const { metrics, services, setActiveTab } = useHangout();
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>('all');

  const monthlyList = metrics.monthlyData || [];

  // Filtrar serviços do mês selecionado
  const selectedServices = selectedMonthKey === 'all'
    ? services
    : services.filter(s => s.service_date.startsWith(selectedMonthKey));

  // Dados consolidados do mês
  const currentMonthData = selectedMonthKey === 'all'
    ? {
        month: 'Todos os Meses (Consolidado)',
        attendance: metrics.totalAttendance,
        visitors: metrics.totalVisitors,
        decisions_jesus: metrics.totalDecisionsJesus,
        reconciliations: metrics.totalReconciliations,
        baptisms: metrics.totalBaptismDecisions,
        volunteers_served: metrics.totalVolunteerParticipations
      }
    : (monthlyList.find(m => m.monthKey === selectedMonthKey) || {
        month: 'Mês Selecionado',
        attendance: 0,
        visitors: 0,
        decisions_jesus: 0,
        reconciliations: 0,
        baptisms: 0,
        volunteers_served: 0
      });

  // Somar voluntários que serviram em cada ministério no período
  const ministryTotals: Record<string, number> = {};
  OFFICIAL_MINISTRIES.forEach(name => { ministryTotals[name] = 0; });

  selectedServices.forEach(s => {
    if (s.ministry_breakdown) {
      Object.entries(s.ministry_breakdown).forEach(([name, data]) => {
        if (ministryTotals[name] !== undefined) {
          ministryTotals[name] += (data.count || 0);
        }
      });
    }
  });

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Banner de Boas-vindas */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0A192F] via-[#1E3A8A] to-[#2563EB] p-6 text-white shadow-xl shadow-blue-900/10 sm:p-8">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            <Flame className="h-4 w-4 text-blue-300" />
            <span>Outside & Ivales — Ministério Hangout</span>
          </div>
          <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
            Dashboard Geral de Cultos & Vidas
          </h2>
          <p className="mt-2 text-sm text-blue-100/90 leading-relaxed sm:text-base">
            Métricas oficiais apuradas por culto: presenças, visitantes, decisões e voluntários servindo.
          </p>
        </div>
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
      </div>

      {/* Seletor do Mês de Análise */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-blue-600" />
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Visualização Mensal dos Indicadores</h3>
            <p className="text-xs text-slate-500">Selecione o mês para ver o balanço exato dos cultos</p>
          </div>
        </div>

        <select
          value={selectedMonthKey}
          onChange={(e) => setSelectedMonthKey(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-800 focus:border-blue-500 focus:outline-none"
        >
          <option value="all">📊 Visão Geral (Todos os Meses)</option>
          {monthlyList.map(m => (
            <option key={m.monthKey} value={m.monthKey}>
              🗓️ {m.month}
            </option>
          ))}
        </select>
      </div>

      {/* 6 Cards Oficiais do Mês Solicitados pelo Usuário */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
        {/* 1. Total Presentes */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase">Presentes</span>
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">
            {currentMonthData.attendance.toLocaleString('pt-BR')}
          </p>
          <p className="mt-0.5 text-[10px] text-slate-400">Total nos cultos</p>
        </div>

        {/* 2. Total de Visitas */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-[11px] font-bold uppercase">Visitas</span>
            <UserPlus className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-black text-blue-600">
            {currentMonthData.visitors.toLocaleString('pt-BR')}
          </p>
          <p className="mt-0.5 text-[10px] text-slate-400">Novos contatos</p>
        </div>

        {/* 3. Aceitaram Jesus */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-rose-600">
            <span className="text-[11px] font-bold uppercase">Jesus</span>
            <HeartHandshake className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-black text-rose-600">
            {currentMonthData.decisions_jesus.toLocaleString('pt-BR')}
          </p>
          <p className="mt-0.5 text-[10px] text-slate-400">1ª vez com Cristo</p>
        </div>

        {/* 4. Reconciliação */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-purple-600">
            <span className="text-[11px] font-bold uppercase">Reconciliação</span>
            <Sparkles className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-black text-purple-600">
            {currentMonthData.reconciliations.toLocaleString('pt-BR')}
          </p>
          <p className="mt-0.5 text-[10px] text-slate-400">Retorno aos caminhos</p>
        </div>

        {/* 5. Batismos */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-cyan-600">
            <span className="text-[11px] font-bold uppercase">Batismos</span>
            <Droplets className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-black text-cyan-600">
            {currentMonthData.baptisms.toLocaleString('pt-BR')}
          </p>
          <p className="mt-0.5 text-[10px] text-slate-400">Decisão pelo batismo</p>
        </div>

        {/* 6. Pessoas que Serviram */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[11px] font-bold uppercase">Serviram</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-600">
            {currentMonthData.volunteers_served.toLocaleString('pt-BR')}
          </p>
          <p className="mt-0.5 text-[10px] text-slate-400">Voluntários em escala</p>
        </div>
      </div>

      {/* ⭐ NOVO: Voluntários que Serviram em Cada um dos 10 Ministérios no Período */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <span>Voluntários que Serviram por Ministério ({selectedMonthKey === 'all' ? 'Geral' : currentMonthData.month})</span>
            </h3>
            <p className="text-xs text-slate-500">
              Total de participações de voluntários em cada um dos 10 times oficiais
            </p>
          </div>

          <button
            onClick={() => setActiveTab('services')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            Lançar culto →
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {OFFICIAL_MINISTRIES.map((name) => {
            const count = ministryTotals[name] || 0;
            return (
              <div key={name} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 text-center">
                <span className="font-bold text-slate-800 text-xs block">{name}</span>
                <p className="text-xl font-black text-blue-600 mt-1">{count}</p>
                <span className="text-[10px] text-slate-400 font-medium">participações</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gráficos Mensais Analíticos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Gráfico 1: Vidas (Jesus, Reconciliações, Batismos) */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Decisões & Marcos por Mês</h3>
              <p className="text-xs text-slate-500">Aceitaram Jesus, Reconciliação e Batismos</p>
            </div>
            <span className="rounded-md bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700">
              Vidas
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyList}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0A192F',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Legend />
                <Bar dataKey="decisions_jesus" name="Aceitaram Jesus" fill="#E11D48" radius={[4, 4, 0, 0]} />
                <Bar dataKey="reconciliations" name="Reconciliações" fill="#9333EA" radius={[4, 4, 0, 0]} />
                <Bar dataKey="baptisms" name="Batismos" fill="#0891B2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Presenças, Visitantes e Voluntários Servindo */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Público & Voluntários por Mês</h3>
              <p className="text-xs text-slate-500">Presentes, Visitantes e Pessoas que Serviram</p>
            </div>
            <span className="rounded-md bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
              Culto & Equipe
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyList}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0A192F',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Legend />
                <Bar dataKey="attendance" name="Presentes" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="visitors" name="Visitas" fill="#0D9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="volunteers_served" name="Serviram" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabela de Fechamento Mensal */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Tabela de Fechamento por Mês</h3>
            <p className="text-xs text-slate-500">Consolidado oficial de cada indicador mês a mês</p>
          </div>
          <button
            onClick={() => setActiveTab('services')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            Ver dados de cultos ({services.length}) →
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Mês</th>
                <th className="px-3 py-3 text-center">Presentes</th>
                <th className="px-3 py-3 text-center">Visitas</th>
                <th className="px-3 py-3 text-center text-rose-600">Jesus</th>
                <th className="px-3 py-3 text-center text-purple-600">Reconciliação</th>
                <th className="px-3 py-3 text-center text-cyan-600">Batismo</th>
                <th className="px-3 py-3 text-center text-emerald-600">Serviram</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {monthlyList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Nenhum culto com dados registrado ainda.
                  </td>
                </tr>
              ) : (
                monthlyList.map((m) => (
                  <tr key={m.monthKey} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-900">{m.month}</td>
                    <td className="px-3 py-3 text-center font-bold text-slate-900">{m.attendance}</td>
                    <td className="px-3 py-3 text-center font-bold text-blue-600">{m.visitors}</td>
                    <td className="px-3 py-3 text-center font-bold text-rose-600">{m.decisions_jesus}</td>
                    <td className="px-3 py-3 text-center font-bold text-purple-600">{m.reconciliations}</td>
                    <td className="px-3 py-3 text-center font-bold text-cyan-600">{m.baptisms}</td>
                    <td className="px-3 py-3 text-center font-bold text-emerald-600">{m.volunteers_served}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
