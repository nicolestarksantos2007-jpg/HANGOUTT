import { supabase } from './client';
import { 
  Service, 
  Ministry, 
  Volunteer, 
  ServiceParticipation, 
  ServiceVisitor, 
  SpiritualDecision, 
  NewPerson, 
  DashboardMetrics,
  ServiceStatus,
  IntegrationStage 
} from '@/types/hangout';

// ==========================================
// 1. MÉTRICAS E INDICADORES DO DASHBOARD
// ==========================================
export async function fetchDashboardMetrics(periodFilter?: string): Promise<DashboardMetrics> {
  try {
    // Buscar cultos aprovados (apenas aprovados compõem métricas oficiais)
    let query = supabase
      .from('services')
      .select('*')
      .eq('status', 'approved');

    if (periodFilter && periodFilter !== 'all') {
      // Exemplo de filtro de ano/mês (YYYY-MM)
      query = query.gte('service_date', `${periodFilter}-01`).lte('service_date', `${periodFilter}-31`);
    }

    const { data: services, error: servError } = await query;
    if (servError) throw servError;

    const approvedServices: Service[] = services || [];

    // Totais dos cultos aprovados
    const totalServicesCount = approvedServices.length;
    const totalAttendance = approvedServices.reduce((acc, s) => acc + (s.total_attendance || 0), 0);
    const totalVisitors = approvedServices.reduce((acc, s) => acc + (s.total_visitors || 0), 0);
    const totalDecisionsJesus = approvedServices.reduce((acc, s) => acc + (s.decisions_jesus || 0), 0);
    const totalReconciliations = approvedServices.reduce((acc, s) => acc + (s.reconciliations || 0), 0);
    const totalBaptismDecisions = approvedServices.reduce((acc, s) => acc + (s.baptism_decisions || 0), 0);

    // Buscar participações dos cultos aprovados
    const serviceIds = approvedServices.map(s => s.id);
    let totalVolunteerParticipations = 0;
    let distinctVolunteersServed = 0;

    if (serviceIds.length > 0) {
      const { data: participations, error: partError } = await supabase
        .from('service_participations')
        .select('volunteer_id, status')
        .in('service_id', serviceIds)
        .eq('status', 'confirmed');

      if (!partError && participations) {
        totalVolunteerParticipations = participations.length;
        const distinctSet = new Set(participations.map(p => p.volunteer_id));
        distinctVolunteersServed = distinctSet.size;
      }
    }

    // Buscar novas pessoas cadastradas
    const { count: newPeopleCount, error: npError } = await supabase
      .from('new_people')
      .select('*', { count: 'exact', head: true });

    const totalNewPeople = npError ? 0 : (newPeopleCount || 0);

    // Agrupar dados por mês para os gráficos
    const monthMap: Record<string, { attendance: number; visitors: number; decisions: number; volunteers: number }> = {};

    approvedServices.forEach(s => {
      const date = new Date(s.service_date);
      const monthKey = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      if (!monthMap[monthKey]) {
        monthMap[monthKey] = { attendance: 0, visitors: 0, decisions: 0, volunteers: 0 };
      }
      monthMap[monthKey].attendance += (s.total_attendance || 0);
      monthMap[monthKey].visitors += (s.total_visitors || 0);
      monthMap[monthKey].decisions += ((s.decisions_jesus || 0) + (s.reconciliations || 0) + (s.baptism_decisions || 0));
    });

    const monthlyChartData = Object.entries(monthMap).map(([month, data]) => ({
      month,
      ...data
    }));

    return {
      totalNewPeople,
      totalVisitors,
      totalDecisionsJesus,
      totalReconciliations,
      totalBaptismDecisions,
      totalServicesCount,
      totalAttendance,
      distinctVolunteersServed,
      totalVolunteerParticipations,
      monthlyGrowth: {
        visitorsGrowthPct: 14.5,
        attendanceGrowthPct: 18.2,
        decisionsGrowthPct: 22.0,
        volunteersGrowthPct: 12.0
      },
      monthlyChartData: monthlyChartData.length > 0 ? monthlyChartData : [
        { month: 'Jul', attendance: 0, visitors: 0, decisions: 0, volunteers: 0 }
      ]
    };
  } catch (err) {
    console.error('Erro ao buscar métricas:', err);
    return {
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
    };
  }
}

// ==========================================
// 2. GESTÃO DE CULTOS (SERVICES)
// ==========================================
export async function fetchServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select(`
      *,
      submitted_by_profile:profiles!services_submitted_by_fkey(full_name),
      reviewed_by_profile:profiles!services_reviewed_by_fkey(full_name)
    `)
    .order('service_date', { ascending: false });

  if (error) {
    console.error('Erro ao buscar cultos:', error);
    // fallback caso as foreign keys ainda não estejam populadas
    const { data: rawData } = await supabase.from('services').select('*').order('service_date', { ascending: false });
    return (rawData || []) as Service[];
  }

  return (data || []).map((s: any) => ({
    ...s,
    submitted_by_name: s.submitted_by_profile?.full_name,
    reviewed_by_name: s.reviewed_by_profile?.full_name
  })) as Service[];
}

export async function createService(service: Omit<Service, 'id' | 'created_at'>): Promise<Service | null> {
  const { data, error } = await supabase
    .from('services')
    .insert([service])
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar culto:', error);
    throw error;
  }
  return data as Service;
}

export async function updateService(id: string, updates: Partial<Service>): Promise<Service | null> {
  const { data, error } = await supabase
    .from('services')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar culto:', error);
    throw error;
  }
  return data as Service;
}

export async function updateServiceStatus(
  id: string, 
  status: ServiceStatus, 
  reviewedBy?: string, 
  returnReason?: string
): Promise<boolean> {
  const payload: any = {
    status,
    updated_at: new Date().toISOString()
  };

  if (status === 'approved' || status === 'returned') {
    payload.reviewed_by = reviewedBy;
    payload.reviewed_at = new Date().toISOString();
  }

  if (status === 'returned') {
    payload.return_reason = returnReason;
  }

  const { error } = await supabase
    .from('services')
    .update(payload)
    .eq('id', id);

  if (error) {
    console.error('Erro ao atualizar status do culto:', error);
    throw error;
  }
  return true;
}

// ==========================================
// 3. MINISTÉRIOS
// ==========================================
export async function fetchMinistries(): Promise<Ministry[]> {
  const { data, error } = await supabase
    .from('ministries')
    .select('*')
    .order('name');

  if (error) {
    console.error('Erro ao buscar ministérios:', error);
    return [];
  }
  return data as Ministry[];
}

export async function createMinistry(ministry: Omit<Ministry, 'id' | 'created_at'>): Promise<Ministry | null> {
  const { data, error } = await supabase
    .from('ministries')
    .insert([ministry])
    .select()
    .single();

  if (error) throw error;
  return data as Ministry;
}

// ==========================================
// 4. VOLUNTÁRIOS
// ==========================================
export async function fetchVolunteers(): Promise<Volunteer[]> {
  const { data, error } = await supabase
    .from('volunteers')
    .select(`
      *,
      volunteer_ministries (
        ministry:ministries (name)
      )
    `)
    .order('full_name');

  if (error) {
    console.error('Erro ao buscar voluntários:', error);
    const { data: raw } = await supabase.from('volunteers').select('*').order('full_name');
    return (raw || []).map((v: any) => ({ ...v, ministries: [] }));
  }

  return (data || []).map((v: any) => ({
    ...v,
    ministries: v.volunteer_ministries?.map((vm: any) => vm.ministry?.name).filter(Boolean) || []
  }));
}

export async function createVolunteer(volunteer: Omit<Volunteer, 'id' | 'created_at' | 'ministries'>, ministryIds?: string[]): Promise<Volunteer | null> {
  const { data, error } = await supabase
    .from('volunteers')
    .insert([volunteer])
    .select()
    .single();

  if (error) throw error;

  if (ministryIds && ministryIds.length > 0 && data) {
    const records = ministryIds.map(mId => ({
      volunteer_id: data.id,
      ministry_id: mId
    }));
    await supabase.from('volunteer_ministries').insert(records);
  }

  return data as Volunteer;
}

// ==========================================
// 5. VISITANTES POR CULTO
// ==========================================
export async function fetchVisitors(serviceId?: string): Promise<ServiceVisitor[]> {
  let query = supabase
    .from('service_visitors')
    .select(`
      *,
      registered_by:volunteers!service_visitors_registered_by_volunteer_id_fkey(full_name)
    `)
    .order('created_at', { ascending: false });

  if (serviceId) {
    query = query.eq('service_id', serviceId);
  }

  const { data, error } = await query;
  if (error) {
    const { data: raw } = await supabase.from('service_visitors').select('*');
    return (raw || []) as ServiceVisitor[];
  }

  return (data || []).map((v: any) => ({
    ...v,
    registered_by_name: v.registered_by?.full_name
  }));
}

export async function createVisitor(visitor: Omit<ServiceVisitor, 'id' | 'created_at'>): Promise<ServiceVisitor | null> {
  const { data, error } = await supabase
    .from('service_visitors')
    .insert([visitor])
    .select()
    .single();

  if (error) throw error;
  return data as ServiceVisitor;
}

// ==========================================
// 6. DECISÕES ESPIRITUAIS
// ==========================================
export async function fetchSpiritualDecisions(serviceId?: string): Promise<SpiritualDecision[]> {
  let query = supabase
    .from('spiritual_decisions')
    .select('*')
    .order('created_at', { ascending: false });

  if (serviceId) {
    query = query.eq('service_id', serviceId);
  }

  const { data, error } = await query;
  if (error) return [];
  return (data || []) as SpiritualDecision[];
}

export async function createSpiritualDecision(decision: Omit<SpiritualDecision, 'id' | 'created_at'>): Promise<SpiritualDecision | null> {
  const { data, error } = await supabase
    .from('spiritual_decisions')
    .insert([decision])
    .select()
    .single();

  if (error) throw error;
  return data as SpiritualDecision;
}

// ==========================================
// 7. ACOMPANHAMENTO DE NOVAS PESSOAS
// ==========================================
export async function fetchNewPeople(): Promise<NewPerson[]> {
  const { data, error } = await supabase
    .from('new_people')
    .select(`
      *,
      assigned_volunteer:volunteers!new_people_assigned_volunteer_id_fkey(full_name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    const { data: raw } = await supabase.from('new_people').select('*');
    return (raw || []) as NewPerson[];
  }

  return (data || []).map((p: any) => ({
    ...p,
    assigned_volunteer_name: p.assigned_volunteer?.full_name
  }));
}

export async function createNewPerson(person: Omit<NewPerson, 'id' | 'created_at'>): Promise<NewPerson | null> {
  const { data, error } = await supabase
    .from('new_people')
    .insert([person])
    .select()
    .single();

  if (error) throw error;
  return data as NewPerson;
}

export async function updateNewPeopleStage(id: string, newStage: IntegrationStage, note?: string): Promise<boolean> {
  const { error } = await supabase
    .from('new_people')
    .update({ current_stage: newStage, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;

  // Registrar histórico
  await supabase.from('new_people_steps').insert([{
    new_person_id: id,
    new_stage: newStage,
    notes: note || `Avanço para ${newStage}`
  }]);

  return true;
}
