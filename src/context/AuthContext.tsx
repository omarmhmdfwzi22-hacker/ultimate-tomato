import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Portfolio } from '../types/portfolio';
import { authService } from '../services/authService';
import { portfolioService } from '../services/portfolioService';
import { getActivePortfolioId, setActivePortfolioId } from '../services/apiClient';

interface AuthContextType {
  user: User | null;
  portfolio: Portfolio | null;
  activePortfolioId: string | null;
  allPortfolios: Portfolio[];
  isLoading: boolean;
  login: (email: string, passwordPlain: string) => Promise<void>;
  logout: () => Promise<void>;
  onboard: (params: { token: string; password: string; name?: string; professional_title?: string; bio?: string }) => Promise<void>;
  switchPortfolio: (portfolioId: string) => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [activePortfolioId, setActivePortfolioIdState] = useState<string | null>(getActivePortfolioId());
  const [allPortfolios, setAllPortfolios] = useState<Portfolio[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAuth = useCallback(async () => {
    try {
      const data = await authService.getCurrentUser();
      if (data) {
        setUser(data.user);
        setPortfolio(data.portfolio || null);
        if (data.portfolio && !getActivePortfolioId()) {
          setActivePortfolioId(data.portfolio.id);
          setActivePortfolioIdState(data.portfolio.id);
        }

        // If Super Admin, fetch all portfolios
        if (data.user.role === 'SUPER_ADMIN') {
          try {
            const list = await portfolioService.getAdminPortfolios();
            setAllPortfolios(list);
            if (!getActivePortfolioId() && list.length > 0) {
              setActivePortfolioId(list[0].id);
              setActivePortfolioIdState(list[0].id);
            }
          } catch {}
        }
      } else {
        setUser(null);
        setPortfolio(null);
      }
    } catch {
      setUser(null);
      setPortfolio(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const login = async (email: string, passwordPlain: string) => {
    setIsLoading(true);
    try {
      const res = await authService.login(email, passwordPlain);
      setUser(res.user);
      setPortfolio(res.portfolio || null);
      if (res.portfolio) {
        setActivePortfolioId(res.portfolio.id);
        setActivePortfolioIdState(res.portfolio.id);
      }
      if (res.user.role === 'SUPER_ADMIN') {
        const list = await portfolioService.getAdminPortfolios();
        setAllPortfolios(list);
        if (!res.portfolio && list.length > 0) {
          setActivePortfolioId(list[0].id);
          setActivePortfolioIdState(list[0].id);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onboard = async (params: {
    token: string;
    password: string;
    name?: string;
    professional_title?: string;
    bio?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await authService.completeOnboarding(params);
      setUser(res.user);
      setPortfolio(res.portfolio || null);
      if (res.portfolio) {
        setActivePortfolioId(res.portfolio.id);
        setActivePortfolioIdState(res.portfolio.id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setPortfolio(null);
      setActivePortfolioId(null);
      setActivePortfolioIdState(null);
      setAllPortfolios([]);
    } finally {
      setIsLoading(false);
    }
  };

  const switchPortfolio = async (portfolioId: string) => {
    setActivePortfolioId(portfolioId);
    setActivePortfolioIdState(portfolioId);
    const matched = allPortfolios.find((p) => p.id === portfolioId);
    if (matched) {
      setPortfolio(matched);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        portfolio,
        activePortfolioId,
        allPortfolios,
        isLoading,
        login,
        logout,
        onboard,
        switchPortfolio,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
