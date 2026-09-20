import React, { useState, useEffect } from 'react';
import {
  Shield,
  Plus,
  Search,
  Mail,
  Copy,
  Check,
  Trash2,
  RotateCcw,
  ExternalLink,
  UserCheck,
  Clock,
  Key,
} from 'lucide-react';
import { Client, Portfolio } from '../../types/portfolio';
import { clientsService } from '../../services/cmsServices';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import { Skeleton } from '../../components/ui/Skeletons';

export function SuperAdminClients() {
  const { switchPortfolio } = useAuth();
  const { showToast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State for New Client
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newClientData, setNewClientData] = useState({
    name: '',
    email: '',
    slug: '',
    portfolioName: '',
  });

  // Success Invite Link Modal
  const [createdInvite, setCreatedInvite] = useState<{
    client: Client;
    onboardingToken: string;
    inviteUrl: string;
  } | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  // Soft Delete / Restore Dialogs
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState<Client | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const data = await clientsService.list();
      setClients(data || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch clients', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleNameChange = (name: string) => {
    setNewClientData((prev) => ({
      ...prev,
      name,
      slug: prev.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      portfolioName: prev.portfolioName || `${name}'s Portfolio`,
    }));
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientData.name || !newClientData.email || !newClientData.slug) {
      showToast('Name, email, and slug are required.', 'error');
      return;
    }

    setIsCreating(true);
    try {
      const res = await clientsService.create(newClientData);
      setClients((prev) => [res.client, ...prev]);
      setIsCreateModalOpen(false);

      const origin = window.location.origin;
      const inviteUrl = `${origin}/onboarding/${res.onboardingToken}`;

      setCreatedInvite({
        client: res.client,
        onboardingToken: res.onboardingToken,
        inviteUrl,
      });

      setNewClientData({ name: '', email: '', slug: '', portfolioName: '' });
      showToast('Client created successfully! Onboarding link generated.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to create client', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyInviteUrl = async () => {
    if (!createdInvite) return;
    try {
      await navigator.clipboard.writeText(createdInvite.inviteUrl);
      setHasCopied(true);
      showToast('Invite link copied to clipboard!', 'success');
      setTimeout(() => setHasCopied(false), 3000);
    } catch {
      showToast('Failed to copy to clipboard', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await clientsService.softDelete(deleteTarget.id);
      setClients((prev) =>
        prev.map((c) =>
          c.id === deleteTarget.id ? { ...c, deleted_at: new Date().toISOString() } : c
        )
      );
      showToast('Client suspended and soft-deleted.', 'success');
      setDeleteTarget(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete client', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestoreConfirm = async () => {
    if (!restoreTarget) return;
    setIsRestoring(true);
    try {
      await clientsService.restore(restoreTarget.id);
      setClients((prev) =>
        prev.map((c) => (c.id === restoreTarget.id ? { ...c, deleted_at: null } : c))
      );
      showToast('Client and portfolio restored.', 'success');
      setRestoreTarget(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to restore client', 'error');
    } finally {
      setIsRestoring(false);
    }
  };

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
            <Shield className="w-6 h-6 text-[#F52F3A]" />
            Client Tenants & Portfolios
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Create new client accounts, issue secure onboarding invitation links, and manage tenant lifecycle.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Client
        </Button>
      </div>

      {/* Search Bar */}
      <GlassCard className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search clients by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-100 dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#F52F3A] transition"
          />
        </div>
      </GlassCard>

      {/* Clients Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      ) : filteredClients.length === 0 ? (
        <GlassCard className="py-16 text-center">
          <Shield className="w-12 h-12 mx-auto text-zinc-400 mb-3" />
          <p className="font-medium text-zinc-700 dark:text-zinc-300">No client accounts found</p>
          <p className="text-xs text-zinc-500 mt-1">
            Click &quot;Create New Client&quot; above to issue the first invitation link.
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {filteredClients.map((client) => {
            const isSoftDeleted = !!client.deleted_at;

            return (
              <div
                key={client.id}
                className={`p-4 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isSoftDeleted
                    ? 'bg-red-50/50 dark:bg-red-950/10 border-red-200 dark:border-red-900/30 opacity-70'
                    : 'bg-white dark:bg-white/[0.03] border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-white/[0.06] flex items-center justify-center font-bold text-sm text-[#F52F3A]">
                    {client.name.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-zinc-900 dark:text-white text-sm">
                        {client.name}
                      </span>
                      {isSoftDeleted ? (
                        <Badge variant="danger">Deleted / Suspended</Badge>
                      ) : client.onboarding_completed ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="warning">Awaiting Onboarding</Badge>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3.5 h-3.5" />
                      {client.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-black/5 dark:border-white/5">
                  <div className="text-xs text-zinc-400">
                    Created {new Date(client.created_at).toLocaleDateString()}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Switch Tenant View */}
                    {!isSoftDeleted && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          showToast(`Switched active context to ${client.name}`, 'info');
                        }}
                      >
                        Manage
                      </Button>
                    )}

                    {isSoftDeleted ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setRestoreTarget(client)}
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1" />
                        Restore
                      </Button>
                    ) : (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setDeleteTarget(client)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Client Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Client Tenant"
      >
        <form onSubmit={handleCreateClient} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
              Client Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Omar Mohamed Fawzi"
              value={newClientData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-100 dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#F52F3A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
              Client Email Address
            </label>
            <input
              type="email"
              required
              placeholder="client@domain.com"
              value={newClientData.email}
              onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-100 dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#F52F3A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
              Portfolio URL Slug
            </label>
            <div className="flex items-center">
              <span className="px-3 py-2 bg-zinc-200/70 dark:bg-white/[0.06] border border-r-0 border-black/10 dark:border-white/10 rounded-l-xl text-xs text-zinc-500 font-mono">
                /portfolio/
              </span>
              <input
                type="text"
                required
                placeholder="omar-mohamed-fawzi"
                value={newClientData.slug}
                onChange={(e) => setNewClientData({ ...newClientData, slug: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-100 dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-r-xl text-sm font-mono focus:outline-none focus:border-[#F52F3A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
              Portfolio Display Name
            </label>
            <input
              type="text"
              placeholder="e.g. Omar Mohamed Fawzi — Creative Portfolio"
              value={newClientData.portfolioName}
              onChange={(e) => setNewClientData({ ...newClientData, portfolioName: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-100 dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#F52F3A]"
            />
          </div>

          <div className="pt-2 text-xs text-zinc-500 bg-zinc-100 dark:bg-white/[0.02] p-3 rounded-xl border border-black/5 dark:border-white/5">
            A secure activation token will be generated. The client will be able to set their password and configure their initial bio and portrait.
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-black/5 dark:border-white/5">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isCreating}
            >
              Create Client & Generate Invite
            </Button>
          </div>
        </form>
      </Modal>

      {/* Invite Link Generated Success Modal */}
      {createdInvite && (
        <Modal
          isOpen={!!createdInvite}
          onClose={() => setCreatedInvite(null)}
          title="Onboarding Invite Generated"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-2.5">
              <Check className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Client created successfully!</p>
                <p className="mt-0.5">
                  Share this invitation link with <strong>{createdInvite.client.name}</strong> ({createdInvite.client.email}) so they can set up their password and customize their portfolio.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Unique Onboarding Activation Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={createdInvite.inviteUrl}
                  className="w-full px-3 py-2 bg-zinc-100 dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-xs font-mono text-zinc-800 dark:text-zinc-200 select-all"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleCopyInviteUrl}
                >
                  {hasCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1" />
                      Copy Link
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-black/5 dark:border-white/5">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCreatedInvite(null)}
              >
                Done
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Soft Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Suspend and Soft Delete Client"
        message={`Are you sure you want to soft delete client "${deleteTarget?.name}"? Their public portfolio will be unpublished. You can restore this account at any time.`}
        confirmText="Soft Delete"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Restore Dialog */}
      <ConfirmDialog
        isOpen={!!restoreTarget}
        title="Restore Client Tenant"
        message={`Restore client "${restoreTarget?.name}" and reinstate their portfolio configuration?`}
        confirmText="Restore Account"
        variant="primary"
        isLoading={isRestoring}
        onConfirm={handleRestoreConfirm}
        onCancel={() => setRestoreTarget(null)}
      />
    </div>
  );
}
