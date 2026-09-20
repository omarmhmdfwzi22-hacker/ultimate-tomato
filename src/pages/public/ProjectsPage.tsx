import React, { useState, useMemo } from 'react';
import { useRouter } from '../../lib/router';
import { Search, ArrowUpRight, FolderGit2 } from 'lucide-react';
import { PublicPortfolioBundle } from '../../types/portfolio';
import { Badge } from '../../components/ui/Badge';

interface ProjectsPageProps {
  bundle: PublicPortfolioBundle;
}

export function ProjectsPage({ bundle }: ProjectsPageProps) {
  const { navigate } = useRouter();
  const { projects, categories } = bundle;

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter projects by category and search term
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesCategory =
        selectedCategory === 'all' || p.category_id === selectedCategory;
      const matchesSearch =
        searchQuery === '' ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.short_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.technologies.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [projects, selectedCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12">
      {/* Page Header */}
      <div className="max-w-3xl space-y-4 text-left">
        <Badge variant="tomato">Portfolio Showcase</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Selected Projects & Case Studies
        </h1>
        <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Detailed case studies across modern web applications, design systems, and creative engineering.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-6 border-b border-black/[0.06] dark:border-white/[0.08]">
        {/* Dynamic Category Pills from Database */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#F52F3A] text-white shadow-md shadow-[#F52F3A]/20'
                : 'bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            All Work ({projects.length})
          </button>
          {categories.map((cat) => {
            const count = projects.filter((p) => p.category_id === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#F52F3A] text-white shadow-md shadow-[#F52F3A]/20'
                    : 'bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Live Search Input */}
        <div className="relative min-w-[240px] sm:min-w-[280px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search projects or stack..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full bg-zinc-100 dark:bg-white/5 border border-black/[0.06] dark:border-white/[0.08] text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#F52F3A]/30 transition-all"
          />
        </div>
      </div>

      {/* Projects Grid / Empty State */}
      {filteredProjects.length === 0 ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-white/5 border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-center mx-auto text-zinc-400">
            <FolderGit2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">No projects found</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Try adjusting your search query or selecting a different category filter.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="text-xs text-[#F52F3A] font-semibold hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
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
                <div className="absolute top-4 right-4">
                  <span className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white group-hover:bg-[#F52F3A] transition-colors inline-flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>
                {project.category && (
                  <div className="absolute bottom-4 left-4">
                    <Badge variant="default" className="bg-black/60 text-white backdrop-blur-md border-transparent">
                      {project.category.name}
                    </Badge>
                  </div>
                )}
                {project.featured && (
                  <div className="absolute top-4 left-4">
                    <Badge variant="tomato">Featured</Badge>
                  </div>
                )}
              </div>

              {/* Project Info */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                    <span>{project.date || '2026'}</span>
                    <span>{project.client || 'Client Project'}</span>
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-[#F52F3A] transition-colors tracking-tight">
                    {project.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
                    {project.short_description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {project.technologies.slice(0, 4).map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
