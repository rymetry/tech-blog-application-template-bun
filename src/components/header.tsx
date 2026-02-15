'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { portfolioConfig } from '@/lib/portfolio-config';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ModeToggle } from './mode-toggle';

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'Projects', href: '/projects' },
  { name: 'Writing', href: '/articles' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const isActivePath = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));
  const activeLinkClass =
    'text-primary font-medium relative after:content-[""] after:absolute after:left-2 after:right-2 after:-bottom-1 after:h-[2px] after:bg-primary/70 after:rounded-full';
  const inactiveLinkClass = 'text-muted-foreground';

  useEffect(() => {
    const updateHeaderHeight = () => {
      const headerHeight = headerRef.current?.offsetHeight ?? 64;
      const scrollOffset = headerHeight + 32;
      const activeOffset = headerHeight + 96;

      document.documentElement.style.setProperty('--site-header-height', `${headerHeight}px`);
      document.documentElement.style.setProperty('--article-toc-sticky-top', `${scrollOffset}px`);
      document.documentElement.style.setProperty('--article-toc-scroll-offset', `${scrollOffset}px`);
      document.documentElement.style.setProperty('--article-toc-active-offset', `${activeOffset}px`);
      window.dispatchEvent(new Event('site-layout-vars-change'));
    };

    updateHeaderHeight();

    const headerEl = headerRef.current;
    let resizeObserver: ResizeObserver | null = null;

    if (headerEl && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(updateHeaderHeight);
      resizeObserver.observe(headerEl);
    }

    window.addEventListener('resize', updateHeaderHeight, { passive: true });

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateHeaderHeight);
    };
  }, []);

  return (
    <header
      ref={headerRef}
      className="border-b border-border/20 bg-background/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-50"
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="logo-text" aria-label={`${portfolioConfig.ownerName} Home`}>
            {portfolioConfig.ownerName}
          </Link>
        </div>

        <nav aria-label="Main Navigation" className="hidden md:flex gap-6 items-center">
          {navItems.map((item) => {
            const isActive = isActivePath(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'nav-link transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md px-2 py-1',
                  'hover:bg-primary/5',
                  isActive ? activeLinkClass : inactiveLinkClass,
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.name}
              </Link>
            );
          })}
          <ModeToggle />
        </nav>

        <div className="flex items-center md:hidden">
          <ModeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="ml-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 p-0 text-base"
                aria-label="Open menu"
                aria-expanded={open}
                aria-controls="mobile-menu"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="4" x2="20" y1="18" y2="18" />
                </svg>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" id="mobile-menu" title="Mobile Navigation">
              <nav className="flex flex-col gap-4 mt-8" aria-label="Mobile Navigation">
                {navItems.map((item) => {
                  const isActive = isActivePath(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'text-base sm:text-lg transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md px-2 py-1',
                        'hover:bg-primary/5',
                        isActive ? 'text-primary font-medium bg-primary/10' : 'text-muted-foreground',
                      )}
                      onClick={() => setOpen(false)}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
