import RSS from 'rss';
import { getAllArticles } from '@/lib/api';
import { feedUrl, siteMetadata, absoluteUrl } from '@/lib/metadata';
import { stripHtml, truncateForSEO } from '@/lib/utils';

export const revalidate = 3600; // 1 hour
const CONTENT_PREVIEW_LENGTH = 1000;

export async function GET() {
  const articles = await getAllArticles();

  const feed = new RSS({
    title: siteMetadata.name,
    description: siteMetadata.description,
    site_url: siteMetadata.url,
    feed_url: feedUrl,
    language: siteMetadata.locale,
  });

  articles.forEach((article) => {
    const previewSource =
      article.excerpt ||
      (article.content ? article.content.slice(0, CONTENT_PREVIEW_LENGTH) : '');
    const description = truncateForSEO(stripHtml(previewSource));
    const url = absoluteUrl(`/articles/${article.slug}`);

    feed.item({
      title: article.title,
      description,
      url,
      guid: url,
      date: new Date(article.publishedAt),
      author: article.author?.name,
      categories: article.tags?.map((tag) => tag.name).filter(Boolean),
    });
  });

  return new Response(feed.xml({ indent: true }), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
