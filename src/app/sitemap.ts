import type { MetadataRoute } from 'next';
import { getAllArticles } from '@/lib/api';
import { absoluteUrl } from '@/lib/metadata';
import { toSafeErrorLogContext } from '@/lib/microcms';
import type { ArticlePost } from '@/types';

const STATIC_ROUTES = ['/', '/projects', '/articles', '/about', '/contact'];

type BuildSitemapOptions = {
  isProduction?: boolean;
};

type LoadArticles = () => Promise<ArticlePost[]>;

export async function buildSitemap(
  loadArticles: LoadArticles,
  options: BuildSitemapOptions = {},
): Promise<MetadataRoute.Sitemap> {
  const isProduction = options.isProduction ?? process.env.NODE_ENV === 'production';
  const routes: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: absoluteUrl(route),
  }));

  try {
    const articles = await loadArticles();

    articles.forEach((article) => {
      routes.push({
        url: absoluteUrl(`/articles/${article.slug}`),
        lastModified: new Date(article.updatedAt || article.publishedAt),
      });
    });
  } catch (error) {
    console.error('Error generating sitemap entries for articles:', toSafeErrorLogContext(error));
    if (isProduction) {
      throw error;
    }
  }

  return routes;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildSitemap(getAllArticles, { isProduction: process.env.NODE_ENV === 'production' });
}
