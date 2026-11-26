/* =========================================
   MANPK JOMBANG — SCRIPT
========================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* ---------- 1. Menu mobile ---------- */
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open);
      toggle.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
    });

    const closeMenu = () => {
      nav.classList.remove("open");
      toggle.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Buka menu");
    };

    // Tutup menu saat link diklik, tombol Esc, atau layar dilebarkan
    nav.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMenu));
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeMenu(); });
    window.matchMedia("(min-width: 861px)").addEventListener("change", e => { if (e.matches) closeMenu(); });
  }

  /* ---------- 2. Tahun otomatis di footer ---------- */
  document.querySelectorAll("[data-year]").forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- 3. Animasi muncul saat scroll ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add("visible"));
  }

  /* ---------- 4. Slider hero (beranda) ---------- */
  const slides = document.querySelectorAll(".hero-slide");
  const dots = document.querySelectorAll(".hero-pagination button");

  if (slides.length > 1) {
    let current = 0;
    let timer;

    const show = i => {
      slides[current].classList.remove("active");
      dots[current]?.classList.remove("current");
      current = (i + slides.length) % slides.length;
      slides[current].classList.add("active");
      dots[current]?.classList.add("current");
    };

    const start = () => {
      clearInterval(timer);
      timer = setInterval(() => show(current + 1), 5000);
    };

    dots.forEach((dot, i) => dot.addEventListener("click", () => { show(i); start(); }));
    start();
  }

  /* ---------- 5. Filter kategori (berita & galeri) ---------- */
  document.querySelectorAll(".filter-bar").forEach(bar => {
    const section = bar.closest("section");
    const items = section.querySelectorAll("[data-category]");
    const empty = section.querySelector(".empty-state");

    bar.addEventListener("click", e => {
      const btn = e.target.closest(".filter-btn");
      if (!btn) return;

      bar.querySelectorAll(".filter-btn").forEach(b => {
        b.classList.remove("active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");

      const filter = btn.dataset.filter;
      let shown = 0;
      items.forEach(item => {
        const match = filter === "all" || item.dataset.category === filter;
        item.hidden = !match;
        if (match) shown++;
      });
      if (empty) empty.hidden = shown > 0;
    });
  });

  /* ---------- 6. Lightbox galeri ---------- */
  const lightbox = document.querySelector(".lightbox");
  if (lightbox) {
    const lbImg = lightbox.querySelector("img");
    const lbCap = lightbox.querySelector(".lightbox-caption");

    const close = () => { lightbox.hidden = true; document.body.style.overflow = ""; };

    document.querySelectorAll(".gallery-item img").forEach(img => {
      img.addEventListener("click", () => {
        lbImg.src = img.src;
        lbImg.alt = img.alt;
        lbCap.textContent = img.closest("figure").querySelector("figcaption")?.textContent || "";
        lightbox.hidden = false;
        document.body.style.overflow = "hidden";
      });
    });

    lightbox.addEventListener("click", e => {
      if (e.target === lightbox || e.target.closest(".lightbox-close")) close();
    });
    document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
  }

  /* ---------- 7. Status pendaftaran SNMB ---------- */
  // Tanggal dibaca dari atribut data-open / data-close / data-end di snmb.html
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const toDate = str => new Date(str + "T00:00:00");

  document.querySelectorAll(".route").forEach(route => {
    const status = route.querySelector(".route-status");
    const open = toDate(route.dataset.open);
    const close = toDate(route.dataset.close);

    if (today < open) {
      status.textContent = "Segera dibuka";
      route.classList.add("upcoming");
    } else if (today > close) {
      status.textContent = "Ditutup";
      route.classList.add("closed");
    } else {
      const days = Math.round((close - today) / 86400000);
      status.textContent = days === 0 ? "Hari terakhir" : `Dibuka · ${days} hari lagi`;
    }
  });

  document.querySelectorAll(".timeline li[data-end]").forEach(item => {
    if (today > toDate(item.dataset.end)) item.classList.add("done");
  });
});
