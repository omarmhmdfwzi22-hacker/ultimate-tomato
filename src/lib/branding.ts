/**
 * Ultimate Tomato Dynamic Brand & Theme Engine
 * Ensures custom accent colors (like Amber Gold #F59E0B) and default theme modes (light/dark)
 * apply dynamically across the entire application in real-time.
 */

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export function hexToRgb(hexInput: string): RgbColor {
  if (!hexInput) return { r: 245, g: 47, b: 58 };
  let hex = hexInput.replace('#', '').trim();
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  if (hex.length !== 6) return { r: 245, g: 47, b: 58 };

  const num = parseInt(hex, 16);
  if (isNaN(num)) return { r: 245, g: 47, b: 58 };

  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function shadeColor(hex: string, percent: number): string {
  const { r, g, b } = hexToRgb(hex);
  const factor = 1 + percent / 100;
  const newR = Math.max(0, Math.min(255, Math.round(r * factor)));
  const newG = Math.max(0, Math.min(255, Math.round(g * factor)));
  const newB = Math.max(0, Math.min(255, Math.round(b * factor)));
  return `#${((1 << 24) + (newR << 16) + (newG << 8) + newB).toString(16).slice(1)}`;
}

export function generateBrandCSS(primaryHex: string): string {
  const rgb = hexToRgb(primaryHex);
  const rgbStr = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
  const hoverHex = shadeColor(primaryHex, -12);
  const activeHex = shadeColor(primaryHex, -20);

  return `
:root {
  --primary-brand: ${primaryHex};
  --primary-brand-rgb: ${rgbStr};
  --primary-brand-hover: ${hoverHex};
  --primary-brand-active: ${activeHex};
  --primary: ${primaryHex};
}

/* Base Utility Overrides for #F52F3A */
.text-\\[\\#F52F3A\\], [class*="text-[#F52F3A]"] {
  color: var(--primary-brand) !important;
}

.bg-\\[\\#F52F3A\\], [class*="bg-[#F52F3A]"]:not([class*="/"]) {
  background-color: var(--primary-brand) !important;
}

.border-\\[\\#F52F3A\\], [class*="border-[#F52F3A]"]:not([class*="/"]) {
  border-color: var(--primary-brand) !important;
}

/* Opacity Background Overrides */
.bg-\\[\\#F52F3A\\]\\/5, [class*="bg-[#F52F3A]/5"] {
  background-color: rgba(var(--primary-brand-rgb), 0.05) !important;
}
.bg-\\[\\#F52F3A\\]\\/10, [class*="bg-[#F52F3A]/10"] {
  background-color: rgba(var(--primary-brand-rgb), 0.10) !important;
}
.bg-\\[\\#F52F3A\\]\\/20, [class*="bg-[#F52F3A]/20"] {
  background-color: rgba(var(--primary-brand-rgb), 0.20) !important;
}

/* Opacity Border Overrides */
.border-\\[\\#F52F3A\\]\\/20, [class*="border-[#F52F3A]/20"] {
  border-color: rgba(var(--primary-brand-rgb), 0.20) !important;
}
.border-\\[\\#F52F3A\\]\\/25, [class*="border-[#F52F3A]/25"] {
  border-color: rgba(var(--primary-brand-rgb), 0.25) !important;
}
.border-\\[\\#F52F3A\\]\\/30, [class*="border-[#F52F3A]/30"] {
  border-color: rgba(var(--primary-brand-rgb), 0.30) !important;
}

/* Hover Overrides */
.hover\\:bg-\\[\\#F52F3A\\]:hover, [class*="hover:bg-[#F52F3A]"]:hover:not([class*="/"]) {
  background-color: var(--primary-brand) !important;
}
.hover\\:bg-\\[\\#F52F3A\\]\\/10:hover, [class*="hover:bg-[#F52F3A]/10"]:hover {
  background-color: rgba(var(--primary-brand-rgb), 0.10) !important;
}
.hover\\:bg-\\[\\#d9232d\\]:hover {
  background-color: var(--primary-brand-hover) !important;
}
.hover\\:text-\\[\\#F52F3A\\]:hover, [class*="hover:text-[#F52F3A]"]:hover {
  color: var(--primary-brand) !important;
}
.hover\\:border-\\[\\#F52F3A\\]:hover, [class*="hover:border-[#F52F3A]"]:hover:not([class*="/"]) {
  border-color: var(--primary-brand) !important;
}
.hover\\:border-\\[\\#F52F3A\\]\\/30:hover, [class*="hover:border-[#F52F3A]/30"]:hover {
  border-color: rgba(var(--primary-brand-rgb), 0.30) !important;
}
.hover\\:border-\\[\\#F52F3A\\]\\/40:hover, [class*="hover:border-[#F52F3A]/40"]:hover {
  border-color: rgba(var(--primary-brand-rgb), 0.40) !important;
}

/* Group Hover Overrides */
.group:hover .group-hover\\:text-\\[\\#F52F3A\\], [class*="group"]:hover [class*="group-hover:text-[#F52F3A]"] {
  color: var(--primary-brand) !important;
}
.group:hover .group-hover\\:bg-\\[\\#F52F3A\\], [class*="group"]:hover [class*="group-hover:bg-[#F52F3A]"] {
  background-color: var(--primary-brand) !important;
}

/* Focus and Ring States */
.focus\\:border-\\[\\#F52F3A\\]:focus, [class*="focus:border-[#F52F3A]"]:focus,
.focus-within\\:border-\\[\\#F52F3A\\]:focus-within, [class*="focus-within:border-[#F52F3A]"]:focus-within {
  border-color: var(--primary-brand) !important;
}
.focus\\:ring-\\[\\#F52F3A\\]:focus, [class*="focus:ring-[#F52F3A]"]:focus,
.focus-visible\\:ring-\\[\\#F52F3A\\]:focus-visible, [class*="focus-visible:ring-[#F52F3A]"]:focus-visible,
.ring-\\[\\#F52F3A\\], [class*="ring-[#F52F3A]"] {
  --tw-ring-color: var(--primary-brand) !important;
}
.focus\\:ring-\\[\\#F52F3A\\]\\/30:focus, [class*="focus:ring-[#F52F3A]/30"]:focus,
.focus-within\\:ring-\\[\\#F52F3A\\]\\/30:focus-within, [class*="focus-within:ring-[#F52F3A]/30"]:focus-within {
  --tw-ring-color: rgba(var(--primary-brand-rgb), 0.30) !important;
}

/* Shadows */
.shadow-\\[\\#F52F3A\\], [class*="shadow-[#F52F3A]"]:not([class*="/"]) {
  --tw-shadow-color: rgba(var(--primary-brand-rgb), 0.25) !important;
}
.shadow-\\[\\#F52F3A\\]\\/20, [class*="shadow-[#F52F3A]/20"] {
  --tw-shadow-color: rgba(var(--primary-brand-rgb), 0.20) !important;
  box-shadow: 0 10px 25px -5px rgba(var(--primary-brand-rgb), 0.20), 0 8px 10px -6px rgba(var(--primary-brand-rgb), 0.20) !important;
}
.shadow-\\[\\#F52F3A\\]\\/25, [class*="shadow-[#F52F3A]/25"] {
  --tw-shadow-color: rgba(var(--primary-brand-rgb), 0.25) !important;
  box-shadow: 0 12px 30px -5px rgba(var(--primary-brand-rgb), 0.25) !important;
}
.shadow-\\[\\#F52F3A\\]\\/5, [class*="shadow-[#F52F3A]/5"],
.hover\\:shadow-\\[\\#F52F3A\\]\\/5:hover, [class*="hover:shadow-[#F52F3A]/5"]:hover {
  box-shadow: 0 10px 25px -5px rgba(var(--primary-brand-rgb), 0.08) !important;
}
.hover\\:shadow-\\[\\#F52F3A\\]\\/40:hover, [class*="hover:shadow-[#F52F3A]/40"]:hover {
  box-shadow: 0 15px 35px -5px rgba(var(--primary-brand-rgb), 0.40) !important;
}

/* Gradients */
.via-\\[\\#F52F3A\\], [class*="via-[#F52F3A]"], .dark\\:via-\\[\\#F52F3A\\] {
  --tw-gradient-stops: var(--tw-gradient-from), var(--primary-brand) var(--tw-gradient-via-position), var(--tw-gradient-to) !important;
}

/* Selection */
::selection, .selection\\:bg-\\[\\#F52F3A\\]\\/20::selection {
  background-color: rgba(var(--primary-brand-rgb), 0.25) !important;
  color: var(--primary-brand) !important;
}
`;
}

/**
 * Applies primary brand color to the live DOM immediately
 */
export function applyBrandColor(hex: string) {
  if (typeof window === 'undefined') return;
  const validHex = hex && /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex : (hex && /^#[0-9A-Fa-f]{3}$/.test(hex) ? hex : '#F52F3A');
  const rgb = hexToRgb(validHex);
  const rgbStr = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
  const hoverHex = shadeColor(validHex, -12);
  const activeHex = shadeColor(validHex, -20);

  const root = document.documentElement;
  root.style.setProperty('--primary-brand', validHex);
  root.style.setProperty('--primary-brand-rgb', rgbStr);
  root.style.setProperty('--primary-brand-hover', hoverHex);
  root.style.setProperty('--primary-brand-active', activeHex);
  root.style.setProperty('--primary', validHex);

  // Update or inject dynamic stylesheet
  let styleEl = document.getElementById('ut-dynamic-brand-style') as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'ut-dynamic-brand-style';
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = generateBrandCSS(validHex);

  // Dispatch broadcast event for listeners
  window.dispatchEvent(new CustomEvent('ut_branding_changed', { detail: { primary_color: validHex } }));
}

/**
 * Applies theme (dark | light | system) to the live DOM immediately
 */
export function applyDefaultTheme(theme: 'dark' | 'light' | 'system') {
  if (typeof window === 'undefined') return;

  let resolved: 'dark' | 'light' = 'dark';
  if (theme === 'system') {
    resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } else {
    resolved = theme;
  }

  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
  }

  try {
    localStorage.setItem('ut_color_theme', theme);
  } catch {}

  // Update meta color-scheme
  let meta = document.querySelector('meta[name="color-scheme"]') as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'color-scheme';
    document.head.appendChild(meta);
  }
  meta.content = resolved;

  // Dispatch broadcast event
  window.dispatchEvent(new CustomEvent('ut_theme_changed', { detail: { theme, resolvedTheme: resolved } }));
}

/**
 * Initialize branding and theme on initial load
 */
export function initBranding() {
  if (typeof window === 'undefined') return;

  try {
    const raw = localStorage.getItem('ut_cms_site_settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.primary_color) {
        applyBrandColor(parsed.primary_color);
      }
      if (parsed.default_theme) {
        // If ut_color_theme is not explicitly set, use default_theme
        const currentTheme = localStorage.getItem('ut_color_theme');
        if (!currentTheme) {
          applyDefaultTheme(parsed.default_theme);
        } else {
          applyDefaultTheme(currentTheme as any);
        }
      }
    }
  } catch (e) {
    console.error('Failed to initialize branding from storage', e);
  }
}
