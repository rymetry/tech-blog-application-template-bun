import { getAllTagsSafe } from '@/lib/api';

export const getTagsByIdMapSafe = async (): Promise<Map<string, string>> => {
  const tags = await getAllTagsSafe();
  return new Map(tags.map((tag) => [tag.id, tag.name]));
};
