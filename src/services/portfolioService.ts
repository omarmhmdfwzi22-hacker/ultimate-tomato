import { apiRequest } from './apiClient';
import {
  PublicPortfolioBundle,
  Project,
  ContactMessage,
  AdminDashboardStats,
  Portfolio,
} from '../types/portfolio';
import { STATIC_OMAR_BUNDLE } from './staticData';
import { localCMSStore } from './localCMSStore';
import { isStaticMode } from './cmsServices';

export const portfolioService = {
  // Public
  async getPublicPortfolio(slug?: string, isPreview = false): Promise<PublicPortfolioBundle> {
    if (isStaticMode()) {
      return localCMSStore.getSyncedPublicBundle();
    }
    const query = isPreview ? '?preview=true' : '';
    const path = slug ? `/api/public/portfolio/${encodeURIComponent(slug)}${query}` : `/api/public/portfolio${query}`;
    try {
      return await apiRequest<PublicPortfolioBundle>(path);
    } catch (err) {
      return localCMSStore.getSyncedPublicBundle();
    }
  },

  async getProjectBySlug(portfolioSlug: string, projectSlug: string, isPreview = false): Promise<Project> {
    if (isStaticMode()) {
      const match = localCMSStore.getProjects().find((p) => p.slug === projectSlug);
      if (match) return match;
      throw new Error(`Project "${projectSlug}" not found`);
    }
    const query = isPreview ? '?preview=true' : '';
    try {
      return await apiRequest<Project>(
        `/api/public/portfolio/${encodeURIComponent(portfolioSlug)}/projects/${encodeURIComponent(projectSlug)}${query}`
      );
    } catch (err) {
      const match = localCMSStore.getProjects().find((p) => p.slug === projectSlug);
      if (match) return match;
      throw new Error(`Project "${projectSlug}" not found`);
    }
  },

  async submitContact(
    portfolioSlug: string,
    message: { sender: string; email: string; subject?: string; message: string; honeypot?: string }
  ): Promise<{ success: boolean; message: string; id?: string }> {
    if (isStaticMode()) {
      const allMsgs = localCMSStore.getMessages();
      const newMsg: ContactMessage = {
        id: `msg_${Date.now()}`,
        portfolio_id: STATIC_OMAR_BUNDLE.portfolio.id,
        sender: message.sender,
        email: message.email,
        subject: message.subject || 'Portfolio Inquiry',
        message: message.message,
        status: 'UNREAD',
        date: new Date().toISOString(),
      };
      allMsgs.unshift(newMsg);
      try {
        localStorage.setItem('ut_cms_messages', JSON.stringify(allMsgs));
      } catch {}
      return { success: true, message: 'Message sent successfully! We will get back to you shortly.', id: newMsg.id };
    }
    try {
      return await apiRequest<{ success: boolean; message: string; id?: string }>(
        `/api/public/portfolio/${encodeURIComponent(portfolioSlug)}/contact`,
        {
          method: 'POST',
          body: JSON.stringify(message),
        }
      );
    } catch (err) {
      const allMsgs = localCMSStore.getMessages();
      const newMsg: ContactMessage = {
        id: `msg_${Date.now()}`,
        portfolio_id: STATIC_OMAR_BUNDLE.portfolio.id,
        sender: message.sender,
        email: message.email,
        subject: message.subject || 'Portfolio Inquiry',
        message: message.message,
        status: 'UNREAD',
        date: new Date().toISOString(),
      };
      allMsgs.unshift(newMsg);
      try {
        localStorage.setItem('ut_cms_messages', JSON.stringify(allMsgs));
      } catch {}
      return { success: true, message: 'Message sent successfully! We will get back to you shortly.', id: newMsg.id };
    }
  },

  // Admin
  async getAdminPortfolios(): Promise<Portfolio[]> {
    if (isStaticMode()) {
      return [localCMSStore.getPortfolio()];
    }
    try {
      return await apiRequest<Portfolio[]>('/api/admin/portfolios');
    } catch {
      return [localCMSStore.getPortfolio()];
    }
  },

  async getDashboardStats(): Promise<AdminDashboardStats> {
    if (isStaticMode()) {
      const projects = localCMSStore.getProjects();
      const skills = localCMSStore.getSkills();
      const experiences = localCMSStore.getExperiences();
      const services = localCMSStore.getServices();
      const messages = localCMSStore.getMessages();

      return {
        totalProjects: projects.length,
        publishedProjects: projects.filter((p) => p.published).length,
        draftProjects: projects.filter((p) => !p.published).length,
        skillsCount: skills.length,
        experiencesCount: experiences.length,
        servicesCount: services.length,
        unreadMessagesCount: messages.filter((m) => m.status === 'UNREAD').length,
        totalMessagesCount: messages.length,
        unreadNotificationsCount: 0,
      };
    }
    try {
      return await apiRequest<AdminDashboardStats>('/api/admin/stats');
    } catch {
      const projects = localCMSStore.getProjects();
      const skills = localCMSStore.getSkills();
      const experiences = localCMSStore.getExperiences();
      const services = localCMSStore.getServices();
      const messages = localCMSStore.getMessages();

      return {
        totalProjects: projects.length,
        publishedProjects: projects.filter((p) => p.published).length,
        draftProjects: projects.filter((p) => !p.published).length,
        skillsCount: skills.length,
        experiencesCount: experiences.length,
        servicesCount: services.length,
        unreadMessagesCount: messages.filter((m) => m.status === 'UNREAD').length,
        totalMessagesCount: messages.length,
        unreadNotificationsCount: 0,
      };
    }
  },

  async getAdminSiteBundle(): Promise<PublicPortfolioBundle> {
    if (isStaticMode()) {
      return localCMSStore.getSyncedPublicBundle();
    }
    try {
      return await apiRequest<PublicPortfolioBundle>('/api/admin/site-bundle');
    } catch {
      return localCMSStore.getSyncedPublicBundle();
    }
  },

  async updatePortfolioStatus(status: 'DRAFT' | 'PUBLISHED'): Promise<Portfolio> {
    if (isStaticMode()) {
      return localCMSStore.updatePortfolio({ status, published: status === 'PUBLISHED' });
    }
    try {
      return await apiRequest<Portfolio>('/api/admin/portfolio/status', {
        method: 'POST',
        body: JSON.stringify({ status }),
      });
    } catch {
      return localCMSStore.updatePortfolio({ status, published: status === 'PUBLISHED' });
    }
  },
};
