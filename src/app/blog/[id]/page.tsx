import { Author } from '@/components/author';
import { PrevNextPosts } from '@/components/prev-next-posts';
import { RelatedPosts } from '@/components/related-posts';
import { getBlogPost } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { BsArrowClockwise, BsCalendar2Check, BsTag } from 'react-icons/bs';

interface BlogPostPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata(props: BlogPostPageProps) {
  const params = await props.params;
  try {
    const post = await getBlogPost(params.id);

    return {
      title: post.title,
      description: post.excerpt,
      openGraph: {
        title: post.title,
        description: post.excerpt,
        images: [{ url: post.coverImage.url }],
      },
    };
  } catch {
    return {
      title: 'Blog Post',
      description: 'Blog post not found',
    };
  }
}

// 関連/前後ナビは外部コンポーネントに分離

export default async function BlogPostPage(props: BlogPostPageProps) {
  const params = await props.params;
  try {
    const post = await getBlogPost(params.id);

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
                    <time
                      dateTime={post.publishedAt}
                      aria-label={`Published on ${formatDate(post.publishedAt)}`}
                    >
                      {formatDate(post.publishedAt)}
                    </time>
                  </div>
                  <div className="flex items-center gap-1">
                    <BsArrowClockwise className="h-4 w-4" aria-hidden="true" />
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
            <div
              className="prose prose-gray dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          {/* 関連記事と前後の記事を並列で取得 */}
          <Suspense fallback={<div className="py-8 text-center">Loading related posts...</div>}>
            {post.relatedPosts && <RelatedPosts relatedPosts={post.relatedPosts} />}
          </Suspense>

          <Suspense fallback={<div className="py-8 text-center">Loading navigation...</div>}>
            <PrevNextPosts postId={params.id} />
          </Suspense>
        </article>
      </>
    );
  } catch (error) {
    console.error('Error fetching blog post:', error);
    notFound();
  }
}
