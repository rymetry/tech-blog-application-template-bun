import { TagFilter } from '@/components/tag-filter';
import { getAllTagsSafe } from '@/lib/api';

export async function TagsList() {
  const tags = await getAllTagsSafe();
  return <TagFilter tags={tags} />;
}
