import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from '../../lib/router';
import { projectsService, categoriesService } from '../../services/cmsServices';
import { Project, Category } from '../../types/portfolio';
import { localCMSStore } from '../../services/localCMSStore';
import { Button } from '../../components/ui/Button';
import { GlassCard } from '../../components/ui/GlassCard';
import { ImageUploader, UploadedImageItem } from '../../components/ui/ImageUploader';
import { RichTextEditor } from '../../components/ui/RichTextEditor';
import { useToast } from '../../components/ui/Toast';
import {
  ArrowLeft,
  Save,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

interface ProjectEditorProps {
  projectId?: string; // If undefined, creation mode
}

export function ProjectEditor({ projectId }: ProjectEditorProps) {
  const { navigate } = useRouter();
  const { showToast } = useToast();

  const initialProject = projectId ? localCMSStore.getProjects().find((p) => p.id === projectId) : undefined;
  const initialCategories = localCMSStore.getCategories();

  const [categories, setCategories] = useState<Category[]>(() => initialCategories);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [title, setTitle] = useState(() => initialProject?.title || '');
  const [slug, setSlug] = useState(() => initialProject?.slug || '');
  const [categoryId, setCategoryId] = useState(() => initialProject?.category_id || initialCategories[0]?.id || '');
  const [client, setClient] = useState(() => initialProject?.client || '');
  const [date, setDate] = useState(() => initialProject?.date || new Date().getFullYear().toString());
  const [shortDescription, setShortDescription] = useState(() => initialProject?.short_description || '');
  const [fullDescription, setFullDescription] = useState(() => initialProject?.full_description || '');
  const [challenge, setChallenge] = useState(() => initialProject?.challenge || '');
  const [solution, setSolution] = useState(() => initialProject?.solution || '');
  const [results, setResults] = useState(() => initialProject?.results || '');
  const [technologiesText, setTechnologiesText] = useState(() =>
    initialProject ? initialProject.technologies.join(', ') : 'React, TypeScript, Tailwind CSS'
  );
  const [tagsText, setTagsText] = useState(() =>
    initialProject ? initialProject.tags.join(', ') : 'Featured, Creative'
  );
  const [heroImage, setHeroImage] = useState<UploadedImageItem[]>(() =>
    initialProject
      ? [{ url: initialProject.hero_image, alt: initialProject.title }]
      : [{ url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80', alt: 'Hero' }]
  );
  const [galleryImages, setGalleryImages] = useState<UploadedImageItem[]>(() =>
    initialProject
      ? (initialProject.images || []).map((img) => ({
          id: img.id,
          url: img.image_url,
          alt: img.alt_text,
          sort_order: img.sort_order,
        }))
      : []
  );
  const [projectUrl, setProjectUrl] = useState(() => initialProject?.project_url || '');
  const [githubUrl, setGithubUrl] = useState(() => initialProject?.github_url || '');
  const [featured, setFeatured] = useState(() => initialProject?.featured || false);
  const [published, setPublished] = useState(() => initialProject?.published || false);

  // Autosave & Dirty Tracking
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(() =>
    initialProject ? new Date(initialProject.updated_at).toLocaleTimeString() : null
  );
  const isInitialLoad = useRef(true);

  // Auto-slug generation from title
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    setIsDirty(true);
    if (!projectId) {
      setSlug(
        newTitle
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      );
    }
  };

  useEffect(() => {
    async function load() {
      try {
        const catList = await categoriesService.list();
        if (catList && catList.length > 0) {
          setCategories(catList);
          if (!categoryId) {
            setCategoryId(catList[0].id);
          }
        }

        if (projectId) {
          const list = await projectsService.list();
          const target = list.find((p) => p.id === projectId);
          if (target) {
            setTitle(target.title);
            setSlug(target.slug);
            setCategoryId(target.category_id || '');
            setClient(target.client || '');
            setDate(target.date || '');
            setShortDescription(target.short_description || '');
            setFullDescription(target.full_description || '');
            setChallenge(target.challenge || '');
            setSolution(target.solution || '');
            setResults(target.results || '');
            setTechnologiesText(target.technologies.join(', '));
            setTagsText(target.tags.join(', '));
            setHeroImage([{ url: target.hero_image, alt: target.title }]);
            setGalleryImages(
              (target.images || []).map((img) => ({
                id: img.id,
                url: img.image_url,
                alt: img.alt_text,
                sort_order: img.sort_order,
              }))
            );
            setProjectUrl(target.project_url || '');
            setGithubUrl(target.github_url || '');
            setFeatured(target.featured);
            setPublished(target.published);
            setLastSavedTime(new Date(target.updated_at).toLocaleTimeString());
          }
        }
      } catch {
        // Silently fall back to cached initial state
      } finally {
        setIsLoading(false);
        isInitialLoad.current = false;
      }
    }
    load();
  }, [projectId]);

  // Unsaved changes warning on window close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Autosave timer (debounced 10 seconds after edits)
  useEffect(() => {
    if (isInitialLoad.current || !isDirty || !projectId) return;

    const timer = setTimeout(() => {
      handleSave(published, true);
    }, 10000);

    return () => clearTimeout(timer);
  }, [
    isDirty,
    title,
    slug,
    shortDescription,
    fullDescription,
    challenge,
    solution,
    results,
    technologiesText,
  ]);

  const handleSave = async (publishStatus: boolean, isAutosave = false) => {
    if (!title.trim()) {
      if (!isAutosave) showToast('Project title is required', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const technologies = technologiesText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      const tags = tagsText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload: Partial<Project> = {
        title,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        category_id: categoryId || null,
        client,
        date,
        short_description: shortDescription,
        full_description: fullDescription,
        challenge,
        solution,
        results,
        technologies,
        tags,
        featured,
        published: publishStatus,
        hero_image: heroImage[0]?.url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      };

      const imagesPayload = galleryImages.map((img, idx) => ({
        id: img.id,
        url: img.url,
        alt: img.alt || title,
        sort_order: idx + 1,
      }));

      let savedProject: Project;
      if (projectId) {
        savedProject = await projectsService.update(projectId, payload, imagesPayload);
      } else {
        savedProject = await projectsService.create(payload, imagesPayload);
      }

      setIsDirty(false);
      setPublished(publishStatus);
      const nowStr = new Date().toLocaleTimeString();
      setLastSavedTime(nowStr);

      if (isAutosave) {
        // Subtle feedback for background autosave
      } else {
        showToast(
          publishStatus
            ? `Project published live at /projects/${savedProject.slug}`
            : 'Project draft saved successfully!',
          'success'
        );
        if (!projectId) {
          navigate(`/dashboard/projects/${savedProject.id}`);
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Save failed', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-left pb-16">
      {/* Top Bar with Autosave Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/[0.06] dark:border-white/[0.08]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard/projects')}
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {projectId ? `Edit Project: ${title || 'Untitled'}` : 'Create New Project'}
            </h1>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-400">
              {lastSavedTime ? (
                <span className="flex items-center gap-1 font-mono text-emerald-500">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Saved at {lastSavedTime}
                </span>
              ) : (
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  Unsaved draft
                </span>
              )}
              {isDirty && (
                <span className="text-amber-500 font-medium">
                  • Unsaved changes (autosaving...)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons: Save Draft, Preview, Publish */}
        <div className="flex flex-wrap items-center gap-2.5">
          {projectId && (
            <button
              type="button"
              onClick={() => navigate(`/dashboard/projects/${projectId}/preview`)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/10 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-all"
            >
              <Eye className="w-4 h-4" />
              <span>Draft Preview</span>
            </button>
          )}

          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSave(false)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-200 dark:bg-white/10 hover:bg-zinc-300 dark:hover:bg-white/15 text-xs font-semibold text-zinc-900 dark:text-white transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Save Draft</span>
          </button>

          <Button
            variant="primary"
            isLoading={isSaving}
            onClick={() => handleSave(true)}
            icon={<Sparkles className="w-4 h-4" />}
          >
            {published ? 'Update Live' : 'Publish Project'}
          </Button>
        </div>
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Core Fields */}
        <div className="lg:col-span-8 space-y-6">
          <GlassCard variant="minimal" className="p-6 sm:p-8 rounded-3xl space-y-5">
            {/* Title & Slug */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Project Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Next-Gen Financial Hub"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-sm font-semibold text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#F52F3A]/30 focus:border-[#F52F3A]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                URL Slug (/projects/:slug)
              </label>
              <input
                type="text"
                required
                placeholder="next-gen-financial-hub"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setIsDirty(true);
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs font-mono text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#F52F3A]"
              />
            </div>

            {/* Short Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Short Description (Cards & Previews)
              </label>
              <textarea
                rows={2}
                placeholder="Brief summary shown on project cards and editorial feeds..."
                value={shortDescription}
                onChange={(e) => {
                  setShortDescription(e.target.value);
                  setIsDirty(true);
                }}
                className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#F52F3A] resize-none"
              />
            </div>

            {/* Full Rich Text Case Study */}
            <RichTextEditor
              label="Full Project Description"
              description="Detailed overview of architecture, goals, and execution"
              value={fullDescription}
              onChange={(val) => {
                setFullDescription(val);
                setIsDirty(true);
              }}
              rows={6}
            />

            {/* Challenge & Solution */}
            <RichTextEditor
              label="The Challenge"
              description="What technical or design hurdles did you encounter?"
              value={challenge}
              onChange={(val) => {
                setChallenge(val);
                setIsDirty(true);
              }}
              rows={4}
            />

            <RichTextEditor
              label="The Solution & Technical Approach"
              description="How was the architecture engineered to solve the challenge?"
              value={solution}
              onChange={(val) => {
                setSolution(val);
                setIsDirty(true);
              }}
              rows={4}
            />

            <RichTextEditor
              label="Results & Impact"
              description="Measurable performance gains, metrics, or client satisfaction"
              value={results}
              onChange={(val) => {
                setResults(val);
                setIsDirty(true);
              }}
              rows={4}
            />
          </GlassCard>

          {/* Media Section: Gallery Images */}
          <GlassCard variant="minimal" className="p-6 sm:p-8 rounded-3xl space-y-4">
            <ImageUploader
              label="Project Gallery Images"
              description="Upload screenshots, visual spreads, and interface mockups. Drag to reorder."
              multiple
              value={galleryImages}
              onChange={(imgs) => {
                setGalleryImages(imgs);
                setIsDirty(true);
              }}
            />
          </GlassCard>
        </div>

        {/* Right Column: Settings & Metadata */}
        <div className="lg:col-span-4 space-y-6">
          <GlassCard variant="minimal" className="p-6 rounded-3xl space-y-5">
            {/* Category Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setIsDirty(true);
                }}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#F52F3A]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Hero Image */}
            <ImageUploader
              label="Hero Thumbnail Image *"
              description="Cinematic hero banner shown in cards and case study hero"
              value={heroImage}
              onChange={(imgs) => {
                setHeroImage(imgs);
                setIsDirty(true);
              }}
            />

            {/* Client & Date */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Client / Entity
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corp"
                  value={client}
                  onChange={(e) => {
                    setClient(e.target.value);
                    setIsDirty(true);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#F52F3A]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Date / Year
                </label>
                <input
                  type="text"
                  placeholder="2026"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setIsDirty(true);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#F52F3A]"
                />
              </div>
            </div>

            {/* Technologies */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Technologies (comma-separated)
              </label>
              <input
                type="text"
                placeholder="React 19, TypeScript, PostgreSQL"
                value={technologiesText}
                onChange={(e) => {
                  setTechnologiesText(e.target.value);
                  setIsDirty(true);
                }}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs font-mono text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#F52F3A]"
              />
            </div>

            {/* External Links */}
            <div className="space-y-3 pt-3 border-t border-black/5 dark:border-white/10">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Live Project URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={projectUrl}
                  onChange={(e) => {
                    setProjectUrl(e.target.value);
                    setIsDirty(true);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#F52F3A]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  GitHub Repository URL
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/..."
                  value={githubUrl}
                  onChange={(e) => {
                    setGithubUrl(e.target.value);
                    setIsDirty(true);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#F52F3A]"
                />
              </div>
            </div>

            {/* Featured Checkbox */}
            <div className="pt-3 border-t border-black/5 dark:border-white/10 flex items-center gap-3">
              <input
                type="checkbox"
                id="featuredCheckbox"
                checked={featured}
                onChange={(e) => {
                  setFeatured(e.target.checked);
                  setIsDirty(true);
                }}
                className="w-4 h-4 rounded text-[#F52F3A] focus:ring-[#F52F3A] cursor-pointer"
              />
              <label htmlFor="featuredCheckbox" className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 cursor-pointer">
                Highlight on Homepage (Featured)
              </label>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
