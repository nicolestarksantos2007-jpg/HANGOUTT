'use client';

import React, { useState } from 'react';
import { useHangout } from '@/context/HangoutContext';
import { Service, ServiceStatus } from '@/types/hangout';
import { Calendar, Plus, CheckCircle, AlertCircle, Clock, Search, Filter } from 'lucide-react';

export const ServicesView: React.FC = () => {
  const { services, addService, approveService, returnService } = useHangout();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
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
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filtered = services.filter(s => {
    const matchesSearch = s.service_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        notes,
        status: 'submitted',
      });
      setIsModalOpen(false);
      // Reset
      setTotalAttendance(0);
      setTotalVisitors(0);
      setDecisionsJesus(0);
      setReconciliations(0);
      setBaptismDecisions(0);
      setNotes('');
    } catch (err) {
      console.error(err);
      alert('Erro ao cadastrar culto. Verifique o banco.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Top Header com Botão de Novo Culto */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 sm:text-2xl">Gestão de Cultos</h2>
          <p className="text-xs text-slate-500">Cadastro oficial, contagem de presenças e fluxo de aprovação</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Registrar Culto</span>
        </button>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome do culto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="all">Todos os Status</option>
            <option value="approved">Aprovados</option>
            <option value="submitted">Pendentes de Revisão</option>
            <option value="returned">Devolvidos</option>
          </select>
        </div>
      </div>

      {/* Tabela de Cultos */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Data & Culto</th>
                <th className="px-4 py-3.5 text-center">Presentes</th>
                <th className="px-4 py-3.5 text-center">Visitantes</th>
                <th className="px-4 py-3.5 text-center">Decisões</th>
                <th className="px-4 py-3.5 text-center">Batismos</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Calendar className="mx-auto h-8 w-8 text-slate-300" />
                    <p className="mt-2 text-xs font-semibold">Nenhum culto encontrado para os filtros selecionados.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((service) => (
                  <tr key={service.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900">{service.service_name}</p>
                      <p className="text-[11px] text-slate-500">
                        {new Date(service.service_date).toLocaleDateString('pt-BR')} • {service.service_time}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-slate-900">
                      {service.total_attendance}
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-blue-600">
                      {service.total_visitors}
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-rose-600">
                      {service.decisions_jesus + service.reconciliations}
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-cyan-600">
                      {service.baptism_decisions}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        service.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : service.status === 'returned'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {service.status === 'approved' && <CheckCircle className="h-3 w-3" />}
                        {service.status === 'returned' && <AlertCircle className="h-3 w-3" />}
                        {service.status === 'submitted' && <Clock className="h-3 w-3" />}
                        <span>
                          {service.status === 'approved' ? 'Aprovado' : service.status === 'returned' ? 'Devolvido' : 'Pendente'}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      {service.status !== 'approved' && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => approveService(service.id)}
                            className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 transition-colors"
                          >
                            Aprovar
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('Motivo da devolução:');
                              if (reason) returnService(service.id, reason);
                            }}
                            className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          >
                            Devolver
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Registro de Culto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900">Registrar Culto Oficial</h3>
            <p className="text-xs text-slate-500">Preencha os números reais apurados no culto</p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500">Data do Culto</label>
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
                <label className="text-[11px] font-bold uppercase text-slate-500">Nome / Identificação</label>
                <input
                  type="text"
                  required
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="Ex: Culto de Domingo Noite"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500">Total de Presentes</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={totalAttendance}
                    onChange={(e) => setTotalAttendance(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500">Total de Visitantes</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={totalVisitors}
                    onChange={(e) => setTotalVisitors(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500">Aceitaram Jesus</label>
                  <input
                    type="number"
                    min="0"
                    value={decisionsJesus}
                    onChange={(e) => setDecisionsJesus(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs font-bold text-rose-600"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500">Reconciliações</label>
                  <input
                    type="number"
                    min="0"
                    value={reconciliations}
                    onChange={(e) => setReconciliations(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs font-bold text-rose-600"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500">Decisão Batismo</label>
                  <input
                    type="number"
                    min="0"
                    value={baptismDecisions}
                    onChange={(e) => setBaptismDecisions(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs font-bold text-cyan-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500">Observações Operacionais</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Informações sobre equipe, recepção ou ocorrências..."
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
                  {isSubmitting ? 'Salvando...' : 'Enviar para Revisão'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
