'use client';

import React, { useState } from 'react';
import { HangoutProvider, useHangout } from '@/context/HangoutContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { MobileNav } from '@/components/layout/MobileNav';

// Views
import { DashboardView } from '@/components/views/DashboardView';
import { ServicesView } from '@/components/views/ServicesView';
import { MinistriesView } from '@/components/views/MinistriesView';
import { VolunteersView } from '@/components/views/VolunteersView';
import { VisitorsView } from '@/components/views/VisitorsView';
import { DecisionsView } from '@/components/views/DecisionsView';
import { IntegrationView } from '@/components/views/IntegrationView';
import { ReportsView } from '@/components/views/ReportsView';
import { ApprovalsView } from '@/components/views/ApprovalsView';

function DashboardContent() {
  const { activeTab, setActiveTab } = useHangout();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
          onOpenNewVisitor={() => setActiveTab('visitors')}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'services' && <ServicesView />}
          {activeTab === 'ministries' && <MinistriesView />}
          {activeTab === 'volunteers' && <VolunteersView />}
          {activeTab === 'visitors' && <VisitorsView />}
          {activeTab === 'decisions' && <DecisionsView />}
          {activeTab === 'integration' && <IntegrationView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'approvals' && <ApprovalsView />}
        </main>

        {/* Navegação Mobile Inferior */}
        <MobileNav 
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onQuickNewVisitor={() => setActiveTab('visitors')}
        />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <HangoutProvider>
      <DashboardContent />
    </HangoutProvider>
  );
}
