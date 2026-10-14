import { describe, expect, it } from 'vitest';
import { cleanStateLinks, splitStateHref, stateLinkAttrs } from '../../src/seo/state-links';
import { withState } from '../../src/ui/state-link-enhancer';

describe('state links', () => {
  it('splits calculator state from the clean canonical path, keeping the fragment', () => {
    expect(splitStateHref('/tools/tire-size-comparison/?current=205-55-16&new=225-45-17')).toEqual({ href: '/tools/tire-size-comparison/', state: 'current=205-55-16&new=225-45-17' });
    expect(splitStateHref('/fitment-studio/?current=1&new=2#compare')).toEqual({ href: '/fitment-studio/#compare', state: 'current=1&new=2' });
    expect(splitStateHref('?size=205-55-16', '/tools/tire-size-calculator/')).toEqual({ href: '/tools/tire-size-calculator/', state: 'size=205-55-16' });
    expect(splitStateHref('https://atlasgarageos.com/tools/?category=Performance')).toEqual({ href: '/tools/', state: 'category=Performance' });
    expect(splitStateHref('https://example.com/?q=1')).toBeNull();
    expect(splitStateHref('//cdn.example.com/x?y=1')).toBeNull();
    expect(splitStateHref('/tools/')).toBeNull();
  });

  it('round-trips through the client enhancer', () => {
    for (const url of ['/a/?x=1&y=2', '/b/?z=3#frag']) {
      const split = splitStateHref(url)!;
      expect(withState(split.href, split.state)).toBe(url);
    }
    expect(stateLinkAttrs('/tools/?category=Fuel')).toEqual({ href: '/tools/', 'data-link-state': 'category=Fuel' });
  });

  it('rewrites rendered anchors only, escaped and idempotent', () => {
    const html = '<a class="x" href="/tools/speedometer-error-calculator/?current=205-55-16&amp;new=225-45-17">go</a>'
      + '<a href="https://example.com/?q=1">ext</a><link rel="canonical" href="https://atlasgarageos.com/x/?y=1">'
      + '<a href="?size=1-2-3">self</a><a href="/plain/">plain</a>';
    const once = cleanStateLinks(html, '/tools/tire-size-calculator/');
    expect(once).toContain('<a class="x" href="/tools/speedometer-error-calculator/" data-link-state="current=205-55-16&amp;new=225-45-17">');
    expect(once).toContain('href="https://example.com/?q=1"');
    expect(once).toContain('<link rel="canonical" href="https://atlasgarageos.com/x/?y=1">');
    expect(once).toContain('<a href="/tools/tire-size-calculator/" data-link-state="size=1-2-3">');
    expect(once).toContain('<a href="/plain/">');
    expect(cleanStateLinks(once, '/tools/tire-size-calculator/')).toBe(once);
    expect(once.match(/<a\b[^>]*href="\/[^"]*\?/g)).toBeNull();
  });
});
