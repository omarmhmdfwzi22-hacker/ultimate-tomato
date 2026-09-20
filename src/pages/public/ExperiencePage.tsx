import React from 'react';
import { PublicPortfolioBundle } from '../../types/portfolio';
import { Badge } from '../../components/ui/Badge';
import { Calendar, MapPin, Briefcase } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';

interface ExperiencePageProps {
  bundle: PublicPortfolioBundle;
}

export function ExperiencePage({ bundle }: ExperiencePageProps) {
  const { experiences } = bundle;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16">
      {/* Header */}
      <div className="space-y-4 text-left">
        <Badge variant="tomato">Career Timeline</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Professional Experience & Roles
        </h1>
        <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
          Timeline of leadership, software engineering roles, and creative design systems contributions.
        </p>
      </div>

      {/* Timeline List */}
      <div className="relative border-l-2 border-zinc-200 dark:border-white/10 ml-4 sm:ml-6 space-y-12 pl-6 sm:pl-10">
        {experiences.map((exp, idx) => (
          <div key={exp.id} className="relative group">
            {/* Timeline Node Point */}
            <div className="absolute -left-[31px] sm:-left-[47px] top-1.5 w-4 h-4 rounded-full bg-white dark:bg-[#111111] border-2 border-[#F52F3A] group-hover:scale-125 transition-transform" />

            <GlassCard variant="minimal" className="p-6 sm:p-8 rounded-3xl space-y-4 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-[#F52F3A] transition-colors">
                    {exp.position}
                  </h3>
                  <div className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-2 mt-1">
                    <Briefcase className="w-4 h-4 text-[#F52F3A]" />
                    <span>{exp.company}</span>
                    {exp.location && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-zinc-400" />
                        <span className="flex items-center gap-1 text-xs font-normal">
                          <MapPin className="w-3 h-3" /> {exp.location}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="inline-flex items-center gap-1 text-xs font-mono font-medium px-3 py-1 rounded-full bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-300 self-start sm:self-auto">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {exp.start_date} — {exp.current_position ? 'Present' : exp.end_date || 'Ongoing'}
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {exp.description}
              </p>

              {exp.technologies && exp.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {exp.technologies.map((t, tIdx) => (
                    <span
                      key={tIdx}
                      className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>
        ))}
      </div>
    </div>
  );
}
