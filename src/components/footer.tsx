import Link from 'next/link';
import { Github, Linkedin, Mail } from 'lucide-react';
import { portfolioConfig } from '@/lib/portfolio-config';

export default function Footer() {
  return (
    <footer className="border-t border-border/20 bg-background">
      <div className="container py-8 md:py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <Link href="/" className="logo-text" aria-label={`${portfolioConfig.ownerName} Home`}>
              {portfolioConfig.ownerName}
            </Link>
            <p className="text-sm sm:text-sm md:text-base text-muted-foreground pt-2 md:pt-3">
              {portfolioConfig.ownerTitle}
            </p>
          </div>
          <div className="flex-col">
            <div className="flex gap-1" aria-label="Social media links">
              {portfolioConfig.links.github ? (
                <Link
                  href={portfolioConfig.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md p-2 sm:p-3 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="GitHub"
                >
                  <Github className="h-5 w-5" aria-hidden="true" />
                </Link>
              ) : null}
              {portfolioConfig.links.linkedin ? (
                <Link
                  href={portfolioConfig.links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md p-2 sm:p-3 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" aria-hidden="true" />
                </Link>
              ) : null}
              {portfolioConfig.links.email ? (
                <Link
                  href={portfolioConfig.links.email}
                  className="text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md p-2 sm:p-3 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Email"
                >
                  <Mail className="h-5 w-5" aria-hidden="true" />
                </Link>
              ) : null}
            </div>
            <div className="w-full text-center md:text-right md:pr-3">
              <Link
                href="https://lucide.dev"
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md"
              >
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Icons by Lucide
                </p>
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center text-xs sm:text-sm text-muted-foreground">
          © {new Date().getFullYear()} {portfolioConfig.ownerName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
