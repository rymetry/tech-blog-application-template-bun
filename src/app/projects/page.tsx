import { JsonLd } from '@/components/json-ld';
import { PageHero } from '@/components/page-hero';
import { ProjectsGrid } from '@/components/projects-grid';
import { SectionContainer } from '@/components/section-container';
import { projects } from '@/lib/projects';
import { createPageMetadata } from '@/lib/metadata-helpers';
import { buildBreadcrumbJsonLd } from '@/lib/structured-data';

export const metadata = createPageMetadata({
  title: 'Projects',
  description: 'Selected work across test strategy, automation, and quality engineering.',
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
        description="Selected work across test strategy, automation, and quality engineering."
      />

      <SectionContainer className="py-8 sm:py-10 md:py-12">
        <ProjectsGrid projects={projects} />
      </SectionContainer>
    </>
  );
}

