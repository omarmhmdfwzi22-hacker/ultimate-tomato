import React, { createContext, useContext, useEffect, useState } from 'react';

interface RouterContextType {
  currentPath: string;
  navigate: (to: string) => void;
  params: Record<string, string>;
  searchParams: URLSearchParams;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export function useRouter(): RouterContextType {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
}

export function getBasePath(): string {
  try {
    const pathname = window.location.pathname || '/';
    const hostname = window.location.hostname || '';
    
    // Automatically detect repo name on GitHub Pages (*.github.io/<repo-name>)
    if (hostname.endsWith('github.io')) {
      const parts = pathname.split('/').filter(Boolean);
      if (parts.length > 0) {
        return `/${parts[0]}`;
      }
    }
    
    if (pathname.startsWith('/ultimate-tomato')) {
      return '/ultimate-tomato';
    }
    if (pathname.startsWith('/quickdrop')) {
      return '/quickdrop';
    }
  } catch {}
  return '';
}

export function getAssetUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }
  const base = getBasePath();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base}${cleanPath}` : cleanPath;
}

function resolvePath(): string {
  try {
    const search = new URLSearchParams(window.location.search);
    // Support spa-github-pages ?p=/route parameter
    const redirectParam = search.get('p');
    if (redirectParam) {
      return redirectParam.startsWith('/') ? redirectParam : `/${redirectParam}`;
    }

    let pathname = window.location.pathname || '/';
    const base = getBasePath();
    if (base && pathname.startsWith(base)) {
      pathname = pathname.slice(base.length) || '/';
    }
    return pathname.startsWith('/') ? pathname : `/${pathname}`;
  } catch {
    return '/';
  }
}

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [currentPath, setCurrentPath] = useState<string>(() => resolvePath());
  const [searchParams, setSearchParams] = useState<URLSearchParams>(() => new URLSearchParams(window.location.search));

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(resolvePath());
      setSearchParams(new URLSearchParams(window.location.search));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string) => {
    const base = getBasePath();
    const [pathPart, queryPart] = to.split('?');
    const normalizedPath = pathPart.startsWith('/') ? pathPart : `/${pathPart}`;
    const targetUrl = base ? `${base}${normalizedPath}` : normalizedPath;
    const finalUrl = queryPart ? `${targetUrl}?${queryPart}` : targetUrl;

    window.history.pushState({}, '', finalUrl);
    setCurrentPath(normalizedPath || '/');
    setSearchParams(new URLSearchParams(queryPart || ''));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <RouterContext.Provider
      value={{
        currentPath,
        navigate,
        params: {},
        searchParams,
      }}
    >
      {children}
    </RouterContext.Provider>
  );
}

// Route matching helper
export function matchRoute(pattern: string, pathname: string): { match: boolean; params: Record<string, string> } {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = pathname.split('/').filter(Boolean);

  if (patternParts.length !== pathParts.length) {
    return { match: false, params: {} };
  }

  const params: Record<string, string> = {};

  for (let i = 0; i < patternParts.length; i++) {
    const p = patternParts[i];
    const actual = pathParts[i];

    if (p.startsWith(':')) {
      const key = p.slice(1);
      params[key] = decodeURIComponent(actual);
    } else if (p.toLowerCase() !== actual.toLowerCase()) {
      return { match: false, params: {} };
    }
  }

  return { match: true, params };
}
