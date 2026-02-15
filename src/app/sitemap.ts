import type { MetadataRoute } from 'next';
import { getAllArticles } from '@/lib/api';
import { absoluteUrl } from '@/lib/metadata';

const STATIC_ROUTES = ['/', '/projects', '/articles', '/about', '/contact'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: absoluteUrl(route),
  }));

  try {
    const articles = await getAllArticles();

    articles.forEach((article) => {
      routes.push({
        url: absoluteUrl(`/articles/${article.slug}`),
        lastModified: new Date(article.updatedAt || article.publishedAt),
      });
    });
  } catch (error) {
    console.error('Error generating sitemap entries for articles:', error);
  }

  return routes;
}
