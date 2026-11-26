const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Tambahkan base path (GitHub Pages) ke tautan internal. Tautan luar/anchor dibiarkan. */
export function url(path = ''): string {
  if (/^([a-z]+:|#|\/\/)/i.test(path)) return path;
  return `${base}/${path.replace(/^\//, '')}`;
}
