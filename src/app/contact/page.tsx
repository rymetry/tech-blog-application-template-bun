import { PageHero } from '@/components/page-hero';
import { SectionHeading } from '@/components/section-heading';
import { SectionContainer } from '@/components/section-container';
import { ContactForm } from '@/components/contact-form';
import { JsonLd } from '@/components/json-ld';
import { createPageMetadata } from '@/lib/metadata-helpers';
import { buildBreadcrumbJsonLd } from '@/lib/structured-data';

export const metadata = createPageMetadata({
  title: 'Contact',
  description: "Interested in collaboration or opportunities? I'd love to hear from you.",
  path: '/contact',
});

export default function ContactPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Contact', path: '/contact' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} id="contact-breadcrumb-jsonld" />

      <PageHero
        title="Contact"
        description="Interested in collaboration or opportunities? I'd love to hear from you."
        background="qa"
        align="left"
        className="pt-24 pb-10 md:pt-32 md:pb-12 qa-hero-soft"
      />

      <SectionContainer className="py-8 sm:py-10 md:py-12">
        <div className="grid gap-8 md:grid-cols-[1fr_360px] items-start">
          <div className="space-y-6">
            <SectionHeading
              title="What to expect"
              description="A quick overview of how I collaborate with teams."
              align="left"
            />

            <div className="grid gap-4">
              <div className="rounded-xl border border-border/40 bg-card/40 p-4">
                <h3 className="font-medium mb-1">Response time</h3>
                <p className="text-sm text-muted-foreground">
                  I typically reply within 2 business days.
                </p>
              </div>
              <div className="rounded-xl border border-border/40 bg-card/40 p-4">
                <h3 className="font-medium mb-1">Focus areas</h3>
                <p className="text-sm text-muted-foreground">
                  Product development, system design, delivery workflows, and engineering enablement.
                </p>
              </div>
              <div className="rounded-xl border border-border/40 bg-card/40 p-4">
                <h3 className="font-medium mb-1">Helpful details</h3>
                <p className="text-sm text-muted-foreground">
                  Share scope, timeline, and success criteria to speed up alignment.
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-md md:max-w-none">
            <ContactForm />
          </div>
        </div>
      </SectionContainer>
    </>
  );
}
