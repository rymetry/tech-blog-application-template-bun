import type { BlogPost, Tag } from '@/types';
import type { CMSPost, CMSRelatedPost, CMSTag } from './schemas';

type CustomBody = CMSPost['custom_body'] | CMSRelatedPost['custom_body'] | undefined;

const extractBody = (customBody: CustomBody): string => {
  if (!customBody) {
    return '';
  }

  if (typeof customBody.blog_body === 'string' && customBody.blog_body) {
    return customBody.blog_body;
  }

  const maybeBody = (customBody as { body?: string | null | undefined }).body;

  if (typeof maybeBody === 'string' && maybeBody) {
    return maybeBody;
  }

  return '';
};

/**
 * microCMSのブログ記事を内部形式に変換する
 */
export function adaptBlog(blog: CMSPost | CMSRelatedPost): BlogPost {
  return {
    id: blog.id,
    title: blog.title,
    slug: blog.slug || blog.id,
    excerpt: blog.excerpt ?? '',
    publishedAt: blog.publishedAt,
    updatedAt: blog.updatedAt ?? blog.publishedAt,
    coverImage: {
      url: blog.ogp_image?.url || '/placeholder.svg',
      height: blog.ogp_image?.height || 630,
      width: blog.ogp_image?.width || 1200,
    },
    author: blog.authors
      ? {
          id: blog.authors.id || '',
          name: blog.authors.name || 'Anonymous',
          image: {
            url: blog.authors.image?.url || '/placeholder.svg',
            height: blog.authors.image?.height || 100,
            width: blog.authors.image?.width || 100,
          },
        }
      : {
          id: '',
          name: 'Anonymous',
          image: {
            url: '/placeholder.svg',
            height: 100,
            width: 100,
          },
        },
    tags:
      blog.tags?.map((tag) => ({
        id: tag.id,
        name: tag.name,
      })) || [],
    content: extractBody(blog.custom_body),
    relatedPosts: ((): BlogPost[] => {
      const relatedRaw = (blog.custom_body as { related_blogs?: CMSRelatedPost[] } | undefined)?.related_blogs;

      if (!Array.isArray(relatedRaw)) {
        return [];
      }

      return relatedRaw.map((relatedBlog) => ({
        id: relatedBlog.id,
        title: relatedBlog.title,
        slug: relatedBlog.slug || relatedBlog.id,
        excerpt: relatedBlog.excerpt ?? '',
        publishedAt: relatedBlog.publishedAt,
        updatedAt: relatedBlog.updatedAt ?? relatedBlog.publishedAt,
        coverImage: {
          url: relatedBlog.ogp_image?.url || '/placeholder.svg',
          height: relatedBlog.ogp_image?.height || 630,
          width: relatedBlog.ogp_image?.width || 1200,
        },
        author: relatedBlog.authors
          ? {
              id: relatedBlog.authors.id || '',
              name: relatedBlog.authors.name || 'Anonymous',
              image: {
                url: relatedBlog.authors.image?.url || '/placeholder.svg',
                height: relatedBlog.authors.image?.height || 100,
                width: relatedBlog.authors.image?.width || 100,
              },
            }
          : {
              id: '',
              name: 'Anonymous',
              image: {
                url: '/placeholder.svg',
                height: 100,
                width: 100,
              },
            },
        tags:
          relatedBlog.tags?.map((tag) => ({
            id: tag.id,
            name: tag.name,
          })) || [],
        content: extractBody(relatedBlog.custom_body),
      }));
    })(),
  };
}

/**
 * microCMSのタグを内部形式に変換する
 */

export function adaptTag(tag: CMSTag): Tag {
  return {
    id: tag.id,
    name: tag.name,
  };
}
