import React, { useState } from 'react';
import { useRouter, getAssetUrl } from '../../lib/router';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard,
  User,
  FolderGit2,
  Tag,
  Code2,
  Briefcase,
  Layers,
  MessageSquare,
  Quote,
  Settings,
  Shield,
  History,
  Sliders,
  LogOut,
  Sun,
  Moon,
  ExternalLink,
  Eye,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { NotificationBell } from '../../components/ui/NotificationBell';
import { portfolioService } from '../../services/portfolioService';
import { useToast } from '../../components/ui/Toast';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { currentPath, navigate } = useRouter();
  const { user, portfolio, allPortfolios, switchPortfolio, logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Profile & Bio', href: '/dashboard/profile', icon: User },
    { label: 'Projects', href: '/dashboard/projects', icon: FolderGit2 },
    { label: 'Categories', href: '/dashboard/categories', icon: Tag },
    { label: 'Skills & Stack', href: '/dashboard/skills', icon: Code2 },
    { label: 'Experience', href: '/dashboard/experience', icon: Briefcase },
    { label: 'Services', href: '/dashboard/services', icon: Layers },
    { label: 'Testimonials', href: '/dashboard/testimonials', icon: Quote },
    { label: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
    { label: 'Portfolio Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const superAdminItems = [
    { label: 'Client Tenants', href: '/dashboard/clients', icon: Shield },
    { label: 'Audit Logs', href: '/dashboard/audit-logs', icon: History },
    { label: 'Platform Core', href: '/dashboard/platform-settings', icon: Sliders },
  ];

  const handleTogglePublished = async () => {
    if (!portfolio) return;
    const nextStatus = portfolio.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    setIsUpdatingStatus(true);
    try {
      await portfolioService.updatePortfolioStatus(nextStatus);
      portfolio.status = nextStatus;
      portfolio.published = nextStatus === 'PUBLISHED';
      showToast(
        nextStatus === 'PUBLISHED'
          ? 'Portfolio published! Now live to visitors.'
          : 'Portfolio unpublished. Set to private draft mode.',
        'success'
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to update portfolio status', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleNavClick = (href: string) => {
    setMobileSidebarOpen(false);
    navigate(href);
  };

  const handleLogout = async () => {
    navigate('/');
    await logout();
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#070707] text-zinc-900 dark:text-white flex flex-col md:flex-row transition-colors">
      {/* ==========================================
          SIDEBAR (Desktop + Mobile Drawer)
          ========================================== */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-white dark:bg-[#0e0e0e] border-r border-black/[0.06] dark:border-white/[0.08] flex flex-col justify-between transition-transform duration-300 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top: Brand Header */}
        <div className="p-5 border-b border-black/[0.06] dark:border-white/[0.08]">
          <div
            onClick={() => handleNavClick('/dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <img
              src={getAssetUrl('/assets/ultimate-tomato-logo.png')}
              alt="Ultimate Tomato"
              className="w-8 h-8 object-contain"
            />
            <div className="flex flex-col">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#F52F3A] font-bold">
                Platform CMS
              </span>
              <span className="text-sm font-extrabold tracking-tight text-zinc-900 dark:text-white">
                ULTIMATE TOMATO
              </span>
            </div>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6 scrollbar-thin">
          {/* Main Tenant Management */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold">
              Portfolio Content
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.href;
              return (
                <button
                  key={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#F52F3A] text-white font-semibold shadow-md shadow-[#F52F3A]/20'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Super Admin Section */}
          {isSuperAdmin && (
            <div className="space-y-1 pt-4 border-t border-black/[0.06] dark:border-white/[0.08]">
              <span className="px-3 text-[10px] font-mono uppercase tracking-wider text-[#F52F3A] font-bold">
                Super Admin Controls
              </span>
              {superAdminItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.href;
                return (
                  <button
                    key={item.href}
                    onClick={() => handleNavClick(item.href)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#F52F3A] text-white font-semibold shadow-md shadow-[#F52F3A]/20'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom: User Card & Sign Out */}
        <div className="p-3 border-t border-black/[0.06] dark:border-white/[0.08] space-y-2">
          <div className="p-3 rounded-xl bg-black/[0.03] dark:bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#F52F3A]/10 text-[#F52F3A] flex items-center justify-center font-bold text-xs">
                {user?.email[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                  {user?.email}
                </p>
                <p className="text-[10px] font-mono text-zinc-400 uppercase">
                  {user?.role}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 text-zinc-400 hover:text-[#F52F3A] transition-colors rounded-lg"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for Mobile Drawer */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ==========================================
          MAIN CONTENT AREA & TOPBAR
          ========================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Dashboard Topbar */}
        <header className="sticky top-0 z-20 h-16 bg-white/80 dark:bg-[#070707]/80 backdrop-blur-lg border-b border-black/[0.06] dark:border-white/[0.08] px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Super Admin Tenant Context Switcher */}
            {isSuperAdmin && allPortfolios.length > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-mono hidden sm:inline">Tenant Context:</span>
                <select
                  value={portfolio?.id || ''}
                  onChange={(e) => switchPortfolio(e.target.value)}
                  className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#F52F3A]"
                >
                  {allPortfolios.map((p) => (
                    <option key={p.id} value={p.id} className="bg-white dark:bg-[#111111]">
                      {p.name} ({p.slug})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-zinc-900 dark:text-white">
                  {portfolio?.name || 'My Portfolio'}
                </span>
                <span className="text-xs font-mono text-zinc-400">({portfolio?.slug})</span>
              </div>
            )}
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Portfolio Publish / Draft Master Status */}
            {portfolio && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTogglePublished}
                  disabled={isUpdatingStatus}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                    portfolio.published
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
                  }`}
                  title="Click to toggle public status"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      portfolio.published ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                  <span>{portfolio.published ? 'Published' : 'Draft Mode'}</span>
                </button>

                {/* Preview Portfolio Link */}
                <a
                  href={`/portfolio/${portfolio.slug}?preview=true`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-white hover:bg-[#F52F3A] hover:border-transparent transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </a>
              </div>
            )}

            <NotificationBell />

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 border border-black/5 dark:border-white/10 transition-colors"
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Page View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
