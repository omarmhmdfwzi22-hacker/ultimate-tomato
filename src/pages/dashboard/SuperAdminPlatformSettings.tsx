import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Save,
  Mail,
  Shield,
  Palette,
  AlertTriangle,
  Image as ImageIcon,
  CheckCircle,
} from 'lucide-react';
import { PlatformSettings } from '../../types/portfolio';
import { settingsService } from '../../services/cmsServices';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { ImageUploader } from '../../components/ui/ImageUploader';
import { useToast } from '../../components/ui/Toast';
import { Skeleton } from '../../components/ui/Skeletons';

export function SuperAdminPlatformSettings() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const data = await settingsService.getPlatformSettings();
      setSettings(data);
      setHasUnsavedChanges(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to load platform settings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleFieldChange = (field: keyof PlatformSettings, value: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [field]: value,
    });
    setHasUnsavedChanges(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setIsSaving(true);
    try {
      const updated = await settingsService.updatePlatformSettings({
        platform_name: settings.platform_name,
        logo_url: settings.logo_url,
        primary_color: settings.primary_color,
        support_email: settings.support_email,
        maintenance_mode: settings.maintenance_mode,
      });
      setSettings(updated);
      setHasUnsavedChanges(false);
      showToast('Ultimate Tomato platform settings updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update platform settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
            <Sliders className="w-6 h-6 text-[#F52F3A]" />
            Platform Core & Agency Config
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Global agency settings for the Ultimate Tomato multi-tenant SaaS architecture.
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
            Save Platform Core
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Brand Information */}
        <GlassCard className="p-6 space-y-4">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#F52F3A]" />
            Agency Brand & Company Identity
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                Platform Name
              </label>
              <input
                type="text"
                required
                value={settings.platform_name}
                onChange={(e) => handleFieldChange('platform_name', e.target.value)}
                placeholder="ULTIMATE TOMATO"
                className="w-full px-4 py-2 bg-zinc-100 dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#F52F3A] transition font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                Agency Support Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={settings.support_email}
                  onChange={(e) => handleFieldChange('support_email', e.target.value)}
                  placeholder="support@ultimatetomato.com"
                  className="w-full pl-9 pr-4 py-2 bg-zinc-100 dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#F52F3A] transition"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
              Official Platform Logo
            </label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-black/50 border border-black/10 dark:border-white/10 flex items-center justify-center p-2 shrink-0">
                <img
                  src={settings.logo_url || '/assets/ultimate-tomato-logo.png'}
                  alt="Ultimate Tomato Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={settings.logo_url}
                  onChange={(e) => handleFieldChange('logo_url', e.target.value)}
                  placeholder="/assets/ultimate-tomato-logo.png"
                  className="w-full px-3 py-2 bg-zinc-100 dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-xs font-mono focus:outline-none focus:border-[#F52F3A]"
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  Path or CDN URL to the official tomato image logo.
                </p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Global Accent & Appearance */}
        <GlassCard className="p-6 space-y-4">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#F52F3A]" />
            Default Global Accent Color
          </h2>

          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl border border-black/10 dark:border-white/20 shrink-0"
              style={{ backgroundColor: settings.primary_color || '#F52F3A' }}
            />
            <input
              type="text"
              value={settings.primary_color || '#F52F3A'}
              onChange={(e) => handleFieldChange('primary_color', e.target.value)}
              className="px-3 py-2 bg-zinc-100 dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm font-mono w-32 focus:outline-none focus:border-[#F52F3A]"
            />
            <span className="text-xs text-zinc-500">
              Default: #F52F3A (Official Tomato Red)
            </span>
          </div>
        </GlassCard>

        {/* Maintenance Mode Toggle */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                  Platform Maintenance Mode
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5 max-w-lg">
                  When enabled, public visitors will see an Ultimate Tomato maintenance screen. Super Admins will retain full dashboard access.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenance_mode}
                onChange={(e) => handleFieldChange('maintenance_mode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F52F3A]"></div>
            </label>
          </div>
        </GlassCard>
      </form>
    </div>
  );
}
