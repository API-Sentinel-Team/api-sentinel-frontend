import { Home, Network, Radio, Terminal, Bot, Shield, Settings } from 'lucide-react';
export const navigation = [
  { title: 'Command & Posture', icon: Home, color: '#65738a', items: [
    ['overview','Overview','Real-time visibility into your API ecosystem, risks, and security posture.','/app/dashboard'],
    ['posture','Security Posture','Prioritize risk and close gaps across your API estate.','/app/dashboard'],
    ['alerts','Active Alerts','Investigate, acknowledge, and resolve security alerts.','/app/alerts'],
    ['remediation','SLA & Remediation','Track ownership and remediation deadlines for every finding.','/app/testing/governance'],
    ['health','System Health','Monitor the control plane, sensors, and event pipeline.','/admin/system-health'],
  ]},
  { title: 'API & Lineage Atlas', icon: Network, color: '#3678ff', items: [
    ['apis','API Explorer','Discover endpoints, inspect schemas, and assign API ownership.','/app/discovery'],
    ['shadow','Shadow & Zombie APIs','Bring undocumented and inactive endpoints under governance.','/app/discovery'],
    ['schema','OpenAPI & Drift','Compare observed traffic with the documented API contract.','/app/discovery/schema'],
    ['graph','Business Logic Graph','Explore service dependencies and critical business journeys.','/app/discovery/call-graph'],
    ['lineage','Data Lineage','Trace sensitive data from the edge to downstream services.','/app/discovery/sequence'],
    ['sources','Traffic Sources','Manage the integrations that supply API telemetry.','/admin/onboarding'],
  ]},
  { title: 'Runtime Defense & Wire', icon: Radio, color: '#ee4549', items: [
    ['traffic','Live Traffic','Inspect captured requests, responses, and detection evidence.','/app/live'],
    ['actors','Threat Actors','Investigate repeat offenders and their attack patterns.','/app/protection/threats'],
    ['detections','Anomalies & Detections','Review behavioral anomalies and detector outcomes.','/app/protection'],
    ['waf','WAF Events','Inspect requests evaluated by application firewall policies.','/app/protection/enforcement'],
    ['blocklist','IP / Actor Blocklists','Manage blocked sources and their expiration windows.','/app/blocklist'],
    ['sensors','eBPF Sensors','Inspect kernel-level collectors and their coverage.','/admin/system-health/sensors'],
  ]},
  { title: 'Pentest Lab', icon: Terminal, color: '#d68209', items: [
    ['scans','Scan Launcher','Configure repeatable security tests for your API inventory.','/app/testing/configuration'],
    ['findings','Findings & Triage','Review evidence, assign owners, and remediate vulnerabilities.','/app/testing'],
    ['matrix','BOLA / BFLA Matrix','Inspect object and function authorization across roles.','/app/testing/governance'],
    ['auth-profiles','Auth & Roles','Manage non-secret authentication profiles used by scans.','/app/testing/configuration'],
    ['retests','Evidence & Retest','Review redacted evidence and record verification results.','/app/testing/inspector'],
  ]},
  { title: 'Agentic AI & MCP Shield', icon: Bot, color: '#21aaa4', items: [
    ['agents','AI Agents','Inventory agent identities, tool access, and policy coverage.','/app/intelligence/agentic'],
    ['mcp','MCP Servers & Tools','Govern MCP servers, tools, and exposed capabilities.','/app/protection/mcp-shield'],
    ['injection','Prompt Injection','Investigate instruction overrides and unsafe tool requests.','/app/protection/mcp-shield'],
    ['policies','Agent Guard Policies','Configure tool boundaries, data access, and approval requirements.','/app/protection/policy'],
    ['ai-findings','AI Findings','Triage vulnerabilities affecting agents and MCP tools.','/app/intelligence/agentic'],
  ]},
  { title: 'Governance & Platform', icon: Shield, color: '#7a899c', items: [
    ['reports','Compliance & Reports','Review control coverage and export evidence reports.','/app/reports'],
    ['audit','Audit Logs','Review the complete history of changes in this preview.','/admin/settings/audit-logs'],
    ['integrations','Integrations','Configure notification and telemetry integration drafts.','/admin/settings'],
    ['retention','Retention & Archiver','Set retention windows and prepare local evidence archives.','/app/protection/settings'],
    ['organizations','Org Management','Manage application ownership and organization structure.','/app/organization'],
  ]},
  { title: 'Settings & Access Control', icon: Settings, color: '#536173', items: [
    ['users','Users & Teams','Manage workspace members, teams, and access assignments.','/admin/settings/users'],
    ['roles','Roles & Permissions','Inspect and edit the permissions granted to each role.','/admin/settings/users'],
    ['authentication','Authentication','Configure sign-in policies and SSO connection drafts.','/admin/settings'],
    ['settings','Organization Settings','Maintain organization identity and workspace preferences.','/app/organization'],
  ]},
];
export const destinations = navigation.flatMap(group => group.items.map(([id,title,description,livePath]) => ({id,title,description,livePath,group:group.title,path:id === 'overview' ? '/' : `/console/${id}`})));
export const destination = (id: string) => destinations.find(item => item.id === id);
