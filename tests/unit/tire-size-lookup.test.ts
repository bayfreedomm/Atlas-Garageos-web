import { describe, expect, it } from 'vitest';
import { parseTireQuery, sizeDigits } from '../../src/ui/tire-size-lookup';
import { tireSizeCatalog } from '../../src/data/tire-size-catalog';

describe('tire-size lookup parsing', () => {
  it('normalizes the spellings readers actually type', () => {
    const cases: Record<string, string> = {
      '205/55R16': '205-55-r16',
      '205 55 16': '205-55-r16',
      '205/55 r 16': '205-55-r16',
      '2055516': '205-55-r16',
      '225/45ZR17': '225-45-r17',
      'LT285/70R17': '285-70-r17',
      'p215/75r15': '215-75-r15',
      '215/65 R16C': '215-65-r16c',
      '315/80 R22,5': '315-80-r22-5',
      '235/55R18 100H': '235-55-r18',
      '33x12.5r20': '33x12-50-r20',
      '31X10.50 R15': '31x10-50-r15',
      '35×12.50R20': '35x12-50-r20',
    };
    for (const [input, slug] of Object.entries(cases)) expect(parseTireQuery(input), input).toBe(slug);
    expect(parseTireQuery('hello')).toBeNull();
  });

  it('maps every catalog notation to its own slug', () => {
    for (const entry of tireSizeCatalog) expect(parseTireQuery(entry.notation), entry.notation).toBe(entry.slug);
  });

  it('builds digit keys for prefix suggestions', () => {
    expect(sizeDigits('205/55 R16')).toBe('2055516');
    expect(sizeDigits('215/65R16C')).toBe('2156516');
  });
});
