function parsePositiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return value && Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export { parsePositiveInteger };
