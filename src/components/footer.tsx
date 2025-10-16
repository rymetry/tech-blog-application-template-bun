import Link from 'next/link';
import { BsFacebook, BsGithub, BsInstagram, BsMailbox, BsTwitterX } from 'react-icons/bs';

export default function Footer() {
  return (
    <footer className="border-t border-border/20 bg-background">
      <div className="container py-8 md:py-12 max-w-[1280px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <Link href="/" className="logo-text" aria-label="Tech Blog Home">
              Tech Blog
            </Link>
            <p className="text-sm sm:text-sm md:text-base text-muted-foreground pt-2 md:pt-3">
              Sharing knowledge and insights in the tech world
            </p>
          </div>
          <div className="flex-col">
            <div className="flex gap-1" aria-label="Social media links">
              <Link
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md p-2 sm:p-3 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Facebook"
              >
                <BsFacebook className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md p-2 sm:p-3 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Instagram"
              >
                <BsInstagram className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md p-2 sm:p-3 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Twitter"
              >
                <BsTwitterX className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md p-2 sm:p-3 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="GitHub"
              >
                <BsGithub className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link
                href="/contact"
                className="text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md p-2 sm:p-3 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Contact us"
              >
                <BsMailbox className="h-5 w-5" aria-hidden="true" />
              </Link>
            </div>
            <div className="w-full text-center md:text-right md:pr-3">
              <Link
                href="https://icons.getbootstrap.com/"
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md"
              >
                <p className="text-xs sm:text-sm text-muted-foreground">
                  icons by Bootstrap icons
                </p>
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center text-xs sm:text-sm text-muted-foreground">
          © {new Date().getFullYear()} Tech Blog. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
