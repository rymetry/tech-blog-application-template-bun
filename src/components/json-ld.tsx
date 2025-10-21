type JsonLdProps = {
  data: Record<string, unknown>;
  id?: string;
};

export function JsonLd({ data, id }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      {...(id ? { id } : {})}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

