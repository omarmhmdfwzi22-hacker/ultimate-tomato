import React, { useEffect, useState } from 'react';
import { servicesService } from '../../services/cmsServices';
import { Service } from '../../types/portfolio';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { Plus, Edit2, Trash2, Layers, Check } from 'lucide-react';

export function ServicesManager() {
  const { showToast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Service | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [cta, setCta] = useState('Get in Touch');
  const [featuresText, setFeaturesText] = useState('');
  const [active, setActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const data = await servicesService.list();
      setServices(data);
    } catch {
      showToast('Failed to load services', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setTitle('');
    setDescription('');
    setPrice('');
    setCta('Get in Touch');
    setFeaturesText('');
    setActive(true);
    setModalOpen(true);
  };

  const openEditModal = (item: Service) => {
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description);
    setPrice(item.price || '');
    setCta(item.cta || 'Get in Touch');
    setFeaturesText((item.features || []).join('\n'));
    setActive(item.active);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const features = featuresText
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean);

      const payload: Partial<Service> = {
        title,
        description,
        price,
        cta,
        features,
        active,
      };
      if (editingItem) {
        payload.id = editingItem.id;
      }

      const saved = await servicesService.save(payload);
      if (editingItem) {
        setServices((prev) => prev.map((s) => (s.id === saved.id ? saved : s)));
        showToast('Service updated successfully!', 'success');
      } else {
        setServices((prev) => [...prev, saved]);
        showToast('Service created successfully!', 'success');
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
      await servicesService.delete(id);
      setServices((prev) => prev.filter((s) => s.id !== id));
      showToast('Service removed.', 'success');
    } catch {
      showToast('Failed to delete service', 'error');
    }
  };

  return (
    <div className="space-y-8 text-left max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Services & Offerings
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Define your client packages, deliverables, and call-to-action triggers.
          </p>
        </div>

        <Button variant="primary" onClick={openCreateModal} icon={<Plus className="w-4 h-4" />}>
          Add Service
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-zinc-400 bg-white dark:bg-[#111111] rounded-2xl border border-black/10 dark:border-white/10">
            No services configured yet. Click "+ Add Service" to add an offering.
          </div>
        ) : (
          services.map((item) => (
            <GlassCard key={item.id} variant="minimal" className="p-6 rounded-2xl flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                    {item.title}
                  </h3>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${item.active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-200 text-zinc-500'}`}>
                    {item.active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>

                {item.price && (
                  <p className="text-xs font-mono font-bold text-[#F52F3A]">
                    {item.price}
                  </p>
                )}

                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {item.description}
                </p>

                {item.features && item.features.length > 0 && (
                  <ul className="space-y-1.5 pt-3 border-t border-black/5 dark:border-white/10">
                    {item.features.map((f, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-zinc-500">
                        <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                )}
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
        title={editingItem ? 'Edit Service' : 'Add New Service'}
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Service Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Design Systems & Architecture"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#F52F3A]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Pricing Note (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. From $1,500 or Retainer"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#F52F3A]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Summary of scope and deliverables..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#F52F3A]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Features (one per line)
            </label>
            <textarea
              rows={4}
              placeholder="React 19 & TypeScript&#10;Sub-second page speeds&#10;Dark & Light mode parity"
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#F52F3A]"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="activeServiceCheck"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="w-4 h-4 rounded text-[#F52F3A] focus:ring-[#F52F3A] cursor-pointer"
            />
            <label htmlFor="activeServiceCheck" className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 cursor-pointer">
              Active & visible on public portfolio
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-black/5 dark:border-white/10">
            <Button variant="outline" size="sm" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              {editingItem ? 'Update' : 'Create Service'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
