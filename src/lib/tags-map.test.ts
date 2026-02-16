import { afterEach, describe, expect, it, mock } from 'bun:test';

afterEach(() => {
  mock.restore();
});

const createDeferred = <T,>() => {
  let resolve!: (value: T) => void;

  const promise = new Promise<T>((res) => {
    resolve = res;
  });

  return { promise, resolve };
};

describe('getTagsByIdMapSafe', () => {
  it('builds an id-to-name map from tags', async () => {
    const getAllTagsSafeMock = mock(async () => [
      { id: 'frontend', name: 'Frontend' },
      { id: 'backend', name: 'Backend' },
    ]);

    mock.module('@/lib/api', () => ({
      getAllTagsSafe: getAllTagsSafeMock,
    }));

    const { getTagsByIdMapSafe } = await import(`./tags-map?case=build-${Date.now()}`);
    const tagsById = await getTagsByIdMapSafe();

    expect(tagsById.get('frontend')).toBe('Frontend');
    expect(tagsById.get('backend')).toBe('Backend');
    expect(tagsById.size).toBe(2);
    expect(getAllTagsSafeMock).toHaveBeenCalledTimes(1);
  });

  it('deduplicates in-flight tag map requests within the same module instance', async () => {
    const deferred = createDeferred<Array<{ id: string; name: string }>>();
    const getAllTagsSafeMock = mock(() => deferred.promise);

    mock.module('@/lib/api', () => ({
      getAllTagsSafe: getAllTagsSafeMock,
    }));

    const { getTagsByIdMapSafe } = await import(`./tags-map?case=in-flight-${Date.now()}`);
    const firstPromise = getTagsByIdMapSafe();
    const secondPromise = getTagsByIdMapSafe();

    expect(getAllTagsSafeMock).toHaveBeenCalledTimes(1);

    deferred.resolve([{ id: 'frontend', name: 'Frontend' }]);
    const [first, second] = await Promise.all([firstPromise, secondPromise]);

    expect(first.get('frontend')).toBe('Frontend');
    expect(second.get('frontend')).toBe('Frontend');
    expect(getAllTagsSafeMock).toHaveBeenCalledTimes(1);
  });
});
