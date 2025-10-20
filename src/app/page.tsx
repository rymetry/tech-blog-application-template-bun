import { LatestPosts } from '@/components/latest-posts';
import { PageHero } from '@/components/page-hero';
import { SectionContainer } from '@/components/section-container';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Suspense } from 'react';

export const revalidate = 300;

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Heroセクション */}
      <PageHero
        title="Tech Blog for Modern Developers"
        description="Discover the latest trends, deep dives, and practical knowledge in software engineering and technology."
        className="pb-12 sm:pb-16 md:pb-20 lg:pb-24"
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 sm:mt-16">
          <Link href="/articles" className="block w-full max-w-96 sm:max-w-44">
            <Button size="lg" className="gap-1 btn-text w-full">
              Explore Articles
            </Button>
          </Link>
          <Link href="/about" className="block w-full max-w-96 sm:max-w-44">
            <Button size="lg" variant="outline" className="btn-text w-full">
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
              <h2 className="font-bold tracking-tight">
                Latest Articles
              </h2>
              <p className="subtitle-description text-muted-foreground mt-2">
                Stay updated with our most recent publications
              </p>
            </div>

            <Suspense fallback={<div className="text-center py-12">Loading latest posts...</div>}>
              <LatestPosts />
            </Suspense>

            <div className="flex justify-center mt-8">
              <Link href="/articles" className="block w-full max-w-96">
                <Button size="lg" className="gap-1 btn-text w-full">
                  View All Articles
                </Button>
              </Link>
            </div>
          </div>
        </SectionContainer>
      </section>

      {/* 特徴セクション */}
      <section className="w-full py-12 sm:py-16 md:py-20 lg:py-24 bg-secondary/30">
        <SectionContainer>
          <div className="flex flex-col gap-8 md:gap-12">
            <div className="text-center">
              <h2 className="font-bold tracking-tight">
                Core Features
              </h2>
              <p className="subtitle-description text-muted-foreground mt-2">
                What makes our tech blog special
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card/60 border border-primary/20 p-4 sm:p-6 rounded-lg shadow-sm">
                <h3 className="font-medium mb-2">In-depth Articles</h3>
                <p className="text-muted-foreground">
                  Comprehensive coverage of technical topics with practical examples and code
                  snippets.
                </p>
              </div>
              <div className="bg-card/60 border border-primary/20 p-4 sm:p-6 rounded-lg shadow-sm">
                <h3 className="font-medium mb-2">Expert Insights</h3>
                <p className="text-muted-foreground">
                  Articles written by industry professionals with years of experience in their
                  fields.
                </p>
              </div>
              <div className="bg-card/60 border border-primary/20 p-4 sm:p-6 rounded-lg shadow-sm">
                <h3 className="font-medium mb-2">Latest Trends</h3>
                <p className="text-muted-foreground">
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
