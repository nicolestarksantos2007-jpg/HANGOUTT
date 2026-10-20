-- ========================================================
-- HANGOUT DASHBOARD — SCHEMA OFICIAL ATUALIZADO
-- ========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TIPOS E ENUMS
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

-- 1. TABELA: PROFILES
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

-- 2. TABELA: MINISTRIES (10 Ministérios Oficiais do Hangout)
CREATE TABLE IF NOT EXISTS public.ministries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    color_hex TEXT DEFAULT '#1E40AF',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Inserir / Atualizar os 10 Ministérios Oficiais
INSERT INTO public.ministries (name, description, color_hex)
VALUES 
    ('Hangout', 'Recepção, acolhimento, conexão de visitantes e cultura Outside', '#2563EB'),
    ('Staff', 'Organização de fluxo, suporte operacional e segurança do ambiente', '#1D4ED8'),
    ('Projeção', 'Operação de letras, telas, vídeos e suporte visual do culto', '#4338CA'),
    ('Stories', 'Cobertura em tempo real para mídias sociais e engajamento', '#7C3AED'),
    ('Fotos', 'Registro fotográfico profissional dos cultos e das vidas', '#6D28D9'),
    ('Infra', 'Estrutura física, climatização, limpeza, montagem e equipamentos', '#0F766E'),
    ('Gestão', 'Administração de dados, escalas, métricas e suporte à liderança', '#0369A1'),
    ('Profético', 'Intercessão, escuta espiritual, oração e acolhimento profético', '#B45309'),
    ('Músicos', 'Banda, arranjos, instrumentos e excelência no louvor', '#BE185D'),
    ('Ministração', 'Liderança de louvor, direcionamento espiritual e voz', '#9D174D')
ON CONFLICT (name) DO UPDATE SET is_active = TRUE;

-- 3. TABELA: VOLUNTEERS
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

-- 4. TABELA: VOLUNTEER_MINISTRIES
CREATE TABLE IF NOT EXISTS public.volunteer_ministries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    volunteer_id UUID NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
    ministry_id UUID NOT NULL REFERENCES public.ministries(id) ON DELETE CASCADE,
    role_name TEXT DEFAULT 'Voluntário',
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    UNIQUE(volunteer_id, ministry_id)
);

-- 5. TABELA: SERVICES (Dados de Cultos)
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
    volunteers_served_count INTEGER DEFAULT 0,
    notes TEXT,
    status service_status DEFAULT 'approved' NOT NULL,
    submitted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    submitted_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    return_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. TABELA: SERVICE_VISITORS (Fichas de Visitantes)
CREATE TABLE IF NOT EXISTS public.service_visitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    age INTEGER,
    phone TEXT,
    visit_date DATE DEFAULT CURRENT_DATE,
    accompanied BOOLEAN DEFAULT FALSE NOT NULL, -- false = Sozinho, true = Acompanhado
    contact_volunteer_name TEXT, -- Responsável pelo contato
    registered_by_volunteer_id UUID REFERENCES public.volunteers(id) ON DELETE SET NULL,
    neighborhood TEXT,
    interests TEXT[],
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Migrações adicionais caso as colunas ainda não existam
ALTER TABLE public.service_visitors ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE public.service_visitors ADD COLUMN IF NOT EXISTS visit_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.service_visitors ADD COLUMN IF NOT EXISTS contact_volunteer_name TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS volunteers_served_count INTEGER DEFAULT 0;

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ministries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_ministries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_visitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso completo a autenticados em ministérios" ON public.ministries FOR ALL TO authenticated USING (true);
CREATE POLICY "Acesso completo a autenticados em perfis" ON public.profiles FOR ALL TO authenticated USING (true);
CREATE POLICY "Acesso completo a autenticados em cultos" ON public.services FOR ALL TO authenticated USING (true);
CREATE POLICY "Acesso completo a autenticados em voluntários" ON public.volunteers FOR ALL TO authenticated USING (true);
CREATE POLICY "Acesso completo a autenticados em visitantes" ON public.service_visitors FOR ALL TO authenticated USING (true);
