'use client';

import React from 'react';
import { useHangout } from '@/context/HangoutContext';
import { GitPullRequest, ArrowRight, UserCheck, Phone, CheckCircle2 } from 'lucide-react';
import { IntegrationStage } from '@/types/hangout';

const STAGES: { key: IntegrationStage; label: string; desc: string; color: string }[] = [
  { key: 'novo_cadastro', label: '1. Novo Cadastro', desc: 'Visitante recém-chegado', color: 'border-blue-400 bg-blue-50/50' },
  { key: 'contato_pendente', label: '2. Contato Pendente', desc: 'Aguardando 1º WhatsApp', color: 'border-amber-400 bg-amber-50/50' },
  { key: 'contato_realizado', label: '3. Contato Feito', desc: 'Mensagem enviada com sucesso', color: 'border-indigo-400 bg-indigo-50/50' },
  { key: 'retornou', label: '4. Retornou ao Culto', desc: 'Veio pela 2ª vez', color: 'border-purple-400 bg-purple-50/50' },
  { key: 'acompanhamento', label: '5. Acompanhamento', desc: 'Em Igrupo ou discipulado', color: 'border-teal-400 bg-teal-50/50' },
  { key: 'integrado', label: '6. Integrado', desc: 'Membro ativo / servindo', color: 'border-emerald-400 bg-emerald-50/50' },
];

export const IntegrationView: React.FC = () => {
  const { newPeople, updatePersonStage } = useHangout();

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      <div>
        <h2 className="text-xl font-black text-slate-900 sm:text-2xl">Acompanhamento de Novas Pessoas</h2>
        <p className="text-xs text-slate-500">Funil de cuidado e conexão pastoral do ministério Hangout</p>
      </div>

      {/* Visualização em Funil (Colunas Kanban) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {STAGES.map((stg) => {
          const peopleInStage = newPeople.filter(p => p.current_stage === stg.key);

          return (
            <div key={stg.key} className={`flex flex-col rounded-2xl border p-4 shadow-sm ${stg.color}`}>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <div>
                  <h3 className="font-bold text-slate-900 text-xs">{stg.label}</h3>
                  <p className="text-[10px] text-slate-500">{stg.desc}</p>
                </div>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white font-black text-xs text-slate-700 shadow-sm">
                  {peopleInStage.length}
                </span>
              </div>

              <div className="mt-3 flex-1 space-y-2.5 overflow-y-auto max-h-[500px]">
                {peopleInStage.length === 0 ? (
                  <p className="py-6 text-center text-[11px] text-slate-400">Nenhuma vida nesta etapa</p>
                ) : (
                  peopleInStage.map((person) => (
                    <div key={person.id} className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs">
                      <p className="font-bold text-slate-900 text-xs">{person.full_name}</p>
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                        <Phone className="h-3 w-3 text-blue-600" />
                        <span>{person.phone || 'Sem telefone'}</span>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2">
                        <span className="text-[10px] text-slate-400">
                          {new Date(person.first_visit_date).toLocaleDateString('pt-BR')}
                        </span>

                        <select
                          value={person.current_stage}
                          onChange={(e) => updatePersonStage(person.id, e.target.value as any)}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 focus:outline-none"
                        >
                          <option value="novo_cadastro">1. Novo</option>
                          <option value="contato_pendente">2. Pendente</option>
                          <option value="contato_realizado">3. Contatado</option>
                          <option value="retornou">4. Retornou</option>
                          <option value="acompanhamento">5. Acompanhando</option>
                          <option value="integrado">6. Integrado</option>
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
