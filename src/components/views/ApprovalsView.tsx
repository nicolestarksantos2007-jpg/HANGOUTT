'use client';

import React from 'react';
import { useHangout } from '@/context/HangoutContext';
import { CheckSquare, CheckCircle, AlertCircle, Clock, Calendar, Users } from 'lucide-react';

export const ApprovalsView: React.FC = () => {
  const { services, approveService, returnService } = useHangout();

  const pending = services.filter(s => s.status !== 'approved');
  const approved = services.filter(s => s.status === 'approved');

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      <div>
        <h2 className="text-xl font-black text-slate-900 sm:text-2xl">Painel de Liderança & Aprovações</h2>
        <p className="text-xs text-slate-500">Revisão oficial dos cultos enviados pelos voluntários</p>
      </div>

      {/* Seção 1: Registros Pendentes de Revisão */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Cultos Pendentes de Aprovação</h3>
            <p className="text-xs text-slate-500">Dados aguardando validação da liderança</p>
          </div>
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-200">
            {pending.length} pendentes
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {pending.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              <CheckCircle className="mx-auto h-8 w-8 text-emerald-500" />
              <p className="mt-2 text-xs font-bold text-slate-700">Tudo em dia!</p>
              <p className="text-[11px] text-slate-500">Nenhum culto aguardando aprovação no momento.</p>
            </div>
          ) : (
            pending.map((service) => (
              <div key={service.id} className="flex flex-col gap-3 rounded-xl border border-slate-200/70 bg-slate-50/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">{service.service_name}</h4>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                      {service.status === 'returned' ? 'Devolvido para Correção' : 'Aguardando Revisão'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Data: {new Date(service.service_date).toLocaleDateString('pt-BR')} • {service.service_time}
                  </p>
                  {service.return_reason && (
                    <p className="mt-1 text-xs font-semibold text-rose-600">
                      Motivo da devolução: &ldquo;{service.return_reason}&rdquo;
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => approveService(service.id)}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-700 active:scale-95"
                  >
                    Aprovar Oficialmente
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Informe o motivo da devolução para o voluntário corrigir:');
                      if (reason) returnService(service.id, reason);
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-600 active:scale-95"
                  >
                    Devolver
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Seção 2: Cultos já Aprovados */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
          Cultos Aprovados Recentemente ({approved.length})
        </h3>
        <div className="mt-3 divide-y divide-slate-100">
          {approved.slice(0, 5).map((service) => (
            <div key={service.id} className="flex items-center justify-between py-3 text-xs">
              <div>
                <p className="font-bold text-slate-900">{service.service_name}</p>
                <p className="text-[11px] text-slate-500">
                  {new Date(service.service_date).toLocaleDateString('pt-BR')} • Aprovado pela liderança
                </p>
              </div>
              <span className="flex items-center gap-1 font-bold text-emerald-600">
                <CheckCircle className="h-4 w-4" />
                <span>Oficial</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
