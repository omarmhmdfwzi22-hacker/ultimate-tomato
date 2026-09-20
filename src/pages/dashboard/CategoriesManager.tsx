import React, { useEffect, useState } from 'react';
import { categoriesService } from '../../services/cmsServices';
import { Category } from '../../types/portfolio';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import { Plus, Edit2, Trash2, Tag, Eye, EyeOff } from 'lucide-react';
import { localCMSStore } from '../../services/localCMSStore';

export function CategoriesManager() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>(() => localCMSStore.getCategories());
  const [isLoading, setIsLoading] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [visible, setVisible] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Soft delete state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const data = await categoriesService.list();
      if (data) setCategories(data);
    } catch {
      // Silently fall back to local store
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setVisible(true);
    setModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setVisible(cat.visible);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        const updated = await categoriesService.update(editingCategory.id, {
          name,
          slug: slug || name.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
          description,
          visible,
        });
        setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        showToast('Category updated successfully!', 'success');
      } else {
        const created = await categoriesService.create({
          name,
          slug: slug || name.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
          description,
          visible,
        });
        setCategories((prev) => [...prev, created]);
        showToast('Category created successfully!', 'success');
      }
      setModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await categoriesService.softDelete(deleteId);
      setCategories((prev) => prev.filter((c) => c.id !== deleteId));
      showToast('Category soft-deleted.', 'success');
      setDeleteId(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete category', 'error');
    }
  };

  return (
    <div className="space-y-8 text-left max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Project Categories
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Database-driven taxonomies used to categorize projects and power the public showcase filters.
          </p>
        </div>

        <Button variant="primary" onClick={openCreateModal} icon={<Plus className="w-4 h-4" />}>
          Add Category
        </Button>
      </div>

      <GlassCard variant="minimal" className="rounded-2xl overflow-hidden border border-black/10 dark:border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/5 dark:border-white/10 text-zinc-400 font-mono uppercase tracking-wider">
              <tr>
                <th className="px-5 py-4 font-semibold">Category Name</th>
                <th className="px-5 py-4 font-semibold">Slug</th>
                <th className="px-5 py-4 font-semibold">Visibility</th>
                <th className="px-5 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-zinc-400">
                    No categories defined. Click "+ Add Category" to create your first one.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <Tag className="w-4 h-4 text-[#F52F3A]" />
                        <div>
                          <span className="font-bold text-zinc-900 dark:text-white text-sm block">
                            {cat.name}
                          </span>
                          {cat.description && (
                            <span className="text-[11px] text-zinc-400">
                              {cat.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-zinc-500">
                      /{cat.slug}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 font-medium ${cat.visible ? 'text-emerald-500' : 'text-zinc-400'}`}>
                        {cat.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        {cat.visible ? 'Visible' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(cat.id)}
                          className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg"
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

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Category Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Design Systems"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!editingCategory) {
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
                }
              }}
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#F52F3A]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Slug
            </label>
            <input
              type="text"
              required
              placeholder="design-systems"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#F52F3A]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Short Description
            </label>
            <textarea
              rows={2}
              placeholder="Brief description of this category..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#F52F3A] resize-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="visibleCheck"
              checked={visible}
              onChange={(e) => setVisible(e.target.checked)}
              className="w-4 h-4 rounded text-[#F52F3A] focus:ring-[#F52F3A] cursor-pointer"
            />
            <label htmlFor="visibleCheck" className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 cursor-pointer">
              Visible on public filters
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-black/5 dark:border-white/10">
            <Button variant="outline" size="sm" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              {editingCategory ? 'Update Category' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Soft Delete Confirm Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Category?"
        message="This category will be archived. Associated projects will remain safe."
      />
    </div>
  );
}
