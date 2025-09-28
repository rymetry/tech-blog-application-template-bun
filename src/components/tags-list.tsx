import { TagFilter } from '@/components/tag-filter';
import { getTags } from '@/lib/api';

export async function TagsList() {
  const { contents: tags } = await getTags();
  return <TagFilter tags={tags} />;
}
