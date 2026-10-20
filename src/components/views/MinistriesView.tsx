'use client';

import React, { useState } from 'react';
import { useHangout } from '@/context/HangoutContext';
import { Building2, Users, Shield, Plus } from 'lucide-react';

export const MinistriesView: React.FC = () => {
  const { ministries, volunteers } = useHangout();

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 sm:text-2xl">Gestão de Ministérios</h2>
          <p className="text-xs text-slate-500">4 ministérios do Hangout, times de serviço e voluntários vinculados</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {ministries.map((ministry) => {
          const linkedVolunteers = volunteers.filter(v => v.ministries.includes(ministry.name));

          return (
            <div key={ministry.id} className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="flex h-11 w-11 items-center justify-center rounded-xl font-bold text-white shadow-sm"
                    style={{ backgroundColor: ministry.color_hex || '#2563EB' }}
                  >
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{ministry.name}</h3>
                    <span className="text-[11px] font-semibold text-emerald-600">● Ministério Ativo</span>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                {ministry.description || 'Equipe dedicada ao serviço e excelência nos cultos.'}
              </p>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-1.5 text-blue-600">
                  <Users className="h-4 w-4" />
                  <span>{linkedVolunteers.length} voluntários no time</span>
                </div>
                <span className="rounded-lg bg-slate-50 px-2.5 py-1 text-slate-500 text-[11px]">
                  Presença nos cultos
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
