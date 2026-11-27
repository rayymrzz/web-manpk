# Website MANPK Jombang

Situs statis MANPK Jombang dibangun dengan [Astro](https://astro.build), GSAP (ScrollTrigger + SplitText) dan Lenis.
Versi HTML lama tetap disimpan di folder `manpk/` sebagai rujukan.

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:4321/
npm run build      # hasil di dist/
npm run preview    # lihat hasil build
npm run check:mobile -- beranda profil/   # cek 320/390/768/1280px dengan Playwright (jalankan build dulu)
```

Hasil screenshot dari `check:mobile` disimpan di folder `screenshots/`. Kalau ingin menguji mode "kurangi gerak", tambahkan `REDUCED=1` di depan perintahnya.

## Menambah berita

Buat satu file `.md` baru di `src/content/berita/`. Namanya bebas, misalnya `2027-02-15-pengumuman-kelulusan.md`.

```md
---
judul: Judul berita
kategori: Kegiatan          # Pengumuman | Prestasi | Kegiatan
tanggal: 2027-02-15         # format TAHUN-BULAN-TANGGAL
foto: img/berita/kelulusan.jpg   # opsional, simpan fotonya di public/img/berita/
fotoAlt: Santri berfoto bersama  # keterangan foto untuk pembaca layar
tautan: snmb                # opsional: halaman tujuan (snmb, prestasi, …) atau URL lengkap
teksTautan: Selengkapnya →
utama: false                # true = tampil besar di urutan pertama
---

Ringkasan berita satu-dua paragraf.
```

Urutannya: berita `utama` tampil paling atas, lalu berita bertanggal dari yang terbaru. Berita tanpa tanggal tampil paling bawah dan diurutkan menurut angka `urutan`.

## Menambah prestasi

- **Daftar/tabel prestasi:** buka `src/content/prestasi.json`, lalu salin satu blok `{ … }` ke akhir daftar:
  ```json
  {
    "nama": "Nama Siswa / Tim",
    "prestasi": "Juara 1",
    "kompetisi": "Nama Lomba – Penyelenggara"
  }
  ```
  Nomor urut dibuat otomatis. Pisahkan setiap blok dengan koma.
- **Kartu prestasi unggulan** (bagian atas halaman Prestasi): edit `src/content/prestasi-unggulan.json` dengan isian `label`, `gelar`, `judul`, `keterangan`, `nama`, dan opsional `foto` serta `fotoAlt`.

## Menambah foto

1. Simpan foto di `public/img/…`, misalnya `public/img/galeri/muhadharah.jpg`. Usahakan lebarnya ±1600px dan formatnya JPG atau WebP supaya ringan.
2. **Galeri:** di `src/content/galeri.json`, tambahkan atau isi `"foto": "img/galeri/muhadharah.jpg"` dan `"alt": "…"`. Pilihan `kategori`: `madrasah`, `asrama`, atau `lomba`. Pilihan `ukuran`: `normal`, `tall`, atau `wide`. Selama `foto` masih kosong, kotak placeholder yang ditampilkan.
3. **Hero beranda:** di bagian atas `src/pages/index.astro`, isi `foto` pada `heroSlides`.
4. **Logo & favicon:** simpan logo sebagai `public/logo.png`.
5. **Poster SNMB:** simpan sebagai `public/img/poster-snmb-2027.jpg`. Bagian poster di halaman SNMB otomatis muncul begitu file ini ada, lalu jalankan build ulang.
6. **Foto Profil** (gedung, asrama): di `src/pages/profil.astro`, ganti `<span>FOTO …</span>` di dalam `.photo-frame` dengan `<img src={url('img/gedung.jpg')} alt="…">`.

Tulis path foto tanpa `/` di depan, misalnya `img/galeri/x.jpg`. Dengan begitu tautannya tetap jalan di GitHub Pages.

## Deploy ke GitHub Pages

1. Push repo ini ke GitHub (branch `main`).
2. Di GitHub buka **Settings → Pages → Source**, lalu pilih **GitHub Actions**.
3. Setiap ada push ke `main`, workflow `.github/workflows/deploy.yml` otomatis membangun dan menerbitkan situs ke https://manpk-jombang.github.io/.

`base` di `astro.config.mjs` diisi `/` karena repo ini bernama `manpk-jombang.github.io` (situs organisasi, tampil di akar domain). Kalau situs dipindah ke repo dengan nama lain, isi `base` dengan `/nama-repo`; kalau memakai domain sendiri, biarkan `/` dan ubah `site`.

## Animasi

Semua animasi ada di `src/scripts/motion.ts` dan dipasang lewat atribut HTML:

| Atribut | Efek |
|---|---|
| `data-hero` | wadah teks hero |
| `data-split` | teks muncul per baris |
| `data-hero-fade="start"/"end"` | memudar sebelum/sesudah teks |
| `data-parallax` | parallax halus pada bingkai foto |
| `data-stagger` | anak-anaknya muncul bergantian saat di-scroll |
| `data-count="70"` | angka naik dari 0 saat terlihat |

Kalau pengunjung memilih "kurangi gerak" (prefers-reduced-motion) di perangkatnya, smooth scroll dan semua animasi dimatikan, dan konten langsung tampil.
