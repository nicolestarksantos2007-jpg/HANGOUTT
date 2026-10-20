'use client';

import React, { useState } from 'react';
import { useHangout } from '@/context/HangoutContext';
import { ClipboardList, CheckCircle2, User, Phone, Calendar, Users, Sparkles, Send } from 'lucide-react';

export const VisitorCardView: React.FC = () => {
  const { visitors, addVisitor, services } = useHangout();

  // Form State
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<string>('');
  const [phone, setPhone] = useState('');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [accompanied, setAccompanied] = useState(false); // false = Sozinho, true = Acompanhado
  const [contactVolunteerName, setContactVolunteerName] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      alert('Por favor, informe o nome do visitante.');
      return;
    }

    try {
      setIsSubmitting(true);
      await addVisitor({
        full_name: fullName.trim(),
        age: age ? parseInt(age) : undefined,
        phone: phone.trim() || undefined,
        visit_date: visitDate,
        accompanied,
        contact_volunteer_name: contactVolunteerName.trim() || undefined,
        service_id: serviceId || undefined
      });

      setSuccessMessage(true);
      // Reset campos principais
      setFullName('');
      setAge('');
      setPhone('');
      setAccompanied(false);

      // Auto ocultar feedback após 4s
      setTimeout(() => setSuccessMessage(false), 4000);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar ficha de visitante. Verifique a conexão.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 sm:text-2xl">Ficha Oficial do Visitante</h2>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
              Uso dos Voluntários
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Preenchimento rápido e intencional durante a recepção e cultos do Hangout
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-700">
          <ClipboardList className="h-4 w-4" />
          <span>Total cadastrados: {visitors.length}</span>
        </div>
      </div>

      {/* Grid Principal: Formulário da Fichinha (Estilo Card Físico) + Lista de Recentes */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Formulário - Ficha Física Digitalizada */}
        <div className="lg:col-span-7">
          <div className="overflow-hidden rounded-3xl border-2 border-blue-500/30 bg-white shadow-xl shadow-blue-900/5">
            {/* Header da Fichinha */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-600 p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black uppercase tracking-wider">Ficha de Acolhimento</h3>
                  <p className="text-[11px] text-blue-100">Outside & Ivales • Ministério Hangout</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>

            {/* Feedback de Sucesso */}
            {successMessage && (
              <div className="flex items-center gap-2 bg-emerald-500 px-5 py-3 text-xs font-bold text-white transition-all">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Ficha cadastrada com sucesso! Dados computados no culto.</span>
              </div>
            )}

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-4 p-5 sm:p-7">
              {/* 1. Nome do Visitante */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-700">
                  <User className="h-3.5 w-3.5 text-blue-600" />
                  <span>Nome do Visitante *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nome completo do visitante"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              {/* 2. Idade e Telefone em linha */}
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-700">Idade</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    placeholder="Ex: 22"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-700">
                    <Phone className="h-3.5 w-3.5 text-blue-600" />
                    <span>Telefone / WhatsApp</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* 3. Data de Visita e Culto Opcional */}
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-700">
                    <Calendar className="h-3.5 w-3.5 text-blue-600" />
                    <span>Data de Visita *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-sm font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-slate-700">Culto (Opcional)</label>
                  <select
                    value={serviceId}
                    onChange={(e) => setServiceId(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-sm font-semibold text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
                  >
                    <option value="">Vincular a um culto...</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.service_name} ({new Date(s.service_date).toLocaleDateString('pt-BR')})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 4. Se Veio Sozinho */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-700">
                  <Users className="h-3.5 w-3.5 text-blue-600" />
                  <span>Veio Sozinho ou Acompanhado?</span>
                </label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAccompanied(false)}
                    className={`flex items-center justify-center rounded-xl p-3 text-xs font-bold transition-all ${
                      !accompanied
                        ? 'border-2 border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                        : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    🙋‍♂️ Veio Sozinho
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccompanied(true)}
                    className={`flex items-center justify-center rounded-xl p-3 text-xs font-bold transition-all ${
                      accompanied
                        ? 'border-2 border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                        : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    👥 Acompanhado (Amigos/Família)
                  </button>
                </div>
              </div>

              {/* 5. Responsável pelo Contato */}
              <div>
                <label className="text-xs font-bold uppercase text-slate-700">
                  Responsável pelo Contato (Voluntário do Hangout)
                </label>
                <input
                  type="text"
                  placeholder="Nome do voluntário que acolheu o visitante"
                  value={contactVolunteerName}
                  onChange={(e) => setContactVolunteerName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Botão de Envio */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-700 active:scale-98 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>{isSubmitting ? 'Salvando Ficha...' : 'Salvar Ficha do Visitante'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Lista de Fichas Recentes Preenchidas */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm">Fichas Cadastradas Recentemente</h3>
            <p className="text-xs text-slate-500">Últimos visitantes registrados pela equipe</p>

            <div className="mt-4 space-y-3 max-h-[560px] overflow-y-auto pr-1">
              {visitors.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <ClipboardList className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="mt-2 text-xs font-bold text-slate-700">Nenhuma ficha preenchida ainda</p>
                  <p className="text-[11px] text-slate-500">Preencha o formulário ao lado durante o culto.</p>
                </div>
              ) : (
                visitors.slice(0, 10).map((v) => (
                  <div key={v.id} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 text-xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{v.full_name}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {v.age ? `${v.age} anos` : 'Idade n/d'} • {v.phone || 'Sem telefone'}
                        </p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        v.accompanied ? 'bg-purple-100 text-purple-700' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {v.accompanied ? 'Acompanhado' : 'Sozinho'}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between border-t border-slate-200/50 pt-2 text-[10px] text-slate-500">
                      <span>Data: {new Date(v.visit_date || v.created_at).toLocaleDateString('pt-BR')}</span>
                      <span className="font-semibold text-blue-700">
                        {v.contact_volunteer_name ? `Contato: ${v.contact_volunteer_name}` : 'Recepção Hangout'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
