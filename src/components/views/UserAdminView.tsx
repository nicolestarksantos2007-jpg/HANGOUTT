'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserProfile, UserRole, UserStatus } from '@/types/hangout';
import { 
  ShieldCheck, 
  Clock, 
  Users, 
  Sparkles, 
  Check, 
  X, 
  Search, 
  Filter, 
  RefreshCw, 
  AlertCircle,
  Layers,
  Mail,
  UserCheck
} from 'lucide-react';

const TEAMS = ['Time 1', 'Time 2', 'Time 3', 'Time 4'];

export const UserAdminView: React.FC = () => {
  const { getAllProfiles, updateUserStatus, profile } = useAuth();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, setTeamFilter] = useState('all');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadProfiles = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllProfiles();
      setProfiles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [getAllProfiles]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const handleUpdateStatus = async (userProfileId: string, status: UserStatus, name: string) => {
    try {
      setProcessingId(userProfileId);
      const ok = await updateUserStatus(userProfileId, status);
      if (ok) {
        setFeedback({
          message: status === 'approved' 
            ? `Acesso concedido com sucesso para ${name}!` 
            : `Acesso negado para ${name}.`,
          type: 'success'
        });
        await loadProfiles();
      } else {
        setFeedback({ message: 'Falha ao atualizar status do usuário.', type: 'error' });
      }
    } catch (err) {
      setFeedback({ message: 'Erro ao processar solicitação.', type: 'error' });
    } finally {
      setProcessingId(null);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const pendingUsers = profiles.filter(p => p.status === 'pending');
  const approvedUsers = profiles.filter(p => p.status === 'approved');

  const filteredApproved = approvedUsers.filter(p => {
    const matchesSearch = 
      p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTeam = teamFilter === 'all' || p.team === teamFilter;
    return matchesSearch && matchesTeam;
  });

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 sm:text-2xl">
              Painel de Liderança & Acessos
            </h2>
            <span className="rounded-full bg-purple-100 px-3 py-0.5 text-xs font-bold text-purple-800 border border-purple-200">
              👑 Exclusivo Líder Base
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Aprovação de novos líderes de time e voluntários cadastrados no Hangout
          </p>
        </div>

        <button
          onClick={loadProfiles}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-50 transition-all"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          <span>Atualizar Lista</span>
        </button>
      </div>

      {/* Alerta de Feedback */}
      {feedback && (
        <div className={`flex items-center gap-2.5 rounded-2xl p-4 text-xs font-semibold ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {feedback.type === 'success' ? <UserCheck className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Métricas do Painel */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-4">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-xs font-bold uppercase">Pendentes</span>
            <Clock className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-black text-amber-900">{pendingUsers.length}</p>
          <p className="text-[10px] text-amber-700 mt-0.5">Aguardando sua aprovação</p>
        </div>

        <div className="rounded-3xl border border-blue-200 bg-blue-50/60 p-4">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-xs font-bold uppercase">Voluntários</span>
            <Users className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-black text-blue-900">
            {profiles.filter(p => p.role === 'volunteer' && p.status === 'approved').length}
          </p>
          <p className="text-[10px] text-blue-700 mt-0.5">Aprovados e ativos</p>
        </div>

        <div className="rounded-3xl border border-purple-200 bg-purple-50/60 p-4">
          <div className="flex items-center justify-between text-purple-600">
            <span className="text-xs font-bold uppercase">Líderes de Time</span>
            <Sparkles className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-black text-purple-900">
            {profiles.filter(p => p.role === 'lider_time' && p.status === 'approved').length}
          </p>
          <p className="text-[10px] text-purple-700 mt-0.5">Gestores dos 4 times</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Total Membros</span>
            <ShieldCheck className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{profiles.length}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Base cadastrada</p>
        </div>
      </div>

      {/* SEÇÃO 1: SOLICITAÇÕES PENDENTES (PRIORITÁRIA) */}
      <div className="rounded-3xl border border-amber-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <span>Solicitações Pendentes de Aprovação</span>
              {pendingUsers.length > 0 && (
                <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-black text-white">
                  {pendingUsers.length}
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Somente o Líder Base pode aceitar e liberar o acesso desses voluntários e líderes
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {pendingUsers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
              <Check className="mx-auto h-8 w-8 text-emerald-500" />
              <p className="mt-2 text-xs font-bold text-slate-700">Tudo em dia!</p>
              <p className="text-[11px] text-slate-500">
                Não há nenhum cadastro pendente aguardando aprovação no momento.
              </p>
            </div>
          ) : (
            pendingUsers.map((user) => (
              <div 
                key={user.id} 
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-amber-200/80 bg-amber-50/30 p-4 transition-all hover:bg-amber-50/60"
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-slate-900 text-sm">{user.full_name}</h4>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                      user.role === 'lider_time' 
                        ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}>
                      {user.role === 'lider_time' ? '⚡ Líder de Time' : '🛡️ Voluntário'}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200">
                      {user.team || 'Time 1'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                    <Mail className="h-3 w-3 text-slate-400" />
                    <span>{user.email}</span>
                    <span>•</span>
                    <span>Cadastrado em: {new Date(user.created_at).toLocaleDateString('pt-BR')}</span>
                  </p>
                </div>

                {/* Botões de Ação para o Líder Base */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateStatus(user.id, 'rejected', user.full_name)}
                    disabled={processingId === user.id}
                    className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 active:scale-95 disabled:opacity-50 transition-all"
                  >
                    <X className="h-4 w-4" />
                    <span>Rejeitar</span>
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(user.id, 'approved', user.full_name)}
                    disabled={processingId === user.id}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 transition-all"
                  >
                    <Check className="h-4 w-4" />
                    <span>Aprovar Acesso</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SEÇÃO 2: MEMBROS E LÍDERES APROVADOS */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900">
              Membros & Lideranças Aprovadas ({filteredApproved.length})
            </h3>
            <p className="text-xs text-slate-500">
              Visualização geral de todos os membros ativos distribuídos por time
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48 rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-slate-400" />
              <select
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="all">Todos os Times</option>
                {TEAMS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-4 divide-y divide-slate-100">
          {filteredApproved.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400">
              Nenhum membro aprovado encontrado com os filtros selecionados.
            </p>
          ) : (
            filteredApproved.map((u) => (
              <div key={u.id} className="flex items-center justify-between py-3.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">{u.full_name}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      u.role === 'lider_base'
                        ? 'bg-purple-100 text-purple-800'
                        : u.role === 'lider_time'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-50 text-blue-700'
                    }`}>
                      {u.role === 'lider_base' ? '👑 Líder Base' : u.role === 'lider_time' ? '⚡ Líder de Time' : '🛡️ Voluntário'}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                      {u.team || 'Geral'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{u.email}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                    Aprovado
                  </span>

                  {u.role !== 'lider_base' && (
                    <button
                      onClick={() => handleUpdateStatus(u.id, 'pending', u.full_name)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      title="Pausar / Mudar para pendente"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
