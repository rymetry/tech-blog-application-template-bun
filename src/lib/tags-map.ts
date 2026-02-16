import { getAllTagsSafe } from '@/lib/api';
import { cache } from 'react';

const getTagsByIdMapSafeCached = cache(async (): Promise<Map<string, string>> => {
  const tags = await getAllTagsSafe();
  return new Map(tags.map((tag) => [tag.id, tag.name]));
});

let inFlightTagsByIdMap: Promise<Map<string, string>> | null = null;

export const getTagsByIdMapSafe = async (): Promise<Map<string, string>> => {
  if (inFlightTagsByIdMap) {
    return inFlightTagsByIdMap;
  }

  inFlightTagsByIdMap = getTagsByIdMapSafeCached().finally(() => {
    inFlightTagsByIdMap = null;
  });

  return inFlightTagsByIdMap;
};
