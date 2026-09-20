import React, { useEffect, useState } from 'react';
import { useRouter } from '../../lib/router';
import { useAuth } from '../../context/AuthContext';
import { portfolioService } from '../../services/portfolioService';
import { projectsService } from '../../services/cmsServices';
import { AdminDashboardStats, Project } from '../../types/portfolio';
import { GlassCard } from '../../components/ui/GlassCard';
import { MetricSkeleton, ProjectSkeleton } from '../../components/ui/Skeletons';
import {
  FolderGit2,
  FileCheck2,
  FileClock,
  Code2,
  Briefcase,
  MessageSquare,
  Plus,
  ExternalLink,
  Eye,
  ArrowRight,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { localCMSStore } from '../../services/localCMSStore';

export function DashboardOverview() {
  const { navigate } = useRouter();
  const { portfolio, activePortfolioId } = useAuth();
  const [stats, setStats] = useState<AdminDashboardStats>(() => {
    const projects = localCMSStore.getProjects();
    const skills = localCMSStore.getSkills();
    const experiences = localCMSStore.getExperiences();
    const services = localCMSStore.getServices();
    const messages = localCMSStore.getMessages();
    return {
      totalProjects: projects.length,
      publishedProjects: projects.filter((p) => p.published).length,
      draftProjects: projects.filter((p) => !p.published).length,
      skillsCount: skills.length,
      experiencesCount: experiences.length,
      servicesCount: services.length,
      unreadMessagesCount: messages.filter((m) => m.status === 'UNREAD').length,
      totalMessagesCount: messages.length,
      unreadNotificationsCount: 0,
    };
  });
  const [recentProjects, setRecentProjects] = useState<Project[]>(() =>
    localCMSStore.getProjects().slice(0, 5)
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, projectsData] = await Promise.all([
          portfolioService.getDashboardStats(),
          projectsService.list(),
        ]);
        setStats(statsData);
        setRecentProjects(projectsData.slice(0, 5));
      } catch (err) {
        console.error('Failed to load overview metrics:', err);
      }
    }
    loadData();
  }, [activePortfolioId]);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in text-left">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricSkeleton />
          <MetricSkeleton />
          <MetricSkeleton />
          <MetricSkeleton />
        </div>
        <div className="space-y-4">
          <ProjectSkeleton />
          <ProjectSkeleton />
        </div>
      </div>
    );
  }

  const metricCards = [
    {
      label: 'Total Projects',
      value: stats?.totalProjects ?? 0,
      icon: FolderGit2,
      color: 'text-zinc-900 dark:text-white',
    },
    {
      label: 'Published Live',
      value: stats?.publishedProjects ?? 0,
      icon: FileCheck2,
      color: 'text-emerald-500',
    },
    {
      label: 'Draft Projects',
      value: stats?.draftProjects ?? 0,
      icon: FileClock,
      color: 'text-amber-500',
    },
    {
      label: 'Inquiries / Messages',
      value: stats?.unreadMessagesCount ?? 0,
      subValue: `of ${stats?.totalMessagesCount ?? 0} total`,
      icon: MessageSquare,
      color: 'text-[#F52F3A]',
    },
  ];

  return (
    <div className="space-y-8 text-left">
      {/* Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Real-time management for{' '}
            <strong className="text-zinc-900 dark:text-white">{portfolio?.name}</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/dashboard/projects/new')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F52F3A] hover:bg-[#d9232d] text-white text-xs font-semibold shadow-md shadow-[#F52F3A]/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Project
          </button>
          <button
            onClick={() => navigate('/dashboard/profile')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/10 text-xs font-medium text-zinc-800 dark:text-zinc-200 transition-all"
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((m, idx) => {
          const Icon = m.icon;
          return (
            <GlassCard key={idx} variant="minimal" className="p-5 sm:p-6 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{m.label}</span>
                <Icon className={`w-4 h-4 ${m.color}`} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl sm:text-3xl font-extrabold font-mono ${m.color}`}>
                  {m.value}
                </span>
                {m.subValue && (
                  <span className="text-[11px] text-zinc-400 font-mono">{m.subValue}</span>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Recent Projects Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">
            Recent Projects
          </h2>
          <button
            onClick={() => navigate('/dashboard/projects')}
            className="text-xs font-semibold text-[#F52F3A] hover:underline inline-flex items-center gap-1"
          >
            <span>View all projects</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <GlassCard variant="minimal" className="rounded-2xl overflow-hidden border border-black/10 dark:border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/5 dark:border-white/10 text-zinc-400 font-mono uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Project</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold">Technologies</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {recentProjects.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-zinc-400">
                      No projects created yet. Click "+ Add Project" to build your first showcase!
                    </td>
                  </tr>
                ) : (
                  recentProjects.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-black/[0.01] dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.hero_image}
                            alt={p.title}
                            className="w-10 h-10 rounded-lg object-cover bg-zinc-100 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-zinc-900 dark:text-white truncate block">
                              {p.title}
                            </span>
                            <span className="text-[11px] text-zinc-400 font-mono">
                              /{p.slug}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={p.published ? 'success' : 'warning'}>
                          {p.published ? 'Published' : 'Draft'}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1">
                          {p.technologies.slice(0, 3).map((t, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/dashboard/projects/${p.id}/preview`)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            title="Preview Draft"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/dashboard/projects/${p.id}`)}
                            className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-xs font-semibold text-zinc-900 dark:text-white transition-colors"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
