import type { Author } from './author';
import type { Tag } from './tag';

export interface ArticlePost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  updatedAt: string;
  coverImage: {
    url: string;
    height: number;
    width: number;
  };
  author: Author;
  tags: Tag[];
  content: string;
  relatedPosts?: ArticlePost[];
}
