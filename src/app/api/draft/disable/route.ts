import { absoluteUrl, metadataBase } from '@/lib/metadata';
import { normalizeSafeRedirectPath } from '@/lib/safe-redirect';
import { draftMode } from 'next/headers';
import { NextResponse } from 'next/server';

const withNoStore = (response: NextResponse) => {
  response.headers.set('Cache-Control', 'no-store');
  return response;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestOrigin = new URL(request.url).origin;
  const path = normalizeSafeRedirectPath(searchParams.get('path'), {
    allowedOrigins: [metadataBase.origin, requestOrigin],
  });
  const redirectUrl = absoluteUrl(path);

  const draft = await draftMode();
  draft.disable();

  return withNoStore(NextResponse.redirect(redirectUrl));
}
