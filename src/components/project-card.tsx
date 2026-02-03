import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Project } from '@/types';
import { ExternalLink, FileText, Github } from 'lucide-react';
import Link from 'next/link';

const isRealLink = (value: string | undefined) => Boolean(value && value !== '#');

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { github, demo, writeup } = project.links ?? {};

  return (
    <Card className="h-full border-border/40 bg-card/50 shadow-sm overflow-hidden">
      <CardHeader className="space-y-3">
        <CardTitle className="text-lg sm:text-xl font-semibold tracking-tight">
          {project.name}
        </CardTitle>
        <p className="text-sm sm:text-base text-muted-foreground">
          {project.summary}
        </p>
        <div className="flex flex-wrap gap-2" aria-label="Project tags">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="tag-text bg-primary/10 text-primary px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Role</div>
          <p className="text-sm sm:text-base">{project.role}</p>
        </div>

        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Impact</div>
          <ul className="list-disc pl-5 space-y-1 text-sm sm:text-base">
            {project.impact.map((item) => (
              <li key={item}>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Stack</div>
          <p className="text-sm sm:text-base text-muted-foreground">
            {project.stack.join(' • ')}
          </p>
        </div>
      </CardContent>

      {(isRealLink(github) || isRealLink(demo) || isRealLink(writeup)) ? (
        <CardFooter className="flex flex-wrap gap-3">
          {isRealLink(github) ? (
            <Link
              href={github!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md"
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
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md"
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
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md"
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

