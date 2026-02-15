import { StatusPill } from '@/components/status-pill';

const steps = [
  { title: 'Discover', description: 'Align goals and constraints' },
  { title: 'Design', description: 'Plan architecture and interfaces' },
  { title: 'Build', description: 'Implement and iterate quickly' },
  { title: 'Observe', description: 'Track behavior and reliability' },
  { title: 'Iterate', description: 'Refine based on outcomes' },
] as const;

export function EngineeringWorkflow() {
  return (
    <div className="w-full rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm shadow-sm p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="text-sm font-medium text-foreground">Engineering Workflow</div>
          <div className="text-xs text-muted-foreground">Sample flow • Updated weekly</div>
        </div>
        <StatusPill label="Weekly release cadence" tone="success" />
      </div>

      <div className="mt-5">
        <ol className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="relative lg:after:absolute lg:after:top-5 lg:after:left-[calc(50%+20px)] lg:after:h-px lg:after:w-[calc(100%+1rem-40px)] lg:after:bg-border/60 lg:after:content-[''] last:lg:after:hidden"
            >
              <div className="flex items-start gap-3 sm:flex-col sm:items-center sm:gap-2">
                <div className="relative z-10 h-10 w-10 rounded-full border border-primary/30 bg-primary/10 text-primary flex items-center justify-center font-semibold">
                  {index + 1}
                </div>
                <div className="min-w-0 sm:text-center">
                  <div className="text-sm font-medium text-foreground">
                    {step.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {step.description}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
