import type { Author as AuthorType, BlogPost, Tag } from '@/types';
import type { Blog, MicroCMSAuthor, MicroCMSTag } from './microcms';

type ImageLike = { url: string; height: number; width: number };

const fallbackImage: ImageLike = {
  url: '/placeholder.svg',
  height: 630,
  width: 1200,
};

const fallbackAuthorImage: ImageLike = {
  url: '/placeholder.svg',
  height: 100,
  width: 100,
};

const pickImage = (primary?: ImageLike, secondary?: ImageLike): ImageLike | undefined => {
  return primary || secondary || undefined;
};

/**
 * microCMSのブログ記事を内部形式に変換する
 */
export function adaptBlog(blog: Blog): BlogPost {
  const coverImage = pickImage(blog.ogp_image, blog.ogpImage) || fallbackImage;
  const authorImage =
    pickImage(blog.authors?.image, blog.authors?.profileImage) || fallbackAuthorImage;
  const blogBody = blog.custom_body?.blog_body || blog.content?.body || '';
  const relatedBlogs = blog.custom_body?.related_blogs || blog.content?.relatedArticles || [];

  return {
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    excerpt: blog.excerpt || '',
    publishedAt: blog.publishedAt,
    updatedAt: blog.updatedAt,
    coverImage: {
      url: coverImage.url,
      height: coverImage.height,
      width: coverImage.width,
    },
    author: blog.authors
      ? {
          id: blog.authors.id || '',
          name: blog.authors.name || 'Anonymous',
          image: {
            url: authorImage.url,
            height: authorImage.height,
            width: authorImage.width,
          },
        }
      : {
          id: '',
          name: 'Anonymous',
          image: {
            url: fallbackAuthorImage.url,
            height: fallbackAuthorImage.height,
            width: fallbackAuthorImage.width,
          },
        },
    tags:
      blog.tags?.map((tag) => ({
        id: tag.id,
        name: tag.name,
      })) || [],
    content: blogBody,
    relatedPosts:
      relatedBlogs?.map((relatedBlog) => {
        const relatedCover =
          pickImage(relatedBlog.ogp_image, relatedBlog.ogpImage) || fallbackImage;
        const relatedAuthorImage =
          pickImage(relatedBlog.authors?.image, relatedBlog.authors?.profileImage) ||
          fallbackAuthorImage;

        return {
          id: relatedBlog.id,
          title: relatedBlog.title,
          slug: relatedBlog.slug,
          excerpt: relatedBlog.excerpt || '',
          publishedAt: relatedBlog.publishedAt,
          updatedAt: relatedBlog.updatedAt,
          coverImage: {
            url: relatedCover.url,
            height: relatedCover.height,
            width: relatedCover.width,
          },
          author: relatedBlog.authors
            ? {
                id: relatedBlog.authors.id || '',
                name: relatedBlog.authors.name || 'Anonymous',
                image: {
                  url: relatedAuthorImage.url,
                  height: relatedAuthorImage.height,
                  width: relatedAuthorImage.width,
                },
              }
            : {
                id: '',
                name: 'Anonymous',
                image: {
                  url: fallbackAuthorImage.url,
                  height: fallbackAuthorImage.height,
                  width: fallbackAuthorImage.width,
                },
              },
          tags:
            relatedBlog.tags?.map((tag) => ({
              id: tag.id,
              name: tag.name,
            })) || [],
          content:
            relatedBlog.custom_body?.blog_body ||
            relatedBlog.custom_body?.body ||
            relatedBlog.content?.body ||
            '',
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

export function adaptAuthor(author: MicroCMSAuthor): AuthorType {
  const image = pickImage(author.image, author.profileImage) || fallbackAuthorImage;

  return {
    id: author.id,
    name: author.name || 'Anonymous',
    image: {
      url: image.url,
      height: image.height,
      width: image.width,
    },
  };
}
