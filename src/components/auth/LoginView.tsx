'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/hangout';
import { 
  Flame, 
  Lock, 
  User, 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  LogOut, 
  RefreshCw,
  Users,
  Sparkles,
  Layers
} from 'lucide-react';

const TEAMS = ['Time 1', 'Time 2', 'Time 3', 'Time 4'];

export const LoginView: React.FC = () => {
  const { signIn, signUpUser, isPendingApproval, profile, signOut } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [identifier, setIdentifier] = useState(''); // Nome completo
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('volunteer');
  const [team, setTeam] = useState<string>('Time 1');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await signIn(identifier, password);
      if (res.error) {
        setErrorMsg(res.error);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao realizar login.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const chosenTeam = role === 'lider_base' ? 'Liderança Base' : team;
      const res = await signUpUser(fullName, password, role, chosenTeam);
      
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg(res.message || 'Cadastro realizado com sucesso!');
        if (res.status === 'approved') {
          // Entra automaticamente
        } else {
          setMode('signin');
          setIdentifier(fullName);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao cadastrar usuário.');
    } finally {
      setLoading(false);
    }
  };

  // Se o usuário logou mas sua conta ainda aguarda aprovação (Líder de Time)
  if (isPendingApproval) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#071324] p-4 sm:p-6 text-white">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/20">
              <Clock className="h-8 w-8 animate-pulse" />
            </div>

            <span className="mt-4 inline-block rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-500/30">
              Aguardando Aprovação
            </span>

            <h2 className="mt-3 text-2xl font-black tracking-tight text-white">
              Conta em Análise
            </h2>

            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              Olá, <span className="font-bold text-white">{profile?.full_name || fullName}</span>! Seu cadastro foi recebido e aguarda liberação da Liderança Base.
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-4 text-xs text-slate-300 space-y-2">
            <p>
              Assim que sua solicitação for aprovada, você poderá entrar no sistema normalmente utilizando o seu <strong>Nome e Senha</strong>.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-95"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Verificar Acesso</span>
            </button>

            <button
              onClick={() => signOut()}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span>Voltar / Entrar com Outro Nome</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#071324] p-4 sm:p-6 text-white selection:bg-blue-600 selection:text-white">
      <div className="w-full max-w-lg">
        {/* Brand Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-700 to-blue-500 shadow-xl shadow-blue-600/40">
            <Flame className="h-8 w-8 text-white" />
          </div>
          <h1 className="mt-3 text-2xl sm:text-3xl font-black tracking-tight text-white">
            HANGOUT
          </h1>
          <p className="mt-1 text-xs text-blue-300 font-medium tracking-wide">
            Gestão de Cultos & Vidas
          </p>
        </div>

        {/* Card Principal */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          {/* Seletor de Modo (Entrar vs Cadastrar) */}
          <div className="flex rounded-2xl bg-black/40 p-1 mb-6 border border-white/10">
            <button
              type="button"
              onClick={() => { setMode('signin'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all ${
                mode === 'signin'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all ${
                mode === 'signup'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Cadastrar
            </button>
          </div>

          {/* Mensagens de Feedback */}
          {errorMsg && (
            <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* MODO ENTRAR */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Nome
                </label>
                <div className="relative mt-1.5">
                  <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Digite seu nome completo"
                    className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-10 pr-4 text-xs font-medium text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Senha
                </label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-10 pr-4 text-xs font-medium text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Entrando...' : 'Entrar no Sistema'}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          )}

          {/* MODO CADASTRAR */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              {/* 1. Escolha de Papel (Apenas os nomes limpos) */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-2">
                  Papel
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => { setRole('volunteer'); }}
                    className={`flex flex-col items-center justify-center rounded-2xl p-3 border text-center transition-all ${
                      role === 'volunteer'
                        ? 'border-blue-500 bg-blue-600/20 text-white ring-2 ring-blue-500 shadow-md'
                        : 'border-white/10 bg-black/30 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Users className="h-5 w-5 mb-1 text-blue-400" />
                    <span className="text-xs font-bold">Voluntário</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setRole('lider_time'); }}
                    className={`flex flex-col items-center justify-center rounded-2xl p-3 border text-center transition-all ${
                      role === 'lider_time'
                        ? 'border-amber-500 bg-amber-500/20 text-white ring-2 ring-amber-500 shadow-md'
                        : 'border-white/10 bg-black/30 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="h-5 w-5 mb-1 text-amber-400" />
                    <span className="text-xs font-bold">Líder de Time</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setRole('lider_base'); }}
                    className={`flex flex-col items-center justify-center rounded-2xl p-3 border text-center transition-all ${
                      role === 'lider_base'
                        ? 'border-purple-500 bg-purple-500/20 text-white ring-2 ring-purple-500 shadow-md'
                        : 'border-white/10 bg-black/30 text-slate-400 hover:text-white'
                    }`}
                  >
                    <ShieldCheck className="h-5 w-5 mb-1 text-purple-400" />
                    <span className="text-xs font-bold">Líder Base</span>
                  </button>
                </div>
              </div>

              {/* 2. Seleção de Time (Apenas para Voluntário ou Líder de Time) */}
              {role !== 'lider_base' && (
                <div className="rounded-2xl border border-white/10 bg-black/30 p-3.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-2">
                    <Layers className="h-4 w-4 text-blue-400" />
                    <span>Time</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {TEAMS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTeam(t)}
                        className={`rounded-xl py-2 px-2 text-xs font-bold transition-all ${
                          team === t
                            ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-500'
                            : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Campo de Nome Completo */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Nome Completo
                </label>
                <div className="relative mt-1.5">
                  <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Digite seu nome completo"
                    className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-10 pr-4 text-xs font-medium text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* 4. Campo de Senha */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Senha
                </label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-10 pr-4 text-xs font-medium text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Cadastrando...' : 'Cadastrar'}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
