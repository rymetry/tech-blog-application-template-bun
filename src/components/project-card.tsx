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
    <Card className="h-full overflow-hidden card-surface card-surface-hover">
      <CardHeader className="space-y-3">
        <CardTitle className="card-title-lg tracking-tight">
          {project.name}
        </CardTitle>
        <p className="text-sm sm:text-base text-foreground/80">
          {project.summary}
        </p>
        <div className="flex flex-wrap gap-2" aria-label="Project tags">
          {project.tags.map((tag) => (
            <TagPill key={tag} variant="primary" className="cursor-default">
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
              <TagPill key={item} variant="muted" className="cursor-default">
                {item}
              </TagPill>
            ))}
          </div>
        </div>
      </CardContent>

      {(isRealLink(github) || isRealLink(demo) || isRealLink(writeup)) ? (
        <CardFooter className="flex flex-wrap gap-3">
          {isRealLink(github) ? (
            <TagPill asChild variant="link" size="md" className="px-3 py-1">
              <Link
                href={github!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                <Github className="h-4 w-4" aria-hidden="true" />
                GitHub
              </Link>
            </TagPill>
          ) : null}
          {isRealLink(demo) ? (
            <TagPill asChild variant="link" size="md" className="px-3 py-1">
              <Link
                href={demo!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Demo
              </Link>
            </TagPill>
          ) : null}
          {isRealLink(writeup) ? (
            <TagPill asChild variant="link" size="md" className="px-3 py-1">
              <Link
                href={writeup!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                <FileText className="h-4 w-4" aria-hidden="true" />
                Write-up
              </Link>
            </TagPill>
          ) : null}
        </CardFooter>
      ) : null}
    </Card>
  );
}
