import RSS from 'rss';
import { getAllArticles } from '@/lib/api';
import { feedUrl, siteMetadata, absoluteUrl } from '@/lib/metadata';
import { MICROCMS_REVALIDATE_SECONDS } from '@/lib/microcms';
import { stripHtml, truncateForSEO } from '@/lib/utils';

// Route segment config は識別子参照を許可しないため、ここは数値リテラルで定義する。
export const revalidate = 300;
const CONTENT_PREVIEW_LENGTH = 1000;

export async function GET() {
  let articles = [] as Awaited<ReturnType<typeof getAllArticles>>;

  try {
    articles = await getAllArticles();
  } catch (error) {
    console.error('Error generating feed entries:', error);
    return new Response('Feed temporarily unavailable', {
      status: 503,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  }

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
      (article.content ? stripHtml(article.content).slice(0, CONTENT_PREVIEW_LENGTH) : '');
    const description = truncateForSEO(previewSource);
    const url = absoluteUrl(`/articles/${article.slug}`);

    feed.item({
      title: article.title,
      description,
      url,
      guid: url,
      date: new Date(article.publishedAt),
      ...(article.author?.name ? { author: article.author.name } : {}),
      categories: article.tags?.map((tag) => tag.name).filter(Boolean),
    });
  });

  return new Response(feed.xml({ indent: true }), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': `public, max-age=${MICROCMS_REVALIDATE_SECONDS}, s-maxage=${MICROCMS_REVALIDATE_SECONDS}`,
    },
  });
}
