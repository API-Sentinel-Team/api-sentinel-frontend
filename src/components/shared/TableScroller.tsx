import React, { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type OverflowState = 'none' | 'start' | 'end' | 'middle';

/**
 * Horizontal scroller for wide data tables.
 *
 * Two problems this solves on narrow screens:
 * 1. Operators cannot tell a table continues off-screen, so they read a
 *    partial row and assume the data is missing. This measures real overflow
 *    and exposes it as `data-overflow`, which drives the edge shadows in
 *    `index.css` — so no shadow is ever drawn when nothing is hidden.
 * 2. Keyboard users cannot scroll a region they cannot focus. The scroller is
 *    focusable and labelled, so arrow keys pan it.
 *
 * Vertical scrolling is intentionally left to the page: `overflow-y: visible`
 * keeps position: sticky table heads working against the page scroller.
 */
export const TableScroller: React.FC<{
  children: React.ReactNode;
  className?: string;
  /** Accessible name, e.g. "Vulnerability list". */
  label?: string;
  /** Extra classes applied to the inner measurement wrapper. */
  innerClassName?: string;
}> = ({ children, className, label, innerClassName }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState<OverflowState>('none');

  const measure = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 1) {
      setOverflow('none');
      return;
    }

    const atStart = el.scrollLeft <= 1;
    const atEnd = el.scrollLeft >= maxScroll - 1;
    if (atStart) setOverflow('end');
    else if (atEnd) setOverflow('start');
    else setOverflow('middle');
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    measure();

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(measure);
      observer.observe(el);
      if (el.firstElementChild) observer.observe(el.firstElementChild);
    }

    el.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);

    return () => {
      observer?.disconnect();
      el.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  return (
    <div
      ref={scrollRef}
      className={cn('tbl-scroll', className)}
      data-overflow={overflow}
      data-scrollable={overflow !== 'none' ? 'true' : 'false'}
      tabIndex={overflow === 'none' ? undefined : 0}
      role={label ? 'region' : undefined}
      aria-label={label}
    >
      <div className={cn('min-w-0', innerClassName)}>{children}</div>
    </div>
  );
};

export default TableScroller;
