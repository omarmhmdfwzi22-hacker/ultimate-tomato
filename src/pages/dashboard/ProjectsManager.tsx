import React, { useEffect, useState } from 'react';
import { useRouter } from '../../lib/router';
import { projectsService, categoriesService } from '../../services/cmsServices';
import { Project, Category } from '../../types/portfolio';
import { GlassCard } from '../../components/ui/GlassCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Copy,
  Trash2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Star,
} from 'lucide-react';

export function ProjectsManager() {
  const { navigate } = useRouter();
  const { showToast } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Deletion modal state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const [projList, catList] = await Promise.all([
        projectsService.list(),
        categoriesService.list(),
      ]);
      setProjects(projList);
      setCategories(catList);
    } catch (err) {
      showToast('Failed to load projects', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDuplicate = async (id: string) => {
    try {
      const duplicated = await projectsService.duplicate(id);
      setProjects((prev) => [duplicated, ...prev]);
      showToast(`Duplicated "${duplicated.title}" as draft!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Duplication failed', 'error');
    }
  };

  const handleTogglePublish = async (project: Project) => {
    const nextPublished = !project.published;
    try {
      await projectsService.update(project.id, { published: nextPublished });
      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? { ...p, published: nextPublished } : p))
      );
      showToast(
        nextPublished ? `Published "${project.title}" live!` : `Saved "${project.title}" as draft.`,
        'success'
      );
    } catch (err: any) {
      showToast(err.message || 'Update failed', 'error');
    }
  };

  const handleToggleFeatured = async (project: Project) => {
    const nextFeatured = !project.featured;
    try {
      await projectsService.update(project.id, { featured: nextFeatured });
      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? { ...p, featured: nextFeatured } : p))
      );
      showToast(
        nextFeatured ? `Marked "${project.title}" as Featured!` : `Removed featured flag from "${project.title}".`,
        'info'
      );
    } catch (err: any) {
      showToast(err.message || 'Update failed', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await projectsService.softDelete(deleteId);
      setProjects((prev) => prev.filter((p) => p.id !== deleteId));
      showToast('Project moved to trash (soft delete).', 'success');
      setDeleteId(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete project', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = projects.filter((p) => {
    const matchCat = categoryFilter === 'all' || p.category_id === categoryFilter;
    const matchQuery =
      searchQuery === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Project Showcase Manager
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Create, edit, duplicate, preview, and publish your portfolio case studies.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate('/dashboard/projects/new')}
          icon={<Plus className="w-4 h-4" />}
        >
          Add New Project
        </Button>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#111111] border border-black/10 dark:border-white/10 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#F52F3A]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-zinc-400 font-mono">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#F52F3A]"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects Table */}
      <GlassCard variant="minimal" className="rounded-2xl overflow-hidden border border-black/10 dark:border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/5 dark:border-white/10 text-zinc-400 font-mono uppercase tracking-wider">
              <tr>
                <th className="px-5 py-4 font-semibold">Project & Thumbnail</th>
                <th className="px-5 py-4 font-semibold">Category</th>
                <th className="px-5 py-4 font-semibold">Featured</th>
                <th className="px-5 py-4 font-semibold">Publish Status</th>
                <th className="px-5 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-zinc-400">
                    No projects matching your search. Click "+ Add New Project" to create one.
                  </td>
                </tr>
              ) : (
                filtered.map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-black/[0.01] dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={project.hero_image}
                          alt={project.title}
                          className="w-12 h-12 rounded-xl object-cover bg-zinc-100 flex-shrink-0 border border-black/5 dark:border-white/10"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-zinc-900 dark:text-white text-sm truncate">
                            {project.title}
                          </h4>
                          <span className="text-[11px] text-zinc-400 font-mono">
                            /{project.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-zinc-600 dark:text-zinc-400 font-medium">
                        {categories.find((c) => c.id === project.category_id)?.name || 'Uncategorized'}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggleFeatured(project)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          project.featured
                            ? 'text-amber-500 bg-amber-500/10'
                            : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                        }`}
                        title={project.featured ? 'Unfeature' : 'Mark as Featured'}
                      >
                        <Star className={`w-4 h-4 ${project.featured ? 'fill-current' : ''}`} />
                      </button>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleTogglePublish(project)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                          project.published
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            project.published ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                        />
                        <span>{project.published ? 'Published' : 'Draft'}</span>
                      </button>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Draft Preview Button */}
                        <button
                          onClick={() => navigate(`/dashboard/projects/${project.id}/preview`)}
                          className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                          title="Preview Case Study"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Duplicate Button */}
                        <button
                          onClick={() => handleDuplicate(project.id)}
                          className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                          title="Duplicate Project"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => navigate(`/dashboard/projects/${project.id}`)}
                          className="p-2 rounded-xl text-zinc-400 hover:text-[#F52F3A] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                          title="Edit Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Soft Delete Button */}
                        <button
                          onClick={() => setDeleteId(project.id)}
                          className="p-2 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          title="Delete Project (Soft Delete)"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Soft Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Project?"
        message="This project will be moved to the soft-delete trash. It will no longer appear on your live portfolio, but can be restored by an administrator."
        confirmText="Move to Trash"
        isLoading={isDeleting}
      />
    </div>
  );
}
