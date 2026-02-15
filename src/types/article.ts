import type { Author } from './author';
import type { Tag } from './tag';

export interface ArticlePost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  updatedAt: string;
  coverImage: Thumbnail;
  hasCoverImage: boolean;
  author: Author;
  tags: Tag[];
  content: string;
  relatedPosts?: ArticlePost[];
}

export interface Thumbnail {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
}
