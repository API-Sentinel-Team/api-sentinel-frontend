import React, { useMemo } from 'react';
import SentinelArea, { SentinelDonut, SentinelHBars, SentinelVBars, type ChartSeries } from '@/components/charts/SentinelCharts';
import type { LiveLogEntry } from '@/lib/realtime';
import { cn } from '@/lib/utils';

export interface SignalTimelinePoint {
  date: string;
  total: number;
  blocked: number;
  successful: number;
}

interface SignalBoardProps {
  timeline: SignalTimelinePoint[];
  range: '24h' | '7d';
  severity?: { HIGH?: number; MEDIUM?: number; LOW?: number };
  categories: { name: string; count: number }[];
  live: LiveLogEntry[];
  connected: boolean;
}

/**
 * Buckets live stream frames into per-minute request/threat counts.
 * All values come from real websocket frames — nothing generated.
 */
export function bucketLiveTraffic(logs: LiveLogEntry[], minutes = 12): { label: string; requests: number; threats: number }[] {
  if (logs.length === 0) return [];
  const buckets: { label: string; requests: number; threats: number }[] = [];
  for (let m = minutes - 1; m >= 0; m -= 1) {
    buckets.push({ label: m === 0 ? 'now' : `-${m}m`, requests: 0, threats: 0 });
  }

  const now = Date.now();
  for (const log of logs) {
    const ts = new Date(log.timestamp).getTime();
    if (!Number.isFinite(ts)) continue;
    // Floor the age to a whole minute: a frame is never dropped by a
    // millisecond boundary and never counted in two buckets at once.
    let ageMin = Math.floor((now - ts) / 60_000);
    if (ageMin < 0) ageMin = 0; // clock skew: treat future-dated frames as "now"
    if (ageMin >= minutes) continue;
    const bucket = buckets[minutes - 1 - ageMin];
    bucket.requests += 1;
    if (log.attacks.length > 0) bucket.threats += 1;
  }
  return buckets;
}

const BAR_CLS = ['bar-blue', 'bar-green', 'bar-amber', 'bar-red', 'bar-purple', 'bar-teal', 'bar-brand'];


/** Four diagrams fed by real sources: trend API, severity API, category API, live stream. */
export const SignalBoard: React.FC<SignalBoardProps> = ({
  timeline,
  range,
  severity,
  categories,
  live,
  connected,
}) => {
  const requestSeries: ChartSeries[] = useMemo(() => {
    if (timeline.length === 0) return [];
    return [
      { name: 'Events', cls: 's-4', points: timeline.map((d) => d.total) },
      { name: 'Blocked', cls: 's-5', points: timeline.map((d) => d.blocked) },
    ];
  }, [timeline]);

  const labels = useMemo(() => timeline.map((d) => d.date), [timeline]);

  const severityRows = useMemo(() => {
    const sev = severity ?? {};
    const entries = [
      { label: 'High', value: sev.HIGH ?? 0, cls: 'seg-high' },
      { label: 'Medium', value: sev.MEDIUM ?? 0, cls: 'seg-medium' },
      { label: 'Low', value: sev.LOW ?? 0, cls: 'seg-low' },
    ];
    if (entries.every((e) => e.value === 0)) return [];
    return entries;
  }, [severity]);

  const severityTotal = severityRows.reduce((sum, row) => sum + row.value, 0);
  const pulse = useMemo(() => bucketLiveTraffic(live), [live]);
  const pulseTotals = useMemo(() => ({
    requests: pulse.reduce((sum, b) => sum + b.requests, 0),
    threats: pulse.reduce((sum, b) => sum + b.threats, 0),
  }), [pulse]);

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      <section className="evd-panel min-w-0 xl:col-span-7" data-exhibit="EXH-06A" aria-label="Event volume chart">
        <div className="section-rule">
          <h3 className="section-h">Event volume</h3>
          <span className="evd-mono text-[10px] tracking-[0.08em] text-brand">
            {range === '24h' ? 'LAST 24 HOURS' : 'LAST 7 DAYS'}
          </span>
          <span className="text-[11px] text-text-muted sm:ml-auto">Issues trend API · events vs blocked</span>
        </div>
        {requestSeries.length > 0 ? (
          <SentinelArea series={requestSeries} labels={labels} emptyMessage="No event frames in this window yet." />
        ) : (
          <p className="chart-empty" role="status">No event frames in this window yet — charts appear once sensors or scans record traffic.</p>
        )}
      </section>


      <section className="evd-panel min-w-0 xl:col-span-5" data-exhibit="EXH-06B" aria-label="Severity mix chart">
        <div className="section-rule">
          <h3 className="section-h">Severity mix</h3>
          <span className="evd-mono text-[10px] tracking-[0.08em] text-brand">SECURITY EVENTS</span>
        </div>
        {severityRows.length > 0 ? (
          <SentinelDonut
            slices={severityRows.map((row) => ({ label: row.label, value: row.value, cls: row.cls }))}
            centerLabel="events"
            centerValue={severityTotal.toLocaleString()}
          />
        ) : (
          <p className="chart-empty" role="status">No severity counts yet — run a scan or wait for sensor traffic.</p>
        )}
      </section>

      <section className="evd-panel min-w-0 xl:col-span-7" data-exhibit="EXH-06C" aria-label="Threat category chart">
        <div className="section-rule">
          <h3 className="section-h">Threat categories</h3>
          <span className="evd-mono text-[10px] tracking-[0.08em] text-brand">{categories.length} ACTIVE</span>
          <span className="text-[11px] text-text-muted sm:ml-auto">Detection pipeline output</span>
        </div>
        {categories.length > 0 ? (
          <SentinelHBars
            rows={categories.map((cat, index) => {
              const max = Math.max(1, categories[0]?.count ?? 1);
              return {
                label: cat.name,
                value: cat.count.toLocaleString(),
                pct: (cat.count / max) * 100,
                cls: BAR_CLS[index % BAR_CLS.length],
              };
            })}
          />
        ) : (
          <p className="chart-empty" role="status">Categories appear once detections land from traffic or scans.</p>
        )}
      </section>


      <section className="evd-panel min-w-0 xl:col-span-5" data-exhibit="EXH-06D" aria-label="Live traffic pulse">
        <div className="section-rule">
          <h3 className="section-h">Live pulse</h3>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em]',
              connected ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-700',
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
            {connected ? 'Live' : 'Paused'}
          </span>
          <span className="text-[11px] text-text-muted sm:ml-auto">
            {pulseTotals.requests.toLocaleString()} requests · {pulseTotals.threats.toLocaleString()} threats / 12m
          </span>
        </div>
        {pulse.length > 0 ? (
          <SentinelVBars
            bars={pulse.map((bucket) => ({
              label: bucket.label,
              value: bucket.requests,
              cls: bucket.threats > 0 ? 'bar-red' : 'bar-brand',
            }))}
            showValues={false}
          />
        ) : (
          <p className="chart-empty" role="status">
            {connected
              ? 'Stream open — bars appear as frames arrive.'
              : 'Open Live Feed after sensors ingest traffic to start the live pulse.'}
          </p>
        )}
      </section>
    </div>
  );
};

export default SignalBoard;
