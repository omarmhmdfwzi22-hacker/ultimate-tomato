import React, { useState, useEffect, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  Eye,
  User,
  Clock,
  ShieldCheck,
  FileCode,
  Activity,
  Calendar,
} from 'lucide-react';
import { AuditLog } from '../../types/portfolio';
import { clientsService } from '../../services/cmsServices';
import { GlassCard } from '../../components/ui/GlassCard';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { Skeleton } from '../../components/ui/Skeletons';

export function SuperAdminAuditLogs() {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await clientsService.getAuditLogs();
      setLogs(data || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load audit trail', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const actionTypes = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((log) => set.add(log.action));
    return Array.from(set);
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        (log.user_email && log.user_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.entity_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.entity_id && log.entity_id.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesFilter = actionFilter === 'ALL' || log.action === actionFilter;

      return matchesSearch && matchesFilter;
    });
  }, [logs, searchQuery, actionFilter]);

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('DELETE')) return 'danger';
    if (action.includes('CREATE') || action.includes('ONBOARD')) return 'success';
    if (action.includes('UPDATE') || action.includes('PUBLISH')) return 'info';
    return 'default';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
            <History className="w-6 h-6 text-[#F52F3A]" />
            Security & System Audit Log
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Immutable tracking of sensitive operations: client creation, onboarding, publish states, and record mutations.
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={fetchLogs}>
          <Activity className="w-3.5 h-3.5 mr-1" />
          Refresh Stream
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <GlassCard className="p-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by actor email, action name, or target entity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-zinc-100 dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#F52F3A] transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-400" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 bg-zinc-100 dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:border-[#F52F3A]"
            >
              <option value="ALL">All Actions</option>
              {actionTypes.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Audit Logs Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      ) : filteredLogs.length === 0 ? (
        <GlassCard className="py-16 text-center">
          <ShieldCheck className="w-12 h-12 mx-auto text-zinc-400 mb-3" />
          <p className="font-medium text-zinc-700 dark:text-zinc-300">No audit events logged yet</p>
          <p className="text-xs text-zinc-500 mt-1">
            System actions such as client creation, project edits, and publishing will appear here.
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              onClick={() => setSelectedLog(log)}
              className="p-4 rounded-2xl border bg-white dark:bg-white/[0.03] border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-white/[0.05] border border-black/5 dark:border-white/5 flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4 text-[#F52F3A]" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={getActionBadgeVariant(log.action)}>
                      {log.action}
                    </Badge>
                    <span className="text-xs font-semibold text-zinc-900 dark:text-white">
                      {log.entity_type}
                    </span>
                    {log.entity_id && (
                      <span className="text-[11px] font-mono text-zinc-400">
                        #{log.entity_id.slice(0, 8)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                    <User className="w-3 h-3 text-zinc-400" />
                    <span>{log.user_email || 'System'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-black/5 dark:border-white/5 text-xs text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(log.created_at).toLocaleString()}</span>
                </div>

                <Button variant="ghost" size="sm">
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title="Audit Event Details"
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs bg-zinc-100 dark:bg-white/[0.03] p-4 rounded-xl border border-black/5 dark:border-white/5">
              <div>
                <span className="text-zinc-400 block mb-0.5">Action:</span>
                <Badge variant={getActionBadgeVariant(selectedLog.action)}>
                  {selectedLog.action}
                </Badge>
              </div>
              <div>
                <span className="text-zinc-400 block mb-0.5">Entity Type:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {selectedLog.entity_type}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block mb-0.5">Actor:</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  {selectedLog.user_email || 'System Service'}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block mb-0.5">Timestamp:</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  {new Date(selectedLog.created_at).toLocaleString()}
                </span>
              </div>
            </div>

            {selectedLog.details && (
              <div>
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block mb-1.5 flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-[#F52F3A]" />
                  Payload Snapshot (JSON):
                </span>
                <pre className="p-4 rounded-xl bg-zinc-900 text-zinc-200 font-mono text-xs overflow-x-auto border border-zinc-800">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-black/5 dark:border-white/5">
              <Button variant="secondary" size="sm" onClick={() => setSelectedLog(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
