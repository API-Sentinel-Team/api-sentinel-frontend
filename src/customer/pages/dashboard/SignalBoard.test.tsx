import { describe, it, expect } from 'vitest';
import { bucketLiveTraffic } from './SignalBoard';
import type { LiveLogEntry } from '@/lib/realtime';

function frame(minutesAgo: number, threats = 0): LiveLogEntry {
  return {
    id: `f-${minutesAgo}-${threats}-${Math.random()}`,
    timestamp: new Date(Date.now() - minutesAgo * 60_000).toISOString(),
    ip: '10.0.0.1',
    method: 'GET',
    path: '/api/x',
    status: 200,
    attacks: threats > 0 ? [{ category: 'SQLi', severity: 'HIGH' }] : [],
  } as unknown as LiveLogEntry;
}

describe('bucketLiveTraffic', () => {
  it('returns an empty list when there is no live traffic', () => {
    expect(bucketLiveTraffic([])).toEqual([]);
  });

  it('counts requests and threat frames in per-minute buckets', () => {
    const logs = [frame(0), frame(0, 1), frame(2), frame(2), frame(2, 1)];
    const buckets = bucketLiveTraffic(logs, 5);
    expect(buckets).toHaveLength(5);
    expect(buckets[buckets.length - 1].requests).toBe(2); // "now" bucket
    expect(buckets[buckets.length - 1].threats).toBe(1);
    expect(buckets[buckets.length - 3].requests).toBe(3); // -2m bucket
    expect(buckets[buckets.length - 3].threats).toBe(1);
  });

  it('never fabricates traffic for empty minutes', () => {
    const buckets = bucketLiveTraffic([frame(0)], 6);
    const older = buckets.slice(0, buckets.length - 1);
    expect(older.every((b) => b.requests === 0 && b.threats === 0)).toBe(true);
  });
});
