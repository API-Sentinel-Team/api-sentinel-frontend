import { describe, expect, it } from 'vitest';
import { pickDemoCredentials } from './demo-credentials';

describe('pickDemoCredentials', () => {
  it('returns the pair when both values are set', () => {
    expect(pickDemoCredentials('ops@example.test', 'pw')).toEqual({ email: 'ops@example.test', password: 'pw' });
  });

  it('returns null when either value is missing or blank', () => {
    expect(pickDemoCredentials(undefined, 'pw')).toBeNull();
    expect(pickDemoCredentials('ops@example.test', undefined)).toBeNull();
    expect(pickDemoCredentials('  ', 'pw')).toBeNull();
  });
});
