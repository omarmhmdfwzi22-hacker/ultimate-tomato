-- ============================================================
-- ULTIMATE TOMATO: Multi-Tenant Portfolio Platform
-- Supabase PostgreSQL Schema & Row Level Security (RLS)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Platform Settings (Global Ultimate Tomato Configuration)
CREATE TABLE IF NOT EXISTS platform_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform_name TEXT NOT NULL DEFAULT 'Ultimate Tomato',
    logo_url TEXT DEFAULT '/assets/ultimate-tomato-logo.png',
    primary_color TEXT DEFAULT '#F52F3A',
    support_email TEXT DEFAULT 'support@ultimatetomato.com',
    maintenance_mode BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Clients Table (Tenants)
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'PENDING_ONBOARDING')),
    onboarding_token TEXT UNIQUE,
    onboarding_completed BOOLEAN DEFAULT false,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Portfolios Table
CREATE TABLE IF NOT EXISTS portfolios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    published BOOLEAN DEFAULT false,
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED')),
    custom_domain TEXT UNIQUE,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Users Table (Maps to Supabase auth.users or tenant users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'CLIENT' CHECK (role IN ('SUPER_ADMIN', 'CLIENT', 'ADMIN', 'EDITOR')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Categories Table (Database-driven per portfolio)
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0,
    visible BOOLEAN DEFAULT true,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (portfolio_id, slug)
);

-- 6. Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    short_description TEXT,
    full_description TEXT,
    client TEXT,
    date TEXT,
    technologies TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    featured BOOLEAN DEFAULT false,
    published BOOLEAN DEFAULT false,
    hero_image TEXT,
    project_url TEXT,
    github_url TEXT,
    challenge TEXT,
    solution TEXT,
    results TEXT,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (portfolio_id, slug)
);

-- 7. Project Images Table (Dedicated gallery entity)
CREATE TABLE IF NOT EXISTS project_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Skills Table
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    level INT DEFAULT 85 CHECK (level BETWEEN 1 AND 100),
    icon TEXT,
    years INT,
    sort_order INT DEFAULT 0,
    visible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Experiences Table (Timeline)
CREATE TABLE IF NOT EXISTS experiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    company TEXT NOT NULL,
    position TEXT NOT NULL,
    location TEXT,
    start_date TEXT NOT NULL,
    end_date TEXT,
    current_position BOOLEAN DEFAULT false,
    description TEXT,
    technologies TEXT[] DEFAULT '{}',
    company_logo TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Services Table
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    features TEXT[] DEFAULT '{}',
    price TEXT,
    currency TEXT DEFAULT 'USD',
    cta TEXT DEFAULT 'Get in Touch',
    active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Testimonials Table
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT,
    company TEXT,
    avatar TEXT,
    content TEXT NOT NULL,
    rating INT DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
    published BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 12. Social Links Table
CREATE TABLE IF NOT EXISTS social_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    label TEXT,
    icon TEXT,
    sort_order INT DEFAULT 0,
    visible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 13. Messages Table (Contact Inbox)
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    sender TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'UNREAD' CHECK (status IN ('UNREAD', 'READ', 'ARCHIVED')),
    date TIMESTAMPTZ DEFAULT now()
);

-- 14. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 15. Portfolio Site Settings (Per-Portfolio Client Settings)
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID NOT NULL UNIQUE REFERENCES portfolios(id) ON DELETE CASCADE,
    title TEXT,
    description TEXT,
    logo TEXT,
    favicon TEXT,
    primary_color TEXT DEFAULT '#F52F3A',
    default_theme TEXT DEFAULT 'dark' CHECK (default_theme IN ('dark', 'light', 'system')),
    seo_title TEXT,
    seo_description TEXT,
    og_image TEXT,
    contact_email TEXT,
    phone TEXT,
    location TEXT,
    bio TEXT,
    professional_title TEXT,
    portrait_url TEXT,
    resume_url TEXT,
    stats JSONB DEFAULT '{"projects": 0, "experience_years": 0, "clients": 0, "technologies": 0}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 16. Audit Logs Table (Super Admin Tracking)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    user_email TEXT,
    client_id UUID,
    portfolio_id UUID,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for high query performance
CREATE INDEX IF NOT EXISTS idx_portfolios_slug ON portfolios(slug);
CREATE INDEX IF NOT EXISTS idx_portfolios_client_id ON portfolios(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_portfolio_id ON projects(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_project_images_project_id ON project_images(project_id);
CREATE INDEX IF NOT EXISTS idx_categories_portfolio_id ON categories(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_skills_portfolio_id ON skills(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_experiences_portfolio_id ON experiences(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_services_portfolio_id ON services(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_portfolio_id ON testimonials(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_messages_portfolio_id ON messages(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_notifications_portfolio_id ON notifications(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_portfolio_id ON audit_logs(portfolio_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is SUPER_ADMIN
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get the current user's portfolio_id
CREATE OR REPLACE FUNCTION get_user_portfolio_id()
RETURNS UUID AS $$
DECLARE
    v_portfolio_id UUID;
BEGIN
    SELECT p.id INTO v_portfolio_id
    FROM portfolios p
    JOIN clients c ON p.client_id = c.id
    JOIN users u ON u.client_id = c.id
    WHERE u.id = auth.uid() AND p.deleted_at IS NULL
    LIMIT 1;
    RETURN v_portfolio_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Public Read Policies (Published portfolios & projects)
CREATE POLICY "Public can view published portfolios"
ON portfolios FOR SELECT
USING (published = true AND deleted_at IS NULL);

CREATE POLICY "Public can view published projects of published portfolios"
ON projects FOR SELECT
USING (
    published = true 
    AND deleted_at IS NULL 
    AND EXISTS (
        SELECT 1 FROM portfolios p 
        WHERE p.id = projects.portfolio_id 
        AND p.published = true 
        AND p.deleted_at IS NULL
    )
);

CREATE POLICY "Public can view published project images"
ON project_images FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM projects pr
        JOIN portfolios po ON pr.portfolio_id = po.id
        WHERE pr.id = project_images.project_id
        AND pr.published = true
        AND po.published = true
    )
);

CREATE POLICY "Public can view visible categories"
ON categories FOR SELECT
USING (visible = true AND deleted_at IS NULL);

CREATE POLICY "Public can view visible skills"
ON skills FOR SELECT
USING (visible = true);

CREATE POLICY "Public can view experiences"
ON experiences FOR SELECT
USING (true);

CREATE POLICY "Public can view active services"
ON services FOR SELECT
USING (active = true);

CREATE POLICY "Public can view published testimonials"
ON testimonials FOR SELECT
USING (published = true AND deleted_at IS NULL);

CREATE POLICY "Public can view visible social links"
ON social_links FOR SELECT
USING (visible = true);

CREATE POLICY "Public can view site settings"
ON site_settings FOR SELECT
USING (true);

CREATE POLICY "Public can submit contact messages"
ON messages FOR INSERT
WITH CHECK (true);

-- 2. Tenant CLIENT Policies (Enforce strict isolation)
CREATE POLICY "Clients can view own portfolio"
ON portfolios FOR SELECT
USING (id = get_user_portfolio_id() OR is_super_admin());

CREATE POLICY "Clients can update own portfolio"
ON portfolios FOR UPDATE
USING (id = get_user_portfolio_id() OR is_super_admin());

CREATE POLICY "Clients manage own projects"
ON projects FOR ALL
USING (portfolio_id = get_user_portfolio_id() OR is_super_admin())
WITH CHECK (portfolio_id = get_user_portfolio_id() OR is_super_admin());

CREATE POLICY "Clients manage own project images"
ON project_images FOR ALL
USING (
    EXISTS (SELECT 1 FROM projects p WHERE p.id = project_images.project_id AND (p.portfolio_id = get_user_portfolio_id() OR is_super_admin()))
)
WITH CHECK (
    EXISTS (SELECT 1 FROM projects p WHERE p.id = project_images.project_id AND (p.portfolio_id = get_user_portfolio_id() OR is_super_admin()))
);

CREATE POLICY "Clients manage own categories"
ON categories FOR ALL
USING (portfolio_id = get_user_portfolio_id() OR is_super_admin())
WITH CHECK (portfolio_id = get_user_portfolio_id() OR is_super_admin());

CREATE POLICY "Clients manage own skills"
ON skills FOR ALL
USING (portfolio_id = get_user_portfolio_id() OR is_super_admin())
WITH CHECK (portfolio_id = get_user_portfolio_id() OR is_super_admin());

CREATE POLICY "Clients manage own experiences"
ON experiences FOR ALL
USING (portfolio_id = get_user_portfolio_id() OR is_super_admin())
WITH CHECK (portfolio_id = get_user_portfolio_id() OR is_super_admin());

CREATE POLICY "Clients manage own services"
ON services FOR ALL
USING (portfolio_id = get_user_portfolio_id() OR is_super_admin())
WITH CHECK (portfolio_id = get_user_portfolio_id() OR is_super_admin());

CREATE POLICY "Clients manage own testimonials"
ON testimonials FOR ALL
USING (portfolio_id = get_user_portfolio_id() OR is_super_admin())
WITH CHECK (portfolio_id = get_user_portfolio_id() OR is_super_admin());

CREATE POLICY "Clients manage own social links"
ON social_links FOR ALL
USING (portfolio_id = get_user_portfolio_id() OR is_super_admin())
WITH CHECK (portfolio_id = get_user_portfolio_id() OR is_super_admin());

CREATE POLICY "Clients view own messages"
ON messages FOR SELECT
USING (portfolio_id = get_user_portfolio_id() OR is_super_admin());

CREATE POLICY "Clients update own messages"
ON messages FOR UPDATE
USING (portfolio_id = get_user_portfolio_id() OR is_super_admin());

CREATE POLICY "Clients delete own messages"
ON messages FOR DELETE
USING (portfolio_id = get_user_portfolio_id() OR is_super_admin());

CREATE POLICY "Clients manage own site settings"
ON site_settings FOR ALL
USING (portfolio_id = get_user_portfolio_id() OR is_super_admin())
WITH CHECK (portfolio_id = get_user_portfolio_id() OR is_super_admin());

CREATE POLICY "Clients view own notifications"
ON notifications FOR ALL
USING (portfolio_id = get_user_portfolio_id() OR is_super_admin());

-- 3. Super Admin Unrestricted Access
CREATE POLICY "Super admin manages clients"
ON clients FOR ALL
USING (is_super_admin());

CREATE POLICY "Super admin manages platform settings"
ON platform_settings FOR ALL
USING (is_super_admin());

CREATE POLICY "Super admin views audit logs"
ON audit_logs FOR ALL
USING (is_super_admin());
