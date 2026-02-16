import { describe, expect, it } from 'bun:test';
import { buildTocFallbackHtml, escapeHtmlForPre } from './toc';

describe('toc fallback helpers', () => {
  it('escapes html-sensitive characters for pre fallback', () => {
    expect(escapeHtmlForPre(`& < > " '`)).toBe('&amp; &lt; &gt; &quot; &#39;');
  });

  it('wraps escaped content with pre tag', () => {
    expect(buildTocFallbackHtml('<script>alert("x")</script>')).toBe(
      '<pre>&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;</pre>',
    );
  });
});
