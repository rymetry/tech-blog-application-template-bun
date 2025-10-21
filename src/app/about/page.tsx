import { PageHero } from '@/components/page-hero';
import { SectionContainer } from '@/components/section-container';
import { JsonLd } from '@/components/json-ld';
import { createPageMetadata } from '@/lib/metadata-helpers';
import { buildBreadcrumbJsonLd } from '@/lib/structured-data';
import Image from 'next/image';

export const metadata = createPageMetadata({
  title: 'About',
  description: 'Learn more about our tech blog and the team behind it.',
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
      <PageHero title="About" description="Learn more about our tech blog and the team behind it" />

      <SectionContainer className="py-8 sm:py-10 md:py-12">
        <div className="grid gap-12 sm:gap-16">
          <section>
            <h2 className="text-center font-bold tracking-tight mb-6">
              About the Author
            </h2>
            <div className="grid gap-8 lg:grid-cols-[200px_1fr] items-start">
              <div className="relative w-40 h-40 rounded-full overflow-hidden mx-auto lg:mx-0 shadow-md">
                <Image
                  src="/placeholder.svg?height=160&width=160"
                  alt="Author"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-4">
                <h3 className="font-medium text-center lg:text-left">John Doe</h3>
                <p className="text-muted-foreground leading-relaxed">
                  John is a senior software engineer with over 10 years of experience in web
                  development, cloud architecture, and DevOps. He has worked with various
                  technologies including React, Node.js, AWS, and Docker.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  With a passion for teaching and sharing knowledge, John started this tech blog to
                  help other developers navigate the complex world of modern software development.
                  He believes in practical, hands-on learning and strives to make complex topics
                  accessible to developers at all levels.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  When not coding or writing, John enjoys hiking, photography, and experimenting
                  with new cooking recipes.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-center font-bold tracking-tight mb-6">
              Website Concept
            </h2>
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                This website is built with modern web technologies to provide an optimal reading
                experience. We&apos;ve designed it with a focus on readability, accessibility, and
                performance.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The tech stack includes Next.js for server-side rendering and static site
                generation, Tailwind CSS for styling, and a headless CMS for content management.
                This combination allows us to deliver fast loading times while maintaining
                flexibility in content creation and design.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We&apos;ve implemented features like dark mode support, responsive design for all
                device sizes, and optimized images to ensure a great user experience regardless of
                how you access our content.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 md:mt-10">
                <div className="bg-card/60 border border-primary/20 p-4 sm:p-6 rounded-lg shadow-sm">
                  <h3 className="font-medium mb-2">
                    Performance First
                  </h3>
                  <p className="text-muted-foreground">
                    Optimized for fast loading times and smooth interactions, even on slower
                    connections.
                  </p>
                </div>
                <div className="bg-card/60 border border-primary/20 p-4 sm:p-6 rounded-lg shadow-sm">
                  <h3 className="font-medium mb-2">
                    Accessibility
                  </h3>
                  <p className="text-muted-foreground">
                    Designed with accessibility in mind, ensuring content is available to all
                    readers.
                  </p>
                </div>
                <div className="bg-card/60 border border-primary/20 p-4 sm:p-6 rounded-lg shadow-sm">
                  <h3 className="font-medium mb-2">
                    Modern Design
                  </h3>
                  <p className="text-muted-foreground">
                    Clean, minimalist aesthetic that puts the focus on content while being visually
                    appealing.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </SectionContainer>
    </>
  );
}
