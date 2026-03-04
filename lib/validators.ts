/**
 * Validates that an IMDb ID matches the expected format: tt + 7 or 8 digits.
 * Examples of valid IDs: tt0133093, tt99999999
 */
export function isValidImdbId(id: string): boolean {
  if (!id || typeof id !== "string") return false;
  return /^tt\d{7,8}$/.test(id.trim());
}

/**
 * Sanitizes the IMDb ID by trimming whitespace and converting to lowercase.
 */
export function sanitizeImdbId(id: string): string {
  return id.trim().toLowerCase();
}

/**
 * Clamps a number between min and max bounds.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
