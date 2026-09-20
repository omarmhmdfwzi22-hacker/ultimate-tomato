import React, { useMemo } from 'react';
import { PublicPortfolioBundle } from '../../types/portfolio';
import { Badge } from '../../components/ui/Badge';
import { GlassCard } from '../../components/ui/GlassCard';
import { Code, Palette, Server, Cpu, Sparkles } from 'lucide-react';

interface SkillsPageProps {
  bundle: PublicPortfolioBundle;
}

export function SkillsPage({ bundle }: SkillsPageProps) {
  const { skills } = bundle;

  // Group skills by category
  const categorizedSkills = useMemo(() => {
    const map: Record<string, typeof skills> = {};
    skills.forEach((s) => {
      const cat = s.category || 'General';
      if (!map[cat]) map[cat] = [];
      map[cat].push(s);
    });
    return map;
  }, [skills]);

  const getCategoryIcon = (category: string) => {
    const lower = category.toLowerCase();
    if (lower.includes('dev') || lower.includes('code')) return Code;
    if (lower.includes('design') || lower.includes('ui')) return Palette;
    if (lower.includes('arch') || lower.includes('cloud')) return Server;
    return Cpu;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16">
      {/* Header */}
      <div className="max-w-3xl space-y-4 text-left">
        <Badge variant="tomato">Core Competencies</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Skills, Technologies & Methodologies
        </h1>
        <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Comprehensive breakdown of development languages, design tokens, multi-tenant database paradigms, and cloud engineering tools.
        </p>
      </div>

      {/* Categorized Skills Grid */}
      <div className="space-y-12">
        {Object.entries(categorizedSkills).map(([category, items]) => {
          const CategoryIcon = getCategoryIcon(category);
          return (
            <div key={category} className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
                <div className="w-8 h-8 rounded-lg bg-[#F52F3A]/10 text-[#F52F3A] flex items-center justify-center">
                  <CategoryIcon className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                  {category}
                </h2>
                <span className="text-xs text-zinc-400 font-mono">
                  ({items.length} skills)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((skill) => (
                  <GlassCard
                    key={skill.id}
                    variant="minimal"
                    className="p-6 rounded-2xl flex items-center justify-between group hover:border-[#F52F3A]/30 transition-all"
                  >
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-[#F52F3A] transition-colors">
                        {skill.name}
                      </h3>
                      {skill.years && (
                        <p className="text-xs text-zinc-500">
                          {skill.years} {skill.years === 1 ? 'year' : 'years'} active experience
                        </p>
                      )}
                    </div>

                    {/* Radial Meter */}
                    <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
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
                          className="transition-all duration-700"
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
