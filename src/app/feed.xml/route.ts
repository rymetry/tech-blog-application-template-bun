import { getAllArticles } from '@/lib/api';
import { absoluteUrl, feedUrl, siteMetadata } from '@/lib/metadata';
import { escapeForXml, stripHtml, truncateForSEO } from '@/lib/utils';

export const revalidate = 3600; // 1 hour

const buildItem = (article: Awaited<ReturnType<typeof getAllArticles>>[number]) => {
  const url = absoluteUrl(`/articles/${article.slug}`);
  const rawDescription = stripHtml(article.excerpt || article.content);
  const description = escapeForXml(truncateForSEO(rawDescription));
  const title = escapeForXml(article.title);

  return `
    <item>
      <title>${title}</title>
      <link>${url}</link>
      <description>${description}</description>
      <pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>
      <guid>${url}</guid>
    </item>
  `;
};

export async function GET() {
  const articles = await getAllArticles();

  const items = articles.map(buildItem).join('');

  const channelTitle = escapeForXml(siteMetadata.name);
  const channelDescription = escapeForXml(siteMetadata.description);

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${channelTitle}</title>
    <link>${siteMetadata.url}</link>
    <description>${channelDescription}</description>
    <language>ja</language>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
