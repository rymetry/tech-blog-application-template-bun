import type { MetadataRoute } from 'next';
import { getArticlePosts } from '@/lib/api';
import { absoluteUrl } from '@/lib/metadata';

const STATIC_ROUTES = ['/', '/articles', '/about', '/contact'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: absoluteUrl(route),
    lastModified: new Date(),
  }));

  try {
    const limit = 100;
    let offset = 0;
    let totalCount = Infinity;

    while (offset < totalCount) {
      const response = await getArticlePosts({
        limit,
        offset,
        orders: '-publishedAt',
      });

      if (totalCount === Infinity) {
        totalCount = response.totalCount;
      }

      if (!response.contents.length) {
        break;
      }

      response.contents.forEach((article) => {
        routes.push({
          url: absoluteUrl(`/articles/${article.slug}`),
          lastModified: new Date(article.updatedAt || article.publishedAt),
        });
      });

      offset += limit;
    }
  } catch (error) {
    console.error('Error generating sitemap entries for articles:', error);
  }

  return routes;
}

