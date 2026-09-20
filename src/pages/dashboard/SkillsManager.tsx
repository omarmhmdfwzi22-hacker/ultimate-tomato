import React, { useEffect, useState } from 'react';
import { skillsService } from '../../services/cmsServices';
import { Skill } from '../../types/portfolio';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { Plus, Edit2, Trash2, Code2 } from 'lucide-react';

export function SkillsManager() {
  const { showToast } = useToast();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Development');
  const [level, setLevel] = useState(85);
  const [years, setYears] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSkills = async () => {
    setIsLoading(true);
    try {
      const data = await skillsService.list();
      setSkills(data);
    } catch {
      showToast('Failed to load skills', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const openCreateModal = () => {
    setEditingSkill(null);
    setName('');
    setCategory('Development');
    setLevel(85);
    setYears(3);
    setModalOpen(true);
  };

  const openEditModal = (s: Skill) => {
    setEditingSkill(s);
    setName(s.name);
    setCategory(s.category);
    setLevel(s.level);
    setYears(s.years || 3);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const payload: Partial<Skill> = {
        name,
        category,
        level,
        years,
      };
      if (editingSkill) {
        payload.id = editingSkill.id;
      }
      const saved = await skillsService.save(payload);
      if (editingSkill) {
        setSkills((prev) => prev.map((s) => (s.id === saved.id ? saved : s)));
        showToast('Skill updated successfully!', 'success');
      } else {
        setSkills((prev) => [...prev, saved]);
        showToast('Skill added successfully!', 'success');
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
      await skillsService.delete(id);
      setSkills((prev) => prev.filter((s) => s.id !== id));
      showToast('Skill removed.', 'success');
    } catch {
      showToast('Failed to delete skill', 'error');
    }
  };

  return (
    <div className="space-y-8 text-left max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Skills & Capabilities
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage your technical proficiencies, frameworks, and tools.
          </p>
        </div>

        <Button variant="primary" onClick={openCreateModal} icon={<Plus className="w-4 h-4" />}>
          Add Skill
        </Button>
      </div>

      <GlassCard variant="minimal" className="rounded-2xl overflow-hidden border border-black/10 dark:border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/5 dark:border-white/10 text-zinc-400 font-mono uppercase tracking-wider">
              <tr>
                <th className="px-5 py-4 font-semibold">Skill</th>
                <th className="px-5 py-4 font-semibold">Category</th>
                <th className="px-5 py-4 font-semibold">Level</th>
                <th className="px-5 py-4 font-semibold">Experience</th>
                <th className="px-5 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {skills.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-zinc-400">
                    No skills added. Click "+ Add Skill" to add your first competence.
                  </td>
                </tr>
              ) : (
                skills.map((s) => (
                  <tr key={s.id} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-bold text-zinc-900 dark:text-white text-sm">
                        {s.name}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-300 font-medium">
                        {s.category}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-[#F52F3A]">
                        {s.level}%
                      </span>
                    </td>
                    <td className="px-5 py-4 text-zinc-500">
                      {s.years ? `${s.years} yrs` : '—'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(s)}
                          className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
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
        title={editingSkill ? 'Edit Skill' : 'Add New Skill'}
        maxWidth="sm"
      >
        <form onSubmit={handleSave} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Skill Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Next.js & React 19"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#F52F3A]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#F52F3A]"
            >
              <option value="Development">Development</option>
              <option value="Design">Design & UI/UX</option>
              <option value="Architecture">Architecture & Cloud</option>
              <option value="Technologies">Technologies & Tools</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              <span>Proficiency Level</span>
              <span className="text-[#F52F3A] font-mono">{level}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={level}
              onChange={(e) => setLevel(parseInt(e.target.value, 10))}
              className="w-full accent-[#F52F3A]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Years of Experience
            </label>
            <input
              type="number"
              min="0"
              max="30"
              value={years}
              onChange={(e) => setYears(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#F52F3A]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-black/5 dark:border-white/10">
            <Button variant="outline" size="sm" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              {editingSkill ? 'Update' : 'Add Skill'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
