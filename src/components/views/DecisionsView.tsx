'use client';

import React, { useState } from 'react';
import { useHangout } from '@/context/HangoutContext';
import { HeartHandshake, Plus, Phone, Award, Sparkles, Calendar } from 'lucide-react';

export const DecisionsView: React.FC = () => {
  const { decisions, services, addDecision } = useHangout();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [personName, setPersonName] = useState('');
  const [phone, setPhone] = useState('');
  const [decisionType, setDecisionType] = useState<'jesus' | 'reconciliation' | 'baptism'>('jesus');
  const [serviceId, setServiceId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceId) {
      alert('Selecione o culto da decisão.');
      return;
    }
    try {
      setIsSubmitting(true);
      await addDecision({
        service_id: serviceId,
        person_name: personName,
        phone,
        decision_type: decisionType,
        notes
      });
      setIsModalOpen(false);
      setPersonName('');
      setPhone('');
      setNotes('');
    } catch (err) {
      console.error(err);
      alert('Erro ao registrar decisão.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 sm:text-2xl">Decisões e Marcos da Fé</h2>
          <p className="text-xs text-slate-500">Aceitaram Jesus, reconciliações e decisões pelo batismo</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-rose-600/20 transition-all hover:bg-rose-700 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Registrar Decisão</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {decisions.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-400 bg-white">
            <HeartHandshake className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-2 text-sm font-bold text-slate-700">Nenhuma decisão registrada individualmente</p>
            <p className="text-xs text-slate-500">Cadastre as pessoas que tomaram passos de fé nos cultos.</p>
          </div>
        ) : (
          decisions.map((dec) => (
            <div key={dec.id} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{dec.person_name}</h3>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                    <Phone className="h-3.5 w-3.5 text-rose-600" />
                    <span>{dec.phone || 'Sem telefone'}</span>
                  </div>
                </div>

                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  dec.decision_type === 'jesus'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : dec.decision_type === 'reconciliation'
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                }`}>
                  {dec.decision_type === 'jesus' ? 'Aceitou Jesus' : dec.decision_type === 'reconciliation' ? 'Reconciliação' : 'Decisão Batismo'}
                </span>
              </div>

              {dec.notes && (
                <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-600">
                  {dec.notes}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900">Registrar Decisão Espiritual</h3>
            <p className="text-xs text-slate-500">Passo de fé dado durante o apelo do culto</p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500">Nome da Pessoa *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome completo"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500">Telefone / WhatsApp</label>
                <input
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500">Tipo de Decisão *</label>
                <select
                  value={decisionType}
                  onChange={(e) => setDecisionType(e.target.value as any)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-800"
                >
                  <option value="jesus">Aceitou Jesus pela 1ª vez</option>
                  <option value="reconciliation">Reconciliação</option>
                  <option value="baptism">Decisão pelo Batismo</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500">Culto da Decisão *</label>
                <select
                  required
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-800"
                >
                  <option value="">Selecione o culto...</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.service_name} ({new Date(s.service_date).toLocaleDateString('pt-BR')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
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
                  className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-rose-600/30 hover:bg-rose-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Decisão'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
