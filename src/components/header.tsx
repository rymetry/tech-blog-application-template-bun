import { portfolioConfig } from '@/lib/portfolio-config';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'Projects', href: '/projects' },
  { name: 'Writing', href: '/articles' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

const HeaderControls = dynamic(
  () => import('./header-controls.client').then((mod) => mod.HeaderControls),
  {
    loading: () => (
      <div className="flex items-center gap-2">
        <div
          className="h-11 w-11 rounded-md border border-border/40 bg-card/40 md:h-8 md:w-8"
          aria-hidden="true"
        />
        <div className="h-11 w-11 rounded-md border border-border/40 bg-card/40 md:hidden" aria-hidden="true" />
      </div>
    ),
  },
);

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/20 bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="logo-text" aria-label={`${portfolioConfig.ownerName} Home`}>
            {portfolioConfig.ownerName}
          </Link>

          <nav aria-label="Main Navigation" className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                data-header-nav-link
                data-nav-href={item.href}
                data-active="false"
                className='nav-link relative rounded-md px-2 py-1 text-muted-foreground transition-colors hover:bg-primary/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 data-[active=true]:font-medium data-[active=true]:text-primary data-[active=true]:after:absolute data-[active=true]:after:-bottom-1 data-[active=true]:after:left-2 data-[active=true]:after:right-2 data-[active=true]:after:h-[2px] data-[active=true]:after:rounded-full data-[active=true]:after:bg-primary/70 data-[active=true]:after:content-[""]'
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <HeaderControls navItems={navItems} />
      </div>
    </header>
  );
}
