import type { Author as AuthorType, ArticlePost, Tag } from '@/types';
import type { Article, MicroCMSAuthor, MicroCMSTag } from './microcms';

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
export function adaptArticle(article: Article): ArticlePost {
  const hasCoverImage = Boolean(article.ogp_image?.url || article.ogpImage?.url);
  const coverImage = pickImage(article.ogp_image, article.ogpImage) || fallbackImage;
  const authorImage =
    pickImage(article.authors?.image, article.authors?.profileImage) || fallbackAuthorImage;
  const articleBody = article.custom_body?.article_body || article.content?.body || '';
  const relatedArticles = article.custom_body?.related_articles || article.content?.relatedArticles || [];

  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt || '',
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    coverImage: {
      url: coverImage.url,
      height: coverImage.height,
      width: coverImage.width,
    },
    hasCoverImage,
    author: article.authors
      ? {
          id: article.authors.id || '',
          name: article.authors.name || 'Anonymous',
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
      article.tags?.map((tag) => ({
        id: tag.id,
        name: tag.name,
      })) || [],
    content: articleBody,
    relatedPosts:
      relatedArticles?.map((relatedArticle) => {
        const hasRelatedCover = Boolean(relatedArticle.ogp_image?.url || relatedArticle.ogpImage?.url);
        const relatedCover =
          pickImage(relatedArticle.ogp_image, relatedArticle.ogpImage) || fallbackImage;
        const relatedAuthorImage =
          pickImage(relatedArticle.authors?.image, relatedArticle.authors?.profileImage) ||
          fallbackAuthorImage;

        return {
          id: relatedArticle.id,
          title: relatedArticle.title,
          slug: relatedArticle.slug,
          excerpt: relatedArticle.excerpt || '',
          publishedAt: relatedArticle.publishedAt,
          updatedAt: relatedArticle.updatedAt,
          coverImage: {
            url: relatedCover.url,
            height: relatedCover.height,
            width: relatedCover.width,
          },
          hasCoverImage: hasRelatedCover,
          author: relatedArticle.authors
            ? {
                id: relatedArticle.authors.id || '',
                name: relatedArticle.authors.name || 'Anonymous',
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
            relatedArticle.tags?.map((tag) => ({
              id: tag.id,
              name: tag.name,
            })) || [],
          content:
            relatedArticle.custom_body?.article_body ||
            relatedArticle.custom_body?.body ||
            relatedArticle.content?.body ||
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
