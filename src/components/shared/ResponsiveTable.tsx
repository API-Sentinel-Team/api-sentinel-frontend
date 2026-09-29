import React, { useCallback, useState } from 'react';
import { ChevronRight, Inbox } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import TableSkeleton from './TableSkeleton';
import TableScroller from './TableScroller';
import DetailPanel from '@/components/detail/DetailPanel';

export interface Column<T> {
  key: keyof T & string;
  label: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  /** Dropped from the phone card layout (kept in the desktop table). */
  hideOnMobile?: boolean;
  /** Order in the phone card layout. Lower renders first. */
  priority?: number;
  align?: 'left' | 'center' | 'right';
  /** Fixed column width on desktop, e.g. "180px". */
  width?: string;
  className?: string;
  /**
   * Replaces the header cell content — use for bulk-select checkboxes or
   * sort controls. The mobile card layout ignores it.
   */
  headerRender?: () => React.ReactNode;
}

/** What the built-in detail panel shows for a row. */
export interface RowDetail {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  stamp?: React.ReactNode;
  content: React.ReactNode;
  footer?: React.ReactNode;
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  onRowClick?: (row: T) => void;
  keyExtractor?: (row: T, index: number) => string;
  className?: string;
  /** Accessible name for the scrollable table region. */
  label?: string;
  /** Row height. `compact` fits roughly 40% more rows without scrolling. */
  density?: 'comfortable' | 'compact';
  stickyHeader?: boolean;
  /**
   * Enables the responsive detail surface: activating a row opens a
   * right-hand sheet on desktop and a bottom sheet on phones, so the full
   * record is readable instead of squeezed into a cell.
   */
  detail?: (row: T) => RowDetail;
  /** Total override for the phone presentation of a row. */
  mobileCard?: (row: T, index: number) => React.ReactNode;
}

const ALIGN: Record<'left' | 'center' | 'right', string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

/**
 * The console's standard data table.
 *
 * Behaviour by width:
 * - Desktop: real table with a sticky head inside an overflow-aware scroller.
 * - Phone: one card per record with labelled fields, wrapping long values
 *   instead of truncating them. Every column not marked `hideOnMobile`
 *   survives, so no data is lost on small screens.
 * - Any width: when `detail` is provided, activating a row opens the full
 *   record in `DetailPanel` (Enter/Space on desktop, tap on phones).
 */
export function ResponsiveTable<T extends Record<string, unknown>>({
  data,
  columns,
  isLoading = false,
  emptyMessage = 'No data available',
  emptyIcon,
  onRowClick,
  keyExtractor,
  className = '',
  label,
  density = 'comfortable',
  stickyHeader = true,
  detail,
  mobileCard,
}: ResponsiveTableProps<T>) {
  const isMobile = useIsMobile();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const rowId = useCallback(
    (row: T, index: number) => (keyExtractor ? keyExtractor(row, index) : String(index)),
    [keyExtractor],
  );

  const cellPad = density === 'compact' ? 'px-3 py-2' : 'px-4 py-3';

  const rowActivate = useCallback(
    (row: T, index: number) => {
      if (onRowClick) {
        onRowClick(row);
        return;
      }
      if (detail) setActiveIndex(index);
    },
    [detail, onRowClick],
  );

  const interactive = Boolean(onRowClick || detail);

  if (isLoading) {
    return <TableSkeleton columns={columns.length} rows={6} />;
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
        <div className="text-text-muted">{emptyIcon ?? <Inbox size={38} strokeWidth={1.2} />}</div>
        <p className="text-xs text-text-muted">{emptyMessage}</p>
      </div>
    );
  }

  const activeRow = activeIndex !== null ? data[activeIndex] : null;
  const activeDetail = detail && activeRow ? detail(activeRow) : null;

  return (
    <>
      {isMobile ? (
        <div className={cn('tbl-cards', className)} data-testid="responsive-table-cards">
          {data.map((row, index) => {
            const id = rowId(row, index);

            if (mobileCard) {
              return (
                <div key={id} className="tbl-card" data-row>
                  {mobileCard(row, index)}
                </div>
              );
            }

            const visible = columns
              .filter((c) => !c.hideOnMobile)
              .slice()
              .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));

            return (
              <button
                key={id}
                type="button"
                data-row
                disabled={!interactive}
                onClick={() => rowActivate(row, index)}
                className="tbl-card text-left"
              >
                <div className="space-y-2">
                  {visible.map((col) => (
                    <div key={col.key} className="flex items-start justify-between gap-3">
                      <span className="shrink-0 pt-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-text-muted">
                        {col.label}
                      </span>
                      <span className="min-w-0 flex-1 text-right text-[12px] font-medium text-text-primary [overflow-wrap:anywhere]">
                        {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '—')}
                      </span>
                    </div>
                  ))}
                </div>
                {interactive ? (
                  <span className="mt-3 flex items-center justify-end gap-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-brand">
                    Details <ChevronRight size={11} />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : (
        <TableScroller label={label} className={className}>
          <table className="w-full min-w-full text-sm">
            <thead className={cn(stickyHeader && 'tbl-sticky')}>
              <tr className="border-b border-border-subtle bg-bg-base/50">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    style={col.width ? { width: col.width } : undefined}
                    className={cn(
                      'whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted',
                      ALIGN[col.align ?? 'left'],
                      col.className,
                    )}
                  >
                    {col.headerRender ? col.headerRender() : col.label}
                  </th>
                ))}
                {interactive ? <th className="w-10 px-2 py-3" aria-label="Open details" /> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {data.map((row, index) => (
                <tr
                  key={rowId(row, index)}
                  data-row
                  tabIndex={interactive ? 0 : undefined}
                  onClick={interactive ? () => rowActivate(row, index) : undefined}
                  onKeyDown={
                    interactive
                      ? (event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            rowActivate(row, index);
                          }
                        }
                      : undefined
                  }
                  className={cn(
                    'row-strip',
                    interactive && 'cursor-pointer hover:bg-bg-hover focus:bg-bg-hover',
                  )}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn(cellPad, ALIGN[col.align ?? 'left'], 'align-top')}>
                      <div className="min-w-0">
                        {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '—')}
                      </div>
                    </td>
                  ))}
                  {interactive ? (
                    <td className="px-2 py-3 text-right">
                      <ChevronRight
                        size={14}
                        className="hv-reveal ml-auto text-text-muted"
                        aria-hidden
                      />
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </TableScroller>

      )}
      {activeDetail ? (
        <DetailPanel
          open
          onClose={() => setActiveIndex(null)}
          title={activeDetail.title}
          subtitle={activeDetail.subtitle}
          stamp={activeDetail.stamp}
          footer={activeDetail.footer}
          ariaLabel={label}
        >
          {activeDetail.content}
        </DetailPanel>
      ) : null}

    </>
  );
}

export default ResponsiveTable;

