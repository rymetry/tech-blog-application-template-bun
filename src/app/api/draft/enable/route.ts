import { isAsciiSafe, toUtf8Buffer } from '@/lib/constants';
import { absoluteUrl, metadataBase } from '@/lib/metadata';
import { timingSafeEqual } from 'crypto';
import { draftMode } from 'next/headers';
import { NextResponse } from 'next/server';

const PREVIEW_SECRET = process.env.MICROCMS_PREVIEW_SECRET;

const resolveRedirectUrl = (path?: string | null) => {
  if (!path) {
    return absoluteUrl('/');
  }

  if (path.startsWith('http://') || path.startsWith('https://')) {
    try {
      const target = new URL(path);

      if (target.origin === metadataBase.origin) {
        return target.toString();
      }
    } catch (error) {
      console.error('Failed to parse redirect URL:', error);
    }

    return absoluteUrl('/');
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
  const targetLength = secretBuffer.length;

  let comparableCandidate: Buffer;

  if (candidateBuffer.length === targetLength) {
    comparableCandidate = candidateBuffer;
  } else if (candidateBuffer.length > targetLength) {
    comparableCandidate = candidateBuffer.subarray(0, targetLength);
  } else {
    comparableCandidate = Buffer.alloc(targetLength);
    candidateBuffer.copy(comparableCandidate);
  }

  const isEqual = timingSafeEqual(secretBuffer, comparableCandidate);
  return isEqual && candidateBuffer.length === targetLength;
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
