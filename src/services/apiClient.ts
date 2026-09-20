// ============================================================
// ULTIMATE TOMATO: Unified API Client
// ============================================================

const TOKEN_KEY = 'ut_auth_token';
const TARGET_PORTFOLIO_KEY = 'ut_target_portfolio_id';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {}
}

export function getActivePortfolioId(): string | null {
  try {
    return localStorage.getItem(TARGET_PORTFOLIO_KEY);
  } catch {
    return null;
  }
}

export function setActivePortfolioId(id: string | null) {
  try {
    if (id) {
      localStorage.setItem(TARGET_PORTFOLIO_KEY, id);
    } else {
      localStorage.removeItem(TARGET_PORTFOLIO_KEY);
    }
  } catch {}
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getStoredToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const portfolioId = getActivePortfolioId();
  if (portfolioId) {
    headers.set('X-Portfolio-Id', portfolioId);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMsg = (data && data.error) || response.statusText || 'API Request failed';
    throw new Error(errorMsg);
  }

  return data as T;
}
