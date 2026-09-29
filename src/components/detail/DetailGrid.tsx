import React, { useState } from 'react';
import { Check, ChevronDown, ChevronRight, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Detail primitives for the case-file / evidence language.
 *
 * The rule these enforce: a field's full value is always readable at every
 * viewport. Nothing here truncates — long identifiers wrap
 * (`overflow-wrap: anywhere` from `.detail-field dd`) and any value can be
 * copied in one click, because operators paste these into tickets.
 */

export type DetailTone = 'default' | 'critical' | 'high' | 'medium' | 'low' | 'info' | 'brand';

const TONE_COLOR: Record<DetailTone, string | undefined> = {
  default: undefined,
  critical: 'var(--sev-critical)',
  high: 'var(--sev-high)',
  medium: 'var(--sev-medium)',
  low: 'var(--sev-low)',
  info: 'var(--sev-info)',
  brand: 'var(--brand)',
};

/** Copy-to-clipboard control sized for dense detail rows. */
export const DetailCopy: React.FC<{ value: string; label?: string; className?: string }> = ({
  value,
  label = 'Copy',
  className,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard permission denied — nothing to recover from.
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? 'Copied' : `Copy ${label.toLowerCase()}`}
      aria-label={copied ? 'Copied' : `Copy ${label.toLowerCase()}`}
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-md border border-border-subtle px-1.5 py-0.5',
        'text-[10px] font-semibold text-text-muted transition-colors',
        'hover:border-brand/30 hover:text-brand',
        className,
      )}
    >
      {copied ? <Check size={10} /> : <Copy size={10} />}
    </button>
  );
};

export interface DetailFieldProps {
  /** Field name shown in the left gutter (or above the value under 640px). */
  label: string;
  /** Explicit value. Ignored when `children` is provided. */
  value?: React.ReactNode;
  /** Rendered instead of `value` — use for badges, links, lists. */
  children?: React.ReactNode;
  /** Severity / status colour for the value text. */
  tone?: DetailTone;
  /** Monospace value (identifiers, paths, hashes, timestamps). */
  mono?: boolean;
  /** Span the full grid width — use for long URLs, bodies, descriptions. */
  span?: 'auto' | 'full';
  /** Adds a copy button holding exactly this string. */
  copyValue?: string;
  /** Native tooltip (browser shows the full text even when narrow). */
  title?: string;
  className?: string;
}

/** One labelled value. Renders `—` for absent data instead of collapsing. */
export const DetailField: React.FC<DetailFieldProps> = ({
  label,
  value,
  children,
  tone = 'default',
  mono = false,
  span = 'auto',
  copyValue,
  title,
  className,
}) => {
  const isEmpty =
    !children && (value === null || value === undefined || value === '' || value === false);
  const rendered = children ?? (isEmpty ? <span className="text-text-disabled">—</span> : value);

  return (
    <div className={cn('detail-field', className)} data-span={span} data-field={label}>
      <dt>{label}</dt>
      <dd className={cn(mono && 'is-mono')} style={{ color: TONE_COLOR[tone] }} title={title}>
        <span className="inline-flex min-w-0 flex-wrap items-center gap-1.5 align-top">
          <span className="min-w-0">{rendered}</span>
          {copyValue ? <DetailCopy value={copyValue} label={label} /> : null}
        </span>
      </dd>
    </div>
  );
};

/** Grouping container matching the grid used by `.detail-field`. */
export const DetailGrid: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <dl className={cn('detail-grid', className)} data-detail-grid>
    {children}
  </dl>
);

export interface DetailSectionProps {
  /** Section heading, e.g. "Request", "Evidence", "Remediation". */
  title: string;
  /** Optional short code shown before the title (e.g. "§3", "EVID-02"). */
  code?: string;
  /** Count chip on the right of the heading. */
  count?: number;
  /** Sentence under the heading explaining what the section holds. */
  description?: string;
  /** Collapsed sections keep the sheet short on small screens. */
  collapsible?: boolean;
  defaultOpen?: boolean;
  className?: string;
  children: React.ReactNode;
}

/** Collapsible detail section. Open state is local; the heading row toggles it. */
export const DetailSection: React.FC<DetailSectionProps> = ({
  title,
  code,
  count,
  description,
  collapsible = false,
  defaultOpen = true,
  className,
  children,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const expanded = collapsible ? open : true;

  return (
    <section className={cn('min-w-0', className)} data-detail-section={title}>
      <div className="mb-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 border-b border-border-subtle pb-2">
        {collapsible ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={expanded}
            className="flex items-center gap-1.5 text-left outline-none transition-colors hover:text-brand"
          >
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            <span className="text-[13px] font-semibold tracking-tight text-text-primary">
              {title}
            </span>
          </button>
        ) : (
          <h3 className="text-[13px] font-semibold tracking-tight text-text-primary">{title}</h3>
        )}
        {code ? (
          <span className="evd-mono text-[10px] tracking-[0.08em] text-brand">{code}</span>
        ) : null}
        {typeof count === 'number' ? (
          <span className="rounded-full border border-border-subtle bg-bg-elevated px-2 py-0.5 text-[10px] font-semibold tabular-nums text-text-muted">
            {count}
          </span>
        ) : null}
        {description ? (
          <span className="text-[11px] text-text-muted sm:ml-auto">{description}</span>
        ) : null}
      </div>
      {expanded ? <div className="min-w-0">{children}</div> : null}
    </section>
  );
};

/** Verbatim block for request/response bodies, stack traces, curl repros. */
export const DetailCode: React.FC<{
  value: string;
  label?: string;
  className?: string;
}> = ({ value, label, className }) => (
  <div className={cn('relative min-w-0', className)}>
    {label ? (
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
          {label}
        </span>
        <DetailCopy value={value} label={label} />
      </div>
    ) : null}
    <pre className="detail-quote">{value}</pre>
  </div>
);

export default DetailGrid;

