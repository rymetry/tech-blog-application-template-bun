import { ArticlePostsList } from '@/components/article-posts-list';
import { PageHero } from '@/components/page-hero';
import { SearchForm } from '@/components/search-form';
import { SectionHeading } from '@/components/section-heading';
import { SectionContainer } from '@/components/section-container';
import { TagsList } from '@/components/tags-list';
import { JsonLd } from '@/components/json-ld';
import { normalizeArticlesQuery, type RawArticlesQuery } from '@/lib/articles-query';
import { createPageMetadata } from '@/lib/metadata-helpers';
import { buildBreadcrumbJsonLd } from '@/lib/structured-data';
import { getTagsByIdMapSafe } from '@/lib/tags-map';
import { buildQueryString } from '@/lib/utils';

export const revalidate = 300;

interface ArticlePageProps {
  searchParams: Promise<RawArticlesQuery>;
}

export async function generateMetadata({ searchParams }: ArticlePageProps) {
  const params = await searchParams;
  const tagsById = await getTagsByIdMapSafe();
  const normalizeOptions =
    tagsById.size > 0
      ? { validTagIds: new Set(tagsById.keys()) }
      : {};
  const normalized = normalizeArticlesQuery(params, normalizeOptions);
  const tagLabel = normalized.tag ? tagsById.get(normalized.tag) : undefined;

  const titleSegments = ['Writing'];

  if (normalized.tag && tagLabel) {
    titleSegments.push(`Tag: ${tagLabel}`);
  }

  if (normalized.q) {
    titleSegments.push(`Search: ${normalized.q}`);
  }

  if (normalized.page > 1) {
    titleSegments.push(`Page ${normalized.page}`);
  }

  const title = titleSegments.join(' • ');

  const descriptionParts = [
    'Browse articles with insights on web development and technology.',
  ];

  if (normalized.tag && tagLabel) {
    descriptionParts.push(`Currently filtered by tag "${tagLabel}".`);
  }

  if (normalized.q) {
    descriptionParts.push(`Search results for "${normalized.q}".`);
  }

  if (normalized.page > 1) {
    descriptionParts.push(`You are viewing page ${normalized.page}.`);
  }

  const canonicalQuery = buildQueryString({
    tag: normalized.tag,
    q: normalized.q,
    page: normalized.page > 1 ? normalized.page : undefined,
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
        description="Notes on software engineering, architecture, and product delivery."
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
              <TagsList />
            </div>
          </div>

          <div className="space-y-8 sm:space-y-10 md:pl-6">
            <ArticlePostsList searchParams={searchParams} />
          </div>
        </div>
      </SectionContainer>
    </div>
  );
}
