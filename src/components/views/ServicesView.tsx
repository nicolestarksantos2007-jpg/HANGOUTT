'use client';

import React, { useState } from 'react';
import { useHangout } from '@/context/HangoutContext';
import { Service, MinistryBreakdown } from '@/types/hangout';
import { 
  Calendar, 
  Plus, 
  CheckCircle, 
  Search, 
  Filter, 
  Users, 
  Building2, 
  Eye, 
  X, 
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const OFFICIAL_MINISTRIES = [
  { name: 'Hangout', desc: 'Recepção & Acolhimento', color: '#2563EB' },
  { name: 'Staff', desc: 'Fluxo & Apoio', color: '#1D4ED8' },
  { name: 'Projeção', desc: 'Telas & Letras', color: '#4338CA' },
  { name: 'Stories', desc: 'Mídias em Tempo Real', color: '#7C3AED' },
  { name: 'Fotos', desc: 'Fotografia Oficial', color: '#6D28D9' },
  { name: 'Infra', desc: 'Estrutura & Montagem', color: '#0F766E' },
  { name: 'Gestão', desc: 'Métricas & Suporte', color: '#0369A1' },
  { name: 'Profético', desc: 'Intercessão & Oração', color: '#B45309' },
  { name: 'Músicos', desc: 'Banda & Instrumentos', color: '#BE185D' },
  { name: 'Ministração', desc: 'Voz & Direção de Louvor', color: '#9D174D' },
];

export const ServicesView: React.FC = () => {
  const { services, addService } = useHangout();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedServiceDetail, setSelectedServiceDetail] = useState<Service | null>(null);
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);

  // Form State
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [serviceName, setServiceName] = useState('Culto de Celebração');
  const [serviceTime, setServiceTime] = useState('19:30');
  const [totalAttendance, setTotalAttendance] = useState(0);
  const [totalVisitors, setTotalVisitors] = useState(0);
  const [decisionsJesus, setDecisionsJesus] = useState(0);
  const [reconciliations, setReconciliations] = useState(0);
  const [baptismDecisions, setBaptismDecisions] = useState(0);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado para os 10 Ministérios (Quem e Quantos Serviram)
  const [ministryBreakdown, setMinistryBreakdown] = useState<Record<string, { count: number; names: string }>>({
    'Hangout': { count: 0, names: '' },
    'Staff': { count: 0, names: '' },
    'Projeção': { count: 0, names: '' },
    'Stories': { count: 0, names: '' },
    'Fotos': { count: 0, names: '' },
    'Infra': { count: 0, names: '' },
    'Gestão': { count: 0, names: '' },
    'Profético': { count: 0, names: '' },
    'Músicos': { count: 0, names: '' },
    'Ministração': { count: 0, names: '' },
  });

  // Atualizador de ministério
  const updateMinistry = (name: string, field: 'count' | 'names', value: any) => {
    setMinistryBreakdown(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        [field]: field === 'count' ? Math.max(0, parseInt(value) || 0) : value
      }
    }));
  };

  // Total de voluntários calculado automaticamente somando os ministérios
  const totalVolunteersCalculated = Object.values(ministryBreakdown).reduce(
    (acc, m) => acc + (m.count || 0), 0
  );

  // Filtro
  const filtered = services.filter(s => {
    const matchesSearch = s.service_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = selectedDateFilter === 'all' || s.service_date === selectedDateFilter;
    return matchesSearch && matchesDate;
  });

  const distinctDates = Array.from(new Set(services.map(s => s.service_date))).sort().reverse();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await addService({
        service_date: serviceDate,
        service_name: serviceName,
        service_time: serviceTime,
        total_attendance: Number(totalAttendance),
        total_visitors: Number(totalVisitors),
        decisions_jesus: Number(decisionsJesus),
        reconciliations: Number(reconciliations),
        baptism_decisions: Number(baptismDecisions),
        volunteers_served_count: totalVolunteersCalculated,
        ministry_breakdown: ministryBreakdown,
        notes,
        status: 'approved',
      });

      setIsModalOpen(false);
      // Reset
      setTotalAttendance(0);
      setTotalVisitors(0);
      setDecisionsJesus(0);
      setReconciliations(0);
      setBaptismDecisions(0);
      setNotes('');
      // Reset ministérios
      const resetMin: Record<string, { count: number; names: string }> = {};
      OFFICIAL_MINISTRIES.forEach(m => {
        resetMin[m.name] = { count: 0, names: '' };
      });
      setMinistryBreakdown(resetMin);
    } catch (err) {
      console.error(err);
      alert('Erro ao cadastrar dados do culto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 sm:text-2xl">Dados de Cultos</h2>
          <p className="text-xs text-slate-500">
            Lançamento por data: presenças, visitantes, decisões e equipe escalada por ministério
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Lançar Dados do Culto</span>
        </button>
      </div>

      {/* Barra de Filtros por Data e Busca */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por identificação do culto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={selectedDateFilter}
            onChange={(e) => setSelectedDateFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="all">Todas as Datas</option>
            {distinctDates.map(d => (
              <option key={d} value={d}>
                Data: {new Date(d).toLocaleDateString('pt-BR')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista / Tabela de Cultos */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center text-slate-400 bg-white">
            <Calendar className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-2 text-sm font-bold text-slate-700">Nenhum dado de culto registrado ainda</p>
            <p className="text-xs text-slate-500">Clique em &ldquo;Lançar Dados do Culto&rdquo; para preencher o primeiro relatório.</p>
          </div>
        ) : (
          filtered.map((service) => {
            const isExpanded = expandedServiceId === service.id;
            const breakdown = service.ministry_breakdown || {};
            const totalVol = service.volunteers_served_count || 0;

            return (
              <div key={service.id} className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-all hover:shadow-md">
                {/* Linha Principal do Culto */}
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 font-black text-white text-xs shadow-sm">
                      {new Date(service.service_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-base">{service.service_name}</h3>
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                          Oficial
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Horário: {service.service_time} • Data completa: {new Date(service.service_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  {/* Números Principais em Badges */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-xl bg-slate-100 px-3 py-1.5 font-bold text-slate-800">
                      👥 {service.total_attendance} presentes
                    </span>
                    <span className="rounded-xl bg-blue-50 px-3 py-1.5 font-bold text-blue-700">
                      👋 {service.total_visitors} visitas
                    </span>
                    <span className="rounded-xl bg-rose-50 px-3 py-1.5 font-bold text-rose-700">
                      ❤️ {service.decisions_jesus} Jesus
                    </span>
                    <span className="rounded-xl bg-purple-50 px-3 py-1.5 font-bold text-purple-700">
                      🕊️ {service.reconciliations} reconciliações
                    </span>
                    <span className="rounded-xl bg-cyan-50 px-3 py-1.5 font-bold text-cyan-700">
                      💧 {service.baptism_decisions} batismos
                    </span>
                    <span className="rounded-xl bg-emerald-50 px-3 py-1.5 font-bold text-emerald-700">
                      🛡️ {totalVol} serviram
                    </span>

                    {/* Botão de Expandir Detalhes dos Ministérios */}
                    <button
                      onClick={() => setExpandedServiceId(isExpanded ? null : service.id)}
                      className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-50 active:scale-95"
                    >
                      <span>Ministérios</span>
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Área Expandida: Quem e Quantos Serviram nos 10 Ministérios */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/60 p-5">
                    <div className="flex items-center justify-between pb-3">
                      <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                        Equipe que Serviu por Ministério ({totalVol} voluntários no total)
                      </h4>
                      <span className="text-[11px] text-slate-500">Culto de {new Date(service.service_date).toLocaleDateString('pt-BR')}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
                      {OFFICIAL_MINISTRIES.map((min) => {
                        const data = breakdown[min.name] || { count: 0, names: '' };
                        const hasServed = data.count > 0;

                        return (
                          <div 
                            key={min.name}
                            className={`rounded-2xl border p-3 transition-all ${
                              hasServed 
                                ? 'border-blue-200 bg-white shadow-xs' 
                                : 'border-slate-200/50 bg-slate-100/50 opacity-60'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 text-xs">{min.name}</span>
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                                hasServed ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                              }`}>
                                {data.count}
                              </span>
                            </div>

                            <p className="mt-1 text-[10px] text-slate-400 truncate">{min.desc}</p>

                            {data.names ? (
                              <p className="mt-2 border-t border-slate-100 pt-1.5 text-[11px] font-medium text-slate-700 leading-snug">
                                <span className="font-bold text-slate-900">Serviram:</span> {data.names}
                              </p>
                            ) : (
                              <p className="mt-2 text-[10px] italic text-slate-400">
                                {hasServed ? 'Nomes não descritos' : 'Ninguém escalado'}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {service.notes && (
                      <div className="mt-3 rounded-xl bg-white p-3 border border-slate-200 text-xs text-slate-700">
                        <span className="font-bold text-slate-900">Observações Operacionais:</span> {service.notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Lançamento dos Dados do Culto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="my-8 w-full max-w-3xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900 sm:text-xl">Lançar Dados Oficiais do Culto</h3>
                <p className="text-xs text-slate-500">
                  Preencha os números apurados e a quantidade de pessoas que serviram em cada ministério
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-5">
              {/* 1. Data e Nome do Culto */}
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-600">Data do Culto *</label>
                  <input
                    type="date"
                    required
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-600">Horário</label>
                  <input
                    type="text"
                    required
                    value={serviceTime}
                    onChange={(e) => setServiceTime(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-600">Nome / Identificação</label>
                  <input
                    type="text"
                    required
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    placeholder="Ex: Celebração Domingo Noite"
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>

              {/* 2. Presentes e Visitantes */}
              <div className="grid grid-cols-2 gap-3.5 rounded-2xl bg-blue-50/50 p-4 border border-blue-100">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-800">👥 Total de Pessoas Presentes *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={totalAttendance}
                    onChange={(e) => setTotalAttendance(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-black text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-blue-700">👋 Total de Visitantes *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={totalVisitors}
                    onChange={(e) => setTotalVisitors(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-black text-blue-700"
                  />
                </div>
              </div>

              {/* 3. Decisões e Batismos */}
              <div className="grid grid-cols-3 gap-3 rounded-2xl bg-rose-50/40 p-4 border border-rose-100">
                <div>
                  <label className="text-[10px] font-bold uppercase text-rose-700">❤️ Aceitaram Jesus</label>
                  <input
                    type="number"
                    min="0"
                    value={decisionsJesus}
                    onChange={(e) => setDecisionsJesus(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-rose-200 bg-white p-2 text-xs font-bold text-rose-600"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-purple-700">🕊️ Reconciliações</label>
                  <input
                    type="number"
                    min="0"
                    value={reconciliations}
                    onChange={(e) => setReconciliations(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-purple-200 bg-white p-2 text-xs font-bold text-purple-600"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-cyan-700">💧 Decisão Batismo</label>
                  <input
                    type="number"
                    min="0"
                    value={baptismDecisions}
                    onChange={(e) => setBaptismDecisions(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-cyan-200 bg-white p-2 text-xs font-bold text-cyan-600"
                  />
                </div>
              </div>

              {/* 4. ⭐ QUEM E QUANTOS SERVIRAM POR MINISTÉRIO (OS 10 MINISTÉRIOS) */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      <span>Quem e Quantos Serviram nos 10 Ministérios</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Informe quantos voluntários serviram em cada time no dia do culto e seus nomes
                    </p>
                  </div>

                  <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-black text-white shadow-xs">
                    Total Servindo: {totalVolunteersCalculated} pessoas
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {OFFICIAL_MINISTRIES.map((min) => {
                    const current = ministryBreakdown[min.name] || { count: 0, names: '' };

                    return (
                      <div key={min.name} className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs">{min.name}</span>
                          <div className="flex items-center gap-1.5">
                            <label className="text-[10px] text-slate-400 font-bold uppercase">Qtd:</label>
                            <input
                              type="number"
                              min="0"
                              value={current.count}
                              onChange={(e) => updateMinistry(min.name, 'count', e.target.value)}
                              className="w-14 rounded-lg border border-slate-200 bg-slate-50 p-1 text-center text-xs font-black text-blue-700 focus:border-blue-500 focus:bg-white focus:outline-none"
                            />
                          </div>
                        </div>

                        <input
                          type="text"
                          placeholder="Quem serviu? (ex: Duda, Beto, Pedro)"
                          value={current.names}
                          onChange={(e) => updateMinistry(min.name, 'names', e.target.value)}
                          className="mt-2 w-full rounded-lg border border-slate-100 bg-slate-50/70 p-1.5 text-[11px] font-medium text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500">Observações Operacionais</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Informações adicionais do culto..."
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Dados do Culto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
