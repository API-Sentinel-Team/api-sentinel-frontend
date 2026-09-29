import React, { useState, useMemo, useCallback } from 'react';
import { RefreshCw, Zap, Filter, AlertTriangle, CheckCircle2, XCircle, Info, Copy } from 'lucide-react';
import TimeFilter from '@/components/shared/TimeFilter';
import { Toggle } from '@/components/shared/Toggle';
import AreaChartComponent from '@/components/charts/AreaChart';
import DonutChart from '@/components/charts/DonutChart';
import { SeverityBadge, StatusBadge, MethodBadge } from '@/components/shared/Badges';
import QueryError from '@/components/shared/QueryError';
import MetricWidget from '@/components/ui/MetricWidget';
import GlassCard from '@/components/ui/GlassCard';
import ResponsiveTable, { type Column, type RowDetail } from '@/components/shared/ResponsiveTable';
import { DetailGrid, DetailField, DetailSection, DetailCode } from '@/components/detail/DetailGrid';
import { useVulnerabilities, useIssueSummary, useIssuesTrend, useBulkUpdateIssueStatus } from '@/hooks/use-testing';
import { useQueryClient } from '@tanstack/react-query';
import type { AktoIssue } from '@/services/testing.service';

function formatTs(epoch: number) {
  if (!epoch) return '-';
  const d = new Date(epoch * 1000);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' +
    d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

/** Human age of a finding, so the operator never has to do epoch math. */
function relativeAge(epoch: number): string {
  if (!epoch) return '—';
  const seconds = Math.max(0, Math.floor(Date.now() / 1000) - epoch);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function mapSev(s: string): 'critical' | 'high' | 'medium' | 'low' | 'info' {
  const l = (s || '').toLowerCase();
  if (l === 'critical') return 'critical';
  if (l === 'high') return 'high';
  if (l === 'medium') return 'medium';
  if (l === 'low') return 'low';
  return 'info';
}

function mapStatus(s: string): string {
  switch ((s || '').toUpperCase()) {
    case 'OPEN': return 'Open';
    case 'FIXED': return 'Resolved';
    case 'FALSE_POSITIVE': return 'FP';
    case 'IGNORED': return 'Ignored';
    default: return s || 'Open';
  }
}

function daysAgoTs(days: number) {
  return Math.floor((Date.now() - days * 86400_000) / 1000);
}

const sevBorderColors: Record<string, string> = { critical: '#EF4444', high: '#F97316', medium: '#EAB308', low: '#22C55E', info: '#3B82F6' };

const Vulnerabilities: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d'>('24h');
  const [showResolved, setShowResolved] = useState(false);
  const [showAgg, setShowAgg] = useState(true);
  const [chartTab, setChartTab] = useState<'total' | 'open' | 'resolved'>('total');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<string>('FALSE_POSITIVE');
  const pageSize = 10;
  const qc = useQueryClient();
  const bulkMutation = useBulkUpdateIssueStatus();

  const days = timeRange === '24h' ? 1 : 7;
  const startTs = useMemo(() => daysAgoTs(days), [days]);
  const endTs = useMemo(() => Math.floor(Date.now() / 1000), []);

  const filters = useMemo(() => {
    const f: Record<string, unknown> = {};
    if (!showResolved) f.issueStatus = ['OPEN', 'FALSE_POSITIVE'];
    return f;
  }, [showResolved]);

  const { data, isLoading, isError, refetch } = useVulnerabilities(page, pageSize, filters, 'creationTime', -1);
  const summary = useIssueSummary();
  const trend = useIssuesTrend(startTs, endTs);

  const rows = data?.issues ?? [];
  const total = data?.totalIssuesCount ?? 0;
  const pageIds = rows.map(r => r.id);
  const allOnPageSelected = pageIds.length > 0 && pageIds.every(id => selected.has(id));
  const toggleRow = useCallback((id: string) => setSelected(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  }), []);
  const toggleAllOnPage = useCallback(() => setSelected(prev => {
    const next = new Set(prev);
    if (allOnPageSelected) pageIds.forEach(id => next.delete(id));
    else pageIds.forEach(id => next.add(id));
    return next;
  }), [allOnPageSelected, pageIds]);
  const applyBulkStatus = () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    bulkMutation.mutate({ issueIds: ids, status: bulkStatus }, {
      onSuccess: () => setSelected(new Set()),
    });
  };

  const sm = summary.data;
  const totalIssues = sm?.totalIssues ?? 0;
  const openIssues = sm?.openIssues ?? 0;
  const fixedIssues = sm?.fixedIssues ?? 0;
  const sev = useMemo(() => sm?.severityBreakdown ?? {}, [sm]);

  const severityData = useMemo(() => [
    { name: 'Critical', value: sev.CRITICAL ?? 0, color: '#EF4444' },
    { name: 'High', value: sev.HIGH ?? 0, color: '#F97316' },
    { name: 'Medium', value: sev.MEDIUM ?? 0, color: '#EAB308' },
    { name: 'Low', value: sev.LOW ?? 0, color: '#22C55E' },
  ], [sev]);

  const timelineData = useMemo(() => {
    const t = trend.data?.issuesTrend;
    if (t && t.length > 0) {
      return t.map(d => ({
        date: new Date(d.ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        total: d.count,
        open: Math.round(d.count * 0.6),
        resolved: Math.round(d.count * 0.4),
      }));
    }
    return [];
  }, [trend.data]);

  /**
   * Table columns. `priority` orders the phone card layout so the most
   * decision-relevant fields (severity, endpoint, category) appear first.
   * Nothing is truncated: long URLs wrap inside the cell and are also
   * readable in full in the detail surface.
   */
  const issueColumns = useMemo<Column<AktoIssue>[]>(() => [
    {
      key: 'id',
      label: 'Select',
      width: '44px',
      align: 'center',
      hideOnMobile: true,
      headerRender: () => (
        <input
          type="checkbox"
          className="accent-brand"
          aria-label="Select all findings on this page"
          checked={allOnPageSelected}
          onChange={toggleAllOnPage}
        />
      ),
      render: (_value, row) => (
        <input
          type="checkbox"
          className="accent-brand"
          aria-label={`Select ${row.testSubType || row.id}`}
          checked={selected.has(row.id)}
          onClick={event => event.stopPropagation()}
          onChange={() => toggleRow(row.id)}
        />
      ),
    },
    {
      key: 'severity',
      label: 'Severity',
      width: '110px',
      priority: 0,
      render: (_value, row) => {
        const tone = mapSev(row.severity);
        return (
          <div className="flex items-center gap-2">
            <span
              className="h-6 w-1 shrink-0 rounded-full"
              style={{ background: sevBorderColors[tone] || 'transparent' }}
              aria-hidden
            />
            <SeverityBadge severity={tone} />
            <span className="text-[11px] font-semibold text-text-secondary [overflow-wrap:anywhere]">
              {row.severity || '—'}
            </span>
          </div>
        );
      },
    },
    {
      key: 'url',
      label: 'Endpoint',
      priority: 1,
      render: (_value, row) => (
        <div className="flex min-w-0 items-start gap-2">
          <MethodBadge method={row.method || 'GET'} />
          <span
            className="min-w-0 font-mono text-[12px] text-text-primary [overflow-wrap:anywhere]"
            title={row.url}
          >
            {row.url}
          </span>
        </div>
      ),
    },
    {
      key: 'testCategory',
      label: 'Category',
      width: '160px',
      priority: 2,
      render: (_value, row) => (
        <span className="text-[11px] text-text-secondary [overflow-wrap:anywhere]">
          {row.testCategory || '—'}
        </span>
      ),
    },
    {
      key: 'testSubType',
      label: 'Test',
      priority: 3,
      render: (_value, row) => (
        <span className="text-[11px] text-text-primary [overflow-wrap:anywhere]">
          {row.testSubType || '—'}
        </span>
      ),
    },
    {
      key: 'issueStatus',
      label: 'Status',
      width: '120px',
      priority: 4,
      render: (_value, row) => <StatusBadge status={mapStatus(row.issueStatus)} />,
    },
    {
      key: 'creationTime',
      label: 'Detected',
      width: '160px',
      priority: 5,
      render: (_value, row) => (
        <div className="font-mono text-[11px] text-text-muted">
          <div>{formatTs(row.creationTime)}</div>
          <div className="text-[10px] text-text-disabled">{relativeAge(row.creationTime)}</div>
        </div>
      ),
    },
    {
      key: 'lastSeen',
      label: 'Last seen',
      width: '160px',
      priority: 6,
      render: (_value, row) => (
        <div className="font-mono text-[11px] text-text-muted">
          <div>{formatTs(row.lastSeen)}</div>
          <div className="text-[10px] text-text-disabled">{relativeAge(row.lastSeen)}</div>
        </div>
      ),
    },
  ], [allOnPageSelected, selected, toggleAllOnPage, toggleRow]);

  /**
   * Full record for one finding, shown in the responsive detail surface.
   * Every field the API returns is rendered — the table is a summary, the
   * panel is the record of truth.
   */
  const issueDetail = useCallback((row: AktoIssue): RowDetail => {
    const tone = mapSev(row.severity);
    const curl = `curl -X ${row.method || 'GET'} '${row.url}'`;
    const isSelected = selected.has(row.id);

    return {
      title: row.testSubType || row.testCategory || 'Finding',
      subtitle: `${row.method || 'GET'} ${row.url}`,
      stamp: <SeverityBadge severity={tone} />,
      content: (
        <div className="detail-body">
          <DetailSection title="Finding" code="§1">
            <DetailGrid>
              <DetailField label="Severity" tone={tone} value={row.severity || '—'} />
              <DetailField label="Status" value={mapStatus(row.issueStatus)} />
              <DetailField label="Category" value={row.testCategory || '—'} />
              <DetailField label="Test type" value={row.testSubType || '—'} />
              <DetailField label="Method" value={row.method || 'GET'} mono />
              <DetailField label="Collection" value={String(row.apiCollectionId ?? '—')} mono />
              <DetailField
                label="Endpoint"
                value={row.url}
                mono
                span="full"
                copyValue={row.url}
              />
              <DetailField
                label="Finding ID"
                value={row.id}
                mono
                span="full"
                copyValue={row.id}
              />
            </DetailGrid>
          </DetailSection>

          <DetailSection title="Timeline" code="§2">
            <DetailGrid>
              <DetailField label="Detected" value={formatTs(row.creationTime)} mono />
              <DetailField label="Age" value={relativeAge(row.creationTime)} />
              <DetailField label="Last seen" value={formatTs(row.lastSeen)} mono />
              <DetailField label="Since seen" value={relativeAge(row.lastSeen)} />
            </DetailGrid>
          </DetailSection>

          <DetailSection
            title="Suggested reproduction"
            code="§3"
            description="Derived from the recorded method and URL"
            collapsible
            defaultOpen={false}
          >
            <DetailCode label="Request" value={curl} />
          </DetailSection>
        </div>
      ),
      footer: (
        <>
          <button
            type="button"
            onClick={() => toggleRow(row.id)}
            className={[
              'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition-all',
              isSelected
                ? 'border-brand/40 bg-brand/10 text-brand'
                : 'border-border-subtle bg-bg-surface text-text-secondary hover:text-text-primary',
            ].join(' ')}
          >
            {isSelected ? 'Selected' : 'Add to selection'}
          </button>
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard?.writeText(`${row.method || 'GET'} ${row.url}`).catch(() => {});
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-bg-surface px-3 py-1.5 text-[11px] font-semibold text-text-secondary transition-all hover:text-text-primary"
          >
            <Copy size={12} /> Copy request line
          </button>
        </>
      ),
    };
  }, [selected, toggleRow]);

  return (
    <div className="w-full animate-fade-in space-y-5 pb-10">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Toggle checked={showResolved} onChange={setShowResolved} label="Show Resolved" />
          <Toggle checked={showAgg} onChange={setShowAgg} label="Aggregated" />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => qc.invalidateQueries({ queryKey: ['testing'] })}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border-subtle bg-bg-surface text-muted-foreground outline-none transition-all hover:text-brand"
            aria-label="Refresh findings"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <TimeFilter value={timeRange} onChange={setTimeRange} />
        </div>
      </div>

      {/* Severity summary bar */}
      <div className="flex h-2 overflow-hidden rounded-xl border border-border-subtle">
        {severityData.map(d => d.value > 0 && (
          <div key={d.name} className="h-full transition-all duration-700" style={{ width: `${(d.value / Math.max(totalIssues, 1)) * 100}%`, background: d.color }} />
        ))}
        {totalIssues === 0 && <div className="h-full w-full bg-bg-elevated" />}
      </div>

      {/* Metrics row — one across on the narrowest phones, four on desktop */}
      <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 lg:grid-cols-4">
        {([
          { label: 'Total Issues', value: totalIssues, icon: AlertTriangle, color: 'var(--brand)', bg: 'var(--bg-selected)' },
          { label: 'Critical Open', value: sev.CRITICAL ?? 0, icon: XCircle, color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
          { label: 'Resolved', value: fixedIssues, icon: CheckCircle2, color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
          { label: 'Open', value: openIssues, icon: Info, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
        ]).map((item, i) => (
          <div key={item.label} className={`animate-stagger-${i + 1}`}>
            <MetricWidget
              label={item.label}
              value={item.value}
              icon={item.icon}
              iconColor={item.color}
              iconBg={item.bg}
            />
          </div>
        ))}
      </div>

      {/* Chart + Donut row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassCard variant="default" className="p-4 lg:col-span-2">
          <div className="mb-3 flex w-fit flex-wrap gap-1 rounded-lg bg-bg-base p-0.5">
            {[
              { key: 'total' as const, label: 'Total', color: 'var(--brand)' },
              { key: 'open' as const, label: 'Open', color: '#EF4444' },
              { key: 'resolved' as const, label: 'Resolved', color: '#22C55E' },
            ].map(({ key, label, color }) => (
              <button key={key} onClick={() => setChartTab(key)} className={`rounded-md px-3 py-1.5 text-[11px] font-semibold outline-none transition-all duration-200 ${chartTab === key ? 'bg-bg-elevated text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'}`}>
                <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full" style={{ background: chartTab === key ? color : 'transparent' }} />
                {label}
              </button>
            ))}
          </div>
          <AreaChartComponent data={timelineData} xKey="date" areas={[{ key: chartTab, label: chartTab, color: chartTab === 'total' ? '#632CA6' : chartTab === 'open' ? '#EF4444' : '#22C55E' }]} height={180} />
        </GlassCard>

        <GlassCard variant="default" className="flex flex-col items-center justify-center p-4">
          <span className="mb-3 w-full text-[11px] font-semibold uppercase tracking-wider text-text-muted">Severity</span>
          <DonutChart data={severityData} centerValue={openIssues} centerLabel="Open" size={130} innerRadius={40} outerRadius={60} showLegend />
        </GlassCard>
      </div>

      {isError && <QueryError message="Failed to load vulnerabilities" onRetry={() => refetch()} />}

      {/* List header + bulk actions */}
      <div className="flex flex-col gap-3 px-1 lg:flex-row lg:items-center lg:justify-between">
        <span className="text-sm font-bold text-text-primary">
          Vulnerability List
          <span className="ml-2 font-mono text-[11px] font-medium tabular-nums text-text-muted">
            {rows.length} shown · {total} total
          </span>
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {selected.size > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-text-muted">{selected.size} selected</span>
              <select
                value={bulkStatus}
                onChange={e => setBulkStatus(e.target.value)}
                aria-label="Bulk status"
                className="rounded-md border border-border-subtle bg-bg-elevated px-2 py-1 text-[11px] outline-none"
              >
                <option value="FALSE_POSITIVE">Mark False Positive</option>
                <option value="IGNORED">Ignore</option>
                <option value="OPEN">Reopen</option>
                <option value="CLOSED">Resolve</option>
              </select>
              <button
                onClick={applyBulkStatus}
                disabled={bulkMutation.isPending}
                className="flex items-center gap-1.5 rounded-lg border border-sev-medium/20 bg-sev-medium/10 px-3 py-1.5 text-xs font-semibold text-sev-medium outline-none transition-all hover:bg-sev-medium/20 disabled:opacity-50"
              >
                <Zap size={13} /> {bulkMutation.isPending ? 'Applying…' : 'Apply'}
              </button>
              <button
                onClick={() => setSelected(new Set())}
                className="rounded-md border border-border-subtle px-2 py-1 text-[11px] text-text-muted hover:text-text-primary"
              >
                Clear
              </button>
            </div>
          )}
          <button className="flex items-center gap-1.5 rounded-lg border border-sev-medium/20 bg-sev-medium/10 px-3 py-1.5 text-xs font-semibold text-sev-medium outline-none transition-all hover:bg-sev-medium/20">
            <Zap size={13} /> Revalidate
          </button>
          <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
            <span className="font-mono tabular-nums">
              {page * pageSize + 1}-{Math.min((page + 1) * pageSize, total)} of {total}
            </span>
            <div className="flex gap-1">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="rounded-md border border-border-subtle bg-bg-elevated px-2 py-1 text-[11px] transition-all hover:border-brand/20 disabled:opacity-30">Prev</button>
              <button disabled={(page + 1) * pageSize >= total} onClick={() => setPage(p => p + 1)} className="rounded-md border border-border-subtle bg-bg-elevated px-2 py-1 text-[11px] transition-all hover:border-brand/20 disabled:opacity-30">Next</button>
            </div>
          </div>
          <button className="rounded-md p-1.5 text-text-muted outline-none transition-colors hover:bg-bg-elevated hover:text-text-primary" aria-label="Filters"><Filter size={14} /></button>
        </div>
      </div>

      {/*
        The table renders as a real table on desktop and as labelled cards on
        phones; activating a row opens the full finding record in the
        responsive detail surface.
      */}
      <div className="rounded-xl border border-border-subtle bg-bg-surface">
        <ResponsiveTable
          data={rows as AktoIssue[]}
          columns={issueColumns}
          label="Vulnerability list"
          isLoading={isLoading}
          emptyMessage="No vulnerabilities found. Run a test to start scanning."
          keyExtractor={row => row.id}
          detail={issueDetail}
        />
      </div>
    </div>
  );
};

export default Vulnerabilities;





