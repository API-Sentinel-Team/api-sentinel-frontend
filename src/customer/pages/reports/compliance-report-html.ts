import type { ComplianceFinding } from '@/services/testing.service';

// Finding titles and endpoint paths come from discovered traffic, so every value interpolated into
// the printable report must be escaped: the report is written into a same-origin window.
export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#dc2626',
  HIGH: '#dc2626',
  MEDIUM: '#ca8a04',
  LOW: '#16a34a',
};

const CELL = 'padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:12px';

type ReportInput = {
  frameworkName: string;
  date: string;
  year: number;
  sections: Record<string, ComplianceFinding[]>;
  totalFindings: number;
  posture: string;
  postureColor: string;
};

export function buildComplianceReportHtml({
  frameworkName, date, year, sections, totalFindings, posture, postureColor,
}: ReportInput): string {
  const framework = escapeHtml(frameworkName);
  const safeDate = escapeHtml(date);
  const safePosture = escapeHtml(posture);
  const categoryCount = Object.keys(sections).length;

  const rows = Object.entries(sections)
    .flatMap(([section, findings]) =>
      findings.map((f) => {
        const severity = String(f.severity ?? '').toUpperCase();
        return `
        <tr>
          <td style="${CELL};color:#0d1117">${escapeHtml(section)}</td>
          <td style="${CELL};color:#0d1117">${escapeHtml(f.title ?? f.type ?? '-')}</td>
          <td style="${CELL};font-family:monospace;color:#374151">${escapeHtml(f.endpoint ?? f.url ?? '-')}</td>
          <td style="${CELL};font-weight:700;color:${SEVERITY_COLORS[severity] ?? '#374151'}">${escapeHtml(f.severity ?? '-')}</td>
        </tr>`;
      }),
    )
    .join('');

  return `<!DOCTYPE html><html><head><title>Security Compliance Report</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#0d1117;padding:40px}
      .header{border-bottom:3px solid #f97316;padding-bottom:24px;margin-bottom:32px}
      .logo{font-size:24px;font-weight:900;color:#f97316;letter-spacing:-0.5px}
      .subtitle{font-size:13px;color:#6b7280;margin-top:4px}
      .exec-box{background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:24px;margin-bottom:32px}
      .exec-title{font-size:16px;font-weight:700;color:#0d1117;margin-bottom:12px}
      .exec-text{font-size:13px;color:#374151;line-height:1.6}
      .kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:32px}
      .kpi{border:1px solid #e5e7eb;border-radius:8px;padding:20px;text-align:center}
      .kpi-val{font-size:36px;font-weight:900;margin-bottom:4px}
      .kpi-label{font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.5px}
      table{width:100%;border-collapse:collapse;font-size:12px}
      thead tr{background:#f97316}
      thead th{padding:10px 12px;text-align:left;color:#fff;font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:.5px}
      .footer{margin-top:40px;padding-top:20px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;display:flex;justify-content:space-between}
      @media print{body{padding:20px}.kpis{page-break-inside:avoid}thead tr{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
    </style></head><body>
    <div class="header">
      <div class="logo">AEGIS API Security</div>
      <div class="subtitle">Security Compliance Report &mdash; ${framework}</div>
      <div style="margin-top:8px;font-size:12px;color:#6b7280">Generated: ${safeDate} &nbsp;&bull;&nbsp; Classification: CONFIDENTIAL</div>
    </div>
    <div class="exec-box">
      <div class="exec-title">Executive Summary</div>
      <div class="exec-text">
        This report presents the current API security posture against the <strong>${framework}</strong> framework.
        The platform has identified <strong>${totalFindings} open finding${totalFindings !== 1 ? 's' : ''}</strong> across <strong>${categoryCount} control categor${categoryCount !== 1 ? 'ies' : 'y'}</strong>.
        Overall compliance posture is assessed as <strong style="color:${postureColor}">${safePosture}</strong>.
        ${totalFindings === 0 ? 'All monitored APIs are currently compliant with the selected framework.' : 'Immediate attention is recommended for CRITICAL and HIGH severity findings listed below.'}
      </div>
    </div>
    <div class="kpis">
      <div class="kpi"><div class="kpi-val" style="color:#ef4444">${totalFindings}</div><div class="kpi-label">Total Findings</div></div>
      <div class="kpi"><div class="kpi-val" style="color:#f97316">${categoryCount}</div><div class="kpi-label">Failed Controls</div></div>
      <div class="kpi"><div class="kpi-val" style="color:${postureColor}">${safePosture}</div><div class="kpi-label">Compliance Posture</div></div>
    </div>
    ${rows ? `
    <table>
      <thead><tr><th>Category</th><th>Finding</th><th>Endpoint</th><th>Severity</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>` : '<div style="text-align:center;padding:40px;color:#16a34a;font-size:16px;font-weight:700">&#x2713; No compliance violations found</div>'}
    <div class="footer">
      <span>AEGIS &copy; ${year} &mdash; Confidential Security Report</span>
      <span>Framework: ${framework} &mdash; ${safeDate}</span>
    </div>
    </body></html>`;
}
