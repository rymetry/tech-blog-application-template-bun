import { JsonLd } from '@/components/json-ld';
import { PageHero } from '@/components/page-hero';
import { ProjectsGrid } from '@/components/projects-grid';
import { SectionHeading } from '@/components/section-heading';
import { SectionContainer } from '@/components/section-container';
import { projects } from '@/lib/projects';
import { createPageMetadata } from '@/lib/metadata-helpers';
import { buildBreadcrumbJsonLd } from '@/lib/structured-data';

export const metadata = createPageMetadata({
  title: 'Projects',
  description:
    'Selected software engineering projects across product development, developer experience, and reliability.',
  path: '/projects',
});

export default async function ProjectsPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Projects', path: '/projects' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} id="projects-breadcrumb-jsonld" />
      <PageHero
        title="Projects"
        description="Selected software engineering projects across product development, developer experience, and reliability."
        background="qa"
        align="left"
        className="pt-24 pb-10 md:pt-32 md:pb-12 qa-hero-soft"
      />

      <SectionContainer className="py-8 sm:py-10 md:py-12">
        <SectionHeading
          title="Focus Areas"
          description="Initiatives that improved delivery speed, product quality, and team effectiveness."
          align="left"
          className="mb-6"
        />
        <ProjectsGrid projects={projects} />
      </SectionContainer>
    </>
  );
}
