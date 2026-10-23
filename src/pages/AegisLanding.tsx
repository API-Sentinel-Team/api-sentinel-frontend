import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  FileSearch,
  GitBranch,
  Radar,
  Scale,
  Shield,
  ShieldCheck,
  Workflow,
} from 'lucide-react';
import { AegisBrandMark } from '@/components/brand/AegisBrandMark';
import './AegisLanding.css';

const PILLARS = [
  {
    icon: FileSearch,
    title: 'Discover every API',
    body: 'Inventory endpoints, parameters, and sensitive data flows across cloud, on-prem, and hybrid estates — including shadow and debug routes.',
  },
  {
    icon: Radar,
    title: 'Test before production',
    body: 'Continuous security testing aligned to OWASP API Top 10, business-logic abuse, and CI/CD gates with evidence-backed findings.',
  },
  {
    icon: ShieldCheck,
    title: 'Protect at runtime',
    body: 'Correlate live traffic, threat actors, and policy violations. Enforce intent, ownership, and authorization in real time.',
  },
  {
    icon: Scale,
    title: 'Prove compliance',
    body: 'Audit-ready visibility for PCI DSS, HIPAA, GDPR, and internal controls with discovery, monitoring, and complete trails.',
  },
] as const;

const PERSONAS = [
  {
    title: 'CISOs & leaders',
    body: 'One control plane for API risk, agentic AI exposure, and release governance.',
    points: ['Executive posture rollups', 'Compliance readiness', 'ROI on remediation'],
  },
  {
    title: 'Security teams',
    body: 'Deep visibility from catalogue to runtime without stitching five tools together.',
    points: ['Threat correlation', 'MCP & agent guardrails', 'Human-gated enforcement'],
  },
  {
    title: 'Developers',
    body: 'Secure APIs and MCP tools without slowing delivery — tests run where you already ship.',
    points: ['Pipeline-friendly scans', 'OpenAPI & drift checks', 'Actionable fix guidance'],
  },
] as const;

export default function AegisLanding() {
  return (
    <div className="aegis-landing">
      <header className="aegis-nav">
        <div className="aegis-nav-inner">
          <Link to="/" aria-label="AEGIS home">
            <AegisBrandMark variant="dark" />
          </Link>
          <nav className="aegis-nav-links" aria-label="Primary">
            <a href="#platform">Platform</a>
            <a href="#capabilities">Capabilities</a>
            <a href="#deployment">Deployment</a>
            <a href="#teams">Teams</a>
          </nav>
          <div className="aegis-nav-actions">
            <Link className="aegis-btn aegis-btn-ghost" to="/demo">
              Live demo
            </Link>
            <Link className="aegis-btn aegis-btn-primary" to="/login">
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <section className="aegis-hero" aria-labelledby="aegis-hero-title">
        <div className="aegis-hero-grid">
          <div>
            <p className="aegis-eyebrow">
              <span aria-hidden /> Unified API security platform
            </p>
            <h1 id="aegis-hero-title">
              See and secure <em>every API</em> interaction
            </h1>
            <p className="aegis-hero-lead">
              AEGIS delivers an integrated platform — from finding every API you have, to testing exploitable flaws,
              protecting runtime traffic, and proving compliance — from a single shielded control plane.
            </p>
            <div className="aegis-hero-cta">
              <Link className="aegis-btn aegis-btn-primary" to="/login">
                Get started <ArrowRight size={16} />
              </Link>
              <Link className="aegis-btn aegis-btn-outline-light" to="/demo">
                Explore interactive demo
              </Link>
            </div>
          </div>
          <div className="aegis-hero-visual" aria-hidden>
            <header>
              <span>AEGIS · Posture snapshot</span>
              <span>Live</span>
            </header>
            <div className="aegis-mini-metrics">
              <div className="aegis-mini-metric">
                <strong>247</strong>
                <span>Discovered APIs</span>
              </div>
              <div className="aegis-mini-metric">
                <strong>32</strong>
                <span>Open findings</span>
              </div>
              <div className="aegis-mini-metric">
                <strong>3</strong>
                <span>Active threat actors</span>
              </div>
              <div className="aegis-mini-metric">
                <strong>42</strong>
                <span>Tests in last run</span>
              </div>
            </div>
            <div className="aegis-flow-row">
              {['Discover', 'Test', 'Detect', 'Protect', 'Verify'].map((step) => (
                <span key={step} className="aegis-flow-pill">
                  {step}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="aegis-trust">
        <div className="aegis-trust-inner">
          <span>Built for operators who need one place to see API risk — not another dashboard silo.</span>
          <div className="aegis-trust-stats">
            <span>
              <b>150K+</b> endpoints modeled
            </span>
            <span>
              <b>250B+</b> API calls analyzed
            </span>
            <span>
              <b>Agentic</b> + MCP ready
            </span>
          </div>
        </div>
      </div>

      <section className="aegis-section" id="capabilities" aria-labelledby="capabilities-title">
        <div className="aegis-section-head">
          <h2 id="capabilities-title">Full lifecycle API security</h2>
          <p>
            Traditional perimeter tools miss complex API execution paths. AEGIS maps business logic, data flows, and
            authorization — then tests and defends what actually runs in production.
          </p>
        </div>
        <div className="aegis-pillars">
          {PILLARS.map(({ icon: Icon, title, body }) => (
            <article className="aegis-pillar" key={title}>
              <div className="aegis-pillar-icon">
                <Icon size={20} />
              </div>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="aegis-platform" id="platform" aria-labelledby="platform-title">
        <div className="aegis-section aegis-platform-grid">
          <div>
            <div className="aegis-section-head">
              <h2 id="platform-title">The AEGIS platform</h2>
              <p>
                Automate discovery, red-team testing, runtime protection, and remediation across APIs and agentic
                workloads — with architecture that fits SaaS, on-premises, or hybrid deployments.
              </p>
            </div>
            <ul className="aegis-platform-list">
              <li>
                <CheckCircle2 size={18} />
                Business logic graph and sequence visibility for authorization and abuse paths
              </li>
              <li>
                <CheckCircle2 size={18} />
                Continuous testing integrated into CI/CD with release governance gates
              </li>
              <li>
                <CheckCircle2 size={18} />
                Real-time enforcement with threat actor tracking and MCP shield controls
              </li>
              <li>
                <CheckCircle2 size={18} />
                Sensitive data classification, schema drift, and audit exports
              </li>
            </ul>
            <p style={{ marginTop: '1.25rem' }}>
              <Link className="aegis-btn aegis-btn-primary" to="/app/dashboard">
                Open console <ArrowRight size={16} />
              </Link>
            </p>
          </div>
          <div className="aegis-diagram" id="deployment" aria-label="Deployment architecture">
            <div className="aegis-diagram-tier sensors">Sensors & plugins · inline or out-of-band</div>
            <div className="aegis-diagram-tier controller">Edge controller · inspect, policy, anonymize PII</div>
            <div className="aegis-diagram-tier platform">AEGIS platform · AI analysis, console, scans</div>
            <p className="aegis-diagram-caption">
              Bare metal, VMs, Docker, or Kubernetes — high availability without sacrificing latency.
            </p>
          </div>
        </div>
      </section>

      <section className="aegis-section" id="teams" aria-labelledby="teams-title">
        <div className="aegis-section-head">
          <h2 id="teams-title">Security that fits your organization</h2>
          <p>Whether you secure payments APIs, internal microservices, or MCP toolchains — AEGIS meets each team where they work.</p>
        </div>
        <div className="aegis-personas">
          {PERSONAS.map(({ title, body, points }) => (
            <article className="aegis-persona" key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
              <ul>
                {points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div className="aegis-pillars" style={{ marginTop: '2rem' }}>
          <article className="aegis-pillar">
            <div className="aegis-pillar-icon">
              <Workflow size={20} />
            </div>
            <h3>Integrations</h3>
            <p>Wire into your stack — OpenAPI, Postman, HAR, nginx logs, WebSockets, and streaming ingest.</p>
          </article>
          <article className="aegis-pillar">
            <div className="aegis-pillar-icon">
              <GitBranch size={20} />
            </div>
            <h3>Release governance</h3>
            <p>Gate promotions with test evidence, severity thresholds, and policy exceptions you can audit.</p>
          </article>
          <article className="aegis-pillar">
            <div className="aegis-pillar-icon">
              <Bot size={20} />
            </div>
            <h3>Agentic & MCP</h3>
            <p>Monitor tool invocations, block unsafe SQL or token mint paths, and trace agent identity.</p>
          </article>
          <article className="aegis-pillar">
            <div className="aegis-pillar-icon">
              <Shield size={20} />
            </div>
            <h3>Always-on protection</h3>
            <p>Stop known and unknown attacks, usage anomalies, and fraud patterns before customer impact.</p>
          </article>
        </div>
      </section>

      <section className="aegis-cta-band" aria-labelledby="cta-title">
        <h2 id="cta-title">Map every API. Classify every flow. Enforce in real time.</h2>
        <p>Sign in to your workspace or walk through the interactive security overview demo.</p>
        <div className="aegis-hero-cta">
          <Link className="aegis-btn aegis-btn-outline-light" to="/login">
            Sign in to AEGIS
          </Link>
          <Link className="aegis-btn aegis-btn-primary" to="/demo" style={{ background: '#fff', color: '#1d4ed8' }}>
            View demo overview
          </Link>
        </div>
      </section>

      <footer className="aegis-footer">
        <div className="aegis-footer-inner">
          <AegisBrandMark variant="dark" size="sm" showTagline={false} />
          <div className="aegis-footer-links">
            <Link to="/login">Sign in</Link>
            <Link to="/demo">Demo</Link>
            <Link to="/app/dashboard">Console</Link>
          </div>
          <span>© {new Date().getFullYear()} AEGIS · API security platform</span>
        </div>
      </footer>
    </div>
  );
}
