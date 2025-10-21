import { absoluteUrl } from '@/lib/metadata';
import { draftMode } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path') || '/';
  const redirectUrl = path.startsWith('http://') || path.startsWith('https://')
    ? path
    : absoluteUrl(path.startsWith('/') ? path : `/${path}`);

  const draft = await draftMode();
  draft.disable();

  return NextResponse.redirect(redirectUrl);
}
