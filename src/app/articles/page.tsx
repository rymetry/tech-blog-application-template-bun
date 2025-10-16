import { ArticlePostsList } from '@/components/article-posts-list';
import { PageHero } from '@/components/page-hero';
import { SearchForm } from '@/components/search-form';
import { SectionContainer } from '@/components/section-container';
import { TagsList } from '@/components/tags-list';
import { Suspense } from 'react';

interface ArticlePageProps {
  searchParams: Promise<{
    page?: string;
    tag?: string;
    q?: string;
  }>;
}

// SearchFormをラップするクライアントコンポーネント
function SearchFormWrapper() {
  return (
    <Suspense fallback={<div>Loading search...</div>}>
      <SearchForm />
    </Suspense>
  );
}

// 取得系は外部コンポーネントに分離

export default async function ArticlePage(props: ArticlePageProps) {
  const searchParams = await props.searchParams;
  return (
    <>
      <PageHero
        title="Article"
        description="Explore our collection of articles, tutorials, and insights"
      />

      <SectionContainer className="py-8 sm:py-10 md:py-12">
        <div className="grid gap-8 sm:gap-10 md:grid-cols-[240px_1fr]">
          <div className="space-y-8">
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-medium mb-4">Search</h2>
              <SearchFormWrapper />
            </div>

            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-medium mb-4">Tags</h2>
              <Suspense fallback={<div>Loading tags...</div>}>
                <TagsList />
              </Suspense>
            </div>
          </div>

          <div className="space-y-8 sm:space-y-10">
            <Suspense fallback={<div className="py-10 text-center">Loading posts...</div>}>
              <ArticlePostsList searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </SectionContainer>
    </>
  );
}
