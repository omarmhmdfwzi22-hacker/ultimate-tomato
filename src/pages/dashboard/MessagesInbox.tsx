import React, { useState, useEffect, useMemo } from 'react';
import {
  MessageSquare,
  Search,
  Mail,
  MailOpen,
  Archive,
  Trash2,
  Calendar,
  User,
  CheckCircle,
  Clock,
  Send,
  ExternalLink,
} from 'lucide-react';
import { ContactMessage } from '../../types/portfolio';
import { messagesService } from '../../services/cmsServices';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import { Skeleton } from '../../components/ui/Skeletons';
import { localCMSStore } from '../../services/localCMSStore';

export function MessagesInbox() {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>(() => localCMSStore.getMessages());
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNREAD' | 'READ' | 'ARCHIVED'>('ALL');
  
  // Selected message for viewing
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  // Message for deletion confirmation
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMessages = async () => {
    try {
      const data = await messagesService.list();
      if (data) setMessages(data);
    } catch {
      // Silently fall back to local store
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleOpenMessage = async (msg: ContactMessage) => {
    setSelectedMessage(msg);
    if (msg.status === 'UNREAD') {
      try {
        await messagesService.updateStatus(msg.id, 'READ');
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, status: 'READ' } : m))
        );
      } catch (err: any) {
        console.error('Failed to mark message as read:', err);
      }
    }
  };

  const handleStatusChange = async (msg: ContactMessage, newStatus: 'UNREAD' | 'READ' | 'ARCHIVED') => {
    try {
      await messagesService.updateStatus(msg.id, newStatus);
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, status: newStatus } : m))
      );
      if (selectedMessage?.id === msg.id) {
        setSelectedMessage({ ...selectedMessage, status: newStatus });
      }
      showToast(`Message marked as ${newStatus.toLowerCase()}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update message status', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await messagesService.delete(deleteTarget.id);
      setMessages((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      if (selectedMessage?.id === deleteTarget.id) {
        setSelectedMessage(null);
      }
      showToast('Message deleted successfully', 'success');
      setDeleteTarget(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete message', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      const matchesSearch =
        msg.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (msg.subject && msg.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
        msg.message.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' || msg.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [messages, searchQuery, statusFilter]);

  const unreadCount = messages.filter((m) => m.status === 'UNREAD').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-[#F52F3A]" />
            Client Inquiries & Messages
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Inquiries received through the public portfolio contact form.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <span className="px-3 py-1 bg-[#F52F3A]/10 text-[#F52F3A] border border-[#F52F3A]/20 rounded-full text-xs font-semibold">
              {unreadCount} unread inquiry{unreadCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <GlassCard className="p-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search sender, email, subject, or message content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-zinc-100 dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#F52F3A] transition"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {(['ALL', 'UNREAD', 'READ', 'ARCHIVED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  statusFilter === st
                    ? 'bg-[#F52F3A] text-white'
                    : 'bg-zinc-100 dark:bg-white/[0.04] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {st === 'ALL' ? 'All' : st === 'UNREAD' ? `Unread (${unreadCount})` : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Messages List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : filteredMessages.length === 0 ? (
        <GlassCard className="py-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-white/[0.04] border border-black/5 dark:border-white/10 flex items-center justify-center mx-auto mb-3 text-zinc-400">
            <MessageSquare className="w-6 h-6" />
          </div>
          <p className="text-zinc-600 dark:text-zinc-300 font-medium">No messages found</p>
          <p className="text-xs text-zinc-500 mt-1">
            {searchQuery || statusFilter !== 'ALL'
              ? 'Try modifying your search or filter criteria'
              : 'Messages submitted via your public contact form will appear here.'}
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {filteredMessages.map((msg) => (
            <div
              key={msg.id}
              onClick={() => handleOpenMessage(msg)}
              className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                msg.status === 'UNREAD'
                  ? 'bg-white dark:bg-white/[0.04] border-[#F52F3A]/30 shadow-sm shadow-[#F52F3A]/5 font-medium'
                  : 'bg-white/60 dark:bg-[#0e0e0e]/60 border-black/5 dark:border-white/5 opacity-85 hover:opacity-100 hover:border-black/10 dark:hover:border-white/10'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    msg.status === 'UNREAD'
                      ? 'bg-[#F52F3A]/10 text-[#F52F3A]'
                      : 'bg-zinc-100 dark:bg-white/[0.04] text-zinc-400'
                  }`}
                >
                  {msg.status === 'UNREAD' ? (
                    <Mail className="w-4 h-4" />
                  ) : msg.status === 'ARCHIVED' ? (
                    <Archive className="w-4 h-4" />
                  ) : (
                    <MailOpen className="w-4 h-4" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-zinc-900 dark:text-white text-sm">
                      {msg.sender}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      &lt;{msg.email}&gt;
                    </span>
                    {msg.status === 'UNREAD' && (
                      <span className="w-2 h-2 rounded-full bg-[#F52F3A] inline-block" />
                    )}
                  </div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-300 truncate mt-0.5">
                    {msg.subject ? (
                      <span className="font-medium text-zinc-800 dark:text-zinc-200">
                        {msg.subject} —{' '}
                      </span>
                    ) : null}
                    <span className="text-zinc-500 dark:text-zinc-400">{msg.message}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-black/5 dark:border-white/5 text-xs text-zinc-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {new Date(msg.date).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  {msg.status === 'UNREAD' ? (
                    <button
                      onClick={() => handleStatusChange(msg, 'READ')}
                      title="Mark as read"
                      className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/[0.08] text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition"
                    >
                      <MailOpen className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(msg, 'UNREAD')}
                      title="Mark as unread"
                      className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/[0.08] text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                  )}

                  {msg.status !== 'ARCHIVED' && (
                    <button
                      onClick={() => handleStatusChange(msg, 'ARCHIVED')}
                      title="Archive message"
                      className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/[0.08] text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => setDeleteTarget(msg)}
                    title="Delete message"
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-500 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message Detail Modal */}
      {selectedMessage && (
        <Modal
          isOpen={!!selectedMessage}
          onClose={() => setSelectedMessage(null)}
          title={selectedMessage.subject || 'Message Details'}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            <div className="bg-zinc-100 dark:bg-white/[0.03] p-4 rounded-xl space-y-2 border border-black/5 dark:border-white/5">
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-zinc-500">
                <span className="flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300">
                  <User className="w-3.5 h-3.5 text-[#F52F3A]" />
                  {selectedMessage.sender}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(selectedMessage.date).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                <a
                  href={`mailto:${selectedMessage.email}`}
                  className="text-[#F52F3A] hover:underline font-medium"
                >
                  {selectedMessage.email}
                </a>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-black/40 border border-black/5 dark:border-white/5 whitespace-pre-wrap font-sans text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
              {selectedMessage.message}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-black/5 dark:border-white/5">
              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject || 'Inquiry via Ultimate Tomato')}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#F52F3A] text-white hover:bg-[#d9222c] transition shadow-md shadow-[#F52F3A]/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  Reply via Email
                </a>

                {selectedMessage.status !== 'ARCHIVED' ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleStatusChange(selectedMessage, 'ARCHIVED')}
                  >
                    <Archive className="w-3.5 h-3.5 mr-1" />
                    Archive
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleStatusChange(selectedMessage, 'READ')}
                  >
                    Unarchive
                  </Button>
                )}
              </div>

              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  setDeleteTarget(selectedMessage);
                }}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Message"
        message={`Are you sure you want to permanently delete the message from ${deleteTarget?.sender}? This action cannot be undone.`}
        confirmText="Delete Permanently"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
