# PRD — Sistem Informasi Restoran "Dapur Ina Aina"

**Versi:** 1.0
**Tanggal:** 25 September 2026
**Metode:** Waterfall (Requirement → Design → Implementation → Testing → Maintenance)
**Stack:** TypeScript + TanStack Start + Tailwind CSS + Prisma ORM + Node.js + MySQL + Brave

---

## 1. Latar Belakang

Restoran "Dapur Ina Aina" masih membutuhkan sistem terkomputerisasi untuk operasional dan transaksi: pemesanan pelanggan, transaksi penjualan, pembayaran tunai/non-tunai, dan billing. Administrator membutuhkan pengelolaan data makanan/minuman per kategori (Makanan Utama, Appetizer, Minuman), pemantauan stok, dan laporan penjualan mingguan/bulanan.

Dokumen ini adalah acuan tunggal untuk desain, implementasi, dan pengujian.

## 2. Tujuan

1. Menyediakan penyimpanan dan tampilan data menu dalam 3 kategori: Makanan Utama, Appetizer, Minuman.
2. Memudahkan pelanggan: lihat menu → pilih → buat pesanan → lihat detail → bayar → terima billing.
3. Memudahkan kasir: kelola pesanan, input transaksi, hitung total, proses pembayaran tunai/non-tunai, cetak/tampilkan billing, lihat stok & transaksi.
4. Memudahkan admin: kelola produk, kategori, stok, lihat transaksi, dan laporan penjualan.

Kriteria sukses: seluruh alur order-to-cash dapat dilakukan tanpa pencatatan manual; stok berkurang otomatis saat penjualan; laporan mingguan/bulanan dapat dihasilkan dari data transaksi.

## 3. Ruang Lingkup

**In-scope:**
- Katalog menu + kategori
- Keranjang & pencatatan pesanan pelanggan
- Detail pesanan (item, jumlah, harga snapshot, subtotal)
- Transaksi penjualan & perhitungan total
- Pembayaran tunai & non-tunai + status lunas/belum_lunas
- Billing (tampil + cetak)
- Manajemen produk, kategori, stok (masuk/keluar)
- Laporan penjualan mingguan/bulanan
- Manajemen user (admin, kasir) + login

**Out-of-scope (v1):**
- Reservasi meja, delivery online / integrasi ojek online
- Loyalty point, voucher/diskon kompleks, pajak/service charge dinamis
- Multi-cabang, multi-gudang, akuntansi lengkap
- Aplikasi mobile native (v1 web responsif saja)

## 4. Stakeholder & Peran

| Aktor | Hak Akses |
|---|---|
| Pelanggan | Lihat menu, buat pesanan, lihat detail pesanan, bayar (dibantu kasir), terima billing. Tidak login (atau guest order). |
| Kasir | Login. Kelola pesanan (diproses/selesai/dibatalkan), input transaksi, hitung total, proses pembayaran, cetak billing, lihat stok & transaksi. Tidak boleh kelola produk/kategori/user. |
| Admin | Login. Semua hak kasir + CRUD produk, kategori, stok masuk, lihat semua transaksi, generate laporan. Kelola user. |

Matriks otorisasi ditegakkan di server (route guard TanStack Start + cek `role` di setiap mutation).

## 5. Kebutuhan Fungsional

### 5.1 Auth & User (FR-AUTH)
- FR-AUTH-1: Login dengan `username` + `password` (hash, mis. bcrypt/argon2). Session cookie httpOnly.
- FR-AUTH-2: Role `admin` | `kasir`. Redirect berdasarkan role setelah login.
- FR-AUTH-3: Admin CRUD user (nama, username unik, password, role). Tidak boleh hapus diri sendiri.
- FR-AUTH-4: Logout mengakhiri session.

### 5.2 Kategori (FR-KAT)
- FR-KAT-1: Admin CRUD kategori. Nilai awal: `Makanan Utama`, `Appetizer`, `Minuman`.
- FR-KAT-2: Kategori tidak dapat dihapus jika masih dipakai produk (RESTRICT).
- FR-KAT-3: Pelanggan/kasir melihat menu dikelompokkan per kategori.

### 5.3 Produk (FR-PROD)
- FR-PROD-1: Admin CRUD produk: `nama_produk`, `harga`, `stok`, `id_kategori`.
- FR-PROD-2: Validasi: nama wajib, harga > 0, stok >= 0 integer, kategori wajib ada.
- FR-PROD-3: Pelanggan hanya melihat produk dengan `stok > 0` (opsional: tampilkan label "Habis" jika stok 0).
- FR-PROD-4: Perubahan harga produk tidak mengubah harga pada pesanan yang sudah tersimpan (harga di-snapshot ke `tb_detail_pesanan.harga`).

### 5.4 Pesanan (FR-ORD)
- FR-ORD-1: Buat pesanan: pilih ≥1 produk dengan jumlah ≥1 dan ≤ stok tersedia. Sistem menyimpan `tanggal`, `id_user` (kasir pengelola), `total` awal 0, `status='diproses'`.
- FR-ORD-2: Tambah detail: untuk tiap item simpan `harga` (snapshot dari produk), `subtotal = jumlah × harga`. Update `tb_pesanan.total = SUM(subtotal)`.
- FR-ORD-3: Kasir dapat ubah status: `diproses` → `selesai` | `dibatalkan`. `selesai` hanya jika pembayaran `lunas`. `dibatalkan` mengembalikan stok (catat `stok.jenis='masuk'` / koreksi).
- FR-ORD-4: Saat item ditambahkan, stok produk berkurang dan tercatat `tb_stok (jenis='keluar')`. Semua dalam satu transaksi DB.
- FR-ORD-5: Lihat daftar & detail pesanan (filter tanggal, status; search nama produk).

### 5.5 Pembayaran & Billing (FR-PAY)
- FR-PAY-1: Satu pembayaran per pesanan (1:1). Field: `metode` (`tunai`|`non_tunai`), `jumlah_bayar`, `tanggal`, `status` (`lunas`|`belum_lunas`).
- FR-PAY-2: Aturan: jika `jumlah_bayar >= total` → `lunas`, pesanan boleh ke `selesai`. Jika kurang → `belum_lunas`, pesanan tetap `diproses`. Tampilkan kembalian `jumlah_bayar - total` bila tunai & lunas.
- FR-PAY-3: Billing berisi: nama resto, no. pesanan, tanggal, kasir, rincian item (nama, qty, harga, subtotal), total, metode, bayar, kembalian, status. Dapat ditampilkan & dicetak (print CSS).
- FR-PAY-4: Pembayaran tidak dapat diubah setelah `lunas` kecuali oleh admin (audit: catat siapa & kapan — v1 cukup larang edit; bila perlu, buat pesanan baru).

### 5.6 Stok (FR-STK)
- FR-STK-1: Admin input stok masuk (restock):ambah `tb_produk.stok`, catat `tb_stok (jenis='masuk')`.
- FR-STK-2: Setiap penjualan otomatis catat `jenis='keluar'`.
- FR-STK-3: Riwayat pergerakan stok: filter produk, jenis, rentang tanggal.
- FR-STK-4: Peringatan stok menipis (mis. stok ≤ 5) di dashboard kasir/admin.
- FR-STK-5: Stok tidak boleh negatif (tolak tambah item melebihi stok dalam transaksi atomik).

### 5.7 Laporan (FR-LAP)
- FR-LAP-1: Laporan mingguan & bulanan dihitung dari `tb_pesanan` yang `status='selesai'` + pembayaran `lunas`.
- FR-LAP-2: Ringkasan tersimpan ke `tb_laporan_penjualan (periode, total_penjualan)`. Format periode disepakati: `YYYY-Www` (mingguan, ISO week) dan `YYYY-MM` (bulanan).
- FR-LAP-3: Admin dapat generate ulang per periode, lihat daftar laporan, dan drill-down ke daftar pesanan pembentuknya.
- FR-LAP-4: Ekspor sederhana: cetak / CSV (v1 cukup print + CSV).

### 5.8 User Stories + Acceptance Criteria (ringkas)

| ID | Story | Acceptance |
|---|---|---|
| US-1 | Sebagai pelanggan saya melihat menu per kategori | Menu tampil 3 grup, ada nama + harga; produk stok 0 berlabel Habis |
| US-2 | Sebagai pelanggan/kasir saya membuat pesanan | Pesanan tersimpan dengan total = sum(subtotal); stok berkurang atomik |
| US-3 | Sebagai kasir saya memproses bayar tunai | Input bayar ≥ total → lunas + kembalian benar + billing tercetak |
| US-4 | Sebagai kasir saya memproses non-tunai | Metode non_tunai, bayar == total → lunas |
| US-5 | Sebagai admin saya kelola produk | CRUD validasi; hapus kategori dipakai → ditolak |
| US-6 | Sebagai admin saya restock | Stok bertambah + riwayat masuk tercatat |
| US-7 | Sebagai admin saya tarik laporan bulanan | Total = sum pesanan selesai+lunas pada bulan itu; tersimpan ke tb_laporan |

## 6. Kebutuhan Non-Fungsional

**Hardware (dev, sesuai Tugas):** AMD Ryzen 5 5500U, RAM 16 GB, SSD 500 GB.
**Software:** Windows 11 Home, Zed Editor, TypeScript, TanStack Start, Tailwind CSS, Prisma ORM, Node.js, MySQL, Brave, Draw.io.

| Kategori | Target |
|---|---|
| Performa | List menu < 2 dtk (100 produk); buat pesanan + bayar < 3 dtk |
| Keamanan | Password di-hash; session httpOnly + CSRF; otorisasi per-role di server; SQL via Prisma (no raw string concat); validasi server-side (zod) |
| Ketersediaan | Single-server v1; backup DB harian (mysqldump) |
| Usabilitas | Alur kasir ≤ 4 klik dari pilih menu → bayar; responsif mobile untuk pelanggan |
| Kompatibilitas | Brave/Chrome/Edge modern; print A4 & thermal 58/80mm (CSS) |
| Audit | Semua perubahan total/status/pembayaran dalam transaksi DB; harga di-snapshot |
| Data | Charset `utf8mb4`; harga `DECIMAL`, tidak pernah float; tanggal `DATE/DATETIME` konsisten |

## 7. Arsitektur & Tech Stack

- **Frontend+Backend:** TanStack Start (SSR + server functions / API routes), TypeScript strict.
- **Styling:** Tailwind CSS.
- **ORM:** Prisma ORM → MySQL (`db_dapur_ina_aina`).
- **Auth:** session cookie (prisma session atau library). Password hash bcryptjs/argon2.
- **Validasi:** zod di client + server.
- **Struktur modul yang disarankan:**
  - `app/routes/(public)/menu` — katalog
  - `app/routes/(public)/pesanan/$id` — detail & billing pelanggan
  - `app/routes/kasir/` — POS, pembayaran, billing, stok (read), transaksi
  - `app/routes/admin/` — produk, kategori, stok, user, laporan, transaksi
  - `prisma/schema.prisma` — mirror 8 tabel di bawah
  - `server/` — services: `orderService` (transaksional), `paymentService`, `stockService`, `reportService`

## 8. Rancangan Database

Sumber: Class Diagram Tugas 1 → 8 tabel. Relasi via FK.

- `tb_user` (User): id_user PK, nama, username UNIQUE, password(hash), role ENUM(admin,kasir)
- `tb_kategori` (Kategori): id_kategori PK, nama_kategori
- `tb_produk` (Produk → Kategori): id_produk PK, nama_produk, harga DECIMAL(10,2), stok INT default 0, id_kategori FK → tb_kategori
- `tb_pesanan` (Pesanan → User): id_pesanan PK, id_user FK (kasir), tanggal DATE, total DECIMAL(10,2) default 0, status ENUM(diproses,selesai,dibatalkan) default diproses
- `tb_detail_pesanan` (DetailPesanan → Pesanan, Produk): id_detail PK, id_pesanan FK, id_produk FK, jumlah, harga (snapshot), subtotal (=jumlah×harga)
- `tb_pembayaran` (Pembayaran → Pesanan, 1:1): id_pembayaran PK, id_pesanan FK UNIQUE, metode ENUM(tunai,non_tunai), jumlah_bayar, tanggal, status ENUM(lunas,belum_lunas) default belum_lunas
- `tb_stok` (Stok → Produk): id_stok PK, id_produk FK, jumlah, jenis ENUM(masuk,keluar), tanggal
- `tb_laporan_penjualan` (dari agregasi pesanan): id_laporan PK, periode VARCHAR(20) (`YYYY-Www` / `YYYY-MM`), total_penjualan DECIMAL(12,2)

**Aturan integritas:**
- Hapus kategori/produk yang dipakai → tolak (RESTRICT). Hapus pesanan → cascade ke detail & pembayaran (atau larangan hapus bila sudah lunas — pilih: larang hapus pesanan `selesai`; hanya `dibatalkan` yang boleh diarsipkan).
- `tb_pembayaran.id_pesanan` UNIQUE (satu pembayaran per pesanan v1).
- Semua operasi order/bayar/stok dalam satu transaksi (`prisma.$transaction`, `SELECT ... FOR UPDATE` / cek stok atomik bila perlu).

### DDL (MySQL, sesuai Tugas 2)

```sql
CREATE DATABASE IF NOT EXISTS db_dapur_ina_aina;
USE db_dapur_ina_aina;

CREATE TABLE tb_user (
  id_user INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','kasir') NOT NULL
);

CREATE TABLE tb_kategori (
  id_kategori INT AUTO_INCREMENT PRIMARY KEY,
  nama_kategori VARCHAR(50) NOT NULL
);

CREATE TABLE tb_produk (
  id_produk INT AUTO_INCREMENT PRIMARY KEY,
  nama_produk VARCHAR(100) NOT NULL,
  harga DECIMAL(10,2) NOT NULL,
  stok INT NOT NULL DEFAULT 0,
  id_kategori INT NOT NULL,
  FOREIGN KEY (id_kategori) REFERENCES tb_kategori(id_kategori)
);

CREATE TABLE tb_pesanan (
  id_pesanan INT AUTO_INCREMENT PRIMARY KEY,
  id_user INT NOT NULL,
  tanggal DATE NOT NULL,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  status ENUM('diproses','selesai','dibatalkan') NOT NULL DEFAULT 'diproses',
  FOREIGN KEY (id_user) REFERENCES tb_user(id_user)
);

CREATE TABLE tb_detail_pesanan (
  id_detail INT AUTO_INCREMENT PRIMARY KEY,
  id_pesanan INT NOT NULL,
  id_produk INT NOT NULL,
  jumlah INT NOT NULL,
  harga DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (id_pesanan) REFERENCES tb_pesanan(id_pesanan),
  FOREIGN KEY (id_produk) REFERENCES tb_produk(id_produk)
);

CREATE TABLE tb_pembayaran (
  id_pembayaran INT AUTO_INCREMENT PRIMARY KEY,
  id_pesanan INT NOT NULL,
  metode ENUM('tunai','non_tunai') NOT NULL,
  jumlah_bayar DECIMAL(10,2) NOT NULL,
  tanggal DATE NOT NULL,
  status ENUM('lunas','belum_lunas') NOT NULL DEFAULT 'belum_lunas',
  FOREIGN KEY (id_pesanan) REFERENCES tb_pesanan(id_pesanan)
);

CREATE TABLE tb_stok (
  id_stok INT AUTO_INCREMENT PRIMARY KEY,
  id_produk INT NOT NULL,
  jumlah INT NOT NULL,
  jenis ENUM('masuk','keluar') NOT NULL,
  tanggal DATE NOT NULL,
  FOREIGN KEY (id_produk) REFERENCES tb_produk(id_produk)
);

CREATE TABLE tb_laporan_penjualan (
  id_laporan INT AUTO_INCREMENT PRIMARY KEY,
  periode VARCHAR(20) NOT NULL,
  total_penjualan DECIMAL(12,2) NOT NULL DEFAULT 0
);
```

> Catatan: file `db_dapur_ina_aina.sql` di repo memakai nama tanpa prefix `tb_` — samakan ke konvensi `tb_` di atas saat implementasi Prisma, atau migrasi salah satunya. Rekomendasi: pakai `tb_` sesuai PRD ini + `@@map` di Prisma bila perlu.

## 9. Alur Proses Bisnis

1. **Lihat menu:** Pelanggan buka katalog → filter kategori.
2. **Buat pesanan:** Pilih item + qty → sistem cek stok → simpan pesanan `diproses` + detail + kurangi stok + catat stok keluar (satu transaksi).
3. **Bayar:** Kasir buka pesanan → total otomatis → input metode + jumlah → validasi lunas/belum_lunas → simpan pembayaran.
4. **Selesai:** Jika lunas → status `selesai` → billing tampil/cetak.
5. **Batal:** Jika dibatalkan → kembalikan stok + catat stok masuk koreksi; pembayaran (jika ada & belum lunas) ditandai batal/void.
6. **Restock (admin):** Input jumlah masuk → stok bertambah + riwayat.
7. **Laporan (admin):** Pilih minggu/bulan → agregasi pesanan selesai+lunas → simpan/tampilkan → cetak/CSV.

## 10. Spesifikasi Halaman / Modul

| Modul | Pengguna | Elemen & Aksi |
|---|---|---|
| Login | kasir, admin | username, password, error generik, redirect role |
| Menu (publik) | pelanggan | grid per kategori, search, badge Habis, qty stepper, buat pesanan |
| Detail Pesanan + Billing | pelanggan, kasir | tabel item, total, status bayar, tombol bayar (kasir), cetak |
| POS Kasir | kasir | cari produk, keranjang, hitung total live, bayar tunai/non-tunai + kembalian, selesaikan, cetak billing |
| Transaksi | kasir, admin | tabel pesanan (tanggal, kasir, total, status), filter, detail |
| Produk | admin | CRUD + filter kategori, validasi harga/stok |
| Kategori | admin | CRUD sederhana |
| Stok | admin (kasir read) | restock form, riwayat, alert stok ≤ threshold |
| Pembayaran | kasir | form metode + nominal, validasi, cegah double-pay (UNIQUE) |
| Laporan | admin | pilih periode mingguan/bulanan, generate, tabel + total, drill-down, cetak/CSV |
| User | admin | CRUD kasir/admin |

## 11. Aturan Bisnis (ringkas, mengikat)

- BR-1: Harga transaksi = snapshot saat order; perubahan master tidak retroaktif.
- BR-2: Stok tidak boleh negatif; cek + decrement atomik.
- BR-3: Satu pesanan = satu pembayaran (v1).
- BR-4: `selesai` mensyaratkan `lunas`.
- BR-5: Kembalian hanya untuk tunai lunas.
- BR-6: Laporan hanya menghitung pesanan `selesai` + `lunas`.
- BR-7: Semua nominal dengan DECIMAL; pembulatan di DB/app konsisten (2 desimal).

## 12. Pengujian (fase Testing Waterfall)

- Unit: subtotal/total/kembalian, validasi stok, agregasi laporan.
- Integrasi: order atomik (stok + detail + total), bayar → status, batal → restock, cegah double payment.
- UAT per peran: pelanggan (menu→order→billing), kasir (POS→bayar→cetak), admin (produk→stok→laporan).
- Keamanan: login salah, akses route tanpa role, SQL injection (via ORM), XSS (escape).
- Print test: A4 + thermal.

## 13. Risiko & Asumsi

- Risiko: race condition stok saat order bersamaan → mitigasi transaksi atomik.
- Risiko: nama tabel `tb_*` vs non-`tb_` di SQL lama → mitigasi satu konvensi + migrasi.
- Asumsi: 1 kasir pengelola per pesanan; kas daring tunggal; backup harian.

## 14. Milestone Waterfall

1. Requirement (PRD ini + Use Case + Class Diagram) — selesai.
2. Design (ERD, sketsa UI POS/menu/billing, Prisma schema) → review.
3. Implementation (auth → kategori/produk → order → payment/billing → stok → laporan → user).
4. Testing (unit/integrasi/UAT/print).
5. Maintenance (bugfix, backup, panduan kasir/admin).

---

## Lampiran: Seed awal

- Kategori: Makanan Utama, Appetizer, Minuman.
- User awal: 1 admin (buat manual via seed, password di-hash; segera ganti setelah deploy).
