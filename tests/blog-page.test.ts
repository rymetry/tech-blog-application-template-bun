import { describe, expect, it } from 'bun:test';

process.env.MICROCMS_SERVICE_DOMAIN ??= 'demo';
process.env.MICROCMS_API_KEY ??= 'test-key';
process.env.NEXT_PUBLIC_BASE_URL ??= 'https://example.com';
process.env.NEXT_PUBLIC_SITE_NAME ??= 'Example';
process.env.NEXT_PUBLIC_SITE_DESCRIPTION ??= 'Example Description';

const { createBlogPage, createGenerateMetadata } = await import('../src/app/blog/[slug]/page');

const missingSlug = 'missing-slug';

describe('blog page handling', () => {
  it('generateMetadata throws notFound when post retrieval fails', async () => {
    const failingMetadata = createGenerateMetadata(async () => {
      throw new Error('not found');
    });

    await expect(
      failingMetadata({ params: { slug: missingSlug } }),
    ).rejects.toMatchObject({ digest: expect.stringContaining('404') });
  });

  it('page component throws notFound when post retrieval fails', async () => {
    const failingPage = createBlogPage(async () => {
      throw new Error('not found');
    });

    await expect(
      failingPage({ params: { slug: missingSlug } }),
    ).rejects.toMatchObject({ digest: expect.stringContaining('404') });
  });
});
