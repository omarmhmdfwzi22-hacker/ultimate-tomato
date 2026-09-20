import React, { useEffect, useState } from 'react';
import { experiencesService } from '../../services/cmsServices';
import { Experience } from '../../types/portfolio';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { Plus, Edit2, Trash2, Briefcase } from 'lucide-react';

export function ExperienceManager() {
  const { showToast } = useToast();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Experience | null>(null);

  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPosition, setCurrentPosition] = useState(false);
  const [description, setDescription] = useState('');
  const [technologiesText, setTechnologiesText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const data = await experiencesService.list();
      setExperiences(data);
    } catch {
      showToast('Failed to load career history', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setCompany('');
    setPosition('');
    setLocation('');
    setStartDate('2024');
    setEndDate('');
    setCurrentPosition(false);
    setDescription('');
    setTechnologiesText('');
    setModalOpen(true);
  };

  const openEditModal = (item: Experience) => {
    setEditingItem(item);
    setCompany(item.company);
    setPosition(item.position);
    setLocation(item.location || '');
    setStartDate(item.start_date);
    setEndDate(item.end_date || '');
    setCurrentPosition(item.current_position);
    setDescription(item.description);
    setTechnologiesText((item.technologies || []).join(', '));
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !position.trim()) return;

    setIsSubmitting(true);
    try {
      const technologies = technologiesText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload: Partial<Experience> = {
        company,
        position,
        location,
        start_date: startDate,
        end_date: currentPosition ? '' : endDate,
        current_position: currentPosition,
        description,
        technologies,
      };
      if (editingItem) {
        payload.id = editingItem.id;
      }

      const saved = await experiencesService.save(payload);
      if (editingItem) {
        setExperiences((prev) => prev.map((e) => (e.id === saved.id ? saved : e)));
        showToast('Timeline item updated!', 'success');
      } else {
        setExperiences((prev) => [...prev, saved]);
        showToast('Timeline item added!', 'success');
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
      await experiencesService.delete(id);
      setExperiences((prev) => prev.filter((e) => e.id !== id));
      showToast('Experience deleted.', 'success');
    } catch {
      showToast('Failed to delete experience', 'error');
    }
  };

  return (
    <div className="space-y-8 text-left max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Career & Experience Timeline
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage your employment, contracts, and consultancy timeline entries.
          </p>
        </div>

        <Button variant="primary" onClick={openCreateModal} icon={<Plus className="w-4 h-4" />}>
          Add Experience
        </Button>
      </div>

      <GlassCard variant="minimal" className="rounded-2xl overflow-hidden border border-black/10 dark:border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/5 dark:border-white/10 text-zinc-400 font-mono uppercase tracking-wider">
              <tr>
                <th className="px-5 py-4 font-semibold">Role & Company</th>
                <th className="px-5 py-4 font-semibold">Location</th>
                <th className="px-5 py-4 font-semibold">Period</th>
                <th className="px-5 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {experiences.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-zinc-400">
                    No experience records. Click "+ Add Experience" to insert an entry.
                  </td>
                </tr>
              ) : (
                experiences.map((exp) => (
                  <tr key={exp.id} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <span className="font-bold text-zinc-900 dark:text-white text-sm block">
                          {exp.position}
                        </span>
                        <span className="text-zinc-500 font-medium">
                          {exp.company}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-zinc-500">
                      {exp.location || 'Remote'}
                    </td>
                    <td className="px-5 py-4 font-mono text-zinc-500">
                      {exp.start_date} — {exp.current_position ? 'Present' : exp.end_date}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(exp)}
                          className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(exp.id)}
                          className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg"
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

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Edit Experience' : 'Add Experience Entry'}
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4 text-left">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Company *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ultimate Tomato Studio"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#F52F3A]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Position / Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Lead Creative Engineer"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#F52F3A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Start Year
              </label>
              <input
                type="text"
                placeholder="2024"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#F52F3A]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                End Year
              </label>
              <input
                type="text"
                disabled={currentPosition}
                placeholder="Present"
                value={currentPosition ? 'Present' : endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#F52F3A] disabled:opacity-50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Location
              </label>
              <input
                type="text"
                placeholder="Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#F52F3A]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="currentPosCheck"
              checked={currentPosition}
              onChange={(e) => setCurrentPosition(e.target.checked)}
              className="w-4 h-4 rounded text-[#F52F3A] focus:ring-[#F52F3A] cursor-pointer"
            />
            <label htmlFor="currentPosCheck" className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 cursor-pointer">
              I currently work in this role
            </label>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Responsibilities, achievements, and impact..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#F52F3A]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Technologies Used (comma-separated)
            </label>
            <input
              type="text"
              placeholder="React, TypeScript, Tailwind CSS"
              value={technologiesText}
              onChange={(e) => setTechnologiesText(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#F52F3A]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-black/5 dark:border-white/10">
            <Button variant="outline" size="sm" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              {editingItem ? 'Update' : 'Add Experience'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
