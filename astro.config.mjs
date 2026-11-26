// @ts-check
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';

// GitHub Pages: https://rayymrzz.github.io/web-manpk/
// `base` harus sama dengan nama repo. Kalau repo diganti nama atau memakai domain sendiri,
// ubah `base` (domain sendiri → '/') dan `site`.
export default defineConfig({
  site: 'https://rayymrzz.github.io',
  base: '/web-manpk',
  trailingSlash: 'ignore',
  markdown: {
    // Jangan ubah kutip lurus menjadi kutip lengkung: teks berita harus sama persis dengan aslinya.
    processor: satteri({ features: { smartPunctuation: false } }),
  },
});
