import { LatestPosts } from '@/components/latest-posts';
import { PageHero } from '@/components/page-hero';
import { ProjectCard } from '@/components/project-card';
import { EngineeringWorkflow } from '@/components/engineering-workflow';
import { SectionHeading } from '@/components/section-heading';
import { SectionContainer } from '@/components/section-container';
import { StatusPill } from '@/components/status-pill';
import { TagPill } from '@/components/tag-pill';
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
    'Portfolio of a Software Engineer focused on product development, system design, and reliable delivery.',
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
        className="pb-12 sm:pb-16 md:pb-20 lg:pb-24 qa-hero-strong"
        aside={<EngineeringWorkflow />}
        descriptionClassName="text-xs sm:text-sm uppercase tracking-[0.3em] text-muted-foreground/80"
      >
        <p className="text-lg sm:text-xl md:text-2xl text-foreground/80 leading-relaxed max-w-[32rem]">
          {portfolioConfig.tagline}
        </p>
        <p className="text-sm sm:text-base text-foreground/70 max-w-[32rem]">
          {portfolioConfig.taglineHighlight}
        </p>

        <div className="flex flex-col sm:flex-row items-center md:items-start justify-center md:justify-start gap-4 mt-10 sm:mt-12">
          <Button asChild size="lg" className="gap-1 btn-text w-full max-w-96 sm:max-w-44">
            <Link href="/projects">View Projects</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="btn-text w-full max-w-96 sm:max-w-44">
            <Link href="/contact">Contact</Link>
          </Button>
        </div>
      </PageHero>

      <section className="w-full py-12 sm:py-16 md:py-20 lg:py-24">
        <SectionContainer>
          <div className="flex flex-col gap-8 md:gap-12">
            <SectionHeading
              title="What I do"
              description="A practical software engineering approach spanning design, implementation, and operations."
              align="left"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card/50 border border-border/40 p-4 sm:p-6 rounded-xl shadow-sm">
                <h3 className="font-medium mb-2">Product Development</h3>
                <p className="text-muted-foreground">
                  Build user-facing features with clear scope, strong defaults, and measurable
                  outcomes.
                </p>
              </div>
              <div className="bg-card/50 border border-border/40 p-4 sm:p-6 rounded-xl shadow-sm">
                <h3 className="font-medium mb-2">System Design</h3>
                <p className="text-muted-foreground">
                  Design maintainable services and interfaces that scale with team and product
                  complexity.
                </p>
              </div>
              <div className="bg-card/50 border border-border/40 p-4 sm:p-6 rounded-xl shadow-sm">
                <h3 className="font-medium mb-2">Delivery Excellence</h3>
                <p className="text-muted-foreground">
                  Improve release reliability with observability, safe rollouts, and fast incident
                  response.
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
              description="A selection of projects across product delivery, developer experience, and reliability."
              align="left"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {featuredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>

            <div className="flex justify-center mt-4">
              <Button asChild size="lg" className="btn-text w-full max-w-96">
                <Link href="/projects">View all projects</Link>
              </Button>
            </div>
          </div>
        </SectionContainer>
      </section>

      <section className="w-full py-12 sm:py-16 md:py-20 lg:py-24">
        <SectionContainer>
          <div className="flex flex-col gap-8 md:gap-12">
            <SectionHeading
              title="Latest writing"
              description="Notes on software engineering, architecture decisions, and pragmatic product delivery."
              align="left"
            />

            <div className="flex flex-wrap gap-2">
              {portfolioConfig.writingTopics.map((topic) => (
                <TagPill key={topic} variant="muted" className="cursor-default">
                  {topic}
                </TagPill>
              ))}
            </div>

            <Suspense fallback={<div className="text-center py-12">Loading latest posts...</div>}>
              <LatestPosts />
            </Suspense>

            <div className="flex justify-center mt-4">
              <Button asChild size="lg" className="gap-1 btn-text w-full max-w-96">
                <Link href="/articles">View all writing</Link>
              </Button>
            </div>
          </div>
        </SectionContainer>
      </section>

      <section className="w-full py-12 sm:py-16 md:py-20 lg:py-24 bg-secondary/20">
        <SectionContainer>
          <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-card/50 p-6 sm:p-8 text-center sm:text-left shadow-[0_20px_60px_-40px_color-mix(in_srgb,var(--primary)_60%,transparent)]">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_60%)]"
              aria-hidden="true"
            />
            <div className="relative">
              <div className="flex justify-center sm:justify-start mb-3">
                <StatusPill label="Open to collaboration" tone="info" />
              </div>
              <h2 className="font-bold tracking-tight">
                Let&apos;s build and ship reliable software.
              </h2>
              <p className="subtitle-description text-muted-foreground mt-2">
                Interested in collaboration or opportunities? I&apos;d love to hear from you.
              </p>
              <div className="mt-6 flex justify-center sm:justify-start">
                <Button asChild size="lg" className="btn-text w-full max-w-96 sm:max-w-56">
                  <Link href="/contact">Contact</Link>
                </Button>
              </div>
            </div>
          </div>
        </SectionContainer>
      </section>
    </div>
  );
}
