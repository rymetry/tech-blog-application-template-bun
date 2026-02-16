import { JsonLd } from '@/components/json-ld';
import { PageHero } from '@/components/page-hero';
import { SectionHeading } from '@/components/section-heading';
import { SectionContainer } from '@/components/section-container';
import { TagPill } from '@/components/tag-pill';
import { Button } from '@/components/ui/button';
import { portfolioConfig } from '@/lib/portfolio-config';
import { createPageMetadata } from '@/lib/metadata-helpers';
import { buildBreadcrumbJsonLd } from '@/lib/structured-data';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = createPageMetadata({
  title: 'About',
  description: `About ${portfolioConfig.ownerName}, a Software Engineer focused on product development and scalable systems.`,
  path: '/about',
});

export default function AboutPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} id="about-breadcrumb-jsonld" />
      <PageHero
        title="About"
        description="How I approach software engineering, from product goals to production operations."
        background="qa"
        align="left"
        className="pt-24 pb-10 md:pt-32 md:pb-12 qa-hero-soft"
      />

      <SectionContainer className="py-8 sm:py-10 md:py-12">
        <div className="grid gap-12 sm:gap-16">
          <section>
            <SectionHeading title="Profile" align="left" className="mb-6" />
            <div className="grid gap-8 lg:grid-cols-[200px_1fr] items-start">
              <div className="relative w-40 h-40 rounded-full overflow-hidden mx-auto lg:mx-0 shadow-md">
                <Image
                  src="/placeholder.svg?height=160&width=160"
                  alt={`${portfolioConfig.ownerName} profile photo`}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="font-medium text-center lg:text-left">{portfolioConfig.ownerName}</h3>
                  <p className="text-muted-foreground text-center lg:text-left">{portfolioConfig.ownerTitle}</p>
                </div>
                <p className="text-muted-foreground leading-relaxed max-w-2xl">
                  I build product capabilities end-to-end, from discovery and architecture to delivery and
                  operations. I focus on clear tradeoffs, maintainable systems, and practical execution that helps
                  teams ship continuously.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button asChild className="btn-text w-full sm:w-auto">
                    <Link href="/projects">View Projects</Link>
                  </Button>
                  <Button asChild variant="outline" className="btn-text w-full sm:w-auto">
                    <Link href="/contact">Contact</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <section>
            <SectionHeading title="How I work" align="left" className="mb-6" />
            <div className="space-y-5">
              <p className="text-muted-foreground leading-relaxed max-w-2xl">
                I start by clarifying product goals, user needs, and delivery constraints. From there, I design and
                implement systems that are easy to evolve, observable in production, and aligned with business impact.
              </p>

              <ol className="grid gap-4">
                <li className="rounded-xl border border-border/40 bg-card/40 p-4 sm:p-5">
                  <div className="font-medium">1) Discovery</div>
                  <p className="text-muted-foreground mt-1">
                    Define outcomes, users, and constraints before making implementation choices.
                  </p>
                </li>
                <li className="rounded-xl border border-border/40 bg-card/40 p-4 sm:p-5">
                  <div className="font-medium">2) Architecture & design</div>
                  <p className="text-muted-foreground mt-1">
                    Establish boundaries, data flow, and interfaces that keep systems adaptable.
                  </p>
                </li>
                <li className="rounded-xl border border-border/40 bg-card/40 p-4 sm:p-5">
                  <div className="font-medium">3) Implementation</div>
                  <p className="text-muted-foreground mt-1">
                    Deliver incrementally with readable code, tests, and consistent engineering standards.
                  </p>
                </li>
                <li className="rounded-xl border border-border/40 bg-card/40 p-4 sm:p-5">
                  <div className="font-medium">4) Observability & operations</div>
                  <p className="text-muted-foreground mt-1">
                    Instrument services and workflows so teams can detect and resolve issues quickly.
                  </p>
                </li>
                <li className="rounded-xl border border-border/40 bg-card/40 p-4 sm:p-5">
                  <div className="font-medium">5) Iteration</div>
                  <p className="text-muted-foreground mt-1">
                    Use production feedback to prioritize improvements and guide the next milestones.
                  </p>
                </li>
              </ol>
            </div>
          </section>

          <section>
            <SectionHeading title="Toolbox" align="left" className="mb-6" />
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-xl border border-border/40 bg-card/40 p-4 sm:p-6">
                <h3 className="font-medium mb-3">Product Engineering</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-[22rem] mb-3">
                  Feature delivery grounded in product context, technical constraints, and long-term maintainability.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['TypeScript', 'Feature design', 'Code reviews', 'API integration'].map((item) => (
                    <TagPill key={item} variant="muted" className="cursor-default">
                      {item}
                    </TagPill>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-border/40 bg-card/40 p-4 sm:p-6">
                <h3 className="font-medium mb-3">Delivery Systems</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-[22rem] mb-3">
                  Reliable release workflows, predictable deployments, and actionable operational signals.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['GitHub Actions', 'CI pipelines', 'Progressive rollout', 'Runbooks'].map((item) => (
                    <TagPill key={item} variant="muted" className="cursor-default">
                      {item}
                    </TagPill>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-border/40 bg-card/40 p-4 sm:p-6">
                <h3 className="font-medium mb-3">Architecture & Reliability</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-[22rem] mb-3">
                  Scalable service design with observability, performance, and incident readiness built in.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['System design', 'Observability', 'Performance', 'Incident response'].map((item) => (
                    <TagPill key={item} variant="muted" className="cursor-default">
                      {item}
                    </TagPill>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </SectionContainer>
    </>
  );
}
