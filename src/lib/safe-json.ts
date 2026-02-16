const JSON_LD_ESCAPE_PATTERN = /[<>&\u2028\u2029]/g;

const JSON_LD_ESCAPE_MAP: Record<string, string> = {
  '<': '\\u003C',
  '>': '\\u003E',
  '&': '\\u0026',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
};

export const escapeJsonForHtml = (value: string): string =>
  value.replace(JSON_LD_ESCAPE_PATTERN, (match) => JSON_LD_ESCAPE_MAP[match] ?? match);

export const stringifyJsonLd = (value: unknown): string => {
  const json = JSON.stringify(value);

  if (json === undefined) {
    throw new TypeError('JSON-LD payload could not be stringified.');
  }

  return escapeJsonForHtml(json);
};
