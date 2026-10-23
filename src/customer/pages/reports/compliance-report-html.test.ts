import { describe, expect, it } from 'vitest';
import { buildComplianceReportHtml, escapeHtml } from './compliance-report-html';

const base = {
  frameworkName: 'OWASP API Top 10 (2023)',
  date: '20 October 2026',
  year: 2026,
  totalFindings: 2,
  posture: 'Good',
  postureColor: '#EAB308',
};

describe('escapeHtml', () => {
  it('escapes the five HTML-significant characters', () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
  });
});

describe('buildComplianceReportHtml', () => {
  it('escapes finding values that come from discovered traffic', () => {
    const html = buildComplianceReportHtml({
      ...base,
      sections: {
        '<b>API1</b>': [{ title: '<img src=x onerror=alert(1)>', endpoint: '/v1/<script>alert(1)</script>', severity: 'HIGH' }],
      },
    });
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).not.toContain('<img src=x');
    expect(html).not.toContain('<b>API1</b>');
    expect(html).toContain('/v1/&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('escapes the framework name', () => {
    const html = buildComplianceReportHtml({ ...base, frameworkName: '<i>x</i>', sections: {} });
    expect(html).not.toContain('<i>x</i>');
  });

  it('does not put commas between sections', () => {
    const html = buildComplianceReportHtml({
      ...base,
      sections: {
        API1: [{ title: 'A', endpoint: '/a', severity: 'CRITICAL' }],
        API2: [{ title: 'B', endpoint: '/b', severity: 'HIGH' }],
      },
    });
    expect(html).not.toMatch(/<\/tr>\s*,\s*<tr>/);
  });

  it('uses readable dark text for table rows on the white page', () => {
    const html = buildComplianceReportHtml({ ...base, sections: { API1: [{ title: 'A', endpoint: '/a', severity: 'LOW' }] } });
    expect(html.toLowerCase()).not.toContain('#e8edf3');
    expect(html.toLowerCase()).not.toContain('#94a3b8');
  });

  it('ignores unknown severity values when choosing a colour', () => {
    const html = buildComplianceReportHtml({
      ...base,
      sections: { API1: [{ title: 'A', endpoint: '/a', severity: 'red;background:url(x)' }] },
    });
    expect(html).not.toMatch(/style="[^"]*background:url\(x\)/);
  });
});
