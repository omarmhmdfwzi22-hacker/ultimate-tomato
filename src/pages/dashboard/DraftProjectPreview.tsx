import React, { useEffect, useState } from 'react';
import { useRouter } from '../../lib/router';
import { projectsService, portfolioService } from '../../services';
import { Project, PublicPortfolioBundle } from '../../types/portfolio';
import { ProjectDetailPage } from '../public/ProjectDetailPage';
import { PageSkeleton } from '../../components/ui/Skeletons';
import { ArrowLeft, CheckCircle, Eye, Sparkles } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

interface DraftProjectPreviewProps {
  projectId: string;
}

export function DraftProjectPreview({ projectId }: DraftProjectPreviewProps) {
  const { navigate } = useRouter();
  const { showToast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [bundle, setBundle] = useState<PublicPortfolioBundle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const [bundleData, projectsList] = await Promise.all([
          portfolioService.getAdminSiteBundle(),
          projectsService.list(),
        ]);
        setBundle(bundleData);
        const target = projectsList.find((p) => p.id === projectId);
        setProject(target || null);
      } catch (err) {
        showToast('Failed to load draft preview', 'error');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [projectId]);

  const handlePublish = async () => {
    if (!project) return;
    setIsPublishing(true);
    try {
      await projectsService.update(project.id, { published: true });
      project.published = true;
      showToast(`"${project.title}" is now published and live!`, 'success');
      navigate('/dashboard/projects');
    } catch (err: any) {
      showToast(err.message || 'Publishing failed', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading || !project || !bundle) {
    return (
      <div className="py-12">
        <PageSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Draft Preview Action Bar */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500 text-white">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase text-amber-500">
                Draft Preview Mode
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold">
                {project.published ? 'Currently Live' : 'Unpublished Draft'}
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
              This preview uses the exact public case study layout. Public visitors cannot see unpublished drafts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate(`/dashboard/projects/${project.id}`)}
            className="px-4 py-2 rounded-xl bg-white dark:bg-white/10 border border-black/10 dark:border-white/10 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 transition-colors"
          >
            Edit Project
          </button>

          {!project.published && (
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="px-4 py-2 rounded-xl bg-[#F52F3A] hover:bg-[#d9232d] text-white text-xs font-semibold shadow-md shadow-[#F52F3A]/20 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Publish Now</span>
            </button>
          )}

          <button
            onClick={() => navigate('/dashboard/projects')}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            title="Close Preview"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Render Public View Component */}
      <div className="rounded-3xl border border-black/10 dark:border-white/10 overflow-hidden bg-white dark:bg-[#050505]">
        <ProjectDetailPage project={project} bundle={bundle} />
      </div>
    </div>
  );
}
