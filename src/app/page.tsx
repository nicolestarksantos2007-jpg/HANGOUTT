'use client';

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { HangoutProvider, useHangout } from '@/context/HangoutContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { MobileNav } from '@/components/layout/MobileNav';
import { LoginView } from '@/components/auth/LoginView';

// Views Oficiais
import { DashboardView } from '@/components/views/DashboardView';
import { ServicesView } from '@/components/views/ServicesView';
import { VisitorCardView } from '@/components/views/VisitorCardView';
import { MinistriesView } from '@/components/views/MinistriesView';
import { VolunteersView } from '@/components/views/VolunteersView';
import { ReportsView } from '@/components/views/ReportsView';
import { ApprovalsView } from '@/components/views/ApprovalsView';
import { UserAdminView } from '@/components/views/UserAdminView';

import { Flame, Loader2 } from 'lucide-react';

function DashboardContent() {
  const { activeTab, setActiveTab } = useHangout();
  const { session, user, profile, isLoading, isPendingApproval } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Set default tab based on role
  useEffect(() => {
    if (profile) {
      if (profile.role === 'volunteer' && activeTab === 'dashboard') {
        setActiveTab('visitor_card');
      }
    }
  }, [profile, activeTab, setActiveTab]);

  // 1. Tela de Carregamento
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#071324] text-white">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-700 to-blue-500 shadow-xl shadow-blue-600/40">
          <Flame className="h-8 w-8 text-white animate-pulse" />
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-blue-300">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Carregando Hangout Dashboard...</span>
        </div>
      </div>
    );
  }

  // 2. Não autenticado ou Aguardando Aprovação
  if (!session || !user || isPendingApproval) {
    return <LoginView />;
  }

  // 3. Autenticado e Aprovado -> Painel Principal
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar Desktop e Mobile */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Área Principal de Conteúdo */}
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar 
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenNewService={() => setActiveTab('services')}
          onOpenVisitorCard={() => setActiveTab('visitor_card')}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'services' && <ServicesView />}
          {activeTab === 'visitor_card' && <VisitorCardView />}
          {activeTab === 'ministries' && <MinistriesView />}
          {activeTab === 'volunteers' && <VolunteersView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'approvals' && <ApprovalsView />}
          {activeTab === 'user_admin' && <UserAdminView />}
        </main>

        {/* Navegação Mobile Inferior com Ficha Central */}
        <MobileNav 
          onOpenSidebar={() => setIsSidebarOpen(true)}
        />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <HangoutProvider>
        <DashboardContent />
      </HangoutProvider>
    </AuthProvider>
  );
}
