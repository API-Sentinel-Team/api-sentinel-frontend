import { describe, expect, it } from 'vitest';
import { computePostureScore } from './posture-score';

describe('computePostureScore', () => {
  it('never reports a hardened score while critical issues are open', () => {
    // The live local stack: risk score 0, 3 open issues of which 2 critical, nothing resolved.
    const score = computePostureScore({ riskScore: 0, openIssues: 3, openCritical: 2, endpointCount: 5 });
    expect(score).toBeLessThan(50);
  });

  it('is 100 with endpoints, no open issues and no risk', () => {
    expect(computePostureScore({ riskScore: 0, openIssues: 0, openCritical: 0, endpointCount: 5 })).toBe(100);
  });

  it('lowers the score for open non-critical issues', () => {
    const one = computePostureScore({ riskScore: 0, openIssues: 1, openCritical: 0, endpointCount: 5 });
    const three = computePostureScore({ riskScore: 0, openIssues: 3, openCritical: 0, endpointCount: 5 });
    expect(one).toBeLessThan(100);
    expect(three).toBeLessThan(one);
    expect(one).toBeGreaterThanOrEqual(50);
  });

  it('takes the lower of the backend risk score and the open-issue score', () => {
    expect(computePostureScore({ riskScore: 3, openIssues: 0, openCritical: 0, endpointCount: 5 })).toBe(70);
  });

  it('never goes below 0 or above 100', () => {
    expect(computePostureScore({ riskScore: 50, openIssues: 40, openCritical: 40, endpointCount: 5 })).toBe(0);
    expect(computePostureScore({ riskScore: -5, openIssues: 0, openCritical: 0, endpointCount: 5 })).toBe(100);
  });

  it('keeps the neutral baseline when there is no inventory and no issues yet', () => {
    expect(computePostureScore({ openIssues: 0, openCritical: 0, endpointCount: 0 })).toBe(85);
  });
});
