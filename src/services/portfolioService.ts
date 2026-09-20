import { apiRequest } from './apiClient';
import {
  PublicPortfolioBundle,
  Project,
  ContactMessage,
  AdminDashboardStats,
  Portfolio,
} from '../types/portfolio';
import { STATIC_OMAR_BUNDLE } from './staticData';

export const portfolioService = {
  // Public
  async getPublicPortfolio(slug?: string, isPreview = false): Promise<PublicPortfolioBundle> {
    const query = isPreview ? '?preview=true' : '';
    const path = slug ? `/api/public/portfolio/${encodeURIComponent(slug)}${query}` : `/api/public/portfolio${query}`;
    try {
      return await apiRequest<PublicPortfolioBundle>(path);
    } catch (err) {
      // Fallback for GitHub Pages static hosting
      return STATIC_OMAR_BUNDLE;
    }
  },

  async getProjectBySlug(portfolioSlug: string, projectSlug: string, isPreview = false): Promise<Project> {
    const query = isPreview ? '?preview=true' : '';
    try {
      return await apiRequest<Project>(
        `/api/public/portfolio/${encodeURIComponent(portfolioSlug)}/projects/${encodeURIComponent(projectSlug)}${query}`
      );
    } catch (err) {
      const match = STATIC_OMAR_BUNDLE.projects.find((p) => p.slug === projectSlug);
      if (match) return match;
      throw new Error(`Project "${projectSlug}" not found`);
    }
  },

  async submitContact(
    portfolioSlug: string,
    message: { sender: string; email: string; subject?: string; message: string; honeypot?: string }
  ): Promise<{ success: boolean; message: string; id?: string }> {
    try {
      return await apiRequest<{ success: boolean; message: string; id?: string }>(
        `/api/public/portfolio/${encodeURIComponent(portfolioSlug)}/contact`,
        {
          method: 'POST',
          body: JSON.stringify(message),
        }
      );
    } catch (err) {
      // On static host, simulate success and store locally
      console.log('Contact inquiry received on static host:', message);
      return { success: true, message: 'Message sent successfully! (Demo mode)', id: `msg-${Date.now()}` };
    }
  },

  // Admin
  async getAdminPortfolios(): Promise<Portfolio[]> {
    try {
      return await apiRequest<Portfolio[]>('/api/admin/portfolios');
    } catch {
      return [STATIC_OMAR_BUNDLE.portfolio];
    }
  },

  async getDashboardStats(): Promise<AdminDashboardStats> {
    try {
      return await apiRequest<AdminDashboardStats>('/api/admin/stats');
    } catch {
      return {
        totalProjects: STATIC_OMAR_BUNDLE.projects.length,
        publishedProjects: STATIC_OMAR_BUNDLE.projects.filter((p) => p.published).length,
        draftProjects: 0,
        skillsCount: STATIC_OMAR_BUNDLE.skills.length,
        experiencesCount: STATIC_OMAR_BUNDLE.experiences.length,
        servicesCount: STATIC_OMAR_BUNDLE.services.length,
        unreadMessagesCount: 0,
        totalMessagesCount: 0,
        unreadNotificationsCount: 0,
      };
    }
  },

  async getAdminSiteBundle(): Promise<PublicPortfolioBundle> {
    try {
      return await apiRequest<PublicPortfolioBundle>('/api/admin/site-bundle');
    } catch {
      return STATIC_OMAR_BUNDLE;
    }
  },

  async updatePortfolioStatus(status: 'DRAFT' | 'PUBLISHED'): Promise<Portfolio> {
    try {
      return await apiRequest<Portfolio>('/api/admin/portfolio/status', {
        method: 'POST',
        body: JSON.stringify({ status }),
      });
    } catch {
      STATIC_OMAR_BUNDLE.portfolio.status = status;
      STATIC_OMAR_BUNDLE.portfolio.published = status === 'PUBLISHED';
      return STATIC_OMAR_BUNDLE.portfolio;
    }
  },
};
