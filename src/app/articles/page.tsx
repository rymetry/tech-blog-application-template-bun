import { ArticlePostsList } from '@/components/article-posts-list';
import { PageHero } from '@/components/page-hero';
import { SearchForm } from '@/components/search-form';
import { SectionContainer } from '@/components/section-container';
import { TagsList } from '@/components/tags-list';
import { JsonLd } from '@/components/json-ld';
import { getTags } from '@/lib/api';
import { buildPageMetadata } from '@/lib/metadata';
import { buildBreadcrumbJsonLd } from '@/lib/structured-data';
import { Suspense } from 'react';

export const revalidate = 300;

interface ArticlePageProps {
  searchParams: Promise<{
    page?: string;
    tag?: string;
    q?: string;
  }>;
}

export async function generateMetadata({ searchParams }: ArticlePageProps) {
  const params = await searchParams;
  const pageNumber = params.page ? Number.parseInt(params.page, 10) : 1;
  const tagId = params.tag;
  const query = params.q;

  let tagLabel: string | undefined;

  if (tagId) {
    try {
      const { contents } = await getTags();
      tagLabel = contents.find((tag) => tag.id === tagId)?.name;
    } catch (error) {
      console.error('Error resolving tag for metadata:', error);
    }
  }

  const titleSegments = ['Blog'];

  if (tagLabel) {
    titleSegments.push(`Tag: ${tagLabel}`);
  } else if (tagId) {
    titleSegments.push(`Tag: ${tagId}`);
  }

  if (query) {
    titleSegments.push(`Search: ${query}`);
  }

  if (pageNumber > 1) {
    titleSegments.push(`Page ${pageNumber}`);
  }

  const title = titleSegments.join(' • ');

  const descriptionParts = [
    'Browse articles with insights on web development and technology.',
  ];

  if (tagLabel) {
    descriptionParts.push(`Currently filtered by tag "${tagLabel}".`);
  }

  if (query) {
    descriptionParts.push(`Search results for "${query}".`);
  }

  if (pageNumber > 1) {
    descriptionParts.push(`You are viewing page ${pageNumber}.`);
  }

  const canonicalParams = new URLSearchParams();

  if (tagId) {
    canonicalParams.set('tag', tagId);
  }

  if (query) {
    canonicalParams.set('q', query);
  }

  if (pageNumber > 1) {
    canonicalParams.set('page', String(pageNumber));
  }

  const canonicalPath = canonicalParams.toString()
    ? `/articles?${canonicalParams.toString()}`
    : '/articles';

  return buildPageMetadata({
    title,
    description: descriptionParts.join(' '),
    canonicalPath,
  });
}

export default async function ArticlePage(props: ArticlePageProps) {
  const searchParams = await props.searchParams;
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/articles' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} id="articles-breadcrumb-jsonld" />
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
              <Suspense fallback={<div>Loading tags...</div>}>
                <TagsList />
              </Suspense>
            </div>
          </div>

          <div className="space-y-8 sm:space-y-10">
            <Suspense fallback={<div className="py-10 text-center">Loading posts...</div>}>
              <ArticlePostsList searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </SectionContainer>
    </>
  );
}
