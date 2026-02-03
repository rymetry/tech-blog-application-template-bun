'use client';

import { ProjectCard } from '@/components/project-card';
import { cn } from '@/lib/utils';
import type { Project } from '@/types';
import { useMemo, useState } from 'react';

interface ProjectsGridProps {
  projects: Project[];
}

export function ProjectsGrid({ projects }: ProjectsGridProps) {
  const tagData = useMemo(() => {
    const tagMap = new Map<string, number>();
    for (const project of projects) {
      for (const tag of project.tags) {
        tagMap.set(tag, (tagMap.get(tag) ?? 0) + 1);
      }
    }
    return Array.from(tagMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [projects]);

  const [activeTag, setActiveTag] = useState<string>('All');

  const filteredProjects = useMemo(() => {
    if (activeTag === 'All') {
      return projects;
    }
    return projects.filter((project) => project.tags.includes(activeTag));
  }, [activeTag, projects]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveTag('All')}
          aria-pressed={activeTag === 'All'}
          className={cn(
            'rounded-full border px-3 py-1 text-xs sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            activeTag === 'All'
              ? 'border-primary/40 bg-primary/10 text-primary'
              : 'border-border/40 bg-card/40 text-muted-foreground hover:text-foreground',
          )}
        >
          All ({projects.length})
        </button>
        {tagData.map((tag) => (
          <button
            key={tag.name}
            type="button"
            onClick={() => setActiveTag(tag.name)}
            aria-pressed={activeTag === tag.name}
            className={cn(
              'rounded-full border px-3 py-1 text-xs sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              activeTag === tag.name
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-border/40 bg-card/40 text-muted-foreground hover:text-foreground',
            )}
          >
            {tag.name} ({tag.count})
          </button>
        ))}
      </div>

      <div className="text-xs sm:text-sm text-muted-foreground" role="status" aria-live="polite">
        Showing {filteredProjects.length} of {projects.length} projects
      </div>

      {filteredProjects.length === 0 ? (
        <div className="rounded-xl border border-border/40 bg-card/40 p-6 text-sm text-muted-foreground">
          No projects match the selected tag.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
