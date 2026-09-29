import React from 'react';

/**
 * Argus-style SVG charts (no dependencies) — the reference frontend's
 * hand-built diagrams, visually identical through the shared chart CSS.
 *
 * Data rule: every component renders exactly what it is given and shows
 * `ChartEmpty` when there is nothing to plot. An empty chart reads as
 * zero, so the components refuse to render bare axes on empty input.
 */

export interface ChartSeries {
  name: string;
  points: number[];
  /** Series class: s-1 … s-6 (drives colour from the CSS palette). */
  cls: string;
  unit?: string;
}

export function ChartEmpty({ message }: { message: string }) {
  return (
    <p className="chart-empty" role="status">
      {message}
    </p>
  );
}

function polyline(points: number[], w: number, h: number, max: number, pad = 6): string {
  const n = Math.max(points.length - 1, 1);
  return points
    .map((v, i) => `${((i / n) * w).toFixed(1)},${(h - pad - (v / max) * (h - pad * 2)).toFixed(1)}`)
    .join(' ');
}

/** Multi-series line chart with soft area fills. `series[0]` draws at the back. */
export function SentinelArea({
  series,
  labels,
  height = 140,
  unit = '',
  emptyMessage,
}: {
  series: ChartSeries[];
  labels: string[];
  height?: number;
  unit?: string;
  emptyMessage?: string;
}) {
  const w = 430;
  const values = series.flatMap((s) => s.points).filter((v) => Number.isFinite(v));
  if (!values.length) return <ChartEmpty message={emptyMessage || 'No observations in this window'} />;
  const max = Math.max(1, ...values);
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f));
  return (
    <div className="chart-v2">
      <div className="chart-v2-y">
        {[...yTicks].reverse().map((t, i) => (
          <span key={i}>
            {t.toLocaleString()}
            {unit && i === 0 ? ` ${unit}` : ''}
          </span>
        ))}
      </div>
      <div className="chart-v2-plot">
        <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" role="img" aria-label="Trend chart">
          {yTicks.map((t, i) => {
            const y = height - 6 - (i / 4) * (height - 12);
            return <line key={i} x1="0" x2={w} y1={y} y2={y} className="grid-line" />;
          })}
          {series.map((s) => {
            const pts = polyline(s.points, w, height, max);
            return (
              <g key={s.name} className={s.cls}>
                <polygon points={`0,${height} ${pts} ${w},${height}`} className="area-fill" />
                <polyline points={pts} className="area-line" />
              </g>
            );
          })}
          {labels.map((l, i) => {
            const n = Math.max(labels.length - 1, 1);
            const slot = w / (labels.length || 1);
            return (
              <rect key={`h${i}`} x={(i / n) * w - slot / 2} y="0" width={slot} height={height} fill="transparent">
                <title>{`${l} · ${series.map((s) => `${s.name}: ${(s.points[i] ?? 0).toLocaleString()}${s.unit ?? unit ? ` ${s.unit ?? unit}` : ''}`).join(' · ')}`}</title>
              </rect>
            );
          })}
        </svg>
        <div className="chart-axis">
          {labels.map((l, i) => (
            <span key={`${l}-${i}`}>{l}</span>
          ))}
        </div>
        {series.length > 1 && (
          <ul className="chart-legend">
            {series.map((s) => (
              <li key={s.name} className={s.cls}>
                <i />
                {s.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export interface ChartSlice {
  label: string;
  value: number;
  /** Segment class: seg-critical, seg-high, seg-medium, seg-low, seg-info, seg-brand … */
  cls: string;
  pct?: string;
}

/** Donut with a centre label and a legend on the right. */
export function SentinelDonut({
  slices,
  centerLabel,
  centerValue,
}: {
  slices: ChartSlice[];
  centerLabel: string;
  centerValue: string;
}) {
  const total = Math.max(1, slices.reduce((a, s) => a + s.value, 0));
  const r = 40;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="donut">
      <svg viewBox="0 0 120 120" role="img" aria-label={centerLabel}>
        <circle cx="60" cy="60" r={r} className="donut-track" />
        {slices.map((s) => {
          const len = (s.value / total) * c;
          const el = (
            <circle
              key={s.label}
              cx="60"
              cy="60"
              r={r}
              className={`donut-seg ${s.cls}`}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 60 60)"
            />
          );
          offset += len;
          return el;
        })}
        <text x="60" y="56" textAnchor="middle" className="donut-value">
          {centerValue}
        </text>
        <text x="60" y="72" textAnchor="middle" className="donut-label">
          {centerLabel}
        </text>
      </svg>
      <ul className="donut-legend">
        {slices.map((s) => (
          <li key={s.label}>
            <i className={s.cls} />
            <span>{s.label}</span>
            <b>
              {s.value.toLocaleString()}
              <em>{s.pct ?? `${((s.value / total) * 100).toFixed(1)}%`}</em>
            </b>
          </li>
        ))}
      </ul>
    </div>
  );
}

export interface BarRow {
  label: string;
  value: React.ReactNode;
  /** Width as % of the largest row. */
  pct: number;
  /** Fill class: bar-brand, bar-blue, bar-green, bar-red, bar-amber, bar-purple, bar-teal. */
  cls?: string;
}

/** Horizontal bar list (severity mix, category share, top endpoints). */
export function SentinelHBars({ rows, valueFirst = false }: { rows: BarRow[]; valueFirst?: boolean }) {
  return (
    <div className="hbar-list">
      {rows.map((r, i) => (
        <div className="hbar-row" key={`${r.label}-${i}`}>
          <span className="hbar-label" title={typeof r.label === 'string' ? r.label : undefined}>
            {r.label}
          </span>
          <div className="hbar-track">
            <i className={r.cls || 'bar-blue'} style={{ width: `${Math.max(2, Math.min(100, r.pct))}%` }} />
          </div>
          <b className="hbar-value">{valueFirst ? `${Math.round(r.pct)}%` : r.value}</b>
        </div>
      ))}
    </div>
  );
}

export interface VBar {
  label: string;
  value: number;
  /** Fill class: bar-brand, bar-blue, bar-green, bar-red, bar-amber, bar-purple, bar-teal. */
  cls?: string;
}

/** Vertical bar chart (requests per minute, findings per day). */
export function SentinelVBars({ bars, showValues = false }: { bars: VBar[]; showValues?: boolean }) {
  const max = Math.max(1, ...bars.map((b) => b.value));
  return (
    <div className="vbar-chart">
      {bars.map((b, i) => (
        <div className="vbar-col" key={`${b.label}-${i}`}>
          {showValues && <b>{b.value.toLocaleString()}</b>}
          <i className={b.cls || 'bar-brand'} style={{ height: `${Math.max(4, (b.value / max) * 100)}%` }} title={`${b.label}: ${b.value}`} />
          <span title={b.label}>{b.label}</span>
        </div>
      ))}
    </div>
  );
}

/** Tiny bar sparkline for metric widgets and headers. */
export function SentinelSpark({ values, cls = 'bar-brand' }: { values: number[]; cls?: string }) {
  const max = Math.max(1, ...values);
  return (
    <div className="mini-bars" role="img" aria-label="Sparkline">
      {values.map((v, i) => (
        <i key={i} className={cls} style={{ height: `${Math.max(6, (v / max) * 100)}%` }} />
      ))}
    </div>
  );
}

export default SentinelArea;

