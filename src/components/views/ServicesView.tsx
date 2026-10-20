'use client';

import React, { useState } from 'react';
import { useHangout } from '@/context/HangoutContext';
import { Calendar, Plus, CheckCircle, AlertCircle, Clock, Search, Filter, HeartHandshake, Award, Users, UserPlus } from 'lucide-react';

export const ServicesView: React.FC = () => {
  const { services, addService, approveService, returnService } = useHangout();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [serviceName, setServiceName] = useState('Culto de Celebração');
  const [serviceTime, setServiceTime] = useState('19:30');
  const [totalAttendance, setTotalAttendance] = useState(0);
  const [totalVisitors, setTotalVisitors] = useState(0);
  const [decisionsJesus, setDecisionsJesus] = useState(0);
  const [reconciliations, setReconciliations] = useState(0);
  const [baptismDecisions, setBaptismDecisions] = useState(0);
  const [volunteersServedCount, setVolunteersServedCount] = useState(0);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtro
  const filtered = services.filter(s => {
    const matchesSearch = s.service_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = selectedDateFilter === 'all' || s.service_date === selectedDateFilter;
    return matchesSearch && matchesDate;
  });

  // Lista de datas distintas para o filtro
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
        volunteers_served_count: Number(volunteersServedCount),
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
      setVolunteersServedCount(0);
      setNotes('');
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
            Lançamento e consulta oficial por data: presenças, visitantes, decisões e voluntários
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-95"
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

      {/* Tabela Oficial de Dados de Cultos (Separado por Data) */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Data do Culto</th>
                <th className="px-4 py-3.5 text-center">Presentes</th>
                <th className="px-4 py-3.5 text-center">Visitantes</th>
                <th className="px-4 py-3.5 text-center">Aceitaram Jesus</th>
                <th className="px-4 py-3.5 text-center">Reconciliação</th>
                <th className="px-4 py-3.5 text-center">Batismos</th>
                <th className="px-4 py-3.5 text-center">Voluntários</th>
                <th className="px-4 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Calendar className="mx-auto h-8 w-8 text-slate-300" />
                    <p className="mt-2 text-xs font-semibold">Nenhum dado de culto registrado ainda.</p>
                    <p className="text-[11px] text-slate-500">Clique em &ldquo;Lançar Dados do Culto&rdquo; para registrar.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((service) => (
                  <tr key={service.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-blue-50 px-2.5 py-1 font-black text-blue-700 text-xs">
                          {new Date(service.service_date).toLocaleDateString('pt-BR')}
                        </span>
                        <div>
                          <p className="font-bold text-slate-900">{service.service_name}</p>
                          <p className="text-[10px] text-slate-400">{service.service_time}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-slate-900">
                      {service.total_attendance}
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-blue-600">
                      {service.total_visitors}
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-rose-600">
                      {service.decisions_jesus}
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-purple-600">
                      {service.reconciliations}
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-cyan-600">
                      {service.baptism_decisions}
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-emerald-600">
                      {service.volunteers_served_count || 0}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                        <CheckCircle className="h-3 w-3" />
                        <span>Oficial</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Lançamento dos Dados do Culto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900">Lançar Dados do Culto</h3>
            <p className="text-xs text-slate-500">
              Preencha os números oficiais coletados no culto
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500">Data do Culto *</label>
                  <input
                    type="date"
                    required
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500">Horário</label>
                  <input
                    type="text"
                    required
                    value={serviceTime}
                    onChange={(e) => setServiceTime(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500">Identificação do Culto</label>
                <input
                  type="text"
                  required
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="Ex: Culto de Celebração - Domingo Noite"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-800"
                />
              </div>

              {/* Indicadores Principais */}
              <div className="grid grid-cols-3 gap-3 rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-600">👥 Total Presentes</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={totalAttendance}
                    onChange={(e) => setTotalAttendance(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-blue-600">👋 Visitantes</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={totalVisitors}
                    onChange={(e) => setTotalVisitors(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-bold text-blue-600"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-emerald-600">🛡️ Serviram no Culto</label>
                  <input
                    type="number"
                    min="0"
                    value={volunteersServedCount}
                    onChange={(e) => setVolunteersServedCount(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-bold text-emerald-700"
                  />
                </div>
              </div>

              {/* Decisões e Batismo Integrados */}
              <div className="grid grid-cols-3 gap-3 rounded-xl bg-rose-50/50 p-3.5 border border-rose-100">
                <div>
                  <label className="text-[10px] font-bold uppercase text-rose-700">❤️ Aceitaram Jesus</label>
                  <input
                    type="number"
                    min="0"
                    value={decisionsJesus}
                    onChange={(e) => setDecisionsJesus(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-rose-200 p-2 text-xs font-bold text-rose-600"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-purple-700">🕊️ Reconciliação</label>
                  <input
                    type="number"
                    min="0"
                    value={reconciliations}
                    onChange={(e) => setReconciliations(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-purple-200 p-2 text-xs font-bold text-purple-600"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-cyan-700">💧 Batismos</label>
                  <input
                    type="number"
                    min="0"
                    value={baptismDecisions}
                    onChange={(e) => setBaptismDecisions(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-cyan-200 p-2 text-xs font-bold text-cyan-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500">Observações Operacionais</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Informações sobre equipe, recepção ou destaques do culto..."
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
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
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-700 disabled:opacity-50"
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
