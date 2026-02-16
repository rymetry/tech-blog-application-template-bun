import { Author } from '@/components/author';
import { PrevNextPosts } from '@/components/prev-next-posts';
import { RelatedPosts } from '@/components/related-posts';
import { JsonLd } from '@/components/json-ld';
import { ArticleContent } from '@/components/article-content';
import { ArticleToc } from '@/components/article-toc';
import { TagPill } from '@/components/tag-pill';
import { getAllArticles, getArticlePost } from '@/lib/api';
import { getMicroCmsImageUrl } from '@/lib/image';
import { createArticleMetadata, createPageMetadata } from '@/lib/metadata-helpers';
import { buildArticleJsonLd, buildBreadcrumbJsonLd } from '@/lib/structured-data';
import { processArticleContentWithToc } from '@/lib/toc';
import { formatDate } from '@/lib/utils';
import { CalendarCheck, RefreshCcw, Tag as TagIcon } from 'lucide-react';
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
    const articles = await getAllArticles();
    return articles.map((article) => ({ slug: article.slug }));
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
  const compactCoverUrl = post.hasCoverImage
    ? getMicroCmsImageUrl(post.coverImage.url, { width: 240, height: 240, fit: 'max' })
    : '';
  const { html: processedHtml, toc } = await processArticleContentWithToc(post.content);
  const shouldShowToc = post.showToc === true || (post.showToc == null && toc.length >= 3);

  const metaBlock = (
    <div className="mx-auto flex flex-wrap items-start justify-center gap-6 sm:gap-10">
      <div className="flex items-center justify-center">
        {post.author && <Author author={post.author} size="lg" />}
      </div>
      <div className="flex flex-col items-center gap-2 text-sm sm:text-base text-muted-foreground">
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
  );

  return (
    <div className="editorial-scope">
      <JsonLd data={breadcrumbJsonLd} id="article-breadcrumb-jsonld" />
      <JsonLd data={articleJsonLd} id="article-structured-jsonld" />
      <section className="w-full pt-24 pb-10 md:pt-32 md:pb-12 qa-hero-background qa-hero-soft article-hero-compact">
        <div className="container w-full">
          <div className="w-full space-y-6 text-center">
            <div className="flex justify-center">
              {post.hasCoverImage ? (
                <div className="article-hero-cover-compact relative overflow-hidden">
                  <Image
                    src={compactCoverUrl}
                    alt=""
                    aria-hidden="true"
                    fill
                    sizes="100px"
                    className="pointer-events-none object-cover scale-110 blur-xl opacity-45"
                  />
                  <div className="absolute inset-0 bg-background/20" aria-hidden="true" />
                  <Image
                    src={compactCoverUrl}
                    alt=""
                    aria-hidden="true"
                    fill
                    sizes="100px"
                    quality={90}
                    className="object-contain p-1.5"
                  />
                </div>
              ) : (
                <div className="article-hero-cover-compact article-hero-cover-placeholder" aria-hidden="true" />
              )}
            </div>
            <div className="space-y-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                {post.title}
              </h1>
              <div className="mt-4 flex flex-wrap justify-center gap-2" aria-label="Tags">
                {post.tags?.map((tag) => (
                  <TagPill key={tag.id} asChild variant="primary" size="md">
                    <Link
                      href={`/articles?tag=${tag.id}`}
                      aria-label={`View all posts with tag: ${tag.name}`}
                    >
                      <TagIcon className="h-3 w-3" aria-hidden="true" />
                      {tag.name}
                    </Link>
                  </TagPill>
                ))}
              </div>
              {metaBlock}
            </div>
          </div>
        </div>
      </section>

      <article className="container w-full py-8 sm:py-10 md:py-12">
        <div
          className={`mx-auto grid gap-8 sm:gap-10 ${
            shouldShowToc
              ? 'lg:grid-cols-[minmax(0,960px)_280px] lg:items-start'
              : 'max-w-[1024px]'
          }`}
        >
          <div id="article-reading-scope" className="min-w-0">
            <ArticleContent html={processedHtml} />
          </div>

          {shouldShowToc && (
            <div
              className="min-w-0 lg:sticky lg:self-start"
              style={{ top: 'var(--article-toc-sticky-top)' }}
            >
              <ArticleToc items={toc} readingScopeId="article-reading-scope" />
            </div>
          )}
        </div>

        {/* 関連記事と前後の記事は本文グリッドの外に配置 */}
        <Suspense fallback={<div className="py-8 text-center">Loading related posts...</div>}>
          {post.relatedPosts && <RelatedPosts relatedPosts={post.relatedPosts} />}
        </Suspense>

        {!draftState.isEnabled && (
          <Suspense fallback={<div className="py-8 text-center">Loading navigation...</div>}>
            <PrevNextPosts currentPost={{ id: post.id, publishedAt: post.publishedAt }} />
          </Suspense>
        )}
      </article>
    </div>
  );
}
