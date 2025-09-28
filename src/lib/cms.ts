import type { BlogPost, Tag } from '@/types';
import { adaptBlog, adaptTag } from './adapters';
import { ENV } from './env';
import {
  PostListSchema,
  TagListSchema,
  PostSchema,
  SlugListSchema,
  type CMSPost,
  type CMSPostList,
  type CMSSlugList,
  type CMSTagList,
} from './schemas';

type FetchParams = Record<string, string | number | boolean | undefined>;

type FetchOptions = {
  revalidate?: number;
  tags?: string[];
};

const CMS_BASE_URL = `https://${ENV.MICROCMS_SERVICE_DOMAIN}.microcms.io/api/v1`;
const DEFAULT_REVALIDATE = 60;

const cmsHeaders = {
  'X-MICROCMS-API-KEY': ENV.MICROCMS_API_KEY,
};

async function fetchFromCMS<T>(
  endpoint: string,
  params: FetchParams = {},
  options: FetchOptions = {},
  parser: (data: unknown) => T,
): Promise<T> {
  const { revalidate = DEFAULT_REVALIDATE, tags = [] } = options;
  const url = new URL(`${CMS_BASE_URL}/${endpoint}`);
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    search.set(key, String(value));
  });

  if ([...search].length > 0) {
    url.search = search.toString();
  }

  const response = await fetch(url.toString(), {
    headers: cmsHeaders,
    next: { revalidate, tags },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  return parser(json);
}

export interface GetPostsParams {
  limit?: number;
  offset?: number;
  filters?: string;
  q?: string;
}

export interface GetPostsResult {
  items: BlogPost[];
  totalCount: number;
}

export async function getPosts(params: GetPostsParams = {}): Promise<GetPostsResult> {
  try {
    const data = await fetchFromCMS<CMSPostList>(
      'blogs',
      {
        limit: params.limit,
        offset: params.offset,
        filters: params.filters,
        q: params.q,
        depth: 2,
        orders: '-publishedAt',
      },
      { revalidate: DEFAULT_REVALIDATE, tags: ['posts'] },
      PostListSchema.parse,
    );

    return {
      items: data.contents.map((post) => adaptBlog(post)),
      totalCount: data.totalCount,
    };
  } catch (error) {
    console.error('Error fetching posts from microCMS:', error);
    return { items: [], totalCount: 0 };
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost> {
  try {
    const { items } = await getPosts({ filters: `slug[equals]${slug}`, limit: 1 });
    if (items[0]) {
      return items[0];
    }
  } catch (error) {
    console.error('Error fetching post by slug:', error);
  }

  try {
    const post = await fetchFromCMS<CMSPost>(
      `blogs/${slug}`,
      { depth: 3 },
      { revalidate: DEFAULT_REVALIDATE, tags: ['posts'] },
      PostSchema.parse,
    );

    return adaptBlog(post);
  } catch (error) {
    console.error('Fallback fetch by ID failed:', error);
  }

  throw new Error(`Post not found for slug or id: ${slug}`);
}

export async function getAllPostSlugs(): Promise<string[]> {
  try {
    const data = await fetchFromCMS<CMSSlugList>(
      'blogs',
      { limit: 100, orders: '-publishedAt', fields: 'id,slug' },
      { revalidate: DEFAULT_REVALIDATE, tags: ['posts'] },
      SlugListSchema.parse,
    );

    return data.contents.map((post) => post.slug || post.id);
  } catch (error) {
    console.error('Error fetching post slugs:', error);
    return [];
  }
}

export async function getTags(): Promise<Tag[]> {
  try {
    const data = await fetchFromCMS<CMSTagList>(
      'tags',
      { limit: 100 },
      { revalidate: DEFAULT_REVALIDATE, tags: ['tags'] },
      TagListSchema.parse,
    );

    return data.contents.map(adaptTag);
  } catch (error) {
    console.error('Error fetching tags from microCMS:', error);
    return [];
  }
}
