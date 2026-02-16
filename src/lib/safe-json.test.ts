import { describe, expect, it } from 'bun:test';
import { escapeJsonForHtml, stringifyJsonLd } from './safe-json';

describe('safe-json', () => {
  it('escapes characters that can break out of a script tag', () => {
    const serialized = stringifyJsonLd({
      message: '</script><script>alert(1)</script>',
      ampersand: '&',
      lineSeparator: '\u2028',
      paragraphSeparator: '\u2029',
    });

    expect(serialized).not.toContain('</script>');
    expect(serialized).toContain('\\u003C/script\\u003E');
    expect(serialized).toContain('\\u0026');
    expect(serialized).toContain('\\u2028');
    expect(serialized).toContain('\\u2029');
  });

  it('throws when stringify fails', () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;

    expect(() => stringifyJsonLd(circular)).toThrow();
  });

  it('escapes html-sensitive characters in plain JSON strings', () => {
    expect(escapeJsonForHtml('{"a":"<>&"}')).toBe('{"a":"\\u003C\\u003E\\u0026"}');
  });
});
