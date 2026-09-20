import React, { useEffect, useState } from 'react';
import { testimonialsService } from '../../services/cmsServices';
import { Testimonial } from '../../types/portfolio';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { Plus, Edit2, Trash2, Star, Quote } from 'lucide-react';

export function TestimonialsManager() {
  const { showToast } = useToast();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [published, setPublished] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const data = await testimonialsService.list();
      setTestimonials(data);
    } catch {
      showToast('Failed to load testimonials', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setName('');
    setRole('');
    setCompany('');
    setContent('');
    setRating(5);
    setPublished(true);
    setModalOpen(true);
  };

  const openEditModal = (item: Testimonial) => {
    setEditingItem(item);
    setName(item.name);
    setRole(item.role || '');
    setCompany(item.company || '');
    setContent(item.content);
    setRating(item.rating || 5);
    setPublished(item.published);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const payload: Partial<Testimonial> = {
        name,
        role,
        company,
        content,
        rating,
        published,
      };
      if (editingItem) {
        payload.id = editingItem.id;
      }

      const saved = await testimonialsService.save(payload);
      if (editingItem) {
        setTestimonials((prev) => prev.map((t) => (t.id === saved.id ? saved : t)));
        showToast('Testimonial updated!', 'success');
      } else {
        setTestimonials((prev) => [...prev, saved]);
        showToast('Testimonial created!', 'success');
      }
      setModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await testimonialsService.softDelete(id);
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
      showToast('Testimonial soft-deleted.', 'success');
    } catch {
      showToast('Failed to delete testimonial', 'error');
    }
  };

  return (
    <div className="space-y-8 text-left max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Client Testimonials
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage feedback and recommendations displayed on your portfolio.
          </p>
        </div>

        <Button variant="primary" onClick={openCreateModal} icon={<Plus className="w-4 h-4" />}>
          Add Testimonial
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-zinc-400 bg-white dark:bg-[#111111] rounded-2xl border border-black/10 dark:border-white/10">
            No testimonials recorded. Click "+ Add Testimonial" to create one.
          </div>
        ) : (
          testimonials.map((item) => (
            <GlassCard key={item.id} variant="minimal" className="p-6 rounded-2xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${item.published ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-200 text-zinc-500'}`}>
                    {item.published ? 'PUBLISHED' : 'DRAFT'}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 italic leading-relaxed">
                  "{item.content}"
                </p>

                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    {item.role} {item.company ? `at ${item.company}` : ''}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(item)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-xs font-semibold text-zinc-900 dark:text-white"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </GlassCard>
          ))
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Edit Testimonial' : 'Add Testimonial'}
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4 text-left">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Author Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Marc Vance"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#F52F3A]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Company / Organization
              </label>
              <input
                type="text"
                placeholder="e.g. HyperShift Labs"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#F52F3A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Role / Title
              </label>
              <input
                type="text"
                placeholder="e.g. Founder & CEO"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#F52F3A]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Rating (1 - 5 Stars)
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={rating}
                onChange={(e) => setRating(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#F52F3A]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Testimonial Content *
            </label>
            <textarea
              required
              rows={4}
              placeholder="What did the client say about your work and partnership?..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#F52F3A]"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="publishedTestimonialCheck"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="w-4 h-4 rounded text-[#F52F3A] focus:ring-[#F52F3A] cursor-pointer"
            />
            <label htmlFor="publishedTestimonialCheck" className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 cursor-pointer">
              Published on public portfolio
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-black/5 dark:border-white/10">
            <Button variant="outline" size="sm" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              {editingItem ? 'Update' : 'Save Testimonial'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
