import { PageHero } from '@/components/page-hero';
import { SectionContainer } from '@/components/section-container';
import { ContactForm } from '@/components/contact-form';
import { JsonLd } from '@/components/json-ld';
import { createPageMetadata } from '@/lib/metadata-helpers';
import { buildBreadcrumbJsonLd } from '@/lib/structured-data';

export const metadata = createPageMetadata({
  title: 'Contact',
  description: "Have a question or feedback? We'd love to hear from you.",
  path: '/contact',
});

export default async function ContactPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Contact', path: '/contact' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} id="contact-breadcrumb-jsonld" />

      <PageHero
        title="Contact"
        description="Have a question or feedback? We'd love to hear from you."
      />

      <SectionContainer className="py-8 sm:py-10 md:py-12">
        <div className="max-w-md mx-auto">
          <ContactForm />
        </div>
      </SectionContainer>
    </>
  );
}
