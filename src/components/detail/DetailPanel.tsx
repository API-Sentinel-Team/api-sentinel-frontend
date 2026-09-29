import React, { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';

export interface DetailPanelProps {
  open: boolean;
  onClose: () => void;
  /** Heading shown in the panel header. */
  title: React.ReactNode;
  /** Muted second line (identifier, endpoint, timestamp). */
  subtitle?: React.ReactNode;
  /** Severity / status stamp rendered alongside the title. */
  stamp?: React.ReactNode;
  /** Body content — usually `DetailSection` blocks. */
  children: React.ReactNode;
  /** Sticky action row at the bottom of the panel. */
  footer?: React.ReactNode;
  /** Desktop panel width in px (clamped to 92vw). */
  width?: number;
  /** Accessible name when `title` is not plain text. */
  ariaLabel?: string;
}

/**
 * Responsive detail surface.
 *
 * Desktop (>= 1024px): right-hand side sheet, full height, 480–620px wide —
 * the console keeps the table visible behind it.
 * Phone/tablet: bottom sheet capped at 90vh with a grab handle, because a
 * side sheet at 380px leaves nothing readable.
 *
 * Both modes render through a portal so the panel is never clipped by the
 * workspace scroll container (`#app-content`), and both lock page scroll,
 * close on Escape, and restore focus to the element that opened them.
 */
export const DetailPanel: React.FC<DetailPanelProps> = ({
  open,
  onClose,
  title,
  subtitle,
  stamp,
  children,
  footer,
  width = 560,
  ariaLabel,
}) => {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;

    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    const focusTimer = window.setTimeout(() => panelRef.current?.focus(), 0);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus?.();
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  const panel = (
    <div className="fixed inset-0 z-[80]" data-detail-panel-root>
      <button
        type="button"
        aria-label="Dismiss details"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-black/45 backdrop-blur-[2px]"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel || (typeof title === 'string' ? title : 'Details')}
        tabIndex={-1}
        style={{
          ...(isDesktop ? { width: `min(${width}px, 92vw)` } : {}),
          // Solid surface: a translucent panel over a busy table hurts
          // readability of the very details this surface exists to show.
          background: 'color-mix(in srgb, var(--bg-base) 90%, var(--bg-elevated))',
        }}
        className={cn(
          'absolute flex flex-col overflow-hidden border border-border-subtle shadow-2xl outline-none',
          isDesktop
            ? 'inset-y-0 right-0 animate-detail-in-right rounded-l-[22px]'
            : 'inset-x-0 bottom-0 max-h-[90vh] animate-detail-in-bottom rounded-t-[22px]',
        )}
      >
        {/* Mobile grab handle — signals "drag/tap away to dismiss". */}
        {!isDesktop ? (
          <div className="flex justify-center pt-2.5">
            <span className="h-1 w-10 rounded-full bg-border-default" aria-hidden />
          </div>
        ) : null}

        <header className="flex items-start justify-between gap-3 border-b border-border-subtle px-4 py-3.5 sm:px-5">
          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h2 className="min-w-0 truncate text-sm font-semibold tracking-tight text-text-primary">
                {title}
              </h2>
              {stamp}
            </div>
            {subtitle ? (
              <div className="mt-1 min-w-0 break-all font-mono text-[11px] leading-relaxed text-text-muted">
                {subtitle}
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border-subtle bg-bg-surface text-text-muted transition-colors hover:border-brand/30 hover:text-brand"
          >
            <X size={15} />
          </button>
        </header>

        <div className="detail-body min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
          {children}
        </div>

        {footer ? (
          <footer className="flex flex-wrap items-center gap-2 border-t border-border-subtle bg-bg-surface/60 px-4 py-3 sm:px-5">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  );

  if (typeof document === 'undefined') return panel;
  return createPortal(panel, document.body);
};

export default DetailPanel;
