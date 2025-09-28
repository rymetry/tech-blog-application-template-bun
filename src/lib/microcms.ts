import type { MicroCMSQueries } from 'microcms-js-sdk';
import { createClient } from 'microcms-js-sdk';
import { ENV } from './env';

// microCMSクライアントの作成
export const client = createClient({
  serviceDomain: ENV.MICROCMS_SERVICE_DOMAIN,
  apiKey: ENV.MICROCMS_API_KEY,
  retry: true,
});

// 型定義
export type BlogResponse = {
  totalCount: number;
  offset: number;
  limit: number;
  contents: Blog[];
};

export type Blog = {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
  date_published: string;
  title: string;
  slug: string;
  ogp_image: {
    url: string;
    height: number;
    width: number;
  };
  authors: {
    id: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    revisedAt: string;
    name: string;
    image: {
      url: string;
      height: number;
      width: number;
    };
  };
  tags: [
    {
      id: string;
      createdAt: string;
      updatedAt: string;
      publishedAt: string;
      revisedAt: string;
      name: string;
    },
  ];
  custom_body: {
    fieldId: string;
    toc_visible: boolean;
    blog_body: string;
    related_blogs: [
      {
        id: string;
        createdAt: string;
        updatedAt: string;
        publishedAt: string;
        revisedAt: string;
        date: string;
        title: string;
        slug: string;
        ogp_image: {
          url: string;
          height: number;
          width: number;
        };
        authors?: {
          id: string;
          createdAt: string;
          updatedAt: string;
          publishedAt: string;
          revisedAt: string;
          name: string;
          image: {
            url: string;
            height: number;
            width: number;
          };
        };
        tags?: [
          {
            id: string;
            createdAt: string;
            updatedAt: string;
            publishedAt: string;
            revisedAt: string;
            name: string;
          },
        ];
        custom_body: {
          fieldId: string;
          toc_visible: boolean;
          body: string;
          related_blogs: [];
        };
        excerpt: string;
      },
    ];
  };
  excerpt: string;
};

export type MicroCMSTag = {
  id: string;
  name: string;
};

// エンドポイントの定義
const ENDPOINTS = {
  BLOGS: 'blogs',
  TAGS: 'tags',
  AUTHORS: 'authors',
};

/**
 * ブログ記事一覧を取得する
 */
export const getList = async (queries?: MicroCMSQueries, endpoint = ENDPOINTS.BLOGS) => {
  try {
    const listData = await client.getList<Blog>({
      endpoint,
      queries,
    });
    return listData;
  } catch (error) {
    console.error(`Error fetching from endpoint ${endpoint}:`, error);
    return { contents: [], totalCount: 0, offset: 0, limit: 10 };
  }
};

/**
 * ブログ記事詳細を取得する
 * @param contentId コンテンツID
 * @param queries クエリパラメータ
 * @param endpoint エンドポイント
 * @returns ブログ記事詳細
 */
export const getDetail = async (
  contentId: string,
  queries?: MicroCMSQueries,
  endpoint = ENDPOINTS.BLOGS,
) => {
  try {
    // depthパラメータを設定して関連コンテンツの詳細も取得
    const mergedQueries = { ...queries, depth: 3 as const };

    const detailData = await client.getListDetail<Blog>({
      endpoint,
      contentId,
      queries: mergedQueries,
    });

    return detailData;
  } catch (error) {
    console.error(`Error fetching detail from endpoint ${endpoint}:`, error);
    throw error;
  }
};

/**
 * タグ一覧を取得する
 */
export const getTags = async (queries?: MicroCMSQueries) => {
  try {
    const tagsData = await client.getList({
      endpoint: ENDPOINTS.TAGS,
      queries,
    });
    return tagsData;
  } catch (error) {
    console.error('Error fetching tags:', error);
    return { contents: [], totalCount: 0, offset: 0, limit: 10 };
  }
};

/**
 * 著者一覧を取得する
 */
export const getAuthors = async (queries?: MicroCMSQueries) => {
  try {
    const authorsData = await client.getList({
      endpoint: ENDPOINTS.AUTHORS,
      queries,
    });
    return authorsData;
  } catch (error) {
    console.error('Error fetching authors:', error);
    return { contents: [], totalCount: 0, offset: 0, limit: 10 };
  }
};
