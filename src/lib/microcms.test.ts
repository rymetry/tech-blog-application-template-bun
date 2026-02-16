import { describe, expect, it } from 'bun:test';
import { MicroCmsHttpError, toSafeErrorLogContext } from './microcms';

describe('MicroCmsHttpError', () => {
  it('redacts sensitive values in URL query params and response body', () => {
    const error = new MicroCmsHttpError({
      status: 400,
      statusText: 'Bad Request',
      url: 'https://example.com/api/v1/articles?draftKey=secret-draft&limit=10',
      body: '{"draftKey":"secret-draft","token":"secret-token","message":"bad request"}',
    });

    const parsed = new URL(error.url);
    expect(parsed.searchParams.get('draftKey')).toBe('[REDACTED]');
    expect(parsed.searchParams.get('limit')).toBe('10');
    expect(error.body.includes('secret-draft')).toBe(false);
    expect(error.body.includes('secret-token')).toBe(false);
    if (error.body) {
      expect(error.body.includes('[REDACTED]')).toBe(true);
    }
  });

  it('returns a safe log payload for generic errors', () => {
    expect(toSafeErrorLogContext(new Error('boom'))).toEqual({
      name: 'Error',
      message: 'boom',
    });
  });
});
