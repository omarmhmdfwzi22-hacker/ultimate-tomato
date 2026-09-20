// ============================================================
// ULTIMATE TOMATO: Multi-Tenant Portfolio Platform Types
// ============================================================

export type UserRole = 'SUPER_ADMIN' | 'CLIENT' | 'ADMIN' | 'EDITOR';
export type ClientStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING_ONBOARDING';
export type PortfolioStatus = 'DRAFT' | 'PUBLISHED';
export type ProjectStatus = 'DRAFT' | 'PUBLISHED';
export type MessageStatus = 'UNREAD' | 'READ' | 'ARCHIVED';
export type NotificationType = 'MESSAGE' | 'PROJECT_PUBLISHED' | 'IMAGE_UPLOADED' | 'SYSTEM' | 'CLIENT_ONBOARDED';

export interface PlatformSettings {
  id: string;
  platform_name: string;
  logo_url: string;
  primary_color: string;
  support_email: string;
  maintenance_mode: boolean;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  status: ClientStatus;
  onboarding_token?: string | null;
  onboarding_completed: boolean;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Portfolio {
  id: string;
  client_id: string;
  slug: string;
  name: string;
  published: boolean;
  status: PortfolioStatus;
  custom_domain?: string | null;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  client_id?: string | null;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  portfolio_id: string;
  name: string;
  slug: string;
  description?: string;
  sort_order: number;
  visible: boolean;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectImage {
  id: string;
  project_id: string;
  image_url: string;
  alt_text?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  portfolio_id: string;
  category_id?: string | null;
  category?: Category | null;
  title: string;
  slug: string;
  short_description: string;
  full_description: string;
  client?: string;
  date?: string;
  technologies: string[];
  tags: string[];
  featured: boolean;
  published: boolean;
  hero_image: string;
  images?: ProjectImage[];
  project_url?: string;
  github_url?: string;
  challenge?: string;
  solution?: string;
  results?: string;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  portfolio_id: string;
  name: string;
  category: string;
  level: number; // 1-100
  icon?: string;
  years?: number;
  sort_order: number;
  visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface Experience {
  id: string;
  portfolio_id: string;
  company: string;
  position: string;
  location?: string;
  start_date: string;
  end_date?: string;
  current_position: boolean;
  description: string;
  technologies: string[];
  company_logo?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  portfolio_id: string;
  title: string;
  description: string;
  icon?: string;
  features: string[];
  price?: string;
  currency: string;
  cta: string;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  portfolio_id: string;
  name: string;
  role?: string;
  company?: string;
  avatar?: string;
  content: string;
  rating: number; // 1-5
  published: boolean;
  sort_order: number;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SocialLink {
  id: string;
  portfolio_id: string;
  platform: string;
  url: string;
  label?: string;
  icon?: string;
  sort_order: number;
  visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  portfolio_id: string;
  sender: string;
  email: string;
  subject?: string;
  message: string;
  status: MessageStatus;
  date: string;
}

export interface Notification {
  id: string;
  user_id?: string;
  portfolio_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface PortfolioStats {
  projects: number;
  experience_years: number;
  clients: number;
  technologies: number;
}

export interface SiteSettings {
  id: string;
  portfolio_id: string;
  title: string;
  description: string;
  logo?: string;
  favicon?: string;
  primary_color: string;
  default_theme: 'dark' | 'light' | 'system';
  seo_title?: string;
  seo_description?: string;
  og_image?: string;
  contact_email?: string;
  phone?: string;
  location?: string;
  bio: string;
  professional_title: string;
  portrait_url?: string;
  resume_url?: string;
  stats: PortfolioStats;
  custom_domain?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_email?: string;
  client_id?: string;
  portfolio_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: Record<string, any>;
  created_at: string;
}

// Complete public bundle payload
export interface PublicPortfolioBundle {
  portfolio: Portfolio;
  client: Client;
  settings: SiteSettings;
  categories: Category[];
  projects: Project[];
  skills: Skill[];
  experiences: Experience[];
  services: Service[];
  testimonials: Testimonial[];
  social_links: SocialLink[];
  platform_settings: PlatformSettings;
}

// Admin stats summary
export interface AdminDashboardStats {
  totalProjects: number;
  publishedProjects: number;
  draftProjects: number;
  skillsCount: number;
  experiencesCount: number;
  servicesCount: number;
  unreadMessagesCount: number;
  totalMessagesCount: number;
  unreadNotificationsCount: number;
}
