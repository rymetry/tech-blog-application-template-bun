type LogWarnEventInput = {
  event: string;
  reason: string;
  context?: unknown;
};

export type WarnEventPayload = {
  event: string;
  reason: string;
  context: string;
  ts: string;
};

const toSerializableValue = (value: unknown, seen: WeakSet<object>): unknown => {
  if (value === null || value === undefined) {
    return value ?? null;
  }

  if (typeof value === 'bigint') {
    return `${value.toString()}n`;
  }

  if (typeof value === 'function') {
    return `[Function:${value.name || 'anonymous'}]`;
  }

  if (typeof value === 'symbol') {
    return value.toString();
  }

  if (typeof value !== 'object') {
    return value;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? '[Invalid Date]' : value.toISOString();
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
    };
  }

  if (seen.has(value)) {
    return '[Circular]';
  }

  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => {
      try {
        return toSerializableValue(item, seen);
      } catch {
        return '[Unserializable]';
      }
    });
  }

  const record: Record<string, unknown> = {};

  for (const key of Object.keys(value as Record<string, unknown>)) {
    try {
      record[key] = toSerializableValue((value as Record<string, unknown>)[key], seen);
    } catch {
      record[key] = '[Unserializable]';
    }
  }

  return record;
};

const stringifyContextSafely = (context: unknown): string => {
  try {
    return JSON.stringify(toSerializableValue(context, new WeakSet<object>()));
  } catch {
    return '"[Unserializable Context]"';
  }
};

export const logWarnEvent = ({ event, reason, context }: LogWarnEventInput): void => {
  try {
    const payload = createWarnEventPayload({ event, reason, context });

    try {
      console.warn(payload);
    } catch {
      try {
        console.warn(
          JSON.stringify({
            event,
            reason,
            context: '"[Warn Output Failed]"',
            ts: payload.ts,
          }),
        );
      } catch {
        // このロガーで例外を投げないため、失敗は意図的に握りつぶす。
      }
    }
  } catch {
    try {
      console.warn({
        event: 'log_warn_event_failed',
        reason: 'logger_exception',
        context: '"[Unavailable]"',
        ts: new Date().toISOString(),
      });
    } catch {
      // 意図的に何もしない。
    }
  }
};

export const createWarnEventPayload = ({
  event,
  reason,
  context,
}: LogWarnEventInput): WarnEventPayload => ({
  event,
  reason,
  context: stringifyContextSafely(context),
  ts: new Date().toISOString(),
});
