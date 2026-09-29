import React from 'react';

/**
 * Single source of truth for chart styling, matched to the release
 * governance command-board reference: light surfaces, hairline borders,
 * violet primary, pastel severity accents.
 *
 * Every value is a CSS variable with a hex fallback so charts read the
 * active theme (light/dark) without re-render.
 */

export const CHART = {
  brand: 'var(--brand)',
  brandSolid: '#6D28D9',
  brandLight: 'var(--brand-light)',
  teal: 'var(--accent-teal)',
  grid: 'var(--chart-grid)',
  tick: 'var(--text-muted)',
  cursor: 'var(--chart-cursor)',
  track: 'var(--chart-track)',
} as const;

export const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: 'var(--sev-critical)',
  HIGH: 'var(--sev-high)',
  MEDIUM: 'var(--sev-medium)',
  LOW: 'var(--sev-low)',
  INFO: 'var(--sev-info)',
};

/** Pastel card surfaces from the reference (light) — resolved to vars. */
export const SEVERITY_TINTS: Record<string, string> = {
  CRITICAL: 'var(--sev-critical-tint)',
  HIGH: 'var(--sev-high-tint)',
  MEDIUM: 'var(--sev-medium-tint)',
  LOW: 'var(--sev-low-tint)',
  INFO: 'var(--sev-info-tint)',
};

/** Categorical palette for radar / multi-series diagrams. */
export const CATEGORICAL = [
  '#6D28D9',
  '#0D9488',
  '#2563EB',
  '#D97706',
  '#DC2626',
  '#DB2777',
  '#0891B2',
  '#65A30D',
] as const;

export interface ChartTooltipPayloadItem {
  color?: string;
  name?: string;
  value?: number | string;
  payload?: { color?: string; fill?: string };
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: ChartTooltipPayloadItem[];
  label?: string | number;
  valueSuffix?: string;
}

/** White, hairline-bordered tooltip with mono numerals — reference style. */
export const ChartTooltip: React.FC<ChartTooltipProps> = ({ active, payload, label, valueSuffix }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div
      className="min-w-[140px] rounded-lg border border-border-subtle px-3 py-2.5 shadow-xl"
      style={{ background: 'var(--chart-tooltip-bg)' }}
    >
      {label !== undefined && label !== '' ? (
        <p className="mb-1.5 text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
          {label}
        </p>
      ) : null}
      {payload.map((entry, index) => {
        const dot = entry.color ?? entry.payload?.color ?? entry.payload?.fill;
        return (
          <div key={index} className="flex items-center gap-2 py-0.5 text-[11px]">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: dot }} />
            <span style={{ color: 'var(--text-secondary)' }}>{entry.name}:</span>
            <span className="font-mono font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>
              {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
              {valueSuffix ?? ''}
            </span>
          </div>
        );
      })}
    </div>
  );
};

/** Compact number for axes: 1.2k etc. */
export function compactTick(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return `${value}`;
}
