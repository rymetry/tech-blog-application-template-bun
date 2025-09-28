import { Author } from '@/components/author';
import { PrevNextPosts } from '@/components/prev-next-posts';
import { RelatedPosts } from '@/components/related-posts';
import { getAllPostSlugs, getPostBySlug } from '@/lib/cms';
import {
  buildBlogPostingJsonLd,
  buildBreadcrumbJsonLd,
  getSiteUrl,
  serializeJsonLd,
} from '@/lib/seo';
import { formatDate } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { BsArrowClockwise, BsCalendar2Check, BsTag } from 'react-icons/bs';

export const revalidate = 60;

interface BlogPostPageProps {
  params: { slug: string };
}

export function createGenerateMetadata(fetchPost = getPostBySlug) {
  return async ({ params }: BlogPostPageProps) => {
    try {
      const post = await fetchPost(params.slug);
      const siteUrl = getSiteUrl();
      const canonicalUrl = new URL(`/blog/${post.slug}`, siteUrl).toString();

      return {
        title: post.title,
        description: post.excerpt,
        openGraph: {
          title: post.title,
          description: post.excerpt,
          url: canonicalUrl,
          type: 'article',
          images: post.coverImage?.url ? [{ url: post.coverImage.url }] : undefined,
        },
        twitter: {
          card: 'summary_large_image',
          title: post.title,
          description: post.excerpt,
        },
        alternates: {
          canonical: canonicalUrl,
        },
      };
    } catch {
      notFound();
    }
  };
}

export const generateMetadata = createGenerateMetadata();

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export function createBlogPage(fetchPost = getPostBySlug) {
  return async function BlogPostPage({ params }: BlogPostPageProps) {
    try {
      const post = await fetchPost(params.slug);
      const siteUrl = getSiteUrl();
      const canonicalUrl = new URL(`/blog/${post.slug}`, siteUrl).toString();
      const breadcrumbJsonLd = serializeJsonLd(
        buildBreadcrumbJsonLd([
          { name: 'Home', url: siteUrl },
          { name: 'Blog', url: `${siteUrl}/blog` },
          { name: post.title, url: canonicalUrl },
        ]),
      );
      const blogPostingJsonLd = serializeJsonLd(buildBlogPostingJsonLd(post));

      return (
        <>
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
                      href={`/blog?tag=${tag.id}`}
                      key={tag.id}
                      className="tag-text bg-primary/10 text-primary hover:bg-primary/20 px-2 py-1 rounded-full transition-colors flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      aria-label={`View all posts with tag: ${tag.name}`}
                    >
                      <BsTag className="h-3 w-3" aria-hidden="true" />
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
                      <BsCalendar2Check className="h-4 w-4" aria-hidden="true" />
                      <time dateTime={post.publishedAt} aria-label={`Published on ${formatDate(post.publishedAt)}`}>
                        {formatDate(post.publishedAt)}
                      </time>
                    </div>
                    <div className="flex items-center gap-1">
                      <BsArrowClockwise className="h-4 w-4" aria-hidden="true" />
                      <time dateTime={post.updatedAt} aria-label={`Updated on ${formatDate(post.updatedAt)}`}>
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
              <div className="prose prose-gray dark:prose-invert" dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>

            <RelatedPosts relatedPosts={post.relatedPosts ?? []} />

            <Suspense fallback={null}>
              <PrevNextPosts postSlug={post.slug} />
            </Suspense>
          </article>

          <script
            type="application/ld+json"
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }}
          />
          <script
            type="application/ld+json"
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: blogPostingJsonLd }}
          />
        </>
      );
    } catch {
      notFound();
    }
  };
}

const BlogPostPage = createBlogPage();
export default BlogPostPage;
