type PostureInput = {
  /** Backend risk score (0 = no risk); each point costs 10 posture points. */
  riskScore?: number;
  openIssues: number;
  openCritical: number;
  endpointCount: number;
};

const CRITICAL_PENALTY = 20;
const OTHER_PENALTY = 8;
/** Any open critical keeps the posture in the EXPOSED band (< 50). */
const CRITICAL_CAP = 49;
/** Neutral score before any inventory or findings exist. */
const BASELINE = 85;

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function computePostureScore({ riskScore, openIssues, openCritical, endpointCount }: PostureInput): number {
  const critical = Math.max(0, openCritical);
  const other = Math.max(0, openIssues - critical);
  if (endpointCount <= 0 && critical + other === 0 && typeof riskScore !== 'number') return BASELINE;

  const fromRisk = typeof riskScore === 'number' ? clamp(100 - riskScore * 10) : 100;
  const fromIssues = clamp(100 - critical * CRITICAL_PENALTY - other * OTHER_PENALTY);
  const score = Math.min(fromRisk, fromIssues);
  return critical > 0 ? Math.min(score, CRITICAL_CAP) : score;
}
