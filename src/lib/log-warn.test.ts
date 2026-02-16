import { afterEach, describe, expect, it } from 'bun:test';
import { createWarnEventPayload, logWarnEvent } from './log-warn';

const originalWarn = console.warn;

afterEach(() => {
  console.warn = originalWarn;
});

describe('logWarnEvent', () => {
  it('never throws even with BigInt and circular context', () => {
    const context: Record<string, unknown> = {
      count: 1n,
    };
    context.self = context;

    console.warn = () => {};

    expect(() =>
      logWarnEvent({
        event: 'test_event',
        reason: 'test_reason',
        context,
      }),
    ).not.toThrow();
  });

  it('outputs event/reason/context/ts', () => {
    const payload = createWarnEventPayload({
      event: 'output_test',
      reason: 'shape_assertion',
      context: { foo: 'bar' },
    });

    expect(payload).toHaveProperty('event', 'output_test');
    expect(payload).toHaveProperty('reason', 'shape_assertion');
    expect(payload).toHaveProperty('context');
    expect(payload).toHaveProperty('ts');
    expect(payload.context).toContain('"foo":"bar"');
  });
});
