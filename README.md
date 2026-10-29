# SPJL – Prototipe Sistem Pemesanan Jasa Laundry

Prototipe web untuk laporan proyek RPL Kelompok 2. Dibuat dengan HTML, CSS, dan JavaScript biasa, tanpa framework dan tanpa instalasi.

## Cara menjalankan di VS Code
1. Buka folder ini lewat **File > Open Folder**.
2. Klik kanan `index.html`, lalu pilih **Open with Live Server** (pasang ekstensi *Live Server* jika belum ada).
3. Atau cukup klik dua kali `index.html` untuk membukanya di browser.

## Akun untuk mencoba
| Peran | Username | Password |
|---|---|---|
| Pelanggan | pelanggan | 123 |
| Admin/Pemilik Laundry | admin | 123 |
| Kurir | kurir | 123 |

Pelanggan baru juga bisa mendaftar lewat tab **Daftar**.

## Struktur folder
- `index.html`: kerangka halaman
- `css/style.css`: tampilan (mendukung mode terang dan gelap)
- `js/app.js`: data contoh, logika, dan tampilan tiap peran

## Use case yang sudah ada
UC-01 Registrasi, UC-02 Login, UC-03 Logout, UC-04 Lihat layanan, UC-05 Buat pesanan, UC-06 Lihat total harga, UC-07 Lacak pesanan, UC-08 Perbarui status pesanan, UC-09 Kelola layanan, UC-11 Lihat tugas antar jemput.

Belum ada: UC-10 Kelola data pelanggan, UC-12 Kelola pembayaran dan riwayat transaksi, UC-13 Lihat laporan keuangan.

## Catatan
- Data hanya tersimpan di memori halaman, jadi hilang saat dimuat ulang. Basis data akan dibuat pada sprint berikutnya.
- Nama dan harga layanan di `js/app.js` (variabel `db.svc`) hanya contoh. Ganti dengan data klien.
