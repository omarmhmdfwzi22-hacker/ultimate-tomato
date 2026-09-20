import React, { useState } from 'react';
import { useRouter } from '../../lib/router';
import { ArrowLeft, ExternalLink, Github, Calendar, Building, Sparkles, Maximize2 } from 'lucide-react';
import { Project, PublicPortfolioBundle } from '../../types/portfolio';
import { Badge } from '../../components/ui/Badge';
import { Lightbox } from '../../components/ui/Lightbox';
import { RenderRichText } from '../../components/ui/RichTextEditor';

interface ProjectDetailPageProps {
  project: Project;
  bundle: PublicPortfolioBundle;
}

export function ProjectDetailPage({ project, bundle }: ProjectDetailPageProps) {
  const { navigate } = useRouter();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Combine hero image with project gallery images for the full lightbox
  const galleryImages = [
    { url: project.hero_image, alt: `${project.title} Hero View` },
    ...(project.images || []).map((img) => ({ url: img.image_url, alt: img.alt_text || project.title })),
  ];

  const openLightboxAt = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Back Button */}
      <button
        onClick={() => navigate('/projects')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to all projects
      </button>

      {/* Case Study Header */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          {project.category && (
            <Badge variant="tomato">{project.category.name}</Badge>
          )}
          {project.featured && (
            <Badge variant="default">Featured Case Study</Badge>
          )}
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-950 dark:text-white leading-[1.1]">
          {project.title}
        </h1>

        <p className="text-base sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
          {project.short_description}
        </p>

        {/* Metadata Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08]">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1 mb-1">
              <Calendar className="w-3.5 h-3.5" /> Timeline
            </div>
            <div className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
              {project.date || '2026'}
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1 mb-1">
              <Building className="w-3.5 h-3.5" /> Client
            </div>
            <div className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
              {project.client || 'Creative Production'}
            </div>
          </div>

          <div className="col-span-2 sm:col-span-2 flex items-center justify-end gap-3">
            {project.project_url && (
              <a
                href={project.project_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F52F3A] hover:bg-[#d9232d] text-white text-xs font-semibold shadow-md shadow-[#F52F3A]/20 transition-all"
              >
                <span>Live Project</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-900 dark:text-white text-xs font-semibold transition-all"
              >
                <Github className="w-3.5 h-3.5" />
                <span>Source Code</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Cinematic Hero Media */}
      <div
        onClick={() => openLightboxAt(0)}
        className="relative aspect-[16/9] rounded-3xl overflow-hidden cursor-pointer group border border-black/10 dark:border-white/10 shadow-2xl bg-zinc-100 dark:bg-white/5"
      >
        <img
          src={project.hero_image}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-2">
            <Maximize2 className="w-4 h-4" />
            Click to view full screen
          </span>
        </div>
      </div>

      {/* Case Study Content Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-6">
        {/* Main Content Body */}
        <div className="lg:col-span-8 space-y-10 text-left">
          {project.full_description && (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
                Project Overview
              </h2>
              <RenderRichText content={project.full_description} />
            </div>
          )}

          {project.challenge && (
            <div className="space-y-3 p-6 sm:p-8 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.08]">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                The Challenge
              </h3>
              <RenderRichText content={project.challenge} />
            </div>
          )}

          {project.solution && (
            <div className="space-y-3 p-6 sm:p-8 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.08]">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                The Solution & Architectural Approach
              </h3>
              <RenderRichText content={project.solution} />
            </div>
          )}

          {project.results && (
            <div className="space-y-3 p-6 sm:p-8 rounded-2xl bg-[#F52F3A]/5 border border-[#F52F3A]/20">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#F52F3A]" />
                Key Results & Impact
              </h3>
              <RenderRichText content={project.results} />
            </div>
          )}

          {/* Interactive Image Gallery */}
          {project.images && project.images.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-black/[0.06] dark:border-white/[0.08]">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                  Project Gallery ({project.images.length} images)
                </h3>
                <span className="text-xs text-zinc-400">Click any image to expand</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {project.images.map((img, idx) => (
                  <div
                    key={img.id}
                    onClick={() => openLightboxAt(idx + 1)}
                    className="group relative aspect-video rounded-2xl overflow-hidden cursor-pointer border border-black/[0.06] dark:border-white/[0.08] shadow-md"
                  >
                    <img
                      src={img.image_url}
                      alt={img.alt_text || `Gallery image ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white">
                        <Maximize2 className="w-4 h-4" />
                      </span>
                    </div>
                    {img.alt_text && (
                      <div className="absolute bottom-2 left-2 right-2 px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-md text-[11px] text-white truncate">
                        {img.alt_text}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Sticky Column */}
        <div className="lg:col-span-4 space-y-8 text-left">
          <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-[#111111] border border-black/[0.06] dark:border-white/[0.08] space-y-6 sticky top-28">
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                Technologies & Tools
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {project.technologies.map((tech, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-mono px-3 py-1 rounded-lg bg-white dark:bg-white/5 border border-black/[0.06] dark:border-white/[0.08] text-zinc-800 dark:text-zinc-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {project.tags && project.tags.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-black/[0.06] dark:border-white/[0.08]">
                <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                  Tags & Disciplines
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-0.5 rounded-full bg-[#F52F3A]/10 text-[#F52F3A] font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.08] space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                Need a similar solution?
              </h4>
              <button
                onClick={() => navigate('/contact')}
                className="w-full py-3 rounded-xl bg-[#F52F3A] hover:bg-[#d9232d] text-white text-xs font-semibold shadow-md shadow-[#F52F3A]/20 transition-all"
              >
                Let's Discuss Your Project
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      <Lightbox
        images={galleryImages}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}
