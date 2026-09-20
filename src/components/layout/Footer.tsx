import { useRouter, getAssetUrl } from '../../lib/router';
import { ArrowUp, Facebook, Github } from 'lucide-react';
import { SocialLink } from '../../types/portfolio';

interface FooterProps {
  clientName?: string;
  professionalTitle?: string;
  socialLinks?: SocialLink[];
}

export function Footer({
  clientName = 'Omar Mohamed Fawzi',
  professionalTitle = 'Creative Developer & Digital Builder',
  socialLinks = [],
}: FooterProps) {
  const { navigate } = useRouter();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-zinc-50 dark:bg-[#080808] border-t border-black/[0.06] dark:border-white/[0.08] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Client Identity */}
          <div className="md:col-span-2 space-y-3">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
              {clientName}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed">
              {professionalTitle}. Crafting high-performance digital experiences with precision, aesthetic depth, and modern architectures.
            </p>
            {/* Verified Social Links */}
            <div className="flex items-center gap-2 pt-2">
              <a
                href="https://www.facebook.com/omar.mhmdfwzi"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-white dark:bg-white/5 border border-black/[0.06] dark:border-white/[0.08] text-zinc-600 dark:text-zinc-400 hover:text-[#F52F3A] transition-colors"
                title="Verified Facebook Profile"
              >
                <Facebook className="w-4 h-4" />
              </a>
              {socialLinks.map((l) => {
                if (l.platform.toLowerCase() === 'facebook') return null; // already rendered
                return (
                  <a
                    key={l.id}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-white dark:bg-white/5 border border-black/[0.06] dark:border-white/[0.08] text-zinc-600 dark:text-zinc-400 hover:text-[#F52F3A] transition-colors"
                    title={l.label || l.platform}
                  >
                    <Github className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4">
              Explore
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              <li>
                <button onClick={() => navigate('/projects')} className="hover:text-[#F52F3A] transition-colors">
                  Featured Projects
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/about')} className="hover:text-[#F52F3A] transition-colors">
                  About & Background
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/skills')} className="hover:text-[#F52F3A] transition-colors">
                  Skills & Expertise
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/services')} className="hover:text-[#F52F3A] transition-colors">
                  Services Offered
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Portal & Back to top */}
          <div className="flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4">
                Platform
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                <li>
                  <button onClick={() => navigate('/login')} className="hover:text-[#F52F3A] transition-colors">
                    Client Dashboard
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/contact')} className="hover:text-[#F52F3A] transition-colors">
                    Start a Project
                  </button>
                </li>
              </ul>
            </div>

            <button
              onClick={scrollToTop}
              className="mt-6 inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors self-start"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              Back to top
            </button>
          </div>
        </div>

        {/* Bottom Bar with subtle Ultimate Tomato branding */}
        <div className="pt-8 border-t border-black/[0.05] dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p>© {currentYear} {clientName}. All rights reserved.</p>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-white/5 border border-black/[0.06] dark:border-white/[0.08] shadow-sm">
            <img
              src={getAssetUrl('/assets/ultimate-tomato-logo.png')}
              alt="Ultimate Tomato"
              className="w-4 h-4 object-contain"
            />
            <span className="font-medium text-zinc-600 dark:text-zinc-400">
              Built with <span className="text-[#F52F3A]">♥</span> by{' '}
              <span className="font-bold text-zinc-900 dark:text-white">Ultimate Tomato</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
