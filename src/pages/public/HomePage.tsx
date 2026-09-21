import React from 'react';
import { useRouter, formatExternalUrl } from '../../lib/router';
import { ArrowRight, Sparkles, Code, Layout, Layers, Facebook, ExternalLink, ArrowUpRight } from 'lucide-react';
import { PublicPortfolioBundle, Project } from '../../types/portfolio';
import { Badge } from '../../components/ui/Badge';
import { GlassCard } from '../../components/ui/GlassCard';

interface HomePageProps {
  bundle: PublicPortfolioBundle;
}

export function HomePage({ bundle }: HomePageProps) {
  const { navigate } = useRouter();
  const { client, settings, projects, skills, services, experiences } = bundle;

  const featuredProjects = projects.filter((p) => p.featured || p.published).slice(0, 3);
  const topSkills = skills.slice(0, 6);

  return (
    <div className="space-y-24 sm:space-y-32 pb-24 overflow-hidden">
      {/* ==========================================
          1. HERO SECTION (Apple + Linear aesthetic)
          ========================================== */}
      <section className="relative pt-12 sm:pt-20 lg:pt-28">
        {/* Subtle Tomato Red Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#F52F3A]/10 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="absolute top-1/3 -right-20 w-72 h-72 bg-[#F52F3A]/5 rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Col: Headline & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Pill status badge */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.10] backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Available for select client projects & architecture consulting
                </span>
              </div>

              {/* Massive Bold Hero Typography */}
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-zinc-950 dark:text-white leading-[1.08]">
                  Hi, I'm <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 via-[#F52F3A] to-zinc-700 dark:from-white dark:via-[#F52F3A] dark:to-zinc-300">
                    {client.name}.
                  </span>
                </h1>
                <p className="text-lg sm:text-2xl font-semibold text-zinc-600 dark:text-zinc-400 tracking-tight">
                  {settings.professional_title}
                </p>
              </div>

              {/* Bio snippet */}
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed">
                {settings.bio}
              </p>

              {/* CTAs & Verified Reference Link */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => navigate('/projects')}
                  className="px-6 py-3.5 rounded-full bg-[#F52F3A] hover:bg-[#d9232d] text-white text-sm font-semibold tracking-wide shadow-lg shadow-[#F52F3A]/25 hover:shadow-[#F52F3A]/40 transition-all flex items-center gap-2 active:scale-95"
                >
                  View My Work
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigate('/contact')}
                  className="px-6 py-3.5 rounded-full bg-white dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-900 dark:text-white border border-black/[0.08] dark:border-white/[0.10] text-sm font-semibold transition-all backdrop-blur-md active:scale-95"
                >
                  Let's Work Together
                </button>

                {/* Verified Facebook Reference Button */}
                <a
                  href="https://www.facebook.com/omar.mhmdfwzi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-full text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  <Facebook className="w-4 h-4 text-[#F52F3A]" />
                  <span>Verified Profile</span>
                </a>
              </div>
            </div>

            {/* Right Col: 3D-style Floating Glass Showcase Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Background Glass Plate */}
                <GlassCard
                  variant="glass"
                  className="p-6 sm:p-8 rounded-3xl relative z-10 border-black/10 dark:border-white/15 shadow-2xl backdrop-blur-xl"
                >
                  <div className="flex items-center justify-between pb-6 border-b border-black/5 dark:border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#F52F3A]/10 border border-[#F52F3A]/20 flex items-center justify-center text-[#F52F3A]">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                          Active Focus
                        </div>
                        <div className="text-sm font-bold text-zinc-900 dark:text-white">
                          High-End SaaS & Visual Design
                        </div>
                      </div>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F52F3A] animate-ping" />
                  </div>

                  {/* Visual Project Preview Inside Card */}
                  {featuredProjects[0] && (
                    <div
                      onClick={() => navigate(`/projects/${featuredProjects[0].slug}`)}
                      className="my-6 rounded-2xl overflow-hidden group cursor-pointer border border-black/10 dark:border-white/10 relative aspect-[16/10]"
                    >
                      <img
                        src={featuredProjects[0].hero_image}
                        alt={featuredProjects[0].title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end">
                        <span className="text-[11px] font-mono text-[#F52F3A] font-semibold">
                          Latest Release
                        </span>
                        <h4 className="text-sm font-bold text-white group-hover:text-[#F52F3A] transition-colors">
                          {featuredProjects[0].title}
                        </h4>
                      </div>
                    </div>
                  )}

                  {/* Mini Stats Row */}
                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-black/5 dark:border-white/10 text-center">
                    <div>
                      <div className="text-lg font-bold text-zinc-900 dark:text-white font-mono">
                        {settings.stats.projects}+
                      </div>
                      <div className="text-[11px] text-zinc-500">Projects</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-zinc-900 dark:text-white font-mono">
                        {settings.stats.experience_years}+ Yrs
                      </div>
                      <div className="text-[11px] text-zinc-500">Experience</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-zinc-900 dark:text-white font-mono">
                        {settings.stats.clients}+
                      </div>
                      <div className="text-[11px] text-zinc-500">Clients</div>
                    </div>
                  </div>
                </GlassCard>

                {/* Floating Micro Card 1 */}
                <div className="absolute -bottom-6 -left-6 z-20 hidden sm:flex items-center gap-3 p-3.5 rounded-2xl bg-white/90 dark:bg-[#111111]/90 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-xl animate-bounce-subtle">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                    <Code className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-900 dark:text-white">React 19 & TypeScript</div>
                    <div className="text-[10px] text-zinc-400">Strict Type Safety</div>
                  </div>
                </div>

                {/* Floating Micro Card 2 */}
                <div className="absolute -top-6 -right-6 z-20 hidden sm:flex items-center gap-3 p-3.5 rounded-2xl bg-white/90 dark:bg-[#111111]/90 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-xl">
                  <div className="p-2 rounded-xl bg-[#F52F3A]/10 text-[#F52F3A]">
                    <Layout className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-900 dark:text-white">Multi-Tenant CMS</div>
                    <div className="text-[10px] text-zinc-400">Ultimate Tomato Platform</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          2. FEATURED PROJECTS SHOWCASE (Editorial)
          ========================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-[#F52F3A] font-bold mb-2">
              Case Studies
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Featured Work
            </h2>
          </div>
          <button
            onClick={() => navigate('/projects')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-[#F52F3A] transition-colors"
          >
            <span>Explore all projects</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProjects.map((project: Project) => (
            <div
              key={project.id}
              onClick={() => navigate(`/projects/${project.slug}`)}
              className="group cursor-pointer flex flex-col rounded-3xl bg-white dark:bg-[#111111] border border-black/[0.08] dark:border-white/[0.08] overflow-hidden hover:border-[#F52F3A]/40 transition-all duration-300 hover:shadow-xl hover:shadow-[#F52F3A]/5 hover:-translate-y-1"
            >
              {/* Project Image */}
              <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100 dark:bg-white/5">
                <img
                  src={project.hero_image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 right-4 z-10">
                  {project.project_url ? (
                    <a
                      href={formatExternalUrl(project.project_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-[#F52F3A] transition-colors inline-flex items-center justify-center shadow-lg"
                      title="Open Live Project URL"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <span className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white group-hover:bg-[#F52F3A] transition-colors inline-flex items-center justify-center">
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  )}
                </div>
                {project.category && (
                  <div className="absolute bottom-4 left-4">
                    <Badge variant="default" className="bg-black/60 text-white backdrop-blur-md border-transparent">
                      {project.category.name}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Project Info */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-[#F52F3A] transition-colors tracking-tight">
                    {project.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
                    {project.short_description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex flex-wrap gap-1.5">
                    {project.technologies.slice(0, 3).map((t: string, tIdx: number) => (
                      <span
                        key={tIdx}
                        className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {project.project_url && (
                    <a
                      href={formatExternalUrl(project.project_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#F52F3A] hover:underline flex-shrink-0"
                    >
                      <span>Live</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==========================================
          3. SKILLS & EXPERTISE
          ========================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="text-xs font-mono uppercase tracking-widest text-[#F52F3A] font-bold">
            Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Skills & Technical Stack
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Engineered with a focus on type safety, smooth framerates, and scalable cloud architectures.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {topSkills.map((skill) => (
            <GlassCard
              key={skill.id}
              variant="minimal"
              className="p-6 rounded-2xl flex items-center justify-between group hover:border-[#F52F3A]/30 transition-colors"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                  {skill.category}
                </span>
                <h4 className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-[#F52F3A] transition-colors">
                  {skill.name}
                </h4>
                {skill.years && (
                  <span className="text-xs text-zinc-500">
                    {skill.years} years experience
                  </span>
                )}
              </div>

              {/* Radial Proficiency Circle */}
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    className="text-zinc-200 dark:text-white/10"
                    fill="transparent"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="#F52F3A"
                    strokeWidth="3.5"
                    strokeDasharray={2 * Math.PI * 20}
                    strokeDashoffset={2 * Math.PI * 20 * (1 - skill.level / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                    fill="transparent"
                  />
                </svg>
                <span className="absolute text-[11px] font-mono font-bold text-zinc-800 dark:text-zinc-200">
                  {skill.level}%
                </span>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* ==========================================
          4. SERVICES TEASER
          ========================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-zinc-100 dark:bg-[#0c0c0c] border border-black/5 dark:border-white/10 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <Badge variant="tomato">Services</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Looking to build something ambitious?
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              From creative frontend showcases to full-scale SaaS platforms, I help clients design, engineer, and deploy high-conversion products.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate('/services')}
                className="px-6 py-3 rounded-full bg-[#F52F3A] hover:bg-[#d9232d] text-white text-sm font-semibold transition-all shadow-md shadow-[#F52F3A]/20 inline-flex items-center gap-2"
              >
                Explore Services & Pricing
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
