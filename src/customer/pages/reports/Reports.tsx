import React, { useState } from 'react';
import { RefreshCw, Download, FileText, ChevronDown, CheckCircle, AlertTriangle, Shield, Calendar, X, Play } from 'lucide-react';
import { useComplianceReport, useGenerateExport } from '@/hooks/use-compliance';
import TableSkeleton from '@/components/shared/TableSkeleton';
import GlassCard from '@/components/ui/GlassCard';
import MetricWidget from '@/components/ui/MetricWidget';
import ProgressRing from '@/components/ui/ProgressRing';
import { buildComplianceReportHtml } from './compliance-report-html';

function todayStr() {
  return new Date().toISOString().split('T')[0];
}
function daysAgoStr(n: number) {
  return new Date(Date.now() - n * 86400_000).toISOString().split('T')[0];
}

const Reports: React.FC = () => {
  const [selectedFramework, setSelectedFramework] = useState('OWASP_API_2023');
  const [isExporting, setIsExporting] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [genDateFrom, setGenDateFrom] = useState(daysAgoStr(30));
  const [genDateTo, setGenDateTo] = useState(todayStr());
  const [genFormat, setGenFormat] = useState<'pdf' | 'html' | 'json'>('pdf');
  const [genFramework, setGenFramework] = useState('OWASP_API_2023');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateDone, setGenerateDone] = useState(false);

  const { data: report, isLoading, isError, refetch } = useComplianceReport(selectedFramework);
  const exporter = useGenerateExport();

  const frameworks = [
    { id: 'OWASP_API_2023', name: 'OWASP API Top 10 (2023)' },
    { id: 'GDPR', name: 'GDPR Compliance' },
    { id: 'HIPAA', name: 'HIPAA Security Rule' },
  ];

  const totalFindings = report?.total_open ?? 0;
  const failedControls = report ? Object.keys(report.sections).length : 0;
  const posture = totalFindings === 0 ? 'Optimal' : totalFindings < 5 ? 'Good' : totalFindings < 10 ? 'At Risk' : 'Critical';
  const postureScore = totalFindings === 0 ? 100 : totalFindings < 5 ? 75 : totalFindings < 10 ? 40 : 15;

  const handlePdfExport = () => {
    const frameworkName = frameworks.find(f => f.id === selectedFramework)?.name ?? selectedFramework;
    const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    const sections = report?.sections ?? {};
    const postureColor = totalFindings === 0 ? '#22C55E' : totalFindings < 5 ? '#EAB308' : '#EF4444';

    const html = buildComplianceReportHtml({
      frameworkName,
      date,
      year: new Date().getFullYear(),
      sections,
      totalFindings,
      posture,
      postureColor,
    });

    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); win.focus(); setTimeout(() => { win.print(); }, 500); }
  };

  const handleExport = async (format: string) => {
    setIsExporting(true);
    try {
      const content = await exporter.mutateAsync({ framework: selectedFramework, format });
      if (format === 'html' && typeof content === 'string') {
        const win = window.open('', '_blank');
        win?.document.write(content);
        win?.document.close();
      }
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in w-full pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center">
            <FileText size={18} className="text-brand" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-text-primary">Compliance Reporting</h2>
            <p className="text-[11px] text-text-muted">Mapping vulnerabilities to industry regulatory frameworks</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()} className="w-7 h-7 rounded-lg border border-border-subtle bg-bg-surface flex items-center justify-center text-muted-foreground hover:text-brand transition-all outline-none">
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-bg-surface border border-border-subtle rounded-lg text-xs text-text-primary hover:border-brand/20 transition-all">
              {frameworks.find(f => f.id === selectedFramework)?.name}
              <ChevronDown size={12} />
            </button>
            <div className="absolute top-full right-0 mt-1 w-64 glass-card-premium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
              {frameworks.map(f => (
                <button key={f.id} onClick={() => setSelectedFramework(f.id)}
                  className={`w-full text-left px-4 py-3 text-xs hover:bg-brand/10 hover:text-brand transition-colors ${selectedFramework === f.id ? 'bg-brand/10 text-brand' : 'text-text-primary'}`}>
                  {f.name}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => handlePdfExport()} disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-surface border border-border-subtle text-text-secondary rounded-lg text-xs hover:text-text-primary hover:border-brand/20 transition-all disabled:opacity-50">
            <Download size={13} /> PDF
          </button>
          <button onClick={() => handleExport('html')} disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand text-white font-semibold rounded-lg text-xs hover:bg-brand-dark transition-all disabled:opacity-50">
            <Download size={13} /> {isExporting ? 'Exporting...' : 'HTML'}
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricWidget label="Total Findings" value={totalFindings} icon={AlertTriangle} iconColor="#EF4444" iconBg="rgba(239,68,68,0.1)" />
        <MetricWidget label="Failed Controls" value={failedControls} icon={Shield} iconColor="#F97316" iconBg="rgba(249,115,22,0.1)" />
        <GlassCard variant="elevated" className="p-4 flex items-center gap-4">
          <ProgressRing value={postureScore} max={100} size={80} strokeWidth={7} label="Score" />
          <div>
            <span className="text-[11px] text-text-muted uppercase tracking-wider font-semibold">Compliance Posture</span>
            <p className="text-lg font-bold text-text-primary mt-1">{posture}</p>
            <p className="text-[11px] text-text-muted">{frameworks.find(f => f.id === selectedFramework)?.name}</p>
          </div>
        </GlassCard>
      </div>

      {/* Coverage Notes */}
      <GlassCard variant="default" className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Evidence & Coverage</h3>
          <span className="text-[11px] text-text-muted bg-bg-elevated border border-border-subtle px-2 py-0.5 rounded-full">Evidence-first exports</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="metric-card p-3">
            <p className="text-[11px] text-text-muted uppercase tracking-wider font-semibold">Mapped Controls</p>
            <p className="text-lg font-bold text-text-primary">OWASP / GDPR / HIPAA</p>
            <p className="text-[11px] text-text-muted">Expandable to PCI, SOC 2, EU AI Act</p>
          </div>
          <div className="metric-card p-3">
            <p className="text-[11px] text-text-muted uppercase tracking-wider font-semibold">Evidence Packages</p>
            <p className="text-lg font-bold text-brand">{totalFindings}</p>
            <p className="text-[11px] text-text-muted">Redacted payload + timeline</p>
          </div>
          <div className="metric-card p-3">
            <p className="text-[11px] text-text-muted uppercase tracking-wider font-semibold">Retention</p>
            <p className="text-lg font-bold text-text-primary">90 days</p>
            <p className="text-[11px] text-text-muted">Configurable per tenant</p>
          </div>
        </div>
      </GlassCard>

      {/* Report Content */}
      <div className="bg-bg-surface border border-border-subtle rounded-xl overflow-hidden min-h-[400px]">
        {isLoading ? (
          <div className="p-6"><TableSkeleton columns={3} rows={8} /></div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-text-muted">
            <AlertTriangle size={40} className="mb-4 text-sev-critical" />
            <p className="text-sm">Failed to generate compliance summary.</p>
            <button onClick={() => refetch()} className="mt-3 text-xs text-brand hover:underline">Try again</button>
          </div>
        ) : (
          <div className="p-5 space-y-6">
            {Object.entries(report?.sections || {}).map(([section, vulns]) => (
              <div key={section} className="space-y-3">
                <div className="flex items-center gap-3 border-b border-border-subtle pb-2">
                  <div className="w-6 h-6 rounded-lg bg-sev-critical/10 flex items-center justify-center">
                    <AlertTriangle size={12} className="text-sev-critical" />
                  </div>
                  <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">{section}</h3>
                  <span className="ml-auto text-[11px] bg-bg-elevated border border-border-subtle px-2 py-0.5 rounded-full text-text-muted">{vulns.length} Findings</span>
                </div>
                <div className="space-y-2">
                  {vulns.map((v) => {
                    const sevColor = v.severity === 'HIGH' || v.severity === 'CRITICAL' ? '#EF4444' : v.severity === 'MEDIUM' ? '#F97316' : '#EAB308';
                    return (
                      <div key={v.id} className="data-row-interactive p-4 rounded-lg flex items-center justify-between" style={{ borderLeftColor: sevColor }}>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: sevColor }} />
                          <div>
                            <p className="text-[12px] font-medium text-text-primary">{v.title}</p>
                            <p className="text-[11px] text-text-muted font-mono mt-0.5">{v.endpoint}</p>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border" style={{ color: sevColor, background: `${sevColor}12`, borderColor: `${sevColor}25` }}>
                          {v.severity}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {Object.keys(report?.sections || {}).length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-text-muted">
                <CheckCircle size={40} className="mb-4 text-sev-low/30" />
                <p className="text-sm font-medium">No compliance violations found for this framework.</p>
                <p className="text-[11px] mt-1">Your API security posture satisfies all required controls.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
