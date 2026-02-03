'use client';

import { ProjectCard } from '@/components/project-card';
import { TagPill } from '@/components/tag-pill';
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
        <TagPill
          asChild
          size="md"
          variant={activeTag === 'All' ? 'selected' : 'muted'}
          className={cn(activeTag === 'All' ? '' : 'hover:text-foreground hover:border-primary/30')}
        >
          <button
            type="button"
            onClick={() => setActiveTag('All')}
            aria-pressed={activeTag === 'All'}
            className="cursor-pointer"
          >
            All ({projects.length})
          </button>
        </TagPill>
        {tagData.map((tag) => (
          <TagPill
            key={tag.name}
            asChild
            size="md"
            variant={activeTag === tag.name ? 'selected' : 'muted'}
            className={cn(activeTag === tag.name ? '' : 'hover:text-foreground hover:border-primary/30')}
          >
            <button
              type="button"
              onClick={() => setActiveTag(tag.name)}
              aria-pressed={activeTag === tag.name}
              className="cursor-pointer"
            >
              {tag.name} ({tag.count})
            </button>
          </TagPill>
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
