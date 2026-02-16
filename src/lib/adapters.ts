import type { ArticlePost, Tag } from '@/types';
import type { Article, MicroCMSTag } from './microcms';

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
  const showToc =
    typeof article.custom_body?.toc_visible === 'boolean'
      ? article.custom_body.toc_visible
      : typeof article.content?.showToc === 'boolean'
        ? article.content.showToc
        : null;

  return {
    id: article.id,
    createdAt: article.createdAt,
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
          email: article.authors.email,
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
    showToc,
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
          createdAt: relatedArticle.createdAt,
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
                email: relatedArticle.authors.email,
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
