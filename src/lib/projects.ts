import type { Project } from '@/types';

export const projects: Project[] = [
  {
    id: 'ci-quality-gates',
    name: 'CI Quality Gates',
    summary: 'A lightweight quality gate framework to keep releases safe and predictable.',
    tags: ['CI', 'Quality Gates', 'Observability'],
    role: 'Designed the checks strategy and implemented the gating pipeline.',
    stack: ['GitHub Actions', 'TypeScript', 'Playwright', 'Slack'],
    impact: [
      'Reduced flaky build noise by introducing a stable signal taxonomy.',
      'Enabled faster reviews with automated risk-based checks.',
      'Improved release confidence with clear pass/fail criteria.',
    ],
    links: {
      writeup: '#',
    },
  },
  {
    id: 'e2e-test-platform',
    name: 'E2E Test Platform',
    summary: 'A maintainable E2E architecture for reliable product regression coverage.',
    tags: ['Automation', 'E2E', 'Test Architecture'],
    role: 'Built a page-object and data-fixture layer; improved execution reliability.',
    stack: ['Playwright', 'Node.js', 'TypeScript'],
    impact: [
      'Cut test maintenance time by standardizing patterns and helpers.',
      'Improved triage speed with structured logs and traces.',
      'Raised trust in E2E runs by addressing flakiness root causes.',
    ],
    links: {
      github: '#',
    },
  },
  {
    id: 'web-performance-tooling',
    name: 'Web Performance Tooling',
    summary: 'Automation and metrics to keep performance regressions out of production.',
    tags: ['Performance', 'Automation', 'Web'],
    role: 'Defined performance budgets and integrated measurement into CI.',
    stack: ['Lighthouse', 'Web Vitals', 'Next.js', 'TypeScript'],
    impact: [
      'Prevented regressions with budget-based checks.',
      'Created a feedback loop developers could act on.',
      'Improved user experience by making performance visible.',
    ],
    links: {
      writeup: '#',
    },
  },
];

