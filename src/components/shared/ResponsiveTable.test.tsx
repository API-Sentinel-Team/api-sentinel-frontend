import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResponsiveTable, type Column, type RowDetail } from './ResponsiveTable';

interface Row {
  id: string;
  method: string;
  endpoint: string;
  severity: string;
  note?: string;
}

const ROWS: Row[] = [
  { id: 'a', method: 'GET', endpoint: '/api/v1/orders/12345?filter=very-long', severity: 'HIGH', note: 'internal only' },
  { id: 'b', method: 'POST', endpoint: '/api/v1/login', severity: 'LOW', note: 'public' },
];

const COLUMNS: Column<Row>[] = [
  { key: 'method', label: 'Method', priority: 0 },
  { key: 'endpoint', label: 'Endpoint', priority: 1 },
  { key: 'severity', label: 'Severity', priority: 2 },
];

const detail = (row: Row): RowDetail => ({
  title: row.method,
  subtitle: row.endpoint,
  content: <p>full record for {row.id}</p>,
});

function mockWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
}

describe('ResponsiveTable — desktop', () => {
  beforeEach(() => mockWidth(1440));
  afterEach(() => mockWidth(1024));

  it('renders a real table with all column headers', () => {
    render(<ResponsiveTable data={ROWS} columns={COLUMNS} label="Findings" />);
    expect(screen.getByRole('table')).toBeInTheDocument();
    for (const heading of ['Method', 'Endpoint', 'Severity']) {
      expect(screen.getByText(heading)).toBeInTheDocument();
    }
  });

  it('shows the loading skeleton', () => {
    render(<ResponsiveTable data={[]} columns={COLUMNS} isLoading />);
    expect(document.querySelector('.animate-pulse')).not.toBeNull();
  });

  it('shows the empty message when there are no rows', () => {
    render(<ResponsiveTable data={[]} columns={COLUMNS} emptyMessage="No findings yet" />);
    expect(screen.getByText('No findings yet')).toBeInTheDocument();
  });

  it('opens the detail panel on row activation (click)', () => {
    render(<ResponsiveTable data={ROWS} columns={COLUMNS} label="Findings" detail={detail} />);
    fireEvent.click(screen.getByText('/api/v1/login'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('full record for b')).toBeInTheDocument();
  });

  it('opens the detail panel on Enter key', () => {
    render(<ResponsiveTable data={ROWS} columns={COLUMNS} detail={detail} />);
    const row = screen.getByText('/api/v1/login').closest('tr');
    fireEvent.keyDown(row!, { key: 'Enter' });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes the detail panel with the close button', () => {
    render(<ResponsiveTable data={ROWS} columns={COLUMNS} detail={detail} />);
    fireEvent.click(screen.getByText('/api/v1/login'));
    fireEvent.click(screen.getByRole('button', { name: /close details/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('ResponsiveTable — phone cards', () => {
  beforeEach(() => mockWidth(375));
  afterEach(() => mockWidth(1024));

  it('renders labelled cards with full, non-truncated values', () => {
    render(<ResponsiveTable data={ROWS} columns={COLUMNS} detail={detail} />);
    const cards = screen.getByTestId('responsive-table-cards');
    expect(cards).toBeInTheDocument();
    // Both records appear with every non-hidden field label.
    expect(screen.getAllByText('Endpoint')).toHaveLength(2);
    expect(screen.getByText('/api/v1/orders/12345?filter=very-long')).toBeInTheDocument();
  });

  it('opens the detail panel from a card', () => {
    render(<ResponsiveTable data={ROWS} columns={COLUMNS} detail={detail} />);
    fireEvent.click(screen.getByText('/api/v1/orders/12345?filter=very-long'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('full record for a')).toBeInTheDocument();
  });

  it('drops columns marked hideOnMobile from cards', () => {
    const columns: Column<Row>[] = [
      ...COLUMNS,
      { key: 'note', label: 'Hidden Col', hideOnMobile: true },
    ];
    render(<ResponsiveTable data={ROWS} columns={columns} />);
    expect(screen.queryByText('Hidden Col')).not.toBeInTheDocument();
    expect(screen.queryByText('internal only')).not.toBeInTheDocument();
  });
});
