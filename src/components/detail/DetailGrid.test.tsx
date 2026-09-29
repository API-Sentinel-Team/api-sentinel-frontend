import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DetailGrid, DetailField, DetailSection, DetailCode } from './DetailGrid';

describe('DetailField', () => {
  it('renders the label and full value', () => {
    render(
      <DetailGrid>
        <DetailField label="Endpoint" value="/api/v1/orders/12345" mono />
      </DetailGrid>,
    );
    expect(screen.getByText('Endpoint')).toBeInTheDocument();
    expect(screen.getByText('/api/v1/orders/12345')).toBeInTheDocument();
  });

  it('renders an em dash for absent values instead of collapsing', () => {
    render(
      <DetailGrid>
        <DetailField label="Collection" value={undefined} />
      </DetailGrid>,
    );
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('shows a copy control when copyValue is provided', () => {
    render(
      <DetailGrid>
        <DetailField label="Finding ID" value="abc-123" copyValue="abc-123" />
      </DetailGrid>,
    );
    expect(screen.getByRole('button', { name: /copy finding id/i })).toBeInTheDocument();
  });

  it('applies the full-span marker for long values', () => {
    render(
      <DetailGrid>
        <DetailField label="Endpoint" value="https://example.com" span="full" />
      </DetailGrid>,
    );
    expect(document.querySelector('.detail-field[data-span="full"]')).not.toBeNull();
  });
});

describe('DetailSection', () => {
  it('renders open by default', () => {
    render(
      <DetailSection title="Finding" code="§1">
        <p>section body</p>
      </DetailSection>,
    );
    expect(screen.getByText('Finding')).toBeInTheDocument();
    expect(screen.getByText('section body')).toBeInTheDocument();
  });

  it('collapses and expands on the heading toggle', () => {
    render(
      <DetailSection title="Evidence" collapsible defaultOpen={false}>
        <p>hidden evidence</p>
      </DetailSection>,
    );

    expect(screen.queryByText('hidden evidence')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /evidence/i }));
    expect(screen.getByText('hidden evidence')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /evidence/i }));
    expect(screen.queryByText('hidden evidence')).not.toBeInTheDocument();
  });

  it('shows the count chip when provided', () => {
    render(
      <DetailSection title="Findings" count={7}>
        <p>rows</p>
      </DetailSection>,
    );
    expect(screen.getByText('7')).toBeInTheDocument();
  });
});

describe('DetailCode', () => {
  it('renders the verbatim value inside a pre block', () => {
    render(<DetailCode label="Request" value={"curl -X GET 'https://api.example.com'"} />);
    expect(screen.getByText("curl -X GET 'https://api.example.com'")).toBeInTheDocument();
    expect(screen.getByText('Request')).toBeInTheDocument();
  });
});
