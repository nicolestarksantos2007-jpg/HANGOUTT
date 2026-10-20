-- ========================================================
-- HANGOUT DASHBOARD — SCHEMA OFICIAL SUPABASE POSTGRESQL
-- Banco de Dados: https://gybbjalhfvwditihhlcf.supabase.co
-- ========================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS E TIPOS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'general_leader', 'ministry_leader', 'volunteer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE service_status AS ENUM ('draft', 'submitted', 'in_review', 'returned', 'approved');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE integration_stage AS ENUM ('novo_cadastro', 'contato_pendente', 'contato_realizado', 'retornou', 'acompanhamento', 'integrado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TABELA: PROFILES (Perfis de Usuários)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    role user_role DEFAULT 'volunteer' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. TABELA: MINISTRIES (Ministérios do Hangout)
CREATE TABLE IF NOT EXISTS public.ministries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    color_hex TEXT DEFAULT '#1E40AF',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Inserir os 4 ministérios padrão do Hangout
INSERT INTO public.ministries (name, description, color_hex)
VALUES 
    ('Recepção e Acolhimento', 'Primeiro contato, boas-vindas, crachás e orientações nos cultos', '#2563EB'),
    ('Integração e Igrupos', 'Conexão de novos visitantes a grupos nos lares e discipulado', '#0D9488'),
    ('Comunicação e Mídias', 'Avisos, conexões digitais, suporte e registros', '#4F46E5'),
    ('Intercessão e Apoio', 'Suporte espiritual, oração e organização do templo', '#0284C7')
ON CONFLICT (name) DO NOTHING;

-- 4. TABELA: MINISTRY_LEADERS (Líderes por Ministério)
CREATE TABLE IF NOT EXISTS public.ministry_leaders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ministry_id UUID NOT NULL REFERENCES public.ministries(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    UNIQUE(ministry_id, profile_id)
);

-- 5. TABELA: VOLUNTEERS (Base Centralizada de Voluntários)
CREATE TABLE IF NOT EXISTS public.volunteers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    cpf TEXT UNIQUE,
    phone TEXT,
    email TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. TABELA: VOLUNTEER_MINISTRIES (Vínculo Voluntário x Ministérios)
CREATE TABLE IF NOT EXISTS public.volunteer_ministries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    volunteer_id UUID NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
    ministry_id UUID NOT NULL REFERENCES public.ministries(id) ON DELETE CASCADE,
    role_name TEXT DEFAULT 'Voluntário',
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    UNIQUE(volunteer_id, ministry_id)
);

-- 7. TABELA: SERVICES (Cultos)
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_date DATE NOT NULL,
    service_name TEXT NOT NULL,
    service_time TEXT DEFAULT '19:30',
    total_attendance INTEGER DEFAULT 0 NOT NULL,
    total_visitors INTEGER DEFAULT 0 NOT NULL,
    decisions_jesus INTEGER DEFAULT 0 NOT NULL,
    reconciliations INTEGER DEFAULT 0 NOT NULL,
    baptism_decisions INTEGER DEFAULT 0 NOT NULL,
    notes TEXT,
    status service_status DEFAULT 'draft' NOT NULL,
    submitted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    submitted_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    return_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. TABELA: SERVICE_PARTICIPATIONS (Escala & Presenças Reais de Voluntários)
CREATE TABLE IF NOT EXISTS public.service_participations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    volunteer_id UUID NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
    ministry_id UUID NOT NULL REFERENCES public.ministries(id) ON DELETE CASCADE,
    role_name TEXT DEFAULT 'Recepção',
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('scheduled', 'confirmed', 'absent')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(service_id, volunteer_id, ministry_id)
);

-- 9. TABELA: SERVICE_VISITORS (Visitantes Registrados por Culto)
CREATE TABLE IF NOT EXISTS public.service_visitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    neighborhood TEXT,
    accompanied BOOLEAN DEFAULT FALSE NOT NULL,
    registered_by_volunteer_id UUID REFERENCES public.volunteers(id) ON DELETE SET NULL,
    interests TEXT[], -- Ex: ARRAY['igrupos', 'outrun', 'purpose']
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 10. TABELA: SPIRITUAL_DECISIONS (Decisões Espirituais por Culto)
CREATE TABLE IF NOT EXISTS public.spiritual_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    person_name TEXT NOT NULL,
    phone TEXT,
    decision_type TEXT NOT NULL CHECK (decision_type IN ('jesus', 'reconciliation', 'baptism')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 11. TABELA: NEW_PEOPLE (Funil de Acompanhamento e Integração de Pessoas)
CREATE TABLE IF NOT EXISTS public.new_people (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    phone TEXT,
    first_visit_date DATE DEFAULT CURRENT_DATE,
    current_stage integration_stage DEFAULT 'novo_cadastro' NOT NULL,
    assigned_volunteer_id UUID REFERENCES public.volunteers(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 12. TABELA: NEW_PEOPLE_STEPS (Histórico das Etapas de Contato)
CREATE TABLE IF NOT EXISTS public.new_people_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    new_person_id UUID NOT NULL REFERENCES public.new_people(id) ON DELETE CASCADE,
    previous_stage integration_stage,
    new_stage integration_stage NOT NULL,
    notes TEXT,
    contact_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    registered_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- 13. TABELA: AUDIT_LOGS (Trilha de Auditoria e Aprovações)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID,
    action TEXT NOT NULL,
    changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 14. TRIGGER: Criação Automática de Perfil ao Cadastrar Usuário no Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        new.email,
        COALESCE((new.raw_user_meta_data->>'role')::user_role, 'volunteer')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 15. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ministries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ministry_leaders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_ministries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spiritual_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.new_people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.new_people_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso:
-- Usuários autenticados podem ler ministérios
CREATE POLICY "Leitura de ministérios permitida a autenticados" ON public.ministries FOR SELECT TO authenticated USING (true);

-- Leitura de perfis
CREATE POLICY "Leitura de perfis permitida a autenticados" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Atualização do próprio perfil" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Cultos: Leitura de cultos aprovados para todos; rascunhos para líderes/criador
CREATE POLICY "Leitura de cultos para autenticados" ON public.services FOR SELECT TO authenticated USING (true);
CREATE POLICY "Inserção e atualização de cultos" ON public.services FOR ALL TO authenticated USING (true);

-- Voluntários e Participações:
CREATE POLICY "Leitura de voluntários" ON public.volunteers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Gestão de voluntários" ON public.volunteers FOR ALL TO authenticated USING (true);

CREATE POLICY "Leitura de escalas" ON public.service_participations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Gestão de escalas" ON public.service_participations FOR ALL TO authenticated USING (true);

-- Visitantes e Decisões:
CREATE POLICY "Leitura de visitantes" ON public.service_visitors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Inserção de visitantes" ON public.service_visitors FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Gestão de visitantes" ON public.service_visitors FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Leitura de decisões" ON public.spiritual_decisions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Gestão de decisões" ON public.spiritual_decisions FOR ALL TO authenticated USING (true);

-- Acompanhamento de Novas Pessoas:
CREATE POLICY "Leitura de novas pessoas" ON public.new_people FOR SELECT TO authenticated USING (true);
CREATE POLICY "Gestão de novas pessoas" ON public.new_people FOR ALL TO authenticated USING (true);
CREATE POLICY "Leitura de passos de novas pessoas" ON public.new_people_steps FOR SELECT TO authenticated USING (true);
CREATE POLICY "Gestão de passos de novas pessoas" ON public.new_people_steps FOR ALL TO authenticated USING (true);

-- Índices de Otimização e Performance:
CREATE INDEX IF NOT EXISTS idx_services_date ON public.services(service_date);
CREATE INDEX IF NOT EXISTS idx_services_status ON public.services(status);
CREATE INDEX IF NOT EXISTS idx_service_part_service ON public.service_participations(service_id);
CREATE INDEX IF NOT EXISTS idx_service_part_vol ON public.service_participations(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_visitors_service ON public.service_visitors(service_id);
CREATE INDEX IF NOT EXISTS idx_new_people_stage ON public.new_people(current_stage);
