'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    if (!email || !password) {
      setErrorMessage('Por favor, preencha todos os campos.');
      setLoading(false);
      return;
    }

    if (mode === 'login') {
      const res = await signIn(email, password);
      if (res.error) {
        if (res.error.toLowerCase().includes('invalid login credentials')) {
          setErrorMessage('E-mail ou senha incorretos. Verifique suas credenciais.');
        } else {
          setErrorMessage(res.error);
        }
      }
    } else {
      const res = await signUp(email, password);
      if (res.error) {
        setErrorMessage(res.error);
      } else {
        setSuccessMessage(
          res.message || 'Conta criada com sucesso! Você já pode entrar com suas credenciais.'
        );
        setMode('login');
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#07090E] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center relative mb-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-emerald-500/40 shadow-xl shadow-emerald-500/10 bg-[#121722] p-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/profile.jpg"
                alt="Eduardo"
                className="w-full h-full object-cover object-top rounded-xl"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#07090E] flex items-center justify-center text-black">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Painel Financeiro
          </h1>
          <p className="text-xs sm:text-sm text-[#8E99AD] mt-1">
            Acesso seguro à sua gestão financeira pessoal
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-[#10141E]/95 border border-[#1F2637] rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-[#0A0D14] p-1 border border-[#1A2130] mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-[#182030] text-white shadow-sm'
                  : 'text-[#8E99AD] hover:text-white'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-[#182030] text-white shadow-sm'
                  : 'text-[#8E99AD] hover:text-white'
              }`}
            >
              Criar Conta / Cadastro
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5">
              <span className="shrink-0 font-bold">✕</span>
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-2.5">
              <UserCheck className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <span className="leading-relaxed">{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#8E99AD] mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A6478]" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0A0D14] border border-[#1F2637] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-[#5A6478] focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8E99AD] mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A6478]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0A0D14] border border-[#1F2637] rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-[#5A6478] focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5A6478] hover:text-[#8E99AD] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Acessar Painel' : 'Criar Conta'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#1A2130] text-center">
            <p className="text-[11px] text-[#5A6478]">
              Protegido por Supabase Auth • Criptografia de ponta a ponta
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
