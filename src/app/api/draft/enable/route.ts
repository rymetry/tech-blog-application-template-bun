import { isAsciiSafe, toUtf8Buffer } from '@/lib/constants';
import { absoluteUrl } from '@/lib/metadata';
import { timingSafeEqual } from 'crypto';
import { draftMode } from 'next/headers';
import { NextResponse } from 'next/server';

const PREVIEW_SECRET = process.env.MICROCMS_PREVIEW_SECRET;

const resolveRedirectUrl = (path?: string | null) => {
  if (!path) {
    return absoluteUrl('/');
  }

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return absoluteUrl(normalizedPath);
};

const isValidSecret = (candidate: string | null) => {
  if (!PREVIEW_SECRET || !candidate) {
    return false;
  }

  if (!isAsciiSafe(PREVIEW_SECRET) || !isAsciiSafe(candidate)) {
    return false;
  }

  const secretBuffer = toUtf8Buffer(PREVIEW_SECRET);
  const candidateBuffer = toUtf8Buffer(candidate);

  if (secretBuffer.length !== candidateBuffer.length) {
    return false;
  }

  return timingSafeEqual(secretBuffer, candidateBuffer);
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (!isValidSecret(secret)) {
    return new NextResponse('Invalid preview secret', { status: 401 });
  }

  const draftKey = searchParams.get('draftKey') || undefined;
  const contentId = searchParams.get('contentId') || undefined;
  const path = searchParams.get('path') || searchParams.get('slug') || '/';
  const redirectUrl = new URL(resolveRedirectUrl(path));

  if (draftKey) {
    redirectUrl.searchParams.set('draftKey', draftKey);
  }

  if (contentId) {
    redirectUrl.searchParams.set('contentId', contentId);
  }

  const draft = await draftMode();
  draft.enable();

  return NextResponse.redirect(redirectUrl);
}
