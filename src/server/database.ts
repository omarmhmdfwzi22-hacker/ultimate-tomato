import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  PlatformSettings,
  Client,
  Portfolio,
  User,
  Category,
  Project,
  ProjectImage,
  Skill,
  Experience,
  Service,
  Testimonial,
  SocialLink,
  ContactMessage,
  Notification,
  SiteSettings,
  AuditLog,
  PublicPortfolioBundle,
  AdminDashboardStats,
} from '../types/portfolio';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

export interface DatabaseSchema {
  platform_settings: PlatformSettings;
  clients: Client[];
  portfolios: Portfolio[];
  users: User[];
  categories: Category[];
  projects: Project[];
  project_images: ProjectImage[];
  skills: Skill[];
  experiences: Experience[];
  services: Service[];
  testimonials: Testimonial[];
  social_links: SocialLink[];
  messages: ContactMessage[];
  notifications: Notification[];
  site_settings: SiteSettings[];
  audit_logs: AuditLog[];
  auth_credentials: {
    email: string;
    passwordHash: string;
    userId: string;
    role: string;
    onboarding_token?: string | null;
  }[];
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

class PersistentDatabase {
  private data: DatabaseSchema;
  private writeLock: boolean = false;

  constructor() {
    this.ensureDirectory();
    this.data = this.loadOrCreate();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  }

  private loadOrCreate(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      } catch (err) {
        console.error('Failed to parse database file. Re-initializing seed data.', err);
      }
    }
    const seed = this.generateInitialSeed();
    this.saveImmediate(seed);
    return seed;
  }

  private saveImmediate(dataToSave: DatabaseSchema) {
    try {
      const tempPath = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Failed to save persistent database:', err);
    }
  }

  public save() {
    this.saveImmediate(this.data);
  }

  private generateInitialSeed(): DatabaseSchema {
    const now = new Date().toISOString();

    // 1. Platform Settings (Ultimate Tomato Brand Core)
    const platform_settings: PlatformSettings = {
      id: crypto.randomUUID(),
      platform_name: 'ULTIMATE TOMATO',
      logo_url: '/assets/ultimate-tomato-logo.png',
      primary_color: '#F52F3A',
      support_email: 'support@ultimatetomato.com',
      maintenance_mode: false,
      created_at: now,
      updated_at: now,
    };

    // 2. Super Admin User
    const superAdminUserId = crypto.randomUUID();
    const superAdminUser: User = {
      id: superAdminUserId,
      client_id: null,
      email: 'admin@ultimatetomato.com',
      role: 'SUPER_ADMIN',
      created_at: now,
      updated_at: now,
    };

    // 3. Client 1: Omar Mohamed Fawzi
    const omarClientId = crypto.randomUUID();
    const omarClient: Client = {
      id: omarClientId,
      name: 'Omar Mohamed Fawzi',
      email: 'omar@ultimatetomato.com',
      status: 'ACTIVE',
      onboarding_token: null,
      onboarding_completed: true,
      deleted_at: null,
      created_at: now,
      updated_at: now,
    };

    // 4. Portfolio 1: Omar's Portfolio
    const omarPortfolioId = crypto.randomUUID();
    const omarPortfolio: Portfolio = {
      id: omarPortfolioId,
      client_id: omarClientId,
      slug: 'omar-mohamed-fawzi',
      name: 'Omar Mohamed Fawzi Portfolio',
      published: true,
      status: 'PUBLISHED',
      custom_domain: null,
      deleted_at: null,
      created_at: now,
      updated_at: now,
    };

    // 5. Client 1 User
    const omarUserId = crypto.randomUUID();
    const omarUser: User = {
      id: omarUserId,
      client_id: omarClientId,
      email: 'omar@ultimatetomato.com',
      role: 'CLIENT',
      created_at: now,
      updated_at: now,
    };

    // 6. Categories for Omar
    const catWebId = crypto.randomUUID();
    const catCreativeId = crypto.randomUUID();
    const catUiId = crypto.randomUUID();
    const catMobileId = crypto.randomUUID();

    const categories: Category[] = [
      {
        id: catWebId,
        portfolio_id: omarPortfolioId,
        name: 'Web Applications',
        slug: 'web-applications',
        description: 'High-performance modern web apps and scalable SaaS frontends.',
        sort_order: 1,
        visible: true,
        deleted_at: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: catCreativeId,
        portfolio_id: omarPortfolioId,
        name: 'Creative Engineering',
        slug: 'creative-engineering',
        description: 'Interactive 3D visuals, micro-interactions, and glassmorphic designs.',
        sort_order: 2,
        visible: true,
        deleted_at: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: catUiId,
        portfolio_id: omarPortfolioId,
        name: 'UI/UX & Design Systems',
        slug: 'ui-ux-design-systems',
        description: 'Design token architecture, accessible components, and editorial styling.',
        sort_order: 3,
        visible: true,
        deleted_at: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: catMobileId,
        portfolio_id: omarPortfolioId,
        name: 'Mobile Experiences',
        slug: 'mobile-experiences',
        description: 'Progressive mobile-first web applications and touch-optimized interfaces.',
        sort_order: 4,
        visible: true,
        deleted_at: null,
        created_at: now,
        updated_at: now,
      },
    ];

    // 7. Projects for Omar
    const p1Id = crypto.randomUUID();
    const p2Id = crypto.randomUUID();
    const p3Id = crypto.randomUUID();
    const p4Id = crypto.randomUUID();

    const projects: Project[] = [
      {
        id: p1Id,
        portfolio_id: omarPortfolioId,
        category_id: catCreativeId,
        title: 'Ultimate Tomato Creative Studio',
        slug: 'ultimate-tomato-creative-studio',
        short_description: 'Next-generation creative agency platform with real-time glassmorphism and tomato-red accents.',
        full_description: 'An expansive creative showcase combining subtle depth, tactile micro-interactions, and high-performance WebGL glow effects designed for modern design agencies.',
        client: 'Ultimate Tomato Labs',
        date: '2026',
        technologies: ['React 19', 'TypeScript', 'Tailwind CSS', 'Motion', 'Vite'],
        tags: ['Featured', 'Glassmorphism', 'Design System'],
        featured: true,
        published: true,
        hero_image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80',
        project_url: 'https://ultimatetomato.com',
        github_url: 'https://github.com/omar-3moor/ultimate-tomato',
        challenge: 'Constructing a design system that feels futuristic and tactile without compromising on Core Web Vitals or accessibility.',
        solution: 'Built a 90/10 minimal-to-glass ratio, offloading blur filters to GPU compositor layers and utilizing CSS color-scheme adaptors.',
        results: 'Achieved 98+ Lighthouse scores, sub-50ms interaction response, and unified design token parity across themes.',
        deleted_at: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: p2Id,
        portfolio_id: omarPortfolioId,
        category_id: catWebId,
        title: 'Linear-Inspired SaaS Control Hub',
        slug: 'linear-inspired-saas-control-hub',
        short_description: 'Minimalist command center with instant keyboard-first workflows and real-time synchronization.',
        full_description: 'A dark-mode first enterprise management dashboard engineered for lightning-speed task triaging, inline editing, and multi-tenant data visualization.',
        client: 'Fintech Core Inc.',
        date: '2025',
        technologies: ['Next.js', 'PostgreSQL', 'TypeScript', 'Tailwind CSS', 'WebSockets'],
        tags: ['SaaS', 'Dark Mode', 'Productivity'],
        featured: true,
        published: true,
        hero_image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80',
        project_url: 'https://example.com/saas-hub',
        github_url: 'https://github.com/omar-3moor/saas-control',
        challenge: 'Handling dense data tables with complex nested relational data while maintaining fluid 60fps scrolling.',
        solution: 'Implemented virtualized list rendering, debounced server updates, and optimistic client-side mutation caches.',
        results: 'Supported 10,000+ simultaneous live rows with zero frame drops.',
        deleted_at: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: p3Id,
        portfolio_id: omarPortfolioId,
        category_id: catUiId,
        title: 'Aether Editorial Portfolio Architecture',
        slug: 'aether-editorial-portfolio-architecture',
        short_description: 'Editorial-grade typography system and masonry showcase tailored for digital creators.',
        full_description: 'Explores high-end typography hierarchy, large display typefaces, and asymmetrical masonry layouts designed for creative directors and senior developers.',
        client: 'Studio Aether',
        date: '2025',
        technologies: ['React', 'Tailwind CSS', 'Framer Motion', 'Figma'],
        tags: ['Editorial', 'Typography', 'Creative'],
        featured: false,
        published: true,
        hero_image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1600&q=80',
        project_url: 'https://example.com/aether',
        github_url: 'https://github.com/omar-3moor/aether',
        challenge: 'Bridging print typography sensibilities with fluid responsive web viewports across mobile and desktop.',
        solution: 'Created fluid clamp() typography calculations and balanced grid systems that adjust dynamically.',
        results: 'Awarded site of the day honors and benchmarked by hundreds of creative developers.',
        deleted_at: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: p4Id,
        portfolio_id: omarPortfolioId,
        category_id: catMobileId,
        title: 'Nova Touch-First Mobile Workspace',
        slug: 'nova-touch-first-mobile-workspace',
        short_description: '[Draft Case Study] Upcoming gesture-driven mobile workspace for distributed teams.',
        full_description: 'An innovative draft project testing native-like bottom sheets, haptic feedback hooks, and offline-first client storage.',
        client: 'Internal R&D',
        date: '2026',
        technologies: ['React Native Web', 'PWA', 'IndexedDB', 'Tailwind CSS'],
        tags: ['Draft', 'Mobile', 'Experimental'],
        featured: false,
        published: false, // DRAFT to test draft preview!
        hero_image: 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?auto=format&fit=crop&w=1600&q=80',
        project_url: '',
        github_url: '',
        challenge: 'Achieving sub-16ms touch gesture response inside web containers.',
        solution: 'Used CSS touch-action manipulation and passive wheel listeners with Web Workers.',
        results: 'Early internal alpha shows 99% gesture parity with native apps.',
        deleted_at: null,
        created_at: now,
        updated_at: now,
      },
    ];

    // 8. Project Images (Dedicated table)
    const project_images: ProjectImage[] = [
      {
        id: crypto.randomUUID(),
        project_id: p1Id,
        image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        alt_text: 'Ultimate Tomato Studio Main Hero View',
        sort_order: 1,
        created_at: now,
        updated_at: now,
      },
      {
        id: crypto.randomUUID(),
        project_id: p1Id,
        image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        alt_text: 'Glassmorphism Design Tokens & Elevation',
        sort_order: 2,
        created_at: now,
        updated_at: now,
      },
      {
        id: crypto.randomUUID(),
        project_id: p1Id,
        image_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
        alt_text: 'Micro-Interactions and Hover Dynamics',
        sort_order: 3,
        created_at: now,
        updated_at: now,
      },
      {
        id: crypto.randomUUID(),
        project_id: p2Id,
        image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
        alt_text: 'Control Hub Overview & Analytics Dashboard',
        sort_order: 1,
        created_at: now,
        updated_at: now,
      },
      {
        id: crypto.randomUUID(),
        project_id: p2Id,
        image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
        alt_text: 'Multi-Tenant Permissions Matrix',
        sort_order: 2,
        created_at: now,
        updated_at: now,
      },
      {
        id: crypto.randomUUID(),
        project_id: p3Id,
        image_url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
        alt_text: 'Editorial Typography Spreads and Visual Grid',
        sort_order: 1,
        created_at: now,
        updated_at: now,
      },
    ];

    // 9. Skills for Omar
    const skills: Skill[] = [
      {
        id: crypto.randomUUID(),
        portfolio_id: omarPortfolioId,
        name: 'Modern React & TypeScript',
        category: 'Development',
        level: 96,
        icon: 'Code2',
        years: 6,
        sort_order: 1,
        visible: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: crypto.randomUUID(),
        portfolio_id: omarPortfolioId,
        name: 'Design Systems & Tailwind CSS',
        category: 'Design',
        level: 95,
        icon: 'Palette',
        years: 5,
        sort_order: 2,
        visible: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: crypto.randomUUID(),
        portfolio_id: omarPortfolioId,
        name: 'High-Performance UI & Animations',
        category: 'Development',
        level: 92,
        icon: 'Sparkles',
        years: 4,
        sort_order: 3,
        visible: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: crypto.randomUUID(),
        portfolio_id: omarPortfolioId,
        name: 'SaaS Architecture & Multi-Tenancy',
        category: 'Architecture',
        level: 89,
        icon: 'Server',
        years: 4,
        sort_order: 4,
        visible: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: crypto.randomUUID(),
        portfolio_id: omarPortfolioId,
        name: 'PostgreSQL & Database Design',
        category: 'Architecture',
        level: 88,
        icon: 'Database',
        years: 4,
        sort_order: 5,
        visible: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: crypto.randomUUID(),
        portfolio_id: omarPortfolioId,
        name: 'UI/UX Prototyping & Glassmorphism',
        category: 'Design',
        level: 90,
        icon: 'Layout',
        years: 5,
        sort_order: 6,
        visible: true,
        created_at: now,
        updated_at: now,
      },
    ];

    // 10. Experiences for Omar (Tasteful editable placeholders, strictly no fabricated employers)
    const experiences: Experience[] = [
      {
        id: crypto.randomUUID(),
        portfolio_id: omarPortfolioId,
        company: 'Ultimate Tomato Studio',
        position: 'Lead Creative Developer & Digital Architect',
        location: 'Remote',
        start_date: '2024',
        end_date: '',
        current_position: true,
        description: 'Architecting multi-tenant portfolio ecosystems, developing high-end interactive client web applications, and maintaining the Ultimate Tomato design system. [Editable placeholder]',
        technologies: ['React 19', 'TypeScript', 'PostgreSQL', 'Tailwind CSS', 'Vite'],
        company_logo: '/assets/ultimate-tomato-logo.png',
        sort_order: 1,
        created_at: now,
        updated_at: now,
      },
      {
        id: crypto.randomUUID(),
        portfolio_id: omarPortfolioId,
        company: 'Independent Digital Craftsman',
        position: 'Senior Frontend Engineer & UI Consultant',
        location: 'Global / Remote',
        start_date: '2022',
        end_date: '2024',
        current_position: false,
        description: 'Delivered bespoke web applications, design systems, and client portfolio experiences with focus on performance, accessibility, and modern aesthetics. [Editable placeholder]',
        technologies: ['Next.js', 'Framer Motion', 'Tailwind CSS', 'Node.js'],
        company_logo: '',
        sort_order: 2,
        created_at: now,
        updated_at: now,
      },
    ];

    // 11. Services for Omar
    const services: Service[] = [
      {
        id: crypto.randomUUID(),
        portfolio_id: omarPortfolioId,
        title: 'Full-Stack Web Development',
        description: 'Building blazing-fast, responsive web applications engineered with React, TypeScript, and robust API architectures.',
        icon: 'Code',
        features: ['React 19 & TypeScript', 'PostgreSQL / Supabase Integration', 'Sub-second page speeds', 'Responsive across all devices'],
        price: 'From $1,500',
        currency: 'USD',
        cta: 'Start Project',
        active: true,
        sort_order: 1,
        created_at: now,
        updated_at: now,
      },
      {
        id: crypto.randomUUID(),
        portfolio_id: omarPortfolioId,
        title: 'UI/UX & Design Systems',
        description: 'Designing high-impact, cohesive visual languages, glassmorphic accents, and accessible component libraries.',
        icon: 'Palette',
        features: ['Bespoke Design Tokens', 'Dark & Light Mode Parity', 'Tactile Micro-Interactions', 'Figma to Production Code'],
        price: 'From $1,200',
        currency: 'USD',
        cta: 'Request Design',
        active: true,
        sort_order: 2,
        created_at: now,
        updated_at: now,
      },
      {
        id: crypto.randomUUID(),
        portfolio_id: omarPortfolioId,
        title: 'SaaS Platform Architecture',
        description: 'Multi-tenant database modeling, secure authentication, role-based permissions, and high-volume data control hubs.',
        icon: 'Layers',
        features: ['Multi-Tenancy from Day 1', 'Row Level Security (RLS)', 'Automated Audit Logging', 'Scalable Cloud Storage'],
        price: 'Custom',
        currency: 'USD',
        cta: 'Consult Architecture',
        active: true,
        sort_order: 3,
        created_at: now,
        updated_at: now,
      },
    ];

    // 12. Testimonials for Omar
    const testimonials: Testimonial[] = [
      {
        id: crypto.randomUUID(),
        portfolio_id: omarPortfolioId,
        name: 'Elena Rostova',
        role: 'Design Director',
        company: 'Studio Lumina',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        content: 'Omar translated our most ambitious visual concepts into silky-smooth web interactions. His attention to typography and subtle glass depth is world-class.',
        rating: 5,
        published: true,
        sort_order: 1,
        deleted_at: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: crypto.randomUUID(),
        portfolio_id: omarPortfolioId,
        name: 'Marc Vance',
        role: 'Founder & CEO',
        company: 'HyperShift Labs',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        content: 'Working with Omar on our SaaS dashboard set a whole new bar for our engineering team. Rapid delivery, flawless architecture, and zero technical debt.',
        rating: 5,
        published: true,
        sort_order: 2,
        deleted_at: null,
        created_at: now,
        updated_at: now,
      },
    ];

    // 13. Social Links for Omar (Facebook is VERIFIED!)
    const social_links: SocialLink[] = [
      {
        id: crypto.randomUUID(),
        portfolio_id: omarPortfolioId,
        platform: 'Facebook',
        url: 'https://www.facebook.com/omar.mhmdfwzi',
        label: 'Facebook Profile',
        icon: 'Facebook',
        sort_order: 1,
        visible: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: crypto.randomUUID(),
        portfolio_id: omarPortfolioId,
        platform: 'GitHub',
        url: 'https://github.com/omar-3moor',
        label: 'GitHub Repositories',
        icon: 'Github',
        sort_order: 2,
        visible: true,
        created_at: now,
        updated_at: now,
      },
    ];

    // 14. Messages (Initial sample inquiry)
    const messages: ContactMessage[] = [
      {
        id: crypto.randomUUID(),
        portfolio_id: omarPortfolioId,
        sender: 'Sarah Jenkins',
        email: 'sarah.jenkins@designcorp.io',
        subject: 'Collaboration on Next-Gen SaaS Platform',
        message: 'Hi Omar! We came across your creative work and would love to discuss a potential partnership on our upcoming design system and dashboard overhaul. Looking forward to connecting!',
        status: 'UNREAD',
        date: now,
      },
    ];

    // 15. Notifications
    const notifications: Notification[] = [
      {
        id: crypto.randomUUID(),
        user_id: omarUserId,
        portfolio_id: omarPortfolioId,
        type: 'MESSAGE',
        title: 'New Contact Inquiry',
        message: 'Sarah Jenkins sent you a message regarding Collaboration on Next-Gen SaaS Platform.',
        read: false,
        created_at: now,
      },
      {
        id: crypto.randomUUID(),
        user_id: omarUserId,
        portfolio_id: omarPortfolioId,
        type: 'SYSTEM',
        title: 'Welcome to Ultimate Tomato',
        message: 'Your multi-tenant portfolio is live. You can edit all content, projects, and themes directly from your dashboard.',
        read: true,
        created_at: now,
      },
    ];

    // 16. Site Settings for Omar (Per-Portfolio Client Settings)
    const site_settings: SiteSettings[] = [
      {
        id: crypto.randomUUID(),
        portfolio_id: omarPortfolioId,
        title: 'Omar Mohamed Fawzi — Creative Developer & Digital Builder',
        description: 'Official portfolio of Omar Mohamed Fawzi, engineered by Ultimate Tomato. Specialized in high-performance web applications, modern SaaS interfaces, and creative engineering.',
        logo: '/assets/ultimate-tomato-logo.png',
        favicon: '/assets/ultimate-tomato-logo.png',
        primary_color: '#F52F3A',
        default_theme: 'dark',
        seo_title: 'Omar Mohamed Fawzi — Creative Developer & Digital Builder',
        seo_description: 'Portfolio of Omar Mohamed Fawzi. Explore case studies, skills, experience, and creative projects built with modern web technologies.',
        og_image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        contact_email: 'omar@ultimatetomato.com',
        phone: '+20 100 000 0000',
        location: 'Cairo, Egypt',
        professional_title: 'Creative Developer & Digital Builder',
        bio: 'Creative software engineer and digital builder passionate about building high-fidelity web experiences, fluid micro-interactions, and resilient SaaS architectures. Verified reference: facebook.com/omar.mhmdfwzi.',
        portrait_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        resume_url: '',
        stats: {
          projects: 18,
          experience_years: 5,
          clients: 14,
          technologies: 24,
        },
        custom_domain: null,
        created_at: now,
        updated_at: now,
      },
    ];

    // 17. Audit Logs
    const audit_logs: AuditLog[] = [
      {
        id: crypto.randomUUID(),
        user_id: superAdminUserId,
        user_email: 'admin@ultimatetomato.com',
        client_id: omarClientId,
        portfolio_id: omarPortfolioId,
        action: 'PLATFORM_INITIALIZED',
        entity_type: 'PLATFORM',
        entity_id: platform_settings.id,
        details: { message: 'Ultimate Tomato multi-tenant engine initialized.' },
        created_at: now,
      },
      {
        id: crypto.randomUUID(),
        user_id: superAdminUserId,
        user_email: 'admin@ultimatetomato.com',
        client_id: omarClientId,
        portfolio_id: omarPortfolioId,
        action: 'CLIENT_CREATED',
        entity_type: 'CLIENT',
        entity_id: omarClientId,
        details: { client_name: 'Omar Mohamed Fawzi', slug: 'omar' },
        created_at: now,
      },
    ];

    // 18. Credentials for testing/demo (Securely hashed, not plain text)
    const auth_credentials = [
      {
        email: 'admin@ultimatetomato.com',
        passwordHash: hashPassword('tomato2026'),
        userId: superAdminUserId,
        role: 'SUPER_ADMIN',
      },
      {
        email: 'omar@ultimatetomato.com',
        passwordHash: hashPassword('omar2026'),
        userId: omarUserId,
        role: 'CLIENT',
      },
    ];

    return {
      platform_settings,
      clients: [omarClient],
      portfolios: [omarPortfolio],
      users: [superAdminUser, omarUser],
      categories,
      projects,
      project_images,
      skills,
      experiences,
      services,
      testimonials,
      social_links,
      messages,
      notifications,
      site_settings,
      audit_logs,
      auth_credentials,
    };
  }

  // ==========================================
  // READ METHODS
  // ==========================================

  public getPlatformSettings(): PlatformSettings {
    return this.data.platform_settings;
  }

  public updatePlatformSettings(settings: Partial<PlatformSettings>, adminEmail?: string): PlatformSettings {
    this.data.platform_settings = {
      ...this.data.platform_settings,
      ...settings,
      updated_at: new Date().toISOString(),
    };
    this.logAudit({
      user_email: adminEmail || 'admin@ultimatetomato.com',
      action: 'PLATFORM_SETTINGS_UPDATED',
      entity_type: 'PLATFORM_SETTINGS',
      entity_id: this.data.platform_settings.id,
      details: settings,
    });
    this.save();
    return this.data.platform_settings;
  }

  public getClients(includeDeleted = false): Client[] {
    return this.data.clients.filter((c) => includeDeleted || !c.deleted_at);
  }

  public getClientById(id: string): Client | undefined {
    return this.data.clients.find((c) => c.id === id);
  }

  public getPortfolios(includeDeleted = false): Portfolio[] {
    return this.data.portfolios.filter((p) => includeDeleted || !p.deleted_at);
  }

  public getPortfolioBySlug(slug: string, includeDeleted = false): Portfolio | undefined {
    const s = slug.toLowerCase();
    return this.data.portfolios.find(
      (p) =>
        (p.slug.toLowerCase() === s ||
          (s === 'omar' && p.slug.toLowerCase() === 'omar-mohamed-fawzi') ||
          (s === 'omar-mohamed-fawzi' && p.slug.toLowerCase() === 'omar')) &&
        (includeDeleted || !p.deleted_at)
    );
  }

  public findClientByOnboardingToken(token: string): Client | undefined {
    return this.data.clients.find((c) => c.onboarding_token === token && !c.deleted_at);
  }

  public getPortfolioById(id: string, includeDeleted = false): Portfolio | undefined {
    return this.data.portfolios.find((p) => p.id === id && (includeDeleted || !p.deleted_at));
  }

  public getPublicPortfolioBundle(slugOrId?: string, isPreview = false): PublicPortfolioBundle | null {
    // If slug is not provided, default to first published portfolio (Omar)
    let portfolio: Portfolio | undefined;
    if (slugOrId) {
      portfolio = this.getPortfolioBySlug(slugOrId, isPreview) || this.getPortfolioById(slugOrId, isPreview);
    } else {
      portfolio = this.data.portfolios.find((p) => (isPreview || p.published) && !p.deleted_at);
    }

    if (!portfolio) return null;
    if (!isPreview && (!portfolio.published || portfolio.deleted_at)) return null;

    const client = this.data.clients.find((c) => c.id === portfolio!.client_id);
    if (!client || client.deleted_at) return null;

    const settings = this.data.site_settings.find((s) => s.portfolio_id === portfolio!.id) || {
      id: crypto.randomUUID(),
      portfolio_id: portfolio.id,
      title: portfolio.name,
      description: '',
      primary_color: '#F52F3A',
      default_theme: 'dark',
      bio: '',
      professional_title: '',
      stats: { projects: 0, experience_years: 0, clients: 0, technologies: 0 },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const categories = this.data.categories.filter((c) => c.portfolio_id === portfolio!.id && c.visible && !c.deleted_at);
    
    // For projects: if preview mode, return drafts too; if public, only published!
    const rawProjects = this.data.projects.filter(
      (p) => p.portfolio_id === portfolio!.id && (isPreview || p.published) && !p.deleted_at
    );

    const projectsWithImages = rawProjects.map((p) => {
      const images = this.data.project_images
        .filter((img) => img.project_id === p.id)
        .sort((a, b) => a.sort_order - b.sort_order);
      const cat = this.data.categories.find((c) => c.id === p.category_id);
      return { ...p, images, category: cat || null };
    });

    const skills = this.data.skills
      .filter((s) => s.portfolio_id === portfolio!.id && s.visible)
      .sort((a, b) => a.sort_order - b.sort_order);

    const experiences = this.data.experiences
      .filter((e) => e.portfolio_id === portfolio!.id)
      .sort((a, b) => a.sort_order - b.sort_order);

    const services = this.data.services
      .filter((s) => s.portfolio_id === portfolio!.id && s.active)
      .sort((a, b) => a.sort_order - b.sort_order);

    const testimonials = this.data.testimonials
      .filter((t) => t.portfolio_id === portfolio!.id && t.published && !t.deleted_at)
      .sort((a, b) => a.sort_order - b.sort_order);

    const social_links = this.data.social_links
      .filter((l) => l.portfolio_id === portfolio!.id && l.visible)
      .sort((a, b) => a.sort_order - b.sort_order);

    return {
      portfolio,
      client,
      settings,
      categories,
      projects: projectsWithImages,
      skills,
      experiences,
      services,
      testimonials,
      social_links,
      platform_settings: this.data.platform_settings,
    };
  }

  public getProjectBySlug(portfolioId: string, slug: string, isPreview = false): Project | null {
    const project = this.data.projects.find(
      (p) => p.portfolio_id === portfolioId && p.slug === slug && (isPreview || p.published) && !p.deleted_at
    );
    if (!project) return null;
    const images = this.data.project_images
      .filter((img) => img.project_id === project.id)
      .sort((a, b) => a.sort_order - b.sort_order);
    const category = this.data.categories.find((c) => c.id === project.category_id);
    return { ...project, images, category: category || null };
  }

  public getDashboardStats(portfolioId: string): AdminDashboardStats {
    const activeProjects = this.data.projects.filter((p) => p.portfolio_id === portfolioId && !p.deleted_at);
    const publishedProjects = activeProjects.filter((p) => p.published);
    const draftProjects = activeProjects.filter((p) => !p.published);
    const skillsCount = this.data.skills.filter((s) => s.portfolio_id === portfolioId).length;
    const experiencesCount = this.data.experiences.filter((e) => e.portfolio_id === portfolioId).length;
    const servicesCount = this.data.services.filter((s) => s.portfolio_id === portfolioId).length;
    const messages = this.data.messages.filter((m) => m.portfolio_id === portfolioId);
    const unreadMessagesCount = messages.filter((m) => m.status === 'UNREAD').length;
    const unreadNotificationsCount = this.data.notifications.filter(
      (n) => n.portfolio_id === portfolioId && !n.read
    ).length;

    return {
      totalProjects: activeProjects.length,
      publishedProjects: publishedProjects.length,
      draftProjects: draftProjects.length,
      skillsCount,
      experiencesCount,
      servicesCount,
      unreadMessagesCount,
      totalMessagesCount: messages.length,
      unreadNotificationsCount,
    };
  }

  // ==========================================
  // CLIENT ONBOARDING & CREATION
  // ==========================================

  public createClientWithPortfolio(params: {
    clientName: string;
    email: string;
    portfolioSlug: string;
    portfolioName?: string;
    adminEmail?: string;
  }): { client: Client; portfolio: Portfolio; onboardingToken: string } {
    const now = new Date().toISOString();
    const onboardingToken = crypto.randomBytes(24).toString('hex');

    const client: Client = {
      id: crypto.randomUUID(),
      name: params.clientName,
      email: params.email,
      status: 'PENDING_ONBOARDING',
      onboarding_token: onboardingToken,
      onboarding_completed: false,
      deleted_at: null,
      created_at: now,
      updated_at: now,
    };

    const portfolio: Portfolio = {
      id: crypto.randomUUID(),
      client_id: client.id,
      slug: params.portfolioSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      name: params.portfolioName || `${params.clientName} Portfolio`,
      published: false,
      status: 'DRAFT',
      custom_domain: null,
      deleted_at: null,
      created_at: now,
      updated_at: now,
    };

    const defaultSettings: SiteSettings = {
      id: crypto.randomUUID(),
      portfolio_id: portfolio.id,
      title: `${params.clientName} — Portfolio`,
      description: `Welcome to the creative portfolio of ${params.clientName}.`,
      primary_color: '#F52F3A',
      default_theme: 'dark',
      bio: '',
      professional_title: 'Digital Creator & Developer',
      stats: { projects: 0, experience_years: 0, clients: 0, technologies: 0 },
      created_at: now,
      updated_at: now,
    };

    this.data.clients.push(client);
    this.data.portfolios.push(portfolio);
    this.data.site_settings.push(defaultSettings);

    this.logAudit({
      user_email: params.adminEmail || 'admin@ultimatetomato.com',
      client_id: client.id,
      portfolio_id: portfolio.id,
      action: 'CLIENT_INVITED',
      entity_type: 'CLIENT',
      entity_id: client.id,
      details: { email: client.email, slug: portfolio.slug },
    });

    this.save();
    return { client, portfolio, onboardingToken };
  }

  public completeOnboarding(params: {
    token: string;
    password: string;
    name?: string;
    professional_title?: string;
    bio?: string;
  }): { success: boolean; user?: User; portfolio?: Portfolio; error?: string } {
    const client = this.data.clients.find((c) => c.onboarding_token === params.token && !c.deleted_at);
    if (!client) {
      return { success: false, error: 'Invalid or expired onboarding token.' };
    }

    const portfolio = this.data.portfolios.find((p) => p.client_id === client.id);
    const now = new Date().toISOString();

    client.status = 'ACTIVE';
    client.onboarding_token = null;
    client.onboarding_completed = true;
    client.updated_at = now;
    if (params.name) client.name = params.name;

    // Create user record
    const user: User = {
      id: crypto.randomUUID(),
      client_id: client.id,
      email: client.email,
      role: 'CLIENT',
      created_at: now,
      updated_at: now,
    };
    this.data.users.push(user);

    // Save credentials
    this.data.auth_credentials.push({
      email: client.email,
      passwordHash: hashPassword(params.password),
      userId: user.id,
      role: 'CLIENT',
    });

    // Update settings if provided
    if (portfolio) {
      const settings = this.data.site_settings.find((s) => s.portfolio_id === portfolio.id);
      if (settings) {
        if (params.professional_title) settings.professional_title = params.professional_title;
        if (params.bio) settings.bio = params.bio;
        settings.updated_at = now;
      }
    }

    this.logAudit({
      user_id: user.id,
      user_email: user.email,
      client_id: client.id,
      portfolio_id: portfolio?.id,
      action: 'ONBOARDING_COMPLETED',
      entity_type: 'CLIENT',
      entity_id: client.id,
      details: { email: client.email },
    });

    this.save();
    return { success: true, user, portfolio };
  }

  // ==========================================
  // PORTFOLIO PUBLISH & PREVIEW LIFECYCLE
  // ==========================================

  public updatePortfolioStatus(
    portfolioId: string,
    status: 'DRAFT' | 'PUBLISHED',
    userEmail?: string
  ): Portfolio | null {
    const portfolio = this.data.portfolios.find((p) => p.id === portfolioId);
    if (!portfolio) return null;

    portfolio.status = status;
    portfolio.published = status === 'PUBLISHED';
    portfolio.updated_at = new Date().toISOString();

    this.logAudit({
      user_email: userEmail || 'system',
      portfolio_id: portfolioId,
      action: status === 'PUBLISHED' ? 'PORTFOLIO_PUBLISHED' : 'PORTFOLIO_UNPUBLISHED',
      entity_type: 'PORTFOLIO',
      entity_id: portfolioId,
      details: { status },
    });

    // Add notification
    this.createNotification({
      portfolio_id: portfolioId,
      type: 'SYSTEM',
      title: `Portfolio ${status === 'PUBLISHED' ? 'Published' : 'Set to Draft'}`,
      message: `Your portfolio status has been updated to ${status}.`,
    });

    this.save();
    return portfolio;
  }

  // ==========================================
  // PROJECT CRUD WITH SOFT DELETE & REORDER
  // ==========================================

  public createProject(
    portfolioId: string,
    projectData: Partial<Project>,
    images?: Array<{ url: string; alt?: string }>,
    userEmail?: string
  ): Project {
    const now = new Date().toISOString();
    const projectId = crypto.randomUUID();
    const slug = (projectData.slug || projectData.title || `project-${Date.now()}`)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-');

    const project: Project = {
      id: projectId,
      portfolio_id: portfolioId,
      category_id: projectData.category_id || null,
      title: projectData.title || 'Untitled Project',
      slug,
      short_description: projectData.short_description || '',
      full_description: projectData.full_description || '',
      client: projectData.client || '',
      date: projectData.date || new Date().getFullYear().toString(),
      technologies: projectData.technologies || [],
      tags: projectData.tags || [],
      featured: Boolean(projectData.featured),
      published: Boolean(projectData.published),
      hero_image: projectData.hero_image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      project_url: projectData.project_url || '',
      github_url: projectData.github_url || '',
      challenge: projectData.challenge || '',
      solution: projectData.solution || '',
      results: projectData.results || '',
      deleted_at: null,
      created_at: now,
      updated_at: now,
    };

    this.data.projects.push(project);

    // Add gallery images if any
    const createdImages: ProjectImage[] = [];
    if (images && images.length > 0) {
      images.forEach((img, idx) => {
        const imageRec: ProjectImage = {
          id: crypto.randomUUID(),
          project_id: projectId,
          image_url: img.url,
          alt_text: img.alt || project.title,
          sort_order: idx + 1,
          created_at: now,
          updated_at: now,
        };
        this.data.project_images.push(imageRec);
        createdImages.push(imageRec);
      });
    }

    this.logAudit({
      user_email: userEmail || 'unknown',
      portfolio_id: portfolioId,
      action: 'PROJECT_CREATED',
      entity_type: 'PROJECT',
      entity_id: project.id,
      details: { title: project.title, published: project.published },
    });

    this.save();
    return { ...project, images: createdImages };
  }

  public updateProject(
    id: string,
    portfolioId: string,
    updates: Partial<Project>,
    images?: Array<{ id?: string; url: string; alt?: string; sort_order?: number }>,
    userEmail?: string
  ): Project | null {
    const project = this.data.projects.find((p) => p.id === id && p.portfolio_id === portfolioId && !p.deleted_at);
    if (!project) return null;

    const now = new Date().toISOString();
    Object.assign(project, updates, { updated_at: now });

    if (images !== undefined) {
      // Replace or update images
      this.data.project_images = this.data.project_images.filter((img) => img.project_id !== id);
      images.forEach((img, idx) => {
        this.data.project_images.push({
          id: img.id || crypto.randomUUID(),
          project_id: id,
          image_url: img.url,
          alt_text: img.alt || project.title,
          sort_order: img.sort_order ?? idx + 1,
          created_at: now,
          updated_at: now,
        });
      });
    }

    this.logAudit({
      user_email: userEmail || 'unknown',
      portfolio_id: portfolioId,
      action: 'PROJECT_UPDATED',
      entity_type: 'PROJECT',
      entity_id: project.id,
      details: { title: project.title, published: project.published },
    });

    this.save();
    const currentImages = this.data.project_images.filter((img) => img.project_id === id);
    return { ...project, images: currentImages };
  }

  public duplicateProject(id: string, portfolioId: string, userEmail?: string): Project | null {
    const original = this.data.projects.find((p) => p.id === id && p.portfolio_id === portfolioId);
    if (!original) return null;

    const now = new Date().toISOString();
    const newId = crypto.randomUUID();
    const copy: Project = {
      ...original,
      id: newId,
      title: `${original.title} (Copy)`,
      slug: `${original.slug}-copy-${Date.now().toString().slice(-4)}`,
      published: false,
      created_at: now,
      updated_at: now,
    };

    this.data.projects.push(copy);

    // Duplicate images
    const originalImages = this.data.project_images.filter((img) => img.project_id === id);
    originalImages.forEach((img) => {
      this.data.project_images.push({
        ...img,
        id: crypto.randomUUID(),
        project_id: newId,
        created_at: now,
        updated_at: now,
      });
    });

    this.logAudit({
      user_email: userEmail || 'unknown',
      portfolio_id: portfolioId,
      action: 'PROJECT_DUPLICATED',
      entity_type: 'PROJECT',
      entity_id: newId,
      details: { original_id: id, title: copy.title },
    });

    this.save();
    return copy;
  }

  public softDeleteProject(id: string, portfolioId: string, userEmail?: string): boolean {
    const project = this.data.projects.find((p) => p.id === id && p.portfolio_id === portfolioId);
    if (!project) return false;
    project.deleted_at = new Date().toISOString();

    this.logAudit({
      user_email: userEmail || 'unknown',
      portfolio_id: portfolioId,
      action: 'PROJECT_SOFT_DELETED',
      entity_type: 'PROJECT',
      entity_id: id,
      details: { title: project.title },
    });

    this.save();
    return true;
  }

  public restoreProject(id: string, portfolioId: string, userEmail?: string): boolean {
    const project = this.data.projects.find((p) => p.id === id && p.portfolio_id === portfolioId);
    if (!project) return false;
    project.deleted_at = null;
    project.updated_at = new Date().toISOString();

    this.logAudit({
      user_email: userEmail || 'unknown',
      portfolio_id: portfolioId,
      action: 'PROJECT_RESTORED',
      entity_type: 'PROJECT',
      entity_id: id,
      details: { title: project.title },
    });

    this.save();
    return true;
  }

  // ==========================================
  // CATEGORIES CRUD
  // ==========================================

  public getCategories(portfolioId: string, includeDeleted = false): Category[] {
    return this.data.categories
      .filter((c) => c.portfolio_id === portfolioId && (includeDeleted || !c.deleted_at))
      .sort((a, b) => a.sort_order - b.sort_order);
  }

  public createCategory(portfolioId: string, data: Partial<Category>, userEmail?: string): Category {
    const now = new Date().toISOString();
    const category: Category = {
      id: crypto.randomUUID(),
      portfolio_id: portfolioId,
      name: data.name || 'New Category',
      slug: (data.slug || data.name || `cat-${Date.now()}`).toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      description: data.description || '',
      sort_order: data.sort_order ?? this.data.categories.length + 1,
      visible: data.visible ?? true,
      deleted_at: null,
      created_at: now,
      updated_at: now,
    };
    this.data.categories.push(category);
    this.save();
    return category;
  }

  public updateCategory(id: string, portfolioId: string, data: Partial<Category>): Category | null {
    const cat = this.data.categories.find((c) => c.id === id && c.portfolio_id === portfolioId);
    if (!cat) return null;
    Object.assign(cat, data, { updated_at: new Date().toISOString() });
    this.save();
    return cat;
  }

  public softDeleteCategory(id: string, portfolioId: string): boolean {
    const cat = this.data.categories.find((c) => c.id === id && c.portfolio_id === portfolioId);
    if (!cat) return false;
    cat.deleted_at = new Date().toISOString();
    this.save();
    return true;
  }

  public restoreCategory(id: string, portfolioId: string): boolean {
    const cat = this.data.categories.find((c) => c.id === id && c.portfolio_id === portfolioId);
    if (!cat) return false;
    cat.deleted_at = null;
    cat.updated_at = new Date().toISOString();
    this.save();
    return true;
  }

  // ==========================================
  // SKILLS, EXPERIENCES, SERVICES, TESTIMONIALS
  // ==========================================

  public getSkills(portfolioId: string): Skill[] {
    return this.data.skills.filter((s) => s.portfolio_id === portfolioId).sort((a, b) => a.sort_order - b.sort_order);
  }

  public saveSkill(portfolioId: string, skillData: Partial<Skill>): Skill {
    const now = new Date().toISOString();
    if (skillData.id) {
      const existing = this.data.skills.find((s) => s.id === skillData.id && s.portfolio_id === portfolioId);
      if (existing) {
        Object.assign(existing, skillData, { updated_at: now });
        this.save();
        return existing;
      }
    }
    const newSkill: Skill = {
      id: crypto.randomUUID(),
      portfolio_id: portfolioId,
      name: skillData.name || 'New Skill',
      category: skillData.category || 'Development',
      level: skillData.level ?? 85,
      icon: skillData.icon || 'Code',
      years: skillData.years || 2,
      sort_order: skillData.sort_order ?? this.data.skills.length + 1,
      visible: skillData.visible ?? true,
      created_at: now,
      updated_at: now,
    };
    this.data.skills.push(newSkill);
    this.save();
    return newSkill;
  }

  public deleteSkill(id: string, portfolioId: string): boolean {
    const initial = this.data.skills.length;
    this.data.skills = this.data.skills.filter((s) => !(s.id === id && s.portfolio_id === portfolioId));
    this.save();
    return this.data.skills.length < initial;
  }

  public getExperiences(portfolioId: string): Experience[] {
    return this.data.experiences
      .filter((e) => e.portfolio_id === portfolioId)
      .sort((a, b) => a.sort_order - b.sort_order);
  }

  public saveExperience(portfolioId: string, data: Partial<Experience>): Experience {
    const now = new Date().toISOString();
    if (data.id) {
      const existing = this.data.experiences.find((e) => e.id === data.id && e.portfolio_id === portfolioId);
      if (existing) {
        Object.assign(existing, data, { updated_at: now });
        this.save();
        return existing;
      }
    }
    const item: Experience = {
      id: crypto.randomUUID(),
      portfolio_id: portfolioId,
      company: data.company || 'Company',
      position: data.position || 'Position',
      location: data.location || '',
      start_date: data.start_date || '2024',
      end_date: data.end_date || '',
      current_position: Boolean(data.current_position),
      description: data.description || '',
      technologies: data.technologies || [],
      company_logo: data.company_logo || '',
      sort_order: data.sort_order ?? this.data.experiences.length + 1,
      created_at: now,
      updated_at: now,
    };
    this.data.experiences.push(item);
    this.save();
    return item;
  }

  public deleteExperience(id: string, portfolioId: string): boolean {
    const initial = this.data.experiences.length;
    this.data.experiences = this.data.experiences.filter((e) => !(e.id === id && e.portfolio_id === portfolioId));
    this.save();
    return this.data.experiences.length < initial;
  }

  public getServices(portfolioId: string): Service[] {
    return this.data.services
      .filter((s) => s.portfolio_id === portfolioId)
      .sort((a, b) => a.sort_order - b.sort_order);
  }

  public saveService(portfolioId: string, data: Partial<Service>): Service {
    const now = new Date().toISOString();
    if (data.id) {
      const existing = this.data.services.find((s) => s.id === data.id && s.portfolio_id === portfolioId);
      if (existing) {
        Object.assign(existing, data, { updated_at: now });
        this.save();
        return existing;
      }
    }
    const item: Service = {
      id: crypto.randomUUID(),
      portfolio_id: portfolioId,
      title: data.title || 'New Service',
      description: data.description || '',
      icon: data.icon || 'Sparkles',
      features: data.features || [],
      price: data.price || '',
      currency: data.currency || 'USD',
      cta: data.cta || 'Get in Touch',
      active: data.active ?? true,
      sort_order: data.sort_order ?? this.data.services.length + 1,
      created_at: now,
      updated_at: now,
    };
    this.data.services.push(item);
    this.save();
    return item;
  }

  public deleteService(id: string, portfolioId: string): boolean {
    const initial = this.data.services.length;
    this.data.services = this.data.services.filter((s) => !(s.id === id && s.portfolio_id === portfolioId));
    this.save();
    return this.data.services.length < initial;
  }

  public getTestimonials(portfolioId: string, includeDeleted = false): Testimonial[] {
    return this.data.testimonials
      .filter((t) => t.portfolio_id === portfolioId && (includeDeleted || !t.deleted_at))
      .sort((a, b) => a.sort_order - b.sort_order);
  }

  public saveTestimonial(portfolioId: string, data: Partial<Testimonial>): Testimonial {
    const now = new Date().toISOString();
    if (data.id) {
      const existing = this.data.testimonials.find((t) => t.id === data.id && t.portfolio_id === portfolioId);
      if (existing) {
        Object.assign(existing, data, { updated_at: now });
        this.save();
        return existing;
      }
    }
    const item: Testimonial = {
      id: crypto.randomUUID(),
      portfolio_id: portfolioId,
      name: data.name || 'Client',
      role: data.role || 'Partner',
      company: data.company || '',
      avatar: data.avatar || '',
      content: data.content || '',
      rating: data.rating ?? 5,
      published: data.published ?? true,
      sort_order: data.sort_order ?? this.data.testimonials.length + 1,
      deleted_at: null,
      created_at: now,
      updated_at: now,
    };
    this.data.testimonials.push(item);
    this.save();
    return item;
  }

  public softDeleteTestimonial(id: string, portfolioId: string): boolean {
    const item = this.data.testimonials.find((t) => t.id === id && t.portfolio_id === portfolioId);
    if (!item) return false;
    item.deleted_at = new Date().toISOString();
    this.save();
    return true;
  }

  public restoreTestimonial(id: string, portfolioId: string): boolean {
    const item = this.data.testimonials.find((t) => t.id === id && t.portfolio_id === portfolioId);
    if (!item) return false;
    item.deleted_at = null;
    item.updated_at = new Date().toISOString();
    this.save();
    return true;
  }

  // ==========================================
  // MESSAGES & NOTIFICATIONS
  // ==========================================

  public submitContactMessage(portfolioId: string, messageData: {
    sender: string;
    email: string;
    subject?: string;
    message: string;
  }): ContactMessage {
    const message: ContactMessage = {
      id: crypto.randomUUID(),
      portfolio_id: portfolioId,
      sender: messageData.sender.trim(),
      email: messageData.email.trim(),
      subject: messageData.subject?.trim() || 'New Inquiry',
      message: messageData.message.trim(),
      status: 'UNREAD',
      date: new Date().toISOString(),
    };
    this.data.messages.unshift(message);

    // Trigger notification
    this.createNotification({
      portfolio_id: portfolioId,
      type: 'MESSAGE',
      title: `Inquiry from ${message.sender}`,
      message: message.subject || message.message.slice(0, 80),
    });

    this.save();
    return message;
  }

  public getMessages(portfolioId: string): ContactMessage[] {
    return this.data.messages.filter((m) => m.portfolio_id === portfolioId);
  }

  public updateMessageStatus(id: string, portfolioId: string, status: 'UNREAD' | 'READ' | 'ARCHIVED'): boolean {
    const msg = this.data.messages.find((m) => m.id === id && m.portfolio_id === portfolioId);
    if (!msg) return false;
    msg.status = status;
    this.save();
    return true;
  }

  public deleteMessage(id: string, portfolioId: string): boolean {
    const initial = this.data.messages.length;
    this.data.messages = this.data.messages.filter((m) => !(m.id === id && m.portfolio_id === portfolioId));
    this.save();
    return this.data.messages.length < initial;
  }

  public getNotifications(portfolioId: string): Notification[] {
    return this.data.notifications.filter((n) => n.portfolio_id === portfolioId);
  }

  public markNotificationAsRead(id: string, portfolioId: string): boolean {
    const notif = this.data.notifications.find((n) => n.id === id && n.portfolio_id === portfolioId);
    if (!notif) return false;
    notif.read = true;
    this.save();
    return true;
  }

  public markAllNotificationsAsRead(portfolioId: string): void {
    this.data.notifications.forEach((n) => {
      if (n.portfolio_id === portfolioId) n.read = true;
    });
    this.save();
  }

  private createNotification(params: {
    user_id?: string;
    portfolio_id: string;
    type: 'MESSAGE' | 'PROJECT_PUBLISHED' | 'IMAGE_UPLOADED' | 'SYSTEM';
    title: string;
    message: string;
  }) {
    this.data.notifications.unshift({
      id: crypto.randomUUID(),
      portfolio_id: params.portfolio_id,
      user_id: params.user_id,
      type: params.type,
      title: params.title,
      message: params.message,
      read: false,
      created_at: new Date().toISOString(),
    });
  }

  // ==========================================
  // SITE SETTINGS & SOCIAL LINKS
  // ==========================================

  public getSiteSettings(portfolioId: string): SiteSettings | undefined {
    return this.data.site_settings.find((s) => s.portfolio_id === portfolioId);
  }

  public updateSiteSettings(portfolioId: string, settings: Partial<SiteSettings>, userEmail?: string): SiteSettings {
    let current = this.data.site_settings.find((s) => s.portfolio_id === portfolioId);
    const now = new Date().toISOString();

    if (!current) {
      current = {
        id: crypto.randomUUID(),
        portfolio_id: portfolioId,
        title: 'Portfolio',
        description: '',
        primary_color: '#F52F3A',
        default_theme: 'dark',
        bio: '',
        professional_title: '',
        stats: { projects: 0, experience_years: 0, clients: 0, technologies: 0 },
        created_at: now,
        updated_at: now,
      };
      this.data.site_settings.push(current);
    }

    Object.assign(current, settings, { updated_at: now });

    this.logAudit({
      user_email: userEmail || 'unknown',
      portfolio_id: portfolioId,
      action: 'SITE_SETTINGS_UPDATED',
      entity_type: 'SITE_SETTINGS',
      entity_id: current.id,
      details: settings,
    });

    this.save();
    return current;
  }

  public getSocialLinks(portfolioId: string): SocialLink[] {
    return this.data.social_links.filter((l) => l.portfolio_id === portfolioId).sort((a, b) => a.sort_order - b.sort_order);
  }

  public saveSocialLink(portfolioId: string, data: Partial<SocialLink>): SocialLink {
    const now = new Date().toISOString();
    if (data.id) {
      const existing = this.data.social_links.find((l) => l.id === data.id && l.portfolio_id === portfolioId);
      if (existing) {
        Object.assign(existing, data, { updated_at: now });
        this.save();
        return existing;
      }
    }
    const item: SocialLink = {
      id: crypto.randomUUID(),
      portfolio_id: portfolioId,
      platform: data.platform || 'Link',
      url: data.url || '',
      label: data.label || '',
      icon: data.icon || 'Globe',
      sort_order: data.sort_order ?? this.data.social_links.length + 1,
      visible: data.visible ?? true,
      created_at: now,
      updated_at: now,
    };
    this.data.social_links.push(item);
    this.save();
    return item;
  }

  public deleteSocialLink(id: string, portfolioId: string): boolean {
    const initial = this.data.social_links.length;
    this.data.social_links = this.data.social_links.filter((l) => !(l.id === id && l.portfolio_id === portfolioId));
    this.save();
    return this.data.social_links.length < initial;
  }

  // ==========================================
  // SUPER ADMIN CLIENTS & SOFT DELETE MANAGEMENT
  // ==========================================

  public softDeleteClient(clientId: string, adminEmail?: string): boolean {
    const client = this.data.clients.find((c) => c.id === clientId);
    if (!client) return false;
    const now = new Date().toISOString();
    client.deleted_at = now;
    client.status = 'SUSPENDED';

    // Cascade soft delete to client's portfolio
    this.data.portfolios.forEach((p) => {
      if (p.client_id === clientId) p.deleted_at = now;
    });

    this.logAudit({
      user_email: adminEmail || 'admin@ultimatetomato.com',
      client_id: clientId,
      action: 'CLIENT_SOFT_DELETED',
      entity_type: 'CLIENT',
      entity_id: clientId,
      details: { client_name: client.name },
    });

    this.save();
    return true;
  }

  public restoreClient(clientId: string, adminEmail?: string): boolean {
    const client = this.data.clients.find((c) => c.id === clientId);
    if (!client) return false;
    client.deleted_at = null;
    client.status = 'ACTIVE';

    this.data.portfolios.forEach((p) => {
      if (p.client_id === clientId) p.deleted_at = null;
    });

    this.logAudit({
      user_email: adminEmail || 'admin@ultimatetomato.com',
      client_id: clientId,
      action: 'CLIENT_RESTORED',
      entity_type: 'CLIENT',
      entity_id: clientId,
      details: { client_name: client.name },
    });

    this.save();
    return true;
  }

  // ==========================================
  // AUDIT LOGS
  // ==========================================

  public logAudit(params: {
    user_id?: string;
    user_email?: string;
    client_id?: string;
    portfolio_id?: string;
    action: string;
    entity_type: string;
    entity_id?: string;
    details?: Record<string, any>;
  }) {
    const log: AuditLog = {
      id: crypto.randomUUID(),
      user_id: params.user_id,
      user_email: params.user_email || 'system',
      client_id: params.client_id,
      portfolio_id: params.portfolio_id,
      action: params.action,
      entity_type: params.entity_type,
      entity_id: params.entity_id,
      details: params.details || {},
      created_at: new Date().toISOString(),
    };
    this.data.audit_logs.unshift(log);
    if (this.data.audit_logs.length > 500) {
      this.data.audit_logs = this.data.audit_logs.slice(0, 500);
    }
  }

  public getAuditLogs(portfolioId?: string): AuditLog[] {
    if (portfolioId) {
      return this.data.audit_logs.filter((l) => l.portfolio_id === portfolioId);
    }
    return this.data.audit_logs;
  }

  // ==========================================
  // AUTHENTICATION
  // ==========================================

  public authenticate(email: string, passwordPlain: string): { user: User; portfolio?: Portfolio; token: string } | null {
    const hash = hashPassword(passwordPlain);
    const cred = this.data.auth_credentials.find(
      (c) => c.email.toLowerCase() === email.toLowerCase() && c.passwordHash === hash
    );
    if (!cred) return null;

    const user = this.data.users.find((u) => u.id === cred.userId);
    if (!user) return null;

    let portfolio: Portfolio | undefined;
    if (user.role === 'CLIENT' && user.client_id) {
      portfolio = this.data.portfolios.find((p) => p.client_id === user.client_id && !p.deleted_at);
    } else {
      portfolio = this.data.portfolios[0]; // Super Admin gets active portfolio as context
    }

    const token = `ut_tok_${crypto.randomBytes(32).toString('hex')}`;
    return { user, portfolio, token };
  }

  public findUserById(userId: string): User | undefined {
    return this.data.users.find((u) => u.id === userId);
  }
}

export const db = new PersistentDatabase();
