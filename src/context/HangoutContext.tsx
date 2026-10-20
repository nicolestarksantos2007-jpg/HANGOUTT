'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Service, 
  Ministry, 
  Volunteer, 
  ServiceVisitor, 
  SpiritualDecision, 
  NewPerson, 
  DashboardMetrics,
  ServiceStatus,
  IntegrationStage 
} from '@/types/hangout';
import { 
  fetchDashboardMetrics, 
  fetchServices, 
  fetchMinistries, 
  fetchVolunteers, 
  fetchVisitors, 
  fetchSpiritualDecisions, 
  fetchNewPeople,
  createService as apiCreateService,
  updateServiceStatus as apiUpdateServiceStatus,
  createVolunteer as apiCreateVolunteer,
  createVisitor as apiCreateVisitor,
  createSpiritualDecision as apiCreateSpiritualDecision,
  createNewPerson as apiCreateNewPerson,
  updateNewPeopleStage as apiUpdateNewPeopleStage
} from '@/lib/supabase/service';

export type HangoutPageKey = 
  | 'dashboard' 
  | 'services' 
  | 'ministries' 
  | 'volunteers' 
  | 'visitors' 
  | 'decisions' 
  | 'integration' 
  | 'reports' 
  | 'approvals';

interface HangoutContextType {
  activeTab: HangoutPageKey;
  setActiveTab: (tab: HangoutPageKey) => void;
  loading: boolean;
  services: Service[];
  ministries: Ministry[];
  volunteers: Volunteer[];
  visitors: ServiceVisitor[];
  decisions: SpiritualDecision[];
  newPeople: NewPerson[];
  metrics: DashboardMetrics;
  refreshData: () => Promise<void>;
  
  // Ações de Cultos
  addService: (service: Omit<Service, 'id' | 'created_at'>) => Promise<void>;
  approveService: (id: string, reviewerId?: string) => Promise<void>;
  returnService: (id: string, reason: string, reviewerId?: string) => Promise<void>;
  
  // Ações de Voluntários e Ministérios
  addVolunteer: (volunteer: Omit<Volunteer, 'id' | 'created_at' | 'ministries'>, ministryIds?: string[]) => Promise<void>;
  
  // Ações de Visitantes e Decisões
  addVisitor: (visitor: Omit<ServiceVisitor, 'id' | 'created_at'>) => Promise<void>;
  addDecision: (decision: Omit<SpiritualDecision, 'id' | 'created_at'>) => Promise<void>;
  
  // Acompanhamento
  addNewPerson: (person: Omit<NewPerson, 'id' | 'created_at'>) => Promise<void>;
  updatePersonStage: (id: string, stage: IntegrationStage, note?: string) => Promise<void>;
}

const HangoutContext = createContext<HangoutContextType | undefined>(undefined);

export function HangoutProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<HangoutPageKey>('dashboard');
  const [loading, setLoading] = useState<boolean>(true);
  
  const [services, setServices] = useState<Service[]>([]);
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [visitors, setVisitors] = useState<ServiceVisitor[]>([]);
  const [decisions, setDecisions] = useState<SpiritualDecision[]>([]);
  const [newPeople, setNewPeople] = useState<NewPerson[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalNewPeople: 0,
    totalVisitors: 0,
    totalDecisionsJesus: 0,
    totalReconciliations: 0,
    totalBaptismDecisions: 0,
    totalServicesCount: 0,
    totalAttendance: 0,
    distinctVolunteersServed: 0,
    totalVolunteerParticipations: 0,
    monthlyGrowth: { visitorsGrowthPct: 0, attendanceGrowthPct: 0, decisionsGrowthPct: 0, volunteersGrowthPct: 0 },
    monthlyChartData: []
  });

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      const [
        dashMetrics, 
        servList, 
        minList, 
        volList, 
        visList, 
        decList, 
        npList
      ] = await Promise.all([
        fetchDashboardMetrics(),
        fetchServices(),
        fetchMinistries(),
        fetchVolunteers(),
        fetchVisitors(),
        fetchSpiritualDecisions(),
        fetchNewPeople()
      ]);

      setMetrics(dashMetrics);
      setServices(servList);
      setMinistries(minList);
      setVolunteers(volList);
      setVisitors(visList);
      setDecisions(decList);
      setNewPeople(npList);
    } catch (err) {
      console.error('Erro ao carregar dados do Hangout:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Handler: Criar Culto
  const addService = async (service: Omit<Service, 'id' | 'created_at'>) => {
    await apiCreateService(service);
    await refreshData();
  };

  // Handler: Aprovar Culto
  const approveService = async (id: string, reviewerId?: string) => {
    await apiUpdateServiceStatus(id, 'approved', reviewerId);
    await refreshData();
  };

  // Handler: Devolver Culto com Motivo
  const returnService = async (id: string, reason: string, reviewerId?: string) => {
    await apiUpdateServiceStatus(id, 'returned', reviewerId, reason);
    await refreshData();
  };

  // Handler: Cadastrar Voluntário
  const addVolunteer = async (volunteer: Omit<Volunteer, 'id' | 'created_at' | 'ministries'>, ministryIds?: string[]) => {
    await apiCreateVolunteer(volunteer, ministryIds);
    await refreshData();
  };

  // Handler: Cadastrar Visitante
  const addVisitor = async (visitor: Omit<ServiceVisitor, 'id' | 'created_at'>) => {
    await apiCreateVisitor(visitor);
    await refreshData();
  };

  // Handler: Registrar Decisão
  const addDecision = async (decision: Omit<SpiritualDecision, 'id' | 'created_at'>) => {
    await apiCreateSpiritualDecision(decision);
    await refreshData();
  };

  // Handler: Nova Pessoa no Funil
  const addNewPerson = async (person: Omit<NewPerson, 'id' | 'created_at'>) => {
    // Implementação direta via Supabase
    const { supabase } = await import('@/lib/supabase/client');
    await supabase.from('new_people').insert([person]);
    await refreshData();
  };

  // Handler: Atualizar Estágio da Pessoa
  const updatePersonStage = async (id: string, stage: IntegrationStage, note?: string) => {
    await apiUpdateNewPeopleStage(id, stage, note);
    await refreshData();
  };

  return (
    <HangoutContext.Provider value={{
      activeTab,
      setActiveTab,
      loading,
      services,
      ministries,
      volunteers,
      visitors,
      decisions,
      newPeople,
      metrics,
      refreshData,
      addService,
      approveService,
      returnService,
      addVolunteer,
      addVisitor,
      addDecision,
      addNewPerson,
      updatePersonStage
    }}>
      {children}
    </HangoutContext.Provider>
  );
}

export function useHangout() {
  const context = useContext(HangoutContext);
  if (!context) {
    throw new Error('useHangout deve ser usado dentro de HangoutProvider');
  }
  return context;
}
