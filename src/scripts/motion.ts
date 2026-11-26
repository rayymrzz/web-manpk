/* =========================================
   GERAK HALUS — Lenis + GSAP ScrollTrigger + SplitText
   Semua dilewati bila pengguna memilih "kurangi gerak"
   (prefers-reduced-motion: reduce); halaman tetap tampil utuh.
========================================= */
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

if (document.documentElement.classList.contains('has-motion')) {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  /* ---------- 1. Smooth scroll ---------- */
  const lenis = new Lenis({ autoRaf: false, lerp: 0.12 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Tautan anchor (#…): gulir halus ke target. Bagian .reveal yang belum muncul masih
  // tergeser ke bawah (translateY), jadi pergeserannya dikompensasi agar berhenti tepat.
  document.addEventListener('click', (e) => {
    const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
    const id = link?.getAttribute('href')?.slice(1);
    const target = id ? document.getElementById(id) : null;
    if (!link || !target) return;
    e.preventDefault();
    const shift = new DOMMatrix(getComputedStyle(target).transform).m42 || 0;
    target.classList.add('visible');
    lenis.scrollTo(target, { offset: -shift });
    history.pushState(null, '', `#${id}`);
  });

  // Hentikan smooth scroll saat lightbox terbuka
  window.addEventListener('lightbox-open', () => lenis.stop());
  window.addEventListener('lightbox-close', () => lenis.start());
  window.addEventListener('layout-change', () => ScrollTrigger.refresh());

  /* ---------- 2. Reveal teks hero per baris ---------- */
  // Di dalam [data-hero]:
  //   [data-split]             → dipecah per baris, tiap baris naik dari balik mask
  //   [data-hero-fade="start"] → memudar lebih dulu (eyebrow)
  //   [data-hero-fade="end"]   → memudar setelah teks (tombol, navigasi foto)
  document.querySelectorAll<HTMLElement>('[data-hero]').forEach((hero) => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.1 });

    hero.querySelectorAll<HTMLElement>('[data-hero-fade="start"]').forEach((el) => {
      tl.fromTo(el, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6, clearProps: 'transform,opacity' }, 0);
    });

    hero.querySelectorAll<HTMLElement>('[data-split]').forEach((el, i) => {
      let first = true;
      SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        linesClass: 'hero-line', // pembungkus mask otomatis berkelas .hero-line-mask
        autoSplit: true,
        onSplit(self) {
          gsap.set(el, { autoAlpha: 1 });
          const anim = gsap.from(self.lines, {
            yPercent: 110,
            duration: 0.9,
            stagger: 0.08,
            ease: 'power3.out',
          });
          // Split pertama ikut timeline hero; re-split (font selesai dimuat / lebar berubah)
          // disinkronkan otomatis oleh SplitText karena animasinya di-return.
          if (first) {
            tl.add(anim, 0.12 + i * 0.16);
            first = false;
          }
          return anim;
        },
      });
    });

    hero.querySelectorAll<HTMLElement>('[data-hero-fade="end"]').forEach((el, i) => {
      tl.fromTo(el, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6, clearProps: 'transform,opacity' }, 0.6 + i * 0.1);
    });
  });

  /* ---------- 3. Parallax halus pada foto ---------- */
  // [data-parallax] = bingkai foto. Bila berisi <img>,
  // isinya bergeser pelan di dalam bingkai. Bila bingkai masih placeholder kosong,
  // bingkainya sendiri yang bergeser sedikit. Nilai atribut = kekuatan (default 1).
  gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((frame) => {
    const media = frame.querySelectorAll<HTMLElement>('img');
    const strength = Number(frame.dataset.parallax) || 1;
    const scrollTrigger = { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: 0.6 };

    if (media.length) {
      gsap.fromTo(media,
        { yPercent: -4 * strength, scale: 1.1 },
        { yPercent: 4 * strength, scale: 1.1, ease: 'none', scrollTrigger });
    } else {
      gsap.fromTo(frame,
        { y: -16 * strength },
        { y: 16 * strength, ease: 'none', scrollTrigger });
    }
  });

  /* ---------- 4. Fakta / angka muncul saat scroll ---------- */
  // [data-stagger]: anak-anaknya muncul bergantian.
  gsap.utils.toArray<HTMLElement>('[data-stagger]').forEach((group) => {
    gsap.from(group.children, {
      autoAlpha: 0,
      y: 20,
      duration: 0.7,
      stagger: 0.12,
      ease: 'power2.out',
      clearProps: 'transform,opacity,visibility', // supaya efek hover CSS (mis. kartu naik) tetap jalan
      scrollTrigger: { trigger: group, start: 'top 85%', once: true },
    });
  });

  // [data-count="70"]: angka naik dari 0 ke nilai akhir. Teks asli di HTML = nilai akhir,
  // jadi tanpa JS / dengan reduced motion angkanya tetap benar.
  gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
    const end = Number(el.dataset.count);
    if (!Number.isFinite(end)) return;
    const counter = { v: 0 };
    el.textContent = '0';
    gsap.to(counter, {
      v: end,
      duration: 1.4,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => { el.textContent = String(Math.round(counter.v)); },
    });
  });
}
