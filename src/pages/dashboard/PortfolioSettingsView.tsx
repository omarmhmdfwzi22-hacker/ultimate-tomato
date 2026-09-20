import React, { useState, useEffect } from 'react';
import {
  Settings,
  Palette,
  Globe,
  Share2,
  Save,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { SiteSettings, Portfolio } from '../../types/portfolio';
import { settingsService } from '../../services/cmsServices';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { ImageUploader } from '../../components/ui/ImageUploader';
import { useToast } from '../../components/ui/Toast';
import { Skeleton } from '../../components/ui/Skeletons';

const COLOR_PRESETS = [
  { name: 'Tomato Red (Official)', hex: '#F52F3A' },
  { name: 'Electric Violet', hex: '#8B5CF6' },
  { name: 'Cyber Cyan', hex: '#06B6D4' },
  { name: 'Emerald Green', hex: '#10B981' },
  { name: 'Amber Gold', hex: '#F59E0B' },
  { name: 'Rose Pink', hex: '#EC4899' },
];

export function PortfolioSettingsView() {
  const { portfolio } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [settings, setSettings] = useState<SiteSettings | null>(null);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const data = await settingsService.getPortfolioSettings();
      setSettings(data);
      setHasUnsavedChanges(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to load portfolio settings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [portfolio?.id]);

  const handleFieldChange = (field: keyof SiteSettings, value: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [field]: value,
    });
    setHasUnsavedChanges(true);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!settings) return;

    setIsSaving(true);
    try {
      const updated = await settingsService.updatePortfolioSettings({
        title: settings.title,
        description: settings.description,
        primary_color: settings.primary_color || '#F52F3A',
        default_theme: settings.default_theme || 'dark',
        seo_title: settings.seo_title,
        seo_description: settings.seo_description,
        og_image: settings.og_image,
        logo: settings.logo,
        favicon: settings.favicon,
        custom_domain: settings.custom_domain,
      });
      setSettings(updated);
      setHasUnsavedChanges(false);
      showToast('Portfolio configuration saved successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  const publicUrl = portfolio?.slug ? `/portfolio/${portfolio.slug}` : '/';

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
            <Settings className="w-6 h-6 text-[#F52F3A]" />
            Portfolio Branding & Identity
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Configure metadata, accent colors, theme defaults, SEO tags, and custom domain routing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <span className="text-xs text-amber-500 font-medium animate-pulse">
              Unsaved changes
            </span>
          )}
          <Button
            variant="primary"
            onClick={handleSave}
            isLoading={isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Identity & General */}
        <GlassCard className="p-6 space-y-4">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#F52F3A]" />
            Core Presentation
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                Site Title
              </label>
              <input
                type="text"
                required
                value={settings.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="e.g. Omar Mohamed Fawzi — Portfolio"
                className="w-full px-4 py-2 bg-zinc-100 dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#F52F3A] transition font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                Public URL Path
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  disabled
                  value={publicUrl}
                  className="w-full px-4 py-2 bg-zinc-200/60 dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-xl text-sm text-zinc-500 font-mono"
                />
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl border border-black/10 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition"
                  title="Open live portfolio"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
              Tagline / Headline Description
            </label>
            <textarea
              rows={2}
              value={settings.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="A brief high-impact summary displayed across search results and header..."
              className="w-full px-4 py-2 bg-zinc-100 dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#F52F3A] transition"
            />
          </div>
        </GlassCard>

        {/* Visual Theming & Brand Color */}
        <GlassCard className="p-6 space-y-4">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#F52F3A]" />
            Visual Identity & Palette
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Primary Accent Color */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Primary Brand Accent
              </label>
              
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl border border-black/10 dark:border-white/20 shrink-0 shadow-inner"
                  style={{ backgroundColor: settings.primary_color || '#F52F3A' }}
                />
                <input
                  type="text"
                  value={settings.primary_color || '#F52F3A'}
                  onChange={(e) => handleFieldChange('primary_color', e.target.value)}
                  className="px-3 py-2 bg-zinc-100 dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm font-mono w-32 focus:outline-none focus:border-[#F52F3A]"
                />
              </div>

              {/* Color Presets */}
              <div className="flex flex-wrap gap-2 pt-1">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => handleFieldChange('primary_color', preset.hex)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-zinc-100 dark:bg-white/[0.04] border border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20 transition"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: preset.hex }}
                    />
                    <span className="text-zinc-600 dark:text-zinc-300">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Default Theme Selector */}
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                Default Theme Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['dark', 'light', 'system'] as const).map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => handleFieldChange('default_theme', theme)}
                    className={`py-3 px-2 rounded-xl text-xs font-semibold border transition text-center capitalize ${
                      settings.default_theme === theme
                        ? 'border-[#F52F3A] bg-[#F52F3A]/10 text-[#F52F3A]'
                        : 'border-black/10 dark:border-white/10 bg-zinc-100 dark:bg-white/[0.04] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    {theme}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-zinc-500 mt-2">
                Visitors can still toggle between light and dark anytime via the navbar switch.
              </p>
            </div>
          </div>
        </GlassCard>

        {/* SEO & Meta Sharing */}
        <GlassCard className="p-6 space-y-4">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
            <Share2 className="w-4 h-4 text-[#F52F3A]" />
            Search Engines & Social Previews (SEO)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                SEO Meta Title
              </label>
              <input
                type="text"
                value={settings.seo_title || ''}
                onChange={(e) => handleFieldChange('seo_title', e.target.value)}
                placeholder="Omar Mohamed Fawzi | Full-Stack & UI/UX"
                className="w-full px-4 py-2 bg-zinc-100 dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#F52F3A] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                Custom Domain (Optional)
              </label>
              <input
                type="text"
                value={settings.custom_domain || ''}
                onChange={(e) => handleFieldChange('custom_domain', e.target.value)}
                placeholder="portfolio.yourdomain.com"
                className="w-full px-4 py-2 bg-zinc-100 dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#F52F3A] transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
              SEO Meta Description
            </label>
            <textarea
              rows={3}
              value={settings.seo_description || ''}
              onChange={(e) => handleFieldChange('seo_description', e.target.value)}
              placeholder="Concise overview of skills, projects, and offerings for Google indexation..."
              className="w-full px-4 py-2 bg-zinc-100 dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#F52F3A] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
              Social Sharing Banner (OpenGraph Image)
            </label>
            <ImageUploader
              label="Social Sharing Banner"
              value={settings.og_image ? [{ url: settings.og_image }] : []}
              onChange={(items) => handleFieldChange('og_image', items[0]?.url || '')}
              maxFiles={1}
            />
            <p className="text-[11px] text-zinc-500 mt-1">
              Standard 1200x630px image displayed when your link is shared on Facebook, X, or LinkedIn.
            </p>
          </div>
        </GlassCard>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Portfolio Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
