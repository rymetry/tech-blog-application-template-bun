import { afterEach, describe, expect, it, mock } from 'bun:test';

afterEach(() => {
  mock.restore();
});

describe('resolveTagLabel', () => {
  it('does not depend on a 10-item tag limit', async () => {
    const tagEntries = Array.from({ length: 12 }, (_, index) => {
      const id = `tag-${index + 1}`;
      return [id, `Tag ${index + 1}`] as const;
    });

    mock.module('@/lib/tags-map', () => ({
      getTagsByIdMapSafe: async () => new Map(tagEntries),
    }));

    const { resolveTagLabel } = await import(`./api?resolve-tag=${Date.now()}`);
    const label = await resolveTagLabel('tag-11');

    expect(label).toBe('Tag 11');
  });
});
