'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ModeToggle } from './mode-toggle';

interface HeaderNavItem {
  name: string;
  href: string;
}

interface HeaderControlsProps {
  navItems: HeaderNavItem[];
}

function isActivePath(pathname: string, href: string) {
  const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  const normalizedHref = href === '/' ? '/' : href.replace(/\/+$/, '');
  return normalizedHref === '/' ? normalizedPath === '/' : normalizedPath.startsWith(normalizedHref);
}

export function HeaderControls({ navItems }: HeaderControlsProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const navLinks = document.querySelectorAll<HTMLAnchorElement>('[data-header-nav-link]');

    navLinks.forEach((link) => {
      const href = link.dataset.navHref || link.getAttribute('href') || '/';
      const isActive = isActivePath(pathname, href);

      link.dataset.active = isActive ? 'true' : 'false';
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }, [pathname]);

  return (
    <div className="flex items-center">
      <div className="hidden items-center md:flex">
        <ModeToggle />
      </div>

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
            <SheetDescription className="sr-only">
              Navigate to Home, Projects, Writing, About, and Contact pages.
            </SheetDescription>
            <nav className="mt-8 flex flex-col gap-4" aria-label="Mobile Navigation">
              {navItems.map((item) => {
                const isActive = isActivePath(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'rounded-md px-2 py-1 text-base transition-colors hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:text-lg',
                      isActive ? 'bg-primary/10 font-medium text-primary' : 'text-muted-foreground',
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
  );
}
