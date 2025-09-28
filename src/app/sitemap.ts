import { getAllPostSlugs } from '@/lib/cms';
import { getSiteUrl } from '@/lib/seo';
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${siteUrl}/blog`,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/about`,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${siteUrl}/contact`,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  try {
    const slugs = await getAllPostSlugs();
    const postEntries: MetadataRoute.Sitemap = slugs.map((slug) => ({
      url: `${siteUrl}/blog/${slug}`,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...staticRoutes, ...postEntries];
  } catch (error) {
    console.error('Failed to generate sitemap:', error);
    return staticRoutes;
  }
}
