// @ts-check
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';

// GitHub Pages: https://manpk-jombang.github.io/
// Repo `manpk-jombang.github.io` = situs organisasi di akar domain, jadi `base` = '/'.
// Kalau pindah ke repo bernama lain, isi `base` dengan '/nama-repo'.
export default defineConfig({
  site: 'https://manpk-jombang.github.io',
  base: '/',
  trailingSlash: 'ignore',
  markdown: {
    // Jangan ubah kutip lurus menjadi kutip lengkung: teks berita harus sama persis dengan aslinya.
    processor: satteri({ features: { smartPunctuation: false } }),
  },
});
