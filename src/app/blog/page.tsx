import { BlogPostsList } from '@/components/blog-posts-list';
import { PageHero } from '@/components/page-hero';
import { SearchForm } from '@/components/search-form';
import { SectionContainer } from '@/components/section-container';
import { TagsList } from '@/components/tags-list';
import { getSiteDescription, getSiteName, getSiteUrl } from '@/lib/seo';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { z } from 'zod';

const siteName = getSiteName();
const siteDescription = getSiteDescription();
const siteUrl = getSiteUrl();

const searchParamsSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((value) => {
      if (!value) return undefined;
      const parsed = Number.parseInt(value, 10);
      return Number.isNaN(parsed) || parsed < 1 ? undefined : parsed;
    }),
  tag: z.string().optional(),
  q: z.string().optional(),
});

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Blog',
  description: siteDescription,
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: `${siteName} Blog`,
    description: siteDescription,
    url: `${siteUrl}/blog`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteName} Blog`,
    description: siteDescription,
  },
};

interface BlogPageProps {
  searchParams: Promise<{ page?: string; tag?: string; q?: string }>;
}

export default async function BlogPage(props: BlogPageProps) {
  const rawParams = await props.searchParams;
  const parsedResult = searchParamsSchema.safeParse(rawParams ?? {});
  const parsedParams = parsedResult.success ? parsedResult.data : {};

  const normalizedParams = {
    page: parsedParams.page ? String(parsedParams.page) : undefined,
    tag: parsedParams.tag,
    q: parsedParams.q,
  };

  return (
    <>
      <PageHero
        title="Blog"
        description="Explore our collection of articles, tutorials, and insights"
      />

      <SectionContainer className="py-8 sm:py-10 md:py-12">
        <div className="grid gap-8 sm:gap-10 md:grid-cols-[240px_1fr]">
          <div className="space-y-8">
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-medium mb-4">Search</h2>
              <SearchForm />
            </div>

            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-medium mb-4">Tags</h2>
              <Suspense fallback={null}>
                <TagsList />
              </Suspense>
            </div>
          </div>

          <div className="space-y-8 sm:space-y-10">
            <BlogPostsList searchParams={normalizedParams} />
          </div>
        </div>
      </SectionContainer>
    </>
  );
}
