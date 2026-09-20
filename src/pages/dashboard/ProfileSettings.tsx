import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Save,
  Plus,
  Trash2,
  ExternalLink,
  Globe,
  Share2,
  Image as ImageIcon,
  CheckCircle,
} from 'lucide-react';
import { SiteSettings, SocialLink } from '../../types/portfolio';
import { settingsService, socialLinksService } from '../../services/cmsServices';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { ImageUploader } from '../../components/ui/ImageUploader';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import { Skeleton } from '../../components/ui/Skeletons';
import { localCMSStore } from '../../services/localCMSStore';

export function ProfileSettings() {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Settings State - initialized synchronously
  const [settings, setSettings] = useState<SiteSettings | null>(() => {
    try {
      return localCMSStore.getSiteSettings();
    } catch {
      return null;
    }
  });

  // Social Links State - initialized synchronously
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(() => {
    try {
      return localCMSStore.getSocialLinks();
    } catch {
      return [];
    }
  });
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [editingSocial, setEditingSocial] = useState<Partial<SocialLink>>({
    platform: 'github',
    url: '',
    label: '',
    visible: true,
  });
  const [deleteSocialTarget, setDeleteSocialTarget] = useState<SocialLink | null>(null);

  const loadData = async () => {
    try {
      const [siteSettings, links] = await Promise.all([
        settingsService.getPortfolioSettings(),
        socialLinksService.list(),
      ]);
      if (siteSettings) setSettings(siteSettings);
      if (links) setSocialLinks(links);
      setHasUnsavedChanges(false);
    } catch (err: any) {
      console.warn('Profile load notice:', err?.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFieldChange = (field: keyof SiteSettings, value: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [field]: value,
    });
    setHasUnsavedChanges(true);
  };

  const handleStatChange = (statField: keyof SiteSettings['stats'], value: number) => {
    if (!settings) return;
    setSettings({
      ...settings,
      stats: {
        ...settings.stats,
        [statField]: value,
      },
    });
    setHasUnsavedChanges(true);
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      const updated = await settingsService.updatePortfolioSettings({
        professional_title: settings.professional_title,
        bio: settings.bio,
        portrait_url: settings.portrait_url,
        resume_url: settings.resume_url,
        contact_email: settings.contact_email,
        phone: settings.phone,
        location: settings.location,
        stats: settings.stats,
      });
      setSettings(updated);
      setHasUnsavedChanges(false);
      showToast('Profile settings saved successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save profile settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Social Links Operations
  const handleSaveSocial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSocial.platform || !editingSocial.url) {
      showToast('Platform and URL are required', 'error');
      return;
    }

    try {
      const saved = await socialLinksService.save(editingSocial);
      if (editingSocial.id) {
        setSocialLinks((prev) => prev.map((item) => (item.id === saved.id ? saved : item)));
        showToast('Social link updated', 'success');
      } else {
        setSocialLinks((prev) => [...prev, saved]);
        showToast('Social link added', 'success');
      }
      setIsSocialModalOpen(false);
      setEditingSocial({ platform: 'github', url: '', label: '', visible: true });
    } catch (err: any) {
      showToast(err.message || 'Failed to save social link', 'error');
    }
  };

  const handleDeleteSocial = async () => {
    if (!deleteSocialTarget) return;
    try {
      await socialLinksService.delete(deleteSocialTarget.id);
      setSocialLinks((prev) => prev.filter((item) => item.id !== deleteSocialTarget.id));
      showToast('Social link removed', 'success');
      setDeleteSocialTarget(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete social link', 'error');
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 md:col-span-2 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
            <User className="w-6 h-6 text-[#F52F3A]" />
            Client Profile & Bio
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage your personal narrative, verified credentials, contact touchpoints, and social channels.
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
            onClick={handleSaveSettings}
            isLoading={isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Profile
          </Button>
        </div>
      </div>

      {/* Grid: Left Column (Portrait & Quick Info) / Right Column (Bio & Details) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Portrait and Quick Contact */}
        <div className="space-y-6">
          <GlassCard className="p-6">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#F52F3A]" />
              Client Portrait Photo
            </h2>

            <div className="space-y-4">
              <ImageUploader
                label="Portrait Photo"
                value={settings.portrait_url ? [{ url: settings.portrait_url }] : []}
                onChange={(items) => handleFieldChange('portrait_url', items[0]?.url || '')}
                maxFiles={1}
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Recommended: A high-res square photo (min 600x600px). WebP, PNG, or JPG up to 8MB.
              </p>
            </div>
          </GlassCard>

          {/* Contact Coordinates */}
          <GlassCard className="p-6 space-y-4">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#F52F3A]" />
              Contact Coordinates
            </h2>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                Contact Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={settings.contact_email || ''}
                  onChange={(e) => handleFieldChange('contact_email', e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-9 pr-4 py-2 bg-zinc-100 dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#F52F3A] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={settings.phone || ''}
                  onChange={(e) => handleFieldChange('phone', e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-9 pr-4 py-2 bg-zinc-100 dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#F52F3A] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                Location / Base
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={settings.location || ''}
                  onChange={(e) => handleFieldChange('location', e.target.value)}
                  placeholder="e.g. Cairo, Egypt / Remote"
                  className="w-full pl-9 pr-4 py-2 bg-zinc-100 dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#F52F3A] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                Resume / CV URL
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={settings.resume_url || ''}
                  onChange={(e) => handleFieldChange('resume_url', e.target.value)}
                  placeholder="https://..."
                  className="w-full pl-9 pr-4 py-2 bg-zinc-100 dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#F52F3A] transition"
                />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right: Narrative, Stats & Social Media */}
        <div className="lg:col-span-2 space-y-6">
          {/* Professional Title and Narrative */}
          <GlassCard className="p-6 space-y-4">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-[#F52F3A]" />
              Professional Persona & Narrative
            </h2>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                Professional Title / Headline
              </label>
              <input
                type="text"
                value={settings.professional_title || ''}
                onChange={(e) => handleFieldChange('professional_title', e.target.value)}
                placeholder="e.g. Full-Stack Creative Developer & Product Designer"
                className="w-full px-4 py-2 bg-zinc-100 dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#F52F3A] transition font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                Editorial Bio / About Story
              </label>
              <textarea
                rows={6}
                value={settings.bio || ''}
                onChange={(e) => handleFieldChange('bio', e.target.value)}
                placeholder="Write your professional bio here..."
                className="w-full px-4 py-3 bg-zinc-100 dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#F52F3A] transition leading-relaxed"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Supports markdown or plain text. Keep it focused on craft, passion, and verified achievements.
              </p>
            </div>
          </GlassCard>

          {/* Numerical Highlights (Stats) */}
          <GlassCard className="p-6 space-y-4">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-2">
              Numerical Highlights / Stats
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 rounded-xl bg-zinc-100 dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
                <label className="block text-xs text-zinc-500 mb-1">Projects Delivered</label>
                <input
                  type="number"
                  min={0}
                  value={settings.stats?.projects ?? 0}
                  onChange={(e) => handleStatChange('projects', parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1 text-lg font-bold bg-transparent text-zinc-900 dark:text-white border-b border-black/10 dark:border-white/10 focus:outline-none focus:border-[#F52F3A]"
                />
              </div>

              <div className="p-3 rounded-xl bg-zinc-100 dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
                <label className="block text-xs text-zinc-500 mb-1">Years Experience</label>
                <input
                  type="number"
                  min={0}
                  value={settings.stats?.experience_years ?? 0}
                  onChange={(e) => handleStatChange('experience_years', parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1 text-lg font-bold bg-transparent text-zinc-900 dark:text-white border-b border-black/10 dark:border-white/10 focus:outline-none focus:border-[#F52F3A]"
                />
              </div>

              <div className="p-3 rounded-xl bg-zinc-100 dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
                <label className="block text-xs text-zinc-500 mb-1">Happy Clients</label>
                <input
                  type="number"
                  min={0}
                  value={settings.stats?.clients ?? 0}
                  onChange={(e) => handleStatChange('clients', parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1 text-lg font-bold bg-transparent text-zinc-900 dark:text-white border-b border-black/10 dark:border-white/10 focus:outline-none focus:border-[#F52F3A]"
                />
              </div>

              <div className="p-3 rounded-xl bg-zinc-100 dark:bg-white/[0.03] border border-black/5 dark:border-white/5">
                <label className="block text-xs text-zinc-500 mb-1">Tech Mastered</label>
                <input
                  type="number"
                  min={0}
                  value={settings.stats?.technologies ?? 0}
                  onChange={(e) => handleStatChange('technologies', parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1 text-lg font-bold bg-transparent text-zinc-900 dark:text-white border-b border-black/10 dark:border-white/10 focus:outline-none focus:border-[#F52F3A]"
                />
              </div>
            </div>
          </GlassCard>

          {/* Social Links Manager */}
          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-[#F52F3A]" />
                  Social & Web Presences
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Links displayed in the public header, hero, and footer.
                </p>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setEditingSocial({ platform: 'github', url: '', label: '', visible: true });
                  setIsSocialModalOpen(true);
                }}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Link
              </Button>
            </div>

            {socialLinks.length === 0 ? (
              <div className="text-center py-6 text-xs text-zinc-500">
                No social links added yet. Click &quot;Add Link&quot; to link your GitHub, LinkedIn, Facebook, or portfolio sites.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {socialLinks.map((link) => (
                  <div
                    key={link.id}
                    className="p-3 rounded-xl bg-zinc-100/80 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 flex items-center justify-between gap-3 hover:border-black/10 dark:hover:border-white/10 transition"
                  >
                    <div className="min-w-0 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-white dark:bg-white/[0.06] border border-black/5 dark:border-white/5 flex items-center justify-center shrink-0">
                        <Globe className="w-3.5 h-3.5 text-[#F52F3A]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-zinc-900 dark:text-white capitalize">
                          {link.platform}
                        </p>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-zinc-500 hover:text-[#F52F3A] truncate block"
                        >
                          {link.url}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setEditingSocial(link);
                          setIsSocialModalOpen(true);
                        }}
                        className="p-1 text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition"
                        title="Edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteSocialTarget(link)}
                        className="p-1 text-xs text-zinc-400 hover:text-red-500 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* Social Link Modal */}
      <Modal
        isOpen={isSocialModalOpen}
        onClose={() => setIsSocialModalOpen(false)}
        title={editingSocial.id ? 'Edit Social Link' : 'Add Social Link'}
      >
        <form onSubmit={handleSaveSocial} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
              Platform
            </label>
            <select
              value={editingSocial.platform || 'github'}
              onChange={(e) => setEditingSocial({ ...editingSocial, platform: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-100 dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#F52F3A]"
            >
              <option value="facebook">Facebook (Verified)</option>
              <option value="github">GitHub</option>
              <option value="linkedin">LinkedIn</option>
              <option value="twitter">Twitter / X</option>
              <option value="instagram">Instagram</option>
              <option value="youtube">YouTube</option>
              <option value="dribbble">Dribbble</option>
              <option value="behance">Behance</option>
              <option value="website">Personal Website</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
              Profile / Account URL
            </label>
            <input
              type="url"
              required
              placeholder="https://facebook.com/..."
              value={editingSocial.url || ''}
              onChange={(e) => setEditingSocial({ ...editingSocial, url: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-100 dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#F52F3A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
              Display Label (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Follow on Facebook"
              value={editingSocial.label || ''}
              onChange={(e) => setEditingSocial({ ...editingSocial, label: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-100 dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#F52F3A]"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="socialVisible"
              checked={editingSocial.visible !== false}
              onChange={(e) => setEditingSocial({ ...editingSocial, visible: e.target.checked })}
              className="rounded text-[#F52F3A] focus:ring-[#F52F3A]"
            />
            <label htmlFor="socialVisible" className="text-xs text-zinc-700 dark:text-zinc-300">
              Visible on public portfolio
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-black/5 dark:border-white/5">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsSocialModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Link
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Social Link Confirm */}
      <ConfirmDialog
        isOpen={!!deleteSocialTarget}
        title="Remove Social Link"
        message={`Are you sure you want to remove ${deleteSocialTarget?.platform}?`}
        confirmText="Remove"
        variant="danger"
        onConfirm={handleDeleteSocial}
        onCancel={() => setDeleteSocialTarget(null)}
      />
    </div>
  );
}
