import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

type RevalidateDeps = {
  expectedSecret?: string | null;
  revalidateTagFn?: typeof revalidateTag;
  revalidatePathFn?: typeof revalidatePath;
  headerName?: string;
};

const DEFAULT_HEADER = 'x-revalidate-secret';
const REVALIDATE_TAGS = ['posts', 'tags'] as const;
const REVALIDATE_PATHS = ['/', '/blog'] as const;

export async function handleRevalidate(
  request: Request,
  {
    expectedSecret = process.env.REVALIDATE_SECRET,
    revalidateTagFn = revalidateTag,
    revalidatePathFn = revalidatePath,
    headerName = DEFAULT_HEADER,
  }: RevalidateDeps = {},
) {
  if (!expectedSecret) {
    return NextResponse.json({ ok: false, message: 'Missing revalidate secret configuration.' }, { status: 500 });
  }

  const providedSecret = request.headers.get(headerName);

  if (!providedSecret || providedSecret !== expectedSecret) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  await Promise.all(REVALIDATE_TAGS.map((tag) => revalidateTagFn(tag)));
  REVALIDATE_PATHS.forEach((path) => {
    void revalidatePathFn(path);
  });

  return NextResponse.json({ ok: true, revalidated: true });
}
