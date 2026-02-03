import { LatestPosts } from '@/components/latest-posts';
import { PageHero } from '@/components/page-hero';
import { ProjectCard } from '@/components/project-card';
import { QualityPipeline } from '@/components/quality-pipeline';
import { SectionHeading } from '@/components/section-heading';
import { SectionContainer } from '@/components/section-container';
import { Button } from '@/components/ui/button';
import { JsonLd } from '@/components/json-ld';
import { portfolioConfig } from '@/lib/portfolio-config';
import { projects } from '@/lib/projects';
import { createPageMetadata } from '@/lib/metadata-helpers';
import { buildBlogListJsonLd } from '@/lib/structured-data';
import Link from 'next/link';
import { Suspense } from 'react';

export const revalidate = 300;

export const metadata = createPageMetadata({
  title: 'Home',
  description:
    'Portfolio of a Versatilist (QA & SDET) focused on test strategy, automation, and quality engineering.',
  path: '/',
});

export default function Home() {
  const blogJsonLd = buildBlogListJsonLd();
  const isDefined = <T,>(value: T | null | undefined): value is T => value !== null && value !== undefined;
  const featuredProjects = portfolioConfig.featuredProjectIds
    .map((id) => projects.find((project) => project.id === id))
    .filter(isDefined);

  return (
    <div className="flex flex-col min-h-screen">
      <JsonLd data={blogJsonLd} id="homepage-jsonld" />
      <PageHero
        title={portfolioConfig.ownerName}
        description={portfolioConfig.ownerTitle}
        variant="split"
        background="qa"
        className="pb-12 sm:pb-16 md:pb-20 lg:pb-24"
        aside={<QualityPipeline />}
      >
        <p className="text-base sm:text-[17px] md:text-lg lg:text-xl text-muted-foreground">
          {portfolioConfig.tagline}
        </p>

        <div className="flex flex-col sm:flex-row items-center md:items-start justify-center md:justify-start gap-4 mt-10 sm:mt-12">
          <Link href="/projects" className="block w-full max-w-96 sm:max-w-44">
            <Button size="lg" className="gap-1 btn-text w-full">
              View Projects
            </Button>
          </Link>
          <Link href="/contact" className="block w-full max-w-96 sm:max-w-44">
            <Button size="lg" variant="outline" className="btn-text w-full">
              Contact
            </Button>
          </Link>
        </div>
      </PageHero>

      <section className="w-full py-12 sm:py-16 md:py-20 lg:py-24">
        <SectionContainer>
          <div className="flex flex-col gap-8 md:gap-12">
            <SectionHeading
              title="What I do"
              description="A practical approach to quality engineering, from strategy to automation."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card/50 border border-border/40 p-4 sm:p-6 rounded-xl shadow-sm">
                <h3 className="font-medium mb-2">Test Strategy</h3>
                <p className="text-muted-foreground">
                  Risk-based coverage planning, clear test boundaries, and measurable feedback
                  loops.
                </p>
              </div>
              <div className="bg-card/50 border border-border/40 p-4 sm:p-6 rounded-xl shadow-sm">
                <h3 className="font-medium mb-2">Automation</h3>
                <p className="text-muted-foreground">
                  Reliable E2E/API automation with maintainable architecture and fast triage.
                </p>
              </div>
              <div className="bg-card/50 border border-border/40 p-4 sm:p-6 rounded-xl shadow-sm">
                <h3 className="font-medium mb-2">Quality Gates</h3>
                <p className="text-muted-foreground">
                  CI signals, observability, and release criteria that help teams ship with
                  confidence.
                </p>
              </div>
            </div>
          </div>
        </SectionContainer>
      </section>

      <section className="w-full py-12 sm:py-16 md:py-20 lg:py-24 bg-secondary/20">
        <SectionContainer>
          <div className="flex flex-col gap-8 md:gap-12">
            <SectionHeading
              title="Featured projects"
              description="A few highlights that showcase strategy, automation, and quality signals."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {featuredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>

            <div className="flex justify-center mt-4">
              <Link href="/projects" className="block w-full max-w-96">
                <Button size="lg" variant="outline" className="btn-text w-full">
                  View all projects
                </Button>
              </Link>
            </div>
          </div>
        </SectionContainer>
      </section>

      <section className="w-full py-12 sm:py-16 md:py-20 lg:py-24">
        <SectionContainer>
          <div className="flex flex-col gap-8 md:gap-12">
            <SectionHeading
              title="Latest writing"
              description="Notes on engineering, automation, and building quality into products."
            />

            <Suspense fallback={<div className="text-center py-12">Loading latest posts...</div>}>
              <LatestPosts />
            </Suspense>

            <div className="flex justify-center mt-4">
              <Link href="/articles" className="block w-full max-w-96">
                <Button size="lg" className="gap-1 btn-text w-full">
                  View all writing
                </Button>
              </Link>
            </div>
          </div>
        </SectionContainer>
      </section>

      <section className="w-full py-12 sm:py-16 md:py-20 lg:py-24 bg-secondary/20">
        <SectionContainer>
          <div className="rounded-2xl border border-border/40 bg-card/40 p-6 sm:p-8 text-center">
            <h2 className="font-bold tracking-tight">
              Let&apos;s ship with confidence.
            </h2>
            <p className="subtitle-description text-muted-foreground mt-2">
              Interested in collaboration or opportunities? I&apos;d love to hear from you.
            </p>
            <div className="mt-6 flex justify-center">
              <Link href="/contact" className="block w-full max-w-96 sm:max-w-56">
                <Button size="lg" className="btn-text w-full">
                  Contact
                </Button>
              </Link>
            </div>
          </div>
        </SectionContainer>
      </section>
    </div>
  );
}
