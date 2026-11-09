export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function readProperty(scope: unknown, key: string): unknown {
  return isRecord(scope) ? scope[key] : undefined;
}

export function readPath(scope: unknown, ...keys: readonly string[]): unknown {
  let current: unknown = scope;

  for (const key of keys) {
    current = readProperty(current, key);
  }

  return current;
}
