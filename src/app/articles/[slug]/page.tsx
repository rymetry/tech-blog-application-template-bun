import { Author } from '@/components/author';
import { PrevNextPosts } from '@/components/prev-next-posts';
import { RelatedPosts } from '@/components/related-posts';
import { JsonLd } from '@/components/json-ld';
import { ArticleContent } from '@/components/article-content';
import { TagPill } from '@/components/tag-pill';
import { getArticlePost, getArticlePosts } from '@/lib/api';
import { createArticleMetadata, createPageMetadata } from '@/lib/metadata-helpers';
import { buildArticleJsonLd, buildBreadcrumbJsonLd } from '@/lib/structured-data';
import { formatDate } from '@/lib/utils';
import { CalendarCheck, RefreshCcw } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

interface ArticlePostPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    draftKey?: string;
    contentId?: string;
  }>;
}

// revalidateは数値リテラルでなければビルド時に最適化されないため、ここで直接指定する。
export const revalidate = 300;

export async function generateMetadata({ params, searchParams }: ArticlePostPageProps) {
  const { slug } = await params;
  const draftState = await draftMode();
  const search = searchParams ? await searchParams : {};
  const { draftKey, contentId } = search;
  const previewOptions = draftState.isEnabled ? { draftKey, contentId } : {};

  try {
    const post = await getArticlePost(slug, previewOptions);

    if (!post) {
      return createPageMetadata({
        title: 'Article Post',
        description: 'Article post not found',
        path: `/articles/${slug}`,
      });
    }

    return createArticleMetadata({ article: post });
  } catch {
    return createPageMetadata({
      title: 'Article Post',
      description: 'Article post not found',
      path: `/articles/${slug}`,
    });
  }
}

export async function generateStaticParams() {
  try {
    const limit = 100;
    let offset = 0;
    let totalCount = Infinity;
    const slugs: { slug: string }[] = [];

    while (slugs.length < totalCount) {
      const { contents, totalCount: fetchedTotalCount } = await getArticlePosts({
        limit,
        offset,
        orders: '-publishedAt',
      });

      if (totalCount === Infinity) {
        totalCount = fetchedTotalCount;
      }

      if (contents.length === 0) {
        break;
      }

      slugs.push(...contents.map((article) => ({ slug: article.slug })));
      offset += limit;
    }

    return slugs;
  } catch (error) {
    console.error('Error generating static params for articles:', error);
    return [];
  }
}

// 関連/前後ナビは外部コンポーネントに分離

export default async function ArticlePostPage({ params, searchParams }: ArticlePostPageProps) {
  const { slug } = await params;
  const draftState = await draftMode();
  const search = searchParams ? await searchParams : {};
  const { draftKey, contentId } = search;
  const previewOptions = draftState.isEnabled ? { draftKey, contentId } : {};

  const post = await getArticlePost(slug, previewOptions);

  if (!post) {
    notFound();
  }

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Writing', path: '/articles' },
    { name: post.title, path: `/articles/${post.slug}` },
  ]);
  const articleJsonLd = buildArticleJsonLd(post);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} id="article-breadcrumb-jsonld" />
      <JsonLd data={articleJsonLd} id="article-structured-jsonld" />
      <section className="w-full pt-24 pb-10 md:pt-32 md:pb-12 qa-hero-background qa-hero-soft">
        <div className="mx-auto w-full max-w-[1024px] px-4 sm:px-6 lg:px-8">
          <div className="w-full space-y-4 text-left">
            <div className="mb-8 max-w-[420px] mx-auto">
              <Image
                src={post.coverImage?.url || '/placeholder.svg'}
                alt={`Cover image for ${post.title}`}
                width={1200}
                height={630}
                className="rounded-lg object-cover aspect-[1200/630] w-full shadow-md"
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap gap-2 mt-4" aria-label="Tags">
              {post.tags?.map((tag) => (
                <TagPill key={tag.id} asChild variant="primary" size="md">
                  <Link
                    href={`/articles?tag=${tag.id}`}
                    aria-label={`View all posts with tag: ${tag.name}`}
                  >
                    {tag.name}
                  </Link>
                </TagPill>
              ))}
            </div>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              {post.author && (
                <div className="flex items-center">
                  <Author author={post.author} size="lg" />
                </div>
              )}
              <div className="flex flex-col gap-2 text-sm sm:text-base text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                  <time
                    dateTime={post.publishedAt}
                    aria-label={`Published on ${formatDate(post.publishedAt)}`}
                  >
                    {formatDate(post.publishedAt)}
                  </time>
                </div>
                <div className="flex items-center gap-1">
                  <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                  <time
                    dateTime={post.updatedAt}
                    aria-label={`Updated on ${formatDate(post.updatedAt)}`}
                  >
                    {formatDate(post.updatedAt)}
                  </time>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <article className="container w-full py-8 sm:py-10 md:py-12 max-w-[1024px]">
        <div className="max-w-[1024px] lg:max-w-[820px] mx-auto">
          <ArticleContent content={post.content} />
        </div>

        {/* 関連記事と前後の記事を並列で取得 */}
        <Suspense fallback={<div className="py-8 text-center">Loading related posts...</div>}>
          {post.relatedPosts && <RelatedPosts relatedPosts={post.relatedPosts} />}
        </Suspense>

        <Suspense fallback={<div className="py-8 text-center">Loading navigation...</div>}>
          <PrevNextPosts postSlug={post.slug} />
        </Suspense>
      </article>
    </>
  );
}
