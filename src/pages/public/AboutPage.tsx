import React from 'react';
import { useRouter } from '../../lib/router';
import { Facebook, Award, Code2, Users, Rocket, ArrowRight } from 'lucide-react';
import { PublicPortfolioBundle } from '../../types/portfolio';
import { Badge } from '../../components/ui/Badge';
import { GlassCard } from '../../components/ui/GlassCard';

interface AboutPageProps {
  bundle: PublicPortfolioBundle;
}

export function AboutPage({ bundle }: AboutPageProps) {
  const { navigate } = useRouter();
  const { client, settings } = bundle;

  const statCards = [
    { label: 'Projects Completed', value: `${settings.stats.projects}+`, icon: Rocket },
    { label: 'Years Experience', value: `${settings.stats.experience_years}+`, icon: Code2 },
    { label: 'Happy Clients', value: `${settings.stats.clients}+`, icon: Users },
    { label: 'Technologies Mastered', value: `${settings.stats.technologies}+`, icon: Award },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16">
      {/* Header */}
      <div className="max-w-3xl space-y-4 text-left">
        <Badge variant="tomato">About the Creator</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Architecting High-Performance Digital Experiences
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {settings.professional_title}
        </p>
      </div>

      {/* Main Grid: Portrait + Biography */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Portrait Left */}
        <div className="lg:col-span-5 space-y-6">
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-black/10 dark:border-white/10 shadow-2xl bg-zinc-100 dark:bg-white/5">
            <img
              src={settings.portrait_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'}
              alt={client.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
              <span className="text-xs font-mono uppercase text-[#F52F3A] font-semibold">
                Client Profile #1
              </span>
              <h3 className="text-xl font-bold text-white">{client.name}</h3>
              <p className="text-xs text-zinc-300 mt-1">{settings.location || 'Cairo, Egypt'}</p>
            </div>
          </div>

          {/* Verified Reference Callout */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#F52F3A]/10 text-[#F52F3A]">
                <Facebook className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-900 dark:text-white">Verified Identity</div>
                <div className="text-[11px] text-zinc-500">Public profile reference</div>
              </div>
            </div>
            <a
              href="https://www.facebook.com/omar.mhmdfwzi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-[#F52F3A] hover:underline"
            >
              View Facebook
            </a>
          </div>
        </div>

        {/* Biography Right */}
        <div className="lg:col-span-7 space-y-8 text-left">
          <div className="prose dark:prose-invert max-w-none text-sm sm:text-base text-zinc-600 dark:text-zinc-400 space-y-4 leading-relaxed">
            <p className="text-base sm:text-lg text-zinc-900 dark:text-zinc-200 font-medium leading-relaxed">
              {settings.bio}
            </p>
            <p>
              I focus on the intersection of engineering rigor and aesthetic precision. By combining modern React frameworks, strict TypeScript paradigms, and GPU-accelerated micro-interactions, I help forward-thinking teams create digital products that feel instant, tactile, and unforgettable.
            </p>
            <p>
              Every element of this portfolio is dynamically governed by the <strong>Ultimate Tomato Multi-Tenant Platform</strong>, allowing rapid updates, live case study publishing, and real-time client interaction without manual deployments.
            </p>
          </div>

          {/* Animated Statistics Cards */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            {statCards.map((stat, idx) => {
              const IconComponent = stat.icon;
              return (
                <GlassCard key={idx} variant="minimal" className="p-6 rounded-2xl space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-[#F52F3A]/10 text-[#F52F3A] flex items-center justify-center">
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white font-mono">
                    {stat.value}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                    {stat.label}
                  </div>
                </GlassCard>
              );
            })}
          </div>

          <div className="pt-4">
            <button
              onClick={() => navigate('/contact')}
              className="px-6 py-3 rounded-full bg-[#F52F3A] hover:bg-[#d9232d] text-white text-sm font-semibold transition-all shadow-md shadow-[#F52F3A]/20 inline-flex items-center gap-2"
            >
              Let's Connect & Collaborate
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
