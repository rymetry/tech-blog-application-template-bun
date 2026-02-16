import { logWarnEvent } from '@/lib/log-warn';
import { stringifyJsonLd } from '@/lib/safe-json';

type JsonLdProps = {
  data: Record<string, unknown>;
  id?: string;
};

export function JsonLd({ data, id }: JsonLdProps) {
  let serialized = '{}';

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
  }

  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      {...(id ? { id } : {})}
      dangerouslySetInnerHTML={{ __html: serialized }}
    />
  );
}
