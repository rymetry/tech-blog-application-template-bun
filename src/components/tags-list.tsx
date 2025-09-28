import { TagFilter } from '@/components/tag-filter';
import { getTags } from '@/lib/cms';

export async function TagsList() {
  const tags = await getTags();
  return <TagFilter tags={tags} />;
}
