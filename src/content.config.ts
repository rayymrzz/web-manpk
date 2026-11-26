import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

/** File JSON berupa array biasa; id dibuat otomatis dari urutan. */
const jsonArray = (path: string) =>
  file(path, {
    parser: (text) =>
      (JSON.parse(text) as Record<string, unknown>[]).map((item, i) => ({
        id: String(i + 1).padStart(3, '0'),
        urutan: i,
        ...item,
      })),
  });

/** Berita: satu file .md per berita di src/content/berita/ */
const berita = defineCollection({
  loader: glob({ base: './src/content/berita', pattern: '**/[^_]*.md' }),
  schema: z.object({
    judul: z.string(),
    kategori: z.enum(['Pengumuman', 'Prestasi', 'Kegiatan']),
    /** Format YYYY-MM-DD. Kosongkan bila belum ada (tampil "[Tanggal]"). */
    tanggal: z.coerce.date().optional(),
    /** Tampil besar di urutan pertama. */
    utama: z.boolean().default(false),
    /** Foto di public/img/berita/…  (tulis: img/berita/nama.jpg) */
    foto: z.string().optional(),
    fotoAlt: z.string().optional(),
    /** Teks di kotak foto selama foto belum ada. */
    labelFoto: z.string().default('FOTO BERITA'),
    tautan: z.string().optional(),
    teksTautan: z.string().default('Selengkapnya →'),
    /** Urutan manual untuk berita bertanggal sama / tanpa tanggal (kecil = atas). */
    urutan: z.number().default(0),
  }),
});

/** Daftar prestasi (tabel arsip). Tambah di akhir array. */
const prestasi = defineCollection({
  loader: jsonArray('src/content/prestasi.json'),
  schema: z.object({
    urutan: z.number(),
    nama: z.string(),
    prestasi: z.string(),
    kompetisi: z.string(),
  }),
});

/** Prestasi unggulan (kartu besar di atas halaman Prestasi). */
const prestasiUnggulan = defineCollection({
  loader: jsonArray('src/content/prestasi-unggulan.json'),
  schema: z.object({
    urutan: z.number(),
    label: z.string(),
    gelar: z.string(),
    judul: z.string(),
    keterangan: z.string(),
    nama: z.string(),
    foto: z.string().optional(),
    fotoAlt: z.string().optional(),
  }),
});

/** Galeri foto. */
const galeri = defineCollection({
  loader: jsonArray('src/content/galeri.json'),
  schema: z.object({
    urutan: z.number(),
    keterangan: z.string(),
    kategori: z.enum(['madrasah', 'asrama', 'lomba']),
    /** Foto di public/img/galeri/…  (tulis: img/galeri/nama.jpg) */
    foto: z.string().optional(),
    alt: z.string().optional(),
    /** Teks kotak placeholder selama foto belum ada. */
    label: z.string().optional(),
    ukuran: z.enum(['normal', 'tall', 'wide']).default('normal'),
  }),
});

export const collections = { berita, prestasi, prestasiUnggulan, galeri };
