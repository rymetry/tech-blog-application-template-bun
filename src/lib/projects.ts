import type { Project } from '@/types';

export const projects: Project[] = [
  {
    id: 'subscription-billing-revamp',
    name: 'Subscription Billing Revamp',
    summary: 'Rebuilt billing flows for clarity, reliability, and faster feature delivery.',
    tags: ['Product', 'Backend', 'Payments'],
    role: 'Led architecture and implementation across API contracts, domain logic, and rollout.',
    stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Stripe'],
    impact: [
      'Reduced checkout drop-offs by simplifying plan selection and payment recovery flows.',
      'Improved billing incident response with clear event timelines and ownership boundaries.',
      'Shortened release cycles by introducing backward-compatible contract changes.',
    ],
    links: {
      writeup: '#',
    },
  },
  {
    id: 'developer-onboarding-portal',
    name: 'Developer Onboarding Portal',
    summary: 'Built a self-serve portal that streamlined local setup and internal documentation.',
    tags: ['Developer Experience', 'Platform', 'Web'],
    role: 'Designed the information architecture and implemented the portal with search and templates.',
    stack: ['Next.js', 'TypeScript', 'MDX', 'GitHub Actions'],
    impact: [
      'Cut new-hire setup time by replacing ad hoc wiki docs with executable onboarding guides.',
      'Increased engineering velocity by centralizing standards, templates, and team playbooks.',
      'Reduced repeated support requests through searchable, versioned documentation.',
    ],
    links: {
      github: '#',
    },
  },
  {
    id: 'release-observability-console',
    name: 'Release Observability Console',
    summary: 'Created a release dashboard that connected deploys, metrics, and incident signals.',
    tags: ['Observability', 'Delivery', 'Operations'],
    role: 'Implemented the event pipeline and dashboard UX used by feature teams.',
    stack: ['TypeScript', 'OpenTelemetry', 'BigQuery', 'React'],
    impact: [
      'Improved release visibility with a shared source of truth for deployment health.',
      'Reduced mean time to detect regressions by correlating deploys with service metrics.',
      'Enabled safer rollouts by surfacing risk signals before customer impact escalated.',
    ],
    links: {
      writeup: '#',
    },
  },
];
