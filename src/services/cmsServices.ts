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

// Projects Service
export const projectsService = {
  async list(): Promise<Project[]> {
    return apiRequest<Project[]>('/api/admin/projects');
  },
  async create(project: Partial<Project>, images?: Array<{ url: string; alt?: string }>): Promise<Project> {
    return apiRequest<Project>('/api/admin/projects', {
      method: 'POST',
      body: JSON.stringify({ ...project, images }),
    });
  },
  async update(id: string, updates: Partial<Project>, images?: Array<{ id?: string; url: string; alt?: string; sort_order?: number }>): Promise<Project> {
    return apiRequest<Project>(`/api/admin/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...updates, images }),
    });
  },
  async duplicate(id: string): Promise<Project> {
    return apiRequest<Project>(`/api/admin/projects/${id}/duplicate`, {
      method: 'POST',
    });
  },
  async softDelete(id: string): Promise<boolean> {
    const res = await apiRequest<{ success: boolean }>(`/api/admin/projects/${id}`, {
      method: 'DELETE',
    });
    return res.success;
  },
  async restore(id: string): Promise<boolean> {
    const res = await apiRequest<{ success: boolean }>(`/api/admin/projects/${id}/restore`, {
      method: 'POST',
    });
    return res.success;
  },
};

// Categories Service
export const categoriesService = {
  async list(): Promise<Category[]> {
    return apiRequest<Category[]>('/api/admin/categories');
  },
  async create(data: Partial<Category>): Promise<Category> {
    return apiRequest<Category>('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async update(id: string, data: Partial<Category>): Promise<Category> {
    return apiRequest<Category>(`/api/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async softDelete(id: string): Promise<boolean> {
    const res = await apiRequest<{ success: boolean }>(`/api/admin/categories/${id}`, {
      method: 'DELETE',
    });
    return res.success;
  },
  async restore(id: string): Promise<boolean> {
    const res = await apiRequest<{ success: boolean }>(`/api/admin/categories/${id}/restore`, {
      method: 'POST',
    });
    return res.success;
  },
};

// Skills Service
export const skillsService = {
  async list(): Promise<Skill[]> {
    return apiRequest<Skill[]>('/api/admin/skills');
  },
  async save(skill: Partial<Skill>): Promise<Skill> {
    return apiRequest<Skill>('/api/admin/skills', {
      method: 'POST',
      body: JSON.stringify(skill),
    });
  },
  async delete(id: string): Promise<boolean> {
    const res = await apiRequest<{ success: boolean }>(`/api/admin/skills/${id}`, {
      method: 'DELETE',
    });
    return res.success;
  },
};

// Experience Service
export const experiencesService = {
  async list(): Promise<Experience[]> {
    return apiRequest<Experience[]>('/api/admin/experiences');
  },
  async save(item: Partial<Experience>): Promise<Experience> {
    return apiRequest<Experience>('/api/admin/experiences', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },
  async delete(id: string): Promise<boolean> {
    const res = await apiRequest<{ success: boolean }>(`/api/admin/experiences/${id}`, {
      method: 'DELETE',
    });
    return res.success;
  },
};

// Services Service
export const servicesService = {
  async list(): Promise<Service[]> {
    return apiRequest<Service[]>('/api/admin/services');
  },
  async save(item: Partial<Service>): Promise<Service> {
    return apiRequest<Service>('/api/admin/services', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },
  async delete(id: string): Promise<boolean> {
    const res = await apiRequest<{ success: boolean }>(`/api/admin/services/${id}`, {
      method: 'DELETE',
    });
    return res.success;
  },
};

// Testimonials Service
export const testimonialsService = {
  async list(): Promise<Testimonial[]> {
    return apiRequest<Testimonial[]>('/api/admin/testimonials');
  },
  async save(item: Partial<Testimonial>): Promise<Testimonial> {
    return apiRequest<Testimonial>('/api/admin/testimonials', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },
  async softDelete(id: string): Promise<boolean> {
    const res = await apiRequest<{ success: boolean }>(`/api/admin/testimonials/${id}`, {
      method: 'DELETE',
    });
    return res.success;
  },
  async restore(id: string): Promise<boolean> {
    const res = await apiRequest<{ success: boolean }>(`/api/admin/testimonials/${id}/restore`, {
      method: 'POST',
    });
    return res.success;
  },
};

// Social Links Service
export const socialLinksService = {
  async list(): Promise<SocialLink[]> {
    return apiRequest<SocialLink[]>('/api/admin/social-links');
  },
  async save(item: Partial<SocialLink>): Promise<SocialLink> {
    return apiRequest<SocialLink>('/api/admin/social-links', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },
  async delete(id: string): Promise<boolean> {
    const res = await apiRequest<{ success: boolean }>(`/api/admin/social-links/${id}`, {
      method: 'DELETE',
    });
    return res.success;
  },
};

// Messages Service
export const messagesService = {
  async list(): Promise<ContactMessage[]> {
    return apiRequest<ContactMessage[]>('/api/admin/messages');
  },
  async updateStatus(id: string, status: 'UNREAD' | 'READ' | 'ARCHIVED'): Promise<boolean> {
    const res = await apiRequest<{ success: boolean }>(`/api/admin/messages/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return res.success;
  },
  async delete(id: string): Promise<boolean> {
    const res = await apiRequest<{ success: boolean }>(`/api/admin/messages/${id}`, {
      method: 'DELETE',
    });
    return res.success;
  },
};

// Notifications Service
export const notificationsService = {
  async list(): Promise<Notification[]> {
    return apiRequest<Notification[]>('/api/admin/notifications');
  },
  async markAsRead(id: string): Promise<boolean> {
    const res = await apiRequest<{ success: boolean }>(`/api/admin/notifications/${id}/read`, {
      method: 'PUT',
    });
    return res.success;
  },
  async markAllAsRead(): Promise<boolean> {
    const res = await apiRequest<{ success: boolean }>('/api/admin/notifications/read-all', {
      method: 'POST',
    });
    return res.success;
  },
};

// Settings Service (Portfolio & Platform separated cleanly)
export const settingsService = {
  async getPortfolioSettings(): Promise<SiteSettings> {
    return apiRequest<SiteSettings>('/api/admin/settings');
  },
  async updatePortfolioSettings(data: Partial<SiteSettings>): Promise<SiteSettings> {
    return apiRequest<SiteSettings>('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async getPlatformSettings(): Promise<PlatformSettings> {
    return apiRequest<PlatformSettings>('/api/admin/platform-settings');
  },
  async updatePlatformSettings(data: Partial<PlatformSettings>): Promise<PlatformSettings> {
    return apiRequest<PlatformSettings>('/api/admin/platform-settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Clients Service (Super Admin)
export const clientsService = {
  async list(): Promise<Client[]> {
    return apiRequest<Client[]>('/api/admin/clients');
  },
  async create(data: { name: string; email: string; slug: string; portfolioName?: string }): Promise<{ client: Client; onboardingToken: string }> {
    return apiRequest<{ client: Client; onboardingToken: string }>('/api/admin/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async softDelete(id: string): Promise<boolean> {
    const res = await apiRequest<{ success: boolean }>(`/api/admin/clients/${id}`, {
      method: 'DELETE',
    });
    return res.success;
  },
  async restore(id: string): Promise<boolean> {
    const res = await apiRequest<{ success: boolean }>(`/api/admin/clients/${id}/restore`, {
      method: 'POST',
    });
    return res.success;
  },
  async getAuditLogs(): Promise<AuditLog[]> {
    return apiRequest<AuditLog[]>('/api/admin/audit-logs');
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

    return apiRequest<{ url: string; filename: string }>('/api/admin/upload', {
      method: 'POST',
      body: JSON.stringify({ dataUrl, filename: file.name }),
    });
  },
};
