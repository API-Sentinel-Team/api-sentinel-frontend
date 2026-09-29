import React, { useState } from 'react';
import { useAuditLogs } from '@/hooks/use-admin';
import { ArrowLeft, ClipboardList, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ResponsiveTable, { type Column, type RowDetail } from '@/components/shared/ResponsiveTable';
import { DetailGrid, DetailField, DetailSection, DetailCode } from '@/components/detail/DetailGrid';
import type { AktoAuditLog } from '@/services/admin.service';

function formatTs(epoch: number): string {
  if (!epoch) return '—';
  return new Date(epoch).toLocaleString();
}

const logColumns: Column<AktoAuditLog>[] = [
  {
    key: 'timestamp',
    label: 'Timestamp',
    width: '180px',
    priority: 0,
    render: (_value, row) => (
      <span className="whitespace-nowrap font-mono text-[11px] text-text-muted">
        {formatTs(row.timestamp)}
      </span>
    ),
  },
  {
    key: 'user',
    label: 'User',
    priority: 1,
    render: (_value, row) => (
      <span className="text-[12px] text-text-primary [overflow-wrap:anywhere]">{row.user}</span>
    ),
  },
  {
    key: 'action',
    label: 'Action',
    width: '150px',
    priority: 2,
    render: (_value, row) => (
      <span className="rounded-full border border-brand/20 bg-brand/10 px-2 py-0.5 text-[11px] font-bold text-brand">
        {row.action}
      </span>
    ),
  },
  {
    key: 'resource',
    label: 'Resource',
    priority: 3,
    render: (_value, row) => (
      <span className="text-[11px] text-text-muted [overflow-wrap:anywhere]">
        {row.resource || '—'}
      </span>
    ),
  },
  {
    key: 'details',
    label: 'Details',
    priority: 4,
    render: (_value, row) => (
      <span className="text-[11px] text-text-muted [overflow-wrap:anywhere]">
        {row.details || '—'}
      </span>
    ),
  },
];

const AuditLogs: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const pageSize = 50;
  const { data, isLoading } = useAuditLogs(page, pageSize);

  const logs = data?.auditLogs ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  /**
   * Full record for one audit entry. The `details` field often carries a
   * serialized payload that used to be truncated at 200px in the table —
   * here it is always readable in full (and copied verbatim).
   */
  const logDetail = (row: AktoAuditLog): RowDetail => ({
    title: row.action || 'Audit entry',
    subtitle: `${row.user} · ${formatTs(row.timestamp)}`,
    content: (
      <div className="detail-body">
        <DetailSection title="Operation" code="§1">
          <DetailGrid>
            <DetailField label="Action" value={row.action || '—'} />
            <DetailField label="User" value={row.user || '—'} />
            <DetailField label="Resource" value={row.resource || '—'} />
            <DetailField label="Recorded" value={formatTs(row.timestamp)} mono />
            <DetailField label="Entry ID" value={row.id} mono span="full" copyValue={row.id} />
          </DetailGrid>
        </DetailSection>
        {row.details ? (
          <DetailSection title="Details" code="§2" description="Full payload — not truncated">
            <DetailCode label="Details" value={row.details} />
          </DetailSection>
        ) : null}
      </div>
    ),
  });

  return (
    <div className="space-y-5 animate-fade-in max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/admin/settings')} className="w-8 h-8 rounded-lg border border-border-subtle bg-bg-surface flex items-center justify-center text-text-muted hover:text-text-primary hover:border-brand/20 transition-all">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-sm font-bold text-text-primary">Audit Logs</h2>
          <p className="text-[11px] text-text-muted">Review all administrative operations and changes</p>
        </div>
      </div>

      <div className="bg-bg-surface border border-border-subtle rounded-xl overflow-hidden">
        <div className="p-3 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList size={14} className="text-brand" />
            <span className="text-xs font-bold text-text-primary">Audit Trail</span>
            <span className="text-[11px] bg-bg-elevated border border-border-subtle px-2 py-0.5 rounded-full text-text-muted">{total}</span>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="p-1 rounded-md hover:bg-bg-elevated disabled:opacity-30 transition-colors"><ChevronLeft size={14} /></button>
              <span className="tabular-nums">{page + 1} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                className="p-1 rounded-md hover:bg-bg-elevated disabled:opacity-30 transition-colors"><ChevronRight size={14} /></button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-brand" /></div>
        ) : (
          <ResponsiveTable
            data={logs}
            columns={logColumns}
            label="Audit trail"
            emptyMessage="No audit logs found"
            keyExtractor={row => row.id}
            detail={logDetail}
          />
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
