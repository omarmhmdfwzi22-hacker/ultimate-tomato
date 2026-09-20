import { apiRequest } from './apiClient';
import {
  Project,
  Category,
  Skill,
  Experience,
  Service,
  Testimonial,
  SocialLink,
  ContactMessage,
  Notification,
  SiteSettings,
  PlatformSettings,
  Client,
  AuditLog,
} from '../types/portfolio';
import { localCMSStore } from './localCMSStore';

export function isStaticMode(): boolean {
  if (typeof window === 'undefined') return true;
  const h = window.location.hostname;
  return h.endsWith('github.io') || window.location.protocol === 'file:' || !h.includes('localhost');
}

// Projects Service
export const projectsService = {
  async list(): Promise<Project[]> {
    if (isStaticMode()) return localCMSStore.getProjects();
    try {
      return await apiRequest<Project[]>('/api/admin/projects');
    } catch {
      return localCMSStore.getProjects();
    }
  },
  async create(project: Partial<Project>, images?: Array<{ url: string; alt?: string }>): Promise<Project> {
    if (isStaticMode()) return localCMSStore.createProject(project, images);
    try {
      return await apiRequest<Project>('/api/admin/projects', {
        method: 'POST',
        body: JSON.stringify({ ...project, images }),
      });
    } catch {
      return localCMSStore.createProject(project, images);
    }
  },
  async update(id: string, updates: Partial<Project>, images?: Array<{ id?: string; url: string; alt?: string; sort_order?: number }>): Promise<Project> {
    if (isStaticMode()) return localCMSStore.updateProject(id, updates, images);
    try {
      return await apiRequest<Project>(`/api/admin/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...updates, images }),
      });
    } catch {
      return localCMSStore.updateProject(id, updates, images);
    }
  },
  async duplicate(id: string): Promise<Project> {
    if (isStaticMode()) return localCMSStore.duplicateProject(id);
    try {
      return await apiRequest<Project>(`/api/admin/projects/${id}/duplicate`, {
        method: 'POST',
      });
    } catch {
      return localCMSStore.duplicateProject(id);
    }
  },
  async softDelete(id: string): Promise<boolean> {
    if (isStaticMode()) return localCMSStore.deleteProject(id);
    try {
      const res = await apiRequest<{ success: boolean }>(`/api/admin/projects/${id}`, {
        method: 'DELETE',
      });
      return res.success;
    } catch {
      return localCMSStore.deleteProject(id);
    }
  },
  async restore(id: string): Promise<boolean> {
    if (isStaticMode()) return localCMSStore.restoreProject(id);
    try {
      const res = await apiRequest<{ success: boolean }>(`/api/admin/projects/${id}/restore`, {
        method: 'POST',
      });
      return res.success;
    } catch {
      return localCMSStore.restoreProject(id);
    }
  },
};

// Categories Service
export const categoriesService = {
  async list(): Promise<Category[]> {
    if (isStaticMode()) return localCMSStore.getCategories();
    try {
      return await apiRequest<Category[]>('/api/admin/categories');
    } catch {
      return localCMSStore.getCategories();
    }
  },
  async create(data: Partial<Category>): Promise<Category> {
    if (isStaticMode()) return localCMSStore.saveCategory(data);
    try {
      return await apiRequest<Category>('/api/admin/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      return localCMSStore.saveCategory(data);
    }
  },
  async update(id: string, data: Partial<Category>): Promise<Category> {
    if (isStaticMode()) return localCMSStore.saveCategory({ ...data, id });
    try {
      return await apiRequest<Category>(`/api/admin/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch {
      return localCMSStore.saveCategory({ ...data, id });
    }
  },
  async softDelete(id: string): Promise<boolean> {
    if (isStaticMode()) return localCMSStore.deleteCategory(id);
    try {
      const res = await apiRequest<{ success: boolean }>(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      });
      return res.success;
    } catch {
      return localCMSStore.deleteCategory(id);
    }
  },
  async restore(id: string): Promise<boolean> {
    return true;
  },
};

// Skills Service
export const skillsService = {
  async list(): Promise<Skill[]> {
    if (isStaticMode()) return localCMSStore.getSkills();
    try {
      return await apiRequest<Skill[]>('/api/admin/skills');
    } catch {
      return localCMSStore.getSkills();
    }
  },
  async save(skill: Partial<Skill>): Promise<Skill> {
    if (isStaticMode()) return localCMSStore.saveSkill(skill);
    try {
      return await apiRequest<Skill>('/api/admin/skills', {
        method: 'POST',
        body: JSON.stringify(skill),
      });
    } catch {
      return localCMSStore.saveSkill(skill);
    }
  },
  async delete(id: string): Promise<boolean> {
    if (isStaticMode()) return localCMSStore.deleteSkill(id);
    try {
      const res = await apiRequest<{ success: boolean }>(`/api/admin/skills/${id}`, {
        method: 'DELETE',
      });
      return res.success;
    } catch {
      return localCMSStore.deleteSkill(id);
    }
  },
};

// Experience Service
export const experiencesService = {
  async list(): Promise<Experience[]> {
    if (isStaticMode()) return localCMSStore.getExperiences();
    try {
      return await apiRequest<Experience[]>('/api/admin/experiences');
    } catch {
      return localCMSStore.getExperiences();
    }
  },
  async save(item: Partial<Experience>): Promise<Experience> {
    if (isStaticMode()) return localCMSStore.saveExperience(item);
    try {
      return await apiRequest<Experience>('/api/admin/experiences', {
        method: 'POST',
        body: JSON.stringify(item),
      });
    } catch {
      return localCMSStore.saveExperience(item);
    }
  },
  async delete(id: string): Promise<boolean> {
    if (isStaticMode()) return localCMSStore.deleteExperience(id);
    try {
      const res = await apiRequest<{ success: boolean }>(`/api/admin/experiences/${id}`, {
        method: 'DELETE',
      });
      return res.success;
    } catch {
      return localCMSStore.deleteExperience(id);
    }
  },
};

// Services Service
export const servicesService = {
  async list(): Promise<Service[]> {
    if (isStaticMode()) return localCMSStore.getServices();
    try {
      return await apiRequest<Service[]>('/api/admin/services');
    } catch {
      return localCMSStore.getServices();
    }
  },
  async save(item: Partial<Service>): Promise<Service> {
    if (isStaticMode()) return localCMSStore.saveService(item);
    try {
      return await apiRequest<Service>('/api/admin/services', {
        method: 'POST',
        body: JSON.stringify(item),
      });
    } catch {
      return localCMSStore.saveService(item);
    }
  },
  async delete(id: string): Promise<boolean> {
    if (isStaticMode()) return localCMSStore.deleteService(id);
    try {
      const res = await apiRequest<{ success: boolean }>(`/api/admin/services/${id}`, {
        method: 'DELETE',
      });
      return res.success;
    } catch {
      return localCMSStore.deleteService(id);
    }
  },
};

// Testimonials Service
export const testimonialsService = {
  async list(): Promise<Testimonial[]> {
    if (isStaticMode()) return localCMSStore.getTestimonials();
    try {
      return await apiRequest<Testimonial[]>('/api/admin/testimonials');
    } catch {
      return localCMSStore.getTestimonials();
    }
  },
  async save(item: Partial<Testimonial>): Promise<Testimonial> {
    if (isStaticMode()) return localCMSStore.saveTestimonial(item);
    try {
      return await apiRequest<Testimonial>('/api/admin/testimonials', {
        method: 'POST',
        body: JSON.stringify(item),
      });
    } catch {
      return localCMSStore.saveTestimonial(item);
    }
  },
  async softDelete(id: string): Promise<boolean> {
    if (isStaticMode()) return localCMSStore.deleteTestimonial(id);
    try {
      const res = await apiRequest<{ success: boolean }>(`/api/admin/testimonials/${id}`, {
        method: 'DELETE',
      });
      return res.success;
    } catch {
      return localCMSStore.deleteTestimonial(id);
    }
  },
  async restore(id: string): Promise<boolean> {
    return true;
  },
};

// Social Links Service
export const socialLinksService = {
  async list(): Promise<SocialLink[]> {
    if (isStaticMode()) return localCMSStore.getSocialLinks();
    try {
      return await apiRequest<SocialLink[]>('/api/admin/social-links');
    } catch {
      return localCMSStore.getSocialLinks();
    }
  },
  async save(item: Partial<SocialLink>): Promise<SocialLink> {
    if (isStaticMode()) return localCMSStore.saveSocialLink(item);
    try {
      return await apiRequest<SocialLink>('/api/admin/social-links', {
        method: 'POST',
        body: JSON.stringify(item),
      });
    } catch {
      return localCMSStore.saveSocialLink(item);
    }
  },
  async delete(id: string): Promise<boolean> {
    if (isStaticMode()) return localCMSStore.deleteSocialLink(id);
    try {
      const res = await apiRequest<{ success: boolean }>(`/api/admin/social-links/${id}`, {
        method: 'DELETE',
      });
      return res.success;
    } catch {
      return localCMSStore.deleteSocialLink(id);
    }
  },
};

// Messages Service
export const messagesService = {
  async list(): Promise<ContactMessage[]> {
    if (isStaticMode()) return localCMSStore.getMessages();
    try {
      return await apiRequest<ContactMessage[]>('/api/admin/messages');
    } catch {
      return localCMSStore.getMessages();
    }
  },
  async updateStatus(id: string, status: 'UNREAD' | 'READ' | 'ARCHIVED'): Promise<boolean> {
    if (isStaticMode()) return localCMSStore.updateMessageStatus(id, status);
    try {
      const res = await apiRequest<{ success: boolean }>(`/api/admin/messages/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      return res.success;
    } catch {
      return localCMSStore.updateMessageStatus(id, status);
    }
  },
  async delete(id: string): Promise<boolean> {
    if (isStaticMode()) return localCMSStore.deleteMessage(id);
    try {
      const res = await apiRequest<{ success: boolean }>(`/api/admin/messages/${id}`, {
        method: 'DELETE',
      });
      return res.success;
    } catch {
      return localCMSStore.deleteMessage(id);
    }
  },
};

// Notifications Service
export const notificationsService = {
  async list(): Promise<Notification[]> {
    return [];
  },
  async markAsRead(id: string): Promise<boolean> {
    return true;
  },
  async markAllAsRead(): Promise<boolean> {
    return true;
  },
};

// Settings Service (Portfolio & Platform separated cleanly)
export const settingsService = {
  async getPortfolioSettings(): Promise<SiteSettings> {
    if (isStaticMode()) return localCMSStore.getSiteSettings();
    try {
      return await apiRequest<SiteSettings>('/api/admin/settings');
    } catch {
      return localCMSStore.getSiteSettings();
    }
  },
  async updatePortfolioSettings(data: Partial<SiteSettings>): Promise<SiteSettings> {
    if (isStaticMode()) return localCMSStore.updateSiteSettings(data);
    try {
      return await apiRequest<SiteSettings>('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch {
      return localCMSStore.updateSiteSettings(data);
    }
  },
  async getPlatformSettings(): Promise<PlatformSettings> {
    if (isStaticMode()) return localCMSStore.getPlatformSettings();
    try {
      return await apiRequest<PlatformSettings>('/api/admin/platform-settings');
    } catch {
      return localCMSStore.getPlatformSettings();
    }
  },
  async updatePlatformSettings(data: Partial<PlatformSettings>): Promise<PlatformSettings> {
    if (isStaticMode()) return localCMSStore.updatePlatformSettings(data);
    try {
      return await apiRequest<PlatformSettings>('/api/admin/platform-settings', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch {
      return localCMSStore.updatePlatformSettings(data);
    }
  },
};

// Clients Service (Super Admin)
export const clientsService = {
  async list(): Promise<Client[]> {
    if (isStaticMode()) return localCMSStore.getClients();
    try {
      return await apiRequest<Client[]>('/api/admin/clients');
    } catch {
      return localCMSStore.getClients();
    }
  },
  async create(data: { name: string; email: string; slug?: string; portfolioName?: string }): Promise<{ client: Client; onboardingToken: string }> {
    if (isStaticMode()) return localCMSStore.createClient(data);
    try {
      return await apiRequest<{ client: Client; onboardingToken: string }>('/api/admin/clients', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      return localCMSStore.createClient(data);
    }
  },
  async softDelete(id: string): Promise<boolean> {
    if (isStaticMode()) return localCMSStore.deleteClient(id);
    try {
      const res = await apiRequest<{ success: boolean }>(`/api/admin/clients/${id}`, {
        method: 'DELETE',
      });
      return res.success;
    } catch {
      return localCMSStore.deleteClient(id);
    }
  },
  async restore(id: string): Promise<boolean> {
    return true;
  },
  async getAuditLogs(): Promise<AuditLog[]> {
    if (isStaticMode()) return localCMSStore.getAuditLogs();
    try {
      return await apiRequest<AuditLog[]>('/api/admin/audit-logs');
    } catch {
      return localCMSStore.getAuditLogs();
    }
  },
};

// Upload Service with Client-Side Validation
export const uploadService = {
  async uploadImage(file: File): Promise<{ url: string; filename: string }> {
    // 1. Validate MIME
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
    if (!validMimes.includes(file.type)) {
      throw new Error(`Invalid file type (${file.type}). Supported formats: JPEG, PNG, WebP, AVIF, GIF.`);
    }

    // 2. Validate Size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds 8MB limit.`);
    }

    // 3. Read as Data URL
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    if (isStaticMode()) {
      return { url: dataUrl, filename: file.name };
    }

    try {
      return await apiRequest<{ url: string; filename: string }>('/api/admin/upload', {
        method: 'POST',
        body: JSON.stringify({ dataUrl, filename: file.name }),
      });
    } catch {
      return { url: dataUrl, filename: file.name };
    }
  },
};
