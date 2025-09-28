import { getPosts } from '@/lib/cms';
import { getSiteDescription, getSiteName, getSiteUrl } from '@/lib/seo';
import { Feed } from 'feed';

export async function GET() {
  const siteUrl = getSiteUrl();
  const siteName = getSiteName();
  const siteDescription = getSiteDescription();

  const feed = new Feed({
    id: siteUrl,
    link: siteUrl,
    title: siteName,
    description: siteDescription,
    language: 'ja',
    favicon: `${siteUrl}/favicon.ico`,
    updated: new Date(),
    copyright: `${new Date().getFullYear()} ${siteName}`,
  });

  try {
    const { items: posts } = await getPosts({ limit: 20 });
    posts.forEach((post) => {
      const postUrl = `${siteUrl}/blog/${post.slug}`;
      feed.addItem({
        title: post.title,
        id: postUrl,
        link: postUrl,
        description: post.excerpt,
        content: post.content,
        date: new Date(post.updatedAt ?? post.publishedAt),
      });
    });
  } catch (error) {
    console.error('Failed to build RSS feed:', error);
  }

  return new Response(feed.rss2(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
