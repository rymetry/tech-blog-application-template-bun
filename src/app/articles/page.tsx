import { ArticlePostsList } from '@/components/article-posts-list';
import { PageHero } from '@/components/page-hero';
import { SearchForm } from '@/components/search-form';
import { SectionHeading } from '@/components/section-heading';
import { SectionContainer } from '@/components/section-container';
import { TagsList } from '@/components/tags-list';
import { JsonLd } from '@/components/json-ld';
import { getTags } from '@/lib/api';
import { createPageMetadata } from '@/lib/metadata-helpers';
import { buildBreadcrumbJsonLd } from '@/lib/structured-data';
import { buildQueryString } from '@/lib/utils';
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

  const titleSegments = ['Writing'];

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

  const canonicalQuery = buildQueryString({
    tag: tagId,
    q: query,
    page: pageNumber > 1 ? pageNumber : undefined,
  });

  const canonicalPath = canonicalQuery ? `/articles${canonicalQuery}` : '/articles';

  return createPageMetadata({
    title,
    description: descriptionParts.join(' '),
    path: canonicalPath,
  });
}

export default async function ArticlePage(props: ArticlePageProps) {
  const searchParams = await props.searchParams;
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Writing', path: '/articles' },
  ]);

  return (
    <div className="editorial-scope">
      <JsonLd data={breadcrumbJsonLd} id="articles-breadcrumb-jsonld" />
      <PageHero
        title="Writing"
        description="Notes on engineering, automation, and building quality into products."
        background="qa"
        align="left"
        className="pt-24 pb-10 md:pt-32 md:pb-12 qa-hero-soft"
      />

      <SectionContainer className="py-8 sm:py-10 md:py-12">
        <div className="grid gap-8 sm:gap-10 md:grid-cols-[240px_1fr]">
          <div className="space-y-8 md:sticky md:top-24 md:self-start h-fit md:pr-6 md:border-r md:border-border/30 editorial-index-rail">
            <div>
              <SectionHeading
                title="Search"
                align="left"
                className="mb-2"
                titleClassName="text-lg sm:text-xl md:text-2xl font-medium"
              />
              <p className="text-xs text-muted-foreground mb-4">
                Search by keyword, title, or topic.
              </p>
              <SearchForm />
            </div>

            <div>
              <SectionHeading
                title="Tags"
                align="left"
                className="mb-2"
                titleClassName="text-lg sm:text-xl md:text-2xl font-medium"
              />
              <p className="text-xs text-muted-foreground mb-4">
                Filter by topic to narrow the list.
              </p>
              <Suspense fallback={<div>Loading tags...</div>}>
                <TagsList />
              </Suspense>
            </div>
          </div>

          <div className="space-y-8 sm:space-y-10 md:pl-6">
            <Suspense fallback={<div className="py-10 text-center">Loading posts...</div>}>
              <ArticlePostsList searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </SectionContainer>
    </div>
  );
}
