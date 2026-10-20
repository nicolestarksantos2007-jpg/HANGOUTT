'use client';

import React, { useState } from 'react';
import { useHangout } from '@/context/HangoutContext';
import { Users, Plus, Search, Shield, Award, Calendar } from 'lucide-react';

export const VolunteersView: React.FC = () => {
  const { volunteers, ministries, addVolunteer } = useHangout();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedMinistries, setSelectedMinistries] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleMinistry = (minId: string) => {
    setSelectedMinistries(prev =>
      prev.includes(minId) ? prev.filter(m => m !== minId) : [...prev, minId]
    );
  };

  const filtered = volunteers.filter(v =>
    v.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.email && v.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await addVolunteer({
        full_name: fullName,
        phone,
        email,
        status: 'active'
      }, selectedMinistries);
      setIsModalOpen(false);
      setFullName('');
      setPhone('');
      setEmail('');
      setSelectedMinistries([]);
    } catch (err) {
      console.error(err);
      alert('Erro ao cadastrar voluntário.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 sm:text-2xl">Base Geral de Voluntários</h2>
          <p className="text-xs text-slate-500">Histórico de serviço, ministérios vinculados e contatos coletados</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Cadastrar Voluntário</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar voluntário por nome ou e-mail..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-2xl border border-slate-200/80 bg-white py-3 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-400 bg-white">
            <Users className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-2 text-sm font-bold text-slate-700">Nenhum voluntário cadastrado</p>
            <p className="text-xs text-slate-500">Adicione os membros que servem nos cultos do Hangout.</p>
          </div>
        ) : (
          filtered.map((volunteer) => (
            <div key={volunteer.id} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{volunteer.full_name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{volunteer.phone || volunteer.email || 'Sem contato cadastrado'}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  volunteer.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                }`}>
                  {volunteer.status === 'active' ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3">
                {volunteer.ministries && volunteer.ministries.length > 0 ? (
                  volunteer.ministries.map((m) => (
                    <span key={m} className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                      {m}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-slate-400">Nenhum ministério vinculado</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900">Cadastrar Voluntário</h3>
            <p className="text-xs text-slate-500">Adicione um novo membro para as escalas de serviço</p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do voluntário"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                  <label className="text-[11px] font-bold uppercase text-slate-500">E-mail</label>
                  <input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500">Ministérios em que Serve</label>
                <div className="mt-1.5 space-y-1.5 max-h-36 overflow-y-auto">
                  {ministries.map((min) => (
                    <label key={min.id} className="flex items-center gap-2 rounded-lg border border-slate-100 p-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedMinistries.includes(min.id)}
                        onChange={() => toggleMinistry(min.id)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{min.name}</span>
                    </label>
                  ))}
                </div>
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
