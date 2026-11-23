import { describe, it, expect } from 'vitest';
import { formatBytes, formatDate } from './format-utils';

describe('format-utils (TDD)', () => {
  it('should format byte sizes accurately', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1048576)).toBe('1 MB');
    expect(formatBytes(5242880)).toBe('5 MB');
  });

  it('should format ISO dates into human readable strings', () => {
    const formatted = formatDate('2026-03-15T12:00:00.000Z');
    expect(formatted).toBeDefined();
    expect(formatted.length).toBeGreaterThan(0);
  });
});
