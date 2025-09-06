import { LatestPosts } from '@/components/latest-posts';
import { PageHero } from '@/components/page-hero';
import { SectionContainer } from '@/components/section-container';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero section */}
      <PageHero
        title="Tech Blog for Modern Developers"
        description="Discover the latest trends, deep dives, and practical knowledge in software engineering and technology."
        titleClassName="text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
        descriptionClassName="lg:text-2xl max-w-2xl mx-auto"
        className="pb-20 md:pb-32"
      >
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6 sm:mt-8">
          <Link href="/blog">
            <Button size="lg" className="gap-1 btn-text">
              Explore Articles
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/about">
            <Button size="lg" variant="outline" className="btn-text">
              About Me
            </Button>
          </Link>
        </div>
      </PageHero>

      {/* 最新記事セクション */}
      <section className="w-full py-12 sm:py-16 md:py-20 lg:py-24">
        <SectionContainer>
          <div className="flex flex-col gap-8 md:gap-12">
            <div className="text-center">
              <h2 className="text-2xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tighter">
                Latest Articles
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground mt-2">
                Stay updated with our most recent publications
              </p>
            </div>

            <Suspense fallback={<div className="text-center py-12">Loading latest posts...</div>}>
              <LatestPosts />
            </Suspense>

            <div className="flex justify-center">
              <Link href="/blog">
                <Button variant="outline" className="gap-1 btn-text">
                  View All Articles
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </SectionContainer>
      </section>

      {/* 特徴セクション */}
      <section className="w-full py-12 sm:py-16 md:py-20 lg:py-24 bg-secondary/20">
        <SectionContainer>
          <div className="flex flex-col gap-8 md:gap-12">
            <div className="text-center">
              <h2 className="text-2xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tighter">
                Core Features
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground mt-2">
                What makes our tech blog special
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold">In-depth Articles</h3>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
                  Comprehensive coverage of technical topics with practical examples and code
                  snippets.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold">Expert Insights</h3>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
                  Articles written by industry professionals with years of experience in their
                  fields.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold">Latest Trends</h3>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
                  Stay up-to-date with the newest technologies, frameworks, and best practices.
                </p>
              </div>
            </div>
          </div>
        </SectionContainer>
      </section>
    </div>
  );
}
