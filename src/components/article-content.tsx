interface ArticleContentProps {
  html: string;
}

export function ArticleContent({ html }: ArticleContentProps) {
  return (
    <div
      className="prose prose-gray dark:prose-invert"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
