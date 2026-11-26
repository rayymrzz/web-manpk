// Cek tampilan di HP & tablet: cari elemen yang meluber ke samping dan simpan screenshot.
// Pakai: npm run build && npm run check:mobile [-- beranda profil/ ...]
// Set REDUCED=1 untuk menguji mode "kurangi gerak".
// Screenshot disimpan di ./screenshots (tidak ikut di-commit).
import { chromium } from 'playwright';
import { preview } from 'astro';
import config from '../astro.config.mjs';
import { mkdirSync } from 'node:fs';

const PORT = 4329;
const BASE = `http://localhost:${PORT}${(config.base || '').replace(/\/$/, '')}`;
const WIDTHS = [320, 390, 768, 1280];
const ALL_PAGES = ['', 'profil/', 'berita/', 'prestasi/', 'galeri/', 'kontak/', 'snmb/', '404.html'];
const pages = process.argv.slice(2).length
  ? process.argv.slice(2).map((p) => (p === 'beranda' ? '' : p))
  : ALL_PAGES;
const reduced = process.env.REDUCED === '1';

mkdirSync('screenshots', { recursive: true });

const server = await preview({ server: { port: PORT }, logLevel: 'error' });

const browser = await chromium.launch();
let problems = 0;
let missingLogo = false;

try {
  for (const path of pages) {
    for (const width of WIDTHS) {
      const ctx = await browser.newContext({
        viewport: { width, height: width < 768 ? 800 : 1000 },
        reducedMotion: reduced ? 'reduce' : 'no-preference',
      });
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('console', (m) => { if (m.type() === 'error' && !m.text().startsWith('Failed to load resource')) errors.push(m.text()); });
      page.on('response', (r) => {
        if (r.status() < 400 || r.url() === page.url()) return;
        const file = r.url().split('/').pop();
        if (file === 'logo.png') missingLogo = true; // logo belum ditaruh di public/
        else errors.push(`${r.status()} ${r.url()}`);
      });

      const res = await page.goto(BASE + '/' + path, { waitUntil: 'networkidle' });

      // Gulir sampai bawah supaya semua animasi scroll selesai
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 300) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 60));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(1600);

      const overflow = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        const bad = [];
        for (const el of document.querySelectorAll('body *')) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          if (getComputedStyle(el).position === 'fixed') continue;
          // abaikan isi yang memang dipotong oleh induknya (overflow hidden/clip)
          let clipped = false;
          for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
            const o = getComputedStyle(p).overflowX;
            if (o === 'hidden' || o === 'clip' || o === 'auto' || o === 'scroll') {
              const pr = p.getBoundingClientRect();
              if (pr.right <= vw + 1 && pr.left >= -1) { clipped = true; break; }
            }
          }
          if (clipped) continue;
          if (r.right > vw + 1 || r.left < -1) {
            const id = el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : '');
            bad.push(`${id} [${Math.round(r.left)}→${Math.round(r.right)}]`);
          }
        }
        return { docWidth: document.documentElement.scrollWidth, vw, bad: bad.slice(0, 8) };
      });

      const name = `${(path || 'beranda').replace(/[\/.]/g, '_').replace(/_+$/, '')}-${width}${reduced ? '-reduced' : ''}`;
      await page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });

      const ok = overflow.bad.length === 0 && overflow.docWidth <= overflow.vw && errors.length === 0;
      if (!ok) problems++;
      console.log(`${ok ? 'OK  ' : 'MASALAH'} /${path} @${width}px  (status ${res?.status()})`);
      if (overflow.docWidth > overflow.vw) console.log(`     dokumen ${overflow.docWidth}px > layar ${overflow.vw}px`);
      overflow.bad.forEach((b) => console.log('     meluber:', b));
      errors.forEach((e) => console.log('     error JS:', e));
      await ctx.close();
    }
  }
} finally {
  await browser.close();
  await server.stop();
}

if (missingLogo) console.log('\nCatatan: public/logo.png belum ada (logo & favicon).');
console.log(problems ? `\n${problems} tampilan bermasalah.` : '\nSemua rapi.');
process.exit(problems ? 1 : 0);
