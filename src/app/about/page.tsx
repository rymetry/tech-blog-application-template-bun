import { JsonLd } from '@/components/json-ld';
import { PageHero } from '@/components/page-hero';
import { SectionContainer } from '@/components/section-container';
import { Button } from '@/components/ui/button';
import { portfolioConfig } from '@/lib/portfolio-config';
import { createPageMetadata } from '@/lib/metadata-helpers';
import { buildBreadcrumbJsonLd } from '@/lib/structured-data';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = createPageMetadata({
  title: 'About',
  description: `About ${portfolioConfig.ownerName}, a Versatilist (QA & SDET) focused on quality engineering.`,
  path: '/about',
});

export default async function AboutPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} id="about-breadcrumb-jsonld" />
      <PageHero title="About" description="How I approach quality engineering—from strategy to automation." />

      <SectionContainer className="py-8 sm:py-10 md:py-12">
        <div className="grid gap-12 sm:gap-16">
          <section>
            <h2 className="text-center font-bold tracking-tight mb-6">
              Profile
            </h2>
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
                <p className="text-muted-foreground leading-relaxed">
                  I help teams ship with confidence by connecting quality strategy, automation, and engineering
                  signals. I care about fast feedback, reliable tests, and clear release criteria that developers
                  can trust.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link href="/projects" className="block w-full sm:w-auto">
                    <Button variant="outline" className="btn-text w-full sm:w-auto">
                      View Projects
                    </Button>
                  </Link>
                  <Link href="/contact" className="block w-full sm:w-auto">
                    <Button className="btn-text w-full sm:w-auto">Contact</Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-center font-bold tracking-tight mb-6">
              How I work
            </h2>
            <div className="space-y-5">
              <p className="text-muted-foreground leading-relaxed">
                I start by aligning on product risk and user impact. Then I design layered coverage and automation
                so the team gets actionable signals quickly.
              </p>

              <ol className="grid gap-4">
                <li className="rounded-xl border border-border/40 bg-card/40 p-4 sm:p-5">
                  <div className="font-medium">1) Discovery</div>
                  <p className="text-muted-foreground mt-1">
                    Understand user journeys, failure modes, and what “done” means.
                  </p>
                </li>
                <li className="rounded-xl border border-border/40 bg-card/40 p-4 sm:p-5">
                  <div className="font-medium">2) Risk & coverage</div>
                  <p className="text-muted-foreground mt-1">
                    Prioritize high-impact risks and design clear, layered coverage.
                  </p>
                </li>
                <li className="rounded-xl border border-border/40 bg-card/40 p-4 sm:p-5">
                  <div className="font-medium">3) Automation</div>
                  <p className="text-muted-foreground mt-1">
                    Build maintainable test architecture and eliminate flakiness at the root.
                  </p>
                </li>
                <li className="rounded-xl border border-border/40 bg-card/40 p-4 sm:p-5">
                  <div className="font-medium">4) Signals & triage</div>
                  <p className="text-muted-foreground mt-1">
                    Create fast feedback in CI, logs, and traces so issues are diagnosable.
                  </p>
                </li>
                <li className="rounded-xl border border-border/40 bg-card/40 p-4 sm:p-5">
                  <div className="font-medium">5) Release confidence</div>
                  <p className="text-muted-foreground mt-1">
                    Define quality gates that teams can trust and improve continuously.
                  </p>
                </li>
              </ol>
            </div>
          </section>

          <section>
            <h2 className="text-center font-bold tracking-tight mb-6">
              Toolbox
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-xl border border-border/40 bg-card/40 p-4 sm:p-6">
                <h3 className="font-medium mb-3">Testing</h3>
                <div className="flex flex-wrap gap-2">
                  {['Playwright', 'API testing', 'Test design', 'Flake triage'].map((item) => (
                    <span key={item} className="tag-text bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-border/40 bg-card/40 p-4 sm:p-6">
                <h3 className="font-medium mb-3">CI / Delivery</h3>
                <div className="flex flex-wrap gap-2">
                  {['GitHub Actions', 'Quality gates', 'Release checks', 'Artifacts'].map((item) => (
                    <span key={item} className="tag-text bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-border/40 bg-card/40 p-4 sm:p-6">
                <h3 className="font-medium mb-3">Engineering</h3>
                <div className="flex flex-wrap gap-2">
                  {['TypeScript', 'Next.js', 'Observability', 'Performance'].map((item) => (
                    <span key={item} className="tag-text bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {item}
                    </span>
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
