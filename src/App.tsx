import React, { useEffect, useState } from 'react';
import { RouterProvider, useRouter, matchRoute, getAssetUrl } from './lib/router';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';

// Layout & UI
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ErrorPage } from './components/ui/ErrorPages';
import { PageSkeleton } from './components/ui/Skeletons';

// Types & Services
import { PublicPortfolioBundle } from './types/portfolio';
import { portfolioService } from './services/portfolioService';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { ProjectsPage } from './pages/public/ProjectsPage';
import { ProjectDetailPage } from './pages/public/ProjectDetailPage';
import { AboutPage } from './pages/public/AboutPage';
import { SkillsPage } from './pages/public/SkillsPage';
import { ExperiencePage } from './pages/public/ExperiencePage';
import { ServicesPage } from './pages/public/ServicesPage';
import { ContactPage } from './pages/public/ContactPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { OnboardingPage } from './pages/auth/OnboardingPage';

// Dashboard Pages
import { DashboardLayout } from './pages/dashboard/DashboardLayout';
import { DashboardOverview } from './pages/dashboard/DashboardOverview';
import { ProfileSettings } from './pages/dashboard/ProfileSettings';
import { ProjectsManager } from './pages/dashboard/ProjectsManager';
import { ProjectEditor } from './pages/dashboard/ProjectEditor';
import { DraftProjectPreview } from './pages/dashboard/DraftProjectPreview';
import { CategoriesManager } from './pages/dashboard/CategoriesManager';
import { SkillsManager } from './pages/dashboard/SkillsManager';
import { ExperienceManager } from './pages/dashboard/ExperienceManager';
import { ServicesManager } from './pages/dashboard/ServicesManager';
import { TestimonialsManager } from './pages/dashboard/TestimonialsManager';
import { MessagesInbox } from './pages/dashboard/MessagesInbox';
import { PortfolioSettingsView } from './pages/dashboard/PortfolioSettingsView';

// Super Admin Pages
import { SuperAdminClients } from './pages/dashboard/SuperAdminClients';
import { SuperAdminAuditLogs } from './pages/dashboard/SuperAdminAuditLogs';
import { SuperAdminPlatformSettings } from './pages/dashboard/SuperAdminPlatformSettings';

function AppContent() {
  const { currentPath, searchParams } = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  // Public bundle state
  const [bundle, setBundle] = useState<PublicPortfolioBundle | null>(null);
  const [isBundleLoading, setIsBundleLoading] = useState(false);
  const [bundleError, setBundleError] = useState<string | null>(null);
  const [lastLoadedSlug, setLastLoadedSlug] = useState<string | undefined>(undefined);

  const isPreview = searchParams.get('preview') === 'true';

  // ==========================================
  // 1. AUTH ROUTES
  // ==========================================
  if (currentPath === '/login') {
    return <LoginPage />;
  }

  if (currentPath === '/forgot-password') {
    return <ForgotPasswordPage />;
  }

  const onboardingMatch = matchRoute('/onboarding/:token', currentPath);
  if (onboardingMatch.match) {
    return <OnboardingPage token={onboardingMatch.params.token} />;
  }

  // ==========================================
  // 2. DASHBOARD ROUTES (Protected)
  // ==========================================
  if (currentPath.startsWith('/dashboard')) {
    if (isAuthLoading) {
      return (
        <div className="min-h-screen bg-zinc-50 dark:bg-[#070707] p-8">
          <PageSkeleton />
        </div>
      );
    }

    if (!user) {
      return (
        <ErrorPage
          type="401"
          title="Authentication Required"
          message="You must be signed into your Ultimate Tomato dashboard to access this area."
        />
      );
    }

    // Super Admin Only Route Guard
    const isSuperAdmin = user.role === 'SUPER_ADMIN';
    const isSuperAdminPath =
      currentPath === '/dashboard/clients' ||
      currentPath === '/dashboard/audit-logs' ||
      currentPath === '/dashboard/platform-settings';

    if (isSuperAdminPath && !isSuperAdmin) {
      return (
        <ErrorPage
          type="403"
          title="Super Admin Required"
          message="Strict access policy: You do not have Super Admin agency privileges to access platform settings or client management."
        />
      );
    }

    // Specific Dashboard Views
    let dashboardView = <DashboardOverview />;

    if (currentPath === '/dashboard' || currentPath === '/dashboard/') {
      dashboardView = <DashboardOverview />;
    } else if (currentPath === '/dashboard/profile') {
      dashboardView = <ProfileSettings />;
    } else if (currentPath === '/dashboard/projects') {
      dashboardView = <ProjectsManager />;
    } else if (currentPath === '/dashboard/projects/new') {
      dashboardView = <ProjectEditor />;
    } else if (matchRoute('/dashboard/projects/:id/preview', currentPath).match) {
      const { params } = matchRoute('/dashboard/projects/:id/preview', currentPath);
      return (
        <DashboardLayout>
          <DraftProjectPreview projectId={params.id} />
        </DashboardLayout>
      );
    } else if (matchRoute('/dashboard/projects/:id', currentPath).match) {
      const { params } = matchRoute('/dashboard/projects/:id', currentPath);
      dashboardView = <ProjectEditor projectId={params.id} />;
    } else if (currentPath === '/dashboard/categories') {
      dashboardView = <CategoriesManager />;
    } else if (currentPath === '/dashboard/skills') {
      dashboardView = <SkillsManager />;
    } else if (currentPath === '/dashboard/experience') {
      dashboardView = <ExperienceManager />;
    } else if (currentPath === '/dashboard/services') {
      dashboardView = <ServicesManager />;
    } else if (currentPath === '/dashboard/testimonials') {
      dashboardView = <TestimonialsManager />;
    } else if (currentPath === '/dashboard/messages') {
      dashboardView = <MessagesInbox />;
    } else if (currentPath === '/dashboard/settings') {
      dashboardView = <PortfolioSettingsView />;
    } else if (currentPath === '/dashboard/clients') {
      dashboardView = <SuperAdminClients />;
    } else if (currentPath === '/dashboard/audit-logs') {
      dashboardView = <SuperAdminAuditLogs />;
    } else if (currentPath === '/dashboard/platform-settings') {
      dashboardView = <SuperAdminPlatformSettings />;
    } else {
      return <ErrorPage type="404" title="Dashboard Page Not Found" />;
    }

    return <DashboardLayout>{dashboardView}</DashboardLayout>;
  }

  // ==========================================
  // 3. PUBLIC PORTFOLIO ROUTES
  // ==========================================

  // Determine slug and target public subpage
  let portfolioSlug: string | undefined = undefined;
  let subpage = '';
  let detailProjectSlug: string | undefined = undefined;

  // Patterns for multi-tenant slug routes: /portfolio/:slug/...
  const tenantProjectDetailMatch = matchRoute('/portfolio/:slug/projects/:projectSlug', currentPath);
  const tenantSubpageMatch = matchRoute('/portfolio/:slug/:subpage', currentPath);
  const tenantRootMatch = matchRoute('/portfolio/:slug', currentPath);

  // Patterns for root default tenant: /...
  const rootProjectDetailMatch = matchRoute('/projects/:projectSlug', currentPath);

  if (tenantProjectDetailMatch.match) {
    portfolioSlug = tenantProjectDetailMatch.params.slug;
    detailProjectSlug = tenantProjectDetailMatch.params.projectSlug;
    subpage = 'project-detail';
  } else if (tenantSubpageMatch.match) {
    portfolioSlug = tenantSubpageMatch.params.slug;
    subpage = tenantSubpageMatch.params.subpage;
  } else if (tenantRootMatch.match) {
    portfolioSlug = tenantRootMatch.params.slug;
    subpage = 'home';
  } else if (rootProjectDetailMatch.match) {
    detailProjectSlug = rootProjectDetailMatch.params.projectSlug;
    subpage = 'project-detail';
  } else if (currentPath === '/' || currentPath === '') {
    subpage = 'home';
  } else {
    // /about, /skills, /experience, /projects, /services, /contact
    const cleanSub = currentPath.replace(/^\//, '').split('/')[0];
    if (['about', 'skills', 'experience', 'projects', 'services', 'contact'].includes(cleanSub)) {
      subpage = cleanSub;
    } else {
      // Unrecognized path
      return <ErrorPage type="404" />;
    }
  }

  // Load public portfolio bundle
  useEffect(() => {
    let isCancelled = false;

    async function loadPortfolio() {
      setIsBundleLoading(true);
      setBundleError(null);

      try {
        const data = await portfolioService.getPublicPortfolio(portfolioSlug, isPreview);
        if (!isCancelled) {
          setBundle(data);
          setLastLoadedSlug(portfolioSlug);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setBundleError(err.message || 'Portfolio not found or currently offline.');
        }
      } finally {
        if (!isCancelled) {
          setIsBundleLoading(false);
        }
      }
    }

    loadPortfolio();

    return () => {
      isCancelled = true;
    };
  }, [portfolioSlug, isPreview]);

  if (isBundleLoading && !bundle) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#F52F3A]/10 border border-[#F52F3A]/25 flex items-center justify-center mb-4 shadow-lg shadow-[#F52F3A]/20 animate-pulse">
          <img
            src={getAssetUrl('/assets/ultimate-tomato-logo.png')}
            alt="Ultimate Tomato"
            className="w-10 h-10 object-contain"
          />
        </div>
        <p className="text-sm font-semibold tracking-wider uppercase text-zinc-400">
          ULTIMATE TOMATO
        </p>
        <p className="text-xs text-zinc-600 mt-1">Loading client portfolio...</p>
      </div>
    );
  }

  if (bundleError || !bundle) {
    return (
      <ErrorPage
        type="404"
        title="Portfolio Unavailable"
        message={bundleError || 'The requested client portfolio could not be found or has not been published.'}
      />
    );
  }

  // Draft Mode Check
  if (bundle.portfolio.status === 'DRAFT' && !isPreview) {
    return (
      <ErrorPage
        type="403"
        title="Portfolio in Draft Mode"
        message="This creative portfolio is currently in private draft mode while being crafted. If you are the owner, sign in to your dashboard to preview and publish it."
      />
    );
  }

  // Render Public Subpage Content
  const renderSubpageContent = () => {
    if (subpage === 'project-detail') {
      const matchedProject = bundle.projects.find((p: any) => p.slug === detailProjectSlug);
      if (!matchedProject) {
        return (
          <ErrorPage
            type="404"
            title="Project Not Found"
            message={`The project "${detailProjectSlug}" was not found in this portfolio.`}
          />
        );
      }
      return <ProjectDetailPage project={matchedProject} bundle={bundle} />;
    }

    switch (subpage) {
      case 'home':
        return <HomePage bundle={bundle} />;
      case 'about':
        return <AboutPage bundle={bundle} />;
      case 'skills':
        return <SkillsPage bundle={bundle} />;
      case 'experience':
        return <ExperiencePage bundle={bundle} />;
      case 'projects':
        return <ProjectsPage bundle={bundle} />;
      case 'services':
        return <ServicesPage bundle={bundle} />;
      case 'contact':
        return <ContactPage bundle={bundle} />;
      default:
        return <HomePage bundle={bundle} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#050505] text-zinc-900 dark:text-white transition-colors selection:bg-[#F52F3A]/20 selection:text-[#F52F3A]">
      <Navbar
        portfolio={bundle.portfolio}
        clientName={bundle.client.name}
        isPreview={isPreview}
      />
      <main className="flex-grow">{renderSubpageContent()}</main>
      <Footer
        clientName={bundle.client.name}
        professionalTitle={bundle.settings.professional_title}
        socialLinks={bundle.social_links}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider>
        <AuthProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </AuthProvider>
      </RouterProvider>
    </ThemeProvider>
  );
}
