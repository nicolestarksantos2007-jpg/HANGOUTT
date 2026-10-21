export type UserRole = 
  | 'lider_base' 
  | 'lider_time' 
  | 'volunteer';

export type UserStatus = 'pending' | 'approved' | 'rejected';

export type ServiceStatus = 'draft' | 'submitted' | 'in_review' | 'returned' | 'approved';

export type HangoutPageKey = 
  | 'dashboard' 
  | 'services' 
  | 'visitor_card' 
  | 'ministries' 
  | 'volunteers' 
  | 'reports' 
  | 'approvals'
  | 'user_admin';

export interface UserProfile {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  team?: string; // 'Time 1' | 'Time 2' | 'Time 3' | 'Time 4' | 'Liderança Base'
  status: UserStatus;
  is_active: boolean;
  avatar_url?: string;
  created_at: string;
}

export interface Ministry {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  color_hex: string;
  volunteers_count?: number;
  created_at: string;
}

export interface Volunteer {
  id: string;
  full_name: string;
  cpf?: string;
  phone?: string;
  email?: string;
  status: 'active' | 'inactive';
  team?: string;
  profile_id?: string;
  ministries: string[];
  roles?: string[];
  times_served_month?: number;
  notes?: string;
  created_at: string;
}

export interface MinistryServingData {
  count: number;
  names?: string;
}

export type MinistryBreakdown = Record<string, MinistryServingData>;

export interface Service {
  id: string;
  service_date: string;
  service_name: string;
  service_time: string;
  total_attendance: number;
  total_visitors: number;
  decisions_jesus: number;
  reconciliations: number;
  baptism_decisions: number;
  volunteers_served_count?: number;
  ministry_breakdown?: MinistryBreakdown;
  serving_team?: string; // Ex: 'Time 1', 'Time 2' etc.
  notes?: string;
  status: ServiceStatus;
  submitted_by?: string;
  submitted_by_name?: string;
  submitted_at?: string;
  reviewed_by?: string;
  reviewed_by_name?: string;
  reviewed_at?: string;
  return_reason?: string;
  created_at: string;
}

export interface ServiceParticipation {
  id: string;
  service_id: string;
  volunteer_id: string;
  volunteer_name?: string;
  ministry_id: string;
  ministry_name?: string;
  role_name: string;
  status: 'scheduled' | 'confirmed' | 'absent';
  notes?: string;
  created_at: string;
}

export interface ServiceVisitor {
  id: string;
  service_id?: string;
  full_name: string;
  age?: number;
  phone?: string;
  visit_date: string;
  accompanied: boolean; // false = sozinho, true = acompanhado
  contact_volunteer_name?: string;
  registered_by_volunteer_id?: string;
  registered_by_name?: string;
  interests?: string[];
  notes?: string;
  created_at: string;
}

export interface MonthlyMetricItem {
  month: string;
  monthKey: string;
  attendance: number;
  visitors: number;
  decisions_jesus: number;
  baptisms: number;
  reconciliations: number;
  volunteers_served: number;
}

export interface DashboardMetrics {
  totalNewPeople: number;
  totalVisitors: number;
  totalDecisionsJesus: number;
  totalReconciliations: number;
  totalBaptismDecisions: number;
  totalServicesCount: number;
  totalAttendance: number;
  distinctVolunteersServed: number;
  totalVolunteerParticipations: number;
  monthlyGrowth: {
    visitorsGrowthPct: number;
    attendanceGrowthPct: number;
    decisionsGrowthPct: number;
    volunteersGrowthPct: number;
  };
  monthlyData: MonthlyMetricItem[];
}
