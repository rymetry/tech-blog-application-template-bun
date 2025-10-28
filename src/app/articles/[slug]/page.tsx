import { Author } from '@/components/author';
import { PrevNextPosts } from '@/components/prev-next-posts';
import { RelatedPosts } from '@/components/related-posts';
import { JsonLd } from '@/components/json-ld';
import { ArticleContent } from '@/components/article-content';
import { getArticlePost, getArticlePosts } from '@/lib/api';
import { createArticleMetadata, createPageMetadata } from '@/lib/metadata-helpers';
import { buildArticleJsonLd, buildBreadcrumbJsonLd } from '@/lib/structured-data';
import { formatDate } from '@/lib/utils';
import { CalendarCheck, RefreshCcw, Tag } from 'lucide-react';
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

  try {
    const post = await getArticlePost(slug, previewOptions);
    const breadcrumbJsonLd = buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Blog', path: '/articles' },
      { name: post.title, path: `/articles/${post.slug}` },
    ]);
    const articleJsonLd = buildArticleJsonLd(post);

    return (
      <>
        <JsonLd data={breadcrumbJsonLd} id="article-breadcrumb-jsonld" />
        <JsonLd data={articleJsonLd} id="article-structured-jsonld" />
        <section className="w-full pt-24 pb-12 md:pt-32 md:pb-16 diagonal-background">
          <div className="container text-center">
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="mb-10 max-w-[360px] mx-auto">
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
              <h1 className="font-bold tracking-tight">
                {post.title}
              </h1>
              <div className="flex flex-wrap justify-center gap-4 mb-4 mt-4 md:my-5 lg:my-6" aria-label="Tags">
                {post.tags?.map((tag) => (
                  <Link
                    href={`/articles?tag=${tag.id}`}
                    key={tag.id}
                    className="tag-text bg-primary/10 text-primary hover:bg-primary/20 px-2 py-1 rounded-full transition-colors flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    aria-label={`View all posts with tag: ${tag.name}`}
                  >
                    <Tag className="h-3 w-3" aria-hidden="true" />
                    {tag.name}
                  </Link>
                ))}
              </div>
              <div className="flex gap-8 items-center justify-center">
                {post.author && (
                  <div className="flex justify-center mt-2">
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

        <article className="container py-8 sm:py-10 md:py-12 max-w-[1024px]">
          <div className="max-w-[1024px] mx-auto">
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
  } catch (error) {
    console.error('Error fetching article post:', error);
    notFound();
  }
}
