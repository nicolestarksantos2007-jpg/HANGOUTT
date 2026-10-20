'use client';

import React from 'react';
import { useHangout } from '@/context/HangoutContext';
import { 
  Users, 
  UserPlus, 
  HeartHandshake, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  Flame,
  Award
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  LineChart, 
  Line 
} from 'recharts';

export const DashboardView: React.FC = () => {
  const { metrics, services, visitors, loading, setActiveTab } = useHangout();

  const approvedServices = services.filter(s => s.status === 'approved');
  const pendingServices = services.filter(s => s.status !== 'approved');

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Banner de Boas-vindas / Visão Hangout */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0A192F] via-[#1E3A8A] to-[#2563EB] p-6 text-white shadow-xl shadow-blue-900/10 sm:p-8">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            <Flame className="h-4 w-4 text-blue-300" />
            <span>Outside & Ivales — Ministério Hangout</span>
          </div>
          <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
            Painel Geral de Cultos & Vidas
          </h2>
          <p className="mt-2 text-sm text-blue-100/90 leading-relaxed sm:text-base">
            &ldquo;Portanto, acolham uns aos outros, como Cristo os acolheu, para a glória de Deus.&rdquo; (Romanos 15:7)
          </p>
        </div>
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
      </div>

      {/* Grid de 8 Cards de Indicadores Oficiais */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total de Presentes nos Cultos */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all hover:shadow-md sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Presentes em Cultos</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900 sm:text-3xl">
              {metrics.totalAttendance.toLocaleString('pt-BR')}
            </p>
            <p className="mt-1 flex items-center text-[11px] font-medium text-emerald-600">
              <ArrowUpRight className="mr-0.5 h-3.5 w-3.5" />
              <span>+{metrics.monthlyGrowth.attendanceGrowthPct}% vs mês anterior</span>
            </p>
          </div>
        </div>

        {/* Total de Visitantes Registrados */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all hover:shadow-md sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Visitantes Registrados</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <UserPlus className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900 sm:text-3xl">
              {metrics.totalVisitors.toLocaleString('pt-BR')}
            </p>
            <p className="mt-1 flex items-center text-[11px] font-medium text-emerald-600">
              <ArrowUpRight className="mr-0.5 h-3.5 w-3.5" />
              <span>+{metrics.monthlyGrowth.visitorsGrowthPct}% de novos contatos</span>
            </p>
          </div>
        </div>

        {/* Decisões por Cristo (Jesus + Reconciliação) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all hover:shadow-md sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Decisões por Cristo</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <HeartHandshake className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900 sm:text-3xl">
              {(metrics.totalDecisionsJesus + metrics.totalReconciliations).toLocaleString('pt-BR')}
            </p>
            <p className="mt-1 text-[11px] font-medium text-slate-500">
              {metrics.totalDecisionsJesus} novas vidas • {metrics.totalReconciliations} reconciliações
            </p>
          </div>
        </div>

        {/* Decisões pelo Batismo */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all hover:shadow-md sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Decisão pelo Batismo</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900 sm:text-3xl">
              {metrics.totalBaptismDecisions.toLocaleString('pt-BR')}
            </p>
            <p className="mt-1 text-[11px] font-medium text-slate-500">
              Passos intencionais de fé
            </p>
          </div>
        </div>

        {/* Voluntários Distintos que Serviram */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all hover:shadow-md sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Voluntários Distintos</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900 sm:text-3xl">
              {metrics.distinctVolunteersServed}
            </p>
            <p className="mt-1 text-[11px] font-medium text-slate-500">
              Pessoas únicas servindo
            </p>
          </div>
        </div>

        {/* Total de Participações nos Ministérios */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all hover:shadow-md sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Participações Totais</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900 sm:text-3xl">
              {metrics.totalVolunteerParticipations}
            </p>
            <p className="mt-1 text-[11px] font-medium text-slate-500">
              Escalas cumpridas nos times
            </p>
          </div>
        </div>

        {/* Cultos Realizados e Aprovados */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all hover:shadow-md sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Cultos Aprovados</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900 sm:text-3xl">
              {metrics.totalServicesCount}
            </p>
            <p className="mt-1 text-[11px] font-medium text-emerald-600">
              100% dos dados auditados
            </p>
          </div>
        </div>

        {/* Novas Pessoas em Acompanhamento */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all hover:shadow-md sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Funil de Vidas</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-slate-900 sm:text-3xl">
              {metrics.totalNewPeople}
            </p>
            <p className="mt-1 text-[11px] font-medium text-slate-500">
              Pessoas no funil de cuidado
            </p>
          </div>
        </div>
      </div>

      {/* Gráficos Recharts Analíticos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Gráfico 1: Presenças e Visitantes nos Cultos */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Evolução de Presença & Visitantes</h3>
              <p className="text-xs text-slate-500">Média de público por mês oficial</p>
            </div>
            <span className="rounded-md bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-700">
              Histórico
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.monthlyChartData}>
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
                <Bar dataKey="attendance" name="Presentes" fill="#2563EB" radius={[6, 6, 0, 0]} />
                <Bar dataKey="visitors" name="Visitantes" fill="#0D9488" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Decisões Espirituais e Voluntários */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Decisões por Cristo & Engajamento</h3>
              <p className="text-xs text-slate-500">Passos de fé e serviço nos cultos</p>
            </div>
            <span className="rounded-md bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-700">
              Vidas
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.monthlyChartData}>
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
                <Line
                  type="monotone"
                  dataKey="decisions"
                  name="Decisões"
                  stroke="#E11D48"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#E11D48' }}
                />
                <Line
                  type="monotone"
                  dataKey="volunteers"
                  name="Voluntários"
                  stroke="#4F46E5"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#4F46E5' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lista Rápida: Últimos Cultos Registrados e Pendências */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Últimos Cultos Registrados</h3>
            <p className="text-xs text-slate-500">Dados consolidados do ministério</p>
          </div>
          <button
            onClick={() => setActiveTab('services')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            Ver todos ({services.length}) →
          </button>
        </div>

        <div className="mt-4 divide-y divide-slate-100">
          {services.length === 0 ? (
            <div className="py-8 text-center">
              <Calendar className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-2 text-sm font-semibold text-slate-700">Nenhum culto registrado ainda</p>
              <p className="text-xs text-slate-500">Execute o script SQL no Supabase para inicializar os registros.</p>
            </div>
          ) : (
            services.slice(0, 5).map((service) => (
              <div key={service.id} className="flex flex-col gap-2 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{service.service_name}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      service.status === 'approved' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : service.status === 'returned'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {service.status === 'approved' ? 'Aprovado' : service.status === 'returned' ? 'Devolvido' : 'Pendente de Revisão'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Data: {new Date(service.service_date).toLocaleDateString('pt-BR')} às {service.service_time}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold text-slate-700">
                  <span className="rounded-lg bg-slate-50 px-2.5 py-1">
                    👥 {service.total_attendance} presentes
                  </span>
                  <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-blue-700">
                    👋 {service.total_visitors} visitantes
                  </span>
                  <span className="rounded-lg bg-rose-50 px-2.5 py-1 text-rose-700">
                    ❤️ {service.decisions_jesus + service.reconciliations} decisões
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
