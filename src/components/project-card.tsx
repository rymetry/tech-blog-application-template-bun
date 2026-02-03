import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TagPill } from '@/components/tag-pill';
import type { Project } from '@/types';
import { CheckCircle2, ExternalLink, FileText, Github } from 'lucide-react';
import Link from 'next/link';

const isRealLink = (value: string | undefined) => Boolean(value && value !== '#');

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { github, demo, writeup } = project.links ?? {};

  return (
    <Card className="h-full border-border/40 bg-card/50 shadow-sm overflow-hidden transition-all duration-300 hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-lg">
      <CardHeader className="space-y-3">
        <CardTitle className="text-lg sm:text-xl font-semibold tracking-tight">
          {project.name}
        </CardTitle>
        <p className="text-sm sm:text-base text-muted-foreground">
          {project.summary}
        </p>
        <div className="flex flex-wrap gap-2" aria-label="Project tags">
          {project.tags.map((tag) => (
            <TagPill key={tag} variant="primary">
              {tag}
            </TagPill>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Role</div>
          <p className="text-sm sm:text-base text-foreground/90">{project.role}</p>
        </div>

        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Impact</div>
          <ul className="space-y-2 text-sm sm:text-base">
            {project.impact.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-[color:var(--success)]" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Stack</div>
          <div className="flex flex-wrap gap-2">
            {project.stack.map((item) => (
              <TagPill key={item} variant="muted">
                {item}
              </TagPill>
            ))}
          </div>
        </div>
      </CardContent>

      {(isRealLink(github) || isRealLink(demo) || isRealLink(writeup)) ? (
        <CardFooter className="flex flex-wrap gap-3">
          {isRealLink(github) ? (
            <Link
              href={github!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground border border-border/40 bg-card/40 px-3 py-1 rounded-full hover:text-primary hover:border-primary/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <Github className="h-4 w-4" aria-hidden="true" />
              GitHub
            </Link>
          ) : null}
          {isRealLink(demo) ? (
            <Link
              href={demo!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground border border-border/40 bg-card/40 px-3 py-1 rounded-full hover:text-primary hover:border-primary/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Demo
            </Link>
          ) : null}
          {isRealLink(writeup) ? (
            <Link
              href={writeup!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground border border-border/40 bg-card/40 px-3 py-1 rounded-full hover:text-primary hover:border-primary/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <FileText className="h-4 w-4" aria-hidden="true" />
              Write-up
            </Link>
          ) : null}
        </CardFooter>
      ) : null}
    </Card>
  );
}
