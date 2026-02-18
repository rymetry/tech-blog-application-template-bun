import localFont from 'next/font/local';

const articleMonoFont = localFont({
  src: [
    {
      path: '../../fonts/PlemolJPHS-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../fonts/PlemolJPHS-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
  ],
  variable: '--font-mono',
  display: 'swap',
  preload: false,
});

export default function ArticleSlugLayout({ children }: { children: React.ReactNode }) {
  return <div className={articleMonoFont.variable}>{children}</div>;
}
