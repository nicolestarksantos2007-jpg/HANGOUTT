'use client';

import React, { useState } from 'react';
import { useHangout } from '@/context/HangoutContext';
import { useAuth } from '@/context/AuthContext';
import { Users, Plus, Search, Shield, Award, Calendar, Layers, X, Phone, Mail } from 'lucide-react';

const TEAMS = ['Time 1', 'Time 2', 'Time 3', 'Time 4'];

export const VolunteersView: React.FC = () => {
  const { volunteers, ministries, addVolunteer } = useHangout();
  const { profile } = useAuth();

  const isTeamLeader = profile?.role === 'lider_time';
  const isBaseLeader = profile?.role === 'lider_base';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>(
    isTeamLeader && profile?.team ? profile.team : 'all'
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [team, setTeam] = useState<string>(isTeamLeader && profile?.team ? profile.team : 'Time 1');
  const [selectedMinistries, setSelectedMinistries] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleMinistry = (minId: string) => {
    setSelectedMinistries(prev =>
      prev.includes(minId) ? prev.filter(m => m !== minId) : [...prev, minId]
    );
  };

  const filtered = volunteers.filter(v => {
    const matchesSearch = 
      v.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.email && v.email.toLowerCase().includes(searchTerm.toLowerCase()));

    let matchesTeam = true;
    if (selectedTeamFilter !== 'all') {
      matchesTeam = v.team === selectedTeamFilter;
    }

    return matchesSearch && matchesTeam;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await addVolunteer({
        full_name: fullName,
        phone,
        email,
        team,
        status: 'active'
      }, selectedMinistries);
      setIsModalOpen(false);
      setFullName('');
      setPhone('');
      setEmail('');
      setTeam(isTeamLeader && profile?.team ? profile.team : 'Time 1');
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
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 sm:text-2xl">Base Geral de Voluntários</h2>
            {isTeamLeader && (
              <span className="rounded-full bg-amber-100 px-3 py-0.5 text-xs font-bold text-amber-800 border border-amber-200">
                Seu Time: {profile?.team}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            {isTeamLeader 
              ? `Visualizando e gerenciando voluntários vinculados ao ${profile?.team}`
              : 'Histórico de serviço, time escalado, ministérios e contatos da equipe Hangout'}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Cadastrar Voluntário</span>
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar voluntário por nome ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-slate-400" />
          <select
            value={selectedTeamFilter}
            onChange={(e) => setSelectedTeamFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="all">Todos os Times</option>
            {TEAMS.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards de Voluntários */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-dashed border-slate-300 p-12 text-center text-slate-400 bg-white">
            <Users className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-2 text-sm font-bold text-slate-700">Nenhum voluntário encontrado</p>
            <p className="text-xs text-slate-500">
              {isTeamLeader 
                ? `Ainda não há voluntários cadastrados no ${profile?.team}.`
                : 'Adicione os membros que servem nos cultos do Hangout.'}
            </p>
          </div>
        ) : (
          filtered.map((volunteer) => (
            <div key={volunteer.id} className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">{volunteer.full_name}</h3>
                  <div className="mt-1 flex flex-col gap-0.5 text-xs text-slate-500">
                    {volunteer.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-slate-400" /> {volunteer.phone}
                      </span>
                    )}
                    {volunteer.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-slate-400" /> {volunteer.email}
                      </span>
                    )}
                    {!volunteer.phone && !volunteer.email && (
                      <span className="text-slate-400 italic">Sem contato cadastrado</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    volunteer.status === 'active' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {volunteer.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>

                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
                    ⚡ {volunteer.team || 'Time 1'}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3">
                {volunteer.ministries && volunteer.ministries.length > 0 ? (
                  volunteer.ministries.map((m) => (
                    <span key={m} className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200/60">
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

      {/* Modal de Cadastro de Voluntário */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-6 backdrop-blur-sm">
          <div className="flex max-h-[92vh] w-full max-w-lg flex-col rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-100">
            {/* Header Fixo */}
            <div className="flex items-center justify-between border-b border-slate-100 p-5 shrink-0 bg-white">
              <div>
                <h3 className="text-lg font-black text-slate-900">Cadastrar Voluntário</h3>
                <p className="text-xs text-slate-500">Adicione um novo membro para as escalas de serviço</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Rolável */}
            <form id="volunteer-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {/* Seleção do Time */}
              <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-3.5">
                <label className="text-xs font-bold uppercase text-blue-900 flex items-center gap-1.5 mb-2">
                  <Layers className="h-4 w-4 text-blue-600" />
                  <span>Time do Voluntário *</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {TEAMS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTeam(t)}
                      className={`rounded-xl py-2 px-2 text-xs font-bold transition-all ${
                        team === t 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-600' 
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-600">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do voluntário"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-600">Telefone / WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-600">E-mail</label>
                  <input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-600">Ministérios em que Serve</label>
                <div className="mt-1.5 grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
                  {ministries.map((min) => (
                    <label 
                      key={min.id} 
                      className={`flex items-center gap-2 rounded-xl border p-2 text-xs font-semibold cursor-pointer transition-all ${
                        selectedMinistries.includes(min.id)
                          ? 'border-blue-500 bg-blue-50/50 text-blue-900'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedMinistries.includes(min.id)}
                        onChange={() => toggleMinistry(min.id)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="truncate">{min.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </form>

            {/* Rodapé Fixo */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 p-4 bg-slate-50 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="volunteer-form"
                disabled={isSubmitting}
                className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95"
              >
                {isSubmitting ? 'Salvando...' : 'Cadastrar Voluntário'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
