import type { BlogPost, Tag } from '@/types';
import type { Blog, MicroCMSTag } from './microcms';

/**
 * microCMSのブログ記事を内部形式に変換する
 */
export function adaptBlog(blog: Blog): BlogPost {
  return {
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    excerpt: blog.excerpt,
    publishedAt: blog.publishedAt,
    updatedAt: blog.updatedAt,
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
    content: blog.custom_body?.blog_body || '',
    relatedPosts:
      blog.custom_body?.related_blogs?.map((relatedBlog) => {
        return {
          id: relatedBlog.id,
          title: relatedBlog.title,
          slug: relatedBlog.slug,
          excerpt: relatedBlog.excerpt || '',
          publishedAt: relatedBlog.publishedAt,
          updatedAt: relatedBlog.updatedAt,
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
          content: relatedBlog.custom_body?.body || '',
        };
      }) || [],
  };
}

/**
 * microCMSのタグを内部形式に変換する
 */

export function adaptTag(tag: MicroCMSTag): Tag {
  return {
    id: tag.id,
    name: tag.name,
  };
}
