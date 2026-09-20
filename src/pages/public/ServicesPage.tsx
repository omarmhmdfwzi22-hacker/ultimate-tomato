import React from 'react';
import { useRouter } from '../../lib/router';
import { PublicPortfolioBundle } from '../../types/portfolio';
import { Badge } from '../../components/ui/Badge';
import { GlassCard } from '../../components/ui/GlassCard';
import { Check, ArrowRight, Sparkles } from 'lucide-react';

interface ServicesPageProps {
  bundle: PublicPortfolioBundle;
}

export function ServicesPage({ bundle }: ServicesPageProps) {
  const { navigate } = useRouter();
  const { services } = bundle;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16">
      {/* Header */}
      <div className="max-w-3xl space-y-4 text-left">
        <Badge variant="tomato">Expertise & Offerings</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Services & Engagement Models
        </h1>
        <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Comprehensive consulting, design system engineering, and full-stack software development tailored to your roadmap.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service) => (
          <GlassCard
            key={service.id}
            variant="minimal"
            className="p-8 rounded-3xl flex flex-col justify-between space-y-6 hover:border-[#F52F3A]/40 transition-all hover:shadow-xl hover:shadow-[#F52F3A]/5 text-left"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F52F3A]/10 text-[#F52F3A] flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  {service.title}
                </h3>
                {service.price && (
                  <p className="text-xs font-mono font-bold text-[#F52F3A]">
                    {service.price}
                  </p>
                )}
              </div>

              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {service.description}
              </p>

              {/* Feature Bullet List */}
              {service.features && service.features.length > 0 && (
                <ul className="space-y-2.5 pt-4 border-t border-black/[0.06] dark:border-white/[0.08]">
                  {service.features.map((f, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5 text-xs text-zinc-600 dark:text-zinc-300">
                      <div className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-500 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              onClick={() => navigate('/contact')}
              className="w-full py-3 rounded-xl bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold tracking-wide transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>{service.cta || 'Get in Touch'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
