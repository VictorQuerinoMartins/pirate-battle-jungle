// Reads ?seed=123 from the url. Tests use it to get the same match every time.
// Without it (or with an invalid value) the game picks its own seed.
export function seedFromSearch(search: string): number | null {
  const value = new URLSearchParams(search).get("seed");
  if (value === null || value.trim() === "") return null;

  const seed = Number(value);
  return Number.isInteger(seed) ? seed : null;
}