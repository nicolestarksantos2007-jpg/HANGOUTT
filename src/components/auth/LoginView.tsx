'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/hangout';
import { 
  Flame, 
  Lock, 
  Mail, 
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
  const { signIn, signUpUser, isPendingApproval, profile, user, signOut } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
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
      const res = await signIn(email, password);
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
      const res = await signUpUser(email, password, fullName, role, chosenTeam);
      
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg(res.message || 'Conta cadastrada com sucesso!');
        if (role === 'lider_base' || email.trim().toLowerCase() === 'eduardopiccinimartins@gmail.com') {
          setMode('signin');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao cadastrar usuário.');
    } finally {
      setLoading(false);
    }
  };

  // Se o usuário está logado mas aguarda aprovação pelo Líder Base
  if (isPendingApproval) {
    const roleLabel = profile?.role === 'lider_time' ? 'Líder de Time' : 'Voluntário';

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#071324] p-4 sm:p-6 text-white">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/20">
              <Clock className="h-8 w-8 animate-pulse" />
            </div>

            <span className="mt-4 inline-block rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-500/30">
              Aguardando Aprovação de Acesso
            </span>

            <h2 className="mt-3 text-2xl font-black tracking-tight text-white">
              Conta em Análise
            </h2>

            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              Olá, <span className="font-bold text-white">{profile?.full_name || user?.email}</span>! Sua conta como <span className="font-bold text-amber-300">{roleLabel}</span> ({profile?.team || 'Time selecionado'}) foi criada com sucesso.
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-slate-300 space-y-2">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <p>
                <strong className="text-white">Segurança Hangout:</strong> Por governança, o <span className="text-blue-400 font-bold">Líder Base (Eduardo Piccini)</span> precisa aprovar seu cadastro no Painel de Administração de Liderança.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <Users className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
              <p>
                Assim que aprovado, você terá acesso aos cultos, fichas de visitantes e ferramentas do seu time.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-95"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Verificar se Já Fui Aprovado</span>
            </button>

            <button
              onClick={() => signOut()}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair / Entrar com Outra Conta</span>
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
            Gestão de Cultos & Vidas • Outside & Ivales
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
              Entrar na Conta
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
              Criar Novo Acesso
            </button>
          </div>

          {/* Feedback Messages */}
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
                  E-mail
                </label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
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
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Entrando...' : 'Acessar o Sistema'}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>

              <div className="pt-2 text-center">
                <p className="text-[11px] text-slate-400">
                  Acesso Líder Base: <span className="font-semibold text-blue-300">eduardopiccinimartins@gmail.com</span>
                </p>
              </div>
            </form>
          )}

          {/* MODO CADASTRAR */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              {/* 1. Escolha de Papel (Voluntário, Líder de Time, Líder Base) */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-2">
                  1. Qual é o seu papel no Hangout? *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('volunteer')}
                    className={`flex flex-col items-center justify-center rounded-2xl p-3 border text-center transition-all ${
                      role === 'volunteer'
                        ? 'border-blue-500 bg-blue-600/20 text-white ring-2 ring-blue-500 shadow-md'
                        : 'border-white/10 bg-black/30 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Users className="h-5 w-5 mb-1 text-blue-400" />
                    <span className="text-xs font-bold">Voluntário</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Escalas & Ficha</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('lider_time')}
                    className={`flex flex-col items-center justify-center rounded-2xl p-3 border text-center transition-all ${
                      role === 'lider_time'
                        ? 'border-amber-500 bg-amber-500/20 text-white ring-2 ring-amber-500 shadow-md'
                        : 'border-white/10 bg-black/30 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="h-5 w-5 mb-1 text-amber-400" />
                    <span className="text-xs font-bold">Líder de Time</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Gestão do Time</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('lider_base')}
                    className={`flex flex-col items-center justify-center rounded-2xl p-3 border text-center transition-all ${
                      role === 'lider_base'
                        ? 'border-purple-500 bg-purple-500/20 text-white ring-2 ring-purple-500 shadow-md'
                        : 'border-white/10 bg-black/30 text-slate-400 hover:text-white'
                    }`}
                  >
                    <ShieldCheck className="h-5 w-5 mb-1 text-purple-400" />
                    <span className="text-xs font-bold">Líder Base</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Geral & Aprovação</span>
                  </button>
                </div>
              </div>

              {/* 2. Seleção de Time (Time 1 a 4) - Obrigatório se for Voluntário ou Líder de Time */}
              {role !== 'lider_base' && (
                <div className="rounded-2xl border border-white/10 bg-black/30 p-3.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-2">
                    <Layers className="h-4 w-4 text-blue-400" />
                    <span>2. Escolha o seu Time *</span>
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

              {/* 3. Dados Pessoais */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Nome Completo *
                </label>
                <div className="relative mt-1.5">
                  <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-10 pr-4 text-xs font-medium text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  E-mail *
                </label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-10 pr-4 text-xs font-medium text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Senha *
                </label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-10 pr-4 text-xs font-medium text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-[11px] text-amber-300">
                ⚠️ <span className="font-bold">Aviso importante:</span> Todo cadastro de Líder de Time ou Voluntário precisa ser aprovado pelo Líder Base no Painel de Administração para liberar o acesso.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Cadastrando...' : 'Concluir Cadastro'}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
