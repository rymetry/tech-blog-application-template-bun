import { CSP_NONCE_HEADER } from '@/lib/csp';
import { logWarnEvent } from '@/lib/log-warn';
import { stringifyJsonLd } from '@/lib/safe-json';
import { headers } from 'next/headers';

type JsonLdProps = {
  data: Record<string, unknown>;
  id?: string;
  nonce?: string;
};

export async function JsonLd({ data, id, nonce }: JsonLdProps) {
  let serialized = '';
  const requestHeaders = await headers();
  const effectiveNonce = nonce || requestHeaders.get(CSP_NONCE_HEADER) || undefined;

  try {
    serialized = stringifyJsonLd(data);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      throw error;
    }

    logWarnEvent({
      event: 'jsonld_stringify_failed_prod',
      reason: 'stringify_exception',
      context: { component: 'json-ld' },
    });
    return null;
  }

  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      {...(effectiveNonce ? { nonce: effectiveNonce } : {})}
      {...(id ? { id } : {})}
      dangerouslySetInnerHTML={{ __html: serialized }}
    />
  );
}
