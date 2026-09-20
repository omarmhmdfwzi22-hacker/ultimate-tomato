import React, { useState, useEffect } from 'react';
import { useRouter, getAssetUrl } from '../../lib/router';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Menu, X, ArrowUpRight, Eye } from 'lucide-react';
import { Portfolio } from '../../types/portfolio';

interface NavbarProps {
  portfolio?: Portfolio | null;
  clientName?: string;
  isPreview?: boolean;
}

export function Navbar({ portfolio, clientName = 'Omar Mohamed Fawzi', isPreview = false }: NavbarProps) {
  const { currentPath, navigate } = useRouter();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Skills', href: '/skills' },
    { label: 'Experience', href: '/experience' },
    { label: 'Projects', href: '/projects' },
    { label: 'Services', href: '/services' },
    { label: 'Contact', href: '/contact' },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    navigate(href);
  };

  return (
    <>
      {/* Draft Preview Indicator Banner */}
      {isPreview && (
        <div className="bg-[#F52F3A] text-white text-xs font-semibold py-1.5 px-4 text-center sticky top-0 z-50 flex items-center justify-center gap-2 shadow-md">
          <Eye className="w-3.5 h-3.5 animate-pulse" />
          <span>PORTFOLIO DRAFT PREVIEW MODE — Only visible to authorized owner & administrators.</span>
          <button
            onClick={() => navigate('/dashboard')}
            className="ml-2 underline text-white/90 hover:text-white"
          >
            Return to Dashboard
          </button>
        </div>
      )}

      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 dark:bg-[#050505]/80 backdrop-blur-lg border-b border-black/[0.06] dark:border-white/[0.08] shadow-sm'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="relative">
              <img
                src={getAssetUrl('/assets/ultimate-tomato-logo.png')}
                alt="Ultimate Tomato Logo"
                style={{ width: '36px', height: '36px', objectFit: 'contain' }}
                className="w-8 h-8 sm:w-9 sm:h-9 object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#F52F3A]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-zinc-400 dark:text-zinc-500 text-[10px]">
                Ultimate Tomato
              </span>
              <span className="text-sm sm:text-base font-bold tracking-tight text-zinc-900 dark:text-white leading-none">
                {clientName}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-black/[0.03] dark:bg-white/[0.04] p-1.5 rounded-full border border-black/[0.06] dark:border-white/[0.08] backdrop-blur-md">
            {navLinks.map((link) => {
              const isActive = currentPath === link.href;
              return (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-white dark:bg-white/10 text-[#F52F3A] dark:text-white shadow-sm font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Cluster */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 border border-black/[0.06] dark:border-white/[0.08] transition-all"
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => navigate('/contact')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F52F3A] hover:bg-[#d9232d] text-white text-xs font-semibold tracking-wide transition-all shadow-md shadow-[#F52F3A]/20 hover:shadow-lg hover:shadow-[#F52F3A]/30 active:scale-95"
            >
              Let's Talk
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5"
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-zinc-800 dark:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5"
              aria-label="Open navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-black/10 dark:border-white/10 px-6 py-6 animate-slide-down space-y-4 shadow-xl">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => {
                const isActive = currentPath === link.href;
                return (
                  <button
                    key={link.href}
                    onClick={() => handleNavClick(link.href)}
                    className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#F52F3A]/10 text-[#F52F3A] font-bold'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-black/5 dark:border-white/10 flex items-center gap-3">
              <button
                onClick={() => handleNavClick('/contact')}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#F52F3A] text-white text-sm font-semibold shadow-md shadow-[#F52F3A]/20"
              >
                Let's Talk
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
