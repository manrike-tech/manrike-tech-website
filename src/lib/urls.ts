/**
 * Prefixes an internal path with the configured base path so links keep
 * working when the site is served from a sub-directory (GitHub project pages).
 */
export function url(path = '/'): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (/^[a-z]+:/i.test(path) || path.startsWith('#')) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${base}${clean}`;
}

/** Removes the base path, e.g. to compare against navigation entries. */
export function stripBase(pathname: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return base && pathname.startsWith(base) ? pathname.slice(base.length) || '/' : pathname;
}

export function formatDate(date: Date, locale = 'en'): string {
  return date.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
