/**
 * Returns true if the environment is production.
 */
export function isProd(): boolean {
  return (
    process.env.NODE_ENV === 'production' || process.argv.includes('--prod')
  );
}
