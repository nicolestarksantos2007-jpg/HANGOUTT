'use client';

import React, { useState } from 'react';
import { useHangout } from '@/context/HangoutContext';
import { UserPlus, Plus, Search, Phone, UserCheck, Sparkles, MapPin } from 'lucide-react';

export const VisitorsView: React.FC = () => {
  const { visitors, services, volunteers, addVisitor } = useHangout();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [accompanied, setAccompanied] = useState(false);
  const [serviceId, setServiceId] = useState('');
  const [registeredByVolunteerId, setRegisteredByVolunteerId] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleInterest = (tag: string) => {
    setInterests(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const filtered = visitors.filter(v => 
    v.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.phone && v.phone.includes(searchTerm)) ||
    (v.neighborhood && v.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceId) {
      alert('Selecione o culto em que o visitante foi recebido.');
      return;
    }
    try {
      setIsSubmitting(true);
      await addVisitor({
        service_id: serviceId,
        full_name: fullName,
        phone,
        neighborhood,
        accompanied,
        registered_by_volunteer_id: registeredByVolunteerId || undefined,
        interests,
        notes
      });
      setIsModalOpen(false);
      // Reset
      setFullName('');
      setPhone('');
      setNeighborhood('');
      setAccompanied(false);
      setInterests([]);
      setNotes('');
    } catch (err) {
      console.error(err);
      alert('Erro ao cadastrar visitante.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 sm:text-2xl">Visitantes por Culto</h2>
          <p className="text-xs text-slate-500">Recepção intencional, dados de contato e voluntário captador</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Cadastrar Visitante</span>
        </button>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por nome, telefone ou bairro..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-2xl border border-slate-200/80 bg-white py-3 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Grid de Visitantes */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-400 bg-white">
            <UserPlus className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-2 text-sm font-bold text-slate-700">Nenhum visitante encontrado</p>
            <p className="text-xs text-slate-500">Cadastre os novos visitantes recebidos nos cultos.</p>
          </div>
        ) : (
          filtered.map((visitor) => (
            <div key={visitor.id} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{visitor.full_name}</h3>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                    <Phone className="h-3.5 w-3.5 text-blue-600" />
                    <span>{visitor.phone || 'Sem telefone informado'}</span>
                  </div>
                  {visitor.neighborhood && (
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
                      <MapPin className="h-3 w-3" />
                      <span>{visitor.neighborhood}</span>
                    </div>
                  )}
                </div>

                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  visitor.accompanied 
                    ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {visitor.accompanied ? 'Acompanhado' : 'Sozinho'}
                </span>
              </div>

              {/* Tags de Interesses (Igrupos, OutRun, Purpose) */}
              {visitor.interests && visitor.interests.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3">
                  {visitor.interests.map((tag) => (
                    <span key={tag} className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Voluntário Responsável */}
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <UserCheck className="h-3 w-3 text-emerald-600" />
                  <span>Captado por:</span>
                </span>
                <span className="font-semibold text-slate-800">
                  {visitor.registered_by_name || 'Recepção Geral'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Cadastro de Visitante */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900">Cadastrar Novo Visitante</h3>
            <p className="text-xs text-slate-500">Formulário rápido para o momento do culto</p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do visitante"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500">Telefone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="(00) 00000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500">Bairro / Cidade</label>
                  <input
                    type="text"
                    placeholder="Ex: Centro"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500">Culto da Visita *</label>
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

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500">Voluntário que recebeu</label>
                <select
                  value={registeredByVolunteerId}
                  onChange={(e) => setRegisteredByVolunteerId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-800"
                >
                  <option value="">Selecione o voluntário (opcional)...</option>
                  {volunteers.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.full_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Seleção de Interesses */}
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500">Interesses para Conexão</label>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {[
                    { id: 'igrupos', label: 'Igrupos (Célula)' },
                    { id: 'outrun', label: 'OutRun Crew (Corrida)' },
                    { id: 'purpose', label: 'Purpose (Empreendedorismo)' },
                    { id: 'discipulado', label: 'Discipulado' }
                  ].map(item => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => toggleInterest(item.id)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                        interests.includes(item.id)
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="accompaniedCheck"
                  checked={accompanied}
                  onChange={(e) => setAccompanied(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="accompaniedCheck" className="text-xs font-semibold text-slate-700">
                  Estava acompanhado de amigos ou família
                </label>
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
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvando...' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
