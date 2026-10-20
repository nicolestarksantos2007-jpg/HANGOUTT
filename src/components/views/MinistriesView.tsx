'use client';

import React from 'react';
import { useHangout } from '@/context/HangoutContext';
import { Building2, Users, Flame, Sparkles } from 'lucide-react';

export const MinistriesView: React.FC = () => {
  const { ministries, volunteers } = useHangout();

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 sm:text-2xl">10 Ministérios Oficiais</h2>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
              Times Hangout
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Estrutura oficial de serviço: Hangout, Staff, Projeção, Stories, Fotos, Infra, Gestão, Profético, Músicos e Ministração
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-700">
          <Sparkles className="h-4 w-4" />
          <span>10 Times Ativos</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ministries.map((ministry) => {
          const linkedVolunteers = volunteers.filter(v => 
            v.ministries && v.ministries.some(m => m.toLowerCase() === ministry.name.toLowerCase())
          );

          return (
            <div key={ministry.id} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="flex h-10 w-10 items-center justify-center rounded-xl font-black text-white shadow-sm"
                    style={{ backgroundColor: ministry.color_hex || '#2563EB' }}
                  >
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{ministry.name}</h3>
                    <span className="text-[10px] font-semibold text-emerald-600">● Ministério Ativo</span>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-600 leading-relaxed min-h-[36px]">
                {ministry.description || 'Equipe dedicada ao serviço nos cultos do Hangout.'}
              </p>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-1.5 text-blue-600">
                  <Users className="h-3.5 w-3.5" />
                  <span>{linkedVolunteers.length} voluntários</span>
                </div>
                <span className="rounded-md bg-slate-50 px-2 py-0.5 text-[10px] text-slate-500 font-bold">
                  Escala Ativa
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
