import { describe, expect, it } from 'bun:test';
import {
  normalizeArticlesQuery,
  normalizePageParam,
  normalizeQueryParam,
  normalizeTagParam,
} from './articles-query';

describe('articles-query', () => {
  it('normalizes invalid page values to 1', () => {
    expect(normalizePageParam(undefined)).toBe(1);
    expect(normalizePageParam('foo')).toBe(1);
    expect(normalizePageParam('0')).toBe(1);
    expect(normalizePageParam('-1')).toBe(1);
  });

  it('caps very large page values', () => {
    expect(normalizePageParam('99999999')).toBe(100000);
  });

  it('normalizes search query and enforces max length', () => {
    expect(normalizeQueryParam('  hello   world  ')).toBe('hello world');
    expect(normalizeQueryParam('')).toBeUndefined();
    expect(normalizeQueryParam('a'.repeat(200))?.length).toBe(100);
  });

  it('treats unknown tags as undefined when a valid tag set is supplied', () => {
    const validTags = new Set(['tag-1', 'tag-2']);

    expect(normalizeTagParam('tag-1', { validTagIds: validTags })).toBe('tag-1');
    expect(normalizeTagParam('tag-3', { validTagIds: validTags })).toBeUndefined();
  });

  it('normalizes full query object', () => {
    const normalized = normalizeArticlesQuery(
      { page: '0', tag: 'invalid', q: '  bun   nextjs  ' },
      { validTagIds: new Set(['tag-1']) },
    );

    expect(normalized).toEqual({
      page: 1,
      tag: undefined,
      q: 'bun nextjs',
    });
  });
});
