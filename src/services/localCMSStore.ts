// ============================================================
// ULTIMATE TOMATO: Local CMS Reactive Persistent Store
// Enables complete Dashboard CRUD & Public Portfolio sync on static hosting (GitHub Pages)
// ============================================================

import {
  Project,
  Category,
  Skill,
  Experience,
  Service,
  Testimonial,
  SocialLink,
  ContactMessage,
  SiteSettings,
  PlatformSettings,
  Client,
  AuditLog,
  PublicPortfolioBundle,
  Portfolio,
} from '../types/portfolio';
import { STATIC_OMAR_BUNDLE } from './staticData';

const PREFIX = 'ut_cms_';

function getStored<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window === 'undefined') return defaultValue;
    const raw = localStorage.getItem(PREFIX + key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed !== null && parsed !== undefined) {
        if (typeof defaultValue === 'object' && defaultValue !== null && !Array.isArray(defaultValue)) {
          return { ...defaultValue, ...parsed };
        }
        if (Array.isArray(defaultValue)) {
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed as T;
          }
          return defaultValue;
        }
        return parsed;
      }
    }
  } catch {}
  return defaultValue;
}

function setStored<T>(key: string, value: T): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    }
  } catch {}
}

export const localCMSStore = {
  // ----------------------------------------------------
  // Projects
  // ----------------------------------------------------
  getProjects(): Project[] {
    const list = getStored<Project[]>('projects', STATIC_OMAR_BUNDLE.projects);
    return list.filter((p) => !p.deleted_at);
  },

  getAllProjects(): Project[] {
    return getStored<Project[]>('projects', STATIC_OMAR_BUNDLE.projects);
  },

  createProject(project: Partial<Project>, images?: Array<{ url: string; alt?: string }>): Project {
    const all = this.getAllProjects();
    const newProject: Project = {
      id: `proj_${Date.now()}`,
      portfolio_id: STATIC_OMAR_BUNDLE.portfolio.id,
      title: project.title || 'Untitled Project',
      slug:
        project.slug ||
        (project.title
          ? project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
          : `project-${Date.now()}`),
      short_description: project.short_description || '',
      full_description: project.full_description || '',
      category_id: project.category_id || (all[0]?.category_id ?? null),
      client: project.client || '',
      date: project.date || '2026',
      technologies: project.technologies || ['React', 'TypeScript', 'Tailwind CSS'],
      tags: project.tags || ['Web', 'Creative'],
      featured: project.featured ?? false,
      published: project.published ?? true,
      hero_image:
        project.hero_image ||
        (images?.[0]?.url ||
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200'),
      project_url: project.project_url || '',
      github_url: project.github_url || '',
      challenge: project.challenge || '',
      solution: project.solution || '',
      results: project.results || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
      images:
        images?.map((img, idx) => ({
          id: `img_${Date.now()}_${idx}`,
          project_id: `proj_${Date.now()}`,
          image_url: img.url,
          alt_text: img.alt || '',
          sort_order: idx + 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })) || [],
    };
    all.unshift(newProject);
    setStored('projects', all);
    this.recordAudit('PROJECT_CREATED', `Created project "${newProject.title}"`);
    return newProject;
  },

  updateProject(
    id: string,
    updates: Partial<Project>,
    images?: Array<{ id?: string; url: string; alt?: string; sort_order?: number }>
  ): Project {
    const all = this.getAllProjects();
    const idx = all.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Project not found');

    const updated: Project = {
      ...all[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (images) {
      updated.images = images.map((img, i) => ({
        id: img.id || `img_${Date.now()}_${i}`,
        project_id: id,
        image_url: img.url,
        alt_text: img.alt || '',
        sort_order: img.sort_order ?? i + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
    }

    all[idx] = updated;
    setStored('projects', all);
    this.recordAudit('PROJECT_UPDATED', `Updated project "${updated.title}"`);
    return updated;
  },

  duplicateProject(id: string): Project {
    const all = this.getAllProjects();
    const source = all.find((p) => p.id === id);
    if (!source) throw new Error('Project not found');

    const dup: Project = {
      ...source,
      id: `proj_${Date.now()}`,
      title: `${source.title} (Copy)`,
      slug: `${source.slug}-copy-${Date.now().toString().slice(-4)}`,
      published: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    };
    all.unshift(dup);
    setStored('projects', all);
    this.recordAudit('PROJECT_DUPLICATED', `Duplicated project "${source.title}"`);
    return dup;
  },

  deleteProject(id: string): boolean {
    const all = this.getAllProjects();
    const idx = all.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    all[idx].deleted_at = new Date().toISOString();
    setStored('projects', all);
    this.recordAudit('PROJECT_DELETED', `Deleted project "${all[idx].title}"`);
    return true;
  },

  restoreProject(id: string): boolean {
    const all = this.getAllProjects();
    const idx = all.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    all[idx].deleted_at = null;
    setStored('projects', all);
    this.recordAudit('PROJECT_RESTORED', `Restored project "${all[idx].title}"`);
    return true;
  },

  // ----------------------------------------------------
  // Categories
  // ----------------------------------------------------
  getCategories(): Category[] {
    const list = getStored<Category[]>('categories', STATIC_OMAR_BUNDLE.categories);
    return list.filter((c) => !c.deleted_at);
  },

  saveCategory(data: Partial<Category>): Category {
    const all = getStored<Category[]>('categories', STATIC_OMAR_BUNDLE.categories);
    if (data.id) {
      const idx = all.findIndex((c) => c.id === data.id);
      if (idx !== -1) {
        all[idx] = { ...all[idx], ...data, updated_at: new Date().toISOString() };
        setStored('categories', all);
        return all[idx];
      }
    }
    const newCat: Category = {
      id: `cat_${Date.now()}`,
      portfolio_id: STATIC_OMAR_BUNDLE.portfolio.id,
      name: data.name || 'New Category',
      slug:
        data.slug ||
        (data.name
          ? data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
          : `cat-${Date.now()}`),
      description: data.description || '',
      sort_order: data.sort_order ?? all.length + 1,
      visible: data.visible ?? true,
      deleted_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    all.push(newCat);
    setStored('categories', all);
    return newCat;
  },

  deleteCategory(id: string): boolean {
    const all = getStored<Category[]>('categories', STATIC_OMAR_BUNDLE.categories);
    const idx = all.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    all[idx].deleted_at = new Date().toISOString();
    setStored('categories', all);
    return true;
  },

  // ----------------------------------------------------
  // Skills
  // ----------------------------------------------------
  getSkills(): Skill[] {
    return getStored<Skill[]>('skills', STATIC_OMAR_BUNDLE.skills);
  },

  saveSkill(skill: Partial<Skill>): Skill {
    const all = this.getSkills();
    if (skill.id) {
      const idx = all.findIndex((s) => s.id === skill.id);
      if (idx !== -1) {
        all[idx] = { ...all[idx], ...skill, updated_at: new Date().toISOString() };
        setStored('skills', all);
        return all[idx];
      }
    }
    const newSkill: Skill = {
      id: `skill_${Date.now()}`,
      portfolio_id: STATIC_OMAR_BUNDLE.portfolio.id,
      name: skill.name || 'New Skill',
      category: skill.category || 'General',
      level: skill.level ?? 85,
      icon: skill.icon || 'code',
      years: skill.years || 3,
      sort_order: skill.sort_order ?? all.length + 1,
      visible: skill.visible ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    all.push(newSkill);
    setStored('skills', all);
    return newSkill;
  },

  deleteSkill(id: string): boolean {
    const all = this.getSkills().filter((s) => s.id !== id);
    setStored('skills', all);
    return true;
  },

  // ----------------------------------------------------
  // Experience
  // ----------------------------------------------------
  getExperiences(): Experience[] {
    return getStored<Experience[]>('experiences', STATIC_OMAR_BUNDLE.experiences);
  },

  saveExperience(item: Partial<Experience>): Experience {
    const all = this.getExperiences();
    if (item.id) {
      const idx = all.findIndex((e) => e.id === item.id);
      if (idx !== -1) {
        all[idx] = { ...all[idx], ...item, updated_at: new Date().toISOString() };
        setStored('experiences', all);
        return all[idx];
      }
    }
    const newExp: Experience = {
      id: `exp_${Date.now()}`,
      portfolio_id: STATIC_OMAR_BUNDLE.portfolio.id,
      company: item.company || 'Tech Company',
      position: item.position || 'Software Engineer',
      company_logo: item.company_logo || '',
      location: item.location || 'Remote',
      start_date: item.start_date || '2024-01',
      end_date: item.end_date || undefined,
      current_position: item.current_position ?? true,
      description: item.description || '',
      technologies: item.technologies || [],
      sort_order: item.sort_order ?? all.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    all.push(newExp);
    setStored('experiences', all);
    return newExp;
  },

  deleteExperience(id: string): boolean {
    const all = this.getExperiences().filter((e) => e.id !== id);
    setStored('experiences', all);
    return true;
  },

  // ----------------------------------------------------
  // Services
  // ----------------------------------------------------
  getServices(): Service[] {
    return getStored<Service[]>('services', STATIC_OMAR_BUNDLE.services);
  },

  saveService(item: Partial<Service>): Service {
    const all = this.getServices();
    if (item.id) {
      const idx = all.findIndex((s) => s.id === item.id);
      if (idx !== -1) {
        all[idx] = { ...all[idx], ...item, updated_at: new Date().toISOString() };
        setStored('services', all);
        return all[idx];
      }
    }
    const newServ: Service = {
      id: `serv_${Date.now()}`,
      portfolio_id: STATIC_OMAR_BUNDLE.portfolio.id,
      title: item.title || 'New Service',
      description: item.description || '',
      icon: item.icon || 'layers',
      price: item.price || '$1,500',
      currency: item.currency || 'USD',
      cta: item.cta || 'Get in Touch',
      features: item.features || ['Custom Architecture', 'Responsive UI', 'Production Optimization'],
      active: item.active ?? true,
      sort_order: item.sort_order ?? all.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    all.push(newServ);
    setStored('services', all);
    return newServ;
  },

  deleteService(id: string): boolean {
    const all = this.getServices().filter((s) => s.id !== id);
    setStored('services', all);
    return true;
  },

  // ----------------------------------------------------
  // Testimonials
  // ----------------------------------------------------
  getTestimonials(): Testimonial[] {
    const list = getStored<Testimonial[]>('testimonials', STATIC_OMAR_BUNDLE.testimonials);
    return list.filter((t) => !t.deleted_at);
  },

  saveTestimonial(item: Partial<Testimonial>): Testimonial {
    const all = getStored<Testimonial[]>('testimonials', STATIC_OMAR_BUNDLE.testimonials);
    if (item.id) {
      const idx = all.findIndex((t) => t.id === item.id);
      if (idx !== -1) {
        all[idx] = { ...all[idx], ...item, updated_at: new Date().toISOString() };
        setStored('testimonials', all);
        return all[idx];
      }
    }
    const newTest: Testimonial = {
      id: `test_${Date.now()}`,
      portfolio_id: STATIC_OMAR_BUNDLE.portfolio.id,
      name: item.name || 'Client Name',
      role: item.role || 'Director',
      company: item.company || 'Enterprise',
      avatar: item.avatar || '',
      content: item.content || 'Outstanding craftsmanship.',
      rating: item.rating || 5,
      published: item.published ?? true,
      sort_order: item.sort_order ?? all.length + 1,
      deleted_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    all.push(newTest);
    setStored('testimonials', all);
    return newTest;
  },

  deleteTestimonial(id: string): boolean {
    const all = getStored<Testimonial[]>('testimonials', STATIC_OMAR_BUNDLE.testimonials);
    const idx = all.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    all[idx].deleted_at = new Date().toISOString();
    setStored('testimonials', all);
    return true;
  },

  // ----------------------------------------------------
  // Social Links
  // ----------------------------------------------------
  getSocialLinks(): SocialLink[] {
    return getStored<SocialLink[]>('social_links', STATIC_OMAR_BUNDLE.social_links);
  },

  saveSocialLink(item: Partial<SocialLink>): SocialLink {
    const all = this.getSocialLinks();
    if (item.id) {
      const idx = all.findIndex((s) => s.id === item.id);
      if (idx !== -1) {
        all[idx] = { ...all[idx], ...item, updated_at: new Date().toISOString() };
        setStored('social_links', all);
        return all[idx];
      }
    }
    const newLink: SocialLink = {
      id: `link_${Date.now()}`,
      portfolio_id: STATIC_OMAR_BUNDLE.portfolio.id,
      platform: item.platform || 'facebook',
      url: item.url || 'https://www.facebook.com/omar.mhmdfwzi',
      label: item.label || 'Facebook',
      visible: item.visible ?? true,
      sort_order: item.sort_order ?? all.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    all.push(newLink);
    setStored('social_links', all);
    return newLink;
  },

  deleteSocialLink(id: string): boolean {
    const all = this.getSocialLinks().filter((s) => s.id !== id);
    setStored('social_links', all);
    return true;
  },

  // ----------------------------------------------------
  // Messages / Inquiries
  // ----------------------------------------------------
  getMessages(): ContactMessage[] {
    return getStored<ContactMessage[]>('messages', []);
  },

  updateMessageStatus(id: string, status: 'UNREAD' | 'READ' | 'ARCHIVED'): boolean {
    const all = this.getMessages();
    const item = all.find((m) => m.id === id);
    if (item) {
      item.status = status;
      setStored('messages', all);
      return true;
    }
    return false;
  },

  deleteMessage(id: string): boolean {
    const all = this.getMessages().filter((m) => m.id !== id);
    setStored('messages', all);
    return true;
  },

  // ----------------------------------------------------
  // Settings (Site & Platform)
  // ----------------------------------------------------
  getSiteSettings(): SiteSettings {
    return getStored<SiteSettings>('site_settings', STATIC_OMAR_BUNDLE.settings);
  },

  updateSiteSettings(updates: Partial<SiteSettings>): SiteSettings {
    const current = this.getSiteSettings();
    const updated = { ...current, ...updates, updated_at: new Date().toISOString() };
    setStored('site_settings', updated);
    this.recordAudit('SITE_SETTINGS_UPDATED', 'Updated portfolio bio and display settings');
    return updated;
  },

  getPlatformSettings(): PlatformSettings {
    return getStored<PlatformSettings>('platform_settings', STATIC_OMAR_BUNDLE.platform_settings);
  },

  updatePlatformSettings(updates: Partial<PlatformSettings>): PlatformSettings {
    const current = this.getPlatformSettings();
    const updated = { ...current, ...updates, updated_at: new Date().toISOString() };
    setStored('platform_settings', updated);
    this.recordAudit('PLATFORM_SETTINGS_UPDATED', 'Updated platform core configurations');
    return updated;
  },

  // ----------------------------------------------------
  // Clients (Super Admin)
  // ----------------------------------------------------
  getClients(): Client[] {
    const list = getStored<Client[]>('clients', [STATIC_OMAR_BUNDLE.client]);
    return list.filter((c) => !c.deleted_at);
  },

  createClient(data: { name: string; email: string; slug?: string; portfolioName?: string }): {
    client: Client;
    onboardingToken: string;
  } {
    const all = getStored<Client[]>('clients', [STATIC_OMAR_BUNDLE.client]);
    const token = `ob_token_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const newClient: Client = {
      id: `client_${Date.now()}`,
      name: data.name,
      email: data.email,
      status: 'PENDING_ONBOARDING',
      onboarding_token: token,
      onboarding_completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    };
    all.push(newClient);
    setStored('clients', all);
    this.recordAudit('CLIENT_CREATED', `Invited new client ${newClient.name} (${newClient.email})`);
    return { client: newClient, onboardingToken: token };
  },

  deleteClient(id: string): boolean {
    const all = getStored<Client[]>('clients', [STATIC_OMAR_BUNDLE.client]);
    const item = all.find((c) => c.id === id);
    if (item) {
      item.deleted_at = new Date().toISOString();
      setStored('clients', all);
      this.recordAudit('CLIENT_DELETED', `Deleted client ${item.name}`);
      return true;
    }
    return false;
  },

  // ----------------------------------------------------
  // Audit Logs
  // ----------------------------------------------------
  getAuditLogs(): AuditLog[] {
    return getStored<AuditLog[]>('audit_logs', []);
  },

  recordAudit(action: string, description: string): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      user_id: 'current_user',
      user_email: 'omar@ultimatetomato.com',
      action,
      entity_type: 'PORTFOLIO',
      entity_id: STATIC_OMAR_BUNDLE.portfolio.id,
      details: { description },
      created_at: new Date().toISOString(),
    };
    logs.unshift(newLog);
    setStored('audit_logs', logs.slice(0, 50));
  },

  // ----------------------------------------------------
  // Portfolio Settings
  // ----------------------------------------------------
  getPortfolio(): Portfolio {
    return getStored<Portfolio>('portfolio', STATIC_OMAR_BUNDLE.portfolio);
  },

  updatePortfolio(updates: Partial<Portfolio>): Portfolio {
    const current = this.getPortfolio();
    const updated = { ...current, ...updates, updated_at: new Date().toISOString() };
    setStored('portfolio', updated);
    return updated;
  },

  // ----------------------------------------------------
  // Full Public Bundle Sync
  // ----------------------------------------------------
  getSyncedPublicBundle(): PublicPortfolioBundle {
    const siteSettings = this.getSiteSettings();
    const platformSettings = this.getPlatformSettings();
    const portfolio = this.getPortfolio();
    const projects = this.getProjects();
    const categories = this.getCategories();
    const skills = this.getSkills();
    const experiences = this.getExperiences();
    const services = this.getServices();
    const testimonials = this.getTestimonials();
    const socialLinks = this.getSocialLinks();
    const client = getStored<Client>('client', STATIC_OMAR_BUNDLE.client);

    return {
      portfolio: {
        ...STATIC_OMAR_BUNDLE.portfolio,
        ...portfolio,
        name: siteSettings.title || STATIC_OMAR_BUNDLE.portfolio.name,
      },
      client,
      settings: siteSettings,
      categories,
      projects,
      skills,
      experiences,
      services,
      testimonials,
      social_links: socialLinks,
      platform_settings: platformSettings,
    };
  },
};
