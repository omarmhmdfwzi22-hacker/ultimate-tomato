import { apiRequest, setStoredToken, getStoredToken } from './apiClient';
import { User, Portfolio } from '../types/portfolio';
import { STATIC_OMAR_BUNDLE } from './staticData';

export interface LoginResponse {
  user: User;
  portfolio?: Portfolio;
  token: string;
}

export const authService = {
  async login(email: string, passwordPlain: string): Promise<LoginResponse> {
    try {
      const res = await apiRequest<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: passwordPlain }),
      });
      if (res.token) {
        setStoredToken(res.token);
      }
      return res;
    } catch (err) {
      // Fallback for static hosting demo mode
      const normalizedEmail = email.toLowerCase().trim();
      if (normalizedEmail === 'admin@ultimatetomato.com' && passwordPlain === 'tomato2026') {
        const token = 'static-admin-token';
        setStoredToken(token);
        return {
          user: {
            id: 'super-admin-001',
            client_id: null,
            email: 'admin@ultimatetomato.com',
            role: 'SUPER_ADMIN',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          portfolio: STATIC_OMAR_BUNDLE.portfolio,
          token,
        };
      }
      if (normalizedEmail === 'omar@ultimatetomato.com' && passwordPlain === 'omar2026') {
        const token = 'static-omar-token';
        setStoredToken(token);
        return {
          user: {
            id: STATIC_OMAR_BUNDLE.client.id,
            client_id: STATIC_OMAR_BUNDLE.client.id,
            email: 'omar@ultimatetomato.com',
            role: 'CLIENT',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          portfolio: STATIC_OMAR_BUNDLE.portfolio,
          token,
        };
      }
      throw err;
    }
  },

  async logout(): Promise<void> {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore on static host
    } finally {
      setStoredToken(null);
    }
  },

  async getCurrentUser(): Promise<{ user: User; portfolio?: Portfolio } | null> {
    const token = getStoredToken();
    if (!token) return null;
    try {
      return await apiRequest<{ user: User; portfolio?: Portfolio }>('/api/auth/me');
    } catch {
      // Static fallback check
      if (token === 'static-admin-token') {
        return {
          user: {
            id: 'super-admin-001',
            client_id: null,
            email: 'admin@ultimatetomato.com',
            role: 'SUPER_ADMIN',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          portfolio: STATIC_OMAR_BUNDLE.portfolio,
        };
      }
      if (token === 'static-omar-token') {
        return {
          user: {
            id: STATIC_OMAR_BUNDLE.client.id,
            client_id: STATIC_OMAR_BUNDLE.client.id,
            email: 'omar@ultimatetomato.com',
            role: 'CLIENT',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          portfolio: STATIC_OMAR_BUNDLE.portfolio,
        };
      }
      setStoredToken(null);
      return null;
    }
  },

  async completeOnboarding(params: {
    token: string;
    password: string;
    name?: string;
    professional_title?: string;
    bio?: string;
  }): Promise<LoginResponse> {
    try {
      const res = await apiRequest<LoginResponse>('/api/auth/onboard', {
        method: 'POST',
        body: JSON.stringify(params),
      });
      if (res.token) {
        setStoredToken(res.token);
      }
      return res;
    } catch (err) {
      const demoToken = 'static-onboarded-token';
      setStoredToken(demoToken);
      return {
        user: {
          id: 'new-client-user',
          email: 'client@demo.com',
          role: 'CLIENT',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        portfolio: STATIC_OMAR_BUNDLE.portfolio,
        token: demoToken,
      };
    }
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      return await apiRequest<{ success: boolean; message: string }>('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    } catch {
      return { success: true, message: 'Password reset link sent (demo simulation).' };
    }
  },
};
