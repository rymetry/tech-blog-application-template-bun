import { z } from 'zod';

export const ImageSchema = z.object({
  url: z.string().url(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export const TagSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string().optional(),
});

export const AuthorSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: ImageSchema.optional().nullish(),
});

export const RelatedPostSchema = z.lazy(() =>
  z
    .object({
      id: z.string(),
      title: z.string(),
      slug: z.string(),
      excerpt: z.string().optional().nullable(),
      publishedAt: z.string(),
      updatedAt: z.string().optional().nullable(),
      ogp_image: ImageSchema.optional().nullish(),
      authors: AuthorSchema.optional().nullish(),
      tags: z.array(TagSchema).optional(),
      custom_body: z
        .object({
          body: z.string().optional().nullable(),
          blog_body: z.string().optional().nullable(),
        })
        .partial()
        .optional(),
    })
    .passthrough(),
);

export const PostSchema = z.lazy(() =>
  z
    .object({
      id: z.string(),
      title: z.string(),
      slug: z.string(),
      excerpt: z.string().optional().nullable(),
      publishedAt: z.string(),
      updatedAt: z.string().optional().nullable(),
      ogp_image: ImageSchema.optional().nullish(),
      authors: AuthorSchema.optional().nullish(),
      tags: z.array(TagSchema).optional(),
      custom_body: z
        .object({
          blog_body: z.string().optional().nullable(),
          related_blogs: z.array(RelatedPostSchema).optional(),
        })
        .partial()
        .optional(),
    })
    .passthrough(),
);

export const PostListSchema = z.object({
  contents: z.array(PostSchema),
  totalCount: z.number().int().nonnegative(),
  limit: z.number().int().nonnegative(),
  offset: z.number().int().nonnegative(),
});

export const TagListSchema = z.object({
  contents: z.array(TagSchema),
  totalCount: z.number().int().nonnegative(),
  limit: z.number().int().nonnegative(),
  offset: z.number().int().nonnegative(),
});

export const SlugSchema = z.object({
  slug: z.string(),
});

export const SlugListSchema = z.object({
  contents: z.array(SlugSchema),
  totalCount: z.number().int().nonnegative(),
  limit: z.number().int().nonnegative(),
  offset: z.number().int().nonnegative(),
});

export type CMSImage = z.infer<typeof ImageSchema>;
export type CMSTag = z.infer<typeof TagSchema>;
export type CMSAuthor = z.infer<typeof AuthorSchema>;
export type CMSRelatedPost = z.infer<typeof RelatedPostSchema>;
export type CMSPost = z.infer<typeof PostSchema>;
export type CMSPostList = z.infer<typeof PostListSchema>;
export type CMSTagList = z.infer<typeof TagListSchema>;
export type CMSSlugList = z.infer<typeof SlugListSchema>;
