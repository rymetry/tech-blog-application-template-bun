// These types are for internal use in our components
// They're simplified versions of the microCMS types

export interface BlogPost {
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
  author: {
    id: string;
    name: string;
    image: {
      url: string;
      height: number;
      width: number;
    };
  };
  tags: Tag[];
  content: string;
  relatedPosts?: BlogPost[];
}

export interface Tag {
  id: string;
  name: string;
}

export interface Author {
  id: string;
  name: string;
  image: {
    url: string;
    height: number;
    width: number;
  };
}
