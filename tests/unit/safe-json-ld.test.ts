import { describe, expect, it } from 'vitest';
import { serializeJsonLd } from '../../src/seo/safe-json-ld';

describe('JSON-LD serialization', () => {
  it('preserves data while preventing inline script breakout', () => {
    const serialized = serializeJsonLd({ text: '</script><script>alert(1)</script>', separators: '\u2028\u2029' });
    expect(serialized).not.toContain('<');
    expect(serialized).not.toContain('\u2028');
    expect(serialized).not.toContain('\u2029');
    expect(JSON.parse(serialized)).toEqual({ text: '</script><script>alert(1)</script>', separators: '\u2028\u2029' });
  });
});
